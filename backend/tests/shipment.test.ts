import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../src/lib/prisma.js';
import { ProductService } from '../src/services/product.service.js';
import { ShipmentService } from '../src/services/shipment.service.js';

describe('Vérification des arrivages Sénégal → Togo', () => {
  let supplierId: string;
  let productId: string;
  let adminUserId: string;

  before(async () => {
    const user = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!user) throw new Error('Aucun admin');
    adminUserId = user.id;

    const supplier = await prisma.supplier.create({
      data: {
        code: `FOU-TEST-${Date.now()}`,
        name: 'Fournisseur Dakar Test',
        country: 'Sénégal',
      },
    });
    supplierId = supplier.id;

    const product = await prisma.product.create({
      data: {
        sku: `TEST-ARR-${Date.now()}`,
        name: 'Viande Test Arrivage',
        unit: 'kg',
        purchasePrice: 4200,
        salePrice: 6000,
        reorderLevel: 20,
      },
    });
    productId = product.id;
  });

  after(async () => {
    const shipments = await prisma.shipment.findMany({ where: { supplierId } });
    for (const s of shipments) {
      await prisma.expense.deleteMany({ where: { shipmentId: s.id } });
      await prisma.shipmentItem.deleteMany({ where: { shipmentId: s.id } });
      await prisma.shipment.delete({ where: { id: s.id } });
    }
    await prisma.stockMovement.deleteMany({ where: { productId } });
    await prisma.product.delete({ where: { id: productId } });
    await prisma.supplier.delete({ where: { id: supplierId } });
  });

  test('Un arrivage créé au statut PLANNED n’injecte pas immédiatement de stock', async () => {
    const ref = `ARR-TEST-${Date.now()}`;
    const shipment = await ShipmentService.createShipment(
      {
        reference: ref,
        supplierId,
        status: 'PLANNED',
        transportCost: 50000,
        items: [{ productId, quantity: 150, unitCost: 4200 }],
      },
      adminUserId
    );

    assert.equal(shipment.status, 'PLANNED');

    const stock = await ProductService.getProductStock(productId);
    assert.equal(stock, 0); // Pas encore réceptionné
  });

  test('Le passage au statut RECEIVED injecte le stock et crée la dépense de transport', async () => {
    const shipment = await prisma.shipment.findFirst({ where: { supplierId } });
    assert.ok(shipment);

    await ShipmentService.updateStatus(shipment.id, 'RECEIVED', new Date().toISOString(), adminUserId);

    const stock = await ProductService.getProductStock(productId);
    assert.equal(stock, 150); // 150 kg injectés !

    // Vérifier la dépense automatique de 50 000 FCFA
    const expense = await prisma.expense.findFirst({ where: { shipmentId: shipment.id } });
    assert.ok(expense);
    assert.equal(expense.amount, 50000);
    assert.equal(expense.category, 'TRANSPORT');
  });
});
