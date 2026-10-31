import React, { useState, useEffect } from 'react';
import { 
  UserRole, 
  FruitProduct, 
  Supplier, 
  Warehouse, 
  InventoryBatch, 
  InventoryMovement, 
  PurchaseOrder, 
  SalesOrder, 
  Customer, 
  QualityInspection, 
  SpoilageRecord, 
  Shipment 
} from './types';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ProductsView } from './components/ProductsView';
import { SuppliersView } from './components/SuppliersView';
import { ProcurementView } from './components/ProcurementView';
import { InventoryView } from './components/InventoryView';
import { WarehouseView } from './components/WarehouseView';
import { QualityControlView } from './components/QualityControlView';
import { SalesView } from './components/SalesView';
import { LogisticsView } from './components/LogisticsView';
import { FinanceView } from './components/FinanceView';
import { ReportsView } from './components/ReportsView';
import { DatabaseSchemaView } from './components/DatabaseSchemaView';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ROLE_PROFILES } from './types/rbac';

function AppContent() {
  const { theme } = useTheme();
  const [currentRole, setCurrentRole] = useState<UserRole>('SUPER_ADMIN');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [showRoleBanner, setShowRoleBanner] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentProfile = ROLE_PROFILES[currentRole] || ROLE_PROFILES.SUPER_ADMIN;

  const handleRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
    const profile = ROLE_PROFILES[newRole];
    if (profile && profile.primaryTab) {
      setActiveTab(profile.primaryTab as ActiveTab);
    }
    setShowRoleBanner(true);
  };

  // Core Relational State
  const [metrics, setMetrics] = useState<any>(null);
  const [fruits, setFruits] = useState<FruitProduct[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [batches, setBatches] = useState<InventoryBatch[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inspections, setInspections] = useState<QualityInspection[]>([]);
  const [spoilage, setSpoilage] = useState<SpoilageRecord[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [financeData, setFinanceData] = useState<any>(null);

  // Fetch all data from backend REST API
  const fetchAllData = async () => {
    setIsRefreshing(true);
    try {
      const [
        metricsRes,
        productsRes,
        suppliersRes,
        warehousesRes,
        batchesRes,
        movementsRes,
        poRes,
        soRes,
        customersRes,
        inspectionsRes,
        spoilageRes,
        shipmentsRes,
        financeRes
      ] = await Promise.all([
        fetch('/api/dashboard/metrics').then(r => r.json()).catch(() => null),
        fetch('/api/products').then(r => r.json()).catch(() => []),
        fetch('/api/suppliers').then(r => r.json()).catch(() => []),
        fetch('/api/warehouses').then(r => r.json()).catch(() => []),
        fetch('/api/inventory/batches').then(r => r.json()).catch(() => []),
        fetch('/api/inventory/movements').then(r => r.json()).catch(() => []),
        fetch('/api/purchase-orders').then(r => r.json()).catch(() => []),
        fetch('/api/sales/orders').then(r => r.json()).catch(() => []),
        fetch('/api/sales/customers').then(r => r.json()).catch(() => []),
        fetch('/api/qc/inspections').then(r => r.json()).catch(() => []),
        fetch('/api/qc/spoilage').then(r => r.json()).catch(() => []),
        fetch('/api/logistics/shipments').then(r => r.json()).catch(() => []),
        fetch('/api/finance/overview').then(r => r.json()).catch(() => null)
      ]);

      if (metricsRes) setMetrics(metricsRes);
      if (Array.isArray(productsRes)) setFruits(productsRes);
      if (Array.isArray(suppliersRes)) setSuppliers(suppliersRes);
      if (Array.isArray(warehousesRes)) setWarehouses(warehousesRes);
      if (Array.isArray(batchesRes)) setBatches(batchesRes);
      if (Array.isArray(movementsRes)) setMovements(movementsRes);
      if (Array.isArray(poRes)) setPurchaseOrders(poRes);
      if (Array.isArray(soRes)) setSalesOrders(soRes);
      if (Array.isArray(customersRes)) setCustomers(customersRes);
      if (Array.isArray(inspectionsRes)) setInspections(inspectionsRes);
      if (Array.isArray(spoilageRes)) setSpoilage(spoilageRes);
      if (Array.isArray(shipmentsRes)) setShipments(shipmentsRes);
      if (financeRes) setFinanceData(financeRes);
    } catch (err) {
      console.error('Error synchronizing supply chain database:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Action Handlers
  const handleAddProduct = async (productData: any) => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    if (res.ok) await fetchAllData();
  };

  const handleAddSupplier = async (supplierData: any) => {
    const res = await fetch('/api/suppliers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(supplierData)
    });
    if (res.ok) await fetchAllData();
  };

  const handleCreatePO = async (poData: any) => {
    const res = await fetch('/api/purchase-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(poData)
    });
    if (res.ok) await fetchAllData();
  };

  const handleApprovePO = async (poId: number) => {
    const res = await fetch(`/api/purchase-orders/${poId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvedBy: 'Elena Vance' })
    });
    if (res.ok) await fetchAllData();
  };

  const handleReceiveGoods = async (poId: number, receiveData: any) => {
    const res = await fetch(`/api/purchase-orders/${poId}/receive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(receiveData)
    });
    if (res.ok) await fetchAllData();
  };

  const handleAdjustStock = async (batchId: number, delta: number, reason: string, notes: string) => {
    const res = await fetch('/api/inventory/adjustments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batchId, quantityDelta: delta, reason, notes })
    });
    if (res.ok) await fetchAllData();
  };

  const handleCreateSalesOrder = async (orderData: any) => {
    const res = await fetch('/api/sales/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (res.ok) await fetchAllData();
  };

  const handleDispatchOrder = async (orderId: number) => {
    const res = await fetch(`/api/sales/orders/${orderId}/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) await fetchAllData();
  };

  const handleLogInspection = async (inspectionData: any) => {
    const res = await fetch('/api/qc/inspections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inspectionData)
    });
    if (res.ok) await fetchAllData();
  };

  const handleRecordSpoilage = async (spoilageData: any) => {
    const res = await fetch('/api/qc/spoilage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(spoilageData)
    });
    if (res.ok) await fetchAllData();
  };

  const expiringBatchesCount = batches.filter(b => b.daysToExpiry <= 7).length;
  const lowStockCount = fruits.filter(f => f.currentStock <= f.minStockLevel).length;

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-sans transition-colors duration-150 ${
      theme === 'dark' ? 'bg-stone-950 text-stone-100 dark' : 'bg-stone-100 text-stone-900 theme-light'
    }`}>
      {/* Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        expiringCount={expiringBatchesCount}
        lowStockCount={lowStockCount}
        currentRole={currentRole}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          currentRole={currentRole}
          setCurrentRole={handleRoleChange}
          onRefreshData={fetchAllData}
          isRefreshing={isRefreshing}
          tempAlertCount={1}
        />

        {/* Dynamic View Scrollable Container */}
        <main className={`flex-1 overflow-y-auto p-6 md:p-8 space-y-6 transition-colors duration-150 ${
          theme === 'dark' ? 'bg-stone-950' : 'bg-stone-50'
        }`}>
          {/* Active RBAC Role Announcement Banner */}
          {showRoleBanner && (
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
              theme === 'dark' 
                ? 'bg-stone-900 border-stone-800 text-stone-200 shadow-md' 
                : 'bg-white border-stone-200 text-stone-800 shadow-sm'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-black flex items-center justify-center shrink-0 text-sm">
                  {currentProfile.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-white">
                      {currentProfile.name}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-300">
                      {currentProfile.title}
                    </span>
                    <span className="text-[11px] text-stone-400 hidden md:inline">
                      • {currentProfile.department}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                    {currentProfile.permissionsSummary}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <button
                  onClick={() => setActiveTab(currentProfile.primaryTab as ActiveTab)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition shadow-xs cursor-pointer"
                >
                  Primary Workspace
                </button>
                <button
                  onClick={() => setShowRoleBanner(false)}
                  className="p-1.5 text-stone-400 hover:text-white rounded-lg text-xs cursor-pointer"
                  title="Dismiss notice"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-3">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Initializing Relational Fruit Supply Chain Engine...
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView metrics={metrics} onNavigate={setActiveTab} />
              )}
              {activeTab === 'products' && (
                <ProductsView products={fruits} onAddProduct={handleAddProduct} />
              )}
              {activeTab === 'suppliers' && (
                <SuppliersView suppliers={suppliers} onAddSupplier={handleAddSupplier} />
              )}
              {activeTab === 'procurement' && (
                <ProcurementView
                  purchaseOrders={purchaseOrders}
                  fruits={fruits}
                  suppliers={suppliers}
                  warehouses={warehouses}
                  onCreatePO={handleCreatePO}
                  onApprovePO={handleApprovePO}
                  onReceiveGoods={handleReceiveGoods}
                />
              )}
              {activeTab === 'inventory' && (
                <InventoryView
                  batches={batches}
                  movements={movements}
                  onAdjustStock={handleAdjustStock}
                />
              )}
              {activeTab === 'warehouses' && (
                <WarehouseView warehouses={warehouses} />
              )}
              {activeTab === 'qc' && (
                <QualityControlView
                  inspections={inspections}
                  spoilage={spoilage}
                  batches={batches}
                  onLogInspection={handleLogInspection}
                  onRecordSpoilage={handleRecordSpoilage}
                />
              )}
              {activeTab === 'sales' && (
                <SalesView
                  salesOrders={salesOrders}
                  customers={customers}
                  fruits={fruits}
                  onCreateOrder={handleCreateSalesOrder}
                  onDispatchOrder={handleDispatchOrder}
                />
              )}
              {activeTab === 'logistics' && (
                <LogisticsView shipments={shipments} />
              )}
              {activeTab === 'finance' && (
                <FinanceView financeData={financeData} />
              )}
              {activeTab === 'reports' && (
                <ReportsView
                  fruits={fruits}
                  batches={batches}
                  salesOrders={salesOrders}
                  spoilage={spoilage}
                />
              )}
              {activeTab === 'erd' && (
                <DatabaseSchemaView />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
