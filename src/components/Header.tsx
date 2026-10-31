import React from 'react';
import { UserRole } from '../types';
import { 
  ShieldCheck, 
  Thermometer, 
  RefreshCw, 
  Search,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ROLE_PROFILES } from '../types/rbac';

interface HeaderProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  onRefreshData: () => void;
  isRefreshing: boolean;
  tempAlertCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  setCurrentRole,
  onRefreshData,
  isRefreshing,
  tempAlertCount
}) => {
  const { theme, setTheme } = useTheme();
  const profile = ROLE_PROFILES[currentRole] || ROLE_PROFILES.SUPER_ADMIN;

  return (
    <header className="h-16 bg-stone-900 border-b border-stone-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Search / Cold-Chain Status */}
      <div className="flex items-center gap-3 md:gap-4">
        <div className="relative w-48 sm:w-64 md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
          <input 
            type="text" 
            placeholder="Search SKU, batch, PO..."
            className="w-full bg-stone-950 border border-stone-800 pl-9 pr-3 py-1.5 text-xs rounded-lg text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-600 transition"
          />
        </div>

        {/* Cold-Chain Quick Telemetry Badge */}
        <div className="hidden xl:flex items-center gap-2 bg-emerald-950/50 border border-emerald-800/40 px-3 py-1 rounded-full text-xs font-medium text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Cold-Chain Telemetry: Normal (2.3°C Avg)</span>
        </div>

        {tempAlertCount > 0 && (
          <div className="hidden lg:flex items-center gap-1.5 bg-amber-950/60 border border-amber-800/40 px-2.5 py-1 rounded-full text-xs font-medium text-amber-300">
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
            <span>1 Cold Room Excursion Alert</span>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dark Mode / Light Mode Switcher on Top Bar */}
        <div 
          className="flex items-center bg-stone-950 p-1 rounded-lg border border-stone-800 shadow-xs" 
          role="group" 
          aria-label="Theme Mode Selection"
        >
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
              theme === 'light'
                ? 'bg-amber-400 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Switch to Light Mode"
          >
            <Sun className="w-3.5 h-3.5 text-current" />
            <span className="hidden sm:inline">Light</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
              theme === 'dark'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Switch to Dark Mode"
          >
            <Moon className="w-3.5 h-3.5 text-current" />
            <span className="hidden sm:inline">Dark</span>
          </button>
        </div>

        {/* Refresh Button */}
        <button 
          onClick={onRefreshData}
          disabled={isRefreshing}
          title="Sync with Database Engine"
          className="p-2 text-stone-400 hover:text-emerald-400 hover:bg-stone-800 rounded-lg transition cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
        </button>

        {/* Role Switcher (RBAC Demonstrator) */}
        <div className="flex items-center gap-1.5 bg-stone-950 p-1.5 rounded-lg border border-stone-800 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400 ml-1" />
          <span className="text-stone-400 font-medium hidden md:inline">Role:</span>
          <select 
            value={currentRole} 
            onChange={(e) => setCurrentRole(e.target.value as UserRole)}
            className="bg-stone-950 font-semibold text-stone-200 focus:outline-none cursor-pointer pr-1 text-xs"
          >
            <option value="SUPER_ADMIN" className="bg-stone-900 text-stone-100">Super Admin (All Privileges)</option>
            <option value="PROCUREMENT_OFFICER" className="bg-stone-900 text-stone-100">Procurement Officer (Marcus Thorne)</option>
            <option value="WAREHOUSE_MANAGER" className="bg-stone-900 text-stone-100">Warehouse Manager (David Chen)</option>
            <option value="QUALITY_INSPECTOR" className="bg-stone-900 text-stone-100">Quality Inspector (Dr. Sarah Lin)</option>
            <option value="SALES_MANAGER" className="bg-stone-900 text-stone-100">Sales Lead (Priya Patel)</option>
            <option value="ACCOUNTANT" className="bg-stone-900 text-stone-100">Senior Accountant (Michael Ross)</option>
            <option value="LOGISTICS_MANAGER" className="bg-stone-900 text-stone-100">Fleet Dispatcher (Carlos Mendez)</option>
          </select>
        </div>

        {/* User Avatar & Officer Persona */}
        <div className="flex items-center gap-2 pl-2 border-l border-stone-800">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
            {profile.initials}
          </div>
          <div className="hidden lg:block text-left text-xs">
            <div className="font-semibold text-white truncate max-w-[140px]">{profile.name}</div>
            <div className="text-[10px] text-stone-400 truncate max-w-[140px]">{profile.title}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
