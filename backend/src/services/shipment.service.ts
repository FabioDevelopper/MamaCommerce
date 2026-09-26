import { prisma } from '../lib/prisma.js';
import { ShipmentStatus } from '../types/index.js';

export class ShipmentService {
  static async getAllShipments() {
    return prisma.shipment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        supplier: true,
        items: {
          include: { product: true },
        },
        expenses: true,
      },
    });
  }

  static async getShipmentById(id: string) {
    const shipment = await prisma.shipment.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: {
          include: { product: true },
        },
        expenses: {
          include: { user: { select: { name: true } } },
        },
      },
    });

    if (!shipment) {
      throw new Error('Arrivage introuvable');
    }

    const itemsCost = shipment.items.reduce((sum, item) => sum + item.totalCost, 0);
    const totalCost = itemsCost + shipment.transportCost + shipment.otherCosts;
    const totalQuantity = shipment.items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      ...shipment,
      itemsCost,
      totalCost,
      totalQuantity,
    };
  }

  static async createShipment(
    data: {
      reference: string;
      supplierId: string;
      origin?: string;
      destination?: string;
      status?: ShipmentStatus;
      departureDate?: string | null;
      arrivalDate?: string | null;
      transportCost?: number;
      otherCosts?: number;
      notes?: string;
      items: Array<{ productId: string; quantity: number; unitCost: number }>;
    },
    userId: string
  ) {
    const existing = await prisma.shipment.findUnique({
      where: { reference: data.reference },
    });

    if (existing) {
      throw new Error(`Un arrivage avec la référence ${data.reference} existe déjà`);
    }

    // Exécution atomique
    return prisma.$transaction(async (tx) => {
      const itemsData = data.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitCost: i.unitCost,
        totalCost: i.quantity * i.unitCost,
      }));

      const shipment = await tx.shipment.create({
        data: {
          reference: data.reference,
          supplierId: data.supplierId,
          origin: data.origin || 'Sénégal (Dakar)',
          destination: data.destination || 'Togo (Lomé)',
          status: data.status || 'PLANNED',
          departureDate: data.departureDate ? new Date(data.departureDate) : null,
          arrivalDate: data.arrivalDate ? new Date(data.arrivalDate) : null,
          transportCost: data.transportCost || 0,
          otherCosts: data.otherCosts || 0,
          notes: data.notes,
          items: {
            create: itemsData,
          },
        },
        include: {
          items: true,
        },
      });

      // Si l'arrivage est créé directement au statut RECEIVED, injecter immédiatement le stock
      if (shipment.status === 'RECEIVED') {
        for (const item of data.items) {
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              type: 'IN',
              quantity: item.quantity,
              unitCost: item.unitCost,
              reference: shipment.reference,
              note: `Réception arrivage ${shipment.reference}`,
            },
          });
        }

        // Si des frais de transport existent, enregistrer la dépense correspondante
        if (data.transportCost && data.transportCost > 0) {
          await tx.expense.create({
            data: {
              reference: `DEP-FRET-${shipment.reference}`,
              category: 'TRANSPORT',
              amount: data.transportCost,
              description: `Fret transport arrivage ${shipment.reference}`,
              shipmentId: shipment.id,
              userId,
            },
          });
        }
      }

      return shipment;
    });
  }

  static async updateStatus(
    id: string,
    status: ShipmentStatus,
    arrivalDate?: string | null,
    userId?: string
  ) {
    const shipment = await prisma.shipment.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!shipment) {
      throw new Error('Arrivage introuvable');
    }

    if (shipment.status === status) {
      return shipment;
    }

    return prisma.$transaction(async (tx) => {
      // Si on passe à RECEIVED alors qu'on ne l'était pas : créer les mouvements IN
      if (status === 'RECEIVED' && shipment.status !== 'RECEIVED') {
        for (const item of shipment.items) {
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              type: 'IN',
              quantity: item.quantity,
              unitCost: item.unitCost,
              reference: shipment.reference,
              note: `Réception arrivage ${shipment.reference}`,
            },
          });
        }

        if (shipment.transportCost > 0 && userId) {
          await tx.expense.create({
            data: {
              reference: `DEP-FRET-${shipment.reference}`,
              category: 'TRANSPORT',
              amount: shipment.transportCost,
              description: `Fret transport arrivage ${shipment.reference}`,
              shipmentId: shipment.id,
              userId,
            },
          });
        }
      }

      return tx.shipment.update({
        where: { id },
        data: {
          status,
          arrivalDate: arrivalDate ? new Date(arrivalDate) : shipment.arrivalDate || new Date(),
        },
        include: {
          items: { include: { product: true } },
          supplier: true,
        },
      });
    });
  }
}
