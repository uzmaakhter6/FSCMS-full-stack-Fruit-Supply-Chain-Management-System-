import React from 'react';
import { Warehouse } from '../types';
import { 
  Building2, 
  Thermometer, 
  Droplets, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin
} from 'lucide-react';

interface WarehouseViewProps {
  warehouses: Warehouse[];
}

export const WarehouseView: React.FC<WarehouseViewProps> = ({ warehouses }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Cold Storage Facilities & IoT Telemetry</h1>
          <p className="text-xs text-stone-400">
            Multi-facility cold storage network with real-time temperature, humidity, and zone capacity monitoring
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-stone-300 bg-stone-900 border border-stone-800 px-3 py-1.5 rounded-lg shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>IoT Sensors: Online (60s Sampling)</span>
        </div>
      </div>

      {/* Facilities Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {warehouses.map((wh) => {
          const isWarning = wh.status === 'WARNING';
          const isAlarm = wh.status === 'ALARM';
          return (
            <div 
              key={wh.id}
              className={`bg-stone-900 rounded-xl border p-5 shadow-xl flex flex-col justify-between transition ${
                isWarning 
                  ? 'border-amber-600/70 ring-1 ring-amber-500/30' 
                  : isAlarm 
                  ? 'border-rose-600/70 ring-1 ring-rose-500/30' 
                  : 'border-stone-800'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-stone-400 uppercase">
                    {wh.code}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    isWarning 
                      ? 'bg-amber-950/80 border border-amber-800/80 text-amber-300' 
                      : isAlarm 
                      ? 'bg-rose-950/80 border border-rose-800/80 text-rose-300' 
                      : 'bg-emerald-950/80 border border-emerald-800/80 text-emerald-300'
                  }`}>
                    {isWarning ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                    <span>{wh.status}</span>
                  </span>
                </div>

                <h2 className="text-base font-bold text-white">
                  {wh.name}
                </h2>
                <div className="flex items-center gap-1 text-xs text-stone-400 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-stone-500" />
                  <span>{wh.city}, {wh.country} • {wh.type}</span>
                </div>

                {/* Live IoT Sensor Gauge Display */}
                <div className="grid grid-cols-2 gap-3 mt-4 p-3 bg-stone-950 rounded-xl border border-stone-800">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-950/80 border border-blue-800/60 text-blue-400 rounded-lg">
                      <Thermometer className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] text-stone-400 font-medium">Temperature</div>
                      <div className="text-sm font-bold text-white">
                        {wh.currentTempCelsius}°C
                      </div>
                      <div className="text-[9px] text-stone-500">Target: {wh.targetTempCelsius}°C</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 rounded-lg">
                      <Droplets className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] text-stone-400 font-medium">Humidity</div>
                      <div className="text-sm font-bold text-white">
                        {wh.currentHumidityPercent}%
                      </div>
                      <div className="text-[9px] text-stone-500">Target: 90% RH</div>
                    </div>
                  </div>
                </div>

                {/* Capacity Utilization Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-stone-400 font-medium">Capacity Occupancy</span>
                    <span className="font-bold text-stone-200">
                      {wh.currentOccupancyMetricTons.toLocaleString()} / {wh.capacityMetricTons.toLocaleString()} MT ({wh.utilizationRate}%)
                    </span>
                  </div>
                  <div className="w-full bg-stone-950 border border-stone-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        wh.utilizationRate > 80 ? 'bg-amber-400' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${wh.utilizationRate}%` }}
                    />
                  </div>
                </div>

                {/* Sub-Zones */}
                <div className="mt-4 pt-3 border-t border-stone-800 space-y-2">
                  <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                    Cold Chambers & Specialized Vaults:
                  </div>
                  {wh.zones?.map((z, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-2 bg-stone-950/60 border border-stone-800/70 rounded-lg">
                      <span className="text-stone-200 font-medium truncate">{z.name}</span>
                      <div className="flex items-center gap-3 shrink-0 text-stone-400 text-[11px]">
                        <span className="font-mono font-semibold text-blue-400">{z.temp}°C</span>
                        <span>{z.humidity}% RH</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 mt-4 border-t border-stone-800 text-[11px] text-stone-400 flex items-center justify-between">
                <span>Backup Generator: Active</span>
                <span>Ethylene Scrubber: Online</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
