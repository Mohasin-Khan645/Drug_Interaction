import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { ROLES } from '../lib/constants';

const STORAGE_KEY = 'drugsafe.activePatient';
const PatientScopeContext = createContext(null);

/**
 * Clinicians work across patients, so the active patient is kept in one place.
 * Only a non-sensitive identifier and display name are persisted.
 */
export function PatientScopeProvider({ children }) {
  const { currentUser } = useAuth();
  const [selected, setSelected] = useState(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (selected) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage is optional */
    }
  }, [selected]);

  const selectPatient = useCallback((patient) => {
    setSelected(patient ? { id: patient.id, name: (patient.user && patient.user.name) || patient.name || 'Patient' } : null);
  }, []);

  const isPatient = currentUser && currentUser.role === ROLES.PATIENT;

  const value = useMemo(() => {
    const patientId = isPatient ? currentUser.patientId : selected && selected.id;
    return {
      patientId: patientId || null,
      patientName: isPatient ? currentUser.name : (selected && selected.name) || null,
      isOwnRecord: Boolean(isPatient),
      selectPatient,
      clearPatient: () => setSelected(null),
    };
  }, [isPatient, currentUser, selected, selectPatient]);

  return <PatientScopeContext.Provider value={value}>{children}</PatientScopeContext.Provider>;
}

export const usePatientScope = () => {
  const context = useContext(PatientScopeContext);
  if (!context) throw new Error('usePatientScope must be used inside PatientScopeProvider');
  return context;
};
