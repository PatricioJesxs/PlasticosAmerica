'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  FileText,
  BookOpen,
  Car,
  ArrowRight,
  CheckCircle2,
  Layers,
  Check,
  Ruler,
} from 'lucide-react';

// Definición de tipos para variantes/medidas de cada producto
interface VarianteMedida {
  sku: string;
  medida: string;
  precioNeto: number;
  precioAnterior?: number;
  unidad: string;
  stock: number;
}

interface ProductoConMedidas {
  id: string;
  marca: string;
  nombre: string;
  etiqueta: string;
  descuento?: string;
  variantes: VarianteMedida[];
}

// 1. Productos directos más vendidos CON SELECTOR DE MEDIDAS
const PRODUCTOS_ESTRELLA: ProductoConMedidas[] = [
  {
    id: 'prod-1',
    marca: 'PLÁSTICOS AMÉRICA',
    nombre: 'Manguera Tricapa Antitorsión Jardín e Industria',
    etiqueta: 'Más Vendido',
    descuento: '20% Dcto.',
    variantes: [
      { sku: 'MAN-TRI-12-25', medida: '1/2" x 25m', precioNeto: 18990, precioAnterior: 23990, unidad: 'Rollo 25 mts', stock: 45 },
      { sku: 'MAN-TRI-12-50', medida: '1/2" x 50m', precioNeto: 34990, precioAnterior: 42500, unidad: 'Rollo 50 mts', stock: 28 },
      { sku: 'MAN-TRI-34-25', medida: '3/4" x 25m', precioNeto: 27990, precioAnterior: 33990, unidad: 'Rollo 25 mts', stock: 19 },
      { sku: 'MAN-TRI-10-50', medida: '1" x 50m', precioNeto: 68990, precioAnterior: 79900, unidad: 'Rollo 50 mts', stock: 10 },
    ],
  },
  {
    id: 'prod-2',
    marca: 'LÍNEA INDUSTRIAL',
    nombre: 'Manga Polietileno Alta Densidad Transparente',
    etiqueta: 'Top Mayorista',
    descuento: '15% Dcto.',
    variantes: [
      { sku: 'MNG-50CM-100', medida: '50cm / 100 mic', precioNeto: 24500, precioAnterior: 28900, unidad: 'Rollo 25 kg aprox.', stock: 30 },
      { sku: 'MNG-80CM-120', medida: '80cm / 120 mic', precioNeto: 29900, precioAnterior: 34500, unidad: 'Rollo 25 kg aprox.', stock: 22 },
      { sku: 'MNG-100CM-150', medida: '100cm / 150 mic', precioNeto: 36500, precioAnterior: 42000, unidad: 'Rollo 30 kg aprox.', stock: 14 },
    ],
  },
  {
    id: 'prod-3',
    marca: 'EMBALAJE',
    nombre: 'Film Stretch Transparente Virgen Paletizar',
    etiqueta: 'Stock Inmediato',
    descuento: '18% Dcto.',
    variantes: [
      { sku: 'FLM-50-20', medida: '50cm x 2.0kg', precioNeto: 6490, precioAnterior: 7900, unidad: 'Rollo Individual', stock: 120 },
      { sku: 'FLM-50-25', medida: '50cm x 2.5kg', precioNeto: 7490, precioAnterior: 9100, unidad: 'Rollo Individual', stock: 95 },
      { sku: 'FLM-50-30', medida: '50cm x 3.0kg', precioNeto: 8990, precioAnterior: 10900, unidad: 'Rollo Alto Rendimiento', stock: 60 },
    ],
  },
  {
    id: 'prod-4',
    marca: 'ASEO E INDUSTRIA',
    nombre: 'Bolsas Basura Industrial Extra Reforzada Negra',
    etiqueta: 'Más Vendido',
    descuento: '25% Dcto.',
    variantes: [
      { sku: 'BOL-70X90', medida: '70 x 90 cm', precioNeto: 9490, precioAnterior: 12500, unidad: 'Paquete 100 un.', stock: 80 },
      { sku: 'BOL-80X110', medida: '80 x 110 cm', precioNeto: 12990, precioAnterior: 17500, unidad: 'Paquete 100 un.', stock: 65 },
      { sku: 'BOL-90X120', medida: '90 x 120 cm', precioNeto: 15990, precioAnterior: 21000, unidad: 'Paquete 100 un.', stock: 40 },
    ],
  },
];

// 2. Líneas de Productos / Categorías
const LINEAS_PRODUCTOS = [
  {
    nombre: 'Línea Seguridad',
    slug: 'seguridad',
    cantidad: 20,
    descripcion: 'Guantes, cascos, conos, cintas de peligro y EPP industrial.',
  },
  {
    nombre: 'Línea PPR Fusión',
    slug: 'ppr-fusion',
    cantidad: 53,
    descripcion: 'Tuberías, codos, coplas, llaves y termofusoras para agua.',
  },
  {
    nombre: 'Línea Mallas',
    slug: 'mallas',
    cantidad: 22,
    descripcion: 'Mallas raschel, sombra, cercos y protección agrícola.',
  },
  {
    nombre: 'Línea Llaves de Paso',
    slug: 'llaves-de-paso',
    cantidad: 31,
    descripcion: 'Válvulas de bola, llaves de jardín en bronce y PVC.',
  },
  {
    nombre: 'Línea Hidráulica PVC',
    slug: 'hidraulica-pvc',
    cantidad: 62,
    descripcion: 'Tubos y fitting PVC presión y sanitario de alta resistencia.',
  },
  {
    nombre: 'Línea HDPE',
    slug: 'hdpe',
    cantidad: 35,
    descripcion: 'Tuberías y accesorios de polietileno de alta densidad.',
  },
];

export default function HomePage() {
  // Guarda qué índice de medida está seleccionado para cada producto (por defecto 0 = la primera medida)
  const [medidaSeleccionada, setMedidaSeleccionada] = useState<Record<string, number>>({
    'prod-1': 0,
    'prod-2': 0,
    'prod-3': 0,
    'prod-4': 0,
  });

  const [agregadoSku, setAgregadoSku] = useState<string | null>(null);

  const formatearCLP = (valor: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(valor);

  const seleccionarMedida = (productoId: string, indice: number) => {
    setMedidaSeleccionada((prev) => ({
      ...prev,
      [productoId]: indice,
    }));
  };

  const handleAgregarCotizacion = (variante: VarianteMedida) => {
    setAgregadoSku(variante.sku);
    setTimeout(() => setAgregadoSku(null), 1500);
  };

  return (
    <div className="pb-16">
      {/* =========================================================
          1. BANNER PRINCIPAL + ACCESOS RÁPIDOS (BOLETA Y CATÁLOGO)
         ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-gradient-to-r from-[#8B0000] to-[#5c0000] rounded-2xl p-6 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden shadow-md">
            <div className="relative z-10 max-w-lg">
              <span className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                <Car className="w-4 h-4" /> 2 Accesos al Estacionamiento Sin Costo
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3 leading-tight">
                Todo en Plásticos Industriales, Hidráulica y Ferretería
              </h1>
              <p className="text-red-100 text-sm sm:text-base mb-6">
                Desde 1980 abasteciendo a empresas, constructores y hogares en Santiago. Casa Matriz Santa Elena 825 y Sucursal San Camilo 834.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/productos"
                  className="bg-white text-[#8B0000] hover:bg-gray-100 font-bold px-5 py-2.5 rounded-lg text-sm transition shadow"
                >
                  Ver Catálogo Completo
                </Link>
                <Link
                  href="/cotizacion"
                  className="bg-[#0D233A] hover:bg-[#163659] text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition"
                >
                  Cotizar por Mayor
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <Link
              href="/boleta"
              className="bg-[#0D233A] hover:bg-[#153454] text-white rounded-2xl p-6 flex flex-col justify-between transition shadow-md group"
            >
              <div className="flex items-center justify-between">
                <FileText className="w-8 h-8 text-red-400" />
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition" />
              </div>
              <div className="mt-4">
                <h2 className="text-lg font-bold">Revisa tu Boleta Electrónica</h2>
                <p className="text-xs text-gray-300 mt-1">
                  Descarga tus documentos tributarios de forma rápida y segura.
                </p>
              </div>
            </Link>

            <Link
              href="/catalogo"
              className="bg-white hover:bg-gray-50 border border-gray-200 text-slate-900 rounded-2xl p-6 flex flex-col justify-between transition shadow-sm group"
            >
              <div className="flex items-center justify-between">
                <BookOpen className="w-8 h-8 text-[#8B0000]" />
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition" />
              </div>
              <div className="mt-4">
                <h2 className="text-lg font-bold">Catálogo On-Line</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Explora nuestro libro completo de medidas, micrajes y precios.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          2. PRODUCTOS MÁS COTIZADOS CON SELECTOR DE MEDIDAS
         ========================================================= */}
      <section id="destacados" className="max-w-7xl mx-auto px-4 mt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Productos Más Cotizados
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Selecciona la medida o formato que necesitas para ver su valor neto exacto.
            </p>
          </div>
          <Link
            href="/productos"
            className="text-sm font-semibold text-[#8B0000] hover:underline flex items-center gap-1 shrink-0"
          >
            Ver todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PRODUCTOS_ESTRELLA.map((prod) => {
            const indiceActivo = medidaSeleccionada[prod.id] ?? 0;
            const varianteActiva = prod.variantes[indiceActivo];
            const estaAgregado = agregadoSku === varianteActiva.sku;

            return (
              <div
                key={prod.id}
                className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-lg transition-shadow"
              >
                <div>
                  {/* Espacio para Imagen del Producto */}
                  <div className="h-40 bg-gray-100 rounded-lg mb-3 flex flex-col items-center justify-center relative overflow-hidden">
                    <span className="text-xs text-gray-400 font-medium">
                      [Foto {varianteActiva.sku}]
                    </span>
                    <span className="absolute bottom-2 left-2 bg-white/90 text-slate-600 text-[10px] font-mono px-2 py-0.5 rounded border border-gray-200">
                      SKU: {varianteActiva.sku}
                    </span>
                  </div>

                  {/* Etiquetas */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <span className="bg-slate-900 text-white text-[11px] font-bold px-2 py-0.5 rounded">
                      {prod.etiqueta}
                    </span>
                    {prod.descuento && (
                      <span className="bg-[#8B0000] text-white text-[11px] font-bold px-2 py-0.5 rounded">
                        {prod.descuento}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] font-semibold text-gray-400 uppercase">
                    {prod.marca}
                  </p>
                  <h3 className="text-sm font-bold text-slate-800 line-clamp-2 mt-0.5 min-h-[40px]">
                    {prod.nombre}
                  </h3>

                  {/* SELECTOR DE MEDIDAS INTERACTIVO */}
                  <div className="mt-3">
                    <label className="flex items-center gap-1 text-[11px] font-bold text-slate-600 uppercase mb-1.5">
                      <Ruler className="w-3.5 h-3.5 text-[#8B0000]" /> Elige medida:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {prod.variantes.map((variante, idx) => {
                        const seleccionado = idx === indiceActivo;
                        return (
                          <button
                            key={variante.sku}
                            type="button"
                            onClick={() => seleccionarMedida(prod.id, idx)}
                            className={`text-xs px-2.5 py-1.5 rounded-md font-semibold border transition cursor-pointer ${
                              seleccionado
                                ? 'bg-[#8B0000] text-white border-[#8B0000] shadow-xs'
                                : 'bg-gray-50 text-slate-700 border-gray-300 hover:border-[#8B0000] hover:bg-red-50/40'
                            }`}
                          >
                            {variante.medida}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <p className="text-xs text-emerald-700 font-medium flex items-center gap-1 mt-2.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> {varianteActiva.unidad} ({varianteActiva.stock} disp.)
                  </p>
                </div>

                {/* Precio Dinámico y Botón de Acción */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-lg font-extrabold text-[#8B0000]">
                      {formatearCLP(varianteActiva.precioNeto)}
                    </span>
                    {varianteActiva.precioAnterior && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatearCLP(varianteActiva.precioAnterior)}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-500 ml-auto">+ IVA</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAgregarCotizacion(varianteActiva)}
                    className={`w-full text-white text-sm font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer ${
                      estaAgregado
                        ? 'bg-emerald-600'
                        : 'bg-slate-900 hover:bg-[#8B0000]'
                    }`}
                  >
                    {estaAgregado ? (
                      <>
                        <Check className="w-4 h-4" /> Agregado ({varianteActiva.medida})
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" /> Cotizar {varianteActiva.medida}
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================
          3. LÍNEA DE PRODUCTOS DESTACADOS (CATEGORÍAS VISUALES)
         ========================================================= */}
      <section id="lineas" className="max-w-7xl mx-auto px-4 mt-14">
        <div className="flex items-center gap-3 mb-6">
          <span className="bg-[#8B0000] text-white p-2 rounded-lg shrink-0">
            <ArrowRight className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 uppercase tracking-tight">
              Línea de Productos Destacados
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Selecciona una familia para ver todas sus medidas y precios disponibles.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {LINEAS_PRODUCTOS.map((linea) => (
            <Link
              key={linea.slug}
              href={`/productos?categoria=${linea.slug}`}
              className="group bg-white rounded-2xl border-2 border-[#8B0000]/80 hover:border-[#8B0000] p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="h-40 bg-gray-100 rounded-xl mb-4 flex flex-col items-center justify-center relative overflow-hidden border border-gray-200">
                  <Layers className="w-10 h-10 text-gray-300 group-hover:text-[#8B0000] transition-colors mb-1" />
                  <span className="text-xs text-gray-400 font-medium">
                    [Imagen {linea.nombre}]
                  </span>
                  <span className="absolute top-2.5 right-2.5 bg-white/90 text-slate-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs border border-gray-200">
                    {linea.cantidad} productos
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#8B0000] transition-colors">
                    {linea.nombre}{' '}
                    <span className="text-gray-400 font-normal text-sm">
                      ({linea.cantidad})
                    </span>
                  </h3>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#8B0000] group-hover:translate-x-1 transition-all" />
                </div>

                <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">
                  {linea.descripcion}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

    