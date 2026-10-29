import type { Metadata } from 'next';
import { HomeContent } from '@/components/home/HomeContent';

export const metadata: Metadata = {
  title: 'Café de spécialité de Madagascar — grains, moulus & coffrets',
  description:
    'Découvrez Tsara Café : arabica des hauts plateaux et robusta du littoral malgache, torréfiés à Antananarivo. Sachets 250 g et 1 kg, coffrets découverte. Livraison offerte dès 60 €.',
};

export default function HomePage() {
  return <HomeContent />;
}
