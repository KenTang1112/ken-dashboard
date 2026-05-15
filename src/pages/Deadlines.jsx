import { useState, useMemo } from 'react';
import { DEADLINES, TYPE_COLORS, TYPE_LABELS } from '../data/deadlines';

function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(dateStr) - today) / (1000 * 60 * 60 * 24));
}

function CountdownBadge({ days }) {
  if (days < 0) return <span className="badge badge-done">Done</span>;
  if (days === 0) return <span className="badge badge-today">Today</span>;
  if (days <= 3) return <span className="badge badge-urgent">{days}d</span>;
  if (days <= 7) return <span className="badge badge-soon">{days}d</span>;
  return <span className="badge badge-normal">{days}d</span>;
}

const ALL_CLASSES = [...new Set(DEADLINES.map(d => d.class))].sort();
const ALL_TYPES = [...new Set(DEADLINES.map(d => d.type))];

export default function Deadlines() {
  const [filterClass, setFilterClass] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showPast, setShowPast] = useState(false);

  const enriched = useMemo(() =>
    DEADLINES.map(d => ({ ...d, days: daysUntil(d.date) })),
    []
  );

  const filtered = useMemo(() =>
    enriched
      .filter(d => showPast || d.days >= 0)
      .filter(d => filterClass === 'all' || d.class === filterClass)
      .filter(d => filterType === 'all' || d.type === filterType)
      .sort((a, b) => a.days - b.days),
    [enriched, filterClass, filterType, showPast]
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Deadlines</h1>
          <p className="page-sub">{filtered.filter(d => d.days >= 0).length} upcoming</p>
        </div>
      </div>

      <div className="filters">
        <select className="filter-select" value={filterClass} onChange={e => setFilterClass(e.target.value)}>
          <option value="all">All classes</option>
          {ALL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">All types</option>
          {ALL_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
        </select>
        <label className="filter-toggle">
          <input type="checkbox" checked={showPast} onChange={e => setShowPast(e.target.checked)} />
          Show past
        </label>
      </div>

      <div className="card">
        <table className="deadline-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Task</th>
              <th>Class</th>
              <th>Type</th>
              <th>In</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d, i) => (
              <tr key={i} className={d.urgent ? 'row-urgent' : ''}>
                <td className="td-date">{d.date.slice(5).replace('-', '/')}</td>
                <td className="td-label">{d.label}</td>
                <td className="td-class">
                  <span className="class-tag">{d.class}</span>
                </td>
                <td>
                  <span className="type-dot" style={{ background: TYPE_COLORS[d.type] }} />
                  <span className="type-label">{TYPE_LABELS[d.type]}</span>
                </td>
                <td><CountdownBadge days={d.days} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
