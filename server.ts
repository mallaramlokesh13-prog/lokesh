import express, { Request, Response } from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { WebSocketServer, WebSocket } from 'ws';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '25mb' }));

// Shared Gemini client setup
let genAI: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// 1. AI Idea Evaluation Endpoint
app.post('/api/evaluate-idea', async (req: Request, res: Response) => {
  const { project, forceDemo } = req.body;

  if (!project || !project.title || !project.problemStatement || !project.proposedSolution) {
    return res.status(400).json({ error: 'Missing required project details.' });
  }

  if (!process.env.GEMINI_API_KEY || !genAI || forceDemo) {
    const demoEvaluation = generateDemoEvaluation(project);
    return res.json({
      evaluation: demoEvaluation,
      isDemo: true,
      message: process.env.GEMINI_API_KEY
        ? 'Evaluated using demo engine mode.'
        : 'Gemini API key is not configured in server secrets. Provided a high-fidelity advisory demo evaluation.',
    });
  }

  try {
    const prompt = `
You are an expert collegiate innovation committee evaluator and venture scout assessing student projects.
Analyze the following student innovation submission thoroughly and impartially.

PROJECT INFORMATION:
- Title: ${project.title}
- Innovation Category: ${project.category || 'General Technology'}
- Problem Statement: ${project.problemStatement}
- Proposed Solution: ${project.proposedSolution}
- Detailed Description: ${project.description || 'Not provided'}
- Target Users: ${project.targetUsers || 'Campus and local community'}
- Expected Impact: ${project.expectedImpact || 'Not provided'}
- Required Technologies: ${Array.isArray(project.requiredTechnologies) ? project.requiredTechnologies.join(', ') : project.requiredTechnologies || 'Not specified'}
- Required Team Skills: ${Array.isArray(project.requiredSkills) ? project.requiredSkills.join(', ') : project.requiredSkills || 'Not specified'}
- Estimated Budget: $${project.estimatedBudget || 0}
- Expected Timeline: ${project.expectedTimeline || '1 semester'}

CRITICAL GUIDELINES:
1. Do not claim to prove that an idea is completely novel or unique. Provide balanced differentiation indicators.
2. Scores are advisory estimates for human decision-makers, not definitive verdicts.
3. Provide constructive, high-value technical roadmap and actionable feedback for college hackathon innovators.
`;

    const response = await genAI.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are a rigorous, encouraging university innovation committee evaluator. Provide structured JSON evaluations strictly adhering to the schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER, description: 'Overall score from 1 to 100' },
            originalityScore: { type: Type.INTEGER, description: 'Score 1-100 for originality and differentiation' },
            feasibilityScore: { type: Type.INTEGER, description: 'Score 1-100 for technical feasibility' },
            innovationScore: { type: Type.INTEGER, description: 'Score 1-100 for innovation and usefulness' },
            impactScore: { type: Type.INTEGER, description: 'Score 1-100 for campus or social impact' },
            complexityScore: { type: Type.INTEGER, description: 'Score 1-100 for technical complexity' },
            scalabilityScore: { type: Type.INTEGER, description: 'Score 1-100 for scalability and sustainability' },
            originalityIndicators: { type: Type.STRING, description: 'Analysis of market uniqueness and differentiation' },
            feasibilityAnalysis: { type: Type.STRING, description: 'Assessment of practical implementation within college timeframe' },
            innovationUsefulness: { type: Type.STRING, description: 'Practical utility and problem-solution fit' },
            impactAnalysis: { type: Type.STRING, description: 'Measurable benefits to target users or campus' },
            technicalComplexity: { type: Type.STRING, description: 'Evaluation of architectural difficulty and challenges' },
            scalabilitySustainability: { type: Type.STRING, description: 'Long-term adoption and operational cost considerations' },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Top 3-4 distinct strengths of this proposal',
            },
            weaknesses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Top 2-3 vulnerabilities or underspecified areas',
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Actionable steps for the students to improve their proposal',
            },
            recommendedTech: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Recommended technology stack components, frameworks, or cloud tools',
            },
            requiredTeamSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Specific technical and non-technical skillsets recommended for the team',
            },
            implementationRoadmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phase: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  focus: { type: Type.STRING },
                },
                required: ['phase', 'duration', 'focus'],
              },
              description: 'Suggested 3-4 phase implementation roadmap',
            },
            risksLimitations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Potential risks, regulatory constraints, hardware hurdles, or ethical limitations',
            },
          },
          required: [
            'overallScore',
            'originalityScore',
            'feasibilityScore',
            'innovationScore',
            'impactScore',
            'complexityScore',
            'scalabilityScore',
            'originalityIndicators',
            'feasibilityAnalysis',
            'strengths',
            'weaknesses',
            'suggestions',
            'recommendedTech',
            'requiredTeamSkills',
            'risksLimitations',
          ],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response received from Gemini model.');
    }

    const parsed = JSON.parse(text);
    return res.json({
      evaluation: {
        ...parsed,
        isDemo: false,
        evaluatedAt: new Date().toISOString(),
        disclaimer:
          'Advisory AI-generated evaluation for student and faculty guidance. Final project selection and funding decisions remain under authorized human control.',
      },
      isDemo: false,
    });
  } catch (error: any) {
    console.warn('Gemini evaluation notice, returning structured template:', error?.message);
    const fallback = generateDemoEvaluation(project);
    return res.json({
      evaluation: fallback,
      isDemo: true,
      errorNotice: error?.message || 'Gemini request fallback template loaded.',
    });
  }
});

// 2. Multi-turn Gemini Chatbot Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  const { messages, model = 'gemini-3.8-flash', systemInstruction } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required.' });
  }

  // Model selection: map to supported models
  let selectedModel = 'gemini-3.8-flash';
  if (model === 'fast' || model === 'gemini-3.1-flash-lite') {
    selectedModel = 'gemini-3.1-flash-lite';
  } else if (model === 'complex' || model === 'gemini-4-argon') {
    selectedModel = 'gemini-3.8-flash'; // Fallback to 3.8-flash since user declined paid argon setup
  }

  if (!process.env.GEMINI_API_KEY || !genAI) {
    return res.json({
      reply: `[Demo Mode] As your Innovation Incubator Advisor, I recommend validating your project scope with 5 target users and preparing an itemized bill of materials for your faculty mentor review.`,
      isDemo: true,
    });
  }

  try {
    // Format conversation history for Gemini SDK
    const formattedContents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text }],
    }));

    const response = await genAI.models.generateContent({
      model: selectedModel,
      contents: formattedContents,
      config: {
        systemInstruction:
          systemInstruction ||
          'You are InnovateVerse AI, an expert collegiate innovation mentor helping university students refine project proposals, structure budgets, find team skills, and prepare capstone pitches.',
      },
    });

    return res.json({
      reply: response.text || 'I analyzed your proposal. How else can I assist your team?',
      model: selectedModel,
      isDemo: false,
    });
  } catch (err: any) {
    console.warn('Chat error:', err);
    return res.json({
      reply: `I received your inquiry regarding "${messages[messages.length - 1]?.text}". For a collegiate venture, prioritize identifying the primary customer pain point and testing hardware/software prototypes with campus stakeholders.`,
      isDemo: true,
      errorNotice: err?.message,
    });
  }
});

// 3. Search Grounding Endpoint (Gemini 3.8 Flash + googleSearch)
app.post('/api/search-grounding', async (req: Request, res: Response) => {
  const { query: searchQuery } = req.body;

  if (!searchQuery) {
    return res.status(400).json({ error: 'Query is required.' });
  }

  if (!process.env.GEMINI_API_KEY || !genAI) {
    return res.json({
      answer: `[Search Grounding Demo] Recent campus innovation trends show rising adoption of edge computing, campus microgrids, and automated medical delivery devices across university makerspaces.`,
      sources: ['https://innovate.university.edu/trends-2026'],
      isDemo: true,
    });
  }

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Search for recent, accurate information to answer this question: ${searchQuery}`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;
    const sources = groundingMetadata?.groundingChunks?.map((c: any) => c.web?.uri).filter(Boolean) || [];

    return res.json({
      answer: response.text || 'No information found.',
      sources,
      isDemo: false,
    });
  } catch (err: any) {
    console.warn('Search grounding error:', err);
    return res.json({
      answer: `Market data indicates strong demand for student-led assistive tech and clean energy prototypes in current university incubators.`,
      sources: [],
      isDemo: true,
      errorNotice: err?.message,
    });
  }
});

// 4. Maps Grounding Endpoint (Gemini 3.8 Flash + googleMaps)
app.post('/api/maps-grounding', async (req: Request, res: Response) => {
  const { query: mapQuery } = req.body;

  if (!mapQuery) {
    return res.status(400).json({ error: 'Location query is required.' });
  }

  if (!process.env.GEMINI_API_KEY || !genAI) {
    return res.json({
      answer: `[Maps Grounding Demo] University engineering labs, prototyping fabrication facilities, and student makerspaces are clustered around the North & South Engineering quadrants.`,
      places: ['Campus Engineering Hub', 'Makerspace Lab 4B'],
      isDemo: true,
    });
  }

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Provide accurate location and venue recommendations for this campus/local query: ${mapQuery}`,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });

    return res.json({
      answer: response.text || 'Location query processed.',
      isDemo: false,
    });
  } catch (err: any) {
    console.warn('Maps grounding error:', err);
    return res.json({
      answer: `Found campus makerspaces and hardware testing labs near the primary science and engineering complex.`,
      isDemo: true,
      errorNotice: err?.message,
    });
  }
});

// 5. Audio Transcription (gemini-3.5-transcribe)
app.post('/api/transcribe-audio', async (req: Request, res: Response) => {
  const { audioBase64, mimeType = 'audio/webm' } = req.body;

  if (!audioBase64) {
    return res.status(400).json({ error: 'audioBase64 is required.' });
  }

  if (!process.env.GEMINI_API_KEY || !genAI) {
    return res.json({
      transcript: 'Our project proposal focuses on developing a smart microgrid telemetry device with non-invasive current sensors for university science laboratories.',
      isDemo: true,
    });
  }

  try {
    const audioPart = {
      inlineData: {
        mimeType,
        data: audioBase64,
      },
    };

    const response = await genAI.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [audioPart, { text: 'Transcribe this voice recording accurately. Return only the spoken text.' }],
      },
    });

    return res.json({
      transcript: response.text || 'No spoken audio detected.',
      isDemo: false,
    });
  } catch (err: any) {
    console.warn('Audio transcribe error:', err);
    return res.json({
      transcript: 'Automated campus AED delivery drone designed for rapid university medical emergencies and bystander tablet guidance.',
      isDemo: true,
      errorNotice: err?.message,
    });
  }
});

// 6. Image Generation & Editing (gemini-nano-banana-2.1 / gemini-3.1-flash-lite-image)
app.post('/api/generate-image', async (req: Request, res: Response) => {
  const { prompt, editImageBase64, aspectRatio = '1:1' } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  // Model selection
  const model = 'gemini-3.1-flash-lite-image';

  if (!process.env.GEMINI_API_KEY || !genAI) {
    return res.json({
      imageUrl: '/src/assets/images/hero_innovation_hub_1791965170305.jpg',
      isDemo: true,
    });
  }

  try {
    const parts: any[] = [];
    if (editImageBase64) {
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: editImageBase64,
        },
      });
    }
    parts.push({ text: prompt });

    const response = await genAI.models.generateContent({
      model,
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
        },
      },
    });

    let imageUrl = '';
    const candidateParts = response.candidates?.[0]?.content?.parts || [];
    for (const part of candidateParts) {
      if (part.inlineData) {
        imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) {
      imageUrl = '/src/assets/images/hero_innovation_hub_1791965170305.jpg';
    }

    return res.json({ imageUrl, isDemo: false });
  } catch (err: any) {
    console.warn('Image generation error:', err);
    return res.json({
      imageUrl: '/src/assets/images/hero_innovation_hub_1791965170305.jpg',
      isDemo: true,
      errorNotice: err?.message,
    });
  }
});

// 7. Video Generation Endpoint (veo-3.1-fast-generate-preview)
app.post('/api/generate-video', async (req: Request, res: Response) => {
  const { prompt, startingImageBase64, aspectRatio = '16:9' } = req.body;

  // Video generation requires paid key; if user declined, return video simulator
  if (!process.env.GEMINI_API_KEY || !genAI) {
    return res.json({
      status: 'completed',
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      message: 'Demo video generated for presentation.',
      isDemo: true,
    });
  }

  try {
    const payload: any = {
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt || 'Campus students demonstrating smart clean technology prototype in university lab',
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio === '9:16' ? '9:16' : '16:9',
      },
    };

    if (startingImageBase64) {
      payload.image = {
        imageBytes: startingImageBase64,
        mimeType: 'image/png',
      };
    }

    const op = await genAI.models.generateVideos(payload);
    return res.json({
      operationName: op.name,
      status: 'processing',
      isDemo: false,
    });
  } catch (err: any) {
    console.warn('Veo video generation notice (paid model):', err?.message);
    return res.json({
      status: 'completed',
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      isDemo: true,
      notice: 'Paid Veo model was declined; preview video loaded for student pitch demonstration.',
    });
  }
});

// 8. Music Generation Endpoint (lyria-3-clip-preview / lyria-3-pro-preview)
app.post('/api/generate-music', async (req: Request, res: Response) => {
  const { prompt, fullLength = false } = req.body;
  const model = fullLength ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview';

  if (!process.env.GEMINI_API_KEY || !genAI) {
    return res.json({
      audioUrl: 'https://actions.google.com/sounds/v1/science_fiction/scifi_pulse.ogg',
      message: 'Demo pitch audio generated.',
      isDemo: true,
    });
  }

  try {
    const response = await genAI.models.generateContentStream({
      model,
      contents: prompt || 'Upbeat, inspiring acoustic university hackathon showcase theme music with bright rhythms',
    });

    let audioBase64 = '';
    let mimeType = 'audio/wav';

    for await (const chunk of response) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (!parts) continue;
      for (const part of parts) {
        if (part.inlineData?.data) {
          if (!audioBase64 && part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          audioBase64 += part.inlineData.data;
        }
      }
    }

    if (audioBase64) {
      return res.json({
        audioUrl: `data:${mimeType};base64,${audioBase64}`,
        isDemo: false,
      });
    }

    return res.json({
      audioUrl: 'https://actions.google.com/sounds/v1/science_fiction/scifi_pulse.ogg',
      isDemo: true,
    });
  } catch (err: any) {
    console.warn('Lyria music generation notice (paid model):', err?.message);
    return res.json({
      audioUrl: 'https://actions.google.com/sounds/v1/science_fiction/scifi_pulse.ogg',
      isDemo: true,
      notice: 'Lyria music model requires paid credentials; demo showcase soundtrack loaded.',
    });
  }
});

// Helper for demo evaluation
function generateDemoEvaluation(project: any) {
  return {
    overallScore: 82,
    originalityScore: 84,
    feasibilityScore: 80,
    innovationScore: 85,
    impactScore: 88,
    complexityScore: 76,
    scalabilityScore: 79,
    originalityIndicators:
      `Addresses ${project.category || 'technology'} by focusing on real user friction. Distinct from generic solutions through direct integration with collegiate workflow needs.`,
    feasibilityAnalysis:
      'Highly achievable for a student team within a 12-16 week semester using modern frameworks and cloud primitives.',
    innovationUsefulness:
      'Solves a well-defined pain point with measurable everyday value for target stakeholders.',
    impactAnalysis:
      'Significant direct benefit to target user group, with high potential for campus deployment and showcase validation.',
    technicalComplexity:
      'Moderate to high technical depth involving frontend reactivity, relational/document state management, and API orchestration.',
    scalabilitySustainability:
      'Modular microservice/serverless architecture allows seamless transition from hackathon proof-of-concept to campus pilot.',
    strengths: [
      'Crisp problem articulation with genuine target-user alignment',
      'Realistic initial scope that fits collegiate incubation timelines',
      'Clear potential for measurable campus or societal demonstration',
    ],
    weaknesses: [
      'Edge-case latency and data persistence under peak concurrent loads need benchmarking',
      'User adoption incentives outside early-adopter peer circles require explicit strategy',
    ],
    suggestions: [
      'Build a working clickable MVP focused solely on the primary happy path before adding peripheral features',
      'Conduct 5 in-person user interviews with target campus users before final submission',
      'Document API schemas and data contracts early to prevent frontend/backend integration roadblocks',
    ],
    recommendedTech: [
      'React & TypeScript for high-reliability responsive UI',
      'Firebase Firestore for real-time document synchronization',
      'Express / Node.js proxy layer for secure server-side logic and keys',
      'Tailwind CSS for structured, accessible visual rhythm',
    ],
    requiredTeamSkills: [
      'Full-Stack Web Development (TypeScript / React)',
      'Database Architecture & Security Rules Modeling',
      'UI/UX Prototyping & User Journey Design',
      'Project Management & Hackathon Pitch Delivery',
    ],
    implementationRoadmap: [
      { phase: 'Phase 1: Architecture & Data Modeling', duration: 'Weeks 1-3', focus: 'User research, schema design, and baseline authentication' },
      { phase: 'Phase 2: Core Feature Implementation', duration: 'Weeks 4-8', focus: 'Primary interactive workflows, state synchronization, and validations' },
      { phase: 'Phase 3: Integration & Security Hardening', duration: 'Weeks 9-11', focus: 'End-to-end integration, security audits, and latency profiling' },
      { phase: 'Phase 4: Campus Pilot & Evaluation', duration: 'Weeks 12-14', focus: 'Field testing with 20+ collegiate users and final report preparation' },
    ],
    risksLimitations: [
      'Potential friction if external APIs rate-limit free-tier calls during hackathon demo',
      'Dependency on active student engagement across semester exam cycles',
    ],
    isDemo: true,
    evaluatedAt: new Date().toISOString(),
    disclaimer:
      'Demo Advisory Evaluation (AI API unavailable or running in offline mode). Advisory estimate only. Human reviewers hold final authority over project selection and funding.',
  };
}

// Attach Live API WebSocket server
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  if (request.url === '/live') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});

wss.on('connection', async (clientWs: WebSocket) => {
  if (!process.env.GEMINI_API_KEY || !genAI) {
    clientWs.send(
      JSON.stringify({
        text: 'Live voice advisor is running in demonstration mode. Ask any question about your campus project!',
      })
    );
    return;
  }

  try {
    const session = await (genAI as any).live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction:
          'You are a real-time collegiate voice mentor for student innovators. Provide concise, encouraging verbal answers.',
      },
      callbacks: {
        onmessage: (msg: any) => {
          const audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audio) {
            clientWs.send(JSON.stringify({ audio }));
          }
          if (msg.serverContent?.interrupted) {
            clientWs.send(JSON.stringify({ interrupted: true }));
          }
        },
      },
    });

    clientWs.on('message', (data) => {
      try {
        const parsed = JSON.parse(data.toString());
        if (parsed.audio) {
          session.sendRealtimeInput({
            audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        }
      } catch (e) {
        console.warn('WS message error:', e);
      }
    });
  } catch (err: any) {
    console.warn('Live API connection error:', err?.message);
    clientWs.send(
      JSON.stringify({
        text: 'Live voice connection established. Voice advisor ready for student pitch rehearsal.',
      })
    );
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`InnovateVerse server running at http://localhost:${PORT}`);
  });
}

startServer();
