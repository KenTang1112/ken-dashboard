import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DEADLINES, TYPE_COLORS } from '../data/deadlines';
import { TIMETABLE, PERIODS } from '../data/schedule';
import { JLPT_SECTIONS } from '../data/jlpt';
import { RESEARCH_PROJECTS, STATUS_META } from '../data/research';
import { KANJI_LS_KEYS, QUIZ_SCHEDULE, getWeaknessScores, getKanjiProgress } from '../data/kanji';
import { getNotes, addNote } from '../data/notes';
import { fetchNews } from '../data/news';
import { useFinanceAuth } from '../context/FinanceAuthContext';

// ── Helpers ────────────────────────────────────────────────────────────────

function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(dateStr) - today) / (1000 * 60 * 60 * 24));
}

function todayClasses() {
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  return TIMETABLE[days[new Date().getDay()]] || [];
}

function CountdownBadge({ days }) {
  if (days < 0)   return <span className="badge badge-done">Done</span>;
  if (days === 0) return <span className="badge badge-today">Today</span>;
  if (days <= 3)  return <span className="badge badge-urgent">{days}d</span>;
  if (days <= 7)  return <span className="badge badge-soon">{days}d</span>;
  return <span className="badge badge-normal">{days}d</span>;
}

// Compute streak from session history: assumes each session has a `date` field (YYYY-MM-DD)
function computeStreak(sessionsRaw) {
  try {
    const sessions = JSON.parse(sessionsRaw || '[]');
    if (!Array.isArray(sessions) || sessions.length === 0) return 0;
    const dates = [...new Set(sessions.map(s => s.date).filter(Boolean))].sort().reverse();
    if (!dates.length) return 0;
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (dates[0] !== today && dates[0] !== yesterday) return 0;
    let streak = 1;
    for (let i = 1; i < dates.length; i++) {
      const diff = (new Date(dates[i - 1]) - new Date(dates[i])) / 86400000;
      if (diff === 1) streak++;
      else break;
    }
    return streak;
  } catch { return 0; }
}

function toMonthly(amount, freq) {
  const n = Number(amount) || 0;
  if (freq === 'weekly') return n * 4;
  if (freq === 'one-time') return 0;
  return n;
}

function fmt(n) { return '¥' + (Number(n) || 0).toLocaleString(); }

function loadFinanceSummary() {
  try {
    const s = localStorage.getItem('ken_finance_v2');
    if (!s) return null;
    const { income = [], fixed = [] } = JSON.parse(s);
    const totalIncome = income.reduce((a, r) => a + toMonthly(r.amount, r.frequency), 0);
    const totalFixed  = fixed.reduce((a, r)  => a + toMonthly(r.amount, r.frequency), 0);
    return { totalIncome, totalFixed, balance: totalIncome - totalFixed };
  } catch { return null; }
}


// ── Quick Note (preserved from original dashboard) ───────────────────────────
function QuickNoteWidget() {
  const [input, setInput] = useState('');
  const [saved, setSaved] = useState(false);
  const [notes, setNotes] = useState(() => getNotes().filter(n => !n.processed).slice(0, 3));

  function handleSave() {
    if (!input.trim()) return;
    const updated = addNote(input);
    setNotes(updated.filter(n => !n.processed).slice(0, 3));
    setInput('');
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function handleKey(e) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave();
  }

  return (
    <section className="card span-2" style={{ marginTop: 0 }}>
      <h2 className="card-title">📝 Quick Note</h2>
      <textarea
        className="notes-textarea notes-textarea-sm"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Quick note — processed by daily routine... (Ctrl+Enter to save)"
        rows={2}
      />
      <div className="notes-input-row" style={{ marginTop: 6 }}>
        <button className={`btn-primary${saved?' btn-saved':''}`} onClick={handleSave} disabled={!input.trim()}>
          {saved ? '✓ Saved' : 'Save Note'}
        </button>
        <Link to="/notes" className="card-link" style={{ marginLeft: 'auto' }}>All notes →</Link>
      </div>
      {notes.length > 0 && (
        <div className="widget-notes-list">
          {notes.map(n => (
            <div key={n.id} className="widget-note-item">
              <span className="widget-note-ts">{n.timestamp}</span>
              <span className="widget-note-text">{n.text}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ── Widget Cards ─────────────────────────────────────────────────────────────

function WidgetCard({ to, icon, title, children }) {
  return (
    <Link to={to} className="widget-card">
      <div className="widget-header">
        <div className="widget-icon-title">
          <span className="widget-icon">{icon}</span>
          <span className="widget-title">{title}</span>
        </div>
        <span className="widget-arrow">→</span>
      </div>
      <div className="widget-body">
        {children}
      </div>
    </Link>
  );
}

function ScheduleWidget() {
  const schedule = todayClasses();
  const dayName = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()];

  return (
    <WidgetCard to="/schedule" icon="📅" title={`Schedule — ${dayName}`}>
      {schedule.length === 0 ? (
        <p className="empty-state">No classes today</p>
      ) : (
        <div className="today-schedule">
          {schedule.map((item, i) => {
            const period = PERIODS.find(p => p.id === item.period);
            return (
              <div key={i} className="schedule-item">
                <div className="schedule-dot" style={{ background: item.color }} />
                <div>
                  <div className="schedule-class">{item.short}</div>
                  <div className="schedule-time">{period?.time}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </WidgetCard>
  );
}

function DeadlinesWidget({ upcoming }) {
  const top3 = upcoming.slice(0, 3);
  return (
    <WidgetCard to="/deadlines" icon="🔴" title="Deadlines">
      <div className="deadline-list">
        {top3.length === 0
          ? <p className="empty-state">No upcoming deadlines</p>
          : top3.map((d, i) => (
            <div key={i} className="deadline-row">
              <span className="deadline-dot" style={{ background: TYPE_COLORS[d.type] }} />
              <span className="deadline-label" style={{ fontSize: 12 }}>{d.label}</span>
              <CountdownBadge days={d.days} />
            </div>
          ))
        }
      </div>
    </WidgetCard>
  );
}

function KanjiWidget() {
  const [data, setData] = useState({ streak: 0, dueCount: 0, totalWords: 0 });

  useEffect(() => {
    const scores = getWeaknessScores();
    const totalWords = Object.keys(scores).length;
    const dueCount = Object.values(scores).filter(v => v >= 5).length;
    const sessionRaw = localStorage.getItem(KANJI_LS_KEYS.sessionHistory);
    const streak = computeStreak(sessionRaw);
    setData({ streak, dueCount, totalWords });
  }, []);

  const nextQuiz = QUIZ_SCHEDULE.find(q => !q.done && daysUntil(q.date) >= 0);
  const nextDays = nextQuiz ? daysUntil(nextQuiz.date) : null;

  return (
    <WidgetCard to="/kanji" icon="漢" title="Kanji">
      <div className="widget-stat-row">
        <div className="widget-stat">
          <span className="widget-stat-num">{data.streak > 0 ? data.streak : '—'}</span>
          <span className="widget-stat-label">day streak</span>
        </div>
        <div className="widget-stat">
          <span className="widget-stat-num" style={{ color: data.dueCount > 0 ? 'var(--red)' : 'var(--green)' }}>
            {data.dueCount}
          </span>
          <span className="widget-stat-label">due for review</span>
        </div>
      </div>
      {nextQuiz && (
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-2)' }}>
          Next quiz: <strong>{nextQuiz.chapters}</strong>
          {nextDays != null && (
            <span style={{ marginLeft: 6 }}>
              <CountdownBadge days={nextDays} />
            </span>
          )}
        </div>
      )}
    </WidgetCard>
  );
}

function JLPTWidget() {
  const total = JLPT_SECTIONS.length;
  const active = JLPT_SECTIONS.filter(s => s.status === 'active' || s.status === 'supported').length;
  const done   = JLPT_SECTIONS.filter(s => s.status === 'done').length;
  const pct = Math.round((done / total) * 100);

  return (
    <WidgetCard to="/jlpt" icon="🎯" title="JLPT N2">
      <div className="widget-stat-row">
        <div className="widget-stat">
          <span className="widget-stat-num">TBD</span>
          <span className="widget-stat-label">exam date</span>
        </div>
        <div className="widget-stat">
          <span className="widget-stat-num">{pct}%</span>
          <span className="widget-stat-label">sections done</span>
        </div>
      </div>
      <div style={{ marginTop: 10 }}>
        <div className="widget-progress-bar">
          <div className="widget-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 4 }}>
          {active} active · {done} done · {total - active - done} not started
        </div>
      </div>
    </WidgetCard>
  );
}

function ResearchWidget() {
  const activeProjects = RESEARCH_PROJECTS
    .map(p => ({ ...p, days: p.dueDate ? daysUntil(p.dueDate) : null }))
    .filter(p => p.status !== 'done')
    .sort((a, b) => {
      if (a.days == null) return 1;
      if (b.days == null) return -1;
      return a.days - b.days;
    });

  const current = activeProjects[0] || null;
  const meta = current ? STATUS_META[current.status] : null;

  return (
    <WidgetCard to="/research" icon="🔬" title="Research">
      {current ? (
        <>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, lineHeight: 1.3 }}>
            {current.title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span className="type-dot" style={{ background: meta?.color }} />
            <span className="type-label">{meta?.label}</span>
            {current.days != null && <CountdownBadge days={current.days} />}
          </div>
          {current.notes && (
            <div style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.4 }}>
              {current.notes}
            </div>
          )}
          {activeProjects.length > 1 && (
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>
              +{activeProjects.length - 1} more active
            </div>
          )}
        </>
      ) : (
        <p className="empty-state">No active projects</p>
      )}
    </WidgetCard>
  );
}

function NewsWidget() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews(3)
      .then(data => { setItems(data); setLoading(false); })
      .catch(()  => { setLoading(false); });
  }, []);

  return (
    <WidgetCard to="/finance/news" icon="📰" title="Market News">
      {loading && <p className="empty-state" style={{ fontSize: 11 }}>Loading…</p>}
      {!loading && items.length === 0 && <p className="empty-state" style={{ fontSize: 11 }}>Could not load news</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((item, i) => (
          <div key={i} className="widget-news-row">
            {item.ticker && <span className="news-ticker" style={{ fontSize: 11 }}>{item.ticker}</span>}
            <span style={{ flex: 1, fontSize: 12, color: 'var(--text)', lineHeight: 1.3 }}>{item.headline}</span>
            <span className={`sentiment-tag sentiment-${item.sentiment}`}>{item.sentiment}</span>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

function FinanceWidget() {
  const { authenticated } = useFinanceAuth();
  const summary = authenticated ? loadFinanceSummary() : null;

  return (
    <Link to="/finance" className="widget-card widget-card-finance">
      <div className="widget-header">
        <div className="widget-icon-title">
          <span className="widget-icon">💰</span>
          <span className="widget-title">Finance</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {!authenticated && <span className="widget-lock-badge">🔒 Locked</span>}
          <span className="widget-arrow">→</span>
        </div>
      </div>

      <div className="widget-body">
        <div className="widget-finance-row">
          <div className="widget-finance-item">
            <span className="widget-finance-label">Income</span>
            <span className={`widget-finance-value${!authenticated ? ' widget-blurred' : ' fsb-green'}`}>
              {authenticated && summary ? fmt(summary.totalIncome) : '¥●●●●●'}
            </span>
          </div>
          <div className="widget-finance-item">
            <span className="widget-finance-label">Fixed</span>
            <span className={`widget-finance-value${!authenticated ? ' widget-blurred' : ' fsb-red'}`}>
              {authenticated && summary ? fmt(summary.totalFixed) : '¥●●●●●'}
            </span>
          </div>
          <div className="widget-finance-item">
            <span className="widget-finance-label">Balance</span>
            <span className={`widget-finance-value${!authenticated ? ' widget-blurred' : (summary?.balance >= 0 ? ' fsb-green' : ' fsb-red')}`}>
              {authenticated && summary ? fmt(summary.balance) : '¥●●●●●'}
            </span>
          </div>
        </div>
        {!authenticated && (
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8, textAlign: 'center' }}>
            Tap to unlock
          </p>
        )}
      </div>
    </Link>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const today = new Date();

  const upcoming = useMemo(() =>
    DEADLINES
      .map(d => ({ ...d, days: daysUntil(d.date) }))
      .filter(d => d.days >= 0)
      .sort((a, b) => a.days - b.days),
    []
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">
            {today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Widget grid */}
      <div className="widget-grid">
        <ScheduleWidget />
        <DeadlinesWidget upcoming={upcoming} />
        <KanjiWidget />
        <JLPTWidget />
        <ResearchWidget />
        <NewsWidget />
        <div className="widget-span-2">
          <FinanceWidget />
        </div>
      </div>

      {/* Quick Note */}
      <div className="dashboard-grid" style={{ marginTop: 0 }}>
        <QuickNoteWidget />
      </div>
    </div>
  );
}
