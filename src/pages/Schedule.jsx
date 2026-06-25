import { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { classColor } from '../utils/classColor';
import { CLASSES } from '../data/classes';
import { DEADLINES, TYPE_COLORS, TYPE_LABELS } from '../data/deadlines';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export const PERIODS = [
  { id: 1, time: '08:45–10:15' },
  { id: 2, time: '10:30–12:00' },
  { id: 3, time: '13:00–14:30' },
  { id: 4, time: '14:45–16:15' },
  { id: 5, time: '16:30–18:00' },
];

const KEN_DEFAULTS = {
  Monday_1:    '中級3やりとり',
  Monday_2:    '中級3表現',
  Monday_3:    '中級3理解',
  Monday_4:    'Japanese Culture I',
  Monday_5:    'Career Planning',
  Tuesday_3:   'Japanese History',
  Tuesday_5:   'Political Cartoon',
  Wednesday_1: '中級3やりとり',
  Wednesday_2: '中級3表現',
  Wednesday_3: '中級3理解',
  Wednesday_5: 'PE Lecture',
  Thursday_4:  'Japanese Management',
  Thursday_5:  'Academic Skills',
  Friday_2:    'Intro to Economics',
  Friday_4:    '運用やりとり³',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = dateStr.split('-').map(Number);
  return Math.ceil((new Date(y, m - 1, d) - today) / 86400000);
}

function findClassInfo(scheduleName) {
  const n = scheduleName.toLowerCase();
  return CLASSES.find(c =>
    c.name.toLowerCase() === n ||
    (c.english || '').toLowerCase() === n ||
    n.includes(c.name.toLowerCase()) ||
    c.name.toLowerCase().includes(n) ||
    n.includes((c.english || '').toLowerCase()) ||
    (c.english || '').toLowerCase().includes(n)
  ) || null;
}

function findClassDeadlines(scheduleName) {
  const n = scheduleName.toLowerCase();
  return DEADLINES
    .filter(d => {
      const cls = (d.class || '').toLowerCase();
      if (!cls) return false;
      return n.includes(cls) || cls.includes(n) ||
        cls.split(/\s+/).some(w => w.length > 3 && n.includes(w)) ||
        n.split(/\s+/).some(w => w.length > 3 && cls.includes(w));
    })
    .map(d => ({ ...d, days: daysUntil(d.date) }))
    .filter(d => d.days >= 0)
    .sort((a, b) => a.days - b.days)
    .slice(0, 8);
}

// ── Class Detail Panel ────────────────────────────────────────────────────────
function ClassDetailPanel({ name, color, onClose }) {
  const info      = findClassInfo(name);
  const deadlines = findClassDeadlines(name);
  const nextTestDays = info?.nextTest ? daysUntil(info.nextTest) : null;

  return (
    <>
      <div className="cdp-overlay" onClick={onClose} />
      <div className="cdp-panel">
        {/* Header */}
        <div className="cdp-header" style={{ borderLeftColor: color }}>
          <div>
            <h2 className="cdp-title">{info?.name || name}</h2>
            {info?.english && <p className="cdp-english">{info.english}</p>}
            {info?.days   && <p className="cdp-days">{info.days}</p>}
          </div>
          <button className="cdp-close" onClick={onClose}>×</button>
        </div>

        {/* Next test */}
        {info?.nextTest && nextTestDays !== null && (
          <div className="cdp-section">
            <div className="cdp-next-test" style={{ borderColor: color + '55', background: color + '11' }}>
              <div>
                <span className="cdp-next-label">Next test</span>
                <span className="cdp-next-name">{info.nextTestLabel}</span>
              </div>
              <span
                className="cdp-next-badge"
                style={{ background: nextTestDays <= 7 ? '#FEE2E2' : '#F3F4F6', color: nextTestDays <= 7 ? '#991B1B' : '#374151' }}
              >
                {nextTestDays === 0 ? 'Today' : nextTestDays < 0 ? 'Done' : `${nextTestDays}d`}
              </span>
            </div>
          </div>
        )}

        {/* Notes */}
        {info?.notes && (
          <div className="cdp-section">
            <div className="cdp-section-label">Notes</div>
            <p className="cdp-notes">{info.notes}</p>
          </div>
        )}

        {/* Tasks */}
        {info?.tasks?.length > 0 && (
          <div className="cdp-section">
            <div className="cdp-section-label">To do</div>
            <ul className="cdp-task-list">
              {info.tasks.map((t, i) => (
                <li key={i} className="cdp-task-item">
                  <span className="cdp-task-dot" style={{ background: color }} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Upcoming deadlines */}
        <div className="cdp-section">
          <div className="cdp-section-label">Upcoming deadlines</div>
          {deadlines.length === 0 ? (
            <p className="empty-state" style={{ fontSize: 12 }}>No upcoming deadlines</p>
          ) : (
            <div className="cdp-deadline-list">
              {deadlines.map((d, i) => (
                <div key={i} className="cdp-deadline-row">
                  <span className="cdp-deadline-dot" style={{ background: TYPE_COLORS[d.type] }} />
                  <div className="cdp-deadline-info">
                    <span className="cdp-deadline-label">{d.label}</span>
                    <span className="cdp-deadline-date">{d.date.slice(5).replace('-', '/')}</span>
                  </div>
                  <span
                    className="cdp-deadline-days"
                    style={{ color: d.days <= 3 ? '#EF4444' : d.days <= 7 ? '#F59E0B' : 'var(--text-3)' }}
                  >
                    {d.days === 0 ? 'Today' : `${d.days}d`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Main Schedule ─────────────────────────────────────────────────────────────
export default function Schedule() {
  const { activeUser, getItem, setItem } = useUser();
  const [grid, setGrid]                   = useState({});
  const [editMode, setEditMode]           = useState(false);
  const [activeCell, setActiveCell]       = useState(null);
  const [inputVal, setInputVal]           = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null); // { name, color }
  const inputRef = useRef(null);

  useEffect(() => {
    const raw = getItem('schedule_v2');
    if (raw) {
      try { setGrid(JSON.parse(raw)); } catch { setGrid({}); }
    } else if (activeUser === 'ken') {
      setGrid(KEN_DEFAULTS);
      setItem('schedule_v2', JSON.stringify(KEN_DEFAULTS));
    } else {
      setGrid({});
    }
  }, [activeUser]);

  function saveGrid(next) {
    setGrid(next);
    setItem('schedule_v2', JSON.stringify(next));
  }

  function openCell(day, period) {
    if (!editMode) return;
    const key = `${day}_${period}`;
    if (grid[key]) return;
    setActiveCell(key);
    setInputVal('');
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function confirmAdd(key) {
    const name = inputVal.trim();
    if (name) saveGrid({ ...grid, [key]: name });
    setActiveCell(null);
    setInputVal('');
  }

  function confirmDeleteCell() {
    if (!confirmDelete) return;
    const next = { ...grid };
    delete next[confirmDelete];
    saveGrid(next);
    setConfirmDelete(null);
  }

  function toggleEdit() {
    setEditMode(e => !e);
    setActiveCell(null);
    setConfirmDelete(null);
    setSelectedClass(null);
  }

  function handleChipClick(name, color, e) {
    e.stopPropagation();
    if (editMode) return;
    setSelectedClass({ name, color });
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Schedule</h1>
          <p className="page-sub">Spring Semester 2026 · click any class for details</p>
        </div>
        <button
          className={`btn-edit-schedule${editMode ? ' active' : ''}`}
          onClick={toggleEdit}
        >
          {editMode ? '✓ Done' : '✎ Edit schedule'}
        </button>
      </div>

      {editMode && (
        <div className="edit-mode-banner">
          Click an empty cell to add a class · hover a filled cell to remove it
        </div>
      )}

      {/* Desktop grid */}
      <div className="sched-grid">
        <div className="sched-corner" />
        {DAYS.map((d, i) => (
          <div key={d} className="sched-day-hdr">{DAY_SHORT[i]}</div>
        ))}

        {PERIODS.map(p => (
          <>
            <div key={`lbl-${p.id}`} className="sched-period-lbl">
              <span className="period-num">P{p.id}</span>
              <span className="period-time">{p.time}</span>
            </div>
            {DAYS.map(day => {
              const key   = `${day}_${p.id}`;
              const name  = grid[key];
              const color = name ? classColor(name) : null;
              const isEditing = activeCell === key;
              const isDel     = confirmDelete === key;
              return (
                <div
                  key={key}
                  className={`sched-cell${name ? ' sched-filled' : ' sched-empty'}${editMode ? ' sched-editable' : ''}${!editMode && name ? ' sched-clickable' : ''}`}
                  onClick={() => !name && openCell(day, p.id)}
                >
                  {isEditing ? (
                    <div className="sched-inline-input" onClick={e => e.stopPropagation()}>
                      <input
                        ref={inputRef}
                        value={inputVal}
                        onChange={e => setInputVal(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter')  confirmAdd(key);
                          if (e.key === 'Escape') { setActiveCell(null); setInputVal(''); }
                        }}
                        placeholder="Class name…"
                      />
                      <button onClick={() => confirmAdd(key)}>✓</button>
                    </div>
                  ) : name ? (
                    <div className="sched-chip-wrap">
                      <div
                        className="sched-chip"
                        style={{ background: color + '22', borderLeftColor: color, color }}
                        onClick={e => handleChipClick(name, color, e)}
                      >
                        <span className="sched-chip-label">{name}</span>
                        {editMode && (
                          <button
                            className="sched-del-btn"
                            onClick={e => { e.stopPropagation(); setConfirmDelete(key); }}
                            title={`Remove ${name}`}
                          >×</button>
                        )}
                      </div>
                      {isDel && (
                        <div className="sched-confirm-pop" onClick={e => e.stopPropagation()}>
                          <span>Remove {name}?</span>
                          <button className="sched-confirm-yes" onClick={confirmDeleteCell}>Yes</button>
                          <button className="sched-confirm-no" onClick={() => setConfirmDelete(null)}>No</button>
                        </div>
                      )}
                    </div>
                  ) : (
                    editMode && <span className="sched-empty-plus">+</span>
                  )}
                </div>
              );
            })}
          </>
        ))}
      </div>

      {/* Mobile view */}
      <div className="schedule-mobile">
        {DAYS.map(day => {
          const classes = PERIODS
            .map(p => ({ period: p, name: grid[`${day}_${p.id}`] }))
            .filter(x => x.name);
          return (
            <div key={day} className="card schedule-day-card">
              <h2 className="card-title">{day}</h2>
              {classes.length === 0 ? (
                <p className="empty-state">No classes</p>
              ) : (
                <div className="today-schedule">
                  {classes.map(({ period, name }) => {
                    const color = classColor(name);
                    return (
                      <div
                        key={period.id}
                        className="schedule-item"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedClass({ name, color })}
                      >
                        <div className="schedule-dot" style={{ background: color }} />
                        <div>
                          <div className="schedule-class">{name}</div>
                          <div className="schedule-time">P{period.id} · {period.time}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Class detail panel */}
      {selectedClass && (
        <ClassDetailPanel
          name={selectedClass.name}
          color={selectedClass.color}
          onClose={() => setSelectedClass(null)}
        />
      )}
    </div>
  );
}
