import { prisma } from '../lib/prisma.js';

export class CustomerService {
  static async getAllCustomers(includeInactive = false) {
    const customers = await prisma.customer.findMany({
      where: includeInactive ? undefined : { active: true },
      orderBy: { name: 'asc' },
      include: {
        orders: {
          where: { status: { not: 'CANCELLED' } },
          select: {
            id: true,
            total: true,
            paidTotal: true,
            creditTotal: true,
            dueDate: true,
          },
        },
      },
    });

    const now = new Date();

    return customers.map((c) => {
      const totalPurchases = c.orders.reduce((sum, o) => sum + o.total, 0);
      const totalPaid = c.orders.reduce((sum, o) => sum + o.paidTotal, 0);
      const totalCredit = c.orders.reduce((sum, o) => sum + o.creditTotal, 0);

      // Vérifier les créances en retard
      const overdueOrders = c.orders.filter(
        (o) => o.creditTotal > 0 && o.dueDate && new Date(o.dueDate) < now
      );
      const overdueAmount = overdueOrders.reduce((sum, o) => sum + o.creditTotal, 0);

      return {
        id: c.id,
        code: c.code,
        name: c.name,
        businessName: c.businessName,
        phone: c.phone,
        whatsapp: c.whatsapp,
        email: c.email,
        address: c.address,
        city: c.city,
        creditLimit: c.creditLimit,
        totalPurchases: Math.round(totalPurchases),
        totalPaid: Math.round(totalPaid),
        totalCredit: Math.round(totalCredit),
        overdueAmount: Math.round(overdueAmount),
        hasOverdueCredit: overdueAmount > 0,
        active: c.active,
        createdAt: c.createdAt,
      };
    });
  }

  static async getCustomerById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { orderDate: 'desc' },
          include: {
            items: {
              include: { product: true },
            },
            payments: true,
          },
        },
        payments: {
          orderBy: { receivedAt: 'desc' },
          include: {
            order: { select: { number: true } },
            user: { select: { name: true } },
          },
        },
      },
    });

    if (!customer) {
      throw new Error('Client introuvable');
    }

    const validOrders = customer.orders.filter((o) => o.status !== 'CANCELLED');
    const totalPurchases = validOrders.reduce((sum, o) => sum + o.total, 0);
    const totalPaid = validOrders.reduce((sum, o) => sum + o.paidTotal, 0);
    const totalCredit = validOrders.reduce((sum, o) => sum + o.creditTotal, 0);

    const now = new Date();
    const overdueOrders = validOrders.filter(
      (o) => o.creditTotal > 0 && o.dueDate && new Date(o.dueDate) < now
    );
    const overdueAmount = overdueOrders.reduce((sum, o) => sum + o.creditTotal, 0);

    // Format WhatsApp pre-filled reminder
    const cleanPhone = (customer.whatsapp || customer.phone || '').replace(/\D/g, '');
    const reminderText = encodeURIComponent(
      `Bonjour ${customer.name} (${customer.businessName || 'Sokho Viandes'}), nous vous contactons concernant votre solde en cours de ${totalCredit.toLocaleString('fr-FR')} FCFA chez Sokho Viandes. Merci de nous indiquer la date de votre prochain versement. Cordialement.`
    );
    const whatsappUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${reminderText}`
      : null;

    return {
      ...customer,
      totalPurchases: Math.round(totalPurchases),
      totalPaid: Math.round(totalPaid),
      totalCredit: Math.round(totalCredit),
      overdueAmount: Math.round(overdueAmount),
      hasOverdueCredit: overdueAmount > 0,
      whatsappReminderUrl: whatsappUrl,
    };
  }

  static async createCustomer(data: {
    code: string;
    name: string;
    businessName?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    address?: string;
    city?: string;
    creditLimit?: number;
  }) {
    const existing = await prisma.customer.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new Error(`Le code client ${data.code} existe déjà`);
    }

    return prisma.customer.create({
      data: {
        code: data.code,
        name: data.name,
        businessName: data.businessName,
        phone: data.phone,
        whatsapp: data.whatsapp,
        email: data.email || null,
        address: data.address,
        city: data.city || 'Lomé',
        creditLimit: data.creditLimit ?? 0,
        active: true,
      },
    });
  }

  static async updateCustomer(
    id: string,
    data: {
      code?: string;
      name?: string;
      businessName?: string;
      phone?: string;
      whatsapp?: string;
      email?: string;
      address?: string;
      city?: string;
      creditLimit?: number;
      active?: boolean;
    }
  ) {
    return prisma.customer.update({
      where: { id },
      data,
    });
  }
}
