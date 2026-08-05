import React, { useState } from 'react';
import {
  Search,
  Plus,
  Zap,
  Moon,
  Sun,
  Bell,
  Coins,
  ChevronDown,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    settings,
    updateSettings,
    setIsProductModalOpen,
    setEditingProduct,
    setIsTransactionModalOpen,
    products,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);

  const lowStockProducts = products.filter(
    (p) => p.stockQuantity <= p.minStock
  );

  const titles: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Tableau de Bord',
      subtitle: 'Vue d’ensemble des performances financières et matérielles',
    },
    products: {
      title: 'Catalogue des Produits',
      subtitle: 'Gestion globale des équipements, coûts d’importation et prix de vente',
    },
    inventory: {
      title: 'Gestion des Stocks & Inventaire',
      subtitle: 'Suivi en temps réel des niveaux de stock, seuils et valeurs immobilisées',
    },
    reports: {
      title: 'Rapports & Analyses Financières',
      subtitle: 'Analyse détaillée des marges, du chiffre d’affaires et de la rentabilité',
    },
    'quick-entry': {
      title: 'Saisie Rapide des Transactions',
      subtitle: 'Enregistrement accéléré d’achats, ventes directes et locations',
    },
    converter: {
      title: 'Convertisseur & Taux de Change',
      subtitle: 'Gestion dynamique des devises (CNY, DZD)',
    },
    settings: {
      title: 'Paramètres du Système',
      subtitle: 'Configuration des préférences, devises et sauvegardes',
    },
  };

  const currentInfo = titles[activeTab] || titles.dashboard;

  const handleAddNewProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleOpenTransaction = () => {
    setIsTransactionModalOpen(true);
  };

  return (
    <header className="h-16 sticky top-0 z-20 bg-zinc-950 border-b border-zinc-800 px-8 flex items-center justify-between transition-colors">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm font-medium">
        <span className="text-zinc-500">Navigation /</span>
        <span className="text-zinc-100 font-semibold">{currentInfo.title}</span>
      </div>

      {/* Right Action Bar */}
      <div className="flex items-center gap-3">
        {/* Search Bar - Rounded Pill */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 pl-9 pr-8 py-2 rounded-full w-64 focus:outline-none focus:border-blue-500 placeholder:text-zinc-500 font-sans transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-200"
            >
              ✕
            </button>
          )}
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center bg-zinc-900 p-0.5 rounded-full border border-zinc-800 text-[11px] font-mono font-semibold">
          <button
            onClick={() => updateSettings({ defaultCurrency: 'DZD' })}
            className={`px-3 py-1 rounded-full transition-all ${
              settings.defaultCurrency === 'DZD'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            DZD (DA)
          </button>
          <button
            onClick={() => updateSettings({ defaultCurrency: 'CNY' })}
            className={`px-3 py-1 rounded-full transition-all ${
              settings.defaultCurrency === 'CNY'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            CNY (¥)
          </button>
          <button
            onClick={() => updateSettings({ defaultCurrency: 'BOTH' })}
            className={`px-3 py-1 rounded-full transition-all ${
              settings.defaultCurrency === 'BOTH'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            DZD + CNY
          </button>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
            title="Alertes de stock"
          >
            <Bell className="w-4 h-4" />
            {lowStockProducts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-[9px] font-mono font-bold text-zinc-950 flex items-center justify-center animate-pulse">
                {lowStockProducts.length}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 p-3 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  Alertes Stock ({lowStockProducts.length})
                </span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-zinc-500 hover:text-zinc-300"
                >
                  Fermer
                </button>
              </div>
              {lowStockProducts.length === 0 ? (
                <p className="text-xs text-emerald-400 font-medium text-center py-2">
                  ✓ Tous les stocks sont optimaux.
                </p>
              ) : (
                <div className="max-h-56 overflow-y-auto space-y-1.5 custom-scrollbar">
                  {lowStockProducts.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setActiveTab('inventory');
                        setShowNotifications(false);
                      }}
                      className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 cursor-pointer text-xs flex justify-between items-center transition"
                    >
                      <div className="truncate pr-2">
                        <p className="font-semibold text-zinc-200 truncate">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-mono">
                          Stock: <strong className="text-amber-400">{item.stockQuantity}</strong> (Min: {item.minStock})
                        </p>
                      </div>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                        {item.stockQuantity === 0 ? 'Rupture' : 'Bas'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Transaction Button */}
        <button
          onClick={handleOpenTransaction}
          className="flex items-center space-x-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 px-3 py-1.5 rounded-full text-xs font-semibold transition border border-zinc-800 shadow-sm"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>+ Transaction</span>
        </button>

        {/* New Product Action Button */}
        <button
          onClick={handleAddNewProduct}
          className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-md transition transform active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Produit</span>
        </button>

        {/* Avatar badge */}
        <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-xs font-mono font-bold text-zinc-300">
          PRO
        </div>
      </div>
    </header>
  );
};
