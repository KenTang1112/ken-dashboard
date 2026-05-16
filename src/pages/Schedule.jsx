import { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { classColor } from '../utils/classColor';

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
  Monday_1:    'Japanese Expression',
  Monday_2:    'Japanese Communication',
  Monday_3:    'Japanese Comprehension',
  Monday_4:    'Japanese Culture I',
  Monday_5:    'Career Planning',
  Tuesday_3:   'History 1',
  Tuesday_5:   'Political Cartoon',
  Wednesday_1: 'Japanese Expression',
  Wednesday_2: 'Japanese Communication',
  Wednesday_3: 'Japanese Comprehension',
  Wednesday_5: 'PE Lecture',
  Thursday_2:  'Intro to Economics',
  Thursday_4:  'Japanese Management',
  Thursday_5:  'Academic Skills',
  Friday_2:    'Intro to Economics',
  Friday_4:    'Debate',
};

export default function Schedule() {
  const { activeUser, getItem, setItem } = useUser();
  const [grid, setGrid]                   = useState({});
  const [editMode, setEditMode]           = useState(false);
  const [activeCell, setActiveCell]       = useState(null);
  const [inputVal, setInputVal]           = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const raw = getItem('schedule');
    if (raw) {
      try { setGrid(JSON.parse(raw)); } catch { setGrid({}); }
    } else if (activeUser === 'ken') {
      setGrid(KEN_DEFAULTS);
      setItem('schedule', JSON.stringify(KEN_DEFAULTS));
    } else {
      setGrid({});
    }
  }, [activeUser]);

  function saveGrid(next) {
    setGrid(next);
    setItem('schedule', JSON.stringify(next));
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
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Schedule</h1>
          <p className="page-sub">Spring Semester 2026</p>
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
              const key  = `${day}_${p.id}`;
              const name = grid[key];
              const color = name ? classColor(name) : null;
              const isEditing = activeCell === key;
              const isDel     = confirmDelete === key;
              return (
                <div
                  key={key}
                  className={`sched-cell${name ? ' sched-filled' : ' sched-empty'}${editMode ? ' sched-editable' : ''}`}
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
                      >
                        <span className="sched-chip-label">{name}</span>
                        {editMode && (
                          <button
                            className="sched-del-btn"
                            onClick={e => { e.stopPropagation(); setConfirmDelete(key); }}
                            title={`Remove ${name}`}
                          >
                            ×
                          </button>
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
                  {classes.map(({ period, name }) => (
                    <div key={period.id} className="schedule-item">
                      <div className="schedule-dot" style={{ background: classColor(name) }} />
                      <div>
                        <div className="schedule-class">{name}</div>
                        <div className="schedule-time">P{period.id} · {period.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
