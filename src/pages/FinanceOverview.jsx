import { Link } from 'react-router-dom';
import { useFinanceAuth } from '../context/FinanceAuthContext';

const FIN_KEY = 'ken_finance_v2';

function toMonthly(amount, freq) {
  const n = Number(amount) || 0;
  if (freq === 'weekly') return n * 4;
  if (freq === 'one-time') return 0;
  return n;
}

function fmt(n) { return '¥' + (Number(n) || 0).toLocaleString(); }

function loadSummary() {
  try {
    const s = localStorage.getItem(FIN_KEY);
    if (!s) return null;
    const { income = [], fixed = [] } = JSON.parse(s);
    const totalIncome = income.reduce((a, r) => a + toMonthly(r.amount, r.frequency), 0);
    const totalFixed  = fixed.reduce((a, r)  => a + toMonthly(r.amount, r.frequency), 0);
    return { totalIncome, totalFixed, balance: totalIncome - totalFixed };
  } catch { return null; }
}

const NAV_CARDS = [
  { to: '/finance/tracker',     icon: '💰', label: 'Tracker',     desc: 'Income & expense ledger' },
  { to: '/finance/investments', icon: '📈', label: 'Investments', desc: 'Portfolio & watchlist' },
  { to: '/finance/news',        icon: '📰', label: 'News',        desc: 'Market & stock updates' },
];

export default function FinanceOverview() {
  const { lock } = useFinanceAuth();
  const summary = loadSummary();

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Finance</h1>
          <p className="page-sub">Overview</p>
        </div>
        <button className="btn-secondary" onClick={lock}>🔒 Lock</button>
      </div>

      {/* Net worth — TODO: wire real asset/liability data */}
      <div className="card">
        <div className="card-title-row">
          <h2 className="card-title">Net Worth</h2>
          <span className="info-note">// TODO: add asset accounts</span>
        </div>
        <div className="fsb">
          <div className="fsb-item">
            <span className="fsb-label">Assets</span>
            <span className="fsb-value">¥—</span>
          </div>
          <div className="fsb-item">
            <span className="fsb-label">Liabilities</span>
            <span className="fsb-value">¥—</span>
          </div>
          <div className="fsb-item">
            <span className="fsb-label">Net Worth</span>
            <span className="fsb-value">¥—</span>
          </div>
        </div>
      </div>

      {/* Monthly summary from tracker data */}
      <div className="card">
        <h2 className="card-title">Monthly Summary</h2>
        {summary ? (
          <div className="fsb">
            <div className="fsb-item">
              <span className="fsb-label">Monthly Income</span>
              <span className="fsb-value fsb-green">{fmt(summary.totalIncome)}</span>
            </div>
            <div className="fsb-item">
              <span className="fsb-label">Fixed Expenses</span>
              <span className="fsb-value fsb-red">{fmt(summary.totalFixed)}</span>
            </div>
            <div className="fsb-item">
              <span className="fsb-label">Est. Balance</span>
              <span className={`fsb-value ${summary.balance >= 0 ? 'fsb-green' : 'fsb-red'}`}>
                {fmt(summary.balance)}
              </span>
            </div>
          </div>
        ) : (
          <p className="empty-state">No tracker data yet — open Tracker to add income &amp; expenses.</p>
        )}
      </div>

      {/* Navigation cards */}
      <div className="finance-nav-grid">
        {NAV_CARDS.map(({ to, icon, label, desc }) => (
          <Link key={to} to={to} className="finance-nav-card">
            <span className="finance-nav-icon">{icon}</span>
            <span className="finance-nav-label">{label}</span>
            <span className="finance-nav-desc">{desc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
