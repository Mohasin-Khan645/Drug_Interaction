'use strict';

const { getOCRProvider } = require('../integrations/ocr');
const normalizationService = require('./normalizationService');

/**
 * Runs the configured OCR provider and normalizes each extracted line into drug
 * candidates. The result is always unconfirmed input.
 */
const process = async (buffer, { mimeType, providerName } = {}) => {
  const provider = getOCRProvider(providerName);
  const { text, confidence } = await provider.extractText(buffer, { mimeType });
  const rawCandidates = await provider.extractMedicationCandidates(text);

  const candidates = [];
  for (const candidate of rawCandidates) {
    const normalized = await normalizationService.normalize(candidate.rawText);
    if (normalized.candidates.length === 0 && !normalized.normalizedName) continue;
    candidates.push({
      rawText: candidate.rawText,
      strength: normalized.strength,
      requiresReview: normalized.requiresReview,
      matches: normalized.candidates,
    });
  }

  return {
    provider: provider.name || 'unknown',
    text,
    confidence,
    candidates,
  };
};

module.exports = { process };
