import React from 'react';
import { Sparkles, ArrowRight, Users, CheckCircle, ShieldCheck, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeroSectionProps {
  onOpenSubmitModal: () => void;
  onExploreClick: () => void;
  onCollaboratorsClick: () => void;
  stats: {
    totalProjects: number;
    approvedFunding: number;
    activeCollaborators: number;
    assignedMentors: number;
  };
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenSubmitModal,
  onExploreClick,
  onCollaboratorsClick,
  stats,
}) => {
  const { activeRole } = useAuth();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0B192C] via-[#0F1E36] to-[#0B192C] text-white pt-8 pb-16 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 2-Column Desktop Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          {/* Left Column: Mission, Value Proposition, and CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs text-cyan-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>University Campus Innovation & Incubation Platform</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight" style={{ textWrap: 'balance' }}>
              Transform Student Ideas into <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Funded Ventures</span> with AI & Faculty Mentorship.
            </h1>

            <p className="text-base text-slate-300 leading-relaxed max-w-xl">
              InnovateVerse connects collegiate innovators with compatible teammates, provides instant advisory Gemini evaluations,
              and pairs selected projects with faculty mentors and human-sanctioned grant funding.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onOpenSubmitModal}
                className="px-5 py-3 text-sm font-semibold rounded-lg bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-500/25 inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <span>Submit Innovation Idea</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onCollaboratorsClick}
                className="px-5 py-3 text-sm font-semibold rounded-lg bg-slate-800/90 hover:bg-slate-750 text-slate-200 border border-slate-750 hover:border-slate-650 transition-colors inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Find Teammates</span>
              </button>
            </div>

            {/* Quick Guarantees */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-cyan-400" />
                Transparent skill matching
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Advisory Gemini assessments
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Human-authorized grant ledger
              </span>
            </div>
          </div>

          {/* Right Column: High-Fidelity Innovation Lab Asset */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-750 shadow-2xl bg-slate-900 group">
              <img
                src="/src/assets/images/hero_innovation_hub_1791965170305.jpg"
                alt="University students collaborating in an engineering innovation center"
                referrerPolicy="no-referrer"
                className="w-full h-80 sm:h-96 object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 p-3 bg-slate-900/85 backdrop-blur-md rounded-lg border border-slate-700/80 text-xs">
                <div className="flex items-center justify-between text-slate-200 font-semibold mb-1">
                  <span>Makerspace & Engineering Incubation</span>
                  <span className="text-cyan-400 tabular-nums">Fall Cohort</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-tight">
                  Cross-functional teams collaborating on IoT grids, assistive robotics, and sustainability software.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Column KPI Strip in a full-width row below the hero split */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
          <div className="p-3 border-r border-slate-800 last:border-r-0">
            <span className="block text-xs text-slate-400 uppercase tracking-wider mb-1">Campus Submissions</span>
            <span className="text-2xl font-bold text-white font-mono tabular-nums">{stats.totalProjects}</span>
            <span className="block text-[11px] text-cyan-400 mt-0.5">Active proposals</span>
          </div>

          <div className="p-3 border-r border-slate-800 last:border-r-0">
            <span className="block text-xs text-slate-400 uppercase tracking-wider mb-1">Grants Sanctioned</span>
            <span className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
              ${stats.approvedFunding.toLocaleString()}
            </span>
            <span className="block text-[11px] text-slate-400 mt-0.5">Human approved</span>
          </div>

          <div className="p-3 border-r border-slate-800 last:border-r-0">
            <span className="block text-xs text-slate-400 uppercase tracking-wider mb-1">Student Innovators</span>
            <span className="text-2xl font-bold text-purple-400 font-mono tabular-nums">
              {stats.activeCollaborators}
            </span>
            <span className="block text-[11px] text-slate-400 mt-0.5">Verified skill profiles</span>
          </div>

          <div className="p-3">
            <span className="block text-xs text-slate-400 uppercase tracking-wider mb-1">Faculty Mentors</span>
            <span className="text-2xl font-bold text-amber-400 font-mono tabular-nums">{stats.assignedMentors}</span>
            <span className="block text-[11px] text-slate-400 mt-0.5">Technical & venture leads</span>
          </div>
        </div>
      </div>
    </section>
  );
};
