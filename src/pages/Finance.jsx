import { useState } from 'react';
import financeData from '../data/finance.json';

const STORAGE_KEY = 'ken_finance_v2';
const CATEGORIES = ['Food & Groceries','Transport','Utilities','Housing','Phone','Entertainment','Clothing','Health','Investment Transfer','Other'];
const FREQS = ['monthly','weekly','one-time'];

function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2,6)}`; }
function fmt(n) { return '¥' + (Number(n) || 0).toLocaleString(); }
function toMonthly(amount, freq) {
  const n = Number(amount) || 0;
  if (freq === 'weekly') return n * 4;
  if (freq === 'one-time') return 0;
  return n;
}

function seed() {
  return {
    income: [],
    fixed: financeData.fixedCosts.map(f => ({ id: uid(), name: f.description, amount: f.amount, frequency: 'monthly' })),
    variable: financeData.expenses.map(e => ({ id: uid(), date: e.date, category: e.category, description: e.description, amount: e.amount })),
    lastUpdated: null,
  };
}

function load() {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return seed();
}

function save(data) {
  const d = { ...data, lastUpdated: new Date().toISOString().slice(0,10) };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  return d;
}

function buildMarkdown(data, totalIncome, totalFixed, balance) {
  const { income, fixed, variable } = data;
  return [
    '# Finance',
    '',
    '## Income',
    '| Source | Amount (¥) | Frequency |',
    '|--------|------------|-----------|',
    ...income.map(r => `| ${r.source} | ${Number(r.amount).toLocaleString()} | ${r.frequency} |`),
    '',
    '## Fixed Expenses',
    '| Name | Amount (¥) | Frequency |',
    '|------|------------|-----------|',
    ...fixed.map(r => `| ${r.name} | ${Number(r.amount).toLocaleString()} | ${r.frequency} |`),
    '',
    '## Variable Expenses',
    '| Date | Category | Description | Amount (¥) |',
    '|------|----------|-------------|------------|',
    ...variable.map(r => `| ${r.date} | ${r.category} | ${r.description} | ${Number(r.amount).toLocaleString()} |`),
    '',
    '## Summary',
    `- Total monthly income: ${fmt(totalIncome)}`,
    `- Total monthly fixed expenses: ${fmt(totalFixed)}`,
    `- Estimated monthly balance: ${fmt(balance)}`,
    `- Last updated: ${new Date().toISOString().slice(0,10)}`,
  ].join('\n');
}

export default function Finance() {
  const [data, setData] = useState(load);
  const [tab, setTab] = useState('income');
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const { income, fixed, variable } = data;

  const totalIncome  = income.reduce((s, r)  => s + toMonthly(r.amount, r.frequency), 0);
  const totalFixed   = fixed.reduce((s, r)   => s + toMonthly(r.amount, r.frequency), 0);
  const balance      = totalIncome - totalFixed;

  function set(key, rows) { setData(d => ({ ...d, [key]: rows })); setSaved(false); }

  // Income
  function addIncome()              { set('income', [...income, { id: uid(), source: '', amount: '', frequency: 'monthly' }]); }
  function removeIncome(id)         { set('income', income.filter(r => r.id !== id)); }
  function editIncome(id, f, v)     { set('income', income.map(r => r.id === id ? { ...r, [f]: v } : r)); }

  // Fixed
  function addFixed()               { set('fixed', [...fixed, { id: uid(), name: '', amount: '', frequency: 'monthly' }]); }
  function removeFixed(id)          { set('fixed', fixed.filter(r => r.id !== id)); }
  function editFixed(id, f, v)      { set('fixed', fixed.map(r => r.id === id ? { ...r, [f]: v } : r)); }

  // Variable
  function addVariable()            { set('variable', [...variable, { id: uid(), date: new Date().toISOString().slice(0,10), category: 'Food & Groceries', description: '', amount: '' }]); }
  function removeVariable(id)       { set('variable', variable.filter(r => r.id !== id)); }
  function editVariable(id, f, v)   { set('variable', variable.map(r => r.id === id ? { ...r, [f]: v } : r)); }

  function handleSave() {
    const saved = save(data);
    setData(saved);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleCopy() {
    navigator.clipboard.writeText(buildMarkdown(data, totalIncome, totalFixed, balance));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Finance</h1>
          <p className="page-sub">Personal finance tracker</p>
        </div>
        <button className={`btn-primary${saved ? ' btn-saved' : ''}`} onClick={handleSave}>
          {saved ? '✓ Saved' : 'Save'}
        </button>
      </div>

      {/* Summary bar */}
      <div className="fsb">
        <div className="fsb-item">
          <span className="fsb-label">Monthly Income</span>
          <span className="fsb-value fsb-green">{fmt(totalIncome)}</span>
        </div>
        <div className="fsb-item">
          <span className="fsb-label">Fixed Expenses</span>
          <span className="fsb-value fsb-red">{fmt(totalFixed)}</span>
        </div>
        <div className="fsb-item">
          <span className="fsb-label">Est. Balance</span>
          <span className={`fsb-value ${balance >= 0 ? 'fsb-green' : 'fsb-red'}`}>{fmt(balance)}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="fin-tabs">
        {[['income','Income'],['fixed','Fixed Expenses'],['variable','Variable'],['export','Export']].map(([k,l]) => (
          <button key={k} className={`fin-tab${tab===k?' active':''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {/* Income */}
      {tab === 'income' && (
        <div className="card">
          <h2 className="card-title">Income Sources</h2>
          <div className="fin-table">
            <div className="fin-head fin-head-3">
              <span>Source</span><span>Amount (¥)</span><span>Frequency</span><span />
            </div>
            {income.map(r => (
              <div key={r.id} className="fin-row fin-row-3">
                <input className="fin-input" value={r.source} placeholder="e.g. カラオケ館" onChange={e => editIncome(r.id,'source',e.target.value)} />
                <input className="fin-input fin-num" type="number" value={r.amount} placeholder="0" onChange={e => editIncome(r.id,'amount',e.target.value)} />
                <select className="fin-select" value={r.frequency} onChange={e => editIncome(r.id,'frequency',e.target.value)}>
                  {FREQS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <button className="fin-remove" onClick={() => removeIncome(r.id)}>×</button>
              </div>
            ))}
            <button className="fin-add" onClick={addIncome}>+ Add income source</button>
          </div>
        </div>
      )}

      {/* Fixed */}
      {tab === 'fixed' && (
        <div className="card">
          <h2 className="card-title">Fixed Expenses</h2>
          <div className="fin-table">
            <div className="fin-head fin-head-3">
              <span>Name</span><span>Amount (¥)</span><span>Frequency</span><span />
            </div>
            {fixed.map(r => (
              <div key={r.id} className="fin-row fin-row-3">
                <input className="fin-input" value={r.name} placeholder="e.g. Rent" onChange={e => editFixed(r.id,'name',e.target.value)} />
                <input className="fin-input fin-num" type="number" value={r.amount} placeholder="0" onChange={e => editFixed(r.id,'amount',e.target.value)} />
                <select className="fin-select" value={r.frequency} onChange={e => editFixed(r.id,'frequency',e.target.value)}>
                  {FREQS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <button className="fin-remove" onClick={() => removeFixed(r.id)}>×</button>
              </div>
            ))}
            <button className="fin-add" onClick={addFixed}>+ Add fixed expense</button>
          </div>
        </div>
      )}

      {/* Variable */}
      {tab === 'variable' && (
        <div className="card">
          <h2 className="card-title">Variable / One-time Expenses</h2>
          <div className="fin-table">
            <div className="fin-head fin-head-4">
              <span>Date</span><span>Category</span><span>Description</span><span>Amount (¥)</span><span />
            </div>
            {variable.map(r => (
              <div key={r.id} className="fin-row fin-row-4">
                <input className="fin-input" type="date" value={r.date} onChange={e => editVariable(r.id,'date',e.target.value)} />
                <select className="fin-select" value={r.category} onChange={e => editVariable(r.id,'category',e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input className="fin-input" value={r.description} placeholder="Description" onChange={e => editVariable(r.id,'description',e.target.value)} />
                <input className="fin-input fin-num" type="number" value={r.amount} placeholder="0" onChange={e => editVariable(r.id,'amount',e.target.value)} />
                <button className="fin-remove" onClick={() => removeVariable(r.id)}>×</button>
              </div>
            ))}
            <button className="fin-add" onClick={addVariable}>+ Add expense</button>
          </div>
        </div>
      )}

      {/* Export */}
      {tab === 'export' && (
        <div className="card">
          <h2 className="card-title">Export — finance.md</h2>
          <p className="info-note" style={{ marginBottom: 10 }}>
            Copy and paste to Claude to update your EA finance.md file, or log to Google Drive.
          </p>
          <button className={`btn-primary${copied?' btn-saved':''}`} style={{ marginBottom: 12 }} onClick={handleCopy}>
            {copied ? '✓ Copied' : 'Copy to Clipboard'}
          </button>
          <pre className="fin-export">{buildMarkdown(data, totalIncome, totalFixed, balance)}</pre>
        </div>
      )}

      {data.lastUpdated && (
        <p className="info-note" style={{ marginTop: 8, textAlign: 'right' }}>Last saved: {data.lastUpdated}</p>
      )}
    </div>
  );
}
