import { useState } from 'react';
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

async function hashPin(pin) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pin));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

const NAV_CARDS = [
  { to: '/finance/tracker',     icon: '💰', label: 'Tracker',     desc: 'Income & expense ledger' },
  { to: '/finance/investments', icon: '📈', label: 'Investments', desc: 'Portfolio & watchlist' },
  { to: '/finance/news',        icon: '📰', label: 'News',        desc: 'Market & stock updates' },
];

function ChangePinPanel({ onClose }) {
  const NUMPAD = ['1','2','3','4','5','6','7','8','9','del','0','ok'];
  const [step, setStep]     = useState('new');   // 'new' | 'confirm'
  const [newPin, setNewPin] = useState([]);
  const [confPin, setConfPin] = useState([]);
  const [error, setError]   = useState('');
  const [done, setDone]     = useState(false);

  const current = step === 'new' ? newPin : confPin;
  const setter  = step === 'new' ? setNewPin : setConfPin;

  function press(key) {
    setError('');
    if (key === 'del') { setter(d => d.slice(0, -1)); return; }
    if (key === 'ok' || current.length === 3) {
      const next = key === 'ok' ? current : [...current, key];
      if (next.length < 4) { setter(next); return; }
      const full = [...current, ...(key === 'ok' ? [] : [key])].slice(0, 4);
      if (full.length < 4) { setter(full); return; }
      if (step === 'new') {
        setNewPin(full);
        setStep('confirm');
      } else {
        if (full.join('') !== newPin.join('')) {
          setError('PINs do not match — try again');
          setConfPin([]);
          setStep('new');
          setNewPin([]);
        } else {
          hashPin(full.join('')).then(h => {
            localStorage.setItem('ken_pin_hash', h);
            setDone(true);
          });
        }
      }
      return;
    }
    setter(d => [...d, key]);
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
      <p className="change-pin-step">
        {step === 'new' ? 'Enter new PIN' : 'Confirm new PIN'}
      </p>
      <div className="pin-display" style={{ justifyContent: 'center', marginBottom: 8 }}>
        {[0,1,2,3].map(i => (
          <div key={i} className={`pin-dot${current.length > i ? ' filled' : ''}`} />
        ))}
      </div>
      {error && <p className="pin-error">{error}</p>}
      <div className="pin-numpad" style={{ margin: '10px auto', width: 'fit-content' }}>
        {NUMPAD.map(key => {
          if (key === 'del') return (
            <button key="del" className="pin-btn pin-btn-delete" style={{ width: 54, height: 54, fontSize: 16 }} onClick={() => press('del')}>⌫</button>
          );
          if (key === 'ok') return (
            <button key="ok" className="pin-btn pin-btn-confirm" style={{ width: 54, height: 54, fontSize: 16 }} onClick={() => press('ok')} disabled={current.length < 4}>✓</button>
          );
          return <button key={key} className="pin-btn" style={{ width: 54, height: 54, fontSize: 18 }} onClick={() => press(key)}>{key}</button>;
        })}
      </div>
      <button className="btn-secondary" style={{ width: '100%', marginTop: 4 }} onClick={onClose}>Cancel</button>
    </div>
  );
}

export default function FinanceOverview() {
  const { lock } = useFinanceAuth();
  const [changingPin, setChangingPin] = useState(false);
  const summary = loadSummary();

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
