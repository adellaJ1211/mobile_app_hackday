require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { runContentBriefPipeline, runCompetitorInvestigation } = require('./pipeline');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.SERVER_PORT || 3001;

// In-memory workflow store
const workflows = new Map();

const STEP_LABELS_MAP = {
  'content-brief': ['Scan top-cited sources for content gaps', 'Reading competitor content pages', 'Analyse content with AI', 'Generate content brief'],
  'competitive-analysis': ['Identify competitor content driving displacement', 'Reading competitor content pages', 'Analyse competitive positioning', 'Generate threat assessment'],
  'investigation': ['Identify who controls your brand narrative', 'Reading third-party content pages', 'Analyse how your brand is framed', 'Generate investigation report'],
  'report': ['Audit your current content strength', 'Scan for emerging competitive threats', 'Analyse position durability', 'Generate defence plan'],
  'competitor-investigation': ['Identify competitors gaining auction share', 'Reading competitor landing pages', 'Analyse competitor offers and positioning', 'Generate competitive response plan'],
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', workflows: workflows.size });
});

app.post('/api/workflow/start', (req, res) => {
  const { prompt, topSources, competitorUrls, competitorGainers, ppcMetrics, insightType, brand } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  const workflowId = `wf-${Date.now()}`;
  const isPPC = insightType === 'competitor-investigation';
  const labels = STEP_LABELS_MAP[insightType] || STEP_LABELS_MAP['content-brief'];

  const state = {
    id: workflowId,
    status: 'running',
    currentStep: 0,
    steps: labels.map((label) => ({
      label,
      status: 'pending',
      completedAt: null,
      detail: null,
    })),
    deliverable: null,
    result: null,
    startedAt: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    completedAt: null,
    error: null,
  };

  workflows.set(workflowId, state);

  const sources = competitorUrls || topSources || [];
  console.log(`\n${'='.repeat(60)}`);
  console.log(`[server] Starting workflow ${workflowId}`);
  console.log(`[server] Type: ${insightType || 'content-brief'}`);
  console.log(`[server] Prompt: "${prompt}"`);
  console.log(`[server] Sources: ${sources.map((s) => s.domain).join(', ')}`);
  console.log(`${'='.repeat(60)}`);

  // Route to the correct pipeline
  const pipeline = isPPC
    ? runCompetitorInvestigation(state, { prompt, competitorUrls, competitorGainers, ppcMetrics, brand: brand || 'Capital One' })
    : runContentBriefPipeline(state, { prompt, topSources, competitorUrls, insightType: insightType || 'content-brief', brand: brand || 'Capital One' });

  pipeline.catch((err) => {
    console.error(`[server] Pipeline error:`, err);
    state.status = 'error';
    state.error = err.message;
  });

  res.json({ workflowId });
});

app.get('/api/workflow/:id/status', (req, res) => {
  const state = workflows.get(req.params.id);
  if (!state) {
    return res.status(404).json({ error: 'Workflow not found' });
  }
  res.json(state);
});

app.listen(PORT, () => {
  console.log(`\n🚀 Content brief pipeline server running on http://localhost:${PORT}`);
  console.log(`   Oxylabs user: ${process.env.OXYLABS_USERNAME || '⚠️  NOT SET'}`);
  console.log(`   Gemini model: ${process.env.GEMINI_MODEL || 'default'}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
