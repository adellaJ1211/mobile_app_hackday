const https = require('https');

const OXYLABS_URL = 'https://realtime.oxylabs.io/v1/queries';

function getAuth() {
  return Buffer.from(`${process.env.OXYLABS_USERNAME}:${process.env.OXYLABS_PASSWORD}`).toString('base64');
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Use Oxylabs Google Search to find the actual URL for a domain + prompt combo.
 * e.g. site:forbes.com best balance transfer cards → finds the Forbes article URL
 */
async function findUrlForDomain(prompt, domain) {
  const query = `site:${domain} ${prompt}`;
  console.log(`  [oxylabs] SERP search: "${query}"`);

  const payload = {
    source: 'google_search',
    query,
    geo_location: 'United Kingdom',
    locale: 'en-gb',
    parse: true,
  };

  const res = await fetch(OXYLABS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${getAuth()}`,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Oxylabs SERP failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  const results = data.results?.[0]?.content?.results?.organic || [];

  if (results.length === 0) {
    console.log(`  [oxylabs] No organic results for ${domain}`);
    return null;
  }

  const url = results[0].url;
  const title = results[0].title;
  console.log(`  [oxylabs] Found: ${url}`);
  return { domain, url, title };
}

/**
 * Find real URLs for all top source domains.
 */
async function findUrls(prompt, topSources) {
  const results = [];
  for (const source of topSources) {
    try {
      const result = await findUrlForDomain(prompt, source.domain);
      if (result) {
        result.count = source.count;
        results.push(result);
      }
    } catch (err) {
      console.error(`  [oxylabs] Failed to find URL for ${source.domain}:`, err.message);
    }
    await sleep(2000);
  }
  return results;
}

/**
 * Scrape a URL using Oxylabs Universal scraper, returning markdown content.
 */
async function scrapeUrl(url) {
  console.log(`  [oxylabs] Scraping: ${url}`);

  const payload = {
    source: 'universal',
    url,
    geo_location: 'United Kingdom',
    render: 'html',
    content_type: 'text/markdown',
  };

  const res = await fetch(OXYLABS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${getAuth()}`,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(60000),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Oxylabs scrape failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  let content = data.results?.[0]?.content || '';

  // Truncate to 15k chars to stay within Gemini context limits
  if (content.length > 15000) {
    console.log(`  [oxylabs] Truncated ${content.length} → 15000 chars`);
    content = content.slice(0, 15000);
  }

  console.log(`  [oxylabs] Scraped ${content.length} chars from ${url}`);
  return content;
}

/**
 * Scrape all URLs, returning array of { domain, url, title, count, content }.
 */
async function scrapeUrls(urlResults) {
  const scraped = [];
  for (const item of urlResults) {
    try {
      const content = await scrapeUrl(item.url);
      scraped.push({ ...item, content });
    } catch (err) {
      console.error(`  [oxylabs] Failed to scrape ${item.url}:`, err.message);
      scraped.push({ ...item, content: null, error: err.message });
    }
    await sleep(2000);
  }
  return scraped;
}

module.exports = { findUrls, scrapeUrls };
