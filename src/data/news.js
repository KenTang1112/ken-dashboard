const CACHE_KEY = 'ken_news_cache';
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

// Yahoo Finance general news RSS proxied through rss2json (free, no key, CORS-safe)
const FEED_URL = 'https://finance.yahoo.com/news/rssindex';
const API = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(FEED_URL)}&count=8`;

const BULLISH_WORDS = ['rally', 'gain', 'rise', 'surge', 'soar', 'beat', 'record', 'growth', 'profit', 'upgrade', 'boost', 'jump', 'climb', 'recover', 'outperform'];
const BEARISH_WORDS = ['fall', 'drop', 'decline', 'loss', 'miss', 'cut', 'recession', 'debt', 'warn', 'risk', 'sell', 'downgrade', 'plunge', 'crash', 'slump', 'concern', 'layoff', 'shrink'];

function guessSentiment(text) {
  const lower = text.toLowerCase();
  const bull = BULLISH_WORDS.filter(w => lower.includes(w)).length;
  const bear = BEARISH_WORDS.filter(w => lower.includes(w)).length;
  if (bull > bear) return 'bullish';
  if (bear > bull) return 'bearish';
  return 'neutral';
}

function extractTicker(title) {
  const match = title.match(/\b([A-Z]{1,5})\b/);
  return match ? match[1] : null;
}

function stripHtml(html) {
  return (html || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

export async function fetchNews(count = 6) {
  // Return cached result if still fresh
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const { ts, data } = JSON.parse(raw);
      if (Date.now() - ts < CACHE_TTL && Array.isArray(data) && data.length) return data.slice(0, count);
    }
  } catch { /* ignore */ }

  const res = await fetch(API);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.status !== 'ok') throw new Error('Feed error');

  const items = (json.items || []).map(item => {
    const summary = stripHtml(item.description);
    const text = item.title + ' ' + summary;
    return {
      ticker: extractTicker(item.title),
      headline: item.title,
      summary: summary.slice(0, 160) + (summary.length > 160 ? '…' : ''),
      sentiment: guessSentiment(text),
      source: 'Yahoo Finance',
      time: new Date(item.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      link: item.link,
    };
  });

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: items }));
  } catch { /* ignore */ }

  return items.slice(0, count);
}
