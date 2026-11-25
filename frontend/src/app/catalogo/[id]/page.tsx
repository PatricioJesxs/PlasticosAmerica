'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  FileText,
  Info,
  Minus,
  PackageCheck,
  Phone,
  Plus,
  Ruler,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { CATALOGO_COMPLETO, formatearCLP, getProducto } from '@/lib/catalogo';
import { useQuote } from '@/lib/quote';

export default function DetalleProductoPage() {
  const params = useParams<{ id: string }>();
  const producto = useMemo(() => getProducto(String(params?.id ?? '')), [params]);
  const [indice, setIndice] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const { agregar, abrir } = useQuote();

  if (!producto) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-sand-100 text-slate-400">
          <Info className="h-9 w-9" />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold text-navy-900">Producto no encontrado</h1>
        <p className="mt-2 text-sm text-slate-500">
          Es posible que el producto haya cambiado de nombre o ya no esté disponible en el catálogo.
        </p>
        <Link
          href="/catalogo"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-sm font-bold text-white hover:bg-brand-800"
        >
          <ArrowLeft className="h-4 w-4" /> Volver al catálogo
        </Link>
      </div>
    );
  }

  const variante = producto.variantes[indice] ?? producto.variantes[0];
  const descuento = variante.precioAnterior
    ? Math.round(((variante.precioAnterior - variante.precio) / variante.precioAnterior) * 100)
    : 0;
  const total = variante.precio * cantidad;

  const relacionados = CATALOGO_COMPLETO.filter(
    (p) => p.categoriaSlug === producto.categoriaSlug && p.id !== producto.id
  ).slice(0, 4);

  const handleAgregar = () => {
    agregar(
      {
        variantId: variante.id,
        productId: producto.id,
        nombre: producto.nombre,
        medida: variante.medida,
        unidad: variante.unidad,
        precio: variante.precio,
        imagen: producto.imagen,
        sku: variante.sku,
      },
      cantidad
    );
    setAgregado(true);
    setCantidad(1);
    setTimeout(() => setAgregado(false), 1800);
  };

  const specs = [
    { label: 'Código SKU', valor: variante.sku },
    { label: 'Medida', valor: variante.medida },
    { label: 'Unidad de venta', valor: variante.unidad },
    { label: 'Disponibilidad', valor: variante.stock > 0 ? `${variante.stock} unidades` : 'A pedido' },
    { label: 'Categoría', valor: producto.categoriaNombre },
    { label: 'IVA', valor: '19% adicional' },
  ];

  return (
    <div className="bg-[#fbfaf7] pb-16">
      <div className="mx-auto max-w-7xl px-4 pt-6">
        <nav className="flex flex-wrap items-center gap-1 text-[11px] text-slate-500">
          <Link href="/" className="hover:text-brand-700">
            Inicio
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/catalogo" className="hover:text-brand-700">
            Catálogo
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/catalogo?categoria=${producto.categoriaSlug}`} className="hover:text-brand-700">
            {producto.categoriaNombre}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="line-clamp-1 font-semibold text-navy-900">{producto.nombre}</span>
        </nav>

        <div className="mt-5 grid gap-6 lg:grid-cols-12">
          {/* Imagen */}
          <div className="lg:col-span-5">
            <div className="sticky top-36">
              <div className="relative overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-sm">
                <div className="relative aspect-square bg-sand-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={producto.imagen || '/logo.png'}
                    alt={producto.nombre}
                    className="h-full w-full object-contain p-8"
                  />
                  {descuento > 0 && (
                    <span className="absolute left-4 top-4 rounded-lg bg-brand-700 px-2.5 py-1 text-xs font-extrabold text-white shadow">
                      -{descuento}% OFF
                    </span>
                  )}
                  {producto.etiqueta && (
                    <span className="absolute right-4 top-4 rounded-lg bg-navy-900/90 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
                      {producto.etiqueta}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  { icon: ShieldCheck, texto: 'Compra segura' },
                  { icon: Truck, texto: 'Despacho a Chile' },
                  { icon: BadgeCheck, texto: 'Desde 1980' },
                ].map(({ icon: Icon, texto }) => (
                  <div key={texto} className="flex flex-col items-center gap-1 rounded-xl border border-black/[0.05] bg-white px-2 py-3 text-center">
                    <Icon className="h-4 w-4 text-brand-700" />
                    <span className="text-[10px] font-semibold text-slate-600">{texto}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Información */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-black/[0.06] bg-white p-5 shadow-sm sm:p-7">
              <Link
                href={`/catalogo?categoria=${producto.categoriaSlug}`}
                className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-700 hover:underline"
              >
                {producto.categoriaNombre}
              </Link>

              <h1 className="mt-2 text-2xl font-extrabold leading-tight text-navy-950 sm:text-3xl">
                {producto.nombre}
              </h1>

              <p className="mt-2 text-sm leading-relaxed text-slate-600">{producto.descripcion}</p>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px]">
                <span className="rounded-full bg-sand-100 px-2.5 py-1 font-mono font-semibold text-slate-600">
                  SKU {variante.sku}
                </span>
                <span
                  className={`flex items-center gap-1 rounded-full px-2.5 py-1 font-bold ${
                    variante.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  <PackageCheck className="h-3 w-3" />
                  {variante.stock > 0 ? `${variante.stock} disponibles` : 'Producto a pedido'}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap items-end gap-2 border-y border-slate-100 py-4">
                <span className="text-3xl font-black tracking-tight text-brand-700">{formatearCLP(variante.precio)}</span>
                {variante.precioAnterior && (
                  <span className="pb-1 text-sm text-slate-400 line-through">{formatearCLP(variante.precioAnterior)}</span>
                )}
                <span className="pb-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  neto / {variante.unidad} + IVA
                </span>
              </div>

              <div className="mt-5">
                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-navy-900">
                  <Ruler className="h-3.5 w-3.5 text-brand-700" /> Selecciona la medida
                </p>
                <div className="flex flex-wrap gap-2">
                  {producto.variantes.map((v, i) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setIndice(i);
                        setCantidad(1);
                      }}
                      className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${
                        i === indice
                          ? 'border-brand-700 bg-brand-700 text-white shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-brand-400 hover:bg-brand-50'
                      }`}
                      title={formatearCLP(v.precio)}
                    >
                      {v.medida}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                  Precio para <strong className="text-navy-900">{variante.medida}</strong>: {formatearCLP(variante.precio)}{' '}
                  + IVA por {variante.unidad}.
                </p>
              </div>

              <div className="mt-5">
                <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-navy-900">Cantidad</p>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center rounded-xl border border-slate-300 bg-sand-50">
                    <button
                      type="button"
                      onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                      className="p-3 text-slate-700 transition hover:text-brand-700"
                      aria-label="Disminuir cantidad"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={99999}
                      value={cantidad}
                      onChange={(e) => setCantidad(Math.max(1, Math.min(99999, Number(e.target.value) || 1)))}
                      className="w-14 border-x border-slate-200 bg-white py-2 text-center text-sm font-extrabold text-navy-900 outline-none"
                      aria-label="Cantidad"
                    />
                    <button
                      type="button"
                      onClick={() => setCantidad((c) => Math.min(99999, c + 1))}
                      className="p-3 text-slate-700 transition hover:text-brand-700"
                      aria-label="Aumentar cantidad"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAgregar}
                    className={`flex min-w-[210px] flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-extrabold text-white transition active:scale-[0.99] ${
                      agregado ? 'bg-emerald-600' : 'bg-brand-700 hover:bg-brand-800 hover:shadow-lg'
                    }`}
                  >
                    {agregado ? (
                      <>
                        <CheckCircle2 className="h-5 w-5" /> Agregado a la cotización
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5" /> Agregar · {formatearCLP(total)}
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-1.5 text-[10px] text-slate-400">
                  Total neto referencial: {formatearCLP(total)} + IVA. Confirmamos stock al responder.
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={abrir}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-navy-900/15 bg-white px-4 py-3 text-xs font-bold text-navy-900 transition hover:bg-sand-50"
                >
                  <FileText className="h-4 w-4 text-brand-700" /> Ver mi cotización
                </button>
                <a
                  href={`https://wa.me/56223386700?text=${encodeURIComponent(
                    `Hola, necesito cotizar: ${producto.nombre} (${variante.medida})`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-emerald-500"
                >
                  <Phone className="h-4 w-4" /> Consultar por WhatsApp
                </a>
              </div>
            </div>

            {/* Especificaciones */}
            <div className="mt-6 rounded-3xl border border-black/[0.06] bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-navy-900">Ficha del producto</h2>
              <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                {specs.map((s) => (
                  <div key={s.label} className="flex items-center justify-between gap-3 border-b border-dashed border-slate-100 py-1.5 text-xs">
                    <dt className="text-slate-500">{s.label}</dt>
                    <dd className="text-right font-semibold text-navy-900">{s.valor}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 rounded-xl bg-sand-50 p-3.5 text-[11px] leading-relaxed text-slate-600">
                <strong className="text-navy-900">Nota:</strong> las imágenes son referenciales y los precios mostrados son
                netos de referencia. Un ejecutivo confirmará disponibilidad, unidad de venta y condiciones de despacho.
              </div>
            </div>
          </div>
        </div>

        {/* Relacionados */}
        {relacionados.length > 0 && (
          <section className="mt-12">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-700">Misma línea</p>
                <h2 className="mt-0.5 text-xl font-extrabold text-navy-900 sm:text-2xl">También te puede interesar</h2>
              </div>
              <Link
                href={`/catalogo?categoria=${producto.categoriaSlug}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:underline"
              >
                Ver línea <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {relacionados.map((p, i) => (
                <ProductCard key={p.id} producto={p} index={i} mostrarCategoria={false} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
