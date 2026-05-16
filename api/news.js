// Vercel serverless function — fetches Yahoo Finance RSS server-side (no CORS issues)
// Cached at the edge for 15 minutes via Cache-Control

const FEEDS = [
  'https://feeds.finance.yahoo.com/rss/2.0/headline?region=US&lang=en-US',
  'https://feeds.finance.yahoo.com/rss/2.0/headline?s=^GSPC,^N225&region=US&lang=en-US',
];

function parseCDATA(str) {
  if (!str) return '';
  return str.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
}

function parseItems(xml) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => {
    const block = m[1];
    const title    = parseCDATA(block.match(/<title>([\s\S]*?)<\/title>/)?.[1]);
    const desc     = parseCDATA(block.match(/<description>([\s\S]*?)<\/description>/)?.[1]);
    const pubDate  = (block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || '').trim();
    let   link     = (block.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '').trim();
    // Some feeds use self-closing <link/> followed by the URL as text
    if (!link) link = (block.match(/<link\/>\s*(https?:\/\/[^\s<]+)/)?.[1] || '').trim();
    return { title, description: desc, link, pubDate };
  }).filter(item => item.title);
}

export default async function handler(req, res) {
  let lastError = 'No feeds available';

  for (const feedUrl of FEEDS) {
    try {
      const response = await fetch(feedUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ken-dashboard/1.0; +https://github.com)' },
      });

      if (!response.ok) { lastError = `Feed returned ${response.status}`; continue; }

      const xml   = await response.text();
      const items = parseItems(xml).slice(0, 10);
      if (items.length === 0) { lastError = 'Feed returned no items'; continue; }

      res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');
      res.setHeader('Content-Type', 'application/json');
      return res.json({ ok: true, items });
    } catch (e) {
      lastError = e.message;
    }
  }

  res.status(502).json({ ok: false, error: lastError });
}
