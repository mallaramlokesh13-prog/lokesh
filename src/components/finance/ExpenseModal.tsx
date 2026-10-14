import React, { useState } from 'react';
import { Project, Expense } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { campusData } from '../../services/db';
import {
  X,
  Receipt,
  CheckCircle,
  AlertCircle,
  Upload,
  Calendar,
  DollarSign,
  FileText,
  Shield,
  Eye,
} from 'lucide-react';

interface ExpenseModalProps {
  projects: Project[];
  preselectedProject?: Project;
  onClose: () => void;
  onExpenseSubmitted: (newExp: Expense) => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  projects,
  preselectedProject,
  onClose,
  onExpenseSubmitted,
}) => {
  const { currentUser } = useAuth();
  const eligibleProjects = projects.filter((p) => (p.approvedBudget || 0) > 0 || p.status === 'Approved');

  const [projectId, setProjectId] = useState(
    preselectedProject?.id || eligibleProjects[0]?.id || projects[0]?.id || ''
  );
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('145.00');
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [receiptName, setReceiptName] = useState('mouser_electronics_inv892.pdf');
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string>(
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptName(file.name);
      // Create local object URL for preview
      const objUrl = URL.createObjectURL(file);
      setReceiptPreviewUrl(objUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please provide a valid expense amount.');
      return;
    }

    if (!description.trim()) {
      setError('Please provide an expense description.');
      return;
    }

    if (!projectId) {
      setError('Please select a project.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newExp = await campusData.submitExpense({
        projectId,
        studentId: currentUser?.id || 'student_guest',
        description: description.trim(),
        amount: amountNum,
        expenseDate,
        receiptName: receiptName || 'invoice_receipt.pdf',
        receiptUrl: receiptPreviewUrl,
      });

      onExpenseSubmitted(newExp);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit expense record.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0F1E36] border border-slate-750 rounded-2xl w-full max-w-xl shadow-2xl p-6 space-y-4 text-xs text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">
                Submit Project Expense & Bill Voucher
              </h3>
              <span className="text-[11px] text-slate-400">
                Logged against approved project grant allocation
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Related Project *</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white focus:outline-none focus:border-cyan-400 text-xs"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} (Approved Grant: ${p.approvedBudget || 0})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                Expense Amount ($ USD) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-500">$</span>
                <input
                  type="number"
                  min="0.5"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                Date of Transaction *
              </label>
              <input
                type="date"
                required
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">
              Expense Item Description *
            </label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Purchase of 8x sensor development boards and shielded ribbon cables from Adafruit..."
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs leading-relaxed"
            />
          </div>

          {/* Receipt Upload & Preview */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-300 block">
              Bill / Commercial Receipt Document
            </label>
            <div className="p-3 rounded-lg border border-dashed border-slate-700 bg-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {receiptPreviewUrl ? (
                  <img
                    src={receiptPreviewUrl}
                    alt="Receipt preview"
                    className="w-12 h-12 object-cover rounded border border-slate-700"
                  />
                ) : (
                  <div className="w-12 h-12 rounded bg-slate-800 flex items-center justify-center text-slate-500">
                    <FileText className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <span className="font-semibold text-white block text-xs truncate max-w-[220px]">
                    {receiptName || 'Select receipt file...'}
                  </span>
                  <span className="text-[11px] text-slate-400">PDF, JPG, PNG up to 5MB</span>
                </div>
              </div>

              <label className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 cursor-pointer flex items-center gap-1.5 whitespace-nowrap">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Receipt</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            <Shield className="w-3.5 h-3.5 text-cyan-400 inline mr-1" />
            Human verification policy: Receipts are reviewed by university grant officers.
            Receipt authenticity is determined during administrative audit.
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold inline-flex items-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Recording...' : 'Record Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
