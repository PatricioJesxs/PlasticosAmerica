import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Plásticos América Chile | Desde 1980 - Venta Mayorista y Detalle',
  description: 'Especialistas en plásticos industriales, mangas, bolsas, mangueras y envases en Santiago. Casa Matriz Santa Elena y Sucursal San Camilo.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Plásticos América',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // Evita que iPhone haga zoom automático al tocar el buscador
  themeColor: '#8B0000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-50 text-slate-900 antialiased flex flex-col min-h-screen`}>
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}