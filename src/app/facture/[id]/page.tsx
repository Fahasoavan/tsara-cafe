import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getOrderForTracking } from '@/lib/orders';
import { InvoiceSheet } from '@/components/invoice/InvoiceSheet';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Facture',
  description: 'Facture de démonstration Tsara Café — imprimable en PDF.',
  robots: { index: false },
};

/**
 * Page facture : rendu serveur direct depuis le stockage (Redis / JSON).
 * PROTÉGÉE : l'e-mail doit correspondre à la commande (`?email=`), sinon 404.
 * Mise hors du layout du site pour une impression propre (Ctrl+P → PDF).
 */
export default async function InvoicePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { email?: string };
}) {
  const id = (params.id ?? '').trim().toUpperCase();
  const email = searchParams?.email;
  const order = email ? await getOrderForTracking(id, email) : undefined;
  if (!order) {
    notFound();
  }
  return <InvoiceSheet order={order} />;
}
