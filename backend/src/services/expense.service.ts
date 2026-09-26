import { prisma } from '../lib/prisma.js';
import { ExpenseCategory } from '../types/index.js';

export class ExpenseService {
  static async getAllExpenses() {
    return prisma.expense.findMany({
      orderBy: { expenseDate: 'desc' },
      include: {
        shipment: { select: { id: true, reference: true, origin: true, destination: true } },
        user: { select: { id: true, name: true } },
      },
    });
  }

  static async createExpense(
    data: {
      category: ExpenseCategory;
      amount: number;
      description: string;
      expenseDate?: string;
      shipmentId?: string | null;
    },
    userId: string
  ) {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const reference = `DEP-${todayStr}-${randomSuffix}`;

    return prisma.expense.create({
      data: {
        reference,
        category: data.category,
        amount: data.amount,
        description: data.description,
        expenseDate: data.expenseDate ? new Date(data.expenseDate) : new Date(),
        shipmentId: data.shipmentId || null,
        userId,
      },
      include: {
        shipment: true,
        user: { select: { id: true, name: true } },
      },
    });
  }

  static async deleteExpense(id: string) {
    return prisma.expense.delete({
      where: { id },
    });
  }
}
