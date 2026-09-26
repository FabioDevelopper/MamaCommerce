import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../src/lib/prisma.js';
import { OrderService } from '../src/services/order.service.js';
import { PaymentService } from '../src/services/payment.service.js';

describe('Vérification du plafond de crédit et de l’imputation FIFO des paiements', () => {
  let productId: string;
  let customerId: string;
  let adminUserId: string;

  before(async () => {
    const user = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!user) throw new Error('Aucun admin');
    adminUserId = user.id;

    const product = await prisma.product.create({
      data: {
        sku: `TEST-CRED-${Date.now()}`,
        name: 'Viande Test Crédit',
        unit: 'kg',
        purchasePrice: 3000,
        salePrice: 5000,
        reorderLevel: 5,
      },
    });
    productId = product.id;

    await prisma.stockMovement.create({
      data: {
        productId,
        type: 'IN',
        quantity: 200,
        unitCost: 3000,
        reference: 'INIT-CRED-TEST',
      },
    });

    const customer = await prisma.customer.create({
      data: {
        code: `CLI-CRED-${Date.now()}`,
        name: 'Client Test Limite Crédit',
        creditLimit: 150000, // Plafond 150 000 FCFA
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
    await prisma.payment.deleteMany({ where: { customerId } });
    await prisma.stockMovement.deleteMany({ where: { productId } });
    await prisma.product.delete({ where: { id: productId } });
    await prisma.customer.delete({ where: { id: customerId } });
  });

  test('Une commande de 200 000 FCFA sans acompte doit échouer car dépasse le plafond de 150 000 FCFA', async () => {
    await assert.rejects(
      async () => {
        await OrderService.createOrder(
          {
            customerId,
            items: [{ productId, quantity: 40, unitPrice: 5000 }], // 200 000 FCFA
            paidAmount: 0,
          },
          adminUserId
        );
      },
      (err: Error) => {
        assert.match(err.message, /Dépassement du plafond de crédit/i);
        return true;
      }
    );
  });

  test('Imputation FIFO : Paiement global réparti sur plusieurs factures à crédit', async () => {
    // Commande 1: 50 000 FCFA à crédit
    const cmd1 = await OrderService.createOrder(
      {
        customerId,
        items: [{ productId, quantity: 10, unitPrice: 5000 }],
        paidAmount: 0,
      },
      adminUserId
    );

    // Commande 2: 60 000 FCFA à crédit
    const cmd2 = await OrderService.createOrder(
      {
        customerId,
        items: [{ productId, quantity: 12, unitPrice: 5000 }],
        paidAmount: 0,
      },
      adminUserId
    );

    assert.equal(cmd1.creditTotal, 50000);
    assert.equal(cmd2.creditTotal, 60000);

    // Le client verse 80 000 FCFA globalement (sans cibler de commande)
    // Doit apurer totalement cmd1 (50 000) et réduire cmd2 de 30 000 (reste 30 000)
    await PaymentService.createPayment(
      {
        customerId,
        amount: 80000,
        method: 'MOOV_MONEY',
        note: 'Règlement global compte client',
      },
      adminUserId
    );

    const checkCmd1 = await prisma.order.findUnique({ where: { id: cmd1.id } });
    const checkCmd2 = await prisma.order.findUnique({ where: { id: cmd2.id } });

    assert.equal(checkCmd1?.paidTotal, 50000);
    assert.equal(checkCmd1?.creditTotal, 0);

    assert.equal(checkCmd2?.paidTotal, 30000);
    assert.equal(checkCmd2?.creditTotal, 30000);
  });
});
