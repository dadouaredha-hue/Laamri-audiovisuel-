import React, { useState, useEffect } from 'react';
import { X, Save, Camera } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProductCategory } from '../../types';
import { PRODUCT_CATEGORIES } from '../../constants/categories';

export const ProductModal: React.FC = () => {
  const {
    isProductModalOpen,
    setIsProductModalOpen,
    editingProduct,
    setEditingProduct,
    addProduct,
    updateProduct,
    rates,
    formatDZD,
    formatCNY,
    toDZD,
    toCNY,
  } = useApp();

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Boitier');
  const [purchasePriceCNY, setPurchasePriceCNY] = useState<number>(0);
  const [shippingFeesCNY, setShippingFeesCNY] = useState<number>(0);
  const [sellingPriceDZD, setSellingPriceDZD] = useState<number>(0);
  const [rentalPriceDayDZD, setRentalPriceDayDZD] = useState<number>(0);
  const [stockQuantity, setStockQuantity] = useState<number>(1);
  const [minStock, setMinStock] = useState<number>(2);
  const [maxStock, setMaxStock] = useState<number>(10);
  const [supplier, setSupplier] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setBrand(editingProduct.brand);
      setCategory(editingProduct.category);
      setPurchasePriceCNY(editingProduct.purchasePriceCNY);
      setShippingFeesCNY(editingProduct.shippingFeesCNY);
      setSellingPriceDZD(editingProduct.sellingPriceDZD);
      setRentalPriceDayDZD(editingProduct.rentalPriceDayDZD);
      setStockQuantity(editingProduct.stockQuantity);
      setMinStock(editingProduct.minStock);
      setMaxStock(editingProduct.maxStock);
      setSupplier(editingProduct.supplier);
      setSerialNumber(editingProduct.serialNumber || '');
      setImageUrl(editingProduct.imageUrl || '');
      setNotes(editingProduct.notes || '');
    } else {
      setName('');
      setBrand('');
      setCategory('Boitier');
      setPurchasePriceCNY(0);
      setShippingFeesCNY(0);
      setSellingPriceDZD(0);
      setRentalPriceDayDZD(0);
      setStockQuantity(1);
      setMinStock(2);
      setMaxStock(10);
      setSupplier('Guangzhou Optics Tech Co.');
      setSerialNumber('');
      setImageUrl('');
      setNotes('');
    }
  }, [editingProduct, isProductModalOpen]);

  if (!isProductModalOpen) return null;

  // Realtime calculated values preview
  const computedTotalCostCNY = purchasePriceCNY + shippingFeesCNY;
  const computedTotalCostDZD = toDZD(computedTotalCostCNY);
  const computedProfitDZD = sellingPriceDZD - computedTotalCostDZD;
  const computedProfitMargin = sellingPriceDZD > 0 ? (computedProfitDZD / sellingPriceDZD) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name,
      brand,
      category,
      purchasePriceCNY,
      shippingFeesCNY,
      totalCostCNY: computedTotalCostCNY,
      totalCostDZD: computedTotalCostDZD,
      sellingPriceDZD,
      sellingPriceCNY: toCNY(sellingPriceDZD),
      rentalPriceDayDZD,
      rentalPriceDayCNY: toCNY(rentalPriceDayDZD),
      stockQuantity,
      minStock,
      maxStock,
      purchaseDate: new Date().toISOString().split('T')[0],
      supplier: supplier || 'Fournisseur Direct',
      serialNumber,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80',
      notes,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
    } else {
      addProduct(payload);
    }

    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const categories = PRODUCT_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        {/* Modal Header */}
        <div className="p-4 bg-zinc-950 text-zinc-100 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-100">
                {editingProduct ? 'Modifier Fiche Matériel' : 'Nouveau Matériel AV'}
              </h3>
              <p className="text-[11px] text-zinc-500">
                Calcul dynamique des coûts d'importation (Yuan) et prix de vente (Dinar)
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsProductModalOpen(false);
              setEditingProduct(null);
            }}
            className="p-1 rounded-md bg-zinc-900 text-zinc-400 hover:text-zinc-100 transition border border-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Nom Complet de l'Équipement *
              </label>
              <input
                type="text"
                placeholder="Ex: Panasonic Lumix S5IIX (Boîtier Plein Format)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2 text-xs text-zinc-100 font-semibold focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Marque *
              </label>
              <input
                type="text"
                placeholder="Ex: Panasonic, Sony, DJI, Sigma"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Catégorie *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2 text-xs text-zinc-100 font-medium focus:outline-none focus:border-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="p-4 bg-zinc-950 rounded-md border border-zinc-800 space-y-3">
            <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center justify-between">
              <span>Coûts d’Achat Yuan (CNY) & Prix Dinar (DZD)</span>
              <span className="font-mono text-zinc-500">
                1 CNY = {rates.CNY_DZD} DZD
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Prix Achat (CNY) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={purchasePriceCNY}
                  onChange={(e) => setPurchasePriceCNY(parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2 text-xs font-mono font-bold text-zinc-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Frais de Port (CNY) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={shippingFeesCNY}
                  onChange={(e) => setShippingFeesCNY(parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2 text-xs font-mono font-bold text-zinc-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Coût Total Recalculé
                </label>
                <div className="p-2 bg-zinc-900 text-zinc-100 rounded-md text-xs font-mono font-bold border border-zinc-800">
                  {formatCNY(computedTotalCostCNY)}
                  <span className="block text-[10px] text-blue-400 font-normal">
                    ≈ {formatDZD(computedTotalCostDZD)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-800">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Prix de Vente Conseillé (DZD) *
                </label>
                <input
                  type="number"
                  step="1"
                  value={sellingPriceDZD}
                  onChange={(e) => setSellingPriceDZD(parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Tarif Location Jour (DZD/jour)
                </label>
                <input
                  type="number"
                  step="1"
                  value={rentalPriceDayDZD}
                  onChange={(e) => setRentalPriceDayDZD(parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2 text-xs font-mono font-bold text-blue-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Profit Margin Preview */}
            <div className="flex items-center justify-between text-xs bg-emerald-500/10 p-2.5 rounded-md border border-emerald-500/20 font-mono">
              <span className="text-emerald-400 font-bold">
                Bénéfice Net Unitaire: +{formatDZD(computedProfitDZD)}
              </span>
              <span className="text-amber-400 font-extrabold">
                {computedProfitMargin.toFixed(1)}% Marge
              </span>
            </div>
          </div>

          {/* Stock Levels */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Quantité Initiale *
              </label>
              <input
                type="number"
                min={0}
                value={stockQuantity}
                onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Seuil Min Alerte
              </label>
              <input
                type="number"
                min={1}
                value={minStock}
                onChange={(e) => setMinStock(parseInt(e.target.value) || 1)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Capacité Max
              </label>
              <input
                type="number"
                min={1}
                value={maxStock}
                onChange={(e) => setMaxStock(parseInt(e.target.value) || 10)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Supplier & Serial Number & Image URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Fournisseur
              </label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Numéro de Série (S/N)
              </label>
              <input
                type="text"
                placeholder="Ex: SN-LMX-99821"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                URL de l'Image (Miniature)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Notes & Accessoires Inclus
              </label>
              <textarea
                rows={2}
                placeholder="Inclus rig, batteries, étui rigide..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-zinc-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsProductModalOpen(false);
                setEditingProduct(null);
              }}
              className="px-4 py-2 rounded-full text-xs font-semibold bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{editingProduct ? 'Enregistrer Modifications' : 'Créer l’Équipement'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
