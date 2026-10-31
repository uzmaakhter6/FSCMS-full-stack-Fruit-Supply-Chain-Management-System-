import React, { useState } from 'react';
import { InventoryBatch, InventoryMovement } from '../types';
import { 
  Boxes, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Search,
  History
} from 'lucide-react';

interface InventoryViewProps {
  batches: InventoryBatch[];
  movements: InventoryMovement[];
  onAdjustStock: (batchId: number, delta: number, reason: string, notes: string) => Promise<void>;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  batches,
  movements,
  onAdjustStock
}) => {
  const [activeTab, setActiveTab] = useState<'batches' | 'movements'>('batches');
  const [search, setSearch] = useState('');
  const [selectedBatchForAdjustment, setSelectedBatchForAdjustment] = useState<InventoryBatch | null>(null);
  const [adjForm, setAdjForm] = useState({
    delta: '-10',
    reason: 'INVENTORY_AUDIT',
    notes: 'Shrinkage discovered during routine cold-store count'
  });

  const filteredBatches = batches.filter(b => 
    b.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
    b.productName.toLowerCase().includes(search.toLowerCase()) ||
    b.warehouseName.toLowerCase().includes(search.toLowerCase()) ||
    b.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchForAdjustment) return;
    await onAdjustStock(
      selectedBatchForAdjustment.id, 
      parseFloat(adjForm.delta), 
      adjForm.reason, 
      adjForm.notes
    );
    setSelectedBatchForAdjustment(null);
  };

  const getExpiryBadge = (days: number) => {
    if (days <= 3) {
      return (
        <span className="bg-rose-950/80 border border-rose-800/80 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-rose-400" />
          <span>{days}d (FEFO Urgent)</span>
        </span>
      );
    }
    if (days <= 7) {
      return (
        <span className="bg-amber-950/80 border border-amber-800/80 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <Clock className="w-3 h-3 text-amber-400" />
          <span>{days}d (Expiring Soon)</span>
        </span>
      );
    }
    return (
      <span className="bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
        <span>{days}d Fresh</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Perishable Inventory & FEFO Batches</h1>
          <p className="text-xs text-stone-400">
            First Expired, First Out (FEFO) automated allocation engine • Cold storage rack tracking & movements ledger
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-stone-900 p-1 rounded-lg border border-stone-800 text-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('batches')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              activeTab === 'batches' ? 'bg-stone-800 text-white shadow-xs font-bold' : 'text-stone-400 hover:text-white'
            }`}
          >
            Active Batches ({batches.length})
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              activeTab === 'movements' ? 'bg-stone-800 text-white shadow-xs font-bold' : 'text-stone-400 hover:text-white'
            }`}
          >
            Movements Ledger ({movements.length})
          </button>
        </div>
      </div>

      {/* FEFO Policy Banner */}
      <div className="bg-emerald-950/40 border border-emerald-800/60 p-3.5 rounded-xl flex items-center justify-between text-xs text-emerald-200">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-900/60 border border-emerald-800/80 rounded-lg text-emerald-300">
            <Boxes className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-emerald-300">FEFO Allocation Algorithm Active:</span> Orders automatically pull from batches with the earliest expiry dates, minimizing warehouse spoilage.
          </div>
        </div>
        <span className="hidden sm:inline font-mono font-semibold text-emerald-300 bg-emerald-900/60 border border-emerald-800/80 px-2 py-0.5 rounded text-[11px]">
          Rule: Min(ExpiryDate)
        </span>
      </div>

      {activeTab === 'batches' ? (
        <div className="bg-stone-900 rounded-xl border border-stone-800 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-stone-800 flex items-center justify-between">
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by batch #, fruit, warehouse..."
                className="w-full bg-stone-950 border border-stone-800 pl-9 pr-3 py-1.5 text-xs rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
            <span className="text-xs text-stone-400">Sorted by Expiry Date (FEFO)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-950 border-b border-stone-800 text-stone-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Batch Number</th>
                  <th className="py-3 px-4">Fruit Product</th>
                  <th className="py-3 px-4">Warehouse & Zone</th>
                  <th className="py-3 px-4">Available / Reserved</th>
                  <th className="py-3 px-4">Received Date</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">FEFO Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800 text-stone-300">
                {filteredBatches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-stone-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {batch.batchNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{batch.productName}</div>
                      <div className="text-[10px] text-stone-400">{batch.sku} • {batch.grade}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-stone-200">{batch.warehouseName}</div>
                      <div className="text-[10px] text-stone-400">{batch.zone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-emerald-400">
                        {batch.quantityAvailable} {batch.unit}s
                      </div>
                      <div className="text-[10px] text-stone-400">
                        {batch.quantityReserved} reserved • {batch.quantityDamaged} waste
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-stone-400">
                      {batch.receivedDate}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white">
                      {batch.expiryDate}
                    </td>
                    <td className="py-3.5 px-4">
                      {getExpiryBadge(batch.daysToExpiry)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedBatchForAdjustment(batch)}
                        className="px-2.5 py-1 border border-stone-700 bg-stone-800/60 hover:bg-stone-700 text-stone-200 rounded text-[11px] font-semibold transition"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Movements Audit Ledger */
        <div className="bg-stone-900 rounded-xl border border-stone-800 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-stone-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-stone-400" />
              <span>Immutable Inventory Movements Ledger (Audit Trail)</span>
            </h2>
            <span className="text-xs text-stone-400">Enforces No Negative Quantities</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-950 border-b border-stone-800 text-stone-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Movement ID</th>
                  <th className="py-3 px-4">Batch Number</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Delta</th>
                  <th className="py-3 px-4">Source &rarr; Destination</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800 text-stone-300">
                {movements.map((mov) => {
                  const isPositive = mov.quantityDelta > 0;
                  return (
                    <tr key={mov.id} className="hover:bg-stone-800/40 transition">
                      <td className="py-3 px-4 font-mono font-medium text-stone-400">
                        {mov.id}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {mov.batchNumber}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-800 text-stone-200 border border-stone-700">
                          {mov.movementType}
                        </span>
                      </td>
                      <td className={`py-3 px-4 font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPositive ? `+${mov.quantityDelta}` : mov.quantityDelta} {mov.unit}s
                      </td>
                      <td className="py-3 px-4 text-stone-300 text-[11px]">
                        {mov.sourceLocation} &rarr; {mov.destLocation}
                      </td>
                      <td className="py-3 px-4 text-stone-300">
                        {mov.performedBy}
                      </td>
                      <td className="py-3 px-4 text-stone-500 text-[11px]">
                        {mov.timestamp}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {selectedBatchForAdjustment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-stone-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-800 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
              <div>
                <h2 className="text-base font-bold text-white">Adjust Inventory Stock</h2>
                <div className="text-xs text-stone-400">{selectedBatchForAdjustment.batchNumber} ({selectedBatchForAdjustment.productName})</div>
              </div>
              <button onClick={() => setSelectedBatchForAdjustment(null)} className="text-stone-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAdjustmentSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-300 mb-1">Quantity Adjustment Delta (+/-)</label>
                <input
                  type="number"
                  required
                  value={adjForm.delta}
                  onChange={(e) => setAdjForm({ ...adjForm, delta: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 px-3 py-1.5 text-xs rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                />
                <div className="text-[10px] text-stone-400 mt-1">
                  Current available: {selectedBatchForAdjustment.quantityAvailable} {selectedBatchForAdjustment.unit}s
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-300 mb-1">Reason for Adjustment</label>
                <select
                  value={adjForm.reason}
                  onChange={(e) => setAdjForm({ ...adjForm, reason: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 px-2 py-1.5 text-xs rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="INVENTORY_AUDIT">Inventory Audit / Physical Recount</option>
                  <option value="DAMAGE_UNUSABLE">Carton Handling Damage</option>
                  <option value="COLD_CHAIN_SPOILAGE">Cold-Chain Spoilage Loss</option>
                  <option value="DATA_ENTRY_ERROR">Data Entry Correction</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-300 mb-1">Audit Ledger Notes</label>
                <textarea
                  rows={2}
                  value={adjForm.notes}
                  onChange={(e) => setAdjForm({ ...adjForm, notes: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 px-3 py-1.5 text-xs rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800 mt-4">
                <button
                  type="button"
                  onClick={() => setSelectedBatchForAdjustment(null)}
                  className="px-4 py-2 border border-stone-700 text-stone-300 rounded-lg text-xs font-semibold hover:bg-stone-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500 shadow transition"
                >
                  Execute Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
