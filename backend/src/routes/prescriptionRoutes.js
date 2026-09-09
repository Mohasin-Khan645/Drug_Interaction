'use strict';

const express = require('express');
const controller = require('../controllers/prescriptionController');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const schemas = require('../validators/prescriptionValidators');
const { upload, verifyFileContent } = require('../middleware/upload');

const router = express.Router();

router.use(authenticate());

router.post(
  '/',
  upload.single('image'),
  verifyFileContent,
  validate(schemas.create),
  controller.create
);
router.get('/:prescriptionId', validate(schemas.byId), controller.get);
router.post('/:prescriptionId/process', validate(schemas.byId), controller.process);
router.get('/:prescriptionId/items', validate(schemas.byId), controller.listItems);
router.post(
  '/:prescriptionId/reconciliation/preview',
  validate(schemas.byId),
  controller.reconcilePrescription
);
router.patch('/items/:itemId', validate(schemas.confirmItem), controller.confirmItem);

module.exports = router;
