import React from 'react';
import { Project, ProjectStatus, Milestone } from '../../types';
import {
  Sparkles,
  User,
  DollarSign,
  Calendar,
  Layers,
  ChevronRight,
  Shield,
  Briefcase,
  ExternalLink,
} from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  milestones?: Milestone[];
  onViewEvaluation: (project: Project) => void;
  onSelectProject: (project: Project) => void;
  onRequestFunding?: (project: Project) => void;
  onRequestCollaborate?: (project: Project) => void;
  isOwner?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  milestones = [],
  onViewEvaluation,
  onSelectProject,
  onRequestFunding,
  onRequestCollaborate,
  isOwner,
}) => {
  const completedMilestones = milestones.filter((m) => m.status === 'Completed').length;
  const progressPercent = milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : 0;

  const getStatusStyle = (status: ProjectStatus) => {
    switch (status) {
      case 'Approved':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'Under Review':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'Changes Requested':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'Rejected':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      default:
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    }
  };

  return (
    <div className="bg-[#0F1E36] rounded-xl border border-slate-800 hover:border-slate-700 transition-all shadow-sm hover:shadow-md flex flex-col justify-between overflow-hidden">
      <div className="p-5 space-y-4">
        {/* Header with Unboxed Category and Status Indicator */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="text-slate-400 flex items-center gap-2">
            <span className="font-medium text-cyan-400">{project.category}</span>
            <span aria-hidden="true">·</span>
            <span>Est. {new Date(project.createdAt).toLocaleDateString()}</span>
          </div>

          <span className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${getStatusStyle(project.status)}`}>
            {project.status}
          </span>
        </div>

        {/* Title */}
        <div>
          <h3
            onClick={() => onSelectProject(project)}
            className="text-lg font-bold text-white hover:text-cyan-400 transition-colors cursor-pointer leading-snug line-clamp-1"
          >
            {project.title}
          </h3>
          <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
            {project.problemStatement}
          </p>
        </div>

        {/* Student Creator & Mentor Line (Zero-Pill Metadata) */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-300">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate max-w-[140px]">{project.studentName}</span>
          </div>

          {project.mentorName && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <div className="flex items-center gap-1 text-purple-300">
                <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                <span className="truncate max-w-[140px]">{project.mentorName}</span>
              </div>
            </>
          )}

          <span aria-hidden="true" className="text-slate-600">·</span>
          <div className="flex items-center gap-1 font-mono text-slate-300 tabular-nums">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>${project.estimatedBudget.toLocaleString()}</span>
          </div>
        </div>

        {/* Milestone Progress Bar */}
        {milestones.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Milestone Progress</span>
              <span className="text-white tabular-nums font-semibold">
                {progressPercent}% ({completedMilestones}/{milestones.length})
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-purple-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Required Skills list */}
        {project.requiredSkills && project.requiredSkills.length > 0 && (
          <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-slate-500">Skills Needed:</span>
            {project.requiredSkills.slice(0, 3).map((skill, i) => (
              <span key={i} className="text-slate-300">
                {skill}{i < Math.min(project.requiredSkills.length, 3) - 1 ? ' ·' : ''}
              </span>
            ))}
            {project.requiredSkills.length > 3 && (
              <span className="text-slate-500">+{project.requiredSkills.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="px-5 py-3 bg-[#0B1526] border-t border-slate-800/80 flex items-center justify-between gap-2">
        <button
          onClick={() => onViewEvaluation(project)}
          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-1.5 py-1 px-2 rounded hover:bg-cyan-500/10 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>AI Evaluation</span>
        </button>

        <div className="flex items-center gap-2">
          {onRequestCollaborate && !isOwner && (
            <button
              onClick={() => onRequestCollaborate(project)}
              className="text-xs font-medium text-slate-300 hover:text-white px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Collaborate
            </button>
          )}

          <button
            onClick={() => onSelectProject(project)}
            className="text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-md transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
