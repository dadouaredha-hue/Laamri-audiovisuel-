import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Grid,
  List,
  Edit,
  Trash2,
  Copy,
  Zap,
  Boxes,
  ArrowUpDown,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PRODUCT_CATEGORIES } from '../constants/categories';

export const ProductsView: React.FC = () => {
  const {
    products,
    formatDZD,
    formatCNY,
    searchQuery,
    setSearchQuery,
    setIsProductModalOpen,
    setEditingProduct,
    deleteProduct,
    duplicateProduct,
    setIsStockModalOpen,
    setStockTargetProduct,
    setIsTransactionModalOpen,
    setTransactionTargetProduct,
  } = useApp();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'profit' | 'cost' | 'stock'>('profit');
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  const categories: string[] = ['All', ...PRODUCT_CATEGORIES];

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          searchQuery === '' ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.supplier.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'profit') return b.profitDZD - a.profitDZD;
        if (sortBy === 'cost') return b.totalCostDZD - a.totalCostDZD;
        if (sortBy === 'stock') return b.stockQuantity - a.stockQuantity;
        return 0;
      });
  }, [products, searchQuery, selectedCategory, sortBy]);

  const handleCreateNew = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Controls Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search & Sort */}
        <div className="flex items-center flex-wrap gap-3">
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Rechercher par nom, marque, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-full bg-zinc-950 text-zinc-100 border border-zinc-800 focus:outline-none focus:border-blue-500 placeholder:text-zinc-500 font-sans"
            />
          </div>

          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-zinc-500 font-medium flex items-center gap-1 text-[11px]">
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-400" /> Tri:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-zinc-950 text-zinc-200 border border-zinc-800 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-medium text-xs"
            >
              <option value="profit">Plus Fort Bénéfice</option>
              <option value="cost">Plus Grand Coût</option>
              <option value="stock">Quantité en Stock</option>
              <option value="name">Ordre Alphabétique</option>
            </select>
          </div>
        </div>

        {/* View Switcher & Add Button */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-zinc-950 p-1 rounded-md border border-zinc-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Vue Grille Cards"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Vue Tableau Synthétique"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleCreateNew}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-md transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter Matériel</span>
          </button>
        </div>
      </div>

      {/* Category Pills Navigation */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 custom-scrollbar">
        {categories.map((cat) => {
          const count =
            cat === 'All'
              ? products.length
              : products.filter((p) => p.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              <span>{cat === 'All' ? 'Tous les Produits' : cat}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  selectedCategory === cat
                    ? 'bg-white/20 text-white'
                    : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid View Mode */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((p) => {
            const isLow = p.stockQuantity <= p.minStock && p.stockQuantity > 0;
            const isOut = p.stockQuantity === 0;

            return (
              <div
                key={p.id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shadow-sm hover:border-zinc-700 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Image & Status Badge */}
                  <div className="relative h-44 w-full bg-zinc-950 overflow-hidden">
                    <img
                      src={p.imageUrl || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80'}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent" />

                    <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                      <span className="bg-zinc-950/90 backdrop-blur-md text-zinc-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-zinc-800">
                        {p.code}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                          isOut
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : isLow
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {isOut ? 'Rupture' : isLow ? 'Stock Bas' : `${p.stockQuantity} un.`}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-3 right-3 text-zinc-100">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                        {p.category} • {p.brand}
                      </span>
                      <h3 className="font-bold text-sm text-zinc-100 leading-tight truncate">
                        {p.name}
                      </h3>
                    </div>
                  </div>

                  {/* Pricing Breakdown Grid */}
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs bg-zinc-950/60 p-2.5 rounded border border-zinc-800 font-mono">
                      <div>
                        <span className="text-[10px] text-zinc-500 block">
                          Prix Achat (CNY)
                        </span>
                        <span className="font-bold text-zinc-200">
                          {formatCNY(p.purchasePriceCNY)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block">
                          Frais de Port (CNY)
                        </span>
                        <span className="font-bold text-zinc-200">
                          {formatCNY(p.shippingFeesCNY)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block">
                          Coût Total (CNY)
                        </span>
                        <span className="font-bold text-zinc-100">
                          {formatCNY(p.totalCostCNY)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-blue-400 font-medium block">
                          Coût Total (DZD)
                        </span>
                        <span className="font-bold text-blue-400">
                          {formatDZD(p.totalCostDZD)}
                        </span>
                      </div>
                    </div>

                    {/* Sales & Rental Price Display */}
                    <div className="flex items-center justify-between text-xs pt-1 font-mono">
                      <div>
                        <span className="text-[10px] text-zinc-500 block font-sans">
                          Prix Vente
                        </span>
                        <span className="font-bold text-emerald-400 text-xs">
                          {formatDZD(p.sellingPriceDZD)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-500 block font-sans">
                          Location Jour
                        </span>
                        <span className="font-bold text-blue-400 text-xs">
                          {formatDZD(p.rentalPriceDayDZD)}/j
                        </span>
                      </div>
                    </div>

                    {/* Profit Margin Badge */}
                    <div className="flex items-center justify-between text-xs bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded font-mono">
                      <span className="text-emerald-400 font-semibold text-[10px]">
                        Bénéfice:
                      </span>
                      <span className="font-bold text-emerald-400">
                        +{formatDZD(p.profitDZD)} ({p.profitMarginPercent.toFixed(1)}%)
                      </span>
                    </div>

                    {p.notes && (
                      <p className="text-[11px] text-zinc-500 italic line-clamp-2 pt-1 font-sans">
                        "{p.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-3 bg-zinc-950/40 border-t border-zinc-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1">
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
                    <button
                      onClick={() => duplicateProduct(p.id)}
                      className="p-1.5 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition"
                      title="Dupliquer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setStockTargetProduct(p);
                        setIsStockModalOpen(true);
                      }}
                      className="p-1.5 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition"
                      title="Ajuster Stock"
                    >
                      <Boxes className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteProduct(p.id)}
                      className="p-1.5 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setTransactionTargetProduct(p);
                      setIsTransactionModalOpen(true);
                    }}
                    className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded text-[11px] font-semibold transition"
                  >
                    <Zap className="w-3 h-3" />
                    <span>Transaction</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View Mode */}
      {viewMode === 'table' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-950/60 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider border-b border-zinc-800">
                  <th className="p-3">Produit</th>
                  <th className="p-3">Marque</th>
                  <th className="p-3">Catégorie</th>
                  <th className="p-3">Prix CNY</th>
                  <th className="p-3">Coût Total (CNY)</th>
                  <th className="p-3">Coût Total (DZD)</th>
                  <th className="p-3">Prix Vente (DZD)</th>
                  <th className="p-3">Location/j (DZD)</th>
                  <th className="p-3">Bénéfice Unitaire</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredProducts.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-zinc-800/40 transition-colors text-zinc-200"
                  >
                    <td className="p-3 font-bold text-zinc-100 flex items-center space-x-2">
                      <span className="font-mono text-[10px] text-zinc-400 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
                        {p.code}
                      </span>
                      <span>{p.name}</span>
                    </td>
                    <td className="p-3 text-zinc-400">{p.brand}</td>
                    <td className="p-3 text-zinc-400">{p.category}</td>
                    <td className="p-3 font-mono">{formatCNY(p.purchasePriceCNY)}</td>
                    <td className="p-3 font-mono font-bold text-zinc-100">{formatCNY(p.totalCostCNY)}</td>
                    <td className="p-3 font-mono text-blue-400">{formatDZD(p.totalCostDZD)}</td>
                    <td className="p-3 font-mono text-emerald-400 font-semibold">
                      {formatDZD(p.sellingPriceDZD)}
                    </td>
                    <td className="p-3 font-mono text-blue-400">
                      {formatDZD(p.rentalPriceDayDZD)}
                    </td>
                    <td className="p-3 font-mono text-emerald-400 font-bold">
                      +{formatDZD(p.profitDZD)}
                    </td>
                    <td className="p-3 font-mono font-bold">{p.stockQuantity} un.</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
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
                        <button
                          onClick={() => {
                            setTransactionTargetProduct(p);
                            setIsTransactionModalOpen(true);
                          }}
                          className="p-1.5 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition"
                          title="Transaction rapide"
                        >
                          <Zap className="w-3.5 h-3.5" />
                        </button>
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
