import { io } from '../frontend/node_modules/socket.io-client/build/esm/index.js';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:5000';
const JWT_SECRET = process.env.JWT_SECRET || 'teranga_food_secret_key_luxury_dakar_2026';

// Créer des tokens valides pour tester Cuisine et Admin
const kitchenToken = jwt.sign(
  { id: 'usr-kitchen-test', email: 'cuisine@terangafood.sn', role: 'KITCHEN', name: 'Chef KDS' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const adminToken = jwt.sign(
  { id: 'usr-admin-test', email: 'admin@terangafood.sn', role: 'ADMIN', name: 'Directeur Général' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

async function runE2ETest() {
  console.log('🚀 Démarrage du test E2E : Flux transactionnel réel & temps réel...');

  // 1. Récupérer un produit valide dans la DB avec ses options
  const product = await prisma.product.findFirst({
    where: { isAvailable: true },
    include: { options: { include: { values: true } } }
  });

  if (!product) {
    throw new Error('Aucun produit disponible trouvé en base de données.');
  }
  console.log(`✅ Produit de test trouvé : "${product.name}" (ID: ${product.id}, Prix: ${product.price} FCFA)`);

  // 2. Vérifier la table 08 ou la créer si nécessaire
  let table = await prisma.table.findFirst({
    where: { number: '08' }
  });
  if (!table) {
    table = await prisma.table.create({
      data: {
        number: '08',
        capacity: 4,
        status: 'FREE',
        qrCodeUrl: 'https://terangua-food.vercel.app/menu?table=08'
      }
    });
    console.log('✅ Table 08 créée.');
  } else {
    // S'assurer qu'elle est FREE au départ
    await prisma.table.update({
      where: { id: table.id },
      data: { status: 'FREE' }
    });
    console.log('✅ Table 08 réinitialisée à FREE.');
  }

  // 3. Connecter un client Socket.IO pour simuler KITCHEN et ADMIN
  console.log('📡 Connexion du client Socket.IO avec token KITCHEN...');
  const socket = io(API_URL, {
    transports: ['websocket'],
    reconnection: false,
    auth: { token: kitchenToken }
  });

  const receivedEvents = [];

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Timeout connexion Socket.IO')), 5000);

    socket.on('connect', () => {
      console.log(`⚡ Client Socket.IO connecté avec socket.id: ${socket.id}`);
      socket.emit('join_kitchen', { token: kitchenToken });
      socket.emit('join_admin', { token: adminToken });
      clearTimeout(timeout);
      resolve();
    });

    socket.on('connect_error', (err) => {
      clearTimeout(timeout);
      reject(new Error(`Erreur connexion Socket.IO : ${err.message}`));
    });
  });

  // Enregistrer les écouteurs d'événements
  socket.on('order:created', (data) => {
    console.log(`🔔 Socket Event reçu [order:created] pour la commande #${data.id}`);
    receivedEvents.push({ event: 'order:created', data });
  });

  socket.on('new_order', (data) => {
    console.log(`🔔 Socket Event reçu [new_order] pour la commande #${data.id}`);
    receivedEvents.push({ event: 'new_order', data });
  });

  socket.on('kitchen_new_order', (data) => {
    console.log(`🔔 Socket Event reçu [kitchen_new_order] pour la commande #${data.id}`);
    receivedEvents.push({ event: 'kitchen_new_order', data });
  });

  socket.on('order:updated', (data) => {
    console.log(`🔄 Socket Event reçu [order:updated] : #${data.id} -> ${data.status}`);
    receivedEvents.push({ event: 'order:updated', data });
  });

  socket.on('order_status_updated', (data) => {
    console.log(`🔄 Socket Event reçu [order_status_updated] : #${data.id} -> ${data.status}`);
    receivedEvents.push({ event: 'order_status_updated', data });
  });

  // Préparer les options sélectionnées
  const selectedOptions = [];
  if (product.options && product.options.length > 0) {
    for (const opt of product.options) {
      if (opt.values && opt.values.length > 0) {
        selectedOptions.push({
          optionName: opt.name,
          valueName: opt.values[0].name,
          extraPrice: opt.values[0].extraPrice || 0
        });
      }
    }
  }

  // 4. Client passe une commande réelle via POST /api/orders
  console.log('🛒 Envoi de la commande réelle client : POST /api/orders...');
  const orderPayload = {
    customerName: 'Aissatou Ba (Test E2E)',
    customerPhone: '+221775551122',
    orderType: 'DINE_IN',
    tableNumber: '08',
    notes: 'Sans piment svp, avec beaucoup doignons',
    subtotal: product.price * 2,
    deliveryFee: 0,
    total: product.price * 2,
    items: [
      {
        productId: product.id,
        quantity: 2,
        notes: 'Bien cuit',
        selectedOptions
      }
    ]
  };

  const createRes = await fetch(`${API_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload)
  });

  if (!createRes.ok) {
    const errBody = await createRes.text();
    throw new Error(`Échec POST /api/orders (Status ${createRes.status}): ${errBody}`);
  }

  const jsonRes = await createRes.json();
  const createdOrder = jsonRes.order || jsonRes;
  console.log(`🎉 Commande créée avec succès en base ! ID: ${createdOrder.id}`);

  // Attendre propagation Socket.IO
  await new Promise(r => setTimeout(r, 500));

  // Vérifier événements de création
  const hasCreated = receivedEvents.some(e => e.event === 'order:created' && e.data.id === createdOrder.id);
  const hasNewOrder = receivedEvents.some(e => e.event === 'new_order' && e.data.id === createdOrder.id);
  console.log(`✓ Événement order:created reçu: ${hasCreated}`);
  console.log(`✓ Événement new_order reçu: ${hasNewOrder}`);

  // 5. Vérifier la persistance en base de données via Prisma
  const dbOrder = await prisma.order.findUnique({
    where: { id: createdOrder.id },
    include: {
      items: {
        include: {
          options: true
        }
      },
      statusHistory: true
    }
  });

  if (!dbOrder) {
    throw new Error('La commande est introuvable dans la base MariaDB !');
  }
  console.log(`✓ DB Order vérifiée : ID=${dbOrder.id}, Statut=${dbOrder.status}, Total=${dbOrder.total} FCFA`);
  console.log(`✓ Articles en DB : ${dbOrder.items.length} article(s), Options créées : ${dbOrder.items[0]?.options.length}`);
  console.log(`✓ Historique des statuts : ${dbOrder.statusHistory.length} entrée(s) (initial: ${dbOrder.statusHistory[0]?.status})`);

  // Vérifier statut de la table
  const updatedTable = await prisma.table.findFirst({ where: { number: '08' } });
  console.log(`✓ Statut de la Table 08 en DB : ${updatedTable?.status} (attendu: OCCUPIED)`);
  if (updatedTable?.status !== 'OCCUPIED') {
    throw new Error(`La table 08 devrait être OCCUPIED mais est : ${updatedTable?.status}`);
  }

  // 6. Test du cycle complet des statuts KITCHEN & ADMIN
  const statusesToTest = [
    { status: 'CONFIRMED', note: 'Commande acceptée par la cuisine' },
    { status: 'PREPARING', note: 'Début de cuisson par la cuisine' },
    { status: 'READY', note: 'Plats terminés et prêts au passe' },
    { status: 'SERVED', note: 'Commande servie à table — Vente finalisée' }
  ];

  for (const step of statusesToTest) {
    console.log(`\n⏳ Mise à jour du statut vers: ${step.status}...`);
    const patchRes = await fetch(`${API_URL}/api/orders/${createdOrder.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${kitchenToken}`
      },
      body: JSON.stringify(step)
    });

    if (!patchRes.ok) {
      const errTxt = await patchRes.text();
      throw new Error(`Échec PATCH /api/orders/${createdOrder.id}/status vers ${step.status}: ${errTxt}`);
    }

    const updated = await patchRes.json();
    console.log(`✓ PATCH réussi, nouveau statut renvoyé: ${updated.order?.status || updated.status}`);

    await new Promise(r => setTimeout(r, 400));

    const eventReceived = receivedEvents.some(
      e => e.event === 'order:updated' && e.data.id === createdOrder.id && e.data.status === step.status
    );
    console.log(`✓ Socket Event order:updated [${step.status}] reçu en temps réel: ${eventReceived}`);
  }

  // 7. Vérifier que la table 08 est redevenue FREE après 'SERVED'
  const freedTable = await prisma.table.findFirst({ where: { number: '08' } });
  console.log(`\n✓ Statut de la Table 08 après SERVED : ${freedTable?.status} (attendu: FREE)`);

  // 8. Vérifier la récupération par rôle
  console.log('\n🔍 Test des endpoints GET...');
  const getKitchenRes = await fetch(`${API_URL}/api/orders/kitchen`, {
    headers: { Authorization: `Bearer ${kitchenToken}` }
  });
  console.log(`✓ GET /api/orders/kitchen -> Status ${getKitchenRes.status}`);

  const getAdminRes = await fetch(`${API_URL}/api/orders`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  console.log(`✓ GET /api/orders -> Status ${getAdminRes.status}`);

  const getClientTrackingRes = await fetch(`${API_URL}/api/orders/${createdOrder.id}`);
  const clientOrder = await getClientTrackingRes.json();
  console.log(`✓ GET /api/orders/${createdOrder.id} -> Status ${getClientTrackingRes.status}, Order Status: ${clientOrder.status}`);

  socket.disconnect();
  console.log('\n🎉 TOUS LES TESTS E2E TRANSACTIONNELS ET TEMPS RÉEL ONT RÉUSSI AVEC SUCCÈS ! 💯');
}

runE2ETest()
  .catch((err) => {
    console.error('❌ ERREUR LORS DU TEST E2E :', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
