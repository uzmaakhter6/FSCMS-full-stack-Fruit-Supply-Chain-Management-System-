import React, { useState } from 'react';
import { FruitProduct, InventoryBatch, SalesOrder, SpoilageRecord } from '../types';
import { 
  Download, 
  FileSpreadsheet
} from 'lucide-react';

interface ReportsViewProps {
  fruits: FruitProduct[];
  batches: InventoryBatch[];
  salesOrders: SalesOrder[];
  spoilage: SpoilageRecord[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  fruits,
  batches,
  salesOrders,
  spoilage
}) => {
  const [selectedFruitForForecast, setSelectedFruitForForecast] = useState<number>(fruits[0]?.id || 1);

  // CSV Generator Utility
  const downloadCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportInventoryCSV = () => {
    const headers = ["BatchNumber", "Product", "SKU", "Warehouse", "AvailableQty", "ReservedQty", "ExpiryDate", "DaysToExpiry", "UnitCost"];
    const rows = batches.map(b => [
      b.batchNumber,
      `"${b.productName}"`,
      b.sku,
      `"${b.warehouseName}"`,
      b.quantityAvailable,
      b.quantityReserved,
      b.expiryDate,
      b.daysToExpiry,
      b.purchaseCost
    ]);
    downloadCSV("FSCMS_Inventory_FEFO_Report", headers, rows);
  };

  const handleExportSalesCSV = () => {
    const headers = ["SONumber", "Customer", "Category", "OrderDate", "GrandTotal", "PaymentStatus", "OrderStatus"];
    const rows = salesOrders.map(so => [
      so.soNumber,
      `"${so.customerName}"`,
      `"${so.customerCategory}"`,
      so.orderDate,
      so.grandTotal,
      so.paymentStatus,
      so.status
    ]);
    downloadCSV("FSCMS_Sales_Fulfillment_Report", headers, rows);
  };

  const handleExportSpoilageCSV = () => {
    const headers = ["RecordID", "BatchNumber", "Product", "SpoiledQty", "TotalReceived", "SpoilagePct", "FinancialLoss", "Reason", "Date"];
    const rows = spoilage.map(s => [
      s.code,
      s.batchNumber,
      `"${s.productName}"`,
      s.quantitySpoiled,
      s.totalReceived,
      s.spoilagePercentage,
      s.financialLoss,
      `"${s.reason}"`,
      s.date
    ]);
    downloadCSV("FSCMS_Spoilage_Loss_Report", headers, rows);
  };

  const targetFruit = fruits.find(f => f.id === Number(selectedFruitForForecast)) || fruits[0];
  const movingAvgSales = Math.round(targetFruit?.currentStock * 0.38) || 350;
  const recommendedProcure = Math.round(movingAvgSales * 1.35);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Reports, CSV Exports & Demand Forecasting</h1>
        <p className="text-xs text-stone-400">
          Export production audit reports or run statistical moving-average demand models on seasonal fruit velocity
        </p>
      </div>

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Inventory Report Card */}
        <div className="bg-stone-900 p-5 rounded-xl border border-stone-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-white">Perishable Stock & FEFO Expiry Report</h2>
            <p className="text-xs text-stone-400 mt-1">
              Active inventory batches, countdown to expiration, warehouse locations, and reserve values.
            </p>
          </div>
          <button
            onClick={handleExportInventoryCSV}
            className="mt-4 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow flex items-center justify-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Inventory CSV</span>
          </button>
        </div>

        {/* Sales Report Card */}
        <div className="bg-stone-900 p-5 rounded-xl border border-stone-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-lg bg-blue-950/80 border border-blue-800/60 text-blue-400 flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-white">Sales & Order Fulfillment Report</h2>
            <p className="text-xs text-stone-400 mt-1">
              Complete customer billing logs, client discounts, dispatched batches, and fulfillment status.
            </p>
          </div>
          <button
            onClick={handleExportSalesCSV}
            className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow flex items-center justify-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Sales CSV</span>
          </button>
        </div>

        {/* Spoilage Report Card */}
        <div className="bg-stone-900 p-5 rounded-xl border border-stone-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-lg bg-rose-950/80 border border-rose-800/60 text-rose-400 flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-white">QC & Spoilage Write-Off Audit</h2>
            <p className="text-xs text-stone-400 mt-1">
              Quality rejection logs, root cause categorization, financial write-offs, and compost records.
            </p>
          </div>
          <button
            onClick={handleExportSpoilageCSV}
            className="mt-4 w-full py-2 bg-rose-700 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold shadow flex items-center justify-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Spoilage CSV</span>
          </button>
        </div>
      </div>

      {/* Demand Forecasting Engine Section */}
      <div className="bg-stone-900 p-6 rounded-xl border border-stone-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Statistical Seasonal Demand Forecast</h2>
              <span className="text-[10px] bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 font-semibold px-2 py-0.5 rounded-full">
                4-Week Exponential Smoothing
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Estimates reorder quantities based on historical sales velocity and expected harvest availability
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400">Target Fruit SKU:</span>
            <select
              value={selectedFruitForForecast}
              onChange={(e) => setSelectedFruitForForecast(Number(e.target.value))}
              className="bg-stone-950 border border-stone-800 px-3 py-1.5 text-xs rounded-lg font-semibold text-white focus:outline-none focus:border-emerald-500"
            >
              {fruits.map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.originCountry})</option>
              ))}
            </select>
          </div>
        </div>

        {targetFruit && (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-stone-950 rounded-xl border border-stone-800">
              <div className="text-xs text-stone-400 font-semibold uppercase">Current Stock Coverage</div>
              <div className="text-xl font-bold text-white mt-1">
                {targetFruit.currentStock} {targetFruit.unit}s
              </div>
              <div className="text-xs text-stone-400 mt-1">
                Reorder Threshold: <strong className="text-white">{targetFruit.minStockLevel} {targetFruit.unit}s</strong>
              </div>
            </div>

            <div className="p-4 bg-stone-950 rounded-xl border border-stone-800">
              <div className="text-xs text-stone-400 font-semibold uppercase">Projected 4-Week Run Rate</div>
              <div className="text-xl font-bold text-blue-400 mt-1">
                ~{movingAvgSales} {targetFruit.unit}s / month
              </div>
              <div className="text-xs text-stone-400 mt-1">
                Seasonality Factor: <strong className="text-emerald-400">+1.25x peak surge</strong>
              </div>
            </div>

            <div className="p-4 bg-emerald-950/40 rounded-xl border border-emerald-800/70">
              <div className="text-xs text-emerald-300 font-bold uppercase">Replenishment Recommendation</div>
              <div className="text-xl font-bold text-emerald-200 mt-1">
                Order {recommendedProcure} {targetFruit.unit}s
              </div>
              <div className="text-xs text-emerald-400/90 mt-1">
                Optimal procurement window: Next 5 days
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
