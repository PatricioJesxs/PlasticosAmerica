'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import AuthShell from '@/components/AuthShell';
import GoogleButton from '@/components/GoogleButton';
import { useAuth } from '@/lib/auth';
import { ApiError } from '@/lib/api';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/cuenta';
  const { login, googleLogin } = useAuth();

  const [identificador, setIdentificador] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [ver, setVer] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await login(identificador.trim(), password, remember);
      router.push(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No pudimos iniciar sesión. Inténtalo nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  const conGoogle = async (credential: string) => {
    setError('');
    setCargando(true);
    try {
      await googleLogin(credential);
      router.push(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No pudimos iniciar sesión con Google.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Iniciar sesión"
      titulo="Bienvenido de vuelta"
      descripcion="Ingresa con tu correo o RUT para revisar tus cotizaciones."
      footer={
        <>
          ¿Aún no tienes cuenta?{' '}
          <Link href="/registro" className="font-bold text-brand-700 hover:underline">
            Regístrate gratis
          </Link>
        </>
      }
    >
      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-2.5 text-xs font-semibold text-brand-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={enviar} className="space-y-4">
        <div>
          <label htmlFor="identificador" className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wide text-navy-900">
            Correo o RUT
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="identificador"
              value={identificador}
              onChange={(e) => setIdentificador(e.target.value)}
              required
              autoComplete="username"
              placeholder="tu@correo.cl o 12.345.678-9"
              className="w-full rounded-xl border border-slate-200 bg-sand-50 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-brand-700/50 focus:bg-white focus:ring-4 focus:ring-brand-700/10"
            />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-[11px] font-extrabold uppercase tracking-wide text-navy-900">
              Contraseña
            </label>
            <Link href="/contacto" className="text-[10px] font-bold text-brand-700 hover:underline">
              ¿Olvidaste tu clave?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="password"
              type={ver ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 bg-sand-50 py-3 pl-10 pr-11 text-sm outline-none transition focus:border-brand-700/50 focus:bg-white focus:ring-4 focus:ring-brand-700/10"
            />
            <button
              type="button"
              onClick={() => setVer((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-navy-900"
              aria-label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {ver ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded accent-[#8b0000]"
          />
          Mantener mi sesión iniciada por 30 días
        </label>

        <button
          type="submit"
          disabled={cargando}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 py-3.5 text-sm font-extrabold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {cargando ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          {cargando ? 'Ingresando…' : 'Iniciar sesión'}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-slate-200" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">o continúa con</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <GoogleButton onCredential={conGoogle} />

      <p className="mt-4 text-center text-[10px] leading-relaxed text-slate-400">
        Al ingresar aceptas nuestros términos de uso y política de privacidad.
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-4 py-20"><div className="skeleton h-96 rounded-3xl" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
