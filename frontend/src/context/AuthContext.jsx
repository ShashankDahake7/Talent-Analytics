import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'talent_analytics_auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const { user: u, token: t } = JSON.parse(raw);
        if (u && t) {
          setUser(u);
          setToken(t);
        }
      }
    }
    catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    finally {
      setLoading(false);
    }
  }, []);
  const login = useCallback((userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: userData, token: authToken }));
  }, []);
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);
  const value = { user, token, login, logout, loading, isAuthenticated: !!token };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}