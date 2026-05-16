import { useState } from 'react';
import { JLPT_SECTIONS, JLPT_RESOURCES, BEST_STUDY_WINDOWS, JLPT_EXAM_DATE } from '../data/jlpt';

const STATUS_LABELS = {
  not_started: 'Not started',
  active: 'In progress',
  supported: 'Class support',
  done: 'Done',
};

const STATUS_COLORS = {
  not_started: '#6B7280',
  active: '#3B82F6',
  supported: '#10B981',
  done: '#8B5CF6',
};

function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(dateStr) - today) / 86400000);
}

export default function JLPT() {
  const [resources, setResources] = useState(JLPT_RESOURCES.map(r => ({ ...r })));

  const toggle = (i) => {
    setResources(prev => prev.map((r, idx) => idx === i ? { ...r, done: !r.done } : r));
  };

  const doneCount = resources.filter(r => r.done).length;
  const examDays  = daysUntil(JLPT_EXAM_DATE);
  const examLabel = new Date(JLPT_EXAM_DATE).toLocaleDateString('en-US', {
    weekday: 'short', month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">JLPT N2</h1>
          <p className="page-sub">Progress tracker</p>
        </div>
        <div className="exam-date-badge">
          <span className="exam-date-label">Exam date</span>
          <span className="exam-date-value">{examLabel}</span>
          <span className="exam-date-countdown">
            {examDays > 0 ? `${examDays} days away` : examDays === 0 ? 'Today!' : 'Past'}
          </span>
        </div>
      </div>

      {/* Sections */}
      <div className="card">
        <h2 className="card-title">Sections</h2>
        <div className="jlpt-sections">
          {JLPT_SECTIONS.map(s => (
            <div key={s.id} className="jlpt-section-row">
              <div className="jlpt-section-dot" style={{ background: STATUS_COLORS[s.status] }} />
              <div className="jlpt-section-info">
                <span className="jlpt-section-label">{s.label}</span>
                {s.notes && <span className="jlpt-section-note">{s.notes}</span>}
              </div>
              <span className="jlpt-section-status" style={{ color: STATUS_COLORS[s.status] }}>
                {STATUS_LABELS[s.status]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Setup checklist */}
      <div className="card">
        <h2 className="card-title">Setup Checklist ({doneCount}/{resources.length})</h2>
        <div className="checklist">
          {resources.map((r, i) => (
            <label key={i} className="checklist-item">
              <input
                type="checkbox"
                checked={r.done}
                onChange={() => toggle(i)}
                className="checklist-checkbox"
              />
              <span className={r.done ? 'checklist-label done' : 'checklist-label'}>{r.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Best study windows */}
      <div className="card">
        <h2 className="card-title">Best Study Windows</h2>
        <div className="study-windows">
          {BEST_STUDY_WINDOWS.map((w, i) => (
            <div key={i} className="study-window-row">
              <span className="window-day">{w.day}</span>
              <span className="window-time">{w.time}</span>
              <span className="window-note">{w.note}</span>
            </div>
          ))}
        </div>
        <p className="info-note" style={{ marginTop: '12px' }}>
          Target: 3–4 sessions of 20–30 min per week. Long blocks preferred over short sessions.
        </p>
      </div>

      {/* Weekly log placeholder */}
      <div className="card">
        <h2 className="card-title">Weekly Log</h2>
        <p className="empty-state">Claude appends a note here each Sunday after the weekly run.</p>
      </div>
    </div>
  );
}
