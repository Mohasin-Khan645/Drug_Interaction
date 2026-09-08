'use strict';

/**
 * Contract every OCR provider must implement.
 * Output is always treated as unverified input: it never becomes medical data
 * without explicit confirmation further up the pipeline.
 */
class OCRProvider {
  // eslint-disable-next-line no-unused-vars
  async extractText(buffer, meta) {
    throw new Error('extractText() must be implemented by an OCR provider');
  }

  /**
   * Splits raw text into medication-like lines. Providers may override with a
   * richer implementation; the default is layout based and drug-database free.
   */
   
  async extractMedicationCandidates(text) {
    const lines = String(text || '')
      .split(/\r?\n|;/)
      .map((line) => line.trim())
      .filter((line) => line.length >= 3);

    return lines
      .filter((line) => /[a-z]{3,}/i.test(line))
      .map((line) => ({ rawText: line, confidence: null }));
  }
}

module.exports = OCRProvider;
