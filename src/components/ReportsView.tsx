import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Zap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useApp } from '../context/AppContext';

export const ReportsView: React.FC = () => {
  const { products, transactions, formatDZD, formatCNY } = useApp();

  // Summary Metrics
  const summary = useMemo(() => {
    let totalSalesRevenueDZD = 0;
    let totalRentalRevenueDZD = 0;

    transactions.forEach((tx) => {
      if (tx.status === 'Payé') {
        if (tx.type === 'Vente') {
          totalSalesRevenueDZD += tx.totalAmountDZD;
        } else if (tx.type === 'Location') {
          totalRentalRevenueDZD += tx.totalAmountDZD;
        }
      }
    });

    const totalRealizedRevenueDZD = totalSalesRevenueDZD + totalRentalRevenueDZD;

    // Potential Catalog Metrics
    let catalogCostDZD = 0;
    let catalogSellingDZD = 0;
    let catalogProfitDZD = 0;

    products.forEach((p) => {
      catalogCostDZD += p.totalCostDZD * p.stockQuantity;
      catalogSellingDZD += p.sellingPriceDZD * p.stockQuantity;
      catalogProfitDZD += p.profitDZD * p.stockQuantity;
    });

    const roiPercent =
      catalogCostDZD > 0 ? ((catalogProfitDZD / catalogCostDZD) * 100).toFixed(1) : '0';

    return {
      totalSalesRevenueDZD,
      totalRentalRevenueDZD,
      totalRealizedRevenueDZD,
      catalogCostDZD,
      catalogSellingDZD,
      catalogProfitDZD,
      roiPercent,
    };
  }, [transactions, products]);

  // Chart: Revenue Split (Vente vs Location) in DZD
  const revenueSplitData = useMemo(() => {
    return [
      {
        name: 'Vente Matériel Directe',
        MontantDZD: summary.totalSalesRevenueDZD,
      },
      {
        name: 'Location Équipements',
        MontantDZD: summary.totalRentalRevenueDZD,
      },
    ];
  }, [summary]);

  // Chart: Category Financial Performance in DZD
  const categoryPerformanceData = useMemo(() => {
    const map: Record<string, { cost: number; profit: number; revenue: number }> = {};

    products.forEach((p) => {
      if (!map[p.category]) {
        map[p.category] = { cost: 0, profit: 0, revenue: 0 };
      }
      map[p.category].cost += p.totalCostDZD * p.stockQuantity;
      map[p.category].profit += p.profitDZD * p.stockQuantity;
      map[p.category].revenue += p.sellingPriceDZD * p.stockQuantity;
    });

    return Object.entries(map).map(([cat, data]) => ({
      category: cat,
      Investissement: Math.round(data.cost),
      BénéficeEstime: Math.round(data.profit),
      MargePercent: data.revenue > 0 ? Math.round((data.profit / data.revenue) * 100) : 0,
    }));
  }, [products]);

  const sanitizeCsvField = (value: string | number) => {
    const s = String(value);
    if (/^[=+\-@]/.test(s)) {
      return `'${s}`;
    }
    return s;
  };

  // CSV Export Handler
  const exportProductsToCSV = () => {
    const headers = [
      'Code',
      'Nom',
      'Marque',
      'Categorie',
      'Prix Achat CNY',
      'Frais Port CNY',
      'Cout Total CNY',
      'Cout Total DZD',
      'Prix Vente DZD',
      'Location Jour DZD',
      'Benefice DZD',
      'Marge %',
      'Stock',
      'Fournisseur',
    ];

    const rows = products.map((p) => [
      sanitizeCsvField(p.code),
      `"${sanitizeCsvField(p.name).replace(/"/g, '""')}"`,
      sanitizeCsvField(p.brand),
      sanitizeCsvField(p.category),
      p.purchasePriceCNY,
      p.shippingFeesCNY,
      p.totalCostCNY,
      p.totalCostDZD,
      p.sellingPriceDZD,
      p.rentalPriceDayDZD,
      p.profitDZD,
      p.profitMarginPercent.toFixed(2),
      p.stockQuantity,
      `"${sanitizeCsvField(p.supplier).replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rapport_Inventaire_AV_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportTransactionsToCSV = () => {
    const headers = [
      'ID',
      'Date',
      'Type',
      'Produit',
      'Quantite',
      'Prix Unitaire DZD',
      'Prix Unitaire CNY',
      'Total DZD',
      'Total CNY',
      'Client/Fournisseur',
      'Statut',
    ];

    const rows = transactions.map((t) => [
      sanitizeCsvField(t.id),
      t.date,
      t.type,
      `"${sanitizeCsvField(t.productName).replace(/"/g, '""')}"`,
      t.quantity,
      t.unitPriceDZD,
      t.unitPriceCNY,
      t.totalAmountDZD,
      t.totalAmountCNY,
      `"${sanitizeCsvField(t.clientOrSupplier).replace(/"/g, '""')}"`,
      t.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rapport_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Export Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            Centre d'Analyse Financière & Exports CSV
          </h2>
          <p className="text-xs text-zinc-500">
            Rapports de rentabilité, découpage des revenus en Dinars (DZD) et Yuan (CNY)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportProductsToCSV}
            className="flex items-center space-x-2 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-zinc-800 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Produits (CSV)</span>
          </button>
          <button
            onClick={exportTransactionsToCSV}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-md transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Transactions (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards for Reports */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 shadow-sm">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
            Chiffre d'Affaires Encaissé
          </span>
          <span className="text-xl font-extrabold text-emerald-400 font-mono block mt-1">
            {formatDZD(summary.totalRealizedRevenueDZD)}
          </span>
          <span className="text-xs text-zinc-500 block mt-0.5">
            Total Ventes & Locations
          </span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 shadow-sm">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
            Revenus Ventes Directes
          </span>
          <span className="text-xl font-extrabold text-blue-400 font-mono block mt-1">
            {formatDZD(summary.totalSalesRevenueDZD)}
          </span>
          <span className="text-xs text-zinc-500 block mt-0.5">
            Ventes fermes équipement
          </span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 shadow-sm">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
            Revenus Locations Matériel
          </span>
          <span className="text-xl font-extrabold text-cyan-400 font-mono block mt-1">
            {formatDZD(summary.totalRentalRevenueDZD)}
          </span>
          <span className="text-xs text-zinc-500 block mt-0.5">
            Prestations de location
          </span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 shadow-sm">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
            Retour sur Investissement (ROI)
          </span>
          <span className="text-xl font-extrabold text-amber-400 font-mono block mt-1">
            +{summary.roiPercent}%
          </span>
          <span className="text-xs text-zinc-500 block mt-0.5">
            Marge estimée / Capital engagé
          </span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Revenue Split (Vente vs Location) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 shadow-sm space-y-3">
          <div>
            <h3 className="text-sm font-bold text-zinc-100">
              Répartition des Encaissements: Vente vs Location (DZD)
            </h3>
            <p className="text-xs text-zinc-500">
              Comparatif des revenus générés par canal de vente
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueSplitData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '6px', color: '#fafafa' }}
                  formatter={(val: number) => [formatDZD(val), 'Revenu Encaissé']}
                />
                <Bar dataKey="MontantDZD" name="Revenu (DZD)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Investment vs Estimated Profit */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 shadow-sm space-y-3">
          <div>
            <h3 className="text-sm font-bold text-zinc-100">
              Investissement vs Bénéfice par Catégorie (DZD)
            </h3>
            <p className="text-xs text-zinc-500">
              Rentabilité comparée des familles d'équipements
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryPerformanceData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} />
                <XAxis dataKey="category" stroke="#71717a" fontSize={10} />
                <YAxis stroke="#71717a" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '6px', color: '#fafafa' }}
                  formatter={(val: number) => [formatDZD(val), '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#a1a1aa' }} />
                <Bar dataKey="Investissement" name="Investissement (DZD)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="BénéficeEstime" name="Bénéfice Estimé (DZD)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Financial Transactions Audit Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-400" />
            Journal Récent des Transactions Financières
          </h3>
          <span className="text-xs text-zinc-500 font-mono">
            {transactions.length} enregistrements
          </span>
        </div>

        <div className="overflow-x-auto rounded-md border border-zinc-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-950/60 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider border-b border-zinc-800">
                <th className="p-3">Date</th>
                <th className="p-3">Type</th>
                <th className="p-3">Équipement / Produit</th>
                <th className="p-3">Client / Fournisseur</th>
                <th className="p-3">Quantité</th>
                <th className="p-3">Total DZD</th>
                <th className="p-3">Total CNY</th>
                <th className="p-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-zinc-800/40 text-zinc-300">
                  <td className="p-3 font-mono text-zinc-500 text-[11px]">{tx.date}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        tx.type === 'Vente'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : tx.type === 'Location'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {tx.type} {tx.rentalDays ? `(${tx.rentalDays}j)` : ''}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-zinc-100">
                    {tx.productName}
                  </td>
                  <td className="p-3 text-zinc-400">{tx.clientOrSupplier}</td>
                  <td className="p-3 font-mono">{tx.quantity}</td>
                  <td className="p-3 font-mono font-bold text-zinc-100">
                    {formatDZD(tx.totalAmountDZD)}
                  </td>
                  <td className="p-3 font-mono text-blue-400 font-semibold">
                    {formatCNY(tx.totalAmountCNY)}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
