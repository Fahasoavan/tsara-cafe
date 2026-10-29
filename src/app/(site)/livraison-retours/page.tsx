import type { Metadata } from 'next';
import { LegalContent } from '@/components/legal/LegalContent';

export const metadata: Metadata = {
  title: 'Livraison & retours',
  description: 'Délais, frais de livraison (offerts dès 60 €) et retours — boutique de démonstration Tsara Café.',
};

export default function ShippingPage() {
  return <LegalContent kind="shipping" />;
}
