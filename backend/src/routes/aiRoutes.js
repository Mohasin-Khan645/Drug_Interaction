'use strict';

const express = require('express');
const controller = require('../controllers/aiController');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const schemas = require('../validators/miscValidators');

const router = express.Router();

router.use(authenticate());

// Explanations only: the AI layer cannot create or override safety rules.
router.post('/explain', validate(schemas.aiExplain), controller.explain);

module.exports = router;
