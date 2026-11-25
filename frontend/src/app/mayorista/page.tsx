import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileText,
  Handshake,
  Package,
  Percent,
  Phone,
  Truck,
  Users,
} from 'lucide-react';
import Reveal from '@/components/Reveal';

export const metadata: Metadata = {
  title: 'Venta mayorista',
  description:
    'Precios preferentes, ejecutivo dedicado y despacho programado para empresas, constructoras, ferreterías y agricultores. Solicita tu cuenta mayorista en Plásticos América.',
};

const BENEFICIOS = [
  { icon: Percent, titulo: 'Precios por volumen', texto: 'Condiciones especiales según volumen y frecuencia de compra.' },
  { icon: Users, titulo: 'Ejecutivo dedicado', texto: 'Un contacto directo que conoce tu empresa y tus proyectos.' },
  { icon: ClipboardList, titulo: 'Cotización de proyectos', texto: 'Listas completas de materiales para licitaciones y obras.' },
  { icon: Truck, titulo: 'Despacho programado', texto: 'Coordinamos entregas por etapa o retiro en sucursal.' },
  { icon: FileText, titulo: 'Factura electrónica', texto: 'Documentos tributarios al día y con plazo según evaluación.' },
  { icon: CreditCard, titulo: 'Condiciones de pago', texto: 'Posibilidad de línea de crédito para clientes recurrentes.' },
];

const PASOS = [
  { n: '01', titulo: 'Completa el formulario', texto: 'Cuéntanos tu rubro, RUT de empresa y los productos que compras habitualmente.' },
  { n: '02', titulo: 'Evaluamos tu cuenta', texto: 'Revisamos volumen y frecuencia para asignarte una lista de precios mayorista.' },
  { n: '03', titulo: 'Recibe tu ejecutivo', texto: 'Te presentamos a tu vendedor y activamos tu cuenta con acceso preferente.' },
];

const CLIENTES = [
  'Constructoras y contratistas',
  'Ferreterías y distribuidores',
  'Agricultores y agroindustria',
  'Plantas industriales y mineras',
  'Municipalidades y organismos',
  'Instaladores y gasfíteres',
];

export default function MayoristaPage() {
  return (
    <div className="overflow-hidden">
      <section className="relative border-b border-black/5 bg-white">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-50 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
        <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-brand-700/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-9 px-4 py-12 lg:grid-cols-12 lg:py-16">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-700/15 bg-white px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-brand-700 shadow-sm">
              <Building2 className="h-3.5 w-3.5" /> Cuenta mayorista
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-[1.08] text-navy-950 sm:text-5xl">
              Compra por volumen con <span className="text-gradient">precios preferentes</span>
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-600">
              Atendemos a empresas que necesitan abastecimiento constante, cotizaciones de proyectos completos y
              un ejecutivo que responda rápido. Solicita tu cuenta y accede a condiciones hechas a tu medida.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/cotizacion"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-700/20 transition hover:bg-brand-800"
              >
                Solicitar evaluación <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="tel:+56223386700"
                className="inline-flex items-center gap-2 rounded-xl border border-navy-900/15 bg-white px-5 py-3 text-sm font-bold text-navy-900 transition hover:bg-sand-50"
              >
                <Phone className="h-4 w-4 text-brand-700" /> 22 338 6700
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-black/[0.06] bg-white p-6 shadow-xl">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-700">Ideal para</p>
              <ul className="mt-3 grid gap-2">
                {CLIENTES.map((c) => (
                  <li key={c} className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <Reveal>
          <div className="mb-7 max-w-2xl">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-700">Beneficios</p>
            <h2 className="mt-2 text-2xl font-extrabold text-navy-950 sm:text-3xl">Por qué comprar como empresa</h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFICIOS.map(({ icon: Icon, titulo, texto }, i) => (
            <Reveal key={titulo} delay={i * 50}>
              <div className="h-full rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3 text-sm font-extrabold text-navy-900">{titulo}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{texto}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4">
          <Reveal>
            <div className="mb-8 max-w-2xl">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-700">Cómo funciona</p>
              <h2 className="mt-2 text-2xl font-extrabold text-navy-950 sm:text-3xl">Tres pasos para activar tu cuenta</h2>
            </div>
          </Reveal>
          <div className="grid gap-4 lg:grid-cols-3">
            {PASOS.map((p, i) => (
              <Reveal key={p.n} delay={i * 70}>
                <div className="relative h-full overflow-hidden rounded-2xl bg-sand-50 p-6">
                  <span className="absolute -right-2 -top-3 text-6xl font-black text-navy-900/5">{p.n}</span>
                  <span className="relative grid h-9 w-9 place-items-center rounded-lg bg-brand-700 text-xs font-extrabold text-white">
                    {p.n}
                  </span>
                  <h3 className="relative mt-3 text-base font-extrabold text-navy-900">{p.titulo}</h3>
                  <p className="relative mt-1.5 text-xs leading-relaxed text-slate-600">{p.texto}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-brand-200 bg-brand-50 p-5 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-brand-700 shadow-sm">
                <Handshake className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-extrabold text-navy-900">¿Listo para cotizar como mayorista?</p>
                <p className="mt-0.5 text-xs text-slate-600">
                  Envíanos tu lista de materiales y te respondemos con precios por volumen.
                </p>
              </div>
            </div>
            <div className="flex w-full gap-2 sm:w-auto">
              <Link
                href="/cotizacion"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-brand-800 sm:flex-none"
              >
                <Package className="h-4 w-4" /> Cotizar proyecto
              </Link>
              <a
                href="mailto:ventas@plasticosamerica.cl"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-navy-900 hover:bg-sand-50 sm:flex-none"
              >
                Escribir
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
