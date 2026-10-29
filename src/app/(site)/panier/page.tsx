import type { Metadata } from 'next';
import { CartContent } from '@/components/cart/CartContent';

export const metadata: Metadata = {
  title: 'Panier',
  description: 'Votre panier Tsara Café : ajustez quantités et formats, appliquez le code promo BIENVENUE10 et finalisez votre commande.',
  robots: { index: false },
};

export default function BasketPage() {
  return <CartContent />;
}
