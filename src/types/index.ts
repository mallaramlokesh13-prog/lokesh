export type UserRole = 'student' | 'mentor' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  college?: string;
  department?: string;
  year?: string;
  skills: string[];
  interests?: string;
  experienceLevel?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  preferredTechnologies?: string;
  collaborationPreferences?: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export type ProjectStatus = 'Submitted' | 'Under Review' | 'Changes Requested' | 'Approved' | 'Rejected';

export interface Project {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  title: string;
  problemStatement: string;
  proposedSolution: string;
  description: string;
  category: string;
  targetUsers: string;
  expectedImpact: string;
  requiredTechnologies: string[];
  requiredSkills: string[];
  estimatedBudget: number;
  approvedBudget?: number;
  expectedTimeline: string;
  status: ProjectStatus;
  mentorId?: string;
  mentorName?: string;
  createdAt: string;
  updatedAt?: string;
  aiEvaluationId?: string;
}

export interface AIEvaluation {
  id: string;
  projectId: string;
  overallScore: number;
  originalityScore: number;
  feasibilityScore: number;
  innovationScore: number;
  impactScore: number;
  complexityScore: number;
  scalabilityScore: number;
  originalityIndicators: string;
  feasibilityAnalysis: string;
  innovationUsefulness?: string;
  impactAnalysis?: string;
  technicalComplexity?: string;
  scalabilitySustainability?: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  recommendedTech: string[];
  requiredTeamSkills: string[];
  implementationRoadmap?: Array<{
    phase: string;
    duration: string;
    focus: string;
  }>;
  risksLimitations: string[];
  isDemo: boolean;
  evaluatedAt: string;
  disclaimer: string;
}

export type CollaborationStatus = 'Pending' | 'Accepted' | 'Rejected';

export interface CollaborationRequest {
  id: string;
  projectId: string;
  projectTitle: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  senderSkills: string[];
  recipientId: string;
  message: string;
  status: CollaborationStatus;
  createdAt: string;
}

export type FundingStatus = 'Pending' | 'Approved' | 'Rejected';

export interface FundingRequest {
  id: string;
  projectId: string;
  projectTitle: string;
  studentId: string;
  studentName: string;
  requestedAmount: number;
  purpose: string;
  itemizedBudget: string;
  status: FundingStatus;
  approvedAmount?: number;
  adminNotes?: string;
  createdAt: string;
  reviewedAt?: string;
}

export type ExpenseStatus = 'Pending' | 'Verified' | 'Rejected';

export interface Expense {
  id: string;
  projectId: string;
  studentId: string;
  description: string;
  amount: number;
  expenseDate: string;
  receiptName?: string;
  receiptUrl?: string;
  status: ExpenseStatus;
  reviewerNotes?: string;
  createdAt: string;
  reviewedAt?: string;
}

export type MilestoneStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Blocked';

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedMember: string;
  startDate: string;
  dueDate: string;
  status: MilestoneStatus;
  progressNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProjectReview {
  id: string;
  projectId: string;
  reviewerId: string;
  reviewerName: string;
  decision: 'Approved' | 'Rejected' | 'Changes Requested';
  comments: string;
  reviewedAt: string;
}

export interface MentorNote {
  id: string;
  projectId: string;
  mentorId: string;
  mentorName: string;
  noteType: 'General' | 'Progress Check' | 'Technical Guidance' | 'Action Item';
  content: string;
  createdAt: string;
}
