'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Flame, Tag } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import {
  CATALOGO_COMPLETO,
  productosDestacados,
  productosEnOferta,
  type ProductoCatalogo,
} from '@/lib/catalogo';

type Tab = 'destacados' | 'ofertas' | 'nuevos';

export default function FeaturedProducts() {
  const [tab, setTab] = useState<Tab>('destacados');

  const productos = useMemo<ProductoCatalogo[]>(() => {
    if (tab === 'ofertas') {
      const ofertas = productosEnOferta(8);
      return ofertas.length ? ofertas : productosDestacados(8);
    }
    if (tab === 'nuevos') {
      const nuevos = CATALOGO_COMPLETO.filter((p) => p.etiqueta === 'Nuevo').slice(0, 8);
      return nuevos.length ? nuevos : productosDestacados(8);
    }
    return productosDestacados(8);
  }, [tab]);

  const tabs: { id: Tab; nombre: string; icon: React.ElementType }[] = [
    { id: 'destacados', nombre: 'Más cotizados', icon: Flame },
    { id: 'ofertas', nombre: 'Ofertas', icon: Tag },
    { id: 'nuevos', nombre: 'Novedades', icon: ArrowRight },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pt-16 sm:pt-20">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1.5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-700">
            Selección del mes
          </p>
          <h2 className="text-2xl font-extrabold text-navy-900 sm:text-3xl">
            Productos más cotizados
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Elige la medida exacta y agrega directo a tu solicitud de cotización.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            {tabs.map(({ id, nombre, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-bold transition ${
                  tab === id
                    ? 'bg-navy-900 text-white shadow'
                    : 'text-slate-600 hover:bg-sand-100 hover:text-navy-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {nombre}
              </button>
            ))}
          </div>
          <Link
            href="/catalogo"
            className="flex items-center gap-1 rounded-xl px-2 py-2 text-xs font-bold text-brand-700 hover:underline"
          >
            Ver todo <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {productos.map((producto, i) => (
          <ProductCard key={producto.id} producto={producto} index={i} />
        ))}
      </div>
    </section>
  );
}
