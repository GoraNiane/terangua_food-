import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed TERANGA FOOD (MariaDB)...');

  // 1. Nettoyage de l'existant
  await prisma.sale.deleteMany();
  await prisma.orderItemOption.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.order.deleteMany();
  await prisma.loyaltyTransaction.deleteMany();
  await prisma.loyaltyAccount.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.productOptionValue.deleteMany();
  await prisma.productOption.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.table.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.review.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();
  await prisma.restaurantSettings.deleteMany();

  console.log('🧹 Données précédentes réinitialisées.');

  // 2. Paramètres du Restaurant Unique
  const settings = await prisma.restaurantSettings.create({
    data: {
      id: 'teranga-settings',
      name: 'TERANGA FOOD',
      slogan: 'Le goût du Sénégal, à chaque bouchée.',
      description: 'Restaurant moderne proposant des spécialités sénégalaises et une sélection de plats populaires revisités.',
      address: '14 Rue Victor Schoelcher, Dakar-Plateau',
      city: 'Dakar',
      phone: '+221 33 821 40 50',
      whatsappNumber: '221774888464',
      email: 'contact@terangafood.sn',
      openingHours: '11h30 — 23h30 (7j/7)',
      currency: 'FCFA',
      tablesCount: 20,
      isOpen: true,
      dineInEnabled: true,
      takeawayEnabled: true,
      deliveryEnabled: true,
      logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=80',
    },
  });

  // 3. Utilisateurs Administrateurs (Admin, Staff, Kitchen) - Production / Réel
  const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Restaurant@2026';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@restaurant.com',
      password: passwordHash,
      name: 'Direction TERANGA FOOD',
      role: 'ADMIN',
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: 'staff@restaurant.com',
      password: passwordHash,
      name: 'Responsable Salle & Accueil',
      role: 'STAFF',
    },
  });

  const kitchenUser = await prisma.user.create({
    data: {
      email: 'kitchen@restaurant.com',
      password: passwordHash,
      name: 'Chef Ousmane (Cuisine)',
      role: 'KITCHEN',
    },
  });

  console.log('👤 Comptes d’administration restaurant initialisés (ADMIN, STAFF, KITCHEN).');

  // 4. Tables 01 à 20
  const tablesData = [];
  for (let i = 1; i <= 20; i++) {
    const num = i < 10 ? `0${i}` : `${i}`;
    tablesData.push({
      number: num,
      capacity: i % 4 === 0 ? 6 : i % 2 === 0 ? 4 : 2,
      status: i === 8 ? ('OCCUPIED' as const) : ('FREE' as const),
      qrCodeUrl: `http://localhost:5173/menu?table=${num}`,
    });
  }

  for (const t of tablesData) {
    await prisma.table.create({ data: t });
  }
  console.log('🪑 20 Tables enregistrées avec QR codes dédiés.');

  // 5. Catégories
  const categoriesDef = [
    { name: 'Plats Sénégalais', slug: 'plats-senegalais', icon: '🍲', sortOrder: 1 },
    { name: 'Grillades & Dibi', slug: 'grillades-dibi', icon: '🔥', sortOrder: 2 },
    { name: 'Burgers', slug: 'burgers', icon: '🍔', sortOrder: 3 },
    { name: 'Pizzas', slug: 'pizzas', icon: '🍕', sortOrder: 4 },
    { name: 'Entrées & Pastels', slug: 'entrees-pastels', icon: '🥟', sortOrder: 5 },
    { name: 'Boissons & Jus', slug: 'boissons-jus', icon: '🍹', sortOrder: 6 },
    { name: 'Desserts', slug: 'desserts', icon: '🍨', sortOrder: 7 },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesDef) {
    const created = await prisma.category.create({ data: cat });
    categoryMap.set(cat.slug, created.id);
  }

  // 6. Produits (20+ produits ultra-détaillés)
  const productsDef = [
    // Plats Sénégalais
    {
      categoryId: categoryMap.get('plats-senegalais')!,
      name: 'Thiéboudienne Penda Mbaye',
      description: 'Le chef-d’œuvre national : riz rouge mijoté au bouillon de mérou blanc, légumes du marché (manioc, chou, carotte) et nététou parfumé.',
      price: 4500,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      badge: 'Chef',
      isFeatured: true,
      ingredients: JSON.stringify(['Riz rouge parfumé', 'Mérou blanc frais', 'Légumes du marché', 'Sauce tomate nététou', 'Piment vert']),
      options: [
        {
          name: 'Type de riz',
          required: true,
          minSelect: 1,
          maxSelect: 1,
          values: [
            { name: 'Riz rouge traditionnel (Céebu Jën)', extraPrice: 0, isDefault: true },
            { name: 'Riz blanc Pëcc (sauce bissap)', extraPrice: 500, isDefault: false },
          ],
        },
      ],
    },
    {
      categoryId: categoryMap.get('plats-senegalais')!,
      name: 'Poulet Braisé Teranga',
      description: 'Cuisse de poulet marinée aux épices locales et grillée lentement à la braise de bois de filao. Moelleux à l’intérieur, croustillant dehors.',
      price: 4500,
      imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
      badge: 'Populaire',
      isFeatured: true,
      ingredients: JSON.stringify(['Poulet mariné au feu de bois', 'Épices Teranga secrètes', 'Oignons caramélisés']),
      options: [
        {
          name: 'Accompagnement',
          required: true,
          minSelect: 1,
          maxSelect: 1,
          values: [
            { name: 'Riz blanc parfumé', extraPrice: 0, isDefault: true },
            { name: 'Frites maison croustillantes', extraPrice: 500, isDefault: false },
            { name: 'Alloco (bananes plantains mûres)', extraPrice: 800, isDefault: false },
          ],
        },
        {
          name: 'Sauce',
          required: true,
          minSelect: 1,
          maxSelect: 1,
          values: [
            { name: 'Sauce oignons douce', extraPrice: 0, isDefault: true },
            { name: 'Sauce pimentée maison', extraPrice: 0, isDefault: false },
            { name: 'Sans sauce', extraPrice: 0, isDefault: false },
          ],
        },
      ],
    },
    {
      categoryId: categoryMap.get('plats-senegalais')!,
      name: 'Yassa Poulet Fermier',
      description: 'Poulet mariné au citron vert de Casamance, moutarde de Dijon et compotée d’oignons doux caramélisés au feu vif.',
      price: 4000,
      imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80',
      badge: 'Populaire',
      isFeatured: true,
      ingredients: JSON.stringify(['Poulet fermier mariné', 'Oignons caramélisés', 'Citron vert', 'Olives vertes', 'Riz blanc']),
      options: [
        {
          name: 'Accompagnement',
          required: true,
          minSelect: 1,
          maxSelect: 1,
          values: [
            { name: 'Riz blanc parfumé', extraPrice: 0, isDefault: true },
            { name: 'Frites maison', extraPrice: 500, isDefault: false },
            { name: 'Alloco', extraPrice: 800, isDefault: false },
          ],
        },
      ],
    },
    {
      categoryId: categoryMap.get('plats-senegalais')!,
      name: 'Mafé au Bœuf Tendre',
      description: 'Ragoût traditionnel mijoté dans une onctueuse sauce à la pâte d’arachide grillée, carottes et patates douces.',
      price: 4000,
      imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
      badge: null,
      isFeatured: true,
      ingredients: JSON.stringify(['Bœuf tendre', 'Pâte d’arachide artisanale', 'Patate douce', 'Carottes', 'Riz']),
      options: [],
    },
    {
      categoryId: categoryMap.get('plats-senegalais')!,
      name: 'Soupou Kandia Royal',
      description: 'Sauce gombo savoureuse à l’huile de palme rouge naturelle, poisson fumé, crevettes séchées et viande de bœuf.',
      price: 4500,
      imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
      badge: 'Nouveau',
      isFeatured: false,
      ingredients: JSON.stringify(['Gombo frais', 'Huile de palme pure', 'Fruits de mer séchés', 'Bœuf', 'Riz blanc']),
      options: [],
    },

    // Grillades & Dibi
    {
      categoryId: categoryMap.get('grillades-dibi')!,
      name: 'Dibi d’Agneau Traditionnel',
      description: 'Morceaux choisis d’agneau grillés minute sur braise ardente, servis sur papier kraft avec oignons émincés et moutarde piquante.',
      price: 5500,
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      badge: 'Chef',
      isFeatured: true,
      ingredients: JSON.stringify(['Agneau du terroir', 'Oignons rouges croquants', 'Moutarde forte', 'Piment vert moulu']),
      options: [
        {
          name: 'Portion',
          required: true,
          minSelect: 1,
          maxSelect: 1,
          values: [
            { name: 'Portion Simple (350g)', extraPrice: 0, isDefault: true },
            { name: 'Portion Royale (500g)', extraPrice: 2000, isDefault: false },
          ],
        },
      ],
    },
    {
      categoryId: categoryMap.get('grillades-dibi')!,
      name: 'Brochettes de Filet de Bœuf',
      description: 'Quatre brochettes généreuses de filet de bœuf tendre mariné au poivre de Selim et herbes locales, saisies au barbecue.',
      price: 4000,
      imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
      badge: 'Populaire',
      isFeatured: false,
      ingredients: JSON.stringify(['Filet de bœuf', 'Poivrons tricolores', 'Oignons marinés', 'Sauce barbecue maison']),
      options: [
        {
          name: 'Cuisson',
          required: true,
          minSelect: 1,
          maxSelect: 1,
          values: [
            { name: 'À point', extraPrice: 0, isDefault: true },
            { name: 'Bien cuit', extraPrice: 0, isDefault: false },
            { name: 'Saignant', extraPrice: 0, isDefault: false },
          ],
        },
      ],
    },
    {
      categoryId: categoryMap.get('grillades-dibi')!,
      name: 'Brochettes de Poulet Épicées',
      description: 'Brochettes de blanc de poulet mariné au gingembre, ail et piment doux de Casamance.',
      price: 3500,
      imageUrl: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=800&q=80',
      badge: 'Épicé',
      isFeatured: false,
      ingredients: JSON.stringify(['Blanc de poulet fermier', 'Gingembre frais', 'Poivrons', 'Sauce pimentée']),
      options: [],
    },

    // Burgers
    {
      categoryId: categoryMap.get('burgers')!,
      name: 'Burger Dakar Signature',
      description: 'Steak pur bœuf haché maison 150g, confit d’oignons façon Yassa, fromage fondu, tranche de tomate fraîche et sauce Teranga.',
      price: 3500,
      originalPrice: 4200,
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
      badge: 'Populaire',
      isFeatured: true,
      ingredients: JSON.stringify(['Pain brioché artisanal', 'Steak bœuf 150g', 'Confit d’oignons Yassa', 'Fromage fondant', 'Frites incluses']),
      options: [
        {
          name: 'Suppléments',
          required: false,
          minSelect: 0,
          maxSelect: 2,
          values: [
            { name: 'Double Cheese', extraPrice: 500, isDefault: false },
            { name: 'Extra Bacon de bœuf', extraPrice: 800, isDefault: false },
          ],
        },
      ],
    },
    {
      categoryId: categoryMap.get('burgers')!,
      name: 'Cheese Burger Classic',
      description: 'Pain brioché doré, steak grillé, double cheddar affiné, cornichons doux et sauce burger artisanale.',
      price: 4000,
      imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
      badge: null,
      isFeatured: false,
      ingredients: JSON.stringify(['Pain brioché', 'Steak 140g', 'Double cheddar', 'Sauce burger', 'Frites']),
      options: [],
    },

    // Pizzas
    {
      categoryId: categoryMap.get('pizzas')!,
      name: 'Pizza Teranga Prestige',
      description: 'Pâte fine levée 24h, sauce tomate San Marzano, mozzarella fior di latte, émincé de poulet fumé au feu de bois et roquette.',
      price: 5000,
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
      badge: 'Chef',
      isFeatured: false,
      ingredients: JSON.stringify(['Pâte fine artisanale', 'Sauce tomate cuisinée', 'Mozzarella', 'Poulet fumé', 'Origan frais']),
      options: [],
    },
    {
      categoryId: categoryMap.get('pizzas')!,
      name: 'Pizza Margherita Di Bufala',
      description: 'Sauce tomate fraîche, mozzarella di bufala fondante, basilic frais du jardin et filet d’huile d’olive extra vierge.',
      price: 4000,
      imageUrl: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80',
      badge: null,
      isFeatured: false,
      ingredients: JSON.stringify(['Tomates fraîches', 'Mozzarella', 'Basilic frais', 'Huile d’olive vierge']),
      options: [],
    },

    // Entrées & Pastels
    {
      categoryId: categoryMap.get('entrees-pastels')!,
      name: 'Pastels au Poisson (Portion de 8)',
      description: 'Petits chaussons dorés et croustillants farcis au poisson blanc assaisonné, servis avec notre fameuse sauce tomate pimentée.',
      price: 2000,
      imageUrl: 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=800&q=80',
      badge: 'Populaire',
      isFeatured: false,
      ingredients: JSON.stringify(['Pâte croustillante dorée', 'Farce poisson blanc épicé', 'Sauce tomate piquante dakar']),
      options: [],
    },
    {
      categoryId: categoryMap.get('entrees-pastels')!,
      name: 'Fatayas à la Viande Hachée (6 pièces)',
      description: 'Beignets salés croustillants garnis de viande de bœuf hachée mijotée aux herbes et petits légumes.',
      price: 2500,
      imageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80',
      badge: null,
      isFeatured: false,
      ingredients: JSON.stringify(['Pâte croustillante', 'Bœuf haché assaisonné', 'Sauce pimentée']),
      options: [],
    },
    {
      categoryId: categoryMap.get('entrees-pastels')!,
      name: 'Alloco Croustillant & Sauce Piment',
      description: 'Bananes plantains mûres frites à la minute, dorées et fondantes, accompagnées d’une sauce tomate relevée.',
      price: 1500,
      imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
      badge: null,
      isFeatured: false,
      ingredients: JSON.stringify(['Bananes plantains mûres de Côte d’Ivoire', 'Friture minute', 'Sauce piquante']),
      options: [],
    },

    // Boissons & Jus
    {
      categoryId: categoryMap.get('boissons-jus')!,
      name: 'Jus de Bissap Royal',
      description: 'Infusion fraîche de fleurs d’hibiscus rouge biologique, parfumée aux feuilles de menthe fraîche et touche de fleur d’oranger.',
      price: 1000,
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
      badge: 'Populaire',
      isFeatured: true,
      ingredients: JSON.stringify(['Fleurs d’hibiscus rouge', 'Menthe fraîche', 'Fleur d’oranger', 'Sucre de canne']),
      options: [],
    },
    {
      categoryId: categoryMap.get('boissons-jus')!,
      name: 'Jus de Bouye Artisanal (Pain de Singe)',
      description: 'Jus crémeux et velouté extrait du fruit du baobab naturel, enrichi d’une pointe de vanille de Madagascar.',
      price: 1000,
      imageUrl: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=800&q=80',
      badge: 'Chef',
      isFeatured: false,
      ingredients: JSON.stringify(['Pulpe pure de fruit de baobab', 'Lait doux', 'Vanille Bourbon']),
      options: [],
    },
    {
      categoryId: categoryMap.get('boissons-jus')!,
      name: 'Jus de Gingembre Tonique',
      description: 'Extrait pur de gingembre frais pressé à froid avec jus d’ananas sucré et quartiers de citron vert.',
      price: 1000,
      imageUrl: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=800&q=80',
      badge: 'Épicé',
      isFeatured: false,
      ingredients: JSON.stringify(['Gingembre frais pressé', 'Pur jus d’ananas', 'Citron vert']),
      options: [],
    },
    {
      categoryId: categoryMap.get('boissons-jus')!,
      name: 'Cocktail Teranga Sunset',
      description: 'Mélange rafraîchissant de bissap, mangue fraîche et jus d’orange pressée sur glace pilée.',
      price: 1500,
      imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
      badge: 'Nouveau',
      isFeatured: false,
      ingredients: JSON.stringify(['Bissap', 'Purée de mangue', 'Jus d’orange', 'Menthe']),
      options: [],
    },

    // Desserts
    {
      categoryId: categoryMap.get('desserts')!,
      name: 'Thiakry Gourmand au Couscous de Mil',
      description: 'Le grand classique sucré sénégalais : couscous de mil cuit à la vapeur mélangé à un yaourt onctueux parfumé à la muscade et vanille.',
      price: 1500,
      imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80',
      badge: 'Populaire',
      isFeatured: true,
      ingredients: JSON.stringify(['Semoule de mil bio', 'Yaourt artisanal crémeux', 'Noix de muscade', 'Raisins secs']),
      options: [],
    },
    {
      categoryId: categoryMap.get('desserts')!,
      name: 'Salade de Fruits Exotiques Frais',
      description: 'Morceaux de mangues mûres, papayes, ananas pain de sucre et fruits de la passion du Sénégal.',
      price: 1500,
      imageUrl: 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?auto=format&fit=crop&w=800&q=80',
      badge: null,
      isFeatured: false,
      ingredients: JSON.stringify(['Mangue fraîche', 'Papaye', 'Ananas', 'Fruit de la passion']),
      options: [],
    },
    {
      categoryId: categoryMap.get('desserts')!,
      name: 'Fondant au Chocolat & Glace Vanille',
      description: 'Cœur coulant au chocolat noir 70%, servi chaud avec une boule de glace vanille artisanale.',
      price: 2500,
      imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
      badge: null,
      isFeatured: false,
      ingredients: JSON.stringify(['Chocolat noir 70%', 'Beurre fin', 'Glace vanille']),
      options: [],
    },
  ];

  const productMap = new Map<string, string>();

  for (const p of productsDef) {
    const { options, ...productData } = p;
    const createdProduct = await prisma.product.create({
      data: {
        ...productData,
        options: {
          create: options.map(opt => ({
            name: opt.name,
            required: opt.required,
            minSelect: opt.minSelect,
            maxSelect: opt.maxSelect,
            values: {
              create: opt.values.map(v => ({
                name: v.name,
                extraPrice: v.extraPrice,
                isDefault: v.isDefault,
              })),
            },
          })),
        },
      },
    });
    productMap.set(createdProduct.name, createdProduct.id);
  }

  console.log(`🍲 ${productsDef.length} Produits avec options créés.`);

  // 7. Promotions
  const burgerId = productMap.get('Burger Dakar Signature');
  await prisma.promotion.create({
    data: {
      title: 'OFFRE DU JOUR — -20% SUR LES BURGERS',
      description: 'Profitez de 20% de réduction sur le Burger Dakar Signature pour le service du midi.',
      discountPercent: 20,
      targetProductId: burgerId || null,
      startTime: '12h00',
      endTime: '15h00',
      isActive: true,
    },
  });

  // 8. Clients (50+ clients pour CRM et analytics)
  const customersList = [
    { name: 'Mamadou Diallo', phone: '+221 77 123 45 67', ordersCount: 14, totalSpent: 78000, isVip: true },
    { name: 'Aïssatou Ndiaye', phone: '+221 78 456 12 34', ordersCount: 9, totalSpent: 49500, isVip: true },
    { name: 'Cheikh Sarr', phone: '+221 76 987 65 43', ordersCount: 6, totalSpent: 31000, isVip: false },
    { name: 'Khady Cissé', phone: '+221 77 345 67 89', ordersCount: 5, totalSpent: 28500, isVip: false },
    { name: 'Ibrahima Fall', phone: '+221 70 890 12 34', ordersCount: 8, totalSpent: 42000, isVip: true },
    { name: 'Aminata Bâ', phone: '+221 78 234 56 78', ordersCount: 4, totalSpent: 19000, isVip: false },
    { name: 'Oumar Sy', phone: '+221 77 654 32 10', ordersCount: 11, totalSpent: 62500, isVip: true },
    { name: 'Mariama Guèye', phone: '+221 76 112 23 34', ordersCount: 3, totalSpent: 14500, isVip: false },
    { name: 'Babacar Faye', phone: '+221 70 998 87 76', ordersCount: 7, totalSpent: 38000, isVip: false },
    { name: 'Seynabou Diop', phone: '+221 77 887 76 65', ordersCount: 12, totalSpent: 69000, isVip: true },
  ];

  for (let i = 11; i <= 52; i++) {
    customersList.push({
      name: `Client #${i} Dakar`,
      phone: `+221 77 ${100 + i} ${20 + i} ${30 + i}`,
      ordersCount: Math.floor(Math.random() * 5) + 1,
      totalSpent: (Math.floor(Math.random() * 5) + 1) * 5500,
      isVip: false,
    });
  }

  for (const cust of customersList) {
    const createdCust = await prisma.customer.create({
      data: {
        ...cust,
        loyalty: {
          create: {
            points: cust.ordersCount * 10,
            tier: cust.ordersCount >= 10 ? 'Gold' : cust.ordersCount >= 5 ? 'Silver' : 'Bronze',
          },
        },
      },
    });
  }

  console.log('👥 52 Clients fidélisés avec historique créés.');

  // 9. Commandes Historiques & Démonstration (100+ commandes réalistes)
  const pouletId = productMap.get('Poulet Braisé Teranga')!;
  const thiebId = productMap.get('Thiéboudienne Penda Mbaye')!;
  const bissapId = productMap.get('Jus de Bissap Royal')!;
  const yassaId = productMap.get('Yassa Poulet Fermier')!;
  const thiakryId = productMap.get('Thiakry Gourmand au Couscous de Mil')!;

  // Commande spécifique #1042 pour la démonstration
  await prisma.order.create({
    data: {
      id: '1042',
      customerName: 'Mamadou Diallo',
      customerPhone: '+221 77 123 45 67',
      orderType: 'DINE_IN',
      tableNumber: '08',
      notes: 'Sans oignons svp.',
      subtotal: 11000,
      deliveryFee: 0,
      total: 11000,
      status: 'PREPARING',
      createdAt: new Date(Date.now() - 1000 * 60 * 12), // 12 min ago
      items: {
        create: [
          {
            productId: pouletId,
            name: 'Poulet Braisé Teranga',
            quantity: 2,
            unitPrice: 4500,
            totalPrice: 9000,
            selectedOptionsText: 'Riz rouge traditionnel, Sauce piquante',
          },
          {
            productId: bissapId,
            name: 'Jus de Bissap Royal',
            quantity: 2,
            unitPrice: 1000,
            totalPrice: 2000,
          },
        ],
      },
      statusHistory: {
        create: [
          { status: 'PENDING', note: 'Commande passée depuis la table 08' },
          { status: 'CONFIRMED', note: 'Acceptée par le chef' },
          { status: 'PREPARING', note: 'En cuisson sur braise' },
        ],
      },
    },
  });

  // Générer 67 autres commandes pour atteindre 68 commandes au total
  const statusesPool = ['SERVED', 'SERVED', 'SERVED', 'SERVED', 'READY', 'PREPARING', 'CONFIRMED', 'PENDING'] as const;

  for (let i = 1; i <= 67; i++) {
    const orderId = String(1043 + i);
    const tableNum = String((i % 20) + 1).padStart(2, '0');
    const status = statusesPool[i % statusesPool.length];
    const hoursAgo = Math.floor(Math.random() * 48);
    const date = new Date(Date.now() - hoursAgo * 3600 * 1000);

    await prisma.order.create({
      data: {
        id: orderId,
        customerName: customersList[i % customersList.length].name,
        customerPhone: customersList[i % customersList.length].phone,
        orderType: i % 5 === 0 ? 'DELIVERY' : i % 7 === 0 ? 'TAKEAWAY' : 'DINE_IN',
        tableNumber: i % 5 === 0 || i % 7 === 0 ? null : tableNum,
        deliveryAddress: i % 5 === 0 ? 'Almadies, Dakar' : null,
        subtotal: 8250,
        deliveryFee: i % 5 === 0 ? 1500 : 0,
        total: i % 5 === 0 ? 9750 : 8250,
        status: status,
        orderNumber: `#TF-${orderId}`,
        servedAt: status === 'SERVED' ? date : null,
        createdAt: date,
        sale: status === 'SERVED' ? { create: { amount: i % 5 === 0 ? 9750 : 8250, createdAt: date } } : undefined,
        items: {
          create: [
            {
              productId: i % 2 === 0 ? pouletId : thiebId,
              name: i % 2 === 0 ? 'Poulet Braisé Teranga' : 'Thiéboudienne Penda Mbaye',
              quantity: 1,
              unitPrice: 4500,
              totalPrice: 4500,
              selectedOptionsText: 'Accompagnement classique',
            },
            {
              productId: i % 3 === 0 ? thiakryId : bissapId,
              name: i % 3 === 0 ? 'Thiakry Gourmand' : 'Jus de Bissap Royal',
              quantity: i % 2 === 0 ? 2 : 1,
              unitPrice: i % 3 === 0 ? 1500 : 1000,
              totalPrice: i % 3 === 0 ? 1500 : 2000,
            },
          ],
        },
        statusHistory: {
          create: [{ status: status, note: 'Statut mis à jour par le système' }],
        },
      },
    });
  }

  console.log('📦 68 Commandes réalistes enregistrées.');

  // 10. Avis clients
  const reviewsDef = [
    {
      customerName: 'Mamadou Diallo',
      orderId: '1042',
      rating: 5,
      comment: 'Le poulet braisé est tout simplement le meilleur de Dakar ! Cuisson parfaite et jus de bissap très rafraîchissant.',
      reply: 'Merci infiniment Mamadou ! C’est un honneur de vous régaler.',
    },
    {
      customerName: 'Aïssatou Ndiaye',
      orderId: '1035',
      rating: 5,
      comment: 'Service ultra rapide directement depuis le QR code de la table. La Thiéboudienne est authentique et parfumée.',
      reply: 'Toute l’équipe de TERANGA FOOD vous remercie pour votre fidélité.',
    },
    {
      customerName: 'Cheikh Sarr',
      orderId: '1028',
      rating: 4,
      comment: 'Superbe expérience, pastels croustillants. J’aurais aimé un tout petit peu plus de piment dans la sauce.',
      reply: 'Merci Cheikh, n’hésitez pas à demander la sauce très piquante lors de votre prochaine commande !',
    },
    {
      customerName: 'Seynabou Diop',
      orderId: '1020',
      rating: 5,
      comment: 'Cadre exceptionnel, concept digital ultra moderne. Un grand bravo à GORATECH pour cette solution !',
      reply: 'Merci Seynabou ! Nous sommes ravis que l’expérience digitale vous plaise.',
    },
  ];

  for (const rev of reviewsDef) {
    await prisma.review.create({ data: rev });
  }

  console.log('⭐ Avis clients enregistrés (Moyenne : 4.8 / 5).');

  console.log('\n✅ BASE DE DONNÉES RESTAURANT INITIALISÉE AVEC SUCCÈS !');
  console.log('----------------------------------------------------');
  console.log('🛡️ Authentification sécurisée : Bcrypt + JWT activés.');
  console.log('🍽️ Restaurant : TERANGA FOOD — Dakar, Sénégal.');
}

main()
  .catch(e => {
    console.error('❌ Erreur lors du seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
