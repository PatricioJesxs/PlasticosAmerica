'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Download,
  FileText,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { api, ApiError, leerToken } from '@/lib/api';
import { formatearCLP } from '@/lib/catalogo';

type Tab = 'perfil' | 'cotizaciones' | 'seguridad';

interface CotizacionItem {
  id: string;
  nombre_producto: string;
  medida: string | null;
  unidad: string | null;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

interface Cotizacion {
  id: string;
  folio: number | null;
  nombre_contacto: string;
  email: string;
  total_neto: number;
  iva: number;
  total_total: number;
  estado: string;
  created_at: string;
  items: CotizacionItem[];
}

const ESTADOS: Record<string, { texto: string; clase: string }> = {
  PENDIENTE: { texto: 'Pendiente', clase: 'bg-amber-50 text-amber-700 border-amber-200' },
  EN_REVISION: { texto: 'En revisión', clase: 'bg-blue-50 text-blue-700 border-blue-200' },
  RESPONDIDA: { texto: 'Respondida', clase: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  APROBADA: { texto: 'Aprobada', clase: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  RECHAZADA: { texto: 'Rechazada', clase: 'bg-brand-50 text-brand-700 border-brand-200' },
};

export default function CuentaPage() {
  const router = useRouter();
  const { user, loading, actualizar, logout } = useAuth();

  const [tab, setTab] = useState<Tab>('perfil');
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [cargandoCot, setCargandoCot] = useState(false);

  const [perfil, setPerfil] = useState({ nombre: '', email: '', telefono: '', rut: '' });
  const [guardando, setGuardando] = useState(false);
  const [mensajePerfil, setMensajePerfil] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  const [claves, setClaves] = useState({ actual: '', nueva: '', repetir: '' });
  const [cambiando, setCambiando] = useState(false);
  const [mensajeClave, setMensajeClave] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace('/login?next=/cuenta');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    setPerfil({
      nombre: user.nombre,
      email: user.email,
      telefono: user.telefono ?? '',
      rut: user.rut ?? '',
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setCargandoCot(true);
    api<{ total: number; items: Cotizacion[] }>('/api/cotizaciones/mias', { token: leerToken() })
      .then((res) => setCotizaciones(res.items))
      .catch(() => setCotizaciones([]))
      .finally(() => setCargandoCot(false));
  }, [user]);

  if (loading || !user) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-3 px-4 py-24">
        <Loader2 className="h-8 w-8 animate-spin text-brand-700" />
        <p className="text-sm font-semibold text-slate-500">Cargando tu cuenta…</p>
      </div>
    );
  }

  const guardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajePerfil(null);
    setGuardando(true);
    try {
      await actualizar({
        nombre: perfil.nombre,
        email: perfil.email,
        telefono: perfil.telefono,
        rut: perfil.rut || undefined,
      });
      setMensajePerfil({ tipo: 'ok', texto: 'Tus datos se actualizaron correctamente.' });
    } catch (err) {
      setMensajePerfil({
        tipo: 'error',
        texto: err instanceof ApiError ? err.message : 'No pudimos guardar los cambios.',
      });
    } finally {
      setGuardando(false);
    }
  };

  const cambiarClave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeClave(null);
    if (claves.nueva.length < 6) {
      setMensajeClave({ tipo: 'error', texto: 'La nueva contraseña debe tener al menos 6 caracteres.' });
      return;
    }
    if (claves.nueva !== claves.repetir) {
      setMensajeClave({ tipo: 'error', texto: 'Las contraseñas nuevas no coinciden.' });
      return;
    }
    setCambiando(true);
    try {
      await api('/api/auth/me/password', {
        method: 'POST',
        token: leerToken(),
        body: { password_actual: claves.actual, password_nueva: claves.nueva },
      });
      setMensajeClave({ tipo: 'ok', texto: 'Contraseña actualizada correctamente.' });
      setClaves({ actual: '', nueva: '', repetir: '' });
    } catch (err) {
      setMensajeClave({
        tipo: 'error',
        texto: err instanceof ApiError ? err.message : 'No pudimos cambiar la contraseña.',
      });
    } finally {
      setCambiando(false);
    }
  };

  const totalCotizado = cotizaciones.reduce((acc, c) => acc + c.total_total, 0);
  const iniciales = user.nombre
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="bg-[#fbfaf7] pb-16">
      {/* Cabecera */}
      <section className="border-b border-black/5 bg-navy-950 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-9 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar_url} alt={user.nombre} className="h-16 w-16 rounded-2xl object-cover ring-2 ring-white/20" />
            ) : (
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-700 text-xl font-extrabold ring-2 ring-white/20">
                {iniciales}
              </span>
            )}
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-200">Mi cuenta</p>
              <h1 className="text-2xl font-extrabold">{user.nombre}</h1>
              <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-white/60">
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" /> {user.email}
                </span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-200">
                  {user.role}
                </span>
                {user.auth_provider === 'GOOGLE' && (
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/70">Google</span>
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              logout();
              router.push('/');
            }}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-white/20 px-4 py-2.5 text-xs font-bold text-white/90 transition hover:bg-white/10 sm:self-auto"
          >
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </button>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        {/* Resumen */}
        <div className="-mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { icon: ClipboardList, label: 'Cotizaciones', valor: String(cotizaciones.length) },
            { icon: CreditCard, label: 'Total cotizado', valor: formatearCLP(totalCotizado) },
            { icon: Calendar, label: 'Cliente desde', valor: user.created_at ? new Date(user.created_at).toLocaleDateString('es-CL') : '—' },
          ].map(({ icon: Icon, label, valor }) => (
            <div key={label} className="flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                <p className="text-sm font-extrabold text-navy-900">{valor}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mt-7 flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm sm:w-fit">
          {[
            { id: 'perfil' as Tab, nombre: 'Mis datos', icon: UserIcon },
            { id: 'cotizaciones' as Tab, nombre: 'Mis cotizaciones', icon: FileText },
            { id: 'seguridad' as Tab, nombre: 'Seguridad', icon: Lock },
          ].map(({ id, nombre, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-bold transition sm:flex-none ${
                tab === id ? 'bg-navy-900 text-white shadow' : 'text-slate-600 hover:bg-sand-100'
              }`}
            >
              <Icon className="h-4 w-4" /> {nombre}
            </button>
          ))}
        </div>

        {/* Contenido */}
        <div className="mt-5">
          {tab === 'perfil' && (
            <div className="grid gap-5 lg:grid-cols-3">
              <form onSubmit={guardarPerfil} className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm lg:col-span-2 sm:p-6">
                <h2 className="text-base font-extrabold text-navy-900">Datos personales</h2>
                <p className="mt-0.5 text-xs text-slate-500">Mantén tus datos actualizados para agilizar tus cotizaciones.</p>

                {mensajePerfil && (
                  <div
                    className={`mt-4 flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-semibold ${
                      mensajePerfil.tipo === 'ok'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-brand-200 bg-brand-50 text-brand-800'
                    }`}
                  >
                    {mensajePerfil.tipo === 'ok' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    {mensajePerfil.texto}
                  </div>
                )}

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wide text-navy-900">Nombre completo</label>
                    <input
                      value={perfil.nombre}
                      onChange={(e) => setPerfil((p) => ({ ...p, nombre: e.target.value }))}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-sand-50 px-3.5 py-2.5 text-sm outline-none focus:border-brand-700/50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wide text-navy-900">Correo</label>
                    <input
                      type="email"
                      value={perfil.email}
                      onChange={(e) => setPerfil((p) => ({ ...p, email: e.target.value }))}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-sand-50 px-3.5 py-2.5 text-sm outline-none focus:border-brand-700/50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wide text-navy-900">Teléfono</label>
                    <input
                      value={perfil.telefono}
                      onChange={(e) => setPerfil((p) => ({ ...p, telefono: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-sand-50 px-3.5 py-2.5 text-sm outline-none focus:border-brand-700/50 focus:bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wide text-navy-900">RUT</label>
                    <input
                      value={perfil.rut}
                      onChange={(e) => setPerfil((p) => ({ ...p, rut: e.target.value }))}
                      placeholder="12.345.678-9"
                      className="w-full rounded-xl border border-slate-200 bg-sand-50 px-3.5 py-2.5 text-sm outline-none focus:border-brand-700/50 focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={guardando}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-2.5 text-xs font-extrabold text-white transition hover:bg-brand-800 disabled:opacity-60"
                >
                  {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Guardar cambios
                </button>
              </form>

              <div className="space-y-4">
                <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm">
                  <h3 className="flex items-center gap-2 text-sm font-extrabold text-navy-900">
                    <Building2 className="h-4 w-4 text-brand-700" /> ¿Compras por empresa?
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Solicita tu cuenta mayorista para acceder a precios preferentes y atención dedicada.
                  </p>
                  <Link
                    href="/mayorista"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:underline"
                  >
                    Quiero ser mayorista <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <h3 className="flex items-center gap-2 text-sm font-extrabold text-emerald-900">
                    <ShieldCheck className="h-4 w-4" /> Cuenta verificada
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-emerald-800/80">
                    Tu correo está registrado. Si necesitas factura electrónica, agrega tus datos de empresa al
                    solicitar una cotización.
                  </p>
                </div>

                <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm">
                  <h3 className="flex items-center gap-2 text-sm font-extrabold text-navy-900">
                    <Phone className="h-4 w-4 text-brand-700" /> ¿Necesitas ayuda?
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">Llámanos de lunes a viernes.</p>
                  <a href="tel:+56223386700" className="mt-2 block text-sm font-extrabold text-brand-700">
                    22 338 6700
                  </a>
                </div>
              </div>
            </div>
          )}

          {tab === 'cotizaciones' && (
            <div id="cotizaciones" className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-extrabold text-navy-900">Historial de cotizaciones</h2>
                  <p className="mt-0.5 text-xs text-slate-500">Revisa el estado y detalle de tus solicitudes.</p>
                </div>
                <Link
                  href="/cotizacion"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-800"
                >
                  Nueva cotización <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {cargandoCot ? (
                <div className="mt-6 space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="skeleton h-20 rounded-xl" />
                  ))}
                </div>
              ) : cotizaciones.length === 0 ? (
                <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center">
                  <ClipboardList className="h-10 w-10 text-slate-300" />
                  <p className="mt-3 text-sm font-bold text-navy-900">Aún no tienes cotizaciones</p>
                  <p className="mt-1 max-w-sm text-xs text-slate-500">
                    Explora el catálogo, selecciona tus medidas y solicita tu primera cotización.
                  </p>
                  <Link href="/catalogo" className="mt-4 rounded-xl bg-navy-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-700">
                    Ir al catálogo
                  </Link>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {cotizaciones.map((cot) => {
                    const estado = ESTADOS[cot.estado] ?? ESTADOS.PENDIENTE;
                    return (
                      <details key={cot.id} className="group rounded-xl border border-slate-200">
                        <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="grid h-10 w-10 place-items-center rounded-lg bg-sand-100 text-[10px] font-extrabold text-navy-900">
                              #{cot.folio ?? '—'}
                            </span>
                            <div>
                              <p className="text-xs font-bold text-navy-900">
                                {new Date(cot.created_at).toLocaleDateString('es-CL', {
                                  day: '2-digit',
                                  month: 'long',
                                  year: 'numeric',
                                })}
                              </p>
                              <p className="text-[11px] text-slate-500">{cot.items.length} producto(s)</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${estado.clase}`}>{estado.texto}</span>
                            <span className="text-sm font-extrabold text-navy-900">{formatearCLP(cot.total_total)}</span>
                          </div>
                        </summary>
                        <div className="border-t border-slate-100 px-4 py-3">
                          <ul className="space-y-1.5">
                            {cot.items.map((it) => (
                              <li key={it.id} className="flex items-center justify-between gap-3 text-[11px]">
                                <span className="min-w-0 text-slate-600">
                                  <span className="font-semibold text-navy-900">{it.nombre_producto}</span>
                                  {it.medida ? ` · ${it.medida}` : ''} × {it.cantidad}
                                </span>
                                <span className="shrink-0 font-semibold text-navy-900">{formatearCLP(it.subtotal)}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-3 flex justify-between border-t border-dashed border-slate-200 pt-2 text-xs">
                            <span className="text-slate-500">Total con IVA</span>
                            <span className="font-extrabold text-navy-900">{formatearCLP(cot.total_total)}</span>
                          </div>
                          <a
                            href={`mailto:cotizaciones@plasticosamerica.cl?subject=${encodeURIComponent(
                              `Consulta cotización #${cot.folio}`
                            )}`}
                            className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-brand-700 hover:underline"
                          >
                            <Download className="h-3.5 w-3.5" /> Consultar por esta cotización
                          </a>
                        </div>
                      </details>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === 'seguridad' && (
            <div className="grid gap-5 lg:grid-cols-2">
              <form onSubmit={cambiarClave} className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-base font-extrabold text-navy-900">Cambiar contraseña</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {user.auth_provider === 'GOOGLE'
                    ? 'Tu cuenta usa Google. Puedes crear una contraseña local para ingresar también con tu correo.'
                    : 'Usa una contraseña de al menos 6 caracteres que no utilices en otros sitios.'}
                </p>

                {mensajeClave && (
                  <div
                    className={`mt-4 flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-semibold ${
                      mensajeClave.tipo === 'ok'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-brand-200 bg-brand-50 text-brand-800'
                    }`}
                  >
                    {mensajeClave.tipo === 'ok' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    {mensajeClave.texto}
                  </div>
                )}

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wide text-navy-900">Contraseña actual</label>
                    <input
                      type="password"
                      value={claves.actual}
                      onChange={(e) => setClaves((c) => ({ ...c, actual: e.target.value }))}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-sand-50 px-3.5 py-2.5 text-sm outline-none focus:border-brand-700/50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wide text-navy-900">Nueva contraseña</label>
                    <input
                      type="password"
                      value={claves.nueva}
                      onChange={(e) => setClaves((c) => ({ ...c, nueva: e.target.value }))}
                      required
                      minLength={6}
                      className="w-full rounded-xl border border-slate-200 bg-sand-50 px-3.5 py-2.5 text-sm outline-none focus:border-brand-700/50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wide text-navy-900">Repetir nueva contraseña</label>
                    <input
                      type="password"
                      value={claves.repetir}
                      onChange={(e) => setClaves((c) => ({ ...c, repetir: e.target.value }))}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-sand-50 px-3.5 py-2.5 text-sm outline-none focus:border-brand-700/50 focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={cambiando}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-2.5 text-xs font-extrabold text-white transition hover:bg-brand-800 disabled:opacity-60"
                >
                  {cambiando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  Actualizar contraseña
                </button>
              </form>

              <div className="space-y-4">
                <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-extrabold text-navy-900">Sesión activa</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Último acceso:{' '}
                    <strong className="text-navy-900">
                      {user.last_login ? new Date(user.last_login).toLocaleString('es-CL') : 'Ahora'}
                    </strong>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Método: <strong className="text-navy-900">{user.auth_provider === 'GOOGLE' ? 'Google' : 'Correo y contraseña'}</strong>
                  </p>
                </div>

                {user.role === 'ADMIN' || user.role === 'VENDEDOR' ? (
                  <div className="rounded-2xl bg-navy-900 p-5 text-white">
                    <h3 className="flex items-center gap-2 text-sm font-extrabold">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" /> Acceso de trabajador
                    </h3>
                    <p className="mt-1 text-xs text-white/70">
                      Tienes permisos para gestionar el catálogo, cotizaciones y usuarios.
                    </p>
                    <Link
                      href="/admin"
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-extrabold text-navy-900 hover:bg-brand-50"
                    >
                      Ir al panel <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-sand-50 p-5">
                    <h3 className="text-sm font-extrabold text-navy-900">Privacidad</h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      Tus datos se usan únicamente para gestionar cotizaciones y pedidos. Puedes solicitar la
                      eliminación de tu cuenta escribiendo a ventas@plasticosamerica.cl.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
