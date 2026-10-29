import type { Metadata } from 'next';
import { LegalContent } from '@/components/legal/LegalContent';

export const metadata: Metadata = {
  title: 'CGV — Conditions générales de vente',
  description: 'Conditions générales de vente de la boutique de démonstration Tsara Café.',
};

export default function CgvPage() {
  return <LegalContent kind="cgv" />;
}
