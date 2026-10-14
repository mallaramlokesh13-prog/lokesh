import React from 'react';
import { Sparkles, Shield, Award, BookOpen, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0B192C] border-t border-slate-800 text-slate-400 text-xs mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand and Mission */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">InnovateVerse</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              The AI-powered university innovation portal bridging student ideas, collaborative talent discovery,
              faculty mentorship, and institutional grant funding. Powered by advisory Gemini evaluations and human-in-the-loop governance.
            </p>
            <div className="flex items-center gap-4 mt-4 text-slate-400 text-xs">
              <span className="inline-flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                Human-Sanctioned Grants
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-purple-400" />
                Collegiate Hackathon 2026
              </span>
            </div>
          </div>

          {/* Quick Pillars */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">Core Modules</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  Student Skill Matching
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  Advisory Gemini Evaluation
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  Faculty Mentor Assignments
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  Grant Ledger & Bill Verification
                </span>
              </li>
            </ul>
          </div>

          {/* Institutional Governance */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">Governance & Ethics</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1 text-slate-400">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>Human Review Mandate</span>
              </li>
              <li className="flex items-center gap-1 text-slate-400">
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span>Zero-Trust ABAC Security</span>
              </li>
              <li className="flex items-center gap-1 text-slate-400">
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                <span>Firestore & Gemini Backend</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 InnovateVerse Incubation Platform. Built for University Hackathon.</p>
          <div className="flex items-center gap-3">
            <span>Advisory AI Assessment</span>
            <span aria-hidden="true">·</span>
            <span>Audited Grant Ledgers</span>
            <span aria-hidden="true">·</span>
            <span>Role-Based Access Control</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
