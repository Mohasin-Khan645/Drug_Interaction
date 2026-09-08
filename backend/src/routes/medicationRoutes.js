'use strict';

const express = require('express');
const controller = require('../controllers/medicationController');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const schemas = require('../validators/medicationValidators');

const router = express.Router();

router.use(authenticate());

router.patch('/:medicationId', validate(schemas.update), controller.update);
// Stopping is a status change; medication history is never deleted.
router.post('/:medicationId/stop', validate(schemas.stop), controller.stop);

module.exports = router;
