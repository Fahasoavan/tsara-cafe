import type { Metadata } from 'next';
import { CheckoutContent } from '@/components/checkout/CheckoutContent';

export const metadata: Metadata = {
  title: 'Paiement',
  description: 'Finalisez votre commande Tsara Café. Paiement simulé : testez avec la carte 4242 4242 4242 4242. Aucun paiement réel.',
  robots: { index: false },
};

export default function CheckoutPage() {
  return <CheckoutContent />;
}
