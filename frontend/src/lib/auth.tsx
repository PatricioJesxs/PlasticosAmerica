'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, borrarSesion, guardarSesion, leerToken, USER_KEY } from '@/lib/api';

export type Rol = 'CLIENTE' | 'MAYORISTA' | 'VENDEDOR' | 'ADMIN';

export interface Usuario {
  id: string;
  rut: string | null;
  nombre: string;
  email: string;
  telefono: string | null;
  role: Rol;
  auth_provider: 'LOCAL' | 'GOOGLE';
  avatar_url: string | null;
  is_active: boolean;
  created_at?: string;
  last_login?: string;
}

interface AuthContextValue {
  user: Usuario | null;
  loading: boolean;
  isStaff: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<Usuario>;
  register: (data: RegistroData) => Promise<Usuario>;
  googleLogin: (credential: string) => Promise<Usuario>;
  logout: () => void;
  actualizar: (data: Partial<Pick<Usuario, 'nombre' | 'email' | 'telefono' | 'rut'>>) => Promise<Usuario>;
}

export interface RegistroData {
  nombre: string;
  email: string;
  password: string;
  rut?: string;
  telefono?: string;
}

interface TokenResponse {
  access_token: string;
  user: Usuario;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = leerToken();
    const guardado = localStorage.getItem(USER_KEY);
    if (guardado) {
      try {
        setUser(JSON.parse(guardado));
      } catch {
        /* ignore */
      }
    }
    if (!token) {
      setLoading(false);
      return;
    }
    api<Usuario>('/api/auth/me', { token })
      .then((u) => {
        setUser(u);
        localStorage.setItem(USER_KEY, JSON.stringify(u));
      })
      .catch(() => {
        borrarSesion();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const aplicar = useCallback((res: TokenResponse) => {
    guardarSesion(res.access_token, res.user);
    setUser(res.user);
    return res.user;
  }, []);

  const login = useCallback(
    async (email: string, password: string, remember = false) => {
      const res = await api<TokenResponse>('/api/auth/login', {
        method: 'POST',
        body: { email, password, remember },
      });
      return aplicar(res);
    },
    [aplicar]
  );

  const register = useCallback(
    async (data: RegistroData) => {
      const res = await api<TokenResponse>('/api/auth/registro', { method: 'POST', body: data });
      return aplicar(res);
    },
    [aplicar]
  );

  const googleLogin = useCallback(
    async (credential: string) => {
      const res = await api<TokenResponse>('/api/auth/google', {
        method: 'POST',
        body: { credential },
      });
      return aplicar(res);
    },
    [aplicar]
  );

  const logout = useCallback(() => {
    borrarSesion();
    setUser(null);
  }, []);

  const actualizar = useCallback(
    async (data: Partial<Pick<Usuario, 'nombre' | 'email' | 'telefono' | 'rut'>>) => {
      const token = leerToken();
      const actualizado = await api<Usuario>('/api/auth/me', { method: 'PUT', body: data, token });
      setUser(actualizado);
      localStorage.setItem(USER_KEY, JSON.stringify(actualizado));
      return actualizado;
    },
    []
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isStaff: user?.role === 'ADMIN' || user?.role === 'VENDEDOR',
      login,
      register,
      googleLogin,
      logout,
      actualizar,
    }),
    [user, loading, login, register, googleLogin, logout, actualizar]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
