import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  Building2,
  Car,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  MapPin,
  Package,
  Phone,
  Ruler,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
  Wrench,
} from 'lucide-react';
import Reveal from '@/components/Reveal';
import FeaturedProducts from '@/components/FeaturedProducts';
import CategoryCard from '@/components/CategoryCard';
import { CATEGORIAS, CATALOGO_COMPLETO, contarProductos } from '@/lib/catalogo';

const LINEAS_DESTACADAS = CATEGORIAS.filter((c) => c.destacada).sort((a, b) => a.orden - b.orden);
const TOTAL_PRODUCTOS = CATALOGO_COMPLETO.length;

const MEDIDAS_RAPIDAS = ['20 mm', '25 mm', '32 mm', '1/2"', '3/4"', '110 mm', '160 mm', '2"'];

const ACCESOS = [
  {
    href: '/catalogo',
    titulo: 'Catálogo online',
    texto: `${TOTAL_PRODUCTOS} productos con todas sus medidas y precios netos.`,
    icon: BookOpen,
    color: 'bg-brand-50 text-brand-700',
  },
  {
    href: '/boleta',
    titulo: 'Boleta electrónica',
    texto: 'Descarga tus documentos tributarios de forma rápida y segura.',
    icon: FileText,
    color: 'bg-navy-50 text-navy-800',
  },
  {
    href: '/mayorista',
    titulo: 'Venta mayorista',
    texto: 'Precios preferentes y atención dedicada para empresas.',
    icon: Building2,
    color: 'bg-emerald-50 text-emerald-700',
  },
  {
    href: '/contacto',
    titulo: 'Dirección y horarios',
    texto: 'Casa matriz Santa Elena y sucursal San Camilo, Santiago.',
    icon: MapPin,
    color: 'bg-amber-50 text-amber-700',
  },
];

const BENEFICIOS = [
  {
    icon: Package,
    titulo: 'Stock permanente',
    texto: 'Reposición continua en las líneas de mayor rotación para tu obra.',
  },
  {
    icon: Wrench,
    titulo: 'Asesoría técnica',
    texto: 'Te ayudamos a elegir la medida, presión y material correcto.',
  },
  {
    icon: Truck,
    titulo: 'Retiro o despacho',
    texto: 'Retira en Santiago o coordinamos despacho a todo Chile.',
  },
  {
    icon: BadgeCheck,
    titulo: 'Respaldo desde 1980',
    texto: 'Más de cuatro décadas abasteciendo a la industria y el hogar.',
  },
];

export default function HomePage() {
  const anios = new Date().getFullYear() - 1980;

  return (
    <div className="overflow-hidden">
      {/* ================= HERO ================= */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_75%)]" />
        <div className="pointer-events-none absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-brand-700/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-20 h-[360px] w-[360px] rounded-full bg-navy-500/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-6 pt-10 lg:grid-cols-12 lg:gap-8 lg:pb-16 lg:pt-16">
          <div className="lg:col-span-6">
            <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-brand-700/15 bg-white/80 px-3.5 py-1.5 text-[11px] font-bold text-brand-700 shadow-sm backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Desde 1980 · Santiago de Chile
            </span>

            <h1 className="animate-fade-up delay-75 mt-5 text-[2.35rem] font-extrabold leading-[1.05] tracking-tight text-navy-950 sm:text-5xl lg:text-[3.4rem]">
              Todo en <span className="text-gradient">plásticos</span>,
              <br className="hidden sm:block" /> hidráulica y riego
              <br className="hidden sm:block" /> para tu obra.
            </h1>

            <p className="animate-fade-up delay-150 mt-5 max-w-xl text-[15px] leading-relaxed text-slate-600">
              Tuberías, fitting, válvulas, mallas, embalaje y seguridad. Encuentra la medida exacta
              en nuestro catálogo y cotiza en línea en minutos.
            </p>

            <div className="animate-fade-up delay-200 mt-7 flex flex-wrap gap-3">
              <Link
                href="/catalogo"
                className="group inline-flex items-center gap-2 rounded-xl bg-brand-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-700/25 transition hover:-translate-y-0.5 hover:bg-brand-800 hover:shadow-xl"
              >
                <Search className="h-4 w-4" /> Explorar catálogo
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/cotizacion"
                className="inline-flex items-center gap-2 rounded-xl border border-navy-900/15 bg-white px-6 py-3.5 text-sm font-bold text-navy-900 shadow-sm transition hover:-translate-y-0.5 hover:border-navy-900/30 hover:bg-sand-50"
              >
                <FileText className="h-4 w-4 text-brand-700" /> Cotizar por mayor
              </Link>
            </div>

            <div className="animate-fade-up delay-300 mt-8 grid max-w-lg grid-cols-3 gap-3">
              {[
                { valor: `${TOTAL_PRODUCTOS}+`, label: 'productos' },
                { valor: '25', label: 'líneas' },
                { valor: `${anios}`, label: 'años de experiencia' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-black/5 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
                  <p className="text-xl font-extrabold text-navy-900">{stat.valor}</p>
                  <p className="text-[11px] font-medium text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative lg:col-span-6">
            <div className="animate-scale-in relative mx-auto max-w-xl">
              <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-tr from-brand-700/12 via-transparent to-navy-500/15 blur-xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-black/5 bg-white p-2 shadow-2xl">
                <div className="relative overflow-hidden rounded-[1.6rem]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/categorias/linea-hidraulica-pvc.jpg"
                    alt="Fitting y tuberías de PVC hidráulico"
                    className="h-[330px] w-full object-cover sm:h-[430px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/75 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
                      Línea más cotizada
                    </span>
                    <h2 className="mt-2 text-xl font-extrabold text-white">Hidráulica PVC</h2>
                    <p className="text-xs text-white/75">Fitting y tubería de presión de 20 a 315 mm.</p>
                    <Link
                      href="/catalogo?categoria=linea-hidraulica"
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-[11px] font-extrabold text-navy-900 transition hover:bg-brand-50"
                    >
                      Ver línea completa <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="animate-float absolute -left-3 top-8 hidden rounded-2xl border border-black/5 bg-white/95 p-3.5 shadow-xl backdrop-blur sm:block">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Car className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[11px] font-extrabold text-navy-900">Estacionamiento gratis</p>
                    <p className="text-[10px] text-slate-500">2 accesos en el centro</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-2 hidden rounded-2xl border border-black/5 bg-white/95 p-3.5 shadow-xl backdrop-blur sm:block">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-700">
                    <Truck className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[11px] font-extrabold text-navy-900">Despacho a todo Chile</p>
                    <p className="text-[10px] text-slate-500">Retiro en Santiago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Accesos rápidos */}
        <div className="relative mx-auto max-w-7xl px-4 pb-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ACCESOS.map(({ href, titulo, texto, icon: Icon, color }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-start gap-3 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-700/20 hover:shadow-lg"
              >
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${color}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1 text-sm font-extrabold text-navy-900">
                    {titulo}
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-700" />
                  </p>
                  <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">{texto}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================= BUSCADOR POR MEDIDA ================= */}
      <section className="mx-auto max-w-7xl px-4 pt-8">
        <div className="relative overflow-hidden rounded-2xl border border-navy-900/10 bg-navy-900 px-5 py-5 text-white sm:px-7">
          <div className="absolute inset-0 bg-radial-brand opacity-80" />
          <div className="relative flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10">
                <Ruler className="h-5 w-5 text-brand-200" />
              </span>
              <div>
                <p className="text-sm font-extrabold">¿Buscas una medida específica?</p>
                <p className="text-xs text-white/60">Filtra el catálogo por diámetro o pulgadas.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {MEDIDAS_RAPIDAS.map((m) => (
                <Link
                  key={m}
                  href={`/catalogo?q=${encodeURIComponent(m)}`}
                  className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-white/90 transition hover:border-white/40 hover:bg-white hover:text-navy-900"
                >
                  {m}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= PRODUCTOS DESTACADOS ================= */}
      <Reveal>
        <FeaturedProducts />
      </Reveal>

      {/* ================= LÍNEAS DESTACADAS ================= */}
      <section id="lineas" className="mx-auto max-w-7xl px-4 pt-16 sm:pt-20">
        <Reveal>
          <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-700 text-white shadow-lg shadow-brand-700/25">
                <ArrowRight className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-2xl font-extrabold uppercase tracking-tight text-navy-900 sm:text-3xl">
                  Línea de productos destacados
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Selecciona una familia para ver todas sus medidas y precios disponibles.
                </p>
              </div>
            </div>
            <Link
              href="/catalogo"
              className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-brand-700 hover:underline"
            >
              Ver las 25 líneas <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LINEAS_DESTACADAS.map((cat, i) => (
            <Reveal key={cat.slug} delay={Math.min(i, 8) * 60}>
              <CategoryCard
                nombre={cat.nombre}
                slug={cat.slug}
                imagen={cat.imagen}
                cantidad={contarProductos(cat.slug)}
                descripcion={cat.descripcion}
                index={i}
              />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= BENEFICIOS ================= */}
      <section className="mx-auto max-w-7xl px-4 pt-16 sm:pt-20">
        <Reveal>
          <div className="rounded-3xl border border-black/[0.06] bg-white p-6 shadow-sm sm:p-9">
            <div className="mb-7 max-w-2xl">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-700">
                Por qué elegirnos
              </p>
              <h2 className="mt-1.5 text-2xl font-extrabold text-navy-900 sm:text-3xl">
                La logística y el respaldo que tu proyecto necesita
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {BENEFICIOS.map(({ icon: Icon, titulo, texto }, i) => (
                <div key={titulo} className="group relative rounded-2xl bg-sand-50 p-5 transition hover:bg-white hover:shadow-md">
                  <span className="absolute right-4 top-4 text-3xl font-black text-navy-900/5">
                    0{i + 1}
                  </span>
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-brand-700 shadow-sm transition group-hover:bg-brand-700 group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-3 text-sm font-extrabold text-navy-900">{titulo}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{texto}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ================= CTA MAYORISTA ================= */}
      <section className="mx-auto max-w-7xl px-4 pt-16 sm:pt-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-navy-950 px-6 py-9 text-white sm:px-10 sm:py-12">
            <div className="absolute inset-0 bg-grid opacity-[0.12]" />
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-700/30 blur-3xl" />
            <div className="relative grid items-center gap-7 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-200">
                  <Store className="h-3.5 w-3.5" /> Venta mayorista
                </span>
                <h2 className="mt-4 text-2xl font-extrabold leading-tight sm:text-4xl">
                  Compra por volumen con atención preferente
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70">
                  Empresas constructoras, contratistas, agricultores y ferreterías: cotizamos
                  proyectos completos, con precios por volumen y coordinación de despacho.
                </p>
                <div className="mt-5 flex flex-wrap gap-4 text-xs text-white/80">
                  {['Ejecutivo dedicado', 'Precios por volumen', 'Factura electrónica', 'Despacho programado'].map((b) => (
                    <span key={b} className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" /> {b}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2.5 lg:col-span-4">
                <Link
                  href="/mayorista"
                  className="group flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-extrabold text-navy-900 transition hover:bg-brand-50"
                >
                  Quiero ser mayorista
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href="https://wa.me/56223386700"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  <Phone className="h-4 w-4" /> Hablar con un ejecutivo
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ================= UBICACIÓN Y PAGOS ================= */}
      <section id="ubicacion" className="mx-auto max-w-7xl px-4 pt-16 sm:pt-20">
        <Reveal>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-sm">
              <div className="p-6 sm:p-7">
                <div className="flex items-center gap-2 text-brand-700">
                  <MapPin className="h-5 w-5" />
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.18em]">Visítanos</span>
                </div>
                <h2 className="mt-2 text-2xl font-extrabold text-navy-900">Dos sucursales en Santiago</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-sand-50 p-4">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-brand-700">Casa Matriz</p>
                    <p className="mt-1 text-sm font-bold text-navy-900">Santa Elena 825 y 835</p>
                    <p className="text-xs text-slate-500">Santiago Centro</p>
                  </div>
                  <div className="rounded-2xl bg-sand-50 p-4">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-brand-700">Sucursal</p>
                    <p className="mt-1 text-sm font-bold text-navy-900">San Camilo 834</p>
                    <p className="text-xs text-slate-500">Santiago Centro</p>
                  </div>
                </div>
                <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900">
                  <Car className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <p>
                    <strong>Estacionamiento exclusivo para clientes, sin costo.</strong> Entrada y
                    salida por Santa Elena y San Camilo.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-600">
                  <Clock className="h-4 w-4 text-brand-700" /> Lun a Jue 8:00–17:30 · Vie 8:00–17:00
                </div>
                <Link
                  href="/contacto"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-navy-900 px-5 py-3 text-xs font-bold text-white transition hover:bg-brand-700"
                >
                  Ver cómo llegar <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div className="rounded-3xl border border-black/[0.06] bg-white p-6 shadow-sm sm:p-7">
                <div className="flex items-center gap-2 text-brand-700">
                  <CreditCard className="h-5 w-5" />
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.18em]">Pagos</span>
                </div>
                <h2 className="mt-2 text-xl font-extrabold text-navy-900">Medios de pago aceptados</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Presencial o transferencia electrónica corporativa.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-lg bg-blue-900 px-3 py-2 text-[11px] font-extrabold text-white">VISA</span>
                  <span className="rounded-lg bg-red-600 px-3 py-2 text-[11px] font-extrabold text-white">MasterCard</span>
                  <span className="rounded-lg bg-emerald-700 px-3 py-2 text-[11px] font-extrabold text-white">Redcompra</span>
                  <span className="rounded-lg bg-slate-700 px-3 py-2 text-[11px] font-extrabold text-white">Transferencia</span>
                  <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-extrabold text-slate-700">Efectivo</span>
                </div>
              </div>

              <div className="flex-1 overflow-hidden rounded-3xl border border-black/[0.06] bg-navy-900 p-6 text-white shadow-sm sm:p-7">
                <div className="flex items-center gap-2 text-brand-200">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.18em]">Compra protegida</span>
                </div>
                <h2 className="mt-2 text-xl font-extrabold">Boleta y factura electrónica</h2>
                <p className="mt-1 text-xs leading-relaxed text-white/65">
                  Emitimos documentos tributarios en cada compra. Descarga tus boletas cuando quieras
                  desde el portal.
                </p>
                <Link
                  href="/boleta"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-navy-900 transition hover:bg-brand-50"
                >
                  <FileText className="h-4 w-4 text-brand-700" /> Consultar boleta
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ================= MAPA ================= */}
      <section className="mx-auto max-w-7xl px-4 pt-10">
        <Reveal>
          <div className="overflow-hidden rounded-3xl border border-black/[0.06] shadow-sm">
            <iframe
              title="Ubicación de Plásticos América en Santiago"
              src="https://www.google.com/maps?q=Santa+Elena+825,+Santiago,+Chile&output=embed"
              className="h-[320px] w-full sm:h-[380px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </Reveal>
      </section>
    </div>
  );
}
