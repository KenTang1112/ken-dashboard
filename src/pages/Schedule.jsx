import { TIMETABLE, PERIODS } from '../data/schedule';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function Schedule() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Schedule</h1>
          <p className="page-sub">Spring Semester 2026</p>
        </div>
      </div>

      {/* Desktop grid */}
      <div className="schedule-grid">
        {/* Header row */}
        <div className="sg-corner" />
        {DAYS.map(d => (
          <div key={d} className="sg-day-header">{d}</div>
        ))}

        {/* Period rows */}
        {PERIODS.map(period => (
          <>
            <div key={`p-${period.id}`} className="sg-period-label">
              <span className="period-num">{period.id}</span>
              <span className="period-time">{period.time}</span>
            </div>
            {DAYS.map(day => {
              const item = TIMETABLE[day]?.find(c => c.period === period.id);
              return (
                <div key={`${day}-${period.id}`} className={`sg-cell${item ? ' sg-cell-filled' : ''}`}>
                  {item && (
                    <div className="sg-class-block" style={{ borderLeftColor: item.color }}>
                      <span className="sg-class-name">{item.short}</span>
                      {item.optional && <span className="sg-optional">optional</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        ))}
      </div>

      {/* Mobile card view */}
      <div className="schedule-mobile">
        {DAYS.map(day => (
          <div key={day} className="card schedule-day-card">
            <h2 className="card-title">{day}</h2>
            {(TIMETABLE[day] || []).length === 0 ? (
              <p className="empty-state">No classes</p>
            ) : (
              <div className="today-schedule">
                {TIMETABLE[day].map((item, i) => {
                  const period = PERIODS.find(p => p.id === item.period);
                  return (
                    <div key={i} className="schedule-item">
                      <div className="schedule-dot" style={{ background: item.color }} />
                      <div>
                        <div className="schedule-class">{item.class}</div>
                        <div className="schedule-time">{period?.time}</div>
                      </div>
                      {item.optional && <span className="badge badge-normal">optional</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
