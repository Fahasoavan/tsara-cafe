/**
 * Limiteur de débit — distribué sur Upstash Redis quand il est configuré
 * (@upstash/ratelimit, efficace même sur Vercel multi-instances), repli
 * mémoire (fenêtre glissante) pour le développement local sans Redis.
 *
 *  • `checkout`    : protège /api/checkout de l'inondation ;
 *  • `demo`        : protège /api/orders/demo (détouré par l'auth admin) ;
 *  • `admin-fail`  : cumule les mots de passe admin FAUX par IP
 *                    (5 échecs / 10 min = les tentatives suivantes passent
 *                    en 429 avant même d'être comparées).
 *
 * API : `consume()` (vérifie + consomme), `isBlocked()` (vérifie sans
 * consommer), `record()` (ajoute un événement — échecs admin).
 */
import { randomUUID } from 'node:crypto';
import { Ratelimit } from '@upstash/ratelimit';
import type { Redis as RedisClient } from '@upstash/redis';
import { getRedisClient } from '@/lib/orders-store';

export type LimitKind = 'checkout' | 'demo' | 'admin-fail';

const KINDS: Record<LimitKind, { max: number; windowMs: number; } > = {
  checkout: { max: 8, windowMs: 10 * 60 * 1000 },
  demo: { max: 5, windowMs: 60 * 1000 },
  'admin-fail': { max: 5, windowMs: 10 * 60 * 1000 },
};

/* ------------------------------------------------------------------ */
/* Implémentation Upstash ({@upstash/ratelimit})                       */
/* ------------------------------------------------------------------ */
let ratelimits: Partial<Record<LimitKind, Ratelimit>> | undefined;

function upstashFor(kind: LimitKind): Ratelimit | null {
  const redis = getRedisClient();
  if (!redis) return null;
  ratelimits ??= {};
  ratelimits[kind] ??= new Ratelimit({
    redis: redis as RedisClient,
    limiter: Ratelimit.slidingWindow(KINDS[kind].max, `${Math.round(KINDS[kind].windowMs / 1000)} s`),
    prefix: `ratelimit:${kind}`,
    analytics: false,
  });
  return ratelimits[kind]!;
}

/** Vérifie le quota ET consomme un jeton (checkout, demo) */
export async function consume(kind: Exclude<LimitKind, 'admin-fail'>, key: string): Promise<boolean> {
  const rl = upstashFor(kind);
  if (rl) return (await rl.limit(key)).success;
  return memoryTouch(kind, key, { consume: true });
}

/** Vérifie le compteur d'échecs admin SANS consommer de jeton */
export async function isBlocked(kind: LimitKind, key: string): Promise<boolean> {
  const redis = getRedisClient();
  if (redis) {
    const zkey = `ratelimit:${kind}:${key}`;
    const now = Date.now();
    const windowStart = now - KINDS[kind].windowMs;
    await redis.zremrangebyscore(zkey, 0, windowStart);
    return (await redis.zcard(zkey)) >= KINDS[kind].max;
  }
  return memoryTouch(kind, key, { consume: false });
}

/** Ajoute un événement dans le compteur (échec de mot de passe admin) */
export async function record(kind: LimitKind, key: string): Promise<void> {
  const redis = getRedisClient();
  if (redis) {
    const zkey = `ratelimit:${kind}:${key}`;
    const now = Date.now();
    const pipeline = redis.pipeline();
    pipeline.zadd(zkey, { score: now, member: randomUUID() });
    pipeline.zremrangebyscore(zkey, 0, now - KINDS[kind].windowMs);
    /* auto-nettoyage : la clé s'efface seule au-delà de sa fenêtre */
    pipeline.pexpire(zkey, KINDS[kind].windowMs);
    await pipeline.exec();
    return;
  }
  await memoryTouch(kind, key, { consume: true });
}

/* ------------------------------------------------------------------ */
/* Repli mémoire (dev sans Redis — un compteur par instance)           */
/* ------------------------------------------------------------------ */
const buckets = new Map<string, number[]>();
let lastSweep = 0;

async function memoryTouch(kind: LimitKind, key: string, opts: { consume: boolean }): Promise<boolean> {
  const now = Date.now();
  const windowMs = KINDS[kind].windowMs;

  /* Balayage paresseux : on jette les fenêtres expirées */
  if (now - lastSweep > 60_000) {
    for (const [k, hits] of buckets) {
      if (!hits.some((t) => now - t < windowMs)) buckets.delete(k);
    }
    lastSweep = now;
  }

  const bucket = `${kind}:${key}`;
  const hits = (buckets.get(bucket) ?? []).filter((t) => now - t < windowMs);
  if (!opts.consume) {
    buckets.set(bucket, hits);
    return hits.length >= KINDS[kind].max;
  }
  if (hits.length >= KINDS[kind].max && kind !== 'admin-fail') {
    buckets.set(bucket, hits);
    return false;
  }
  hits.push(now);
  buckets.set(bucket, hits);
  return true;
}

/** Meilleure IP disponible derrière un inverseur de proxy (Vercel) */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'local';
}
