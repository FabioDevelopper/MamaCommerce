import { prisma } from '../lib/prisma.js';
import { PaymentMethod } from '../types/index.js';

export class PaymentService {
  static async getAllPayments() {
    return prisma.payment.findMany({
      orderBy: { receivedAt: 'desc' },
      include: {
        customer: true,
        order: { select: { id: true, number: true, total: true, creditTotal: true } },
        user: { select: { id: true, name: true } },
      },
    });
  }

  static async getPaymentById(id: string) {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        customer: true,
        order: {
          include: {
            items: { include: { product: true } },
          },
        },
        user: { select: { id: true, name: true, phone: true } },
      },
    });

    if (!payment) {
      throw new Error('Paiement introuvable');
    }

    return payment;
  }

  /**
   * Enregistrement d'un règlement avec imputation automatique FIFO sur les créances
   */
  static async createPayment(
    data: {
      orderId?: string | null;
      customerId?: string | null;
      amount: number;
      method: PaymentMethod;
      note?: string;
    },
    userId: string
  ) {
    if (data.amount <= 0) {
      throw new Error('Le montant du paiement doit être supérieur à 0');
    }

    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const reference = `PAY-${todayStr}-${randomSuffix}`;

    // 1. Si une commande précise est ciblée
    if (data.orderId) {
      const order = await prisma.order.findUnique({
        where: { id: data.orderId },
      });

      if (!order) {
        throw new Error('Commande cible introuvable');
      }

      const newPaidTotal = order.paidTotal + data.amount;
      const newCreditTotal = Math.max(0, order.creditTotal - data.amount);

      return prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: data.orderId! },
          data: {
            paidTotal: newPaidTotal,
            creditTotal: newCreditTotal,
          },
        });

        const payment = await tx.payment.create({
          data: {
            reference,
            orderId: order.id,
            customerId: data.customerId || order.customerId,
            userId,
            amount: data.amount,
            method: data.method,
            receivedAt: new Date(),
            note: data.note || `Règlement commande ${order.number}`,
          },
          include: {
            customer: true,
            order: true,
            user: { select: { id: true, name: true } },
          },
        });

        return payment;
      });
    }

    // 2. Si le client règle sans cibler une commande spécifique : imputation FIFO
    if (data.customerId) {
      const unpaidOrders = await prisma.order.findMany({
        where: {
          customerId: data.customerId,
          creditTotal: { gt: 0 },
          status: { not: 'CANCELLED' },
        },
        orderBy: { orderDate: 'asc' }, // FIFO
      });

      let remainingToAllocate = data.amount;
      const allocations: Array<{ id: string; toDeduct: number }> = [];

      for (const order of unpaidOrders) {
        if (remainingToAllocate <= 0) break;
        const toDeduct = Math.min(remainingToAllocate, order.creditTotal);
        allocations.push({ id: order.id, toDeduct });
        remainingToAllocate -= toDeduct;
      }

      return prisma.$transaction(async (tx) => {
        for (const alloc of allocations) {
          await tx.order.update({
            where: { id: alloc.id },
            data: {
              paidTotal: { increment: alloc.toDeduct },
              creditTotal: { decrement: alloc.toDeduct },
            },
          });
        }

        const payment = await tx.payment.create({
          data: {
            reference,
            customerId: data.customerId,
            userId,
            amount: data.amount,
            method: data.method,
            receivedAt: new Date(),
            note: data.note || 'Règlement solde client (imputation FIFO)',
          },
          include: {
            customer: true,
            user: { select: { id: true, name: true } },
          },
        });

        return payment;
      });
    }

    // 3. Paiement libre
    return prisma.payment.create({
      data: {
        reference,
        userId,
        amount: data.amount,
        method: data.method,
        receivedAt: new Date(),
        note: data.note || 'Encaissement comptant',
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });
  }
}
