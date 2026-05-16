import { Link } from 'react-router-dom';
import { useFinanceAuth } from '../context/FinanceAuthContext';

// TODO: wire real portfolio data — suggested model:
// { ticker, name, shares, avgCost, currentPrice } per holding
// TODO: wire watchlist data — suggested model:
// { ticker, name, note, targetPrice }

export default function FinanceInvestments() {
  const { lock } = useFinanceAuth();

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Investments</h1>
          <p className="page-sub">Portfolio &amp; watchlist</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/finance" className="btn-secondary">← Overview</Link>
          <button className="btn-secondary" onClick={lock}>🔒</button>
        </div>
      </div>

      {/* Portfolio table */}
      <div className="card">
        <div className="card-title-row">
          <h2 className="card-title">Portfolio</h2>
          <span className="info-note">// TODO: populate holdings data</span>
        </div>
        <table className="deadline-table">
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Name</th>
              <th>Shares</th>
              <th>Avg Cost</th>
              <th>Current</th>
              <th>P&amp;L</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: '24px 0' }}>
                <p className="empty-state">No holdings yet — add your positions here.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Watchlist */}
      <div className="card">
        <div className="card-title-row">
          <h2 className="card-title">Watchlist</h2>
          <span className="info-note">// TODO: populate watchlist data</span>
        </div>
        <table className="deadline-table">
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Name</th>
              <th>Target Price</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', padding: '24px 0' }}>
                <p className="empty-state">No watchlist items yet.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
