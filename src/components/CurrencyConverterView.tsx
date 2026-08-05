import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Save,
  CheckCircle2,
  Coins,
  Calculator,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CurrencyConverterView: React.FC = () => {
  const { rates, updateRates, formatDZD, formatCNY } = useApp();

  // Rate inputs state
  const [cnyToDzd, setCnyToDzd] = useState<string>(rates.CNY_DZD.toString());
  const [toastMessage, setToastMessage] = useState<string>('');

  // Converter Calculator State
  const [amount, setAmount] = useState<string>('1000');
  const [fromCurrency, setFromCurrency] = useState<'CNY' | 'DZD'>('CNY');

  // Convert helper
  const parsedAmount = parseFloat(amount) || 0;

  const calculateConverted = () => {
    const rate = parseFloat(cnyToDzd || '0');
    let cnyVal = 0;
    let dzdVal = 0;

    if (fromCurrency === 'CNY') {
      cnyVal = parsedAmount;
      dzdVal = parsedAmount * rate;
    } else {
      dzdVal = parsedAmount;
      cnyVal = rate > 0 ? parsedAmount / rate : 0;
    }

    return {
      CNY: cnyVal,
      DZD: dzdVal,
    };
  };

  const converted = calculateConverted();

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();

    const cnyDzd = parseFloat(cnyToDzd) || rates.CNY_DZD;

    updateRates({
      CNY_DZD: cnyDzd,
    });

    setToastMessage('Taux de change enregistré ! Mise à jour appliquée à tout le système.');
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Title Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-md bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-100">
              Gestionnaire Devise Yuan (CNY) ⇄ Dinar (DZD)
            </h2>
            <p className="text-xs text-zinc-500">
              Modifiez le cours de référence du Yuan Chinois par rapport au Dinar Algérien pour adapter les prix d'achat et marges
            </p>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-md text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Exchange Rates Form */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <Coins className="w-4 h-4 text-blue-400" />
              Taux de Change Officiel / Marché
            </h3>
            <span className="text-[10px] text-zinc-500 font-mono">
              Dernière MAJ: {rates.lastUpdated}
            </span>
          </div>

          <form onSubmit={handleSaveRates} className="space-y-4">
            {/* CNY to DZD */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between mb-1.5">
                <span>1 Yuan Chinois (CNY) ➔ Dinar Algérien (DZD) *</span>
                <span className="text-[10px] text-zinc-500 font-mono">Taux de Conversion</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={cnyToDzd}
                onChange={(e) => setCnyToDzd(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2.5 text-xs text-zinc-100 font-mono font-bold focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-full text-xs shadow-md transition flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Mettre à jour le Taux de Change</span>
            </button>
          </form>
        </div>

        {/* 2. Interactive Calculator Widget */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              Calculateur Instantané CNY ⇄ DZD
            </h3>
            <span className="text-[9px] font-mono uppercase font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
              Direct Conversion
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Montant à Convertir
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-md p-2.5 text-xs text-zinc-100 font-mono font-bold focus:outline-none focus:border-blue-500"
                />
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value as any)}
                  className="bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-md px-3 text-xs font-bold focus:outline-none"
                >
                  <option value="CNY">CNY (¥)</option>
                  <option value="DZD">DZD (DA)</option>
                </select>
              </div>
            </div>

            {/* Results Grid */}
            <div className="space-y-2.5 pt-2 font-mono">
              <div className="p-3 bg-zinc-950 text-zinc-100 rounded-md border border-zinc-800 flex justify-between items-center">
                <span className="text-xs text-zinc-500">Équivalent Dinar Algérien (DZD):</span>
                <span className="text-sm font-extrabold text-emerald-400">
                  {formatDZD(converted.DZD)}
                </span>
              </div>

              <div className="p-3 bg-zinc-950 text-zinc-100 rounded-md border border-zinc-800 flex justify-between items-center">
                <span className="text-xs text-zinc-500">Équivalent Yuan Chinois (CNY):</span>
                <span className="text-sm font-extrabold text-cyan-400">
                  {formatCNY(converted.CNY)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
