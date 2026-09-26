import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../src/lib/prisma.js';
import { ProductService } from '../src/services/product.service.js';
import { OrderService } from '../src/services/order.service.js';

describe('Vérification des règles de gestion de stock', () => {
  let testProductId: string;
  let adminUserId: string;

  before(async () => {
    // Trouver ou créer un produit de test
    const user = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!user) throw new Error('Aucun utilisateur pour le test');
    adminUserId = user.id;

    const product = await prisma.product.create({
      data: {
        sku: `TEST-STOCK-${Date.now()}`,
        name: 'Viande Test Stock',
        unit: 'kg',
        purchasePrice: 4000,
        salePrice: 6000,
        reorderLevel: 20,
      },
    });
    testProductId = product.id;

    // Entrée de stock initiale de 50 kg
    await prisma.stockMovement.create({
      data: {
        productId: testProductId,
        type: 'IN',
        quantity: 50,
        unitCost: 4000,
        reference: 'INIT-TEST',
        note: 'Stock initial test',
      },
    });
  });

  after(async () => {
    await prisma.stockMovement.deleteMany({ where: { productId: testProductId } });
    await prisma.product.delete({ where: { id: testProductId } });
  });

  test('Le stock doit être exactement calculé (50 kg)', async () => {
    const stock = await ProductService.getProductStock(testProductId);
    assert.equal(stock, 50);
  });

  test('Un ajustement manuel positif (+15 kg) augmente le stock à 65 kg', async () => {
    const res = await ProductService.adjustStock({
      productId: testProductId,
      quantity: 15,
      note: 'Inventaire positif',
    });
    assert.equal(res.newStock, 65);
    const current = await ProductService.getProductStock(testProductId);
    assert.equal(current, 65);
  });

  test('Un ajustement négatif qui mènerait à un stock négatif doit être rejeté', async () => {
    await assert.rejects(
      async () => {
        await ProductService.adjustStock({
          productId: testProductId,
          quantity: -100, // actuel 65, donc -35 kg interdit
          note: 'Perte impossible',
        });
      },
      (err: Error) => {
        assert.match(err.message, /stock résultant serait négatif/i);
        return true;
      }
    );
  });

  test('Une commande demandant plus que le stock disponible doit être rejetée avec message précis', async () => {
    await assert.rejects(
      async () => {
        await OrderService.createOrder(
          {
            items: [
              {
                productId: testProductId,
                quantity: 200, // Stock disponible = 65 kg
                unitPrice: 6000,
              },
            ],
            paidAmount: 0,
          },
          adminUserId
        );
      },
      (err: Error) => {
        assert.match(err.message, /stock disponible.*est de 65.*alors que 200.*sont demandés/i);
        return true;
      }
    );
  });
});
