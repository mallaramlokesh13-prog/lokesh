import React, { useState } from 'react';
import { Project } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { campusData } from '../../services/db';
import { requestAIEvaluation } from '../../services/ai';
import {
  X,
  Sparkles,
  Plus,
  Trash2,
  DollarSign,
  AlertCircle,
  Clock,
  Layers,
  CheckCircle,
} from 'lucide-react';

interface SubmitProjectModalProps {
  onClose: () => void;
  onProjectCreated: (newProject: Project) => void;
}

const CATEGORIES = [
  'CleanTech & Smart Energy',
  'Healthcare & Assistive Tech',
  'EdTech & Decentralized Systems',
  'Sustainability & Robotics',
  'AI & Autonomous Systems',
  'FinTech & Campus Commerce',
  'Agritech & Food Systems',
  'Civic & Social Innovation',
];

const COMMON_SKILLS = [
  'Programming',
  'AI/ML',
  'Web Development',
  'UI/UX',
  'Electronics',
  'IoT Sensors',
  'Embedded Systems',
  'Research',
  'Business Planning',
  'Robotics',
  'Mobile Dev',
  'Data Science',
];

export const SubmitProjectModal: React.FC<SubmitProjectModalProps> = ({
  onClose,
  onProjectCreated,
}) => {
  const { currentUser } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [problemStatement, setProblemStatement] = useState('');
  const [proposedSolution, setProposedSolution] = useState('');
  const [description, setDescription] = useState('');
  const [targetUsers, setTargetUsers] = useState('');
  const [expectedImpact, setExpectedImpact] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState('2500');
  const [expectedTimeline, setExpectedTimeline] = useState('1 Semester (14 Weeks)');

  const [technologies, setTechnologies] = useState<string[]>(['React', 'TypeScript', 'Node.js']);
  const [techInput, setTechInput] = useState('');

  const [selectedSkills, setSelectedSkills] = useState<string[]>(['AI/ML', 'Web Development']);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddTech = () => {
    if (techInput.trim() && !technologies.includes(techInput.trim())) {
      setTechnologies([...technologies, techInput.trim()]);
      setTechInput('');
    }
  };

  const handleRemoveTech = (item: string) => {
    setTechnologies(technologies.filter((t) => t !== item));
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Project title is required.');
      return;
    }
    if (!problemStatement.trim()) {
      setError('Problem statement is required.');
      return;
    }
    if (!proposedSolution.trim()) {
      setError('Proposed solution is required.');
      return;
    }

    const budgetNum = parseFloat(estimatedBudget);
    if (isNaN(budgetNum) || budgetNum < 0) {
      setError('Please provide a valid estimated budget.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create project in persistent store
      const projectPayload = {
        studentId: currentUser?.id || 'student_guest',
        studentName: currentUser?.displayName || 'Student Innovator',
        studentEmail: currentUser?.email || 'student@campus.edu',
        title: title.trim(),
        category,
        problemStatement: problemStatement.trim(),
        proposedSolution: proposedSolution.trim(),
        description: description.trim() || proposedSolution.trim(),
        targetUsers: targetUsers.trim() || 'Campus community',
        expectedImpact: expectedImpact.trim() || 'Positive educational impact',
        requiredTechnologies: technologies,
        requiredSkills: selectedSkills,
        estimatedBudget: budgetNum,
        approvedBudget: 0,
        expectedTimeline: expectedTimeline.trim(),
      };

      const created = await campusData.createProject(projectPayload);

      // Trigger advisory AI evaluation immediately in background
      try {
        const evalRes = await requestAIEvaluation(created, false);
        await campusData.saveEvaluation(evalRes.evaluation);
      } catch (aiErr) {
        console.warn('Initial AI evaluation could not run immediately; student can re-trigger on demand:', aiErr);
      }

      onProjectCreated(created);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error submitting project proposal.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0F1E36] border border-slate-750 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl text-slate-200">
        {/* Header */}
        <div className="sticky top-0 bg-[#0F1E36]/95 backdrop-blur-md px-6 py-4 border-b border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Submit Campus Innovation Proposal
              </h2>
              <span className="text-xs text-slate-400">
                Submissions receive advisory Gemini evaluation & human committee review
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Project Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., SolarSense — Campus Smart Microgrid"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Innovation Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white focus:outline-none focus:border-cyan-400 text-xs"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Problem Statement */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">
              Problem Statement * <span className="text-slate-500 font-normal">(What campus or real-world friction exists?)</span>
            </label>
            <textarea
              required
              rows={3}
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              placeholder="Detail the exact problem, who experiences it, and why current approaches fail..."
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs leading-relaxed"
            />
          </div>

          {/* Proposed Solution */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">
              Proposed Solution * <span className="text-slate-500 font-normal">(How does your idea solve it?)</span>
            </label>
            <textarea
              required
              rows={3}
              value={proposedSolution}
              onChange={(e) => setProposedSolution(e.target.value)}
              placeholder="Explain the hardware/software architecture, mechanism, and differentiation..."
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs leading-relaxed"
            />
          </div>

          {/* Target Users & Expected Impact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Target Users & Beneficiaries</label>
              <input
                type="text"
                value={targetUsers}
                onChange={(e) => setTargetUsers(e.target.value)}
                placeholder="e.g. University Facilities, Commuter Students, Lab Technicians"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Expected Impact & Metrics</label>
              <input
                type="text"
                value={expectedImpact}
                onChange={(e) => setExpectedImpact(e.target.value)}
                placeholder="e.g. 25% energy reduction, saving $30k annually"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs"
              />
            </div>
          </div>

          {/* Required Team Skills (Checkboxes/Chips) */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-300 block">
              Required Team Skills <span className="text-slate-500 font-normal">(Used for collaborator matching)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_SKILLS.map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    type="button"
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-medium'
                        : 'bg-slate-900 border border-slate-750 text-slate-400 hover:text-white'
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Technologies Tag Input */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-300 block">Required Technologies & Stack</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTech();
                  }
                }}
                placeholder="Type tech (e.g. PyTorch, ESP32, Docker) and click Add"
                className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs"
              />
              <button
                type="button"
                onClick={handleAddTech}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-750 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {technologies.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 flex items-center gap-1.5 text-xs"
                >
                  <span>{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTech(t)}
                    className="hover:text-rose-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Estimated Budget & Expected Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Estimated Budget ($ USD)</span>
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={estimatedBudget}
                onChange={(e) => setEstimatedBudget(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Expected Timeline</span>
              </label>
              <input
                type="text"
                value={expectedTimeline}
                onChange={(e) => setExpectedTimeline(e.target.value)}
                placeholder="e.g. 1 Semester (14 Weeks)"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Submission Notice */}
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            By submitting, your project proposal will be indexed in the campus innovation registry.
            An automated Gemini advisory evaluation will generate initial feedback, followed by committee review for mentor assignment and funding eligibility.
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold transition-colors shadow-sm inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Submitting & Evaluating...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Submit Project</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
