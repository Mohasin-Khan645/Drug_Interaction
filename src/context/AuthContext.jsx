import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authApi } from '../api/authApi';
import { getAuthToken } from '../api/client';
import { MOCK_USERS } from '../api/mock/mockData';
import { getPermissionsForRole, hasPermission as hasPermissionUtil } from '../constants/permissions';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Default to first user (Patient Sarah Jenkins) or saved demo user
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('drugsafe_demo_user');
      const base = saved ? JSON.parse(saved) : MOCK_USERS[0];
      return {
        ...base,
        permissions: base.permissions || getPermissionsForRole(base.role),
      };
    } catch {
      const base = MOCK_USERS[0];
      return {
        ...base,
        permissions: base.permissions || getPermissionsForRole(base.role),
      };
    }
  });

  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Sync session storage
  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('drugsafe_demo_user', JSON.stringify(currentUser));
      setIsAuthenticated(true);
    } else {
      sessionStorage.removeItem('drugsafe_demo_user');
      setIsAuthenticated(false);
    }
  }, [currentUser]);

  // When live backend mode is active, ensure a valid backend JWT is loaded
  useEffect(() => {
    if (import.meta.env.VITE_USE_MOCK_API !== 'true' && !getAuthToken() && currentUser?.email) {
      authApi.login({ email: currentUser.email, password: 'Password123!' }).catch((err) => {
        console.warn('Initial backend demo auth notice:', err.message);
      });
    }
  }, []);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const res = await authApi.login(credentials);
      // If two-factor authentication challenge returned, stop here so UI prompts for code
      if (res?.mfaRequired) {
        return res;
      }
      const user = res.user || res.data?.user;
      if (user) {
        const enrichedUser = {
          ...user,
          permissions: user.permissions || getPermissionsForRole(user.role),
        };
        setCurrentUser(enrichedUser);
        setIsAuthenticated(true);
      }
      return res;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyMfa = useCallback(async ({ mfaTicket, code }) => {
    setLoading(true);
    try {
      const res = await authApi.verifyMfa({ mfaTicket, code });
      const user = res.user || res.data?.user;
      if (user) {
        const enrichedUser = {
          ...user,
          permissions: res.permissions || user.permissions || getPermissionsForRole(user.role),
        };
        setCurrentUser(enrichedUser);
        setIsAuthenticated(true);
      }
      return res;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authApi.logout();
    } finally {
      setCurrentUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const res = await authApi.refreshSession();
      return res;
    } catch (err) {
      logout();
      throw err;
    }
  }, [logout]);

  const getCurrentUser = useCallback(async () => {
    try {
      const res = await authApi.getCurrentUser();
      if (res.user) {
        const enrichedUser = {
          ...res.user,
          permissions: res.user.permissions || getPermissionsForRole(res.user.role),
        };
        setCurrentUser(enrichedUser);
      }
      return res.user;
    } catch {
      return currentUser;
    }
  }, [currentUser]);

  const toggleMfa = useCallback(async (enabled) => {
    const res = await authApi.toggleMfa(enabled);
    if (currentUser) {
      setCurrentUser((prev) => ({ ...prev, mfaEnabled: enabled }));
    }
    return res;
  }, [currentUser]);

  const getSessions = useCallback(async () => {
    return authApi.getSessions();
  }, []);

  const revokeSession = useCallback(async (sessionId) => {
    return authApi.revokeSession(sessionId);
  }, []);

  const revokeAllSessions = useCallback(async () => {
    return authApi.revokeAllSessions();
  }, []);

  // Demonstration Role Switcher to seamlessly test Patient, Doctor, Pharmacist, and Admin flows
  const switchDemoRole = useCallback(async (role) => {
    const matched = MOCK_USERS.find((u) => u.role === role) || MOCK_USERS[0];
    const enrichedMatched = {
      ...matched,
      permissions: matched.permissions || getPermissionsForRole(matched.role),
    };
    setCurrentUser(enrichedMatched);
    setIsAuthenticated(true);
    if (import.meta.env.VITE_USE_MOCK_API !== 'true' && matched?.email) {
      try {
        await authApi.login({ email: matched.email, password: 'Password123!' });
      } catch (err) {
        console.warn('Backend demo auth sync on switch:', err.message);
      }
    }
  }, []);

  const checkPermission = useCallback(
    (perm) => hasPermissionUtil(currentUser, perm),
    [currentUser]
  );

  const permissions = useMemo(() => {
    return currentUser?.permissions || getPermissionsForRole(currentUser?.role);
  }, [currentUser]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        loading,
        login,
        verifyMfa,
        logout,
        refreshSession,
        getCurrentUser,
        switchDemoRole,
        toggleMfa,
        getSessions,
        revokeSession,
        revokeAllSessions,
        hasPermission: checkPermission,
        permissions,
        role: currentUser?.role || 'PATIENT',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
