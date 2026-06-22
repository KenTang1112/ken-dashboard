import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DEADLINES, TYPE_COLORS, TYPE_LABELS } from '../data/deadlines';
import { PERIODS, TIMETABLE } from '../data/schedule';
import { JLPT_SECTIONS, JLPT_EXAM_DATE } from '../data/jlpt';
import { KANJI_LS_KEYS, QUIZ_SCHEDULE, getWeaknessScores } from '../data/kanji';
import { addNote } from '../data/notes';
import { useUser } from '../context/UserContext';

// ── Palette for activity cards ────────────────────────────────────────────────
const CARD_PALETTES = [
  { bg: '#B3D9D3', text: '#1A3A33' },
  { bg: '#F8C8D4', text: '#4A1525' },
  { bg: '#F5E490', text: '#3A3000' },
  { bg: '#D4C4EC', text: '#2A1F45' },
  { bg: '#1A1A1A', text: '#FFFFFF' },
  { bg: '#B3D9D3', text: '#1A3A33' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(dateStr) - today) / (1000 * 60 * 60 * 24));
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function toDateStr(date) {
  return date.toISOString().slice(0, 10);
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth()    === b.getMonth() &&
         a.getDate()     === b.getDate();
}

function computeStreak(sessionsRaw) {
  try {
    const sessions = JSON.parse(sessionsRaw || '[]');
    if (!Array.isArray(sessions) || sessions.length === 0) return 0;
    const dates = [...new Set(sessions.map(s => s.date).filter(Boolean))].sort().reverse();
    if (!dates.length) return 0;
    const today     = new Date().toISOString().slice(0, 10);
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

// Get the schedule for a given date, enriched with TIMETABLE colors.
// Prefers localStorage custom entries but falls back to TIMETABLE.
function getScheduleForDate(date, getItem) {
  const dayName     = DAY_NAMES[date.getDay()];
  const timetableDay = TIMETABLE[dayName] || [];

  // Try localStorage custom schedule first
  try {
    const raw = getItem('schedule');
    if (raw) {
      const grid = JSON.parse(raw);
      const items = PERIODS
        .map(p => ({ period: p, name: grid[`${dayName}_${p.id}`] }))
        .filter(x => x.name);
      if (items.length > 0) {
        return items.map(item => {
          const tt = timetableDay.find(t => t.period === item.period.id);
          return { ...item, color: tt?.color, optional: tt?.optional };
        });
      }
    }
  } catch {}

  // Fall back to TIMETABLE
  return timetableDay.map(entry => ({
    period:   PERIODS.find(p => p.id === entry.period),
    name:     entry.class,
    color:    entry.color,
    optional: entry.optional,
  })).filter(x => x.period);
}

// Get deadlines for an exact date
function getDeadlinesForDate(date) {
  const dateStr = toDateStr(date);
  return DEADLINES.filter(d => d.date === dateStr);
}

// Build a set of date strings that have any deadline (for calendar markers)
const DEADLINE_DATE_SET = new Set(DEADLINES.map(d => d.date));

// ── Mini Calendar ─────────────────────────────────────────────────────────────
function MiniCalendar({ selectedDate, onSelect }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  );

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth    = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const MONTH_NAMES = ['January','February','March','April','May','June',
                       'July','August','September','October','November','December'];
  const DAY_LABELS  = ['MON','TUE','WED','THU','FRI','SAT','SUN'];

  return (
    <div>
      <div className="mini-cal-header">
        <span className="mini-cal-month-label">{MONTH_NAMES[month]} {year}</span>
        <div className="mini-cal-controls">
          <button className="mini-cal-btn" onClick={() => setViewDate(new Date(year, month - 1, 1))}>‹</button>
          <button className="mini-cal-btn" onClick={() => setViewDate(new Date(year, month + 1, 1))}>›</button>
        </div>
      </div>
      <div className="mini-cal-grid">
        {DAY_LABELS.map(d => <div key={d} className="mini-cal-day-label">{d}</div>)}
        {cells.map((day, i) => {
          if (!day) return <div key={i} className="mini-cal-cell empty" />;

          const cellDate  = new Date(year, month, day);
          const isToday   = isSameDay(cellDate, today);
          const isSelected = isSameDay(cellDate, selectedDate) && !isToday;
          const hasEvent  = DEADLINE_DATE_SET.has(toDateStr(cellDate));

          let cls = 'mini-cal-cell';
          if (isToday)    cls += ' today';
          if (isSelected) cls += ' selected';
          if (hasEvent && !isToday && !isSelected) cls += ' has-event';

          return (
            <div
              key={i}
              className={cls}
              onClick={() => onSelect(cellDate)}
              style={{ cursor: 'pointer' }}
              title={hasEvent ? 'Has deadlines' : undefined}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Quick Note ────────────────────────────────────────────────────────────────
function QuickNoteWidget() {
  const [input, setInput] = useState('');
  const [saved, setSaved]  = useState(false);

  function handleSave() {
    if (!input.trim()) return;
    addNote(input);
    setInput('');
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="dash-quick-note">
      <textarea
        className="dash-note-input"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave(); }}
        placeholder="Quick note… (⌘+Enter to save)"
        rows={2}
      />
      <button
        className={`btn-primary${saved ? ' btn-saved' : ''}`}
        onClick={handleSave}
        disabled={!input.trim()}
        style={{ whiteSpace: 'nowrap', alignSelf: 'stretch', padding: '0 14px' }}
      >
        {saved ? '✓' : 'Save'}
      </button>
    </div>
  );
}

// ── Format selected date label ────────────────────────────────────────────────
function formatDateLabel(date, today) {
  if (isSameDay(date, today)) return 'today';
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const today = new Date();
  const { activeUser, getItem } = useUser();

  const [selectedDate, setSelectedDate] = useState(today);

  const isToday      = isSameDay(selectedDate, today);
  const selectedDayName  = DAY_NAMES[selectedDate.getDay()];
  const isWeekend    = selectedDate.getDay() === 0 || selectedDate.getDay() === 6;

  // Schedule for selected date
  const daySchedule = useMemo(
    () => getScheduleForDate(selectedDate, getItem),
    [selectedDate, activeUser]
  );

  // Deadlines on selected date
  const dayDeadlines = useMemo(
    () => getDeadlinesForDate(selectedDate),
    [selectedDate]
  );

  // Kanji data
  const [kanjiData, setKanjiData] = useState({ streak: 0, dueCount: 0 });
  useEffect(() => {
    const scores   = getWeaknessScores();
    const dueCount = Object.values(scores).filter(v => v >= 5).length;
    const streak   = computeStreak(localStorage.getItem(KANJI_LS_KEYS.sessionHistory));
    setKanjiData({ streak, dueCount });
  }, []);

  // JLPT
  const jlptDone   = JLPT_SECTIONS.filter(s => s.status === 'done').length;
  const jlptTotal  = JLPT_SECTIONS.length;
  const jlptPct    = Math.round((jlptDone / jlptTotal) * 100);
  const examDays   = Math.ceil((new Date(JLPT_EXAM_DATE) - new Date().setHours(0, 0, 0, 0)) / 86400000);
  const activeJLPT = JLPT_SECTIONS.filter(s => s.status === 'active' || s.status === 'supported');

  // Next kanji quiz
  const nextQuiz = QUIZ_SCHEDULE.find(q => !q.done && daysUntil(q.date) >= 0);

  // Upcoming deadlines (for the sidebar list)
  const upcoming = useMemo(() =>
    DEADLINES
      .map(d => ({ ...d, days: daysUntil(d.date) }))
      .filter(d => d.days >= 0 && d.days <= 14)
      .sort((a, b) => a.days - b.days)
      .slice(0, 5),
    []
  );

  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const displayName = activeUser
    ? activeUser.charAt(0).toUpperCase() + activeUser.slice(1)
    : 'there';

  const dateLabel = formatDateLabel(selectedDate, today);

  return (
    <div className="page dash-page">
      {/* ── Welcome header ── */}
      <div className="dash-welcome">
        <div>
          <h1 className="dash-welcome-title">{greeting}, {displayName} 👋</h1>
          <p className="dash-welcome-sub">
            {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <QuickNoteWidget />
      </div>

      <div className="dash-layout">
        {/* ── Left column ── */}
        <div className="dash-left">

          {/* Activities for selected date */}
          <section className="dash-section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 className="dash-section-title" style={{ marginBottom: 0 }}>
                {isToday ? 'Your activities today' : `Schedule — ${dateLabel}`}
                <span className="dash-count-badge">{daySchedule.length}</span>
              </h2>
              {!isToday && (
                <button
                  onClick={() => setSelectedDate(today)}
                  className="btn-secondary"
                  style={{ fontSize: 12, padding: '4px 12px' }}
                >
                  ← Back to today
                </button>
              )}
            </div>

            {isWeekend ? (
              <p className="empty-state" style={{ padding: '8px 0' }}>No classes on weekends 🎉</p>
            ) : daySchedule.length === 0 ? (
              <p className="empty-state" style={{ padding: '8px 0' }}>No classes on {selectedDayName}</p>
            ) : (
              <div className="dash-activity-grid">
                {daySchedule.map((item, i) => {
                  const pal = CARD_PALETTES[i % CARD_PALETTES.length];
                  // Find deadlines for this class on the selected date
                  const classDeadlines = dayDeadlines.filter(
                    d => d.class && item.name.includes(d.class.split(' ')[0])
                  );
                  return (
                    <Link
                      key={i}
                      to="/schedule"
                      className="dash-activity-card"
                      style={item.color
                        ? { background: item.color + '22', borderLeft: `4px solid ${item.color}`, color: '#1A1A1A' }
                        : { background: pal.bg, color: pal.text }
                      }
                    >
                      <div className="dash-activity-arrow" style={item.color ? { background: item.color + '33' } : {}}>↗</div>
                      <div className="dash-activity-period">{item.period?.time}</div>
                      <div className="dash-activity-name">{item.name}</div>
                      {item.optional && (
                        <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4 }}>optional</div>
                      )}
                      {classDeadlines.length > 0 && (
                        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {classDeadlines.map((dl, j) => (
                            <span
                              key={j}
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                background: TYPE_COLORS[dl.type] || '#666',
                                color: 'white',
                                padding: '2px 6px',
                                borderRadius: 6,
                              }}
                            >
                              {TYPE_LABELS?.[dl.type] ?? dl.type}
                            </span>
                          ))}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Deadlines / special events on this date */}
            {dayDeadlines.length > 0 && (
              <div className="dash-day-deadlines">
                <div className="dash-day-deadlines-title">Special events this day</div>
                {dayDeadlines.map((dl, i) => (
                  <Link key={i} to="/deadlines" className="dash-day-deadline-row">
                    <span
                      className="dash-day-deadline-dot"
                      style={{ background: TYPE_COLORS[dl.type] || '#666' }}
                    />
                    <div className="dash-day-deadline-info">
                      <span className="dash-day-deadline-label">{dl.label}</span>
                      {dl.class && <span className="dash-day-deadline-class">{dl.class}</span>}
                    </div>
                    <span
                      className="dash-day-deadline-type"
                      style={{ color: TYPE_COLORS[dl.type] || '#666' }}
                    >
                      {TYPE_LABELS?.[dl.type] ?? dl.type}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Learning progress */}
          <section className="dash-section">
            <h2 className="dash-section-title">Learning progress</h2>
            <div className="dash-stats-grid">
              <Link to="/kanji" className="dash-stat-card" style={{ background: '#F5E490' }}>
                <span className="dash-stat-num" style={{ color: '#3A3000' }}>
                  {kanjiData.streak > 0 ? kanjiData.streak : '—'}
                </span>
                <span className="dash-stat-label" style={{ color: '#6B5800' }}>day streak</span>
                <span className="dash-stat-arrow" style={{ color: '#3A3000' }}>↗</span>
              </Link>
              <Link to="/jlpt" className="dash-stat-card" style={{ background: '#B3D9D3' }}>
                <span className="dash-stat-num" style={{ color: '#1A3A33' }}>{jlptPct}%</span>
                <span className="dash-stat-label" style={{ color: '#2A5A50' }}>JLPT done</span>
                <span className="dash-stat-arrow" style={{ color: '#1A3A33' }}>↗</span>
              </Link>
              <Link to="/deadlines" className="dash-stat-card" style={{ background: '#D4C4EC' }}>
                <span className="dash-stat-num" style={{ color: '#2A1F45' }}>{upcoming.length}</span>
                <span className="dash-stat-label" style={{ color: '#4A3F65' }}>upcoming</span>
                <span className="dash-stat-arrow" style={{ color: '#2A1F45' }}>↗</span>
              </Link>
            </div>

            <div className="dash-progress-list">
              <Link to="/jlpt" className="dash-progress-item">
                <div className="dash-progress-meta">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13 }}>🎯</span>
                    <span className="dash-progress-category">JLPT N2</span>
                  </div>
                  <span className="dash-progress-subtitle">
                    {jlptDone}/{jlptTotal} sections · {examDays}d to exam
                  </span>
                </div>
                <div className="dash-progress-name">{activeJLPT[0]?.name ?? 'No active section'}</div>
                <div className="dash-progress-bar-wrap">
                  <div className="dash-progress-bar-fill" style={{ width: `${jlptPct}%` }} />
                </div>
                <div className="dash-progress-arrow">↗</div>
              </Link>

              <Link to="/kanji" className="dash-progress-item">
                <div className="dash-progress-meta">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13 }}>漢</span>
                    <span className="dash-progress-category">Kanji</span>
                  </div>
                  {kanjiData.dueCount > 0 && (
                    <span className="dash-progress-subtitle" style={{ color: '#EF4444' }}>
                      {kanjiData.dueCount} due for review
                    </span>
                  )}
                </div>
                <div className="dash-progress-name">
                  {kanjiData.streak > 0
                    ? `${kanjiData.streak}-day streak`
                    : nextQuiz ? `Next quiz: ${nextQuiz.chapters}` : 'Start a study session'}
                </div>
                <div className="dash-progress-bar-wrap">
                  <div
                    className="dash-progress-bar-fill"
                    style={{
                      width: `${Math.min(100, kanjiData.streak * 10)}%`,
                      background: kanjiData.dueCount > 0 ? '#EF4444' : undefined,
                    }}
                  />
                </div>
                <div className="dash-progress-arrow">↗</div>
              </Link>
            </div>
          </section>
        </div>

        {/* ── Right column ── */}
        <div className="dash-right">
          <div className="dash-side-card">
            <h2 className="dash-section-title" style={{ marginBottom: 16 }}>Lesson schedule</h2>
            <MiniCalendar selectedDate={selectedDate} onSelect={setSelectedDate} />

            <div className="dash-lesson-list">
              {upcoming.length === 0 && activeJLPT.length === 0 ? (
                <p className="empty-state" style={{ fontSize: 12 }}>Nothing upcoming in 2 weeks</p>
              ) : null}

              {upcoming.map((d, i) => (
                <Link key={i} to="/deadlines" className="dash-lesson-item">
                  <div className="dash-lesson-icon">📋</div>
                  <div className="dash-lesson-info">
                    <span className="dash-lesson-name">{d.label}</span>
                    {d.class && <span className="dash-lesson-sub">{d.class}</span>}
                  </div>
                  <span className={`dash-lesson-badge${d.days === 0 ? ' today' : d.days <= 3 ? ' urgent' : ''}`}>
                    {d.days === 0 ? 'Today' : `${d.days}d`}
                  </span>
                </Link>
              ))}

              {activeJLPT.slice(0, 2).map((s, i) => (
                <Link key={`jlpt-${i}`} to="/jlpt" className="dash-lesson-item">
                  <div className="dash-lesson-icon">🎯</div>
                  <div className="dash-lesson-info">
                    <span className="dash-lesson-name">{s.name}</span>
                    <span className="dash-lesson-sub">JLPT N2</span>
                  </div>
                  <span className="dash-lesson-badge">{examDays}d</span>
                </Link>
              ))}

              {nextQuiz && (
                <Link to="/kanji" className="dash-lesson-item">
                  <div className="dash-lesson-icon">漢</div>
                  <div className="dash-lesson-info">
                    <span className="dash-lesson-name">{nextQuiz.chapters}</span>
                    <span className="dash-lesson-sub">Kanji quiz</span>
                  </div>
                  <span className="dash-lesson-badge">{daysUntil(nextQuiz.date)}d</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
