import { CLASSES } from '../data/classes';

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(dateStr) - today) / (1000 * 60 * 60 * 24));
}

function ClassCard({ cls }) {
  const days = daysUntil(cls.nextTest);

  return (
    <div className={`class-card${cls.urgent ? ' class-card-urgent' : ''}`}>
      <div className="class-card-bar" style={{ background: cls.color }} />
      <div className="class-card-body">
        <div className="class-card-header">
          <div>
            <h3 className="class-name">{cls.name}</h3>
            <p className="class-english">{cls.english}</p>
          </div>
          {cls.urgent && <span className="urgent-flag">!</span>}
        </div>

        <p className="class-days">{cls.days}</p>

        {cls.nextTest && (
          <div className="class-next-test">
            <span className="next-test-label">Next:</span>
            <span className="next-test-name">{cls.nextTestLabel}</span>
            {days !== null && (
              <span className={`next-test-days ${days <= 7 ? 'soon' : ''}`}>
                {days === 0 ? 'Today' : days < 0 ? 'Done' : `${days}d`}
              </span>
            )}
          </div>
        )}

        <p className="class-notes">{cls.notes}</p>

        <ul className="task-list">
          {cls.tasks.map((t, i) => (
            <li key={i} className="task-item">{t}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Classes() {
  const urgent = CLASSES.filter(c => c.urgent);
  const normal = CLASSES.filter(c => !c.urgent);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Classes</h1>
          <p className="page-sub">12 classes this semester</p>
        </div>
      </div>

      {urgent.length > 0 && (
        <>
          <h2 className="section-label">⚠ Needs Attention</h2>
          <div className="classes-grid">
            {urgent.map(cls => <ClassCard key={cls.id} cls={cls} />)}
          </div>
        </>
      )}

      <h2 className="section-label">All Classes</h2>
      <div className="classes-grid">
        {normal.map(cls => <ClassCard key={cls.id} cls={cls} />)}
      </div>
    </div>
  );
}
