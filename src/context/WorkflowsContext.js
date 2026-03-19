import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { startPipeline, pollStatus } from '../api/pipelineClient';

const WorkflowsContext = createContext();

const stepLabels = {
  'content-brief': [
    'Scan top-cited sources for content gaps',
    'Reading competitor content pages',
    'Analyse content with AI',
    'Generate content brief',
  ],
  'investigation': [
    'Identify who controls your brand narrative',
    'Reading third-party content pages',
    'Analyse how your brand is framed',
    'Generate investigation report',
  ],
  'competitive-analysis': [
    'Identify competitor content driving displacement',
    'Reading competitor content pages',
    'Analyse competitive positioning',
    'Generate threat assessment',
  ],
  'bid-adjustment': [
    'Pulling auction-level performance data',
    'Modelling bid adjustment scenarios',
    'Calculating ROI impact projections',
    'Preparing bid change recommendations',
  ],
  'competitor-investigation': [
    'Identify competitors gaining auction share',
    'Reading competitor landing pages',
    'Analyse competitor offers and positioning',
    'Generate competitive response plan',
  ],
  'report': [
    'Audit your current content strength',
    'Scan for emerging competitive threats',
    'Analyse position durability',
    'Generating status report content',
  ],
};

const defaultSteps = [
  'Analysing insight data',
  'Reviewing relevant sources',
  'Generating recommendations',
  'Preparing output for review',
];

const agentResults = {
  'content-brief': 'Content brief generated with targeted recommendations. Identified 4 content gaps where competitors are being cited by LLMs. Draft includes proposed topics, recommended source page improvements, and entity markup suggestions.',
  'investigation': 'Investigation complete. Traced source attribution patterns across 15 LLM responses. Identified 3 key competitor content pages driving their mentions. Recommended actions prioritised by estimated impact on citation rate.',
  'competitive-analysis': 'Competitive analysis mapped positioning across all tracked prompts. Primary competitor advantage: fresher content (avg. 23 days vs your 67 days), stronger structured data, and more specific product-level pages being cited.',
  'bid-adjustment': 'Bid adjustment analysis complete. Modelled 3 scenarios across affected campaigns. Recommended option: redistribute 15% of underperforming campaign budget to maintain ROAS target. Estimated weekly profit improvement: \u00A32.1k.',
  'report': 'Status slide updated with this week\'s performance data. Key highlights added: mention rate trend, competitive positioning shift, and source attribution changes. Ready to add to your weekly deck.',
};

const STEP_DELAYS = [3000, 4000, 3000, 2000];

function getStepLabels(actionType) {
  return stepLabels[actionType] || defaultSteps;
}

export function WorkflowsProvider({ children }) {
  const [workflows, setWorkflows] = useState([]);
  const timersRef = useRef({});
  const pollersRef = useRef({});

  // ─── Real pipeline (content-brief + competitor-investigation) ───
  const startRealPipeline = useCallback(async (id, insight) => {
    try {
      const { workflowId: backendId } = await startPipeline({
        prompt: insight.promptGroup,
        topSources: insight.topSources,
        competitorUrls: insight.competitorUrls,
        competitorGainers: insight.competitorGainers,
        ppcMetrics: insight.ppcMetrics,
        insightType: insight.agentAction.type,
        brand: 'Capital One',
      });

      console.log(`[workflow] Real pipeline started: ${backendId}`);

      // Poll backend for progress
      pollersRef.current[id] = setInterval(async () => {
        try {
          const status = await pollStatus(backendId);

          setWorkflows((prev) =>
            prev.map((w) => {
              if (w.id !== id) return w;

              const newSteps = status.steps.map((s) => ({
                label: s.label,
                status: s.status,
                completedAt: s.completedAt || null,
              }));

              if (status.status === 'complete' || status.status === 'error') {
                clearInterval(pollersRef.current[id]);
                delete pollersRef.current[id];

                return {
                  ...w,
                  status: status.status === 'error' ? 'complete' : 'complete',
                  currentStep: 3,
                  steps: newSteps,
                  result: status.result || 'Content brief generated.',
                  deliverable: status.deliverable || w.deliverable,
                  completedAt: status.completedAt || new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                };
              }

              return {
                ...w,
                currentStep: status.currentStep,
                steps: newSteps,
              };
            })
          );
        } catch (pollErr) {
          console.warn('[workflow] Poll error:', pollErr.message);
        }
      }, 2000);
    } catch (err) {
      console.warn('[workflow] Backend unavailable, falling back to simulation:', err.message);
      startSimulation(id, insight);
    }
  }, []);

  // ─── Simulated pipeline (all other types, or fallback) ───
  const startSimulation = useCallback((id, insight) => {
    let step = 0;
    const advance = () => {
      step += 1;
      if (step < 4) {
        setWorkflows((prev) =>
          prev.map((w) => {
            if (w.id !== id) return w;
            const newSteps = w.steps.map((s, i) => {
              if (i < step) return { ...s, status: 'done', completedAt: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) };
              if (i === step) return { ...s, status: 'active' };
              return s;
            });
            return { ...w, currentStep: step, steps: newSteps };
          })
        );
        timersRef.current[id] = setTimeout(advance, STEP_DELAYS[step]);
      } else {
        const resultText = agentResults[insight.agentAction.type] || 'Analysis complete. Output generated and ready for review.';
        setWorkflows((prev) =>
          prev.map((w) => {
            if (w.id !== id) return w;
            const newSteps = w.steps.map((s) => ({
              ...s,
              status: 'done',
              completedAt: s.completedAt || new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            }));
            return {
              ...w,
              status: 'complete',
              currentStep: 3,
              steps: newSteps,
              result: resultText,
              completedAt: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            };
          })
        );
      }
    };
    timersRef.current[id] = setTimeout(advance, STEP_DELAYS[0]);
  }, []);

  const startWorkflow = useCallback((insight) => {
    const id = `wf-${Date.now()}`;
    const labels = getStepLabels(insight.agentAction.type);
    const isRealPipeline = insight.competitorUrls && insight.competitorUrls.length > 0;

    const workflow = {
      id,
      insightId: insight.id,
      insightTitle: insight.title,
      agentAction: insight.agentAction,
      promptGroup: insight.promptGroup,
      insightType: insight.type,
      deliverable: isRealPipeline ? null : (insight.deliverable || null),
      status: 'running',
      currentStep: 0,
      steps: labels.map((label, i) => ({
        label,
        status: i === 0 ? 'active' : 'pending',
        completedAt: null,
      })),
      result: null,
      startedAt: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      completedAt: null,
    };

    setWorkflows((prev) => {
      if (prev.some((w) => w.insightId === insight.id)) return prev;
      return [workflow, ...prev];
    });

    if (isRealPipeline) {
      startRealPipeline(id, insight);
    } else {
      startSimulation(id, insight);
    }

    return id;
  }, [startRealPipeline, startSimulation]);

  const approveWorkflow = useCallback((workflowId) => {
    setWorkflows((prev) =>
      prev.map((w) => (w.id === workflowId ? { ...w, status: 'approved' } : w))
    );
  }, []);

  const dismissWorkflow = useCallback((workflowId) => {
    // Just leave it as complete — user can approve later
  }, []);

  const getWorkflowByInsightId = useCallback(
    (insightId) => workflows.find((w) => w.insightId === insightId),
    [workflows]
  );

  const hasWorkflow = useCallback(
    (insightId) => workflows.some((w) => w.insightId === insightId),
    [workflows]
  );

  const activeCount = workflows.filter((w) => w.status === 'running').length;
  const completeCount = workflows.filter((w) => w.status === 'complete' || w.status === 'approved').length;
  const workflowCount = workflows.filter((w) => w.status !== 'approved').length;
  const completedWorkflows = workflows.filter((w) => (w.status === 'complete' || w.status === 'approved') && w.deliverable);
  const reviewCount = workflows.filter((w) => w.status === 'complete' && w.deliverable).length;

  return (
    <WorkflowsContext.Provider
      value={{
        workflows,
        startWorkflow,
        approveWorkflow,
        dismissWorkflow,
        getWorkflowByInsightId,
        hasWorkflow,
        activeCount,
        completeCount,
        workflowCount,
        completedWorkflows,
        reviewCount,
      }}
    >
      {children}
    </WorkflowsContext.Provider>
  );
}

export function useWorkflows() {
  const context = useContext(WorkflowsContext);
  if (!context) throw new Error('useWorkflows must be used within WorkflowsProvider');
  return context;
}
