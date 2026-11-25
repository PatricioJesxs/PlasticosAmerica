'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Car,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Store,
  User,
} from 'lucide-react';

const SUCURSALES = [
  {
    nombre: 'Casa Matriz',
    direccion: 'Santa Elena 825 y 835',
    comuna: 'Santiago Centro',
    referencia: 'A pasos de Av. Santa Elena con San Camilo',
    mapa: 'https://www.google.com/maps?q=Santa+Elena+825,+Santiago,+Chile&output=embed',
    telefono: '22 338 6700',
  },
  {
    nombre: 'Sucursal',
    direccion: 'San Camilo 834',
    comuna: 'Santiago Centro',
    referencia: 'Acceso y estacionamiento por San Camilo',
    mapa: 'https://www.google.com/maps?q=San+Camilo+834,+Santiago,+Chile&output=embed',
    telefono: '22 222 6874',
  },
];

export default function ContactoPage() {
  const [sucursal, setSucursal] = useState(0);
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', asunto: 'Consulta general', mensaje: '' });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  const set = (campo: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [campo]: e.target.value }));

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.nombre.trim() || !form.email.includes('@') || form.mensaje.trim().length < 5) {
      setError('Completa tu nombre, un correo válido y un mensaje de al menos 5 caracteres.');
      return;
    }
    setEnviando(true);
    setTimeout(() => {
      setEnviando(false);
      setEnviado(true);
      setForm({ nombre: '', email: '', telefono: '', asunto: 'Consulta general', mensaje: '' });
    }, 900);
  };

  const campo =
    'w-full rounded-xl border border-slate-200 bg-sand-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand-700/50 focus:bg-white focus:ring-4 focus:ring-brand-700/10';

  return (
    <div className="bg-[#fbfaf7] pb-16">
      <section className="border-b border-black/5 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-9">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-brand-700">
            <MapPin className="h-3.5 w-3.5" /> Dirección y contacto
          </span>
          <h1 className="mt-3 text-2xl font-extrabold text-navy-950 sm:text-3xl">Visítanos o escríbenos</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">
            Dos sucursales en el centro de Santiago, con estacionamiento gratuito para clientes y atención de
            lunes a viernes.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Datos rápidos */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Phone, titulo: 'Teléfonos', valor: '22 338 6700 · 22 222 6874', href: 'tel:+56223386700' },
            { icon: Mail, titulo: 'Ventas', valor: 'ventas@plasticosamerica.cl', href: 'mailto:ventas@plasticosamerica.cl' },
            { icon: Mail, titulo: 'Cotizaciones', valor: 'cotizaciones@plasticosamerica.cl', href: 'mailto:cotizaciones@plasticosamerica.cl' },
            { icon: Clock, titulo: 'Horario', valor: 'Lun a Jue 8:00–17:30 · Vie 8:00–17:00' },
          ].map(({ icon: Icon, titulo, valor, href }) => {
            const contenido = (
              <>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{titulo}</p>
                  <p className="truncate text-xs font-bold text-navy-900">{valor}</p>
                </div>
              </>
            );
            return href ? (
              <a key={titulo} href={href} className="flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm transition hover:border-brand-700/20 hover:shadow-md">
                {contenido}
              </a>
            ) : (
              <div key={titulo} className="flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm">
                {contenido}
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          {/* Sucursales y mapa */}
          <div className="lg:col-span-7">
            <div className="grid gap-3 sm:grid-cols-2">
              {SUCURSALES.map((s, i) => (
                <button
                  key={s.nombre}
                  type="button"
                  onClick={() => setSucursal(i)}
                  className={`rounded-2xl border p-4 text-left shadow-sm transition ${
                    sucursal === i ? 'border-brand-700 bg-white ring-2 ring-brand-700/15' : 'border-black/[0.06] bg-white hover:border-brand-700/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {i === 0 ? <Building2 className="h-4 w-4 text-brand-700" /> : <Store className="h-4 w-4 text-brand-700" />}
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-700">{s.nombre}</span>
                  </div>
                  <p className="mt-1.5 text-sm font-extrabold text-navy-900">{s.direccion}</p>
                  <p className="text-xs text-slate-500">{s.comuna}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{s.referencia}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-navy-900">
                    <Phone className="h-3.5 w-3.5 text-brand-700" /> {s.telefono}
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-black/[0.06] shadow-sm">
              <iframe
                key={sucursal}
                title={`Ubicación ${SUCURSALES[sucursal].nombre}`}
                src={SUCURSALES[sucursal].mapa}
                className="h-[330px] w-full sm:h-[380px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <Car className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="text-xs font-extrabold text-emerald-900">Estacionamiento gratuito para clientes</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-emerald-800/80">
                  Contamos con espacios de estacionamiento en Santa Elena y San Camilo. Consulta disponibilidad al
                  llegar.
                </p>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div className="lg:col-span-5">
            <form onSubmit={enviar} className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm sm:p-6">
              <h2 className="flex items-center gap-2 text-base font-extrabold text-navy-900">
                <MessageSquare className="h-4 w-4 text-brand-700" /> Envíanos un mensaje
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">Respondemos dentro del horario hábil.</p>

              {error && (
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-2.5 text-xs font-semibold text-brand-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
                </div>
              )}

              {enviado && (
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-800">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  ¡Mensaje enviado! Te contactaremos a la brevedad.
                </div>
              )}

              <div className="mt-4 space-y-3">
                <div>
                  <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wide text-navy-900">Nombre</label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input value={form.nombre} onChange={set('nombre')} placeholder="Tu nombre" className={campo} />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wide text-navy-900">Correo</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input type="email" value={form.email} onChange={set('email')} placeholder="tu@correo.cl" className={campo} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wide text-navy-900">Teléfono</label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input value={form.telefono} onChange={set('telefono')} placeholder="+56 9…" className={campo} />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wide text-navy-900">Asunto</label>
                    <select
                      value={form.asunto}
                      onChange={set('asunto')}
                      className="w-full rounded-xl border border-slate-200 bg-sand-50 px-2.5 py-2.5 text-xs font-semibold text-navy-900 outline-none focus:border-brand-700/50 focus:bg-white"
                    >
                      <option>Consulta general</option>
                      <option>Cotización</option>
                      <option>Estado de pedido</option>
                      <option>Boleta o factura</option>
                      <option>Venta mayorista</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wide text-navy-900">Mensaje</label>
                  <textarea
                    value={form.mensaje}
                    onChange={set('mensaje')}
                    rows={4}
                    placeholder="Cuéntanos en qué te podemos ayudar…"
                    className="w-full rounded-xl border border-slate-200 bg-sand-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-700/50 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={enviando}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 py-3 text-sm font-extrabold text-white transition hover:bg-brand-800 disabled:opacity-60"
              >
                {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {enviando ? 'Enviando…' : 'Enviar mensaje'}
              </button>

              <p className="mt-3 text-center text-[10px] text-slate-400">
                También puedes cotizar directo desde el{' '}
                <Link href="/catalogo" className="font-bold text-brand-700 hover:underline">
                  catálogo
                </Link>
                .
              </p>
            </form>

            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-navy-900 p-4 text-white">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-brand-200">WhatsApp ventas</p>
                <p className="text-sm font-extrabold">+56 2 2338 6700</p>
              </div>
              <a
                href="https://wa.me/56223386700"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-[11px] font-bold text-white hover:bg-emerald-500"
              >
                Escribir <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
