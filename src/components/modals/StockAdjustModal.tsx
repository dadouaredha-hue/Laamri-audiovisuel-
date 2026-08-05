import React, { useState } from 'react';
import { X, Boxes, Plus, Minus, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const StockAdjustModal: React.FC = () => {
  const {
    isStockModalOpen,
    setIsStockModalOpen,
    stockTargetProduct,
    setStockTargetProduct,
    adjustStock,
  } = useApp();

  const [quantityChange, setQuantityChange] = useState<number>(1);
  const [direction, setDirection] = useState<'add' | 'subtract'>('add');
  const [reason, setReason] = useState<string>('Réapprovisionnement fournisseur');

  if (!isStockModalOpen || !stockTargetProduct) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const delta = direction === 'add' ? quantityChange : -quantityChange;
    adjustStock(stockTargetProduct.id, delta, reason);

    setIsStockModalOpen(false);
    setStockTargetProduct(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-4 bg-zinc-950 text-zinc-100 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center space-x-2">
            <Boxes className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm">Ajustement de Stock</h3>
          </div>
          <button
            onClick={() => {
              setIsStockModalOpen(false);
              setStockTargetProduct(null);
            }}
            className="p-1 rounded bg-zinc-900 text-zinc-400 hover:text-zinc-100 border border-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase font-mono">
              Équipement Sélectionné
            </span>
            <p className="font-bold text-sm text-zinc-100">
              {stockTargetProduct.name}
            </p>
            <p className="text-zinc-500 font-mono">
              Stock Actuel: <strong className="text-blue-400">{stockTargetProduct.stockQuantity} un.</strong>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDirection('add')}
              className={`p-2.5 rounded-md font-bold flex items-center justify-center space-x-1.5 transition border ${
                direction === 'add'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Entrée (+ Stock)</span>
            </button>

            <button
              type="button"
              onClick={() => setDirection('subtract')}
              className={`p-2.5 rounded-md font-bold flex items-center justify-center space-x-1.5 transition border ${
                direction === 'subtract'
                  ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              <Minus className="w-4 h-4" />
              <span>Sortie (- Stock)</span>
            </button>
          </div>

          <div>
            <label className="font-semibold text-zinc-300 block mb-1">
              Quantité à {direction === 'add' ? 'ajouter' : 'retirer'} *
            </label>
            <input
              type="number"
              min={1}
              value={quantityChange}
              onChange={(e) => setQuantityChange(parseInt(e.target.value) || 1)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2.5 text-zinc-100 font-mono font-bold focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-zinc-300 block mb-1">
              Motif / Justification
            </label>
            <input
              type="text"
              placeholder="Livraison, inventaire, matériel endommagé..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2.5 text-zinc-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-zinc-800 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setIsStockModalOpen(false);
                setStockTargetProduct(null);
              }}
              className="px-3.5 py-1.5 rounded-full font-semibold bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-full font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
