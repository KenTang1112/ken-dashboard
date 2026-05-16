import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchNews } from '../data/news';

const SENTIMENT_LABEL = { bullish: 'Bullish', bearish: 'Bearish', neutral: 'Neutral' };

export default function FinanceNews() {
  const [news, setNews]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    fetchNews(8)
      .then(items => { setNews(items); setLoading(false); })
      .catch(e    => { setError(e.message); setLoading(false); });
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Market News</h1>
          <p className="page-sub">Live headlines via Yahoo Finance · refreshes every 15 min</p>
        </div>
        <Link to="/finance" className="btn-secondary">← Overview</Link>
      </div>

      {loading && <p className="empty-state" style={{ padding: '40px 0', textAlign: 'center' }}>Loading news…</p>}

      {error && (
        <div className="card" style={{ borderColor: '#FCA5A5', background: '#FFF5F5' }}>
          <p style={{ color: 'var(--red)', fontSize: 13 }}>Could not load news: {error}</p>
        </div>
      )}

      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {news.map((item, i) => (
            <a
              key={i}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="card news-card"
              style={{ textDecoration: 'none', color: 'inherit', display: 'block', transition: 'border-color 0.15s' }}
            >
              <div className="news-card-header">
                {item.ticker && <span className="news-ticker">{item.ticker}</span>}
                <span className={`sentiment-tag sentiment-${item.sentiment}`}>
                  {SENTIMENT_LABEL[item.sentiment]}
                </span>
              </div>
              <p className="news-headline">{item.headline}</p>
              {item.summary && <p className="news-summary">{item.summary}</p>}
              <div className="news-meta">
                <span className="news-source">{item.source}</span>
                <span className="news-time">{item.time}</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
