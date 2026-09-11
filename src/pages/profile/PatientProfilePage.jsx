import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  User,
  HeartPulse,
  AlertTriangle,
  Pill,
  Activity,
  Calendar,
  Phone,
  ShieldCheck,
  Plus,
  Edit3,
  Trash2,
  X,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { patientApi } from '../../api/patientApi';
import { medicationApi } from '../../api/medicationApi';
import { useNotifications } from '../../context/NotificationContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Tabs from '../../components/common/Tabs';
import Modal from '../../components/common/Modal';
import PatientFactorsSummary from '../../components/clinical/PatientFactorsSummary';
import { formatDate } from '../../utils/formatters';
import { MOCK_PATIENTS } from '../../api/mock/mockData';

export default function PatientProfilePage() {
  const { addToast } = useNotifications();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: patientRes } = useQuery({
    queryKey: ['patient-profile', 'pt-101'],
    queryFn: async () => {
      const res = await patientApi.getPatientById('pt-101');
      return res.data || MOCK_PATIENTS[0];
    },
  });

  const { data: medications = [] } = useQuery({
    queryKey: ['medications'],
    queryFn: async () => {
      const res = await medicationApi.getMedications();
      return res.data || [];
    },
  });

  // Local state for full editing
  const [patientData, setPatientData] = useState(() => patientRes || MOCK_PATIENTS[0]);
  const [isEditDemoOpen, setIsEditDemoOpen] = useState(false);
  const [isAddConditionOpen, setIsAddConditionOpen] = useState(false);
  const [isAddAllergyOpen, setIsAddAllergyOpen] = useState(false);

  // Form states
  const [demoForm, setDemoForm] = useState({
    name: patientData.name || 'Sarah Jenkins',
    phone: patientData.phone || '+1 (555) 342-8891',
    emergencyContact: patientData.emergencyContact || 'Mark Jenkins (Spouse) - +1 (555) 342-8892',
    bloodGroup: patientData.bloodGroup || 'A+',
    weightKg: patientData.weightKg || 64.5,
    heightCm: patientData.heightCm || 162,
    primaryDoctor: patientData.primaryDoctor || 'Dr. Marcus Chen, MD',
  });

  const [conditionForm, setConditionForm] = useState({
    conditionName: '',
    icd10Code: '',
    diagnosedDate: new Date().toISOString().split('T')[0],
    status: 'Active',
  });

  const [allergyForm, setAllergyForm] = useState({
    allergen: '',
    reaction: '',
    severity: 'Moderate',
  });

  // Handle Save Demographics
  const handleSaveDemographics = (e) => {
    e.preventDefault();
    setPatientData((prev) => ({
      ...prev,
      ...demoForm,
    }));
    setIsEditDemoOpen(false);
    addToast({
      title: 'Demographics Updated',
      message: 'Patient profile demographics and contact information have been saved.',
      type: 'success',
    });
  };

  // Handle Add Condition
  const handleAddCondition = (e) => {
    e.preventDefault();
    if (!conditionForm.conditionName.trim()) return;

    const newCond = {
      id: `cond-${Date.now()}`,
      conditionName: conditionForm.conditionName.trim(),
      icd10Code: conditionForm.icd10Code.trim() || 'R69',
      diagnosedDate: conditionForm.diagnosedDate,
      status: conditionForm.status,
    };

    setPatientData((prev) => ({
      ...prev,
      conditions: [...(prev.conditions || []), newCond],
    }));
    setConditionForm({
      conditionName: '',
      icd10Code: '',
      diagnosedDate: new Date().toISOString().split('T')[0],
      status: 'Active',
    });
    setIsAddConditionOpen(false);
    addToast({
      title: 'Diagnosis Added',
      message: `${newCond.conditionName} added to patient medical record.`,
      type: 'success',
    });
  };

  // Handle Delete Condition
  const handleDeleteCondition = (id) => {
    setPatientData((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((c) => c.id !== id),
    }));
    addToast({
      title: 'Condition Removed',
      message: 'Medical condition removed from surveillance list.',
      type: 'info',
    });
  };

  // Handle Add Allergy
  const handleAddAllergy = (e) => {
    e.preventDefault();
    if (!allergyForm.allergen.trim()) return;

    const newAllergy = {
      id: `all-${Date.now()}`,
      allergen: allergyForm.allergen.trim(),
      reaction: allergyForm.reaction.trim() || 'Urticaria / Rash',
      severity: allergyForm.severity,
      diagnosedDate: new Date().toISOString().split('T')[0],
    };

    setPatientData((prev) => ({
      ...prev,
      allergies: [...(prev.allergies || []), newAllergy],
    }));
    setAllergyForm({ allergen: '', reaction: '', severity: 'Moderate' });
    setIsAddAllergyOpen(false);
    addToast({
      title: 'Allergen Documented',
      message: `${newAllergy.allergen} added to cross-reactivity engine.`,
      type: 'success',
    });
  };

  // Handle Delete Allergy
  const handleDeleteAllergy = (id) => {
    setPatientData((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((a) => a.id !== id),
    }));
    addToast({
      title: 'Allergy Record Removed',
      message: 'Allergen removed from profile.',
      type: 'info',
    });
  };

  const tabs = [
    { id: 'overview', label: 'Clinical Factors & Labs', icon: HeartPulse },
    { id: 'conditions', label: 'Medical Conditions', icon: Activity, badge: patientData.conditions?.length || 4 },
    { id: 'allergies', label: 'Allergies & Hypersensitivities', icon: AlertTriangle, badge: patientData.allergies?.length || 2 },
    { id: 'medications', label: 'Medication History', icon: Pill },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Patient Demographic Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white font-bold text-lg flex items-center justify-center shadow-md">
            {patientData.name ? patientData.name.split(' ').map((n) => n[0]).join('') : 'SJ'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {patientData.name}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-3xs font-bold bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                Active Inpatient
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              MRN: <strong className="font-mono text-slate-700 dark:text-slate-200">{patientData.mrn || 'MRN-84920'}</strong> • Primary: {patientData.primaryDoctor}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-2xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" /> DOB: {patientData.dob || '1959-04-12'} ({patientData.age || 67} yrs)
              </span>
              <span>•</span>
              <span>Blood Group: <strong className="text-slate-700 dark:text-slate-200">{patientData.bloodGroup}</strong></span>
              <span>•</span>
              <span>Weight: <strong className="text-slate-700 dark:text-slate-200">{patientData.weightKg} kg</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" /> {patientData.phone}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={() => {
              setDemoForm({
                name: patientData.name || '',
                phone: patientData.phone || '',
                emergencyContact: patientData.emergencyContact || '',
                bloodGroup: patientData.bloodGroup || 'A+',
                weightKg: patientData.weightKg || 64.5,
                heightCm: patientData.heightCm || 162,
                primaryDoctor: patientData.primaryDoctor || 'Dr. Marcus Chen, MD',
              });
              setIsEditDemoOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-400 text-slate-700 dark:text-slate-200 shadow-sm transition-all"
          >
            <Edit3 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Edit Demographics</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Overview: Patient Safety Factors & Organ Labs */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <Card
            title="Organ Function & Patient Safety Factors"
            subtitle="Quantitative renal, hepatic, and metabolic indicators used in dosing safety engine"
          >
            <PatientFactorsSummary
              patient={patientData}
              factors={{
                egfr: `${patientData.renalFunction?.egfr || 48} mL/min`,
                hepatic: patientData.hepaticFunction?.status || 'Mild Impairment',
              }}
              concerns={[
                {
                  title: 'Metformin Renal Clearance Precaution (eGFR < 50 mL/min)',
                  description:
                    'Patient eGFR is 48 mL/min (CKD Stage 3a). Metformin requires close monitoring for lactic acidosis. Maximum daily recommended dose is 1,000 mg/day.',
                  evidence: 'FDA CDER Revised Metformin Drug Safety Labeling.',
                },
                {
                  title: 'Beers Criteria Geriatric Precaution (Age > 65)',
                  description:
                    'Patient is 67 years old. Concurrent NSAID use carries enhanced risk of peptic ulceration and acute renal hemodynamic compromise.',
                  evidence: 'American Geriatrics Society 2023 Updated Beers Criteria.',
                },
              ]}
            />
          </Card>

          {/* Authorized Laboratory Results */}
          <Card title="Authorized Clinical Laboratory Results" subtitle="Recent diagnostic serum values">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-2xs uppercase">Serum Creatinine</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">1.4 mg/dL</span>
                <span className="text-2xs text-amber-700 dark:text-amber-400 block">Slightly High</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-2xs uppercase">Serum Potassium</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">4.8 mEq/L</span>
                <span className="text-2xs text-emerald-700 dark:text-emerald-400 block">Normal (3.5 - 5.0)</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-2xs uppercase">INR (Prothrombin)</span>
                <span className="text-base font-bold text-teal-700 dark:text-teal-400">2.4</span>
                <span className="text-2xs text-emerald-700 dark:text-emerald-400 block">In Therapeutic Target (2.0 - 3.0)</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-2xs uppercase">HbA1c</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">6.9%</span>
                <span className="text-2xs text-slate-500 block">Controlled T2D</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Conditions Tab */}
      {activeTab === 'conditions' && (
        <Card
          title="Documented Medical Diagnoses"
          subtitle="Conditions monitored for drug-disease contraindications"
          action={
            <Button
              size="sm"
              variant="outline"
              icon={Plus}
              onClick={() => setIsAddConditionOpen(true)}
              className="text-xs"
            >
              Add Diagnosis
            </Button>
          }
        >
          <div className="space-y-3">
            {(patientData.conditions || []).map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900 dark:text-white text-sm">{c.conditionName}</strong>
                    <span className="font-mono text-2xs px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      ICD-10: {c.icd10Code}
                    </span>
                  </div>
                  <span className="text-2xs text-slate-500 mt-0.5 block">
                    Diagnosed: {formatDate(c.diagnosedDate)} • Status: {c.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="teal" size="sm">
                    {c.status}
                  </Badge>
                  <button
                    type="button"
                    onClick={() => handleDeleteCondition(c.id)}
                    className="p-1 rounded-md text-slate-400 hover:text-red-600 transition-colors"
                    title="Remove diagnosis"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Allergies Tab */}
      {activeTab === 'allergies' && (
        <Card
          title="Documented Allergies & Sensitivities"
          subtitle="Allergen records validated in cross-reactivity safety engine"
          action={
            <Button
              size="sm"
              variant="outline"
              icon={Plus}
              onClick={() => setIsAddAllergyOpen(true)}
              className="text-xs"
            >
              Add Allergen
            </Button>
          }
        >
          <div className="space-y-3">
            {(patientData.allergies || []).map((a) => (
              <div
                key={a.id}
                className="p-3.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/40 dark:bg-red-950/20 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-red-950 dark:text-red-200 text-sm">{a.allergen}</strong>
                    <Badge variant="red" size="sm">
                      {a.severity} Hypersensitivity
                    </Badge>
                  </div>
                  <p className="text-2xs text-red-900 dark:text-red-300 mt-1">
                    Observed Reaction: <strong>{a.reaction}</strong>
                  </p>
                  <span className="text-3xs text-slate-400">
                    Diagnosed: {formatDate(a.diagnosedDate)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteAllergy(a.id)}
                  className="p-1.5 rounded-md text-red-400 hover:text-red-600 hover:bg-red-100/50 transition-colors"
                  title="Remove allergen record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Medication History Tab */}
      {activeTab === 'medications' && (
        <Card title="Current & Historical Medication Regimens">
          <div className="space-y-3">
            {medications.map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">{m.medicationName || m.name}</span>
                  <span className="text-2xs text-slate-500">
                    {m.strength || m.dosage} • {m.frequency} • {m.source || 'Active Regimen'}
                  </span>
                </div>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-2xs">
                  Active since {formatDate(m.addedDate || m.startDate || '2026-01-01')}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 1: EDIT DEMOGRAPHICS                           */}
      {/* ---------------------------------------------------- */}
      {isEditDemoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Patient Demographics</h3>
                <p className="text-3xs text-slate-400">Update vital contact, physical parameters, and primary physician</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditDemoOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDemographics} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={demoForm.name}
                    onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={demoForm.phone}
                    onChange={(e) => setDemoForm({ ...demoForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Blood Group</label>
                  <select
                    value={demoForm.bloodGroup}
                    onChange={(e) => setDemoForm({ ...demoForm, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={demoForm.weightKg}
                    onChange={(e) => setDemoForm({ ...demoForm, weightKg: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={demoForm.heightCm}
                    onChange={(e) => setDemoForm({ ...demoForm, heightCm: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Primary Attending Physician</label>
                  <input
                    type="text"
                    value={demoForm.primaryDoctor}
                    onChange={(e) => setDemoForm({ ...demoForm, primaryDoctor: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Emergency Contact & Relation</label>
                  <input
                    type="text"
                    value={demoForm.emergencyContact}
                    onChange={(e) => setDemoForm({ ...demoForm, emergencyContact: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditDemoOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold"
                >
                  Save Demographics
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 2: ADD DIAGNOSIS                               */}
      {/* ---------------------------------------------------- */}
      {isAddConditionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Document Medical Diagnosis</h3>
                <p className="text-3xs text-slate-400">Validated against drug-disease contraindications</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddConditionOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCondition} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Diagnosis / Condition Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Heart Failure with Reduced Ejection Fraction"
                  value={conditionForm.conditionName}
                  onChange={(e) => setConditionForm({ ...conditionForm, conditionName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ICD-10 Code</label>
                  <input
                    type="text"
                    placeholder="e.g. I50.22"
                    value={conditionForm.icd10Code}
                    onChange={(e) => setConditionForm({ ...conditionForm, icd10Code: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={conditionForm.status}
                    onChange={(e) => setConditionForm({ ...conditionForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Chronic">Chronic</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Diagnosed Date</label>
                <input
                  type="date"
                  value={conditionForm.diagnosedDate}
                  onChange={(e) => setConditionForm({ ...conditionForm, diagnosedDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddConditionOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold"
                >
                  Add Diagnosis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 3: ADD ALLERGEN                                */}
      {/* ---------------------------------------------------- */}
      {isAddAllergyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Document Drug Allergen</h3>
                <p className="text-3xs text-slate-400">Screened for immunologic and class cross-reactivity</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddAllergyOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAllergy} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Allergen / Substance</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ciprofloxacin, Codeine, Latex"
                  value={allergyForm.allergen}
                  onChange={(e) => setAllergyForm({ ...allergyForm, allergen: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Observed Clinical Reaction</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Urticaria, Bronchospasm, Facial Edema"
                  value={allergyForm.reaction}
                  onChange={(e) => setAllergyForm({ ...allergyForm, reaction: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hypersensitivity Severity</label>
                <select
                  value={allergyForm.severity}
                  onChange={(e) => setAllergyForm({ ...allergyForm, severity: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="Severe">Severe (Anaphylaxis / Airway Compromise)</option>
                  <option value="Moderate">Moderate (Systemic Rash / Angioedema)</option>
                  <option value="Mild">Mild (Localized Erythema / Pruritus)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddAllergyOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold"
                >
                  Add Allergen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
