export type ProductCategory =
  | 'Boitier'
  | 'Objectif'
  | 'Eclairage'
  | 'Son'
  | 'Drone'
  | 'Accessoire'
  | 'Ecran & Transmetteur'
  | 'Divers';

export type StockStatus = 'OK' | 'Low Stock' | 'Out of Stock';

export interface Product {
  id: string;
  code: string; // e.g. "AV-2026-001"
  name: string;
  category: ProductCategory;
  brand: string;
  purchasePriceCNY: number;
  shippingFeesCNY: number;
  totalCostCNY: number; // purchasePriceCNY + shippingFeesCNY
  totalCostDZD: number; // totalCostCNY * CNY_DZD
  sellingPriceDZD: number; // Prix de vente en DZD
  sellingPriceCNY: number; // Prix de vente converti en CNY
  rentalPriceDayDZD: number; // Tarif location jour DZD
  rentalPriceDayCNY: number; // Tarif location jour CNY
  profitDZD: number; // sellingPriceDZD - totalCostDZD
  profitMarginPercent: number; // (profitDZD / sellingPriceDZD) * 100
  stockQuantity: number;
  minStock: number;
  maxStock: number;
  purchaseDate: string; // YYYY-MM-DD
  supplier: string;
  serialNumber?: string;
  imageUrl?: string;
  notes?: string;
  totalSalesCount?: number;
  totalRentalsCount?: number;
}

export interface ExchangeRates {
  CNY_DZD: number; // e.g., 18.35 (1 Yuan = 18.35 Dinars Algériens)
  lastUpdated: string;
}

export type TransactionType = 'Achat' | 'Vente' | 'Location';

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  productId: string;
  productName: string;
  category: ProductCategory;
  quantity: number;
  unitPriceCNY: number;
  unitPriceDZD: number;
  totalAmountCNY: number;
  totalAmountDZD: number;
  clientOrSupplier: string;
  status: 'Payé' | 'En attente' | 'Annulé';
  rentalDays?: number;
  rentalStartDate?: string;
  rentalDueDate?: string;
  rentalStatus?: 'En cours' | 'Retourné' | 'En retard';
  notes?: string;
}

export interface StockLog {
  id: string;
  productId: string;
  productName: string;
  date: string;
  type: 'Entrée' | 'Sortie' | 'Ajustement';
  quantityChange: number;
  newStock: number;
  reason: string;
}

export interface SystemSettings {
  defaultCurrency: 'CNY' | 'DZD' | 'BOTH';
  theme: 'dark' | 'light';
  companyName: string;
  taxRatePercent: number;
  autoCalculateDZD: boolean;
  lowStockAlertsEnabled: boolean;
}
