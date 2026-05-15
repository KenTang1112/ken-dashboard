import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DEADLINES, TYPE_COLORS } from '../data/deadlines';
import { TIMETABLE, PERIODS } from '../data/schedule';
import { getNotes, addNote } from '../data/notes';

function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(dateStr) - today) / (1000 * 60 * 60 * 24));
}

function CountdownBadge({ days }) {
  if (days < 0)  return <span className="badge badge-done">Done</span>;
  if (days === 0) return <span className="badge badge-today">Today</span>;
  if (days <= 3)  return <span className="badge badge-urgent">{days}d</span>;
  if (days <= 7)  return <span className="badge badge-soon">{days}d</span>;
  return <span className="badge badge-normal">{days}d</span>;
}

function todaySchedule() {
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  return TIMETABLE[days[new Date().getDay()]] || [];
}

function QuickNoteWidget() {
  const [input, setInput] = useState('');
  const [saved, setSaved] = useState(false);
  const [notes, setNotes] = useState(() => getNotes().filter(n => !n.processed).slice(0, 5));

  function handleSave() {
    if (!input.trim()) return;
    const updated = addNote(input);
    setNotes(updated.filter(n => !n.processed).slice(0, 5));
    setInput('');
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function handleKey(e) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave();
  }

  return (
    <>
      <textarea
        className="notes-textarea notes-textarea-sm"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Quick note — processed by daily routine..."
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
    </>
  );
}

export default function Dashboard() {
  const today = new Date();
  const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][today.getDay()];

  const upcoming = useMemo(() =>
    DEADLINES
      .map(d => ({ ...d, days: daysUntil(d.date) }))
      .filter(d => d.days >= 0 && d.days <= 14)
      .sort((a, b) => a.days - b.days)
      .slice(0, 8),
    []
  );

  const top3 = upcoming.slice(0, 3);
  const schedule = todaySchedule();

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">{today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Top 3 Priorities */}
        <section className="card span-2">
          <h2 className="card-title">⚡ Top Priorities</h2>
          <div className="priority-list">
            {top3.map((d, i) => (
              <div key={i} className="priority-item">
                <span className="priority-rank">{i + 1}</span>
                <div className="priority-info">
                  <span className="priority-label">{d.label}</span>
                  <span className="priority-class">{d.class}</span>
                </div>
                <CountdownBadge days={d.days} />
              </div>
            ))}
          </div>
        </section>

        {/* Today's Schedule */}
        <section className="card">
          <h2 className="card-title">📅 Today — {dayName}</h2>
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
        </section>

        {/* Quick Note Widget */}
        <section className="card">
          <h2 className="card-title">📝 Quick Note</h2>
          <QuickNoteWidget />
        </section>

        {/* Deadlines This Week */}
        <section className="card span-2">
          <div className="card-title-row">
            <h2 className="card-title">🔴 Next 14 Days</h2>
            <Link to="/deadlines" className="card-link">See all →</Link>
          </div>
          <div className="deadline-list">
            {upcoming.map((d, i) => (
              <div key={i} className="deadline-row">
                <span className="deadline-dot" style={{ background: TYPE_COLORS[d.type] }} />
                <span className="deadline-label">{d.label}</span>
                <span className="deadline-class-tag">{d.class}</span>
                <CountdownBadge days={d.days} />
              </div>
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <section className="card">
          <h2 className="card-title">Quick Links</h2>
          <div className="quick-links">
            <Link to="/classes" className="quick-btn">📚 Classes</Link>
            <Link to="/kanji" className="quick-btn">漢 Kanji</Link>
            <Link to="/jlpt" className="quick-btn">🎯 JLPT</Link>
            <Link to="/notes" className="quick-btn">📝 Notes</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
