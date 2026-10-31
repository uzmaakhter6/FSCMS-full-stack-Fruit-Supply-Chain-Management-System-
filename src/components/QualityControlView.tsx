import React, { useState } from 'react';
import { QualityInspection, SpoilageRecord, InventoryBatch } from '../types';
import { 
  CheckSquare, 
  AlertOctagon, 
  Activity
} from 'lucide-react';

interface QualityControlViewProps {
  inspections: QualityInspection[];
  spoilage: SpoilageRecord[];
  batches: InventoryBatch[];
  onLogInspection: (inspectionData: any) => Promise<void>;
  onRecordSpoilage: (spoilageData: any) => Promise<void>;
}

export const QualityControlView: React.FC<QualityControlViewProps> = ({
  inspections,
  spoilage,
  batches,
  onLogInspection,
  onRecordSpoilage
}) => {
  const [activeTab, setActiveTab] = useState<'inspections' | 'spoilage'>('spoilage');
  const [isSpoilageModalOpen, setIsSpoilageModalOpen] = useState(false);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);

  // Spoilage Form State
  const [spoilageForm, setSpoilageForm] = useState({
    batchId: batches[0]?.id || 1,
    quantitySpoiled: '10',
    reason: 'Over-ripening',
    actionTaken: 'Composted'
  });

  // Inspection Form State
  const [inspectionForm, setInspectionForm] = useState({
    batchId: batches[0]?.id || 1,
    brixSweetness: '14.5',
    firmnessKgf: '3.8',
    defectPercentage: '1.2',
    verdict: 'PASSED_STANDARD',
    notes: 'Fruit meets export sugar content and firmness index.'
  });

  const handleSpoilageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onRecordSpoilage({
      batchId: Number(spoilageForm.batchId),
      quantitySpoiled: parseFloat(spoilageForm.quantitySpoiled),
      reason: spoilageForm.reason,
      actionTaken: spoilageForm.actionTaken
    });
    setIsSpoilageModalOpen(false);
  };

  const handleInspectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogInspection({
      batchId: Number(inspectionForm.batchId),
      brixSweetness: parseFloat(inspectionForm.brixSweetness),
      firmnessKgf: parseFloat(inspectionForm.firmnessKgf),
      defectPercentage: parseFloat(inspectionForm.defectPercentage),
      verdict: inspectionForm.verdict,
      notes: inspectionForm.notes
    });
    setIsInspectionModalOpen(false);
  };

  const totalFinancialLoss = spoilage.reduce((sum, s) => sum + s.financialLoss, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Fruit Quality Control & Spoilage</h1>
          <p className="text-xs text-stone-400">
            Penetrometer firmness, refractometer Brix sugar grading, and formal spoilage write-off ledger
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsInspectionModalOpen(true)}
            className="px-3 py-2 bg-stone-900 border border-stone-800 text-stone-200 hover:bg-stone-800 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1.5 transition"
          >
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <span>Log QC Inspection</span>
          </button>
          <button
            onClick={() => setIsSpoilageModalOpen(true)}
            className="px-3 py-2 bg-rose-700 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold shadow-md flex items-center gap-1.5 transition"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Record Spoilage Write-Off</span>
          </button>
        </div>
      </div>

      {/* Spoilage Formula Callout Card */}
      <div className="bg-amber-950/30 border border-amber-800/60 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-amber-400" />
            <span>Standard Spoilage Benchmark Formula</span>
          </div>
          <div className="font-mono text-sm font-black text-amber-200 mt-1">
            Spoilage % = (Spoiled Quantity / Total Received Quantity) × 100
          </div>
          <p className="text-[11px] text-amber-400/80 mt-0.5">
            Recorded audit events reduce inventory balance transactionally and log financial cost of goods loss.
          </p>
        </div>

        <div className="p-3 bg-stone-950/80 rounded-lg border border-amber-800/60 text-right shrink-0">
          <div className="text-[10px] text-stone-400 font-semibold uppercase">Total Write-Off Loss</div>
          <div className="text-lg font-black text-rose-400">
            ${totalFinancialLoss.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-stone-800">
        <button
          onClick={() => setActiveTab('spoilage')}
          className={`pb-2 text-xs font-bold border-b-2 transition ${
            activeTab === 'spoilage' ? 'border-rose-500 text-rose-400' : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          Spoilage Records Ledger ({spoilage.length})
        </button>
        <button
          onClick={() => setActiveTab('inspections')}
          className={`pb-2 text-xs font-bold border-b-2 transition ${
            activeTab === 'inspections' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          Quality Inspection Records ({inspections.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'spoilage' ? (
        <div className="bg-stone-900 rounded-xl border border-stone-800 shadow-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950 border-b border-stone-800 text-stone-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Record ID</th>
                <th className="py-3 px-4">Batch Number</th>
                <th className="py-3 px-4">Fruit Product</th>
                <th className="py-3 px-4">Spoiled Qty / Total</th>
                <th className="py-3 px-4">Spoilage %</th>
                <th className="py-3 px-4">Financial Loss</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Action Taken</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800 text-stone-300">
              {spoilage.map((item) => (
                <tr key={item.id} className="hover:bg-stone-800/40 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    {item.code}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-stone-400">
                    {item.batchNumber}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-white">
                    {item.productName}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-stone-200">
                    {item.quantitySpoiled} / {item.totalReceived} {item.unit}s
                  </td>
                  <td className="py-3.5 px-4 font-bold text-rose-400">
                    {item.spoilagePercentage}%
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    ${item.financialLoss.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-stone-300">
                    <span className="bg-stone-800 border border-stone-700 px-2 py-0.5 rounded text-[11px] font-medium text-stone-200">
                      {item.reason}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-stone-300">
                    {item.actionTaken}
                  </td>
                  <td className="py-3.5 px-4 text-stone-500 text-[11px]">
                    {item.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-stone-900 rounded-xl border border-stone-800 shadow-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950 border-b border-stone-800 text-stone-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Inspection #</th>
                <th className="py-3 px-4">Batch Number</th>
                <th className="py-3 px-4">Fruit Product</th>
                <th className="py-3 px-4">Brix Sweetness (°Bx)</th>
                <th className="py-3 px-4">Pulp Firmness</th>
                <th className="py-3 px-4">Defect %</th>
                <th className="py-3 px-4">Verdict</th>
                <th className="py-3 px-4">Inspector</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800 text-stone-300">
              {inspections.map((insp) => (
                <tr key={insp.id} className="hover:bg-stone-800/40 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    {insp.code}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-stone-400">
                    {insp.batchNumber}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-white">
                    {insp.productName}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-amber-300">
                    {insp.brixSweetness}° Brix
                  </td>
                  <td className="py-3.5 px-4 font-medium text-stone-200">
                    {insp.firmnessKgf} kgf
                  </td>
                  <td className="py-3.5 px-4 text-stone-300">
                    {insp.defectPercentage}%
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 font-bold px-2 py-0.5 rounded text-[10px]">
                      {insp.verdict}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-stone-300">
                    {insp.inspectorName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Record Spoilage Modal */}
      {isSpoilageModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-stone-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-800 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
              <h2 className="text-base font-bold text-white">Record Fruit Spoilage Loss</h2>
              <button onClick={() => setIsSpoilageModalOpen(false)} className="text-stone-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSpoilageSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-300 mb-1">Target Batch *</label>
                <select
                  value={spoilageForm.batchId}
                  onChange={(e) => setSpoilageForm({ ...spoilageForm, batchId: Number(e.target.value) })}
                  className="w-full bg-stone-950 border border-stone-800 px-3 py-1.5 text-xs rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.batchNumber} - {b.productName} (Avail: {b.quantityAvailable} {b.unit}s)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-300 mb-1">Quantity Spoiled / Unmarketable *</label>
                <input
                  type="number"
                  required
                  value={spoilageForm.quantitySpoiled}
                  onChange={(e) => setSpoilageForm({ ...spoilageForm, quantitySpoiled: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 px-3 py-1.5 text-xs rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-300 mb-1">Root Cause of Spoilage</label>
                <select
                  value={spoilageForm.reason}
                  onChange={(e) => setSpoilageForm({ ...spoilageForm, reason: e.target.value as any })}
                  className="w-full bg-stone-950 border border-stone-800 px-2 py-1.5 text-xs rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Over-ripening">Senescence & Over-ripening</option>
                  <option value="Temperature failure">Cold-Chain Temperature Failure</option>
                  <option value="Transportation damage">Transportation Impact / Carton Crush</option>
                  <option value="Poor packaging">Poor Packaging / Moisture Trap</option>
                  <option value="Disease or infection">Fungal Infection / Mold Spores</option>
                  <option value="Expiry">Expiry Beyond Shelf Life</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-300 mb-1">Disposition Action</label>
                <select
                  value={spoilageForm.actionTaken}
                  onChange={(e) => setSpoilageForm({ ...spoilageForm, actionTaken: e.target.value as any })}
                  className="w-full bg-stone-950 border border-stone-800 px-2 py-1.5 text-xs rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Composted">Send to Organic Compost</option>
                  <option value="Destroyed">Incinerate / Destroy</option>
                  <option value="Biofuel Salvage">Biofuel / Ethanol Salvage</option>
                  <option value="Returned to Grower">Return Claim to Grower</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800 mt-4">
                <button
                  type="button"
                  onClick={() => setIsSpoilageModalOpen(false)}
                  className="px-4 py-2 border border-stone-700 text-stone-300 rounded-lg text-xs font-semibold hover:bg-stone-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-700 text-white rounded-lg text-xs font-semibold hover:bg-rose-600 shadow transition"
                >
                  Commit Spoilage Write-Off
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Inspection Modal */}
      {isInspectionModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-stone-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-800 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
              <h2 className="text-base font-bold text-white">Log Fruit Quality Inspection</h2>
              <button onClick={() => setIsInspectionModalOpen(false)} className="text-stone-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleInspectionSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-300 mb-1">Batch to Test *</label>
                <select
                  value={inspectionForm.batchId}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, batchId: Number(e.target.value) })}
                  className="w-full bg-stone-950 border border-stone-800 px-3 py-1.5 text-xs rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.batchNumber} ({b.productName})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-300 mb-1">Brix Sugar (°Bx)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={inspectionForm.brixSweetness}
                    onChange={(e) => setInspectionForm({ ...inspectionForm, brixSweetness: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 px-3 py-1.5 text-xs rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-300 mb-1">Firmness (kgf)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={inspectionForm.firmnessKgf}
                    onChange={(e) => setInspectionForm({ ...inspectionForm, firmnessKgf: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 px-3 py-1.5 text-xs rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-300 mb-1">Visual Defect %</label>
                <input
                  type="number"
                  step="0.1"
                  value={inspectionForm.defectPercentage}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, defectPercentage: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 px-3 py-1.5 text-xs rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-300 mb-1">Inspection Verdict</label>
                <select
                  value={inspectionForm.verdict}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, verdict: e.target.value as any })}
                  className="w-full bg-stone-950 border border-stone-800 px-2 py-1.5 text-xs rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="PASSED_PREMIUM">Passed (Export Premium A+)</option>
                  <option value="PASSED_STANDARD">Passed (Commercial Grade A)</option>
                  <option value="DOWNGRADED">Downgraded to Grade B</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-300 mb-1">Laboratory / Field Notes</label>
                <textarea
                  rows={2}
                  value={inspectionForm.notes}
                  onChange={(e) => setInspectionForm({ ...inspectionForm, notes: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 px-3 py-1.5 text-xs rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800 mt-4">
                <button
                  type="button"
                  onClick={() => setIsInspectionModalOpen(false)}
                  className="px-4 py-2 border border-stone-700 text-stone-300 rounded-lg text-xs font-semibold hover:bg-stone-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500 shadow transition"
                >
                  Save QC Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
