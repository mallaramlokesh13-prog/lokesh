import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Project, AIEvaluation, UserProfile } from './types';
import { campusData } from './services/db';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/landing/HeroSection';
import { ProjectCard } from './components/projects/ProjectCard';
import { SubmitProjectModal } from './components/projects/SubmitProjectModal';
import { AIEvaluationModal } from './components/projects/AIEvaluationModal';
import { FundingModal } from './components/finance/FundingModal';
import { ExpenseModal } from './components/finance/ExpenseModal';
import { ProfileModal } from './components/profile/ProfileModal';
import { CollaboratorDiscovery } from './components/collaborators/CollaboratorDiscovery';
import { StudentDashboard } from './components/dashboards/StudentDashboard';
import { MentorDashboard } from './components/dashboards/MentorDashboard';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { FinanceLedgerView } from './components/finance/FinanceLedgerView';
import { BioscienceStudio } from './components/science/BioscienceStudio';
import { GeminiAssistantModal } from './components/ai/GeminiAssistantModal';
import { MediaStudioModal } from './components/studio/MediaStudioModal';
import {
  Compass,
  Search,
  Filter,
  PlusCircle,
  Sparkles,
  Layers,
  ChevronRight,
  Shield,
  Briefcase,
  Users,
  Dna,
  Bot,
  Video,
} from 'lucide-react';

function InnovateVerseApp() {
  const { activeRole, currentUser } = useAuth();

  const [projects, setProjects] = useState<Project[]>(() => campusData.getProjects());
  const [activeTab, setActiveTab] = useState<string>('explore');

  // Search & category filters for explore tab
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modals state
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isMediaStudioOpen, setIsMediaStudioOpen] = useState(false);
  const [evalModalProject, setEvalModalProject] = useState<Project | null>(null);
  const [fundingModalProject, setFundingModalProject] = useState<Project | undefined>(undefined);
  const [isFundingModalOpen, setIsFundingModalOpen] = useState(false);
  const [expenseModalProject, setExpenseModalProject] = useState<Project | undefined>(undefined);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Reload projects from db
  const refreshProjects = () => {
    setProjects(campusData.getProjects());
  };

  const handleProjectCreated = (newProject: Project) => {
    refreshProjects();
    setEvalModalProject(newProject);
  };

  // Filter projects for explore view
  const categories = ['All', ...Array.from(new Set(projects.map((p) => p.category)))];

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.problemStatement.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.requiredSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const totalFunding = projects.reduce((sum, p) => sum + (p.approvedBudget || 0), 0);
  const stats = {
    totalProjects: projects.length,
    approvedFunding: totalFunding,
    activeCollaborators: campusData.getDiscoverableCollaborators().length + 1,
    assignedMentors: 3,
  };

  return (
    <div className="min-h-screen bg-[#070F1E] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSubmitModal={() => setIsSubmitOpen(true)}
        onOpenProfileModal={() => setIsProfileOpen(true)}
        onOpenAssistantModal={() => setIsAssistantOpen(true)}
        onOpenMediaStudioModal={() => setIsMediaStudioOpen(true)}
      />

      <main className="flex-1">
        {/* Explore View */}
        {activeTab === 'explore' && (
          <div>
            <HeroSection
              onOpenSubmitModal={() => setIsSubmitOpen(true)}
              onExploreClick={() => {
                const el = document.getElementById('explore-registry');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onCollaboratorsClick={() => setActiveTab('collaborators')}
              stats={stats}
            />

            <div id="explore-registry" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
              {/* Filter and Search Bar */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Compass className="w-5 h-5 text-cyan-400" />
                    <span>Campus Innovation Registry</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Explore student ideas undergoing advisory Gemini evaluation and human incubation review
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search proposals or skills..."
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-400"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    milestones={campusData.getMilestones(project.id)}
                    onViewEvaluation={(p) => setEvalModalProject(p)}
                    onSelectProject={(p) => {
                      setActiveTab('dashboard');
                    }}
                    onRequestFunding={(p) => {
                      setFundingModalProject(p);
                      setIsFundingModalOpen(true);
                    }}
                    onRequestCollaborate={(p) => {
                      setActiveTab('collaborators');
                    }}
                    isOwner={currentUser?.id === project.studentId}
                  />
                ))}
              </div>

              {filteredProjects.length === 0 && (
                <div className="text-center py-16 bg-[#0F1E36] rounded-xl border border-dashed border-slate-800">
                  <Compass className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-300">No projects found</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Try adjusting your search criteria or category filter.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Role Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {activeRole === 'admin' ? (
              <AdminDashboard
                projects={projects}
                onProjectsUpdated={refreshProjects}
                onViewEvaluation={(p) => setEvalModalProject(p)}
              />
            ) : activeRole === 'mentor' ? (
              <MentorDashboard
                projects={projects}
                onViewEvaluation={(p) => setEvalModalProject(p)}
              />
            ) : (
              <StudentDashboard
                projects={projects}
                onOpenSubmitModal={() => setIsSubmitOpen(true)}
                onViewEvaluation={(p) => setEvalModalProject(p)}
                onRequestFunding={(p) => {
                  setFundingModalProject(p);
                  setIsFundingModalOpen(true);
                }}
                onRecordExpense={(p) => {
                  setExpenseModalProject(p);
                  setIsExpenseModalOpen(true);
                }}
              />
            )}
          </div>
        )}

        {/* Collaborators Discovery Tab */}
        {activeTab === 'collaborators' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <CollaboratorDiscovery
              projects={projects}
              onOpenProject={(p) => {
                setActiveTab('dashboard');
              }}
            />
          </div>
        )}

        {/* Bioscience Studio Tab (Science Skill) */}
        {activeTab === 'science' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <BioscienceStudio />
          </div>
        )}

        {/* Grants & Expenses Ledger Tab */}
        {activeTab === 'finance' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <FinanceLedgerView
              projects={projects}
              onRequestFunding={() => {
                setFundingModalProject(projects[0]);
                setIsFundingModalOpen(true);
              }}
              onRecordExpense={() => {
                setExpenseModalProject(projects[0]);
                setIsExpenseModalOpen(true);
              }}
            />
          </div>
        )}
      </main>

      {/* Floating Action Button for Gemini Assistant */}
      <button
        onClick={() => setIsAssistantOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-xl shadow-cyan-500/25 flex items-center gap-2 font-semibold text-xs transition-transform hover:scale-105 cursor-pointer border border-cyan-300/30"
        title="Open Gemini AI Innovation Advisor"
      >
        <Bot className="w-5 h-5" />
        <span className="hidden sm:inline">Ask AI Advisor</span>
      </button>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      {isSubmitOpen && (
        <SubmitProjectModal
          onClose={() => setIsSubmitOpen(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}

      {evalModalProject && (
        <AIEvaluationModal
          project={evalModalProject}
          onClose={() => setEvalModalProject(null)}
          onEvaluationUpdated={() => refreshProjects()}
        />
      )}

      {isFundingModalOpen && (
        <FundingModal
          projects={projects}
          preselectedProject={fundingModalProject}
          onClose={() => setIsFundingModalOpen(false)}
          onRequestSubmitted={() => refreshProjects()}
        />
      )}

      {isExpenseModalOpen && (
        <ExpenseModal
          projects={projects}
          preselectedProject={expenseModalProject}
          onClose={() => setIsExpenseModalOpen(false)}
          onExpenseSubmitted={() => refreshProjects()}
        />
      )}

      {isProfileOpen && <ProfileModal onClose={() => setIsProfileOpen(false)} />}

      {isAssistantOpen && (
        <GeminiAssistantModal onClose={() => setIsAssistantOpen(false)} />
      )}

      {isMediaStudioOpen && (
        <MediaStudioModal onClose={() => setIsMediaStudioOpen(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <InnovateVerseApp />
    </AuthProvider>
  );
}
