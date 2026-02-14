import React, { createContext, useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  email: string;
  displayName: string;
  plan: 'starter' | 'pro' | 'team';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateProfile: () => {},
});

const STORAGE_KEY = 'openclaw_user';

function generateId(): string {
  return 'user_' + Math.random().toString(36).substring(2, 15);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = useCallback(async (email: string, _password: string) => {
    const newUser: User = {
      id: generateId(),
      email,
      displayName: email.split('@')[0],
      plan: 'starter',
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
  }, []);

  const register = useCallback(async (email: string, _password: string, displayName: string) => {
    const newUser: User = {
      id: generateId(),
      email,
      displayName,
      plan: 'starter',
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const updateProfile = useCallback((updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  return React.createElement(AuthContext.Provider, {
    value: { user, isAuthenticated: !!user, login, register, logout, updateProfile }
  }, children);
}
