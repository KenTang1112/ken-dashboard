import { Link } from 'react-router-dom';

// TODO: replace PLACEHOLDER_NEWS with real Finnhub + Claude API calls
// Suggested approach:
//   1. GET https://finnhub.io/api/v1/news?category=general&token=YOUR_KEY
//   2. Pass headlines to Claude API: summarize + classify sentiment
//   3. Cache results in localStorage with a TTL of ~15 minutes
const PLACEHOLDER_NEWS = [
  {
    ticker: 'NVDA',
    headline: 'Fed signals rate pause — tech stocks rally on cooling inflation data',
    summary: 'NVIDIA leads gains as investors price in fewer hikes through year-end.',
    sentiment: 'bullish',
    source: 'Reuters',
    time: 'Placeholder',
  },
  {
    ticker: 'USD/JPY',
    headline: 'Yen weakens past 155 as BOJ holds ultra-loose policy stance',
    summary: 'Bank of Japan reaffirms yield curve control; market watches 160 level.',
    sentiment: 'neutral',
    source: 'Bloomberg',
    time: 'Placeholder',
  },
  {
    ticker: '3382',
    headline: '7-Eleven Holdings forecasts Q2 profit decline amid store-cost pressures',
    summary: 'Rising labor and energy costs squeeze convenience sector margins in Japan.',
    sentiment: 'bearish',
    source: 'Nikkei',
    time: 'Placeholder',
  },
];

const SENTIMENT_LABEL = { bullish: 'Bullish', bearish: 'Bearish', neutral: 'Neutral' };

export default function FinanceNews() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Market News</h1>
          <p className="page-sub">Summaries &amp; sentiment — placeholder data</p>
        </div>
        <Link to="/finance" className="btn-secondary">← Overview</Link>
      </div>

      <div className="finance-flag">
        Placeholder news — wire Finnhub + Claude API to replace these cards.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {PLACEHOLDER_NEWS.map((item, i) => (
          <div key={i} className="card news-card">
            <div className="news-card-header">
              <span className="news-ticker">{item.ticker}</span>
              <span className={`sentiment-tag sentiment-${item.sentiment}`}>
                {SENTIMENT_LABEL[item.sentiment]}
              </span>
            </div>
            <p className="news-headline">{item.headline}</p>
            <p className="news-summary">{item.summary}</p>
            <div className="news-meta">
              <span className="news-source">{item.source}</span>
              <span className="news-time">{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
