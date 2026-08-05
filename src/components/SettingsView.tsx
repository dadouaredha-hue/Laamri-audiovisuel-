import React, { useState } from 'react';
import {
  Settings,
  Moon,
  Sun,
  RotateCcw,
  Download,
  CheckCircle2,
  Building,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetAllData, products, transactions, rates } = useApp();

  const [toastMessage, setToastMessage] = useState<string>('');
  const [showConfirmReset, setShowConfirmReset] = useState<boolean>(false);

  const handleBackupExport = () => {
    const backupData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      products,
      transactions,
      rates,
      settings,
    };

    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `AV_Gear_Backup_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setToastMessage('Sauvegarde complète téléchargée avec succès !');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleReset = () => {
    resetAllData();
    setShowConfirmReset(false);
    setToastMessage('Données réinitialisées aux valeurs exemple par défaut.');
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-md bg-zinc-950 text-zinc-300 flex items-center justify-center border border-zinc-800">
            <Settings className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-100">
              Paramètres du Système & Gestion des Données
            </h2>
            <p className="text-xs text-zinc-500">
              Personnalisation de l’affichage, devises (DZD, CNY), alertes et sauvegardes
            </p>
          </div>
        </div>

        {toastMessage && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-md text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Section 1: Business Info & Preferences */}
        <div className="mt-6 space-y-5 border-t border-zinc-800 pt-5">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-400" />
            Informations Entreprise & Devise d'Affichage
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Nom du Studio / Entreprise AV
              </label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => updateSettings({ companyName: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Taux de Taxe / TVA (%)
              </label>
              <input
                type="number"
                value={settings.taxRatePercent}
                onChange={(e) =>
                  updateSettings({ taxRatePercent: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-2">
              Affichage Devise Préféré par Défaut
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => updateSettings({ defaultCurrency: 'DZD' })}
                className={`p-2.5 rounded-md text-xs font-bold transition border ${
                  settings.defaultCurrency === 'DZD'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                Dinar Algérien (DZD)
              </button>

              <button
                type="button"
                onClick={() => updateSettings({ defaultCurrency: 'CNY' })}
                className={`p-2.5 rounded-md text-xs font-bold transition border ${
                  settings.defaultCurrency === 'CNY'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                Yuan Chinois (CNY)
              </button>

              <button
                type="button"
                onClick={() => updateSettings({ defaultCurrency: 'BOTH' })}
                className={`p-2.5 rounded-md text-xs font-bold transition border ${
                  settings.defaultCurrency === 'BOTH'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                Affichage Double (DZD + CNY)
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Theme & Notifications */}
        <div className="space-y-4 border-t border-zinc-800 pt-5 mt-5">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-400" />
            Apparence & Alertes
          </h3>

          <div className="flex items-center justify-between p-3.5 bg-zinc-950 rounded-md border border-zinc-800">
            <div>
              <p className="text-xs font-bold text-zinc-200">
                Thème d'Interface (Sombre / Clair)
              </p>
              <p className="text-[11px] text-zinc-500">
                Basculer entre le mode sombre pro et le mode clair
              </p>
            </div>
            <button
              onClick={() =>
                updateSettings({
                  theme: settings.theme === 'dark' ? 'light' : 'dark',
                })
              }
              className="px-3.5 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center space-x-2 border border-zinc-700 transition"
            >
              {settings.theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Mode Clair</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-blue-400" />
                  <span>Mode Sombre</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Section 3: Data Management & Backup */}
        <div className="space-y-4 border-t border-zinc-800 pt-5 mt-5">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            Sauvegarde & Réinitialisation des Données
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-zinc-950 rounded-md border border-zinc-800 space-y-2">
              <p className="text-xs font-bold text-zinc-200">
                Sauvegarde Fichier JSON
              </p>
              <p className="text-[11px] text-zinc-500">
                Exporter l'intégralité des produits, taux et transactions dans un fichier JSON local.
              </p>
              <button
                onClick={handleBackupExport}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 py-2 rounded-md text-xs font-bold border border-zinc-700 transition flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Exporter Sauvegarde (.json)</span>
              </button>
            </div>

            <div className="p-4 bg-rose-500/5 rounded-md border border-rose-500/20 space-y-2">
              <p className="text-xs font-bold text-rose-400">
                Réinitialisation Données
              </p>
              <p className="text-[11px] text-zinc-500">
                Rétablir le catalogue d'équipements aux exemples réels de départ.
              </p>
              {showConfirmReset ? (
                <div className="flex space-x-2">
                  <button
                    onClick={handleReset}
                    className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-2 rounded-md text-xs font-bold transition"
                  >
                    Confirmer Réinitialisation
                  </button>
                  <button
                    onClick={() => setShowConfirmReset(false)}
                    className="px-3 bg-zinc-800 text-zinc-300 py-2 rounded-md text-xs font-bold border border-zinc-700"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowConfirmReset(true)}
                  className="w-full bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 py-2 rounded-md text-xs font-bold border border-rose-500/30 transition flex items-center justify-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Réinitialiser les Données</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
