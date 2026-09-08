'use strict';

const express = require('express');
const controller = require('../controllers/safetyController');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const schemas = require('../validators/safetyValidators');
const { ROLES } = require('../constants');

const router = express.Router();

router.use(authenticate());

router.post('/check', validate(schemas.runCheck), controller.runCheck);
router.get('/checks/:checkId', validate(schemas.checkParam), controller.getCheck);
router.get('/findings', validate(schemas.listFindings), controller.listFindings);
router.get('/findings/:findingId', validate(schemas.findingParam), controller.getFinding);
router.get('/findings/:findingId/reviews', validate(schemas.findingParam), controller.listReviews);
router.post(
  '/findings/:findingId/reviews',
  authorize(ROLES.DOCTOR, ROLES.PHARMACIST),
  validate(schemas.createReview),
  controller.createReview
);

module.exports = router;
