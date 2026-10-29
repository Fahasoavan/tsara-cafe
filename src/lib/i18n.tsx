'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export type Locale = 'fr' | 'en';

export const LOCALES: { id: Locale; label: string }[] = [
  { id: 'fr', label: 'FR' },
  { id: 'en', label: 'EN' },
];

/** Pays proposés dans le formulaire d'adresse */
export const COUNTRIES: { value: string; fr: string; en: string }[] = [
  { value: 'FR', fr: 'France', en: 'France' },
  { value: 'BE', fr: 'Belgique', en: 'Belgium' },
  { value: 'CH', fr: 'Suisse', en: 'Switzerland' },
  { value: 'LU', fr: 'Luxembourg', en: 'Luxembourg' },
  { value: 'DE', fr: 'Allemagne', en: 'Germany' },
  { value: 'ES', fr: 'Espagne', en: 'Spain' },
  { value: 'IT', fr: 'Italie', en: 'Italy' },
  { value: 'MG', fr: 'Madagascar', en: 'Madagascar' },
  { value: 'OTHER', fr: 'Autre / Other', en: 'Other / Other' },
];

const FR: Record<string, string> = {
  /* ---- Global ---- */
  'brand.tagline': 'Café de spécialité de Madagascar',
  'demo.banner': 'Mode démonstration — aucun paiement réel n’est effectué.',
  'a11y.skip': 'Aller au contenu',
  'a11y.openMenu': 'Ouvrir le menu',
  'a11y.closeMenu': 'Fermer le menu',
  'a11y.openCart': 'Voir le panier',
  'a11y.increase': 'Augmenter la quantité',
  'a11y.decrease': 'Réduire la quantité',
  'a11y.remove': 'Retirer du panier',
  'nav.home': 'Accueil',
  'nav.catalog': 'Catalogue',
  'nav.track': 'Suivi',
  'nav.admin': 'Admin',
  'nav.language': 'Langue',
  'footer.shop': 'Boutique',
  'footer.help': 'Aide',
  'footer.legal': 'Légal',
  'footer.terms': 'CGV',
  'footer.returns': 'Livraison & retours',
  'footer.tagline':
    'Le goût des hauts plateaux malgaches, torréfié à Antananarivo et expédié partout en Europe.',
  'footer.demo':
    'Ceci est un site de démonstration : les paiements sont simulés et aucune donnée réelle n’est collectée.',
  'footer.rights': '© {{year}} Tsara Café. Tous droits réservés.',

  /* ---- Accueil ---- */
  'home.marquee.1': 'Livraison offerte dès 60 €',
  'home.marquee.2': 'Torréfaction artisanale par petits lots',
  'home.marquee.3': 'Grains ou moulus — sachets 250 g & 1 kg',
  'home.marquee.4': 'Coffrets découverte à offrir',
  'home.hero.badge': 'Récoltes 2026 arrivées en stock',
  'home.hero.title': 'L’âme de Madagascar, dans votre tasse.',
  'home.hero.sub':
    'Arabica des hauts plateaux et robusta du littoral, récoltés à la main, torréfiés à Antananarivo et expédiés en grains ou moulus. Sachets de 250 g et 1 kg, coffrets à offrir.',
  'home.hero.cta1': 'Découvrir le catalogue',
  'home.hero.cta2': 'Notre histoire',
  'home.hero.stat1': 'régions partenaires',
  'home.hero.stat2': 'coopératives partenaires',
  'home.hero.stat3': 'récolte 100 % manuelle',
  'home.trust1.t': 'Torréfaction artisanale',
  'home.trust1.d': 'Lots courts et profils doux pour préserver tous les arômes.',
  'home.trust2.t': 'Récolte 100 % manuelle',
  'home.trust2.d': 'Cerises triées grain par grain par nos coopératives partenaires.',
  'home.trust3.t': 'Livraison rapide',
  'home.trust3.d': 'Expédition sous 48 h, livraison offerte dès 60 € d’achat.',
  'home.trust4.t': 'Fraîcheur garantie',
  'home.trust4.d': 'Sachets refermables avec soupape, torréfaction du mois.',
  'home.featured.kicker': 'Nos coups de cœur',
  'home.featured.title': 'Trois cafés à goûter absolument',
  'home.featured.sub': 'Sélectionnés cette saison par notre maître torréfacteur.',
  'home.featured.all': 'Voir tout le catalogue',
  'home.story.kicker': 'Notre histoire',
  'home.story.title': 'Née dans une plantation, au lever du soleil.',
  'home.story.p1':
    'En 2019, Hery et Fanja quittent leurs bureaux d’Antananarivo pour reprendre une petite sécherie à Fianarantsoa. Leur conviction : le café malgache mérite mieux que d’être vendu en vrac, anonyme, à l’autre bout du monde.',
  'home.story.p2':
    'Aujourd’hui, Tsara Café travaille main dans la main avec douze coopératives des régions de Fianarantsoa, du Sambirano, d’Antalaha et de Mananara. Les cerises sont triées à la main, dépulpées dans la journée, séchées sur lits africains puis torréfiées en petites séries.',
  'home.story.p3':
    '« Tsara » signifie « beau » en malgache. C’est toute notre promesse : des cafés beaux, justes et généreux — du producteur à votre tasse.',
  'home.story.point1': 'Du producteur à votre tasse, sans intermédiaire',
  'home.story.point2': 'Prix fermes et justes payés aux coopératives',
  'home.story.point3': 'Torréfaction en petits lots, datée au dos du sachet',
  'home.story.cta': 'Découvrir les cafés',
  'home.reviews.kicker': 'Avis clients',
  'home.reviews.title': 'Ce qu’en disent les amateurs',
  'home.reviews.sub': 'Quelques mots reçus depuis nos premières récoltes.',
  'home.reviews.r1.text':
    'Le Bourbon Pointu m’a ému : jasmin, litchi, une finesse que je n’avais jamais goûtée dans un café. Un vrai voyage en tasse.',
  'home.reviews.r1.name': 'Nadia R.',
  'home.reviews.r1.city': 'Antananarivo',
  'home.reviews.r2.text':
    'Commande reçue en deux jours, sachet refermable impeccable. Depuis, mes matins sentent la vanille et le cacao.',
  'home.reviews.r2.name': 'Marc D.',
  'home.reviews.r2.city': 'Lyon',
  'home.reviews.r3.text':
    'J’ai offert le coffret découverte à mon père : silence dans la pièce, puis « c’est le meilleur café que tu m’as apporté ». Emballage magnifique.',
  'home.reviews.r3.name': 'Zoé M.',
  'home.reviews.r3.city': 'Bruxelles',
  'home.cta.title': 'Prêt à goûter Madagascar ?',
  'home.cta.sub': 'En grains, moulu ou en coffret. Livré en 48 h — offert dès 60 € d’achat.',
  'home.cta.button': 'Parcourir le catalogue',

  /* ---- Catalogue & produit ---- */
  'type.grains': 'Café en grains',
  'type.moulu': 'Café moulu',
  'type.coffret': 'Coffret',
  'roastValue.claire': 'Torréfaction claire',
  'roastValue.moyenne': 'Torréfaction moyenne',
  'roastValue.moyenne-foncee': 'Torréfaction moyenne-foncée',
  'roastValue.foncee': 'Torréfaction foncée',
  'label.type': 'Type',
  'label.origin': 'Origine',
  'label.roast': 'Torréfaction',
  'label.notes': 'Notes de dégustation',
  'cat.title': 'Le catalogue',
  'cat.sub':
    'Dix références, du Bourbon Pointu rare aux assemblages d’Antalaha. Filtrez, comparez, remplissez le panier.',
  'cat.filter.type': 'Type',
  'cat.filter.typeAll': 'Tous types',
  'cat.filter.origin': 'Origine',
  'cat.filter.originAll': 'Toutes origines',
  'cat.filter.sort': 'Trier par',
  'cat.sort.featured': 'Mise en avant',
  'cat.sort.priceAsc': 'Prix croissant',
  'cat.sort.priceDesc': 'Prix décroissant',
  'cat.sort.name': 'Nom (A → Z)',
  'cat.reset': 'Réinitialiser',
  'cat.resultsOne': '1 produit',
  'cat.resultsOther': '{{n}} produits',
  'cat.empty.title': 'Aucun produit ne correspond',
  'cat.empty.sub': 'Essayez de retirer un filtre ou deux — le bon grain se cache derrière.',
  'card.from': 'dès',
  'card.add': 'Ajouter au panier',
  'product.back': 'Retour au catalogue',
  'product.notfound.title': 'Produit introuvable',
  'product.notfound.sub': 'Le produit demandé n’existe pas ou a été retiré du catalogue.',
  'product.instock': 'En stock — expédié sous 48 h',
  'product.format': 'Format',
  'format.250': '250 g',
  'format.1000': '1 kg',
  'format.coffret': 'Coffret',
  'product.per100g': 'soit {{price}} / 100 g',
  'product.grind': 'Mouture',
  'grind.grains': 'Grain entier',
  'grind.filtre': 'Moulu filtre',
  'grind.espresso': 'Moulu espresso',
  'grind.piston': 'Moulu piston',
  'grind.moka': 'Moulu moka',
  'product.qty': 'Quantité',
  'product.addToCart': 'Ajouter au panier',
  'product.adding': 'Ajout…',
  'product.includes': 'Contenu du coffret',
  'product.setNote': 'Livré dans sa boîte cartonnée, prêt à offrir.',
  'product.detailsTitle': 'Bon à savoir',
  'product.info1': 'Sachet refermable à soupape de dégazage',
  'product.info2': 'Torréfaction datée au dos du sachet',
  'product.info3': 'Expédié sous 48 h, emballage recyclable',

  /* ---- Panier ---- */
  'cart.title': 'Votre panier',
  'cart.itemsOne': '1 article',
  'cart.itemsOther': '{{n}} articles',
  'cart.empty.title': 'Votre panier est vide',
  'cart.empty.sub': 'Il y a une place de libre pour un beau café.',
  'cart.empty.cta': 'Découvrir le catalogue',
  'cart.col.item': 'Article',
  'cart.col.qty': 'Quantité',
  'cart.col.total': 'Total',
  'cart.summary.title': 'Récapitulatif',
  'cart.summary.subtotal': 'Sous-total',
  'cart.summary.shipping': 'Livraison',
  'cart.summary.free': 'Offerte',
  'cart.summary.discount': 'Remise ({{code}})',
  'cart.summary.total': 'Total',
  'cart.summary.vat': 'Prix TTC. Livraison offerte dès 60 € d’achat.',
  'cart.summary.checkout': 'Passer au paiement',
  'cart.summary.continue': 'Continuer mes achats',
  'cart.freeRemaining': 'Plus que {{amount}} pour la livraison offerte !',
  'cart.freeDone': 'Livraison offerte débloquée 🎉',
  'promo.label': 'Code promo',
  'promo.placeholder': 'BIENVENUE10',
  'promo.apply': 'Appliquer',
  'promo.remove': 'Retirer',
  'promo.ok': 'Code appliqué : −10 % sur le sous-total.',
  'promo.invalid': 'Code promo inconnu. Essayez « BIENVENUE10 ».',
  'cart.added': '{{name}} ajouté au panier',
  'cart.addedOther': '{{name}} ajoutée au panier',
  'cart.view': 'Voir le panier',

  /* ---- Paiement ---- */
  'checkout.title': 'Paiement',
  'checkout.step1': 'Adresse de livraison',
  'checkout.step2': 'Paiement (démonstration)',
  'form.name': 'Prénom et nom',
  'form.address': 'Adresse',
  'form.postal': 'Code postal',
  'form.city': 'Ville',
  'form.country': 'Pays',
  'form.email': 'E-mail',
  'form.emailHint': 'Pour la confirmation et le suivi de commande.',
  'form.cardholder': 'Titulaire de la carte',
  'form.cardNumber': 'Numéro de carte',
  'form.expiry': 'Expiration (MM/AA)',
  'form.cvc': 'CVC',
  'ph.name': 'Rakoto Fanja',
  'ph.address': '12 rue des Baobabs',
  'ph.postal': '69003',
  'ph.city': 'Lyon',
  'ph.email': 'vous@exemple.fr',
  'checkout.cardTip': 'Banc de test :',
  'checkout.cardOk': '4242 4242 4242 4242 · expiration future · CVC 123',
  'checkout.cardKo': 'Refus attendu : 4000 0000 0000 0002',
  'checkout.pay': 'Payer {{amount}}',
  'checkout.paying': 'Paiement en cours…',
  'checkout.secure': 'Paiement simulé — aucune transaction réelle, aucune donnée conservée.',
  'checkout.error.address': 'Merci de remplir tous les champs de l’adresse.',
  'checkout.error.email': 'Adresse e-mail invalide.',
  'checkout.error.card': 'Merci de vérifier les informations de carte.',
  'checkout.error.cvc': 'Le CVC doit contenir 3 chiffres.',
  'checkout.error.expiry': 'Date d’expiration invalide ou passée.',
  'checkout.error.number': 'Numéro de carte incomplet.',
  'checkout.error.declined':
    'Paiement refusé par la banque émettrice (c’est normal avec cette carte de test). Essayez 4242 4242 4242 4242.',
  'checkout.error.invalidCard': 'Carte non reconnue. Utilisez la carte de test 4242 4242 4242 4242.',
  'checkout.error.empty': 'Votre panier est vide.',
  'checkout.error.generic': 'Une erreur est survenue. Merci de réessayer.',

  /* ---- Confirmation ---- */
  'confirm.badge': 'Commande confirmée',
  'confirm.title': 'Merci — votre café arrive !',
  'confirm.sub': 'Un e-mail récapitulatif (fictif) a été envoyé à {{email}}.',
  'confirm.order': 'Commande {{id}}',
  'confirm.status': 'Statut',
  'confirm.recap': 'Récapitulatif',
  'confirm.address': 'Adresse de livraison',
  'confirm.payment': 'Paiement',
  'confirm.paidWith': 'Carte bancaire •••• {{last4}} (démonstration)',
  'confirm.invoice': 'Télécharger la facture',
  'confirm.track': 'Suivre ma commande',
  'confirm.home': 'Retour à l’accueil',
  'confirm.notfound.title': 'Commande introuvable',
  'confirm.notfound.sub': 'Vérifiez le lien, ou essayez la page de suivi avec votre numéro de commande.',
  'confirm.loading': 'Chargement de votre commande…',

  /* ---- Facture ---- */
  'inv.title': 'Facture',
  'inv.no': 'N° {{no}}',
  'inv.date': 'Date',
  'inv.seller': 'Émetteur — démonstration',
  'inv.sellerLines':
    'Tsara Café SARL (fictif)\n12 allée des Tsingy\n101 Antananarivo, Madagascar',
  'inv.billTo': 'Facturé à',
  'inv.item': 'Désignation',
  'inv.qty': 'Qté',
  'inv.unit': 'P. unitaire',
  'inv.total': 'Total',
  'inv.demoNote': 'Paiement simulé — aucune somme n’est réellement due. Document sans valeur comptable.',
  'inv.thanks': 'Merci pour votre confiance ! — L’équipe Tsara Café',
  'inv.print': 'Imprimer / Enregistrer en PDF',
  'inv.back': 'Retour à ma commande',

  /* ---- Suivi ---- */
  'track.title': 'Suivre ma commande',
  'track.sub': 'Entrez le numéro figurant sur votre e-mail de confirmation, puis l’e-mail utilisé lors de l’achat.',
  'track.orderNo': 'Numéro de commande',
  'track.orderPH': 'TS-XXXXXX',
  'track.email': 'E-mail',
  'track.submit': 'Rechercher',
  'track.searching': 'Recherche…',
  'track.notfound': 'Aucune commande ne correspond à ces informations.',
  'track.loading': 'Chargement…',
  'track.status': 'Statut',
  'track.orderedOn': 'Commandée le',
  'track.items': 'Articles',
  'track.newSearch': 'Nouvelle recherche',

  /* ---- Statuts (FR/EN) ---- */
  'status.paid': 'Payée',
  'status.preparing': 'En préparation',
  'status.shipped': 'Expédiée',

  /* ---- Admin ---- */
  'admin.title': 'Commandes',
  'admin.sub': 'Mode démonstration — accès libre, sans mot de passe.',
  'admin.tab.dashboard': 'Tableau de bord',
  'admin.tab.orders': 'Commandes',
  'admin.kpi.revenue': 'Chiffre d’affaires',
  'admin.kpi.orders': 'Commandes',
  'admin.kpi.ordersSub': 'depuis le lancement',
  'admin.kpi.avg': 'Panier moyen',
  'admin.kpi.avgSub': 'CA ÷ commandes',
  'admin.kpi.items': 'Articles vendus',
  'admin.kpi.itemsSub': 'toutes commandes confondues',
  'admin.kpi.growth': 'vs 7 j précédents',
  'admin.chart.daily': 'Évolution des ventes — 30 derniers jours',
  'admin.chart.top': 'Top produits',
  'admin.chart.topUnits': '{{n}} vendus',
  'admin.chart.format': 'Répartition par format',
  'admin.chart.status': 'Statuts des commandes',
  'admin.demo.seed': 'Simuler 25 commandes',
  'admin.demo.seeding': 'Génération…',
  'admin.demo.seeded': '✓ {{n}} commandes de démonstration créées',
  'admin.demo.clear': 'Effacer tout',
  'admin.demo.clearConfirm': 'Confirmer l’effacement',
  'admin.demo.cleared': '✓ Commandes effacées',
  'admin.empty.dash': 'Aucune vente à afficher',
  'admin.empty.dashSub': 'Effectuez une commande, ou simulez-en quelques-unes pour voir le tableau de bord prendre vie.',
  'admin.countOne': '1 commande',
  'admin.countOther': '{{n}} commandes',
  'admin.th.no': 'N°',
  'admin.th.date': 'Date',
  'admin.th.client': 'Client',
  'admin.th.items': 'Articles',
  'admin.th.total': 'Total',
  'admin.th.status': 'Statut',
  'admin.empty': 'Aucune commande pour le moment. Passez une commande sur la boutique : elle apparaîtra ici.',
  'admin.updated': 'Statut mis à jour ✓',
  'admin.error': 'Échec de la mise à jour, merci de réessayer.',
  'admin.loading': 'Chargement des commandes…',

  /* ---- Légal ---- */
  'legal.cgv.title': 'Conditions générales de vente',
  'legal.ship.title': 'Livraison & retours',
  'legal.updated': 'Dernière mise à jour : janvier 2026.',
  'legal.cgv.1.t': '1. Objet et démonstration',
  'legal.cgv.1.b':
    'Les présentes conditions encadrent les commandes passées sur la boutique en ligne Tsara Café. Ce site est une démonstration technique : les commandes sont enregistrées de façon fictive (dans un fichier local) et aucun contrat réel de vente n’est conclu. Aucun compte n’est débité.',
  'legal.cgv.2.t': '2. Prix',
  'legal.cgv.2.b':
    'Les prix sont indiqués en euros, toutes taxes comprises. Les frais de livraison (6,90 €) sont offerts à partir de 60 € d’achat. Des codes promotionnels, comme BIENVENUE10 (−10 %), peuvent être appliqués au sous-total.',
  'legal.cgv.3.t': '3. Paiement',
  'legal.cgv.3.b':
    'Le paiement est entièrement simulé : utilisez la carte de test 4242 4242 4242 4242 (expiration future, CVC 123) pour finaliser une commande, ou 4000 0000 0000 0002 pour tester un refus. Aucune donnée bancaire n’est conservée.',
  'legal.cgv.4.t': '4. Livraison',
  'legal.cgv.4.b':
    'Les commandes sont préparées sous 48 heures ouvrées et livrées en 2 à 4 jours ouvrés en France métropolitaine, Belgique, Suisse et Luxembourg. Le trackage est possible depuis la page « Suivi ».',
  'legal.cgv.5.t': '5. Retours',
  'legal.cgv.5.b':
    'Conformément à la loi, un délai de 14 jours est accordé pour se rétracter, le café devant être non ouvert. En mode démonstration, aucun remboursement réel n’est traité.',
  'legal.cgv.6.t': '6. Contact',
  'legal.cgv.6.b':
    'Tsara Café (société fictive) — 12 allée des Tsingy, 101 Antananarivo, Madagascar — contact@tsara-cafe.demo.',
  'legal.ship.1.t': 'Zones et délais',
  'legal.ship.1.b':
    'Nous expédions vers la France métropolitaine, la Belgique, la Suisse, le Luxembourg et Madagascar. Délai indicatif : 2 à 4 jours ouvrés pour l’Europe, 6 à 10 jours pour Madagascar.',
  'legal.ship.2.t': 'Frais de port',
  'legal.ship.2.b':
    'Frais fixes de 6,90 € par commande, quelle que soit la quantité — et offerts dès 60 € d’achat (après application d’un éventuel code promo).',
  'legal.ship.3.t': 'Préparation et emballage',
  'legal.ship.3.b':
    'Chaque commande part sous 48 h dans des sachets à soupape refermables, calés dans un emballage recyclable. La torréfaction est datée au dos de chaque sachet.',
  'legal.ship.4.t': 'Suivi de commande',
  'legal.ship.4.b':
    'Après validation, votre commande apparaît sur la page « Suivi » avec son numéro et votre e-mail. Statuts possibles : Payée, En préparation, Expédiée.',
  'legal.ship.5.t': 'Retours et soutenue',
  'legal.ship.5.b':
    'Vous disposez de 14 jours pour changer d’avis : le café doit être non ouvert, les frais de retour restent à votre charge. Sachet abîmé ou incorrect ? Un remplacement est expédié sous 7 jours à notre charge.',

  /* ---- 404 ---- */
  'nf.title': 'Page introuvable',
  'nf.sub': 'Ce lien n’existe pas — mais le catalogue, lui, existe toujours.',
  'nf.cta': 'Retour au catalogue',
  'nf.home': "Retour à l'accueil",
};

const EN: Record<string, string> = {
  /* ---- Global ---- */
  'brand.tagline': 'Specialty coffee from Madagascar',
  'demo.banner': 'Demo mode — no real payment is processed.',
  'a11y.skip': 'Skip to content',
  'a11y.openMenu': 'Open the menu',
  'a11y.closeMenu': 'Close the menu',
  'a11y.openCart': 'Open the cart',
  'a11y.increase': 'Increase quantity',
  'a11y.decrease': 'Decrease quantity',
  'a11y.remove': 'Remove from cart',
  'nav.home': 'Home',
  'nav.catalog': 'Shop',
  'nav.track': 'Track order',
  'nav.admin': 'Admin',
  'nav.language': 'Language',
  'footer.shop': 'Shop',
  'footer.help': 'Help',
  'footer.legal': 'Legal',
  'footer.terms': 'Terms',
  'footer.returns': 'Shipping & returns',
  'footer.tagline': 'The taste of Madagascar’s highlands, roasted in Antananarivo and shipped across Europe.',
  'footer.demo':
    'This is a demo site: payments are simulated and no real data is collected.',
  'footer.rights': '© {{year}} Tsara Café. All rights reserved.',

  /* ---- Home ---- */
  'home.marquee.1': 'Free shipping on orders over €60',
  'home.marquee.2': 'Small-batch craft roasting',
  'home.marquee.3': 'Whole beans or ground — 250 g & 1 kg bags',
  'home.marquee.4': 'Discovery sets made for gifting',
  'home.hero.badge': '2026 harvests just landed',
  'home.hero.title': 'Madagascar, distilled into your cup.',
  'home.hero.sub':
    'Highland arabica and coastal robusta, hand-picked, roasted in Antananarivo and shipped whole or ground. 250 g and 1 kg bags, plus gift sets.',
  'home.hero.cta1': 'Browse the shop',
  'home.hero.cta2': 'Our story',
  'home.hero.stat1': 'partner regions',
  'home.hero.stat2': 'partner cooperatives',
  'home.hero.stat3': 'hand-picked harvest',
  'home.trust1.t': 'Craft roasting',
  'home.trust1.d': 'Short batches and gentle profiles to preserve every aroma.',
  'home.trust2.t': '100% hand-picked',
  'home.trust2.d': 'Cherries sorted bean by bean by our partner cooperatives.',
  'home.trust3.t': 'Fast delivery',
  'home.trust3.d': 'Ships within 48 h, free delivery over €60.',
  'home.trust4.t': 'Guaranteed freshness',
  'home.trust4.d': 'Resealable one-way-valve bags, roasted this very month.',
  'home.featured.kicker': 'Our favourites',
  'home.featured.title': 'Three coffees you have to try',
  'home.featured.sub': 'Picked this season by our head roaster.',
  'home.featured.all': 'View the whole shop',
  'home.story.kicker': 'Our story',
  'home.story.title': 'Born in a plantation, at sunrise.',
  'home.story.p1':
    'In 2019, Hery and Fanja left their office jobs in Antananarivo to take over a small drying station in Fianarantsoa. Their conviction: Madagascar’s coffee deserves better than being sold anonymous, in bulk, at the other end of the world.',
  'home.story.p2':
    'Today, Tsara Café works hand in hand with twelve cooperatives across Fianarantsoa, the Sambirano, Antalaha and Mananara regions. Cherries are hand-sorted, pulped the same day, dried on African raised beds and roasted in small batches.',
  'home.story.p3':
    '“Tsara” means “beautiful” in Malagasy. That is the whole promise: coffees that are beautiful, fair and generous — from grower to cup.',
  'home.story.point1': 'From grower to your cup, with no middleman',
  'home.story.point2': 'Fair, firm prices paid to the cooperatives',
  'home.story.point3': 'Small-batch roasting, dated on the back of every bag',
  'home.story.cta': 'Discover the coffees',
  'home.reviews.kicker': 'Reviews',
  'home.reviews.title': 'What coffee lovers say',
  'home.reviews.sub': 'A few words received since our very first harvests.',
  'home.reviews.r1.text':
    'The Bourbon Pointu moved me: jasmine, lychee, a finesse I had never tasted in coffee. A true journey in a cup.',
  'home.reviews.r1.name': 'Nadia R.',
  'home.reviews.r1.city': 'Antananarivo',
  'home.reviews.r2.text':
    'Order arrived in two days, flawless resealable bag. My mornings now smell of vanilla and cocoa.',
  'home.reviews.r2.name': 'Marc D.',
  'home.reviews.r2.city': 'Lyon',
  'home.reviews.r3.text':
    'I gave the discovery set to my father: silence in the room, then “this is the best coffee you’ve ever brought me”. Beautiful packaging.',
  'home.reviews.r3.name': 'Zoé M.',
  'home.reviews.r3.city': 'Brussels',
  'home.cta.title': 'Ready to taste Madagascar?',
  'home.cta.sub': 'Whole bean, ground or gift set. Shipped in 48 h — free over €60.',
  'home.cta.button': 'Browse the shop',

  /* ---- Shop & product ---- */
  'type.grains': 'Whole beans',
  'type.moulu': 'Ground coffee',
  'type.coffret': 'Gift set',
  'roastValue.claire': 'Light roast',
  'roastValue.moyenne': 'Medium roast',
  'roastValue.moyenne-foncee': 'Medium-dark roast',
  'roastValue.foncee': 'Dark roast',
  'label.type': 'Type',
  'label.origin': 'Origin',
  'label.roast': 'Roast',
  'label.notes': 'Tasting notes',
  'cat.title': 'The shop',
  'cat.sub':
    'Ten coffees and gift sets, from the rare Bourbon Pointu to Antalaha blends. Filter, compare, fill your cart.',
  'cat.filter.type': 'Type',
  'cat.filter.typeAll': 'All types',
  'cat.filter.origin': 'Origin',
  'cat.filter.originAll': 'All origins',
  'cat.filter.sort': 'Sort by',
  'cat.sort.featured': 'Featured',
  'cat.sort.priceAsc': 'Price: low to high',
  'cat.sort.priceDesc': 'Price: high to low',
  'cat.sort.name': 'Name (A → Z)',
  'cat.reset': 'Reset',
  'cat.resultsOne': '1 product',
  'cat.resultsOther': '{{n}} products',
  'cat.empty.title': 'No product matches',
  'cat.empty.sub': 'Try removing a filter or two — the perfect bean might be behind it.',
  'card.from': 'from',
  'card.add': 'Add to cart',
  'product.back': 'Back to the shop',
  'product.notfound.title': 'Product not found',
  'product.notfound.sub': 'The product you asked for doesn’t exist or has left the shop.',
  'product.instock': 'In stock — ships within 48 h',
  'product.format': 'Size',
  'format.250': '250 g',
  'format.1000': '1 kg',
  'format.coffret': 'Gift set',
  'product.per100g': 'that’s {{price}} / 100 g',
  'product.grind': 'Grind',
  'grind.grains': 'Whole beans',
  'grind.filtre': 'Ground for filter',
  'grind.espresso': 'Ground for espresso',
  'grind.piston': 'French press ground',
  'grind.moka': 'Moka pot ground',
  'product.qty': 'Quantity',
  'product.addToCart': 'Add to cart',
  'product.adding': 'Adding…',
  'product.includes': 'What’s inside',
  'product.setNote': 'Ships in its wrapped gift box, ready to offer.',
  'product.detailsTitle': 'Good to know',
  'product.info1': 'Resealable bag with one-way degassing valve',
  'product.info2': 'Roast date printed on the back of the bag',
  'product.info3': 'Ships within 48 h, recyclable packaging',

  /* ---- Cart ---- */
  'cart.title': 'Your cart',
  'cart.itemsOne': '1 item',
  'cart.itemsOther': '{{n}} items',
  'cart.empty.title': 'Your cart is empty',
  'cart.empty.sub': 'There is just enough room left for one more bag.',
  'cart.empty.cta': 'Browse the shop',
  'cart.col.item': 'Item',
  'cart.col.qty': 'Quantity',
  'cart.col.total': 'Total',
  'cart.summary.title': 'Summary',
  'cart.summary.subtotal': 'Subtotal',
  'cart.summary.shipping': 'Shipping',
  'cart.summary.free': 'Free',
  'cart.summary.discount': 'Discount ({{code}})',
  'cart.summary.total': 'Total',
  'cart.summary.vat': 'All taxes included. Free shipping over €60.',
  'cart.summary.checkout': 'Proceed to checkout',
  'cart.summary.continue': 'Continue shopping',
  'cart.freeRemaining': 'Only {{amount}} away from free shipping!',
  'cart.freeDone': 'Free shipping unlocked 🎉',
  'promo.label': 'Promo code',
  'promo.placeholder': 'BIENVENUE10',
  'promo.apply': 'Apply',
  'promo.remove': 'Remove',
  'promo.ok': 'Code applied: −10% on the subtotal.',
  'promo.invalid': 'Unknown promo code. Try “BIENVENUE10”.',
  'cart.added': '{{name}} added to cart',
  'cart.addedOther': '{{name}} added to cart',
  'cart.view': 'View cart',

  /* ---- Checkout ---- */
  'checkout.title': 'Checkout',
  'checkout.step1': 'Delivery address',
  'checkout.step2': 'Payment (demo)',
  'form.name': 'Full name',
  'form.address': 'Address',
  'form.postal': 'Postal code',
  'form.city': 'City',
  'form.country': 'Country',
  'form.email': 'Email',
  'form.emailHint': 'For your receipt and order tracking.',
  'form.cardholder': 'Cardholder',
  'form.cardNumber': 'Card number',
  'form.expiry': 'Expiry (MM/YY)',
  'form.cvc': 'CVC',
  'ph.name': 'Jane Smith',
  'ph.address': '12 Baobab Street',
  'ph.postal': '69003',
  'ph.city': 'Lyon',
  'ph.email': 'you@example.com',
  'checkout.cardTip': 'Test bench:',
  'checkout.cardOk': '4242 4242 4242 4242 · future expiry · CVC 123',
  'checkout.cardKo': 'Expected decline: 4000 0000 0000 0002',
  'checkout.pay': 'Pay {{amount}}',
  'checkout.paying': 'Processing payment…',
  'checkout.secure': 'Simulated payment — no real transaction, no data stored.',
  'checkout.error.address': 'Please fill in every address field.',
  'checkout.error.email': 'Invalid email address.',
  'checkout.error.card': 'Please check your card details.',
  'checkout.error.cvc': 'The CVC must be 3 digits.',
  'checkout.error.expiry': 'Invalid or past expiry date.',
  'checkout.error.number': 'Incomplete card number.',
  'checkout.error.declined':
    'Payment declined by the issuing bank (expected with this test card). Try 4242 4242 4242 4242.',
  'checkout.error.invalidCard': 'Card not recognised. Use the test card 4242 4242 4242 4242.',
  'checkout.error.empty': 'Your cart is empty.',
  'checkout.error.generic': 'Something went wrong. Please try again.',

  /* ---- Confirmation ---- */
  'confirm.badge': 'Order confirmed',
  'confirm.title': 'Thank you — your coffee is on its way!',
  'confirm.sub': 'A (fictional) receipt email has been sent to {{email}}.',
  'confirm.order': 'Order {{id}}',
  'confirm.status': 'Status',
  'confirm.recap': 'Summary',
  'confirm.address': 'Delivery address',
  'confirm.payment': 'Payment',
  'confirm.paidWith': 'Card •••• {{last4}} (demo)',
  'confirm.invoice': 'Download the invoice',
  'confirm.track': 'Track this order',
  'confirm.home': 'Back home',
  'confirm.notfound.title': 'Order not found',
  'confirm.notfound.sub': 'Double-check the link, or search for your order number on the tracking page.',
  'confirm.loading': 'Loading your order…',

  /* ---- Invoice ---- */
  'inv.title': 'Invoice',
  'inv.no': 'No. {{no}}',
  'inv.date': 'Date',
  'inv.seller': 'Issuer — demo',
  'inv.sellerLines': 'Tsara Café Ltd (fictional)\n12 Tsingy Alley\n101 Antananarivo, Madagascar',
  'inv.billTo': 'Billed to',
  'inv.item': 'Description',
  'inv.qty': 'Qty',
  'inv.unit': 'Unit price',
  'inv.total': 'Total',
  'inv.demoNote': 'Simulated payment — no amount is actually due. This document has no accounting value.',
  'inv.thanks': 'Thank you for your trust! — The Tsara Café team',
  'inv.print': 'Print / Save as PDF',
  'inv.back': 'Back to my order',

  /* ---- Tracking ---- */
  'track.title': 'Track my order',
  'track.sub': 'Enter the order number from your confirmation email, then the email used at checkout.',
  'track.orderNo': 'Order number',
  'track.orderPH': 'TS-XXXXXX',
  'track.email': 'Email',
  'track.submit': 'Track order',
  'track.searching': 'Searching…',
  'track.notfound': 'No order matches this information.',
  'track.loading': 'Loading…',
  'track.status': 'Status',
  'track.orderedOn': 'Ordered on',
  'track.items': 'Items',
  'track.newSearch': 'New search',

  /* ---- Statuses ---- */
  'status.paid': 'Paid',
  'status.preparing': 'In preparation',
  'status.shipped': 'Shipped',

  /* ---- Admin ---- */
  'admin.title': 'Orders',
  'admin.sub': 'Demo mode — open access, no password.',
  'admin.tab.dashboard': 'Dashboard',
  'admin.tab.orders': 'Orders',
  'admin.kpi.revenue': 'Revenue',
  'admin.kpi.orders': 'Orders',
  'admin.kpi.ordersSub': 'since launch',
  'admin.kpi.avg': 'Average basket',
  'admin.kpi.avgSub': 'revenue ÷ orders',
  'admin.kpi.items': 'Items sold',
  'admin.kpi.itemsSub': 'across all orders',
  'admin.kpi.growth': 'vs previous 7 days',
  'admin.chart.daily': 'Sales trend — last 30 days',
  'admin.chart.top': 'Top products',
  'admin.chart.topUnits': '{{n}} sold',
  'admin.chart.format': 'Split by size',
  'admin.chart.status': 'Order statuses',
  'admin.demo.seed': 'Simulate 25 orders',
  'admin.demo.seeding': 'Generating…',
  'admin.demo.seeded': '✓ {{n}} demo orders created',
  'admin.demo.clear': 'Clear all',
  'admin.demo.clearConfirm': 'Confirm deletion',
  'admin.demo.cleared': '✓ Orders cleared',
  'admin.empty.dash': 'No sales to show yet',
  'admin.empty.dashSub': 'Place an order — or simulate a few — and watch the dashboard come alive.',
  'admin.countOne': '1 order',
  'admin.countOther': '{{n}} orders',
  'admin.th.no': 'No.',
  'admin.th.date': 'Date',
  'admin.th.client': 'Customer',
  'admin.th.items': 'Items',
  'admin.th.total': 'Total',
  'admin.th.status': 'Status',
  'admin.empty': 'No orders yet. Place one in the shop and it will appear here.',
  'admin.updated': 'Status updated ✓',
  'admin.error': 'Update failed, please try again.',
  'admin.loading': 'Loading orders…',

  /* ---- Legal ---- */
  'legal.cgv.title': 'General terms and conditions of sale',
  'legal.ship.title': 'Shipping & returns',
  'legal.updated': 'Last updated: January 2026.',
  'legal.cgv.1.t': '1. Purpose & demo',
  'legal.cgv.1.b':
    'These terms govern orders placed in the Tsara Café online shop. This site is a technical demo: orders are stored fictionally (in a local file) and no real sales contract is entered into. No account is ever charged.',
  'legal.cgv.2.t': '2. Prices',
  'legal.cgv.2.b':
    'Prices are displayed in euros, all taxes included. Shipping fees (€6.90) are free as of €60 of purchase. Promo codes, such as BIENVENUE10 (−10%), can be applied to the subtotal.',
  'legal.cgv.3.t': '3. Payment',
  'legal.cgv.3.b':
    'Payment is fully simulated: use test card 4242 4242 4242 4242 (future expiry, CVC 123) to complete an order, or 4000 0000 0000 0002 to test a decline. No card data is stored.',
  'legal.cgv.4.t': '4. Delivery',
  'legal.cgv.4.b':
    'Orders are prepared within 48 business hours and delivered in 2 to 4 business days across metropolitan France, Belgium, Switzerland and Luxembourg. Tracking is available on the “Track order” page.',
  'legal.cgv.5.t': '5. Returns',
  'legal.cgv.5.b':
    'As provided by law, you have 14 days to change your mind, provided the coffee is unopened. In demo mode, no actual refund is processed.',
  'legal.cgv.6.t': '6. Contact',
  'legal.cgv.6.b': 'Tsara Café (fictional company) — 12 Tsingy Alley, 101 Antananarivo, Madagascar — contact@tsara-cafe.demo.',
  'legal.ship.1.t': 'Zones and lead times',
  'legal.ship.1.b':
    'We ship to metropolitan France, Belgium, Switzerland, Luxembourg and Madagascar. Indicative lead times: 2–4 business days for Europe, 6–10 days for Madagascar.',
  'legal.ship.2.t': 'Shipping fees',
  'legal.ship.2.b':
    'A flat €6.90 per order, whatever the quantity — free as of €60 of purchase (after any promo code is applied).',
  'legal.ship.3.t': 'Preparation and packaging',
  'legal.ship.3.b':
    'Every order leaves within 48 h in resealable one-way-valve bags, cushioned in recyclable packaging. The roast date is printed on the back of each bag.',
  'legal.ship.4.t': 'Order tracking',
  'legal.ship.4.b':
    'After checkout, your order appears on the “Track order” page with its number and your email. Possible statuses: Paid, In preparation, Shipped.',
  'legal.ship.5.t': 'Returns & support',
  'legal.ship.5.b':
    'You have 14 days to change your mind: the coffee must be unopened and return shipping is at your expense. Damaged or incorrect bag? A replacement ships within 7 days, on us.',

  /* ---- 404 ---- */
  'nf.title': 'Page not found',
  'nf.sub': 'This link doesn’t exist — but the shop itself is still here.',
  'nf.cta': 'Back to the shop',
  'nf.home': 'Back home',
};

const DICTS: Record<Locale, Record<string, string>> = { fr: FR, en: EN };

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('fr');

  useEffect(() => {
    const saved = window.localStorage.getItem('tsara-locale');
    if (saved === 'en' || saved === 'fr') setLocaleState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem('tsara-locale', locale);
  }, [locale]);

  const setLocale = useCallback((l: Locale) => setLocaleState(l), []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      let s = DICTS[locale][key] ?? DICTS.fr[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          s = s.replaceAll(`{{${k}}}`, String(v));
        }
      }
      return s;
    },
    [locale],
  );

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n doit être utilisé à l’intérieur de <I18nProvider>');
  return ctx;
}
