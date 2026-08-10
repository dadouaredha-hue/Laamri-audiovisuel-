import React, { useState, useMemo } from 'react';
import {
  Wallet,
  TrendingUp,
  DollarSign,
  Percent,
  Layers,
  ArrowUpRight,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  ShoppingBag,
  Zap,
  Boxes,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { KPICard } from './KPICard';
import { Product, ProductCategory } from '../types';
import { PRODUCT_CATEGORIES } from '../constants/categories';

export const DashboardView: React.FC = () => {
  const {
    products,
    transactions,
    rates,
    formatDZD,
    formatCNY,
    toDZD,
    searchQuery,
    setEditingProduct,
    setIsProductModalOpen,
    deleteProduct,
    setIsStockModalOpen,
    setStockTargetProduct,
    setIsTransactionModalOpen,
    setTransactionTargetProduct,
    returnRental,
    setActiveTab,
  } = useApp();

  // Selected table category filter
  const [tableCategory, setTableCategory] = useState<string>('All');
  const [stockStatusFilter, setStockStatusFilter] = useState<string>('All');
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Month-over-month sales trend calculation
  const realSalesTrend = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let currentMonthTotal = 0;
    let lastMonthTotal = 0;

    transactions.forEach((t) => {
      if (t.status !== 'Payé') return;
      const tDate = new Date(t.date);
      if (isNaN(tDate.getTime())) return;

      if (tDate.getFullYear() === currentYear && tDate.getMonth() === currentMonth) {
        currentMonthTotal += t.totalAmountDZD;
      } else if (
        (currentMonth === 0 && tDate.getFullYear() === currentYear - 1 && tDate.getMonth() === 11) ||
        (tDate.getFullYear() === currentYear && tDate.getMonth() === currentMonth - 1)
      ) {
        lastMonthTotal += t.totalAmountDZD;
      }
    });

    if (lastMonthTotal === 0) return undefined;
    return Number((((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100).toFixed(1));
  }, [transactions]);

  // KPI Calculations
  const metrics = useMemo(() => {
    let totalInvestmentCNY = 0;
    let totalInvestmentDZD = 0;
    let totalPotentialRevenueDZD = 0;
    let totalPotentialRevenueCNY = 0;
    let totalProfitDZD = 0;
    let totalShippingCNY = 0;
    let totalPurchaseCostCNY = 0;

    products.forEach((p) => {
      totalInvestmentCNY += p.totalCostCNY * p.stockQuantity;
      totalInvestmentDZD += p.totalCostDZD * p.stockQuantity;
      totalPurchaseCostCNY += p.purchasePriceCNY * p.stockQuantity;
      totalShippingCNY += p.shippingFeesCNY * p.stockQuantity;

      totalPotentialRevenueDZD += p.sellingPriceDZD * p.stockQuantity;
      totalPotentialRevenueCNY += p.sellingPriceCNY * p.stockQuantity;
      totalProfitDZD += p.profitDZD * p.stockQuantity;
    });

    // Transactions revenue
    const realizedRevenueDZD = transactions
      .filter((t) => t.status === 'Payé')
      .reduce((acc, t) => acc + t.totalAmountDZD, 0);

    const realizedRevenueCNY = transactions
      .filter((t) => t.status === 'Payé')
      .reduce((acc, t) => acc + t.totalAmountCNY, 0);

    const averageMarginPercent =
      totalPotentialRevenueDZD > 0
        ? ((totalProfitDZD / totalPotentialRevenueDZD) * 100).toFixed(1)
        : '0';

    return {
      totalInvestmentCNY,
      totalInvestmentDZD,
      totalPotentialRevenueCNY,
      totalPotentialRevenueDZD,
      realizedRevenueCNY,
      realizedRevenueDZD,
      totalProfitDZD,
      averageMarginPercent,
      totalPurchaseCostCNY,
      totalShippingCNY,
      totalProductsCount: products.length,
      totalStockItems: products.reduce((acc, p) => acc + p.stockQuantity, 0),
    };
  }, [products, transactions]);

  // Chart 1 Data: Expense Breakdown in CNY
  const expenseData = useMemo(() => {
    return [
      { name: 'Achat Matériel (Prix Produit)', value: metrics.totalPurchaseCostCNY, color: '#3b82f6' }, // Blue
      { name: 'Frais de Port & Transit', value: metrics.totalShippingCNY, color: '#06b6d4' }, // Cyan
    ];
  }, [metrics]);

  // Chart 2 Data: Profit by Category in DZD
  const categoryProfitData = useMemo(() => {
    const categoriesMap: Record<string, { totalProfit: number; totalValue: number; count: number }> = {};

    products.forEach((p) => {
      if (!categoriesMap[p.category]) {
        categoriesMap[p.category] = { totalProfit: 0, totalValue: 0, count: 0 };
      }
      categoriesMap[p.category].totalProfit += p.profitDZD * p.stockQuantity;
      categoriesMap[p.category].totalValue += p.totalCostDZD * p.stockQuantity;
      categoriesMap[p.category].count += p.stockQuantity;
    });

    return Object.entries(categoriesMap).map(([cat, val]) => ({
      category: cat,
      Bénéfice: Math.round(val.totalProfit),
      ValeurStock: Math.round(val.totalValue),
    }));
  }, [products]);

  // Filter products for the table
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.supplier.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = tableCategory === 'All' || p.category === tableCategory;

      let matchesStock = true;
      if (stockStatusFilter === 'OK') matchesStock = p.stockQuantity > p.minStock;
      if (stockStatusFilter === 'Low Stock') matchesStock = p.stockQuantity <= p.minStock && p.stockQuantity > 0;
      if (stockStatusFilter === 'Out of Stock') matchesStock = p.stockQuantity === 0;

      return matchesSearch && matchesCat && matchesStock;
    });
  }, [products, searchQuery, tableCategory, stockStatusFilter]);

  const categoriesList: ProductCategory[] = [
    'Boitier',
    'Objectif',
    'Eclairage',
    'Son',
    'Drone',
    'Accessoire',
    'Ecran & Transmetteur',
    'Divers',
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Top KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Investissement Total"
          cnyValue={metrics.totalInvestmentCNY}
          dzdValue={metrics.totalInvestmentDZD}
          trendLabel="Valeur du Stock"
          icon={Wallet}
        />

        <KPICard
          title="CA Potentiel"
          cnyValue={metrics.totalPotentialRevenueCNY}
          dzdValue={metrics.totalPotentialRevenueDZD}
          trendPercent={realSalesTrend}
          trendLabel={realSalesTrend !== undefined ? "Évolution vs mois dernier" : "Valeur Vente Totale"}
          icon={TrendingUp}
        />

        <KPICard
          title="Bénéfice Total (DZD)"
          cnyValue={0}
          dzdValue={metrics.totalProfitDZD}
          formattedPrimary={formatDZD(metrics.totalProfitDZD)}
          trendLabel="Marge nette globale"
          icon={DollarSign}
        />

        <KPICard
          title="Marge Moyenne"
          cnyValue={0}
          formattedPrimary={`${metrics.averageMarginPercent}%`}
          formattedSecondary="Rentabilité"
          trendLabel="Sur le catalogue"
          icon={Percent}
          isCurrency={false}
        />

        <KPICard
          title="Références & Stock"
          cnyValue={0}
          formattedPrimary={`${metrics.totalProductsCount} Réf.`}
          formattedSecondary={`${metrics.totalStockItems} unités en stock`}
          trendLabel="Équipements répertoriés"
          icon={Layers}
          isCurrency={false}
        />
      </div>

      {/* 2. Visual Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense Breakdown Doughnut */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-zinc-100">
                Répartition des Dépenses d'Import (CNY)
              </h3>
              <p className="text-[11px] text-zinc-500">
                Coût d'achat pur vs Frais de port
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
              Ratio Cost
            </span>
          </div>

          <div className="h-56 w-full relative my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [formatCNY(value), 'Montant']}
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '0.5rem',
                    color: '#fafafa',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold">Total Dépenses</span>
              <span className="text-sm font-bold text-zinc-100 font-mono">
                {formatCNY(metrics.totalInvestmentCNY)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-zinc-800">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded bg-blue-500 shrink-0" />
              <div className="truncate">
                <p className="text-zinc-500 text-[10px]">Achat Produits</p>
                <p className="font-bold text-zinc-200 font-mono text-[11px]">
                  {formatCNY(metrics.totalPurchaseCostCNY)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded bg-cyan-500 shrink-0" />
              <div className="truncate">
                <p className="text-zinc-500 text-[10px]">Frais d'Envoi</p>
                <p className="font-bold text-zinc-200 font-mono text-[11px]">
                  {formatCNY(metrics.totalShippingCNY)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Profitability & Stock Value per Category Bar Chart */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-100">
                Bénéfice Potentiel par Catégorie Matériel (DZD)
              </h3>
              <p className="text-[11px] text-zinc-500">
                Comparatif de la valeur de stock et du bénéfice généré en Dinars
              </p>
            </div>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              Analyse complète <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryProfitData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} />
                <XAxis dataKey="category" stroke="#71717a" fontSize={10} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                <Tooltip
                  formatter={(val: number) => [formatDZD(val), '']}
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '0.5rem',
                    color: '#fafafa',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="ValeurStock" name="Valeur Stock (DZD)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Bénéfice" name="Bénéfice estimé (DZD)" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Main Products Table Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 shadow-sm space-y-4">
        {/* Table Header Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-blue-400" />
              Liste Principale des Équipements AV
            </h2>
            <p className="text-xs text-zinc-500">
              Affichage {filteredProducts.length} sur {products.length} références au catalogue
            </p>
          </div>

          {/* Filters Bar */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            {/* Category Select */}
            <select
              value={tableCategory}
              onChange={(e) => setTableCategory(e.target.value)}
              className="bg-zinc-950 text-zinc-200 border border-zinc-800 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-medium text-xs"
            >
              <option value="All">Toutes Catégories</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Stock Status Select */}
            <select
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value)}
              className="bg-zinc-950 text-zinc-200 border border-zinc-800 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-medium text-xs"
            >
              <option value="All">Tous Statuts Stock</option>
              <option value="OK">Stock OK</option>
              <option value="Low Stock">Stock Bas</option>
              <option value="Out of Stock">Rupture de Stock</option>
            </select>

            <button
              onClick={() => {
                setTableCategory('All');
                setStockStatusFilter('All');
              }}
              className="p-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
              title="Réinitialiser les filtres"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto rounded-md border border-zinc-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-950/60 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider border-b border-zinc-800">
                <th className="p-3">Réf / Produit</th>
                <th className="p-3">Catégorie</th>
                <th className="p-3">Prix Achat (CNY)</th>
                <th className="p-3">Port (CNY)</th>
                <th className="p-3">Coût Total (DZD)</th>
                <th className="p-3">Prix Vente (DZD)</th>
                <th className="p-3">Bénéfice Unitaire</th>
                <th className="p-3">Stock Status</th>
                <th className="p-3">Fournisseur</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-zinc-500">
                    Aucun équipement ne correspond à vos critères de recherche.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.stockQuantity <= p.minStock && p.stockQuantity > 0;
                  const isOut = p.stockQuantity === 0;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-zinc-800/40 transition-colors group text-zinc-200"
                    >
                      {/* Product Thumbnail & Name */}
                      <td className="p-3 max-w-[220px]">
                        <div className="flex items-center space-x-3">
                          <img
                            src={p.imageUrl || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=100&q=80'}
                            alt={p.name}
                            className="w-9 h-9 rounded object-cover bg-zinc-950 shrink-0 border border-zinc-800"
                          />
                          <div className="truncate">
                            <p className="font-bold text-zinc-100 truncate">
                              {p.name}
                            </p>
                            <p className="text-[10px] text-zinc-500 font-mono">
                              {p.code} • {p.brand}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-semibold border border-zinc-700/60">
                          {p.category}
                        </span>
                      </td>

                      {/* Purchase Price CNY */}
                      <td className="p-3 font-mono text-zinc-300">
                        {formatCNY(p.purchasePriceCNY)}
                      </td>

                      {/* Shipping Fees CNY */}
                      <td className="p-3 font-mono text-zinc-400">
                        {formatCNY(p.shippingFeesCNY)}
                      </td>

                      {/* Total Cost DZD */}
                      <td className="p-3 font-mono font-bold text-zinc-100">
                        {formatDZD(p.totalCostDZD)}
                        <span className="block text-[10px] text-blue-400 font-medium">
                          ≈ {formatCNY(p.totalCostCNY)}
                        </span>
                      </td>

                      {/* Selling Price DZD */}
                      <td className="p-3 font-mono font-semibold text-emerald-400">
                        {formatDZD(p.sellingPriceDZD)}
                        <span className="block text-[10px] text-zinc-400">
                          Loc: {formatDZD(p.rentalPriceDayDZD)}/j
                        </span>
                      </td>

                      {/* Profit DZD & % */}
                      <td className="p-3 font-mono">
                        <span className="font-bold text-emerald-400">
                          +{formatDZD(p.profitDZD)}
                        </span>
                        <span className="block text-[10px] font-semibold text-amber-400">
                          {p.profitMarginPercent.toFixed(1)}% marge
                        </span>
                      </td>

                      {/* Stock Status Badge */}
                      <td className="p-3">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold text-center w-fit uppercase ${
                              isOut
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : isLow
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {isOut ? 'Rupture' : isLow ? 'Stock Bas' : 'En Stock'}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {p.stockQuantity} / {p.maxStock} un.
                          </span>
                        </div>
                      </td>

                      {/* Supplier */}
                      <td className="p-3 text-zinc-400 text-[11px] truncate max-w-[120px]">
                        {p.supplier}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1">
                          {/* Quick Stock Adjustment */}
                          <button
                            onClick={() => {
                              setStockTargetProduct(p);
                              setIsStockModalOpen(true);
                            }}
                            className="p-1.5 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition"
                            title="Ajuster le stock"
                          >
                            <Boxes className="w-3.5 h-3.5" />
                          </button>

                          {/* Record Transaction */}
                          <button
                            onClick={() => {
                              setTransactionTargetProduct(p);
                              setIsTransactionModalOpen(true);
                            }}
                            className="p-1.5 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition"
                            title="Vendre / Louer cet équipement"
                          >
                            <Zap className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Product */}
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setIsProductModalOpen(true);
                            }}
                            className="p-1.5 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition"
                            title="Modifier"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => deleteProduct(p.id)}
                            className="p-1.5 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
