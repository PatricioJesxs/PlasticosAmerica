'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Download,
  FileText,
  HelpCircle,
  Loader2,
  Mail,
  Phone,
  Receipt,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { formatearCLP } from '@/lib/catalogo';

interface DocumentoDemo {
  folio: string;
  fecha: string;
  total: number;
  estado: string;
  items: { nombre: string; cantidad: number; total: number }[];
}

export default function BoletaPage() {
  const [rut, setRut] = useState('');
  const [folio, setFolio] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState<DocumentoDemo | null>(null);

  const buscar = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResultado(null);

    if (!rut.trim() || !folio.trim()) {
      setError('Ingresa tu RUT y el número de boleta o factura.');
      return;
    }

    setBuscando(true);
    setTimeout(() => {
      setBuscando(false);
      if (folio.trim().length < 3) {
        setError('El número de documento debe tener al menos 3 dígitos. Revísalo en tu boleta.');
        return;
      }
      setResultado({
        folio: folio.trim(),
        fecha: new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' }),
        total: 45990,
        estado: 'Emitida',
        items: [
          { nombre: 'Tubería PVC hidráulica PN10', cantidad: 6, total: 28990 },
          { nombre: 'Codo PVC 90° cementar', cantidad: 10, total: 17000 },
        ],
      });
    }, 900);
  };

  const campo =
    'w-full rounded-xl border border-slate-200 bg-sand-50 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-brand-700/50 focus:bg-white focus:ring-4 focus:ring-brand-700/10';

  return (
    <div className="bg-[#fbfaf7] pb-16">
      <section className="border-b border-black/5 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-9">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-brand-700">
            <Receipt className="h-3.5 w-3.5" /> Documentos tributarios
          </span>
          <h1 className="mt-3 text-2xl font-extrabold text-navy-950 sm:text-3xl">Boleta electrónica</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">
            Consulta y descarga las boletas y facturas emitidas en nuestras sucursales. Ingresa el RUT del
            comprador y el número de documento impreso en tu boleta.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <form onSubmit={buscar} className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm sm:p-6">
            <h2 className="flex items-center gap-2 text-base font-extrabold text-navy-900">
              <Search className="h-4 w-4 text-brand-700" /> Consultar documento
            </h2>

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-2.5 text-xs font-semibold text-brand-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
              </div>
            )}

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wide text-navy-900">RUT del comprador</label>
                <div className="relative">
                  <FileText className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={rut} onChange={(e) => setRut(e.target.value)} placeholder="12.345.678-9" className={campo} />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wide text-navy-900">N° de boleta o factura</label>
                <div className="relative">
                  <Receipt className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={folio} onChange={(e) => setFolio(e.target.value)} placeholder="Ej: 10457" className={campo} inputMode="numeric" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={buscando}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 py-3.5 text-sm font-extrabold text-white transition hover:bg-brand-800 disabled:opacity-60 sm:w-auto sm:px-7"
            >
              {buscando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {buscando ? 'Buscando documento…' : 'Buscar documento'}
            </button>

            {resultado && (
              <div className="mt-6 overflow-hidden rounded-xl border border-emerald-200">
                <div className="flex items-center justify-between gap-3 bg-emerald-50 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-emerald-900">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Documento encontrado
                  </div>
                  <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white">{resultado.estado}</span>
                </div>
                <div className="bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-navy-900">Boleta N° {resultado.folio}</span>
                    <span className="text-slate-500">{resultado.fecha}</span>
                  </div>
                  <ul className="mt-3 divide-y divide-slate-100">
                    {resultado.items.map((it) => (
                      <li key={it.nombre} className="flex items-center justify-between gap-3 py-2 text-[11px]">
                        <span className="text-slate-600">{it.nombre} × {it.cantidad}</span>
                        <span className="font-semibold text-navy-900">{formatearCLP(it.total)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 text-sm font-extrabold text-navy-900">
                    <span>Total</span>
                    <span>{formatearCLP(resultado.total)}</span>
                  </div>
                  <button
                    type="button"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-navy-900 px-4 py-2 text-[11px] font-bold text-white hover:bg-brand-700"
                  >
                    <Download className="h-3.5 w-3.5" /> Descargar PDF
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, titulo: 'Documento válido', texto: 'Emitido bajo normativa del SII.' },
              { icon: Mail, titulo: 'Copia por correo', texto: 'Podemos reenviarlo a tu email.' },
              { icon: Phone, titulo: 'Soporte', texto: '22 338 6700 · Lun a Vie.' },
            ].map(({ icon: Icon, titulo, texto }) => (
              <div key={titulo} className="rounded-xl border border-black/[0.06] bg-white p-4 text-center shadow-sm">
                <Icon className="mx-auto h-5 w-5 text-brand-700" />
                <p className="mt-2 text-xs font-extrabold text-navy-900">{titulo}</p>
                <p className="mt-0.5 text-[10px] text-slate-500">{texto}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="lg:col-span-5">
          <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm sm:p-6">
            <h2 className="flex items-center gap-2 text-sm font-extrabold text-navy-900">
              <HelpCircle className="h-4 w-4 text-brand-700" /> Preguntas frecuentes
            </h2>
            <div className="mt-3 divide-y divide-slate-100">
              {[
                {
                  p: '¿Dónde encuentro el número de boleta?',
                  r: 'Está impreso en el extremo superior derecho del documento que recibiste al comprar.',
                },
                {
                  p: '¿Puedo descargar una factura?',
                  r: 'Sí, las facturas electrónicas se envían al correo de la empresa al momento de la compra. Si no la recibiste, escríbenos.',
                },
                {
                  p: '¿Qué hago si el documento no aparece?',
                  r: 'Verifica el RUT y el número. Si persiste, contáctanos con la fecha y monto de compra.',
                },
                {
                  p: '¿Emiten factura con orden de compra?',
                  r: 'Sí, para empresas con cuenta mayorista. Adjunta tu orden de compra al solicitar la cotización.',
                },
              ].map((f) => (
                <details key={f.p} className="group py-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-xs font-bold text-navy-900">
                    {f.p}
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-300 transition group-open:rotate-90 group-open:text-brand-700" />
                  </summary>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">{f.r}</p>
                </details>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-navy-900 p-5 text-white">
            <h3 className="text-sm font-extrabold">¿Necesitas reenviar un documento?</h3>
            <p className="mt-1 text-xs leading-relaxed text-white/70">
              Escríbenos con tu RUT, número de documento y correo de destino.
            </p>
            <a
              href="mailto:ventas@plasticosamerica.cl?subject=Reenv%C3%ADo%20de%20documento%20tributario"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-extrabold text-navy-900 hover:bg-brand-50"
            >
              <Mail className="h-3.5 w-3.5 text-brand-700" /> Enviar correo
            </a>
          </div>
        </aside>
      </div>

      <div className="mx-auto max-w-7xl px-4">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-[11px] leading-relaxed text-amber-900">
          <strong>Demostración:</strong> este buscador es una vista de ejemplo. Para conectar la consulta real de
          documentos se debe integrar el proveedor de facturación electrónica (SII) desde el panel de
          administración.
        </div>
      </div>
    </div>
  );
}
