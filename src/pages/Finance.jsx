export default function Finance() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Finance</h1>
          <p className="page-sub">Personal finance tracker</p>
        </div>
      </div>

      <div className="card placeholder-card">
        <div className="placeholder-icon">💰</div>
        <h2 className="placeholder-title">Finance Tracker</h2>
        <p className="placeholder-body">
          Your personal finance tracker is in progress. This page will show income from
          カラオケ館, expenses, savings goals, and monthly summaries.
        </p>
        <div className="placeholder-sections">
          <div className="placeholder-section">
            <h3>Income</h3>
            <p>Part-time: カラオケ館 札幌駅前店 — schedule varies weekly</p>
          </div>
          <div className="placeholder-section">
            <h3>Coming soon</h3>
            <p>Monthly budget, savings rate, expense categories, and trends.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
