import React, { useState } from 'react';
import { FruitProduct } from '../types';
import { 
  Plus, 
  Search, 
  Thermometer, 
  Clock, 
  AlertTriangle, 
  Scale, 
  DollarSign 
} from 'lucide-react';

interface ProductsViewProps {
  products: FruitProduct[];
  onAddProduct: (product: any) => Promise<void>;
}

export const ProductsView: React.FC<ProductsViewProps> = ({ products, onAddProduct }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'Tropical',
    variety: '',
    grade: 'Export Grade A+',
    originCountry: '',
    harvestSeason: '',
    unit: 'carton',
    purchasePrice: '',
    wholesalePrice: '',
    retailPrice: '',
    storageTempMin: '2.0',
    storageTempMax: '6.0',
    expectedShelfLifeDays: '14',
    minStockLevel: '200'
  });

  const categories = ['ALL', 'Tropical', 'Citrus', 'Berries', 'Pomes', 'Melons'];

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'ALL' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.sku.toLowerCase().includes(search.toLowerCase()) ||
                          p.originCountry.toLowerCase().includes(search.toLowerCase()) ||
                          p.variety.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) return;
    setIsSubmitting(true);
    try {
      await onAddProduct(formData);
      setIsModalOpen(false);
      setFormData({
        sku: '',
        name: '',
        category: 'Tropical',
        variety: '',
        grade: 'Export Grade A+',
        originCountry: '',
        harvestSeason: '',
        unit: 'carton',
        purchasePrice: '',
        wholesalePrice: '',
        retailPrice: '',
        storageTempMin: '2.0',
        storageTempMax: '6.0',
        expectedShelfLifeDays: '14',
        minStockLevel: '200'
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Fruit Products Catalog</h1>
          <p className="text-xs text-stone-400">
            15 High-Velocity Perishable Fruits • Storage Temperatures & Expected Shelf Life Ledger
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow flex items-center gap-1.5 self-start sm:self-auto transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Fruit SKU</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-stone-900 p-4 rounded-xl border border-stone-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by name, variety, SKU, origin..."
            className="w-full bg-stone-950 border border-stone-800 pl-9 pr-3 py-1.5 text-xs rounded-lg text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-600 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Fruit Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((fruit) => {
          const isLowStock = fruit.currentStock <= fruit.minStockLevel;
          return (
            <div 
              key={fruit.id}
              className="bg-stone-900 rounded-xl border border-stone-800 overflow-hidden shadow-xs hover:border-emerald-500/50 transition flex flex-col justify-between"
            >
              {/* Card Header & Image */}
              <div className="p-4 border-b border-stone-800/80">
                <div className="flex items-start gap-3">
                  <img 
                    src={fruit.imageUrl || 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=300&q=80'} 
                    alt={fruit.name}
                    className="w-16 h-16 rounded-lg object-cover shrink-0 border border-stone-800 bg-stone-950"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider">
                        {fruit.sku}
                      </span>
                      <span className="text-[10px] bg-stone-800 text-stone-300 font-semibold px-2 py-0.5 rounded border border-stone-700">
                        {fruit.category}
                      </span>
                    </div>
                    <h2 className="text-sm font-bold text-white truncate mt-0.5">
                      {fruit.name}
                    </h2>
                    <div className="text-xs text-stone-400 truncate">
                      {fruit.variety} • <span className="text-stone-300">{fruit.originCountry}</span>
                    </div>
                  </div>
                </div>

                {/* Stock Level Progress */}
                <div className="mt-3 bg-stone-950/80 p-2.5 rounded-lg border border-stone-800/80">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-stone-400 text-[11px]">Current Physical Stock:</span>
                    <span className={`font-bold ${isLowStock ? 'text-rose-400' : 'text-stone-100'}`}>
                      {fruit.currentStock.toLocaleString()} {fruit.unit}s
                    </span>
                  </div>
                  <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        isLowStock ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(10, (fruit.currentStock / (fruit.minStockLevel * 3)) * 100))}%` }}
                    />
                  </div>
                  {isLowStock && (
                    <div className="flex items-center gap-1 text-[10px] text-rose-400 font-bold mt-1.5">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Below minimum threshold ({fruit.minStockLevel} {fruit.unit}s)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="p-4 grid grid-cols-2 gap-2 text-xs bg-stone-950/40">
                <div className="flex items-center gap-2 text-stone-300">
                  <Thermometer className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">Storage: <strong className="text-white">{fruit.storageTempMin}°C to {fruit.storageTempMax}°C</strong></span>
                </div>
                <div className="flex items-center gap-2 text-stone-300">
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Shelf Life: <strong className="text-white">{fruit.expectedShelfLifeDays} Days</strong></span>
                </div>
                <div className="flex items-center gap-2 text-stone-300">
                  <Scale className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Harvest: <strong className="truncate text-white">{fruit.harvestSeason}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-stone-300">
                  <DollarSign className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>Wholesale: <strong className="text-white">${fruit.wholesalePrice.toFixed(2)}</strong></span>
                </div>
              </div>

              {/* Card Footer Pricing Matrix */}
              <div className="px-4 py-2.5 bg-stone-900 border-t border-stone-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-stone-400">
                  Cost: <span className="font-semibold text-stone-200">${fruit.purchasePrice.toFixed(2)}</span> / {fruit.unit}
                </span>
                <span className="text-[11px] text-stone-400">
                  Retail: <span className="font-bold text-emerald-400">${fruit.retailPrice.toFixed(2)}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-stone-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-800 text-stone-100">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
              <h2 className="text-base font-bold text-white">Add New Fruit Product SKU</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-white text-sm font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FRT-FIG-BLCK"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 px-3 py-1.5 text-xs rounded-lg uppercase text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Black Mission Figs"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 px-3 py-1.5 text-xs rounded-lg text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 px-2 py-1.5 text-xs rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Tropical">Tropical</option>
                    <option value="Citrus">Citrus</option>
                    <option value="Berries">Berries</option>
                    <option value="Pomes">Pomes</option>
                    <option value="Melons">Melons</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Variety</label>
                  <input
                    type="text"
                    placeholder="e.g. Mission"
                    value={formData.variety}
                    onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 px-3 py-1.5 text-xs rounded-lg text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Origin Country</label>
                  <input
                    type="text"
                    placeholder="e.g. Turkey"
                    value={formData.originCountry}
                    onChange={(e) => setFormData({ ...formData, originCountry: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 px-3 py-1.5 text-xs rounded-lg text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Packaging Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 px-2 py-1.5 text-xs rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="carton">Carton (10kg)</option>
                    <option value="crate">Crate (15kg)</option>
                    <option value="punnet">Punnet (500g)</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="ton">Metric Ton</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Cost Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="15.00"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 px-3 py-1.5 text-xs rounded-lg text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Wholesale ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="22.50"
                    value={formData.wholesalePrice}
                    onChange={(e) => setFormData({ ...formData, wholesalePrice: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 px-3 py-1.5 text-xs rounded-lg text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Min Temp (°C)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.storageTempMin}
                    onChange={(e) => setFormData({ ...formData, storageTempMin: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 px-3 py-1.5 text-xs rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Max Temp (°C)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.storageTempMax}
                    onChange={(e) => setFormData({ ...formData, storageTempMax: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 px-3 py-1.5 text-xs rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Shelf Life (Days)</label>
                  <input
                    type="number"
                    value={formData.expectedShelfLifeDays}
                    onChange={(e) => setFormData({ ...formData, expectedShelfLifeDays: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 px-3 py-1.5 text-xs rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-700 text-stone-300 rounded-lg text-xs font-semibold hover:bg-stone-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500 shadow cursor-pointer"
                >
                  {isSubmitting ? 'Registering...' : 'Register Product SKU'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
