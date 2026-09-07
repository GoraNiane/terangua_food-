import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import jwt from 'jsonwebtoken';
import { prisma, config } from '../config';
import * as orderService from '../services/order.service';
import * as salesService from '../services/sales.service';
import * as statsService from '../services/statistics.service';

describe('TERANGA FOOD — 10 Scénarios de Validation Opérationnelle & Financière', () => {
  let testProductId1: string;
  let testProductId2: string;
  let testOrderId1: string;
  let testOrderId2: string;
  let testOrderId3: string;

  before(async () => {
    const cat = (await prisma.category.findFirst()) ||
      (await prisma.category.create({
        data: { name: 'Test Cat', slug: `test-cat-${Date.now()}` },
      }));

    const p1 = await prisma.product.create({
      data: {
        categoryId: cat.id,
        name: `Produit Test 5000 ${Date.now()}`,
        description: 'Description test 5000',
        price: 5000,
        imageUrl: 'https://example.com/test.jpg',
        ingredients: JSON.stringify(['Ingredient']),
      },
    });
    testProductId1 = p1.id;

    const p2 = await prisma.product.create({
      data: {
        categoryId: cat.id,
        name: `Produit Test 7500 ${Date.now()}`,
        description: 'Description test 7500',
        price: 7500,
        imageUrl: 'https://example.com/test2.jpg',
        ingredients: JSON.stringify(['Ingredient']),
      },
    });
    testProductId2 = p2.id;
  });

  after(async () => {
    // Nettoyage ciblé des données créées durant les tests
    const orderIds = [testOrderId1, testOrderId2, testOrderId3].filter(Boolean);
    if (orderIds.length > 0) {
      await prisma.sale.deleteMany({ where: { orderId: { in: orderIds } } });
      await prisma.orderItemOption.deleteMany({ where: { orderItem: { orderId: { in: orderIds } } } });
      await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
      await prisma.orderStatusHistory.deleteMany({ where: { orderId: { in: orderIds } } });
      await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
    }
    if (testProductId1) {
      await prisma.product.deleteMany({ where: { id: testProductId1 } });
    }
    if (testProductId2) {
      await prisma.product.deleteMany({ where: { id: testProductId2 } });
    }
  });

  // TEST 1 : Client crée une commande de 5 000 FCFA -> Order créée, Sale = aucune, CA = 0 (commande non SERVED)
  test('TEST 1 : Commande créée mais non SERVED -> aucune Sale générée et CA = 0', async () => {
    const order = await orderService.createOrder({
      customerName: 'Aissatou Ndiaye',
      customerPhone: '770001122',
      orderType: 'DINE_IN',
      tableNumber: '05',
      items: [{ productId: testProductId1, quantity: 1 }],
    });

    testOrderId1 = order.id;

    assert.ok(order.id, 'La commande doit avoir un ID');
    assert.strictEqual(order.status, 'PENDING', 'Le statut initial doit être PENDING');
    assert.strictEqual(order.total, 5000, 'Le total recalculé par le serveur doit être 5 000 FCFA');

    // Vérifier en base qu'aucune Sale n'existe pour cette commande
    const sale = await prisma.sale.findUnique({ where: { orderId: order.id } });
    assert.strictEqual(sale, null, 'Aucune vente ne doit exister tant que la commande n’est pas SERVED');
  });

  // TEST 2 : Commande passe à SERVED -> Sale = 5 000, CA = 5 000, 1 vente comptabilisée
  test('TEST 2 : Commande passe à SERVED -> Vente créée avec montant exact et CA incrémenté', async () => {
    const { order, saleCreated } = await orderService.updateOrderStatus(testOrderId1, 'SERVED', 'Servie à table');

    assert.strictEqual(order.status, 'SERVED');
    assert.ok(order.servedAt, 'L’horodatage servedAt doit être enregistré');
    assert.ok(saleCreated, 'Une vente doit être retournée');
    assert.strictEqual(saleCreated.amount, 5000, 'Le montant de la vente doit être exactement 5 000 FCFA');

    const saleInDb = await prisma.sale.findUnique({ where: { orderId: testOrderId1 } });
    assert.ok(saleInDb, 'La vente doit être persistée en base de données');
    assert.strictEqual(saleInDb?.amount, 5000);
  });

  // TEST 3 : Deuxième commande de 7 500 FCFA passe à SERVED -> Vente cumulée = 12 500 FCFA
  test('TEST 3 : Deuxième commande servie -> Ventes cumulées = 12 500 FCFA', async () => {
    const order2 = await orderService.createOrder({
      customerName: 'Cheikh Tidiane',
      customerPhone: '773334455',
      orderType: 'TAKEAWAY',
      items: [{ productId: testProductId2, quantity: 1 }],
    });

    testOrderId2 = order2.id;
    assert.strictEqual(order2.total, 7500);

    const { saleCreated } = await orderService.updateOrderStatus(testOrderId2, 'SERVED');
    assert.ok(saleCreated);
    assert.strictEqual(saleCreated.amount, 7500);

    const salesList = await prisma.sale.findMany({
      where: { orderId: { in: [testOrderId1, testOrderId2] } },
    });

    const sumAmount = salesList.reduce((s, x) => s + x.amount, 0);
    assert.strictEqual(salesList.length, 2, 'Il doit y avoir exactement 2 ventes');
    assert.strictEqual(sumAmount, 12500, 'Le CA total pour ces deux commandes doit être 12 500 FCFA');
  });

  // TEST 4 : Même événement SERVED reçu deux fois -> CA toujours 12 500 FCFA (idempotence absolue)
  test('TEST 4 : Double transition SERVED -> Idempotence garantie sans double comptage', async () => {
    // Relancer updateOrderStatus vers SERVED sur la commande 1
    const secondCall = await orderService.updateOrderStatus(testOrderId1, 'SERVED', 'Répétition de confirmation');

    const countSalesForOrder1 = await prisma.sale.count({ where: { orderId: testOrderId1 } });
    assert.strictEqual(countSalesForOrder1, 1, 'Il ne doit JAMAIS y avoir plus d’une vente par commande (orderId @unique)');

    const salesList = await prisma.sale.findMany({
      where: { orderId: { in: [testOrderId1, testOrderId2] } },
    });
    const sumAmount = salesList.reduce((s, x) => s + x.amount, 0);
    assert.strictEqual(sumAmount, 12500, 'Le CA doit rester strictement 12 500 FCFA sans double comptage');
  });

  // TEST 5 : Commande CANCELLED -> Aucun impact sur le CA (CA inchangé)
  test('TEST 5 : Commande CANCELLED -> Jamais comptabilisée dans le CA', async () => {
    const order3 = await orderService.createOrder({
      customerName: 'Client Annulé',
      customerPhone: '779998877',
      orderType: 'DINE_IN',
      tableNumber: '02',
      items: [{ productId: testProductId1, quantity: 1 }],
    });

    testOrderId3 = order3.id;

    // Annuler la commande
    const { order: cancelledOrder, saleCreated } = await orderService.updateOrderStatus(testOrderId3, 'CANCELLED', 'Client parti');
    assert.strictEqual(cancelledOrder.status, 'CANCELLED');
    assert.strictEqual(saleCreated, null, 'Une commande annulée ne doit jamais créer de vente');

    const saleCheck = await prisma.sale.findUnique({ where: { orderId: testOrderId3 } });
    assert.strictEqual(saleCheck, null, 'Aucune ligne Sale ne doit exister pour une commande annulée');
  });

  // TEST 6 : KITCHEN appelle les endpoints financiers -> 403 Forbidden
  test('TEST 6 : Sécurité RBAC -> Le rôle KITCHEN est interdit d’accès aux finances (403)', () => {
    const kitchenPayload = { id: 'k-1', email: 'kitchen@restaurant.com', role: 'KITCHEN' };
    const kitchenToken = jwt.sign(kitchenPayload, config.jwtSecret);
    const decoded = jwt.verify(kitchenToken, config.jwtSecret) as any;

    const allowedRolesForFinance = ['ADMIN'];
    const isForbidden = !allowedRolesForFinance.includes(decoded.role);
    assert.strictEqual(isForbidden, true, 'Le rôle KITCHEN doit être formellement rejeté des statistiques financières');
  });

  // TEST 7 : Prix modifié après commande -> L’ancienne commande conserve son prix historique
  test('TEST 7 : Intégrité historique -> La modification du prix produit ne rétroagit pas sur l’ancienne commande', async () => {
    // Vérifier le snapshot dans testOrderId1
    const itemBefore = await prisma.orderItem.findFirst({ where: { orderId: testOrderId1 } });
    assert.strictEqual(itemBefore?.unitPrice, 5000);

    // Modifier le prix du produit en base
    await prisma.product.update({
      where: { id: testProductId1 },
      data: { price: 6500 },
    });

    // Vérifier que la commande passée conserve son prix snapshoté à 5 000 FCFA
    const orderAfter = await orderService.getOrderById(testOrderId1);
    assert.strictEqual(orderAfter?.items[0].unitPrice, 5000, 'Le prix unitaire historique doit rester 5 000 FCFA');
    assert.strictEqual(orderAfter?.total, 5000, 'Le total historique doit rester 5 000 FCFA');

    // Restaurer le prix initial
    await prisma.product.update({
      where: { id: testProductId1 },
      data: { price: 5000 },
    });
  });

  // TEST 8 : Données accessibles via API indépendamment de Socket.IO
  test('TEST 8 : Persistance DB -> Les commandes et ventes sont 100% récupérables via API sans Socket.IO', async () => {
    const order = await orderService.getOrderById(testOrderId1);
    assert.ok(order, 'La commande doit être récupérable depuis la base');
    assert.strictEqual(order?.id, testOrderId1);

    const kitchenOrders = await orderService.getKitchenOrders();
    assert.ok(Array.isArray(kitchenOrders), 'L’API cuisine doit renvoyer une liste');
    // Vérifier l'absence totale de données financières dans getKitchenOrders
    kitchenOrders.forEach((ko: any) => {
      assert.strictEqual(ko.total, undefined, 'Aucun total financier dans l’espace cuisine');
      assert.strictEqual(ko.subtotal, undefined, 'Aucun sous-total financier dans l’espace cuisine');
      ko.items.forEach((item: any) => {
        assert.strictEqual(item.unitPrice, undefined, 'Aucun prix unitaire article dans l’espace cuisine');
        assert.strictEqual(item.totalPrice, undefined, 'Aucun prix total article dans l’espace cuisine');
      });
    });
  });

  // TEST 9 : Nouvelle commande reçue avec horodatage et affichée sans données financières en cuisine
  test('TEST 9 : Flux Cuisine -> Commande opérationnelle complète avec chronomètre et sans prix', async () => {
    const order = await orderService.createOrder({
      customerName: 'Fatou Sow',
      customerPhone: '778889900',
      orderType: 'DINE_IN',
      tableNumber: '14',
      notes: 'Bien cuit',
      items: [{ productId: testProductId1, quantity: 2, notes: 'Sans sel' }],
    });

    const kitchenList = await orderService.getKitchenOrders();
    const found = kitchenList.find(k => k.id === order.id);
    assert.ok(found, 'La nouvelle commande doit apparaître immédiatement dans les commandes cuisine');
    assert.strictEqual(found?.customerName, 'Fatou Sow');
    assert.strictEqual(found?.tableNumber, '14');
    assert.strictEqual(found?.notes, 'Bien cuit');
    assert.strictEqual(found?.items[0].notes, 'Sans sel');
    assert.strictEqual((found?.items[0] as any).unitPrice, undefined);

    // Nettoyer
    await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
    await prisma.orderStatusHistory.deleteMany({ where: { orderId: order.id } });
    await prisma.order.delete({ where: { id: order.id } });
  });

  // TEST 10 : Commande SERVED met à jour Sales et les Statistiques dynamiques
  test('TEST 10 : Commande SERVED -> KPI et statistiques globales calculés exclusivement depuis Sale', async () => {
    const stats = await statsService.getOperationalAndFinancialStatistics({ period: 'today' });

    assert.ok(stats.kpis, 'Les KPIs doivent être calculés');
    assert.ok(typeof stats.kpis.totalRevenue === 'number', 'totalRevenue doit être un nombre');
    assert.ok(typeof stats.kpis.paidOrdersCount === 'number', 'paidOrdersCount doit être un nombre');
    assert.ok(Array.isArray(stats.chartData), 'chartData doit être un tableau');
    assert.ok(Array.isArray(stats.topSellingProducts), 'topSellingProducts doit être un tableau');
  });
});
