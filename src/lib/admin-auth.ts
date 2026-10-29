/**
 * Authentification des routes sensibles (mode démonstration) :
 * HTTP Basic, mot de passe uniquement en variable d'environnement
 * `ADMIN_PASSWORD` — jamais committée (voir .env.example).
 *
 * Fail-closed : si la variable n'est pas définie, TOUT accès administrateur
 * est refusé. C'est le comportement sûr par défaut.
 */

export function isAdmin(req: Request): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;

  const header = req.headers.get('authorization') ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Basic' || !token) return false;

  let decoded = '';
  try {
    decoded = Buffer.from(token, 'base64').toString('utf8');
  } catch {
    return false;
  }
  const [, pass] = decoded.split(':');
  return pass === password;
}

/** 401 standard : le navigateur/navigateur client sait qu'un Basic est attendu */
export function unauthorizedResponse(): Response {
  return new Response(JSON.stringify({ error: 'unauthorized' }), {
    status: 401,
    headers: {
      'Content-Type': 'application/json',
      'WWW-Authenticate': 'Basic realm="Tsara Café admin", charset="UTF-8"',
    },
  });
}
