import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Format email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Le nom doit comporter au moins 2 caractères'),
  email: z.string().email('Format email invalide'),
  password: z.string().min(6, 'Le mot de passe doit comporter au moins 6 caractères'),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF']).default('STAFF'),
});

export const ProductCreateSchema = z.object({
  sku: z.string().min(2, 'Le code SKU est requis').toUpperCase(),
  name: z.string().min(2, 'Le nom du produit est requis'),
  description: z.string().optional(),
  unit: z.string().default('kg'),
  purchasePrice: z.number().min(0, "Le prix d'achat doit être positif ou nul"),
  salePrice: z.number().min(0, 'Le prix de vente doit être positif ou nul'),
  reorderLevel: z.number().min(0, "Le seuil d'alerte doit être positif ou nul").default(10),
});

export const ProductUpdateSchema = ProductCreateSchema.partial().extend({
  active: z.boolean().optional(),
});

export const StockAdjustmentSchema = z.object({
  productId: z.string().uuid('ID produit invalide'),
  quantity: z.number().refine((q) => q !== 0, 'La quantité ne peut pas être 0'),
  note: z.string().min(3, "Un motif d'ajustement est obligatoire"),
});

export const CustomerCreateSchema = z.object({
  code: z.string().min(2, 'Le code client est requis').toUpperCase(),
  name: z.string().min(2, 'Le nom du client est requis'),
  businessName: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().default('Lomé'),
  creditLimit: z.number().min(0).default(0),
});

export const CustomerUpdateSchema = CustomerCreateSchema.partial().extend({
  active: z.boolean().optional(),
});

export const SupplierCreateSchema = z.object({
  code: z.string().min(2, 'Le code fournisseur est requis').toUpperCase(),
  name: z.string().min(2, 'Le nom du fournisseur est requis'),
  company: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  country: z.string().default('Sénégal'),
});

export const SupplierUpdateSchema = SupplierCreateSchema.partial().extend({
  active: z.boolean().optional(),
});

export const ShipmentItemSchema = z.object({
  productId: z.string().uuid('ID produit invalide'),
  quantity: z.number().positive('La quantité doit être supérieure à 0'),
  unitCost: z.number().min(0, 'Le coût unitaire doit être positif ou nul'),
});

export const ShipmentCreateSchema = z.object({
  reference: z.string().min(2, 'La référence est requise').toUpperCase(),
  supplierId: z.string().uuid('ID fournisseur invalide'),
  origin: z.string().default('Sénégal (Dakar)'),
  destination: z.string().default('Togo (Lomé)'),
  status: z.enum(['PLANNED', 'IN_TRANSIT', 'RECEIVED', 'CANCELLED']).default('PLANNED'),
  departureDate: z.string().optional().nullable(),
  arrivalDate: z.string().optional().nullable(),
  transportCost: z.number().min(0).default(0),
  otherCosts: z.number().min(0).default(0),
  notes: z.string().optional(),
  items: z.array(ShipmentItemSchema).min(1, "L'arrivage doit comporter au moins un produit"),
});

export const ShipmentStatusUpdateSchema = z.object({
  status: z.enum(['PLANNED', 'IN_TRANSIT', 'RECEIVED', 'CANCELLED']),
  arrivalDate: z.string().optional().nullable(),
});

export const OrderItemSchema = z.object({
  productId: z.string().uuid('ID produit invalide'),
  quantity: z.number().positive('La quantité doit être supérieure à 0'),
  unitPrice: z.number().min(0, 'Le prix unitaire doit être positif ou nul'),
});

export const OrderCreateSchema = z.object({
  customerId: z.string().uuid('ID client invalide').optional().nullable(),
  items: z.array(OrderItemSchema).min(1, 'La commande doit comporter au moins un article'),
  paidAmount: z.number().min(0, 'Le montant payé ne peut pas être négatif').default(0),
  paymentMethod: z.enum(['CASH', 'TMONEY', 'MOOV_MONEY', 'BANK_TRANSFER', 'OTHER']).default('CASH'),
  discount: z.number().min(0).default(0),
  dueDate: z.string().optional().nullable(),
  notes: z.string().optional(),
});

export const PaymentCreateSchema = z.object({
  orderId: z.string().uuid('ID commande invalide').optional().nullable(),
  customerId: z.string().uuid('ID client invalide').optional().nullable(),
  amount: z.number().positive('Le montant doit être supérieur à 0'),
  method: z.enum(['CASH', 'TMONEY', 'MOOV_MONEY', 'BANK_TRANSFER', 'OTHER']).default('CASH'),
  note: z.string().optional(),
});

export const ExpenseCreateSchema = z.object({
  category: z.enum([
    'ACHAT',
    'TRANSPORT',
    'LIVRAISON',
    'CARBURANT',
    'COMMUNICATION',
    'MANUTENTION',
    'AUTRE',
  ]),
  amount: z.number().positive('Le montant de la dépense doit être supérieur à 0'),
  description: z.string().min(2, 'La description est requise'),
  expenseDate: z.string().optional(),
  shipmentId: z.string().uuid('ID arrivage invalide').optional().nullable(),
});
