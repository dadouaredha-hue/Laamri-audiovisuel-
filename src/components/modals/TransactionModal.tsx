import React, { useState } from 'react';
import { X, Zap, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TransactionType } from '../../types';

export const TransactionModal: React.FC = () => {
  const {
    isTransactionModalOpen,
    setIsTransactionModalOpen,
    products,
    addTransaction,
    formatDZD,
    formatCNY,
    toCNY,
  } = useApp();

  const [type, setType] = useState<TransactionType>('Vente');
  const [selectedProductId, setSelectedProductId] = useState<string>(
    products[0]?.id || ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [rentalDays, setRentalDays] = useState<number>(1);
  const [clientOrSupplier, setClientOrSupplier] = useState<string>('');

  if (!isTransactionModalOpen) return null;

  const product = products.find((p) => p.id === selectedProductId) || products[0];

  const unitPriceDZD =
    type === 'Vente'
      ? product?.sellingPriceDZD || 0
      : type === 'Location'
      ? product?.rentalPriceDayDZD || 0
      : product?.totalCostDZD || 0;

  const totalDZD = type === 'Location' ? unitPriceDZD * quantity * rentalDays : unitPriceDZD * quantity;
  const totalCNY = toCNY(totalDZD);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    addTransaction({
      date: new Date().toISOString().split('T')[0],
      type,
      productId: product.id,
      productName: product.name,
      category: product.category,
      quantity,
      unitPriceDZD,
      unitPriceCNY: toCNY(unitPriceDZD),
      rentalDays: type === 'Location' ? rentalDays : undefined,
      totalAmountDZD: totalDZD,
      totalAmountCNY: totalCNY,
      clientOrSupplier: clientOrSupplier || (type === 'Achat' ? product.supplier : 'Client Comptant'),
      status: 'Payé',
    });

    setIsTransactionModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="p-4 bg-zinc-950 text-zinc-100 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm">Nouvelle Transaction Rapide</h3>
          </div>
          <button
            onClick={() => setIsTransactionModalOpen(false)}
            className="p-1 rounded bg-zinc-900 text-zinc-400 hover:text-zinc-100 border border-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Type Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setType('Vente')}
              className={`p-2.5 rounded-md font-bold text-center transition border ${
                type === 'Vente' ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm' : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              Vente
            </button>
            <button
              type="button"
              onClick={() => setType('Location')}
              className={`p-2.5 rounded-md font-bold text-center transition border ${
                type === 'Location' ? 'bg-blue-600 text-white border-blue-500 shadow-sm' : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              Location
            </button>
            <button
              type="button"
              onClick={() => setType('Achat')}
              className={`p-2.5 rounded-md font-bold text-center transition border ${
                type === 'Achat' ? 'bg-amber-600 text-white border-amber-500 shadow-sm' : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              Achat
            </button>
          </div>

          {/* Product Selector */}
          <div>
            <label className="font-semibold text-zinc-300 block mb-1">
              Équipement Matériel *
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2.5 text-zinc-100 font-medium focus:outline-none focus:border-blue-500"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Stock: {p.stockQuantity})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-zinc-300 block mb-1">
                Quantité *
              </label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2.5 text-zinc-100 font-mono focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {type === 'Location' ? (
              <div>
                <label className="font-semibold text-zinc-300 block mb-1">
                  Jours de Location *
                </label>
                <input
                  type="number"
                  min={1}
                  value={rentalDays}
                  onChange={(e) => setRentalDays(parseInt(e.target.value) || 1)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2.5 text-zinc-100 font-mono focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="font-semibold text-zinc-300 block mb-1">
                  Client / Tiers
                </label>
                <input
                  type="text"
                  placeholder="Client comptant"
                  value={clientOrSupplier}
                  onChange={(e) => setClientOrSupplier(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2.5 text-zinc-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>

          {/* Amount Calculation Summary */}
          <div className="p-3 bg-zinc-950 rounded-md font-mono text-zinc-100 flex items-center justify-between border border-zinc-800">
            <div>
              <span className="text-[10px] text-zinc-500 block">Total Transaction (DZD)</span>
              <span className="font-extrabold text-sm text-emerald-400">{formatDZD(totalDZD)}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-zinc-500 block">Équivalent Yuan (CNY)</span>
              <span className="font-bold text-xs text-blue-400">{formatCNY(totalCNY)}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsTransactionModalOpen(false)}
              className="px-3.5 py-1.5 rounded-full font-semibold bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-full font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm flex items-center gap-1"
            >
              <span>Valider</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
