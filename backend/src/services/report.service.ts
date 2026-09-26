import { prisma } from '../lib/prisma.js';

export class ReportService {
  static getPeriodDates(period: string, customFrom?: string, customTo?: string) {
    const now = new Date();
    let from: Date;
    let to: Date = new Date();

    switch (period) {
      case 'today':
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        from = new Date(now);
        from.setDate(now.getDate() - 7);
        break;
      case 'month':
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        from = new Date(now);
        from.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        from = new Date(now.getFullYear(), 0, 1);
        break;
      case 'custom':
        from = customFrom ? new Date(customFrom) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        to = customTo ? new Date(customTo) : new Date();
        break;
      default:
        from = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return { from, to };
  }

  static async getFinancialReport(period = 'month', customFrom?: string, customTo?: string) {
    const { from, to } = this.getPeriodDates(period, customFrom, customTo);

    // Commandes sur la période
    const orders = await prisma.order.findMany({
      where: {
        orderDate: { gte: from, lte: to },
        status: { not: 'CANCELLED' },
      },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    });

    // Paiements encaissés sur la période
    const payments = await prisma.payment.findMany({
      where: {
        receivedAt: { gte: from, lte: to },
      },
      include: {
        customer: true,
      },
    });

    // Dépenses sur la période
    const expenses = await prisma.expense.findMany({
      where: {
        expenseDate: { gte: from, lte: to },
      },
    });

    // Arrivages sur la période
    const shipments = await prisma.shipment.findMany({
      where: {
        createdAt: { gte: from, lte: to },
      },
      include: {
        supplier: true,
        items: { include: { product: true } },
      },
    });

    // Calculs agrégés
    const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
    const totalCashReceived = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalNewCredit = orders.reduce((sum, o) => sum + o.creditTotal, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // COGS
    let totalCogs = 0;
    const productSalesMap: Record<
      string,
      { name: string; unit: string; quantity: number; revenue: number; cost: number }
    > = {};

    for (const order of orders) {
      for (const item of order.items) {
        const itemCost = item.product.purchasePrice * item.quantity;
        totalCogs += itemCost;

        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = {
            name: item.product.name,
            unit: item.product.unit,
            quantity: 0,
            revenue: 0,
            cost: 0,
          };
        }

        productSalesMap[item.productId].quantity += item.quantity;
        productSalesMap[item.productId].revenue += item.total;
        productSalesMap[item.productId].cost += itemCost;
      }
    }

    const estimatedGrossProfit = totalSales - totalCogs;
    const estimatedNetProfit = totalSales - totalCogs - totalExpenses;

    // Répartition des dépenses par catégorie
    const expensesByCategory = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

    // Répartition des paiements par méthode
    const paymentsByMethod = payments.reduce((acc, p) => {
      acc[p.method] = (acc[p.method] || 0) + p.amount;
      return acc;
    }, {} as Record<string, number>);

    const topProducts = Object.values(productSalesMap)
      .map((p) => ({
        ...p,
        margin: Math.round(p.revenue - p.cost),
        marginPercent: p.revenue > 0 ? Math.round(((p.revenue - p.cost) / p.revenue) * 100) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return {
      period: {
        code: period,
        from: from.toISOString(),
        to: to.toISOString(),
      },
      summary: {
        totalSales: Math.round(totalSales),
        ordersCount: orders.length,
        totalCashReceived: Math.round(totalCashReceived),
        paymentsCount: payments.length,
        totalNewCredit: Math.round(totalNewCredit),
        totalExpenses: Math.round(totalExpenses),
        expensesCount: expenses.length,
        totalCogs: Math.round(totalCogs),
        estimatedGrossProfit: Math.round(estimatedGrossProfit),
        estimatedNetProfit: Math.round(estimatedNetProfit),
        grossMarginPercent: totalSales > 0 ? Math.round((estimatedGrossProfit / totalSales) * 100) : 0,
        shipmentsCount: shipments.length,
      },
      expensesByCategory,
      paymentsByMethod,
      topProducts,
    };
  }

  static async generateCsvReport(period = 'month', customFrom?: string, customTo?: string): Promise<string> {
    const report = await this.getFinancialReport(period, customFrom, customTo);

    const lines: string[] = [];
    lines.push('RAPPORT COMMERCIAL ET FINANCIER - SOKHO VIANDES');
    lines.push(`Période : ${new Date(report.period.from).toLocaleDateString('fr-FR')} au ${new Date(report.period.to).toLocaleDateString('fr-FR')}`);
    lines.push('');
    lines.push('INDICATEUR,MONTANT (FCFA)');
    lines.push(`Chiffre d'Affaires Brut,${report.summary.totalSales}`);
    lines.push(`Encaissements Réalisés,${report.summary.totalCashReceived}`);
    lines.push(`Nouveaux Crédits Accordés,${report.summary.totalNewCredit}`);
    lines.push(`Coût des Marchandises Vendues (COGS),${report.summary.totalCogs}`);
    lines.push(`Marge Brute Estimée,${report.summary.estimatedGrossProfit}`);
    lines.push(`Total Dépenses d'Exploitation,${report.summary.totalExpenses}`);
    lines.push(`Bénéfice Net Estimé,${report.summary.estimatedNetProfit}`);
    lines.push('');
    lines.push('DÉPENSES PAR CATÉGORIE');
    lines.push('Catégorie,Montant (FCFA)');
    for (const [cat, amt] of Object.entries(report.expensesByCategory)) {
      lines.push(`${cat},${amt}`);
    }
    lines.push('');
    lines.push('VENTES PAR PRODUIT');
    lines.push('Produit,Unité,Quantité Vendue,Chiffre Affaires (FCFA),Coût Achat (FCFA),Marge Estimée (FCFA)');
    for (const p of report.topProducts) {
      lines.push(`"${p.name}",${p.unit},${p.quantity},${p.revenue},${p.cost},${p.margin}`);
    }

    return lines.join('\n');
  }
}
