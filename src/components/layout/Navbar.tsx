import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  Sparkles,
  Layers,
  Users,
  Compass,
  DollarSign,
  PlusCircle,
  User,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Dna,
  Bot,
  Video,
  LogIn,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSubmitModal: () => void;
  onOpenProfileModal: () => void;
  onOpenAssistantModal: () => void;
  onOpenMediaStudioModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSubmitModal,
  onOpenProfileModal,
  onOpenAssistantModal,
  onOpenMediaStudioModal,
}) => {
  const { currentUser, activeRole, switchDemoRole, signInWithGoogle, firebaseUser } = useAuth();

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'student':
        return <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />;
      case 'mentor':
        return <Briefcase className="w-3.5 h-3.5 text-purple-400" />;
      case 'admin':
        return <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0B192C]/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Single element brand wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('explore')}
              className="flex items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-md cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5 whitespace-nowrap">
                  InnovateVerse
                </span>
                <span className="block text-[10px] text-slate-400 tracking-wide uppercase font-medium">
                  Campus Innovation
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Single-line, clean text hover) */}
          <nav className="hidden xl:flex items-center gap-5 text-xs font-medium text-slate-300">
            <button
              onClick={() => setActiveTab('explore')}
              className={`hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 ${
                activeTab === 'explore' ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' : ''
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explore Ideas</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 ${
                activeTab === 'dashboard' ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' : ''
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>
                {activeRole === 'admin'
                  ? 'Admin Console'
                  : activeRole === 'mentor'
                  ? 'Mentorship'
                  : 'Dashboard'}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('collaborators')}
              className={`hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 ${
                activeTab === 'collaborators' ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' : ''
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Collaborators</span>
            </button>

            <button
              onClick={() => setActiveTab('finance')}
              className={`hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 ${
                activeTab === 'finance' ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' : ''
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Grants & Ledger</span>
            </button>

            {/* Bioscience Skill Hub Tab */}
            <button
              onClick={() => setActiveTab('science')}
              className={`hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 ${
                activeTab === 'science' ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' : ''
              }`}
            >
              <Dna className="w-3.5 h-3.5 text-cyan-400" />
              <span>Bioscience Studio</span>
            </button>
          </nav>

          {/* Zone 3: Actions + Media Studio + AI Coach + Hackathon Role Switcher */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* AI Assistant Button */}
            <button
              onClick={onOpenAssistantModal}
              className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600/30 to-blue-600/30 hover:from-purple-600/40 hover:to-blue-600/40 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Open Gemini Chatbot with Search/Maps Grounding, Voice & Audio"
            >
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">AI Advisor</span>
            </button>

            {/* Pitch Media Studio Button (Veo/Lyria/Images) */}
            <button
              onClick={onOpenMediaStudioModal}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-750 hover:bg-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Pitch Media Studio: Veo Video, Lyria Music & Image Generation"
            >
              <Video className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Pitch Studio</span>
            </button>

            {/* Role Switcher Pill */}
            <div className="hidden lg:flex items-center bg-slate-900 border border-slate-750 rounded-lg p-0.5 text-xs">
              <span className="px-1.5 py-0.5 text-slate-400 text-[11px] font-medium select-none">Role:</span>
              <button
                onClick={() => switchDemoRole('student')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  activeRole === 'student' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Student
              </button>
              <button
                onClick={() => switchDemoRole('mentor')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  activeRole === 'mentor' ? 'bg-purple-500 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Mentor
              </button>
              <button
                onClick={() => switchDemoRole('admin')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  activeRole === 'admin' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Admin
              </button>
            </div>

            {/* Submit Project CTA */}
            {activeRole === 'student' && (
              <button
                onClick={onOpenSubmitModal}
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors rounded-lg shadow-sm whitespace-nowrap"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Submit Idea</span>
              </button>
            )}

            {/* Firebase Auth Google Sign-in / Profile */}
            {firebaseUser ? (
              <button
                onClick={onOpenProfileModal}
                className="flex items-center gap-1.5 p-1 rounded-lg border border-slate-750 bg-slate-900 text-left cursor-pointer"
                title="View Firebase profile"
              >
                {firebaseUser.photoURL ? (
                  <img
                    src={firebaseUser.photoURL}
                    alt="User"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px]">
                    {firebaseUser.displayName?.[0] || 'U'}
                  </div>
                )}
                <span className="hidden md:inline text-[11px] font-semibold text-white max-w-[80px] truncate">
                  {firebaseUser.displayName?.split(' ')[0] || 'Account'}
                </span>
              </button>
            ) : (
              <button
                onClick={() => signInWithGoogle().catch(() => {})}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-750 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                title="Sign in with Google Firebase Auth"
              >
                <LogIn className="w-3 h-3 text-cyan-400" />
                <span className="hidden sm:inline">Google Auth</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex xl:hidden items-center justify-around py-2 border-t border-slate-800 text-[11px] overflow-x-auto">
          <button
            onClick={() => setActiveTab('explore')}
            className={`py-1 px-2 whitespace-nowrap ${activeTab === 'explore' ? 'text-cyan-400 font-semibold' : 'text-slate-400'}`}
          >
            Explore
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-1 px-2 whitespace-nowrap ${activeTab === 'dashboard' ? 'text-cyan-400 font-semibold' : 'text-slate-400'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('collaborators')}
            className={`py-1 px-2 whitespace-nowrap ${activeTab === 'collaborators' ? 'text-cyan-400 font-semibold' : 'text-slate-400'}`}
          >
            Collaborators
          </button>
          <button
            onClick={() => setActiveTab('science')}
            className={`py-1 px-2 whitespace-nowrap ${activeTab === 'science' ? 'text-cyan-400 font-semibold' : 'text-slate-400'}`}
          >
            Bioscience
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            className={`py-1 px-2 whitespace-nowrap ${activeTab === 'finance' ? 'text-cyan-400 font-semibold' : 'text-slate-400'}`}
          >
            Grants
          </button>
        </div>
      </div>
    </header>
  );
};
