import type { Metadata } from 'next';
import { AdminContent } from '@/components/admin/AdminContent';

export const metadata: Metadata = {
  title: 'Admin — Commandes',
  description: 'Écran de démonstration : tableau des commandes Tsara Café avec statuts modifiables.',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminContent />;
}
