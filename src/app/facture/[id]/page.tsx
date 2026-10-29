import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getOrder } from '@/lib/orders';
import { InvoiceSheet } from '@/components/invoice/InvoiceSheet';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Facture',
  description: 'Facture de démonstration Tsara Café — imprimable en PDF.',
  robots: { index: false },
};

/** Page facture : rendu serveur direct depuis data/orders.json, séparée du site (impression propre) */
export default async function InvoicePage({ params }: { params: { id: string } }) {
  const order = await getOrder((params.id ?? '').trim().toUpperCase());
  if (!order) {
    notFound();
  }
  return <InvoiceSheet order={order} />;
}
