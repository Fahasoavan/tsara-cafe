# ☕ Tsara Café — boutique e-commerce de démonstration

> Boutique en ligne complète pour **Tsara Café**, marque de café de spécialité de
> Madagascar (grains & moulus en 250 g / 1 kg, coffrets découverte).
> **Paiement 100 % simulé** — aucun argent réel, aucune donnée personnelle conservée.

---

## Sommaire

1. [Aperçu & fonctionnalités](#1-aperçu--fonctionnalités)
2. [Stack technique](#2-stack-technique)
3. [Démarrage rapide](#3-démarrage-rapide)
4. [Comptes & cartes de test](#4-comptes--cartes-de-test)
5. [Parcours d'achat complet](#5-parcours-dachat-complet)
6. [Arborescence du projet](#6-arborescence-du-projet)
7. [Architecture & flux de données](#7-architecture--flux-de-données)
8. [Architecture du paiement (fichier unique)](#8-architecture-du-paiement)
9. [Référence API REST](#9-référence-api-rest)
10. [Matrice de simulations](#10-matrice-de-simulations)
11. [Dashboard admin](#11-dashboard-admin)
12. [Internationalisation FR/EN](#12-internationalisation-fren)
13. [Personnaliser la boutique](#13-personnaliser-la-boutique)
14. [Panier & stockage navigateur](#14-panier--stockage-navigateur)
15. [Accessibilité, SEO & qualité](#15-accessibilité-seo--qualité)
16. [Limites du mode démo](#16-limites-du-mode-démo)
17. [Scripts npm](#17-scripts-npm)
18. [Licence](#18-licence)

---

## 1. Aperçu & fonctionnalités

| | |
|---|---|
| 🗺 | **10 pages + 6 routes API** : accueil, catalogue, fiche produit, panier, paiement, confirmation, facture imprimable, suivi, admin, CGV, livraison & retours |
| 🛒 | **Panier complet** (localStorage) : formats 250 g / 1 kg, moutures au choix, quantités, code promo `BIENVENUE10` (−10 %), livraison offerte dès 60 € |
| 💳 | **Paiement simulé** isolé dans un unique fichier (`src/lib/payment.ts`) avec interface prête pour Stripe/PayPal |
| 🔒 | **Totaux recalculés côté serveur** : les prix envoyés par le navigateur sont ignorés, le catalogue est la source de vérité |
| 🌍 | **Bilingue FR/EN** (sélecteur dans l'en-tête, dictionnaire simple), prix en euros |
| 🎨 | **Design maison** : palette noir café / crème / caramel / vert sauge, titres serif (Playfair) + texte sans-serif (Inter) via `next/font`, illustrations 100 % SVG (aucune image distante) |
| ✨ | **Animations** : apparitions au scroll, vapeur animée, marquee « livraison offerte », rebond du compteur panier, toasts, transitions de page, barres de progression, timelines de statut |
| 📊 | **Dashboard admin** : CA, courbe de ventes 30 jours, top produits, répartition formats/statuts, évolution 7 j |
| 🧾 | **Facture imprimable** : page HTML propre dédiée (Ctrl+P → PDF), sans en-tête ni pied du site |
| ♿ | **Accessibilité de base** : labels, `aria-*`, focus visibles, skip-link, états vides gérés · **SEO** : métadonnées par page |

---

## 2. Stack technique

| Composant | Choix | Pourquoi |
|---|---|---|
| Framework | **Next.js 14.2.35** (App Router, TypeScript) | rendu hybride statique/dynamique sans configuration |
| UI | **React 18** + **Tailwind CSS 3.4** | design system légerTokens maison dans `tailwind.config.ts` |
| Polices | **next/font** (Playfair Display + Inter) | auto-hébergées à la compilation, zéro requête externe au runtime |
| Base de données | **aucune** — produits dans `src/data/products.ts`, commandes dans `data/orders.json` | démo self-contained, zip & run |
| Images | SVG pur (`src/components/BagVisual.tsx`, icônes inline) | aucune dépendance ni image distante |
| Graphes | SVG maison (`src/components/admin/charts.tsx`) | pas de librairie de charts |
| Dépendances runtime | `next`, `react`, `react-dom` — **c'est tout** | autonomie maximale |

---

## 3. Démarrage rapide

```bash
npm install
npm run dev          # → http://localhost:3000
```

Build de production + serveur local :

```bash
npm run build
npm start            # → http://localhost:3000
```

> Prérequis : Node ≥ 18.17. Le fichier `data/orders.json` livré contient ~28
> commandes **de démonstration** afin que le dashboard admin soit vivant dès le
> premier lancement (purgez-les via l'admin, bouton « Effacer tout »).

---

## 4. Comptes & cartes de test

Aucune création de compte, aucun vrai paiement. En checkout, le formulaire de carte
n'accepte que le **banc de test** ci-dessous :

| Carte | Résultat |
|---|---|
| `4242 4242 4242 4242` · expiration **future** (ex. `12/28`) · CVC `123` | ✅ **Paiement accepté** (latence simulée ~1 s) |
| `4000 0000 0000 0002` · expiration future · CVC `123` | ❌ **Refus banque** (message d'erreur clair) |
| Toute autre carte (ex. `4111 1111 1111 1111`) | ❌ « Carte non reconnue » |
| Bonne carte + CVC invalide (`12`) | ❌ « Le CVC doit contenir 3 chiffres » |
| Bonne carte + expiration passée (`01/20`) | ❌ « Date d'expiration invalide ou passée » |

Code promo fonctionnel : **`BIENVENUE10`** (−10 % du sous-total, appliqué en minuscule ou majuscule).

---

## 5. Parcours d'achat complet

1. **`/`** — accueil : bandeau déroulant « livraison offerte dès 60 € », 3 produits phares, bloc Notre histoire, avis, CTA.
2. **`/catalogue`** — 10 produits, filtres (**type** : grains · moulu · coffret — **origine**), tri (prix ↑/↓, nom), ajout au panier en un clic depuis la carte.
3. **`/produit/[slug]`** — description bilingue, notes de dégustation, torréfaction, choix du **format** (250 g / 1 kg — prix mis à jour en direct), de la **mouture** (grains · filtre · espresso · piston · moka), quantité 1–99.
4. **`/panier`** — lignes modifiables (quantité +, suppression), barre de progression « livraison offerte », code promo, sous-total / livraison / total.
5. **`/paiement`** — bandeau « Mode démonstration » visible, formulaire d'adresse (nom, adresse, CP, ville, pays, e-mail) puis carte **simulée** ; double envoi bloqué, états de chargement, erreurs gérées.
6. **`/commande/TS-XXXXXX`** — confirmation : n° de commande, statut animé (Payée → En préparation → Expédiée), récapitulatif, adresse, total, **« Télécharger la facture »**.
7. **`/facture/TS-XXXXXX`** — facture imprimable (Ctrl+P → PDF), volet « Facture » séparé du layout du site.
8. **`/suivi`** — n° de commande + e-mail (pré-remplissable via `?id=TS-XXXXXX`) → timeline du statut.
9. **`/admin`** — tableau de bord des ventes + commandes avec statut modifiable, sans mot de passe (bandeau « démo »).

Le panier est **vidé après un paiement réussi** uniquement.

---

## 6. Arborescence du projet

```
tsara-cafe/
├── data/
│   └── orders.json                  ← registre des commandes (écrit par les routes API)
├── src/
│   ├── app/
│   │   ├── (site)/                  ← pages « publiques » (header + footer partagés)
│   │   │   ├── layout.tsx           ← Header + main + Footer
│   │   │   ├── page.tsx             ← Accueil
│   │   │   ├── catalogue/page.tsx
│   │   │   ├── produit/[slug]/page.tsx   ← métadonnées dynamiques + SSG
│   │   │   ├── panier/page.tsx
│   │   │   ├── paiement/page.tsx
│   │   │   ├── commande/[id]/page.tsx
│   │   │   ├── suivi/page.tsx
│   │   │   ├── admin/page.tsx
│   │   │   ├── cgv/page.tsx
│   │   │   └── livraison-retours/page.tsx
│   │   ├── api/
│   │   │   ├── checkout/route.ts        ← POST : paiement + création de commande
│   │   │   ├── orders/route.ts          ← GET liste · DELETE purge
│   │   │   ├── orders/[id]/route.ts     ← GET commande (± vérif e-mail)
│   │   │   ├── orders/[id]/status/route.ts ← PATCH statut admin
│   │   │   └── orders/demo/route.ts     ← POST génération de commandes démo
│   │   ├── facture/[id]/page.tsx    ← facture imprimable (hors layout du site)
│   │   ├── layout.tsx               ← fonts, SEO global, Providers (i18n + panier)
│   │   ├── template.tsx             ← transition animée entre pages
│   │   ├── not-found.tsx            ← 404 illustrée
│   │   ├── icon.svg                 ← favicon (grain de café)
│   │   └── globals.css              ← styles globaux, print, reduced-motion
│   ├── components/
│   │   ├── Header.tsx               ← nav, sélecteur FR/EN, compteur panier animé
│   │   ├── Footer.tsx
│   │   ├── ProductCard.tsx          ← carte catalogue (accueil + boutique)
│   │   ├── BagVisual.tsx            ← sachet/caissette SVG paramétrable
│   │   ├── providers.tsx            ← I18nProvider + CartProvider
│   │   ├── home/HomeContent.tsx     ← hero, marquee, histoire, avis, CTA
│   │   ├── catalogue/CatalogContent.tsx
│   │   ├── product/ProductContent.tsx
│   │   ├── cart/CartContent.tsx
│   │   ├── checkout/CheckoutContent.tsx
│   │   ├── confirmation/ConfirmationContent.tsx
│   │   ├── invoice/InvoiceSheet.tsx
│   │   ├── tracking/TrackContent.tsx
│   │   ├── legal/LegalContent.tsx
│   │   ├── admin/
│   │   │   ├── AdminContent.tsx     ← onglets Dashboard / Commandes + toolbar démo
│   │   │   ├── Dashboard.tsx        ← KPIs + sections de graphes
│   │   │   ├── OrdersTable.tsx
│   │   │   └── charts.tsx           ← AreaChart · BarsList · Donut (SVG maison)
│   │   └── ui/
│   │       ├── icons.tsx            ← ~20 icônes SVG stroke
│   │       └── Reveal.tsx           ← apparition au scroll (IntersectionObserver)
│   ├── data/
│   │   └── products.ts              ← 10 produits : LA source de vérité des prix
│   └── lib/
│       ├── payment.ts               ← gateway isolée (voir §8)
│       ├── orders.ts                ← stockage + validation + recalcul des totaux
│       ├── cart.tsx                 ← panier (localStorage) + toasts
│       ├── cart-utils.ts            ← clé stable d'une ligne de panier
│       ├── i18n.tsx                 ← dictionnaire FR/EN + provider de langue
│       ├── analytics.ts             ← agrégations du dashboard (pures)
│       ├── promo.ts                 ← codes promo partagés client/serveur
│       ├── shipping.ts              ← frais & seuil « livraison offerte »
│       ├── format.ts                ← monnaie, dates, e-mail, arrondis
│       └── types.ts                 ← contrats partagés navigateur ↔ serveur
├── tailwind.config.ts               ← palette + keyframes/animations maison
├── README.md
└── package.json
```

---

## 7. Architecture & flux de données

```
Navigateur                          Serveur (Node)
──────────                          ──────────────
/produit ── "Ajouter au panier" ──▶ CartProvider (localStorage)
/panier   ── affichage            ──▶ prix LUS du catalogue (affichage seulement)
/paiement ── POST /api/checkout ──▶  1. validation adresse + panier + carte
                                     2. computeTotals() : prix depuis products.ts,
                                        promo revalidée, livraison 6,90 € / 0 € ≥ 60 €
                                     3. paymentProvider.charge(totalRecalculé)
                                     4. 201 {id}  →  data/orders.json
confirmation/facture ◀── GET /api/orders/:id ──▶ lecture du JSON
/admin     ◀── GET /api/orders ──▶ + PATCH status, POST demo, DELETE purge
```

Principes clés :

- **Ne jamais faire confiance au navigateur** : ni prix, ni remise, ni format —
  tout est revérifié dans `computeTotals()` (`src/lib/orders.ts`).
- **Code promo au niveau du contexte panier** : cohérent entre `/panier` et `/paiement`.
- **Commandes** = fichier JSON plat (`data/orders.json`), lectures/écritures via
  `node:fs/promises`, tri récent-d'abord, statuts typés (`paid | preparing | shipped`).

---

## 8. Architecture du paiement

**Tout vit dans un seul fichier : `src/lib/payment.ts`.** Le reste de
l'application ne connaît que l'interface :

```ts
export interface PaymentProvider {
  readonly name: string;
  charge(input: {
    amountEur: number;          // toujours recalculé côté serveur
    card: { holder: string; number: string; expiry: string; cvc: string };
    description: string;
  }): Promise<ChargeResult>;
}

// ChargeResult : { success, transactionId?, last4?, reason? }
// reason : 'invalid_number' | 'invalid_expiry' | 'invalid_cvc' | 'declined'
```

`SimulatedPaymentProvider` (extrait) :

- vérifie le **numéro** (format + algorithme de Luhn), le **CVC** (3 chiffres),
  l'**expiration** (MM/AA, valable jusqu'à la fin du mois indiqué) ;
- accepte `4242 4242 4242 4242`, refuse `4000 0000 0000 0002` ;
- ajoute une **latence artificielle de 0,9 à 1,4 s** (rend les états de
  chargement visibles — montez-la à `sleep(5000)` pour la démo).

### Brancher un vrai prestataire (Stripe, PayPal…)

1. Créez `src/lib/stripe-payment-provider.ts` :

   ```ts
   import type { ChargeResult, PaymentProvider } from '@/lib/payment';

   export class StripePaymentProvider implements PaymentProvider {
     readonly name = 'stripe';
     async charge({ amountEur, card }: ChargeInput): Promise<ChargeResult> {
       // 1. créer un PaymentIntent côté serveur (server-only)
       // 2. confirmer avec les éléments de carte ou retourner clientSecret
       return { success: true, transactionId: `pi_…`, last4: '4242' };
     }
   }
   ```

2. Changez **une seule ligne** en bas de `src/lib/payment.ts` :

   ```ts
   // export const paymentProvider: PaymentProvider = new SimulatedPaymentProvider();
   export const paymentProvider: PaymentProvider = new StripePaymentProvider(process.env.STRIPE_SECRET_KEY!);
   ```

Aucune autre modification : la route `/api/checkout` n'appelle que
`paymentProvider.charge(...)`. Confidentialité : **les numéros de carte complets
ne sont jamais loggés ni stockés** — seuls les 4 derniers chiffres (affichage
« •••• 4242 ») sont enregistrés avec la commande.

---

## 9. Référence API REST

Base : `http://localhost:3000`. Corps et réponses en JSON.

### `POST /api/checkout`

Paiement + création de commande.

```jsonc
// Requête
{
  "items": [
    { "productId": "bourbon-pointu", "format": "s250", "grind": "grains", "qty": 2 },
    { "productId": "coffret-decouverte", "format": "coffret", "grind": null, "qty": 1 }
  ],
  "promoCode": "BIENVENUE10",
  "address": { "name": "…", "address": "…", "postalCode": "…", "city": "…", "country": "France", "email": "vous@exemple.fr" },
  "card": { "holder": "Fanja Rakoto", "number": "4242 4242 4242 4242", "expiry": "12/28", "cvc": "123" }
}
// format : 's250' | 's1000' | 'coffret'   grind : 'grains'|'filtre'|'espresso'|'piston'|'moka'|null   qty : 1–99
```

| Réponse | Signification |
|---|---|
| `201 { "id": "TS-AB12CD" }` | commande créée, statut initial `paid` |
| `400 { "error": "address" }` | adresse incomplète ou e-mail invalide |
| `400 { "error": "cart", "detail": "…" }` | produit inconnu, format/mouture incohérente, quantité invalide, panier vide |
| `402 { "error": "payment", "reason": "declined" }` | paiement refusé (voir matrice §10) |
| `500 { "error": "database" }` | échec d'écriture de `data/orders.json` |

### `GET /api/orders`

`200 { "orders": [ … ] }` — toutes les commandes, récentes d'abord (utilisé par l'admin).

### `DELETE /api/orders`

`200 { "ok": true }` — purge totale (bouton « Effacer tout » de l'admin).

### `GET /api/orders/:id` et `GET /api/orders/:id?email=…`

- sans e-mail : renvoie la commande (pages confirmation & facture, démo) ;
- avec `?email=` : **mode suivi** — l'e-mail doit correspondre (insensible à la
  casse, `id` normalisé en majuscules) sinon `404`.

### `PATCH /api/orders/:id/status`

`{ "status": "paid" | "preparing" | "shipped" }` → `200 { "order": … }`,
`400` si statut invalide, `404` si commande inconnue.

### `POST /api/orders/demo`

`{ "count": 25 }` (1–60) → `201 { "created": n }` — génère des commandes de
démonstration réalistes (1–3 lignes cohérentes, ~35 % avec promo, dates étalées
sur 30 jours, statut cohérent avec l'âge de la commande).

### curl express

```bash
curl -X POST http://localhost:3000/api/checkout -H "Content-Type: application/json" -d @payload.json
curl http://localhost:3000/api/orders
curl -X PATCH http://localhost:3000/api/orders/TS-AB12CD/status -H "Content-Type: application/json" -d '{"status":"shipped"}'
curl "http://localhost:3000/api/orders/TS-AB12CD?email=vous@exemple.fr"
```

---

## 10. Matrice de simulations

### Paiements (conversion `reason` → message UI dans `CheckoutContent.tsx`)

| Payload `card` | Réponse | Message affiché |
|---|---|---|
| `4242…4242` + `12/28` + `123` | `201` | redirection confirmation, panier vidé |
| `4000 0000 0000 0002` | `402 reason:declined` | « Paiement refusé par la banque émettrice (c'est normal avec cette carte de test)… » |
| `4111 1111 1111 1111` | `402 reason:invalid_number` | « Carte non reconnue. Utilisez la carte de test 4242… » |
| numéro modifié d'un chiffre (ex. `…0003`) | `402` (bloc Luhn) | idem carte non reconnue |
| CVC `12` ou `abc` | `402 reason:invalid_cvc` | « Le CVC doit contenir 3 chiffres » |
| `01/20` (passée) ou `13/28` | `402 reason:invalid_expiry` | « Date d'expiration invalide ou passée » |
| `4000…0002` **+ CVC invalide** | `402 reason:invalid_cvc` | le CVC est vérifié avant le refus |

Ordre des vérifications serveur : montant > 0 → format/Luhn du numéro → CVC → expiration → carte reconnue/refusée.

### Panier & règles économiques

| Scénario | Comportement |
|---|---|
| Sous-total après remise **< 60 €** | livraison `6,90 €` ; **≥ 60 €** → offerte (barre animée sur /panier) |
| `promoCode: "bienvenue10"` (minuscule) | normalisé en majuscules, −10 % appliqué |
| `promoCode: "FORFAIT"` | **ignoré silencieusement** (0 %), pas d'erreur |
| `productId` inconnu / qty `0` `1000` / coffret avec mouture / grains sans mouture | `400 { error: "cart" }` |
| double envoi du formulaire | bouton désactivé + garde `submittingRef` (anti double création) |
| panier vide sur /paiement | état dédié + CTA catalogue |

### Statuts & suivi

| Action | Résultat |
|---|---|
| `PATCH` statut depuis l'admin | timeline `/suivi` et badge confirmation se mettent à jour |
| suivi avec mauvais e-mail ou numéro | `404` → message d'erreur — casse insensible (`ts-ab12cd`, e-mail en majuscules OK) |

---

## 11. Dashboard admin (`/admin`)

Deux onglets, accessibles sans mot de passe (bandeau « démo »), bilingues :

**Onglet Tableau de bord** (`src/components/admin/Dashboard.tsx` + `analytics.ts`) :

| Widget | Contenu |
|---|---|
| KPI « Chiffre d'affaires » | total + badge d'évolution **7 j vs 7 j précédents** (▲/▼) |
| KPIs suivants | nombre de commandes, panier moyen (CA ÷ commandes), articles vendus |
| Courbe d'aire | **CA sur 30 jours** — courbe de Bézier, grille, info-bulles par jour (date · CA · nb commandes) |
| Donut | répartition du CA par **format** (250 g / 1 kg / coffret), % au survol de la légende, total au centre |
| Top produits | 5 premiers produits par CA, barres animées, « n vendus » par référence |
| Statuts | répartition Payée / En préparation / Expédiée en barres (sauge / caramel / noir) |

Toolbar : **« Simuler 25 commandes »** (`POST /api/orders/demo`), **« Effacer tout »**
(`DELETE /api/orders`, double-clic de confirmation). Avec 0 commande, le dashboard
affiche son propre état vide + CTA de simulation.

**Onglet Commandes** : tableau complet (n°, date, client, articles, total) avec
statut modifiable à la volée (sauvegarde + feedback ✓). Graphes 100 % SVG maison
— aucune librairie de charts.

---

## 12. Internationalisation FR/EN

- Contexte `I18nProvider` (`src/lib/i18n.tsx`) : `locale` (`fr` par défaut),
  `setLocale`, `t(key, vars)`.
- Sélecteur **FR | EN** dans l'en-tête, persisté dans `localStorage`
  (`tsara-locale`), `<html lang>` mis à jour à chaud.
- Dictionnaire **plats** : `FR` et `EN` = `Record<string, string>`. Interpolation
  `{{variable}}` : `t('cart.freeRemaining', { amount: formatMoney(x, locale) })`.
- Les **noms de produits, notes de dégustation, libellés d'origine** vivent dans
  `src/data/products.ts` sous forme `{ fr, en }` ; la facture traduit elle aussi
  (libellés via le dictionnaire).
- Pour ajouter une langue : dupliquez `FR` en un 3e objet, ajoutez-le dans `DICTS`
  et à `LOCALES` — puis le libellé du sélecteur.

---

## 13. Personnaliser la boutique

### Ajouter / modifier un produit (`src/data/products.ts`)

```ts
{
  id: 'mon-cafe',                 // clé stable pour le panier et les commandes
  slug: 'mon-cafe',               // URL /produit/mon-cafe
  name: 'Nom du café',
  type: 'grains',                 // 'grains' | 'moulu' | 'coffret'
  origin: 'fianarantsoa',         // clé présente dans ORIGIN_LABELS (filtre du catalogue)
  roast: 'moyenne',               // 'claire'|'moyenne'|'moyenne-foncee'|'foncee'
  notes: { fr: ['…'], en: ['…'] },
  description: { fr: '…', en: '…' },
  badge: { fr: 'Nouveau', en: 'New' },   // optionnel
  featured: true,                        // optionnel — apparaît sur l'accueil
  price: { s250: 12.5, s1000: 44 },      // coffret : price: { coffret: 39.9 }
  accent: '#C07A3A',              // couleur du sachet SVG
  contents: { fr: '…', en: '…' }, // optionnel — coffrets uniquement
}
```

Le prix affiché au catalogue est `getMinPrice()` (« dès X € ») ; la carte ajoute
au panier le format 250 g (grains → mouture « grains », moulu → « filtre »).

### Tokens de design (`tailwind.config.ts`)

`noir #1E1612` · `creme #F6EFE6` · `caramel #C07A3A` (+ `deep/light`) ·
`sauge #6B7F5E` (+ `deep/soft`) · ombres `warm` / `warm-lg` · keyframes
(`fade-up`, `float`, `bump`, `marquee`, `toast-in`, `draw-check`…).

### Règles de prix

| Règle | Fichier | Valeur |
|---|---|---|
| Frais de port | `src/lib/shipping.ts` | `SHIPPING_FEE = 6.9` |
| Seuil livraison offerte | `src/lib/shipping.ts` | `FREE_SHIPPING_MIN = 60` |
| Code promo | `src/lib/promo.ts` | `PROMO_CODES = [{ code: 'BIENVENUE10', percentOff: 10 }]` |

Ces deux fichiers sont partagés client (affichage) **et** serveur (recalcul) :
modifiez-les une seule fois.

---

## 14. Panier & stockage navigateur

| Clé `localStorage` | Contenu |
|---|---|
| `tsara-cart-v1` | `{ lines: [{ productId, format, grind, qty }], promoCode }` — lignes fusionnées par clé `productId__format__grind`, quantités 1–99 |
| `tsara-locale` | `'fr' \| 'en'` |

Anti-décalage SSR : le contexte expose `ready` (lecture locale terminée) — les
pages panier/checkout affichent un squelette avant, un état vide ensuite. Le
toast « ajouté au panier » (`aria-live="polite"`) est émis par le `CartProvider`.

---

## 15. Accessibilité, SEO & qualité

- **A11y** : skip-link, `label` sur chaque champ, `role="alert"` pour les erreurs,
  `aria-live` (compteur, totaux), `aria-pressed`/`aria-current`, focus visibles,
  contrastes palette, états vides sur toutes les listes, animations désactivées
  sous `prefers-reduced-motion`.
- **SEO** : `metadata` par page (title/description/OpenGraph), titres dynamiques
  par produit (`generateMetadata`), `robots: noindex` sur panier/paiement/admin/facture.
- **Typographie** : tabular-nums sur les tableaux, prix via `Intl.NumberFormat`.
- **Vérifié** : `npm run build` sans erreur ; parcours e2e testé (checkout 4242 →
  201, refus 4000…0002, suivi mauvais e-mail → 404, PATCH statut, seed admin).

---

## 16. Limites du mode démo

| Aspect | Réalité actuelle | Pour la production |
|---|---|---|
| Commandes | fichier JSON local (`fs`) | base de données / service (l'écriture locale interdit le déploiement serverless actuel) |
| Paiement | `SimulatedPaymentProvider` | brancher Stripe/PayPal via l'interface (§8) |
| Admin | sans mot de passe | authentification obligatoire |
| Suivi de commande | n° + e-mail | comptes clients / liens signés |
| E-mail de confirmation | mentionné, fictif | service d'e-mail transactionnel |
| Données personnelles | survivantes en local uniquement (l'e-mail sert au suivi) | conformité RGPD à traiter |

---

## 17. Scripts npm

| Script | Effet |
|---|---|
| `npm run dev` | serveur de développement (hot reload) |
| `npm run build` | build de production + vérification TypeScript |
| `npm start` | sert le build de production en local |

---

## 18. Licence

Projet de démonstration. **Tsara Café est une marque fictive** : produits, prix,
avis clients, CGV et coordonnées sont imaginaires, à des fins pédagogiques. Le
code est librement réutilisable ; pensez à retirer la mention « démonstration »
lorsque le paiement réel est branché.

> ☕ Fait avec Next.js 14 + Tailwind — paiements simulés, sans service externe.
