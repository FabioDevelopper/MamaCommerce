import { Request } from 'express';

export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF';

export type OrderStatus = 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';

export type PaymentMethod =
  | 'CASH'
  | 'TMONEY'
  | 'MOOV_MONEY'
  | 'BANK_TRANSFER'
  | 'OTHER';

export type ShipmentStatus =
  | 'PLANNED'
  | 'IN_TRANSIT'
  | 'RECEIVED'
  | 'CANCELLED';

export type StockMovementType = 'IN' | 'OUT' | 'ADJUSTMENT';

export type ExpenseCategory =
  | 'ACHAT'
  | 'TRANSPORT'
  | 'LIVRAISON'
  | 'CARBURANT'
  | 'COMMUNICATION'
  | 'MANUTENTION'
  | 'AUTRE';

export interface UserPayload {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface StockSummary {
  productId: string;
  sku: string;
  name: string;
  unit: string;
  purchasePrice: number;
  salePrice: number;
  reorderLevel: number;
  currentStock: number;
  isLowStock: boolean;
  stockValue: number;
}
