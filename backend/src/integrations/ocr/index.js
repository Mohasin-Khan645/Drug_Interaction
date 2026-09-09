'use strict';

const config = require('../../config');
const OCRProvider = require('./ocrProvider');
const TesseractOCRProvider = require('./tesseractOcrProvider');

const registry = new Map([['tesseract', () => new TesseractOCRProvider()]]);

/** External providers register here so they can be swapped via OCR_PROVIDER. */
const registerOCRProvider = (name, factory) => registry.set(name, factory);

const getOCRProvider = (name = config.ocr.provider) => {
  const factory = registry.get(name);
  if (!factory) {
    throw new Error(`Unknown OCR provider: ${name}`);
  }
  return factory();
};

module.exports = { OCRProvider, TesseractOCRProvider, getOCRProvider, registerOCRProvider };
