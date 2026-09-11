import { drugRepository } from '../repositories/drug.repository.js';

export const NormalizationService = {
  /**
   * 1. Clean text
   * 2. Normalize case
   * 3. Remove irrelevant OCR noise and punctuation
   */
  cleanText(rawText) {
    if (!rawText) return '';
    return rawText
      .replace(/^(Rx:?|Prescription:?|Take:?|Tab:?|Caps:?)/gi, '')
      .replace(/[^\w\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  },

  /**
   * Calculates Levenshtein similarity ratio between 0.0 and 1.0
   */
  similarityScore(str1, str2) {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    if (s1 === s2) return 1.0;
    if (!s1 || !s2) return 0.0;

    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    let costs = [];
    for (let i = 0; i <= shorter.length; i++) {
      costs[i] = i;
    }

    for (let i = 1; i <= longer.length; i++) {
      let nw = i - 1;
      costs[0] = i;
      for (let j = 1; j <= shorter.length; j++) {
        let cj = Math.min(
          1 + Math.min(costs[j], costs[j - 1]),
          s1[i - 1] === s2[j - 1] ? nw : nw + 1
        );
        nw = costs[j];
        costs[j] = cj;
      }
    }

    return (longer.length - costs[shorter.length]) / longer.length;
  },

  /**
   * Normalizes raw medication name into candidate standardized drug entities with confidence scores
   */
  async normalize(rawText) {
    const cleaned = this.cleanText(rawText);
    if (!cleaned) {
      return {
        normalized: false,
        candidates: [],
        bestMatch: null,
      };
    }

    // 1. Direct name or alias lookup
    const directMatch = await drugRepository.findByNameOrAlias(cleaned);
    if (directMatch) {
      const candidate = {
        candidateDrugId: directMatch.id,
        displayName: directMatch.brandName || directMatch.genericName,
        genericName: directMatch.genericName,
        activeIngredient: directMatch.activeIngredient,
        drugClass: directMatch.drugClass,
        rxNormCode: directMatch.rxNormCode,
        confidence: 0.98,
        matchType: 'EXACT_MATCH',
        status: 'VERIFIED_MATCH',
      };
      return {
        normalized: true,
        candidates: [candidate],
        bestMatch: candidate,
      };
    }

    // 2. Search database candidates using substring
    const firstWord = cleaned.split(' ')[0];
    const { drugs } = await drugRepository.search({ search: firstWord, limit: 10 });

    const scoredCandidates = [];
    for (const d of drugs) {
      const brandScore = this.similarityScore(cleaned, d.brandName);
      const genericScore = this.similarityScore(cleaned, d.genericName);
      const ingredientScore = this.similarityScore(cleaned, d.activeIngredient);

      const maxScore = Math.max(brandScore, genericScore, ingredientScore);

      if (maxScore >= 0.45) {
        let matchType = 'FUZZY_MATCH';
        if (maxScore > 0.9) matchType = 'HIGH_CONFIDENCE_ALIAS';
        else if (maxScore >= 0.75) matchType = 'PHONETIC_SIMILAR';

        scoredCandidates.push({
          candidateDrugId: d.id,
          displayName: d.brandName || d.genericName,
          genericName: d.genericName,
          activeIngredient: d.activeIngredient,
          drugClass: d.drugClass,
          rxNormCode: d.rxNormCode,
          confidence: parseFloat(maxScore.toFixed(2)),
          matchType,
          status: maxScore >= 0.8 ? 'VERIFIED_MATCH' : 'NEEDS_VERIFICATION',
        });
      }
    }

    // Sort descending by confidence score
    scoredCandidates.sort((a, b) => b.confidence - a.confidence);

    const bestMatch = scoredCandidates[0] || null;

    return {
      normalized: bestMatch ? bestMatch.confidence >= 0.8 : false,
      candidates: scoredCandidates,
      bestMatch,
    };
  },
};

