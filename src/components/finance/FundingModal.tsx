import React, { useState } from 'react';
import { Project, FundingRequest } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { campusData } from '../../services/db';
import {
  X,
  DollarSign,
  CheckCircle,
  AlertCircle,
  FileText,
  Shield,
  Layers,
} from 'lucide-react';

interface FundingModalProps {
  projects: Project[];
  preselectedProject?: Project;
  onClose: () => void;
  onRequestSubmitted: (newReq: FundingRequest) => void;
}

export const FundingModal: React.FC<FundingModalProps> = ({
  projects,
  preselectedProject,
  onClose,
  onRequestSubmitted,
}) => {
  const { currentUser } = useAuth();
  const eligibleProjects = projects.filter(
    (p) => p.status === 'Approved' || p.status === 'Under Review' || p.status === 'Submitted'
  );

  const [projectId, setProjectId] = useState(
    preselectedProject?.id || eligibleProjects[0]?.id || ''
  );
  const [requestedAmount, setRequestedAmount] = useState('1500');
  const [purpose, setPurpose] = useState('');
  const [itemizedBudget, setItemizedBudget] = useState(
    '1. Hardware Sensors & Microcontroller boards: $500\n2. Fabrication & 3D Prototyping materials: $400\n3. Cloud Hosting & Telemetry Infrastructure: $300\n4. Testing Equipment & Consumables: $300'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeProj = eligibleProjects.find((p) => p.id === projectId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountNum = parseFloat(requestedAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please provide a valid funding amount.');
      return;
    }

    if (!purpose.trim()) {
      setError('Please specify the funding purpose.');
      return;
    }

    if (!activeProj) {
      setError('Please select an eligible project.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await campusData.submitFundingRequest({
        projectId: activeProj.id,
        projectTitle: activeProj.title,
        studentId: currentUser?.id || activeProj.studentId,
        studentName: currentUser?.displayName || activeProj.studentName,
        requestedAmount: amountNum,
        purpose: purpose.trim(),
        itemizedBudget: itemizedBudget.trim(),
      });

      onRequestSubmitted(created);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit funding request.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0F1E36] border border-slate-750 rounded-2xl w-full max-w-xl shadow-2xl p-6 space-y-4 text-xs text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">
                Submit Campus Innovation Grant Request
              </h3>
              <span className="text-[11px] text-slate-400">
                Institutional seed grants reviewed by University Incubation Council
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
            <label className="font-semibold text-slate-300 block mb-1">Target Project *</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white focus:outline-none focus:border-cyan-400 text-xs"
            >
              {eligibleProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">
              Grant Amount Requested ($ USD) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-500">$</span>
              <input
                type="number"
                min="50"
                step="50"
                required
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(e.target.value)}
                className="w-full pl-7 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">
              Core Purpose of Funding *
            </label>
            <textarea
              required
              rows={2}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Procurement of microgrid current transducers, PCB prototyping fabrication, and laboratory bench testing supplies..."
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs leading-relaxed"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">
              Itemized Estimated Budget Breakdown *
            </label>
            <textarea
              required
              rows={4}
              value={itemizedBudget}
              onChange={(e) => setItemizedBudget(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white font-mono text-xs focus:outline-none focus:border-cyan-400 leading-relaxed"
            />
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            <Shield className="w-3.5 h-3.5 text-cyan-400 inline mr-1" />
            Grant applications are evaluated by authorized campus administrators.
            Approved amounts are recorded in the institutional ledger. This platform does not directly execute banking transfers.
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
              className="px-4 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold inline-flex items-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
