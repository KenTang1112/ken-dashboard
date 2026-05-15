import financeData from '../data/finance.json';

const { fixedBaseline, fixedCosts, balances, expenses, income } = financeData;

const CATEGORY_COLORS = {
  'Housing':             '#6366F1',
  'Phone':               '#8B5CF6',
  'Utilities':           '#3B82F6',
  'Food & Groceries':    '#10B981',
  'Transport':           '#F59E0B',
  'Entertainment':       '#EC4899',
  'Clothing':            '#14B8A6',
  'Health':              '#EF4444',
  'Investment Transfer': '#F97316',
  'Other':               '#6B7280',
};

function fmt(n) {
  return n == null ? '—' : '¥' + n.toLocaleString();
}

function monthKey(dateStr) {
  return dateStr.slice(0, 7);
}

function monthLabel(key) {
  const [y, m] = key.split('-');
  return new Date(+y, +m - 1).toLocaleString('en', { month: 'long', year: 'numeric' });
}

export default function Finance() {
  const latest = balances[balances.length - 1];
  const prev   = balances[balances.length - 2];

  const travelDelta = (latest && prev && prev.travelCard != null && latest.travelCard != null)
    ? latest.travelCard - prev.travelCard : null;
  const bankDelta = (latest && prev && prev.bank != null && latest.bank != null)
    ? latest.bank - prev.bank : null;

  const byMonth = {};
  expenses.forEach(e => {
    const k = monthKey(e.date);
    if (!byMonth[k]) byMonth[k] = [];
    byMonth[k].push(e);
  });
  const months = Object.keys(byMonth).sort().reverse();

  const latestMonth = months[0];
  const latestMonthTotal = latestMonth
    ? byMonth[latestMonth].reduce((s, e) => s + e.amount, 0) : 0;
  const latestMonthIncome = income
    .filter(i => monthKey(i.date) === latestMonth)
    .reduce((s, i) => s + i.amount, 0);
  const hasInvestmentTransfer = latestMonth
    ? byMonth[latestMonth].some(e => e.category === 'Investment Transfer') : false;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Finance</h1>
          <p className="page-sub">Personal finance tracker</p>
        </div>
      </div>

      {/* Balances */}
      {latest && (
        <div className="card">
          <h2 className="card-title">
            Balances — {new Date(latest.date).toLocaleString('en', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="stats-row">
            <div className="stat-card">
              <span className="stat-num" style={{ fontSize: '1.1rem' }}>{fmt(latest.travelCard)}</span>
              <span className="stat-label">Travel Card</span>
              {travelDelta != null && (
                <span className="stat-delta" style={{ color: travelDelta >= 0 ? '#10B981' : '#EF4444' }}>
                  {travelDelta >= 0 ? '+' : ''}{fmt(travelDelta)} vs prev
                </span>
              )}
            </div>
            <div className="stat-card">
              <span className="stat-num" style={{ fontSize: '1.1rem' }}>{fmt(latest.bank)}</span>
              <span className="stat-label">Bank</span>
              {bankDelta != null && (
                <span className="stat-delta" style={{ color: bankDelta >= 0 ? '#10B981' : '#EF4444' }}>
                  {bankDelta >= 0 ? '+' : ''}{fmt(bankDelta)} vs prev
                </span>
              )}
            </div>
            <div className="stat-card">
              <span className="stat-num" style={{ fontSize: '1.1rem' }}>{fmt(latest.cash)}</span>
              <span className="stat-label">Cash</span>
            </div>
          </div>
        </div>
      )}

      {/* Monthly summary */}
      {latestMonth && (
        <div className="card">
          <h2 className="card-title">Monthly Summary — {monthLabel(latestMonth)}</h2>
          {!hasInvestmentTransfer && (
            <div className="finance-flag">
              ⚠️ No Investment Transfer logged this month
            </div>
          )}
          <div className="finance-summary-row">
            <div className="finance-summary-item">
              <span className="finance-summary-label">Total spend</span>
              <span className="finance-summary-value">{fmt(latestMonthTotal)}</span>
            </div>
            <div className="finance-summary-item">
              <span className="finance-summary-label">Fixed baseline</span>
              <span className="finance-summary-value">{fmt(fixedBaseline)}</span>
            </div>
            <div className="finance-summary-item">
              <span className="finance-summary-label">Δ vs baseline</span>
              <span className="finance-summary-value" style={{
                color: latestMonthTotal <= fixedBaseline ? '#10B981' : '#EF4444'
              }}>
                {latestMonthTotal <= fixedBaseline ? '' : '+'}{fmt(latestMonthTotal - fixedBaseline)}
              </span>
            </div>
            {latestMonthIncome > 0 && (
              <div className="finance-summary-item">
                <span className="finance-summary-label">Income</span>
                <span className="finance-summary-value" style={{ color: '#10B981' }}>{fmt(latestMonthIncome)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fixed costs */}
      <div className="card">
        <h2 className="card-title">Fixed Monthly Costs</h2>
        <div className="finance-fixed-list">
          {fixedCosts.map((f, i) => (
            <div key={i} className="finance-fixed-row">
              <span className="finance-cat-dot" style={{ background: CATEGORY_COLORS[f.category] || '#6B7280' }} />
              <span className="finance-fixed-desc">{f.description}</span>
              <span className="finance-fixed-amount">{fmt(f.amount)}</span>
            </div>
          ))}
          <div className="finance-fixed-row finance-fixed-total">
            <span className="finance-cat-dot" style={{ background: 'transparent' }} />
            <span className="finance-fixed-desc">Baseline total</span>
            <span className="finance-fixed-amount">{fmt(fixedBaseline)}</span>
          </div>
        </div>
      </div>

      {/* Expense log */}
      <div className="card">
        <h2 className="card-title">Expense Log</h2>
        {months.length === 0 ? (
          <p className="empty-state">No expenses logged yet.</p>
        ) : (
          months.map(m => (
            <div key={m} className="finance-month-group">
              <div className="finance-month-header">
                <span>{monthLabel(m)}</span>
                <span>{fmt(byMonth[m].reduce((s, e) => s + e.amount, 0))}</span>
              </div>
              <div className="finance-expense-list">
                {byMonth[m].map((e, i) => (
                  <div key={i} className="finance-expense-row">
                    <span className="finance-cat-dot" style={{ background: CATEGORY_COLORS[e.category] || '#6B7280' }} />
                    <span className="finance-expense-date">{e.date.slice(5)}</span>
                    <span className="finance-expense-desc">{e.description}</span>
                    <span className="finance-expense-via">{e.paidVia}</span>
                    <span className="finance-expense-amount">{fmt(e.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Income log */}
      <div className="card">
        <h2 className="card-title">Income — カラオケ館</h2>
        {income.length === 0 ? (
          <p className="empty-state">No income logged yet.</p>
        ) : (
          <div className="finance-expense-list">
            {[...income].reverse().map((inc, i) => (
              <div key={i} className="finance-expense-row">
                <span className="finance-cat-dot" style={{ background: '#10B981' }} />
                <span className="finance-expense-date">{inc.date.slice(5)}</span>
                <span className="finance-expense-desc">{inc.description}</span>
                <span className="finance-expense-via">{inc.paidVia}</span>
                <span className="finance-expense-amount" style={{ color: '#10B981' }}>{fmt(inc.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
