import { prisma } from '../lib/prisma.js';
import { StockSummary } from '../types/index.js';

export class ProductService {
  /**
   * Calcule le stock exact d'un produit à partir de la somme de ses mouvements
   */
  static async getProductStock(productId: string): Promise<number> {
    const movements = await prisma.stockMovement.findMany({
      where: { productId },
      select: { type: true, quantity: true },
    });

    return movements.reduce((acc, m) => {
      if (m.type === 'IN') return acc + m.quantity;
      if (m.type === 'OUT') return acc - m.quantity;
      if (m.type === 'ADJUSTMENT') return acc + m.quantity;
      return acc;
    }, 0);
  }

  /**
   * Retourne tous les produits avec leur stock calculé et statut de réapprovisionnement
   */
  static async getAllProducts(includeInactive = false): Promise<StockSummary[]> {
    const products = await prisma.product.findMany({
      where: includeInactive ? undefined : { active: true },
      orderBy: { name: 'asc' },
      include: {
        stockMovements: {
          select: { type: true, quantity: true },
        },
      },
    });

    return products.map((p) => {
      const currentStock = p.stockMovements.reduce((acc, m) => {
        if (m.type === 'IN') return acc + m.quantity;
        if (m.type === 'OUT') return acc - m.quantity;
        if (m.type === 'ADJUSTMENT') return acc + m.quantity;
        return acc;
      }, 0);

      const isLowStock = currentStock <= p.reorderLevel;
      const stockValue = Math.max(0, currentStock) * p.salePrice;

      return {
        productId: p.id,
        sku: p.sku,
        name: p.name,
        description: p.description || '',
        unit: p.unit,
        purchasePrice: p.purchasePrice,
        salePrice: p.salePrice,
        reorderLevel: p.reorderLevel,
        currentStock: Number(currentStock.toFixed(3)),
        isLowStock,
        stockValue: Math.round(stockValue),
        active: p.active,
        createdAt: p.createdAt,
      } as unknown as StockSummary;
    });
  }

  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!product) {
      throw new Error('Produit introuvable');
    }

    const currentStock = await this.getProductStock(product.id);

    return {
      ...product,
      currentStock: Number(currentStock.toFixed(3)),
      isLowStock: currentStock <= product.reorderLevel,
      stockValue: Math.round(Math.max(0, currentStock) * product.salePrice),
    };
  }

  static async createProduct(data: {
    sku: string;
    name: string;
    description?: string;
    unit?: string;
    purchasePrice: number;
    salePrice: number;
    reorderLevel?: number;
  }) {
    const existing = await prisma.product.findUnique({
      where: { sku: data.sku },
    });

    if (existing) {
      throw new Error(`Le code SKU ${data.sku} existe déjà`);
    }

    return prisma.product.create({
      data: {
        sku: data.sku,
        name: data.name,
        description: data.description,
        unit: data.unit || 'kg',
        purchasePrice: data.purchasePrice,
        salePrice: data.salePrice,
        reorderLevel: data.reorderLevel ?? 10,
        active: true,
      },
    });
  }

  static async updateProduct(
    id: string,
    data: {
      sku?: string;
      name?: string;
      description?: string;
      unit?: string;
      purchasePrice?: number;
      salePrice?: number;
      reorderLevel?: number;
      active?: boolean;
    }
  ) {
    return prisma.product.update({
      where: { id },
      data,
    });
  }

  static async adjustStock(data: {
    productId: string;
    quantity: number;
    note: string;
  }) {
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new Error('Produit introuvable');
    }

    const currentStock = await this.getProductStock(product.id);
    const newStock = currentStock + data.quantity;

    if (newStock < 0) {
      throw new Error(
        `Impossible d'effectuer l'ajustement : le stock résultant serait négatif (${newStock.toFixed(2)} ${product.unit}). Stock actuel : ${currentStock.toFixed(2)} ${product.unit}`
      );
    }

    const movement = await prisma.stockMovement.create({
      data: {
        productId: product.id,
        type: 'ADJUSTMENT',
        quantity: data.quantity,
        unitCost: product.purchasePrice,
        reference: `ADJ-${Date.now()}`,
        note: data.note,
      },
    });

    return {
      movement,
      previousStock: currentStock,
      newStock,
    };
  }

  static async getLowStockAlerts() {
    const all = await this.getAllProducts(false);
    return all.filter((p) => p.isLowStock);
  }
}
