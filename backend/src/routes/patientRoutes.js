'use strict';

const express = require('express');
const controller = require('../controllers/patientController');
const medicationController = require('../controllers/medicationController');
const safetyController = require('../controllers/safetyController');
const reportController = require('../controllers/reportController');
const prescriptionController = require('../controllers/prescriptionController');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const schemas = require('../validators/patientValidators');
const medicationSchemas = require('../validators/medicationValidators');
const safetySchemas = require('../validators/safetyValidators');
const prescriptionSchemas = require('../validators/prescriptionValidators');
const miscSchemas = require('../validators/miscValidators');
const { ROLES } = require('../constants');

const router = express.Router();

router.use(authenticate());

router.get(
  '/',
  authorize(ROLES.DOCTOR, ROLES.PHARMACIST, ROLES.ADMIN),
  validate(schemas.list),
  controller.list
);
router.get('/:patientId', validate(schemas.patientIdParam), controller.get);
router.patch('/:patientId', validate(schemas.update), controller.update);

router.get('/:patientId/conditions', validate(schemas.patientIdParam), controller.listConditions);
router.post('/:patientId/conditions', validate(schemas.addCondition), controller.addCondition);

router.get('/:patientId/allergies', validate(schemas.patientIdParam), controller.listAllergies);
router.post('/:patientId/allergies', validate(schemas.addAllergy), controller.addAllergy);

router.get('/:patientId/lab-results', validate(schemas.patientIdParam), controller.listLabResults);
router.post('/:patientId/lab-results', validate(schemas.addLabResult), controller.addLabResult);

router.get('/:patientId/care-team', validate(schemas.patientIdParam), controller.listCareTeam);
router.post('/:patientId/care-team', validate(schemas.careTeamMember), controller.addCareTeamMember);
router.delete(
  '/:patientId/care-team/:clinicianId',
  validate(schemas.careTeamMemberParams),
  controller.removeCareTeamMember
);

router.get('/:patientId/medications', validate(medicationSchemas.list), medicationController.list);
router.post('/:patientId/medications', validate(medicationSchemas.create), medicationController.create);

router.get('/:patientId/safety-checks', validate(safetySchemas.listChecks), safetyController.listChecks);
router.get('/:patientId/reports', validate(miscSchemas.listReports), reportController.listForPatient);

router.post(
  '/:patientId/reconciliation/preview',
  validate(prescriptionSchemas.reconcilePreview),
  prescriptionController.reconcilePreview
);
router.post(
  '/:patientId/reconciliation/apply',
  validate(prescriptionSchemas.reconcileApply),
  prescriptionController.reconcileApply
);

module.exports = router;
