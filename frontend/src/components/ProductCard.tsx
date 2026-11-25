'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, Plus, Ruler, ShoppingCart, Sparkles } from 'lucide-react';
import { formatearCLP, type ProductoCatalogo } from '@/lib/catalogo';
import { useQuote } from '@/lib/quote';

interface ProductCardProps {
  producto: ProductoCatalogo;
  index?: number;
  mostrarCategoria?: boolean;
}

export default function ProductCard({ producto, index = 0, mostrarCategoria = true }: ProductCardProps) {
  const [seleccion, setSeleccion] = useState(0);
  const [agregado, setAgregado] = useState(false);
  const { agregar } = useQuote();

  const variante = producto.variantes[seleccion] ?? producto.variantes[0];
  if (!variante) return null;

  const descuento = variante.precioAnterior
    ? Math.round(((variante.precioAnterior - variante.precio) / variante.precioAnterior) * 100)
    : 0;

  const handleAgregar = () => {
    agregar({
      variantId: variante.id,
      productId: producto.id,
      nombre: producto.nombre,
      medida: variante.medida,
      unidad: variante.unidad,
      precio: variante.precio,
      imagen: producto.imagen,
      sku: variante.sku,
    });
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1600);
  };

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_2px_14px_-8px_rgba(13,35,58,0.18)] transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-700/20 hover:shadow-[0_26px_50px_-26px_rgba(13,35,58,0.45)]"
      style={{ animationDelay: `${Math.min(index, 12) * 35}ms` }}
    >
      <Link href={`/catalogo/${producto.id}`} className="relative block aspect-[5/4] overflow-hidden bg-sand-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={producto.imagen || '/logo.png'}
          alt={producto.nombre}
          loading={index < 8 ? 'eager' : 'lazy'}
          decoding="async"
          className="h-full w-full object-contain p-3 transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        />

        <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1">
          {descuento > 0 && (
            <span className="rounded-md bg-brand-700 px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-white shadow">
              -{descuento}%
            </span>
          )}
          {producto.etiqueta && (
            <span className="flex items-center gap-1 rounded-md bg-navy-900/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
              {producto.etiqueta === 'Nuevo' && <Sparkles className="h-3 w-3 text-amber-300" />}
              {producto.etiqueta}
            </span>
          )}
        </div>

        <span className="absolute bottom-2 right-2 rounded-md border border-black/5 bg-white/90 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-500">
          {variante.sku}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {mostrarCategoria && (
          <Link
            href={`/catalogo?categoria=${producto.categoriaSlug}`}
            className="mb-1.5 line-clamp-1 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-700/80 hover:text-brand-700"
          >
            {producto.categoriaNombre}
          </Link>
        )}

        <Link href={`/catalogo/${producto.id}`}>
          <h3 className="line-clamp-2 min-h-[2.6rem] text-[13.5px] font-bold leading-snug text-navy-900 transition-colors group-hover:text-brand-700 sm:text-sm">
            {producto.nombre}
          </h3>
        </Link>

        <div className="mt-3">
          <p className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
            <Ruler className="h-3 w-3 text-brand-700" /> Medida
          </p>
          <div className="flex flex-wrap gap-1">
            {producto.variantes.slice(0, 5).map((v, i) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSeleccion(i)}
                className={`rounded-md border px-1.5 py-1 text-[10.5px] font-semibold transition ${
                  i === seleccion
                    ? 'border-brand-700 bg-brand-700 text-white shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-brand-400 hover:bg-brand-50'
                }`}
                title={`${v.medida} · ${formatearCLP(v.precio)}`}
              >
                {v.medida}
              </button>
            ))}
            {producto.variantes.length > 5 && (
              <Link
                href={`/catalogo/${producto.id}`}
                className="rounded-md border border-dashed border-slate-300 px-1.5 py-1 text-[10.5px] font-semibold text-slate-500 hover:border-brand-400 hover:text-brand-700"
              >
                +{producto.variantes.length - 5}
              </Link>
            )}
          </div>
        </div>

        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-extrabold tracking-tight text-navy-900">
                  {formatearCLP(variante.precio)}
                </span>
                <span className="text-[9px] font-bold uppercase text-slate-400">+ IVA</span>
              </div>
              {variante.precioAnterior && (
                <span className="text-[11px] text-slate-400 line-through">
                  {formatearCLP(variante.precioAnterior)}
                </span>
              )}
              <p className="mt-0.5 text-[10px] font-medium text-slate-500">
                {variante.unidad} · {variante.stock > 0 ? `${variante.stock} disp.` : 'a pedido'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAgregar}
            className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all active:scale-[0.98] ${
              agregado
                ? 'bg-emerald-600 text-white'
                : 'bg-navy-900 text-white hover:bg-brand-700 hover:shadow-lg'
            }`}
          >
            {agregado ? (
              <>
                <Check className="h-4 w-4" /> Agregado
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" /> Cotizar
                <Plus className="h-3 w-3 opacity-60" />
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
