import React, { useState } from 'react';
import { Supplier } from '../types';
import { 
  Plus, 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  Award 
} from 'lucide-react';

interface SuppliersViewProps {
  suppliers: Supplier[];
  onAddSupplier: (supplier: any) => Promise<void>;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({ suppliers, onAddSupplier }) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Commercial Grower',
    sourcingRegion: '',
    country: '',
    contactPerson: '',
    email: '',
    phone: '',
    paymentTermsDays: '30',
    rating: '5.0',
    qualityScore: '98.0'
  });

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.sourcingRegion.toLowerCase().includes(search.toLowerCase()) ||
    s.country.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    await onAddSupplier(formData);
    setIsModalOpen(false);
    setFormData({
      name: '',
      type: 'Commercial Grower',
      sourcingRegion: '',
      country: '',
      contactPerson: '',
      email: '',
      phone: '',
      paymentTermsDays: '30',
      rating: '5.0',
      qualityScore: '98.0'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Suppliers, Growers & Orchards</h1>
          <p className="text-xs text-stone-400">
            Verified agricultural fruit producers, cooperatives, and cold-chain import vendors
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow flex items-center gap-1.5 self-start sm:self-auto transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard New Supplier</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-stone-900 p-4 rounded-xl border border-stone-800 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search suppliers by name, region, country..."
            className="w-full bg-stone-950 border border-stone-800 pl-9 pr-3 py-1.5 text-xs rounded-lg text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-600 transition"
          />
        </div>
      </div>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.map((supplier) => (
          <div 
            key={supplier.id}
            className="bg-stone-900 rounded-xl border border-stone-800 p-5 shadow-xs hover:border-emerald-500/50 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider">
                  {supplier.code}
                </span>
                <span className="text-[10px] bg-emerald-950/60 text-emerald-400 font-semibold px-2 py-0.5 rounded border border-emerald-800/40">
                  {supplier.type}
                </span>
              </div>

              <h2 className="text-sm font-bold text-white truncate">
                {supplier.name}
              </h2>

              <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-1">
                <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span className="truncate">{supplier.sourcingRegion}, <strong className="text-stone-300">{supplier.country}</strong></span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2 mt-4 p-3 bg-stone-950/80 rounded-lg border border-stone-800/80 text-xs">
                <div>
                  <div className="text-[10px] text-stone-400 flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>Rating Score</span>
                  </div>
                  <div className="font-bold text-white mt-0.5">
                    {supplier.rating.toFixed(1)} / 5.0
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-stone-400 flex items-center gap-1">
                    <Award className="w-3 h-3 text-emerald-400" />
                    <span>Quality Pass</span>
                  </div>
                  <div className="font-bold text-emerald-400 mt-0.5">
                    {supplier.qualityScore.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-1 mt-3 text-xs text-stone-300">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-stone-500 w-16">Contact:</span>
                  <span className="text-stone-200 truncate">{supplier.contactPerson}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                  <span className="truncate text-stone-400">{supplier.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                  <span className="text-stone-400">{supplier.phone}</span>
                </div>
              </div>
            </div>

            {/* Financial Ledger & Terms */}
            <div className="pt-3 mt-4 border-t border-stone-800 flex items-center justify-between text-xs">
              <span className="text-[11px] text-stone-400">
                Terms: <strong className="text-stone-200">Net {supplier.paymentTermsDays} Days</strong>
              </span>
              <span className="text-[11px] font-semibold text-emerald-400">
                Payables: ${supplier.outstandingBalance.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Onboard Supplier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-stone-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-800 text-stone-100">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
              <h2 className="text-base font-bold text-white">Onboard Fruit Supplier / Orchard</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">Company / Orchard Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Atlas Citrus Groves"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 px-3 py-1.5 text-xs rounded-lg text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Supplier Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 px-2 py-1.5 text-xs rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Commercial Grower">Commercial Grower</option>
                    <option value="Cooperative">Farmer Cooperative</option>
                    <option value="Farmer / Orchard">Single Orchard Owner</option>
                    <option value="Importer">International Importer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Payment Terms</label>
                  <select
                    value={formData.paymentTermsDays}
                    onChange={(e) => setFormData({ ...formData, paymentTermsDays: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 px-2 py-1.5 text-xs rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="15">Net 15 Days</option>
                    <option value="30">Net 30 Days</option>
                    <option value="45">Net 45 Days</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Sourcing Region</label>
                  <input
                    type="text"
                    placeholder="e.g. Souss Valley"
                    value={formData.sourcingRegion}
                    onChange={(e) => setFormData({ ...formData, sourcingRegion: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 px-3 py-1.5 text-xs rounded-lg text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Country</label>
                  <input
                    type="text"
                    placeholder="e.g. Morocco"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 px-3 py-1.5 text-xs rounded-lg text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Contact Representative</label>
                  <input
                    type="text"
                    placeholder="Contact Name"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 px-3 py-1.5 text-xs rounded-lg text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1-555-0199"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 px-3 py-1.5 text-xs rounded-lg text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="vendor@orchard.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 px-3 py-1.5 text-xs rounded-lg text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500"
                />
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
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500 shadow cursor-pointer"
                >
                  Confirm & Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
