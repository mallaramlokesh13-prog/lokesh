import React, { useState } from 'react';
import { Milestone, MilestoneStatus } from '../../types';
import { campusData } from '../../services/db';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Calendar,
  User,
  Layers,
  ChevronDown,
  Edit2,
  Check,
} from 'lucide-react';

interface MilestoneManagerProps {
  projectId: string;
  projectTitle: string;
  canEdit?: boolean;
}

export const MilestoneManager: React.FC<MilestoneManagerProps> = ({
  projectId,
  projectTitle,
  canEdit = true,
}) => {
  const [milestones, setMilestones] = useState<Milestone[]>(() =>
    campusData.getMilestones(projectId)
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState('');

  // Form states for new milestone
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedMember, setAssignedMember] = useState('Priya Sharma');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<MilestoneStatus>('In Progress');

  // Calculate metrics
  const total = milestones.length;
  const completed = milestones.filter((m) => m.status === 'Completed').length;
  const inProgress = milestones.filter((m) => m.status === 'In Progress').length;
  const blocked = milestones.filter((m) => m.status === 'Blocked').length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleStatusChange = async (milestoneId: string, newStatus: MilestoneStatus) => {
    const updated = await campusData.updateMilestoneStatus(milestoneId, newStatus);
    if (updated) {
      setMilestones(milestones.map((m) => (m.id === milestoneId ? updated : m)));
    }
  };

  const handleSaveNotes = async (milestoneId: string) => {
    const updated = await campusData.updateMilestoneStatus(
      milestoneId,
      milestones.find((m) => m.id === milestoneId)?.status || 'In Progress',
      editingNotes
    );
    if (updated) {
      setMilestones(milestones.map((m) => (m.id === milestoneId ? updated : m)));
      setEditingMilestoneId(null);
    }
  };

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newMilestone = await campusData.createMilestone({
      projectId,
      title: title.trim(),
      description: description.trim(),
      assignedMember: assignedMember.trim() || 'Team Lead',
      startDate: startDate || new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status,
      progressNotes: 'Initial milestone created.',
    });

    setMilestones([...milestones, newMilestone]);
    setShowAddModal(false);
    setTitle('');
    setDescription('');
  };

  const getStatusBadge = (st: MilestoneStatus) => {
    switch (st) {
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'In Progress':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'Blocked':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Overall Metric Strip */}
      <div className="bg-[#0F1E36] rounded-xl border border-slate-800 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Project Milestones & Technical Progress</span>
            </h3>
            <span className="text-xs text-slate-400">
              Assigned milestones for {projectTitle}
            </span>
          </div>

          {canEdit && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs inline-flex items-center gap-1.5 self-start cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Milestone</span>
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300">Milestone Progress Rate</span>
            <span className="text-cyan-400 font-bold tabular-nums">
              {percent}% Completed ({completed}/{total})
            </span>
          </div>
          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-center">
          <div className="p-2 bg-slate-900/60 rounded">
            <span className="block text-[10px] text-slate-400 uppercase">Total Tasks</span>
            <span className="text-sm font-bold text-white font-mono tabular-nums">{total}</span>
          </div>
          <div className="p-2 bg-slate-900/60 rounded">
            <span className="block text-[10px] text-emerald-400 uppercase">Completed</span>
            <span className="text-sm font-bold text-emerald-400 font-mono tabular-nums">{completed}</span>
          </div>
          <div className="p-2 bg-slate-900/60 rounded">
            <span className="block text-[10px] text-cyan-400 uppercase">In Progress</span>
            <span className="text-sm font-bold text-cyan-400 font-mono tabular-nums">{inProgress}</span>
          </div>
          <div className="p-2 bg-slate-900/60 rounded">
            <span className="block text-[10px] text-rose-400 uppercase">Blocked</span>
            <span className="text-sm font-bold text-rose-400 font-mono tabular-nums">{blocked}</span>
          </div>
        </div>
      </div>

      {/* Milestone List */}
      <div className="space-y-3">
        {milestones.map((m) => {
          const isOverdue =
            m.status !== 'Completed' && new Date(m.dueDate).getTime() < Date.now();

          return (
            <div
              key={m.id}
              className="p-4 rounded-xl bg-[#0F1E36] border border-slate-800 hover:border-slate-750 transition-colors space-y-3 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{m.title}</span>
                    {isOverdue && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-400 font-semibold border border-rose-500/30">
                        Overdue
                      </span>
                    )}
                  </div>
                  {m.description && (
                    <p className="text-slate-300 text-xs leading-relaxed">{m.description}</p>
                  )}
                </div>

                {/* Status selector */}
                {canEdit ? (
                  <select
                    value={m.status}
                    onChange={(e) =>
                      handleStatusChange(m.id, e.target.value as MilestoneStatus)
                    }
                    className={`px-2.5 py-1 rounded text-xs font-semibold border focus:outline-none cursor-pointer ${getStatusBadge(
                      m.status
                    )}`}
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                ) : (
                  <span className={`px-2.5 py-1 rounded text-xs font-semibold border ${getStatusBadge(m.status)}`}>
                    {m.status}
                  </span>
                )}
              </div>

              {/* Assigned Member & Dates */}
              <div className="flex flex-wrap items-center gap-4 text-slate-400 text-[11px] pt-1 border-t border-slate-800/80">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{m.assignedMember}</span>
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1.5 font-mono tabular-nums">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Due: {m.dueDate}</span>
                </span>
                {m.updatedAt && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-slate-500">
                      Updated {new Date(m.updatedAt).toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>

              {/* Progress Notes */}
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start justify-between gap-3 text-[11px]">
                <div className="space-y-0.5 flex-1">
                  <span className="text-slate-500 uppercase font-semibold text-[10px] block">
                    Progress Notes
                  </span>
                  {editingMilestoneId === m.id ? (
                    <div className="flex gap-2 mt-1">
                      <input
                        type="text"
                        value={editingNotes}
                        onChange={(e) => setEditingNotes(e.target.value)}
                        className="flex-1 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white text-xs"
                      />
                      <button
                        onClick={() => handleSaveNotes(m.id)}
                        className="px-2 py-1 rounded bg-cyan-400 text-slate-950 font-bold"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-slate-300 leading-relaxed">
                      {m.progressNotes || 'No progress notes logged yet.'}
                    </p>
                  )}
                </div>

                {canEdit && editingMilestoneId !== m.id && (
                  <button
                    onClick={() => {
                      setEditingMilestoneId(m.id);
                      setEditingNotes(m.progressNotes || '');
                    }}
                    className="text-slate-400 hover:text-white p-1"
                    title="Update notes"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Milestone Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1E36] border border-slate-750 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 text-xs text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Add New Milestone</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMilestone} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Milestone Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. PCB Schematic Review & Prototype Fabrication"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deliverables and verification criteria..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Assigned Teammate</label>
                <input
                  type="text"
                  value={assignedMember}
                  onChange={(e) => setAssignedMember(e.target.value)}
                  placeholder="e.g. Priya Sharma & Alexandre Dubois"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-400 text-slate-950 font-semibold"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
