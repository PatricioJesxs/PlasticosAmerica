'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Car,
  Clock,
  CreditCard,
  Globe,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { CATEGORIAS } from '@/lib/catalogo';
import { useQuote } from '@/lib/quote';

const LINEAS_FOOTER = CATEGORIAS.filter((c) => c.destacada).slice(0, 6);

export default function Footer() {
  const { notificar } = useQuote();
  const [email, setEmail] = useState('');

  const suscribir = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      notificar('Ingresa un correo válido para recibir ofertas.', 'error');
      return;
    }
    notificar('¡Gracias! Te avisaremos primero de nuestras ofertas y novedades.');
    setEmail('');
  };

  return (
    <footer className="mt-20 bg-navy-950 text-slate-300">
      {/* Franja de beneficios */}
      <div className="border-b border-white/10 bg-white/[0.03]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Truck, titulo: 'Despacho a todo Chile', texto: 'Coordinamos retiro o despacho según tu comuna.' },
            { icon: ShieldCheck, titulo: 'Compra segura', texto: 'Boleta y factura electrónica en cada compra.' },
            { icon: Car, titulo: 'Estacionamiento gratis', texto: 'Acceso por Santa Elena y San Camilo.' },
            { icon: CreditCard, titulo: 'Múltiples medios de pago', texto: 'Transferencia, débito, crédito y efectivo.' },
          ].map(({ icon: Icon, titulo, texto }) => (
            <div key={titulo} className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-700/15 text-brand-300">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-white">{titulo}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{texto}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 md:grid-cols-2 lg:grid-cols-12">
        {/* Marca + newsletter */}
        <div className="lg:col-span-4">
          <div className="mb-4 inline-flex rounded-xl bg-white p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Plásticos América Chile" className="h-12 w-auto object-contain" />
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-slate-400">
            Desde 1980 abasteciendo a empresas, constructores y hogares de Chile con plásticos
            industriales, hidráulica, riego, embalaje y seguridad.
          </p>

          <form onSubmit={suscribir} className="mt-5">
            <label htmlFor="newsletter" className="mb-2 block text-xs font-bold uppercase tracking-wider text-white">
              Recibe ofertas y novedades
            </label>
            <div className="flex overflow-hidden rounded-xl border border-white/15 bg-white/5 focus-within:border-brand-400">
              <input
                id="newsletter"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.cl"
                className="min-w-0 flex-1 bg-transparent px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-brand-700 px-4 text-xs font-bold text-white transition hover:bg-brand-600"
              >
                <Send className="h-3.5 w-3.5" /> Enviar
              </button>
            </div>
          </form>
        </div>

        {/* Líneas */}
        <div className="lg:col-span-2">
          <h3 className="mb-4 text-xs font-extrabold uppercase tracking-[0.16em] text-white">Líneas destacadas</h3>
          <ul className="space-y-2 text-sm">
            {LINEAS_FOOTER.map((cat) => (
              <li key={cat.slug}>
                <Link href={`/catalogo?categoria=${cat.slug}`} className="transition hover:text-white">
                  {cat.nombre.replace('Línea ', '')}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/catalogo" className="inline-flex items-center gap-1 font-semibold text-brand-300 hover:text-white">
                Ver todas <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </li>
          </ul>
        </div>

        {/* Institucional */}
        <div className="lg:col-span-2">
          <h3 className="mb-4 text-xs font-extrabold uppercase tracking-[0.16em] text-white">Plásticos América</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/nosotros" className="transition hover:text-white">Nosotros</Link></li>
            <li><Link href="/mayorista" className="transition hover:text-white">Venta mayorista</Link></li>
            <li><Link href="/boleta" className="transition hover:text-white">Boleta electrónica</Link></li>
            <li><Link href="/contacto" className="transition hover:text-white">Dirección y horarios</Link></li>
            <li><Link href="/cotizacion" className="transition hover:text-white">Cotizaciones</Link></li>
            <li><Link href="/login" className="transition hover:text-white">Mi cuenta</Link></li>
            <li><Link href="/admin" className="transition hover:text-white">Acceso trabajadores</Link></li>
          </ul>
        </div>

        {/* Contacto */}
        <div className="lg:col-span-4">
          <h3 className="mb-4 text-xs font-extrabold uppercase tracking-[0.16em] text-white">Contacto y sucursales</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
              <span>
                <strong className="text-white">Casa Matriz:</strong> Santa Elena 825 y 835, Santiago.
                <br />
                <strong className="text-white">Sucursal:</strong> San Camilo 834, Santiago.
              </span>
            </li>
            <li>
              <a href="tel:+56223386700" className="flex items-center gap-2.5 hover:text-white">
                <Phone className="h-4 w-4 text-brand-300" /> 22 338 6700 · 22 222 6874
              </a>
            </li>
            <li>
              <a href="mailto:ventas@plasticosamerica.cl" className="flex items-center gap-2.5 hover:text-white">
                <Mail className="h-4 w-4 text-brand-300" /> ventas@plasticosamerica.cl
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-brand-300" /> Lun a Jue 8:00–17:30 · Vie 8:00–17:00
            </li>
          </ul>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-white px-2 py-1 text-[10px] font-extrabold text-blue-900">VISA</span>
            <span className="rounded-md bg-white px-2 py-1 text-[10px] font-extrabold text-red-600">MasterCard</span>
            <span className="rounded-md bg-white px-2 py-1 text-[10px] font-extrabold text-emerald-700">Redcompra</span>
            <span className="rounded-md border border-white/20 px-2 py-1 text-[10px] font-bold">Transferencia</span>
          </div>

          <div className="mt-5 flex items-center gap-2">
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-[11px] font-extrabold transition hover:bg-brand-700">
              f
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-brand-700">
              <Globe className="h-4 w-4" />
            </a>
            <a href="https://wa.me/56223386700" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="grid h-9 w-9 place-items-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-500">
              <Phone className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-center text-[11px] text-slate-500 sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} Plásticos América Ltda. Todos los derechos reservados.</p>
          <p className="flex items-center gap-3">
            <span>Precios netos en CLP + IVA</span>
            <span className="hidden text-white/20 sm:inline">|</span>
            <Link href="/nosotros" className="hover:text-white">Términos y privacidad</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
