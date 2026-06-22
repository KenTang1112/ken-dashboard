import { useEffect, useState } from 'react';
import { RESEARCH_PROJECTS, STATUS_META } from '../data/research';

function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = dateStr.split('-').map(Number);
  return Math.ceil((new Date(y, m - 1, d) - today) / (1000 * 60 * 60 * 24));
}

function CountdownBadge({ days }) {
  if (days == null) return null;
  if (days < 0)  return <span className="badge badge-done">Done</span>;
  if (days === 0) return <span className="badge badge-today">Today</span>;
  if (days <= 3)  return <span className="badge badge-urgent">{days}d</span>;
  if (days <= 7)  return <span className="badge badge-soon">{days}d</span>;
  return <span className="badge badge-normal">{days}d</span>;
}

// Re-renders the component at midnight so countdowns stay accurate.
function useDailyRefresh() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const msUntilMidnight = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      return midnight - now;
    };
    let timeout;
    const schedule = () => {
      timeout = setTimeout(() => {
        setTick(t => t + 1);
        schedule();
      }, msUntilMidnight());
    };
    schedule();
    return () => clearTimeout(timeout);
  }, []);
}

export default function Research() {
  useDailyRefresh();

  const projects = RESEARCH_PROJECTS.map(p => ({
    ...p,
    days: p.dueDate ? daysUntil(p.dueDate) : null,
  }));

  const active = projects.filter(p => p.status !== 'done');
  const done   = projects.filter(p => p.status === 'done');

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Research</h1>
          <p className="page-sub">{active.length} active · {done.length} done</p>
        </div>
      </div>

      <div className="card">
        <table className="deadline-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Class</th>
              <th>Status</th>
              <th>Due</th>
              <th>In</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(p => {
              const meta = STATUS_META[p.status];
              return (
                <tr key={p.id}>
                  <td className="td-label">
                    <div>{p.title}</div>
                    {p.description && <div style={{ fontSize: '0.78rem', color: '#9CA3AF', marginTop: 2 }}>{p.description}</div>}
                    {p.notes && <div style={{ fontSize: '0.78rem', color: '#60A5FA', marginTop: 2 }}>{p.notes}</div>}
                    {p.sources.length > 0 && (
                      <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {p.sources.map((s, i) => (
                          <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                             style={{ fontSize: '0.75rem', color: '#818CF8', textDecoration: 'underline' }}>
                            {s.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="td-class"><span className="class-tag">{p.class}</span></td>
                  <td>
                    <span className="type-dot" style={{ background: meta.color }} />
                    <span className="type-label">{meta.label}</span>
                  </td>
                  <td className="td-date">{p.dueDate ? p.dueDate.slice(5).replace('-', '/') : '—'}</td>
                  <td><CountdownBadge days={p.days} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
