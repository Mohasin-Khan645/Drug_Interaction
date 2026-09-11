import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MediSafeAI from '../components/clinical/copilot/MediSafeAI';
import aiService from '../services/aiService';
import * as AuthModule from '../context/AuthContext';

describe('Clinical AI Copilot (MediSafe AI) Subsystem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('aiService Logic & Safety Rules', () => {
    it('retrieves operational engine health telemetry', async () => {
      const health = await aiService.getEngineHealth();
      expect(health.safetyEngine).toBe('ONLINE');
      expect(health.evidenceRetrieval).toBe('READY');
      expect(health.knowledgeBase).toBe('CONNECTED');
      expect(health.aiExplanation).toBe('READY');
    });

    it('returns appropriate context for patient and admin roles', async () => {
      const patientCtx = await aiService.getPatientContext(undefined, 'PATIENT');
      expect(patientCtx.name).toBe('Sarah Jenkins');
      expect(patientCtx.activeMedicationsCount).toBe(4);
      expect(patientCtx.egfr).toBe(48);

      const sysCtx = aiService.getSystemContext();
      expect(sysCtx.activeRulesCount).toBe(26);
      expect(sysCtx.evidenceSourcesCount).toBe(5);
    });

    it('generates grounded clinical intelligence for interaction explanation', async () => {
      const res = await aiService.getAIResponse('Why was this flagged?', undefined, 'DOCTOR');
      expect(res.finding).toBeDefined();
      expect(res.evidenceLevel).toBe('Evidence-backed');
      expect(res.knowledgeGraph).toBeDefined();
      expect(res.text.length).toBeGreaterThan(20);
      expect(res.finding.medications.length).toBeGreaterThan(0);
    });

    it('executes the multi-stage safety analysis pipeline', async () => {
      const stepLog = [];
      const analysis = await aiService.runSafetyAnalysis(
        'pat-1',
        ['Warfarin 5mg', 'Aspirin 81mg'],
        'DOCTOR',
        (idx, label) => stepLog.push(label)
      );

      expect(stepLog.length).toBe(6);
      expect(analysis.isSafetyAnalysis).toBe(true);
      expect(analysis.finding).toBeDefined();
      expect(analysis.text).toContain('Automated Clinical Medication Safety Analysis Complete');
    });
  });

  describe('MediSafeAI Simple Chatbot UI & Project Intelligence', () => {
    it('renders collapsed launcher button with ONLINE status', () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        user: { name: 'Dr. Eleanor Vance', role: 'DOCTOR' },
      });

      render(<MediSafeAI />);

      expect(screen.getByText('MEDISAFE AI')).toBeInTheDocument();
      expect(screen.getByText('COPILOT')).toBeInTheDocument();
      expect(screen.getByText('ONLINE')).toBeInTheDocument();
    });

    it('opens clean assistant panel when launcher is clicked', async () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        user: { name: 'Dr. Eleanor Vance', role: 'DOCTOR' },
      });

      render(<MediSafeAI initialOpen={false} />);

      // Click launcher
      fireEvent.click(screen.getByRole('button', { name: /Open Clinical AI Copilot/i }));

      // Expanded simple panel displays
      await waitFor(() => {
        expect(screen.getByText('DrugSafe Assistant')).toBeInTheDocument();
        expect(screen.getByText('Online • Ready to help')).toBeInTheDocument();
        expect(screen.getByText(/Hello! I'm MediSafe AI/i)).toBeInTheDocument();
      });
    });

    it('renders project quick suggestion prompts', async () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        user: { name: 'Sarah Jenkins', role: 'PATIENT' },
      });

      render(<MediSafeAI initialOpen={true} />);

      await waitFor(() => {
        expect(screen.getByText('💊 Warfarin + Aspirin')).toBeInTheDocument();
        expect(screen.getByText('📋 My Medications')).toBeInTheDocument();
        expect(screen.getByText('⚠️ Explain Safety Alerts')).toBeInTheDocument();
        expect(screen.getByText('🍽️ Food Interactions')).toBeInTheDocument();
      });
    });

    it('submits query and displays clear project-related response', async () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        user: { name: 'Dr. Eleanor Vance', role: 'DOCTOR' },
      });

      render(<MediSafeAI initialOpen={true} />);

      // Find input
      const input = screen.getByPlaceholderText('Ask about medications, interactions, or safety...');
      fireEvent.change(input, { target: { value: 'Why was Warfarin flagged with Aspirin?' } });

      // Submit form
      fireEvent.submit(input.closest('form'));

      // User question should appear
      expect(screen.getByText('Why was Warfarin flagged with Aspirin?')).toBeInTheDocument();

      // Project safety response should appear
      await waitFor(() => {
        expect(screen.getByText(/Medication Safety Alert/i)).toBeInTheDocument();
        expect(screen.getAllByText(/In Simple Words/i).length).toBeGreaterThan(0);
        expect(screen.getByText(/Taking these two medications together can thin your blood/i)).toBeInTheDocument();
      }, { timeout: 3500 });
    });

    it('displays authorized role badge and quick prompts across all 4 roles', async () => {
      const rolesToTest = [
        { role: 'PATIENT', badge: 'Patient · Authorized', prompt: '💊 Warfarin + Aspirin' },
        { role: 'DOCTOR', badge: 'Physician · Authorized', prompt: '🔬 Warfarin + Aspirin Mechanism' },
        { role: 'PHARMACIST', badge: 'Pharmacist · Authorized', prompt: '💊 Drug Collision Fast-Check' },
        { role: 'ADMIN', badge: 'Admin · Authorized', prompt: '⚙️ Safety Engine Status' },
      ];

      for (const { role, badge, prompt } of rolesToTest) {
        vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
          user: { name: `Test ${role}`, role },
        });

        const { unmount } = render(<MediSafeAI initialOpen={true} />);

        await waitFor(() => {
          expect(screen.getByText(badge)).toBeInTheDocument();
          expect(screen.getByText(prompt)).toBeInTheDocument();
        });

        unmount();
      }
    });

    it('returns role-specific trusted responses for pharmacist and admin queries', async () => {
      // Pharmacist query
      const pharmRes = await aiService.getAIResponse('What are safe therapeutic alternatives for Clarithromycin in a statin patient?', undefined, 'PHARMACIST');
      expect(pharmRes.text).toContain('Therapeutic Alternatives Guide');
      expect(pharmRes.text).toContain('Azithromycin');

      // Admin query
      const adminRes = await aiService.getAIResponse('What is the operational status and uptime of the DrugSafe safety engine?', undefined, 'ADMIN');
      expect(adminRes.text).toContain('DrugSafe Safety Engine Telemetry');
      expect(adminRes.text).toContain('99.98%');
    });

    it('delivers instant and correct clinical answers across varied questions', async () => {
      // 1. Instant response time test
      const start = performance.now();
      const helloRes = await aiService.getAIResponse('hello', undefined, 'PATIENT');
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100); // Must be instantaneous
      expect(helloRes.text).toContain('Welcome to MediSafe AI');

      // 2. Project & OCR upload guidance
      const ocrRes = await aiService.getAIResponse('How to upload prescription?', undefined, 'DOCTOR');
      expect(ocrRes.text).toContain('Upload and Scan Prescriptions');
      expect(ocrRes.text).toContain('Automated OCR Extraction');

      // 3. Safe analgesic / Tylenol question
      const tylenolRes = await aiService.getAIResponse('Can I take Tylenol for headache?', undefined, 'PATIENT');
      expect(tylenolRes.text).toContain('Acetaminophen (Tylenol)');
      expect(tylenolRes.text).toContain('PREFERRED ANALGESIC');
      expect(tylenolRes.text).toContain('3,000 mg to 4,000 mg');

      // 4. Alcohol warning
      const alcoholRes = await aiService.getAIResponse('Can I drink alcohol with my medicines?', undefined, 'PATIENT');
      expect(alcoholRes.text).toContain('Alcohol Interactions');
      expect(alcoholRes.text).toContain('Warfarin + Alcohol');
      expect(alcoholRes.text).toContain('Metformin + Alcohol');

      // 5. Drug side effects
      const lisinoprilRes = await aiService.getAIResponse('What are the side effects of Lisinopril?', undefined, 'DOCTOR');
      expect(lisinoprilRes.text).toContain('Lisinopril (ACE Inhibitor)');
      expect(lisinoprilRes.text).toContain('Dry Hacking Cough');
      expect(lisinoprilRes.text).toContain('Hyperkalemia');

      // 6. Dynamic drug pair collision evaluator
      const pairRes = await aiService.getAIResponse('Can I take Metformin with Lisinopril?', undefined, 'DOCTOR');
      expect(pairRes.text).toContain('Clinical Interaction Evaluation:');
      expect(pairRes.text).toContain('METFORMIN');
      expect(pairRes.text).toContain('LISINOPRIL');
      expect(pairRes.text).toContain('eGFR 48 mL/min');
    });
  });
});

