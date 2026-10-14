import React, { useState } from 'react';
import { UserProfile, Project, CollaborationRequest } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { campusData } from '../../services/db';
import {
  Users,
  Search,
  Filter,
  Send,
  CheckCircle,
  XCircle,
  Sparkles,
  Award,
  Layers,
  MessageSquare,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface CollaboratorDiscoveryProps {
  projects: Project[];
  onOpenProject?: (project: Project) => void;
}

export const CollaboratorDiscovery: React.FC<CollaboratorDiscoveryProps> = ({
  projects,
  onOpenProject,
}) => {
  const { currentUser } = useAuth();
  const [collaborators, setCollaborators] = useState<UserProfile[]>(() =>
    campusData.getDiscoverableCollaborators()
  );
  const [collabRequests, setCollabRequests] = useState<CollaborationRequest[]>(() =>
    campusData.getCollaborationRequests(currentUser?.id)
  );

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projects[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('All');

  // Request to collaborate modal
  const [requestTarget, setRequestTarget] = useState<UserProfile | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  // Calculate matching & compatibility for each collaborator relative to activeProject
  const calculateMatch = (candidate: UserProfile, project?: Project) => {
    if (!project || !project.requiredSkills || project.requiredSkills.length === 0) {
      return {
        score: 70,
        matchingSkills: candidate.skills,
        missingSkills: [],
        reason: 'General collegiate engineering & development alignment.',
      };
    }

    const required = project.requiredSkills.map((s) => s.toLowerCase());
    const candidateSkills = (candidate.skills || []).map((s) => s.toLowerCase());

    const matching = project.requiredSkills.filter((s) =>
      candidateSkills.some((cs) => cs.includes(s.toLowerCase()) || s.toLowerCase().includes(cs))
    );

    const missing = project.requiredSkills.filter(
      (s) => !candidateSkills.some((cs) => cs.includes(s.toLowerCase()) || s.toLowerCase().includes(cs))
    );

    // Score calculation
    const baseRatio = matching.length / project.requiredSkills.length;
    let score = Math.round(baseRatio * 60 + 35);
    if (score > 98) score = 98;
    if (score < 45) score = 45;

    let reason = '';
    if (matching.length >= 2) {
      reason = `Direct match for ${matching.slice(0, 2).join(' & ')}, fulfilling key project requirements.`;
    } else if (matching.length === 1) {
      reason = `Fills the ${matching[0]} role; can collaborate with existing team on technical milestones.`;
    } else {
      reason = `Complementary skillset in ${candidate.department || 'engineering'}; offers interdisciplinary perspective.`;
    }

    return { score, matchingSkills: matching, missingSkills: missing, reason };
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestTarget || !activeProject) return;

    setIsSending(true);
    try {
      const newReq = await campusData.sendCollaborationRequest({
        projectId: activeProject.id,
        projectTitle: activeProject.title,
        senderId: currentUser?.id || 'student_guest',
        senderName: currentUser?.displayName || 'Student Innovator',
        senderEmail: currentUser?.email || 'student@campus.edu',
        senderSkills: currentUser?.skills || ['Programming'],
        recipientId: requestTarget.id,
        message: requestMessage.trim() || `Hi ${requestTarget.displayName}, I would love to collaborate on ${activeProject.title}!`,
      });

      setCollabRequests([newReq, ...collabRequests]);
      setRequestTarget(null);
      setRequestMessage('');
      setNotification(`Invitation successfully sent to ${requestTarget.displayName}!`);
      setTimeout(() => setNotification(null), 4000);
    } catch (e: any) {
      console.warn('Error sending collab request:', e);
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdateStatus = async (requestId: string, status: 'Accepted' | 'Rejected') => {
    await campusData.updateCollaborationStatus(requestId, status);
    setCollabRequests(
      collabRequests.map((r) => (r.id === requestId ? { ...r, status } : r))
    );
  };

  // Filter collaborators
  const filteredCandidates = collaborators.filter((c) => {
    if (currentUser && c.id === currentUser.id) return false;
    const matchesSearch =
      c.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.department && c.department.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSkill =
      skillFilter === 'All' || c.skills.some((s) => s.toLowerCase() === skillFilter.toLowerCase());

    return matchesSearch && matchesSkill;
  });

  const allSkills = Array.from(new Set(collaborators.flatMap((c) => c.skills)));

  return (
    <div className="space-y-8">
      {/* Top Section Header */}
      <div className="bg-[#0F1E36] rounded-xl border border-slate-800 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <span>Campus Collaborator Discovery</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Match student skills, department expertise, and technical interests with your innovation project requirements.
              Algorithm evaluates team gaps and presents transparent compatibility metrics.
            </p>
          </div>

          {/* Project Context Selector */}
          {projects.length > 0 && (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-750 rounded-lg p-1.5 text-xs">
              <span className="text-slate-400 font-medium pl-1">Matching against:</span>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-slate-800 text-white rounded px-2.5 py-1 font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-400"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, skill (e.g. IoT, PyTorch, UI/UX), or department..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="md:col-span-4 flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white text-xs focus:outline-none focus:border-cyan-400"
            >
              <option value="All">All Skills</option>
              {allSkills.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {notification && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Grid of Recommended Teammates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredCandidates.map((candidate) => {
          const match = calculateMatch(candidate, activeProject);

          return (
            <div
              key={candidate.id}
              className="bg-[#0F1E36] rounded-xl border border-slate-800 hover:border-slate-700 transition-all p-5 flex flex-col justify-between space-y-4 shadow-sm"
            >
              <div className="space-y-4">
                {/* Header: Avatar, Name, College & Compatibility */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={candidate.avatarUrl || '/src/assets/images/avatar_student_lead_1791965170195.jpg'}
                      alt={candidate.displayName}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border border-slate-700"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-white leading-tight">
                        {candidate.displayName}
                      </h3>
                      <span className="text-[11px] text-slate-400 block truncate max-w-[160px]">
                        {candidate.department || candidate.college}
                      </span>
                    </div>
                  </div>

                  {/* Compatibility Score */}
                  <div className="text-right">
                    <div className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold inline-block tabular-nums">
                      {match.score}% Match
                    </div>
                    <span className="block text-[10px] text-slate-500 mt-0.5">Compatibility</span>
                  </div>
                </div>

                {/* Match Explanation */}
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                  <span className="text-cyan-400 font-semibold block mb-0.5">Recommendation Logic:</span>
                  {match.reason}
                </div>

                {/* Skills Breakdown (Matching vs Other) */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Skillset & Expertise
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.skills.map((skill) => {
                      const isMatching = match.matchingSkills.includes(skill);
                      return (
                        <span
                          key={skill}
                          className={`px-2 py-0.5 rounded text-[11px] ${
                            isMatching
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                              : 'bg-slate-900 text-slate-300 border border-slate-800'
                          }`}
                        >
                          {skill}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Bio / Collaboration statement */}
                {candidate.collaborationPreferences && (
                  <p className="text-[11px] text-slate-400 line-clamp-2 italic">
                    "{candidate.collaborationPreferences}"
                  </p>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => setRequestTarget(candidate)}
                  className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Request to Collaborate</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCandidates.length === 0 && (
        <div className="text-center py-12 bg-[#0F1E36] rounded-xl border border-dashed border-slate-800">
          <Users className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-xs text-slate-400">No student innovators found matching "{searchQuery}".</p>
        </div>
      )}

      {/* Collaboration Requests Track Section */}
      <div className="bg-[#0F1E36] rounded-xl border border-slate-800 p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-purple-400" />
          <span>My Collaboration Invitations & Requests</span>
        </h3>

        {collabRequests.length === 0 ? (
          <p className="text-xs text-slate-400">No pending collaboration invitations or sent requests.</p>
        ) : (
          <div className="divide-y divide-slate-800/80 text-xs">
            {collabRequests.map((req) => {
              const isIncoming = req.recipientId === currentUser?.id;
              return (
                <div key={req.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">
                        {isIncoming ? req.senderName : `Sent to teammate`}
                      </span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="text-cyan-400 font-medium">{req.projectTitle}</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      "{req.message}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        req.status === 'Accepted'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : req.status === 'Rejected'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {req.status}
                    </span>

                    {isIncoming && req.status === 'Pending' && (
                      <div className="flex items-center gap-1.5 ml-2">
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'Accepted')}
                          className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'Rejected')}
                          className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Send Collaboration Request Modal */}
      {requestTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1E36] border border-slate-750 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">
                Request to Collaborate with {requestTarget.displayName}
              </h3>
              <button onClick={() => setRequestTarget(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSendRequest} className="space-y-4">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Target Project</label>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-medium">
                  {activeProject?.title || 'Selected Campus Innovation'}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Personal Message / Pitch</label>
                <textarea
                  rows={4}
                  required
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder={`Hi ${requestTarget.displayName}, I noticed your expertise in ${requestTarget.skills.slice(0, 2).join(' and ')}. We'd love to invite you to collaborate on our project milestones...`}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRequestTarget(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-4 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold inline-flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSending ? 'Sending...' : 'Send Invitation'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
