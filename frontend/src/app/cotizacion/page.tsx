'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  ShoppingBag,
  Trash2,
  User,
} from 'lucide-react';
import { useQuote } from '@/lib/quote';
import { useAuth } from '@/lib/auth';
import { api, ApiError } from '@/lib/api';
import { formatearCLP } from '@/lib/catalogo';

interface RespuestaCotizacion {
  id: string;
  folio: number | null;
  total_neto: number;
  iva: number;
  total_total: number;
  estado: string;
  items: { id: string; nombre_producto: string; medida: string | null; cantidad: number; subtotal: number }[];
}

export default function CotizacionPage() {
  const { items, neto, iva, total, vaciar, quitar, cambiarCantidad, count } = useQuote();
  const { user } = useAuth();

  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    rut: '',
    empresa: '',
    direccion: '',
    comentarios: '',
  });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState<RespuestaCotizacion | null>(null);

  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      nombre: f.nombre || user.nombre,
      email: f.email || user.email,
      telefono: f.telefono || (user.telefono ?? ''),
      rut: f.rut || (user.rut ?? ''),
    }));
  }, [user]);

  const set = (campo: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [campo]: e.target.value }));

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (items.length === 0) {
      setError('Agrega al menos un producto a tu cotización.');
      return;
    }
    if (!form.email.includes('@')) {
      setError('Ingresa un correo electrónico válido para enviarte la respuesta.');
      return;
    }

    setEnviando(true);
    try {
      const res = await api<RespuestaCotizacion>('/api/cotizaciones', {
        method: 'POST',
        body: {
          nombre: form.nombre,
          email: form.email,
          telefono: form.telefono || null,
          rut: form.rut || null,
          empresa: form.empresa || null,
          direccion: form.direccion || null,
          comentarios: form.comentarios || null,
          items: items.map((i) => ({
            variant_id: i.variantId,
            product_id: i.variantId ? null : i.productId,
            cantidad: i.cantidad,
          })),
        },
      });
      setResultado(res);
      vaciar();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos enviar tu cotización. Revisa tu conexión o contáctanos por teléfono.'
      );
    } finally {
      setEnviando(false);
    }
  };

  const campo =
    'w-full rounded-xl border border-slate-200 bg-sand-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand-700/50 focus:bg-white focus:ring-4 focus:ring-brand-700/10';

  if (resultado) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <div className="overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-xl shadow-navy-900/5">
          <div className="relative bg-gradient-to-br from-navy-900 to-navy-950 px-6 py-9 text-center text-white sm:px-10">
            <div className="absolute inset-0 bg-grid opacity-[0.12]" />
            <span className="relative mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/20 text-emerald-300 ring-4 ring-emerald-500/10">
              <ClipboardCheck className="h-8 w-8" />
            </span>
            <h1 className="relative mt-4 text-2xl font-extrabold sm:text-3xl">¡Cotización enviada!</h1>
            <p className="relative mt-2 text-sm text-white/70">
              Recibimos tu solicitud. Un ejecutivo te responderá al correo indicado dentro del horario hábil.
            </p>
            {resultado.folio && (
              <span className="relative mt-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-extrabold tracking-wide">
                Folio #{resultado.folio}
              </span>
            )}
          </div>

          <div className="p-6 sm:p-8">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-navy-900">Resumen</h2>
            <ul className="mt-3 divide-y divide-slate-100">
              {resultado.items.map((it) => (
                <li key={it.id} className="flex items-center justify-between gap-3 py-2 text-xs">
                  <span className="min-w-0 text-slate-600">
                    <span className="font-bold text-navy-900">{it.nombre_producto}</span>
                    {it.medida ? ` · ${it.medida}` : ''} × {it.cantidad}
                  </span>
                  <span className="shrink-0 font-semibold text-navy-900">{formatearCLP(it.subtotal)}</span>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <dt>Neto</dt>
                <dd className="font-semibold">{formatearCLP(resultado.total_neto)}</dd>
              </div>
              <div className="flex justify-between text-slate-600">
                <dt>IVA 19%</dt>
                <dd className="font-semibold">{formatearCLP(resultado.iva)}</dd>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-extrabold text-navy-900">
                <dt>Total</dt>
                <dd>{formatearCLP(resultado.total_total)}</dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Link
                href="/cuenta#cotizaciones"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-700 py-3 text-sm font-bold text-white hover:bg-brand-800"
              >
                Ver mis cotizaciones <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/catalogo"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-bold text-navy-900 hover:bg-sand-50"
              >
                Seguir comprando
              </Link>
            </div>
            <p className="mt-3 text-center text-[10px] text-slate-400">
              También puedes escribirnos a cotizaciones@plasticosamerica.cl o llamar al 22 338 6700.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fbfaf7] pb-16">
      <section className="border-b border-black/5 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-7">
          <Link href="/catalogo" className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-brand-700">
            <ArrowLeft className="h-3.5 w-3.5" /> Seguir explorando el catálogo
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold text-navy-950 sm:text-3xl">Solicitar cotización</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Revisa tus productos, completa tus datos y envíanos la solicitud. Respondemos con precios, stock y
            alternativas de despacho.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-12">
        {/* Formulario */}
        <form onSubmit={enviar} className="lg:col-span-7">
          <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm sm:p-6">
            <h2 className="flex items-center gap-2 text-base font-extrabold text-navy-900">
              <User className="h-4 w-4 text-brand-700" /> Datos de contacto
            </h2>

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-2.5 text-xs font-semibold text-brand-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
              </div>
            )}

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wide text-navy-900">Nombre completo *</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={form.nombre} onChange={set('nombre')} required placeholder="Juan Pérez" className={campo} />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wide text-navy-900">Correo *</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input type="email" value={form.email} onChange={set('email')} required placeholder="tu@correo.cl" className={campo} />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wide text-navy-900">Teléfono</label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={form.telefono} onChange={set('telefono')} placeholder="+56 9 1234 5678" className={campo} />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wide text-navy-900">RUT / RUT empresa</label>
                <div className="relative">
                  <FileText className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={form.rut} onChange={set('rut')} placeholder="76.543.210-K" className={campo} />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wide text-navy-900">Empresa (opcional)</label>
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={form.empresa} onChange={set('empresa')} placeholder="Constructora / Ferretería / Agricola" className={campo} />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wide text-navy-900">Dirección de despacho</label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={form.direccion} onChange={set('direccion')} placeholder="Calle, número, comuna, ciudad" className={campo} />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wide text-navy-900">Comentarios</label>
                <div className="relative">
                  <MessageSquare className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <textarea
                    value={form.comentarios}
                    onChange={set('comentarios')}
                    rows={4}
                    placeholder="Cuéntanos plazos, obra, condiciones de pago o cualquier detalle relevante…"
                    className="w-full rounded-xl border border-slate-200 bg-sand-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand-700/50 focus:bg-white focus:ring-4 focus:ring-brand-700/10"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={enviando || items.length === 0}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 py-3.5 text-sm font-extrabold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {enviando ? 'Enviando solicitud…' : 'Enviar solicitud de cotización'}
            </button>
            <p className="mt-2 text-center text-[10px] text-slate-400">
              Al enviar aceptas ser contactado por Plásticos América para responder tu solicitud.
            </p>
          </div>
        </form>

        {/* Resumen */}
        <aside className="lg:col-span-5">
          <div className="sticky top-36 overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="flex items-center gap-2 text-sm font-extrabold text-navy-900">
                <ShoppingBag className="h-4 w-4 text-brand-700" /> Tu cotización
              </h2>
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-extrabold text-brand-700">{count} ítem(s)</span>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-10 text-center">
                <ShoppingBag className="h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm font-bold text-navy-900">No has agregado productos</p>
                <p className="mt-1 text-xs text-slate-500">Selecciona medidas desde el catálogo para cotizar.</p>
                <Link href="/catalogo" className="mt-4 rounded-xl bg-navy-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-700">
                  Explorar catálogo
                </Link>
              </div>
            ) : (
              <>
                <ul className="max-h-[380px] divide-y divide-slate-100 overflow-y-auto">
                  {items.map((it) => (
                    <li key={it.key} className="flex gap-3 p-4">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-sand-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={it.imagen || '/logo.png'} alt={it.nombre} className="h-full w-full object-contain p-1" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="line-clamp-2 text-[11px] font-bold leading-snug text-navy-900">{it.nombre}</p>
                          <button
                            type="button"
                            onClick={() => quitar(it.key)}
                            className="shrink-0 rounded p-1 text-slate-400 hover:bg-brand-50 hover:text-brand-700"
                            aria-label={`Quitar ${it.nombre}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="mt-0.5 text-[10px] text-slate-500">{it.medida} · {it.unidad}</p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="flex items-center rounded-md border border-slate-200 text-[11px]">
                            <button type="button" onClick={() => cambiarCantidad(it.key, it.cantidad - 1)} className="px-2 py-0.5 font-bold text-slate-600">
                              −
                            </button>
                            <span className="min-w-7 text-center font-bold text-navy-900">{it.cantidad}</span>
                            <button type="button" onClick={() => cambiarCantidad(it.key, it.cantidad + 1)} className="px-2 py-0.5 font-bold text-slate-600">
                              +
                            </button>
                          </div>
                          <span className="text-xs font-extrabold text-navy-900">{formatearCLP(it.precio * it.cantidad)}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-slate-100 bg-sand-50/70 px-5 py-4 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Neto</span>
                    <span className="font-semibold">{formatearCLP(neto)}</span>
                  </div>
                  <div className="mt-1 flex justify-between text-slate-600">
                    <span>IVA 19%</span>
                    <span className="font-semibold">{formatearCLP(iva)}</span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 text-sm font-extrabold text-navy-900">
                    <span>Total</span>
                    <span>{formatearCLP(total)}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-[11px] text-emerald-900">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <p>
              Sin compromiso de compra. Confirmamos precios, stock y despacho antes de emitir cualquier documento.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
