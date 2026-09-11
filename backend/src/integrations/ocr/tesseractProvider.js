import { OCRProvider } from './ocrProvider.js';
import { logger } from '../../config/logger.js';

export class TesseractOCRProvider extends OCRProvider {
  constructor(apiKey = null) {
    super();
    this.apiKey = apiKey;
  }

  async extractText(fileInput) {
    logger.info('TesseractOCRProvider executing text extraction');
    // Simulated or fallback OCR extraction from medical prescription documents
    return (
      'Rx: Amoxicillin 500mg capsules TID x 10 days\n' +
      'Rx: Atorvastatin 20mg tab once daily at bedtime\n' +
      'Rx: Lisinopril 10mg oral once daily'
    );
  }

  async extractMedicationCandidates(rawText) {
    logger.info('TesseractOCRProvider parsing raw OCR text for candidate medications');
    const lines = rawText.split('\n').filter((l) => l.trim().length > 0);
    const candidates = [];

    for (const line of lines) {
      const clean = line.replace(/^(Rx:?|Prescription:?)/i, '').trim();
      if (!clean) continue;

      // Extract basic clinical parameters using regex patterns
      const strengthMatch = clean.match(/(\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|units))/i);
      const formMatch = clean.match(/\b(tablet|tab|capsule|cap|solution|suspension|inhaler|injection|cream|patch)\b/i);
      const freqMatch = clean.match(/\b(once daily|bid|tid|qid|prn|at bedtime|qhs|every \d+ hours)\b/i);

      const detectedName = clean.split(/\d+/)[0]?.trim() || clean;
      const strength = strengthMatch ? strengthMatch[0] : null;
      const form = formMatch ? formMatch[0] : 'Tablet';
      const frequency = freqMatch ? freqMatch[0] : 'Once daily';

      // Confidence heuristic based on structure
      let confidenceScore = 0.85;
      if (strength && form) confidenceScore = 0.94;
      else if (!strength) confidenceScore = 0.58;

      candidates.push({
        detectedName: clean,
        genericCandidate: detectedName,
        strength: strength || 'Unspecified',
        form: form.charAt(0).toUpperCase() + form.slice(1),
        route: 'Oral',
        frequency,
        confidenceScore,
        status: confidenceScore >= 0.8 ? 'VERIFIED_MATCH' : 'NEEDS_VERIFICATION',
      });
    }

    return candidates;
  }
}

