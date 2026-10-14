import { Project, AIEvaluation } from '../types';

export interface EvaluationResponse {
  evaluation: AIEvaluation;
  isDemo: boolean;
  message?: string;
  errorNotice?: string;
}

export async function requestAIEvaluation(project: Project, forceDemo = false): Promise<EvaluationResponse> {
  try {
    const res = await fetch('/api/evaluate-idea', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ project, forceDemo }),
    });

    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }

    const data: EvaluationResponse = await res.json();
    return data;
  } catch (error: any) {
    console.warn('Network error reaching backend AI evaluator; using client fallback evaluator:', error);
    // Client fallback with explicit demo flag
    const fallback: AIEvaluation = {
      id: `eval_local_${Date.now()}`,
      projectId: project.id,
      overallScore: 81,
      originalityScore: 83,
      feasibilityScore: 82,
      innovationScore: 84,
      impactScore: 86,
      complexityScore: 78,
      scalabilityScore: 80,
      originalityIndicators: `Differentiated approach in ${project.category}. Distinctive focus on practical collegiate implementation constraints.`,
      feasibilityAnalysis: 'Strong alignment with typical 12-16 week semester development cycles using modular components.',
      innovationUsefulness: 'Demonstrates clear problem-solution fit with tangible value for intended campus stakeholders.',
      impactAnalysis: 'Measurable direct benefits for targeted campus users with potential to pilot at scale.',
      technicalComplexity: 'Balanced technical architecture requiring dependable frontend state and database synchronization.',
      scalabilitySustainability: 'High potential for continuation into capstone programs or institutional grant applications.',
      strengths: [
        'Direct alignment with urgent real-world campus workflows',
        'Realistic modular technical scope suitable for student teams',
        'Actionable success criteria for student hackathon judging',
      ],
      weaknesses: [
        'Edge case reliability in high-concurrency environments requires automated testing',
        'Need proactive user acquisition plan during initial pilot phase',
      ],
      suggestions: [
        'Conduct 5 in-person stakeholder interviews to refine core UX interactions',
        'Prototype the primary workflow first before building secondary bells and whistles',
        'Establish automated integration tests early to avoid end-of-semester regression bugs',
      ],
      recommendedTech: ['React', 'TypeScript', 'Firebase Firestore', 'Tailwind CSS', 'Node.js Express'],
      requiredTeamSkills: ['Web Development', 'Database Modeling', 'UI/UX Design', 'Project Presentation'],
      implementationRoadmap: [
        { phase: 'Phase 1: Architecture & Prototyping', duration: 'Weeks 1-3', focus: 'User journeys, database schemas, and baseline wireframes' },
        { phase: 'Phase 2: Core Engineering', duration: 'Weeks 4-8', focus: 'Primary features, validations, and real-time synchronization' },
        { phase: 'Phase 3: Integration & Testing', duration: 'Weeks 9-11', focus: 'Security hardening, pilot dry runs, and user feedback' },
      ],
      risksLimitations: [
        'Rate limits or API quotas during high-traffic hackathon live demos',
        'Student availability during midterm examination periods',
      ],
      isDemo: true,
      evaluatedAt: new Date().toISOString(),
      disclaimer:
        'Demo Advisory Evaluation (Offline fallback mode). Scores and roadmap are advisory estimates for human decision-makers. AI does not possess final authority over project approvals.',
    };

    return {
      evaluation: fallback,
      isDemo: true,
      message: 'Generated via advisory local evaluator (server offline or unreachable).',
    };
  }
}
