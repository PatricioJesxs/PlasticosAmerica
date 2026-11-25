import React from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';

interface AuthShellProps {
  eyebrow: string;
  titulo: string;
  descripcion: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  beneficios?: string[];
}

export default function AuthShell({
  eyebrow,
  titulo,
  descripcion,
  children,
  footer,
  beneficios = [
    'Historial de cotizaciones y documentos',
    'Precios preferentes para empresas',
    'Seguimiento de tus pedidos en línea',
  ],
}: AuthShellProps) {
  return (
    <div className="relative min-h-[76vh] overflow-hidden bg-[#fbfaf7]">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-50 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-brand-700/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-navy-500/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 lg:grid-cols-2 lg:gap-14 lg:py-16">
        {/* Panel de marca */}
        <div className="hidden lg:block">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-700">
            <ArrowLeft className="h-3.5 w-3.5" /> Volver al inicio
          </Link>

          <span className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-brand-700/15 bg-white px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-brand-700 shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5" /> Área de clientes
          </span>
          <h2 className="mt-4 text-4xl font-extrabold leading-[1.1] text-navy-950">
            Tu obra, tus precios y tus documentos en un solo lugar.
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">
            Crea tu cuenta para guardar cotizaciones, descargar boletas y recibir atención preferente de
            nuestros ejecutivos.
          </p>

          <ul className="mt-6 space-y-2.5">
            {beneficios.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-sm text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {b}
              </li>
            ))}
          </ul>

          <div className="mt-8 overflow-hidden rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-extrabold text-navy-900">Datos protegidos</p>
                <p className="text-[11px] text-slate-500">
                  Usamos cifrado bcrypt y sesiones seguras. Nunca compartimos tus datos.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-3xl border border-black/[0.06] bg-white p-6 shadow-xl shadow-navy-900/5 sm:p-8">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-700">{eyebrow}</p>
            <h1 className="mt-1.5 text-2xl font-extrabold text-navy-950">{titulo}</h1>
            <p className="mt-1.5 text-sm text-slate-500">{descripcion}</p>

            <div className="mt-6">{children}</div>

            {footer && <div className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
