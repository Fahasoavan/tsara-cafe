# ☕ Tsara Café — boutique e-commerce de démonstration

> Boutique en ligne complète pour **Tsara Café**, marque de café de spécialité de
> Madagascar (grains & moulus en 250 g / 1 kg, coffrets découverte).
> **Paiement 100 % simulé** : aucune carte réelle n'est acceptée, aucun service externe
> n'est requis pour le faire tourner en local.

**Lien de la démo en ligne** : **[tsara-cafe.vercel.app](https://tsara-cafe.vercel.app)** (Vercel + Upstash Redis, `backend: redis` vérifié)

En **10 lignes** :

- e-commerce complet (Next.js 16, TypeScript, Tailwind) : catalogue filtrable, panier, checkout, suivi de commande ;
- **paiement simulé isolé** dans un unique fichier (`src/lib/payment.ts`), interface prête pour Stripe ;
- **totaux recalculés côté serveur en centimes entiers** — le navigateur n'est jamais cru (prix, promo, quantités) ;
- **persistance commandes** : Upstash Redis sur Vercel, `data/orders.json` en local (repli automatique) ;
- **RGPD démo** : les commandes visiteurs **expirent au bout de 3 jours** (TTL Redis), l'admin public masque e-mail et adresse, les actions destructrices demandent un **mot de passe admin** (HTTP Basic) ;
- **limites de débit** : checkout, commandes démo et **tentatives de mot de passe admin** (5 échecs = blocage 10 min) ;
- **dashboard admin** : CA, courbe 30 jours, top produits, répartitions formats/statuts — graphes maison en SVG pur ;
- **13 tests Vitest** sur la logique monétaire pure (`npm test`) ;
- **npm audit : 0 vulnérabilité** (Next 16.4.3 — ligne 14.x antérieure abandonnée) ;
- bilingue FR/EN, palette noir café / crème / caramel / vert sauge, illustrations 100 % SVG.

**Captures d'écran** (à déposer dans `docs/screenshots/`) :

| Accueil | Fiche produit |
|---|---|
| _docs/screenshots/home.png_ | _docs/screenshots/product.png_ |
| **Paiement simulé** | **Dashboard admin** |
| _docs/screenshots/checkout.png_ | _docs/screenshots/admin.png_ |

---

## Sommaire

1. [Fonctionnalités détaillées](#1-fonctionnalités-détaillées)
2. [Stack technique](#2-stack-technique)
3. [Démarrage rapide](#3-démarrage-rapide)
4. [Cartes de test](#4-cartes-de-test)
5. [Parcours d'achat complet](#5-parcours-dachat-complet)
6. [Arborescence du projet](#6-arborescence-du-projet)
7. [Architecture & flux de données](#7-architecture--flux-de-données)
8. [Architecture du paiement](#8-architecture-du-paiement)
9. [Référence API REST](#9-référence-api-rest)
10. [Matrice de simulations](#10-matrice-de-simulations)
11. [Dashboard admin & sécurité](#11-dashboard-admin--sécurité)
12. [Internationalisation FR/EN](#12-internationalisation-fren)
13. [Personnaliser la boutique](#13-personnaliser-la-boutique)
14. [Panier & stockage navigateur](#14-panier--stockage-navigateur)
15. [Tests](#15-tests)
16. [Accessibilité, SEO & qualité](#16-accessibilité-seo--qualité)
17. [Données personnelles & RGPD (démo)](#17-données-personnelles--rgpd-démo)
18. [Déploiement Vercel](#18-déploiement-vercel)
19. [Choix techniques](#19-choix-techniques)
20. [Scripts npm](#20-scripts-npm)
21. [Licence](#21-licence)

---

## 1. Fonctionnalités détaillées

| | |
|---|---|
| 🗺 | **11 pages + 6 routes API** : accueil, catalogue, fiche produit, panier, paiement, confirmation, facture imprimable, suivi, admin, CGV, livraison & retours |
| 🛒 | **Panier complet** (localStorage) : formats 250 g / 1 kg, moutures au choix, quantités, code promo `BIENVENUE10` (−10 %), livraison offerte dès 60 € |
| 💳 | **Paiement simulé** isolé dans un unique fichier, avec banc de test visiblement affiché au client |
| 🗄️ | **Persistance à deux niveaux** : Upstash Redis (Vercel, TTL 3 jours) ⟷ `data/orders.json` (local, repli automatique) |
| 🔒 | **Routes sensibles protégées** (`DELETE` purge, seed démo, changement de statut) par HTTP Basic + quota d'échecs anti-brute-force |
| 🌍 | **Bilingue FR/EN** (sélecteur dans l'en-tête, dictionnaire simple), prix en euros |
| 🎨 | **Design maison** : titres serif Playfair + Inter (next/font), illustrations 100 % SVG (aucune image distante) |
| ✨ | **Animations** : apparitions au scroll, vapeur animée, marquee, rebond du compteur panier, toasts, timelines de statut |
| 📊 | **Dashboard admin** : CA + évolution 7 j, courbe 30 j, top produits, donut formats, statuts — SVG pur, zéro dépendance |
| 🧾 | **Facture imprimable** (Ctrl+P → PDF) dans une page dédiée, protégée par e-mail |
| ♿ | **A11y** : labels, `aria-*`, focus visibles, skip-link, états vides · **SEO** : métadonnées par page, noindex sur les pages privées |

---

## 2. Stack technique

| Composant | Choix | Pourquoi |
|---|---|---|
| Framework | **Next.js 16.4.3** (App Router, TypeScript, Turbopack) | rendu hybride statique/dynamique, `params`/`searchParams` asynchrones |
| UI | **React 19** + **Tailwind CSS 3.4** | tokens maison dans `tailwind.config.ts` |
| Polices | `next/font` (Playfair Display + Inter) | auto-hébergées à la compilation |
| Persistance | **Upstash Redis** (REST) si configurée, sinon `data/orders.json` | `zadd` pour l'ordre, `set` + TTL pour l'expiration automatique |
| Limiteurs | **@upstash/ratelimit** (distribué) + repli mémoire (dev) | efficace sur les déploiements multi-instances |
| Tests | **Vitest 5** | fonctions pures testables en < 1 s |
| Dépendances runtime | `next`, `react`, `react-dom`, `@upstash/redis`, `@upstash/ratelimit` — **c'est tout** | `npm audit` : 0 vulnérabilité |

---

## 3. Démarrage rapide

```bash
npm install
cp .env.example .env    # variables d'environnement (ADMIN_PASSWORD, éventuellement Upstash)
npm run dev             # → http://localhost:3000
```

- **Sans Upstash configuré** : les commandes vivent dans `data/orders.json`
  (**gitigné** — un jeu de départ, `data/orders.seed.json` (~30 commandes de
  démonstration) est copié automatiquement au premier lancement pour que le
  dashboard soit vivant tout de suite ; purge possible via l'admin).
- **Avec Upstash configuré** : commandes dans Redis ; commandes visiteurs
  supprimées seules après 3 jours ; commandes de démonstration générées via l'admin
  sans expiration.

Build + serveur de production :

```bash
npm run build
npm start
```

> ⚠️ **Sur Vercel, `data/orders.json` est impossible** (système de fichiers en
> lecture seule). Configurez Upstash Redis (voir §18) avant de déployer ;
> sinon, l'écriture échoue avec `500 {"error":"database"}`.

---

## 4. Cartes de test

Aucune création de compte, aucun vrai paiement. **Le formulaire indique
explicitement de n'utiliser QUE la carte de test** (vérification serveur :
tout autre numéro est refusé).

| Carte | Résultat |
|---|---|
| `4242 4242 4242 4242` · expiration **future** (ex. `12/28`) · CVC `123` | ✅ **Paiement accepté** (latence simulée ~1 s) |
| `4000 0000 0000 0002` · expiration future · CVC `123` | ❌ **Refus banque** |
| Toute autre carte (ex. `4111 1111 1111 1111`) | ❌ « Carte non reconnue » |
| Bonne carte + CVC invalide | ❌ « Le CVC doit contenir 3 chiffres » |
| Bonne carte + expiration passée | ❌ « Date d'expiration invalide ou passée » |

Code promo : **`BIENVENUE10`** (−10 %, insensible à la casse).
**N'entrez pas de vraies données personnelles ni de vraie carte** : le site
affiche un bandeau à cet effet, mais la seule garantie est d'utiliser des
valeurs fictives.

---

## 5. Parcours d'achat complet

1. **`/`** — accueil : bandeau déroulant « livraison offerte dès 60 € », 3 produits phares, avis, CTA.
2. **`/catalogue`** — 10 produits, filtres type/origine, tri, ajout rapide au panier.
3. **`/produit/[slug]`** — format 250 g/1 kg (prix live), mouture, quantité.
4. **`/panier`** — quantités, barre « livraison offerte », code promo (message d'erreur si inconnu), bandeau « site de démonstration — n'entrez pas de vraies données ».
5. **`/paiement`** — bandeau démo, adresse puis carte **simulée** ; anti double envoi, états de chargement, erreurs serveur mises en forme.
6. **`/commande/TS-XXXXXX?email=…`** — confirmation : **la page ne s'ouvre pas avec le seul numéro** (si l'e-mail manque, un formulaire le demande).
7. **`/facture/TS-XXXXXX?email=…`** — facture imprimable, **protégée par e-mail** (404 sinon).
8. **`/suivi`** — n° + e-mail → timeline du statut.
9. **`/admin`** — dashboard readonly public (données personnelles masquées) + actions derrière mot de passe.

Le panier est **vidé après un paiement réussi** uniquement.

---

## 6. Arborescence du projet

```
tsara-cafe/
├── data/
│   ├── orders.seed.json             ← jeu de départ committé (dashboard vivant au 1er lancement)
│   └── orders.json                  ← gitignoré : registre local, écrit à l'exécution
├── src/
│   ├── app/
│   │   ├── (site)/                  ← pages publiques (header + footer partagés)
│   │   │   ├── page.tsx             ← accueil
│   │   │   ├── catalogue/, produit/[slug], panier, paiement
│   │   │   ├── commande/[id]/       ← confirmation (exige ?email=)
│   │   │   ├── suivi/, admin/, cgv/, livraison-retours/
│   │   ├── api/
│   │   │   ├── checkout/route.ts            ← POST paiement + création (rate-limited)
│   │   │   ├── orders/route.ts              ← GET liste (PII masquée) · DELETE purge (auth)
│   │   │   ├── orders/[id]/route.ts         ← GET détail (exige ?email=)
│   │   │   ├── orders/[id]/status/route.ts  ← PATCH statut (auth)
│   │   │   └── orders/demo/route.ts         ← POST seed démo (auth + rate limit)
│   │   ├── facture/[id]/page.tsx    ← facture imprimable (hors layout, ?email= requis)
│   │   ├── layout.tsx               ← fonts, SEO global, Providers (i18n + panier)
│   │   ├── template.tsx             ← transitions animées
│   │   ├── not-found.tsx, icon.svg, globals.css
│   ├── components/                  ← Header, Footer, ProductCard, BagVisual…
│   │   ├── admin/                   ← AdminContent (auth UI), Dashboard, OrdersTable, charts.tsx (SVG)
│   │   └── ui/                      ← icons.tsx, Reveal.tsx
│   ├── data/products.ts             ← 10 produits : source de vérité des prix
│   └── lib/
│       ├── payment.ts               ← gateway isolée (§8)
│       ├── orders.ts                ← métier : IDs, assemblage, suivi (ignorant le store)
│       ├── orders-store.ts          ← SEULE couche de persistance (Redis ⟷ fichier)
│       ├── totals.ts                ← computeTotals PUR (centimes entiers) + itemsFromLines
│       ├── totals.test.ts           ← 13 tests Vitest
│       ├── admin-auth.ts            ← Basic auth (timing-safe), quota d'échecs
│       ├── admin-client.ts          ← client navigateur (Authorization Basic en mémoire)
│       ├── rate-limit.ts            ← @upstash/ratelimit + repli mémoire
│       ├── sanitize.ts              ← masquage des PII pour l'admin public
│       ├── cart.tsx, cart-utils.ts, i18n.tsx, promo.ts, shipping.ts, format.ts, types.ts
├── tailwind.config.ts, vitest.config.ts, next.config.mjs
├── .env.example                     ← modèle de variables (ADMIN_PASSWORD, UPSTASH_*)
├── LICENSE                          ← MIT
└── README.md
```

---

## 7. Architecture & flux de données

```
Navigateur                          Serveur (Node)
──────────                          ──────────────
/produit ── "Ajouter au panier" ──▶ CartProvider (localStorage)
/panier   ── affichage            ──▶ prix LUS du catalogue (affichage seulement)
             ; POST /api/checkout ─▶ 1. rate-limit (checkout, 8/10 min/IP)
             (checkout)                2. validation adresse + panier + carte
                                       3. computeTotals() : centimes entiers depuis
                                          products.ts, promo revérifiée, livraison 6,90 € / 0 € ≥ 60 €
                                       4. paymentProvider.charge(totalRecalculé)   (simulation)
                                       5. 201 {id} → cmdes.store Redis (TTL 3 j) ou data/orders.json
confirmation/facture ◀── GET /api/orders/:id?email=… ──▶ 404 si l'e-mail ne correspond pas
/admin      ◀── GET /api/orders ──▶ liste (e-mails/adresses MASQUÉS sans auth ; avec auth : complets)
/admin      ── PATCH status, POST demo, DELETE ──▶ 401 sans ADMIN_PASSWORD · 429 après échecs
```

- **Ne jamais faire confiance au navigateur** : ni prix, ni remise, ni quantité —
  tout est revérifié dans `computeTotals()` (`src/lib/totals.ts`, en centimes entiers :
  plus jamais « 59.99999 € »).
- Code promo revérifié côté serveur ; `forfait`/`code inconnu` → simple mention d'erreur côté UI.
- Commandes = `data/orders.json` (local) ou Redis `order:<id>` + sorted set `orders`
  (score = date). Écritures démo regroupées en **pipeline Redis** (1 appel réseau
  pour N commandes).

---

## 8. Architecture du paiement

**Tout vit dans `src/lib/payment.ts`.** Le reste de l'application ne connaît que l'interface :

```ts
export interface PaymentProvider {
  readonly name: string;
  charge(input: {
    amountEur: number;   // toujours recalculé côté serveur
    card: { holder: string; number: string; expiry: string; cvc: string };
    description: string;
  }): Promise<ChargeResult>;
}
// ChargeResult : { success, transactionId?, last4?, reason? }
// reason : 'invalid_number' | 'invalid_expiry' | 'invalid_cvc' | 'declined'
```

- vérifie numéro (Luhn), CVC, expiration ; accepte `4242…4242`, refuse `4000…0002` ;
- **les numéros de carte complets ne sont jamais loggés ni stockés** — seuls les
  4 derniers chiffres (« •••• 4242 ») accompagnent la commande ;
- latence artificielle ~1 s pour rendre visibles les états de chargement.

### Brancher Stripe/PayPal

1. Créez `src/lib/stripe-payment-provider.ts` :

   ```ts
   import type { ChargeResult, PaymentProvider } from '@/lib/payment';

   export class StripePaymentProvider implements PaymentProvider {
     readonly name = 'stripe';
     async charge({ amountEur, card }): Promise<ChargeResult> {
       // PaymentIntent côté serveur (server-only) → confirm → return
       return { success: true, transactionId: `pi_…`, last4: '4242' };
     }
   }
   ```

2. Changez **une seule ligne** en bas de `src/lib/payment.ts` :
   `export const paymentProvider = new SimulatedPaymentProvider();`

---

## 9. Référence API REST

Base `http://localhost:3000`, JSON. Codes transverses : `401` (action admin sans
mot de passe), `429` (limites de débit/quota d'échecs dépassées).

### `POST /api/checkout`

```jsonc
{ "items": [{ "productId": "bourbon-pointu", "format": "s250", "grind": "grains", "qty": 2 }],
  "promoCode": "BIENVENUE10",
  "address": { "name": "…", "address": "…", "postalCode": "…", "city": "…", "country": "France", "email": "vous@exemple.fr" },
  "card": { "holder": "…", "number": "4242 4242 4242 4242", "expiry": "12/28", "cvc": "123" } }
```

| Réponse | Signification |
|---|---|
| `201 {id}` | commande créée (statut `paid`) |
| `400 {error:"address"/"cart", detail}` | validation |
| `402 {error:"payment", reason}` | refus façon banque/valeur invalide |
| `429 {error:"rate_limited"}` | > 8 checkouts / 10 min / IP |
| `500 {error:"database"}` | échec d'écriture (Upstash non configuré sur Vercel) |

### `GET /api/orders`

- Liste récentes-d'abord (dashboard admin). **Ouverte en lecture, mais
  protégeant l'identité** : sans `Authorization: Basic`, e-mail/rue/CP sont
  masqués (`c***@demo.fr`) via `src/lib/sanitize.ts` ; avec le bon mot de passe :
  données complètes.
- `DELETE` : purge totale — **401** sans auth, **429** après 5 échecs rapprochés.

### `GET /api/orders/:id?email=…`

- **L'e-mail est obligatoire** (mode suivi & confirmation/facture) : 404 si
  absent ou faux (insensible à la casse). Raison : la commande complète
  contient le nom et l'adresse du client — ils restent réservés au
  propriétaire de l'e-mail.

### `PATCH /api/orders/:id/status`

`{ "status": "paid" \| "preparing" \| "shipped" }` → `200 {order}` ;
**401** sans mot de passe, `400` statut inhabituel, `404` commande inconnue.

### `POST /api/orders/demo`

`{ "count": 25 }` (1–60) → `201 {created}`. **401** sans auth (on peut
inonder la base !), puis **429** au-delà de 5 générations / min / IP ;
génération cohérente (formats, moutures, ~35 % promo, dates étalées sur
30 jours). Commandes stockées **sans expiration**.

### `curl`

```bash
curl -X POST http://localhost:3000/api/checkout -H "Content-Type: application/json" -d @payload.json
curl http://localhost:3000/api/orders
curl -u ":tsara-demo" -X PATCH http://localhost:3000/api/orders/TS-AB12CD/status -H "Content-Type: application/json" -d '{"status":"shipped"}'
curl "http://localhost:3000/api/orders/TS-AB12CD?email=vous@exemple.fr"
```

---

## 10. Matrice de simulations

| Cas | Serveur | UI |
|---|---|---|
| checkout `4242…` + date future + CVC 123 | `201` | confirmation, panier vidé, liées à l'e-mail |
| `4000…0002` | `402 reason:declined` | « Paiement refusé par la banque émettrice… » |
| carte inconnue / Luhn | `402 reason:invalid_number` | « Carte non reconnue. Utilisez la carte de test 4242… » |
| CVC invalide | `402 reason:invalid_cvc` | « Le CVC doit contenir 3 chiffres » |
| `01/20` / `13/28` | `402 reason:invalid_expiry` | « Date d'expiration invalide ou passée » |
| > 8 checkouts / 10 min | `429` | « Trop de tentatives. Merci de patienter quelques minutes » |
| promo `bienvenue10` | −10 % | badge appliqué ; code inconnu → mention d'erreur |
| coffret + mouture, qty 0/1000, produit inconnu | `400 {error:"cart"}` | « Informations incorrectes… » |
| double envoi du formulaire | garde `submittingRef` + bouton désactivé |
| action admin sans `ADMIN_PASSWORD`/sans mdp | `401` | bouton « Déverrouiller » |
| mot de passe faux ×5 / 10 min | `429` (avant comparaison) | message limiteur |
| suivi e-mail faux / inconnu | `404` | message d'erreur (casse insensible) |

---

## 11. Dashboard admin & sécurité

Deux onglets, `/admin`, **bilingues** :

**Tableau de bord** (lecture libre, `src/components/admin/Dashboard.tsx`) :
4 KPIs (CA + badge évolution 7 j, commandes, panier moyen, articles vendus),
courbe d'aire du CA sur 30 jours (Bézier, info-bulles par jour), donut
formats, top 5 produits, statuts en barres. Avec 0 commande, état vide + CTA.

**Onglet Commandes** : tableau (n°, date, client, articles, total) et statut
modifiable à la volée (sauvegarde + ✓). Lien « n articles » vers la
confirmation — le lien n'est actif que si l'e-mail est complet (admin
déverrouillé).

**Modèle de sécurité (démo)** :

- lecture **libre** pour les visiteurs (recruteurs !) mais **PII masquées**
  (`c***@demo.fr`, rue/CP abrégés via `sanitize.ts`) ;
- actions (purge, seed, statut, données complètes) = mot de passe `ADMIN_PASSWORD`
  transmis en `Authorization: Basic` (bouton « Déverrouiller », mot de passe
  gardé **en RAM** de l'onglet, jamais persisté) ;
- env `ADMIN_PASSWORD` non définie ⇒ **débute fermé** : 401 sur toute action ;
- comparaison du mot de passe à **temps constant** (`crypto.timingSafeEqual`
  sur empreintes SHA-256), parsing `indexOf(':')` (mots de passe avec `:` OK) ;
- **quota anti-brute-force** `admin-fail` : 5 mots de passe faux / 10 min / IP
  ⇒ 429 avant toute comparaison (Redis distribué ou mémoire en dev) ;
- limites de débit : `checkout` 8/10 min, `demo` 5/min/IP — distribuées via
  `@upstash/ratelimit` quand Redis est configuré.

---

## 12. Internationalisation FR/EN

- `I18nProvider` (`src/lib/i18n.tsx`) : `locale` (fr défaut), `t(key, vars)` ;
- dictionnaire FR/EN plats `Record<string,string>` avec interpolation `{{var}}` ;
- sélecteur FR \| EN persisté (`localStorage`, `tsara-locale`), `<html lang>` à chaud ;
- noms de produits & origines bilingues dans `src/data/products.ts` ;
- ajoutez une langue : dupliquez `FR`, ajoutez dans `DICTS`/`LOCALES`.

---

## 13. Personnaliser la boutique

- Sous-total produits : `src/data/products.ts` (voir les types `Product`/`FormatId`).
- Règles monétaires : `src/lib/shipping.ts` (`SHIPPING_FEE = 6.9`,
  `FREE_SHIPPING_MIN = 60`) et `src/lib/promo.ts` (`PROMO_CODES`) — partagées
  client (affichage) et serveur (recalcul), à modifier une seule fois.
  **Tous les calculs monétaires passent par `toCents()`/`fromCents()`
  (`src/lib/format.ts`) : arithmétique entière garantie.**
- Palette & animations : `tailwind.config.ts` — noir #1E1612, crème #F6EFE6,
  caramel #C07A3A, sauge #6B7F5E, ombres `warm`, keyframes maison.
- Garde-fous panier (quantité max, formats, cohérence mouture) :
  `src/lib/totals.ts`.

---

## 14. Panier & stockage navigateur

| Clé `localStorage` | Contenu |
|---|---|
| `tsara-cart-v1` | `{ lines: [{ productId, format, grind, qty }], promoCode }` — lignes fusionnées (`productId__format__grind`), qty 1–99 |
| `tsara-locale` | `fr \| en` |

Le code promo saisi est **validé à l'entrée** : un code inconnu affiche
« Code promo inconnu. Essayez « BIENVENUE10 » » (mention rouge) — donc il
n'est jamais « silencieusement ignoré ». Les pages panier/paiement affichent
un squelette tant que la lecture locale n'est pas prête (`ready`).

---

## 15. Tests

```bash
npm test
```

Couverture **pure** (`src/lib/totals.test.ts`, Vitest) :

- validation du panier (panier vide, ligne invalide, produit inconnu, quantités 0/-1/1.5/100, coffret avec mouture, café moulu « grains ») ;
- économie : sous-total/livraison/total exacts, seuil de livraison gratuite ≥ 60 €, code promo insensible à la casse, code inconnu ignoré (remise 0 — l'UI affiche son message d'erreur) ;
- **exactitude centimes** : `13 × 44 €` → 57 200 centimes exacts ;
- `itemsFromLines` : snapshots de lignes cohérents.

Les fonctions testées sont pures : tout nouveau cas (nouveau code promo,
seuil de livraison Franco différent) se couvre en quelques lignes.

---

## 16. Accessibilité, SEO & qualité

- Skip-link, labels, `role="alert"`, `aria-live`, focus visibles, états vides
  partout, `prefers-reduced-motion` (animations off), contrastes palette.
- SEO : `metadata` par page, `generateMetadata` des produits, `robots: noindex`
  sur panier/paiement/admin/commande/facture.
- Vérifié : `npm run build` (Next 16 + Turbopack) sans erreur, tests verts,
  parcours e2e (checkout 201, refus 4000…0002, suivi e-mail faux → 404,
  statuts admin, seed demo, 401/429 des routes sensibles, facture sans e-mail → 404).
- `npm audit` : **0 vulnérabilité**.

---

## 17. Données personnelles & RGPD (démo)

Ce projet est une **démonstration** : n'entrez pas de vraies données. Mais il
suit des réflexes de production :

| Mesure | Où |
|---|---|
| commandes visiteurs **supprimées au bout de 3 jours** (TTL Redis `ex`) | `src/lib/orders-store.ts` |
| e-mail + adresse **masqués** pour l'admin public (`c***@demo.fr`) | `src/lib/sanitize.ts` |
| contenu complet de commande réservé à l'e-mail du client (numéro seul = 404) | `GET /api/orders/:id` + `/facture` |
| bandeau « site de démonstration — n'entrez pas de vraies données » | `/panier`, `/paiement` |
| carte : seul « •••• 4242 » est conservé ; aucun log du corps de requête | `payment.ts`, routes |
| limiteurs sur les points d'abus (checkout, seed, échecs admin) | `src/lib/rate-limit.ts` |

En local, `data/orders.json` reste gitigné : rien de saisi n'atterrit sur le Git.

---

## 18. Déploiement Vercel

1. **Upstash Redis** (via le Marketplace Vercel ou Console Upstash) :
   les variables `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN`
   sont injectées automatiquement par l'intégration.
2. `ADMIN_PASSWORD` : Project Settings → Environment Variables
   (défaut `.env.example` : `tsara-demo` — **changez-le**).
3. `npm run build && npm start` localement pour dev au même comportement que
   deploy (via Turbopack), `vercel` CLI ou Git → déploiement auto.
4. Vérification post-déploiement :
   - `GET /api/orders` sans auth → e-mails **masqués** ;
   - `DELETE /api/orders` sans auth → **401** ;
   - 6 mauvais mots de passe → **429** ;
   - checkout `4242…` → **201**, commandes visibles dans `/admin`,
     supprimées seules après 3 jours.

*Raison* : sur Vercel le FS est en lecture seule ; seule Redis persiste —
c'est l'histoire du cas d'usage « de `orders.json` à une vraie base ».

---

## 19. Choix techniques

- **Pas de librairie i18n** : deux dictionnaires plats + une interpolation
  « maison » suffisent à ~150 clés FR/EN ; `next-intl`/`react-i18next`
  ajoutent du routage de locale et des bundles pour une valeur d'usage faible
  ici. Le jour où l'on veut des routes `/en/…` SEO, on extrait la couche.
- **SVG plutôt qu'images** : les produits sont illustrés par un composant SVG
  paramétrable (`BagVisual` avec couleur d'accent) — aucune optimisation
  d'image à gérer, aucune requête réseau, la palette se change partout via un
  token ; et sans utilisation de `next/image`/optimiseur d'images self-hosted,
  aucune surface d'attaque image.
- **Graphes faits main** (pas de `recharts`/`chart.js`) : les 4 widgets
  (aire, donut, barres) tiennent en ~300 lignes de SVG animées, zéro bundle.
- **Centimes entiers** : `12.5 × 3` en float JS risque `37.499999…` ;
  `computeTotals` convertit tout en entiers (centimes) dès la première
  multiplication — il s'agit de prix, la précision n'est pas négociable.
- **Pas de base de données ORM en dev** : pour une démo, Redis (clé-valeur)
  suffit et met en valeur le TTL RGPD. Le jour où il faut des requêtes
  complexes : Supabase/Neon + un équivalent `orders-store.postgres.ts`
  (l'interface ne changera pas).
- **En production, on ajouterait** : comptes clients + OAuth, vraie passerelle
  de paiement (Stripe), en-têtes CSP, e-mails transactionnels (Resend),
  analytics privacy-first, tests e2e Playwright, logging structuré.

---

## 20. Scripts npm

| Script | Effet |
|---|---|
| `npm run dev` | développement (Next 16, Turbopack, hot reload) |
| `npm run build` | build de production + vérification TypeScript |
| `npm start` | sert le build de production |
| `npm test` / `npm run test:watch` | Vitest (13 tests sur la monnaie) |

---

## 21. Licence

MIT (fichier `LICENSE`). **Tsara Café est une marque fictive** : produits,
prix, avis, CGV et coordonnées sont imaginaires, à des fins pédagogiques.
Code librement réutilisable — pensez à retirer les mentions « démonstration »
et à brancher un vrai paiement avant toute mise en production réelle.

> ☕ Fait avec Next.js 16 + Tailwind — paiement simulé, persistance Redis,
> accès admin protégé, données visiteurs éphémères.
