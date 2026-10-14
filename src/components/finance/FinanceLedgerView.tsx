import React, { useState } from 'react';
import { Project, FundingRequest, Expense } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { campusData } from '../../services/db';
import {
  DollarSign,
  Receipt,
  CheckCircle,
  Clock,
  Shield,
  FileText,
  Plus,
  Eye,
  PieChart,
} from 'lucide-react';

interface FinanceLedgerViewProps {
  projects: Project[];
  onRequestFunding: () => void;
  onRecordExpense: () => void;
}

export const FinanceLedgerView: React.FC<FinanceLedgerViewProps> = ({
  projects,
  onRequestFunding,
  onRecordExpense,
}) => {
  const { activeRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'grants' | 'expenses'>('grants');
  const [previewReceipt, setPreviewReceipt] = useState<string | null>(null);

  const fundingRequests = campusData.getFundingRequests();
  const expenses = campusData.getExpenses();

  const totalSanctioned = projects.reduce((acc, p) => acc + (p.approvedBudget || 0), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const verifiedExpenses = expenses
    .filter((e) => e.status === 'Verified')
    .reduce((acc, e) => acc + e.amount, 0);
  const remainingBudget = Math.max(0, totalSanctioned - totalExpenses);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-[#0F1E36] rounded-xl border border-slate-800 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Campus Grant Ledger & Expense Vouchers
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">Audited University Fund</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Campus Innovation Financial Ledger
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Transparent institutional grant allocations, itemized student funding requests, and verified bill vouchers.
          </p>
        </div>

        {activeRole === 'student' && (
          <div className="flex items-center gap-2">
            <button
              onClick={onRequestFunding}
              className="px-3.5 py-2 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-xs inline-flex items-center gap-1.5 shadow-sm"
            >
              <DollarSign className="w-4 h-4" />
              <span>Apply for Grant</span>
            </button>
            <button
              onClick={onRecordExpense}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-white font-semibold text-xs inline-flex items-center gap-1.5 border border-slate-700"
            >
              <Receipt className="w-4 h-4 text-cyan-400" />
              <span>Submit Bill</span>
            </button>
          </div>
        )}
      </div>

      {/* Financial Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Grants Sanctioned</span>
          <span className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
            ${totalSanctioned.toLocaleString()}
          </span>
          <span className="block text-[11px] text-slate-500 mt-0.5">Approved across projects</span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Recorded Expenses</span>
          <span className="text-2xl font-bold text-white font-mono tabular-nums">
            ${totalExpenses.toFixed(2)}
          </span>
          <span className="block text-[11px] text-slate-500 mt-0.5">Submitted student vouchers</span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Audited & Verified</span>
          <span className="text-2xl font-bold text-cyan-400 font-mono tabular-nums">
            ${verifiedExpenses.toFixed(2)}
          </span>
          <span className="block text-[11px] text-slate-500 mt-0.5">Approved with valid receipts</span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Available Balance</span>
          <span className="text-2xl font-bold text-amber-400 font-mono tabular-nums">
            ${remainingBudget.toFixed(2)}
          </span>
          <span className="block text-[11px] text-slate-500 mt-0.5">Remaining unspent funds</span>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('grants')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            activeTab === 'grants'
              ? 'bg-slate-800 text-emerald-400 border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Grant Applications ({fundingRequests.length})
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            activeTab === 'expenses'
              ? 'bg-slate-800 text-cyan-400 border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Expense Vouchers ({expenses.length})
        </button>
      </div>

      {activeTab === 'grants' && (
        <div className="bg-[#0F1E36] rounded-xl border border-slate-800 p-6 space-y-4">
          <div className="space-y-3">
            {fundingRequests.map((fund) => (
              <div
                key={fund.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{fund.projectTitle}</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-slate-400">Student: {fund.studentName}</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed max-w-2xl">
                    {fund.purpose}
                  </p>
                  {fund.adminNotes && (
                    <p className="text-cyan-400 text-[11px] italic">
                      Committee note: "{fund.adminNotes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 text-right shrink-0">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Requested</span>
                    <span className="font-mono text-base font-bold text-white tabular-nums">
                      ${fund.requestedAmount.toLocaleString()}
                    </span>
                    {fund.approvedAmount !== undefined && fund.status === 'Approved' && (
                      <span className="block text-[11px] text-emerald-400 font-mono tabular-nums">
                        Sanctioned: ${fund.approvedAmount.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded text-xs font-semibold border ${
                      fund.status === 'Approved'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : fund.status === 'Rejected'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {fund.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="bg-[#0F1E36] rounded-xl border border-slate-800 p-6 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 pr-3">Date</th>
                  <th className="py-2.5 pr-3">Voucher Description</th>
                  <th className="py-2.5 pr-3 text-right">Amount</th>
                  <th className="py-2.5 pr-3">Audit Status</th>
                  <th className="py-2.5 text-right">Receipt File</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="text-slate-300">
                    <td className="py-3 pr-3 font-mono text-slate-400 tabular-nums whitespace-nowrap">
                      {exp.expenseDate}
                    </td>
                    <td className="py-3 pr-3 max-w-sm truncate">{exp.description}</td>
                    <td className="py-3 pr-3 font-mono tabular-nums text-right font-bold text-white">
                      ${exp.amount.toFixed(2)}
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          exp.status === 'Verified'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : exp.status === 'Rejected'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {exp.status}
                      </span>
                    </td>
                    <td className="py-3 text-right whitespace-nowrap">
                      {exp.receiptUrl ? (
                        <button
                          onClick={() => setPreviewReceipt(exp.receiptUrl || null)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-750 text-cyan-400 font-semibold inline-flex items-center gap-1 text-[11px]"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Receipt</span>
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[11px]">No receipt</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {previewReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-[#0F1E36] rounded-xl border border-slate-750 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-white">Commercial Bill / Voucher Inspection</span>
              <button onClick={() => setPreviewReceipt(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto flex items-center justify-center p-2">
              <img src={previewReceipt} alt="Receipt preview" className="max-h-full rounded object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
