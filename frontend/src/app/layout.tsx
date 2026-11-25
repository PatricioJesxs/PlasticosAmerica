import type { Metadata, Viewport } from 'next';
import { Inter, Manrope } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://plasticosamerica.cl';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Plásticos América Chile | Hidráulica, Riego, Embalaje y Seguridad desde 1980',
    template: '%s | Plásticos América',
  },
  description:
    'Catálogo completo de tuberías, fitting PVC, PPR, HDPE, cobre, bronce, mallas, riego, embalaje y seguridad. Venta mayorista y detalle en Santiago, despacho a todo Chile.',
  keywords: [
    'plásticos América',
    'PVC hidráulico',
    'fitting PVC',
    'tuberías PPR',
    'HDPE',
    'mallas raschel',
    'riego tecnificado',
    'embalaje industrial',
    'Santiago Chile',
  ],
  authors: [{ name: 'Plásticos América Ltda.' }],
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    url: SITE_URL,
    siteName: 'Plásticos América',
    title: 'Plásticos América Chile | Soluciones en plásticos desde 1980',
    description:
      'Más de 600 productos y medidas en hidráulica, riego, embalaje, seguridad y construcción. Cotiza en línea.',
    images: [{ url: '/categorias/linea-hidraulica-pvc.jpg', width: 300, height: 200, alt: 'Plásticos América' }],
  },
  robots: { index: true, follow: true },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Plásticos América',
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0d233a',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HardwareStore',
  name: 'Plásticos América Ltda.',
  image: `${SITE_URL}/logo.png`,
  url: SITE_URL,
  telephone: '+56223386700',
  email: 'ventas@plasticosamerica.cl',
  priceRange: '$$',
  foundingDate: '1980',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Santa Elena 825 y 835',
    addressLocality: 'Santiago',
    addressRegion: 'Región Metropolitana',
    addressCountry: 'CL',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      opens: '08:00',
      closes: '17:30',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Friday',
      opens: '08:00',
      closes: '17:00',
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CL" className={`${inter.variable} ${manrope.variable}`}>
      <body className="flex min-h-screen flex-col bg-[#fbfaf7] font-sans text-slate-900 antialiased">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
