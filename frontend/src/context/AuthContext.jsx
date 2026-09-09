import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { authApi } from '../api/authApi';
import { setAccessToken, setUnauthenticatedHandler } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const bootstrapped = useRef(false);

  const applySession = useCallback((session) => {
    setAccessToken(session.accessToken);
    setCurrentUser(session.user);
  }, []);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setCurrentUser(null);
  }, []);

  const getCurrentUser = useCallback(async () => {
    const user = await authApi.me();
    setCurrentUser(user);
    return user;
  }, []);

  const refreshSession = useCallback(async () => {
    const session = await authApi.refresh();
    applySession(session);
    // /auth/me carries the patientId needed for patient-scoped routes.
    return getCurrentUser();
  }, [applySession, getCurrentUser]);

  useEffect(() => {
    setUnauthenticatedHandler(() => clearSession());
  }, [clearSession]);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    refreshSession()
      .catch(() => clearSession())
      .finally(() => setLoading(false));
  }, [clearSession, refreshSession]);

  const login = useCallback(
    async (credentials) => {
      const session = await authApi.login(credentials);
      applySession(session);
      return getCurrentUser();
    },
    [applySession, getCurrentUser]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      loading,
      login,
      logout,
      refreshSession,
      getCurrentUser,
    }),
    [currentUser, loading, login, logout, refreshSession, getCurrentUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
