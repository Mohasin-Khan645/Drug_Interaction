import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MediSafeAI from '../components/clinical/copilot/MediSafeAI';
import MediSafeAIPanel from '../components/clinical/copilot/MediSafeAIPanel';
import aiService from '../services/aiService';
import * as AuthModule from '../context/AuthContext';
import { UserRole } from '../constants/roles';

describe('Phase 9: MediSafe AI Role Context (Frontend)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(aiService, 'getEngineHealth').mockResolvedValue({
      safetyEngine: 'ONLINE',
      evidenceRetrieval: 'READY',
      knowledgeBase: 'CONNECTED',
      aiExplanation: 'READY',
      lastPing: '12:00:00',
    });
  });

  describe('MediSafeAIPanel Visual Role Themes & Authorized Scope Badges', () => {
    it('renders Patient theme with teal styling and patient disclaimer', () => {
      render(
        <MediSafeAIPanel
          isOpen={true}
          role={UserRole.PATIENT}
          messages={[{ id: '1', sender: 'bot', text: 'Patient context active' }]}
        />
      );

      expect(screen.getByText('Patient · Authorized')).toBeInTheDocument();
      expect(screen.getByText(/Always consult your doctor or pharmacist before changing any medication/i)).toBeInTheDocument();
      const header = screen.getByText('DrugSafe Assistant').closest('div.shrink-0');
      expect(header).toHaveClass('bg-teal-600');
    });

    it('renders Doctor theme with hospital blue styling and clinician disclaimer', () => {
      render(
        <MediSafeAIPanel
          isOpen={true}
          role={UserRole.DOCTOR}
          messages={[{ id: '1', sender: 'bot', text: 'Clinician context active' }]}
        />
      );

      expect(screen.getByText('Physician · Authorized')).toBeInTheDocument();
      expect(screen.getByText(/Physician authorization required/i)).toBeInTheDocument();
      const header = screen.getByText('DrugSafe Assistant').closest('div.shrink-0');
      expect(header).toHaveClass('bg-blue-600');
    });

    it('renders Pharmacist theme with dispensing emerald styling and pharmacy disclaimer', () => {
      render(
        <MediSafeAIPanel
          isOpen={true}
          role={UserRole.PHARMACIST}
          messages={[{ id: '1', sender: 'bot', text: 'Pharmacy context active' }]}
        />
      );

      expect(screen.getByText('Pharmacist · Authorized')).toBeInTheDocument();
      expect(screen.getByText(/Verify monograph & CrCl dosing prior to dispensing release/i)).toBeInTheDocument();
      const header = screen.getByText('DrugSafe Assistant').closest('div.shrink-0');
      expect(header).toHaveClass('bg-emerald-600');
    });

    it('renders Admin theme with security purple styling and governance disclaimer', () => {
      render(
        <MediSafeAIPanel
          isOpen={true}
          role={UserRole.ADMIN}
          messages={[{ id: '1', sender: 'bot', text: 'Admin context active' }]}
        />
      );

      expect(screen.getByText('Admin · Authorized')).toBeInTheDocument();
      expect(screen.getByText(/Real-time audit logging & 1,482 deterministic rules active/i)).toBeInTheDocument();
      const header = screen.getByText('DrugSafe Assistant').closest('div.shrink-0');
      expect(header).toHaveClass('bg-purple-700');
    });
  });

  describe('MediSafeAI Role-Calibrated Initial Greetings', () => {
    it('initializes with clinical decision support greeting for DOCTOR', async () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        role: UserRole.DOCTOR,
        currentUser: { name: 'Dr. Marcus Chen', role: UserRole.DOCTOR },
      });

      render(<MediSafeAI initialOpen={true} />);

      await waitFor(() => {
        expect(screen.getByText(/clinical decision support copilot for physicians/i)).toBeInTheDocument();
        expect(screen.getByText(/Pharmacodynamic & pharmacokinetic collision mechanisms/i)).toBeInTheDocument();
      });
    });

    it('initializes with dispensing verification greeting for PHARMACIST', async () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        role: UserRole.PHARMACIST,
        currentUser: { name: 'Elena Rostova', role: UserRole.PHARMACIST },
      });

      render(<MediSafeAI initialOpen={true} />);

      await waitFor(() => {
        expect(screen.getByText(/pharmacy dispensing and safety verification copilot/i)).toBeInTheDocument();
        expect(screen.getByText(/Rapid inbound prescription collision fast-checks/i)).toBeInTheDocument();
      });
    });

    it('initializes with platform governance supervisor greeting for ADMIN', async () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        role: UserRole.ADMIN,
        currentUser: { name: 'David Vance', role: UserRole.ADMIN },
      });

      render(<MediSafeAI initialOpen={true} />);

      await waitFor(() => {
        expect(screen.getByText(/platform governance and safety engine supervisor/i)).toBeInTheDocument();
        expect(screen.getByText(/1,482 active deterministic interaction rules compendium audit/i)).toBeInTheDocument();
      });
    });

    it('initializes with personal health companion greeting for PATIENT', async () => {
      vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
        role: UserRole.PATIENT,
        currentUser: { name: 'Sarah Jenkins', role: UserRole.PATIENT },
      });

      render(<MediSafeAI initialOpen={true} />);

      await waitFor(() => {
        expect(screen.getByText(/personal medication safety assistant/i)).toBeInTheDocument();
        expect(screen.getByText(/Check if your medications are safe to take together/i)).toBeInTheDocument();
      });
    });
  });

  describe('aiService Role-Tailored Query Intelligence', () => {
    it('includes clinician kinetic & prescribing directives when queried by DOCTOR', async () => {
      const res = await aiService.getAIResponse('Why was Warfarin flagged with Aspirin?', undefined, UserRole.DOCTOR);
      expect(res.text).toContain('Clinician Prescribing & Kinetic Directives');
      expect(res.text).toContain('Target INR calibration');
      expect(res.text).toContain('Proton Pump Inhibitor');
    });

    it('includes dispensing protocol and alternatives when queried by PHARMACIST', async () => {
      const res = await aiService.getAIResponse('Why was Warfarin flagged with Aspirin?', undefined, UserRole.PHARMACIST);
      expect(res.text).toContain('Pharmacist Dispensing Protocol');
      expect(res.text).toContain('Bleeding Risk Multiplier');
      expect(res.text).toContain('Acetaminophen');
    });

    it('includes rule identifier and HIPAA audit ledger when queried by ADMIN', async () => {
      const res = await aiService.getAIResponse('Why was Warfarin flagged with Aspirin?', undefined, UserRole.ADMIN);
      expect(res.text).toContain('Safety Engine & Audit Verification');
      expect(res.text).toContain('RULE-DDI-001');
      expect(res.text).toContain('HIPAA SHA-256 ledger');
    });
  });
});
