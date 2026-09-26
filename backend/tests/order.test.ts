import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../src/lib/prisma.js';
import { ProductService } from '../src/services/product.service.js';
import { OrderService } from '../src/services/order.service.js';
import { PaymentService } from '../src/services/payment.service.js';

describe('Vérification des commandes, paiements partiels et annulations', () => {
  let productId: string;
  let customerId: string;
  let adminUserId: string;

  before(async () => {
    const user = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!user) throw new Error('Aucun admin');
    adminUserId = user.id;

    const product = await prisma.product.create({
      data: {
        sku: `TEST-ORD-${Date.now()}`,
        name: 'Viande Test Commande',
        unit: 'kg',
        purchasePrice: 4000,
        salePrice: 5000,
        reorderLevel: 10,
      },
    });
    productId = product.id;

    // Approvisionner 100 kg
    await prisma.stockMovement.create({
      data: {
        productId,
        type: 'IN',
        quantity: 100,
        unitCost: 4000,
        reference: 'INIT-ORD-TEST',
      },
    });

    const customer = await prisma.customer.create({
      data: {
        code: `CLI-TEST-${Date.now()}`,
        name: 'Client Test Commande',
        creditLimit: 500000,
      },
    });
    customerId = customer.id;
  });

  after(async () => {
    const orders = await prisma.order.findMany({ where: { customerId } });
    for (const o of orders) {
      await prisma.payment.deleteMany({ where: { orderId: o.id } });
      await prisma.orderItem.deleteMany({ where: { orderId: o.id } });
      await prisma.order.delete({ where: { id: o.id } });
    }
    await prisma.stockMovement.deleteMany({ where: { productId } });
    await prisma.product.delete({ where: { id: productId } });
    await prisma.customer.delete({ where: { id: customerId } });
  });

  test('Création atomique d’une commande de 20 kg @ 5000 FCFA = 100 000 FCFA avec acompte de 40 000 FCFA', async () => {
    const initialStock = await ProductService.getProductStock(productId);
    assert.equal(initialStock, 100);

    const order = await OrderService.createOrder(
      {
        customerId,
        items: [{ productId, quantity: 20, unitPrice: 5000 }],
        paidAmount: 40000,
        paymentMethod: 'CASH',
        notes: 'Commande test acompte',
      },
      adminUserId
    );

    assert.equal(order.total, 100000);
    assert.equal(order.paidTotal, 40000);
    assert.equal(order.creditTotal, 60000);

    // Vérifier que le stock a été diminué de 20 kg
    const newStock = await ProductService.getProductStock(productId);
    assert.equal(newStock, 80);

    // Vérifier le paiement associé
    const payments = await prisma.payment.findMany({ where: { orderId: order.id } });
    assert.equal(payments.length, 1);
    assert.equal(payments[0].amount, 40000);
  });

  test('Règlement ultérieur du solde de 60 000 FCFA', async () => {
    const order = await prisma.order.findFirst({
      where: { customerId, creditTotal: { gt: 0 } },
    });
    assert.ok(order);

    const payment = await PaymentService.createPayment(
      {
        orderId: order.id,
        amount: 60000,
        method: 'TMONEY',
        note: 'Solde complet',
      },
      adminUserId
    );

    assert.equal(payment.amount, 60000);

    const updatedOrder = await prisma.order.findUnique({ where: { id: order.id } });
    assert.equal(updatedOrder?.paidTotal, 100000);
    assert.equal(updatedOrder?.creditTotal, 0);
  });

  test('L’annulation d’une commande réintègre automatiquement les stocks', async () => {
    // Créer une commande de 15 kg
    const order = await OrderService.createOrder(
      {
        customerId,
        items: [{ productId, quantity: 15, unitPrice: 5000 }],
        paidAmount: 75000,
      },
      adminUserId
    );

    const stockBeforeCancel = await ProductService.getProductStock(productId);
    assert.equal(stockBeforeCancel, 65); // 80 - 15 = 65

    await OrderService.cancelOrder(order.id, adminUserId, 'Test erreur de saisie client');

    const stockAfterCancel = await ProductService.getProductStock(productId);
    assert.equal(stockAfterCancel, 80); // Réintégré à 80 kg !
  });
});
