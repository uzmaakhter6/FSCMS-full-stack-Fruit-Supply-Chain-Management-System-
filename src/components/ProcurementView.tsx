import React, { useState } from 'react';
import { PurchaseOrder, FruitProduct, Supplier, Warehouse } from '../types';
import { 
  Plus, 
  ShoppingBag, 
  CheckCircle, 
  Clock, 
  PackageCheck, 
  FileText, 
  ShieldCheck, 
  Boxes 
} from 'lucide-react';

interface ProcurementViewProps {
  purchaseOrders: PurchaseOrder[];
  fruits: FruitProduct[];
  suppliers: Supplier[];
  warehouses: Warehouse[];
  onCreatePO: (poData: any) => Promise<void>;
  onApprovePO: (poId: number) => Promise<void>;
  onReceiveGoods: (poId: number, receiveData: any) => Promise<void>;
}

export const ProcurementView: React.FC<ProcurementViewProps> = ({
  purchaseOrders,
  fruits,
  suppliers,
  warehouses,
  onCreatePO,
  onApprovePO,
  onReceiveGoods
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [receiveModalPO, setReceiveModalPO] = useState<PurchaseOrder | null>(null);

  const [poForm, setPoForm] = useState({
    supplierId: suppliers[0]?.id || 1,
    warehouseId: warehouses[0]?.id || 1,
    productId: fruits[0]?.id || 1,
    quantityOrdered: '500',
    unitPrice: '',
    notes: 'Standard fruit seasonal purchase'
  });

  const [receiveForm, setReceiveForm] = useState({
    acceptedQty: '500',
    rejectedQty: '0',
    remarks: 'Incoming quality check passed without temperature abuse.'
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fruit = fruits.find(f => f.id === Number(poForm.productId));
    const price = poForm.unitPrice ? parseFloat(poForm.unitPrice) : (fruit?.purchasePrice || 15);
    
    await onCreatePO({
      supplierId: poForm.supplierId,
      warehouseId: poForm.warehouseId,
      items: [
        {
          productId: poForm.productId,
          quantityOrdered: parseFloat(poForm.quantityOrdered),
          unitPrice: price
        }
      ],
      notes: poForm.notes
    });
    setIsCreateModalOpen(false);
  };

  const handleReceiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiveModalPO) return;
    await onReceiveGoods(receiveModalPO.id, {
      acceptedItems: [
        { acceptedQty: parseFloat(receiveForm.acceptedQty) }
      ],
      remarks: receiveForm.remarks
    });
    setReceiveModalPO(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'FULLY_RECEIVED':
        return <span className="bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Fully Received</span>;
      case 'APPROVED':
        return <span className="bg-blue-950/60 border border-blue-800/40 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Approved</span>;
      case 'PENDING_APPROVAL':
        return <span className="bg-amber-950/60 border border-amber-800/40 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>;
      default:
        return <span className="bg-stone-800 text-stone-300 text-[10px] font-bold px-2 py-0.5 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Procurement & Purchase Orders</h1>
          <p className="text-xs text-stone-400">
            End-to-end procurement workflow: Requisition &rarr; PO Approval &rarr; Dock Goods Receipt &rarr; FEFO Batch Generation
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow flex items-center gap-1.5 self-start sm:self-auto transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Issue New Purchase Order</span>
        </button>
      </div>

      {/* PO Workflow Visual Stage Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-stone-900 p-3.5 rounded-xl border border-stone-800 text-xs shadow-xs">
          <div className="text-stone-400 font-semibold mb-1">Step 1: Authorization</div>
          <div className="font-bold text-white">Purchase Order Review</div>
          <p className="text-stone-400 text-[11px] mt-1">Contract terms, grower origin, and pricing lock</p>
        </div>
        <div className="bg-stone-900 p-3.5 rounded-xl border border-stone-800 text-xs shadow-xs">
          <div className="text-emerald-400 font-semibold mb-1">Step 2: Dock Receiving</div>
          <div className="font-bold text-white">Quality & Quantity Check</div>
          <p className="text-stone-400 text-[11px] mt-1">Verification of fruit pulp firmness and temperature logs</p>
        </div>
        <div className="bg-stone-900 p-3.5 rounded-xl border border-stone-800 text-xs shadow-xs">
          <div className="text-blue-400 font-semibold mb-1">Step 3: Relational Transaction</div>
          <div className="font-bold text-white">FEFO Batch & Movement Log</div>
          <p className="text-stone-400 text-[11px] mt-1">Automatic creation of batch ID, expiry date, and warehouse ledger</p>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-stone-900 rounded-xl border border-stone-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-stone-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Active Purchase Orders Registry</span>
          </h2>
          <span className="text-xs text-stone-400">{purchaseOrders.length} Orders in Database</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950 border-b border-stone-800 text-stone-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">PO Reference</th>
                <th className="py-3 px-4">Supplier / Orchard</th>
                <th className="py-3 px-4">Fruit Items</th>
                <th className="py-3 px-4">Target Warehouse</th>
                <th className="py-3 px-4">Order Date</th>
                <th className="py-3 px-4">Total Cost</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/80 text-stone-200">
              {purchaseOrders.map((po) => (
                <tr key={po.id} className="hover:bg-stone-800/50 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    {po.poNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{po.supplierName}</div>
                    <div className="text-[10px] text-stone-400">ID #{po.supplierId}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    {po.items.map((it, idx) => (
                      <div key={idx} className="font-medium text-stone-300">
                        {it.productName} ({it.quantityOrdered} {it.unit}s)
                      </div>
                    ))}
                  </td>
                  <td className="py-3.5 px-4 text-stone-300">
                    {po.warehouseName}
                  </td>
                  <td className="py-3.5 px-4 text-stone-300">
                    <div>{po.orderDate}</div>
                    <div className="text-[10px] text-stone-400">Exp: {po.expectedDeliveryDate}</div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-400">
                    ${po.grandTotal.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    {getStatusBadge(po.status)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {po.status === 'PENDING_APPROVAL' && (
                      <button
                        onClick={() => onApprovePO(po.id)}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold transition cursor-pointer"
                      >
                        Approve PO
                      </button>
                    )}
                    {po.status === 'APPROVED' && (
                      <button
                        onClick={() => {
                          setReceiveModalPO(po);
                          setReceiveForm({
                            acceptedQty: String(po.items[0]?.quantityOrdered || 500),
                            rejectedQty: '0',
                            remarks: 'Dock intake completed. Staging in cold room.'
                          });
                        }}
                        className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-semibold shadow-xs transition flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <PackageCheck className="w-3.5 h-3.5" />
                        <span>Receive Goods</span>
                      </button>
                    )}
                    {po.status === 'FULLY_RECEIVED' && (
                      <span className="text-[11px] text-stone-400 italic">
                        Batches Created
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create PO Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-stone-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-800 text-stone-100">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
              <h2 className="text-base font-bold text-white">Issue Purchase Order</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-stone-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">Select Supplier / Orchard *</label>
                <select
                  value={poForm.supplierId}
                  onChange={(e) => setPoForm({ ...poForm, supplierId: Number(e.target.value) })}
                  className="w-full bg-stone-950 border border-stone-800 px-3 py-1.5 text-xs rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.sourcingRegion})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">Destination Cold Storage Warehouse *</label>
                <select
                  value={poForm.warehouseId}
                  onChange={(e) => setPoForm({ ...poForm, warehouseId: Number(e.target.value) })}
                  className="w-full bg-stone-950 border border-stone-800 px-3 py-1.5 text-xs rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.city})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Fruit Product *</label>
                  <select
                    value={poForm.productId}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      const f = fruits.find(item => item.id === id);
                      setPoForm({ ...poForm, productId: id, unitPrice: String(f?.purchasePrice || '') });
                    }}
                    className="w-full bg-stone-950 border border-stone-800 px-2 py-1.5 text-xs rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    {fruits.map(f => (
                      <option key={f.id} value={f.id}>{f.name} ({f.sku})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Quantity to Order</label>
                  <input
                    type="number"
                    required
                    value={poForm.quantityOrdered}
                    onChange={(e) => setPoForm({ ...poForm, quantityOrdered: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 px-3 py-1.5 text-xs rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">Unit Purchase Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Auto-filled from fruit catalog standard cost"
                  value={poForm.unitPrice}
                  onChange={(e) => setPoForm({ ...poForm, unitPrice: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 px-3 py-1.5 text-xs rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">Procurement Instructions / Delivery Notes</label>
                <textarea
                  rows={2}
                  value={poForm.notes}
                  onChange={(e) => setPoForm({ ...poForm, notes: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 px-3 py-1.5 text-xs rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800 mt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-stone-700 text-stone-300 rounded-lg text-xs font-semibold hover:bg-stone-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500 shadow cursor-pointer"
                >
                  Create & Submit PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receive Goods Modal */}
      {receiveModalPO && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-stone-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-800 text-stone-100">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
              <div>
                <h2 className="text-base font-bold text-white">Receive Goods & Create FEFO Batch</h2>
                <div className="text-xs text-stone-400">Ref: {receiveModalPO.poNumber} • {receiveModalPO.supplierName}</div>
              </div>
              <button onClick={() => setReceiveModalPO(null)} className="text-stone-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleReceiveSubmit} className="space-y-4">
              <div className="bg-blue-950/40 p-3 rounded-lg border border-blue-800/40 text-xs text-blue-300">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <Boxes className="w-4 h-4 text-blue-400" />
                  <span>Automated Transactional Stock Creation</span>
                </div>
                Submitting this goods receipt will immediately generate a unique inventory batch, calculate expiry date, and append an immutable movement record.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Accepted Quantity</label>
                  <input
                    type="number"
                    required
                    value={receiveForm.acceptedQty}
                    onChange={(e) => setReceiveForm({ ...receiveForm, acceptedQty: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 px-3 py-1.5 text-xs rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Rejected / Damaged</label>
                  <input
                    type="number"
                    value={receiveForm.rejectedQty}
                    onChange={(e) => setReceiveForm({ ...receiveForm, rejectedQty: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 px-3 py-1.5 text-xs rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">QC Dock Inspection Notes</label>
                <textarea
                  rows={2}
                  value={receiveForm.remarks}
                  onChange={(e) => setReceiveForm({ ...receiveForm, remarks: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 px-3 py-1.5 text-xs rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800 mt-4">
                <button
                  type="button"
                  onClick={() => setReceiveModalPO(null)}
                  className="px-4 py-2 border border-stone-700 text-stone-300 rounded-lg text-xs font-semibold hover:bg-stone-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500 shadow cursor-pointer"
                >
                  Confirm Receipt & Generate Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
