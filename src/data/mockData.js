export const accounts = [
  { id: 'capitalone', name: 'Capital One UK', industry: 'Financial Services', insightCount: 6 },
];

export const insights = [
  // 1. AI Search — content brief
  {
    id: 'llm-1',
    accountId: 'capitalone',
    type: 'ai-search',
    severity: 'high',
    title: 'Not mentioned or cited — competitors dominate',
    summary: 'Capital One has 0% mention rate and 0% citation rate for this prompt. Competitors mentioned: Barclaycard (18), TSB (9), HSBC (9).',
    metric: { label: 'Mention Rate', before: '-', after: '0%', direction: 'down' },
    workflowSteps: [
      'Analyse top LLM responses for "best balance transfer cards"',
      'Map competitor content being cited (Barclaycard, TSB, HSBC)',
      'Identify content gaps and keyword opportunities',
      'Generate targeted content brief with recommendations',
    ],
    agentAction: {
      type: 'content-brief',
      label: 'Generate content brief',
      description: 'Agent will analyse top-ranking LLM responses and generate a content brief targeting gaps in coverage.',
    },
    deliverable: {
      type: 'content-brief',
      title: 'Content Brief: best balance transfer cards',
      body: `Target Prompt
best balance transfer cards

Current State
Capital One has 0% mention rate and 0% citation rate across all tracked LLM responses for this prompt. Barclaycard dominates with 18 mentions, followed by TSB (9) and HSBC (9). None of your owned content is being cited as a source.

Content Gaps Identified
1. No dedicated balance transfer comparison page — competitors have standalone pages ranking for this exact query that LLMs are citing as authoritative sources.
2. Missing structured data markup — Barclaycard and TSB pages use FAQ schema and product schema that LLMs prefer when generating responses.
3. No introductory/explainer content — LLMs are pulling from competitor "how balance transfers work" guides. Capital One has product pages but no educational layer.
4. Outdated offer details — your current balance transfer page references a previous promotional rate. LLMs deprioritise stale content.

Recommended Content
Create a comprehensive guide: "Best Balance Transfer Credit Cards 2026 — Compare Offers & Save". Structure it with:
- H1: Best Balance Transfer Credit Cards
- FAQ section with schema markup covering "How do balance transfer cards work?", "What is a good balance transfer rate?", "How long do balance transfer offers last?"
- Product comparison table with structured data
- Calculator widget for balance transfer savings
- Internal links to your balance transfer card application page

Target word count: 2,500–3,000 words. Publish within 2 weeks to align with the next LLM training data crawl cycle.

Expected Impact
Based on competitor benchmarks, a well-structured page could achieve 8–15% mention rate within 4–6 weeks of LLM retraining. Barclaycard's equivalent page took approximately 3 weeks to appear in ChatGPT responses after publication.`,
    },
    timestamp: 'Today',
    promptGroup: 'best balance transfer cards',
    source: 'chatgpt',
    insightType: 'Invisible',
  },
  // 2. PPC — optimise bids
  {
    id: 'ppc-1',
    accountId: 'capitalone',
    type: 'ppc',
    severity: 'high',
    title: 'Revenue –6.1% and ROAS –11.3%, Profit down £3.9k',
    summary: 'Revenue –6.1% and ROAS –11.3%. Rivals: updraft.com –1.7pp; lovey.com +0.9pp. Profit –£3,940.',
    metric: { label: 'CPA', before: '£151.25', after: '£163.11', direction: 'up' },
    workflowSteps: [
      'Pull auction-level performance data for Adverse_Bad Credit',
      'Model 3 bid adjustment scenarios across affected campaigns',
      'Calculate ROI impact projections per scenario',
      'Prepare bid change recommendations with estimated profit recovery',
    ],
    agentAction: {
      type: 'bid-adjustment',
      label: 'Optimise bids',
      description: 'Agent will model budget scenarios and recommend reallocation to maximise return on the increased visibility.',
    },
    deliverable: {
      type: 'recommendations',
      title: 'Bid Optimisation: Adverse_Bad Credit',
      body: `Campaign Group
Adverse_Bad Credit

Performance Summary (Last 7 Days)
Revenue: £12,450 → £11,690 (–6.1%)
ROAS: 3.2x → 2.84x (–11.3%)
CPA: £151.25 → £163.11 (+7.8%)
Profit impact: –£3,940 week-on-week

Root Cause Analysis
Click volume remained stable (–0.3%) but conversion rate dropped from 2.1% to 1.8%, suggesting a funnel issue rather than a traffic quality problem. Meanwhile, average CPC increased by 4.2% due to competitive pressure from updraft.com entering key auctions.

Competitor Movement
- updraft.com: impression share dropped 1.7pp (pulling back, but pushed CPCs up before retreating)
- lovey.com: impression share gained 0.9pp (increasing bids on exact-match terms)

Recommended Scenario: Redistribute 15% of budget
Move 15% of spend from underperforming broad-match campaigns to exact-match and phrase-match campaigns that maintained ROAS above 3.0x.

Specific changes:
- "bad credit cards apply" broad: reduce daily budget from £180 to £153
- "credit cards poor credit score" exact: increase daily budget from £95 to £122
- "adverse credit card" phrase: increase daily budget from £60 to £74

Projected Impact
- Estimated weekly profit recovery: £2,100–£2,800
- Estimated ROAS improvement: +0.3x (to ~3.14x)
- Break-even timeline: 3–5 days

Alternative Scenarios Modelled
Scenario A (conservative): 10% reallocation → £1,400 recovery, lower risk
Scenario B (aggressive): 25% reallocation → £3,200 recovery, higher variance`,
    },
    timestamp: 'Today',
    promptGroup: 'Adverse_Bad Credit',
    source: 'google',
    insightType: 'Review',
  },
  // 3. AI Search — investigate sources
  {
    id: 'llm-4',
    accountId: 'capitalone',
    type: 'ai-search',
    severity: 'high',
    title: 'Cautionary framing detected — 21% of mentions are negative',
    summary: 'Capital One mentioned in 31.9% of citations but 21% carry cautionary/negative framing. Own source rate: 38.5%.',
    metric: { label: 'Cautionary Rate', before: '-', after: '20.7%', direction: 'up' },
    workflowSteps: [
      'Collect all source pages cited in LLM responses for this prompt',
      'Classify sentiment and framing of each Capital One mention',
      'Trace negative framing to specific source content',
      'Compile investigation report with corrective actions',
    ],
    agentAction: {
      type: 'investigation',
      label: 'Investigate sources',
      description: 'Agent will trace cautionary mentions to source pages, classify sentiment drivers, and recommend corrective actions.',
    },
    deliverable: {
      type: 'report',
      title: 'Source Investigation: capital one uk card fees',
      body: `Target Prompt
capital one uk card fees

Mention Profile
Capital One is mentioned in 31.9% of LLM citations for this prompt, but 20.7% of those mentions carry cautionary or negative framing. Own source rate is 38.5% — meaning 61.5% of mentions come from third-party sources you don't control.

Cautionary Mentions Traced
1. MoneySavingExpert forum thread (cited 8 times): Users discussing unexpected fee increases on the Capital One Platinum card. Key quote being pulled: "watch out for the overseas transaction fee — it changed without notice." This single source drives ~40% of negative framing.

2. TrustPilot reviews aggregate (cited 4 times): LLMs are synthesising from negative reviews about annual fee transparency. Average rating on cited page: 2.1/5.

3. Which? comparison article (cited 3 times): Factually accurate but positions Capital One fees as "higher than average" compared to Barclaycard and Halifax. The comparison methodology favours cards with no annual fee.

Positive Mentions
Your own fee explainer page (capitalone.co.uk/fees) is cited in 38.5% of mentions and carries neutral-to-positive framing. This page is your strongest asset.

Recommended Actions
1. Immediate: Update your fee explainer page with clearer comparison tables and FAQ schema. Target the specific questions being answered with cautionary framing ("does Capital One charge overseas fees?").

2. Short-term (2 weeks): Create a dedicated "Capital One card fees explained" guide with structured data that directly addresses the MoneySavingExpert concerns with current, accurate information.

3. Medium-term (4 weeks): Build a fee calculator tool that LLMs can reference. Interactive tools are increasingly cited as authoritative sources.

4. Monitor: Set up weekly tracking on the MoneySavingExpert thread and TrustPilot aggregate to detect new negative content early.

Expected Impact
Addressing the MoneySavingExpert source alone could reduce cautionary framing by 8–10pp within 6 weeks. Combined actions could bring cautionary rate below 10%.`,
    },
    timestamp: 'Today',
    promptGroup: 'capital one uk card fees',
    source: 'chatgpt',
    insightType: 'At Risk',
  },
  // 4. PPC — investigate decline
  {
    id: 'ppc-3',
    accountId: 'capitalone',
    type: 'ppc',
    severity: 'high',
    title: 'Revenue –17% while ROAS stays flat, barclaycard gains ~6.8pp',
    summary: 'Revenue –17.0% and ROAS flat (–0.5%). Rivals: oceanfinance.co.uk –9.8pp, barclaycard.co.uk +6.8pp. Profit –£2,178.',
    metric: { label: 'CVR', before: '2.7%', after: '3.1%', direction: 'up' },
    workflowSteps: [
      'Cross-reference Barclaycard activity with auction dynamics',
      'Analyse quality score changes and ad rank shifts',
      'Identify which keywords lost impression share',
      'Compile decline investigation with recovery plan',
    ],
    agentAction: {
      type: 'investigation',
      label: 'Investigate decline',
      description: 'Agent will cross-reference competitor activity, quality score changes, and auction dynamics to diagnose the decline.',
    },
    deliverable: {
      type: 'report',
      title: 'Decline Investigation: Competitors_Barclaycard',
      body: `Campaign Group
Competitors_Barclaycard

Key Finding
This is a volume loss issue, not an efficiency problem. Your conversion rate actually improved (+0.4pp) but you're getting significantly fewer impressions and clicks. Barclaycard has increased their bid aggressiveness, capturing impression share you previously held.

Performance Summary
Revenue: £12,810 → £10,632 (–17.0%)
ROAS: 2.8x → 2.79x (–0.5%, essentially flat)
CVR: 2.7% → 3.1% (+0.4pp improvement)
Impressions: –22.3%
Clicks: –19.1%
Profit impact: –£2,178

Competitor Dynamics
Barclaycard (+6.8pp impression share): Launched new "Barclaycard Avios Plus" campaign targeting your exact keyword set. They appear to be running a promotional push with elevated bids — likely time-limited based on historical patterns.

OceanFinance (–9.8pp): Pulled back significantly, possibly reallocating budget elsewhere. Their retreat opened space that Barclaycard captured rather than you.

Keywords Most Affected
1. "barclaycard vs capital one" — lost top position, dropped from 78% to 41% impression share
2. "capital one alternative" — Barclaycard now in position 1 with new ad copy
3. "best credit card barclaycard" — CPC up 34%, your ads pushed to position 3

Recovery Plan
Phase 1 (This week): Increase bids on the 3 most affected keywords by 15–20% to reclaim position. Estimated additional daily spend: £45.
Phase 2 (Next week): Launch responsive search ads with updated copy emphasising your USPs vs. Barclaycard (no annual fee, cashback rate).
Phase 3 (Monitor): Track Barclaycard's bid behaviour — if this is a promotional push, expect them to pull back within 2–4 weeks. Set alerts for impression share recovery.

Risk Assessment
If Barclaycard's push is sustained (not promotional), the cost of reclaiming share rises significantly. In that scenario, consider pivoting budget to non-brand competitor terms where CPCs are 30% lower.`,
    },
    timestamp: 'Today',
    promptGroup: 'Competitors_Barclaycard',
    source: 'google',
    insightType: 'Review',
  },
  // 5. AI Search — competitor analysis
  {
    id: 'llm-6',
    accountId: 'capitalone',
    type: 'ai-search',
    severity: 'medium',
    title: 'Competitor recommended over Capital One',
    summary: 'Capital One mentioned but never recommended. Competitors with \'Recommended\' framing: NerdWallet (1x), Experian (1x), Equifax (1x).',
    metric: { label: 'Recommended Rate', before: '-', after: '0%', direction: 'down' },
    workflowSteps: [
      'Map competitor recommendation positioning across LLMs',
      'Analyse content and sources driving their recommendations',
      'Score competitive positioning gaps',
      'Build competitive intelligence summary',
    ],
    agentAction: {
      type: 'competitive-analysis',
      label: 'Run competitor analysis',
      description: 'Agent will map competitor positioning, cited sources, and content strategies driving their recommendations.',
    },
    deliverable: {
      type: 'competitive-analysis',
      title: 'Competitive Analysis: credit cards for bad credit',
      body: `Target Prompt
credit cards for bad credit

Positioning Overview
Capital One is mentioned in LLM responses but never with a "recommended" framing. Instead, LLMs recommend NerdWallet, Experian, and Equifax — notably, these are comparison/information sites, not card issuers. This suggests LLMs trust editorial/comparison content over product pages when making recommendations.

Competitor Breakdown

NerdWallet (Recommended 1x)
- Source: "Best Credit Cards for Bad Credit 2026" guide
- Why LLMs cite it: comprehensive comparison table with structured data, clear editorial methodology, updated monthly
- Content length: ~4,200 words with FAQ schema
- Key advantage: presents itself as an independent reviewer

Experian (Recommended 1x)
- Source: "Credit Cards for Poor Credit — Your Options Explained"
- Why LLMs cite it: leverages Experian's authority as a credit bureau, includes eligibility checker tool
- Content length: ~2,800 words
- Key advantage: domain authority + credit expertise positioning

Equifax (Recommended 1x)
- Source: "Understanding Credit Cards for Bad Credit Scores"
- Why LLMs cite it: educational framing, includes credit score context
- Content length: ~2,100 words
- Key advantage: perceived neutrality as a credit reference agency

Capital One (Mentioned, not recommended)
- Source: product application pages
- Why not recommended: LLMs distinguish between "selling" and "advising" — your content is transactional, competitors' is educational
- Gap: no independent-feeling comparison or guide content

Strategic Recommendations
1. Create an editorial-style guide: "Credit Cards for Bad Credit: What to Look For" — position it as helpful advice, not a sales page. Include competitor products alongside your own.

2. Add eligibility checker: LLMs increasingly cite interactive tools. A "check your chances" widget gives LLMs something concrete to reference.

3. Structured data: implement review schema, FAQ schema, and product comparison schema on your guide page.

4. Content tone: shift from promotional to advisory. Use phrases like "things to consider" and "how to choose" rather than "apply now".

Expected Outcome
Comparison sites typically achieve "recommended" framing within 8–12 weeks of publishing comprehensive guide content. As a card issuer, expect 12–16 weeks due to LLM bias toward editorial sources.`,
    },
    timestamp: 'Today',
    promptGroup: 'credit cards for bad credit',
    source: 'chatgpt',
    insightType: 'At Risk',
  },
  // 6. PPC — generate report
  {
    id: 'ppc-4',
    accountId: 'capitalone',
    type: 'ppc',
    severity: 'medium',
    title: 'Revenue +15% but ROAS down 22% as costs jump',
    summary: 'Revenue +15.4% and ROAS –21.8%. CPA +4.9%. Rivals: postoffice.co.uk –2.6pp; moneysupermarket.com +1.9pp. Profit –£2,174.',
    metric: { label: 'Revenue', before: '£7,111', after: '£8,204', direction: 'up' },
    workflowSteps: [
      'Gather weekly performance metrics for Features_APR',
      'Identify key trends and competitive shifts',
      'Format findings for stakeholder review',
      'Generate performance report',
    ],
    agentAction: {
      type: 'report',
      label: 'Generate report',
      description: 'Agent will compile a performance summary with trend data and competitor context, ready for your weekly review.',
    },
    deliverable: {
      type: 'report',
      title: 'Weekly Report: Features_APR',
      body: `Campaign Group
Features_APR — Week Ending 18 March 2026

Executive Summary
Revenue grew 15.4% to £8,204 but profitability declined as costs rose sharply. ROAS dropped 21.8% and CPA increased 4.9%. Net profit impact: –£2,174. The volume growth is positive but unsustainable at current cost levels.

Key Metrics
Revenue: £7,111 → £8,204 (+15.4%)
Spend: £2,222 → £2,890 (+30.1%)
ROAS: 3.2x → 2.84x (–21.8%)
CPA: £148.50 → £155.78 (+4.9%)
Clicks: 1,890 → 2,340 (+23.8%)
CVR: 1.9% → 1.8% (–0.1pp)
Profit: £4,889 → £2,715 (–£2,174)

Competitive Landscape
- Post Office (–2.6pp impression share): pulling back from APR-related terms, possibly seasonal budget adjustment
- MoneySupermarket (+1.9pp): increasing presence, likely responding to the same volume opportunity you captured

What Happened
A combination of increased auction competition (MoneySupermarket entering) and your own volume expansion pushed CPCs up 18%. You captured more clicks but at significantly higher cost. The slight CVR drop suggests the incremental traffic is lower intent.

Recommendations
1. Cap daily budgets on broad-match APR terms at pre-expansion levels (£85/day) to contain cost growth while maintaining exact-match presence.
2. Review audience targeting — exclude audiences with lower historical CVR to improve traffic quality.
3. Monitor MoneySupermarket's activity — if they sustain, adjust strategy; if they retreat, you'll benefit from lower CPCs.

Outlook
If costs are contained via budget caps, expect ROAS to recover to ~3.0x within 2 weeks while maintaining revenue above £7,500. Key risk: MoneySupermarket sustaining elevated bids.`,
    },
    timestamp: 'Today',
    promptGroup: 'Features_APR',
    source: 'google',
    insightType: 'Monitor',
  },
];

export const getInsightsForAccount = (accountId) =>
  insights.filter((i) => i.accountId === accountId);

export const getHighSeverityCount = (accountId) =>
  insights.filter((i) => i.accountId === accountId && i.severity === 'high').length;
