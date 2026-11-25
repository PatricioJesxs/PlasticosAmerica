'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useQuote } from '@/lib/quote';
import { formatearCLP } from '@/lib/catalogo';

export default function QuoteDrawer() {
  const { items, abierto, cerrar, quitar, cambiarCantidad, neto, iva, total, count } = useQuote();

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-[110]" role="dialog" aria-modal="true" aria-label="Tu cotización">
      <div className="absolute inset-0 bg-navy-950/55 backdrop-blur-[3px] animate-fade-in" onClick={cerrar} />

      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl animate-slide-in">
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <ShoppingBag className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-navy-900">Tu cotización</h2>
              <p className="text-xs text-slate-500">{count} ítem(s) seleccionado(s)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={cerrar}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-navy-900"
            aria-label="Cerrar cotización"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
            <span className="grid h-20 w-20 place-items-center rounded-full bg-sand-100 text-slate-400">
              <ShoppingBag className="h-9 w-9" />
            </span>
            <h3 className="text-lg font-bold text-navy-900">Tu cotización está vacía</h3>
            <p className="text-sm text-slate-500">
              Agrega productos y medidas desde el catálogo. Te responderemos con precios y disponibilidad.
            </p>
            <Link
              href="/catalogo"
              onClick={cerrar}
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-800"
            >
              Explorar catálogo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.key} className="flex gap-3 p-4">
                  <Link
                    href={`/catalogo/${item.productId}`}
                    onClick={cerrar}
                    className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-sand-50"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imagen || '/logo.png'}
                      alt={item.nombre}
                      className="h-full w-full object-contain p-1.5"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-2 text-xs font-bold leading-snug text-navy-900">
                        {item.nombre}
                      </p>
                      <button
                        type="button"
                        onClick={() => quitar(item.key)}
                        className="shrink-0 rounded-md p-1 text-slate-400 transition hover:bg-brand-50 hover:text-brand-700"
                        aria-label={`Quitar ${item.nombre}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {item.medida} · SKU {item.sku}
                    </p>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex items-center rounded-lg border border-slate-200">
                        <button
                          type="button"
                          onClick={() => cambiarCantidad(item.key, item.cantidad - 1)}
                          className="p-1.5 text-slate-600 hover:text-brand-700"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-8 text-center text-xs font-bold text-navy-900">
                          {item.cantidad}
                        </span>
                        <button
                          type="button"
                          onClick={() => cambiarCantidad(item.key, item.cantidad + 1)}
                          className="p-1.5 text-slate-600 hover:text-brand-700"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-extrabold text-navy-900">
                          {formatearCLP(item.precio * item.cantidad)}
                        </p>
                        <p className="text-[10px] text-slate-400">+ IVA</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <footer className="border-t border-slate-100 bg-sand-50/70 p-5">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Neto</span>
                  <span className="font-semibold">{formatearCLP(neto)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>IVA (19%)</span>
                  <span className="font-semibold">{formatearCLP(iva)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-extrabold text-navy-900">
                  <span>Total</span>
                  <span>{formatearCLP(total)}</span>
                </div>
              </div>

              <Link
                href="/cotizacion"
                onClick={cerrar}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 py-3.5 text-sm font-bold text-white transition hover:bg-brand-800 active:scale-[0.99]"
              >
                Solicitar cotización formal <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="mt-2 text-center text-[10px] text-slate-400">
                Precios netos de referencia. Un ejecutivo confirmará stock y despacho.
              </p>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
