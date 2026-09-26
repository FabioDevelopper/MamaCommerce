import { prisma } from '../lib/prisma.js';
import { PaymentMethod } from '../types/index.js';

export class OrderService {
  static async getAllOrders() {
    return prisma.order.findMany({
      orderBy: { orderDate: 'desc' },
      include: {
        customer: true,
        user: { select: { id: true, name: true, role: true } },
        items: {
          include: { product: true },
        },
        payments: true,
      },
    });
  }

  static async getOrderById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        user: { select: { id: true, name: true, role: true, phone: true } },
        items: {
          include: { product: true },
        },
        payments: {
          include: { user: { select: { name: true } } },
          orderBy: { receivedAt: 'desc' },
        },
      },
    });

    if (!order) {
      throw new Error('Commande introuvable');
    }

    return order;
  }

  /**
   * Création atomique d'une commande avec vérification de stock et transaction Prisma
   */
  static async createOrder(
    data: {
      customerId?: string | null;
      items: Array<{ productId: string; quantity: number; unitPrice: number }>;
      paidAmount?: number;
      paymentMethod?: PaymentMethod;
      discount?: number;
      dueDate?: string | null;
      notes?: string;
    },
    userId: string
  ) {
    if (!data.items || data.items.length === 0) {
      throw new Error('La commande doit comporter au moins un article');
    }

    // 1. Vérification préalable de la disponibilité du stock pour TOUS les produits
    for (const item of data.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: {
          stockMovements: { select: { type: true, quantity: true } },
        },
      });

      if (!product) {
        throw new Error(`Produit introuvable (ID: ${item.productId})`);
      }

      const currentStock = product.stockMovements.reduce((acc, m) => {
        if (m.type === 'IN') return acc + m.quantity;
        if (m.type === 'OUT') return acc - m.quantity;
        if (m.type === 'ADJUSTMENT') return acc + m.quantity;
        return acc;
      }, 0);

      if (currentStock < item.quantity) {
        throw new Error(
          `Impossible d'enregistrer la commande. Le stock disponible de ${product.name} est de ${currentStock.toFixed(2)} ${product.unit} alors que ${item.quantity.toFixed(2)} ${product.unit} sont demandés.`
        );
      }
    }

    // 2. Calculs financiers
    const subtotal = data.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const discount = Math.max(0, data.discount || 0);
    const total = Math.max(0, subtotal - discount);

    const paidAmount = Math.max(0, data.paidAmount || 0);
    const paidTotal = Math.min(paidAmount, total);
    const creditTotal = total - paidTotal;

    // 3. Vérification limite de crédit si vente à terme
    if (data.customerId && creditTotal > 0) {
      const customer = await prisma.customer.findUnique({
        where: { id: data.customerId },
        include: {
          orders: {
            where: { status: { not: 'CANCELLED' } },
            select: { creditTotal: true },
          },
        },
      });

      if (customer && customer.creditLimit > 0) {
        const existingCredit = customer.orders.reduce((sum, o) => sum + o.creditTotal, 0);
        const projectedCredit = existingCredit + creditTotal;

        if (projectedCredit > customer.creditLimit) {
          throw new Error(
            `Dépassement du plafond de crédit accordé au client ${customer.name} (${customer.creditLimit.toLocaleString('fr-FR')} FCFA). Crédit actuel : ${existingCredit.toLocaleString('fr-FR')} FCFA, nouveau crédit : ${creditTotal.toLocaleString('fr-FR')} FCFA.`
          );
        }
      }
    }

    // 4. Génération numéro de commande séquentiel unique
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `CMD-${todayStr}-${randomSuffix}`;

    // 5. Exécution transactionnelle atomique complète
    return prisma.$transaction(async (tx) => {
      // A. Création de la commande
      const order = await tx.order.create({
        data: {
          number: orderNumber,
          customerId: data.customerId || null,
          userId,
          status: 'CONFIRMED',
          orderDate: new Date(),
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          subtotal,
          discount,
          total,
          paidTotal,
          creditTotal,
          notes: data.notes,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.quantity * item.unitPrice,
            })),
          },
        },
        include: {
          items: { include: { product: true } },
          customer: true,
          user: { select: { id: true, name: true, role: true } },
        },
      });

      // B. Enregistrement du paiement initial si acompte versé
      if (paidTotal > 0) {
        const payRef = `PAY-${todayStr}-${randomSuffix}`;
        await tx.payment.create({
          data: {
            reference: payRef,
            orderId: order.id,
            customerId: data.customerId || null,
            userId,
            amount: paidTotal,
            method: data.paymentMethod || 'CASH',
            receivedAt: new Date(),
            note: `Règlement vente ${orderNumber}`,
          },
        });
      }

      // C. Création des mouvements de sortie de stock OUT
      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'OUT',
            quantity: item.quantity,
            unitCost: product?.purchasePrice || 0,
            reference: orderNumber,
            note: `Vente ${orderNumber}`,
          },
        });
      }

      return order;
    });
  }

  /**
   * Annulation sécurisée d'une commande avec réintégration automatique des stocks
   */
  static async cancelOrder(id: string, userId: string, reason?: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new Error('Commande introuvable');
    }

    if (order.status === 'CANCELLED') {
      throw new Error('Cette commande est déjà annulée');
    }

    return prisma.$transaction(async (tx) => {
      // 1. Réintégration du stock (Mouvements IN)
      for (const item of order.items) {
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'IN',
            quantity: item.quantity,
            reference: `ANNUL-${order.number}`,
            note: `Annulation commande ${order.number}${reason ? ` (${reason})` : ''}`,
          },
        });
      }

      // 2. Mise à jour statut de la commande
      return tx.order.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          creditTotal: 0,
          notes: order.notes
            ? `${order.notes} | Annulée par user: ${reason || 'Sans motif'}`
            : `Annulée : ${reason || 'Sans motif'}`,
        },
        include: {
          items: { include: { product: true } },
          customer: true,
        },
      });
    });
  }
}
