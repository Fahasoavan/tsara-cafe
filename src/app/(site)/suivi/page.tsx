import type { Metadata } from 'next';
import { Suspense } from 'react';
import { TrackContent } from '@/components/tracking/TrackContent';

export const metadata: Metadata = {
  title: 'Suivi de commande',
  description: 'Suivez votre commande Tsara Café : statut Payée, En préparation ou Expédiée.',
};

export default function TrackingPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-4 py-16" />}>
      <TrackContent />
    </Suspense>
  );
}
