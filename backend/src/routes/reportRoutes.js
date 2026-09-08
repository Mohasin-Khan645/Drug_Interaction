'use strict';

const express = require('express');
const controller = require('../controllers/reportController');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const schemas = require('../validators/miscValidators');

const router = express.Router();

router.use(authenticate());

router.post('/', validate(schemas.createReport), controller.create);
router.get('/:reportId', validate(schemas.reportParam), controller.get);
router.get('/:reportId/pdf', validate(schemas.reportParam), controller.download);

module.exports = router;
