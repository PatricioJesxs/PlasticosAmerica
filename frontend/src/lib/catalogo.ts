import catalogo from '@/data/catalogo.json';

export interface VarianteMedida {
  id: string;
  sku: string;
  medida: string;
  precio: number;
  precioAnterior: number | null;
  unidad: string;
  stock: number;
}

export interface ProductoCatalogo {
  id: string;
  categoriaSlug: string;
  categoriaNombre: string;
  nombre: string;
  descripcion?: string;
  imagen?: string;
  etiqueta?: string | null;
  destacado?: boolean;
  subcategoria?: string;
  variantes: VarianteMedida[];
}

export interface CategoriaCatalogo {
  id: string;
  slug: string;
  nombre: string;
  nombreCorto?: string;
  grupo: string;
  descripcion: string;
  imagen: string;
  orden: number;
  destacada: boolean;
}

interface CatalogoJSON {
  generado: string;
  moneda: string;
  precios: string;
  categorias: CategoriaCatalogo[];
  productos: ProductoCatalogo[];
}

const data = catalogo as unknown as CatalogoJSON;

export const CATEGORIAS: CategoriaCatalogo[] = data.categorias;
export const CATALOGO_COMPLETO: ProductoCatalogo[] = data.productos;
export const CATALOGO_GENERADO = data.generado;

export const GRUPOS = Array.from(new Set(CATEGORIAS.map((c) => c.grupo)));

export function contarProductos(slug: string): number {
  return CATALOGO_COMPLETO.filter((p) => p.categoriaSlug === slug).length;
}

export function getCategoria(slug: string): CategoriaCatalogo | undefined {
  return CATEGORIAS.find((c) => c.slug === slug);
}

export function getProducto(id: string): ProductoCatalogo | undefined {
  return CATALOGO_COMPLETO.find((p) => p.id === id || p.variantes.some((v) => v.sku === id));
}

export function productosDestacados(limite = 8): ProductoCatalogo[] {
  const destacados = CATALOGO_COMPLETO.filter((p) => p.destacado);
  if (destacados.length >= limite) return destacados.slice(0, limite);
  return [...destacados, ...CATALOGO_COMPLETO.filter((p) => !p.destacado)].slice(0, limite);
}

export function productosEnOferta(limite = 8): ProductoCatalogo[] {
  return CATALOGO_COMPLETO.filter((p) => p.variantes.some((v) => v.precioAnterior)).slice(0, limite);
}

export function formatearCLP(valor: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(Math.round(valor || 0));
}

export function calcularIva(neto: number): number {
  return Math.round(neto * 0.19);
}
