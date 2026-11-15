'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, Menu, X, User, ShoppingCart, Phone, MapPin, 
  Mail, FileText, BookOpen, ShieldCheck, ChevronRight 
} from 'lucide-react';

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const enlacesNavegacion = [
    { nombre: 'Inicio', href: '/' },
    { nombre: 'Ofertas Destacadas', href: '/#destacados', destacado: true },
    { nombre: 'Productos', href: '/productos' },
    { nombre: 'Catálogo ', href: '/catalogo' },
    { nombre: 'Venta Mayorista', href: '/mayorista' },
    { nombre: 'Tus Boletas', href: '/boleta' },
    { nombre: 'Nosotros', href: '/nosotros' },
    { nombre: 'Ubicación y Estacionamiento', href: '/#ubicacion' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      {/* 1. Barra Superior Institucional (Datos reales Plásticos América) */}
      <div className="bg-[#8B0000] text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <a href="tel:+56223386700" className="flex items-center gap-1 hover:underline font-medium">
              <Phone className="w-3.5 h-3.5" /> 22 338 6700
            </a>
            <span className="hidden md:flex items-center gap-1 text-red-100">
              <MapPin className="w-3.5 h-3.5" /> Casa Matriz: Santa Elena 825 y 835 | Sucursal: San Camilo 834, Santiago
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="mailto:ventas@plasticosamerica.cl" className="hidden sm:flex items-center gap-1 hover:underline">
              <Mail className="w-3.5 h-3.5" /> ventas@plasticosamerica.cl
            </a>
            <Link href="/admin" className="flex items-center gap-1 bg-black/25 hover:bg-black/40 px-2.5 py-0.5 rounded text-[11px] font-semibold transition">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> Acceso Trabajadores
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Barra Principal: Menú 3 Barritas (Móvil) + Logo + Buscador + Cuenta/Cotización */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Botón 3 Barritas + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMenuAbierto(true)}
            aria-label="Abrir menú de navegación"
            className="p-2 rounded-lg text-slate-800 hover:bg-gray-100 active:bg-gray-200 transition flex items-center gap-1.5"
          >
            <Menu className="w-6 h-6" />
            <span className="hidden lg:inline text-sm font-semibold">Categorías</span>
          </button>

          {/* Logo que al apretarlo lleva directo al inicio */}
          <Link href="/" className="flex items-center shrink-0 group" title="Volver al Inicio - Plásticos América Chile">
            <img
              src="/logo.png"
              alt="Plásticos América Chile - Desde 1980"
              className="h-12 sm:h-14 w-auto object-contain mix-blend-multiply transition-transform duration-200 group-hover:scale-105"
            />
          </Link>
        </div>

        {/* Buscador Estilo La Relojería */}
        <form 
          onSubmit={(e) => { e.preventDefault(); }} 
          className="hidden md:flex flex-1 max-w-xl relative"
        >
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="¿Qué producto plástico, manga o envase buscas?"
            className="w-full bg-gray-100 text-sm text-slate-800 placeholder-gray-500 pl-4 pr-10 py-2.5 rounded-lg border border-transparent focus:border-[#8B0000] focus:bg-white focus:outline-none transition"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#8B0000]">
            <Search className="w-5 h-5" />
          </button>
        </form>

        {/* Iconos de Acción (Cuenta y Lista de Cotización) */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-slate-700 hover:text-[#8B0000] p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <User className="w-6 h-6" />
            <div className="hidden sm:block text-left leading-tight">
              <span className="block text-[11px] text-gray-500">Hola, ingresa</span>
              <span className="block text-xs font-bold">Mi Cuenta</span>
            </div>
          </Link>

          <Link
            href="/cotizacion"
            className="relative flex items-center gap-1.5 bg-[#0D233A] hover:bg-[#163659] text-white px-3.5 py-2 rounded-lg text-sm font-semibold transition shadow-sm"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="hidden sm:inline">Cotizar</span>
            <span className="bg-[#8B0000] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full">
              0
            </span>
          </Link>
        </div>
      </div>

      {/* Buscador Móvil (Visible en iPhone y Android) */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar bolsas, mangas, mangueras..."
            className="w-full bg-gray-100 text-base text-slate-800 pl-4 pr-10 py-2 rounded-lg border border-gray-200 focus:border-[#8B0000] focus:bg-white focus:outline-none"
          />
          <Search className="w-5 h-5 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* 3. Barra de Navegación Horizontal Inferior (Desktop) */}
      <nav className="hidden md:block border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-10 text-sm">
          <ul className="flex items-center gap-6">
            {enlacesNavegacion.map((item) => (
              <li key={item.nombre}>
                <Link
                  href={item.href}
                  className={`font-medium transition hover:text-[#8B0000] ${
                    item.destacado ? 'text-[#8B0000] font-bold' : 'text-slate-700'
                  }`}
                >
                  {item.nombre}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/cotizacion" className="text-xs font-bold text-[#0D233A] hover:underline flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> Solicitar Cotización Directa
          </Link>
        </div>
      </nav>

      {/* 4. Menú Lateral "3 Barritas" (Drawer para iOS, Android y Desktop) */}
      {menuAbierto && (
        <div className="fixed inset-0 z-50 flex">
          {/* Fondo oscuro */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs" 
            onClick={() => setMenuAbierto(false)}
          />
          
          {/* Panel Lateral */}
          <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="p-4 bg-[#0D233A] text-white flex items-center justify-between">
                <span className="font-bold text-base">Plásticos América Chile</span>
                <button 
                  onClick={() => setMenuAbierto(false)} 
                  className="p-1.5 rounded-lg hover:bg-white/10"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-4 border-b border-gray-100">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Navegación Principal</p>
                <ul className="space-y-1">
                  {enlacesNavegacion.map((item) => (
                    <li key={item.nombre}>
                      <Link
                        href={item.href}
                        onClick={() => setMenuAbierto(false)}
                        className="flex items-center justify-between py-2.5 px-3 rounded-lg text-slate-800 hover:bg-red-50 hover:text-[#8B0000] font-medium transition"
                      >
                        <span>{item.nombre}</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Familias de Productos</p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li><Link href="/productos?cat=bolsas" onClick={() => setMenuAbierto(false)} className="block py-1 hover:text-[#8B0000]">Bolsas Polietileno y Basura</Link></li>
                  <li><Link href="/productos?cat=mangas" onClick={() => setMenuAbierto(false)} className="block py-1 hover:text-[#8B0000]">Mangas y Film Stretch</Link></li>
                  <li><Link href="/productos?cat=mangueras" onClick={() => setMenuAbierto(false)} className="block py-1 hover:text-[#8B0000]">Mangueras Industriales y Jardín</Link></li>
                  <li><Link href="/productos?cat=envases" onClick={() => setMenuAbierto(false)} className="block py-1 hover:text-[#8B0000]">Envases y Desechables</Link></li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-2">
              <Link
                href="/catalogo"
                onClick={() => setMenuAbierto(false)}
                className="w-full flex items-center justify-center gap-2 bg-[#8B0000] text-white py-2.5 rounded-lg font-semibold text-sm"
              >
                <BookOpen className="w-4 h-4" /> Ver Catálogo Digital
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}