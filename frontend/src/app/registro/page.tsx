'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight, CreditCard, Eye, EyeOff, Loader2, Lock, Mail, Phone, User } from 'lucide-react';
import AuthShell from '@/components/AuthShell';
import GoogleButton from '@/components/GoogleButton';
import { useAuth } from '@/lib/auth';
import { ApiError } from '@/lib/api';

function formatearRut(valor: string): string {
  const limpio = valor.replace(/[^0-9kK]/g, '').toUpperCase();
  if (limpio.length <= 1) return limpio;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  const conPuntos = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${conPuntos}-${dv}`;
}

export default function RegistroPage() {
  const router = useRouter();
  const { register, googleLogin } = useAuth();

  const [form, setForm] = useState({
    nombre: '',
    email: '',
    rut: '',
    telefono: '',
    password: '',
    confirmar: '',
  });
  const [ver, setVer] = useState(false);
  const [acepta, setAcepta] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const set = (campo: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [campo]: e.target.value }));

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (form.password !== form.confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (!acepta) {
      setError('Debes aceptar los términos y la política de privacidad.');
      return;
    }

    setCargando(true);
    try {
      await register({
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        rut: form.rut.trim() || undefined,
        telefono: form.telefono.trim() || undefined,
        password: form.password,
      });
      router.push('/cuenta');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No pudimos crear tu cuenta. Inténtalo nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  const conGoogle = async (credential: string) => {
    setError('');
    setCargando(true);
    try {
      await googleLogin(credential);
      router.push('/cuenta');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No pudimos crear tu cuenta con Google.');
    } finally {
      setCargando(false);
    }
  };

  const campo =
    'w-full rounded-xl border border-slate-200 bg-sand-50 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-brand-700/50 focus:bg-white focus:ring-4 focus:ring-brand-700/10';

  return (
    <AuthShell
      eyebrow="Crear cuenta"
      titulo="Regístrate en minutos"
      descripcion="Guarda tus cotizaciones y accede a precios preferentes."
      footer={
        <>
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="font-bold text-brand-700 hover:underline">
            Inicia sesión
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

      <form onSubmit={enviar} className="space-y-3.5">
        <div>
          <label htmlFor="nombre" className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wide text-navy-900">
            Nombre completo
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input id="nombre" value={form.nombre} onChange={set('nombre')} required placeholder="Juan Pérez" className={campo} autoComplete="name" />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wide text-navy-900">
            Correo electrónico
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input id="email" type="email" value={form.email} onChange={set('email')} required placeholder="tu@correo.cl" className={campo} autoComplete="email" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="rut" className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wide text-navy-900">
              RUT <span className="font-medium normal-case text-slate-400">(opcional)</span>
            </label>
            <div className="relative">
              <CreditCard className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="rut"
                value={form.rut}
                onChange={(e) => setForm((f) => ({ ...f, rut: formatearRut(e.target.value) }))}
                placeholder="12.345.678-9"
                className={campo}
                inputMode="text"
              />
            </div>
          </div>
          <div>
            <label htmlFor="telefono" className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wide text-navy-900">
              Teléfono
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input id="telefono" value={form.telefono} onChange={set('telefono')} placeholder="+56 9 1234 5678" className={campo} autoComplete="tel" />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wide text-navy-900">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="password"
              type={ver ? 'text' : 'password'}
              value={form.password}
              onChange={set('password')}
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
              className={`${campo} pr-11`}
              autoComplete="new-password"
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

        <div>
          <label htmlFor="confirmar" className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wide text-navy-900">
            Repetir contraseña
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="confirmar"
              type={ver ? 'text' : 'password'}
              value={form.confirmar}
              onChange={set('confirmar')}
              required
              placeholder="Repite tu contraseña"
              className={campo}
              autoComplete="new-password"
            />
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-2 text-[11px] leading-relaxed text-slate-600">
          <input
            type="checkbox"
            checked={acepta}
            onChange={(e) => setAcepta(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded accent-[#8b0000]"
          />
          Acepto los términos de uso, la política de privacidad y el tratamiento de mis datos para fines comerciales.
        </label>

        <button
          type="submit"
          disabled={cargando}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 py-3.5 text-sm font-extrabold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {cargando ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          {cargando ? 'Creando cuenta…' : 'Crear mi cuenta'}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-slate-200" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">o regístrate con</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <GoogleButton onCredential={conGoogle} texto="Registrarme con Google" />
    </AuthShell>
  );
}
