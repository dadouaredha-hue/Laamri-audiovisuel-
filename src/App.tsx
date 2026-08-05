import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ProductsView } from './components/ProductsView';
import { InventoryView } from './components/InventoryView';
import { ReportsView } from './components/ReportsView';
import { QuickEntryView } from './components/QuickEntryView';
import { CurrencyConverterView } from './components/CurrencyConverterView';
import { SettingsView } from './components/SettingsView';
import { ProductModal } from './components/modals/ProductModal';
import { StockAdjustModal } from './components/modals/StockAdjustModal';
import { TransactionModal } from './components/modals/TransactionModal';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-blue-500/30 selection:text-blue-200">
      <Sidebar />
      <div className="pl-56 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'products' && <ProductsView />}
          {activeTab === 'inventory' && <InventoryView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'quick-entry' && <QuickEntryView />}
          {activeTab === 'converter' && <CurrencyConverterView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Modals */}
      <ProductModal />
      <StockAdjustModal />
      <TransactionModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
