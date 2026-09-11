import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Search,
  ArrowRight,
  UserPlus,
  HeartPulse,
  ShieldAlert,
} from 'lucide-react';
import { patientApi } from '../../api/patientApi';
import { useNotifications } from '../../context/NotificationContext';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

export default function PatientListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useNotifications();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);

  const [newPatient, setNewPatient] = useState({
    name: '',
    mrn: '',
    age: '',
    gender: 'Female',
    dob: '',
    bloodGroup: 'O+',
    primaryPhysician: 'Dr. Eleanor Vance, MD',
    egfr: 90,
    allergies: '',
    conditions: '',
  });

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const res = await patientApi.getPatients();
      return res.data || [];
    },
  });

  const createPatientMutation = useMutation({
    mutationFn: async (patientData) => {
      const parsedAllergies = patientData.allergies
        ? patientData.allergies.split(',').map((a, i) => ({
            id: `alg-${Date.now()}-${i}`,
            allergen: a.trim(),
            reaction: 'Documented sensitivity',
            severity: 'MODERATE',
          }))
        : [];

      const parsedConditions = patientData.conditions
        ? patientData.conditions.split(',').map((c, i) => ({
            id: `cond-${Date.now()}-${i}`,
            name: c.trim(),
            status: 'Active',
            diagnosedDate: new Date().toISOString().split('T')[0],
          }))
        : [];

      const payload = {
        ...patientData,
        age: Number(patientData.age) || 45,
        allergies: parsedAllergies,
        conditions: parsedConditions,
        renalFunction: {
          egfr: Number(patientData.egfr) || 90,
          stage: Number(patientData.egfr) < 60 ? 'CKD Stage 3' : 'Normal Renal Function',
          serumCreatinine: 0.9,
          lastMeasured: new Date().toISOString().split('T')[0],
        },
      };

      return patientApi.createPatient(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      addToast({
        title: 'Patient Roster Updated',
        message: `${newPatient.name || 'New Patient'} was successfully enrolled in clinical surveillance.`,
        type: 'success',
      });
      setIsAddPatientOpen(false);
      setNewPatient({
        name: '',
        mrn: '',
        age: '',
        gender: 'Female',
        dob: '',
        bloodGroup: 'O+',
        primaryPhysician: 'Dr. Eleanor Vance, MD',
        egfr: 90,
        allergies: '',
        conditions: '',
      });
    },
    onError: () => {
      addToast({
        title: 'Enrollment Error',
        message: 'Could not register patient record. Please verify fields and try again.',
        type: 'danger',
      });
    },
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newPatient.name.trim()) {
      addToast({
        title: 'Validation Notice',
        message: 'Patient full legal name is required.',
        type: 'warning',
      });
      return;
    }
    createPatientMutation.mutate(newPatient);
  };

  const filteredPatients = patients.filter((p) => {
    if (filterType === 'RENAL') {
      const egfr = p.renalFunction?.egfr ?? 90;
      if (egfr >= 60) return false;
    } else if (filterType === 'ALLERGIES') {
      if (!p.allergies || p.allergies.length === 0) return false;
    }

    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.mrn && p.mrn.toLowerCase().includes(q));
  });

  const renalImpairedCount = patients.filter((p) => (p.renalFunction?.egfr ?? 90) < 60).length;
  const allergyCount = patients.filter((p) => p.allergies && p.allergies.length > 0).length;

  const columns = [
    {
      header: 'Patient Name & MRN',
      accessor: 'name',
      render: (p) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 font-bold text-xs flex items-center justify-center">
            {p.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <span className="font-bold text-slate-900 text-xs block">{p.name}</span>
            <span className="font-mono text-3xs text-slate-400">{p.mrn}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Demographics',
      accessor: 'age',
      render: (p) => (
        <span className="text-xs text-slate-700">
          {p.age} yrs • {p.gender} • <span className="font-semibold">{p.bloodGroup || 'O+'}</span>
        </span>
      ),
    },
    {
      header: 'Renal Function',
      accessor: 'renalFunction',
      render: (p) => {
        const egfr = p.renalFunction?.egfr ?? 90;
        const isImpaired = egfr < 60;
        return (
          <div className="text-xs">
            <span
              className={`font-semibold block ${
                isImpaired ? 'text-amber-700' : 'text-slate-800'
              }`}
            >
              eGFR: {egfr} mL/min
            </span>
            <span className="text-3xs text-slate-500">
              {p.renalFunction?.stage || (isImpaired ? 'CKD Stage 3' : 'Normal')}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Documented Allergies',
      accessor: 'allergies',
      render: (p) => (
        <div className="flex flex-wrap gap-1">
          {p.allergies && p.allergies.length > 0 ? (
            p.allergies.map((a, idx) => (
              <span
                key={a.id || idx}
                className="px-2 py-0.5 rounded text-3xs font-bold uppercase bg-red-50 text-red-700 border border-red-200"
              >
                {a.allergen}
              </span>
            ))
          ) : (
            <span className="text-3xs text-slate-400 font-medium">No known drug allergies (NKDA)</span>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: (p) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(`/doctor/patients/${p.id}`)}
          className="text-xs"
        >
          Clinical Chart <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-2xs font-bold uppercase tracking-wider text-teal-700 block mb-1">
            Clinical Panel Management
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Assigned Patient Roster
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Patients under active medication therapy surveillance and clinical decision support.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddPatientOpen(true)}
          className="self-start sm:self-auto shadow-sm"
        >
          <UserPlus className="w-4 h-4 mr-1.5" />
          Enroll New Patient
        </Button>
      </div>

      {/* Roster Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-subtle flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <Users className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900">{patients.length}</div>
            <div className="text-3xs font-semibold text-slate-400 uppercase tracking-wider">Total Active Panel</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-subtle flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <HeartPulse className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900">{renalImpairedCount}</div>
            <div className="text-3xs font-semibold text-slate-400 uppercase tracking-wider">Renal Impaired (eGFR &lt; 60)</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-subtle flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-50 text-red-700 flex items-center justify-center font-bold">
            <ShieldAlert className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900">{allergyCount}</div>
            <div className="text-3xs font-semibold text-slate-400 uppercase tracking-wider">With Documented Allergies</div>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by patient name or MRN..."
            className="w-full text-xs rounded-lg border border-slate-300 py-2 pl-8 pr-3 text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:outline-none"
          />
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterType === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({patients.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('RENAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterType === 'RENAL'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Renal Impaired ({renalImpairedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('ALLERGIES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterType === 'ALLERGIES'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            With Allergies ({allergyCount})
          </button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSkeleton variant="card" count={3} />
      ) : (
        <Table columns={columns} data={filteredPatients} />
      )}

      {/* Enroll New Patient Modal */}
      {isAddPatientOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddPatientOpen(false)}
          title="Enroll Patient in Surveillance Roster"
          size="md"
          footer={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddPatientOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateSubmit}
                isLoading={createPatientMutation.isPending}
              >
                Enroll Patient Record
              </Button>
            </>
          }
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Full Legal Name"
                required
                value={newPatient.name}
                onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                placeholder="e.g. Johnathan Doe"
              />
              <Input
                label="Medical Record Number (MRN)"
                value={newPatient.mrn}
                onChange={(e) => setNewPatient({ ...newPatient, mrn: e.target.value })}
                placeholder="Leave blank to auto-generate"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Age (Years)"
                type="number"
                value={newPatient.age}
                onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                placeholder="45"
              />
              <Select
                label="Gender"
                value={newPatient.gender}
                onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                options={[
                  { value: 'Female', label: 'Female' },
                  { value: 'Male', label: 'Male' },
                  { value: 'Other', label: 'Other' },
                ]}
              />
              <Select
                label="Blood Group"
                value={newPatient.bloodGroup}
                onChange={(e) => setNewPatient({ ...newPatient, bloodGroup: e.target.value })}
                options={[
                  { value: 'O+', label: 'O+' },
                  { value: 'O-', label: 'O-' },
                  { value: 'A+', label: 'A+' },
                  { value: 'A-', label: 'A-' },
                  { value: 'B+', label: 'B+' },
                  { value: 'B-', label: 'B-' },
                  { value: 'AB+', label: 'AB+' },
                  { value: 'AB-', label: 'AB-' },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Attending Physician"
                value={newPatient.primaryPhysician}
                onChange={(e) => setNewPatient({ ...newPatient, primaryPhysician: e.target.value })}
                placeholder="Dr. Eleanor Vance, MD"
              />
              <Input
                label="Baseline eGFR (mL/min)"
                type="number"
                value={newPatient.egfr}
                onChange={(e) => setNewPatient({ ...newPatient, egfr: e.target.value })}
                placeholder="90"
              />
            </div>

            <div>
              <Input
                label="Known Drug Allergies (Comma separated)"
                value={newPatient.allergies}
                onChange={(e) => setNewPatient({ ...newPatient, allergies: e.target.value })}
                placeholder="e.g. Penicillin, Sulfa, Codeine"
              />
              <span className="text-3xs text-slate-400 block mt-1">
                Leave empty if patient has No Known Drug Allergies (NKDA).
              </span>
            </div>

            <div>
              <Input
                label="Chronic Clinical Conditions (Comma separated)"
                value={newPatient.conditions}
                onChange={(e) => setNewPatient({ ...newPatient, conditions: e.target.value })}
                placeholder="e.g. Type 2 Diabetes, Hypertension, Atrial Fibrillation"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
