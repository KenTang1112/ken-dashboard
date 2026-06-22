import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useFinanceAuth } from '../context/FinanceAuthContext';
import { useUser } from '../context/UserContext';

// ── Helpers ───────────────────────────────────────────────────────────────────
function toMonthly(amount, freq) {
  const n = Number(amount) || 0;
  if (freq === 'weekly') return n * 4;
  if (freq === 'one-time') return 0;
  return n;
}

function fmt(n) { return '¥' + (Number(n) || 0).toLocaleString(); }

function fmtShort(n) {
  if (n >= 1_000_000) return '¥' + (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 10_000) return '¥' + Math.round(n / 1000) + 'k';
  return fmt(n);
}

function loadData(storageKey) {
  try {
    const s = localStorage.getItem(storageKey);
    if (s) return JSON.parse(s);
  } catch {}
  return null;
}

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function buildMonthlySpend(variable = []) {
  const now    = new Date();
  const result = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const total = variable
      .filter(tx => tx.date?.startsWith(key))
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
    result.push({ month: MONTHS_SHORT[d.getMonth()], total, isCurrent: i === 0 });
  }
  return result;
}

// ── Change PIN panel ──────────────────────────────────────────────────────────
async function hashPin(pin) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pin));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

const NUMPAD = ['1','2','3','4','5','6','7','8','9','del','0','ok'];

function ChangePinPanel({ onClose }) {
  const { setItem } = useUser();
  const [step, setStep]     = useState('new');
  const [newPin, setNewPin] = useState([]);
  const [confPin, setConfPin] = useState([]);
  const [error, setError]   = useState('');
  const [done, setDone]     = useState(false);

  const current = step === 'new' ? newPin : confPin;
  const setter  = step === 'new' ? setNewPin : setConfPin;

  function press(key) {
    setError('');
    if (key === 'del') { setter(d => d.slice(0, -1)); return; }
    if (current.length >= 4) return;
    const next = [...current, key];
    setter(next);
    if (next.length === 4) {
      if (step === 'new') {
        setNewPin(next);
        setStep('confirm');
        setConfPin([]);
      } else {
        if (next.join('') !== newPin.join('')) {
          setError('PINs do not match — try again');
          setStep('new');
          setNewPin([]);
          setConfPin([]);
        } else {
          hashPin(next.join('')).then(h => { setItem('pin_hash', h); setDone(true); });
        }
      }
    }
  }

  if (done) return (
    <div className="change-pin-panel">
      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--green)', textAlign: 'center', padding: '12px 0' }}>
        ✓ PIN updated successfully
      </p>
      <button className="btn-secondary" style={{ width: '100%' }} onClick={onClose}>Close</button>
    </div>
  );

  return (
    <div className="change-pin-panel">
      <p className="change-pin-step">{step === 'new' ? 'Enter new PIN' : 'Confirm new PIN'}</p>
      <div className="pin-display" style={{ justifyContent: 'center', marginBottom: 8 }}>
        {[0,1,2,3].map(i => (
          <div key={i} className={`pin-dot${current.length > i ? ' filled' : ''}`} />
        ))}
      </div>
      {error && <p className="pin-error">{error}</p>}
      <div className="pin-numpad" style={{ margin: '10px auto', width: 'fit-content' }}>
        {NUMPAD.map(key => {
          if (key === 'del') return (
            <button key="del" className="pin-btn pin-btn-delete" style={{ width: 54, height: 54 }} onClick={() => press('del')}>⌫</button>
          );
          if (key === 'ok') return (
            <button key="ok" className="pin-btn pin-btn-confirm" style={{ width: 54, height: 54 }} onClick={() => press('ok')} disabled={current.length < 4}>✓</button>
          );
          return <button key={key} className="pin-btn" style={{ width: 54, height: 54 }} onClick={() => press(key)}>{key}</button>;
        })}
      </div>
      <button className="btn-secondary" style={{ width: '100%', marginTop: 4 }} onClick={onClose}>Cancel</button>
    </div>
  );
}

// ── Bar Chart ─────────────────────────────────────────────────────────────────
function SpendBarChart({ data }) {
  const max = Math.max(...data.map(d => d.total), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80, position: 'relative', paddingBottom: 22 }}>
      {data.map((d, i) => {
        const h = Math.max(4, Math.round((d.total / max) * 60));
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div
              className={`fo-bar${d.isCurrent ? ' active' : ''}`}
              style={{ height: h, width: '100%' }}
              title={`${d.month}: ${fmt(d.total)}`}
            />
            <span className="fo-bar-month" style={{ position: 'static', fontSize: 9, color: d.isCurrent ? 'var(--text)' : 'var(--text-3)' }}>
              {d.month.toUpperCase()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const NAV_CARDS = [
  { to: '/finance/tracker',     icon: '💰', label: 'Tracker',     desc: 'Income & expense ledger' },
  { to: '/finance/investments', icon: '📈', label: 'Investments', desc: 'Portfolio & watchlist' },
  { to: '/finance/news',        icon: '📰', label: 'News',        desc: 'Market & stock updates' },
];

// ── Main ──────────────────────────────────────────────────────────────────────
export default function FinanceOverview() {
  const { lock } = useFinanceAuth();
  const { activeUser, setItem } = useUser();
  const [changingPin, setChangingPin] = useState(false);

  const data = loadData(`${activeUser}_finance_v2`);

  const summary = useMemo(() => {
    if (!data) return null;
    const { income = [], fixed = [] } = data;
    const totalIncome = income.reduce((a, r) => a + toMonthly(r.amount, r.frequency), 0);
    const totalFixed  = fixed.reduce((a, r)  => a + toMonthly(r.amount, r.frequency), 0);
    return { totalIncome, totalFixed, balance: totalIncome - totalFixed };
  }, [data]);

  const monthlySpend = useMemo(() => buildMonthlySpend(data?.variable), [data]);

  const recentTx = useMemo(() =>
    [...(data?.variable ?? [])]
      .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
      .slice(0, 6),
    [data]
  );

  const inPct  = summary ? Math.round((summary.totalIncome / (summary.totalIncome + summary.totalFixed || 1)) * 100) : 0;
  const outPct = 100 - inPct;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Finance</h1>
          <p className="page-sub">Overview</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-secondary" onClick={() => setChangingPin(p => !p)}>🔑 Change PIN</button>
          <button className="btn-secondary" onClick={lock}>🔒 Lock</button>
        </div>
      </div>

      {changingPin && <ChangePinPanel onClose={() => setChangingPin(false)} />}

      {/* ── Top row: balance + cashflow ── */}
      <div className="fo-top-row">
        {/* Balance card */}
        <div className="fo-balance-card">
          <div className="fo-section-label">Balance</div>
          <div className="fo-balance-amount">
            {summary ? fmt(summary.balance) : '¥ —'}
          </div>
          {/* Bar chart — spending per month */}
          <SpendBarChart data={monthlySpend} />
        </div>

        {/* Cashflow card */}
        <div className="fo-cashflow-card">
          <div className="fo-section-label">Cashflow</div>
          <div className="fo-cashflow-amount">
            {summary ? fmtShort(summary.totalIncome - summary.totalFixed) : '¥ —'}
          </div>
          <hr className="fo-cashflow-divider" />
          <div className="fo-cashflow-row">
            <div>
              <span className="fo-flow-item-value fo-flow-in">
                {summary ? fmtShort(summary.totalIncome) : '—'}
              </span>
              <span className="fo-flow-item-label">in</span>
              <div className="fo-flow-bar fo-flow-bar-in" style={{ width: `${inPct}%` }} />
              <span className="fo-flow-pct fo-flow-pct-in">{inPct}%</span>
            </div>
            <div>
              <span className="fo-flow-item-value fo-flow-out">
                {summary ? fmtShort(summary.totalFixed) : '—'}
              </span>
              <span className="fo-flow-item-label">out</span>
              <div className="fo-flow-bar fo-flow-bar-out" style={{ width: `${outPct}%` }} />
              <span className="fo-flow-pct fo-flow-pct-out">{outPct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation cards ── */}
      <div className="fo-nav-grid">
        {NAV_CARDS.map(({ to, icon, label, desc }) => (
          <Link key={to} to={to} className="fo-nav-card">
            <span className="fo-nav-icon">{icon}</span>
            <span className="fo-nav-label">{label}</span>
            <span className="fo-nav-desc">{desc}</span>
            <span className="fo-nav-arrow">→</span>
          </Link>
        ))}
      </div>

      {/* ── Recent Transactions ── */}
      <div className="card">
        <div className="card-title-row">
          <h2 className="card-title">Recent Transactions</h2>
          <Link to="/finance/tracker" className="card-link">View all →</Link>
        </div>
        {recentTx.length === 0 ? (
          <p className="empty-state">No transactions yet — open Tracker to add expenses.</p>
        ) : (
          <table className="fo-tx-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentTx.map((tx, i) => (
                <tr key={i}>
                  <td className="fo-tx-date">{tx.date ?? '—'}</td>
                  <td>{tx.description ?? '—'}</td>
                  <td><span className="fo-tx-cat">{tx.category ?? '—'}</span></td>
                  <td className="fo-tx-amount" style={{ color: 'var(--red)' }}>{fmt(tx.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Monthly summary ── */}
      {summary && (
        <div className="card">
          <h2 className="card-title">Monthly Summary</h2>
          <div className="fsb">
            <div className="fsb-item">
              <span className="fsb-label">Income</span>
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
        </div>
      )}
    </div>
  );
}
