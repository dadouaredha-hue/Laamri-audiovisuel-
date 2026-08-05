import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Product,
  ExchangeRates,
  Transaction,
  SystemSettings,
  StockLog,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_RATES,
  INITIAL_SETTINGS,
  INITIAL_TRANSACTIONS,
} from '../data/initialData';

export type ActiveTab =
  | 'dashboard'
  | 'products'
  | 'inventory'
  | 'reports'
  | 'quick-entry'
  | 'converter'
  | 'settings';

interface AppContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  products: Product[];
  rates: ExchangeRates;
  transactions: Transaction[];
  settings: SystemSettings;
  stockLogs: StockLog[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategoryFilter: string;
  setSelectedCategoryFilter: (category: string) => void;
  
  // Handlers
  addProduct: (product: Omit<Product, 'id' | 'code' | 'profitDZD' | 'profitMarginPercent' | 'totalCostCNY' | 'totalCostDZD' | 'sellingPriceCNY' | 'rentalPriceDayCNY'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => void;
  adjustStock: (productId: string, quantityChange: number, reason: string) => void;
  
  updateRates: (newRates: Partial<ExchangeRates>) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  resetAllData: () => void;
  
  // Formatters & Helpers
  formatDZD: (val: number) => string;
  formatCNY: (val: number) => string;
  toDZD: (cnyAmount: number) => number;
  toCNY: (dzdAmount: number) => number;
  
  // Modals state
  isProductModalOpen: boolean;
  setIsProductModalOpen: (open: boolean) => void;
  editingProduct: Product | null;
  setEditingProduct: (product: Product | null) => void;
  
  isStockModalOpen: boolean;
  setIsStockModalOpen: (open: boolean) => void;
  stockTargetProduct: Product | null;
  setStockTargetProduct: (product: Product | null) => void;

  isTransactionModalOpen: boolean;
  setIsTransactionModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'av_manager_products_v2',
  RATES: 'av_manager_rates_v2',
  TRANSACTIONS: 'av_manager_transactions_v2',
  SETTINGS: 'av_manager_settings_v2',
  STOCK_LOGS: 'av_manager_stock_logs_v2',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockTargetProduct, setStockTargetProduct] = useState<Product | null>(null);

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  // Initialize state from LocalStorage or initial defaults
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_PRODUCTS;
  });

  const [rates, setRates] = useState<ExchangeRates>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RATES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_RATES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_TRANSACTIONS;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_SETTINGS;
  });

  const [stockLogs, setStockLogs] = useState<StockLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STOCK_LOGS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  // Sync to LocalStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RATES, JSON.stringify(rates));
  }, [rates]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STOCK_LOGS, JSON.stringify(stockLogs));
  }, [stockLogs]);

  // Handle HTML dark mode class
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Recalculate totals helper
  const computeProductMetrics = (
    cnyPurchase: number,
    cnyShipping: number,
    sellingDZD: number,
    rentalDayDZD: number,
    rateCnyDzd: number
  ) => {
    const totalCostCNY = cnyPurchase + cnyShipping;
    const totalCostDZD = totalCostCNY * rateCnyDzd;
    const profitDZD = sellingDZD - totalCostDZD;
    const profitMarginPercent = sellingDZD > 0 ? (profitDZD / sellingDZD) * 100 : 0;
    const sellingPriceCNY = rateCnyDzd > 0 ? sellingDZD / rateCnyDzd : 0;
    const rentalPriceDayCNY = rateCnyDzd > 0 ? rentalDayDZD / rateCnyDzd : 0;

    return {
      totalCostCNY: Number(totalCostCNY.toFixed(2)),
      totalCostDZD: Number(totalCostDZD.toFixed(0)),
      profitDZD: Number(profitDZD.toFixed(0)),
      profitMarginPercent: Number(profitMarginPercent.toFixed(2)),
      sellingPriceCNY: Number(sellingPriceCNY.toFixed(2)),
      rentalPriceDayCNY: Number(rentalPriceDayCNY.toFixed(2)),
    };
  };

  const addProduct = (
    inputData: Omit<Product, 'id' | 'code' | 'profitDZD' | 'profitMarginPercent' | 'totalCostCNY' | 'totalCostDZD' | 'sellingPriceCNY' | 'rentalPriceDayCNY'>
  ) => {
    const id = `prod-${Date.now()}`;
    const code = `AV-${Math.floor(1000 + Math.random() * 9000)}`;
    const metrics = computeProductMetrics(
      inputData.purchasePriceCNY,
      inputData.shippingFeesCNY,
      inputData.sellingPriceDZD,
      inputData.rentalPriceDayDZD,
      rates.CNY_DZD
    );

    const newProduct: Product = {
      ...inputData,
      id,
      code,
      ...metrics,
      totalSalesCount: 0,
      totalRentalsCount: 0,
    };

    setProducts((prev) => [newProduct, ...prev]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, ...updates };
        const metrics = computeProductMetrics(
          updated.purchasePriceCNY,
          updated.shippingFeesCNY,
          updated.sellingPriceDZD,
          updated.rentalPriceDayDZD,
          rates.CNY_DZD
        );

        return {
          ...updated,
          ...metrics,
        };
      })
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const duplicateProduct = (id: string) => {
    const existing = products.find((p) => p.id === id);
    if (!existing) return;

    const copy: Omit<Product, 'id' | 'code' | 'profitDZD' | 'profitMarginPercent' | 'totalCostCNY' | 'totalCostDZD' | 'sellingPriceCNY' | 'rentalPriceDayCNY'> = {
      ...existing,
      name: `${existing.name} (Copie)`,
      serialNumber: existing.serialNumber ? `${existing.serialNumber}-COPY` : undefined,
    };
    addProduct(copy);
  };

  const adjustStock = (productId: string, quantityChange: number, reason: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const newStock = Math.max(0, p.stockQuantity + quantityChange);
        
        // Log the change
        const newLog: StockLog = {
          id: `log-${Date.now()}`,
          productId: p.id,
          productName: p.name,
          date: new Date().toISOString().split('T')[0],
          type: quantityChange > 0 ? 'Entrée' : quantityChange < 0 ? 'Sortie' : 'Ajustement',
          quantityChange,
          newStock,
          reason,
        };
        setStockLogs((logs) => [newLog, ...logs]);

        return { ...p, stockQuantity: newStock };
      })
    );
  };

  const updateRates = (newRates: Partial<ExchangeRates>) => {
    const updated = {
      ...rates,
      ...newRates,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setRates(updated);

    // Automatically recalculate products using latest CNY_DZD
    setProducts((prev) =>
      prev.map((p) => {
        const metrics = computeProductMetrics(
          p.purchasePriceCNY,
          p.shippingFeesCNY,
          p.sellingPriceDZD,
          p.rentalPriceDayDZD,
          updated.CNY_DZD
        );
        return {
          ...p,
          ...metrics,
        };
      })
    );
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `trx-${Date.now()}`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Update stock & counters automatically
    const prod = products.find((p) => p.id === tx.productId);
    if (prod) {
      if (tx.type === 'Vente') {
        adjustStock(tx.productId, -tx.quantity, `Vente à ${tx.clientOrSupplier}`);
        updateProduct(tx.productId, {
          totalSalesCount: (prod.totalSalesCount || 0) + tx.quantity,
        });
      } else if (tx.type === 'Achat') {
        adjustStock(tx.productId, tx.quantity, `Achat fournisseur ${tx.clientOrSupplier}`);
      } else if (tx.type === 'Location') {
        updateProduct(tx.productId, {
          totalRentalsCount: (prod.totalRentalsCount || 0) + tx.quantity,
        });
      }
    }
  };

  const resetAllData = () => {
    setProducts(INITIAL_PRODUCTS);
    setRates(INITIAL_RATES);
    setTransactions(INITIAL_TRANSACTIONS);
    setSettings(INITIAL_SETTINGS);
    setStockLogs([]);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.RATES);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.STOCK_LOGS);
  };

  // Helper currency conversion
  const toDZD = (cnyAmount: number) => {
    return Math.round(cnyAmount * rates.CNY_DZD);
  };

  const toCNY = (dzdAmount: number) => {
    return rates.CNY_DZD > 0 ? Number((dzdAmount / rates.CNY_DZD).toFixed(2)) : 0;
  };

  const formatDZD = (val: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatCNY = (val: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      maximumFractionDigits: 2,
    }).format(val);
  };

  const contextValue = useMemo(
    () => ({
      activeTab,
      setActiveTab,
      products,
      rates,
      transactions,
      settings,
      stockLogs,
      searchQuery,
      setSearchQuery,
      selectedCategoryFilter,
      setSelectedCategoryFilter,
      addProduct,
      updateProduct,
      deleteProduct,
      duplicateProduct,
      adjustStock,
      updateRates,
      updateSettings,
      addTransaction,
      resetAllData,
      formatDZD,
      formatCNY,
      toDZD,
      toCNY,
      isProductModalOpen,
      setIsProductModalOpen,
      editingProduct,
      setEditingProduct,
      isStockModalOpen,
      setIsStockModalOpen,
      stockTargetProduct,
      setStockTargetProduct,
      isTransactionModalOpen,
      setIsTransactionModalOpen,
    }),
    [
      activeTab,
      products,
      rates,
      transactions,
      settings,
      stockLogs,
      searchQuery,
      selectedCategoryFilter,
      isProductModalOpen,
      editingProduct,
      isStockModalOpen,
      stockTargetProduct,
      isTransactionModalOpen,
    ]
  );

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
