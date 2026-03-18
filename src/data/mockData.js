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
    suggestedAction: 'Create content targeting this prompt. Study competitor sources to understand what LLMs are citing.',
    agentAction: {
      type: 'content-brief',
      label: 'Generate content brief',
      description: 'Agent will analyse top-ranking LLM responses and generate a content brief targeting gaps in coverage.',
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
    suggestedAction: 'Revenue and ROAS fell while clicks stayed stable, pointing to weaker funnel conversion. Rebalance spend toward higher-performing ad groups.',
    agentAction: {
      type: 'bid-adjustment',
      label: 'Optimise bids',
      description: 'Agent will model budget scenarios and recommend reallocation to maximise return on the increased visibility.',
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
    suggestedAction: 'Review source content driving negative framing. Determine root cause and consider PR/content response.',
    agentAction: {
      type: 'investigation',
      label: 'Investigate sources',
      description: 'Agent will trace cautionary mentions to source pages, classify sentiment drivers, and recommend corrective actions.',
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
    suggestedAction: 'Traffic and revenue slid despite higher CVR, pointing to volume loss not efficiency. Barclaycard gained significant share.',
    agentAction: {
      type: 'investigation',
      label: 'Investigate decline',
      description: 'Agent will cross-reference competitor activity, quality score changes, and auction dynamics to diagnose the decline.',
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
    suggestedAction: 'Review positioning against recommended competitors. Analyse their content strategy and source authority.',
    agentAction: {
      type: 'competitive-analysis',
      label: 'Run competitor analysis',
      description: 'Agent will map competitor positioning, cited sources, and content strategies driving their recommendations.',
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
    suggestedAction: 'Volume and revenue grew but costs rose sharply, eroding ROAS and profit. Review bid caps and audience targeting.',
    agentAction: {
      type: 'report',
      label: 'Generate report',
      description: 'Agent will compile a performance summary with trend data and competitor context, ready for your weekly review.',
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
