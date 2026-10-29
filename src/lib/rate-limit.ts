/**
 * Limitation de débit mémoire (fenêtre glissante) — aucune dépendance.
 * Protège /api/checkout des abus ; par instance de processus
 * (production distribuée : préférer @upstash/ratelimit avec Redis,
 * voir README §Paiement). Les contrôleurs passent un `key` par IP.
 */

const buckets = new Map<string, number[]>();

const SWEEP_EVERY_MS = 60_000;
let lastSweep = 0;

/** true = requête autorisée, false = quota dépassé (renvoyer 429) */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();

  /* Balayage paresseux : on jette les fenêtres expirées */
  if (now - lastSweep > SWEEP_EVERY_MS) {
    for (const [k, hits] of buckets) {
      const hasRecent = hits.some((t) => now - t < windowMs);
      if (!hasRecent) buckets.delete(k);
    }
    lastSweep = now;
  }

  const hits = buckets.get(key) ?? [];
  const fresh = hits.filter((t) => now - t < windowMs);
  if (fresh.length >= limit) {
    buckets.set(key, fresh);
    return false;
  }
  fresh.push(now);
  buckets.set(key, fresh);
  return true;
}

/** Meilleure IP disponible derrière un épais proxy (Vercel) */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'local';
}
