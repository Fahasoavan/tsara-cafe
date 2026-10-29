import type { Metadata } from 'next';
import { ConfirmationContent } from '@/components/confirmation/ConfirmationContent';

export const metadata: Metadata = {
  title: 'Commande confirmée',
  description: 'Récapitulatif de votre commande Tsara Café (démonstration).',
  robots: { index: false },
};

export default function OrderConfirmationPage() {
  return <ConfirmationContent />;
}
