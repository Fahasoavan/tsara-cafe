/**
 * Authentification des routes sensibles (mode démonstration) :
 * HTTP Basic, mot de passe uniquement en variable d'environnement
 * `ADMIN_PASSWORD` — jamais committée (voir .env.example).
 *
 * Fail-closed : si la variable n'est pas définie, TOUT accès administrateur
 * est refusé. C'est le comportement sûr par défaut.
 *
 * Détail de sécurité :
 *  • comparaison à temps constant (crypto.timingSafeEqual, via empreintes
 *    SHA-256 pour égaliser les longueurs) ;
 *  • le séparation login:mot de passe utilise indexOf(':') et non
 *    split(':') : un mot de passe peut contenir des « : » sans casser ;
 *  • les échecs sont comptés par IP (`admin-fail`, 5 / 10 min) : au-delà,
 *    les tentatives sont rejetées en 429 AVANT toute comparaison
 *    (protection brute-force, même forme en mémoire qu'en Redis).
 */
import { createHash, timingSafeEqual } from 'node:crypto';
import { clientIp, isBlocked, record } from '@/lib/rate-limit';

export type AdminCheck = 'ok' | 'fail' | 'limited';

export async function checkAdmin(req: Request): Promise<AdminCheck> {
  const ip = clientIp(req);

  /* Quota d'échecs (brute force) : vérifié sans consommer de jeton */
  if (await isBlocked('admin-fail', ip)) return 'limited';

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    /* Fail-closed : rien configuré = rien autorisé (401, sans pénalité
       de quota : ce n'est pas le visiteur qui a mal configuré le serveur) */
    return 'fail';
  }

  const header = req.headers.get('authorization') ?? '';
  const space = header.indexOf(' ');
  const scheme = space === -1 ? header : header.slice(0, space);
  const token = space === -1 ? '' : header.slice(space + 1);
  if (scheme !== 'Basic' || !token) {
    await record('admin-fail', ip);
    return 'fail';
  }

  let decoded = '';
  try {
    decoded = Buffer.from(token, 'base64').toString('utf8');
  } catch {
    await record('admin-fail', ip);
    return 'fail';
  }

  /* indexOf — le mot de passe peut contenir des « : » */
  const colon = decoded.indexOf(':');
  const provided = colon === -1 ? '' : decoded.slice(colon + 1);

  /* Empreintes de même longueur → timingSafeEqual ne lève jamais */
  const a = createHash('sha256').update(provided).digest();
  const b = createHash('sha256').update(expected).digest();

  if (timingSafeEqual(a, b)) return 'ok';
  await record('admin-fail', ip);
  return 'fail';
}

/** 401 standard : le client sait qu'un Basic est attendu */
export function unauthorizedResponse(): Response {
  return new Response(JSON.stringify({ error: 'unauthorized' }), {
    status: 401,
    headers: {
      'Content-Type': 'application/json',
      'WWW-Authenticate': 'Basic realm="Tsara Café admin", charset="UTF-8"',
    },
  });
}

/** 429 : trop de mots de passe faux depuis cette IP */
export function limitedResponse(): Response {
  return new Response(JSON.stringify({ error: 'rate_limited' }), {
    status: 429,
    headers: { 'Content-Type': 'application/json' },
  });
}
