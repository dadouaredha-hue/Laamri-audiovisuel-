import React, { useState, useMemo } from 'react';
import {
  Zap,
  ShoppingBag,
  Truck,
  Calendar,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TransactionType } from '../types';

export const QuickEntryView: React.FC = () => {
  const { products, rates, addTransaction, formatDZD, formatCNY, toCNY, setActiveTab } = useApp();

  const [type, setType] = useState<TransactionType>('Vente');
  const [selectedProductId, setSelectedProductId] = useState<string>(
    products[0]?.id || ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [rentalDays, setRentalDays] = useState<number>(1);
  const [customUnitPrice, setCustomUnitPrice] = useState<string>('');
  const [clientOrSupplier, setClientOrSupplier] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId);
  }, [products, selectedProductId]);

  // Unit price calculation in DZD
  const defaultUnitPriceDZD = useMemo(() => {
    if (!selectedProduct) return 0;
    if (type === 'Vente') return selectedProduct.sellingPriceDZD;
    if (type === 'Location') return selectedProduct.rentalPriceDayDZD;
    if (type === 'Achat') return selectedProduct.totalCostDZD;
    return 0;
  }, [selectedProduct, type]);

  const unitPriceDZD = customUnitPrice !== '' ? parseFloat(customUnitPrice) || 0 : defaultUnitPriceDZD;

  const totalDZD = useMemo(() => {
    if (type === 'Location') {
      return unitPriceDZD * quantity * rentalDays;
    }
    return unitPriceDZD * quantity;
  }, [unitPriceDZD, quantity, rentalDays, type]);

  const totalCNY = useMemo(() => {
    return toCNY(totalDZD);
  }, [totalDZD, toCNY]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    addTransaction({
      date: new Date().toISOString().split('T')[0],
      type,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      category: selectedProduct.category,
      quantity,
      unitPriceDZD,
      unitPriceCNY: toCNY(unitPriceDZD),
      rentalDays: type === 'Location' ? rentalDays : undefined,
      totalAmountDZD: totalDZD,
      totalAmountCNY: totalCNY,
      clientOrSupplier: clientOrSupplier || (type === 'Achat' ? selectedProduct.supplier : 'Client Comptant'),
      status: 'Payé',
      notes,
    });

    setSuccessMessage(`Transaction de ${type} enregistrée avec succès !`);
    setTimeout(() => {
      setSuccessMessage('');
      setActiveTab('dashboard');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Page Title */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-md bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-100">
              Saisie Rapide des Mouvements Financiers
            </h2>
            <p className="text-xs text-zinc-500">
              Enregistrement accéléré d’achats, ventes et locations en Dinars (DZD) et Yuan (CNY)
            </p>
          </div>
        </div>

        {successMessage && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-md text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Transaction Type Selector */}
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">
              Type de Transaction
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setType('Vente');
                  setCustomUnitPrice('');
                }}
                className={`py-2.5 px-4 rounded-md text-xs font-bold transition flex items-center justify-center space-x-2 ${
                  type === 'Vente'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Vente Directe</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('Location');
                  setCustomUnitPrice('');
                }}
                className={`py-2.5 px-4 rounded-md text-xs font-bold transition flex items-center justify-center space-x-2 ${
                  type === 'Location'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Location Matériel</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('Achat');
                  setCustomUnitPrice('');
                }}
                className={`py-2.5 px-4 rounded-md text-xs font-bold transition flex items-center justify-center space-x-2 ${
                  type === 'Achat'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>Achat Fournisseur</span>
              </button>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Select */}
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Sélectionner l’Équipement Matériel *
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  setCustomUnitPrice('');
                }}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500 font-medium"
                required
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.code}] {p.name} — Stock: {p.stockQuantity} un.
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Quantité *
              </label>
              <input
                type="number"
                min={1}
                max={type === 'Vente' ? selectedProduct?.stockQuantity || 99 : 99}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {/* Rental Days (if Location) */}
            {type === 'Location' ? (
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                  Nombre de Jours de Location *
                </label>
                <input
                  type="number"
                  min={1}
                  value={rentalDays}
                  onChange={(e) => setRentalDays(parseInt(e.target.value) || 1)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                  Nom du Client / Fournisseur
                </label>
                <input
                  type="text"
                  placeholder={type === 'Achat' ? 'Fournisseur Import' : 'Nom du client'}
                  value={clientOrSupplier}
                  onChange={(e) => setClientOrSupplier(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            {/* Unit Price DZD Override */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Prix Unitaire (DZD) {customUnitPrice === '' && `(Défaut: ${defaultUnitPriceDZD} DA)`}
              </label>
              <input
                type="number"
                step="1"
                placeholder={defaultUnitPriceDZD.toString()}
                value={customUnitPrice}
                onChange={(e) => setCustomUnitPrice(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Notes ou Numéro de Facture
              </label>
              <input
                type="text"
                placeholder="Fac-2026-009 / Chèque de caution..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Live Calculation Preview Banner */}
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 space-y-2 font-mono">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>Montant Total Calculé:</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">
                1 CNY = {rates.CNY_DZD} DZD
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xl font-extrabold text-zinc-100">
                  {formatDZD(totalDZD)}
                </span>
                <span className="text-xs font-bold text-blue-400 ml-3">
                  ≈ {formatCNY(totalCNY)}
                </span>
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full text-xs font-bold shadow-md transition flex items-center justify-center space-x-2"
              >
                <span>Valider la Transaction</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
