const { findUrls, scrapeUrls } = require('./oxylabs');
const { analyseSource, generateBrief, callGemini } = require('./gemini');

function updateStep(state, stepIndex, status, detail) {
  state.steps[stepIndex].status = status;
  if (detail) state.steps[stepIndex].detail = detail;
  if (status === 'done') {
    state.steps[stepIndex].completedAt = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }
  if (status === 'active') {
    state.currentStep = stepIndex;
  }
}

async function runContentBriefPipeline(state, { prompt, topSources, competitorUrls, insightType, brand }) {
  const ownDomains = ['capitalone.co.uk', 'capitalone.com'];

  try {
    // Step 1: Identify top sources
    console.log(`\n[pipeline] Step 1: Identifying sources for "${prompt}"`);
    updateStep(state, 0, 'active');

    let urlResults;

    if (competitorUrls && competitorUrls.length > 0) {
      // We already have full URLs from the enriched CSV — skip SERP lookup
      urlResults = competitorUrls
        .filter((s) => !ownDomains.some((d) => s.domain.includes(d)))
        .slice(0, 3)
        .map((u) => ({ domain: u.domain, url: u.url, title: u.domain, count: u.count }));
      console.log(`  [pipeline] Using ${urlResults.length} pre-resolved URLs (skipping SERP lookup)`);
      urlResults.forEach((u) => console.log(`    ${u.domain}: ${u.url}`));
    } else if (topSources) {
      // Fallback: use Oxylabs SERP to find URLs from domain names
      const filteredSources = topSources.filter(
        (s) => !ownDomains.some((d) => s.domain.includes(d))
      );
      urlResults = await findUrls(prompt, filteredSources.slice(0, 3));
    } else {
      throw new Error('No source data provided');
    }

    if (!urlResults || urlResults.length === 0) {
      throw new Error('No URLs found for any source domain');
    }

    updateStep(state, 0, 'done', `Found ${urlResults.length} URLs`);

    // Step 2: Scrape those URLs
    console.log(`\n[pipeline] Step 2: Scraping ${urlResults.length} pages`);
    updateStep(state, 1, 'active');

    const scrapedPages = await scrapeUrls(urlResults);
    const successfulPages = scrapedPages.filter((p) => p.content);

    if (successfulPages.length === 0) {
      throw new Error('Failed to scrape any pages');
    }

    updateStep(state, 1, 'done', `Scraped ${successfulPages.length} pages`);

    // Step 3: Analyse each source with Gemini
    console.log(`\n[pipeline] Step 3: Analysing ${successfulPages.length} sources`);
    updateStep(state, 2, 'active');

    const analyses = [];
    for (const page of successfulPages) {
      try {
        const analysis = await analyseSource({
          prompt,
          domain: page.domain,
          url: page.url,
          content: page.content,
          citationCount: page.count,
          brand,
        });
        analyses.push(analysis);
      } catch (err) {
        console.error(`  [pipeline] Gemini analysis failed for ${page.domain}:`, err.message);
      }
    }

    if (analyses.length === 0) {
      throw new Error('All Gemini analyses failed');
    }

    updateStep(state, 2, 'done', `Analysed ${analyses.length} sources`);

    // Step 4: Generate consolidated brief/report
    const titleMap = {
      'content-brief': 'Content Brief',
      'competitive-analysis': 'Competitive Analysis',
      'investigation': 'Source Investigation',
      'report': 'Position Report',
    };
    const deliverableTitle = `${titleMap[insightType] || 'Report'}: ${prompt}`;
    console.log(`\n[pipeline] Step 4: Generating ${titleMap[insightType] || 'report'}`);
    updateStep(state, 3, 'active');

    const briefText = await generateBrief({ prompt, analyses, brand });

    updateStep(state, 3, 'done');

    // Complete
    state.status = 'complete';
    state.result = `${titleMap[insightType] || 'Report'} generated from ${analyses.length} real sources. Analysed content from ${analyses.map((a) => a.domain).join(', ')}.`;
    state.deliverable = {
      type: insightType || 'content-brief',
      title: deliverableTitle,
      body: briefText,
    };
    state.completedAt = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    console.log(`\n[pipeline] ✅ Pipeline complete for "${prompt}"`);
  } catch (err) {
    console.error(`\n[pipeline] ❌ Pipeline failed:`, err.message);
    state.status = 'error';
    state.error = err.message;

    // Mark current active step as failed
    const activeStep = state.steps.findIndex((s) => s.status === 'active');
    if (activeStep >= 0) {
      updateStep(state, activeStep, 'done', `Failed: ${err.message}`);
    }
  }
}

async function runCompetitorInvestigation(state, { prompt, competitorUrls, competitorGainers, ppcMetrics, brand }) {
  try {
    // Step 1: Identify competitor gainers
    console.log(`\n[pipeline] Step 1: Identifying competitor gainers for "${prompt}"`);
    updateStep(state, 0, 'active');

    const gainers = competitorGainers || [];
    const urls = competitorUrls || [];
    console.log(`  [pipeline] ${gainers.length} competitors gaining share`);
    gainers.forEach((g) => console.log(`    ${g.domain}: ${g.before}% → ${g.after}% (+${g.delta}pp)`));

    updateStep(state, 0, 'done', `${gainers.length} competitors identified`);

    // Step 2: Scrape competitor landing pages
    console.log(`\n[pipeline] Step 2: Scraping ${urls.length} competitor landing pages`);
    updateStep(state, 1, 'active');

    const scrapedPages = await scrapeUrls(urls.map((u) => ({
      url: u.url,
      domain: u.domain,
      citations: u.count || 0,
      source_type: u.sourceType || 'Direct Competitor',
    })));
    const successfulPages = scrapedPages.filter((p) => p.content);

    if (successfulPages.length === 0) {
      throw new Error('Failed to scrape any competitor landing pages');
    }

    updateStep(state, 1, 'done', `Scraped ${successfulPages.length} pages`);

    // Step 3: Analyse each competitor with Gemini
    console.log(`\n[pipeline] Step 3: Analysing ${successfulPages.length} competitor landing pages`);
    updateStep(state, 2, 'active');

    const m = ppcMetrics || {};
    const analyses = [];
    for (const page of successfulPages) {
      try {
        const gainer = gainers.find((g) => g.domain === page.domain) || {};
        const analysisPrompt = `You are a PPC competitive intelligence analyst working for ${brand}.

CONTEXT:
${brand} runs the "${m.campaignName || prompt}" campaign on Google Ads targeting bad credit / adverse credit search terms.

Performance this period:
- CPA: £${(m.cpaP1 || 0).toFixed(2)} -> £${(m.cpaP2 || 0).toFixed(2)}
- ROAS: ${(m.roasP1 || 0).toFixed(2)} -> ${(m.roasP2 || 0).toFixed(2)}
- Profit: £${(m.profitP1 || 0).toFixed(0)} -> £${(m.profitP2 || 0).toFixed(0)}

${page.domain} has GAINED click share: ${gainer.before || 0}% -> ${gainer.after || 0}% (+${gainer.delta || 0}pp).

Analyse this competitor's landing page. What are they offering? How does it compare to ${brand}? Why might they be gaining share?

Respond in JSON with: domain, url, page_type, headline, offer (product_type, key_proposition, rates_or_terms, eligibility_messaging), competitive_threat (threat_level, what_they_do_better, why_gaining_share).

PAGE CONTENT FROM ${page.url}:
---
${page.content}
---`;

        console.log(`  [pipeline] Analysing ${page.domain}...`);
        const resultText = await callGemini(analysisPrompt);
        let parsed;
        try {
          const cleaned = resultText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          parsed = JSON.parse(cleaned);
        } catch {
          parsed = { domain: page.domain, raw: resultText };
        }
        analyses.push(parsed);
        console.log(`  [pipeline] ✓ Done`);
      } catch (err) {
        console.error(`  [pipeline] Analysis failed for ${page.domain}:`, err.message);
      }
    }

    updateStep(state, 2, 'done', `Analysed ${analyses.length} competitors`);

    // Step 4: Generate competitive response plan
    console.log(`\n[pipeline] Step 4: Generating competitive response plan`);
    updateStep(state, 3, 'active');

    const gainersSummary = gainers.map((g) => `${g.domain}: ${g.before}% → ${g.after}% (+${g.delta}pp)`).join('\n');
    const synthesisPrompt = `You are a PPC strategist. Your client is ${brand}.

The "${m.campaignName || prompt}" campaign has seen CPA rise from £${(m.cpaP1 || 0).toFixed(2)} to £${(m.cpaP2 || 0).toFixed(2)} and profit fall from £${(m.profitP1 || 0).toFixed(0)} to £${(m.profitP2 || 0).toFixed(0)}.

Competitors gaining share:
${gainersSummary}

AI Overview frequency: ${m.aioFreq || 0}%

You investigated the top ${analyses.length} competitors:

${JSON.stringify(analyses.map((a) => a.analysis || a), null, 2)}

Write a competitive response plan using EXACTLY this structure. Start with Recommended Actions first.

Recommended Actions
[4-5 numbered actions. Be specific — name the competitor, the landing page element to copy, the bid change to make.]

Competitor Assessment
[One paragraph per competitor. What they offer, why they're gaining, respond or ignore.]

Bid Strategy
[2-3 sentences. Hold, increase, or shift budget? Account for AI Overview impact at ${m.aioFreq || 0}% frequency.]

RULES: Plain text only, no markdown formatting. Keep under 1500 characters total. Start with "Recommended Actions".`;

    const briefText = await callGemini(synthesisPrompt);

    updateStep(state, 3, 'done');

    state.status = 'complete';
    state.result = `Competitive response plan generated. Analysed ${analyses.length} competitor landing pages gaining click share in the ${m.campaignName || prompt} auction.`;
    state.deliverable = {
      type: 'report',
      title: `Competitor Investigation: ${m.campaignName || prompt}`,
      body: briefText,
    };
    state.completedAt = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    console.log(`\n[pipeline] ✅ Competitor investigation complete for "${prompt}"`);
  } catch (err) {
    console.error(`\n[pipeline] ❌ Pipeline failed:`, err.message);
    state.status = 'error';
    state.error = err.message;

    const activeStep = state.steps.findIndex((s) => s.status === 'active');
    if (activeStep >= 0) {
      updateStep(state, activeStep, 'done', `Failed: ${err.message}`);
    }
  }
}

module.exports = { runContentBriefPipeline, runCompetitorInvestigation };
