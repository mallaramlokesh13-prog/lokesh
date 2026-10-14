import React, { useState } from 'react';
import { Project, AIEvaluation } from '../../types';
import { requestAIEvaluation } from '../../services/ai';
import { campusData } from '../../services/db';
import {
  Sparkles,
  X,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Compass,
  Cpu,
  RefreshCw,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

interface AIEvaluationModalProps {
  project: Project;
  onClose: () => void;
  onEvaluationUpdated?: (evalData: AIEvaluation) => void;
}

export const AIEvaluationModal: React.FC<AIEvaluationModalProps> = ({
  project,
  onClose,
  onEvaluationUpdated,
}) => {
  const [evaluation, setEvaluation] = useState<AIEvaluation | undefined>(() =>
    campusData.getEvaluation(project.id)
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRunEvaluation = async (forceDemo = false) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await requestAIEvaluation(project, forceDemo);
      setEvaluation(res.evaluation);
      await campusData.saveEvaluation(res.evaluation);
      if (onEvaluationUpdated) {
        onEvaluationUpdated(res.evaluation);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to complete AI evaluation.');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 70) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0F1E36] border border-slate-750 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl text-slate-200">
        {/* Header */}
        <div className="sticky top-0 bg-[#0F1E36]/95 backdrop-blur-md px-6 py-4 border-b border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                AI Advisory Evaluation Report
              </h2>
              <span className="text-xs text-slate-400 truncate max-w-md block">
                {project.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleRunEvaluation(false)}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
              title="Request a fresh evaluation via backend Gemini API"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{evaluation ? 'Re-evaluate' : 'Evaluate Idea'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Prominent Human Governance Disclaimer */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-750 flex items-start gap-3 text-xs">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-slate-200">
                Advisory Human-in-the-Loop Evaluation Disclaimer
              </p>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                This evaluation is an AI-generated advisory estimate to assist student refinement and faculty review.
                The AI does not prove definitive novelty or determine project selection.
                All proposal approvals, mentor assignments, and grant disbursements remain under authorized human control.
              </p>
            </div>
          </div>

          {/* Engine Mode Tag (Real AI vs Demo Mode) */}
          {evaluation && (
            <div className="flex items-center justify-between text-xs px-1">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Evaluation Engine:</span>
                {evaluation.isDemo ? (
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    Offline Demo Model (Advisory Estimate)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    Gemini 3.8 Flash (Live Server API)
                  </span>
                )}
              </div>
              <span className="text-slate-400 font-mono text-[11px] tabular-nums">
                Evaluated: {new Date(evaluation.evaluatedAt).toLocaleString()}
              </span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!evaluation && !isLoading && (
            <div className="text-center py-12 px-4 border border-dashed border-slate-750 rounded-xl">
              <Sparkles className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white mb-1">No Evaluation Report Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-5">
                Generate an advisory Gemini evaluation analyzing originality, technical feasibility, campus impact, and an implementation roadmap.
              </p>
              <button
                onClick={() => handleRunEvaluation(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-colors inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Evaluate Idea Now</span>
              </button>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-16 space-y-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <h3 className="text-sm font-semibold text-white">Analyzing Innovation Proposal...</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Assessing market differentiation, campus feasibility, hardware requirements, and team skill alignment.
              </p>
            </div>
          )}

          {evaluation && !isLoading && (
            <>
              {/* Overall Score + Category Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Overall Hero Card */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-750 flex flex-col justify-between">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    Overall Innovation Score
                  </span>
                  <div className="my-2">
                    <span className="text-4xl font-extrabold text-cyan-400 font-mono tabular-nums">
                      {evaluation.overallScore}
                    </span>
                    <span className="text-sm text-slate-500 font-mono"> / 100</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Comprehensive advisory evaluation
                  </span>
                </div>

                {/* Category 1-3 */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-750 space-y-3 md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Originality & Differentiation</span>
                    <span className="text-xl font-bold text-white font-mono tabular-nums">
                      {evaluation.originalityScore}
                    </span>
                    <span className="text-slate-500 text-xs">/100</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block">Technical Feasibility</span>
                    <span className="text-xl font-bold text-white font-mono tabular-nums">
                      {evaluation.feasibilityScore}
                    </span>
                    <span className="text-slate-500 text-xs">/100</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block">Innovation & Utility</span>
                    <span className="text-xl font-bold text-white font-mono tabular-nums">
                      {evaluation.innovationScore}
                    </span>
                    <span className="text-slate-500 text-xs">/100</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block">Campus & Social Impact</span>
                    <span className="text-xl font-bold text-white font-mono tabular-nums">
                      {evaluation.impactScore}
                    </span>
                    <span className="text-slate-500 text-xs">/100</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block">Technical Complexity</span>
                    <span className="text-xl font-bold text-white font-mono tabular-nums">
                      {evaluation.complexityScore}
                    </span>
                    <span className="text-slate-500 text-xs">/100</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block">Scalability & Sustainability</span>
                    <span className="text-xl font-bold text-white font-mono tabular-nums">
                      {evaluation.scalabilityScore}
                    </span>
                    <span className="text-slate-500 text-xs">/100</span>
                  </div>
                </div>
              </div>

              {/* Analytical Narrative Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-750 space-y-1.5">
                  <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" />
                    <span>Originality & Differentiation Analysis</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {evaluation.originalityIndicators}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-750 space-y-1.5">
                  <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Feasibility & Campus Viability</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {evaluation.feasibilityAnalysis}
                  </p>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-750 space-y-2">
                  <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Evaluated Strengths</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {evaluation.strengths.map((str, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">·</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-750 space-y-2">
                  <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Vulnerabilities & Areas to Clarify</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {evaluation.weaknesses.map((weak, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">·</span>
                        <span>{weak}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actionable Improvement Suggestions */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-750 space-y-2">
                <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Actionable Recommendations for Students</span>
                </h4>
                <div className="space-y-2 text-xs text-slate-300">
                  {evaluation.suggestions.map((sug, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 font-mono text-[10px] font-bold">
                        {i + 1}
                      </span>
                      <p className="leading-relaxed">{sug}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Tech & Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-750 space-y-2">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                    Recommended Tech Stack
                  </span>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                    {evaluation.recommendedTech.map((tech, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-750 space-y-2">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                    Recommended Team Skills
                  </span>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                    {evaluation.requiredTeamSkills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-purple-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Suggested Implementation Roadmap */}
              {evaluation.implementationRoadmap && evaluation.implementationRoadmap.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-750 space-y-3">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Suggested Implementation Roadmap</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {evaluation.implementationRoadmap.map((item, i) => (
                      <div key={i} className="p-3 rounded-lg bg-slate-800/80 border border-slate-750 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-white">{item.phase}</span>
                          <span className="text-cyan-400 font-mono tabular-nums text-[11px]">{item.duration}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{item.focus}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risks & Limitations */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-750 space-y-2">
                <h4 className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Potential Risks & Practical Limitations</span>
                </h4>
                <ul className="space-y-1 text-xs text-slate-300">
                  {evaluation.risksLimitations.map((risk, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold">·</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#0B1526] border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            InnovateVerse Evaluation System · Powered by Gemini
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-750 text-white transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
