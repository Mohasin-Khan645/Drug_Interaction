'use strict';

const express = require('express');
const controller = require('../controllers/evidenceController');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const schemas = require('../validators/adminValidators');

const router = express.Router();

router.use(authenticate());

router.get('/sources', controller.listSources);
router.get('/documents', validate(schemas.listDocuments), controller.listDocuments);
router.get('/documents/:documentId', validate(schemas.documentParam), controller.getDocument);

module.exports = router;
