'use strict';

const express = require('express');
const controller = require('../controllers/notificationController');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const schemas = require('../validators/miscValidators');

const router = express.Router();

router.use(authenticate());

router.get('/', validate(schemas.listNotifications), controller.list);
router.post('/read-all', controller.markAllRead);
router.post('/:notificationId/read', validate(schemas.notificationParam), controller.markRead);

module.exports = router;
