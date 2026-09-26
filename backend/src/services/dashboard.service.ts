import { prisma } from '../lib/prisma.js';
import { ProductService } from './product.service.js';

export class DashboardService {
  static async getDashboardMetrics() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. Récupération parallèle des données de synthèse
    const [
      allValidOrders,
      todayOrders,
      monthOrders,
      allPayments,
      allExpenses,
      allProductsWithStock,
      recentOrders,
      recentPayments,
      recentShipments,
      recentExpenses,
    ] = await Promise.all([
      prisma.order.findMany({
        where: { status: { not: 'CANCELLED' } },
        include: {
          items: { include: { product: true } },
        },
      }),
      prisma.order.aggregate({
        where: {
          status: { not: 'CANCELLED' },
          orderDate: { gte: startOfToday },
        },
        _sum: { total: true },
        _count: { id: true },
      }),
      prisma.order.aggregate({
        where: {
          status: { not: 'CANCELLED' },
          orderDate: { gte: startOfMonth },
        },
        _sum: { total: true },
        _count: { id: true },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        _sum: { amount: true },
      }),
      ProductService.getAllProducts(false),
      prisma.order.findMany({
        orderBy: { orderDate: 'desc' },
        take: 6,
        include: {
          customer: true,
          items: { include: { product: true } },
          payments: true,
          user: { select: { name: true } },
        },
      }),
      prisma.payment.findMany({
        orderBy: { receivedAt: 'desc' },
        take: 6,
        include: {
          customer: true,
          order: { select: { number: true } },
          user: { select: { name: true } },
        },
      }),
      prisma.shipment.findMany({
        orderBy: { createdAt: 'desc' },
        take: 4,
        include: {
          supplier: true,
          items: { include: { product: true } },
        },
      }),
      prisma.expense.findMany({
        orderBy: { expenseDate: 'desc' },
        take: 5,
        include: {
          user: { select: { name: true } },
          shipment: { select: { reference: true } },
        },
      }),
    ]);

    // 2. Calculs rigoureux des agrégats
    const totalTurnover = allValidOrders.reduce((sum, o) => sum + o.total, 0);
    const totalCreditActive = allValidOrders.reduce((sum, o) => sum + o.creditTotal, 0);
    const totalPaymentsReceived = allPayments._sum.amount || 0;
    const totalExpenses = allExpenses._sum.amount || 0;

    // Coût des marchandises vendues (COGS)
    let totalCogs = 0;
    for (const order of allValidOrders) {
      for (const item of order.items) {
        const cost = item.product.purchasePrice * item.quantity;
        totalCogs += cost;
      }
    }

    // Bénéfice brut estimé et bénéfice net estimé
    const estimatedGrossProfit = Math.max(0, totalTurnover - totalCogs);
    const estimatedNetProfit = Math.round(totalTurnover - totalCogs - totalExpenses);

    // Valeur marchande du stock disponible en entrepôt
    const totalStockValue = allProductsWithStock.reduce((sum, p) => sum + p.stockValue, 0);
    const totalStockKg = allProductsWithStock.reduce((sum, p) => sum + Math.max(0, p.currentStock), 0);

    // 3. Alertes critiques
    const lowStockAlerts = allProductsWithStock
      .filter((p) => p.isLowStock)
      .map((p) => ({
        id: p.productId,
        sku: p.sku,
        name: p.name,
        unit: p.unit,
        currentStock: p.currentStock,
        reorderLevel: p.reorderLevel,
      }));

    const overdueCreditOrders = allValidOrders
      .filter((o) => o.creditTotal > 0 && o.dueDate && new Date(o.dueDate) < now)
      .map((o) => ({
        id: o.id,
        number: o.number,
        customerId: o.customerId,
        creditTotal: o.creditTotal,
        dueDate: o.dueDate,
      }));

    const overdueCreditTotal = overdueCreditOrders.reduce((sum, o) => sum + o.creditTotal, 0);

    // 4. Données d'évolution des 7 derniers jours
    const last7DaysData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

      const dayOrders = allValidOrders.filter(
        (o) => new Date(o.orderDate) >= dayStart && new Date(o.orderDate) <= dayEnd
      );
      const daySales = dayOrders.reduce((sum, o) => sum + o.total, 0);

      const dayName = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
      last7DaysData.push({
        date: dayStart.toISOString().slice(0, 10),
        label: dayName,
        sales: daySales,
        ordersCount: dayOrders.length,
      });
    }

    return {
      metrics: {
        turnover: Math.round(totalTurnover),
        salesToday: Math.round(todayOrders._sum.total || 0),
        ordersTodayCount: todayOrders._count.id || 0,
        salesMonth: Math.round(monthOrders._sum.total || 0),
        ordersMonthCount: monthOrders._count.id || 0,
        activeCreditTotal: Math.round(totalCreditActive),
        overdueCreditTotal: Math.round(overdueCreditTotal),
        paymentsReceivedTotal: Math.round(totalPaymentsReceived),
        expensesTotal: Math.round(totalExpenses),
        totalStockValue: Math.round(totalStockValue),
        totalStockKg: Number(totalStockKg.toFixed(2)),
        cogs: Math.round(totalCogs),
        estimatedGrossProfit: Math.round(estimatedGrossProfit),
        estimatedNetProfit,
        profitDisclaimer:
          'Bénéfice estimé calculé sur la base des prix d’achat moyens au Sénégal et des dépenses d’exploitation saisies.',
      },
      alerts: {
        lowStockCount: lowStockAlerts.length,
        lowStockItems: lowStockAlerts,
        overdueCreditCount: overdueCreditOrders.length,
        overdueCreditAmount: Math.round(overdueCreditTotal),
      },
      charts: {
        last7Days: last7DaysData,
      },
      recentActivity: {
        orders: recentOrders,
        payments: recentPayments,
        shipments: recentShipments,
        expenses: recentExpenses,
      },
    };
  }
}
