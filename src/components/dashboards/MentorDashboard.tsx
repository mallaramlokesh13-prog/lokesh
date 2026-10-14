import React, { useState } from 'react';
import { Project, MentorNote, Milestone } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { campusData } from '../../services/db';
import {
  Briefcase,
  Layers,
  Sparkles,
  MessageSquare,
  CheckCircle,
  Plus,
  Send,
  Calendar,
  User,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { MilestoneManager } from '../milestones/MilestoneManager';

interface MentorDashboardProps {
  projects: Project[];
  onViewEvaluation: (project: Project) => void;
}

export const MentorDashboard: React.FC<MentorDashboardProps> = ({
  projects,
  onViewEvaluation,
}) => {
  const { currentUser } = useAuth();

  // Projects assigned to this mentor or all projects in mentor role view
  const assignedProjects = projects.filter(
    (p) => p.mentorId === currentUser?.id || p.mentorName === currentUser?.displayName
  );

  // Fallback if none assigned yet, display all approved projects for demo
  const displayProjects = assignedProjects.length > 0 ? assignedProjects : projects.filter((p) => p.status === 'Approved');

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    displayProjects[0]?.id || ''
  );
  const activeProject =
    displayProjects.find((p) => p.id === selectedProjectId) || displayProjects[0];

  const [notes, setNotes] = useState<MentorNote[]>(() =>
    activeProject ? campusData.getMentorNotes(activeProject.id) : []
  );

  // Form states for new mentor note
  const [noteType, setNoteType] = useState<MentorNote['noteType']>('Technical Guidance');
  const [noteContent, setNoteContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !noteContent.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await campusData.addMentorNote({
        projectId: activeProject.id,
        mentorId: currentUser?.id || 'mentor_demo_1',
        mentorName: currentUser?.displayName || 'Faculty Mentor',
        noteType,
        content: noteContent.trim(),
      });

      setNotes([created, ...notes]);
      setNoteContent('');
      setFeedbackSuccess('Mentoring feedback note recorded for student team.');
      setTimeout(() => setFeedbackSuccess(null), 3500);
    } catch (err: any) {
      console.warn('Error adding note:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Mentor Welcome Banner */}
      <div className="bg-[#0F1E36] rounded-xl border border-slate-800 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
              Faculty Mentorship Console
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">{currentUser?.department || 'Robotics & Electrical'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Advisor Portal: {currentUser?.displayName}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Review assigned student innovation teams, inspect milestone execution, and provide architectural and regulatory guidance.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block">Assigned Teams</span>
          <span className="text-2xl font-bold text-purple-400 font-mono tabular-nums">
            {displayProjects.length}
          </span>
        </div>
      </div>

      {/* Projects Selection Bar */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {displayProjects.map((proj) => (
          <button
            key={proj.id}
            onClick={() => {
              setSelectedProjectId(proj.id);
              setNotes(campusData.getMentorNotes(proj.id));
            }}
            className={`px-4 py-2.5 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all text-left flex items-center gap-2.5 cursor-pointer ${
              selectedProjectId === proj.id
                ? 'bg-purple-600/20 border-purple-400 text-white shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4 text-purple-400" />
            <div>
              <span className="block text-white truncate max-w-[200px]">{proj.title}</span>
              <span className="block text-[10px] text-slate-400 font-normal">
                Lead: {proj.studentName}
              </span>
            </div>
          </button>
        ))}
      </div>

      {activeProject ? (
        <div className="space-y-6">
          {/* Active Project Card Summary */}
          <div className="bg-[#0B1526] rounded-xl border border-slate-800 p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-purple-400 font-semibold">{activeProject.category}</span>
                <h3 className="text-lg font-bold text-white">{activeProject.title}</h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  {activeProject.problemStatement}
                </p>
              </div>

              <button
                onClick={() => onViewEvaluation(activeProject)}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold text-xs inline-flex items-center gap-1.5 self-start cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>View Advisory AI Evaluation</span>
              </button>
            </div>

            {/* Quick Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-3 border-t border-slate-800">
              <span>Student Lead: <strong className="text-white">{activeProject.studentName}</strong></span>
              <span aria-hidden="true">·</span>
              <span>Email: <strong className="text-slate-300">{activeProject.studentEmail}</strong></span>
              <span aria-hidden="true">·</span>
              <span>Approved Grant: <strong className="text-emerald-400 font-mono tabular-nums">${activeProject.approvedBudget || 0}</strong></span>
            </div>
          </div>

          {/* Milestone Manager for this project */}
          <MilestoneManager
            projectId={activeProject.id}
            projectTitle={activeProject.title}
            canEdit={true}
          />

          {/* Add Mentoring Guidance Form */}
          <div className="bg-[#0F1E36] rounded-xl border border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <span>Record Faculty Mentoring Notes & Action Items</span>
            </h3>

            {feedbackSuccess && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{feedbackSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddNote} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="font-semibold text-slate-300 block mb-1">Feedback Category</label>
                  <select
                    value={noteType}
                    onChange={(e) => setNoteType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white focus:outline-none focus:border-purple-400 text-xs"
                  >
                    <option value="Technical Guidance">Technical Guidance</option>
                    <option value="Progress Check">Progress Check</option>
                    <option value="Action Item">Action Item</option>
                    <option value="General">General Recommendation</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-300 block mb-1">
                    Guidance for Student Team
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Advise on hardware schematics, lab safety certifications, or next milestone steps..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 text-xs leading-relaxed"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-400 text-white font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Recording...' : 'Post Mentoring Note'}</span>
                </button>
              </div>
            </form>

            {/* List of past notes */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Mentoring History for this Project
              </span>
              {notes.length === 0 ? (
                <p className="text-xs text-slate-500">No notes recorded yet for this project.</p>
              ) : (
                <div className="space-y-2">
                  {notes.map((n) => (
                    <div key={n.id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-purple-300">{n.noteType}</span>
                        <span className="text-slate-500 font-mono">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">{n.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-[#0F1E36] rounded-xl border border-dashed border-slate-800">
          <p className="text-xs text-slate-400">No assigned projects found.</p>
        </div>
      )}
    </div>
  );
};
