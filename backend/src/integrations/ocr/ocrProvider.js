/**
 * Pluggable OCR Provider Interface
 */
export class OCRProvider {
  /**
   * Extract raw text from image buffer or file path
   * @param {Buffer|string} fileInput
   * @returns {Promise<string>}
   */
  async extractText(fileInput) {
    throw new Error('extractText() must be implemented by OCR provider');
  }

  /**
   * Extract recognized medication candidate tokens with confidence
   * @param {string} rawText
   * @returns {Promise<Array<{detectedName: string, strength: string, form: string, route: string, frequency: string, confidenceScore: number}>>}
   */
  async extractMedicationCandidates(rawText) {
    throw new Error('extractMedicationCandidates() must be implemented by OCR provider');
  }
}

