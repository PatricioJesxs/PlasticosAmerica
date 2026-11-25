import React from 'react';
import Link from 'next/link';

interface CategoryCardProps {
  nombre: string;
  slug: string;
  imagen: string;
  cantidad: number;
  descripcion?: string;
  index?: number;
}

export default function CategoryCard({
  nombre,
  slug,
  imagen,
  cantidad,
  descripcion,
  index = 0,
}: CategoryCardProps) {
  return (
    <Link
      href={`/catalogo?categoria=${slug}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm card-lift"
      aria-label={`Ver ${nombre} (${cantidad} productos)`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-sand-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imagen || '/logo.png'}
          alt={nombre}
          loading={index < 4 ? 'eager' : 'lazy'}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-95" />
        <span className="absolute right-3 top-3 rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">
          {cantidad} {cantidad === 1 ? 'producto' : 'productos'}
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h3 className="text-base font-bold leading-tight text-white sm:text-lg">{nombre}</h3>
            {descripcion && (
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/70 opacity-0 transition-all duration-500 group-hover:opacity-100 max-sm:opacity-100">
                {descripcion}
              </p>
            )}
          </div>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-brand-700 transition-transform duration-300 group-hover:scale-110 group-hover:bg-brand-700 group-hover:text-white">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
