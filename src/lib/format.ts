/** Helpers de formatage (client et serveur) — aucune dépendance React */

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Euros → centimes entiers (base exacte de tous les calculs monétaires serveur) */
export function toCents(euros: number): number {
  return Math.round(euros * 100);
}

/** Centimes entiers → euros, arrondi garanti à 2 décimales */
export function fromCents(cents: number): number {
  return Math.round(cents) / 100;
}

export function formatMoney(value: number, locale: string): string {
  return new Intl.NumberFormat(locale === 'en' ? 'en-IE' : 'fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

export function formatDate(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(d);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}
