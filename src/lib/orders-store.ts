/**
 * Couche de stockage des commandes — la SEULE partie qui touche la persistance.
 *
 * Deux implémentations :
 *  • Upstash Redis (REST) — si `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
 *    sont définis. Format d'index : `order:<id>` (détail) + sorted set `orders`
 *    (score = date de création, pour la liste récente-d'abord).
 *    Les commandes VISITEURS expirent au bout de 3 jours (TTL automatique) :
 *    les données personnelles disparaissent seules (protection RGPD).
 *    Les commandes DE DÉMONSTRATION sont stockées sans expiration
 *    (le dashboard n'est jamais vide).
 *  • Repli local — `data/orders.json` via `node:fs` (dev, aucune config).
 *
 * Ce module n'est importé QUE par du code serveur.
 */
import { promises as fsp } from 'node:fs';
import path from 'node:path';
import { Redis, type Redis as RedisClient } from '@upstash/redis';
import type { StoredOrder } from '@/lib/types';

const TTL_SECONDS = 60 * 60 * 24 * 3; // 3 jours — commandes visiteurs uniquement
const LIST_KEY = 'orders';
const orderKey = (id: string) => `order:${id}`;

/* ------------------------------------------------------------------ */
/* Client Redis (créé paresseusement, null si non configuré)           */
/* ------------------------------------------------------------------ */
let redisClient: RedisClient | null | undefined;

/** Client Redis paresseux sinon null (partagé avec rate-limit) */
export function getRedisClient(): RedisClient | null {
  if (redisClient !== undefined) return redisClient;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  redisClient = url && token ? new Redis({ url, token }) : null;
  return redisClient;
}

function getRedis(): RedisClient | null {
  return getRedisClient();
}

/** Upstash Redis est-il le stockage actif ? (affiché / documenté) */
export function storageBackend(): 'redis' | 'file' {
  return getRedis() ? 'redis' : 'file';
}

/* ------------------------------------------------------------------ */
/* Implémentation Redis                                                */
/* ------------------------------------------------------------------ */
async function redisSave(orders: StoredOrder[], persistent: boolean): Promise<void> {
  const redis = getRedis();
  if (!redis) throw new Error('Redis indisponible.');
  /* Toutes les écritures partent en UNE seule requête réseau (pipeline) :
     60 commandes = 1 appel au lieu de 120. */
  const pipeline = redis.pipeline();
  for (const order of orders) {
    if (persistent) {
      pipeline.set(orderKey(order.id), order); // sans expiration
    } else {
      pipeline.set(orderKey(order.id), order, { ex: TTL_SECONDS });
    }
    pipeline.zadd(LIST_KEY, { score: Date.now(), member: order.id });
  }
  await pipeline.exec();
}

async function redisGet(id: string): Promise<StoredOrder | undefined> {
  const redis = getRedis();
  if (!redis) throw new Error('Redis indisponible.');
  const order = await redis.get<StoredOrder>(orderKey(id));
  return order ?? undefined;
}

async function redisList(limit = 500): Promise<StoredOrder[]> {
  const redis = getRedis();
  if (!redis) throw new Error('Redis indisponible.');
  const ids = await redis.zrange<string[]>(LIST_KEY, 0, limit - 1, { rev: true });
  if (ids.length === 0) return [];
  const orders = await redis.mget<StoredOrder[]>(...ids.map(orderKey));
  /* zrange rev + mget préservent l'ordre ; les clés expirées renvoient null */
  return orders.filter((o): o is StoredOrder => o !== null);
}

async function redisReplace(id: string, order: StoredOrder): Promise<StoredOrder | undefined> {
  const existing = await redisGet(id);
  if (!existing) return undefined;
  /* keepTtl : le TTL existant est PRÉSERVÉ — indispensable pour les commandes
     de démonstration (sans expiration) et pour que les commandes visiteurs
     ne voient pas leur TTL repartir à 3 jours après un changement de statut. */
  const redis = getRedis();
  if (!redis) throw new Error('Redis indisponible.');
  await redis.set(orderKey(id), order, { keepTtl: true });
  return order;
}

async function redisClear(): Promise<void> {
  const redis = getRedis();
  if (!redis) throw new Error('Redis indisponible.');
  const ids = await redis.zrange<string[]>(LIST_KEY, 0, -1);
  if (ids.length > 0) await redis.del(...ids.map(orderKey));
  await redis.del(LIST_KEY);
}

/* ------------------------------------------------------------------ */
/* Implémentation fichier (dev)                                        */
/* ------------------------------------------------------------------ */
/* `orders.json` est GITIGNORÉ (il change à chaque commande locale).
   Un jeu de départ est fourni par `data/orders.seed.json` (committé) :
   au premier lancement, il est copié en `orders.json` pour que le
   dashboard ne soit jamais vide. */

const DATA_DIR = path.join(process.cwd(), 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const SEED_FILE = path.join(DATA_DIR, 'orders.seed.json');

async function ensureSeed(): Promise<void> {
  try {
    await fsp.access(ORDERS_FILE);
  } catch {
    try {
      await fsp.copyFile(SEED_FILE, ORDERS_FILE);
    } catch {
      /* pas de seed non plus : registre vide */
    }
  }
}

async function fileReadAll(): Promise<StoredOrder[]> {
  await ensureSeed();
  try {
    const raw = await fsp.readFile(ORDERS_FILE, 'utf8');
    /* tolère un éventuel BOM UTF-8 (édition manuelle du fichier) */
    const parsed: unknown = JSON.parse(raw.replace(/^\uFEFF/, ''));
    if (Array.isArray(parsed)) return parsed as StoredOrder[];
  } catch {
    /* fichier absent, BOM mal géré ou corrompu : on repart de zéro */
  }
  return [];
}

async function fileWriteAll(orders: StoredOrder[]): Promise<void> {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  await fsp.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
}

/* ------------------------------------------------------------------ */
/* API publique                                                        */
/* ------------------------------------------------------------------ */

/** Insère une ou plusieurs commandes. `persistent` = sans expiration (démonstration) */
export async function storeOrders(orders: StoredOrder[], opts: { persistent?: boolean } = {}): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redisSave(orders, opts.persistent ?? false);
    return;
  }
  const all = await fileReadAll();
  all.push(...orders);
  await fileWriteAll(all);
}

/** Vide le registre (démonstration) */
export async function eraseOrders(): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redisClear();
    return;
  }
  await fileWriteAll([]);
}

export async function fetchOrder(id: string): Promise<StoredOrder | undefined> {
  const redis = getRedis();
  if (redis) return redisGet(id);
  const orders = await fileReadAll();
  return orders.find((o) => o.id === id);
}

/** Liste récente-d'abord */
export async function fetchOrders(limit = 500): Promise<StoredOrder[]> {
  const redis = getRedis();
  if (redis) return redisList(limit);
  const orders = await fileReadAll();
  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Remplace une commande (statut) — undefined si inconnue */
export async function replaceOrder(id: string, order: StoredOrder): Promise<StoredOrder | undefined> {
  const redis = getRedis();
  if (redis) return redisReplace(id, order);
  const orders = await fileReadAll();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return undefined;
  orders[index] = order;
  await fileWriteAll(orders);
  return order;
}
