import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api.js';
import { db } from '../../lib/db.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCurrentUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.me();
      if (res && res.success) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (credentials) => {
    const res = await api.login(credentials);
    if (res && res.success) {
      setUser(res.data);
      return res.data;
    }
  };

  const register = async (data) => {
    const res = await api.register(data);
    if (res && res.success) {
      setUser(res.data);
      return res.data;
    }
  };

  const logout = async (force = false) => {
    if (user && !force) {
      // Check for unsynced offline items
      try {
        const count = await db.pendingTransactions.where('userId').equals(user.id).count();
        if (count > 0) {
          const confirmed = window.confirm(
            `You have ${count} offline expense(s) waiting to sync. If you log out now, they will remain safely stored locally on this device until you log back in. Do you want to proceed with logout?`
          );
          if (!confirmed) return false;
        }
      } catch {
        // Continue logout
      }
    }

    try {
      await api.logout();
    } catch {
      // Continue even if network fails
    } finally {
      setUser(null);
    }
    return true;
  };

  const updateProfile = async (data) => {
    const res = await api.updateProfile(data);
    if (res && res.success) {
      setUser(res.data);
      return res.data;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        refreshUser: fetchCurrentUser,
        isAdmin: user?.role === 'admin',
        hasPrivilege: (priv) => user?.role === 'admin' || user?.privileges?.includes(priv),
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
