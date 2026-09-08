'use strict';

const express = require('express');
const controller = require('../controllers/drugController');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const schemas = require('../validators/drugValidators');

const router = express.Router();

router.use(authenticate());

router.get('/', validate(schemas.list), controller.list);
router.get('/search', validate(schemas.search), controller.search);
router.get('/classes', controller.classes);
router.get('/ingredients', controller.ingredients);
router.post('/normalize', validate(schemas.normalize), controller.normalize);
router.get('/:drugId', validate(schemas.byId), controller.get);
router.get('/:drugId/interactions', validate(schemas.byId), controller.interactions);

module.exports = router;
