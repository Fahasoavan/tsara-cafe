'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { FormatId, GrindId } from '@/data/products';
import { getProductById } from '@/data/products';
import { findPromo } from '@/lib/promo';
import { useI18n } from '@/lib/i18n';
import { lineKey } from '@/lib/cart-utils';
import type { CartLine } from '@/lib/types';

const STORAGE_KEY = 'tsara-cart-v1';
const MAX_QTY = 99;

interface ToastInfo {
  id: number;
  message: string;
}

interface CartContextValue {
  /** lignes du panier — [] tant que localStorage n'est pas lu */
  lines: CartLine[];
  /** true une fois localStorage lu (évite les décalages SSR/hydratation) */
  ready: boolean;
  /** Nombre d'articles (somme des quantités) */
  count: number;
  /** Code promo appliqué (ex. BIENVENUE10), null sinon */
  promoCode: string | null;
  setPromoCode: (code: string | null) => void;
  add: (productId: string, format: FormatId, grind: GrindId | null, qty?: number) => void;
  setQty: (line: CartLine, qty: number) => void;
  remove: (line: CartLine) => void;
  clear: () => void;
}

interface PersistedCart {
  lines: CartLine[];
  promoCode: string | null;
}

const CartContext = createContext<CartContextValue | null>(null);

function isValidLine(raw: unknown): raw is CartLine {
  if (typeof raw !== 'object' || raw === null) return false;
  const o = raw as Record<string, unknown>;
  const formatOk = o.format === 's250' || o.format === 's1000' || o.format === 'coffret';
  const grindOk =
    o.grind === null ||
    (typeof o.grind === 'string' && ['grains', 'filtre', 'espresso', 'piston', 'moka'].includes(o.grind));
  return (
    typeof o.productId === 'string' &&
    formatOk &&
    grindOk &&
    typeof o.qty === 'number' &&
    Number.isInteger(o.qty) &&
    o.qty > 0
  );
}

function readPersisted(): PersistedCart {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { lines: [], promoCode: null };
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      /* ancien format (lignes seules) */
      return { lines: parsed.filter(isValidLine), promoCode: null };
    }
    const container = (parsed ?? {}) as Record<string, unknown>;
    const lines = Array.isArray(container.lines) ? container.lines.filter(isValidLine) : [];
    const promoCode = typeof container.promoCode === 'string' && findPromo(container.promoCode)
      ? container.promoCode
      : null;
    return { lines, promoCode };
  } catch {
    return { lines: [], promoCode: null };
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [promoCode, setPromoCodeState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<ToastInfo | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* --- chargement localStorage (navigateur uniquement) --- */
  useEffect(() => {
    const persisted = readPersisted();
    setLines(persisted.lines);
    setPromoCodeState(persisted.promoCode);
    setReady(true);
  }, []);

  /* --- persistance --- */
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ lines, promoCode }));
    } catch {
      /* stockage plein ou bloqué : on ignore */
    }
  }, [lines, promoCode, ready]);

  const showToast = useCallback(
    (message: string) => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      setToast({ id: Date.now(), message });
      toastTimer.current = setTimeout(() => setToast(null), 2800);
    },
    [],
  );

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  const setPromoCode = useCallback((code: string | null) => setPromoCodeState(code), []);

  const add = useCallback(
    (productId: string, format: FormatId, grind: GrindId | null, qty = 1) => {
      const product = getProductById(productId);
      setLines((prev) => {
        const incoming: CartLine = { productId, format, grind, qty: Math.max(1, Math.min(MAX_QTY, qty)) };
        const key = lineKey(incoming);
        const existing = prev.find((l) => lineKey(l) === key);
        if (existing) {
          return prev.map((l) =>
            lineKey(l) === key
              ? { ...l, qty: Math.min(MAX_QTY, l.qty + incoming.qty) }
              : l,
          );
        }
        return [...prev, incoming];
      });
      if (product) {
        showToast(t('cart.added', { name: product.name }));
      }
    },
    [showToast, t],
  );

  const setQty = useCallback((line: CartLine, qty: number) => {
    const key = lineKey(line);
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => lineKey(l) !== key)
        : prev.map((l) =>
            lineKey(l) === key ? { ...l, qty: Math.min(MAX_QTY, Math.round(qty)) } : l,
          ),
    );
  }, []);

  const remove = useCallback((line: CartLine) => {
    const key = lineKey(line);
    setLines((prev) => prev.filter((l) => lineKey(l) !== key));
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    setPromoCodeState(null);
  }, []);

  const count = useMemo(() => lines.reduce((sum, l) => sum + l.qty, 0), [lines]);

  const value = useMemo<CartContextValue>(
    () => ({ lines, ready, count, promoCode, setPromoCode, add, setQty, remove, clear }),
    [lines, ready, count, promoCode, setPromoCode, add, setQty, remove, clear],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      {/* Notification « ajouté au panier » */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-2"
      >
        {toast && (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-noir px-4 py-3 text-sm text-creme shadow-warm-lg animate-toast-in"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sauge text-creme">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                <path d="M4 12.5l5 5L20 6.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="max-w-[240px] leading-snug">{toast.message}</span>
            <a
              href="/panier"
              className="rounded-full bg-creme px-3 py-1 text-xs font-semibold text-noir transition-transform duration-200 hover:scale-105"
            >
              {t('cart.view')}
            </a>
          </div>
        )}
      </div>
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart doit être utilisé à l’intérieur de <CartProvider>');
  return ctx;
}
