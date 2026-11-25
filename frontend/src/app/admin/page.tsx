'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Package,
  PackagePlus,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  ShoppingCart,
  Trash2,
  UserCog,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { api, ApiError, leerToken, API_URL } from '@/lib/api';
import { formatearCLP } from '@/lib/catalogo';

/* ==========================================================================
   Tipos
   ========================================================================== */
type Tab = 'resumen' | 'productos' | 'cotizaciones' | 'usuarios' | 'auditoria';

interface ApiCategoria {
  id: string;
  nombre: string;
  slug: string;
  total_productos: number;
}

interface ApiVariante {
  id: string;
  sku: string;
  medida: string;
  precio: number;
  precio_anterior: number | null;
  unidad: string;
  stock: number;
  activo: boolean;
}

interface ApiProducto {
  id: string;
  sku: string;
  nombre: string;
  descripcion: string | null;
  imagen_url: string | null;
  unidad: string;
  etiqueta: string | null;
  destacado: boolean;
  activo: boolean;
  category_id: string | null;
  categoria_nombre: string | null;
  precio_base: number;
  stock: number;
  variantes: ApiVariante[];
}

interface ApiStats {
  productos: number;
  categorias: number;
  cotizaciones: number;
  cotizaciones_pendientes: number;
  usuarios: number;
  ventas_cotizadas: number;
  ultimas_cotizaciones: ApiCotizacion[];
}

interface ApiCotizacionItem {
  id: string;
  nombre_producto: string;
  medida: string | null;
  unidad: string | null;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

interface ApiCotizacion {
  id: string;
  folio: number | null;
  nombre_contacto: string;
  email: string;
  telefono: string | null;
  empresa: string | null;
  rut: string | null;
  total_neto: number;
  iva: number;
  total_total: number;
  estado: string;
  created_at: string;
  comentarios?: string | null;
  items: ApiCotizacionItem[];
}

interface ApiUsuario {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  rut: string | null;
  role: string;
  auth_provider: string;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

interface ApiLog {
  id: string;
  user_id: string | null;
  accion: string;
  detalles: string | null;
  ip_address: string | null;
  timestamp: string;
}

const ESTADOS = ['PENDIENTE', 'EN_REVISION', 'RESPONDIDA', 'APROBADA', 'RECHAZADA'] as const;

const ESTADO_CLASE: Record<string, string> = {
  PENDIENTE: 'bg-amber-50 text-amber-700 border-amber-200',
  EN_REVISION: 'bg-blue-50 text-blue-700 border-blue-200',
  RESPONDIDA: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  APROBADA: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  RECHAZADA: 'bg-brand-50 text-brand-700 border-brand-200',
};

const ROLES = ['CLIENTE', 'MAYORISTA', 'VENDEDOR', 'ADMIN'] as const;

/* ==========================================================================
   Utilidades
   ========================================================================== */
function fecha(valor: string | null): string {
  if (!valor) return '—';
  return new Date(valor).toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function skuAleatorio(prefijo = 'PA'): string {
  return `${prefijo}-${Date.now().toString().slice(-7)}${Math.floor(Math.random() * 90 + 10)}`;
}

function mensajeError(err: unknown): string {
  return err instanceof ApiError ? err.message : 'Ocurrió un error. Inténtalo nuevamente.';
}

/* ==========================================================================
   Helper: subir imagen al backend
   ========================================================================== */
async function subirImagen(archivo: File): Promise<string> {
  const token = leerToken();
  const form = new FormData();
  form.append('archivo', archivo);
  const respuesta = await fetch(`${API_URL}/api/productos/upload-imagen`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!respuesta.ok) {
    let mensaje = 'No se pudo subir la imagen.';
    try {
      const data = await respuesta.json();
      if (typeof data?.detail === 'string') mensaje = data.detail;
    } catch {
      /* ignore */
    }
    throw new ApiError(mensaje, respuesta.status);
  }
  const data = await respuesta.json();
  return data.url as string;
}

/* ==========================================================================
   Página
   ========================================================================== */
export default function AdminPage() {
  const router = useRouter();
  const { user, loading, isStaff, logout } = useAuth();
  const token = leerToken();

  const [tab, setTab] = useState<Tab>('resumen');
  const [stats, setStats] = useState<ApiStats | null>(null);
  const [categorias, setCategorias] = useState<ApiCategoria[]>([]);

  const [productos, setProductos] = useState<ApiProducto[]>([]);
  const [buscarProducto, setBuscarProducto] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [cargandoProductos, setCargandoProductos] = useState(false);

  const [cotizaciones, setCotizaciones] = useState<ApiCotizacion[]>([]);
  const [buscarCot, setBuscarCot] = useState('');
  const [cargandoCot, setCargandoCot] = useState(false);
  const [abierta, setAbierta] = useState<string | null>(null);

  const [usuarios, setUsuarios] = useState<ApiUsuario[]>([]);
  const [buscarUsuario, setBuscarUsuario] = useState('');
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);

  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [cargandoLogs, setCargandoLogs] = useState(false);

  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  const [editando, setEditando] = useState<ApiProducto | null>(null);
  const [creando, setCreando] = useState(false);
  const [creandoUsuario, setCreandoUsuario] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const notificar = useCallback((texto: string, tipo: 'ok' | 'error' = 'ok') => {
    setAviso({ texto, tipo });
    setTimeout(() => setAviso(null), 4200);
  }, []);

  /* ---------------------------------------------------------------- Carga */
  const cargarStats = useCallback(async () => {
    try {
      const [s, c] = await Promise.all([
        api<ApiStats>('/api/admin/stats', { token }),
        api<ApiCategoria[]>('/api/productos/categorias', { token }),
      ]);
      setStats(s);
      setCategorias(c);
    } catch (err) {
      notificar(mensajeError(err), 'error');
    }
  }, [token, notificar]);

  const cargarProductos = useCallback(async () => {
    if (!token) return;
    setCargandoProductos(true);
    try {
      const params = new URLSearchParams({ limit: '120', orden: 'nombre' });
      if (buscarProducto.trim()) params.set('q', buscarProducto.trim());
      if (categoriaFiltro) params.set('categoria', categoriaFiltro);
      const res = await api<{ total: number; items: ApiProducto[] }>(`/api/productos?${params}`, { token });
      setProductos(res.items);
    } catch (err) {
      notificar(mensajeError(err), 'error');
    } finally {
      setCargandoProductos(false);
    }
  }, [token, buscarProducto, categoriaFiltro, notificar]);

  const cargarCotizaciones = useCallback(async () => {
    if (!token) return;
    setCargandoCot(true);
    try {
      const params = new URLSearchParams({ limit: '200' });
      if (buscarCot.trim()) params.set('q', buscarCot.trim());
      const res = await api<{ total: number; items: ApiCotizacion[] }>(`/api/cotizaciones?${params}`, { token });
      setCotizaciones(res.items);
    } catch (err) {
      notificar(mensajeError(err), 'error');
    } finally {
      setCargandoCot(false);
    }
  }, [token, buscarCot, notificar]);

  const cargarUsuarios = useCallback(async () => {
    if (!token) return;
    setCargandoUsuarios(true);
    try {
      const qs = buscarUsuario.trim() ? `?q=${encodeURIComponent(buscarUsuario.trim())}` : '';
      const res = await api<ApiUsuario[]>(`/api/auth/usuarios${qs}`, { token });
      setUsuarios(res);
    } catch (err) {
      notificar(mensajeError(err), 'error');
    } finally {
      setCargandoUsuarios(false);
    }
  }, [token, buscarUsuario, notificar]);

  const cargarLogs = useCallback(async () => {
    if (!token) return;
    setCargandoLogs(true);
    try {
      const res = await api<ApiLog[]>('/api/auth/auditoria?limite=150', { token });
      setLogs(res);
    } catch (err) {
      notificar(mensajeError(err), 'error');
    } finally {
      setCargandoLogs(false);
    }
  }, [token, notificar]);

  useEffect(() => {
    if (isStaff) cargarStats();
  }, [isStaff, cargarStats]);

  useEffect(() => {
    if (!isStaff || tab !== 'productos') return;
    const t = setTimeout(cargarProductos, 300);
    return () => clearTimeout(t);
  }, [isStaff, tab, cargarProductos]);

  useEffect(() => {
    if (!isStaff || tab !== 'cotizaciones') return;
    const t = setTimeout(cargarCotizaciones, 300);
    return () => clearTimeout(t);
  }, [isStaff, tab, cargarCotizaciones]);

  useEffect(() => {
    if (!isStaff || tab !== 'usuarios') return;
    const t = setTimeout(cargarUsuarios, 300);
    return () => clearTimeout(t);
  }, [isStaff, tab, cargarUsuarios]);

  useEffect(() => {
    if (isStaff && tab === 'auditoria') cargarLogs();
  }, [isStaff, tab, cargarLogs]);

  /* ------------------------------------------------------------- Acciones */
  const cambiarEstado = async (cot: ApiCotizacion, estado: string) => {
    try {
      const actualizada = await api<ApiCotizacion>(`/api/cotizaciones/${cot.id}/estado`, {
        method: 'PATCH',
        token,
        body: { estado },
      });
      setCotizaciones((prev) => prev.map((c) => (c.id === cot.id ? actualizada : c)));
      notificar(`Cotización #${cot.folio ?? ''} actualizada a ${estado.replace('_', ' ').toLowerCase()}`);
      cargarStats();
    } catch (err) {
      notificar(mensajeError(err), 'error');
    }
  };

  const eliminarProducto = async (prod: ApiProducto) => {
    if (!window.confirm(`¿Desactivar "${prod.nombre}" del catálogo público?`)) return;
    try {
      await api(`/api/productos/${prod.id}`, { method: 'DELETE', token });
      notificar('Producto desactivado');
      cargarProductos();
      cargarStats();
    } catch (err) {
      notificar(mensajeError(err), 'error');
    }
  };

  const guardarProducto = async (data: {
    producto: ApiProducto;
    sku: string;
    nombre: string;
    descripcion: string;
    category_id: string;
    destacado: boolean;
    activo: boolean;
    etiqueta: string;
    imagen_url: string | null;
    variantes: ApiVariante[];
  }) => {
    setGuardando(true);
    try {
      await api(`/api/productos/${data.producto.id}`, {
        method: 'PUT',
        token,
        body: {
          sku: data.sku,
          nombre: data.nombre,
          descripcion: data.descripcion,
          category_id: data.category_id,
          destacado: data.destacado,
          activo: data.activo,
          etiqueta: data.etiqueta || null,
          imagen_url: data.imagen_url,
        },
      });
      for (const v of data.variantes) {
        await api(`/api/productos/variantes/${v.id}`, {
          method: 'PUT',
          token,
          body: {
            medida: v.medida,
            precio: Number(v.precio),
            precio_anterior: v.precio_anterior ? Number(v.precio_anterior) : null,
            unidad: v.unidad,
            stock: Number(v.stock),
          },
        });
      }
      notificar('Producto actualizado correctamente');
      setEditando(null);
      cargarProductos();
      cargarStats();
    } catch (err) {
      notificar(mensajeError(err), 'error');
    } finally {
      setGuardando(false);
    }
  };

  const crearProducto = async (payload: {
    nombre: string;
    sku: string;
    descripcion: string;
    category_id: string;
    unidad: string;
    etiqueta: string;
    destacado: boolean;
    imagen_url: string | null;
    variantes: { medida: string; precio: number; stock: number; unidad: string }[];
  }) => {
    setGuardando(true);
    try {
      const nombreCategoria = categorias.find((c) => c.id === payload.category_id)?.nombre ?? 'Plásticos América';
      await api('/api/productos', {
        method: 'POST',
        token,
        body: {
          sku: payload.sku,
          nombre: payload.nombre,
          descripcion: payload.descripcion || `${payload.nombre} de ${nombreCategoria}.`,
          imagen_url: payload.imagen_url,
          unidad: payload.unidad,
          etiqueta: payload.etiqueta || null,
          destacado: payload.destacado,
          category_id: payload.category_id || null,
          variantes: payload.variantes.map((v, i) => ({
            sku: `${payload.sku}-${i + 1}`,
            medida: v.medida,
            precio: Number(v.precio),
            precio_anterior: null,
            unidad: v.unidad,
            stock: Number(v.stock),
          })),
        },
      });
      notificar('Producto creado correctamente');
      setCreando(false);
      cargarProductos();
      cargarStats();
    } catch (err) {
      notificar(mensajeError(err), 'error');
    } finally {
      setGuardando(false);
    }
  };

  const actualizarUsuario = async (u: ApiUsuario, cambios: { role?: string; is_active?: boolean }) => {
    try {
      const actualizado = await api<ApiUsuario>(`/api/auth/usuarios/${u.id}`, {
        method: 'PATCH',
        token,
        body: cambios,
      });
      setUsuarios((prev) => prev.map((x) => (x.id === u.id ? actualizado : x)));
      notificar('Usuario actualizado');
    } catch (err) {
      notificar(mensajeError(err), 'error');
    }
  };

  const crearUsuario = async (payload: {
    nombre: string;
    email: string;
    password: string;
    role: string;
    rut: string;
    telefono: string;
  }) => {
    setGuardando(true);
    try {
      await api('/api/auth/usuarios', {
        method: 'POST',
        token,
        body: {
          nombre: payload.nombre,
          email: payload.email,
          password: payload.password,
          role: payload.role,
          rut: payload.rut || undefined,
          telefono: payload.telefono || undefined,
        },
      });
      notificar('Trabajador creado correctamente');
      setCreandoUsuario(false);
      cargarUsuarios();
      cargarStats();
    } catch (err) {
      notificar(mensajeError(err), 'error');
    } finally {
      setGuardando(false);
    }
  };

  const pendientes = useMemo(
    () => cotizaciones.filter((c) => c.estado === 'PENDIENTE' || c.estado === 'EN_REVISION').length,
    [cotizaciones]
  );

  /* ------------------------------------------------------------ Vistas */
  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-brand-700" />
        <p className="text-sm font-semibold text-slate-500">Verificando permisos…</p>
      </div>
    );
  }

  if (!user || !isStaff) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
        <span className="grid h-20 w-20 place-items-center rounded-3xl bg-navy-900 text-white shadow-xl">
          <ShieldCheck className="h-9 w-9" />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold text-navy-950">Panel de trabajadores</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Esta sección es exclusiva para el equipo de Plásticos América. Inicia sesión con tu cuenta
          corporativa para gestionar productos, cotizaciones y usuarios.
        </p>
        {user && !isStaff && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-xs font-semibold text-amber-900">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            Tu cuenta ({user.email}) no tiene permisos de administración. Solicita acceso a un administrador.
          </div>
        )}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link
            href="/login?next=/admin"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-sm font-bold text-white hover:bg-brand-800"
          >
            <Lock className="h-4 w-4" /> Iniciar sesión
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-navy-900 hover:bg-sand-50"
          >
            Volver al inicio
          </Link>
        </div>
        {user && (
          <button
            type="button"
            onClick={() => {
              logout();
              router.refresh();
            }}
            className="mt-4 text-xs font-bold text-slate-500 hover:text-brand-700"
          >
            Cerrar sesión de {user.email}
          </button>
        )}
      </div>
    );
  }

  const tabs: { id: Tab; nombre: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'resumen', nombre: 'Resumen', icon: BarChart3 },
    { id: 'productos', nombre: 'Productos', icon: Package },
    { id: 'cotizaciones', nombre: 'Cotizaciones', icon: ClipboardList, badge: pendientes || undefined },
    { id: 'usuarios', nombre: 'Usuarios', icon: Users },
    { id: 'auditoria', nombre: 'Auditoría', icon: Activity },
  ];

  return (
    <div className="min-h-[80vh] bg-[#f4f6f8] pb-16">
      {/* Barra superior */}
      <div className="border-b border-white/10 bg-navy-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-700 text-white">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-brand-200">Panel interno</p>
              <h1 className="text-lg font-extrabold">Administración Plásticos América</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-bold">{user.nombre}</p>
              <p className="text-[10px] text-white/50">{user.email} · {user.role}</p>
            </div>
            <Link
              href="/"
              className="rounded-lg border border-white/20 px-3 py-2 text-[11px] font-bold text-white/90 transition hover:bg-white/10"
            >
              Ver sitio
            </Link>
            <button
              type="button"
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="rounded-lg bg-white/10 p-2 text-white/80 transition hover:bg-white/20"
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4">
        {/* Tabs */}
        <div className="mt-4 flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm no-scrollbar">
          {tabs.map(({ id, nombre, icon: Icon, badge }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2.5 text-xs font-bold transition ${
                tab === id ? 'bg-navy-900 text-white shadow' : 'text-slate-600 hover:bg-sand-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              {nombre}
              {badge ? (
                <span className="grid h-4 min-w-4 place-items-center rounded-full bg-brand-700 px-1 text-[9px] font-extrabold text-white">
                  {badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {aviso && (
          <div
            className={`mt-4 flex items-start gap-2 rounded-xl border px-4 py-3 text-xs font-semibold ${
              aviso.tipo === 'ok'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-brand-200 bg-brand-50 text-brand-800'
            }`}
          >
            {aviso.tipo === 'ok' ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : <AlertCircle className="mt-0.5 h-4 w-4" />}
            {aviso.texto}
          </div>
        )}

        {/* ------------------------------------------------------- RESUMEN */}
        {tab === 'resumen' && (
          <div className="mt-5">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { icon: Package, label: 'Productos activos', valor: stats?.productos ?? '—' },
                { icon: ClipboardList, label: 'Cotizaciones', valor: stats?.cotizaciones ?? '—' },
                { icon: AlertCircle, label: 'Pendientes', valor: stats?.cotizaciones_pendientes ?? '—' },
                { icon: DollarSign, label: 'Total cotizado', valor: stats ? formatearCLP(stats.ventas_cotizadas) : '—' },
              ].map(({ icon: Icon, label, valor }) => (
                <div key={label} className="rounded-2xl border border-black/[0.05] bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-700">
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
                  </div>
                  <p className="mt-2 text-xl font-extrabold text-navy-900">{valor}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-black/[0.05] bg-white p-5 shadow-sm lg:col-span-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-extrabold text-navy-900">Últimas cotizaciones</h2>
                  <button onClick={cargarStats} className="flex items-center gap-1 text-[10px] font-bold text-brand-700 hover:underline">
                    <RefreshCw className="h-3 w-3" /> Actualizar
                  </button>
                </div>
                <div className="mt-3 divide-y divide-slate-100">
                  {(stats?.ultimas_cotizaciones ?? []).length === 0 && (
                    <p className="py-6 text-center text-xs text-slate-400">Aún no hay cotizaciones registradas.</p>
                  )}
                  {(stats?.ultimas_cotizaciones ?? []).map((c) => (
                    <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-navy-900">
                          #{c.folio ?? '—'} · {c.nombre_contacto}
                        </p>
                        <p className="truncate text-[10px] text-slate-500">{c.email} · {fecha(c.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${ESTADO_CLASE[c.estado] ?? ''}`}>
                          {c.estado.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-extrabold text-navy-900">{formatearCLP(c.total_total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setTab('cotizaciones')}
                  className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-brand-700 hover:underline"
                >
                  Ver todas <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-black/[0.05] bg-white p-5 shadow-sm">
                  <h2 className="text-sm font-extrabold text-navy-900">Accesos rápidos</h2>
                  <div className="mt-3 grid gap-2">
                    <button
                      onClick={() => {
                        setTab('productos');
                        setCreando(true);
                      }}
                      className="flex items-center justify-between rounded-lg bg-brand-50 px-3 py-2.5 text-xs font-bold text-brand-700 hover:bg-brand-100"
                    >
                      <span className="flex items-center gap-2"><PackagePlus className="h-4 w-4" /> Nuevo producto</span>
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setTab('cotizaciones')}
                      className="flex items-center justify-between rounded-lg bg-sand-100 px-3 py-2.5 text-xs font-bold text-navy-900 hover:bg-sand-200"
                    >
                      <span className="flex items-center gap-2"><ClipboardList className="h-4 w-4 text-brand-700" /> Revisar cotizaciones</span>
                      <span className="rounded-full bg-white px-1.5 text-[10px]">{stats?.cotizaciones_pendientes ?? 0}</span>
                    </button>
                    <button
                      onClick={() => {
                        setTab('usuarios');
                        setCreandoUsuario(true);
                      }}
                      className="flex items-center justify-between rounded-lg bg-sand-100 px-3 py-2.5 text-xs font-bold text-navy-900 hover:bg-sand-200"
                    >
                      <span className="flex items-center gap-2"><UserCog className="h-4 w-4 text-brand-700" /> Nuevo trabajador</span>
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl bg-navy-900 p-5 text-white">
                  <h2 className="text-sm font-extrabold">Datos del negocio</h2>
                  <ul className="mt-2 space-y-1.5 text-[11px] text-white/70">
                    <li className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-brand-300" /> Santa Elena 825 y 835</li>
                    <li className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-brand-300" /> 22 338 6700</li>
                    <li className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-brand-300" /> ventas@plasticosamerica.cl</li>
                    <li className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-brand-300" /> {stats?.usuarios ?? '—'} usuarios registrados</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------- PRODUCTOS */}
        {tab === 'productos' && (
          <div className="mt-5">
            <div className="flex flex-col justify-between gap-3 rounded-2xl border border-black/[0.05] bg-white p-4 shadow-sm sm:flex-row sm:items-center">
              <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={buscarProducto}
                    onChange={(e) => setBuscarProducto(e.target.value)}
                    placeholder="Buscar por nombre, SKU o medida…"
                    className="w-full rounded-xl border border-slate-200 bg-sand-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand-700/50 focus:bg-white"
                  />
                </div>
                <select
                  value={categoriaFiltro}
                  onChange={(e) => setCategoriaFiltro(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-sand-50 px-3 py-2.5 text-xs font-semibold text-navy-900 outline-none focus:border-brand-700/50"
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.nombre} ({c.total_productos})
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => setCreando(true)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-brand-800"
              >
                <Plus className="h-4 w-4" /> Nuevo producto
              </button>
            </div>

            <div className="mt-3 overflow-hidden rounded-2xl border border-black/[0.05] bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-xs">
                  <thead className="bg-sand-50 text-[10px] uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-bold">Producto</th>
                      <th className="px-4 py-3 font-bold">Categoría</th>
                      <th className="px-4 py-3 font-bold">Medidas</th>
                      <th className="px-4 py-3 font-bold">Precio desde</th>
                      <th className="px-4 py-3 font-bold">Estado</th>
                      <th className="px-4 py-3 text-right font-bold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cargandoProductos ? (
                      Array.from({ length: 6 }).map((_, i) => (
                        <tr key={i}>
                          <td colSpan={6} className="px-4 py-3">
                            <div className="skeleton h-8 rounded" />
                          </td>
                        </tr>
                      ))
                    ) : productos.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                          No se encontraron productos con ese filtro.
                        </td>
                      </tr>
                    ) : (
                      productos.map((p) => (
                        <tr key={p.id} className="hover:bg-sand-50/60">
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2.5">
                              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-sand-50">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={p.imagen_url || '/logo.png'} alt={p.nombre} className="h-full w-full object-contain p-0.5" />
                              </div>
                              <div className="min-w-0">
                                <p className="line-clamp-1 max-w-[260px] font-bold text-navy-900">{p.nombre}</p>
                                <p className="font-mono text-[10px] text-slate-400">{p.sku}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-slate-600">{p.categoria_nombre ?? '—'}</td>
                          <td className="px-4 py-2.5 font-semibold text-slate-700">{p.variantes.length}</td>
                          <td className="px-4 py-2.5 font-bold text-navy-900">{formatearCLP(p.precio_base)}</td>
                          <td className="px-4 py-2.5">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${p.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                              {p.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => setEditando(p)}
                                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-brand-50 hover:text-brand-700"
                                title="Editar"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <Link
                                href={`/catalogo/${p.id}`}
                                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-navy-50 hover:text-navy-900"
                                title="Ver en el sitio"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                              <button
                                type="button"
                                onClick={() => eliminarProducto(p)}
                                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-brand-50 hover:text-brand-700"
                                title="Desactivar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 bg-sand-50 px-4 py-2.5 text-[10px] text-slate-500">
                <span>{productos.length} productos mostrados</span>
                <span>Los cambios se reflejan de inmediato en el sitio</span>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------- COTIZACIONES */}
        {tab === 'cotizaciones' && (
          <div className="mt-5">
            <div className="flex flex-col justify-between gap-3 rounded-2xl border border-black/[0.05] bg-white p-4 shadow-sm sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={buscarCot}
                  onChange={(e) => setBuscarCot(e.target.value)}
                  placeholder="Buscar por cliente, email, RUT o empresa…"
                  className="w-full rounded-xl border border-slate-200 bg-sand-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand-700/50 focus:bg-white"
                />
              </div>
              <button
                type="button"
                onClick={cargarCotizaciones}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-navy-900 hover:bg-sand-50"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Actualizar
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {cargandoCot ? (
                Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)
              ) : cotizaciones.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-400">
                  No hay cotizaciones que coincidan con la búsqueda.
                </div>
              ) : (
                cotizaciones.map((c) => (
                  <div key={c.id} className="overflow-hidden rounded-2xl border border-black/[0.05] bg-white shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setAbierta((a) => (a === c.id ? null : c.id))}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-sand-100 text-[10px] font-extrabold text-navy-900">
                          #{c.folio ?? '—'}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-navy-900">
                            {c.nombre_contacto}
                            {c.empresa ? <span className="font-medium text-slate-400"> · {c.empresa}</span> : null}
                          </p>
                          <p className="truncate text-[10px] text-slate-500">
                            {c.email} · {fecha(c.created_at)} · {c.items.length} ítem(s)
                          </p>
                        </div>
                      </button>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-extrabold text-navy-900">{formatearCLP(c.total_total)}</span>
                        <select
                          value={c.estado}
                          onChange={(e) => cambiarEstado(c, e.target.value)}
                          className={`rounded-lg border px-2 py-1.5 text-[10px] font-bold outline-none ${ESTADO_CLASE[c.estado] ?? ''}`}
                        >
                          {ESTADOS.map((e) => (
                            <option key={e} value={e}>
                              {e.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {abierta === c.id && (
                      <div className="border-t border-slate-100 bg-sand-50/60 px-4 py-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="text-[11px] text-slate-600">
                            <p><strong className="text-navy-900">RUT:</strong> {c.rut ?? '—'}</p>
                            <p><strong className="text-navy-900">Teléfono:</strong> {c.telefono ?? '—'}</p>
                            <p><strong className="text-navy-900">Email:</strong> {c.email}</p>
                            <p className="mt-1"><strong className="text-navy-900">Comentarios:</strong> {c.comentarios || 'Sin comentarios'}</p>
                          </div>
                          <div>
                            <ul className="space-y-1">
                              {c.items.map((it) => (
                                <li key={it.id} className="flex items-center justify-between gap-2 text-[11px]">
                                  <span className="min-w-0 text-slate-600">
                                    {it.nombre_producto}{it.medida ? ` · ${it.medida}` : ''} × {it.cantidad}
                                  </span>
                                  <span className="shrink-0 font-semibold text-navy-900">{formatearCLP(it.subtotal)}</span>
                                </li>
                              ))}
                            </ul>
                            <div className="mt-2 flex justify-between border-t border-slate-200 pt-1.5 text-[11px] font-bold text-navy-900">
                              <span>Neto {formatearCLP(c.total_neto)} · IVA {formatearCLP(c.iva)}</span>
                              <span>Total {formatearCLP(c.total_total)}</span>
                            </div>
                          </div>
                        </div>
                        <a
                          href={`mailto:${c.email}?subject=${encodeURIComponent(`Respuesta cotización #${c.folio ?? ''} - Plásticos América`)}`}
                          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-navy-900 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-brand-700"
                        >
                          <Mail className="h-3 w-3" /> Responder por correo
                        </a>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------ USUARIOS */}
        {tab === 'usuarios' && (
          <div className="mt-5">
            <div className="flex flex-col justify-between gap-3 rounded-2xl border border-black/[0.05] bg-white p-4 shadow-sm sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={buscarUsuario}
                  onChange={(e) => setBuscarUsuario(e.target.value)}
                  placeholder="Buscar por nombre, email o RUT…"
                  className="w-full rounded-xl border border-slate-200 bg-sand-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand-700/50 focus:bg-white"
                />
              </div>
              <button
                type="button"
                onClick={() => setCreandoUsuario(true)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-brand-800"
              >
                <UserCog className="h-4 w-4" /> Nuevo trabajador
              </button>
            </div>

            <div className="mt-3 overflow-hidden rounded-2xl border border-black/[0.05] bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-xs">
                  <thead className="bg-sand-50 text-[10px] uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-bold">Usuario</th>
                      <th className="px-4 py-3 font-bold">RUT</th>
                      <th className="px-4 py-3 font-bold">Rol</th>
                      <th className="px-4 py-3 font-bold">Acceso</th>
                      <th className="px-4 py-3 font-bold">Último ingreso</th>
                      <th className="px-4 py-3 text-right font-bold">Activo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cargandoUsuarios ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i}>
                          <td colSpan={6} className="px-4 py-3"><div className="skeleton h-8 rounded" /></td>
                        </tr>
                      ))
                    ) : usuarios.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-slate-400">Sin usuarios para mostrar.</td>
                      </tr>
                    ) : (
                      usuarios.map((u) => (
                        <tr key={u.id} className="hover:bg-sand-50/60">
                          <td className="px-4 py-2.5">
                            <p className="font-bold text-navy-900">{u.nombre}</p>
                            <p className="text-[10px] text-slate-500">{u.email}</p>
                          </td>
                          <td className="px-4 py-2.5 text-slate-600">{u.rut ?? '—'}</td>
                          <td className="px-4 py-2.5">
                            <select
                              value={u.role}
                              onChange={(e) => actualizarUsuario(u, { role: e.target.value })}
                              disabled={u.id === user.id}
                              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-navy-900 outline-none disabled:opacity-60"
                            >
                              {ROLES.map((r) => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-2.5">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${u.auth_provider === 'GOOGLE' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                              {u.auth_provider === 'GOOGLE' ? 'Google' : 'Correo'}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-[10px] text-slate-500">{fecha(u.last_login)}</td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => actualizarUsuario(u, { is_active: !u.is_active })}
                              disabled={u.id === user.id}
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition disabled:opacity-50 ${
                                u.is_active ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              {u.is_active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                              {u.is_active ? 'Activo' : 'Inactivo'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------- AUDITORÍA */}
        {tab === 'auditoria' && (
          <div className="mt-5 rounded-2xl border border-black/[0.05] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-navy-900">Registro de actividad</h2>
                <p className="text-[11px] text-slate-500">Últimos 150 eventos de usuarios y administradores.</p>
              </div>
              <button onClick={cargarLogs} className="flex items-center gap-1 text-[10px] font-bold text-brand-700 hover:underline">
                <RefreshCw className="h-3 w-3" /> Actualizar
              </button>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {cargandoLogs ? (
                Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton my-2 h-10 rounded" />)
              ) : logs.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">Sin eventos registrados.</p>
              ) : (
                logs.map((l) => (
                  <div key={l.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-sand-100 text-brand-700">
                        <Activity className="h-3.5 w-3.5" />
                      </span>
                      <div>
                        <p className="text-[11px] font-bold text-navy-900">{l.accion}</p>
                        <p className="text-[10px] text-slate-500">{l.detalles ?? '—'}</p>
                      </div>
                    </div>
                    <div className="text-right text-[10px] text-slate-400">
                      <p>{fecha(l.timestamp)}</p>
                      <p>{l.ip_address ?? '—'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      {editando && (
        <ModalProducto
          producto={editando}
          categorias={categorias}
          guardando={guardando}
          onCerrar={() => setEditando(null)}
          onGuardar={guardarProducto}
        />
      )}

      {creando && (
        <ModalNuevoProducto
          categorias={categorias}
          guardando={guardando}
          onCerrar={() => setCreando(false)}
          onCrear={crearProducto}
        />
      )}

      {creandoUsuario && (
        <ModalNuevoUsuario
          guardando={guardando}
          onCerrar={() => setCreandoUsuario(false)}
          onCrear={crearUsuario}
        />
      )}
    </div>
  );
}

/* ==========================================================================
   Modal: editar producto
   ========================================================================== */
function ModalProducto({
  producto,
  categorias,
  guardando,
  onCerrar,
  onGuardar,
}: {
  producto: ApiProducto;
  categorias: ApiCategoria[];
  guardando: boolean;
  onCerrar: () => void;
  onGuardar: (data: {
    producto: ApiProducto;
    sku: string;
    nombre: string;
    descripcion: string;
    category_id: string;
    destacado: boolean;
    activo: boolean;
    etiqueta: string;
    imagen_url: string | null;
    variantes: ApiVariante[];
  }) => void;
}) {
  const [sku, setSku] = useState(producto.sku);
  const [nombre, setNombre] = useState(producto.nombre);
  const [descripcion, setDescripcion] = useState(producto.descripcion ?? '');
  const [categoryId, setCategoryId] = useState(producto.category_id ?? '');
  const [imagenUrl, setImagenUrl] = useState<string | null>(producto.imagen_url);
  const [subiendo, setSubiendo] = useState(false);
  const [destacado, setDestacado] = useState(producto.destacado);
  const [activo, setActivo] = useState(producto.activo);
  const [etiqueta, setEtiqueta] = useState(producto.etiqueta ?? '');
  const [variantes, setVariantes] = useState<ApiVariante[]>(producto.variantes);

  const campo = 'w-full rounded-lg border border-slate-200 bg-sand-50 px-3 py-2 text-sm outline-none focus:border-brand-700/50 focus:bg-white';

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-navy-950/60 p-4 backdrop-blur-sm">
      <div className="my-6 w-full max-w-3xl rounded-2xl bg-white shadow-2xl animate-scale-in">
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <div>
            <h2 className="text-sm font-extrabold text-navy-900">Editar producto</h2>
            <p className="font-mono text-[10px] text-slate-400">{producto.sku}</p>
          </div>
          <button onClick={onCerrar} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">SKU</label>
              <input value={sku} onChange={(e) => setSku(e.target.value)} className={`${campo} font-mono`} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Nombre</label>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} className={campo} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Categoría</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={campo}>
                <option value="">Sin categoría</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Etiqueta</label>
              <select value={etiqueta} onChange={(e) => setEtiqueta(e.target.value)} className={campo}>
                <option value="">Sin etiqueta</option>
                <option value="Nuevo">Nuevo</option>
                <option value="Más vendido">Más vendido</option>
                <option value="Oferta">Oferta</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Descripción</label>
              <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={2} className={campo} />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Imagen del producto</label>
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-sand-50">
                {imagenUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagenUrl} alt="preview" className="h-full w-full object-contain p-0.5" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-[9px] text-slate-400">Sin imagen</div>
                )}
              </div>
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-navy-900 hover:bg-sand-50">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setSubiendo(true);
                    try {
                      const url = await subirImagen(file);
                      setImagenUrl(url);
                    } catch (err) {
                      alert(err instanceof Error ? err.message : 'No se pudo subir la imagen.');
                    } finally {
                      setSubiendo(false);
                      e.target.value = '';
                    }
                  }}
                />
                {subiendo ? 'Subiendo…' : 'Subir imagen'}
              </label>
              {imagenUrl && (
                <button type="button" onClick={() => setImagenUrl(null)} className="text-[10px] font-bold text-brand-700 hover:underline">
                  Quitar
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-slate-600">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={destacado} onChange={(e) => setDestacado(e.target.checked)} className="h-4 w-4 accent-[#8b0000]" />
              Producto destacado
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} className="h-4 w-4 accent-[#8b0000]" />
              Activo en el catálogo
            </label>
          </div>

          <div className="mt-5">
            <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-navy-900">Medidas y precios</h3>
            <div className="mt-2 space-y-2">
              {variantes.map((v, i) => (
                <div key={v.id} className="grid grid-cols-2 gap-2 rounded-lg bg-sand-50 p-2 sm:grid-cols-12">
                  <div className="sm:col-span-3">
                    <label className="mb-0.5 block text-[9px] font-bold uppercase text-slate-400">Medida</label>
                    <input
                      value={v.medida}
                      onChange={(e) => setVariantes((prev) => prev.map((x, j) => (j === i ? { ...x, medida: e.target.value } : x)))}
                      className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-brand-700/50"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-0.5 block text-[9px] font-bold uppercase text-slate-400">Unidad</label>
                    <input
                      value={v.unidad}
                      onChange={(e) => setVariantes((prev) => prev.map((x, j) => (j === i ? { ...x, unidad: e.target.value } : x)))}
                      className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-brand-700/50"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="mb-0.5 block text-[9px] font-bold uppercase text-slate-400">Precio neto</label>
                    <input
                      type="number"
                      min={0}
                      value={v.precio}
                      onChange={(e) => setVariantes((prev) => prev.map((x, j) => (j === i ? { ...x, precio: Number(e.target.value) } : x)))}
                      className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold outline-none focus:border-brand-700/50"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-0.5 block text-[9px] font-bold uppercase text-slate-400">Stock</label>
                    <input
                      type="number"
                      min={0}
                      value={v.stock}
                      onChange={(e) => setVariantes((prev) => prev.map((x, j) => (j === i ? { ...x, stock: Number(e.target.value) } : x)))}
                      className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-brand-700/50"
                    />
                  </div>
                  <div className="flex items-end sm:col-span-2">
                    <span className="text-[10px] font-mono text-slate-400">SKU {v.sku}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3.5">
          <button onClick={onCerrar} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-navy-900 hover:bg-sand-50">
            Cancelar
          </button>
          <button
            disabled={guardando}
            onClick={() =>
              onGuardar({
                producto,
                sku,
                nombre,
                descripcion,
                category_id: categoryId,
                destacado,
                activo,
                etiqueta,
                imagen_url: imagenUrl,
                variantes,
              })
            }
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-xs font-extrabold text-white hover:bg-brand-800 disabled:opacity-60"
          >
            {guardando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Guardar cambios
          </button>
        </footer>
      </div>
    </div>
  );
}

/* ==========================================================================
   Modal: nuevo producto
   ========================================================================== */
function ModalNuevoProducto({
  categorias,
  guardando,
  onCerrar,
  onCrear,
}: {
  categorias: ApiCategoria[];
  guardando: boolean;
  onCerrar: () => void;
  onCrear: (payload: {
    nombre: string;
    sku: string;
    descripcion: string;
    category_id: string;
    unidad: string;
    etiqueta: string;
    destacado: boolean;
    imagen_url: string | null;
    variantes: { medida: string; precio: number; stock: number; unidad: string }[];
  }) => void;
}) {
  const [nombre, setNombre] = useState('');
  const [sku, setSku] = useState(skuAleatorio());
  const [descripcion, setDescripcion] = useState('');
  const [categoryId, setCategoryId] = useState(categorias[0]?.id ?? '');
  const [unidad, setUnidad] = useState('unidad');
  const [etiqueta, setEtiqueta] = useState('Nuevo');
  const [destacado, setDestacado] = useState(false);
  const [imagenUrl, setImagenUrl] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [variantes, setVariantes] = useState([{ medida: '', precio: 0, stock: 0, unidad: 'unidad' }]);

  const campo = 'w-full rounded-lg border border-slate-200 bg-sand-50 px-3 py-2 text-sm outline-none focus:border-brand-700/50 focus:bg-white';

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-navy-950/60 p-4 backdrop-blur-sm">
      <div className="my-6 w-full max-w-2xl rounded-2xl bg-white shadow-2xl animate-scale-in">
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <h2 className="text-sm font-extrabold text-navy-900">Nuevo producto</h2>
          <button onClick={onCerrar} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Nombre *</label>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Codo PVC 90° cementar" className={campo} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">SKU *</label>
              <input value={sku} onChange={(e) => setSku(e.target.value)} className={`${campo} font-mono`} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Categoría</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={campo}>
                <option value="">Sin categoría</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Descripción</label>
              <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={2} className={campo} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Unidad base</label>
              <input value={unidad} onChange={(e) => setUnidad(e.target.value)} className={campo} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Etiqueta</label>
              <select value={etiqueta} onChange={(e) => setEtiqueta(e.target.value)} className={campo}>
                <option value="">Sin etiqueta</option>
                <option value="Nuevo">Nuevo</option>
                <option value="Más vendido">Más vendido</option>
              </select>
            </div>
          </div>

          <div className="mt-3">
            <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Imagen del producto</label>
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-sand-50">
                {imagenUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagenUrl} alt="preview" className="h-full w-full object-contain p-0.5" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-[9px] text-slate-400">Sin imagen</div>
                )}
              </div>
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-navy-900 hover:bg-sand-50">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setSubiendo(true);
                    try {
                      const url = await subirImagen(file);
                      setImagenUrl(url);
                    } catch (err) {
                      alert(err instanceof Error ? err.message : 'No se pudo subir la imagen.');
                    } finally {
                      setSubiendo(false);
                      e.target.value = '';
                    }
                  }}
                />
                {subiendo ? 'Subiendo…' : 'Subir imagen'}
              </label>
              {imagenUrl && (
                <button type="button" onClick={() => setImagenUrl(null)} className="text-[10px] font-bold text-brand-700 hover:underline">
                  Quitar
                </button>
              )}
            </div>
          </div>

          <label className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-600">
            <input type="checkbox" checked={destacado} onChange={(e) => setDestacado(e.target.checked)} className="h-4 w-4 accent-[#8b0000]" />
            Destacar en la página de inicio
          </label>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-navy-900">Medidas</h3>
              <button
                type="button"
                onClick={() => setVariantes((v) => [...v, { medida: '', precio: 0, stock: 0, unidad }])}
                className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1.5 text-[10px] font-bold text-brand-700 hover:bg-brand-100"
              >
                <Plus className="h-3 w-3" /> Agregar medida
              </button>
            </div>
            <div className="mt-2 space-y-2">
              {variantes.map((v, i) => (
                <div key={i} className="grid grid-cols-2 gap-2 rounded-lg bg-sand-50 p-2 sm:grid-cols-12">
                  <div className="sm:col-span-4">
                    <label className="mb-0.5 block text-[9px] font-bold uppercase text-slate-400">Medida</label>
                    <input
                      value={v.medida}
                      onChange={(e) => setVariantes((prev) => prev.map((x, j) => (j === i ? { ...x, medida: e.target.value } : x)))}
                      placeholder="20 mm / 1/2&quot;"
                      className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-brand-700/50"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="mb-0.5 block text-[9px] font-bold uppercase text-slate-400">Precio neto</label>
                    <input
                      type="number"
                      min={0}
                      value={v.precio}
                      onChange={(e) => setVariantes((prev) => prev.map((x, j) => (j === i ? { ...x, precio: Number(e.target.value) } : x)))}
                      className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold outline-none focus:border-brand-700/50"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-0.5 block text-[9px] font-bold uppercase text-slate-400">Stock</label>
                    <input
                      type="number"
                      min={0}
                      value={v.stock}
                      onChange={(e) => setVariantes((prev) => prev.map((x, j) => (j === i ? { ...x, stock: Number(e.target.value) } : x)))}
                      className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-brand-700/50"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-0.5 block text-[9px] font-bold uppercase text-slate-400">Unidad</label>
                    <input
                      value={v.unidad}
                      onChange={(e) => setVariantes((prev) => prev.map((x, j) => (j === i ? { ...x, unidad: e.target.value } : x)))}
                      className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-brand-700/50"
                    />
                  </div>
                  <div className="flex items-end sm:col-span-1">
                    <button
                      type="button"
                      onClick={() => setVariantes((prev) => (prev.length > 1 ? prev.filter((_, j) => j !== i) : prev))}
                      className="rounded-md p-1.5 text-slate-400 hover:bg-brand-50 hover:text-brand-700"
                      aria-label="Quitar medida"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3.5">
          <button onClick={onCerrar} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-navy-900 hover:bg-sand-50">
            Cancelar
          </button>
          <button
            disabled={guardando || !nombre.trim() || !sku.trim()}
            onClick={() =>
              onCrear({
                nombre: nombre.trim(),
                sku: sku.trim(),
                descripcion,
                category_id: categoryId,
                unidad,
                etiqueta,
                destacado,
                imagen_url: imagenUrl,
                variantes: variantes.filter((v) => v.medida.trim()).map((v) => ({ ...v, unidad: v.unidad || unidad })),
              })
            }
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-xs font-extrabold text-white hover:bg-brand-800 disabled:opacity-50"
          >
            {guardando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PackagePlus className="h-3.5 w-3.5" />}
            Crear producto
          </button>
        </footer>
      </div>
    </div>
  );
}

/* ==========================================================================
   Modal: nuevo trabajador
   ========================================================================== */
function ModalNuevoUsuario({
  guardando,
  onCerrar,
  onCrear,
}: {
  guardando: boolean;
  onCerrar: () => void;
  onCrear: (payload: { nombre: string; email: string; password: string; role: string; rut: string; telefono: string }) => void;
}) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('VENDEDOR');
  const [rut, setRut] = useState('');
  const [telefono, setTelefono] = useState('');
  const [ver, setVer] = useState(false);

  const campo = 'w-full rounded-lg border border-slate-200 bg-sand-50 px-3 py-2 text-sm outline-none focus:border-brand-700/50 focus:bg-white';

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-navy-950/60 p-4 backdrop-blur-sm">
      <div className="my-6 w-full max-w-lg rounded-2xl bg-white shadow-2xl animate-scale-in">
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <div>
            <h2 className="text-sm font-extrabold text-navy-900">Nuevo trabajador</h2>
            <p className="text-[10px] text-slate-500">Crea una cuenta con acceso al panel interno.</p>
          </div>
          <button onClick={onCerrar} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="space-y-3 px-5 py-4">
          <div>
            <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Nombre *</label>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} className={campo} />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Correo *</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={campo} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">RUT</label>
              <input value={rut} onChange={(e) => setRut(e.target.value)} placeholder="12.345.678-9" className={campo} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Teléfono</label>
              <input value={telefono} onChange={(e) => setTelefono(e.target.value)} className={campo} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Rol *</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className={campo}>
              <option value="VENDEDOR">Vendedor</option>
              <option value="ADMIN">Administrador</option>
              <option value="MAYORISTA">Mayorista</option>
              <option value="CLIENTE">Cliente</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Contraseña *</label>
            <div className="relative">
              <input
                type={ver ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                className={`${campo} pr-10`}
              />
              <button
                type="button"
                onClick={() => setVer((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-navy-900"
                aria-label={ver ? 'Ocultar' : 'Mostrar'}
              >
                {ver ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">Mínimo 6 caracteres. Compártela por un canal seguro.</p>
          </div>
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3.5">
          <button onClick={onCerrar} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-navy-900 hover:bg-sand-50">
            Cancelar
          </button>
          <button
            disabled={guardando || !nombre.trim() || !email.includes('@') || password.length < 6}
            onClick={() => onCrear({ nombre, email, password, role, rut, telefono })}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-xs font-extrabold text-white hover:bg-brand-800 disabled:opacity-50"
          >
            {guardando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserCog className="h-3.5 w-3.5" />}
            Crear trabajador
          </button>
        </footer>
      </div>
    </div>
  );
}
