import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Tsara Café — Café de spécialité de Madagascar',
    template: '%s · Tsara Café',
  },
  description:
    'Boutique de démonstration : arabica et robusta de Madagascar en grains ou moulus, en sachets de 250 g et 1 kg, coffrets découverte. Paiement simulé, aucune transaction réelle.',
  keywords: ['café', 'Madagascar', 'arabica', 'robusta', 'café de spécialité', 'coffret café'],
  openGraph: {
    title: 'Tsara Café — Café de spécialité de Madagascar',
    description:
      'Arabica des hauts plateaux, robusta du littoral : grains, moulus et coffrets découverte. Paiement simulé.',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Tsara Café',
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: '#1E1612',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${playfair.variable} ${inter.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
