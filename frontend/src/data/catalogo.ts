export interface VarianteMedida {
    sku: string;
    medida: string;
    precio: number;
    precioAnterior?: number;
    unidad: string;
    stock: number;

}


export interface ProductoCatalogo {
    id: string;
    categoriaSlug: string;
    categoriaNombre: string;
    nombre: string;
    etiqueta?: string;
    imagen?: string;
    variantes: VarianteMedida[];
    
}



export const CATEGORIAS =[
{ slug: 'todas', nombre: 'Todas las Líneas' },
  { slug: 'hidraulica-pvc', nombre: 'Línea Hidráulica PVC' },
  { slug: 'llaves-de-paso', nombre: 'Línea Llaves de Paso' },
  { slug: 'seguridad', nombre: 'Línea de Seguridad' },
  { slug: 'ppr-fusion', nombre: 'Línea PPR Fusión' },
  { slug: 'mallas', nombre: 'Línea de Mallas' },
  { slug: 'hdpe', nombre: 'Línea HDPE' },
  { slug: 'embalaje', nombre: 'Línea Embalaje' },
  { slug: 'cobre', nombre: 'Línea Cobre' },
  { slug: 'canaletas-y-camaras', nombre: 'Línea Canaletas y Cámaras' },
  { slug: 'bronce', nombre: 'Línea Bronce' },
  { slug: 'articulos-de-riesgo', nombre: 'Línea Artículos de Riesgo' },
  { slug: 'aguas-servidas', nombre: 'Línea Almacenamiento y Aguas Servidas' },
];



export const CATALOGO_COMPLETO: ProductoCatalogo[] = [
  {
    id: 'mat-pvc-1',
    categoriaSlug: 'hidraulica-pvc',
    categoriaNombre: 'Línea Hidráulica PVC',
    nombre: 'Codo de PVC 90º Hidráulico so-hi',
    etiqueta: 'Nuevo',
    variantes: [
      { sku: '928', medida: '20mm X 1/2', precio: 999, unidad: 'unidad', stock: 10 },
      { sku: '929', medida: '25mm X 1/2', precio: 1000, unidad: 'unidad', stock: 15 },
      { sku: '930', medida: '25mm X 3/4', precio: 1200, unidad: 'unidad', stock: 5 },
    ],
  },
  // Pega aquí todos los demás productos siguiendo este mismo molde
];
