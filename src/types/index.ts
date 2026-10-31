// TypeScript Definitions for FSCMS Relational Entities

export type UserRole =
  | 'SUPER_ADMIN'
  | 'MANAGER'
  | 'PROCUREMENT_OFFICER'
  | 'WAREHOUSE_MANAGER'
  | 'QUALITY_INSPECTOR'
  | 'SALES_MANAGER'
  | 'ACCOUNTANT'
  | 'LOGISTICS_MANAGER';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
}

export interface FruitProduct {
  id: number;
  sku: string;
  name: string;
  category: 'Tropical' | 'Citrus' | 'Berries' | 'Pomes' | 'Melons';
  variety: string;
  grade: 'Export Grade A+' | 'Grade A' | 'Grade B' | 'Processing';
  originCountry: string;
  harvestSeason: string;
  unit: 'kg' | 'carton' | 'crate' | 'ton' | 'punnet';
  purchasePrice: number;
  wholesalePrice: number;
  retailPrice: number;
  storageTempMin: number;
  storageTempMax: number;
  expectedShelfLifeDays: number;
  minStockLevel: number;
  currentStock: number;
  imageUrl?: string;
  isActive: boolean;
}

export interface Supplier {
  id: number;
  code: string;
  name: string;
  type: 'Farmer / Orchard' | 'Commercial Grower' | 'Cooperative' | 'Importer' | 'Distributor';
  sourcingRegion: string;
  country: string;
  contactPerson: string;
  email: string;
  phone: string;
  paymentTermsDays: number;
  rating: number; // 1 to 5
  qualityScore: number; // 0 to 100%
  activeOrdersCount: number;
  outstandingBalance: number;
}

export type POStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'PARTIALLY_RECEIVED' | 'FULLY_RECEIVED' | 'CANCELLED';

export interface PurchaseOrderItem {
  productId: number;
  productName: string;
  sku: string;
  quantityOrdered: number;
  quantityReceived: number;
  unit: string;
  unitPrice: number;
  totalCost: number;
}

export interface PurchaseOrder {
  id: number;
  poNumber: string;
  supplierId: number;
  supplierName: string;
  warehouseId: number;
  warehouseName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  status: POStatus;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  grandTotal: number;
  approvedBy?: string;
  notes?: string;
}

export interface InventoryBatch {
  id: number;
  batchNumber: string;
  productId: number;
  productName: string;
  sku: string;
  supplierId: number;
  supplierName: string;
  purchaseOrderId?: number;
  warehouseId: number;
  warehouseName: string;
  zone: string;
  harvestDate: string;
  receivedDate: string;
  expiryDate: string;
  daysToExpiry: number;
  initialQuantity: number;
  quantityAvailable: number;
  quantityReserved: number;
  quantityDamaged: number;
  unit: string;
  purchaseCost: number;
  qcStatus: 'PASSED' | 'PENDING' | 'QUARANTINED' | 'REJECTED';
  grade: string;
}

export interface InventoryMovement {
  id: string;
  batchNumber: string;
  productName: string;
  movementType: 'INBOUND_RECEIPT' | 'OUTBOUND_SALE' | 'TRANSFER' | 'SPOILAGE_WRITE_OFF' | 'MANUAL_ADJUSTMENT';
  quantityDelta: number;
  unit: string;
  sourceLocation: string;
  destLocation: string;
  performedBy: string;
  timestamp: string;
  notes: string;
}

export interface Warehouse {
  id: number;
  code: string;
  name: string;
  type: 'Cold Storage' | 'Controlled Atmosphere' | 'Ripening Chamber' | 'Distribution Center';
  city: string;
  country: string;
  capacityMetricTons: number;
  currentOccupancyMetricTons: number;
  utilizationRate: number;
  currentTempCelsius: number;
  targetTempCelsius: number;
  currentHumidityPercent: number;
  status: 'OPTIMAL' | 'WARNING' | 'ALARM';
  zones: {
    name: string;
    temp: number;
    humidity: number;
    capacity: number;
  }[];
}

export interface QualityInspection {
  id: number;
  code: string;
  batchNumber: string;
  productName: string;
  inspectorName: string;
  brixSweetness: number;
  firmnessKgf: number;
  defectPercentage: number;
  verdict: 'PASSED_PREMIUM' | 'PASSED_STANDARD' | 'DOWNGRADED' | 'REJECTED';
  date: string;
  notes: string;
}

export interface SpoilageRecord {
  id: number;
  code: string;
  batchNumber: string;
  productName: string;
  quantitySpoiled: number;
  unit: string;
  totalReceived: number;
  spoilagePercentage: number;
  financialLoss: number;
  reason: 'Over-ripening' | 'Temperature failure' | 'Transportation damage' | 'Poor packaging' | 'Disease or infection' | 'Expiry';
  actionTaken: 'Composted' | 'Destroyed' | 'Biofuel Salvage' | 'Returned to Grower';
  recordedBy: string;
  date: string;
}

export type SalesOrderStatus = 'DRAFT' | 'CONFIRMED' | 'PROCESSING' | 'PACKED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';

export interface SalesOrderItem {
  productId: number;
  productName: string;
  quantityOrdered: number;
  quantityAllocated: number;
  allocatedBatches: {
    batchNumber: string;
    quantity: number;
    expiryDate: string;
  }[];
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface SalesOrder {
  id: number;
  soNumber: string;
  customerId: number;
  customerName: string;
  customerCategory: string;
  orderDate: string;
  dispatchDate: string;
  status: SalesOrderStatus;
  items: SalesOrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  paymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';
}

export interface Customer {
  id: number;
  code: string;
  businessName: string;
  contactPerson: string;
  category: 'Supermarket Chain' | 'Wholesale Buyer' | 'Export Client' | 'Food Processor';
  email: string;
  phone: string;
  city: string;
  country: string;
  creditLimit: number;
  currentBalance: number;
  discountRate: number;
}

export interface Shipment {
  id: number;
  shipmentNumber: string;
  soNumber: string;
  customerName: string;
  vehiclePlate: string;
  driverName: string;
  driverPhone: string;
  route: string;
  departureTime: string;
  estimatedArrival: string;
  status: 'SCHEDULED' | 'LOADING' | 'IN_TRANSIT' | 'DELIVERED';
  currentTempCelsius: number;
  setpointTempCelsius: number;
  coldChainCompliant: boolean;
  transportCost: number;
}

export interface Expense {
  id: number;
  code: string;
  category: 'Refrigeration Power' | 'Reefer Truck Fuel' | 'Packaging & Pallets' | 'Inspection & Phytosanitary' | 'Warehouse Maintenance';
  warehouseName: string;
  amount: number;
  date: string;
  payee: string;
}
