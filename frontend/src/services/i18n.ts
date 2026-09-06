import { useState, useEffect } from 'react';
import { Category, Product, Promotion } from '../types';

export type Language = 'fr' | 'en' | 'wo';

export interface Translations {
  // Navigation & Globale
  navHome: string;
  navMenu: string;
  navAbout: string;
  navPromotions: string;
  navContact: string;
  navCart: string;
  navAdmin: string;
  searchAction: string;
  orderNowBtn: string;
  viewDishBtn: string;
  dishPreparedCarefully: string;
  freshProducts: string;
  fastService: string;
  dineIn: string;
  dineInShort: string;
  delivery: string;
  takeaway: string;
  tableLabel: string;
  tableChangePrompt: string;
  tableEnterPrompt: string;
  changeBtn: string;
  closeBtn: string;
  backBtn: string;
  orderBtn: string;
  totalLabel: string;
  subtotalLabel: string;
  serviceFeeLabel: string;
  deliveryFeeLabel: string;
  includedLabel: string;
  freeLabel: string;
  priceLabel: string;
  allCategories: string;
  resetFilter: string;

  // Hero & Page d'accueil
  tagline: string;
  heroHeadline1: string;
  heroHeadline2: string;
  heroDesc: string;
  viewMenu: string;
  discoverDishes: string;
  hygienic: string;
  fast: string;
  convenient: string;
  stepsTitle: string;
  stepsSubtitle: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  chefSelectionTitle: string;
  featuredDishes: string;
  viewAllMenu: string;
  fidelityTitle: string;
  fidelityDesc: string;
  fidelityCta: string;
  fidelityProgram: string;
  fidelityRemaining: string;
  reviewsTitle: string;
  reviewsHeading: string;
  reviewsCount: string;

  // Bannières & Marquee
  welcomeTableTitle: string;
  welcomeTableDesc: string;
  promoDiscountTag: string;
  marqueePromo1: string;
  marqueePromo2: string;
  marqueePromo3: string;
  marqueePromo4: string;
  marqueePromo5: string;
  marqueePromo6: string;

  // Menu Page & Cartes
  menuPageTitle: string;
  menuPageSubtitle: string;
  searchPlaceholder: string;
  dishesCountSingular: string;
  dishesCountPlural: string;
  noDishFoundTitle: string;
  noDishFoundDesc: string;
  viewAllDishesBtn: string;
  outOfStock: string;
  badgeChef: string;
  badgePopular: string;
  badgeNew: string;
  badgeSpicy: string;
  specialtyPrefix: string;
  sortLabel: string;
  sortDefault: string;
  sortPriceAsc: string;
  sortPriceDesc: string;
  sortPopular: string;
  sortName: string;

  // Modal Produit
  ingredientsLabel: string;
  optionRequired: string;
  optionOptional: string;
  instructionsLabel: string;
  instructionsPlaceholder: string;
  addToCartBtn: string;

  // Panier (Cart Drawer)
  cartTitle: string;
  emptyCartTitle: string;
  emptyCartDesc: string;
  discoverMenuAction: string;
  clearCartBtn: string;
  clearCartConfirm: string;
  proceedToCheckout: string;

  // Checkout (Finalisation)
  checkoutHeaderTitle: string;
  stepCartLabel: string;
  stepInfoLabel: string;
  stepConfirmLabel: string;
  orderTypeTitle: string;
  tableNumberLabel: string;
  tableNumberPlaceholder: string;
  customerNameLabel: string;
  customerNamePlaceholder: string;
  customerPhoneLabel: string;
  customerPhonePlaceholder: string;
  deliveryAddressLabel: string;
  deliveryAddressPlaceholder: string;
  notesLabel: string;
  notesPlaceholder: string;
  orderSummaryTitle: string;
  totalToPayLabel: string;
  confirmWhatsAppBtn: string;
  validationNameRequired: string;
  validationPhoneRequired: string;
  validationPhoneInvalid: string;
  validationTableRequired: string;
  validationAddressRequired: string;
  emptyCartCheckoutNotice: string;
  backToMenuBtn: string;

  // Confirmation & Suivi de commande
  orderConfirmedTitle: string;
  orderConfirmedSubtitle: string;
  orderNumberLabel: string;
  statusLabel: string;
  statusStep1: string;
  statusStep2: string;
  statusStep3: string;
  statusStep4: string;
  statusStep5: string;
  statusCancelled: string;
  timelineStep1Title: string;
  timelineStep1Desc: string;
  timelineStep2Title: string;
  timelineStep2Desc: string;
  timelineStep3Title: string;
  timelineStep3Desc: string;
  timelineStep4Title: string;
  timelineStep4Desc: string;
  timelineStep5Title: string;
  timelineStep5Desc: string;
  timelineTimeImmediate: string;
  timelineTimePlus1: string;
  timelineTimeInProgress: string;
  timelineTimeSoon: string;
  timelineTimeEnjoy: string;
  rateOrderTitle: string;
  rateOrderDesc: string;
  rateCommentPlaceholder: string;
  rateSubmitBtn: string;
  rateSuccessMsg: string;
  orderNotFoundTitle: string;

  // Additional comprehensive keys for all pages
  customerInfoTitle: string;
  viewCartBtn: string;
  step1Received: string;
  step2Kitchen: string;
  step3Ready: string;
  clientLabel: string;
  serviceTypeLabel: string;
  sendWhatsAppBtn: string;
  trackOrderBtn: string;
  receiptBtn: string;
  trackingTitle: string;
  progressLabel: string;
  readyBannerTitle: string;
  readyBannerDineIn: string;
  readyBannerTakeaway: string;
  servedBannerTitle: string;
  servedBannerDesc: string;
  preparingBannerTitle: string;
  preparingBannerDesc: string;
  cancelledBanner: string;
  orderedItemsTitle: string;
  feedbackSectionTitle: string;
  feedbackSectionSubtitle: string;
  feedbackSectionTag: string;
  feedbackSuccessTitle: string;
  feedbackSuccessDesc: string;
  orderSomethingElseBtn: string;
  whatsAppMsgBtn: string;
  whatsAppOrderNotice: string;
  receiptOfficialTitle: string;
  receiptOrderNo: string;
  receiptDateTime: string;
  receiptType: string;
  receiptItemsCol: string;
  receiptTotalPaid: string;
  receiptScanDesc: string;
  receiptThanks: string;
  receiptPoweredBy: string;
  printReceiptBtn: string;
  shareReceiptBtn: string;
  receiptShareText: string;
  liveKitchenBadge: string;
  demoPillTitle: string;
  demoModalTag: string;
  demoModalTitle: string;
  demoModalDesc: string;
  demoStep1Title: string;
  demoStep1Desc: string;
  demoStep2Title: string;
  demoStep2Desc: string;
  demoStep3Title: string;
  demoStep3Desc: string;
  demoStep4Title: string;
  demoStep4Desc: string;
  managerDemoTitle: string;
  managerDemoDesc: string;
  managerDemoBtn: string;
  footerRights: string;
  footerGoratech: string;
  footerSub: string;
  review1Text: string;
  review1Meta: string;
  review2Text: string;
  review2Meta: string;
  review3Text: string;
  review3Meta: string;
  fidelityOrdersCount: string;

  // Page À Propos
  aboutTagline: string;
  aboutHeadline1: string;
  aboutHeadline2: string;
  aboutDesc: string;
  aboutKitchenQuote: string;
  aboutValuesTitle: string;
  aboutValuesSubtitle: string;
  aboutPillar1Title: string;
  aboutPillar1Desc: string;
  aboutPillar2Title: string;
  aboutPillar2Desc: string;
  aboutPillar3Title: string;
  aboutPillar3Desc: string;
  aboutFindUsTag: string;
  aboutFindUsTitle: string;
  aboutAddressLabel: string;
  aboutHoursLabel: string;
  aboutHoursSub: string;
  aboutBookingsLabel: string;
  aboutSmartTablesNotice: string;
  aboutDiscoverMenuBtn: string;

  // Page Promotions
  promotionsTag: string;
  promotionsTitle: string;
  promotionsSubtitle: string;
  promo1Badge: string;
  promo1Time: string;
  promo1Dates: string;
  promo1Active: string;
  promo1Title: string;
  promo1Desc: string;
  promo1Cta: string;
  promo1Added: string;

  promo2Badge: string;
  promo2Time: string;
  promo2Dates: string;
  promo2Active: string;
  promo2Title: string;
  promo2Desc: string;
  promo2Cta: string;

  promo3Badge: string;
  promo3Dates: string;
  promo3Active: string;
  promo3Title: string;
  promo3Desc: string;
  promo3Value: string;
  promo3Cta: string;

  promo4Badge: string;
  promo4Time: string;
  promo4Dates: string;
  promo4Active: string;
  promo4Title: string;
  promo4Desc: string;
  promo4Value: string;
  promo4Cta: string;

  loyaltyProgramTag: string;
  loyaltyProgramTitle: string;
  loyaltyProgramDesc: string;
  loyaltyValidatedLabel: string;
  loyaltyProgressText: string;
  loyaltyRewardLabel: string;

  // Admin Header
  adminOpenMenu: string;
  adminRoleDirector: string;
  adminSeeKitchen: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  fr: {
    // Navigation & Globale
    navHome: 'Accueil',
    navMenu: 'Menu',
    navAbout: 'À propos',
    navPromotions: 'Promotions',
    navContact: 'Contact',
    navCart: 'Panier',
    navAdmin: 'Admin',
    searchAction: 'Rechercher',
    orderNowBtn: 'Commander maintenant',
    viewDishBtn: 'Voir le plat',
    dishPreparedCarefully: 'Plats préparés avec soin',
    freshProducts: 'Produits frais',
    fastService: 'Service rapide',
    dineIn: 'Sur place',
    dineInShort: 'Sur place ?',
    delivery: 'Livraison',
    takeaway: 'À emporter',
    tableLabel: 'Table',
    tableChangePrompt: 'Modifier le numéro de votre table :',
    tableEnterPrompt: 'Entrez votre numéro de table (laisser vide si à emporter/livraison) :',
    changeBtn: 'Changer',
    closeBtn: 'Fermer',
    backBtn: 'Retour',
    orderBtn: 'Commander',
    totalLabel: 'Total',
    subtotalLabel: 'Sous-total',
    serviceFeeLabel: 'Frais de service',
    deliveryFeeLabel: 'Frais de livraison',
    includedLabel: 'Inclus',
    freeLabel: 'Gratuit',
    priceLabel: 'Prix',
    allCategories: 'Tous',
    resetFilter: 'Réinitialiser le filtre',

    // Hero & Page d'accueil
    tagline: 'Menu Digital & Commande Directe',
    heroHeadline1: 'Le goût du Sénégal,',
    heroHeadline2: 'réinventé.',
    heroDesc: 'Découvrez nos plats, commandez directement depuis votre table et profitez d\'une expérience digitale simple et élégante.',
    viewMenu: 'Découvrir le menu',
    discoverDishes: 'Commander maintenant',
    hygienic: '✨ Hygiénique',
    fast: '⚡ Rapide',
    convenient: '📱 Pratique',
    stepsTitle: 'Fonctionnement Ultra-Simple',
    stepsSubtitle: 'En 3 étapes faciles depuis votre smartphone',
    step1Title: '1. Scannez le QR Code',
    step1Desc: 'Directement depuis votre table sans attendre le serveur ni télécharger d’application.',
    step2Title: '2. Choisissez vos Délices',
    step2Desc: 'Explorez nos spécialités sénégalaises, personnalisez vos accompagnements et vos sauces.',
    step3Title: '3. Commandez & Régalez-vous',
    step3Desc: 'Votre commande est transmise instantanément en cuisine et confirmée par WhatsApp.',
    chefSelectionTitle: 'SÉLECTION DU CHEF',
    featuredDishes: 'Nos incontournables',
    viewAllMenu: 'Voir toute la carte',
    fidelityTitle: 'TERANGA FIDÉLITÉ',
    fidelityDesc: 'Cumulez des points à chaque commande et débloquez des réductions exclusives et des boissons offertes.',
    fidelityCta: 'Rejoindre le Club',
    fidelityProgram: 'PROGRAMME CLIENT',
    fidelityRemaining: 'Encore 2 commandes avant votre prochaine récompense.',
    reviewsTitle: 'AVIS VÉRIFIÉS',
    reviewsHeading: 'CE QUE DISENT NOS CLIENTS',
    reviewsCount: '142 avis',

    // Bannières & Marquee
    welcomeTableTitle: 'Bienvenue à la table',
    welcomeTableDesc: 'Consultez notre menu et commandez directement depuis votre table.',
    promoDiscountTag: 'RÉDUCTION',
    marqueePromo1: 'OFFRE DU JOUR — -20% SUR LES BURGERS',
    marqueePromo2: 'COMMANDEZ DIRECTEMENT DEPUIS VOTRE TABLE',
    marqueePromo3: 'DÉCOUVREZ NOS PLATS SIGNATURE',
    marqueePromo4: 'JUS FRAIS DISPONIBLES',
    marqueePromo5: 'EXPÉRIENCE DIGITALE — SCANNÉ • COMMANDÉ • SERVI',
    marqueePromo6: 'TERANGA FOOD — LE GOÛT DU SÉNÉGAL',

    // Menu Page & Cartes
    menuPageTitle: 'NOTRE MENU',
    menuPageSubtitle: 'Découvrez nos spécialités préparées avec passion et authenticité.',
    searchPlaceholder: 'Rechercher un plat, ingrédient (ex: Thiéb, Poulet, Alloco)...',
    dishesCountSingular: 'plat disponible',
    dishesCountPlural: 'plats disponibles',
    noDishFoundTitle: 'Aucun plat trouvé',
    noDishFoundDesc: 'Essayez un autre mot-clé ou sélectionnez une catégorie différente pour découvrir nos saveurs.',
    viewAllDishesBtn: 'Voir toute la carte',
    outOfStock: 'Indisponible',
    badgeChef: 'Chef',
    badgePopular: 'Populaire',
    badgeNew: 'Nouveau',
    badgeSpicy: 'Épicé',
    specialtyPrefix: 'Spécialité',
    sortLabel: 'Trier par :',
    sortDefault: 'Sélection du chef',
    sortPriceAsc: 'Prix croissant (↗)',
    sortPriceDesc: 'Prix décroissant (↘)',
    sortPopular: 'Plats populaires',
    sortName: 'Ordre alphabétique (A-Z)',

    // Modal Produit
    ingredientsLabel: 'Ingrédients',
    optionRequired: '(Obligatoire)',
    optionOptional: '(Optionnel)',
    instructionsLabel: 'Instructions particulières (optionnel)',
    instructionsPlaceholder: 'Ex: Sans oignons, sauce bien à part...',
    addToCartBtn: 'Ajouter au panier',

    // Panier (Cart Drawer)
    cartTitle: 'VOTRE PANIER',
    emptyCartTitle: 'Votre panier est vide',
    emptyCartDesc: 'Découvrez notre carte gastronomique et ajoutez vos plats préférés.',
    discoverMenuAction: 'Découvrir le menu',
    clearCartBtn: 'Vider',
    clearCartConfirm: 'Voulez-vous vraiment vider votre panier ?',
    proceedToCheckout: 'COMMANDER',

    // Checkout (Finalisation)
    checkoutHeaderTitle: 'Finaliser la commande',
    stepCartLabel: 'Panier',
    stepInfoLabel: 'Informations',
    stepConfirmLabel: 'Confirmation',
    orderTypeTitle: 'TYPE DE COMMANDE',
    tableNumberLabel: 'Numéro de table',
    tableNumberPlaceholder: 'Ex: 08',
    customerNameLabel: 'Nom complet',
    customerNamePlaceholder: 'Ex: Awa Ndiaye',
    customerPhoneLabel: 'Numéro WhatsApp (pour le suivi)',
    customerPhonePlaceholder: 'Ex: 77 123 45 67',
    deliveryAddressLabel: 'Adresse complète de livraison',
    deliveryAddressPlaceholder: 'Ex: Dakar-Plateau, Rue Victor Schoelcher...',
    notesLabel: 'Instructions pour la cuisine (optionnel)',
    notesPlaceholder: 'Ex: Piment à part, bien cuit...',
    orderSummaryTitle: 'RÉCAPITULATIF DE LA COMMANDE',
    totalToPayLabel: 'Total à payer',
    confirmWhatsAppBtn: 'Confirmer et envoyer sur WhatsApp',
    validationNameRequired: 'Veuillez renseigner votre nom complet',
    validationPhoneRequired: 'Le numéro de téléphone est requis',
    validationPhoneInvalid: 'Numéro de téléphone invalide (ex: 77 123 45 67)',
    validationTableRequired: 'Veuillez indiquer le numéro de votre table',
    validationAddressRequired: 'Veuillez renseigner votre adresse de livraison complète',
    emptyCartCheckoutNotice: 'Ajoutez au moins un plat à votre panier pour passer votre commande.',
    backToMenuBtn: 'Retourner au menu',

    // Confirmation & Suivi de commande
    orderConfirmedTitle: 'COMMANDE CONFIRMÉE',
    orderConfirmedSubtitle: 'Votre commande a bien été envoyée à l’équipe de',
    orderNumberLabel: 'Commande',
    statusLabel: 'Statut :',
    statusStep1: 'Reçue par le restaurant',
    statusStep2: 'Confirmée par l’équipe',
    statusStep3: 'En cours de préparation en cuisine',
    statusStep4: 'Prête !',
    statusStep5: 'Servie / Livrée',
    statusCancelled: 'Annulée',
    timelineStep1Title: 'Commande reçue',
    timelineStep1Desc: 'Transmise instantanément à notre serveur',
    timelineStep2Title: 'Commande acceptée',
    timelineStep2Desc: 'Validée par l’équipe de salle',
    timelineStep3Title: 'En préparation',
    timelineStep3Desc: 'Le chef cuisine vos spécialités au feu de bois',
    timelineStep4Title: 'Commande prête',
    timelineStep4Desc: 'Dressée et prête à être servie',
    timelineStep5Title: 'Servie & Dégustée',
    timelineStep5Desc: 'Bon appétit et merci de votre confiance',
    timelineTimeImmediate: 'Immédiat',
    timelineTimePlus1: '+1 min',
    timelineTimeInProgress: 'En cours',
    timelineTimeSoon: 'Bientôt',
    timelineTimeEnjoy: 'Bon appétit',
    rateOrderTitle: 'Votre avis compte pour nous',
    rateOrderDesc: 'Partagez votre retour d’expérience en quelques secondes :',
    rateCommentPlaceholder: 'Vos impressions sur le goût, la rapidité et le service...',
    rateSubmitBtn: 'Envoyer mon avis',
    rateSuccessMsg: 'Merci pour votre précieux retour !',
    orderNotFoundTitle: 'Commande introuvable',

    // Additional comprehensive keys for all pages
    customerInfoTitle: 'Vos Coordonnées',
    viewCartBtn: 'Voir mon panier',
    step1Received: '1. Reçue',
    step2Kitchen: '2. En cuisine',
    step3Ready: '3. Prête',
    clientLabel: 'Client',
    serviceTypeLabel: 'Type de service',
    sendWhatsAppBtn: 'ENVOYER LA COMMANDE SUR WHATSAPP',
    trackOrderBtn: 'SUIVRE MA COMMANDE',
    receiptBtn: 'Ticket de caisse',
    trackingTitle: 'Suivi de votre Commande',
    progressLabel: 'Progression',
    readyBannerTitle: 'VOTRE COMMANDE EST PRÊTE ✓',
    readyBannerDineIn: 'Le serveur arrive à votre table {table}.',
    readyBannerTakeaway: 'Vous pouvez vous présenter au comptoir pour la retirer.',
    servedBannerTitle: 'COMMANDE SERVIE — BON APPÉTIT !',
    servedBannerDesc: 'Merci de votre visite chez {name}.',
    preparingBannerTitle: 'Préparation en cours en cuisine',
    preparingBannerDesc: 'Mise à jour en temps réel sur cet écran.',
    cancelledBanner: 'Cette commande a été annulée. Contactez le personnel pour toute question.',
    orderedItemsTitle: 'Articles commandés',
    feedbackSectionTitle: "COMMENT S'EST PASSÉE VOTRE EXPÉRIENCE ?",
    feedbackSectionSubtitle: 'Donnez votre note pour nous aider à améliorer notre cuisine et notre service.',
    feedbackSectionTag: 'Votre avis compte',
    feedbackSuccessTitle: '🎉 Merci infiniment pour votre avis !',
    feedbackSuccessDesc: 'Votre retour a été transmis directement au chef et à la direction.',
    orderSomethingElseBtn: 'Commander autre chose',
    whatsAppMsgBtn: 'Message WhatsApp',
    whatsAppOrderNotice: 'En cliquant, WhatsApp s’ouvrira avec votre commande pré-remplie vers le restaurant {name}.',
    receiptOfficialTitle: 'Reçu Officiel',
    receiptOrderNo: 'Commande N°',
    receiptDateTime: 'Date & Heure',
    receiptType: 'Type',
    receiptItemsCol: 'Plat / Options',
    receiptTotalPaid: 'Total Réglé',
    receiptScanDesc: 'Scannez ce QR Code pour retrouver ce ticket digital en ligne',
    receiptThanks: 'Merci pour votre visite chez {name} !',
    receiptPoweredBy: 'Solution propulsée par GORATECH',
    printReceiptBtn: 'Imprimer le reçu',
    shareReceiptBtn: 'Partager WhatsApp',
    receiptShareText: 'Voici mon reçu digital pour la commande #{id} chez {name} ({total}) : {url}',
    liveKitchenBadge: 'Cuisine en direct',
    demoPillTitle: 'Démo Commerciale 60s',
    demoModalTag: 'Présentation Restaurateur • GORATECH',
    demoModalTitle: 'Parcours Démonstration en 60 Secondes',
    demoModalDesc: "Découvrez la boucle complète : du scan client jusqu'à l'écran cuisine et au tableau de bord.",
    demoStep1Title: '1. Scan Client à la Table 12',
    demoStep1Desc: 'Menu sans contact avec bannière de table intelligente',
    demoStep2Title: '2. Écran Cuisine KDS en direct',
    demoStep2Desc: 'Visualisation des commandes avec chronomètre et bip sonore',
    demoStep3Title: '3. Dashboard Restaurateur & Insights',
    demoStep3Desc: "Chiffre d'affaires en FCFA, panier moyen et heures de pointe",
    demoStep4Title: '4. Chevalets de Table Imprimables',
    demoStep4Desc: 'Studio de génération QR codes pour les 20 tables du restaurant',
    managerDemoTitle: 'Vous êtes gérant ou restaurateur ?',
    managerDemoDesc: "Découvrez l'espace administration, le Kitchen Display System (KDS) et la gestion des tables en direct.",
    managerDemoBtn: 'Démo Espace Restaurateur',
    footerRights: 'Tous droits réservés.',
    footerGoratech: 'Une solution digitale conçue par GORATECH',
    footerSub: 'Solutions numériques pour les entreprises.',
    review1Text: '« Excellent service et très bon repas. La commande WhatsApp depuis la table est un pur bonheur. »',
    review1Meta: 'Table 04 • Hier',
    review2Text: '« Le Thiéboudienne est exceptionnel, les portions sont généreuses et le paiement par QR Code est rapide. »',
    review2Meta: 'À emporter • Il y a 2 jours',
    review3Text: '« Une interface super propre et claire. On sait exactement ce qu\'on commande. Je recommande vivement ! »',
    review3Meta: 'Table 12 • Il y a 3 jours',
    fidelityOrdersCount: '8 / 10 commandes',

    // Page À Propos
    aboutTagline: 'NOTRE HISTOIRE & PHILOSOPHIE',
    aboutHeadline1: 'Une cuisine authentique.',
    aboutHeadline2: 'Une expérience moderne.',
    aboutDesc: 'Chez TERANGA FOOD, nous réinventons la gastronomie sénégalaise au cœur de Dakar en conjuguant le respect absolu des recettes ancestrales avec le confort d’une expérience digitale fluide, rapide et raffinée.',
    aboutKitchenQuote: 'Marmites traditionnelles en fonte, braises de filao et sélection rigoureuse d’ingrédients du terroir sénégalais.',
    aboutValuesTitle: 'NOS VALEURS FONDATRICES',
    aboutValuesSubtitle: 'Ce qui rend notre table unique',
    aboutPillar1Title: '100% Terroir Sénégalais',
    aboutPillar1Desc: 'Pêche artisanale fraîche du jour (mérou, thiof, dorade), pâte d’arachide pure de Kaolack, et légumes frais récoltés chaque matin sur les marchés dakarois.',
    aboutPillar2Title: 'La Teranga au Cœur',
    aboutPillar2Desc: 'L’hospitalité légendaire du Sénégal transmise à travers un accueil chaleureux, des portions généreuses et un soin méticuleux apporté à chaque convive.',
    aboutPillar3Title: 'Technologie Sans Friction',
    aboutPillar3Desc: 'Scannez le QR Code de votre table, personnalisez vos sauces et accompagnements en quelques secondes, et suivez la préparation en direct sans aucune attente.',
    aboutFindUsTag: 'NOUS TROUVER',
    aboutFindUsTitle: 'Venez vivre l’expérience à Dakar',
    aboutAddressLabel: 'Adresse',
    aboutHoursLabel: 'Horaires de service',
    aboutHoursSub: 'Service continu & livraison',
    aboutBookingsLabel: 'Réservations & WhatsApp',
    aboutSmartTablesNotice: 'Table 01 à 20 équipées de QR Code intelligent.',
    aboutDiscoverMenuBtn: 'Découvrir notre carte',

    // Page Promotions
    promotionsTag: 'PRIVILÈGES & BONS PLANS',
    promotionsTitle: 'Nos Offres & Promotions',
    promotionsSubtitle: 'Profitez de réductions exclusives appliquées instantanément sur vos commandes à table, à emporter ou en livraison.',
    promo1Badge: '-20% IMMÉDIAT',
    promo1Time: '18h00 → 22h00',
    promo1Dates: 'Du 05/09 au 12/09',
    promo1Active: 'ACTIVE',
    promo1Title: 'Burger Teranga Gourmand',
    promo1Desc: 'Pain brioché artisanal doré, steak haché façonné minute 160g, confit d’oignons façon Yassa au citron vert et cheddar affiné fondant. Frites incluses.',
    promo1Cta: 'Commander à -20%',
    promo1Added: 'Ajouté au panier',

    promo2Badge: 'FORMULE MIDI COMPLÈTE',
    promo2Time: '12h00 → 15h00',
    promo2Dates: 'Tous les jours',
    promo2Active: 'ACTIVE',
    promo2Title: 'Menu Thiéboudienne Prestige',
    promo2Desc: 'Thiéboudienne traditionnel au mérou blanc + 4 pastels croustillants au poisson avec sauce nététou + 1 grand verre de Bissap Royal ou Bouye maison.',
    promo2Cta: 'Commander ce menu',

    promo3Badge: 'OFFRE DÉJEUNER',
    promo3Dates: 'Midi en restaurant',
    promo3Active: 'AUTOMATIQUE',
    promo3Title: 'Jus Artisanal Offert',
    promo3Desc: 'Pour tout plat signature sénégalais commandé depuis votre table entre 12h00 et 14h30, recevez gracieusement un verre de Bissap ou de Gingembre pressé à froid.',
    promo3Value: '1 000 FCFA Offert',
    promo3Cta: 'Voir les plats signature',

    promo4Badge: 'HAPPY HOUR',
    promo4Time: '18h00 — 20h00',
    promo4Dates: 'Chaque fin d’après-midi',
    promo4Active: 'SUR PLACE',
    promo4Title: 'Happy Hour Apéritif & Alloco',
    promo4Desc: 'Dégustez notre Alloco croustillant offert pour toute commande de 2 mocktails ou boissons fraîches à table entre 18h et 20h. Idéal pour décompresser en fin de journée.',
    promo4Value: 'Alloco Offert',
    promo4Cta: 'Réserver / Commander',

    loyaltyProgramTag: 'PROGRAMME TERANGA+',
    loyaltyProgramTitle: 'Votre fidélité récompensée à chaque commande',
    loyaltyProgramDesc: 'Cumulez 10 commandes au restaurant et débloquez une boisson artisanale ou un dessert offert.',
    loyaltyValidatedLabel: 'Commandes validées',
    loyaltyProgressText: 'Encore 2 commandes avant votre récompense 🎁',
    loyaltyRewardLabel: 'Récompense : Un jus offert',

    // Admin Header
    adminOpenMenu: 'Ouvrir le menu',
    adminRoleDirector: 'Directeur',
    adminSeeKitchen: 'Voir en cuisine',
  },

  en: {
    // Navigation & Globale
    navHome: 'Home',
    navMenu: 'Menu',
    navAbout: 'About',
    navPromotions: 'Promotions',
    navContact: 'Contact',
    navCart: 'Cart',
    navAdmin: 'Admin',
    searchAction: 'Search',
    orderNowBtn: 'Order now',
    viewDishBtn: 'View dish',
    dishPreparedCarefully: 'Carefully prepared dishes',
    freshProducts: 'Fresh ingredients',
    fastService: 'Fast service',
    dineIn: 'Dine-in',
    dineInShort: 'Dine-in ?',
    delivery: 'Delivery',
    takeaway: 'Takeaway',
    tableLabel: 'Table',
    tableChangePrompt: 'Update your table number:',
    tableEnterPrompt: 'Enter your table number (leave blank for takeaway/delivery):',
    changeBtn: 'Change',
    closeBtn: 'Close',
    backBtn: 'Back',
    orderBtn: 'Order',
    totalLabel: 'Total',
    subtotalLabel: 'Subtotal',
    serviceFeeLabel: 'Service fee',
    deliveryFeeLabel: 'Delivery fee',
    includedLabel: 'Included',
    freeLabel: 'Free',
    priceLabel: 'Price',
    allCategories: 'All',
    resetFilter: 'Reset filter',

    // Hero & Page d'accueil
    tagline: 'Digital Menu & Direct Ordering',
    heroHeadline1: 'The taste of Senegal,',
    heroHeadline2: 'reinvented.',
    heroDesc: 'Discover our dishes, order directly from your table and enjoy a simple and elegant digital experience.',
    viewMenu: 'Discover the menu',
    discoverDishes: 'Order now',
    hygienic: '✨ Hygienic',
    fast: '⚡ Fast',
    convenient: '📱 Convenient',
    stepsTitle: 'Ultra-Simple Experience',
    stepsSubtitle: 'In 3 easy steps from your smartphone',
    step1Title: '1. Scan the QR Code',
    step1Desc: 'Directly from your table without waiting for a waiter or installing any app.',
    step2Title: '2. Choose Your Favorites',
    step2Desc: 'Explore authentic Senegalese delicacies, customize your sides, toppings and sauces.',
    step3Title: '3. Order & Enjoy',
    step3Desc: 'Your order is instantly dispatched to the kitchen and confirmed via WhatsApp.',
    chefSelectionTitle: "CHEF'S SELECTION",
    featuredDishes: 'Our essentials',
    viewAllMenu: 'View full menu',
    fidelityTitle: 'TERANGA REWARDS',
    fidelityDesc: 'Earn loyalty points with every order and unlock exclusive discounts and complimentary drinks.',
    fidelityCta: 'Join the Club',
    fidelityProgram: 'REWARDS CLUB',
    fidelityRemaining: 'Only 2 more orders before your next reward.',
    reviewsTitle: 'VERIFIED REVIEWS',
    reviewsHeading: 'WHAT OUR GUESTS SAY',
    reviewsCount: '142 reviews',

    // Bannières & Marquee
    welcomeTableTitle: 'Welcome to Table',
    welcomeTableDesc: 'Browse our menu and order directly from your table.',
    promoDiscountTag: 'DISCOUNT',
    marqueePromo1: "TODAY'S OFFER — -20% ON BURGERS",
    marqueePromo2: 'ORDER DIRECTLY FROM YOUR TABLE',
    marqueePromo3: 'DISCOVER OUR SIGNATURE DISHES',
    marqueePromo4: 'FRESH JUICES AVAILABLE',
    marqueePromo5: 'DIGITAL ORDERING — SCANNED • PREPARED • SERVED',
    marqueePromo6: 'TERANGA FOOD — TASTE OF SENEGAL',

    // Menu Page & Cartes
    menuPageTitle: 'OUR MENU',
    menuPageSubtitle: 'Explore our delicacies crafted with passion and authenticity.',
    searchPlaceholder: 'Search a dish, ingredient (e.g. Thieb, Chicken, Alloco)...',
    dishesCountSingular: 'dish available',
    dishesCountPlural: 'dishes available',
    noDishFoundTitle: 'No dishes found',
    noDishFoundDesc: 'Try another keyword or select a different category to explore our flavors.',
    viewAllDishesBtn: 'View full menu',
    outOfStock: 'Sold out',
    badgeChef: 'Chef',
    badgePopular: 'Popular',
    badgeNew: 'New',
    badgeSpicy: 'Spicy',
    specialtyPrefix: 'Specialty',
    sortLabel: 'Sort by:',
    sortDefault: "Chef's selection",
    sortPriceAsc: 'Price: Low to High (↗)',
    sortPriceDesc: 'Price: High to Low (↘)',
    sortPopular: 'Most Popular',
    sortName: 'Alphabetical (A-Z)',

    // Modal Produit
    ingredientsLabel: 'Ingredients',
    optionRequired: '(Required)',
    optionOptional: '(Optional)',
    instructionsLabel: 'Special instructions (optional)',
    instructionsPlaceholder: 'E.g., No onions, sauce on the side...',
    addToCartBtn: 'Add to cart',

    // Panier (Cart Drawer)
    cartTitle: 'YOUR CART',
    emptyCartTitle: 'Your cart is empty',
    emptyCartDesc: 'Explore our culinary selection and add your favorite dishes.',
    discoverMenuAction: 'Explore menu',
    clearCartBtn: 'Clear',
    clearCartConfirm: 'Are you sure you want to empty your cart?',
    proceedToCheckout: 'PROCEED TO CHECKOUT',

    // Checkout (Finalisation)
    checkoutHeaderTitle: 'Complete Order',
    stepCartLabel: 'Cart',
    stepInfoLabel: 'Details',
    stepConfirmLabel: 'Confirmation',
    orderTypeTitle: 'ORDER TYPE',
    tableNumberLabel: 'Table Number',
    tableNumberPlaceholder: 'E.g. 08',
    customerNameLabel: 'Full Name',
    customerNamePlaceholder: 'E.g. Awa Ndiaye',
    customerPhoneLabel: 'WhatsApp Phone (for tracking)',
    customerPhonePlaceholder: 'E.g. 77 123 45 67',
    deliveryAddressLabel: 'Full Delivery Address',
    deliveryAddressPlaceholder: 'E.g. Dakar-Plateau, Rue Victor Schoelcher...',
    notesLabel: 'Kitchen Notes (optional)',
    notesPlaceholder: 'E.g. Mild spice, well cooked...',
    orderSummaryTitle: 'ORDER SUMMARY',
    totalToPayLabel: 'Total to pay',
    confirmWhatsAppBtn: 'Confirm & Send to WhatsApp',
    validationNameRequired: 'Please enter your full name',
    validationPhoneRequired: 'Phone number is required',
    validationPhoneInvalid: 'Invalid phone number (e.g. 77 123 45 67)',
    validationTableRequired: 'Please specify your table number',
    validationAddressRequired: 'Please provide your full delivery address',
    emptyCartCheckoutNotice: 'Add at least one dish to your cart to proceed with checkout.',
    backToMenuBtn: 'Back to menu',

    // Confirmation & Suivi de commande
    orderConfirmedTitle: 'ORDER CONFIRMED',
    orderConfirmedSubtitle: 'Your order has been forwarded to the team at',
    orderNumberLabel: 'Order',
    statusLabel: 'Status:',
    statusStep1: 'Received by restaurant',
    statusStep2: 'Confirmed by staff',
    statusStep3: 'Being prepared in kitchen',
    statusStep4: 'Ready!',
    statusStep5: 'Served / Delivered',
    statusCancelled: 'Cancelled',
    timelineStep1Title: 'Order received',
    timelineStep1Desc: 'Instantly dispatched to our kitchen',
    timelineStep2Title: 'Order confirmed',
    timelineStep2Desc: 'Approved by the floor team',
    timelineStep3Title: 'In preparation',
    timelineStep3Desc: 'Chef is grilling your order with wood fire',
    timelineStep4Title: 'Order ready',
    timelineStep4Desc: 'Plated and ready to be served',
    timelineStep5Title: 'Served & Enjoyed',
    timelineStep5Desc: 'Enjoy your meal and thank you for dining with us',
    timelineTimeImmediate: 'Immediate',
    timelineTimePlus1: '+1 min',
    timelineTimeInProgress: 'In progress',
    timelineTimeSoon: 'Soon',
    timelineTimeEnjoy: 'Enjoy your meal',
    rateOrderTitle: 'Your feedback matters',
    rateOrderDesc: 'Share your dining experience in just a few seconds:',
    rateCommentPlaceholder: 'Your thoughts on flavor, speed, and service...',
    rateSubmitBtn: 'Submit review',
    rateSuccessMsg: 'Thank you for your valuable feedback!',
    orderNotFoundTitle: 'Order not found',

    // Additional comprehensive keys for all pages
    customerInfoTitle: 'Your Contact Details',
    viewCartBtn: 'View my cart',
    step1Received: '1. Received',
    step2Kitchen: '2. In kitchen',
    step3Ready: '3. Ready',
    clientLabel: 'Guest',
    serviceTypeLabel: 'Service type',
    sendWhatsAppBtn: 'SEND ORDER VIA WHATSAPP',
    trackOrderBtn: 'TRACK MY ORDER',
    receiptBtn: 'Receipt',
    trackingTitle: 'Order Tracking',
    progressLabel: 'Progress',
    readyBannerTitle: 'YOUR ORDER IS READY ✓',
    readyBannerDineIn: 'The server is bringing it to your table {table}.',
    readyBannerTakeaway: 'You may collect your order at the counter.',
    servedBannerTitle: 'ORDER SERVED — ENJOY YOUR MEAL!',
    servedBannerDesc: 'Thank you for dining with {name}.',
    preparingBannerTitle: 'Preparing your meal in the kitchen',
    preparingBannerDesc: 'Live updates on this screen.',
    cancelledBanner: 'This order was cancelled. Please contact the staff.',
    orderedItemsTitle: 'Ordered items',
    feedbackSectionTitle: 'HOW WAS YOUR EXPERIENCE?',
    feedbackSectionSubtitle: 'Leave a rating to help us enhance our food and service.',
    feedbackSectionTag: 'Your feedback matters',
    feedbackSuccessTitle: '🎉 Thank you so much for your review!',
    feedbackSuccessDesc: 'Your feedback was sent directly to the chef and management.',
    orderSomethingElseBtn: 'Order something else',
    whatsAppMsgBtn: 'WhatsApp Message',
    whatsAppOrderNotice: 'By clicking, WhatsApp will open with your pre-filled order to the restaurant {name}.',
    receiptOfficialTitle: 'Official Receipt',
    receiptOrderNo: 'Order #',
    receiptDateTime: 'Date & Time',
    receiptType: 'Type',
    receiptItemsCol: 'Dish / Options',
    receiptTotalPaid: 'Total Paid',
    receiptScanDesc: 'Scan this QR Code to view this digital receipt online',
    receiptThanks: 'Thank you for dining with {name}!',
    receiptPoweredBy: 'Solution powered by GORATECH',
    printReceiptBtn: 'Print receipt',
    shareReceiptBtn: 'Share on WhatsApp',
    receiptShareText: 'Here is my digital receipt for order #{id} at {name} ({total}) : {url}',
    liveKitchenBadge: 'Live Kitchen',
    demoPillTitle: '60s Commercial Demo',
    demoModalTag: 'Restaurant Owner Showcase • GORATECH',
    demoModalTitle: '60-Second Demo Walkthrough',
    demoModalDesc: 'Discover the full cycle: from customer scan to kitchen display and analytics dashboard.',
    demoStep1Title: '1. Customer Scan at Table 12',
    demoStep1Desc: 'Contactless menu with smart table banner',
    demoStep2Title: '2. Live KDS Kitchen Display',
    demoStep2Desc: 'Order tracking with live timer and acoustic alerts',
    demoStep3Title: '3. Restaurant Dashboard & Insights',
    demoStep3Desc: 'Revenue in FCFA, average ticket and rush hours',
    demoStep4Title: '4. Printable Table Stands',
    demoStep4Desc: 'QR code generation studio for 20 restaurant tables',
    managerDemoTitle: 'Are you a manager or restaurant owner?',
    managerDemoDesc: 'Discover the administration space, Kitchen Display System (KDS) and live table management.',
    managerDemoBtn: 'Restaurant Owner Demo',
    footerRights: 'All rights reserved.',
    footerGoratech: 'A digital solution crafted by GORATECH',
    footerSub: 'Digital solutions for modern businesses.',
    review1Text: '“Excellent service and delicious food. Ordering via WhatsApp right from the table is a pure joy.”',
    review1Meta: 'Table 04 • Yesterday',
    review2Text: '“The Thieboudienne is outstanding, portions are generous and the QR Code ordering is super fast.”',
    review2Meta: 'Takeaway • 2 days ago',
    review3Text: '“A super clean and clear interface. You know exactly what you are ordering. Highly recommended!”',
    review3Meta: 'Table 12 • 3 days ago',
    fidelityOrdersCount: '8 / 10 orders',

    // Page À Propos
    aboutTagline: 'OUR HISTORY & PHILOSOPHY',
    aboutHeadline1: 'Authentic cuisine.',
    aboutHeadline2: 'A modern experience.',
    aboutDesc: 'At TERANGA FOOD, we reinvent Senegalese gastronomy in the heart of Dakar by blending total respect for ancestral recipes with the comfort of a smooth, fast, and refined digital journey.',
    aboutKitchenQuote: 'Traditional cast iron pots, filao wood embers, and rigorously selected local Senegalese ingredients.',
    aboutValuesTitle: 'OUR FOUNDING VALUES',
    aboutValuesSubtitle: 'What makes our dining experience unique',
    aboutPillar1Title: '100% Senegalese Terroir',
    aboutPillar1Desc: 'Daily fresh catch (white grouper, thiof, sea bream), pure artisanal peanut paste from Kaolack, and fresh vegetables gathered every morning in Dakar markets.',
    aboutPillar2Title: 'Teranga at Heart',
    aboutPillar2Desc: 'Senegal’s legendary hospitality delivered through warm welcomes, generous portions, and meticulous attention paid to every guest.',
    aboutPillar3Title: 'Frictionless Technology',
    aboutPillar3Desc: 'Scan your table’s QR Code, customize your sauces and side dishes in seconds, and track kitchen preparation live with zero waiting time.',
    aboutFindUsTag: 'FIND US',
    aboutFindUsTitle: 'Experience Teranga in Dakar',
    aboutAddressLabel: 'Address',
    aboutHoursLabel: 'Opening Hours',
    aboutHoursSub: 'Continuous service & delivery',
    aboutBookingsLabel: 'Reservations & WhatsApp',
    aboutSmartTablesNotice: 'Tables 01 to 20 equipped with smart QR Codes.',
    aboutDiscoverMenuBtn: 'Explore our menu',

    // Page Promotions
    promotionsTag: 'SPECIAL OFFERS & DEALS',
    promotionsTitle: 'Our Deals & Promotions',
    promotionsSubtitle: 'Enjoy exclusive instant discounts applied directly to your dine-in, takeaway, or delivery orders.',
    promo1Badge: '-20% INSTANT',
    promo1Time: '6:00 PM → 10:00 PM',
    promo1Dates: 'Sept 05 to Sept 12',
    promo1Active: 'ACTIVE',
    promo1Title: 'Teranga Gourmet Burger',
    promo1Desc: 'Golden artisanal brioche bun, 160g freshly grilled beef patty, Yassa-style lime caramelized onions, and melting aged cheddar. Fries included.',
    promo1Cta: 'Order at -20%',
    promo1Added: 'Added to cart',

    promo2Badge: 'COMPLETE LUNCH DEAL',
    promo2Time: '12:00 PM → 3:00 PM',
    promo2Dates: 'Every day',
    promo2Active: 'ACTIVE',
    promo2Title: 'Prestige Thieboudienne Menu',
    promo2Desc: 'Traditional white grouper Thieboudienne + 4 crispy fish pastels with netetou sauce + 1 large glass of Royal Bissap or homemade Bouye.',
    promo2Cta: 'Order this menu',

    promo3Badge: 'LUNCH OFFER',
    promo3Dates: 'Lunchtime in restaurant',
    promo3Active: 'AUTOMATIC',
    promo3Title: 'Complimentary Fresh Juice',
    promo3Desc: 'For any Senegalese signature dish ordered from your table between 12:00 PM and 2:30 PM, enjoy a complimentary cold-pressed Bissap or Ginger juice.',
    promo3Value: '1,000 FCFA Off',
    promo3Cta: 'View signature dishes',

    promo4Badge: 'HAPPY HOUR',
    promo4Time: '6:00 PM — 8:00 PM',
    promo4Dates: 'Every late afternoon',
    promo4Active: 'DINE-IN',
    promo4Title: 'Happy Hour Aperitif & Alloco',
    promo4Desc: 'Enjoy complimentary crispy Alloco with any order of 2 mocktails or chilled drinks at your table between 6 PM and 8 PM. Perfect for unwinding.',
    promo4Value: 'Free Alloco',
    promo4Cta: 'Reserve / Order',

    loyaltyProgramTag: 'TERANGA+ REWARDS',
    loyaltyProgramTitle: 'Your loyalty rewarded with every order',
    loyaltyProgramDesc: 'Collect 10 restaurant orders and unlock a complimentary craft beverage or dessert.',
    loyaltyValidatedLabel: 'Orders completed',
    loyaltyProgressText: 'Only 2 more orders before your reward 🎁',
    loyaltyRewardLabel: 'Reward: Complimentary craft juice',

    // Admin Header
    adminOpenMenu: 'Open Menu',
    adminRoleDirector: 'Manager',
    adminSeeKitchen: 'View in Kitchen',
  },

  wo: {
    // Navigation & Globale
    navHome: 'Kër gi',
    navMenu: 'Lisi bi',
    navAbout: 'Ci sunu mbir',
    navPromotions: 'Wàññi-pëy',
    navContact: 'Jokkoo',
    navCart: 'Mbaal',
    navAdmin: 'Njiit',
    searchAction: 'Seet',
    orderNowBtn: 'Joxeel ndiggal léegi',
    viewDishBtn: 'Xool mbalka mi',
    dishPreparedCarefully: 'Ñam yuñ toog ak téey',
    freshProducts: 'Cëri ñam yu bees',
    fastService: 'Cawarte ci liggéey bi',
    dineIn: 'Ci taabal',
    dineInShort: 'Ci taabal ?',
    delivery: 'Yóbbal ma ko',
    takeaway: 'Yóbbu',
    tableLabel: 'Taabal',
    tableChangePrompt: 'Soppi nimero taabal bi :',
    tableEnterPrompt: 'Bindal nimero sa taabal (bayyil mu neen su fekkee yóbbu la) :',
    changeBtn: 'Soppi',
    closeBtn: 'Tëj',
    backBtn: 'Dellu',
    orderBtn: 'Jënd',
    totalLabel: 'Lépp',
    subtotalLabel: 'Koom gi',
    serviceFeeLabel: 'Fasoonu liggéey',
    deliveryFeeLabel: 'Fasoonu yóbbe',
    includedLabel: 'Bokk na ci',
    freeLabel: 'Ab gratis',
    priceLabel: 'Njëg',
    allCategories: 'Lépp',
    resetFilter: 'Delloo lépp ci anam',

    // Hero & Page d'accueil
    tagline: 'Kompang Ñam & Jënd ci Sa Koom-koom',
    heroHeadline1: 'Coféelu Senegaal,',
    heroHeadline2: 'ci anam yu bees.',
    heroDesc: 'Gisal sunuy ñam, joxeel sa ndiggal ci sa taabal te bég ci doxalin bu yomb te rafet.',
    viewMenu: 'Xoolal lisi bi',
    discoverDishes: 'Joxeel ndiggal léegi',
    hygienic: '✨ Set na',
    fast: '⚡ Gaaw na',
    convenient: '📱 Yomb na',
    stepsTitle: 'Yoon wi Yomb na Lool',
    stepsSubtitle: 'Ci ñetti yoon rekk ci sa telefon',
    step1Title: '1. Skaanel QR Code bi',
    step1Desc: 'Ci sa taabal te danga dul xaar kenn di la yóbbal méni.',
    step2Title: '2. Tànnal li la neex',
    step2Desc: 'Ceebu jën, yassa, maffe ak leneen luy dëggal sa xol.',
    step3Title: '3. Jëndal te Dégël',
    step3Desc: 'Waakër wàñ gi dañuy jot sa ndigal ci saa si, WhatsApp tamit dina la koy biral.',
    chefSelectionTitle: 'TÀNNU SÉF BI',
    featuredDishes: 'Sunu ñam yu mag yi',
    viewAllMenu: 'Xoolal méni bi yépp',
    fidelityTitle: 'TERANGA KOOM',
    fidelityDesc: 'Booy jënd di am ay poon ngir am ay wàññi-pri ak naan yu gratis.',
    fidelityCta: 'Bokk ci Koor gi',
    fidelityProgram: 'POROGARAMU JËNDKAT',
    fidelityRemaining: 'Des na ñaari ndigal ngir jot ci sa kado.',
    reviewsTitle: 'GÉM-GÉMU JËNDKAT YI',
    reviewsHeading: 'LI JËNDKAT YI WAX',
    reviewsCount: '142 gém-gém',

    // Bannières & Marquee
    welcomeTableTitle: 'Dalal ak jamm ci taabal',
    welcomeTableDesc: 'Xoolal sunu lisi bi te joxe ndiggal genn wàll sa taabal.',
    promoDiscountTag: 'WÀÑÑI-PRI',
    marqueePromo1: 'WÀÑÑI-PËY TEY — -20% CI BURGERS YI',
    marqueePromo2: 'JOXEEL NDIGGAL DIRECT CI SA TAABAL',
    marqueePromo3: 'GISAL SUNU ÑAM YU GËNA SIW',
    marqueePromo4: 'JUS YU BEES TE SEDD A NGI FII',
    marqueePromo5: 'JËND CI TELEFON — SKAANEL • JËNDAL • LEKKAL',
    marqueePromo6: 'TERANGA FOOD — SAFU SENEGAAL CI BEPP DEPP',

    // Menu Page & Cartes
    menuPageTitle: 'SUNU MÉNI',
    menuPageSubtitle: 'Xoolal sunuy ñam yu neex te rafet defar ak teranga.',
    searchPlaceholder: 'Seet benn ñam walla naan (ceebu jën, ginar, alloco)...',
    dishesCountSingular: 'ñam am na',
    dishesCountPlural: 'ñam ñu am léegi',
    noDishFoundTitle: 'Gisunu benn ñam',
    noDishFoundDesc: 'Jéemal yeneen baat ngir gis li la neex.',
    viewAllDishesBtn: 'Xoolal méni bi yépp',
    outOfStock: 'Jeex na',
    badgeChef: 'Séf',
    badgePopular: 'Siw na',
    badgeNew: 'Kees',
    badgeSpicy: 'Kani',
    specialtyPrefix: 'Li nu xam',
    sortLabel: 'Tànn anam gi :',
    sortDefault: 'Tànnu Séf bi',
    sortPriceAsc: 'Njëg mu wàññiku (↗)',
    sortPriceDesc: 'Njëg mu yéeg (↘)',
    sortPopular: 'Ñam yu gëna siw',
    sortName: 'Tur yi (A-Z)',

    // Modal Produit
    ingredientsLabel: 'Li ci nekk',
    optionRequired: '(Dafay laaj)',
    optionOptional: '(Bu la neexee)',
    instructionsLabel: 'Waxal sa bëgg-bëgg (bu la neexee)',
    instructionsPlaceholder: 'Misaal: Bumu am soble, defal kani bi ci kow...',
    addToCartBtn: 'Yóbbul ci mbaal mi',

    // Panier (Cart Drawer)
    cartTitle: 'SA MBAAL',
    emptyCartTitle: 'Sa mbaal amul dara',
    emptyCartDesc: 'Xoolal sunu méni te duggal li la neex.',
    discoverMenuAction: 'Xoolal méni bi',
    clearCartBtn: 'Far lépp',
    clearCartConfirm: 'Danga bëgg a far sa mbaal lépp ?',
    proceedToCheckout: 'JËND LÉEP',

    // Checkout (Finalisation)
    checkoutHeaderTitle: 'Dégël sa ndigal',
    stepCartLabel: 'Mbaal',
    stepInfoLabel: 'Kumpa',
    stepConfirmLabel: 'Dégël',
    orderTypeTitle: 'NOO KO BËGGE',
    tableNumberLabel: 'Nimero taabal bi',
    tableNumberPlaceholder: 'Misaal: 08',
    customerNameLabel: 'Sa tur ak sa sant',
    customerNamePlaceholder: 'Misaal: Awa Ndiaye',
    customerPhoneLabel: 'Sa nimero WhatsApp (ngir toftalu)',
    customerPhonePlaceholder: 'Misaal: 77 123 45 67',
    deliveryAddressLabel: 'Fan lañu lay yóbbal ñam bi',
    deliveryAddressPlaceholder: 'Misaal: Dakar-Plateau, Mbeddu Schoelcher...',
    notesLabel: 'Waxal waakër wàñ gi (bu la neexee)',
    notesPlaceholder: 'Misaal: Kani bi ci wet, ñor bu bax...',
    orderSummaryTitle: 'LI NGA JËND LÉPP',
    totalToPayLabel: 'Njëg li yépp',
    confirmWhatsAppBtn: 'Dégël te yónnee ci WhatsApp',
    validationNameRequired: 'Bindal sa tur ak sa sant bu bax',
    validationPhoneRequired: 'Nimero telefon dafa laaj',
    validationPhoneInvalid: 'Nimero telefon bi baaxul (misaal: 77 123 45 67)',
    validationTableRequired: 'Tànnal nimero sa taabal',
    validationAddressRequired: 'Bindal béréb bi nu lay yóbbal',
    emptyCartCheckoutNotice: 'Duggalal benn ñam ci sa mbaal ngir man a jënd.',
    backToMenuBtn: 'Dellul ci méni bi',

    // Confirmation & Suivi de commande
    orderConfirmedTitle: 'SA NDIGAL JÀLL NA',
    orderConfirmedSubtitle: 'Sa ndigal jottali nañu ko waakër',
    orderNumberLabel: 'Ndigal',
    statusLabel: 'Anam :',
    statusStep1: 'Waakër wàñ gi jot nañu ko',
    statusStep2: 'Dégël nañu ko',
    statusStep3: 'Ñu ngi koy tog ci wàñ gi',
    statusStep4: 'Pare na !',
    statusStep5: 'Jox nañu la ko / Yóbbal nañu la ko',
    statusCancelled: 'Dañu ko far',
    timelineStep1Title: 'Ndigal bi jàll na',
    timelineStep1Desc: 'Yég na ci saa si ci sunu wàñ',
    timelineStep2Title: 'Nangu nañu ko',
    timelineStep2Desc: 'Waakër saal bi nangu nañu ko',
    timelineStep3Title: 'Ñu ngi koy tog',
    timelineStep3Desc: 'Séf bi mu ngi defar sa ñam ci matt mi',
    timelineStep4Title: 'Ñam bi pare na',
    timelineStep4Desc: 'Ñu ngi koy lal ngir jox la ko',
    timelineStep5Title: 'Jox nañu la ko',
    timelineStep5Desc: 'Nanu la neex te jërëjëf ci teranga bi',
    timelineTimeImmediate: 'Ci saa si',
    timelineTimePlus1: '+1 min',
    timelineTimeInProgress: 'Ñu ngi koy tog',
    timelineTimeSoon: 'Léegi léegi',
    timelineTimeEnjoy: 'Nanu la neex',
    rateOrderTitle: 'Sa xalaat am na solo lool',
    rateOrderDesc: 'Wax nu sa xalaat ci ndigal lii ci saa si :',
    rateCommentPlaceholder: 'Sa xalaat ci neexu ñam bi ak gaaw gi...',
    rateSubmitBtn: 'Yónnee sama xalaat',
    rateSuccessMsg: 'Jërëjëf ci sa xalaat bu am solo !',
    orderNotFoundTitle: 'Gisunu sa ndigal',

    // Additional comprehensive keys for all pages
    customerInfoTitle: 'Sa Kumpa ak Sa Tur',
    viewCartBtn: 'Xoolal sa mbaal',
    step1Received: '1. Jot nañu ko',
    step2Kitchen: '2. Ci wàñ gi',
    step3Ready: '3. Pare na',
    clientLabel: 'Jëndkat',
    serviceTypeLabel: 'Anamu ndigal',
    sendWhatsAppBtn: 'YÓNNEE SA NDIGAL CI WHATSAPP',
    trackOrderBtn: 'TOPP SA NDIGAL',
    receiptBtn: 'Tike',
    trackingTitle: 'Topp sa Ndigal',
    progressLabel: 'Toftalu',
    readyBannerTitle: 'SA NDIGAL PARE NA ✓',
    readyBannerDineIn: 'Liggéeykat bi mu ngi ñëw ci sa taabal {table}.',
    readyBannerTakeaway: 'Man nga ñëw ci kantoowar bi jël sa ñam.',
    servedBannerTitle: 'JOT NGA SA ÑAM — DÉGËLAL !',
    servedBannerDesc: 'Jërëjëf ci sa tewte ci {name}.',
    preparingBannerTitle: 'Ñu ngi koy tog ci wàñ gi',
    preparingBannerDesc: 'Kumpa yépp ci saa si ci ekran bii.',
    cancelledBanner: 'Ndigal lii dañu ko far. Waxal ak liggéeykat yi.',
    orderedItemsTitle: 'Li nga jënd',
    feedbackSectionTitle: 'NOU LA SA NDIGAL NEEXE ?',
    feedbackSectionSubtitle: 'Joxal sa xalaat ngir nu gëna baaxal sunu wàñ ak sunu liggéey.',
    feedbackSectionTag: 'Sa xalaat am na solo',
    feedbackSuccessTitle: '🎉 Jërëjëf lool ci sa xalaat !',
    feedbackSuccessDesc: 'Sa xalaat yég na séf bi ak njiit yi.',
    orderSomethingElseBtn: 'Jëndat leneen',
    whatsAppMsgBtn: 'Bataaxal WhatsApp',
    whatsAppOrderNotice: 'Boo ci bësee, WhatsApp dina ubbeeku ak sa ndigal yónnee ko réstoraan {name}.',
    receiptOfficialTitle: 'Kayitu Jënd',
    receiptOrderNo: 'Nimero Ndigal',
    receiptDateTime: 'Bés ak Waxtu',
    receiptType: 'Anam',
    receiptItemsCol: 'Ñam / Tànnéef',
    receiptTotalPaid: 'Lépp lu Fayu',
    receiptScanDesc: 'Skaanel QR Code bi ngir gis tike bi ci internet',
    receiptThanks: 'Jërëjëf ci sa ñëw ci {name} !',
    receiptPoweredBy: 'GORATECH moo ko defar',
    printReceiptBtn: 'Móol tike bi',
    shareReceiptBtn: 'Séddoo ci WhatsApp',
    receiptShareText: 'Mii mooy sama tike ci ndigal #{id} ci {name} ({total}) : {url}',
    liveKitchenBadge: 'Wàñ gi ci saa si',
    demoPillTitle: 'Wone 60s',
    demoModalTag: 'Wone Njiit • GORATECH',
    demoModalTitle: 'Wone bi ci 60 Sekond',
    demoModalDesc: 'Xoolal lépp: skaane ba ci ekranu wàñ gi ak bérébu njiit yi.',
    demoStep1Title: '1. Skaan Taabal 12',
    demoStep1Desc: 'Méni dijitaal ak bano taabal',
    demoStep2Title: '2. Ekranu Wàñ KDS ci saa si',
    demoStep2Desc: 'Gis ndigal yi ak waxtu ak riir',
    demoStep3Title: '3. Bérébu Njiit & Kumpa',
    demoStep3Desc: 'Koom-koom ci FCFA ak waxtu yu gëna xat',
    demoStep4Title: '4. Teeru Taabal yi ñuy móol',
    demoStep4Desc: 'Bérébu defar QR code ngir taabal yi',
    managerDemoTitle: 'Ndax yaay njiit walla borom réstoraan ?',
    managerDemoDesc: 'Xoolal bérébu njiit yi, ekranu wàñ gi (KDS) ak doxalinu taabal yi ci saa si.',
    managerDemoBtn: 'Wone bérébu njiit bi',
    footerRights: 'Bépp sañ-sañ aar nañu ko.',
    footerGoratech: 'Ay jumtukaayi dijitaal yu GORATECH defar',
    footerSub: 'Jumtukaay yu xam-xam ngir kër liggéeyukaay yi.',
    review1Text: '« Liggéey bu baax lool ak ñam wu neex. Jënd ci WhatsApp ci taabal bi neex na torop. »',
    review1Meta: 'Taabal 04 • Démb',
    review2Text: '« Ceebu jën bi dafa neex lool, dëpp yi rëy nañu te jënd ci QR Code bi gaaw na. »',
    review2Meta: 'Yóbbu • Déemb-ca-la-ca',
    review3Text: '« Masin bi dafa set te leer. Dinga xam bu baax li ngay jënd. Dama koy ñaax ñépp ! »',
    review3Meta: 'Taabal 12 • Ay fan ci ginaaw',
    fidelityOrdersCount: '8 / 10 ndigal',

    // Page À Propos
    aboutTagline: 'SUNU JÀMM AK SUNU TAARIX',
    aboutHeadline1: 'Ñam yu am solo te saf.',
    aboutHeadline2: 'Doxalin bu xereñ te bees.',
    aboutDesc: 'Ci biir TERANGA FOOD, danuy dundal tog-togu Senegaal ci diggu Ndakaaru, di sàmm aada ak baaxu toog yu yàgg yi, te di ko boole ak jumtukaay yu bees yi yombal jënd gi.',
    aboutKitchenQuote: 'Cin yu weñ, mattu filao ak cëri ñam yu bees te sell yu jóge ci suufu Senegaal.',
    aboutValuesTitle: 'SUNU TÀNK YI NU SUKKANDIKOO',
    aboutValuesSubtitle: 'Li tax sunu taabal gëna rafet',
    aboutPillar1Title: '100% Cëri Terroiru Senegaal',
    aboutPillar1Desc: 'Jën yu bees yu jóge ci géej gi tey (thiof, dorade), tiggadéegé bu sell bu Kaolack, ak lise yu ñu dajale suba tey ci marse yu Ndakaaru.',
    aboutPillar2Title: 'Teranga ci Sa Xol',
    aboutPillar2Desc: 'Teranga Senegaal bu siw bi, di la dalal ak tiitande, dëpp yu fees dell, ak fonk ku fi ñëw.',
    aboutPillar3Title: 'Teknolooji bu Yomb te Gaaw',
    aboutPillar3Desc: 'Skaanel QR Code sa taabal, tànnal sa soos ak sa cër ci saa si, te topp sa ñam ba wàñ ga ba ci sa kanam te danga dul xaar kenn.',
    aboutFindUsTag: 'FAN LAÑU NEKK',
    aboutFindUsTitle: 'Kaay ñu dalal la ci Ndakaaru',
    aboutAddressLabel: 'Adrees',
    aboutHoursLabel: 'Waxtu liggéey',
    aboutHoursSub: 'Liggéey guddi ak bëccëg ak yóbbe',
    aboutBookingsLabel: 'Jël palaas & WhatsApp',
    aboutSmartTablesNotice: 'Taabal 01 ba 20 am nañu QR Code bu xereñ.',
    aboutDiscoverMenuBtn: 'Xoolal sunu méni',

    // Page Promotions
    promotionsTag: 'WÀÑÑI-PRI AK WÀÑÑI-PËY',
    promotionsTitle: 'Sunu Wàññi-Pëy & Kado yi',
    promotionsSubtitle: 'Amal ay wàññi-pri yu am solo ci sa ndigal léegi ci taabal, yóbbu walla yóbbal ma ko.',
    promo1Badge: '-20% CI SAA SI',
    promo1Time: '18h00 → 22h00',
    promo1Dates: 'Tambale 05/09 ba 12/09',
    promo1Active: 'MU NGI DOX',
    promo1Title: 'Burger Teranga Bu Saf',
    promo1Desc: 'Mburu brioché bu mboq, yàppu nag 160g toog ci saa si, soble yassa ak limoŋ ak fromaas bu ñor. Frites bokk na ci.',
    promo1Cta: 'Jëndal ak -20%',
    promo1Added: 'Duggal nañu ko ci mbaal mi',

    promo2Badge: 'MENU BËCCËG BI YÉPP',
    promo2Time: '12h00 → 15h00',
    promo2Dates: 'Bés bu nekk',
    promo2Active: 'MU NGI DOX',
    promo2Title: 'Menu Ceebu Jën Prestige',
    promo2Desc: 'Ceebu Jën Penda Mbaye ak mérou + 4 pastel jën ak soosu nététou + 1 kaas bu mag bu Bissap Royal walla Buuy.',
    promo2Cta: 'Jëndal menu bii',

    promo3Badge: 'KADO BËCCËG',
    promo3Dates: 'Njiitu bëccëg ci réstoraan',
    promo3Active: 'BOOPAL BOOPAM',
    promo3Title: 'Jus bu Bees bu Gratis',
    promo3Desc: 'Bépp ñam bu mag bu Senegaal boo ko jënde ci sa taabal diggante 12h00 ak 14h30, dinañu la jox benn kaas bu Bissap walla Jinjer bu sedd buy gratis.',
    promo3Value: '1 000 FCFA Kado',
    promo3Cta: 'Xoolal ñam yu mag yi',

    promo4Badge: 'HAPPY HOUR NGOON',
    promo4Time: '18h00 — 20h00',
    promo4Dates: 'Ngoon gu nekk',
    promo4Active: 'CI TAABAL',
    promo4Title: 'Happy Hour Doko & Alloco',
    promo4Desc: 'Jot ci sa alloco bu neex te gratis boo jënde ñaari naan ci taabal diggante 18h ak 20h. Rafet na lool ngir noppalu.',
    promo4Value: 'Alloco bu Gratis',
    promo4Cta: 'Jël palaas / Jënd',

    loyaltyProgramTag: 'POROGARAMU TERANGA+',
    loyaltyProgramTitle: 'Sa fonk réstoraan bi am na kado ci bépp ndigal',
    loyaltyProgramDesc: 'Dajalel 10 ndigal ci réstoraan bi ngir am benn naan bu neex walla saf-saf bu gratis.',
    loyaltyValidatedLabel: 'Ndigal yi nangu',
    loyaltyProgressText: 'Des na ñaari ndigal ngir sa kado 🎁',
    loyaltyRewardLabel: 'Kado: Jus bu bees bu gratis',

    // Admin Header
    adminOpenMenu: 'Ubbi méni bi',
    adminRoleDirector: 'Njiit',
    adminSeeKitchen: 'Xool ci wàñ gi',
  },
};

// ==========================================
// CULINARY DICTIONARIES FOR PRODUCTS & CATEGORIES
// ==========================================

export const CATEGORY_TRANSLATIONS: Record<string, Record<Language, string>> = {
  'cat-entrees': {
    fr: 'Entrées',
    en: 'Starters',
    wo: 'Tànnéef njëkk',
  },
  'cat-senegal': {
    fr: 'Plats sénégalais',
    en: 'Senegalese Dishes',
    wo: 'Ñami Senegaal',
  },
  'cat-grillades': {
    fr: 'Grillades',
    en: 'Grills & Dibi',
    wo: 'Ñam yu ñor & Dibi',
  },
  'cat-burgers': {
    fr: 'Burgers',
    en: 'Burgers',
    wo: 'Burgers',
  },
  'cat-accompagnements': {
    fr: 'Accompagnements',
    en: 'Side Dishes',
    wo: 'Cëri ñam',
  },
  'cat-desserts': {
    fr: 'Desserts',
    en: 'Desserts',
    wo: 'Ñam yu saf',
  },
  'cat-boissons': {
    fr: 'Jus & boissons',
    en: 'Juices & Drinks',
    wo: 'Naan & jus',
  },
};

export interface LocalizedProductInfo {
  name: Record<Language, string>;
  description: Record<Language, string>;
}

export const PRODUCT_TRANSLATIONS: Record<string, LocalizedProductInfo> = {
  'prod-01': {
    name: {
      fr: 'Thiéboudienne',
      en: 'Thieboudienne',
      wo: 'Céebu Jën',
    },
    description: {
      fr: 'Le chef-d’œuvre national : riz rouge mijoté au jus de poisson mérou blanc dakarois, manioc, carotte, chou et sauce nététou parfumée.',
      en: 'Senegal’s national masterpiece: fragrant red rice simmered in fresh white grouper fish stock, cassava, carrot, cabbage, and netetou sauce.',
      wo: 'Ñam bu mag bu Senegaal: ceeb bu xonq tooge ci soosu mérou bu Ndakaaru, ñambi, karot, suu ak soosu nététou bu xeeñ.',
    },
  },
  'prod-03': {
    name: {
      fr: 'Yassa Poulet',
      en: 'Yassa Chicken',
      wo: 'Yassa Ginar',
    },
    description: {
      fr: 'Poulet mariné puis mijoté dans une sauce généreuse aux oignons caramélisés et citron vert de Casamance.',
      en: 'Free-range chicken marinated and slow-cooked in a rich sauce of caramelized onions, mustard, and green limes from Casamance.',
      wo: 'Ginar gu ñu jox marinade te toog ko ci soosu soble bu bare, limoŋu Casamance ak moutarde.',
    },
  },
  'prod-04': {
    name: {
      fr: 'Mafé au Bœuf',
      en: 'Beef Mafe',
      wo: 'Maffe Nag',
    },
    description: {
      fr: 'Ragoût onctueux à la pâte d’arachide grillée artisanale de Kaolack, patates douces et morceaux de bœuf fondants.',
      en: 'Rich and velvety stew made with artisanal roasted peanut paste from Kaolack, sweet potatoes, and melt-in-the-mouth tender beef.',
      wo: 'Ñam bu saf xool ak tiggadéegé Kaolack bu ñor, pataas ak yàppu nag yu nooy ne nenn.',
    },
  },
  'prod-thiebou-dieune': {
    name: {
      fr: 'Thiébou Dieune Blanc (Pëcc)',
      en: 'White Fish Thieboudienne (Pecc)',
      wo: 'Céebu Jën bu Weex (Pëcc)',
    },
    description: {
      fr: 'Riz blanc sénégalais au poisson noble mérou, sauce bissap vert acidulée, tamarin et beugueudj traditionnel.',
      en: 'Authentic white rice with prime grouper fish, tangy green hibiscus sauce, tamarind, and traditional beugueudj greens.',
      wo: 'Ceeb bu weex ak jën mérou bu mag, soosu beugueudj ak daxar ak kaani.',
    },
  },
  'prod-thiebou-yapp': {
    name: {
      fr: 'Thiébou Yapp',
      en: 'Thieb Meat & Rice',
      wo: 'Céebu Yàpp',
    },
    description: {
      fr: 'Riz brun sénégalais parfumé aux épices, morceaux de bœuf et agneau caramélisés, condiments nététou et légumes braisés du marché.',
      en: 'Spiced Senegalese brown rice cooked with tender caramelized beef and lamb cuts, nététou seasoning, and braised market vegetables.',
      wo: 'Ceeb bu brën bu xeeñ lool, yàppu nag ak xar yu ñor te saf, nététou ak lise yu toog.',
    },
  },
  'prod-02': {
    name: {
      fr: 'Poulet Braisé Teranga',
      en: 'Teranga Grilled Chicken',
      wo: 'Ginar gu Ñor Teranga',
    },
    description: {
      fr: 'Cuisse de poulet fermier marinée aux épices locales et grillée lentement à la braise de bois. Moelleux à l’intérieur, croustillant dehors.',
      en: 'Local free-range chicken leg marinated in secret spices and slow-grilled over wood charcoal. Juicy inside, crispy outside.',
      wo: 'Cuucu ginar gu ñu jox épices te ñorale ko ci matt. Dafa nooy ci biir te xat ci biti.',
    },
  },
  'prod-05': {
    name: {
      fr: 'Dibi d’Agneau Traditionnel',
      en: 'Traditional Lamb Dibi',
      wo: 'Dibi Xar bu Ñor',
    },
    description: {
      fr: 'Morceaux choisis d’agneau grillés minute sur braise ardente, servis sur papier kraft avec oignons émincés et moutarde piquante.',
      en: 'Prime cuts of tender lamb grilled fresh over burning coals, served on kraft paper with sliced seasoned onions and sharp mustard.',
      wo: 'Cëri yàppu xar yu ñu ñorale ci saa si ci matt, lal ko ci kayit ak soble ak moutarde bu xat.',
    },
  },
  'prod-06': {
    name: {
      fr: 'Brochettes de Filet de Bœuf',
      en: 'Beef Tenderloin Skewers',
      wo: 'Brosèt Yàppu Nag',
    },
    description: {
      fr: 'Quatre brochettes généreuses de filet de bœuf mariné au poivre de Selim et herbes locales.',
      en: 'Four generous skewers of tender beef fillet marinated in Selim pepper and indigenous herbs.',
      wo: 'Ñeenti brosèt yu mag yu yàppu nag bu nooy, kani jar ak xob yu xeeñ.',
    },
  },
  'prod-07': {
    name: {
      fr: 'Brochettes de Poulet Épicées',
      en: 'Spicy Chicken Skewers',
      wo: 'Brosèt Ginar bu Saf Kaani',
    },
    description: {
      fr: 'Brochettes de blanc de poulet mariné au gingembre, ail et piment doux de Casamance.',
      en: 'Tender chicken breast skewers infused with ginger, garlic, and mild Casamance chili.',
      wo: 'Brosèt ginar bu ñu toog ak jinjer, lay ak kani gu saf bu Casamance.',
    },
  },
  'prod-poisson-braise': {
    name: {
      fr: 'Poisson Braisé à la Dakaroise',
      en: 'Dakar Charcoal Grilled Fish',
      wo: 'Jën wu Ñor ci Matt',
    },
    description: {
      fr: 'Bar ou dorade fraîche entière marinée aux aromates de Casamance, grillée à la flamme vive avec peau croustillante, citron vert et sauce pimentée.',
      en: 'Whole fresh sea bass or sea bream seasoned with Casamance spices, charred on open embers with crisp skin, lime, and chili relish.',
      wo: 'Jën dorade bu fees dell, ñorale ko ci sawara matt, ak limoŋ ak soosu kani.',
    },
  },
  'prod-08': {
    name: {
      fr: 'Burger Teranga',
      en: 'Teranga Burger',
      wo: 'Burger Teranga',
    },
    description: {
      fr: 'Pain brioché artisanal, steak haché façonné minute 160g, confit d’oignons façon Yassa au citron vert, cheddar affiné fondant et sauce secrète Teranga.',
      en: 'Artisanal brioche bun, 160g hand-pressed beef patty, lime Yassa onion confit, melted mature cheddar, and signature Teranga sauce.',
      wo: 'Mburu brioché kër, steak 160g, soble yassa limoŋ, fromaas bu ñor ak soosu Teranga.',
    },
  },
  'prod-09': {
    name: {
      fr: 'Cheese Burger Classic',
      en: 'Classic Cheeseburger',
      wo: 'Cheese Burger Classic',
    },
    description: {
      fr: 'Pain brioché doré, steak grillé, double cheddar affiné, cornichons doux et sauce burger artisanale.',
      en: 'Golden brioche bun, grilled beef patty, double melted cheddar, sweet pickles, and craft burger sauce.',
      wo: 'Mburu brioché, steak nag, double fromaas cheddar, cornichon ak soosu burger.',
    },
  },
  'prod-14': {
    name: {
      fr: 'Alloco Croustillant & Sauce Piment',
      en: 'Crispy Alloco & Chili Sauce',
      wo: 'Alloco (Doko) ak Soosu Kani',
    },
    description: {
      fr: 'Bananes plantains mûres frites à la minute, dorées et fondantes, accompagnées de sauce pimentée maison.',
      en: 'Sweet ripe plantains fried golden to order, sweet and tender inside, served with homemade chili sauce.',
      wo: 'Doko (bananas plantain) yu ñor te neex, toog ko ci saa si ak soosu kani kër gi.',
    },
  },
  'prod-acc-frites': {
    name: {
      fr: 'Frites Maison Croustillantes',
      en: 'Crispy Homemade Fries',
      wo: 'Frites Kër yu Ñor',
    },
    description: {
      fr: 'Pommes de terre fraîches coupées à la main et double friture pour un croustillant parfait.',
      en: 'Hand-cut fresh potatoes double-fried for optimal crunch and fluffiness.',
      wo: 'Poomditér yu bees yu ñu dog ak loxo te toog ko ñaari yoon ngir mu xat te neex.',
    },
  },
  'prod-acc-riz': {
    name: {
      fr: 'Portion de Riz Parfumé',
      en: 'Fragrant Rice Portion',
      wo: 'Ceeb bu Xeeñ',
    },
    description: {
      fr: 'Riz blanc cassé une fois parfumé ou riz rouge traditionnel au jus de poisson.',
      en: 'Steamed fragrant broken white rice or traditional red fish-simmered rice.',
      wo: 'Ceeb bu weex xeeñ walla ceeb bu xonq bu ñu tooge ci soosu jën.',
    },
  },
  'prod-12': {
    name: {
      fr: 'Pastels au Poisson (8 pièces)',
      en: 'Crispy Fish Pastels (8 pcs)',
      wo: 'Pastel ak Jën (8 cër)',
    },
    description: {
      fr: 'Chaussons dorés croustillants farcis au poisson blanc assaisonné, servis avec notre sauce tomate pimentée.',
      en: 'Golden crispy pastry turnovers filled with spiced white fish, served with spicy tomato Netetou dip.',
      wo: 'Beñe yu xat te ñor yu ñu dëx ak jën wu saf kaani, ak soosu tamaate.',
    },
  },
  'prod-13': {
    name: {
      fr: 'Fatayas à la Viande Hachée (6 pièces)',
      en: 'Beef Fatayas (6 pcs)',
      wo: 'Fataya Yàppu Nag (6 cër)',
    },
    description: {
      fr: 'Beignets salés croustillants garnis de bœuf haché mijoté aux herbes et petits légumes.',
      en: 'Flaky fried pastries packed with savory seasoned ground beef, garden herbs, and diced vegetables.',
      wo: 'Beñe yu xat yu fees ak yàppu nag bu ñu dëbb, xob yu xeeñ ak lise.',
    },
  },
  'prod-15': {
    name: {
      fr: 'Jus de Bissap Royal',
      en: 'Royal Hibiscus Bissap',
      wo: 'Bissap Royal bu Sedd',
    },
    description: {
      fr: 'Infusion fraîche de fleurs d’hibiscus rouge bio, parfumée aux feuilles de menthe fraîche et fleur d’oranger.',
      en: 'Refreshing chilled infusion of organic red hibiscus flowers, scented with fresh mint leaves and orange blossom.',
      wo: 'Bissap bu xonq bu sedd, ak xobu naana ak ndoxu pomelar ak suukër.',
    },
  },
  'prod-16': {
    name: {
      fr: 'Jus de Bouye Artisanal',
      en: 'Artisanal Baobab Juice (Bouye)',
      wo: 'Jus de Buuy bu Saf',
    },
    description: {
      fr: 'Jus crémeux et velouté extrait du fruit du baobab naturel, enrichi d’une pointe de vanille.',
      en: 'Creamy and velvety drink crafted from wild baobab fruit pulp, lightly accented with vanilla.',
      wo: 'Naan bu nooy buy jóge ci buyu gouye, am meew ak vaniy.',
    },
  },
  'prod-17': {
    name: {
      fr: 'Jus de Gingembre Tonique',
      en: 'Zesty Ginger & Pineapple Juice',
      wo: 'Jus de Jinjer ak Ananaas',
    },
    description: {
      fr: 'Extrait de gingembre frais pressé à froid avec pur jus d’ananas victoria et citron vert.',
      en: 'Cold-pressed fresh fiery ginger blended with sweet Victoria pineapple juice and zesty lime.',
      wo: 'Jinjer bu ñu natt ci saa si, boole ko ak jus ananaas ak limoŋ.',
    },
  },
  'prod-18': {
    name: {
      fr: 'Thiakry Gourmand au Couscous de Mil',
      en: 'Thiakry Millet Couscous & Sweet Yogurt',
      wo: 'Caakri ak Sow mu Neex',
    },
    description: {
      fr: 'Couscous de mil cuit à la vapeur mélangé à un yaourt onctueux parfumé à la muscade et vanille.',
      en: 'Steamed sweet millet couscous gently swirled with rich artisan yogurt, nutmeg, and vanilla.',
      wo: 'Arawu duggub bu ñu cuur, boole ko ak sow mu neex, muskaad ak vaniy.',
    },
  },
  'prod-19': {
    name: {
      fr: 'Salade de Fruits Exotiques Frais',
      en: 'Fresh Tropical Fruit Salad',
      wo: 'Mboolu Meññeef yu Bees',
    },
    description: {
      fr: 'Mangues mûres, papayes, ananas pain de sucre et fruits de la passion du Sénégal.',
      en: 'Ripe mangoes, papayas, sugarloaf pineapples, and local Senegalese passion fruits.',
      wo: 'Màngo yu ñor, popo, ananaas ak fwi de la pasiyoŋ yu Senegaal.',
    },
  },
  'prod-20': {
    name: {
      fr: 'Fondant au Chocolat & Glace Vanille',
      en: 'Chocolate Lava Cake & Vanilla Ice Cream',
      wo: 'Sokola bu Ñor ak Glas Vaniy',
    },
    description: {
      fr: 'Cœur coulant au chocolat noir 70%, servi chaud avec une boule de glace vanille artisanale.',
      en: 'Warm 70% dark chocolate cake with a molten core, paired with a scoop of artisan vanilla ice cream.',
      wo: 'Sokola bu tàng buy sotti ci biir, ak benn dëppu glas vaniy kër.',
    },
  },
  'prod-poulet-grille': {
    name: {
      fr: 'Poulet Grillé Dakaroise',
      en: 'Dakar Style Grilled Chicken',
      wo: 'Ginar gu Ñor ci Sawara',
    },
    description: {
      fr: 'Demi-poulet fermier mariné au citron et moutarde de Dijon, doré sur la grille ardente avec oignons sautés.',
      en: 'Half free-range chicken marinated with lime and Dijon mustard, flame-kissed with sautéed onions.',
      wo: 'Xaaju ginar gu ñu toog ak limoŋ ak moutarde, ñorale ko ci matt ak soble.',
    },
  },
  'prod-mafe-poulet': {
    name: {
      fr: 'Mafé Poulet',
      en: 'Chicken Mafe',
      wo: 'Maffe Ginar',
    },
    description: {
      fr: 'Morceaux de poulet fermier mijotés dans une sauce arachide veloutée avec carottes et choux fondants.',
      en: 'Tender chicken pieces simmered in a velvety peanut butter stew with sweet carrots and tender cabbage.',
      wo: 'Cëri ginar yu ñu toog ci soosu tiggadéegé mu neex, ak karot ak suu.',
    },
  },
  'prod-soupou-kandia': {
    name: {
      fr: 'Soupou Kandia Royal',
      en: 'Royal Okra Stew (Soupou Kandia)',
      wo: 'Súpukànja Royal',
    },
    description: {
      fr: 'Sauce gombo traditionnelle mijotée à l’huile de palme rouge pure, poisson fumé, crevettes séchées et crabe.',
      en: 'Traditional okra stew simmered in pure red palm oil with smoked fish, dried shrimp, and crab.',
      wo: 'Soosu kanja tooge ci diwu tir bu xonq, jën wu ñor, sippax ak kànkàn.',
    },
  },
  'prod-caldou': {
    name: {
      fr: 'Caldou Poisson Frais',
      en: 'Fresh Fish Caldou',
      wo: 'Kaldu ak Jën',
    },
    description: {
      fr: 'Court-bouillon de poisson frais au citron vert, huile d’arachide et sauce beugueudj bissap vert acidulée.',
      en: 'Fresh fish poached in a fragrant lime-seasoned broth, served with tangy green sorrel sauce.',
      wo: 'Jën wu bees tooge ci ndox ak limoŋ, ak soosu beugueudj bu saf xorom.',
    },
  },
  'prod-pastels-viande': {
    name: {
      fr: 'Pastels à la Viande (8 pièces)',
      en: 'Meat Pastels (8 pcs)',
      wo: 'Pastel ak Yàppu Nag (8 cër)',
    },
    description: {
      fr: 'Chaussons feuilletés garnis de viande hachée mijotée aux aromates et poivre noir de Casamance.',
      en: 'Golden crispy turnovers stuffed with savory spiced minced beef and fragrant Casamance black pepper.',
      wo: 'Beñe yu xat yu ñu dëx ak yàppu nag bu ñu dëbb ak kani.',
    },
  },
  'prod-nems-poulet': {
    name: {
      fr: 'Nems Dakarois au Poulet (4 pièces)',
      en: 'Dakar Crispy Chicken Spring Rolls (4 pcs)',
      wo: 'Nem Ginar yu Ñor (4 cër)',
    },
    description: {
      fr: 'Rouleaux croustillants au poulet, vermicelles et champignons noirs, servis avec sauce nuoc-mâm au citron.',
      en: 'Crispy spring rolls stuffed with seasoned chicken, noodles, and mushrooms, served with citrus dip.',
      wo: 'Nem yu xat yu am ginar ak vermisel, boole ko ak soos bu neex.',
    },
  },
  'prod-burger-smash': {
    name: {
      fr: 'Burger Dakar Smash',
      en: 'Dakar Smash Burger',
      wo: 'Burger Dakar Smash',
    },
    description: {
      fr: 'Double steak smashé croustillant sur plaque brûlante, sauce secrète paprika fumé, double cheddar fondu et salade croquante.',
      en: 'Double crispy-crusted smash beef patties, smoked paprika secret sauce, melted double cheddar, and fresh lettuce.',
      wo: 'Ñaari steak smashé yu ñor ci plake tàng, soosu paprika, double fromaas cheddar ak salat.',
    },
  },
  'prod-burger-crousti': {
    name: {
      fr: 'Burger Poulet Croustillant',
      en: 'Crispy Chicken Burger',
      wo: 'Burger Ginar bu Xat',
    },
    description: {
      fr: 'Filet de poulet pané aux épices cajun et cornflakes, sauce mayonnaise au citron vert, salade et tomates fraîches.',
      en: 'Golden crunchy cornflake-crusted chicken breast, lime mayo, crisp lettuce, and ripe tomatoes.',
      wo: 'Ginar gu xat te ñor, mayonees ak limoŋ, salat ak tamaate.',
    },
  },
  'prod-jus-corossol': {
    name: {
      fr: 'Jus de Corossol Sauvage',
      en: 'Wild Soursop Juice',
      wo: 'Jus de Korosol',
    },
    description: {
      fr: 'Nectar onctueux de corossol cueilli à maturité en Casamance, riche en vitamines et douceur exotique.',
      en: 'Velvety sweet soursop nectar freshly prepared from ripe Casamance fruit.',
      wo: 'Jus korosol bu neex te am vitamines bu baax, jóge ci Casamance.',
    },
  },
  'prod-cocktail-fruits': {
    name: {
      fr: 'Jus de Fruits Frais Pressés',
      en: 'Fresh Pressed Fruit Juice',
      wo: 'Jus Meññeef yu Bees',
    },
    description: {
      fr: 'Cocktail pressé minute : mangue de Casamance, ananas pain de sucre et fruits de la passion bien frais.',
      en: 'Freshly pressed tropical trio: Casamance mango, sweet pineapple, and tart passion fruit.',
      wo: 'Màngo, ananaas ak fwi de la pasiyoŋ yu ñu natt ci saa si.',
    },
  },
  'prod-beignets-doung': {
    name: {
      fr: 'Beignets Doung-doung Sucrés',
      en: 'Sweet Senegalese Beignets',
      wo: 'Beñe Duŋ-duŋ yu Saf Suukër',
    },
    description: {
      fr: 'Petits beignets traditionnels dorés, moelleux et saupoudrés de sucre glace et cannelle.',
      en: 'Pillow-soft golden Senegalese beignets dusted with powdered sugar and cinnamon.',
      wo: 'Beñe yu nooy te xeeñ suukër ak kanel, toog ko ci saa si.',
    },
  },
  'prod-ngalakh': {
    name: {
      fr: 'Ngalakh Traditionnel',
      en: 'Traditional Ngalakh',
      wo: 'Ñàlax bu Mag',
    },
    description: {
      fr: 'Entremets dakaroise associant semoule de mil cuite à la vapeur, pâte d’arachide et pulpe de bouye (pain de singe).',
      en: 'Signature Senegalese dessert blending steamed millet couscous, rich peanut paste, and tangy baobab fruit cream.',
      wo: 'Arawu dugub bu ñu toog, tiggadéegé, ndoxu buy ak ndoxu pomelar.',
    },
  },
};

// Generic string dictionaries for ingredients, options, etc.
export const TEXT_DICTIONARY: Record<string, Record<Language, string>> = {
  // Option Groups
  'Type de riz': {
    fr: 'Type de riz',
    en: 'Type of rice',
    wo: 'Tànnu ceeb',
  },
  'Choisissez votre accompagnement :': {
    fr: 'Choisissez votre accompagnement :',
    en: 'Choose your side dish:',
    wo: 'Tànnal sa cër :',
  },
  'Accompagnement': {
    fr: 'Accompagnement',
    en: 'Side dish',
    wo: 'Cëru ñam',
  },
  'Choisissez votre sauce :': {
    fr: 'Choisissez votre sauce :',
    en: 'Choose your sauce:',
    wo: 'Tànnal sa soos :',
  },
  'Sauce': {
    fr: 'Sauce',
    en: 'Sauce',
    wo: 'Soos',
  },
  'Suppléments :': {
    fr: 'Suppléments :',
    en: 'Extras / Toppings:',
    wo: 'Yokkute :',
  },
  'Suppléments': {
    fr: 'Suppléments',
    en: 'Extras / Toppings',
    wo: 'Yokkute',
  },
  'Portion': {
    fr: 'Portion',
    en: 'Portion size',
    wo: 'Dëpp',
  },

  // Option Items
  'Riz rouge traditionnel (Céebu Jën)': {
    fr: 'Riz rouge traditionnel (Céebu Jën)',
    en: 'Traditional red rice (Ceebu Jen)',
    wo: 'Ceeb bu xonq (Céebu Jën)',
  },
  'Riz blanc Pëcc (sauce bissap)': {
    fr: 'Riz blanc Pëcc (sauce bissap)',
    en: 'White rice Pecc (bissap sauce)',
    wo: 'Ceeb bu weex Pëcc (soos bissap)',
  },
  'Riz': {
    fr: 'Riz',
    en: 'Rice',
    wo: 'Ceeb',
  },
  'Riz blanc parfumé': {
    fr: 'Riz blanc parfumé',
    en: 'Fragrant white rice',
    wo: 'Ceeb bu weex xeeñ',
  },
  'Frites': {
    fr: 'Frites',
    en: 'Fries',
    wo: 'Frites',
  },
  'Frites maison': {
    fr: 'Frites maison',
    en: 'Homemade fries',
    wo: 'Frites kër',
  },
  'Alloco': {
    fr: 'Alloco',
    en: 'Fried plantains (Alloco)',
    wo: 'Alloco (Doko)',
  },
  'Alloco (bananes plantains)': {
    fr: 'Alloco (bananes plantains)',
    en: 'Fried plantains (Alloco)',
    wo: 'Alloco (Doko)',
  },
  'Sauce maison': {
    fr: 'Sauce maison',
    en: 'House sauce',
    wo: 'Soosu kër gi',
  },
  'Sauce douce aux oignons': {
    fr: 'Sauce douce aux oignons',
    en: 'Sweet onion sauce',
    wo: 'Soosu soble mu neex',
  },
  'Sauce piquante': {
    fr: 'Sauce piquante',
    en: 'Spicy chili sauce',
    wo: 'Soosu kani',
  },
  'Sauce piquante maison': {
    fr: 'Sauce piquante maison',
    en: 'Homemade spicy sauce',
    wo: 'Soosu kani kër gi',
  },
  'Sans sauce': {
    fr: 'Sans sauce',
    en: 'No sauce',
    wo: 'Amul soos',
  },
  'Œuf': {
    fr: 'Œuf',
    en: 'Egg',
    wo: 'Nen',
  },
  'Fromage': {
    fr: 'Fromage',
    en: 'Cheese',
    wo: 'Fromaas',
  },
  'Double Fromage fondu': {
    fr: 'Double Fromage fondu',
    en: 'Double Melted Cheese',
    wo: 'Fromaas bu bare',
  },
  'Bacon de bœuf croustillant': {
    fr: 'Bacon de bœuf croustillant',
    en: 'Crispy Beef Bacon',
    wo: 'Bacon nag ñor',
  },
  'Viande supplémentaire': {
    fr: 'Viande supplémentaire',
    en: 'Extra meat',
    wo: 'Yàpp bu ci yokk',
  },
  'Portion Simple (350g)': {
    fr: 'Portion Simple (350g)',
    en: 'Single Portion (350g)',
    wo: 'Dëpp bu yam (350g)',
  },
  'Portion Royale (500g)': {
    fr: 'Portion Royale (500g)',
    en: 'Royal Feast (500g)',
    wo: 'Dëpp bu mag (500g)',
  },

  // Common Ingredients
  'Riz rouge parfumé': {
    fr: 'Riz rouge parfumé',
    en: 'Fragrant red rice',
    wo: 'Ceeb bu xonq xeeñ',
  },
  'Mérou blanc frais': {
    fr: 'Mérou blanc frais',
    en: 'Fresh white grouper',
    wo: 'Mérou bu weex bu bees',
  },
  'Légumes du marché': {
    fr: 'Légumes du marché',
    en: 'Market fresh vegetables',
    wo: 'Lise marse bu bees',
  },
  'Sauce tomate nététou': {
    fr: 'Sauce tomate nététou',
    en: 'Tomato netetou sauce',
    wo: 'Soosu tamaate nététou',
  },
  'Piment vert': {
    fr: 'Piment vert',
    en: 'Green chili',
    wo: 'Kani vert',
  },
  'Poulet fermier mariné': {
    fr: 'Poulet fermier mariné',
    en: 'Marinated free-range chicken',
    wo: 'Ginar gu ñu toog',
  },
  'Oignons caramélisés': {
    fr: 'Oignons caramélisés',
    en: 'Caramelized onions',
    wo: 'Soble bu ñor',
  },
  'Citron vert de Casamance': {
    fr: 'Citron vert de Casamance',
    en: 'Casamance green lime',
    wo: 'Limoŋu Casamance',
  },
  'Olives': {
    fr: 'Olives',
    en: 'Olives',
    wo: 'Oliif',
  },
  'Moutarde': {
    fr: 'Moutarde',
    en: 'Mustard',
    wo: 'Moutarde',
  },
  'Bœuf mijoté': {
    fr: 'Bœuf mijoté',
    en: 'Simmered beef',
    wo: 'Yàppu nag bu toog',
  },
  'Pâte d’arachide de Kaolack': {
    fr: 'Pâte d’arachide de Kaolack',
    en: 'Kaolack peanut paste',
    wo: 'Tiggadéegé Kaolack',
  },
  'Légumes racines': {
    fr: 'Légumes racines',
    en: 'Root vegetables',
    wo: 'Lise suuf',
  },
  'Mérou blanc': {
    fr: 'Mérou blanc',
    en: 'White grouper',
    wo: 'Mérou bu weex',
  },
  'Riz blanc brisé': {
    fr: 'Riz blanc brisé',
    en: 'Broken white rice',
    wo: 'Ceeb bu weex bu dagg',
  },
  'Sauce bissap vert': {
    fr: 'Sauce bissap vert',
    en: 'Green bissap sauce',
    wo: 'Soosu beugueudj',
  },
  'Tamarin': {
    fr: 'Tamarin',
    en: 'Tamarind',
    wo: 'Daxar',
  },
  'Légumes': {
    fr: 'Légumes',
    en: 'Vegetables',
    wo: 'Lise',
  },
  'Bœuf & agneau mijotés': {
    fr: 'Bœuf & agneau mijotés',
    en: 'Simmered beef & lamb',
    wo: 'Yàppu nag ak xar',
  },
  'Riz brun aux épices': {
    fr: 'Riz brun aux épices',
    en: 'Spiced brown rice',
    wo: 'Ceeb bu xeeñ',
  },
  'Nététou': {
    fr: 'Nététou',
    en: 'Netetou',
    wo: 'Nététou',
  },
  'Poulet fermier braisé': {
    fr: 'Poulet fermier braisé',
    en: 'Braised free-range chicken',
    wo: 'Ginar gu ñor ci sawara',
  },
  'Épices secrètes Teranga': {
    fr: 'Épices secrètes Teranga',
    en: 'Secret Teranga spices',
    wo: 'Xob ak épices Teranga',
  },
  'Oignons marinés': {
    fr: 'Oignons marinés',
    en: 'Marinated onions',
    wo: 'Soble bu ñu toog',
  },
  'Agneau du terroir': {
    fr: 'Agneau du terroir',
    en: 'Local lamb',
    wo: 'Yàppu xaru réew mi',
  },
  'Oignons émincés': {
    fr: 'Oignons émincés',
    en: 'Sliced onions',
    wo: 'Soble yu dog',
  },
  'Moutarde forte': {
    fr: 'Moutarde forte',
    en: 'Sharp mustard',
    wo: 'Moutarde bu xat',
  },
  'Filet de bœuf': {
    fr: 'Filet de bœuf',
    en: 'Beef tenderloin',
    wo: 'Yàppu nag bu nooy',
  },
  'Poivrons': {
    fr: 'Poivrons',
    en: 'Bell peppers',
    wo: 'Poivron',
  },
  'Blanc de poulet fermier': {
    fr: 'Blanc de poulet fermier',
    en: 'Farm chicken breast',
    wo: 'Yàppu dënn ginar',
  },
  'Gingembre frais': {
    fr: 'Gingembre frais',
    en: 'Fresh ginger',
    wo: 'Jinjer bu bees',
  },
  'Poisson frais entier': {
    fr: 'Poisson frais entier',
    en: 'Whole fresh fish',
    wo: 'Jën bu bees mu mët',
  },
  'Marinade persillade': {
    fr: 'Marinade persillade',
    en: 'Garlic parsley marinade',
    wo: 'Marinade lay ak persil',
  },
  'Citron vert': {
    fr: 'Citron vert',
    en: 'Green lime',
    wo: 'Limoŋ vert',
  },
  'Sauce braisée piquante': {
    fr: 'Sauce braisée piquante',
    en: 'Spicy grilled sauce',
    wo: 'Soosu matt bu saf kaani',
  },
  'Pain brioché artisanal': {
    fr: 'Pain brioché artisanal',
    en: 'Artisan brioche bun',
    wo: 'Mburu brioché kër',
  },
  'Steak bœuf 160g': {
    fr: 'Steak bœuf 160g',
    en: '160g Beef steak',
    wo: 'Steak nag 160g',
  },
  'Confit d’oignons Yassa': {
    fr: 'Confit d’oignons Yassa',
    en: 'Yassa onion confit',
    wo: 'Soble Yassa bu ñor',
  },
  'Fromage fondant': {
    fr: 'Fromage fondant',
    en: 'Melted cheese',
    wo: 'Fromaas bu nooy',
  },
  'Frites incluses': {
    fr: 'Frites incluses',
    en: 'Fries included',
    wo: 'Frites bokk na ci',
  },
  'Pain brioché': {
    fr: 'Pain brioché',
    en: 'Brioche bun',
    wo: 'Mburu brioché',
  },
  'Steak 140g': {
    fr: 'Steak 140g',
    en: '140g Beef steak',
    wo: 'Steak 140g',
  },
  'Double cheddar': {
    fr: 'Double cheddar',
    en: 'Double cheddar',
    wo: 'Double cheddar',
  },
  'Sauce burger': {
    fr: 'Sauce burger',
    en: 'Burger sauce',
    wo: 'Soosu burger',
  },
  'Bananes plantains mûres de Casamance': {
    fr: 'Bananes plantains mûres de Casamance',
    en: 'Ripe Casamance plantains',
    wo: 'Bananas plantain Casamance',
  },
  'Friture minute': {
    fr: 'Friture minute',
    en: 'Freshly fried',
    wo: 'Toog ci saa si',
  },
  'Pommes de terre fraîches': {
    fr: 'Pommes de terre fraîches',
    en: 'Fresh potatoes',
    wo: 'Poomditér yu bees',
  },
  'Assaisonnement sel de Guérande': {
    fr: 'Assaisonnement sel de Guérande',
    en: 'Sea salt seasoning',
    wo: 'Xorom bu baax',
  },
  'Riz blanc parfumé de la vallée du fleuve': {
    fr: 'Riz blanc parfumé de la vallée du fleuve',
    en: 'River valley fragrant white rice',
    wo: 'Ceeb bu weex bu dex gi',
  },
  'Pâte croustillante dorée': {
    fr: 'Pâte croustillante dorée',
    en: 'Golden crispy pastry',
    wo: 'Poot bu xat te ñor',
  },
  'Farce poisson blanc épicé': {
    fr: 'Farce poisson blanc épicé',
    en: 'Spiced white fish filling',
    wo: 'Jën wu saf kaani',
  },
  'Sauce tomate piquante': {
    fr: 'Sauce tomate piquante',
    en: 'Spicy tomato sauce',
    wo: 'Soosu tamaate bu saf kaani',
  },
  'Pâte croustillante': {
    fr: 'Pâte croustillante',
    en: 'Crispy pastry',
    wo: 'Poot bu xat',
  },
  'Bœuf haché assaisonné': {
    fr: 'Bœuf haché assaisonné',
    en: 'Seasoned minced beef',
    wo: 'Yàppu nag bu ñu dëbb',
  },
  'Fleurs d’hibiscus rouge': {
    fr: 'Fleurs d’hibiscus rouge',
    en: 'Red hibiscus blossoms',
    wo: 'Xobu bissap bu xonq',
  },
  'Menthe fraîche': {
    fr: 'Menthe fraîche',
    en: 'Fresh mint',
    wo: 'Naana bu bees',
  },
  'Fleur d’oranger': {
    fr: 'Fleur d’oranger',
    en: 'Orange blossom',
    wo: 'Ndoxu pomelar',
  },
  'Sucre de canne': {
    fr: 'Sucre de canne',
    en: 'Cane sugar',
    wo: 'Suukër kàññ',
  },
  'Pulpe pure de pain de singe': {
    fr: 'Pulpe pure de pain de singe',
    en: 'Pure baobab fruit pulp',
    wo: 'Buyu gouye bu sell',
  },
  'Lait doux': {
    fr: 'Lait doux',
    en: 'Sweet milk',
    wo: 'Meew mu neex',
  },
  'Vanille': {
    fr: 'Vanille',
    en: 'Vanilla',
    wo: 'Vaniy',
  },
  'Pur jus d’ananas': {
    fr: 'Pur jus d’ananas',
    en: 'Pure pineapple juice',
    wo: 'Jus ananaas',
  },
  'Semoule de mil bio': {
    fr: 'Semoule de mil bio',
    en: 'Organic millet semolina',
    wo: 'Arawu dugub',
  },
  'Yaourt artisanal crémeux': {
    fr: 'Yaourt artisanal crémeux',
    en: 'Creamy artisanal yogurt',
    wo: 'Sow mu neex',
  },
  'Noix de muscade': {
    fr: 'Noix de muscade',
    en: 'Nutmeg',
    wo: 'Muskaad',
  },
  'Mangue fraîche': {
    fr: 'Mangue fraîche',
    en: 'Fresh mango',
    wo: 'Màngo bu bees',
  },
  'Papaye': {
    fr: 'Papaye',
    en: 'Papaya',
    wo: 'Popo',
  },
  'Ananas': {
    fr: 'Ananas',
    en: 'Pineapple',
    wo: 'Ananaas',
  },
  'Fruit de la passion': {
    fr: 'Fruit de la passion',
    en: 'Passion fruit',
    wo: 'Fwi de la pasiyoŋ',
  },
  'Chocolat noir 70%': {
    fr: 'Chocolat noir 70%',
    en: '70% Dark chocolate',
    wo: 'Sokola bu ñuul 70%',
  },
  'Glace vanille': {
    fr: 'Glace vanille',
    en: 'Vanilla ice cream',
    wo: 'Glas vaniy',
  },

  // Slogan
  'restaurant_slogan': {
    fr: 'Le goût du Sénégal, à chaque bouchée.',
    en: 'The taste of Senegal in every bite.',
    wo: 'Coféelu Senegaal ci bépp dëpp.',
  },
};

// ==========================================
// HELPER TRANSLATION FUNCTIONS
// ==========================================

export function getCategoryName(category: Category, lang: Language): string {
  if (!category) return '';
  const translation = CATEGORY_TRANSLATIONS[category.id];
  if (translation && translation[lang]) {
    return translation[lang];
  }
  return category.name;
}

export function getProductName(product: { id?: string; name: string }, lang: Language): string {
  if (!product) return '';
  if (product.id && PRODUCT_TRANSLATIONS[product.id]) {
    return PRODUCT_TRANSLATIONS[product.id].name[lang] || product.name;
  }
  return product.name;
}

export function getProductDescription(
  product: { id?: string; description?: string },
  lang: Language
): string {
  if (!product || !product.description) return '';
  if (product.id && PRODUCT_TRANSLATIONS[product.id]) {
    return PRODUCT_TRANSLATIONS[product.id].description[lang] || product.description;
  }
  return product.description;
}

export function getIngredientName(ingredient: string, lang: Language): string {
  if (!ingredient) return '';
  const match = TEXT_DICTIONARY[ingredient.trim()];
  if (match && match[lang]) {
    return match[lang];
  }
  return ingredient;
}

export function getOptionGroupName(groupName: string, lang: Language): string {
  if (!groupName) return '';
  const match = TEXT_DICTIONARY[groupName.trim()];
  if (match && match[lang]) {
    return match[lang];
  }
  return groupName;
}

export function getOptionItemName(itemName: string, lang: Language): string {
  if (!itemName) return '';
  const match = TEXT_DICTIONARY[itemName.trim()];
  if (match && match[lang]) {
    return match[lang];
  }
  return itemName;
}

export function getPromotionTitle(promo: { id?: string; title: string }, lang: Language): string {
  if (!promo) return '';
  if (promo.id === 'promo-burger') {
    return TRANSLATIONS[lang].promo1Title;
  }
  if (promo.id === 'promo-thieb') {
    return TRANSLATIONS[lang].promo2Title;
  }
  if (promo.id === 'promo-jus') {
    return TRANSLATIONS[lang].promo3Title;
  }
  if (promo.id === 'promo-alloco') {
    return TRANSLATIONS[lang].promo4Title;
  }
  return promo.title;
}

export function getRestaurantSlogan(lang: Language): string {
  return TEXT_DICTIONARY['restaurant_slogan'][lang] || 'Le goût du Sénégal, à chaque bouchée.';
}

export function useLanguage() {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('teranga_lang') as Language) || 'fr';
  });

  useEffect(() => {
    const handler = () => {
      const stored = (localStorage.getItem('teranga_lang') as Language) || 'fr';
      setLang(stored);
    };
    window.addEventListener('teranga_lang_change', handler);
    return () => window.removeEventListener('teranga_lang_change', handler);
  }, []);

  const changeLang = (newLang: Language) => {
    localStorage.setItem('teranga_lang', newLang);
    setLang(newLang);
    window.dispatchEvent(new Event('teranga_lang_change'));
  };

  return { lang, changeLang, t: TRANSLATIONS[lang] };
}
