'use strict';

const express = require('express');

const router = express.Router();

router.use('/health', require('./healthRoutes'));
router.use('/auth', require('./authRoutes'));
router.use('/patients', require('./patientRoutes'));
router.use('/medications', require('./medicationRoutes'));
router.use('/drugs', require('./drugRoutes'));
router.use('/prescriptions', require('./prescriptionRoutes'));
router.use('/safety', require('./safetyRoutes'));
router.use('/reports', require('./reportRoutes'));
router.use('/notifications', require('./notificationRoutes'));
router.use('/evidence', require('./evidenceRoutes'));
router.use('/ai', require('./aiRoutes'));
router.use('/admin', require('./adminRoutes'));

module.exports = router;
