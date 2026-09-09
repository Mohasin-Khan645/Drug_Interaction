'use strict';

const OCRProvider = require('./ocrProvider');
const ApiError = require('../../utils/apiError');
const { ERROR_CODES } = require('../../constants');
const logger = require('../../config/logger');

class TesseractOCRProvider extends OCRProvider {
  constructor({ language = 'eng' } = {}) {
    super();
    this.language = language;
    this.name = 'tesseract';
  }

  async extractText(buffer, meta = {}) {
    if (meta.mimeType === 'application/pdf') {
      throw ApiError.external(ERROR_CODES.OCR_ERROR, 'PDF OCR requires a provider with PDF support');
    }
    try {
      // Required lazily so environments without the native assets can still boot.
       
      const { recognize } = require('tesseract.js');
      const result = await recognize(buffer, this.language);
      return {
        text: result.data.text || '',
        confidence: typeof result.data.confidence === 'number' ? result.data.confidence / 100 : null,
      };
    } catch (err) {
      logger.error({ err }, 'Tesseract OCR failed');
      throw ApiError.external(ERROR_CODES.OCR_ERROR, 'OCR processing failed');
    }
  }
}

module.exports = TesseractOCRProvider;
