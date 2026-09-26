import { prisma } from '../lib/prisma.js';

export class SupplierService {
  static async getAllSuppliers(includeInactive = false) {
    const suppliers = await prisma.supplier.findMany({
      where: includeInactive ? undefined : { active: true },
      orderBy: { name: 'asc' },
      include: {
        shipments: {
          include: {
            items: true,
          },
        },
      },
    });

    return suppliers.map((s) => {
      const totalShipments = s.shipments.length;
      const totalPurchases = s.shipments.reduce((sum, ship) => {
        const itemsTotal = ship.items.reduce((iSum, item) => iSum + item.totalCost, 0);
        return sum + itemsTotal + ship.transportCost + ship.otherCosts;
      }, 0);

      return {
        id: s.id,
        code: s.code,
        name: s.name,
        company: s.company,
        phone: s.phone,
        whatsapp: s.whatsapp,
        email: s.email,
        address: s.address,
        country: s.country,
        totalShipments,
        totalPurchases: Math.round(totalPurchases),
        active: s.active,
        createdAt: s.createdAt,
      };
    });
  }

  static async getSupplierById(id: string) {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        shipments: {
          orderBy: { createdAt: 'desc' },
          include: {
            items: {
              include: { product: true },
            },
          },
        },
      },
    });

    if (!supplier) {
      throw new Error('Fournisseur introuvable');
    }

    const totalShipments = supplier.shipments.length;
    const totalPurchases = supplier.shipments.reduce((sum, ship) => {
      const itemsTotal = ship.items.reduce((iSum, item) => iSum + item.totalCost, 0);
      return sum + itemsTotal + ship.transportCost + ship.otherCosts;
    }, 0);

    return {
      ...supplier,
      totalShipments,
      totalPurchases: Math.round(totalPurchases),
    };
  }

  static async createSupplier(data: {
    code: string;
    name: string;
    company?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    address?: string;
    country?: string;
  }) {
    const existing = await prisma.supplier.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new Error(`Le code fournisseur ${data.code} existe déjà`);
    }

    return prisma.supplier.create({
      data: {
        code: data.code,
        name: data.name,
        company: data.company,
        phone: data.phone,
        whatsapp: data.whatsapp,
        email: data.email || null,
        address: data.address,
        country: data.country || 'Sénégal',
        active: true,
      },
    });
  }

  static async updateSupplier(
    id: string,
    data: {
      code?: string;
      name?: string;
      company?: string;
      phone?: string;
      whatsapp?: string;
      email?: string;
      address?: string;
      country?: string;
      active?: boolean;
    }
  ) {
    return prisma.supplier.update({
      where: { id },
      data,
    });
  }
}
