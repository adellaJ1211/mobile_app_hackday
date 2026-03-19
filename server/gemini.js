const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
let model = null;

function getModel() {
  if (!model) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    model = genAI.getGenerativeModel({ model: modelName });
    console.log(`  [gemini] Using model: ${modelName}`);
  }
  return model;
}

/**
 * Analyse a single scraped source page for content gaps and AEO insights.
 */
async function analyseSource({ prompt, domain, url, content, citationCount, brand }) {
  console.log(`  [gemini] Analysing source: ${domain} (${content.length} chars)`);

  const analysisPrompt = `You are an AEO (Answer Engine Optimisation) content analyst. A brand called ${brand} is currently INVISIBLE in LLM responses for the prompt: "${prompt}".

The following content is from ${domain}, which is one of the top sources that LLMs cite when answering this prompt. It was cited ${citationCount} times.

Analyse this content and extract:

1. TOPIC COVERAGE: What specific topics, questions, and subtopics does this page cover? List them.

2. CONTENT STRUCTURE: How is the content structured? (headings, tables, lists, FAQs, comparison formats). What makes it easy for an LLM to extract and cite?

3. KEY CLAIMS & DATA: What specific facts, statistics, product details, or recommendations does the page make? These are the claims LLMs are citing.

4. BRAND MENTIONS: Which brands/products are mentioned and how are they positioned? Who is recommended vs just listed?

5. AUTHORITY SIGNALS: What makes this page authoritative? (author credentials, editorial standards, data sources, update frequency, structured data)

6. WHAT ${brand.toUpperCase()} COULD LEARN: What specific content would ${brand} need to create to compete with this page for LLM citations? Be specific about topics to cover, structure to use, and claims to make.

Content from ${url}:
---
${content}
---`;

  const result = await getModel().generateContent(analysisPrompt);
  const text = result.response.text();
  console.log(`  [gemini] Analysis complete for ${domain} (${text.length} chars)`);
  return { domain, url, analysis: text };
}

/**
 * Generate consolidated content brief from all source analyses.
 */
async function generateBrief({ prompt, analyses, brand }) {
  console.log(`  [gemini] Generating consolidated brief from ${analyses.length} sources`);

  const allAnalyses = analyses
    .map((a) => `### ${a.domain} (${a.url})\n${a.analysis}`)
    .join('\n\n---\n\n');

  const briefPrompt = `You are an AEO content strategist. Based on the analysis of the top ${analyses.length} sources that LLMs cite for the prompt "${prompt}", create a content brief for ${brand}.

Source analyses:
${allAnalyses}

Create a CONTENT BRIEF using EXACTLY this structure. Lead with the most actionable sections first. Do NOT include a "Target Prompt" section.

Recommended Actions
[Start here. Numbered list of 4-6 specific, concrete actions ${brand} should take. Each action should be one sentence. Be specific — name the page to create, the schema to add, the content to write.]

Content Gaps
[Numbered list of 3-5 specific gaps ${brand} needs to fill. One sentence each. Derived from what top sources cover that ${brand} doesn't.]

Competitive Landscape
[2-3 sentences max. Who dominates, why, and what they have in common. Keep it brief.]

Expected Impact
[2-3 sentences. Projected mention rate improvement and timeline based on competitor benchmarks.]

IMPORTANT RULES:
1. Output plain text only. No markdown (no ##, no **, no bullets with -).
2. Use numbered lists (1. 2. 3.) for actions and gaps.
3. Keep the TOTAL output under 1500 characters. Be concise and direct.
4. Every recommendation must be grounded in evidence from the source analyses.
5. Do NOT include a "Target Prompt" section. Do NOT repeat the search term as a heading or section.
6. Start DIRECTLY with "Recommended Actions" as the first line.`;

  const result = await getModel().generateContent(briefPrompt);
  const text = result.response.text();
  console.log(`  [gemini] Brief generated (${text.length} chars)`);
  return text;
}

/**
 * Generic Gemini call — send any prompt, get text back.
 */
async function callGemini(promptText) {
  console.log(`  [gemini] Calling Gemini (${promptText.length} chars)...`);
  const result = await getModel().generateContent(promptText);
  const text = result.response.text();
  console.log(`  [gemini] Response: ${text.length} chars`);
  return text;
}

module.exports = { analyseSource, generateBrief, callGemini };
