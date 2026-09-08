'use strict';

const drugRepository = require('../repositories/drugRepository');
const { cleanText, normalizeCase, stripDosage, extractDosage, similarity } = require('../utils/text');
const { CONFIDENCE } = require('../constants');

const MATCH_TYPE = Object.freeze({
  IDENTIFIER: 'IDENTIFIER',
  GENERIC: 'GENERIC',
  BRAND: 'BRAND',
  ALIAS: 'ALIAS',
  INGREDIENT: 'INGREDIENT',
  FUZZY: 'FUZZY',
});

// Exact identifier matches are the only ones that can reach full confidence.
const BASE_CONFIDENCE = Object.freeze({
  [MATCH_TYPE.IDENTIFIER]: 0.99,
  [MATCH_TYPE.GENERIC]: 0.95,
  [MATCH_TYPE.BRAND]: 0.92,
  [MATCH_TYPE.ALIAS]: 0.88,
  [MATCH_TYPE.INGREDIENT]: 0.7,
  [MATCH_TYPE.FUZZY]: 0.6,
});

const tokenize = (text) =>
  stripDosage(text)
    .split(/[^a-z0-9]+/i)
    .filter((token) => token.length >= 3);

const scoreCandidate = (drug, normalizedName) => {
  const generic = normalizeCase(drug.genericName);
  const brand = drug.brandName ? normalizeCase(drug.brandName) : null;

  if (generic === normalizedName) {
    return { matchType: MATCH_TYPE.GENERIC, confidence: BASE_CONFIDENCE.GENERIC, matchedOn: drug.genericName };
  }
  if (brand && brand === normalizedName) {
    return { matchType: MATCH_TYPE.BRAND, confidence: BASE_CONFIDENCE.BRAND, matchedOn: drug.brandName };
  }

  const alias = (drug.aliases || []).find((entry) => normalizeCase(entry.alias) === normalizedName);
  if (alias) {
    return { matchType: MATCH_TYPE.ALIAS, confidence: BASE_CONFIDENCE.ALIAS, matchedOn: alias.alias };
  }

  const ingredient = (drug.ingredients || []).find(
    (entry) => normalizeCase(entry.ingredient.name) === normalizedName
  );
  if (ingredient) {
    return {
      matchType: MATCH_TYPE.INGREDIENT,
      confidence: BASE_CONFIDENCE.INGREDIENT,
      matchedOn: ingredient.ingredient.name,
    };
  }

  const names = [generic, brand, ...(drug.aliases || []).map((entry) => normalizeCase(entry.alias))].filter(
    Boolean
  );
  const best = names.reduce(
    (acc, name) => {
      const score = similarity(name, normalizedName);
      return score > acc.score ? { score, name } : acc;
    },
    { score: 0, name: null }
  );

  if (best.score >= 0.75) {
    return {
      matchType: MATCH_TYPE.FUZZY,
      // Fuzzy matches are scaled by the string distance so they stay below the
      // auto-confirm threshold unless they are near-identical.
      confidence: Number((BASE_CONFIDENCE.FUZZY * best.score).toFixed(3)),
      matchedOn: best.name,
    };
  }
  return null;
};

/**
 * Turns free text (OCR output, user typed medication) into ranked drug candidates.
 * Nothing here confirms a medication; the caller decides what to do with the scores.
 */
const normalize = async (rawText, { limit = 5 } = {}) => {
  const cleaned = cleanText(rawText);
  const normalizedName = stripDosage(cleaned);
  const dosage = extractDosage(cleaned);

  if (!normalizedName) {
    return { input: rawText, cleanedText: cleaned, ...dosage, candidates: [], requiresReview: true };
  }

  const identifierMatch = /\b(\d{4,8})\b/.exec(cleaned);
  const candidates = [];

  if (identifierMatch) {
    const drug = await drugRepository.findByIdentifier(identifierMatch[1]);
    if (drug) {
      candidates.push({
        candidateDrugId: drug.id,
        displayName: drug.brandName ? `${drug.genericName} (${drug.brandName})` : drug.genericName,
        confidence: BASE_CONFIDENCE.IDENTIFIER,
        matchType: MATCH_TYPE.IDENTIFIER,
        matchedOn: identifierMatch[1],
      });
    }
  }

  const tokens = tokenize(cleaned);
  if (tokens.length > 0) {
    const drugs = await drugRepository.searchCandidates(tokens);
    for (const drug of drugs) {
      if (candidates.some((candidate) => candidate.candidateDrugId === drug.id)) continue;
      const scored = scoreCandidate(drug, normalizedName);
      if (!scored) continue;
      candidates.push({
        candidateDrugId: drug.id,
        displayName: drug.brandName ? `${drug.genericName} (${drug.brandName})` : drug.genericName,
        ...scored,
      });
    }
  }

  const ranked = candidates
    .filter((candidate) => candidate.confidence >= CONFIDENCE.CANDIDATE_MIN)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit);

  const top = ranked[0];
  // A single high-confidence candidate may be auto-confirmed; anything else is
  // handed to a human.
  const requiresReview =
    !top ||
    top.confidence < CONFIDENCE.AUTO_CONFIRM_MIN ||
    (ranked[1] && ranked[1].confidence >= CONFIDENCE.AUTO_CONFIRM_MIN);

  return {
    input: rawText,
    cleanedText: cleaned,
    normalizedName,
    ...dosage,
    candidates: ranked,
    requiresReview: Boolean(requiresReview),
  };
};

const normalizeMany = (rawTexts, options) =>
  Promise.all(rawTexts.map((rawText) => normalize(rawText, options)));

module.exports = { normalize, normalizeMany, MATCH_TYPE, BASE_CONFIDENCE, tokenize };
