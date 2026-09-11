import { MedicationSafetyEngine } from '../services/safety/medicationSafetyEngine.js';
import { AIService } from '../services/ai/ai.service.js';
import { safetyRepository } from '../repositories/safety.repository.js';
import { patientService } from '../services/patient.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const safetyController = {
  async runSafetyCheck(req, res, next) {
    try {
      const { patientId, conditions = [], allergies = [], patientFactors = {}, saveRecord = true } = req.body;
      const drugs = req.body.drugs || req.body.medications || req.body.medicationNames || [];

      const targetPatientId = patientId || req.user?.patientId || null;
      if (req.user && targetPatientId) {
        await patientService.verifyPatientAccess(req.user, targetPatientId);
      }

      const results = await MedicationSafetyEngine.runSafetyCheck({
        patientId: targetPatientId,
        drugs,
        conditions,
        allergies,
        patientFactors,
        currentUser: req.user || null,
        saveRecord,
      });

      return successResponse(res, results);
    } catch (err) {
      next(err);
    }
  },

  async getPairwise(req, res, next) {
    try {
      const { drugA, drugB } = req.query;
      const results = await MedicationSafetyEngine.runSafetyCheck({
        drugs: [drugA, drugB],
        saveRecord: false,
      });

      const finding = results.findings[0] || null;
      return successResponse(res, {
        drugA,
        drugB,
        hasInteraction: Boolean(finding && finding.severity !== 'INFORMATIONAL'),
        finding,
        overallSafetyStatus: results.overallSafetyStatus,
      });
    } catch (err) {
      next(err);
    }
  },

  async getPatientSafetyHistory(req, res, next) {
    try {
      const { patientId } = req.params;
      if (req.user) {
        await patientService.verifyPatientAccess(req.user, patientId);
      }
      const history = await safetyRepository.findByPatientId(patientId);
      return successResponse(res, history);
    } catch (err) {
      next(err);
    }
  },

  async explainWithAI(req, res, next) {
    try {
      const { findingId, finding, question, role: bodyRole } = req.body;
      const role = (req.user?.role || bodyRole || 'DOCTOR').toUpperCase();
      const explanation = await AIService.explainFinding({ findingId, finding, question, role });
      return successResponse(res, explanation);
    } catch (err) {
      next(err);
    }
  },

  async streamExplainWithAI(req, res, next) {
    try {
      const params = req.method === 'GET' ? req.query : req.body;
      const { findingId, finding, question, role: reqRole } = params;
      const role = (req.user?.role || reqRole || 'DOCTOR').toUpperCase();

      let parsedFinding = finding;
      if (typeof finding === 'string') {
        try {
          parsedFinding = JSON.parse(finding);
        } catch {
          // ignore
        }
      }

      // Configure Server-Sent Events headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders?.();

      const sendEvent = (event, data) => {
        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      };

      sendEvent('init', {
        status: 'STREAMING',
        findingId: findingId || parsedFinding?.id,
        role,
        timestamp: new Date().toISOString(),
      });

      await AIService.streamExplanation({
        findingId,
        finding: parsedFinding,
        question,
        role,
        onChunk: async (chunkData) => {
          sendEvent('chunk', chunkData);
        },
        onEvidence: async (citations) => {
          sendEvent('evidence', { citations });
        },
        onDone: async (summary) => {
          sendEvent('done', summary);
        },
      });

      res.write('event: end\ndata: {}\n\n');
      res.end();
    } catch (err) {
      if (!res.headersSent) {
        next(err);
      } else {
        res.write(`event: error\ndata: ${JSON.stringify({ message: err.message, code: err.code || 'STREAM_ERROR' })}\n\n`);
        res.end();
      }
    }
  },
};

