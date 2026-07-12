"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, setAuthToken } from "@/utils/api";

export interface AuthUser {
  id: string;
  email: string;
  display_name: string;
  is_demo: boolean;
  role: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  createDemo: () => Promise<{ email: string; password: string }>;
  logout: () => void;
}

const defaultAuth: AuthContextValue = {
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  createDemo: async () => ({ email: "", password: "" }),
  logout: () => {},
};

const AuthContext = createContext<AuthContextValue>(defaultAuth);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("gaia_token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const me = await api.me();
      setUser(me);
    } catch {
      localStorage.removeItem("gaia_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    setAuthToken(res.access_token);
    setUser(res.user);
  };

  const register = async (email: string, password: string, displayName?: string) => {
    const res = await api.register(email, password, displayName);
    setAuthToken(res.access_token);
    setUser(res.user);
  };

  const createDemo = async () => {
    const res = await api.createDemo();
    setAuthToken(res.access_token);
    setUser(res.user);
    return { email: res.email, password: res.password };
  };

  const logout = () => {
    localStorage.removeItem("gaia_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, createDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
