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
  'Super Admin': { email: 'admin@rbinfragov.demo', role: 'Super Admin', department: 'Administration', district: 'ALL', division: 'ALL', orgScope: 'ALL' },
  'Chief Engineer': { email: 'chief@rbinfragov.demo', role: 'Chief Engineer', department: 'Engineering', district: 'ALL', division: 'ALL', orgScope: 'ALL' },
  'Executive Engineer': { email: 'executive@rbinfragov.demo', role: 'Executive Engineer', department: 'Engineering', district: 'Ahmedabad', division: 'Central', orgScope: 'DISTRICT' },
  'Assistant Engineer': { email: 'engineer@rbinfragov.demo', role: 'Assistant Engineer', department: 'Engineering', district: 'Ahmedabad', division: 'Central', orgScope: 'DIVISION' },
  'Finance Officer': { email: 'finance@rbinfragov.demo', role: 'Finance Officer', department: 'Finance', district: 'ALL', division: 'ALL', orgScope: 'ALL' },
  'Auditor': { email: 'auditor@rbinfragov.demo', role: 'Auditor', department: 'Audit', district: 'ALL', division: 'ALL', orgScope: 'ALL' },
  'Contractor': { email: 'contractor@rbinfragov.demo', role: 'Contractor', department: 'External', district: 'ALL', division: 'ALL', orgScope: 'SELF' },
};

const DEMO_NAMES: Record<string, string> = {
  'Super Admin': 'Suresh Kumar',
  'Chief Engineer': 'Rajesh Patel',
  'Executive Engineer': 'Amit Shah',
  'Assistant Engineer': 'Priya Mehta',
  'Finance Officer': 'Neha Joshi',
  'Auditor': 'Vikram Rao',
  'Contractor': 'Hitesh Contractor',
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
