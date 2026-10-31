import { UserRole } from './index';

export interface RoleProfile {
  name: string;
  initials: string;
  title: string;
  department: string;
  primaryTab: string;
  permissionsSummary: string;
  allowedModules: string[];
  canCreatePO: boolean;
  canAdjustStock: boolean;
  canLogQC: boolean;
  canRecordSpoilage: boolean;
  canBookOrder: boolean;
  canDispatchFleet: boolean;
  canAccessFinance: boolean;
  canRunSQL: boolean;
}

export const ROLE_PROFILES: Record<UserRole, RoleProfile> = {
  SUPER_ADMIN: {
    name: 'Elena Vance',
    initials: 'EV',
    title: 'Super Administrator',
    department: 'Executive Operations',
    primaryTab: 'dashboard',
    permissionsSummary: 'Unrestricted read/write access across all 66 database tables, financial ledgers, and raw SQL execution engine.',
    allowedModules: ['dashboard', 'products', 'suppliers', 'procurement', 'inventory', 'warehouses', 'qc', 'sales', 'logistics', 'finance', 'reports', 'erd'],
    canCreatePO: true,
    canAdjustStock: true,
    canLogQC: true,
    canRecordSpoilage: true,
    canBookOrder: true,
    canDispatchFleet: true,
    canAccessFinance: true,
    canRunSQL: true
  },
  PROCUREMENT_OFFICER: {
    name: 'Marcus Thorne',
    initials: 'MT',
    title: 'Procurement Officer',
    department: 'Sourcing & Grower Relations',
    primaryTab: 'procurement',
    permissionsSummary: 'Authorized to negotiate supplier contracts, issue Purchase Orders, and receive fruit shipments.',
    allowedModules: ['dashboard', 'procurement', 'suppliers', 'products', 'inventory'],
    canCreatePO: true,
    canAdjustStock: false,
    canLogQC: false,
    canRecordSpoilage: false,
    canBookOrder: false,
    canDispatchFleet: false,
    canAccessFinance: false,
    canRunSQL: false
  },
  WAREHOUSE_MANAGER: {
    name: 'David Chen',
    initials: 'DC',
    title: 'Warehouse & Cold Manager',
    department: 'Cold Storage & Inventory',
    primaryTab: 'inventory',
    permissionsSummary: 'Controls cold storage chamber IoT telemetry, FEFO batch movement audits, and stock adjustments.',
    allowedModules: ['dashboard', 'inventory', 'warehouses', 'products', 'qc'],
    canCreatePO: false,
    canAdjustStock: true,
    canLogQC: false,
    canRecordSpoilage: true,
    canBookOrder: false,
    canDispatchFleet: false,
    canAccessFinance: false,
    canRunSQL: false
  },
  QUALITY_INSPECTOR: {
    name: 'Dr. Sarah Lin',
    initials: 'SL',
    title: 'Quality Assurance Inspector',
    department: 'QC Lab & Phytosanitary',
    primaryTab: 'qc',
    permissionsSummary: 'Certified to log refractometer Brix sugar readings, penetrometer firmness tests, and write off spoiled fruit batches.',
    allowedModules: ['dashboard', 'qc', 'inventory', 'products'],
    canCreatePO: false,
    canAdjustStock: false,
    canLogQC: true,
    canRecordSpoilage: true,
    canBookOrder: false,
    canDispatchFleet: false,
    canAccessFinance: false,
    canRunSQL: false
  },
  SALES_MANAGER: {
    name: 'Priya Patel',
    initials: 'PP',
    title: 'Sales & Distribution Lead',
    department: 'Wholesale & Supermarket Accounts',
    primaryTab: 'sales',
    permissionsSummary: 'Authorized to book sales orders, configure client price discounts, and allocate FEFO batches for dispatch.',
    allowedModules: ['dashboard', 'sales', 'inventory', 'products', 'logistics'],
    canCreatePO: false,
    canAdjustStock: false,
    canLogQC: false,
    canRecordSpoilage: false,
    canBookOrder: true,
    canDispatchFleet: true,
    canAccessFinance: false,
    canRunSQL: false
  },
  ACCOUNTANT: {
    name: 'Michael Ross',
    initials: 'MR',
    title: 'Senior Financial Controller',
    department: 'Corporate Accounting',
    primaryTab: 'finance',
    permissionsSummary: 'Full management of Accounts Receivable, Accounts Payable to growers, cold-chain energy overheads, and P&L.',
    allowedModules: ['dashboard', 'finance', 'reports', 'sales', 'procurement'],
    canCreatePO: false,
    canAdjustStock: false,
    canLogQC: false,
    canRecordSpoilage: false,
    canBookOrder: false,
    canDispatchFleet: false,
    canAccessFinance: true,
    canRunSQL: false
  },
  LOGISTICS_MANAGER: {
    name: 'Carlos Mendez',
    initials: 'CM',
    title: 'Reefer Fleet Dispatcher',
    department: 'Transportation & Logistics',
    primaryTab: 'logistics',
    permissionsSummary: 'Manages refrigerated container fleet, monitors in-transit temperatures, and confirms store deliveries.',
    allowedModules: ['dashboard', 'logistics', 'warehouses', 'sales'],
    canCreatePO: false,
    canAdjustStock: false,
    canLogQC: false,
    canRecordSpoilage: false,
    canBookOrder: false,
    canDispatchFleet: true,
    canAccessFinance: false,
    canRunSQL: false
  },
  MANAGER: {
    name: 'Elena Vance',
    initials: 'EV',
    title: 'Supply Chain Director',
    department: 'Executive Operations',
    primaryTab: 'dashboard',
    permissionsSummary: 'High-level operational overview, purchase approvals, and executive KPI reporting.',
    allowedModules: ['dashboard', 'products', 'suppliers', 'procurement', 'inventory', 'warehouses', 'qc', 'sales', 'logistics', 'finance', 'reports', 'erd'],
    canCreatePO: true,
    canAdjustStock: false,
    canLogQC: true,
    canRecordSpoilage: true,
    canBookOrder: true,
    canDispatchFleet: true,
    canAccessFinance: true,
    canRunSQL: false
  }
};
