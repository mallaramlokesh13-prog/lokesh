import React, { useState } from 'react';
import { Project, FundingRequest, Expense, ProjectStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { campusData } from '../../services/db';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sparkles,
  DollarSign,
  Receipt,
  Layers,
  UserCheck,
  FileText,
  Clock,
  Briefcase,
  ChevronRight,
  Eye,
} from 'lucide-react';

interface AdminDashboardProps {
  projects: Project[];
  onProjectsUpdated: () => void;
  onViewEvaluation: (project: Project) => void;
}

const AVAILABLE_MENTORS = [
  { id: 'mentor_arthur_bennett', name: 'Dr. Arthur Bennett', dept: 'Electrical & Robotics' },
  { id: 'mentor_sarah_chen', name: 'Prof. Sarah Chen', dept: 'Computer Science & AI' },
  { id: 'mentor_david_miller', name: 'Dr. David Miller', dept: 'Biomedical & Assistive Devices' },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  projects,
  onProjectsUpdated,
  onViewEvaluation,
}) => {
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'proposals' | 'mentors' | 'funding' | 'expenses'>('proposals');

  // Review proposal state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [reviewDecision, setReviewDecision] = useState<ProjectStatus>('Approved');
  const [reviewComments, setReviewComments] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Mentor assign state
  const [mentorAssignProjectId, setMentorAssignProjectId] = useState<string>('');
  const [selectedMentorId, setSelectedMentorId] = useState<string>(AVAILABLE_MENTORS[0].id);

  // Funding review state
  const [fundingRequests, setFundingRequests] = useState<FundingRequest[]>(() =>
    campusData.getFundingRequests()
  );
  const [selectedFunding, setSelectedFunding] = useState<FundingRequest | null>(null);
  const [approvedGrantAmount, setApprovedGrantAmount] = useState('1500');
  const [adminFundingNotes, setAdminFundingNotes] = useState('');

  // Expense verification state
  const [expenses, setExpenses] = useState<Expense[]>(() => campusData.getExpenses());
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState<string | null>(null);

  // Flash message
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  const showFlash = (msg: string) => {
    setFlashMessage(msg);
    setTimeout(() => setFlashMessage(null), 4000);
  };

  // KPI calculations
  const totalSubmissions = projects.length;
  const approvedProposals = projects.filter((p) => p.status === 'Approved').length;
  const pendingProposals = projects.filter(
    (p) => p.status === 'Submitted' || p.status === 'Under Review'
  ).length;
  const pendingMentorAssignments = projects.filter(
    (p) => p.status === 'Approved' && !p.mentorId
  ).length;

  const totalSanctionedBudget = projects.reduce((sum, p) => sum + (p.approvedBudget || 0), 0);
  const totalExpensesLogged = expenses.reduce((sum, e) => sum + e.amount, 0);
  const verifiedExpenses = expenses
    .filter((e) => e.status === 'Verified')
    .reduce((sum, e) => sum + e.amount, 0);
  const pendingExpenseVerifications = expenses.filter((e) => e.status === 'Pending').length;

  const handleProposalDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    setIsSubmittingReview(true);
    try {
      await campusData.updateProjectStatus(
        selectedProject.id,
        reviewDecision,
        currentUser?.id || 'admin_dean_1',
        currentUser?.displayName || 'Dean Elena Rostova',
        reviewComments.trim() || `Decision: ${reviewDecision}`
      );

      onProjectsUpdated();
      showFlash(`Proposal for "${selectedProject.title}" updated to ${reviewDecision}.`);
      setSelectedProject(null);
      setReviewComments('');
    } catch (err: any) {
      console.warn('Error saving decision:', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleAssignMentor = async (projectId: string, mentorId: string) => {
    const mentor = AVAILABLE_MENTORS.find((m) => m.id === mentorId);
    if (!mentor) return;

    await campusData.assignMentor(projectId, mentor.id, mentor.name);
    onProjectsUpdated();
    showFlash(`Assigned ${mentor.name} as faculty advisor.`);
    setMentorAssignProjectId('');
  };

  const handleReviewFunding = async (status: 'Approved' | 'Rejected') => {
    if (!selectedFunding) return;
    const amountNum = parseFloat(approvedGrantAmount);

    await campusData.updateFundingStatus(
      selectedFunding.id,
      status,
      status === 'Approved' ? amountNum : 0,
      adminFundingNotes.trim()
    );

    setFundingRequests(campusData.getFundingRequests());
    onProjectsUpdated();
    showFlash(`Funding request for "${selectedFunding.projectTitle}" marked as ${status}.`);
    setSelectedFunding(null);
    setAdminFundingNotes('');
  };

  const handleVerifyExpense = async (status: 'Verified' | 'Rejected') => {
    if (!selectedExpense) return;

    await campusData.updateExpenseStatus(
      selectedExpense.id,
      status,
      reviewerNotes.trim() || `Voucher ${status} by grant auditor.`
    );

    setExpenses(campusData.getExpenses());
    showFlash(`Expense voucher marked as ${status}.`);
    setSelectedExpense(null);
    setReviewerNotes('');
  };

  return (
    <div className="space-y-8">
      {/* Admin Council Banner */}
      <div className="bg-[#0F1E36] rounded-xl border border-slate-800 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Campus Innovation Council & Grant Review
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">Dean of Research Administration</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Administrative Governance Console
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Human-in-the-loop decision console for proposal selection, mentor appointments, seed grant authorizations, and receipt audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-amber-400/10 text-amber-300 border border-amber-400/30 text-xs font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Authorized Reviewer</span>
          </span>
        </div>
      </div>

      {flashMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{flashMessage}</span>
        </div>
      )}

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Submitted Proposals</span>
          <span className="text-2xl font-bold text-white font-mono tabular-nums">{totalSubmissions}</span>
          <span className="block text-[11px] text-amber-400 mt-0.5">{pendingProposals} pending review</span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Approved Proposals</span>
          <span className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">{approvedProposals}</span>
          <span className="block text-[11px] text-slate-400 mt-0.5">{pendingMentorAssignments} need mentor</span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Sanctioned Grants</span>
          <span className="text-2xl font-bold text-cyan-400 font-mono tabular-nums">
            ${totalSanctionedBudget.toLocaleString()}
          </span>
          <span className="block text-[11px] text-slate-400 mt-0.5">Committed campus funds</span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Verified Expenses</span>
          <span className="text-2xl font-bold text-purple-400 font-mono tabular-nums">
            ${verifiedExpenses.toLocaleString()}
          </span>
          <span className="block text-[11px] text-amber-400 mt-0.5">{pendingExpenseVerifications} pending audit</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('proposals')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
            activeTab === 'proposals'
              ? 'bg-slate-800 text-cyan-400 border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Proposal Review ({pendingProposals} Pending)
        </button>

        <button
          onClick={() => setActiveTab('mentors')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
            activeTab === 'mentors'
              ? 'bg-slate-800 text-purple-400 border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Mentor Assignments ({pendingMentorAssignments} Need Advisor)
        </button>

        <button
          onClick={() => setActiveTab('funding')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
            activeTab === 'funding'
              ? 'bg-slate-800 text-emerald-400 border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Grant Applications ({fundingRequests.filter((f) => f.status === 'Pending').length} Pending)
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
            activeTab === 'expenses'
              ? 'bg-slate-800 text-amber-400 border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Expense & Receipt Audit ({pendingExpenseVerifications} Pending)
        </button>
      </div>

      {/* TAB 1: PROPOSAL REVIEW QUEUE */}
      {activeTab === 'proposals' && (
        <div className="bg-[#0F1E36] rounded-xl border border-slate-800 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Collegiate Innovation Proposals Queue</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 pr-4">Project Title</th>
                  <th className="py-2.5 pr-4">Student Lead</th>
                  <th className="py-2.5 pr-4">Category</th>
                  <th className="py-2.5 pr-4">Est. Budget</th>
                  <th className="py-2.5 pr-4">Status</th>
                  <th className="py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {projects.map((proj) => (
                  <tr key={proj.id} className="text-slate-300 hover:bg-slate-900/40">
                    <td className="py-3 pr-4">
                      <span className="font-semibold text-white block max-w-xs truncate">{proj.title}</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Submitted {new Date(proj.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap">
                      <span>{proj.studentName}</span>
                    </td>
                    <td className="py-3 pr-4 text-slate-400">{proj.category}</td>
                    <td className="py-3 pr-4 font-mono tabular-nums font-semibold text-slate-200">
                      ${proj.estimatedBudget.toLocaleString()}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          proj.status === 'Approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : proj.status === 'Rejected'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : proj.status === 'Changes Requested'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {proj.status}
                      </span>
                    </td>
                    <td className="py-3 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => onViewEvaluation(proj)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold"
                        title="View advisory Gemini evaluation report"
                      >
                        AI Report
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProject(proj);
                          setReviewDecision(proj.status);
                        }}
                        className="px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold border border-cyan-500/30"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MENTOR ASSIGNMENT */}
      {activeTab === 'mentors' && (
        <div className="bg-[#0F1E36] rounded-xl border border-slate-800 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-purple-400" />
            <span>Faculty Mentor Allocation Console</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Approved innovation proposals must be paired with accredited faculty advisors for technical oversight and laboratory safety.
          </p>

          <div className="space-y-3">
            {projects
              .filter((p) => p.status === 'Approved')
              .map((proj) => (
                <div
                  key={proj.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-white text-sm">{proj.title}</span>
                    <div className="flex items-center gap-2 text-slate-400">
                      <span>Lead: {proj.studentName}</span>
                      <span aria-hidden="true">·</span>
                      <span>Category: {proj.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {proj.mentorName ? (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Assigned Advisor:</span>
                        <span className="px-2.5 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 font-semibold">
                          {proj.mentorName}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedMentorId}
                          onChange={(e) => setSelectedMentorId(e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                        >
                          {AVAILABLE_MENTORS.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} ({m.dept})
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleAssignMentor(proj.id, selectedMentorId)}
                          className="px-3 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-white font-semibold text-xs whitespace-nowrap"
                        >
                          Assign Mentor
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 3: FUNDING REQUEST APPROVAL */}
      {activeTab === 'funding' && (
        <div className="bg-[#0F1E36] rounded-xl border border-slate-800 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Campus Innovation Seed Grant Approvals</span>
          </h3>

          {fundingRequests.length === 0 ? (
            <p className="text-xs text-slate-400">No funding applications submitted yet.</p>
          ) : (
            <div className="space-y-3 text-xs">
              {fundingRequests.map((fund) => (
                <div
                  key={fund.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{fund.projectTitle}</span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="text-slate-400">By {fund.studentName}</span>
                      </div>
                      <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                        Purpose: {fund.purpose}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-400 block text-[11px]">Requested Grant</span>
                      <span className="text-base font-bold text-emerald-400 font-mono tabular-nums">
                        ${fund.requestedAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Itemized Budget Preview */}
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre-line leading-relaxed">
                    {fund.itemizedBudget}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        fund.status === 'Approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : fund.status === 'Rejected'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      Status: {fund.status} {fund.approvedAmount ? `($${fund.approvedAmount})` : ''}
                    </span>

                    {fund.status === 'Pending' && (
                      <button
                        onClick={() => {
                          setSelectedFunding(fund);
                          setApprovedGrantAmount(String(fund.requestedAmount));
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-400 text-slate-950 font-semibold"
                      >
                        Sanction / Reject Decision
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: EXPENSE & RECEIPT AUDIT */}
      {activeTab === 'expenses' && (
        <div className="bg-[#0F1E36] rounded-xl border border-slate-800 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 text-cyan-400" />
            <span>Bill & Commercial Receipt Audit Console</span>
          </h3>

          {expenses.length === 0 ? (
            <p className="text-xs text-slate-400">No expense vouchers submitted.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 pr-3">Date</th>
                    <th className="py-2.5 pr-3">Description</th>
                    <th className="py-2.5 pr-3 text-right">Amount</th>
                    <th className="py-2.5 pr-3">Status</th>
                    <th className="py-2.5 pr-3">Receipt Document</th>
                    <th className="py-2.5 text-right">Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="text-slate-300 hover:bg-slate-900/40">
                      <td className="py-3 pr-3 font-mono text-slate-400 tabular-nums whitespace-nowrap">
                        {exp.expenseDate}
                      </td>
                      <td className="py-3 pr-3 max-w-xs truncate">{exp.description}</td>
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
                      <td className="py-3 pr-3">
                        {exp.receiptUrl ? (
                          <button
                            onClick={() => setPreviewReceiptUrl(exp.receiptUrl || null)}
                            className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[120px]">{exp.receiptName || 'Receipt'}</span>
                          </button>
                        ) : (
                          <span className="text-slate-500">None</span>
                        )}
                      </td>
                      <td className="py-3 text-right whitespace-nowrap">
                        {exp.status === 'Pending' ? (
                          <button
                            onClick={() => setSelectedExpense(exp)}
                            className="px-2.5 py-1 rounded bg-cyan-400 text-slate-950 font-semibold"
                          >
                            Audit Voucher
                          </button>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Reviewed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Review Proposal Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1E36] border border-slate-750 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4 text-xs text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">
                Human Proposal Review: {selectedProject.title}
              </h3>
              <button onClick={() => setSelectedProject(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleProposalDecision} className="space-y-4">
              <div>
                <span className="font-semibold text-slate-400 block mb-1">Lead Student</span>
                <p className="text-white">{selectedProject.studentName} ({selectedProject.studentEmail})</p>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Administrative Decision *</label>
                <select
                  value={reviewDecision}
                  onChange={(e) => setReviewDecision(e.target.value as ProjectStatus)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white focus:outline-none focus:border-cyan-400 text-xs"
                >
                  <option value="Approved">Approve Proposal for Incubation</option>
                  <option value="Changes Requested">Request Changes / Clarifications</option>
                  <option value="Under Review">Keep Under Active Review</option>
                  <option value="Rejected">Reject Proposal</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Official Committee Reviewer Comments & Feedback *
                </label>
                <textarea
                  rows={4}
                  required
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder="State the committee's justification, requested revisions, or conditions for sanction..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs leading-relaxed"
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                Decision will be permanently logged in the audit trail with reviewer identity:
                <strong className="text-white block mt-0.5">
                  {currentUser?.displayName} ({currentUser?.email})
                </strong>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-4 py-1.5 rounded-lg bg-cyan-400 text-slate-950 font-semibold"
                >
                  {isSubmittingReview ? 'Recording...' : 'Record Human Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Funding Modal */}
      {selectedFunding && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1E36] border border-slate-750 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4 text-xs text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">
                Grant Sanction Decision: {selectedFunding.projectTitle}
              </h3>
              <button onClick={() => setSelectedFunding(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-slate-400 block mb-0.5">Requested by:</span>
                <span className="text-white font-semibold">{selectedFunding.studentName}</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Requested Amount:</span>
                <span className="text-emerald-400 font-bold font-mono text-base">
                  ${selectedFunding.requestedAmount.toLocaleString()}
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Sanctioned Grant Amount ($ USD)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={approvedGrantAmount}
                  onChange={(e) => setApprovedGrantAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Grant Conditions / Admin Notes
                </label>
                <textarea
                  rows={3}
                  value={adminFundingNotes}
                  onChange={(e) => setAdminFundingNotes(e.target.value)}
                  placeholder="e.g. Approved in full with certified inspection receipt required..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedFunding(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReviewFunding('Rejected')}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold"
                >
                  Reject Grant
                </button>
                <button
                  onClick={() => handleReviewFunding('Approved')}
                  className="px-4 py-1.5 rounded-lg bg-emerald-400 text-slate-950 font-semibold"
                >
                  Sanction Grant
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Expense Modal */}
      {selectedExpense && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1E36] border border-slate-750 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4 text-xs text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">
                Verify Expense Voucher: ${selectedExpense.amount.toFixed(2)}
              </h3>
              <button onClick={() => setSelectedExpense(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-slate-400 block mb-0.5">Description:</span>
                <p className="text-white">{selectedExpense.description}</p>
              </div>

              {selectedExpense.receiptUrl && (
                <div>
                  <span className="text-slate-400 block mb-1">Receipt Attachment:</span>
                  <div className="rounded-lg overflow-hidden border border-slate-700 bg-slate-900 p-2">
                    <img
                      src={selectedExpense.receiptUrl}
                      alt="Voucher receipt preview"
                      className="max-h-48 mx-auto object-contain rounded"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Auditor Verification Note
                </label>
                <textarea
                  rows={2}
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  placeholder="e.g. Verified against distributor tax invoice and approved line item..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedExpense(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleVerifyExpense('Rejected')}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold"
                >
                  Reject Voucher
                </button>
                <button
                  onClick={() => handleVerifyExpense('Verified')}
                  className="px-4 py-1.5 rounded-lg bg-cyan-400 text-slate-950 font-semibold"
                >
                  Verify Voucher
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Image Full Preview Modal */}
      {previewReceiptUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-[#0F1E36] rounded-xl border border-slate-750 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-white">Commercial Receipt Document</span>
              <button
                onClick={() => setPreviewReceiptUrl(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto flex items-center justify-center">
              <img
                src={previewReceiptUrl}
                alt="Receipt Document Full"
                className="max-h-full max-w-full rounded object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
