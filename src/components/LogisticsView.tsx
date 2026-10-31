import React from 'react';
import { Shipment } from '../types';
import { 
  Truck, 
  Thermometer, 
  CheckCircle2, 
  Navigation,
  ShieldCheck
} from 'lucide-react';

interface LogisticsViewProps {
  shipments: Shipment[];
}

export const LogisticsView: React.FC<LogisticsViewProps> = ({ shipments }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Logistics & Reefer Cold-Chain Fleet</h1>
          <p className="text-xs text-stone-400">
            Refrigerated container and truck telemetry with GPS milestones and temperature excursion alerts
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-3 py-1.5 rounded-lg shadow-md">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Cold-Chain Protocol HACCP Compliant</span>
        </div>
      </div>

      {/* Fleet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shipments.map((shp) => (
          <div key={shp.id} className="bg-stone-900 rounded-xl border border-stone-800 p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold text-stone-400 uppercase">
                  {shp.shipmentNumber}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  shp.status === 'IN_TRANSIT' 
                    ? 'bg-blue-950/80 border border-blue-800/80 text-blue-300' 
                    : shp.status === 'DELIVERED'
                    ? 'bg-emerald-950/80 border border-emerald-800/80 text-emerald-300'
                    : 'bg-stone-800 border border-stone-700 text-stone-300'
                }`}>
                  <Truck className="w-3 h-3" />
                  <span>{shp.status}</span>
                </span>
              </div>

              <h2 className="text-base font-bold text-white">
                Consignment for {shp.customerName}
              </h2>
              <div className="text-xs text-stone-400 mt-0.5">
                Sales Order Ref: <span className="font-mono text-stone-200 font-semibold">{shp.soNumber}</span>
              </div>

              {/* Real-time Reefer Telemetry */}
              <div className="mt-4 p-3 bg-stone-950 rounded-xl border border-stone-800 grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-950/80 border border-blue-800/60 text-blue-400 rounded-lg">
                    <Thermometer className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-400">Cargo Temperature</div>
                    <div className="text-sm font-bold text-white">{shp.currentTempCelsius}°C</div>
                    <div className="text-[9px] text-stone-500">Setpoint: {shp.setpointTempCelsius}°C</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 rounded-lg">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-400">Integrity Status</div>
                    <div className="text-xs font-bold text-emerald-300">HACCP Validated</div>
                    <div className="text-[9px] text-stone-500">Zero Excursions</div>
                  </div>
                </div>
              </div>

              {/* Route & Driver */}
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-stone-300">
                  <Navigation className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="font-medium truncate">{shp.route}</span>
                </div>
                <div className="flex items-center justify-between text-stone-300 bg-stone-950/60 border border-stone-800/70 p-2 rounded-lg">
                  <div>
                    <div className="font-semibold text-white">{shp.driverName}</div>
                    <div className="text-[10px] text-stone-400">Vehicle: {shp.vehiclePlate}</div>
                  </div>
                  <div className="text-right text-[11px]">
                    <div className="text-stone-400">Dep: {shp.departureTime}</div>
                    <div className="font-semibold text-stone-200">Est. Arr: {shp.estimatedArrival}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-4 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
              <span>Freight Cost: <strong className="text-white">${shp.transportCost.toFixed(2)}</strong></span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Reefer Compressor Running
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
