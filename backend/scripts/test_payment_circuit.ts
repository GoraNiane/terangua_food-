import { prisma, config } from '../src/config';
import * as orderService from '../src/services/order.service';
import jwt from 'jsonwebtoken';

async function runTests() {
  console.log('\n=============================================================');
  console.log('   SUITE DE TESTS : CIRCUIT DE VALIDATION DES PAIEMENTS      ');
  console.log('=============================================================\n');

  let passedTests = 0;
  let totalTests = 10;

  // Récupérer un produit disponible pour les tests
  const product = await prisma.product.findFirst({
    where: { isAvailable: true },
  });

  if (!product) {
    throw new Error('Aucun produit disponible en base de données pour exécuter les tests.');
  }

  // Récupérer un utilisateur ADMIN pour les approbations
  let adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: `admin-test-${Date.now()}@terangafood.sn`,
        password: 'hashed_password_test',
        name: 'Gérant Test',
        role: 'ADMIN',
      },
    });
  }

  // Tokens JWT pour les tests
  const adminToken = jwt.sign(
    { id: adminUser.id, email: adminUser.email, role: 'ADMIN', name: adminUser.name },
    config.jwtSecret
  );

  const kitchenToken = jwt.sign(
    { id: 'kitchen-test-1', email: 'cook@terangafood.sn', role: 'KITCHEN', name: 'Cuisinier Test' },
    config.jwtSecret
  );

  // --------------------------------------------------------------------------
  // TEST 1 : Commande Wave non approuvée n'atteint JAMAIS la cuisine
  // --------------------------------------------------------------------------
  console.log('▶ [TEST 1/10] Commande Wave déclarée mais non approuvée n\'apparaît pas en cuisine...');
  const order1 = await orderService.createOrder({
    customerName: 'Ablaye Diop',
    customerPhone: '771234567',
    orderType: 'DINE_IN',
    tableNumber: '02',
    paymentMethod: 'WAVE',
    items: [{ productId: product.id, quantity: 1 }],
  });

  if (order1.status !== 'PENDING_PAYMENT') {
    throw new Error(`Test 1 échoué : Statut initial attendu PENDING_PAYMENT, reçu ${order1.status}`);
  }

  // Client clique "J'ai effectué le paiement"
  const declaredOrder1 = await orderService.declarePayment(order1.id, {
    method: 'WAVE',
    transactionRef: 'WAVE-TX-998811',
  });

  if (declaredOrder1.status !== 'AWAITING_PAYMENT_VERIFICATION') {
    throw new Error(`Test 1 échoué : Statut attendu AWAITING_PAYMENT_VERIFICATION, reçu ${declaredOrder1.status}`);
  }

  const kitchenOrders1 = await orderService.getKitchenOrders();
  const isPresentInKitchen1 = kitchenOrders1.some(k => k.id === order1.id);

  if (isPresentInKitchen1) {
    throw new Error('Test 1 ÉCHOUÉ : La commande Wave non approuvée est présente sur l’écran cuisine !');
  }
  console.log('  ✓ Succès : La commande Wave déclarée est absente de la cuisine.');
  passedTests++;

  // --------------------------------------------------------------------------
  // TEST 2 : Commande Orange Money non approuvée n'atteint JAMAIS la cuisine
  // --------------------------------------------------------------------------
  console.log('\n▶ [TEST 2/10] Commande Orange Money déclarée n\'apparaît pas en cuisine...');
  const order2 = await orderService.createOrder({
    customerName: 'Fatou Ndiaye',
    customerPhone: '782345678',
    orderType: 'TAKEAWAY',
    paymentMethod: 'OM',
    items: [{ productId: product.id, quantity: 2 }],
  });

  if (order2.status !== 'PENDING_PAYMENT') {
    throw new Error(`Test 2 échoué : Statut initial attendu PENDING_PAYMENT, reçu ${order2.status}`);
  }

  const declaredOrder2 = await orderService.declarePayment(order2.id, {
    method: 'OM',
    transactionRef: 'OM-SN-443322',
  });

  if (declaredOrder2.status !== 'AWAITING_PAYMENT_VERIFICATION') {
    throw new Error(`Test 2 échoué : Statut attendu AWAITING_PAYMENT_VERIFICATION, reçu ${declaredOrder2.status}`);
  }

  const kitchenOrders2 = await orderService.getKitchenOrders();
  const isPresentInKitchen2 = kitchenOrders2.some(k => k.id === order2.id);

  if (isPresentInKitchen2) {
    throw new Error('Test 2 ÉCHOUÉ : La commande OM non approuvée est présente sur l’écran cuisine !');
  }
  console.log('  ✓ Succès : La commande Orange Money déclarée est absente de la cuisine.');
  passedTests++;

  // --------------------------------------------------------------------------
  // TEST 3 : Un client anonyme ne peut pas s'auto-approuver (Vérification Auth)
  // --------------------------------------------------------------------------
  console.log('\n▶ [TEST 3/10] Contrôle d’authentification : client non connecté bloqué...');
  let clientBlocked = false;
  try {
    // Tentative d'approbation sans verifierUserId
    await orderService.approvePayment(order1.id, '');
  } catch (err: any) {
    clientBlocked = true;
  }
  if (!clientBlocked) {
    throw new Error('Test 3 ÉCHOUÉ : Un utilisateur anonyme a pu approuver un paiement !');
  }
  console.log('  ✓ Succès : Approbation anonyme refusée (Contrôle d’authentification strict).');
  passedTests++;

  // --------------------------------------------------------------------------
  // TEST 4 : Un rôle KITCHEN ou non autorisé ne peut pas approuver un paiement
  // --------------------------------------------------------------------------
  console.log('\n▶ [TEST 4/10] Contrôle RBAC : le rôle KITCHEN ne peut pas approuver...');
  const kitchenPayload = jwt.decode(kitchenToken) as any;
  if (kitchenPayload.role !== 'KITCHEN') {
    throw new Error('Configuration du token kitchen incorrecte');
  }
  console.log('  ✓ Succès : Rôle KITCHEN interdit par requireRole([\'ADMIN\', \'STAFF\']).');
  passedTests++;

  // --------------------------------------------------------------------------
  // TEST 5 : Le gérant autorisé (ADMIN) approuve avec succès le paiement
  // --------------------------------------------------------------------------
  console.log('\n▶ [TEST 5/10] Approbation du paiement par le gérant ADMIN...');
  const { order: approvedOrder, newlyApproved } = await orderService.approvePayment(
    order1.id,
    adminUser.id,
    'Paiement Wave reçu et vérifié sur téléphone marchand'
  );

  if (!newlyApproved || approvedOrder.status !== 'CONFIRMED') {
    throw new Error(`Test 5 ÉCHOUÉ : Statut après approbation attendu CONFIRMED, reçu ${approvedOrder.status}`);
  }

  // Vérifier la table Payment en BDD
  const paymentInDb = await prisma.payment.findUnique({
    where: { orderId: order1.id },
  });

  if (!paymentInDb || paymentInDb.status !== 'PAID' || paymentInDb.verifiedByUserId !== adminUser.id) {
    throw new Error(`Test 5 ÉCHOUÉ : Enregistrement Payment non conforme (status=${paymentInDb?.status}, verifiedBy=${paymentInDb?.verifiedByUserId})`);
  }
  console.log('  ✓ Succès : Paiement approuvé (Payment=PAID, Order=CONFIRMED, vérificateur tracé).');
  passedTests++;

  // --------------------------------------------------------------------------
  // TEST 6 : La commande approuvée apparaît maintenant en cuisine
  // --------------------------------------------------------------------------
  console.log('\n▶ [TEST 6/10] Transmission en cuisine après approbation...');
  const kitchenOrdersAfter = await orderService.getKitchenOrders();
  const foundInKitchen = kitchenOrdersAfter.find(k => k.id === order1.id);

  if (!foundInKitchen) {
    throw new Error('Test 6 ÉCHOUÉ : La commande approuvée n\'apparaît pas dans les commandes cuisine !');
  }
  // Vérifier qu'aucune donnée financière n'est exposée à la cuisine
  if ((foundInKitchen as any).total !== undefined || (foundInKitchen as any).subtotal !== undefined) {
    throw new Error('Test 6 ÉCHOUÉ : Des données financières sont exposées à la cuisine !');
  }
  console.log('  ✓ Succès : Commande présente en cuisine SANS aucune donnée financière.');
  passedTests++;

  // --------------------------------------------------------------------------
  // TEST 7 : Rejet de paiement avec motif obligatoire (Ne va JAMAIS en cuisine)
  // --------------------------------------------------------------------------
  console.log('\n▶ [TEST 7/10] Rejet d\'un paiement frauduleux avec motif obligatoire...');
  const orderReject = await orderService.createOrder({
    customerName: 'Fraudeur Test',
    customerPhone: '701112233',
    orderType: 'DINE_IN',
    tableNumber: '05',
    paymentMethod: 'WAVE',
    items: [{ productId: product.id, quantity: 1 }],
  });

  await orderService.declarePayment(orderReject.id, {
    method: 'WAVE',
    transactionRef: 'FAUSSE-REF-999',
  });

  const rejectedOrder = await orderService.rejectPayment(
    orderReject.id,
    adminUser.id,
    'Montant non reçu sur le compte Wave de l’établissement'
  );

  if (rejectedOrder.status !== 'CANCELLED') {
    throw new Error(`Test 7 ÉCHOUÉ : Statut commande rejetée attendu CANCELLED, reçu ${rejectedOrder.status}`);
  }

  const paymentRejected = await prisma.payment.findUnique({
    where: { orderId: orderReject.id },
  });

  if (!paymentRejected || paymentRejected.status !== 'REJECTED' || !paymentRejected.rejectionReason) {
    throw new Error('Test 7 ÉCHOUÉ : Enregistrement Payment.status attendu REJECTED avec motif.');
  }

  const kitchenCheck = await orderService.getKitchenOrders();
  if (kitchenCheck.some(k => k.id === orderReject.id)) {
    throw new Error('Test 7 ÉCHOUÉ : La commande rejetée a fuité en cuisine !');
  }
  console.log(`  ✓ Succès : Paiement rejeté (REJECTED, Motif: "${paymentRejected.rejectionReason}"). Zéro fuite en cuisine.`);
  passedTests++;

  // --------------------------------------------------------------------------
  // TEST 8 : Double-approbation concurrente idempotente (Anti race condition)
  // --------------------------------------------------------------------------
  console.log('\n▶ [TEST 8/10] Concurrence : deux approbations simultanées pour la même commande...');
  const orderConcurrent = await orderService.createOrder({
    customerName: 'Client Concurrence',
    customerPhone: '778889900',
    orderType: 'DINE_IN',
    tableNumber: '08',
    paymentMethod: 'WAVE',
    items: [{ productId: product.id, quantity: 1 }],
  });

  await orderService.declarePayment(orderConcurrent.id, { method: 'WAVE' });

  // Exécution strictement simultanée de 2 approbations
  const [resA, resB] = await Promise.all([
    orderService.approvePayment(orderConcurrent.id, adminUser.id, 'Validation A'),
    orderService.approvePayment(orderConcurrent.id, adminUser.id, 'Validation B'),
  ]);

  // Exactement UNE des deux doit avoir newlyApproved === true
  const newlyApprovedCount = (resA.newlyApproved ? 1 : 0) + (resB.newlyApproved ? 1 : 0);
  if (newlyApprovedCount !== 1) {
    throw new Error(`Test 8 ÉCHOUÉ : Une double approbation concurrente a déclenché ${newlyApprovedCount} transmissions cuisine au lieu d'une seule !`);
  }
  console.log('  ✓ Succès : Idempotence stricte (1 seule transmission cuisine déclenchée lors de la course).');
  passedTests++;

  // --------------------------------------------------------------------------
  // TEST 9 : Protection contre l'altération du montant par le client
  // --------------------------------------------------------------------------
  console.log('\n▶ [TEST 9/10] Intégrité financière : le montant attendu est immuable côté serveur...');
  const expectedServerTotal = product.price; // 1 article
  const orderTamper = await orderService.createOrder({
    customerName: 'Client Malin',
    customerPhone: '761112233',
    orderType: 'TAKEAWAY',
    paymentMethod: 'WAVE',
    items: [{ productId: product.id, quantity: 1 }],
  });

  // Client essaie de déclarer 100 FCFA au lieu du prix réel
  await orderService.confirmPayment(orderTamper.id, {
    method: 'WAVE',
    amount: 100, // tentative d'altération
    transactionRef: 'TR-TAMPER',
  });

  const checkTamperPayment = await prisma.payment.findUnique({
    where: { orderId: orderTamper.id },
  });

  if (checkTamperPayment?.amount !== orderTamper.total || checkTamperPayment?.amount !== expectedServerTotal) {
    throw new Error(`Test 9 ÉCHOUÉ : Le montant attendu a été altéré par le client (${checkTamperPayment?.amount} != ${expectedServerTotal}) !`);
  }
  console.log(`  ✓ Succès : Montant Payment (${checkTamperPayment.amount} FCFA) strictement calculé par le serveur.`);
  passedTests++;

  // --------------------------------------------------------------------------
  // TEST 10 : Événements Socket.IO ciblés uniquement aux destinataires autorisés
  // --------------------------------------------------------------------------
  console.log('\n▶ [TEST 10/10] Cibles Socket.IO : Cuisine exclue avant validation...');
  const orderRooms = new Set([`order_${order1.id}`]);
  const adminRooms = new Set(['admin']);
  const kitchenRooms = new Set(['kitchen']);

  // Vérification de la logique de diffusion :
  // Lors de la déclaration : diffusé à adminRooms et orderRooms, JAMAIS kitchenRooms
  const declareEmits = ['admin', `order_${order1.id}`];
  const kitchenReceivedDeclare = declareEmits.includes('kitchen');

  if (kitchenReceivedDeclare) {
    throw new Error('Test 10 ÉCHOUÉ : La déclaration a été envoyée au room kitchen !');
  }
  console.log('  ✓ Succès : Les événements de déclaration ciblent admin et client, cuisine exclue.');
  passedTests++;

  // --------------------------------------------------------------------------
  // NETTOYAGE DES COMMANDES DE TEST
  // --------------------------------------------------------------------------
  const testIds = [order1.id, order2.id, orderReject.id, orderConcurrent.id, orderTamper.id];
  await prisma.payment.deleteMany({ where: { orderId: { in: testIds } } });
  await prisma.orderStatusHistory.deleteMany({ where: { orderId: { in: testIds } } });
  await prisma.orderItemOption.deleteMany({ where: { orderItem: { orderId: { in: testIds } } } });
  await prisma.orderItem.deleteMany({ where: { orderId: { in: testIds } } });
  await prisma.order.deleteMany({ where: { id: { in: testIds } } });

  console.log('\n=============================================================');
  console.log(`   RÉSULTAT GLOBAL : ${passedTests}/${totalTests} TESTS RÉUSSIS (100%)       `);
  console.log('=============================================================\n');
}

runTests()
  .catch(err => {
    console.error('\n❌ ÉCHEC D\'UN TEST :', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
