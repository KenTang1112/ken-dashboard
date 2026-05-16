const CACHE_KEY = 'ken_news_cache';
const CACHE_TTL = 15 * 60 * 1000;

const BULLISH_WORDS = ['rally','gain','rise','surge','soar','beat','record','growth','profit','upgrade','boost','jump','climb','recover','outperform'];
const BEARISH_WORDS = ['fall','drop','decline','loss','miss','cut','recession','warn','risk','sell','downgrade','plunge','crash','slump','concern','layoff','shrink'];

function guessSentiment(text) {
  const lower = text.toLowerCase();
  const bull = BULLISH_WORDS.filter(w => lower.includes(w)).length;
  const bear = BEARISH_WORDS.filter(w => lower.includes(w)).length;
  if (bull > bear) return 'bullish';
  if (bear > bull) return 'bearish';
  return 'neutral';
}

function extractTicker(title) {
  const match = title.match(/\(([A-Z]{1,5})\)/);
  return match ? match[1] : null;
}

function stripHtml(html) {
  return (html || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

export async function fetchNews(count = 6) {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const { ts, data } = JSON.parse(raw);
      if (Date.now() - ts < CACHE_TTL && Array.isArray(data) && data.length) return data.slice(0, count);
    }
  } catch { /* ignore */ }

  // /api/news is a Vercel serverless function — fetches RSS server-side, no CORS issues
  const res = await fetch('/api/news');
  if (!res.ok) throw new Error(`API returned ${res.status}`);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Feed error');

  const items = (json.items || []).map(item => {
    const summary = stripHtml(item.description);
    return {
      ticker: extractTicker(item.title),
      headline: item.title,
      summary: summary.slice(0, 160) + (summary.length > 160 ? '…' : ''),
      sentiment: guessSentiment(item.title + ' ' + summary),
      source: 'Yahoo Finance',
      time: item.pubDate ? new Date(item.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
      link: item.link,
    };
  });

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: items }));
  } catch { /* ignore */ }

  return items.slice(0, count);
}
