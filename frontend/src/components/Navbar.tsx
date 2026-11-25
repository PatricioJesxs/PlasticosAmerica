'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  Clock,
  FileText,
  LayoutGrid,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Package,
  Phone,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Truck,
  User,
  UserCircle,
  X,
} from 'lucide-react';
import { CATEGORIAS, GRUPOS, contarProductos, formatearCLP } from '@/lib/catalogo';
import { useQuote } from '@/lib/quote';
import { useAuth } from '@/lib/auth';

const NAV = [
  { nombre: 'Inicio', href: '/' },
  { nombre: 'Nosotros', href: '/nosotros' },
  { nombre: 'Catálogo', href: '/catalogo' },
  { nombre: 'Boleta Electrónica', href: '/boleta' },
  { nombre: 'Venta Mayorista', href: '/mayorista' },
  { nombre: 'Dirección', href: '/contacto' },
  { nombre: 'Cotizaciones', href: '/cotizacion' },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { count, abrir } = useQuote();
  const { user, loading, logout } = useAuth();

  const [mega, setMega] = useState(false);
  const [movil, setMovil] = useState(false);
  const [cuenta, setCuenta] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const cuentaRef = useRef<HTMLDivElement>(null);
  const megaTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMega(false);
    setMovil(false);
    setCuenta(false);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (cuentaRef.current && !cuentaRef.current.contains(e.target as Node)) setCuenta(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = movil ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [movil]);

  const buscador = (e: React.FormEvent) => {
    e.preventDefault();
    const q = busqueda.trim();
    setMega(false);
    setMovil(false);
    router.push(q ? `/catalogo?q=${encodeURIComponent(q)}` : '/catalogo');
  };

  const grupos = useMemo(
    () =>
      GRUPOS.map((grupo) => ({
        grupo,
        categorias: CATEGORIAS.filter((c) => c.grupo === grupo),
      })),
    []
  );

  const categoriaDestacada = CATEGORIAS.find((c) => c.destacada) ?? CATEGORIAS[0];

  return (
    <header
      className={`sticky top-0 z-50 transition-shadow duration-300 ${
        scrolled ? 'shadow-[0_10px_30px_-18px_rgba(13,35,58,0.45)]' : ''
      }`}
      onMouseLeave={() => setMega(false)}
    >
      {/* Barra superior institucional */}
      <div className="bg-navy-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-1.5 text-[11px]">
          <div className="flex items-center gap-4">
            <a href="tel:+56223386700" className="flex items-center gap-1.5 font-semibold transition hover:text-brand-200">
              <Phone className="h-3 w-3 text-brand-300" /> 22 338 6700
            </a>
            <span className="hidden items-center gap-1.5 text-white/60 md:flex">
              <MapPin className="h-3 w-3 text-brand-300" /> Santa Elena 825 y 835 · San Camilo 834, Santiago
            </span>
            <span className="hidden items-center gap-1.5 text-white/60 lg:flex">
              <Clock className="h-3 w-3 text-brand-300" /> Lun a Jue 8:00–17:30 · Vie 8:00–17:00
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1 text-emerald-300 sm:flex">
              <Truck className="h-3 w-3" /> Despacho a todo Chile
            </span>
            <Link
              href="/admin"
              className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 font-semibold text-white/90 transition hover:bg-white/20"
            >
              <ShieldCheck className="h-3 w-3 text-emerald-300" /> Trabajadores
            </Link>
          </div>
        </div>
      </div>

      {/* Barra principal */}
      <div className={`border-b border-black/[0.06] bg-white/95 backdrop-blur-lg transition-all ${scrolled ? 'py-1.5' : 'py-2.5'}`}>
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4">
          <button
            type="button"
            onClick={() => setMovil(true)}
            className="rounded-xl p-2 text-navy-900 transition hover:bg-sand-100 lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link href="/" className="group flex shrink-0 items-center gap-2" aria-label="Plásticos América, inicio">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Plásticos América Chile"
              className={`w-auto object-contain transition-all duration-300 group-hover:scale-[1.03] ${
                scrolled ? 'h-10' : 'h-12 sm:h-14'
              }`}
            />
          </Link>

          <button
            type="button"
            onMouseEnter={() => setMega(true)}
            onClick={() => setMega((v) => !v)}
            className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-navy-900 transition hover:border-brand-700/30 hover:bg-brand-50 lg:flex"
            aria-expanded={mega}
          >
            <LayoutGrid className="h-4 w-4 text-brand-700" />
            Productos
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${mega ? 'rotate-180' : ''}`} />
          </button>

          <form onSubmit={buscador} className="relative hidden flex-1 md:block" role="search">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              type="search"
              placeholder="Busca por producto, medida o código SKU…"
              className="w-full rounded-xl border border-slate-200 bg-sand-50 py-2.5 pl-11 pr-24 text-sm outline-none transition focus:border-brand-700/50 focus:bg-white focus:ring-4 focus:ring-brand-700/10"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-navy-900 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-brand-700"
            >
              Buscar
            </button>
          </form>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <div className="relative" ref={cuentaRef}>
              <button
                type="button"
                onClick={() => setCuenta((v) => !v)}
                className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-sand-100 sm:px-2.5"
                aria-expanded={cuenta}
              >
                {user?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar_url} alt={user.nombre} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-sand-100 text-navy-800">
                    <User className="h-5 w-5" />
                  </span>
                )}
                <span className="hidden text-left leading-tight xl:block">
                  <span className="block text-[10px] text-slate-500">
                    {loading ? 'Cargando…' : user ? 'Bienvenido' : 'Hola, ingresa'}
                  </span>
                  <span className="block max-w-[120px] truncate text-[12px] font-bold text-navy-900">
                    {user ? user.nombre.split(' ')[0] : 'Mi cuenta'}
                  </span>
                </span>
                <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 xl:block" />
              </button>

              {cuenta && (
                <div className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-2xl animate-scale-in">
                  {user ? (
                    <>
                      <div className="border-b border-slate-100 bg-sand-50 px-4 py-3">
                        <p className="truncate text-sm font-bold text-navy-900">{user.nombre}</p>
                        <p className="truncate text-xs text-slate-500">{user.email}</p>
                        <span className="mt-1.5 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700">
                          {user.role}
                        </span>
                      </div>
                      <div className="p-1.5">
                        <Link href="/cuenta" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-sand-100">
                          <UserCircle className="h-4 w-4 text-brand-700" /> Mi cuenta
                        </Link>
                        <Link href="/cuenta#cotizaciones" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-sand-100">
                          <FileText className="h-4 w-4 text-brand-700" /> Mis cotizaciones
                        </Link>
                        {(user.role === 'ADMIN' || user.role === 'VENDEDOR') && (
                          <Link href="/admin" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50">
                            <ShieldCheck className="h-4 w-4" /> Panel de administración
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            logout();
                            setCuenta(false);
                            router.push('/');
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700"
                        >
                          <LogOut className="h-4 w-4" /> Cerrar sesión
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-4">
                      <p className="text-sm font-bold text-navy-900">Accede a tu cuenta</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Revisa tus cotizaciones, boletas y datos de empresa.
                      </p>
                      <div className="mt-3 grid gap-2">
                        <Link href="/login" className="rounded-lg bg-brand-700 px-3 py-2 text-center text-xs font-bold text-white hover:bg-brand-800">
                          Iniciar sesión
                        </Link>
                        <Link href="/registro" className="rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-bold text-navy-900 hover:bg-sand-50">
                          Crear cuenta
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={abrir}
              className="relative flex items-center gap-2 rounded-xl bg-brand-700 px-3 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-800 active:scale-[0.98] sm:px-4"
              aria-label="Abrir cotización"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden sm:inline">Cotizar</span>
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[10px] font-extrabold text-brand-700">
                {count}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Navegación horizontal */}
      <nav className="hidden border-b border-black/[0.05] bg-white lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4">
          <ul className="flex items-center gap-1 text-[12.5px] font-semibold">
            {NAV.map((item) => {
              const activo = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`relative block px-3 py-3 transition-colors ${
                      activo ? 'text-brand-700' : 'text-slate-600 hover:text-brand-700'
                    }`}
                  >
                    {item.nombre}
                    <span
                      className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-brand-700 transition-transform duration-300 ${
                        activo ? 'scale-x-100' : 'scale-x-0'
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Mega menú de categorías */}
      {mega && (
        <div
          className="absolute inset-x-0 top-full hidden border-b border-black/5 bg-white shadow-2xl lg:block animate-fade-in"
          onMouseEnter={() => {
            if (megaTimer.current) clearTimeout(megaTimer.current);
          }}
        >
          <div className="mx-auto grid max-w-7xl grid-cols-12 gap-6 px-4 py-7">
            <div className="col-span-9 grid grid-cols-3 gap-x-6 gap-y-7">
              {grupos.map(({ grupo, categorias }) => (
                <div key={grupo}>
                  <p className="mb-2.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-brand-700">
                    {grupo}
                  </p>
                  <ul className="space-y-1">
                    {categorias.map((cat) => (
                      <li key={cat.slug}>
                        <Link
                          href={`/catalogo?categoria=${cat.slug}`}
                          className="group flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-[12.5px] font-medium text-slate-600 transition hover:bg-brand-50 hover:text-brand-700"
                        >
                          <span className="line-clamp-1">{cat.nombre}</span>
                          <span className="text-[10px] font-bold text-slate-400 group-hover:text-brand-500">
                            {contarProductos(cat.slug)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="col-span-3">
              <Link
                href="/catalogo"
                className="group relative block h-full overflow-hidden rounded-2xl bg-navy-900 p-5 text-white"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={categoriaDestacada.imagen}
                  alt="Catálogo Plásticos América"
                  className="absolute inset-0 h-full w-full object-cover opacity-35 transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/60 to-transparent" />
                <div className="relative flex h-full min-h-[220px] flex-col justify-end">
                  <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold backdrop-blur">
                    <Sparkles className="h-3 w-3 text-amber-300" /> Catálogo completo
                  </span>
                  <h3 className="text-lg font-extrabold leading-tight">
                    {CATEGORIAS.reduce((a, c) => a + contarProductos(c.slug), 0)}+ productos y medidas
                  </h3>
                  <p className="mt-1 text-xs text-white/70">
                    Encuentra la medida exacta y cotiza en línea.
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-white">
                    Ver catálogo <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Buscador móvil */}
      <div className="border-b border-black/5 bg-white px-4 pb-2.5 md:hidden">
        <form onSubmit={buscador} className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            type="search"
            placeholder="Buscar productos, medidas o SKU…"
            className="w-full rounded-xl border border-slate-200 bg-sand-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-700/50 focus:bg-white"
          />
        </form>
      </div>

      {/* Menú móvil */}
      {movil && (
        <div className="fixed inset-0 z-[100] lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-[2px] animate-fade-in" onClick={() => setMovil(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-white shadow-2xl animate-slide-in">
            <div className="flex items-center justify-between bg-navy-950 px-4 py-3.5 text-white">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="Plásticos América" className="h-9 w-auto rounded bg-white p-0.5" />
                <span className="text-sm font-bold">Menú</span>
              </div>
              <button type="button" onClick={() => setMovil(false)} className="rounded-full p-2 hover:bg-white/10" aria-label="Cerrar menú">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="border-b border-slate-100 p-4">
                <form onSubmit={buscador} className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar en el catálogo…"
                    className="w-full rounded-xl border border-slate-200 bg-sand-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand-700/50"
                  />
                </form>
              </div>

              <nav className="p-3">
                <ul className="space-y-0.5">
                  {NAV.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700"
                      >
                        {item.nombre}
                        <ArrowRight className="h-4 w-4 text-slate-300" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="border-t border-slate-100 p-3">
                <p className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                  Líneas de producto
                </p>
                <div className="mt-1 space-y-1">
                  {grupos.map(({ grupo, categorias }) => (
                    <details key={grupo} className="group rounded-xl open:bg-sand-50">
                      <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2.5 text-sm font-bold text-navy-900">
                        {grupo}
                        <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
                      </summary>
                      <ul className="pb-2">
                        {categorias.map((cat) => (
                          <li key={cat.slug}>
                            <Link
                              href={`/catalogo?categoria=${cat.slug}`}
                              className="flex items-center justify-between rounded-lg py-2 pl-6 pr-3 text-[13px] text-slate-600 hover:text-brand-700"
                            >
                              <span>{cat.nombre}</span>
                              <span className="text-[10px] text-slate-400">{contarProductos(cat.slug)}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </details>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 bg-sand-50 p-4">
              {user ? (
                <Link href="/cuenta" className="flex items-center justify-center gap-2 rounded-xl bg-navy-900 py-2.5 text-sm font-bold text-white">
                  <UserCircle className="h-4 w-4" /> Mi cuenta
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/login" className="rounded-xl border border-slate-200 bg-white py-2.5 text-center text-sm font-bold text-navy-900">
                    Ingresar
                  </Link>
                  <Link href="/registro" className="rounded-xl bg-brand-700 py-2.5 text-center text-sm font-bold text-white">
                    Crear cuenta
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
