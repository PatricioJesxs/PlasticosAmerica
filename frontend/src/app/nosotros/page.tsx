import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Handshake,
  Heart,
  Leaf,
  MapPin,
  Package,
  ShieldCheck,
  Sparkles,
  Target,
  Truck,
  Users,
  Wrench,
} from 'lucide-react';
import Reveal from '@/components/Reveal';
import { CATEGORIAS, CATALOGO_COMPLETO } from '@/lib/catalogo';

export const metadata: Metadata = {
  title: 'Nosotros | 45 años abasteciendo a Chile',
  description:
    'Conoce la historia de Plásticos América, empresa chilena fundada en 1980, especializada en plásticos industriales, hidráulica, riego, embalaje y seguridad.',
};

const HITOS = [
  { anio: '1980', titulo: 'Nace Plásticos América', texto: 'Abrimos nuestras puertas en Santiago con una propuesta simple: plásticos de calidad y atención directa.' },
  { anio: '1995', titulo: 'Ampliación de líneas', texto: 'Incorporamos hidráulica PVC, riego y fitting para responder a la construcción y la agricultura.' },
  { anio: '2008', titulo: 'Doble sucursal', texto: 'Sumamos nuestro segundo punto de venta y estacionamiento para clientes en el centro de Santiago.' },
  { anio: '2020', titulo: 'Catálogo digital', texto: 'Digitalizamos el catálogo completo y comenzamos a recibir cotizaciones en línea.' },
  { anio: '2026', titulo: 'Nueva tienda online', texto: 'Lanzamos este sitio con más de 600 productos, todas sus medidas y cuenta de cliente.' },
];

const VALORES = [
  { icon: Handshake, titulo: 'Cercanía', texto: 'Atendemos persona a persona, con ejecutivos que conocen el rubro y responden rápido.' },
  { icon: BadgeCheck, titulo: 'Confiabilidad', texto: 'Stock permanente, marcas reconocidas y documentos tributarios en regla.' },
  { icon: Wrench, titulo: 'Asesoría técnica', texto: 'Te ayudamos a elegir material, presión y medida según tu proyecto.' },
  { icon: Leaf, titulo: 'Responsabilidad', texto: 'Impulsamos el uso eficiente del agua y soluciones duraderas en el tiempo.' },
];

const CIFRAS = [
  { valor: '1980', label: 'Año de fundación' },
  { valor: `${CATALOGO_COMPLETO.length}+`, label: 'Productos en catálogo' },
  { valor: `${CATEGORIAS.length}`, label: 'Líneas de producto' },
  { valor: '2', label: 'Sucursales en Santiago' },
];

export default function NosotrosPage() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative border-b border-black/5 bg-white">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-50 [mask-image:radial-gradient(ellipse_at_top,black_25%,transparent_70%)]" />
        <div className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-brand-700/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-9 px-4 py-12 lg:grid-cols-12 lg:py-16">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-700/15 bg-white px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-brand-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" /> Desde 1980
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-[1.08] text-navy-950 sm:text-5xl">
              Somos una empresa chilena de <span className="text-gradient">plásticos</span> para la industria y el hogar.
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-600">
              Llevamos más de cuatro décadas abasteciendo a constructoras, contratistas, agricultores,
              ferreterías y familias con tuberías, fitting, válvulas, mallas, embalaje y seguridad. Todo en un
              solo lugar, con asesoría real y despacho a todo Chile.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-700/20 transition hover:bg-brand-800"
              >
                Ver catálogo <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contacto"
                className="inline-flex items-center gap-2 rounded-xl border border-navy-900/15 bg-white px-5 py-3 text-sm font-bold text-navy-900 transition hover:bg-sand-50"
              >
                <MapPin className="h-4 w-4 text-brand-700" /> Visítanos
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-3xl border border-black/5 bg-navy-900 shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/categorias/linea-hidraulica-pvc.jpg" alt="Plásticos América" className="h-72 w-full object-cover opacity-80 sm:h-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-200">Casa matriz</p>
                <p className="mt-1 text-lg font-extrabold">Santa Elena 825 y 835</p>
                <p className="text-xs text-white/70">Santiago Centro · Chile</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 pb-10 sm:grid-cols-4">
          {CIFRAS.map((c) => (
            <div key={c.label} className="rounded-2xl border border-black/[0.06] bg-white p-4 text-center shadow-sm">
              <p className="text-2xl font-extrabold text-brand-700">{c.valor}</p>
              <p className="mt-0.5 text-[11px] font-semibold text-slate-500">{c.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Historia */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-700">Nuestra historia</p>
              <h2 className="mt-2 text-2xl font-extrabold leading-tight text-navy-950 sm:text-3xl">
                De un pequeño local a un catálogo de más de 600 productos
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Partimos en 1980 con lo esencial: cañerías, fitting y la convicción de que un buen servicio
                vale tanto como un buen producto. Con los años sumamos líneas, sucursales y tecnología, pero
                mantuvimos lo mismo: atención directa y soluciones que funcionan.
              </p>
              <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs leading-relaxed text-emerald-900">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <p>
                  <strong>Nuestro compromiso:</strong> que cada cliente encuentre la medida correcta, al precio
                  justo y con respaldo técnico.
                </p>
              </div>
            </div>

            <ol className="relative space-y-4 border-l-2 border-dashed border-brand-200 pl-6 lg:col-span-7">
              {HITOS.map((h) => (
                <li key={h.anio} className="relative">
                  <span className="absolute -left-[35px] grid h-6 w-6 place-items-center rounded-full bg-brand-700 text-[9px] font-extrabold text-white ring-4 ring-[#fbfaf7]">
                    ●
                  </span>
                  <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm transition hover:shadow-md">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-extrabold text-brand-700">{h.anio}</span>
                      <h3 className="text-sm font-extrabold text-navy-900">{h.titulo}</h3>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{h.texto}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </section>

      {/* Valores */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4">
          <Reveal>
            <div className="mb-7 max-w-2xl">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-700">Lo que nos define</p>
              <h2 className="mt-2 text-2xl font-extrabold text-navy-950 sm:text-3xl">Nuestros valores</h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VALORES.map(({ icon: Icon, titulo, texto }, i) => (
              <Reveal key={titulo} delay={i * 60}>
                <div className="group h-full rounded-2xl border border-black/[0.06] bg-sand-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-lg">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-brand-700 shadow-sm transition group-hover:bg-brand-700 group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-3 text-sm font-extrabold text-navy-900">{titulo}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{texto}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Misión / visión / clientes */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            {
              icon: Target,
              titulo: 'Misión',
              texto:
                'Facilitar el acceso a soluciones plásticas de calidad para la construcción, la industria, la agricultura y el hogar, con asesoría cercana y despacho confiable.',
            },
            {
              icon: Users,
              titulo: 'A quién atendemos',
              texto:
                'Constructora, contratista, maestro gasfiter, agricultor, ferretería, planta industrial y cliente particular que busca la medida exacta.',
            },
            {
              icon: Award,
              titulo: 'Por qué elegirnos',
              texto:
                'Stock permanente, más de 600 productos con todas sus medidas, dos sucursales con estacionamiento y boleta o factura electrónica al instante.',
            },
          ].map(({ icon: Icon, titulo, texto }) => (
            <div key={titulo} className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-sm">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-base font-extrabold text-navy-900">{titulo}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-navy-950 px-6 py-10 text-white sm:px-10">
            <div className="absolute inset-0 bg-grid opacity-[0.12]" />
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-700/30 blur-3xl" />
            <div className="relative grid items-center gap-6 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-200">
                  <Package className="h-3.5 w-3.5" /> 25 líneas disponibles
                </span>
                <h2 className="mt-3 text-2xl font-extrabold leading-tight sm:text-3xl">
                  Encuentra lo que necesitas en nuestro catálogo completo
                </h2>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/75">
                  {['Hidráulica PVC', 'PPR Fusión', 'HDPE', 'Cobre y bronce', 'Riego', 'Embalaje', 'Seguridad'].map((l) => (
                    <span key={l} className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> {l}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2.5 lg:col-span-4">
                <Link
                  href="/catalogo"
                  className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-extrabold text-navy-900 transition hover:bg-brand-50"
                >
                  Explorar catálogo <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/mayorista"
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  <Building2 className="h-4 w-4" /> Venta mayorista
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
