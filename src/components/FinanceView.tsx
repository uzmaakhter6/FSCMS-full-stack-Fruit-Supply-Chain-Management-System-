import React from 'react';

interface FinanceViewProps {
  financeData: any;
}

export const FinanceView: React.FC<FinanceViewProps> = ({ financeData }) => {
  const ar = financeData?.accountsReceivable || 194850.00;
  const ap = financeData?.outstandingPayable || 67950.00;
  const revenue = financeData?.totalRevenue || 86400.00;
  const expenses = financeData?.totalExpenses || 5560.00;
  const spoilageLoss = financeData?.spoilageLoss || 255.00;
  const estimatedCOGS = revenue * 0.58;
  const grossProfit = revenue - estimatedCOGS;
  const netProfit = grossProfit - expenses - spoilageLoss;

  const expensesList = (Array.isArray(financeData?.expensesList) && financeData.expensesList.length > 0)
    ? financeData.expensesList
    : [
        { id: 1, expense_id: 1, code: 'EXP-901', category: 'Refrigeration Power', warehouseName: 'Chicago Central Cold Hub', amount: 3420.00, date: '2026-10-28', payee: 'ComEd Commercial Industrial' },
        { id: 2, expense_id: 2, code: 'EXP-902', category: 'Reefer Truck Fuel', warehouseName: 'Chicago Central Cold Hub', amount: 1250.00, date: '2026-10-29', payee: 'Pilot Flying J Fleet Fuel' },
        { id: 3, expense_id: 3, code: 'EXP-903', category: 'Inspection & Phytosanitary', warehouseName: 'Long Beach Marine Cold Terminal', amount: 890.00, date: '2026-10-30', payee: 'USDA APHIS Plant Protection' }
      ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Financial Ledger, AP/AR & P&L</h1>
        <p className="text-xs text-stone-400">
          Integrated financial management: Accounts Receivable, Accounts Payable, cold-chain energy overheads, and net margin
        </p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-stone-900 p-4 rounded-xl border border-stone-800 shadow-xl">
          <div className="text-xs text-stone-400 font-medium">Accounts Receivable (Clients)</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">${ar.toLocaleString()}</div>
          <div className="text-[11px] text-stone-500 mt-1">Supermarket & Wholesale Invoices</div>
        </div>

        <div className="bg-stone-900 p-4 rounded-xl border border-stone-800 shadow-xl">
          <div className="text-xs text-stone-400 font-medium">Accounts Payable (Growers)</div>
          <div className="text-2xl font-bold text-white mt-1">${ap.toLocaleString()}</div>
          <div className="text-[11px] text-stone-500 mt-1">Supplier Invoices (Net 15/30)</div>
        </div>

        <div className="bg-stone-900 p-4 rounded-xl border border-stone-800 shadow-xl">
          <div className="text-xs text-stone-400 font-medium">Cold-Chain Energy & Ops</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">${expenses.toLocaleString()}</div>
          <div className="text-[11px] text-stone-500 mt-1">Refrigeration power & fuel</div>
        </div>

        <div className="bg-stone-900 p-4 rounded-xl border border-stone-800 shadow-xl">
          <div className="text-xs text-stone-400 font-medium">Net Profit (MTD)</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">${netProfit.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-1">Margin: {((netProfit / revenue) * 100).toFixed(1)}%</div>
        </div>
      </div>

      {/* P&L Breakdown Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-stone-900 p-5 rounded-xl border border-stone-800 shadow-xl">
          <h2 className="text-sm font-bold text-white mb-3">Profit & Loss Statement (Consolidated)</h2>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-stone-800 font-semibold text-stone-200">
              <span>Gross Fruit Sales Revenue</span>
              <span className="text-emerald-400 font-bold">+${revenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-stone-800 text-stone-400">
              <span>Cost of Goods Sourced (Estimated COGS)</span>
              <span className="text-rose-400">-${estimatedCOGS.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-stone-800 font-bold text-white bg-stone-950/80 px-2 rounded">
              <span>Gross Operational Profit</span>
              <span>${grossProfit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-stone-800 text-stone-400">
              <span>Fruit Spoilage & Senescence Loss</span>
              <span className="text-rose-400">-${spoilageLoss.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-stone-800 text-stone-400">
              <span>Cold Storage Facility Power & Chiller Maintenance</span>
              <span className="text-rose-400">-${expenses.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-t border-stone-700 font-black text-sm text-white bg-emerald-950/50 border border-emerald-800/80 px-2 rounded">
              <span>Net Supply Chain Operating Income</span>
              <span className="text-emerald-300">${netProfit.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Operating Expenses Log */}
        <div className="bg-stone-900 p-5 rounded-xl border border-stone-800 shadow-xl">
          <h2 className="text-sm font-bold text-white mb-3">Recent Cold-Chain Operating Expenses</h2>
          <div className="space-y-2 text-xs">
            {expensesList.map((exp: any, index: number) => {
              const uniqueKey = exp?.id != null 
                ? `exp-${exp.id}` 
                : exp?.expense_id != null 
                  ? `exp-${exp.expense_id}` 
                  : exp?.code 
                    ? `exp-${exp.code}` 
                    : `exp-row-${index}`;
              const category = exp?.category || 'Cold-Chain Operational Expense';
              const warehouse = exp?.warehouseName || exp?.warehouse_name || 'Central Facility';
              const payee = exp?.payee || 'Service Provider';
              const dateVal = exp?.date || exp?.expense_date || '2026-10-31';
              const amountVal = typeof exp?.amount === 'number' 
                ? exp.amount.toFixed(2) 
                : (Number(exp?.amount) ? Number(exp.amount).toFixed(2) : '0.00');

              return (
                <div key={uniqueKey} className="p-3 bg-stone-950 rounded-lg flex items-center justify-between border border-stone-800">
                  <div>
                    <div className="font-semibold text-white">{category}</div>
                    <div className="text-[10px] text-stone-400">{warehouse} • {payee}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white">${amountVal}</div>
                    <div className="text-[10px] text-stone-500">{dateVal}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
