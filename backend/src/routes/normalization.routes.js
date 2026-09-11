import { Router } from 'express';
import { normalizationController } from '../controllers/normalization.controller.js';

const router = Router();

router.post('/resolve', normalizationController.resolve);
router.get('/rxnorm', normalizationController.searchRxNorm);
router.get('/atc/:code', normalizationController.getAtcClassification);

export default router;

