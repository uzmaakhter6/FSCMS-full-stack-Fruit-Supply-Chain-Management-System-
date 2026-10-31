import React from 'react';
import { 
  LayoutDashboard, 
  Apple, 
  Users, 
  ShoppingBag, 
  Boxes, 
  Warehouse, 
  CheckSquare, 
  ShoppingCart, 
  Truck, 
  DollarSign, 
  BarChart3, 
  Database,
  Flame,
  Lock,
  Star
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { UserRole } from '../types';
import { ROLE_PROFILES } from '../types/rbac';

export type ActiveTab = 
  | 'dashboard'
  | 'products'
  | 'suppliers'
  | 'procurement'
  | 'inventory'
  | 'warehouses'
  | 'qc'
  | 'sales'
  | 'logistics'
  | 'finance'
  | 'reports'
  | 'erd';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  expiringCount: number;
  lowStockCount: number;
  currentRole: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  expiringCount,
  lowStockCount,
  currentRole
}) => {
  const { theme } = useTheme();
  const profile = ROLE_PROFILES[currentRole] || ROLE_PROFILES.SUPER_ADMIN;

  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard & KPIs', 
      icon: LayoutDashboard 
    },
    { 
      id: 'products', 
      label: 'Fruit Catalog (15 Fruits)', 
      icon: Apple, 
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined, 
      badgeColor: theme === 'dark' 
        ? 'bg-amber-950/80 border border-amber-800/80 text-amber-300' 
        : 'bg-amber-100 border border-amber-200 text-amber-800' 
    },
    { 
      id: 'suppliers', 
      label: 'Suppliers & Orchards', 
      icon: Users 
    },
    { 
      id: 'procurement', 
      label: 'Procurement & POs', 
      icon: ShoppingBag 
    },
    { 
      id: 'inventory', 
      label: 'Inventory & FEFO Batches', 
      icon: Boxes, 
      badge: expiringCount > 0 ? `${expiringCount} Expiry` : undefined, 
      badgeColor: theme === 'dark' 
        ? 'bg-rose-950/80 border border-rose-800/80 text-rose-300' 
        : 'bg-rose-100 border border-rose-200 text-rose-800' 
    },
    { 
      id: 'warehouses', 
      label: 'Warehouses & Cold Chain', 
      icon: Warehouse 
    },
    { 
      id: 'qc', 
      label: 'Quality & Spoilage', 
      icon: CheckSquare 
    },
    { 
      id: 'sales', 
      label: 'Sales & Fulfillment', 
      icon: ShoppingCart 
    },
    { 
      id: 'logistics', 
      label: 'Logistics & Reefer Fleet', 
      icon: Truck 
    },
    { 
      id: 'finance', 
      label: 'Financials & P&L', 
      icon: DollarSign 
    },
    { 
      id: 'reports', 
      label: 'Reports & Demand AI', 
      icon: BarChart3 
    },
    { 
      id: 'erd', 
      label: 'MySQL ERD & 66 Tables', 
      icon: Database, 
      highlight: true 
    }
  ];

  return (
    <aside className={`w-64 flex flex-col shrink-0 border-r transition-colors ${
      theme === 'dark' 
        ? 'bg-stone-900 text-stone-200 border-stone-800' 
        : 'bg-white text-stone-700 border-stone-200 shadow-xs'
    }`}>
      {/* Brand Header */}
      <div className={`h-16 px-5 flex items-center gap-3 border-b ${
        theme === 'dark' ? 'border-stone-800' : 'border-stone-200'
      }`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-lime-500 flex items-center justify-center text-stone-950 font-black shadow-md shadow-emerald-950/40">
          <Flame className="w-5 h-5 text-stone-950" />
        </div>
        <div>
          <div className={`font-bold text-sm tracking-tight flex items-center gap-1.5 ${
            theme === 'dark' ? 'text-white' : 'text-stone-900'
          }`}>
            <span>FSCMS</span>
            <span className="text-[10px] font-semibold uppercase bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">
              Enterprise
            </span>
          </div>
          <div className={`text-[11px] truncate ${
            theme === 'dark' ? 'text-stone-400' : 'text-stone-500'
          }`}>Fruit Supply Chain System</div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className={`px-3 pb-2 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between ${
          theme === 'dark' ? 'text-stone-400' : 'text-stone-500'
        }`}>
          <span>Core Operations</span>
          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.2 rounded">
            RBAC Active
          </span>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isPrimary = profile.primaryTab === item.id;
          const isAllowed = currentRole === 'SUPER_ADMIN' || currentRole === 'MANAGER' || profile.allowedModules.includes(item.id);

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as ActiveTab)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                isActive 
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold' 
                  : isPrimary
                  ? theme === 'dark'
                    ? 'text-emerald-300 bg-emerald-950/40 border border-emerald-800/60 hover:bg-emerald-900/50'
                    : 'text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100'
                  : item.highlight
                  ? theme === 'dark'
                    ? 'text-emerald-300 hover:bg-stone-800 hover:text-white border border-emerald-500/20 bg-emerald-950/30'
                    : 'text-emerald-700 hover:bg-stone-100 hover:text-emerald-900 border border-emerald-500/30 bg-emerald-50'
                  : theme === 'dark'
                    ? 'text-stone-300 hover:bg-stone-800 hover:text-white'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive 
                    ? 'text-white' 
                    : isPrimary
                    ? (theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600')
                    : item.highlight 
                    ? (theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600')
                    : (theme === 'dark' ? 'text-stone-400' : 'text-stone-500')
                }`} />
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {isPrimary && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500 text-stone-950 flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    <span>Primary</span>
                  </span>
                )}
                {!isAllowed && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-medium bg-stone-800 text-stone-400 border border-stone-700 flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" />
                    <span>View</span>
                  </span>
                )}
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${item.badgeColor || 'bg-stone-700 text-stone-200'}`}>
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Relational DB Engine & Active Persona Footer */}
      <div className={`p-3.5 border-t m-2 rounded-xl text-[11px] ${
        theme === 'dark' 
          ? 'border-stone-800 bg-stone-950/60 text-stone-300' 
          : 'border-stone-200 bg-stone-50 text-stone-600'
      }`}>
        <div className="flex items-center justify-between mb-1">
          <span className={`font-semibold flex items-center gap-1.5 ${
            theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'
          }`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Role: {profile.initials}
          </span>
          <span className={`text-[10px] ${
            theme === 'dark' ? 'text-stone-400' : 'text-stone-500'
          }`}>{profile.department.split('&')[0]}</span>
        </div>
        <p className={`text-[10px] leading-relaxed line-clamp-2 ${
          theme === 'dark' ? 'text-stone-400' : 'text-stone-500'
        }`}>
          {profile.permissionsSummary}
        </p>
      </div>
    </aside>
  );
};
