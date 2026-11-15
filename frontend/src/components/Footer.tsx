import React from 'react';
import { Phone, Mail, MapPin, Car, CreditCard } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="ubicacion" className="bg-[#0D233A] text-gray-300 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Columna 1: Contáctanos */}
        <div>
          <h3 className="text-white font-bold text-base uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
            Contáctanos
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <a href="tel:+56223386700" className="flex items-center gap-2 hover:text-white transition">
                <Phone className="w-4 h-4 text-red-400 shrink-0" /> 22 338 6700
              </a>
            </li>
            <li>
              <a href="tel:+56222226874" className="flex items-center gap-2 hover:text-white transition">
                <Phone className="w-4 h-4 text-red-400 shrink-0" /> 22 222 6874
              </a>
            </li>
            <li>
              <a href="mailto:ventas@plasticosamerica.cl" className="flex items-center gap-2 hover:text-white transition">
                <Mail className="w-4 h-4 text-red-400 shrink-0" /> ventas@plasticosamerica.cl
              </a>
            </li>
            <li>
              <a href="mailto:cotizaciones@plasticosamerica.cl" className="flex items-center gap-2 hover:text-white transition">
                <Mail className="w-4 h-4 text-red-400 shrink-0" /> cotizaciones@plasticosamerica.cl
              </a>
            </li>
            <li>
              <a href="mailto:ventas.america825@gmail.com" className="flex items-center gap-2 hover:text-white transition">
                <Mail className="w-4 h-4 text-red-400 shrink-0" /> ventas.america825@gmail.com
              </a>
            </li>
          </ul>
        </div>

        {/* Columna 2: Sucursales y Estacionamiento */}
        <div>
          <h3 className="text-white font-bold text-base uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
            Sucursales y Estacionamiento
          </h3>
          <div className="space-y-3 text-sm">
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-1" />
              <span>
                <strong className="text-white">Casa Matriz:</strong> Santa Elena 825 y 835, Santiago.
              </span>
            </p>
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-1" />
              <span>
                <strong className="text-white">Sucursal:</strong> San Camilo 834, Santiago.
              </span>
            </p>
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-gray-200 flex items-start gap-2">
              <Car className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                Estacionamiento exclusivo para nuestros clientes <strong>sin costo alguno</strong>. Entrada y salida por Santa Elena y San Camilo.
              </span>
            </div>
          </div>
        </div>

        {/* Columna 3: Medios de Pago */}
        <div>
          <h3 className="text-white font-bold text-base uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
            Medios de Pago Aceptados
          </h3>
          <p className="text-sm text-gray-300 mb-4">
            Paga de forma presencial o vía transferencia electrónica corporativa.
          </p>
          <div className="bg-white rounded-xl p-4 text-slate-800">
            <div className="flex items-center gap-2 font-bold text-sm text-[#8B0000] mb-2">
              <CreditCard className="w-5 h-5" /> Transbank / Redcompra
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              <span className="px-2.5 py-1 bg-blue-900 text-white rounded">VISA</span>
              <span className="px-2.5 py-1 bg-red-600 text-white rounded">MasterCard</span>
              <span className="px-2.5 py-1 bg-emerald-700 text-white rounded">Redcompra Débito</span>
              <span className="px-2.5 py-1 bg-slate-700 text-white rounded">Transferencia</span>
            </div>
          </div>
        </div>
      </div>

      {/* Barra Inferior */}
      <div className="bg-black/30 py-4 px-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Plásticos América Chile. Todos los derechos reservados.
      </div>
    </footer>
  );
}