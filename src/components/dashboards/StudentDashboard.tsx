import React, { useState } from 'react';
import { Project, AIEvaluation, FundingRequest, Expense, Milestone, MentorNote } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { campusData } from '../../services/db';
import {
  Layers,
  Sparkles,
  DollarSign,
  Receipt,
  CheckCircle,
  Clock,
  Plus,
  Briefcase,
  AlertCircle,
  FileText,
  Calendar,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import { ProjectCard } from '../projects/ProjectCard';
import { MilestoneManager } from '../milestones/MilestoneManager';

interface StudentDashboardProps {
  projects: Project[];
  onOpenSubmitModal: () => void;
  onViewEvaluation: (project: Project) => void;
  onRequestFunding: (project: Project) => void;
  onRecordExpense: (project: Project) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  projects,
  onOpenSubmitModal,
  onViewEvaluation,
  onRequestFunding,
  onRecordExpense,
}) => {
  const { currentUser } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projects[0]?.id || ''
  );

  const activeProject =
    projects.find((p) => p.id === selectedProjectId) || projects[0];

  const fundingRequests = campusData.getFundingRequests(activeProject?.id);
  const expenses = campusData.getExpenses(activeProject?.id);
  const milestones = activeProject ? campusData.getMilestones(activeProject.id) : [];
  const mentorNotes = activeProject ? campusData.getMentorNotes(activeProject.id) : [];

  // Financial calculations
  const approvedBudget = activeProject?.approvedBudget || 0;
  const totalRecordedExp = expenses.reduce((sum, e) => sum + e.amount, 0);
  const verifiedExp = expenses
    .filter((e) => e.status === 'Verified')
    .reduce((sum, e) => sum + e.amount, 0);
  const pendingExp = expenses
    .filter((e) => e.status === 'Pending')
    .reduce((sum, e) => sum + e.amount, 0);
  const remainingBudget = Math.max(0, approvedBudget - totalRecordedExp);

  return (
    <div className="space-y-8">
      {/* Student Welcome Banner */}
      <div className="bg-[#0F1E36] rounded-xl border border-slate-800 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Student Innovator Hub
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">{currentUser?.department || 'Engineering'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Welcome back, {currentUser?.displayName}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Track your innovation submissions, advisory AI evaluations, faculty mentor feedback, milestones, and grant expenditures.
          </p>
        </div>

        <button
          onClick={onOpenSubmitModal}
          className="px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs inline-flex items-center gap-1.5 shadow-sm whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Submit New Idea</span>
        </button>
      </div>

      {/* Projects Grid Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>My Innovation Submissions</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono tabular-nums">
            {projects.length} Registered Project{projects.length === 1 ? '' : 's'}
          </span>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12 bg-[#0F1E36] rounded-xl border border-dashed border-slate-800">
            <Layers className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-xs text-slate-400 mb-3">You haven't submitted any innovation ideas yet.</p>
            <button
              onClick={onOpenSubmitModal}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-400 text-slate-950 font-semibold text-xs"
            >
              Submit Your First Idea
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => setSelectedProjectId(proj.id)}
                className={`cursor-pointer transition-all ${
                  selectedProjectId === proj.id ? 'ring-2 ring-cyan-400 rounded-xl' : ''
                }`}
              >
                <ProjectCard
                  project={proj}
                  milestones={campusData.getMilestones(proj.id)}
                  onViewEvaluation={onViewEvaluation}
                  onSelectProject={(p) => setSelectedProjectId(p.id)}
                  isOwner={true}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Project Workspace View */}
      {activeProject && (
        <div className="bg-[#0B1526] rounded-2xl border border-slate-800 p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs text-cyan-400 font-medium">Selected Project Workspace</span>
              <h2 className="text-lg font-bold text-white">{activeProject.title}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                <span>Status: <strong className="text-white">{activeProject.status}</strong></span>
                <span aria-hidden="true">·</span>
                <span>Category: {activeProject.category}</span>
                {activeProject.mentorName && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-purple-300">Mentor: {activeProject.mentorName}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onViewEvaluation(activeProject)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Evaluation</span>
              </button>

              <button
                onClick={() => onRequestFunding(activeProject)}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer border border-emerald-500/30"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Request Funding</span>
              </button>

              <button
                onClick={() => onRecordExpense(activeProject)}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer border border-cyan-500/30"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Record Expense</span>
              </button>
            </div>
          </div>

          {/* Financial Grant & Expense Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Approved Grant</span>
              <span className="text-lg font-bold text-emerald-400 font-mono tabular-nums">
                ${approvedBudget.toLocaleString()}
              </span>
              <span className="block text-[10px] text-slate-500">Sanctioned allocation</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Recorded</span>
              <span className="text-lg font-bold text-white font-mono tabular-nums">
                ${totalRecordedExp.toFixed(2)}
              </span>
              <span className="block text-[10px] text-slate-500">All submitted vouchers</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Verified Expenses</span>
              <span className="text-lg font-bold text-cyan-400 font-mono tabular-nums">
                ${verifiedExp.toFixed(2)}
              </span>
              <span className="block text-[10px] text-slate-500">Audited & approved</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Remaining Balance</span>
              <span className="text-lg font-bold text-amber-400 font-mono tabular-nums">
                ${remainingBudget.toFixed(2)}
              </span>
              <span className="block text-[10px] text-slate-500">Available to draw</span>
            </div>
          </div>

          {/* Milestones Section */}
          <MilestoneManager
            projectId={activeProject.id}
            projectTitle={activeProject.title}
            canEdit={true}
          />

          {/* Faculty Mentor Notes & Guidance */}
          <div className="bg-[#0F1E36] rounded-xl border border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-400" />
              <span>Faculty Mentoring Feedback & Guidance Notes</span>
            </h3>

            {mentorNotes.length === 0 ? (
              <p className="text-xs text-slate-400">
                {activeProject.mentorName
                  ? `Mentor ${activeProject.mentorName} has not added any progress notes yet.`
                  : 'No faculty mentor has been assigned to this proposal yet. Administrative committee will assign a mentor upon approval.'}
              </p>
            ) : (
              <div className="space-y-3">
                {mentorNotes.map((note) => (
                  <div key={note.id} className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-purple-300">{note.mentorName}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/30">
                          {note.noteType}
                        </span>
                      </div>
                      <span className="text-slate-500 font-mono">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed pt-1">{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expenses Submitted Table */}
          <div className="bg-[#0F1E36] rounded-xl border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-cyan-400" />
                <span>Recorded Expense Vouchers</span>
              </h3>
              <button
                onClick={() => onRecordExpense(activeProject)}
                className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-white font-semibold"
              >
                + New Expense
              </button>
            </div>

            {expenses.length === 0 ? (
              <p className="text-xs text-slate-400">No expenses recorded for this project.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="py-2 pr-3">Date</th>
                      <th className="py-2 pr-3">Description</th>
                      <th className="py-2 pr-3 text-right">Amount</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2">Receipt Document</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {expenses.map((exp) => (
                      <tr key={exp.id} className="text-slate-300">
                        <td className="py-2.5 pr-3 font-mono tabular-nums text-slate-400 whitespace-nowrap">
                          {exp.expenseDate}
                        </td>
                        <td className="py-2.5 pr-3 max-w-xs truncate">{exp.description}</td>
                        <td className="py-2.5 pr-3 font-mono tabular-nums text-right font-semibold text-white">
                          ${exp.amount.toFixed(2)}
                        </td>
                        <td className="py-2.5 pr-3">
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
                        <td className="py-2.5">
                          {exp.receiptUrl ? (
                            <a
                              href={exp.receiptUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
                            >
                              <FileText className="w-3 h-3" />
                              <span className="truncate max-w-[120px]">{exp.receiptName || 'View Bill'}</span>
                            </a>
                          ) : (
                            <span className="text-slate-500 text-[11px]">No receipt</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
