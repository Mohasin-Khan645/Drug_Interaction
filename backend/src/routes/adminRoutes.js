'use strict';

const express = require('express');
const controller = require('../controllers/adminController');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const schemas = require('../validators/adminValidators');
const { ROLES } = require('../constants');

const router = express.Router();

router.use(authenticate(), authorize(ROLES.ADMIN));

router.get('/users', validate(schemas.listUsers), controller.listUsers);
router.post('/users', validate(schemas.createUser), controller.createUser);
router.patch('/users/:userId', validate(schemas.updateUser), controller.updateUser);
router.post('/users/:userId/suspend', validate(schemas.userParam), controller.deactivateUser);

router.post('/drugs', validate(schemas.createDrug), controller.createDrug);
router.patch('/drugs/:drugId', validate(schemas.updateDrug), controller.updateDrug);
router.post('/drugs/:drugId/deactivate', validate(schemas.drugParam), controller.deactivateDrug);
router.post('/drugs/:drugId/aliases', validate(schemas.aliasBody), controller.addAlias);
router.post('/drugs/:drugId/identifiers', validate(schemas.identifierBody), controller.addIdentifier);

router.get('/rules/:kind', validate(schemas.listRules), controller.listRules);
router.post('/rules/:kind', validate(schemas.createRule), controller.createRule);
// A rule update archives the current version and creates the next one.
router.patch('/rules/:kind/:ruleId', validate(schemas.updateRule), controller.updateRule);
router.post('/rules/:kind/:ruleId/deactivate', validate(schemas.ruleParam), controller.deactivateRule);

router.get('/evidence/sources', controller.listSources);
router.post('/evidence/sources', validate(schemas.createSource), controller.createSource);
router.patch('/evidence/sources/:sourceId', validate(schemas.updateSource), controller.updateSource);
router.get('/evidence/documents', validate(schemas.listDocuments), controller.listDocuments);
router.post('/evidence/documents', validate(schemas.createDocument), controller.createDocument);
router.patch('/evidence/documents/:documentId', validate(schemas.updateDocument), controller.updateDocument);

router.get('/audit', validate(schemas.listAudit), controller.listAudit);
router.get('/analytics', validate(schemas.analytics), controller.analytics);

module.exports = router;
