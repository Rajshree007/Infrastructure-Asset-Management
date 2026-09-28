import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  switchRole: (role: string) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_ROLES: Record<string, Partial<User>> = {
  'Admin': { email: 'admin@rbinfragov.demo', role: 'Admin', department: 'Administration', district: 'ALL', division: 'ALL', orgScope: 'ALL' },
  'Municipal Commissioner': { email: 'commissioner@rbinfragov.demo', role: 'Municipal Commissioner', department: 'City Council', district: 'Surat', division: 'ALL', orgScope: 'DISTRICT' },
  'Reviewer': { email: 'viewer@rbinfragov.demo', role: 'Reviewer', department: 'Public', district: 'ALL', division: 'ALL', orgScope: 'READONLY' },
};

const DEMO_NAMES: Record<string, string> = {
  'Admin': 'System Admin',
  'Municipal Commissioner': 'City Commissioner',
  'Reviewer': 'Public Viewer',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('rb_infragov_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('rb_infragov_token'));

  const login = useCallback((u: User, t: string) => {
    setUser(u);
    setToken(t);
    localStorage.setItem('rb_infragov_user', JSON.stringify(u));
    localStorage.setItem('rb_infragov_token', t);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('rb_infragov_user');
    localStorage.removeItem('rb_infragov_token');
  }, []);

  const switchRole = useCallback((role: string) => {
    if (!user) return;
    const roleData = DEMO_ROLES[role];
    if (!roleData) return;
    const newUser: User = { ...user, ...roleData, name: DEMO_NAMES[role] || user.name, id: user.id };
    setUser(newUser);
    localStorage.setItem('rb_infragov_user', JSON.stringify(newUser));
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, switchRole, isAuthenticated: !!user && !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
