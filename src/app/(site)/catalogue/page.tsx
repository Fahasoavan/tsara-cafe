import type { Metadata } from 'next';
import { CatalogContent } from '@/components/catalogue/CatalogContent';

export const metadata: Metadata = {
  title: 'Catalogue',
  description:
    'Dix cafés et coffrets de Madagascar : grains ou moulus, 250 g et 1 kg, Bourbon Pointu rare, vanille d’Antalaha. Filtrez par type et origine. Livraison offerte dès 60 €.',
};

export default function CataloguePage() {
  return <CatalogContent />;
}
