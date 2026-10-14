import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  deleteDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  Project,
  AIEvaluation,
  CollaborationRequest,
  FundingRequest,
  Expense,
  Milestone,
  ProjectReview,
  MentorNote,
  UserProfile,
} from '../types';

// Seed initial demo data for smooth offline/first-run experience
const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj_smart_campus_grid',
    studentId: 'student_priya_sharma',
    studentName: 'Priya Sharma',
    studentEmail: 'priya.sharma@campus.edu',
    title: 'AuraGrid — Campus Microgrid Energy Balancer',
    problemStatement:
      'University buildings consume up to 35% excess peak electricity due to unscheduled laboratory machinery and HVAC heating spikes without real-time load prediction.',
    proposedSolution:
      'An IoT edge telemetry gateway combined with an AI-driven predictive dispatch model to shift non-critical equipment cycles to off-peak university solar hours.',
    description:
      'AuraGrid installs non-invasive split-core CT sensors across campus engineering sub-panels. Data streams via MQTT to a central telemetry hub that forecasts peak loads and controls smart relays to pre-cool campus buildings before midday tariff peaks.',
    category: 'CleanTech & Smart Energy',
    targetUsers: 'University Facilities Management, Campus Sustainability Council, Lab Managers',
    expectedImpact: 'Estimated 18-24% reduction in peak campus tariff costs and $45,000 annual carbon credit offsets.',
    requiredTechnologies: ['React', 'TypeScript', 'MQTT', 'MicroPython', 'ESP32', 'Python', 'Tailwind CSS'],
    requiredSkills: ['Electronics', 'AI/ML', 'IoT Sensors', 'Web Development'],
    estimatedBudget: 3500,
    approvedBudget: 3000,
    expectedTimeline: '2 Semesters (Phase 1 Bench Prototype, Phase 2 Engineering Building Pilot)',
    status: 'Approved',
    mentorId: 'mentor_arthur_bennett',
    mentorName: 'Dr. Arthur Bennett',
    createdAt: '2026-09-12T14:30:00.000Z',
    updatedAt: '2026-10-01T09:00:00.000Z',
    aiEvaluationId: 'eval_smart_campus_grid',
  },
  {
    id: 'proj_med_assist_drone',
    studentId: 'student_priya_sharma',
    studentName: 'Priya Sharma',
    studentEmail: 'priya.sharma@campus.edu',
    title: 'PulseRoute — Rapid Campus Automated AED Delivery',
    problemStatement:
      'Sudden cardiac arrest response times on sprawling university campuses average 8.4 minutes, exceeding the critical 4-minute resuscitation window in remote sports fields and dormitories.',
    proposedSolution:
      'Autonomous geofenced quadcopter dispatched concurrently with 911 calls to deliver automated external defibrillators (AED) with real-time video guidance.',
    description:
      'Combines a dual-payload drone chassis with GPS precision docking and a voice-guided interactive CPR instruction tablet attached directly to the defibrillator case.',
    category: 'Healthcare & Assistive Tech',
    targetUsers: 'Campus Safety Officers, Student Athletes, Residence Hall Advisors',
    expectedImpact: 'Cuts AED delivery time from 8.4 minutes to under 2.5 minutes campus-wide.',
    requiredTechnologies: ['ROS2', 'Python', 'React', 'WebRTC', 'Edge AI', 'PX4 Autopilot'],
    requiredSkills: ['Robotics', 'Electronics', 'AI/ML', 'Mobile Dev'],
    estimatedBudget: 4800,
    approvedBudget: 0,
    expectedTimeline: '1.5 Semesters',
    status: 'Under Review',
    createdAt: '2026-10-05T11:20:00.000Z',
    updatedAt: '2026-10-06T15:00:00.000Z',
    aiEvaluationId: 'eval_med_assist_drone',
  },
  {
    id: 'proj_peer_tutor_mesh',
    studentId: 'student_marcus_vance',
    studentName: 'Marcus Vance',
    studentEmail: 'marcus.v@campus.edu',
    title: 'CogniPeer — Offline Bluetooth Mesh Study Collective',
    problemStatement:
      'Commuter and campus library deadzones prevent students from accessing shared code repositories and lecture notes during campus network outages.',
    proposedSolution:
      'Peer-to-peer zero-internet encrypted Bluetooth Low Energy mesh that caches, distributes, and verifies collaborative code reviews and study notes.',
    description:
      'Uses CRDT (Conflict-free Replicated Data Types) over BLE to let students sync Markdown documents, code snippets, and solution rubrics peer-to-peer in study halls.',
    category: 'EdTech & Decentralized Systems',
    targetUsers: 'Undergraduate STEM students, Study groups in campus basement labs',
    expectedImpact: 'Enables uninterrupted peer study for over 1,200 commuter students.',
    requiredTechnologies: ['TypeScript', 'WebBluetooth', 'CRDT', 'Rust', 'Tailwind CSS'],
    requiredSkills: ['Web Development', 'Programming', 'Cryptography'],
    estimatedBudget: 1200,
    approvedBudget: 1200,
    expectedTimeline: '1 Semester',
    status: 'Approved',
    mentorId: 'mentor_arthur_bennett',
    mentorName: 'Dr. Arthur Bennett',
    createdAt: '2026-09-18T16:00:00.000Z',
    updatedAt: '2026-09-25T10:15:00.000Z',
  },
  {
    id: 'proj_bio_sorter',
    studentId: 'student_charlotte_wu',
    studentName: 'Charlotte Wu',
    studentEmail: 'c.wu@campus.edu',
    title: 'SortOptic — AI Optical Recyclable Sorting Bin',
    problemStatement:
      'Over 60% of recyclable dining hall waste is condemned to landfills because of single-stream contamination from soiled liquids and non-recyclable wrappers.',
    proposedSolution:
      'Computer-vision motorized sorting station with weight and moisture sensing that mechanically deposits items into correct compartments and gives instant feedback.',
    description:
      'A smart retrofit lid for standard 55-gallon campus waste bins that utilizes an edge neural network to classify waste in 250 milliseconds with 96% accuracy.',
    category: 'Sustainability & Robotics',
    targetUsers: 'University Dining Services, Student Center Visitors',
    expectedImpact: 'Diverts 14 tons of clean cardboard and plastics annually from regional landfill.',
    requiredTechnologies: ['TensorFlow Lite', 'Python', 'Raspberry Pi', 'Servo Motors', 'React'],
    requiredSkills: ['AI/ML', 'Electronics', 'UI/UX'],
    estimatedBudget: 2200,
    approvedBudget: 0,
    expectedTimeline: '1 Semester',
    status: 'Submitted',
    createdAt: '2026-10-10T08:45:00.000Z',
  },
];

const INITIAL_EVALUATIONS: Record<string, AIEvaluation> = {
  eval_smart_campus_grid: {
    id: 'eval_smart_campus_grid',
    projectId: 'proj_smart_campus_grid',
    overallScore: 89,
    originalityScore: 86,
    feasibilityScore: 92,
    innovationScore: 88,
    impactScore: 94,
    complexityScore: 82,
    scalabilityScore: 90,
    originalityIndicators:
      'Combines non-invasive split-core CT sensing with localized lab equipment scheduling. Highly differentiated from residential smart plugs by addressing commercial laboratory peak draw profiles.',
    feasibilityAnalysis:
      'Exceptionally feasible within collegiate incubation parameters. The required ESP32 and split-core current transducers are commercially available, and facility safety regulations can be met via non-invasive clamping.',
    innovationUsefulness:
      'Directly addresses university utility budget friction while generating actionable telemetry for facilities engineers.',
    impactAnalysis:
      'High campus impact with immediate cost savings and potential integration into undergraduate sustainability capstone curricula.',
    technicalComplexity:
      'Requires low-latency MQTT queue handling, calibration of CT sensors against high-voltage lines, and secure local network isolation.',
    scalabilitySustainability:
      'Modular architecture allows expansion from a single engineering lab to residential halls and university athletic complexes.',
    strengths: [
      'Strong institutional alignment with university net-zero goals',
      'Non-invasive hardware footprint minimizes facilities resistance',
      'Direct, quantifiable ROI through electricity peak-demand tariff reduction',
    ],
    weaknesses: [
      'High-voltage safety certifications required before physical panel installations',
      'Need protocols to ensure critical lab refrigeration is never accidentally throttled',
    ],
    suggestions: [
      'Implement an un-bypassable hardware watchdog circuit for emergency lab circuits',
      'Co-author a pilot memo with the Dean of Engineering and Facilities Director before purchasing volume relays',
      'Build a campus-facing public energy dashboard in the engineering lobby to engage students',
    ],
    recommendedTech: ['ESP32-S3', 'MicroPython', 'Mosquitto MQTT', 'React + Vite', 'Tailwind CSS', 'TimescaleDB / Firestore'],
    requiredTeamSkills: ['Embedded C / MicroPython', 'Full-Stack React', 'Electrical Panel Instrumentation', 'Industrial IoT Protocols'],
    implementationRoadmap: [
      { phase: 'Phase 1: Sensor Calibration', duration: 'Weeks 1-4', focus: 'Bench test split-core CT transducers against resistive heater loads' },
      { phase: 'Phase 2: Sub-panel Pilot', duration: 'Weeks 5-8', focus: 'Install test node in MakerLab with facilities electrician oversight' },
      { phase: 'Phase 3: Scheduling AI Engine', duration: 'Weeks 9-12', focus: 'Deploy dispatch model predicting 24h temperature and lab class schedules' },
      { phase: 'Phase 4: Multi-building Rollout', duration: 'Weeks 13-16', focus: 'Scale to 4 campus facilities and submit final energy audit report' },
    ],
    risksLimitations: [
      'Strict campus facility union agreements may require certified electricians for all sensor placements',
      'Seasonal variation in heating/cooling loads requires 6+ months for comprehensive statistical validation',
    ],
    isDemo: false,
    evaluatedAt: '2026-09-12T15:00:00.000Z',
    disclaimer:
      'Advisory AI-generated evaluation for student and faculty guidance. Final project selection and funding decisions remain under authorized human control.',
  },
  eval_med_assist_drone: {
    id: 'eval_med_assist_drone',
    projectId: 'proj_med_assist_drone',
    overallScore: 84,
    originalityScore: 88,
    feasibilityScore: 78,
    innovationScore: 91,
    impactScore: 95,
    complexityScore: 89,
    scalabilityScore: 80,
    originalityIndicators:
      'Integrates automated rapid drone deployment with interactive tablet video coaching tailored for stressed student bystanders.',
    feasibilityAnalysis:
      'Hardware integration is proven in commercial aerospace, but FAA Part 107 night and over-people waivers represent significant administrative prerequisites on a campus.',
    innovationUsefulness:
      'Game-changing potential to decrease emergency AED transit latency from 8+ minutes to under 2.5 minutes.',
    impactAnalysis:
      'Direct life-saving potential for student athletes, campus marathons, and remote outdoor facilities.',
    technicalComplexity:
      'High complexity: collision avoidance in campus tree canopies, automated landing tether, and fail-safe return-to-home protocols.',
    scalabilitySustainability:
      'Can be replicated across regional university campuses and municipal parks.',
    strengths: [
      'Extraordinary humanitarian impact and emotional pitch resonance',
      'Combines mechanical drone payload design with compassionate UX tablet guidance',
    ],
    weaknesses: [
      'Regulatory compliance (FAA waivers) can delay outdoor flight trials',
      'Weather vulnerabilities during rain, high winds, or freezing winter storms',
    ],
    suggestions: [
      'Begin tests on an enclosed indoor athletic fieldhouse to bypass outdoor FAA constraints',
      'Partner closely with Campus Police and Emergency Medical Services (EMS) from Day 1',
    ],
    recommendedTech: ['PX4 Autopilot', 'ROS2 Humble', 'WebRTC Video Stream', 'React Tablet UI', 'Edge TPU for obstacle detection'],
    requiredTeamSkills: ['Aeronautical / Mechanical Design', 'ROS2 Robotics Engineering', 'Mobile Web / UI UX', 'First Aid / EMS Protocol Consulting'],
    implementationRoadmap: [
      { phase: 'Phase 1: Tether & Drop Mechanism', duration: 'Weeks 1-4', focus: 'Mechanical winch and shock-absorbing AED cradle' },
      { phase: 'Phase 2: Indoor Fieldhouse Flight', duration: 'Weeks 5-8', focus: 'Autonomous waypoint navigation and precision landing beacon' },
      { phase: 'Phase 3: EMS Dispatch Integration', duration: 'Weeks 9-12', focus: 'Automated SMS alert and WebRTC video link to campus dispatch' },
    ],
    risksLimitations: [
      'Outdoor flight strictly contingent upon university risk management approval',
      'Battery thermal limits in winter weather',
    ],
    isDemo: false,
    evaluatedAt: '2026-10-05T12:00:00.000Z',
    disclaimer:
      'Advisory AI-generated evaluation for student and faculty guidance. Final project selection and funding decisions remain under authorized human control.',
  },
};

const INITIAL_COLLABORATORS: UserProfile[] = [
  {
    id: 'user_dev_alex',
    displayName: 'Alexandre Dubois',
    email: 'alex.dubois@campus.edu',
    role: 'student',
    college: 'School of Engineering',
    department: 'Electrical & Computer Engineering',
    year: '4th Year (Senior)',
    skills: ['Electronics', 'Embedded Systems', 'IoT Sensors', 'C++', 'MicroPython'],
    interests: 'Circuit Board Design, LoRaWAN Networks, Edge AI',
    experienceLevel: 'Advanced',
    preferredTechnologies: 'KiCad, STM32, ESP32, MQTT, FreeRTOS',
    collaborationPreferences: 'Looking to join a CleanTech or Robotics hardware project as PCB/firmware lead',
    bio: 'Hardware tinkerer with 3 IEEE student papers and 2 custom PCB fabrication runs.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-09-02T10:00:00.000Z',
  },
  {
    id: 'user_dev_maya',
    displayName: 'Maya Patel',
    email: 'm.patel@campus.edu',
    role: 'student',
    college: 'College of Arts & Sciences',
    department: 'Human-Centered Design & Informatics',
    year: '2nd Year (Sophomore)',
    skills: ['UI/UX', 'Web Development', 'Design Systems', 'Figma', 'React'],
    interests: 'Accessibility, HealthTech Dashboards, Mobile Design',
    experienceLevel: 'Intermediate',
    preferredTechnologies: 'Figma, Tailwind CSS, Next.js, Framer Motion',
    collaborationPreferences: 'Eager to design intuitive user interfaces and pitch decks for student ventures',
    bio: 'Product designer focusing on accessible interactions and clean data visualizations.',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-09-05T12:00:00.000Z',
  },
  {
    id: 'user_dev_tariq',
    displayName: 'Tariq Mansoor',
    email: 't.mansoor@campus.edu',
    role: 'student',
    college: 'Business School',
    department: 'Entrepreneurship & Tech Commercialization',
    year: '3rd Year (Junior)',
    skills: ['Business Planning', 'Pitch Decks', 'Financial Modeling', 'Market Research'],
    interests: 'University Spinouts, Climate Tech, Grant Writing',
    experienceLevel: 'Advanced',
    preferredTechnologies: 'Excel, Notion, Pitch, Market Analytics',
    collaborationPreferences: 'Helping technical teams build budget models, grant proposals, and customer discovery interviews',
    bio: 'President of the Campus Venture Club with experience winning 2 collegiate pitch competitions.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-09-10T14:00:00.000Z',
  },
];

const INITIAL_COLLAB_REQUESTS: CollaborationRequest[] = [
  {
    id: 'req_collab_1',
    projectId: 'proj_smart_campus_grid',
    projectTitle: 'AuraGrid — Campus Microgrid Energy Balancer',
    senderId: 'user_dev_alex',
    senderName: 'Alexandre Dubois',
    senderEmail: 'alex.dubois@campus.edu',
    senderSkills: ['Electronics', 'Embedded Systems', 'IoT Sensors', 'C++'],
    recipientId: 'student_priya_sharma',
    message:
      'Hi Priya! I saw AuraGrid needs an electronics lead for current transducer calibration. I have KiCad experience and 2 custom PCB projects ready for lab testing.',
    status: 'Pending',
    createdAt: '2026-10-11T14:20:00.000Z',
  },
];

const INITIAL_FUNDING_REQUESTS: FundingRequest[] = [
  {
    id: 'fund_auragrid_phase1',
    projectId: 'proj_smart_campus_grid',
    projectTitle: 'AuraGrid — Campus Microgrid Energy Balancer',
    studentId: 'student_priya_sharma',
    studentName: 'Priya Sharma',
    requestedAmount: 3000,
    purpose: 'Hardware component procurement for 8 laboratory sub-panel monitoring nodes and gateway base station.',
    itemizedBudget:
      '1. 24x SCT-013-000 Non-invasive Split Core Current Sensors: $380\n2. 8x ESP32-S3 IoT Development Boards with Enclosures: $240\n3. 1x DIN-rail Gateway Hub with Cellular Backup: $680\n4. Electrical Safety Certified Enclosures & Din Rail Mounts: $450\n5. Licensed Electrician Inspection & Verification Fee: $750\n6. Miscellaneous Wiring, Terminal Blocks & Resistors: $500',
    status: 'Approved',
    approvedAmount: 3000,
    adminNotes: 'Approved in full by Dean Elena Rostova. Certified electrician inspection line item is mandatory.',
    createdAt: '2026-09-20T10:00:00.000Z',
    reviewedAt: '2026-09-22T16:30:00.000Z',
  },
  {
    id: 'fund_meddrone_chassis',
    projectId: 'proj_med_assist_drone',
    projectTitle: 'PulseRoute — Rapid Campus Automated AED Delivery',
    studentId: 'student_priya_sharma',
    studentName: 'Priya Sharma',
    requestedAmount: 2500,
    purpose: 'Heavy-lift carbon fiber drone frame, brushless motors, and quick-release medical payload winch.',
    itemizedBudget:
      '1. Tarot X6 Hexacopter Carbon Fiber Frame: $720\n2. 6x T-Motor Heavy Lift Brushless Motors & ESCs: $840\n3. Pixhawk 6C Autopilot Flight Controller: $420\n4. Dual 6S 16,000mAh Solid State Batteries: $520',
    status: 'Pending',
    createdAt: '2026-10-08T09:15:00.000Z',
  },
];

const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp_01_sensors',
    projectId: 'proj_smart_campus_grid',
    studentId: 'student_priya_sharma',
    description: 'Bulk purchase of 24x SCT-013 split core current transformers from Mouser Electronics',
    amount: 384.5,
    expenseDate: '2026-09-26',
    receiptName: 'mouser_invoice_inv849204.pdf',
    receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
    status: 'Verified',
    reviewerNotes: 'Official Mouser commercial invoice verified against approved budget line item 1.',
    createdAt: '2026-09-27T11:00:00.000Z',
    reviewedAt: '2026-09-28T14:10:00.000Z',
  },
  {
    id: 'exp_02_esp32_boards',
    projectId: 'proj_smart_campus_grid',
    studentId: 'student_priya_sharma',
    description: '8x ESP32-S3 Microcontroller development modules & shielded ribbon cables from Adafruit',
    amount: 236.2,
    expenseDate: '2026-10-02',
    receiptName: 'adafruit_receipt_672910.pdf',
    receiptUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=400&q=80',
    status: 'Verified',
    reviewerNotes: 'Verified matching purchase amount.',
    createdAt: '2026-10-03T10:30:00.000Z',
    reviewedAt: '2026-10-04T09:40:00.000Z',
  },
  {
    id: 'exp_03_gateway',
    projectId: 'proj_smart_campus_grid',
    studentId: 'student_priya_sharma',
    description: 'Industrial DIN-rail IoT gateway with LTE modem & external antenna array',
    amount: 678.0,
    expenseDate: '2026-10-09',
    receiptName: 'digikey_invoice_dk90218.pdf',
    receiptUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=400&q=80',
    status: 'Pending',
    createdAt: '2026-10-10T16:00:00.000Z',
  },
];

const INITIAL_MILESTONES: Milestone[] = [
  {
    id: 'ms_01_bench_calibration',
    projectId: 'proj_smart_campus_grid',
    title: 'Bench Calibration & Sensor Linearity Testing',
    description: 'Hook up 4 split-core CT sensors to variable AC loads in MakerLab to establish calibration curves.',
    assignedMember: 'Priya Sharma & Alex Dubois',
    startDate: '2026-09-15',
    dueDate: '2026-09-30',
    status: 'Completed',
    progressNotes: 'Completed with 0.8% error margin across 5A to 60A test range. Calibration formulas logged in GitHub repo.',
    createdAt: '2026-09-13T10:00:00.000Z',
    updatedAt: '2026-09-29T18:00:00.000Z',
  },
  {
    id: 'ms_02_mqtt_firmware',
    projectId: 'proj_smart_campus_grid',
    title: 'ESP32 MQTT & TLS Telemetry Pipeline',
    description: 'Develop low-power MicroPython firmware to transmit 10-second RMS power averages over TLS to university broker.',
    assignedMember: 'Priya Sharma',
    startDate: '2026-10-01',
    dueDate: '2026-10-18',
    status: 'In Progress',
    progressNotes: 'Firmware functioning on 2 test units; currently optimizing packet batching to reduce WiFi duty cycle.',
    createdAt: '2026-09-13T10:05:00.000Z',
    updatedAt: '2026-10-12T11:20:00.000Z',
  },
  {
    id: 'ms_03_electrician_install',
    projectId: 'proj_smart_campus_grid',
    title: 'Licensed Facilities Electrician Sub-panel Clamping',
    description: 'Schedule campus facilities electrician to install sensor rings inside South Hall electrical distribution closet.',
    assignedMember: 'Dr. Arthur Bennett & Facilities Staff',
    startDate: '2026-10-20',
    dueDate: '2026-10-31',
    status: 'Not Started',
    progressNotes: 'Work order #78291 submitted to facilities. Awaiting confirmation of building maintenance window.',
    createdAt: '2026-09-13T10:10:00.000Z',
  },
  {
    id: 'ms_04_ai_forecast_model',
    projectId: 'proj_smart_campus_grid',
    title: '24-Hour Peak Load Neural Forecast Model',
    description: 'Train recurrent time-series model on past 3 years of campus weather and academic calendar data.',
    assignedMember: 'Priya Sharma',
    startDate: '2026-11-01',
    dueDate: '2026-11-20',
    status: 'Not Started',
    progressNotes: 'Historical CSV data sanitized and imported from campus facilities database.',
    createdAt: '2026-09-13T10:15:00.000Z',
  },
];

const INITIAL_MENTOR_NOTES: MentorNote[] = [
  {
    id: 'mn_01',
    projectId: 'proj_smart_campus_grid',
    mentorId: 'mentor_arthur_bennett',
    mentorName: 'Dr. Arthur Bennett',
    noteType: 'Technical Guidance',
    content:
      'Recommended adding TVS (Transient Voltage Suppressor) diodes across the analog ADC pins on the ESP32 to prevent inductive voltage spikes during heavy equipment switch-off transients.',
    createdAt: '2026-09-24T15:30:00.000Z',
  },
  {
    id: 'mn_02',
    projectId: 'proj_smart_campus_grid',
    mentorId: 'mentor_arthur_bennett',
    mentorName: 'Dr. Arthur Bennett',
    noteType: 'Progress Check',
    content:
      'Checked bench calibration report. Linearity looks excellent between 5A and 60A. Advised team to prepare a 1-page safety briefing for the facilities electrician.',
    createdAt: '2026-10-02T16:00:00.000Z',
  },
];

// In-Memory store with LocalStorage backup
class CampusDataStore {
  private projects: Project[] = [];
  private evaluations: Record<string, AIEvaluation> = {};
  private collaborators: UserProfile[] = [];
  private collabRequests: CollaborationRequest[] = [];
  private fundingRequests: FundingRequest[] = [];
  private expenses: Expense[] = [];
  private milestones: Milestone[] = [];
  private mentorNotes: MentorNote[] = [];
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.isInitialized) return;
    this.projects = this.load('iv_projects', INITIAL_PROJECTS);
    this.evaluations = this.load('iv_evaluations', INITIAL_EVALUATIONS);
    this.collaborators = this.load('iv_collaborators', INITIAL_COLLABORATORS);
    this.collabRequests = this.load('iv_collab_reqs', INITIAL_COLLAB_REQUESTS);
    this.fundingRequests = this.load('iv_funding', INITIAL_FUNDING_REQUESTS);
    this.expenses = this.load('iv_expenses', INITIAL_EXPENSES);
    this.milestones = this.load('iv_milestones', INITIAL_MILESTONES);
    this.mentorNotes = this.load('iv_mentor_notes', INITIAL_MENTOR_NOTES);
    this.isInitialized = true;

    // Async attempt to pull from Firestore to sync
    this.syncFromFirestore();
  }

  private load<T>(key: string, fallback: T): T {
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(`Error reading ${key} from storage:`, e);
    }
    return fallback;
  }

  private save<T>(key: string, data: T) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn(`Error saving ${key} to storage:`, e);
    }
  }

  private async syncFromFirestore() {
    try {
      const projSnap = await getDocs(collection(db, 'projects'));
      if (!projSnap.empty) {
        const firestoreProjects: Project[] = [];
        projSnap.forEach((d) => firestoreProjects.push(d.data() as Project));
        this.projects = firestoreProjects;
        this.save('iv_projects', this.projects);
      }
    } catch {
      // Offline or permissions notice is fine, local state preserves app experience
    }
  }

  // PROJECTS
  public getProjects(): Project[] {
    return [...this.projects];
  }

  public getProjectById(id: string): Project | undefined {
    return this.projects.find((p) => p.id === id);
  }

  public async createProject(project: Omit<Project, 'id' | 'createdAt' | 'status'>): Promise<Project> {
    const id = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newProject: Project = {
      ...project,
      id,
      status: 'Submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.projects = [newProject, ...this.projects];
    this.save('iv_projects', this.projects);

    try {
      await setDoc(doc(db, 'projects', id), newProject);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `projects/${id}`);
    }

    return newProject;
  }

  public async updateProjectStatus(
    projectId: string,
    status: Project['status'],
    reviewerId: string,
    reviewerName: string,
    comments?: string
  ): Promise<Project | null> {
    const index = this.projects.findIndex((p) => p.id === projectId);
    if (index === -1) return null;

    const updated = {
      ...this.projects[index],
      status,
      updatedAt: new Date().toISOString(),
    };
    this.projects[index] = updated;
    this.save('iv_projects', this.projects);

    try {
      await updateDoc(doc(db, 'projects', projectId), {
        status,
        updatedAt: updated.updatedAt,
      });
      // Also log review decision
      if (comments) {
        const revId = `rev_${Date.now()}`;
        await setDoc(doc(db, 'projectReviews', revId), {
          id: revId,
          projectId,
          reviewerId,
          reviewerName,
          decision: status,
          comments,
          reviewedAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `projects/${projectId}`);
    }

    return updated;
  }

  public async assignMentor(projectId: string, mentorId: string, mentorName: string): Promise<Project | null> {
    const index = this.projects.findIndex((p) => p.id === projectId);
    if (index === -1) return null;

    const updated = {
      ...this.projects[index],
      mentorId,
      mentorName,
      updatedAt: new Date().toISOString(),
    };
    this.projects[index] = updated;
    this.save('iv_projects', this.projects);

    try {
      await updateDoc(doc(db, 'projects', projectId), {
        mentorId,
        mentorName,
        updatedAt: updated.updatedAt,
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `projects/${projectId}`);
    }

    return updated;
  }

  public async setApprovedBudget(projectId: string, amount: number): Promise<void> {
    const index = this.projects.findIndex((p) => p.id === projectId);
    if (index !== -1) {
      this.projects[index].approvedBudget = amount;
      this.save('iv_projects', this.projects);
      try {
        await updateDoc(doc(db, 'projects', projectId), { approvedBudget: amount });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `projects/${projectId}`);
      }
    }
  }

  // EVALUATIONS
  public getEvaluation(projectId: string): AIEvaluation | undefined {
    return this.evaluations[projectId] || Object.values(this.evaluations).find((e) => e.projectId === projectId);
  }

  public async saveEvaluation(evaluation: AIEvaluation): Promise<void> {
    this.evaluations[evaluation.projectId] = evaluation;
    this.save('iv_evaluations', this.evaluations);

    // Link evaluation ID to project
    const projIndex = this.projects.findIndex((p) => p.id === evaluation.projectId);
    if (projIndex !== -1) {
      this.projects[projIndex].aiEvaluationId = evaluation.id;
      this.save('iv_projects', this.projects);
    }

    try {
      await setDoc(doc(db, 'aiEvaluations', evaluation.id), evaluation);
      if (projIndex !== -1) {
        await updateDoc(doc(db, 'projects', evaluation.projectId), {
          aiEvaluationId: evaluation.id,
        });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `aiEvaluations/${evaluation.id}`);
    }
  }

  // COLLABORATORS
  public getDiscoverableCollaborators(): UserProfile[] {
    return [...this.collaborators];
  }

  public async registerCollaborator(profile: UserProfile): Promise<void> {
    const existing = this.collaborators.findIndex((c) => c.id === profile.id);
    if (existing >= 0) {
      this.collaborators[existing] = profile;
    } else {
      this.collaborators.push(profile);
    }
    this.save('iv_collaborators', this.collaborators);
  }

  public getCollaborationRequests(userId?: string): CollaborationRequest[] {
    if (!userId) return [...this.collabRequests];
    return this.collabRequests.filter((r) => r.senderId === userId || r.recipientId === userId);
  }

  public async sendCollaborationRequest(
    req: Omit<CollaborationRequest, 'id' | 'createdAt' | 'status'>
  ): Promise<CollaborationRequest> {
    const id = `collab_${Date.now()}`;
    const newReq: CollaborationRequest = {
      ...req,
      id,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    this.collabRequests = [newReq, ...this.collabRequests];
    this.save('iv_collab_reqs', this.collabRequests);

    try {
      await setDoc(doc(db, 'collaborationRequests', id), newReq);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `collaborationRequests/${id}`);
    }

    return newReq;
  }

  public async updateCollaborationStatus(requestId: string, status: 'Accepted' | 'Rejected'): Promise<void> {
    const index = this.collabRequests.findIndex((r) => r.id === requestId);
    if (index !== -1) {
      this.collabRequests[index].status = status;
      this.save('iv_collab_reqs', this.collabRequests);
      try {
        await updateDoc(doc(db, 'collaborationRequests', requestId), { status });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `collaborationRequests/${requestId}`);
      }
    }
  }

  // FUNDING
  public getFundingRequests(projectId?: string): FundingRequest[] {
    if (!projectId) return [...this.fundingRequests];
    return this.fundingRequests.filter((f) => f.projectId === projectId);
  }

  public async submitFundingRequest(req: Omit<FundingRequest, 'id' | 'createdAt' | 'status'>): Promise<FundingRequest> {
    const id = `fund_${Date.now()}`;
    const newReq: FundingRequest = {
      ...req,
      id,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    this.fundingRequests = [newReq, ...this.fundingRequests];
    this.save('iv_funding', this.fundingRequests);

    try {
      await setDoc(doc(db, 'fundingRequests', id), newReq);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `fundingRequests/${id}`);
    }

    return newReq;
  }

  public async updateFundingStatus(
    requestId: string,
    status: 'Approved' | 'Rejected',
    approvedAmount?: number,
    adminNotes?: string
  ): Promise<FundingRequest | null> {
    const index = this.fundingRequests.findIndex((f) => f.id === requestId);
    if (index === -1) return null;

    const req = this.fundingRequests[index];
    const updated: FundingRequest = {
      ...req,
      status,
      approvedAmount: status === 'Approved' ? approvedAmount ?? req.requestedAmount : 0,
      adminNotes,
      reviewedAt: new Date().toISOString(),
    };
    this.fundingRequests[index] = updated;
    this.save('iv_funding', this.fundingRequests);

    if (status === 'Approved' && updated.approvedAmount) {
      await this.setApprovedBudget(req.projectId, updated.approvedAmount);
    }

    try {
      await updateDoc(doc(db, 'fundingRequests', requestId), {
        status,
        approvedAmount: updated.approvedAmount,
        adminNotes: adminNotes || '',
        reviewedAt: updated.reviewedAt,
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `fundingRequests/${requestId}`);
    }

    return updated;
  }

  // EXPENSES
  public getExpenses(projectId?: string): Expense[] {
    if (!projectId) return [...this.expenses];
    return this.expenses.filter((e) => e.projectId === projectId);
  }

  public async submitExpense(exp: Omit<Expense, 'id' | 'createdAt' | 'status'>): Promise<Expense> {
    const id = `exp_${Date.now()}`;
    const newExp: Expense = {
      ...exp,
      id,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    this.expenses = [newExp, ...this.expenses];
    this.save('iv_expenses', this.expenses);

    try {
      await setDoc(doc(db, 'expenses', id), newExp);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `expenses/${id}`);
    }

    return newExp;
  }

  public async updateExpenseStatus(
    expenseId: string,
    status: 'Verified' | 'Rejected',
    reviewerNotes?: string
  ): Promise<Expense | null> {
    const index = this.expenses.findIndex((e) => e.id === expenseId);
    if (index === -1) return null;

    const updated: Expense = {
      ...this.expenses[index],
      status,
      reviewerNotes,
      reviewedAt: new Date().toISOString(),
    };
    this.expenses[index] = updated;
    this.save('iv_expenses', this.expenses);

    try {
      await updateDoc(doc(db, 'expenses', expenseId), {
        status,
        reviewerNotes: reviewerNotes || '',
        reviewedAt: updated.reviewedAt,
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `expenses/${expenseId}`);
    }

    return updated;
  }

  // MILESTONES
  public getMilestones(projectId: string): Milestone[] {
    return this.milestones.filter((m) => m.projectId === projectId);
  }

  public getAllMilestones(): Milestone[] {
    return [...this.milestones];
  }

  public async createMilestone(milestone: Omit<Milestone, 'id' | 'createdAt'>): Promise<Milestone> {
    const id = `ms_${Date.now()}`;
    const newMilestone: Milestone = {
      ...milestone,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.milestones = [...this.milestones, newMilestone];
    this.save('iv_milestones', this.milestones);

    try {
      await setDoc(doc(db, 'milestones', id), newMilestone);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `milestones/${id}`);
    }

    return newMilestone;
  }

  public async updateMilestoneStatus(
    milestoneId: string,
    status: Milestone['status'],
    progressNotes?: string
  ): Promise<Milestone | null> {
    const index = this.milestones.findIndex((m) => m.id === milestoneId);
    if (index === -1) return null;

    const updated: Milestone = {
      ...this.milestones[index],
      status,
      progressNotes: progressNotes !== undefined ? progressNotes : this.milestones[index].progressNotes,
      updatedAt: new Date().toISOString(),
    };
    this.milestones[index] = updated;
    this.save('iv_milestones', this.milestones);

    try {
      await updateDoc(doc(db, 'milestones', milestoneId), {
        status,
        progressNotes: updated.progressNotes || '',
        updatedAt: updated.updatedAt,
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `milestones/${milestoneId}`);
    }

    return updated;
  }

  // MENTOR NOTES
  public getMentorNotes(projectId: string): MentorNote[] {
    return this.mentorNotes.filter((n) => n.projectId === projectId);
  }

  public async addMentorNote(note: Omit<MentorNote, 'id' | 'createdAt'>): Promise<MentorNote> {
    const id = `note_${Date.now()}`;
    const newNote: MentorNote = {
      ...note,
      id,
      createdAt: new Date().toISOString(),
    };
    this.mentorNotes = [newNote, ...this.mentorNotes];
    this.save('iv_mentor_notes', this.mentorNotes);

    try {
      await setDoc(doc(db, 'mentorNotes', id), newNote);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `mentorNotes/${id}`);
    }

    return newNote;
  }
}

export const campusData = new CampusDataStore();
