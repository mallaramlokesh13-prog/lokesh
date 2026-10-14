import React, { useState } from 'react';
import { UserProfile, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  User,
  GraduationCap,
  Briefcase,
  Sparkles,
  Check,
  CheckCircle,
  AlertCircle,
  Save,
} from 'lucide-react';

interface ProfileModalProps {
  onClose: () => void;
}

const AVAILABLE_SKILLS = [
  'Programming',
  'AI/ML',
  'Web Development',
  'UI/UX',
  'Electronics',
  'IoT Sensors',
  'Embedded Systems',
  'Robotics',
  'Research',
  'Business Planning',
  'Data Science',
  'Mobile Dev',
  'Pitch Decks',
  'Financial Modeling',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
  const { currentUser, updateProfile, activeRole, switchDemoRole } = useAuth();

  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [college, setCollege] = useState(currentUser?.college || 'School of Computing & Engineering');
  const [department, setDepartment] = useState(currentUser?.department || 'Computer Science & AI');
  const [year, setYear] = useState(currentUser?.year || '3rd Year');
  const [experienceLevel, setExperienceLevel] = useState<any>(currentUser?.experienceLevel || 'Intermediate');
  const [skills, setSkills] = useState<string[]>(currentUser?.skills || ['Programming', 'Web Development']);
  const [interests, setInterests] = useState(currentUser?.interests || '');
  const [preferredTechnologies, setPreferredTechnologies] = useState(currentUser?.preferredTechnologies || '');
  const [collaborationPreferences, setCollaborationPreferences] = useState(
    currentUser?.collaborationPreferences || ''
  );
  const [bio, setBio] = useState(currentUser?.bio || '');

  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        displayName: displayName.trim(),
        college: college.trim(),
        department: department.trim(),
        year: year.trim(),
        experienceLevel,
        skills,
        interests: interests.trim(),
        preferredTechnologies: preferredTechnologies.trim(),
        collaborationPreferences: collaborationPreferences.trim(),
        bio: bio.trim(),
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (e: any) {
      console.warn('Error saving profile:', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0F1E36] border border-slate-750 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 space-y-4 text-xs text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">
                Student & Researcher Skill Profile
              </h3>
              <span className="text-[11px] text-slate-400">
                Your profile is indexed by the collaborator discovery algorithm
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Role Switcher Inside Profile for convenience */}
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400 text-xs">Simulated Hackathon Role:</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => switchDemoRole('student')}
              className={`px-2.5 py-1 rounded text-xs font-semibold ${
                activeRole === 'student' ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => switchDemoRole('mentor')}
              className={`px-2.5 py-1 rounded text-xs font-semibold ${
                activeRole === 'mentor' ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              Mentor
            </button>
            <button
              type="button"
              onClick={() => switchDemoRole('admin')}
              className={`px-2.5 py-1 rounded text-xs font-semibold ${
                activeRole === 'admin' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}
            >
              Admin
            </button>
          </div>
        </div>

        {success && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Profile successfully updated in database!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">College / School *</label>
              <input
                type="text"
                required
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Department *</label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Academic Year</label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g. 3rd Year (Junior)"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white text-xs focus:outline-none focus:border-cyan-400"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>

          {/* Multi-skill selector */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-300 block">
              Core Skills & Capabilities * <span className="text-slate-500 font-normal">(Select all that apply)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SKILLS.map((skill) => {
                const isSelected = skills.includes(skill);
                return (
                  <button
                    type="button"
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 font-semibold'
                        : 'bg-slate-900 text-slate-400 border border-slate-750 hover:text-white'
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">
              Preferred Technologies & Frameworks
            </label>
            <input
              type="text"
              value={preferredTechnologies}
              onChange={(e) => setPreferredTechnologies(e.target.value)}
              placeholder="e.g. React, TypeScript, PyTorch, ESP32, Tailwind CSS, ROS2"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">
              Collaboration Preferences & Teammate Needs
            </label>
            <textarea
              rows={2}
              value={collaborationPreferences}
              onChange={(e) => setCollaborationPreferences(e.target.value)}
              placeholder="e.g. Looking for embedded electronics/hardware lead and business pitch co-founder..."
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 leading-relaxed"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Bio / Profile Statement</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Brief summary of your collegiate background, projects, or hackathon aspirations..."
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 leading-relaxed"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
