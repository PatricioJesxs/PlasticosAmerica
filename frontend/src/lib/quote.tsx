'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { calcularIva } from '@/lib/catalogo';

export interface QuoteItem {
  key: string;
  variantId: string | null;
  productId: string;
  nombre: string;
  medida: string;
  unidad: string;
  precio: number;
  imagen?: string;
  sku: string;
  cantidad: number;
}

export interface QuoteItemInput extends Omit<QuoteItem, 'key' | 'cantidad'> {}

interface QuoteContextValue {
  items: QuoteItem[];
  count: number;
  neto: number;
  iva: number;
  total: number;
  abierto: boolean;
  abrir: () => void;
  cerrar: () => void;
  agregar: (item: QuoteItemInput, cantidad?: number) => void;
  quitar: (key: string) => void;
  cambiarCantidad: (key: string, cantidad: number) => void;
  vaciar: () => void;
  notificar: (mensaje: string, tipo?: 'ok' | 'error') => void;
}

const QuoteContext = createContext<QuoteContextValue | null>(null);
const STORAGE_KEY = 'pa_cotizacion';

export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [toast, setToast] = useState<{ mensaje: string; tipo: 'ok' | 'error' } | null>(null);
  const [hidratado, setHidratado] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY);
      if (guardado) {
        const parsed = JSON.parse(guardado);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      /* ignore */
    }
    setHidratado(true);
  }, []);

  useEffect(() => {
    if (!hidratado) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hidratado]);

  const notificar = useCallback((mensaje: string, tipo: 'ok' | 'error' = 'ok') => {
    setToast({ mensaje, tipo });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3600);
  }, []);

  const agregar = useCallback<QuoteContextValue['agregar']>(
    (item, cantidad = 1) => {
      setItems((prev) => {
        const existente = prev.find((p) => p.key === (item.variantId || item.productId));
        if (existente) {
          return prev.map((p) =>
            p.key === existente.key ? { ...p, cantidad: p.cantidad + cantidad } : p
          );
        }
        return [
          ...prev,
          {
            ...item,
            key: item.variantId || item.productId,
            cantidad: Math.max(1, cantidad),
          },
        ];
      });
      setAbierto(true);
      notificar(`${item.nombre} · ${item.medida} agregado a tu cotización`);
    },
    [notificar]
  );

  const quitar = useCallback(
    (key: string) => {
      setItems((prev) => prev.filter((p) => p.key !== key));
      notificar('Producto quitado de la cotización');
    },
    [notificar]
  );

  const cambiarCantidad = useCallback((key: string, cantidad: number) => {
    setItems((prev) =>
      prev.map((p) => (p.key === key ? { ...p, cantidad: Math.max(1, Math.min(99999, cantidad)) } : p))
    );
  }, []);

  const vaciar = useCallback(() => {
    setItems([]);
    notificar('Cotización vaciada');
  }, [notificar]);

  const neto = useMemo(() => items.reduce((acc, i) => acc + i.precio * i.cantidad, 0), [items]);
  const iva = useMemo(() => calcularIva(neto), [neto]);

  const value = useMemo<QuoteContextValue>(
    () => ({
      items,
      count: items.reduce((acc, i) => acc + i.cantidad, 0),
      neto,
      iva,
      total: neto + iva,
      abierto,
      abrir: () => setAbierto(true),
      cerrar: () => setAbierto(false),
      agregar,
      quitar,
      cambiarCantidad,
      vaciar,
      notificar,
    }),
    [items, neto, iva, abierto, agregar, quitar, cambiarCantidad, vaciar, notificar]
  );

  return (
    <QuoteContext.Provider value={value}>
      {children}
      {/* Toast global */}
      <div className="fixed inset-x-0 bottom-5 z-[120] flex justify-center px-4 pointer-events-none">
        {toast && (
          <div
            role="status"
            className={`pointer-events-auto flex items-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-semibold text-white shadow-2xl animate-fade-up ${
              toast.tipo === 'ok' ? 'bg-navy-900' : 'bg-brand-700'
            }`}
          >
            {toast.tipo === 'ok' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-300 shrink-0" />
            )}
            <span className="max-w-md">{toast.mensaje}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-2 rounded-full p-1 hover:bg-white/10"
              aria-label="Cerrar aviso"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </QuoteContext.Provider>
  );
}

export function useQuote() {
  const ctx = useContext(QuoteContext);
  if (!ctx) throw new Error('useQuote debe usarse dentro de QuoteProvider');
  return ctx;
}
