'use client';

import type { ReactNode } from 'react';
import { CartProvider } from '@/lib/cart';
import { I18nProvider } from '@/lib/i18n';

/** Fournisseurs globaux : langue (FR/EN) + panier (localStorage) */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <CartProvider>{children}</CartProvider>
    </I18nProvider>
  );
}
