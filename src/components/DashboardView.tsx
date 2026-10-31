import React from 'react';
import { 
  DollarSign, 
  Boxes, 
  AlertOctagon, 
  AlertTriangle, 
  Thermometer, 
  Truck, 
  Layers, 
  ArrowUpRight, 
  Clock, 
  ExternalLink 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { ActiveTab } from './Sidebar';

interface DashboardViewProps {
  metrics: any;
  onNavigate: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ metrics, onNavigate }) => {
  const revenueTrendData = [
    { month: 'Jun', revenue: 42000, purchases: 26000, spoilage: 840 },
    { month: 'Jul', revenue: 58000, purchases: 34000, spoilage: 1100 },
    { month: 'Aug', revenue: 74000, purchases: 41000, spoilage: 980 },
    { month: 'Sep', revenue: 68000, purchases: 38000, spoilage: 1420 },
    { month: 'Oct (Mtd)', revenue: 86400, purchases: 49200, spoilage: 1255 }
  ];

  const spoilageReasonData = [
    { name: 'Over-Ripening', value: 42, color: '#f59e0b' },
    { name: 'Transport Impact', value: 24, color: '#ef4444' },
    { name: 'Temp Failure', value: 18, color: '#3b82f6' },
    { name: 'Packaging Crush', value: 11, color: '#8b5cf6' },
    { name: 'Fungal Rot', value: 5, color: '#10b981' }
  ];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Alert Bar */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-stone-900 to-stone-950 text-white p-5 rounded-2xl shadow-sm border border-emerald-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Real-Time Supply Chain Pulse
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Cold-Chain Operations & Relational Inventory Ledger
          </h1>
          <p className="text-stone-300 text-xs mt-0.5">
            15 High-Demand Fruits tracked across 3 Cold Terminals with strict FEFO batch dispatch and real-time spoilage tracking.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => onNavigate('erd')}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>View 66-Table ERD</span>
          </button>
          <button 
            onClick={() => onNavigate('procurement')}
            className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-xs font-semibold border border-stone-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>Create Purchase Order</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-stone-900 p-4 rounded-xl border border-stone-800 shadow-xs hover:border-emerald-500/50 transition">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-medium">Total Gross Revenue</span>
            <span className="p-1.5 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(metrics?.totalRevenue || 86400)}
          </div>
          <div className="flex items-center gap-1 text-emerald-400 text-[11px] font-semibold mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.4% vs last month</span>
          </div>
        </div>

        {/* Inventory Value */}
        <div className="bg-stone-900 p-4 rounded-xl border border-stone-800 shadow-xs hover:border-emerald-500/50 transition">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-medium">Current Stock Valuation</span>
            <span className="p-1.5 rounded-lg bg-blue-950/60 text-blue-400 border border-blue-800/40">
              <Boxes className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(metrics?.currentInventoryValue || 45280)}
          </div>
          <div className="text-[11px] text-stone-400 mt-2 flex items-center justify-between">
            <span>{metrics?.totalStockQuantity?.toLocaleString() || '18,400'} units on hand</span>
            <span className="font-semibold text-stone-300">6 Batches Active</span>
          </div>
        </div>

        {/* Expiring Batches */}
        <div 
          onClick={() => onNavigate('inventory')}
          className="bg-stone-900 p-4 rounded-xl border border-stone-800 shadow-xs hover:border-rose-500/50 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-medium text-rose-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Expiring in &lt; 7 Days
            </span>
            <span className="p-1.5 rounded-lg bg-rose-950/60 text-rose-400 border border-rose-800/40 group-hover:scale-110 transition">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-rose-400">
            {metrics?.expiringBatchesCount || 2} Batches
          </div>
          <div className="text-[11px] text-rose-400/90 font-medium mt-2 flex items-center gap-1">
            <span>Strawberries & Mangoes priority</span>
            <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
          </div>
        </div>

        {/* Spoilage Percentage */}
        <div 
          onClick={() => onNavigate('qc')}
          className="bg-stone-900 p-4 rounded-xl border border-stone-800 shadow-xs hover:border-amber-500/50 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-medium">Spoilage Loss Rate</span>
            <span className="p-1.5 rounded-lg bg-amber-950/60 text-amber-400 border border-amber-800/40 group-hover:scale-110 transition">
              <AlertOctagon className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-white">
            {metrics?.spoilagePercentage || 1.85}%
          </div>
          <div className="text-[11px] text-stone-400 mt-2 flex items-center justify-between">
            <span>Target: &lt; 3.0% standard</span>
            <span className="text-amber-400 font-semibold">{formatCurrency(metrics?.totalSpoilageLoss || 255)} loss</span>
          </div>
        </div>
      </div>

      {/* Critical Alert Feed */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-rose-950/30 border border-rose-900/50 p-4 rounded-xl flex items-start gap-3">
          <div className="p-2 bg-rose-950 text-rose-400 rounded-lg border border-rose-800/40 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-rose-300">FEFO Expiry Alert: Chandler Strawberries</div>
            <div className="text-xs text-rose-200/80 mt-0.5 leading-relaxed">
              Batch BATCH-2026-STR-019 (480 punnets) expires in <strong>2 days</strong>. Auto-allocated to pending orders.
            </div>
            <button 
              onClick={() => onNavigate('inventory')}
              className="text-[11px] text-rose-300 underline font-semibold mt-1 cursor-pointer"
            >
              View Batch in FEFO Ledger &rarr;
            </button>
          </div>
        </div>

        <div className="bg-amber-950/30 border border-amber-900/50 p-4 rounded-xl flex items-start gap-3">
          <div className="p-2 bg-amber-950 text-amber-400 rounded-lg border border-amber-800/40 mt-0.5">
            <Thermometer className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-300">Cold Chain Excursion Warning</div>
            <div className="text-xs text-amber-200/80 mt-0.5 leading-relaxed">
              Rotterdam Subtropical Chamber running at <strong>5.1°C</strong> (target 3.0°C). Chiller compressor cycle restarted.
            </div>
            <button 
              onClick={() => onNavigate('warehouses')}
              className="text-[11px] text-amber-300 underline font-semibold mt-1 cursor-pointer"
            >
              Inspect Cold Room Telemetry &rarr;
            </button>
          </div>
        </div>

        <div className="bg-emerald-950/30 border border-emerald-900/50 p-4 rounded-xl flex items-start gap-3">
          <div className="p-2 bg-emerald-950 text-emerald-400 rounded-lg border border-emerald-800/40 mt-0.5">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-300">Fleet Dispatch in Transit</div>
            <div className="text-xs text-emerald-200/80 mt-0.5 leading-relaxed">
              Reefer IL-REEF-8921 en route to Cleveland with Honeycrisp Apples. Chiller steady at 1.2°C.
            </div>
            <button 
              onClick={() => onNavigate('logistics')}
              className="text-[11px] text-emerald-300 underline font-semibold mt-1 cursor-pointer"
            >
              Track GPS & Fleet Status &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Purchases Area Chart */}
        <div className="lg:col-span-2 bg-stone-900 p-5 rounded-xl border border-stone-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white">Monthly Revenue vs Sourcing Spend</h2>
              <p className="text-xs text-stone-400">Gross customer billings compared with procurement volume</p>
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/50 px-2.5 py-1 rounded-md border border-emerald-800/40">
              Gross Margin: ~42.5%
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPurch" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                <XAxis dataKey="month" stroke="#78716c" tick={{ fontSize: 11, fill: '#a8a29e' }} />
                <YAxis stroke="#78716c" tick={{ fontSize: 11, fill: '#a8a29e' }} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1c1917', borderColor: '#292524', color: '#f5f5f4', borderRadius: '0.75rem', fontSize: '12px' }} 
                  formatter={(value: any) => formatCurrency(Number(value))} 
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" name="Sales Revenue" />
                <Area type="monotone" dataKey="purchases" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorPurch)" name="Purchases Spend" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spoilage Breakdown Chart */}
        <div className="bg-stone-900 p-5 rounded-xl border border-stone-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-white">Spoilage Root Causes</h2>
              <span className="text-[11px] text-stone-400">Total: 23 Units</span>
            </div>
            <p className="text-xs text-stone-400 mb-4">Formula: (Spoiled Qty / Total Received) × 100</p>
          </div>

          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={spoilageReasonData} 
                  innerRadius={45} 
                  outerRadius={70} 
                  paddingAngle={4} 
                  dataKey="value"
                >
                  {spoilageReasonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1c1917', borderColor: '#292524', color: '#f5f5f4', borderRadius: '0.75rem', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 mt-2 border-t border-stone-800 pt-3">
            {spoilageReasonData.slice(0, 3).map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-stone-300">{item.name}</span>
                </div>
                <span className="font-semibold text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Seasonal Demand Forecasting & High-Velocity Fruits */}
      <div className="bg-stone-900 p-5 rounded-xl border border-stone-800 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Hot-Selling Fruits & Seasonal Velocity</span>
              <span className="text-[10px] bg-emerald-950/50 text-emerald-400 border border-emerald-800/40 font-semibold px-2 py-0.5 rounded-full">
                Moving Average Forecast
              </span>
            </h2>
            <p className="text-xs text-stone-400">Inventory coverage and 4-week projected seasonal replenishment</p>
          </div>
          <button 
            onClick={() => onNavigate('products')}
            className="text-xs text-emerald-400 font-semibold hover:underline cursor-pointer"
          >
            Manage All 15 Fruits &rarr;
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { name: 'Alphonso Mangoes', stock: 680, unit: 'crates', trend: '+28%', forecast: 'High (Export Peak)', health: 'Optimal' },
            { name: 'Cavendish Bananas', stock: 2150, unit: 'cartons', trend: '+12%', forecast: 'Steady Year-Round', health: 'Optimal' },
            { name: 'Chandler Strawberries', stock: 480, unit: 'punnets', trend: '+45%', forecast: 'Surge Warning', health: 'Low Stock' },
            { name: 'Honeycrisp Apples', stock: 1420, unit: 'cartons', trend: '+15%', forecast: 'Autumn High', health: 'Optimal' },
            { name: 'Hass Avocados', stock: 1100, unit: 'cartons', trend: '+22%', forecast: 'Prime Season', health: 'Optimal' }
          ].map((fruit) => (
            <div key={fruit.name} className="p-3 rounded-lg border border-stone-800 bg-stone-950/60 hover:bg-stone-950 transition">
              <div className="text-xs font-bold text-white truncate">{fruit.name}</div>
              <div className="text-sm font-black text-stone-100 mt-1">
                {fruit.stock.toLocaleString()} <span className="text-[10px] font-normal text-stone-400">{fruit.unit}</span>
              </div>
              <div className="mt-2 text-[10px] flex items-center justify-between">
                <span className={fruit.health === 'Low Stock' ? 'text-rose-400 font-bold' : 'text-emerald-400 font-semibold'}>
                  {fruit.health}
                </span>
                <span className="text-stone-400 font-medium">{fruit.trend}</span>
              </div>
              <div className="text-[10px] text-stone-400 mt-1 truncate">
                {fruit.forecast}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
