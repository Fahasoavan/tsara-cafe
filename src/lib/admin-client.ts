'use client';

/**
 * Client admin côté navigateur : garde le mot de passe en mémoire
 * (jamais persisté) et attache l'en-tête Authorization Basic aux appels
 * nécessitant des privilèges (effacer, simuler, changer un statut, e-mails démasqués).
 */

let password: string | null = null;

/** true si une session admin est active (mot de passe saisi) */
export function isAuthed(): boolean {
  return password !== null && password.length > 0;
}

export function getAdminPassword(): string | null {
  return password;
}

export function setAdminPassword(value: string | null): void {
  password = value && value.length > 0 ? value : null;
}

export class AdminAuthError extends Error {
  constructor() {
    super('unauthorized');
    this.name = 'AdminAuthError';
  }
}

/**
 * fetch avec l'en-tête Basic quand un mot de passe est connu.
 * Lève AdminAuthError sur 401 : l'UI déclenche alors la demande de saisie.
 */
export async function fetchAsAdmin(
  url: string,
  init: RequestInit & { method?: string } = { method: 'GET' },
): Promise<Response> {
  const headers = new Headers(init.headers);
  if (isAuthed()) {
    /* « :motdepasse » : login vide, Basic standard */
    headers.set('Authorization', `Basic ${btoa(`:${password ?? ''}`)}`);
  }
  const res = await fetch(url, { ...init, headers });
  if (res.status === 401) throw new AdminAuthError();
  return res;
}
