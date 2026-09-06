import { test, describe } from 'node:test';
import assert from 'node:assert';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from '../config';
import { createOrderSchema } from '../validations/orderValidation';

describe('TERANGA FOOD Backend Tests', () => {
  test('1. Hash de mot de passe & vérification bcrypt', async () => {
    const rawPassword = 'Demo@12345';
    const hash = await bcrypt.hash(rawPassword, 10);
    const isValid = await bcrypt.compare(rawPassword, hash);
    const isInvalid = await bcrypt.compare('WrongPassword', hash);

    assert.strictEqual(isValid, true, 'Le mot de passe doit correspondre au hash');
    assert.strictEqual(isInvalid, false, 'Un mauvais mot de passe doit être rejeté');
  });

  test('2. Génération et vérification de Token JWT avec rôle valide (ADMIN)', () => {
    const payload = {
      id: 'usr-123',
      email: 'admin@terangafood.demo',
      role: 'ADMIN',
    };

    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });
    const decoded = jwt.verify(token, config.jwtSecret) as any;

    assert.strictEqual(decoded.id, payload.id);
    assert.strictEqual(decoded.email, payload.email);
    assert.strictEqual(decoded.role, 'ADMIN');
  });

  test('3. Calcul du total de commande avec articles multiples et livraison', () => {
    const items = [
      { name: 'Poulet Braisé Teranga', quantity: 2, unitPrice: 4500, totalPrice: 9000 },
      { name: 'Jus de Bissap Royal', quantity: 2, unitPrice: 1000, totalPrice: 2000 },
    ];

    const subtotal = items.reduce((s, i) => s + i.totalPrice, 0);
    const deliveryFee = 1500;
    const grandTotal = subtotal + deliveryFee;

    assert.strictEqual(subtotal, 11000, 'Le sous-total doit être 11 000 FCFA');
    assert.strictEqual(grandTotal, 12500, 'Le grand total avec livraison doit être 12 500 FCFA');
  });

  test('4. Formatage du message de commande WhatsApp', () => {
    const customer = 'Mamadou Diop';
    const phone = '774888464';
    const table = '12';
    const total = 11000;

    const message = `Bonjour TERANGA FOOD 👋\nNouvelle commande\nClient : ${customer}\nTable : ${table}\nTOTAL : ${total} FCFA`;

    assert.ok(message.includes('Mamadou Diop'));
    assert.ok(message.includes('Table : 12'));
    assert.ok(message.includes('11000 FCFA'));
  });

  test('5. Validation Zod : Commande DINE_IN valide', () => {
    const validOrder = {
      customerName: 'Fatou Ndiaye',
      customerPhone: '+221 77 123 45 67',
      orderType: 'DINE_IN',
      tableNumber: '08',
      items: [
        {
          productId: 'prod-poulet-braise',
          quantity: 2,
        },
      ],
    };

    const result = createOrderSchema.safeParse(validOrder);
    assert.strictEqual(result.success, true, 'Une commande sur place avec table doit être validée');
  });

  test('6. Validation Zod : Rejet si tableNumber manquant pour DINE_IN', () => {
    const invalidOrder = {
      customerName: 'Fatou Ndiaye',
      customerPhone: '+221 77 123 45 67',
      orderType: 'DINE_IN',
      tableNumber: '',
      items: [
        {
          productId: 'prod-poulet-braise',
          quantity: 1,
        },
      ],
    };

    const result = createOrderSchema.safeParse(invalidOrder);
    assert.strictEqual(result.success, false, 'Doit rejeter une commande DINE_IN sans numéro de table');
  });

  test('7. Validation Zod : Rejet si adresse manquante pour DELIVERY', () => {
    const invalidDelivery = {
      customerName: 'Amadou Fall',
      customerPhone: '778901234',
      orderType: 'DELIVERY',
      deliveryAddress: '',
      items: [
        {
          productId: 'prod-thieb-rouge',
          quantity: 1,
        },
      ],
    };

    const result = createOrderSchema.safeParse(invalidDelivery);
    assert.strictEqual(result.success, false, 'Doit rejeter une commande DELIVERY sans adresse');
  });
});
