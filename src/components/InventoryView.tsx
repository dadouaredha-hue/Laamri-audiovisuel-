import React, { useMemo, useState } from 'react';
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  PieChart as PieIcon,
  TrendingUp,
  History,
  Coins,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { useApp } from '../context/AppContext';

export const InventoryView: React.FC = () => {
  const {
    products,
    stockLogs,
    formatDZD,
    formatCNY,
    setIsStockModalOpen,
    setStockTargetProduct,
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Stock Metrics Calculations
  const metrics = useMemo(() => {
    let totalValueDZD = 0;
    let totalValueCNY = 0;
    let inStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach((p) => {
      totalValueDZD += p.totalCostDZD * p.stockQuantity;
      totalValueCNY += p.totalCostCNY * p.stockQuantity;

      if (p.stockQuantity === 0) {
        outOfStockCount++;
      } else if (p.stockQuantity <= p.minStock) {
        lowStockCount++;
      } else {
        inStockCount++;
      }
    });

    return {
      totalValueDZD,
      totalValueCNY,
      totalReferences: products.length,
      inStockCount,
      lowStockCount,
      outOfStockCount,
    };
  }, [products]);

  // Chart 1: Category Stock Value Distribution (Pie/Doughnut) in DZD
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#3b82f6', '#64748b'];

    products.forEach((p) => {
      map[p.category] = (map[p.category] || 0) + p.totalCostDZD * p.stockQuantity;
    });

    return Object.entries(map).map(([name, value], i) => ({
      name,
      value: Math.round(value),
      color: COLORS[i % COLORS.length],
    }));
  }, [products]);

  // Chart 2: Top 5 Profit Drivers in DZD (Horizontal Bar Chart)
  const topProfitDrivers = useMemo(() => {
    return [...products]
      .sort((a, b) => b.profitDZD * b.stockQuantity - a.profitDZD * a.stockQuantity)
      .slice(0, 5)
      .map((p) => ({
        name: p.name.length > 20 ? `${p.name.substring(0, 20)}...` : p.name,
        BénéficeTotal: Math.round(p.profitDZD * p.stockQuantity),
        ValeurUnitaire: Math.round(p.profitDZD),
      }));
  }, [products]);

  // Filtered products list for stock table
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (filterStatus === 'InStock') return p.stockQuantity > p.minStock;
      if (filterStatus === 'LowStock') return p.stockQuantity <= p.minStock && p.stockQuantity > 0;
      if (filterStatus === 'OutOfStock') return p.stockQuantity === 0;
      return true;
    });
  }, [products, filterStatus]);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Stock Metrics Summary Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stock Value */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
              Valeur Totale du Stock
            </span>
            <span className="text-xl font-extrabold text-zinc-100 font-mono block mt-1">
              {formatDZD(metrics.totalValueDZD)}
            </span>
            <span className="text-xs font-semibold text-blue-400 font-mono block mt-0.5">
              ≈ {formatCNY(metrics.totalValueCNY)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-md bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        {/* En Stock (Optimal) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
              Stock Optimal
            </span>
            <span className="text-xl font-extrabold text-emerald-400 font-mono block mt-1">
              {metrics.inStockCount} Réf.
            </span>
            <span className="text-xs text-zinc-500 block mt-0.5">
              Niveau supérieur aux seuils
            </span>
          </div>
          <div className="w-10 h-10 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Stock Bas (Alert) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
              Alertes Stock Bas
            </span>
            <span className="text-xl font-extrabold text-amber-400 font-mono block mt-1">
              {metrics.lowStockCount} Réf.
            </span>
            <span className="text-xs text-amber-400/80 block mt-0.5">
              Proche du seuil d'alerte
            </span>
          </div>
          <div className="w-10 h-10 rounded-md bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Rupture de Stock */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
              Ruptures de Stock
            </span>
            <span className="text-xl font-extrabold text-rose-400 font-mono block mt-1">
              {metrics.outOfStockCount} Réf.
            </span>
            <span className="text-xs text-rose-400/80 block mt-0.5">
              Réapprovisionnement requis
            </span>
          </div>
          <div className="w-10 h-10 rounded-md bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category Stock Distribution Pie Chart */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-blue-400" />
                Répartition de la Valeur Immobilisée par Catégorie (DZD)
              </h3>
              <p className="text-xs text-zinc-500">
                Immobilisation du capital en Dinars par famille de matériel
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={45}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '6px', color: '#fafafa' }}
                  formatter={(value: number) => [formatDZD(value), 'Valeur Stock']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 Profit Drivers Horizontal Bar */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Top 5 Générateurs de Bénéfice (DZD)
              </h3>
              <p className="text-xs text-zinc-500">
                Produits avec le plus fort potentiel de marge en stock
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={topProfitDrivers}
                margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} />
                <XAxis type="number" stroke="#71717a" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={10} width={130} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '6px', color: '#fafafa' }}
                  formatter={(val: number) => [formatDZD(val), 'Bénéfice Potentiel']}
                />
                <Bar dataKey="BénéficeTotal" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Main Stock Control Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-blue-400" />
              Tableau de Contrôle des Stocks
            </h3>
            <p className="text-xs text-zinc-500">
              Ajustement rapide des quantités et vérification des seuils d'alerte
            </p>
          </div>

          {/* Quick Filter Badges */}
          <div className="flex items-center space-x-1.5 text-xs">
            <button
              onClick={() => setFilterStatus('All')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                filterStatus === 'All'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
              }`}
            >
              Tous ({products.length})
            </button>
            <button
              onClick={() => setFilterStatus('InStock')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                filterStatus === 'InStock'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
              }`}
            >
              OK ({metrics.inStockCount})
            </button>
            <button
              onClick={() => setFilterStatus('LowStock')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                filterStatus === 'LowStock'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
              }`}
            >
              Stock Bas ({metrics.lowStockCount})
            </button>
            <button
              onClick={() => setFilterStatus('OutOfStock')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                filterStatus === 'OutOfStock'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
              }`}
            >
              Rupture ({metrics.outOfStockCount})
            </button>
          </div>
        </div>

        {/* Stock Table */}
        <div className="overflow-x-auto rounded-md border border-zinc-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-950/60 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider border-b border-zinc-800">
                <th className="p-3">Réf / Matériel</th>
                <th className="p-3">Catégorie</th>
                <th className="p-3">Stock Actuel</th>
                <th className="p-3">Seuil Min / Max</th>
                <th className="p-3">Valeur Immobilisée (DZD)</th>
                <th className="p-3">Valeur CNY</th>
                <th className="p-3">Statut</th>
                <th className="p-3 text-right">Ajustement Rapide</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredProducts.map((p) => {
                const totalValDZD = p.totalCostDZD * p.stockQuantity;
                const totalValCNY = p.totalCostCNY * p.stockQuantity;
                const isOut = p.stockQuantity === 0;
                const isLow = p.stockQuantity <= p.minStock && p.stockQuantity > 0;

                return (
                  <tr
                    key={p.id}
                    className="hover:bg-zinc-800/40 transition-colors text-zinc-200"
                  >
                    <td className="p-3">
                      <div className="font-bold text-zinc-100">{p.name}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        {p.code} • {p.brand}
                      </div>
                    </td>
                    <td className="p-3 text-zinc-400">{p.category}</td>

                    {/* Stock Qty */}
                    <td className="p-3 font-mono font-bold text-xs">
                      <span
                        className={
                          isOut ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-zinc-100'
                        }
                      >
                        {p.stockQuantity} un.
                      </span>
                    </td>

                    {/* Min/Max */}
                    <td className="p-3 font-mono text-zinc-500 text-[11px]">
                      Min: {p.minStock} | Max: {p.maxStock}
                    </td>

                    {/* Value DZD */}
                    <td className="p-3 font-mono font-bold text-zinc-100">
                      {formatDZD(totalValDZD)}
                    </td>

                    {/* Value CNY */}
                    <td className="p-3 font-mono text-blue-400 font-semibold">
                      {formatCNY(totalValCNY)}
                    </td>

                    {/* Status Badge */}
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                          isOut
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : isLow
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {isOut ? 'Rupture' : isLow ? 'Stock Bas' : 'OK (Stock)'}
                      </span>
                    </td>

                    {/* Quick Adjust Button */}
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          setStockTargetProduct(p);
                          setIsStockModalOpen(true);
                        }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold shadow-sm transition"
                      >
                        Ajuster Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Stock Movement Log Table */}
      {stockLogs.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <History className="w-4 h-4 text-blue-400" />
            Historique Récents des Mouvements de Stock
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-950/60 text-zinc-500 uppercase text-[10px] tracking-wider font-semibold border-b border-zinc-800">
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Matériel</th>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5">Variation</th>
                  <th className="p-2.5">Nouveau Stock</th>
                  <th className="p-2.5">Motif / Justificatif</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {stockLogs.slice(0, 10).map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-800/40">
                    <td className="p-2.5 text-zinc-500 font-mono text-[11px]">{log.date}</td>
                    <td className="p-2.5 font-semibold text-zinc-200">
                      {log.productName}
                    </td>
                    <td className="p-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          log.type === 'Entrée'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {log.type}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono font-bold">
                      {log.quantityChange > 0 ? `+${log.quantityChange}` : log.quantityChange}
                    </td>
                    <td className="p-2.5 font-mono text-zinc-300">{log.newStock} un.</td>
                    <td className="p-2.5 text-zinc-500 italic">{log.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
