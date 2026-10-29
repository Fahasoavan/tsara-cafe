/**
 * Catalogue de démonstration Tsara Café.
 * Source de vérité unique pour les prix — le serveur recalcule les totaux
 * à partir de ce fichier, il ne fait jamais confiance au navigateur.
 */

export type ProductType = 'grains' | 'moulu' | 'coffret';
export type FormatId = 's250' | 's1000' | 'coffret';
export type GrindId = 'grains' | 'filtre' | 'espresso' | 'piston' | 'moka';
export type RoastId = 'claire' | 'moyenne' | 'moyenne-foncee' | 'foncee';

export interface Product {
  id: string;
  slug: string;
  name: string;
  type: ProductType;
  /** Clé d'origine (bilingue via ORIGIN_LABELS) ; « assortiment » pour les coffrets */
  origin: string;
  roast: RoastId;
  notes: { fr: string[]; en: string[] };
  description: { fr: string; en: string };
  badge?: { fr: string; en: string };
  featured?: boolean;
  price: { s250?: number; s1000?: number; coffret?: number };
  /** Couleur dominante du sachet (SVG) */
  accent: string;
  /** Libellé du contenu pour les coffrets */
  contents?: { fr: string; en: string };
}

/** Moutures proposées, dans l'ordre d'affichage */
export const GRIND_OPTIONS: { id: GrindId; appliesTo: ProductType[] }[] = [
  { id: 'grains', appliesTo: ['grains'] },
  { id: 'filtre', appliesTo: ['grains', 'moulu'] },
  { id: 'espresso', appliesTo: ['grains', 'moulu'] },
  { id: 'piston', appliesTo: ['grains', 'moulu'] },
  { id: 'moka', appliesTo: ['grains', 'moulu'] },
];

export const ORIGIN_LABELS: Record<string, { fr: string; en: string }> = {
  fianarantsoa: { fr: 'Fianarantsoa', en: 'Fianarantsoa' },
  sambirano: { fr: 'Vallée du Sambirano', en: 'Sambirano Valley' },
  andasibe: { fr: 'Andasibe', en: 'Andasibe' },
  antalaha: { fr: 'Antalaha', en: 'Antalaha' },
  mananara: { fr: 'Mananara', en: 'Mananara' },
  antsirabe: { fr: 'Antsirabe', en: 'Antsirabe' },
  toamasina: { fr: 'Toamasina', en: 'Toamasina' },
  assortiment: { fr: 'Assortiment', en: 'Assorted' },
};

export const PRODUCTS: Product[] = [
  {
    id: 'andasibe-floral',
    slug: 'andasibe-floral',
    name: 'Vallée d’Andasibe',
    type: 'grains',
    origin: 'andasibe',
    roast: 'claire',
    notes: {
      fr: ['Fleur d’oranger', 'Bergamote', 'Sucre de canne'],
      en: ['Orange blossom', 'Bergamot', 'Cane sugar'],
    },
    description: {
      fr: 'Un arabica du millésime le plus frais, cultivé en bordure de la réserve d’Andasibe. Torréfaction claire pour préserver sa fine acidité florale : une tasse lumineuse, parfaite en filtre.',
      en: 'A very bright arabica grown at the edge of the Andasibe reserve. Light-roasted to keep its delicate floral acidity: a luminous cup, perfect as filter coffee.',
    },
    badge: { fr: 'Nouveau', en: 'New' },
    featured: true,
    price: { s250: 13.5, s1000: 47.5 },
    accent: '#B08A5A',
  },
  {
    id: 'bourbon-pointu',
    slug: 'bourbon-pointu',
    name: 'Bourbon Pointu',
    type: 'grains',
    origin: 'sambirano',
    roast: 'claire',
    notes: {
      fr: ['Jasmin', 'Litchi', 'Miel'],
      en: ['Jasmine', 'Lychee', 'Honey'],
    },
    description: {
      fr: 'La légende malgache : le Bourbon Pointu (Laurina), variété naine au prix ferme, cultivée en très petite quantité dans la vallée du Sambirano. Délicate, fruitée, presque théière — l’une des tasses les plus recherchées du monde.',
      en: 'The Madagascar legend: Bourbon Pointu (Laurina), a dwarf heirloom variety grown in tiny volumes in the Sambirano valley. Delicate, fruit-driven, almost tea-like — one of the world’s most coveted cups.',
    },
    badge: { fr: 'Rare', en: 'Rare' },
    featured: true,
    price: { s250: 24.9, s1000: 89 },
    accent: '#C07A3A',
  },
  {
    id: 'fianarantsoa-bio',
    slug: 'fianarantsoa-bio',
    name: 'Hauts Plateaux Bio',
    type: 'grains',
    origin: 'fianarantsoa',
    roast: 'moyenne',
    notes: {
      fr: ['Raisin', 'Cacao', 'Amande grillée'],
      en: ['Grape', 'Cocoa', 'Roasted almond'],
    },
    description: {
      fr: 'Arabica certifié bio des hauteurs de Fianarantsoa, à 1 200 m d’altitude. Torréfaction moyenne et équilibre rare entre fruit et cacao : la valeur sûre de la gamme, à boire toute la journée.',
      en: 'Certified organic arabica from the Fianarantsoa highlands, 1,200 m above sea level. Medium roast with a rare fruit-and-cocoa balance: the dependable everyday cup of the range.',
    },
    badge: { fr: 'Bio', en: 'Organic' },
    price: { s250: 14.9, s1000: 52 },
    accent: '#6B7F5E',
  },
  {
    id: 'ambanja-grand-cru',
    slug: 'ambanja-grand-cru',
    name: 'Ambanja Grand Cru',
    type: 'grains',
    origin: 'sambirano',
    roast: 'moyenne-foncee',
    notes: {
      fr: ['Chocolat noir', 'Noisette', 'Épices douces'],
      en: ['Dark chocolate', 'Hazelnut', 'Sweet spices'],
    },
    description: {
      fr: 'Grand terroir du Sambirano, entre manguiers et cacaoyers. Torréfaction moyenne-foncée : une tasse ronde et réconfortante, avec un nez de chocolat noir qui traverse la cuisine.',
      en: 'A celebrated Sambirano terroir between mango and cocoa trees. Medium-dark roast: a round, comforting cup with a dark-chocolate nose that fills the kitchen.',
    },
    featured: true,
    price: { s250: 12.9, s1000: 45 },
    accent: '#8A5A32',
  },
  {
    id: 'cacao-sauvage',
    slug: 'cacao-sauvage',
    name: 'Cacao Sauvage',
    type: 'moulu',
    origin: 'mananara',
    roast: 'foncee',
    notes: {
      fr: ['Cacao intense', 'Noix torréfiées', 'Fumée douce'],
      en: ['Intense cocoa', 'Roasted nuts', 'Gentle smoke'],
    },
    description: {
      fr: 'Un robusta d’altitude de Mananara, torréfié foncé et généreux. Corps massif, arôme de cacao amer : le café des matinées d’hiver, à faire infuser tout en douceur au piston.',
      en: 'A highland robusta from Mananara with a generous dark roast. Massive body, bitter-cocoa aroma: the winter-morning coffee, brewed low and slow in a French press.',
    },
    price: { s250: 11.5, s1000: 40 },
    accent: '#5A4232',
  },
  {
    id: 'vanille-antalaha',
    slug: 'vanille-antalaha',
    name: 'Vanille d’Antalaha',
    type: 'moulu',
    origin: 'antalaha',
    roast: 'moyenne',
    notes: {
      fr: ['Vanille bourbon', 'Cannelle', 'Caramel'],
      en: ['Bourbon vanilla', 'Cinnamon', 'Caramel'],
    },
    description: {
      fr: 'Cultivé à côté des champs de vanille d’Antalaha, ce moulu chaleureux exhale des notes naturelles — sans aucun arôme ajouté. Un dessert liquide, à boire le matin et pourquoi pas après.',
      en: 'Grown alongside Antalaha’s vanilla fields, this warm ground coffee naturally exhales vanilla — with no added flavouring. A liquid dessert for the morning, or after dinner.',
    },
    badge: { fr: 'Best-seller', en: 'Best-seller' },
    price: { s250: 12.5, s1000: 44 },
    accent: '#C8955C',
  },
  {
    id: 'plateaux-antsirabe',
    slug: 'plateaux-antsirabe',
    name: 'Plateaux d’Antsirabe',
    type: 'moulu',
    origin: 'antsirabe',
    roast: 'moyenne',
    notes: {
      fr: ['Agrume', 'Sureau', 'Zeste de mandarine'],
      en: ['Citrus', 'Elderflower', 'Mandarin zest'],
    },
    description: {
      fr: 'Élevé parmi les rizières en terrasse autour d’Antsirabe, un profil vif et aromatique qui rappelle le citron confit. Bel équilibre en espresso serré comme en infusion douce.',
      en: 'Raised among the terraced rice paddies around Antsirabe, a lively, aromatic profile reminiscent of candied citron. Equally lovely as a tight espresso or a gentle brew.',
    },
    price: { s250: 11.9, s1000: 42.5 },
    accent: '#A57C43',
  },
  {
    id: 'robusta-toamasina',
    slug: 'robusta-toamasina',
    name: 'Robusta Bleu de Toamasina',
    type: 'grains',
    origin: 'toamasina',
    roast: 'foncee',
    notes: {
      fr: ['Cacao intensifié', 'Tabac blond', 'Bois de rose'],
      en: ['Intense cocoa', 'Blond tobacco', 'Rosewood'],
    },
    description: {
      fr: 'Le robusta côtier de Toamasina, préparé en fermentation longue pour adoucir son amertume. Torréfaction foncée, crème dense et généreuse — l’allié idéal de l’espresso du matin.',
      en: 'The coastal robusta of Toamasina, long-fermented to soften its bitterness. Dark roast with a dense, generous crema — the ideal ally of the morning espresso.',
    },
    price: { s250: 10.9, s1000: 38.5 },
    accent: '#9A6B3F',
  },
  {
    id: 'coffret-decouverte',
    slug: 'coffret-decouverte',
    name: 'Coffret Découverte',
    type: 'coffret',
    origin: 'assortiment',
    roast: 'moyenne',
    notes: {
      fr: ['Idée cadeau', '3 plaisirs', 'Récolte du mois'],
      en: ['Gift idea', '3 delights', 'This month’s harvest'],
    },
    contents: {
      fr: '3 sachets de 250 g moulus : Vallée d’Andasibe, Vanille d’Antalaha et Cacao Sauvage.',
      en: '3 × 250 g ground bags: Andasibe Valley, Antalaha Vanilla and Wild Cocoa.',
    },
    description: {
      fr: 'Trois moulus signature dans un coffret cartonné noué d’un ruban raphia, avec une carte de dégustation signée du torréfacteur. Une invitation au voyage, prête à offrir.',
      en: 'Three signature ground coffees in a raffia-tied gift box, with a tasting card signed by the roaster. A ready-to-give invitation to travel.',
    },
    badge: { fr: 'Coffret', en: 'Gift set' },
    price: { coffret: 39.9 },
    accent: '#C07A3A',
  },
  {
    id: 'coffret-prestige',
    slug: 'coffret-prestige',
    name: 'Coffret Prestige',
    type: 'coffret',
    origin: 'assortiment',
    roast: 'moyenne',
    notes: {
      fr: ['Grandes occasions', 'Grains rares', 'Boîte premium'],
      en: ['Special occasions', 'Rare beans', 'Premium box'],
    },
    contents: {
      fr: '2 sachets de 250 g en grains (Bourbon Pointu, Ambanja Grand Cru) + 1 sachet de 250 g moulu Vanille d’Antalaha.',
      en: '2 × 250 g whole-bean bags (Bourbon Pointu, Ambanja Grand Cru) + 1 × 250 g ground bag of Antalaha Vanilla.',
    },
    description: {
      fr: 'Le meilleur de Tsara Café réuni dans une boîte rigide couleur chocolat : les deux grands crus en grains et un moulu corsé. Pour les grandes occasions — ou tous les jours, si vous vous aimez.',
      en: 'The best of Tsara Café in a chocolate-brown rigid box: both grand crus as whole beans plus a bold ground coffee. For special occasions — or every day, if you like yourself.',
    },
    badge: { fr: 'Prestige', en: 'Prestige' },
    price: { coffret: 59.9 },
    accent: '#8A5A32',
  },
];

/* ---------- Helpers partagés client / serveur ---------- */

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getUnitPrice(p: Product, format: FormatId): number {
  if (format === 's250') return p.price.s250 ?? p.price.coffret ?? 0;
  if (format === 's1000') return p.price.s1000 ?? p.price.s250 ?? p.price.coffret ?? 0;
  return p.price.coffret ?? p.price.s250 ?? 0;
}

/** Prix le plus bas, affiché sur les cartes (« dès 12,50 € ») */
export function getMinPrice(p: Product): number {
  const values = [p.price.s250, p.price.s1000, p.price.coffret].filter(
    (v): v is number => typeof v === 'number',
  );
  return Math.min(...values);
}

/** Origines uniques, pour le filtre du catalogue */
export function getOrigins(): string[] {
  return Array.from(new Set(PRODUCTS.map((p) => p.origin)));
}

/** Moutures autorisées pour un produit */
export function getGrindOptions(p: Product): GrindId[] {
  return GRIND_OPTIONS.filter((o) => o.appliesTo.includes(p.type)).map((o) => o.id);
}
