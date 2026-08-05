import React from 'react';
import {
  LayoutDashboard,
  Camera,
  Boxes,
  BarChart3,
  Zap,
  ArrowLeftRight,
  Settings,
  CircleDollarSign,
} from 'lucide-react';
import { useApp, ActiveTab } from '../context/AppContext';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, products, rates, settings } = useApp();

  const lowStockCount = products.filter(
    (p) => p.stockQuantity <= p.minStock || p.stockQuantity === 0
  ).length;

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'TABLEAU DE BORD', icon: LayoutDashboard },
    { id: 'products', label: 'PRODUITS', icon: Camera },
    { id: 'inventory', label: 'STOCKS / INVENTAIRE', icon: Boxes },
    { id: 'reports', label: 'RAPPORTS & ANALYSES', icon: BarChart3 },
    { id: 'quick-entry', label: 'SAISIE RAPIDE', icon: Zap },
    { id: 'converter', label: 'DEVISES / FOREX', icon: ArrowLeftRight },
    { id: 'settings', label: 'PARAMÈTRES', icon: Settings },
  ];

  return (
    <aside className="w-56 bg-zinc-900 border-r border-zinc-800 text-zinc-300 flex flex-col h-screen fixed top-0 left-0 z-30 select-none transition-colors duration-200">
      {/* Brand Header */}
      <div className="px-6 py-6 mb-2 border-b border-zinc-800/80 bg-zinc-950/40">
        <h1 className="text-lg font-bold tracking-tight text-zinc-100 flex items-center gap-2.5">
          <div className="w-3 h-3 bg-blue-500 rounded-full shrink-0 animate-pulse" />
          <span>AV-GEAR PRO</span>
        </h1>
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1 font-semibold">
          Management Suite
        </p>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-md text-[11px] font-semibold tracking-wider transition-all duration-150 group ${
                isActive
                  ? 'text-blue-400 bg-blue-500/10 border-r-2 border-blue-500 font-bold'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon
                  className={`w-3.5 h-3.5 transition-transform duration-150 group-hover:scale-110 ${
                    isActive ? 'text-blue-400' : 'text-zinc-500 group-hover:text-zinc-300'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.id === 'inventory' && lowStockCount > 0 && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {lowStockCount}
                </span>
              )}
            </button>
          );
        })}

        {/* Currency Rates Box */}
        <div className="mt-6 pt-4 px-2 border-t border-zinc-800">
          <div className="flex items-center justify-between mb-3 text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
            <span className="flex items-center gap-1">
              <CircleDollarSign className="w-3 h-3 text-blue-400" />
              Devises / Forex
            </span>
            <button
              onClick={() => setActiveTab('converter')}
              className="text-blue-400 hover:underline text-[9px] font-bold"
            >
              Ajuster
            </button>
          </div>

          <div className="space-y-1.5 font-mono text-[10px]">
            <div className="bg-zinc-800/80 border border-zinc-700/50 px-2.5 py-1.5 rounded flex justify-between items-center">
              <span className="text-zinc-400">CNY (¥) → DZD (DA)</span>
              <span className="text-blue-400 font-bold">{rates.CNY_DZD.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Company Footer */}
      <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between text-xs text-zinc-500">
        <span className="truncate font-medium text-zinc-400 text-[11px]">{settings.companyName}</span>
        <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono border border-zinc-700/50">
          PRO v2.4
        </span>
      </div>
    </aside>
  );
};

