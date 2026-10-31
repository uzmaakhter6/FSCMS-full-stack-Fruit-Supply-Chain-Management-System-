import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Layers, 
  Download, 
  Copy, 
  Check, 
  Search, 
  Key, 
  ArrowRight, 
  Code, 
  Play,
  Terminal,
  Clock,
  Sparkles,
  Zap,
  ShieldCheck,
  Table,
  CheckCircle2,
  AlertCircle,
  GitBranch,
  BookOpen,
  Cpu,
  Workflow
} from 'lucide-react';

export const DatabaseSchemaView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rdbms' | 'erd' | 'tables' | 'console' | 'sql' | 'indexes'>('rdbms');
  const [tableSearch, setTableSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState('ALL');
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedTableDetails, setSelectedTableDetails] = useState<any | null>(null);

  // Live SQL Console state
  const [sqlInput, setSqlInput] = useState<string>(
    `SELECT b.batch_number, f.name as fruit, b.quantity_available, b.unit, b.expiry_date, 
       CAST(ROUND(julianday(b.expiry_date) - julianday('now')) AS INTEGER) as days_to_expiry,
       w.name as warehouse
FROM inventory_batches b
JOIN fruit_products f ON b.product_id = f.product_id
JOIN warehouses w ON b.warehouse_id = w.warehouse_id
ORDER BY b.expiry_date ASC;`
  );
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryResult, setQueryResult] = useState<any>(null);
  const [queryError, setQueryError] = useState<string | null>(null);

  // Live tables from DB
  const [liveTables, setLiveTables] = useState<any[]>([]);

  const fetchLiveTables = async () => {
    try {
      const res = await fetch('/api/sql/tables');
      if (res.ok) {
        const data = await res.json();
        setLiveTables(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLiveTables();
    runQuery(sqlInput);
  }, []);

  const runQuery = async (queryToRun?: string) => {
    const q = queryToRun || sqlInput;
    setIsExecuting(true);
    setQueryError(null);
    try {
      const res = await fetch('/api/sql/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: q })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setQueryError(data.error || 'Query failed');
        setQueryResult(null);
      } else {
        setQueryResult(data);
      }
    } catch (err: any) {
      setQueryError(err.message || 'Execution error');
      setQueryResult(null);
    } finally {
      setIsExecuting(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const sampleQueries = [
    {
      title: 'FEFO Expiring Batches (< 7 Days)',
      sql: `SELECT b.batch_number, f.name, b.quantity_available, b.unit, b.expiry_date, 
       CAST(ROUND(julianday(b.expiry_date) - julianday('now')) AS INTEGER) as days_left
FROM inventory_batches b
JOIN fruit_products f ON b.product_id = f.product_id
WHERE b.expiry_date <= date('now', '+7 days') AND b.quantity_available > 0
ORDER BY b.expiry_date ASC;`
    },
    {
      title: 'Stock Valuation by Product',
      sql: `SELECT f.name as fruit, f.sku, f.unit,
       SUM(b.quantity_available) as total_qty,
       ROUND(SUM(b.quantity_available * b.purchase_cost), 2) as inventory_value_usd
FROM fruit_products f
JOIN inventory_batches b ON f.product_id = b.product_id
GROUP BY f.product_id
ORDER BY inventory_value_usd DESC;`
    },
    {
      title: 'Warehouse Cold-Room Capacity & Temps',
      sql: `SELECT warehouse_code, name, city, current_temp_celsius, target_temp_celsius, 
       capacity_metric_tons, current_occupancy_metric_tons,
       ROUND((current_occupancy_metric_tons / capacity_metric_tons) * 100, 1) as occupancy_pct,
       status
FROM warehouses;`
    },
    {
      title: 'Foreign Key Referential Integrity Verification',
      sql: `PRAGMA foreign_key_check;`
    },
    {
      title: 'Quality Pass Rate by Grower',
      sql: `SELECT s.name as supplier, s.sourcing_region, s.rating, s.quality_score,
       COUNT(b.batch_id) as total_batches_received
FROM suppliers s
LEFT JOIN inventory_batches b ON s.supplier_id = b.supplier_id
GROUP BY s.supplier_id;`
    }
  ];

  // 66 Database Tables Directory
  const databaseTables = [
    // 1. Master Data (21 Tables)
    { id: 1, name: 'users', module: 'Master Data', cols: 11, desc: 'Operational credentials, bcrypt password hashes, contact details, and role assignments' },
    { id: 2, name: 'roles', module: 'Master Data', cols: 6, desc: 'Security roles (Super Admin, Procurement Officer, Warehouse Manager, Quality Inspector, etc.)' },
    { id: 3, name: 'permissions', module: 'Master Data', cols: 5, desc: 'Granular authorization capability permissions across system modules' },
    { id: 4, name: 'role_permissions', module: 'Master Data', cols: 3, desc: 'Many-to-many junction table assigning permissions to security roles' },
    { id: 5, name: 'user_roles', module: 'Master Data', cols: 3, desc: 'Many-to-many junction table mapping users to assigned roles' },
    { id: 6, name: 'suppliers', module: 'Master Data', cols: 18, desc: 'Commercial agricultural vendors, growers, and cooperatives with credit limits and ratings' },
    { id: 7, name: 'farmers', module: 'Master Data', cols: 8, desc: 'Individual farming proprietors and organic certifications' },
    { id: 8, name: 'orchards', module: 'Master Data', cols: 9, desc: 'Planting land parcels with GPS latitude/longitude, altitude, and hectare size' },
    { id: 9, name: 'customers', module: 'Master Data', cols: 16, desc: 'Retail supermarkets, wholesalers, and food processors with credit limits' },
    { id: 10, name: 'fruit_categories', module: 'Master Data', cols: 6, desc: 'Taxonomy classifications: Tropical, Citrus, Berries, Pomes, Melons' },
    { id: 11, name: 'fruit_products', module: 'Master Data', cols: 20, desc: 'Fruit SKU master: technical storage temps, shelf life, minimum stock, pricing' },
    { id: 12, name: 'fruit_varieties', module: 'Master Data', cols: 7, desc: 'Brix sweetness targets, flesh firmness (kgf), and skin color rating' },
    { id: 13, name: 'fruit_grades', module: 'Master Data', cols: 6, desc: 'Grade A+, Grade A, Grade B, and processing grades with price multipliers' },
    { id: 14, name: 'units_of_measure', module: 'Master Data', cols: 6, desc: 'Base packaging units (kg, carton, crate, metric ton, punnet)' },
    { id: 15, name: 'unit_conversions', module: 'Master Data', cols: 5, desc: 'Standard conversion multipliers between packaging standards' },
    { id: 16, name: 'warehouses', module: 'Master Data', cols: 12, desc: 'Physical cold storage facilities with target temperatures and capacity in MT' },
    { id: 17, name: 'warehouse_zones', module: 'Master Data', cols: 6, desc: 'Facility zones: Pre-cooling, Deep Chill, Standard Cold, Ripening, Staging' },
    { id: 18, name: 'storage_locations', module: 'Master Data', cols: 7, desc: 'Precise rack codes, shelf tiers, and bin coordinates' },
    { id: 19, name: 'vehicles', module: 'Master Data', cols: 8, desc: 'Refrigerated trucks, cold vans, and cooling capacity ratings' },
    { id: 20, name: 'drivers', module: 'Master Data', cols: 6, desc: 'Commercial drivers with licenses and cold-chain compliance certification' },
    { id: 21, name: 'transport_companies', module: 'Master Data', cols: 8, desc: 'Third-party refrigerated freight carriers and insurance policies' },

    // 2. Procurement (9 Tables)
    { id: 22, name: 'purchase_requisitions', module: 'Procurement', cols: 7, desc: 'Internal requests from warehouse leads for fruit replenishment' },
    { id: 23, name: 'purchase_requisition_items', module: 'Procurement', cols: 6, desc: 'Itemized fruit SKUs, quantities, and estimated unit costs' },
    { id: 24, name: 'purchase_orders', module: 'Procurement', cols: 14, desc: 'Binding procurement contracts: Draft, Pending, Approved, Fully Received, Cancelled' },
    { id: 25, name: 'purchase_order_items', module: 'Procurement', cols: 9, desc: 'Ordered vs received quantities, agreed purchase prices' },
    { id: 26, name: 'goods_receipts', module: 'Procurement', cols: 9, desc: 'Dock intake logs capturing carrier plate, delivery note, and receiving timestamp' },
    { id: 27, name: 'goods_receipt_items', module: 'Procurement', cols: 8, desc: 'Accepted vs rejected quantities and defect rejection reasons' },
    { id: 28, name: 'supplier_invoices', module: 'Procurement', cols: 11, desc: 'Supplier billing matched against accepted goods receipt items' },
    { id: 29, name: 'supplier_invoice_items', module: 'Procurement', cols: 6, desc: 'Itemized commercial invoice lines' },
    { id: 30, name: 'supplier_payments', module: 'Procurement', cols: 9, desc: 'Outbound bank wire/ACH disbursements settled against invoices' },

    // 3. Inventory & FEFO (9 Tables)
    { id: 31, name: 'inventory_batches', module: 'Inventory & FEFO', cols: 19, desc: 'Perishable batches with expiry date, harvest date, and available vs reserved stock' },
    { id: 32, name: 'inventory_balances', module: 'Inventory & FEFO', cols: 8, desc: 'Aggregated physical, reserved, and available stock per warehouse' },
    { id: 33, name: 'inventory_movements', module: 'Inventory & FEFO', cols: 13, desc: 'Immutable double-entry stock movement ledger with source/dest coordinates' },
    { id: 34, name: 'stock_adjustments', module: 'Inventory & FEFO', cols: 8, desc: 'Manager-authorized physical inventory audit reconciliations' },
    { id: 35, name: 'stock_adjustment_items', module: 'Inventory & FEFO', cols: 5, desc: 'Batch-specific delta adjustments and cost impact' },
    { id: 36, name: 'stock_transfers', module: 'Inventory & FEFO', cols: 9, desc: 'Inter-warehouse transfers between cold storage terminals' },
    { id: 37, name: 'stock_transfer_items', module: 'Inventory & FEFO', cols: 5, desc: 'Batches transferred in transit' },
    { id: 38, name: 'inventory_reservations', module: 'Inventory & FEFO', cols: 6, desc: 'Temporary stock holds locked for pending sales orders' },
    { id: 39, name: 'inventory_reservation_items', module: 'Inventory & FEFO', cols: 4, desc: 'Quantity reserved per batch' },

    // 4. Quality Control (6 Tables)
    { id: 40, name: 'quality_inspections', module: 'Quality Control', cols: 13, desc: 'Incoming receipt audits: Brix sugar, firmness (kgf), and defect percentages' },
    { id: 41, name: 'quality_inspection_items', module: 'Quality Control', cols: 6, desc: 'Detailed compliance checks per physical test parameter' },
    { id: 42, name: 'spoilage_records', module: 'Quality Control', cols: 12, desc: 'Spoilage loss ledger: (Spoiled Qty / Received Qty) * 100 with financial loss' },
    { id: 43, name: 'spoilage_reasons', module: 'Quality Control', cols: 4, desc: 'Over-ripening, temperature failure, transport impact, fungus, ethylene' },
    { id: 44, name: 'temperature_logs', module: 'Quality Control', cols: 7, desc: 'IoT sensor readings (temperature °C and humidity %) with threshold alarms' },
    { id: 45, name: 'quality_certificates', module: 'Quality Control', cols: 7, desc: 'GlobalG.A.P., organic, and phytosanitary certificate records' },

    // 5. Sales & Invoicing (8 Tables)
    { id: 46, name: 'sales_orders', module: 'Sales & Fulfillment', cols: 13, desc: 'Customer orders: Draft, Confirmed, Processing, Packed, Dispatched, Delivered' },
    { id: 47, name: 'sales_order_items', module: 'Sales & Fulfillment', cols: 10, desc: 'Fruit products, ordered vs fulfilled quantities' },
    { id: 48, name: 'sales_order_allocations', module: 'Sales & Fulfillment', cols: 6, desc: 'Automated FEFO batch allocation tying order lines to earliest-expiring stock' },
    { id: 49, name: 'sales_invoices', module: 'Sales & Fulfillment', cols: 9, desc: 'Client billing generated upon order fulfillment' },
    { id: 50, name: 'sales_invoice_items', module: 'Sales & Fulfillment', cols: 6, desc: 'Billed items matched with sales order fulfillment' },
    { id: 51, name: 'customer_payments', module: 'Sales & Fulfillment', cols: 9, desc: 'Inbound customer wire/card payments settled against invoices' },
    { id: 52, name: 'sales_returns', module: 'Sales & Fulfillment', cols: 8, desc: 'Customer return claims for damaged or over-ripe fruit' },
    { id: 53, name: 'sales_return_items', module: 'Sales & Fulfillment', cols: 6, desc: 'Restockable vs waste returned quantities' },

    // 6. Logistics & Fleet (5 Tables)
    { id: 54, name: 'shipments', module: 'Logistics & Fleet', cols: 14, desc: 'Outbound refrigerated dispatches with setpoint temperatures' },
    { id: 55, name: 'shipment_items', module: 'Logistics & Fleet', cols: 4, desc: 'Specific batches and pallets loaded into vehicle' },
    { id: 56, name: 'shipment_tracking_events', module: 'Logistics & Fleet', cols: 8, desc: 'GPS waypoints, temperature telemetry, and departure/arrival milestones' },
    { id: 57, name: 'delivery_routes', module: 'Logistics & Fleet', cols: 7, desc: 'Pre-planned cold-chain routes between warehouses and client docks' },
    { id: 58, name: 'route_stops', module: 'Logistics & Fleet', cols: 5, desc: 'Intermediate delivery checkpoints' },

    // 7. Finance & Audit (8 Tables)
    { id: 59, name: 'expenses', module: 'Finance & Audit', cols: 9, desc: 'Refrigeration power bills, reefer diesel fuel, packaging, and facility maintenance' },
    { id: 60, name: 'expense_categories', module: 'Finance & Audit', cols: 4, desc: 'Cost accounting classifications' },
    { id: 61, name: 'payment_methods', module: 'Finance & Audit', cols: 4, desc: 'SWIFT wire, ACH transfer, Letter of Credit, Cashier check' },
    { id: 62, name: 'accounts_payable', module: 'Finance & Audit', cols: 6, desc: 'Real-time ledger of outstanding amounts due to fruit growers' },
    { id: 63, name: 'accounts_receivable', module: 'Finance & Audit', cols: 6, desc: 'Real-time ledger of receivables due from retail supermarkets' },
    { id: 64, name: 'audit_logs', module: 'Finance & Audit', cols: 8, desc: 'Immutable JSON system change ledger tracking user, entity, and values' },
    { id: 65, name: 'notifications', module: 'Finance & Audit', cols: 7, desc: 'Automated warnings: Low stock, batch expiry, and cold room excursion' },
    { id: 66, name: 'system_settings', module: 'Finance & Audit', cols: 6, desc: 'Global configuration: FEFO enforcement, default currency, and temperature thresholds' }
  ];

  const modules = ['ALL', 'Master Data', 'Procurement', 'Inventory & FEFO', 'Quality Control', 'Sales & Fulfillment', 'Logistics & Fleet', 'Finance & Audit'];

  const filteredTables = databaseTables.filter(t => {
    const matchesModule = selectedModule === 'ALL' || t.module === selectedModule;
    const matchesSearch = t.name.toLowerCase().includes(tableSearch.toLowerCase()) || 
                          t.desc.toLowerCase().includes(tableSearch.toLowerCase());
    return matchesModule && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>RDBMS Architecture, ERD & Database Engine</span>
            <span className="text-xs bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Relational DB (66 Tables 3NF)
            </span>
          </h1>
          <p className="text-xs text-stone-400">
            Relational Database Management System (RDBMS) • Entity Relationship Diagram (ERD) • Real-time SQL Studio
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-stone-900 p-1 rounded-lg border border-stone-800 text-xs self-start sm:self-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('rdbms')}
            className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
              activeTab === 'rdbms' ? 'bg-stone-800 text-white shadow-xs font-bold' : 'text-stone-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>RDBMS Architecture</span>
          </button>
          <button
            onClick={() => setActiveTab('erd')}
            className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
              activeTab === 'erd' ? 'bg-stone-800 text-white shadow-xs font-bold' : 'text-stone-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Visual ERD</span>
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
              activeTab === 'tables' ? 'bg-stone-800 text-white shadow-xs font-bold' : 'text-stone-400 hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5 text-stone-400" />
            <span>66-Table Catalog</span>
          </button>
          <button
            onClick={() => setActiveTab('console')}
            className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
              activeTab === 'console' ? 'bg-stone-800 text-white shadow-xs font-bold' : 'text-stone-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Live SQL Console</span>
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
              activeTab === 'sql' ? 'bg-stone-800 text-white shadow-xs font-bold' : 'text-stone-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-stone-400" />
            <span>schema.sql</span>
          </button>
          <button
            onClick={() => setActiveTab('indexes')}
            className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
              activeTab === 'indexes' ? 'bg-stone-800 text-white shadow-xs font-bold' : 'text-stone-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Indexes & Rules</span>
          </button>
        </div>
      </div>

      {/* RDBMS ARCHITECTURE TAB */}
      {activeTab === 'rdbms' && (
        <div className="space-y-6">
          {/* Executive Overview Hero Card */}
          <div className="bg-gradient-to-br from-emerald-950 via-stone-900 to-stone-950 text-white p-6 rounded-2xl border border-emerald-800/40 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Relational Database Management System (RDBMS) Design
                </div>
                <h2 className="text-xl font-bold tracking-tight text-white">
                  3NF Normalization, ACID Transactions & FEFO Perishable Integrity
                </h2>
                <p className="text-stone-300 text-xs mt-1 max-w-2xl leading-relaxed">
                  The FSCMS RDBMS is engineered for zero data redundancy, complete referential integrity, and atomic supply chain state transitions across 66 relational tables.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setActiveTab('erd')}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow transition flex items-center gap-1.5"
                >
                  <Layers className="w-4 h-4" />
                  <span>Explore ERD</span>
                </button>
                <button
                  onClick={() => setActiveTab('console')}
                  className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold border border-white/20 transition flex items-center gap-1.5"
                >
                  <Terminal className="w-4 h-4" />
                  <span>Run Live SQL</span>
                </button>
              </div>
            </div>

            {/* Core RDBMS Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-stone-800">
              <div className="bg-stone-900/80 p-3.5 rounded-xl border border-stone-800">
                <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold">Pillar 1</div>
                <div className="text-xs font-bold text-white mt-0.5">3NF Normalization</div>
                <div className="text-[11px] text-stone-400 mt-1">Zero transitive dependencies. Surrogate BIGINT keys. Junction tables for M:N relations.</div>
              </div>
              <div className="bg-stone-900/80 p-3.5 rounded-xl border border-stone-800">
                <div className="text-[10px] font-mono uppercase text-blue-400 font-bold">Pillar 2</div>
                <div className="text-xs font-bold text-white mt-0.5">ACID Transactions</div>
                <div className="text-[11px] text-stone-400 mt-1">Atomic goods intake & order dispatch commits. Automatic rollback upon validation failure.</div>
              </div>
              <div className="bg-stone-900/80 p-3.5 rounded-xl border border-stone-800">
                <div className="text-[10px] font-mono uppercase text-purple-400 font-bold">Pillar 3</div>
                <div className="text-xs font-bold text-white mt-0.5">Referential Integrity</div>
                <div className="text-[11px] text-stone-400 mt-1">Strict foreign keys with ON DELETE RESTRICT preventing orphaned batches and records.</div>
              </div>
              <div className="bg-stone-900/80 p-3.5 rounded-xl border border-stone-800">
                <div className="text-[10px] font-mono uppercase text-amber-400 font-bold">Pillar 4</div>
                <div className="text-xs font-bold text-white mt-0.5">FEFO Allocation Engine</div>
                <div className="text-[11px] text-stone-400 mt-1">Composite B-tree indexes on (product_id, expiry_date, quantity_available) for instant order draw.</div>
              </div>
            </div>
          </div>

          {/* Normalization & Cardinality Deep Dive */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 3NF Normalization Rules */}
            <div className="bg-stone-900 p-5 rounded-xl border border-stone-800 shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Relational Normalization Proof (1NF &rarr; 2NF &rarr; 3NF)</h3>
              </div>
              <div className="space-y-3 text-xs text-stone-300">
                <div className="p-3 bg-stone-950 rounded-lg border border-stone-800">
                  <div className="font-bold text-white">1NF (First Normal Form) — Atomic Columns:</div>
                  <p className="mt-1 leading-relaxed text-stone-400">
                    Every field holds only atomic, scalar values. Product IDs, warehouse zones, and order items are never stored as comma-separated strings or arrays.
                  </p>
                </div>
                <div className="p-3 bg-stone-950 rounded-lg border border-stone-800">
                  <div className="font-bold text-white">2NF (Second Normal Form) — Full Functional Dependency:</div>
                  <p className="mt-1 leading-relaxed text-stone-400">
                    All non-key attributes fully depend on the primary key. In composite junction tables like <code className="bg-stone-800 text-stone-200 px-1 py-0.5 rounded text-[11px]">sales_order_allocations</code> and <code className="bg-stone-800 text-stone-200 px-1 py-0.5 rounded text-[11px]">role_permissions</code>, attributes depend strictly on the whole composite key.
                  </p>
                </div>
                <div className="p-3 bg-stone-950 rounded-lg border border-stone-800">
                  <div className="font-bold text-white">3NF (Third Normal Form) — No Transitive Dependencies:</div>
                  <p className="mt-1 leading-relaxed text-stone-400">
                    No non-prime attribute depends on another non-prime attribute. Supplier names and addresses are not stored inside <code className="bg-stone-800 text-stone-200 px-1 py-0.5 rounded text-[11px]">purchase_orders</code>; only the foreign key <code className="bg-stone-800 text-stone-200 px-1 py-0.5 rounded text-[11px]">supplier_id</code> is referenced.
                  </p>
                </div>
              </div>
            </div>

            {/* Atomic Transaction Lifecycle */}
            <div className="bg-stone-900 p-5 rounded-xl border border-stone-800 shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <Workflow className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Atomic Database Transaction Execution</h3>
              </div>
              <div className="p-4 bg-stone-950 rounded-xl text-stone-300 font-mono text-[11px] leading-relaxed overflow-x-auto">
                <div className="text-emerald-400 font-bold mb-1">// Transaction: Goods Intake & Batch Creation</div>
                <div>START TRANSACTION;</div>
                <div className="pl-4 text-stone-400">-- 1. Validate PO status</div>
                <div className="pl-4">SELECT status FROM purchase_orders WHERE po_id = 101 FOR UPDATE;</div>
                <div className="pl-4 text-stone-400">-- 2. Insert goods receipt header & lines</div>
                <div className="pl-4">INSERT INTO goods_receipts (receipt_number, ...) VALUES (...);</div>
                <div className="pl-4 text-stone-400">-- 3. Create perishable batch with FEFO expiry</div>
                <div className="pl-4">INSERT INTO inventory_batches (batch_number, expiry_date, ...) VALUES (...);</div>
                <div className="pl-4 text-stone-400">-- 4. Append immutable movement record</div>
                <div className="pl-4">INSERT INTO inventory_movements (type, quantity_delta, ...) VALUES ('INBOUND', 500, ...);</div>
                <div className="pl-4 text-stone-400">-- 5. Update PO status</div>
                <div className="pl-4">UPDATE purchase_orders SET status = 'FULLY_RECEIVED' WHERE po_id = 101;</div>
                <div>COMMIT; <span className="text-emerald-400">-- Atomic commit guaranteed</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VISUAL ERD TAB */}
      {activeTab === 'erd' && (
        <div className="space-y-4">
          <div className="bg-stone-900 p-5 rounded-xl border border-stone-800 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Entity Relationship Flow Diagram (Core Topology)</span>
                </h2>
                <p className="text-xs text-stone-400">
                  Shows operational cardinality from Supplier &rarr; Purchase Order &rarr; Goods Receipt &rarr; FEFO Inventory Batch &rarr; Sales Order &rarr; Reefer Fleet
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-stone-400 bg-stone-950 border border-stone-800 px-2.5 py-1 rounded">
                  docs/fruit_supply_chain_erd.mmd
                </span>
                <button
                  onClick={() => copyToClipboard(`erDiagram
    SUPPLIERS ||--o{ PURCHASE_ORDERS : provides
    PURCHASE_ORDERS ||--|{ PURCHASE_ORDER_ITEMS : contains
    FRUIT_PRODUCTS ||--o{ PURCHASE_ORDER_ITEMS : purchased
    PURCHASE_ORDERS ||--o{ GOODS_RECEIPTS : receives
    GOODS_RECEIPTS ||--|{ GOODS_RECEIPT_ITEMS : contains
    GOODS_RECEIPT_ITEMS ||--o{ INVENTORY_BATCHES : creates
    FRUIT_PRODUCTS ||--o{ INVENTORY_BATCHES : has
    WAREHOUSES ||--o{ INVENTORY_BATCHES : stores
    INVENTORY_BATCHES ||--o{ INVENTORY_MOVEMENTS : tracks
    CUSTOMERS ||--o{ SALES_ORDERS : places
    SALES_ORDERS ||--|{ SALES_ORDER_ITEMS : contains
    SALES_ORDERS ||--o{ SALES_ORDER_ALLOCATIONS : allocates
    INVENTORY_BATCHES ||--o{ SALES_ORDER_ALLOCATIONS : fulfills
    SALES_ORDERS ||--o{ SHIPMENTS : dispatched
    SHIPMENTS ||--o{ SHIPMENT_TRACKING_EVENTS : tracks`, 'mermaid-erd')}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  {copied === 'mermaid-erd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Mermaid Code</span>
                </button>
              </div>
            </div>

            {/* Interactive Visual ERD Canvas Card */}
            <div className="mt-5 p-6 bg-stone-950 rounded-xl border border-stone-800 text-stone-200 overflow-x-auto">
              <div className="min-w-[760px] space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="w-64 p-3.5 rounded-lg bg-stone-900 border border-emerald-500/40 shadow-xs">
                    <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold mb-1">Entity: Master</div>
                    <div className="font-bold text-white text-xs">SUPPLIERS (PK: supplier_id)</div>
                    <div className="text-[10px] text-stone-400 mt-1">code, name, rating, sourcing_region</div>
                  </div>

                  <div className="flex-1 border-t-2 border-dashed border-emerald-500/40 relative flex items-center justify-center">
                    <span className="bg-stone-950 px-2 text-[10px] text-emerald-400 font-mono">1 to Many (provides)</span>
                  </div>

                  <div className="w-64 p-3.5 rounded-lg bg-stone-900 border border-emerald-500/40 shadow-xs">
                    <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold mb-1">Entity: Transaction</div>
                    <div className="font-bold text-white text-xs">PURCHASE_ORDERS (PK: po_id)</div>
                    <div className="text-[10px] text-stone-400 mt-1">FK: supplier_id, warehouse_id, status</div>
                  </div>

                  <div className="flex-1 border-t-2 border-dashed border-emerald-500/40 relative flex items-center justify-center">
                    <span className="bg-stone-950 px-2 text-[10px] text-emerald-400 font-mono">1 to Many (receives)</span>
                  </div>

                  <div className="w-64 p-3.5 rounded-lg bg-stone-900 border border-emerald-500/40 shadow-xs">
                    <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold mb-1">Entity: Intake</div>
                    <div className="font-bold text-white text-xs">GOODS_RECEIPTS (PK: receipt_id)</div>
                    <div className="text-[10px] text-stone-400 mt-1">accepted_qty, rejected_qty, carrier</div>
                  </div>
                </div>

                <div className="flex justify-center my-2">
                  <div className="px-4 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-[11px] font-mono text-emerald-400">
                    &darr; GOODS_RECEIPT_ITEMS creates Perishable Batches &darr;
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="w-64 p-3.5 rounded-lg bg-stone-900 border border-blue-500/40 shadow-xs">
                    <div className="text-[10px] font-mono uppercase text-blue-400 font-bold mb-1">Entity: Catalog</div>
                    <div className="font-bold text-white text-xs">FRUIT_PRODUCTS (PK: product_id)</div>
                    <div className="text-[10px] text-stone-400 mt-1">sku, variety, temp_min, shelf_life</div>
                  </div>

                  <div className="flex-1 border-t-2 border-blue-500/40 relative flex items-center justify-center">
                    <span className="bg-stone-950 px-2 text-[10px] text-blue-400 font-mono">Categorizes</span>
                  </div>

                  <div className="w-80 p-4 rounded-xl bg-gradient-to-br from-emerald-950 to-stone-900 border-2 border-emerald-400 shadow-md">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono uppercase text-emerald-300 font-bold">CORE RELATIONAL LEDGER</span>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded">FEFO</span>
                    </div>
                    <div className="font-black text-white text-sm">INVENTORY_BATCHES (PK: batch_id)</div>
                    <div className="text-[10px] text-stone-300 mt-1 space-y-0.5">
                      <div>• FK: product_id, supplier_id, warehouse_id</div>
                      <div>• expiry_date (Index: idx_batches_fefo)</div>
                      <div>• qty_available, qty_reserved, qc_status</div>
                    </div>
                  </div>

                  <div className="flex-1 border-t-2 border-purple-500/40 relative flex items-center justify-center">
                    <span className="bg-stone-950 px-2 text-[10px] text-purple-400 font-mono">FEFO Match</span>
                  </div>

                  <div className="w-64 p-3.5 rounded-lg bg-stone-900 border border-purple-500/40 shadow-xs">
                    <div className="text-[10px] font-mono uppercase text-purple-400 font-bold mb-1">Entity: Allocation</div>
                    <div className="font-bold text-white text-xs">SALES_ORDER_ALLOCATIONS</div>
                    <div className="text-[10px] text-stone-400 mt-1">FK: so_item_id, batch_id, qty</div>
                  </div>
                </div>

                <div className="flex justify-center my-2">
                  <div className="px-4 py-1 rounded-full bg-blue-950 border border-blue-500/40 text-[11px] font-mono text-blue-400">
                    &darr; Order Dispatch & Cold-Chain Logistics &darr;
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="w-64 p-3.5 rounded-lg bg-stone-900 border border-stone-700 shadow-xs">
                    <div className="text-[10px] font-mono uppercase text-stone-400 font-bold mb-1">Entity: Master</div>
                    <div className="font-bold text-white text-xs">CUSTOMERS (PK: customer_id)</div>
                    <div className="text-[10px] text-stone-400 mt-1">business_name, credit_limit, category</div>
                  </div>

                  <div className="flex-1 border-t-2 border-dashed border-stone-700 relative flex items-center justify-center">
                    <span className="bg-stone-950 px-2 text-[10px] text-stone-400 font-mono">Places Orders</span>
                  </div>

                  <div className="w-64 p-3.5 rounded-lg bg-stone-900 border border-purple-500/40 shadow-xs">
                    <div className="text-[10px] font-mono uppercase text-purple-400 font-bold mb-1">Entity: Transaction</div>
                    <div className="font-bold text-white text-xs">SALES_ORDERS (PK: so_id)</div>
                    <div className="text-[10px] text-stone-400 mt-1">FK: customer_id, total, status</div>
                  </div>

                  <div className="flex-1 border-t-2 border-stone-700 relative flex items-center justify-center">
                    <span className="bg-stone-950 px-2 text-[10px] text-stone-400 font-mono">Dispatches</span>
                  </div>

                  <div className="w-64 p-3.5 rounded-lg bg-stone-900 border border-cyan-500/40 shadow-xs">
                    <div className="text-[10px] font-mono uppercase text-cyan-400 font-bold mb-1">Entity: Fleet</div>
                    <div className="font-bold text-white text-xs">SHIPMENTS (PK: shipment_id)</div>
                    <div className="text-[10px] text-stone-400 mt-1">vehicle_id, setpoint_temp, status</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 66-TABLE CATALOG BROWSER */}
      {activeTab === 'tables' && (
        <div className="space-y-4">
          <div className="bg-stone-900 p-4 rounded-xl border border-stone-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Search across all 66 database tables..."
                className="w-full bg-stone-950 border border-stone-800 pl-9 pr-3 py-1.5 text-xs rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {modules.map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedModule(m)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition shrink-0 ${
                    selectedModule === m
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-stone-950 text-stone-400 border border-stone-800 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTables.map((tbl) => (
              <div 
                key={tbl.id} 
                onClick={() => setSelectedTableDetails(tbl)}
                className="bg-stone-900 p-4 rounded-xl border border-stone-800 hover:border-emerald-500/50 shadow-xl transition flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-stone-400 font-bold">#{tbl.id}</span>
                    <span className="text-[10px] bg-stone-950 border border-stone-800 text-stone-300 font-semibold px-2 py-0.5 rounded">
                      {tbl.module}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold font-mono text-white group-hover:text-emerald-400 transition">{tbl.name}</h3>
                  <p className="text-xs text-stone-400 mt-1 leading-relaxed">{tbl.desc}</p>
                </div>
                <div className="pt-3 mt-3 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-500 font-mono">
                  <span>InnoDB • 3NF</span>
                  <span className="text-stone-300 font-semibold flex items-center gap-1">
                    <span>{tbl.cols} Columns</span>
                    <ArrowRight className="w-3 h-3 text-stone-500 group-hover:translate-x-0.5 transition" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LIVE SQL CONSOLE */}
      {activeTab === 'console' && (
        <div className="space-y-4">
          <div className="bg-stone-950 text-white rounded-2xl p-5 border border-stone-800 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Live SQL Query Studio</span>
                    <span className="text-[10px] bg-stone-800 text-stone-300 font-mono px-2 py-0.5 rounded">
                      ACID • WAL Mode
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-400">Execute real SQL queries directly against the relational database engine</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => runQuery()}
                  disabled={isExecuting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Play className={`w-3.5 h-3.5 fill-current ${isExecuting ? 'animate-spin' : ''}`} />
                  <span>{isExecuting ? 'Running...' : 'Execute SQL (Ctrl+Enter)'}</span>
                </button>
              </div>
            </div>

            <div className="py-3 flex items-center gap-1.5 overflow-x-auto text-[11px] border-b border-stone-800/80">
              <span className="text-stone-400 font-semibold shrink-0">Sample Queries:</span>
              {sampleQueries.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSqlInput(sample.sql);
                    runQuery(sample.sql);
                  }}
                  className="bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-emerald-400 px-2.5 py-1 rounded-md border border-stone-800 transition shrink-0 truncate max-w-xs cursor-pointer"
                >
                  {sample.title}
                </button>
              ))}
            </div>

            <div className="mt-3">
              <textarea
                value={sqlInput}
                onChange={(e) => setSqlInput(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    runQuery();
                  }
                }}
                rows={5}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3 font-mono text-xs text-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 leading-relaxed"
                placeholder="Enter SQL statement (e.g. SELECT * FROM fruit_products;)"
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-stone-400">
              <div className="flex items-center gap-2">
                {queryResult && (
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Query succeeded in {queryResult.durationMs}ms ({queryResult.rowCount ?? queryResult.changes ?? 0} {queryResult.isSelect ? 'rows returned' : 'rows modified'})
                  </span>
                )}
                {queryError && (
                  <span className="text-rose-400 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {queryError}
                  </span>
                )}
              </div>
              <span className="text-stone-500 font-mono">SQLite 3 Engine</span>
            </div>
          </div>

          {queryResult && queryResult.isSelect && (
            <div className="bg-stone-900 rounded-xl border border-stone-800 shadow-xl overflow-hidden">
              <div className="p-3.5 border-b border-stone-800 flex items-center justify-between bg-stone-950/80">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Table className="w-4 h-4 text-emerald-400" />
                  <span>Execution Result Set ({queryResult.rowCount} Rows)</span>
                </span>
                <span className="text-[11px] text-stone-400 font-mono">{queryResult.durationMs}ms</span>
              </div>

              {queryResult.rows.length === 0 ? (
                <div className="p-8 text-center text-xs text-stone-400">
                  Query executed successfully. 0 rows returned.
                </div>
              ) : (
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-stone-950 border-b border-stone-800 text-stone-400 uppercase text-[10px] tracking-wider sticky top-0">
                      <tr>
                        {queryResult.columns.map((col: string) => (
                          <th key={col} className="py-2.5 px-4 font-bold">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800 text-stone-200">
                      {queryResult.rows.map((row: any, rIdx: number) => (
                        <tr key={rIdx} className="hover:bg-stone-800/40 transition">
                          {queryResult.columns.map((col: string) => (
                            <td key={col} className="py-2 px-4 whitespace-nowrap">
                              {row[col] !== null && row[col] !== undefined ? String(row[col]) : <span className="text-stone-500 italic">null</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SQL EXPORTER TAB */}
      {activeTab === 'sql' && (
        <div className="bg-stone-900 p-6 rounded-xl border border-stone-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
            <div>
              <h2 className="text-base font-bold text-white">Production MySQL 8.0 `schema.sql` File</h2>
              <p className="text-xs text-stone-400">
                Complete DDL script provisioning all 66 tables, foreign key constraints, indexes, and InnoDB storage engine
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = '/database/schema.sql';
                  link.download = 'schema.sql';
                  link.click();
                }}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow flex items-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download schema.sql</span>
              </button>
            </div>
          </div>

          <div className="p-4 bg-stone-950 rounded-xl text-stone-300 font-mono text-xs overflow-x-auto max-h-96 border border-stone-800">
            <pre className="text-[11px] leading-relaxed">
{`-- =====================================================================
-- FRUIT SUPPLY CHAIN MANAGEMENT SYSTEM (FSCMS)
-- MySQL 8.0+ Enterprise Relational Database Schema
-- Storage Engine: InnoDB | Character Set: utf8mb4
-- =====================================================================

CREATE DATABASE fruit_supply_chain_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fruit_supply_chain_db;

-- Total 66 Normalized Tables with Foreign Keys and Composite Indexes
-- Available in /database/schema.sql`}
            </pre>
          </div>
        </div>
      )}

      {/* INDEXES TAB */}
      {activeTab === 'indexes' && (
        <div className="bg-stone-900 p-6 rounded-xl border border-stone-800 shadow-xl space-y-4">
          <div>
            <h2 className="text-base font-bold text-white">Database Indexing & Query Optimization Strategy</h2>
            <p className="text-xs text-stone-400">
              High-throughput composite indexes designed for real-time FEFO batch allocation and sub-second IoT telemetry aggregation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-stone-950 rounded-xl border border-stone-800">
              <div className="font-bold text-white flex items-center gap-1.5 mb-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>1. FEFO Batch Dispatch Index</span>
              </div>
              <div className="font-mono text-[11px] bg-stone-900 border border-stone-800 p-2 rounded text-emerald-300">
                CREATE INDEX idx_batches_fefo ON inventory_batches (product_id, expiry_date, quantity_available);
              </div>
              <p className="text-stone-400 text-[11px] mt-2 leading-relaxed">
                Allows instant lookup of the earliest-expiring batch satisfying sales order requirements without performing full table scans.
              </p>
            </div>

            <div className="p-4 bg-stone-950 rounded-xl border border-stone-800">
              <div className="font-bold text-white flex items-center gap-1.5 mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>2. Immutable Audit Movements Ledger</span>
              </div>
              <div className="font-mono text-[11px] bg-stone-900 border border-stone-800 p-2 rounded text-emerald-300">
                CREATE INDEX idx_movements_batch ON inventory_movements (batch_number, timestamp);
              </div>
              <p className="text-stone-400 text-[11px] mt-2 leading-relaxed">
                Guarantees rapid generation of provenance and chain-of-custody reports for phytosanitary export inspections.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
