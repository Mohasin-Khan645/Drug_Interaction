'use strict';

const multer = require('multer');
const config = require('../config');
const ApiError = require('../utils/apiError');

const MAGIC_BYTES = [
  { mime: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  { mime: 'application/pdf', bytes: [0x25, 0x50, 0x44, 0x46] },
  { mime: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46] },
];

const detectMime = (buffer) => {
  const match = MAGIC_BYTES.find(({ bytes }) =>
    bytes.every((byte, index) => buffer[index] === byte)
  );
  return match ? match.mime : null;
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.uploads.maxFileSizeBytes, files: 1 },
  fileFilter: (req, file, cb) => {
    if (!config.uploads.allowedMimeTypes.includes(file.mimetype)) {
      return cb(ApiError.unsupportedMedia(`MIME type ${file.mimetype} is not allowed`));
    }
    return cb(null, true);
  },
});

// The declared MIME type and the filename are attacker controlled; the content is not.
const verifyFileContent = (req, res, next) => {
  if (!req.file) return next(ApiError.badRequest('A file upload is required'));
  const detected = detectMime(req.file.buffer);
  if (!detected || !config.uploads.allowedMimeTypes.includes(detected)) {
    return next(ApiError.unsupportedMedia('File content does not match an allowed file type'));
  }
  req.file.detectedMimeType = detected;
  return next();
};

module.exports = { upload, verifyFileContent, detectMime };
