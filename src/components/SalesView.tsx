import React, { useState } from 'react';
import { SalesOrder, Customer, FruitProduct } from '../types';
import { 
  ShoppingCart, 
  Plus, 
  Clock, 
  Truck, 
  Send
} from 'lucide-react';

interface SalesViewProps {
  salesOrders: SalesOrder[];
  customers: Customer[];
  fruits: FruitProduct[];
  onCreateOrder: (orderData: any) => Promise<void>;
  onDispatchOrder: (orderId: number) => Promise<void>;
}

export const SalesView: React.FC<SalesViewProps> = ({
  salesOrders,
  customers,
  fruits,
  onCreateOrder,
  onDispatchOrder
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || 1);
  const [selectedFruitId, setSelectedFruitId] = useState(fruits[0]?.id || 1);
  const [quantity, setQuantity] = useState('100');
  const [unitPrice, setUnitPrice] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fruit = fruits.find(f => f.id === Number(selectedFruitId));
    const price = unitPrice ? parseFloat(unitPrice) : (fruit?.wholesalePrice || 30);
    
    await onCreateOrder({
      customerId: selectedCustomerId,
      items: [
        {
          productId: selectedFruitId,
          quantityOrdered: parseFloat(quantity),
          unitPrice: price
        }
      ]
    });
    setIsModalOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">Delivered</span>;
      case 'DISPATCHED':
        return <span className="bg-blue-950/80 border border-blue-800/80 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Truck className="w-3 h-3" /> Dispatched</span>;
      case 'CONFIRMED':
        return <span className="bg-amber-950/80 border border-amber-800/80 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> Allocated (Ready)</span>;
      default:
        return <span className="bg-stone-800 text-stone-300 border border-stone-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Sales & FEFO Order Fulfillment</h1>
          <p className="text-xs text-stone-400">
            Wholesale, supermarket distribution, automated FEFO batch allocation, and dispatch
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow flex items-center gap-1.5 self-start sm:self-auto transition"
        >
          <Plus className="w-4 h-4" />
          <span>Book Sales Order</span>
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-stone-900 rounded-xl border border-stone-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-stone-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-emerald-400" />
            <span>Sales Orders & Automatic FEFO Batch Allocation</span>
          </h2>
          <span className="text-xs text-stone-400">{salesOrders.length} Orders</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950 border-b border-stone-800 text-stone-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">SO Number</th>
                <th className="py-3 px-4">Client / Supermarket</th>
                <th className="py-3 px-4">Allocated Batches (FEFO)</th>
                <th className="py-3 px-4">Order Date</th>
                <th className="py-3 px-4">Grand Total</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800 text-stone-300">
              {salesOrders.map((so) => (
                <tr key={so.id} className="hover:bg-stone-800/40 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    {so.soNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{so.customerName}</div>
                    <div className="text-[10px] text-stone-400">{so.customerCategory}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    {so.items.map((it, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="font-semibold text-stone-200">
                          {it.productName} ({it.quantityOrdered} {it.unit}s)
                        </div>
                        {it.allocatedBatches?.map((alloc, bIdx) => (
                          <div key={bIdx} className="text-[10px] text-emerald-300 font-mono bg-emerald-950/80 border border-emerald-800/80 px-1.5 py-0.5 rounded inline-block mr-1">
                            {alloc.batchNumber} ({alloc.quantity} {it.unit}s • Exp: {alloc.expiryDate})
                          </div>
                        ))}
                      </div>
                    ))}
                  </td>
                  <td className="py-3.5 px-4 text-stone-400">
                    {so.orderDate}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    ${so.grandTotal.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      so.paymentStatus === 'PAID' 
                        ? 'bg-emerald-950/80 border border-emerald-800/80 text-emerald-300' 
                        : 'bg-amber-950/80 border border-amber-800/80 text-amber-300'
                    }`}>
                      {so.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {getStatusBadge(so.status)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {so.status === 'CONFIRMED' && (
                      <button
                        onClick={() => onDispatchOrder(so.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold transition flex items-center gap-1 ml-auto shadow"
                      >
                        <Send className="w-3 h-3" />
                        <span>Dispatch & Ship</span>
                      </button>
                    )}
                    {so.status === 'DISPATCHED' && (
                      <span className="text-[11px] text-blue-400 font-semibold flex items-center justify-end gap-1">
                        <Truck className="w-3.5 h-3.5" /> In Transit
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Sales Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-stone-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-800 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
              <h2 className="text-base font-bold text-white">Book Client Sales Order</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-emerald-950/40 p-3 rounded-lg border border-emerald-800/60 text-xs text-emerald-200">
                <strong className="text-emerald-300">Automatic FEFO Allocation:</strong> The system will automatically select and allocate the earliest-expiring active inventory batches for this item.
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-300 mb-1">Select Customer / Supermarket *</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-800 px-3 py-1.5 text-xs rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.businessName} ({c.category} • {c.discountRate}% Tier Discount)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-300 mb-1">Fruit Product *</label>
                  <select
                    value={selectedFruitId}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      const f = fruits.find(item => item.id === id);
                      setSelectedFruitId(id);
                      setUnitPrice(String(f?.wholesalePrice || ''));
                    }}
                    className="w-full bg-stone-950 border border-stone-800 px-2 py-1.5 text-xs rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    {fruits.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name} (Stock: {f.currentStock} {f.unit}s)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 px-3 py-1.5 text-xs rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-300 mb-1">Unit Selling Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Auto-populated from wholesale price"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 px-3 py-1.5 text-xs rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-700 text-stone-300 rounded-lg text-xs font-semibold hover:bg-stone-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500 shadow transition"
                >
                  Confirm Order & Allocate Batches
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
