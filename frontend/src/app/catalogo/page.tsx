'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Filter,
  LayoutGrid,
  PackageSearch,
  Search,
  SlidersHorizontal,
  Tag,
  X,
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { CATEGORIAS, CATALOGO_COMPLETO, GRUPOS, contarProductos } from '@/lib/catalogo';

const POR_PAGINA = 24;

type Orden = 'relevancia' | 'precio_asc' | 'precio_desc' | 'nombre';

const ORDENES: { id: Orden; nombre: string }[] = [
  { id: 'relevancia', nombre: 'Relevancia' },
  { id: 'precio_asc', nombre: 'Menor precio' },
  { id: 'precio_desc', nombre: 'Mayor precio' },
  { id: 'nombre', nombre: 'Nombre A-Z' },
];

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function CatalogoContenido() {
  const searchParams = useSearchParams();
  const categoriaUrl = searchParams.get('categoria') ?? '';
  const qUrl = searchParams.get('q') ?? '';

  const [busqueda, setBusqueda] = useState(qUrl);
  const [categoria, setCategoria] = useState(categoriaUrl);
  const [grupo, setGrupo] = useState<string>('todos');
  const [orden, setOrden] = useState<Orden>('relevancia');
  const [soloOfertas, setSoloOfertas] = useState(false);
  const [visibles, setVisibles] = useState(POR_PAGINA);
  const [filtrosMovil, setFiltrosMovil] = useState(false);

  useEffect(() => {
    setCategoria(categoriaUrl);
    setBusqueda(qUrl);
    setVisibles(POR_PAGINA);
  }, [categoriaUrl, qUrl]);

  const categoriasFiltradas = useMemo(
    () => (grupo === 'todos' ? CATEGORIAS : CATEGORIAS.filter((c) => c.grupo === grupo)),
    [grupo]
  );

  const resultados = useMemo(() => {
    const terminos = normalizar(busqueda.trim()).split(/\s+/).filter(Boolean);

    const filtrados = CATALOGO_COMPLETO.filter((p) => {
      if (categoria && p.categoriaSlug !== categoria) return false;
      if (grupo !== 'todos') {
        const cat = CATEGORIAS.find((c) => c.slug === p.categoriaSlug);
        if (cat?.grupo !== grupo) return false;
      }
      if (soloOfertas && !p.variantes.some((v) => v.precioAnterior)) return false;
      if (terminos.length === 0) return true;

      const texto = normalizar(
        [p.nombre, p.categoriaNombre, p.descripcion ?? '', ...p.variantes.map((v) => `${v.medida} ${v.sku}`)].join(' ')
      );
      return terminos.every((t) => texto.includes(t));
    });

    const precioDe = (id: string) => {
      const p = filtrados.find((x) => x.id === id);
      return p ? Math.min(...p.variantes.map((v) => v.precio)) : 0;
    };

    if (orden === 'precio_asc') return [...filtrados].sort((a, b) => precioDe(a.id) - precioDe(b.id));
    if (orden === 'precio_desc') return [...filtrados].sort((a, b) => precioDe(b.id) - precioDe(a.id));
    if (orden === 'nombre') return [...filtrados].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    return filtrados;
  }, [busqueda, categoria, grupo, orden, soloOfertas]);

  const catActiva = CATEGORIAS.find((c) => c.slug === categoria);
  const mostrados = resultados.slice(0, visibles);

  const limpiar = () => {
    setBusqueda('');
    setCategoria('');
    setGrupo('todos');
    setSoloOfertas(false);
    setVisibles(POR_PAGINA);
  };

  const hayFiltros = Boolean(busqueda || categoria || grupo !== 'todos' || soloOfertas);

  return (
    <div className="bg-[#fbfaf7]">
      {/* Encabezado */}
      <section className="relative overflow-hidden border-b border-black/5 bg-white">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-50 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:py-10">
          <nav className="mb-4 flex flex-wrap items-center gap-1 text-[11px] text-slate-500">
            <Link href="/" className="hover:text-brand-700">
              Inicio
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/catalogo" className="hover:text-brand-700">
              Catálogo
            </Link>
            {catActiva && (
              <>
                <ChevronRight className="h-3 w-3" />
                <span className="font-semibold text-navy-900">{catActiva.nombre}</span>
              </>
            )}
          </nav>

          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-brand-700">
                <LayoutGrid className="h-3 w-3" /> Catálogo 2026
              </span>
              <h1 className="mt-3 text-2xl font-extrabold leading-tight text-navy-950 sm:text-4xl">
                {catActiva ? catActiva.nombre : 'Todos nuestros productos'}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                {catActiva
                  ? catActiva.descripcion
                  : 'Explora las 25 líneas y más de 600 productos con todas sus medidas. Selecciona una medida y agrégala a tu cotización.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setFiltrosMovil(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-brand-700 lg:hidden"
              >
                <Filter className="h-4 w-4" /> Filtros
              </button>
            </div>
          </div>

          {/* Buscador */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
              <input
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setVisibles(POR_PAGINA);
                }}
                type="search"
                placeholder="Busca por producto, medida (20 mm, 1/2&quot;) o SKU…"
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-10 text-sm shadow-sm outline-none transition focus:border-brand-700/50 focus:ring-4 focus:ring-brand-700/10"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="orden" className="sr-only">
                Ordenar por
              </label>
              <div className="relative">
                <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  id="orden"
                  value={orden}
                  onChange={(e) => setOrden(e.target.value as Orden)}
                  className="appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-9 text-xs font-bold text-navy-900 shadow-sm outline-none transition focus:border-brand-700/50"
                >
                  {ORDENES.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Chips rápidos */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setCategoria('')}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-bold transition ${
                !categoria ? 'bg-brand-700 text-white shadow' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-sand-100'
              }`}
            >
              Todas las líneas
            </button>
            {CATEGORIAS.filter((c) => c.destacada)
              .sort((a, b) => a.orden - b.orden)
              .map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => {
                    setCategoria(c.slug === categoria ? '' : c.slug);
                    setVisibles(POR_PAGINA);
                  }}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-bold transition ${
                    categoria === c.slug
                      ? 'bg-brand-700 text-white shadow'
                      : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-sand-100'
                  }`}
                >
                  {c.nombreCorto ?? c.nombre}
                </button>
              ))}
            <button
              type="button"
              onClick={() => setSoloOfertas((v) => !v)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-bold transition ${
                soloOfertas ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-sand-100'
              }`}
            >
              <Tag className="mr-1 inline h-3 w-3" /> Ofertas
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-7xl gap-7 px-4 py-8">
        {/* Sidebar desktop */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-36 space-y-5">
            <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-navy-900">
                  Filtrar por línea
                </h2>
                {hayFiltros && (
                  <button type="button" onClick={limpiar} className="text-[10px] font-bold text-brand-700 hover:underline">
                    Limpiar
                  </button>
                )}
              </div>

              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Grupo</p>
              <select
                value={grupo}
                onChange={(e) => {
                  setGrupo(e.target.value);
                  setCategoria('');
                }}
                className="mb-4 w-full rounded-lg border border-slate-200 bg-sand-50 px-2.5 py-2 text-[12px] font-semibold text-navy-900 outline-none focus:border-brand-700/50"
              >
                <option value="todos">Todos los grupos</option>
                {GRUPOS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>

              <ul className="max-h-[430px] space-y-0.5 overflow-y-auto pr-1">
                <li>
                  <button
                    type="button"
                    onClick={() => setCategoria('')}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[12px] font-semibold transition ${
                      !categoria ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-sand-50'
                    }`}
                  >
                    Todas
                    <span className="text-[10px] font-bold text-slate-400">{CATALOGO_COMPLETO.length}</span>
                  </button>
                </li>
                {categoriasFiltradas.map((c) => (
                  <li key={c.slug}>
                    <button
                      type="button"
                      onClick={() => {
                        setCategoria(c.slug);
                        setVisibles(POR_PAGINA);
                      }}
                      className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] font-medium transition ${
                        categoria === c.slug
                          ? 'bg-brand-50 font-bold text-brand-700'
                          : 'text-slate-600 hover:bg-sand-50'
                      }`}
                    >
                      <span className="line-clamp-1">{c.nombre.replace('Línea ', '')}</span>
                      <span className="shrink-0 text-[10px] font-bold text-slate-400">{contarProductos(c.slug)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-navy-900 p-4 text-white shadow-sm">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-brand-200">¿Necesitas ayuda?</p>
              <p className="mt-1.5 text-xs leading-relaxed text-white/70">
                Nuestros ejecutivos te ayudan a elegir la medida y presión correcta.
              </p>
              <a
                href="tel:+56223386700"
                className="mt-3 flex items-center justify-center rounded-lg bg-white px-3 py-2 text-[11px] font-extrabold text-navy-900 transition hover:bg-brand-50"
              >
                22 338 6700
              </a>
            </div>
          </div>
        </aside>

        {/* Resultados */}
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold text-slate-500">
              <strong className="text-navy-900">{resultados.length}</strong>{' '}
              {resultados.length === 1 ? 'producto' : 'productos'}
              {busqueda && (
                <>
                  {' '}
                  para <strong className="text-navy-900">“{busqueda}”</strong>
                </>
              )}
            </p>
            <p className="text-[11px] text-slate-400">Precios netos en CLP + IVA</p>
          </div>

          {resultados.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-sand-100 text-slate-400">
                <PackageSearch className="h-8 w-8" />
              </span>
              <h2 className="mt-4 text-lg font-extrabold text-navy-900">No encontramos productos</h2>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Prueba con otra medida, revisa la ortografía o explora todas nuestras líneas.
              </p>
              <button
                type="button"
                onClick={limpiar}
                className="mt-4 rounded-xl bg-brand-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-800"
              >
                Ver todo el catálogo
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
                {mostrados.map((producto, i) => (
                  <ProductCard key={producto.id} producto={producto} index={i} />
                ))}
              </div>

              {visibles < resultados.length && (
                <div className="mt-8 flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVisibles((v) => v + POR_PAGINA)}
                    className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
                  >
                    Ver más productos <ArrowRight className="h-4 w-4" />
                  </button>
                  <p className="text-[11px] text-slate-400">
                    Mostrando {mostrados.length} de {resultados.length}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Filtros móvil */}
      {filtrosMovil && (
        <div className="fixed inset-0 z-[100] lg:hidden" role="dialog" aria-modal="true" aria-label="Filtros">
          <div className="absolute inset-0 bg-navy-950/55 backdrop-blur-[2px] animate-fade-in" onClick={() => setFiltrosMovil(false)} />
          <div className="absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col bg-white shadow-2xl animate-slide-in">
            <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
              <h2 className="text-sm font-extrabold text-navy-900">Filtrar catálogo</h2>
              <button type="button" onClick={() => setFiltrosMovil(false)} className="rounded-full p-2 hover:bg-slate-100" aria-label="Cerrar filtros">
                <X className="h-5 w-5" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto p-4">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Grupo</p>
              <select
                value={grupo}
                onChange={(e) => {
                  setGrupo(e.target.value);
                  setCategoria('');
                }}
                className="mb-4 w-full rounded-lg border border-slate-200 bg-sand-50 px-2.5 py-2.5 text-sm font-semibold text-navy-900 outline-none"
              >
                <option value="todos">Todos los grupos</option>
                {GRUPOS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>

              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Línea</p>
              <ul className="space-y-1">
                <li>
                  <button
                    type="button"
                    onClick={() => setCategoria('')}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm ${!categoria ? 'bg-brand-50 font-bold text-brand-700' : 'text-slate-600'}`}
                  >
                    Todas las líneas
                  </button>
                </li>
                {categoriasFiltradas.map((c) => (
                  <li key={c.slug}>
                    <button
                      type="button"
                      onClick={() => setCategoria(c.slug)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
                        categoria === c.slug ? 'bg-brand-50 font-bold text-brand-700' : 'text-slate-600'
                      }`}
                    >
                      <span>{c.nombre}</span>
                      <span className="text-[10px] text-slate-400">{contarProductos(c.slug)}</span>
                    </button>
                  </li>
                ))}
              </ul>

              <label className="mt-4 flex items-center gap-2 rounded-lg bg-sand-50 px-3 py-2.5 text-sm font-semibold text-navy-900">
                <input
                  type="checkbox"
                  checked={soloOfertas}
                  onChange={(e) => setSoloOfertas(e.target.checked)}
                  className="h-4 w-4 accent-[#8b0000]"
                />
                Solo ofertas
              </label>
            </div>
            <footer className="flex gap-2 border-t border-slate-100 p-4">
              <button type="button" onClick={limpiar} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-navy-900">
                Limpiar
              </button>
              <button
                type="button"
                onClick={() => setFiltrosMovil(false)}
                className="flex-1 rounded-xl bg-brand-700 py-2.5 text-xs font-bold text-white"
              >
                Ver {resultados.length} productos
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CatalogoPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="skeleton h-8 w-64 rounded-lg" />
          <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton h-80 rounded-2xl" />
            ))}
          </div>
        </div>
      }
    >
      <CatalogoContenido />
    </Suspense>
  );
}
