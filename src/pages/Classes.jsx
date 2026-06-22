import { useState, useEffect, useRef } from 'react';
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { CLASSES } from '../data/classes';

const COLORS = [
  '#3B82F6','#8B5CF6','#06B6D4','#EF4444','#F59E0B',
  '#A78BFA','#84CC16','#10B981','#14B8A6','#F97316','#EC4899','#6366F1',
];

const EMPTY = {
  name: '', english: '', days: '', ends: '', color: '#3B82F6',
  nextTest: '', nextTestLabel: '', notes: '', tasks: '', urgent: false,
};

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = dateStr.split('-').map(Number);
  return Math.ceil((new Date(y, m - 1, d) - today) / (1000 * 60 * 60 * 24));
}

function ClassModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(
    initial
      ? { ...initial, tasks: Array.isArray(initial.tasks) ? initial.tasks.join('\n') : (initial.tasks || '') }
      : EMPTY
  );

  function set(field, val) { setForm(f => ({ ...f, [field]: val })); }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const tasks = form.tasks.split('\n').map(t => t.trim()).filter(Boolean);
    onSave({ ...form, tasks });
  }

  return (
    <div className="picker-overlay" onClick={onClose}>
      <div
        className="picker-modal"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', alignItems: 'stretch', gap: 0 }}
      >
        <h2 className="picker-title" style={{ marginBottom: 20 }}>
          {initial ? 'Edit class' : 'Add class'}
        </h2>
        <form onSubmit={handleSubmit} className="class-form">
          <div className="cf-row">
            <label className="cf-label">Class name (Japanese) <span className="cf-req">*</span></label>
            <input className="cf-input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="中級3やりとり" />
          </div>
          <div className="cf-row">
            <label className="cf-label">English name</label>
            <input className="cf-input" value={form.english} onChange={e => set('english', e.target.value)} placeholder="Intermediate Japanese 3" />
          </div>
          <div className="cf-row">
            <label className="cf-label">Schedule</label>
            <input className="cf-input" value={form.days} onChange={e => set('days', e.target.value)} placeholder="Mon + Wed (1st period)" />
          </div>
          <div className="cf-two-col">
            <div className="cf-row">
              <label className="cf-label">End date</label>
              <input type="date" className="cf-input" value={form.ends || ''} onChange={e => set('ends', e.target.value)} />
            </div>
            <div className="cf-row">
              <label className="cf-label">Next test date</label>
              <input type="date" className="cf-input" value={form.nextTest || ''} onChange={e => set('nextTest', e.target.value)} />
            </div>
          </div>
          <div className="cf-row">
            <label className="cf-label">Next test label</label>
            <input className="cf-input" value={form.nextTestLabel || ''} onChange={e => set('nextTestLabel', e.target.value)} placeholder="中間試験①" />
          </div>
          <div className="cf-row">
            <label className="cf-label">Color</label>
            <div className="cf-colors">
              {COLORS.map(c => (
                <button
                  key={c} type="button"
                  className={`cf-dot${form.color === c ? ' cf-dot-sel' : ''}`}
                  style={{ background: c }}
                  onClick={() => set('color', c)}
                />
              ))}
            </div>
          </div>
          <div className="cf-row">
            <label className="cf-label">Notes</label>
            <textarea className="cf-input cf-ta" rows={2} value={form.notes || ''} onChange={e => set('notes', e.target.value)} />
          </div>
          <div className="cf-row">
            <label className="cf-label">Tasks <span className="cf-hint">(one per line)</span></label>
            <textarea className="cf-input cf-ta" rows={3} value={form.tasks} onChange={e => set('tasks', e.target.value)} placeholder={"Review email formats\nPrepare for test"} />
          </div>
          <label className="cf-check">
            <input type="checkbox" checked={form.urgent} onChange={e => set('urgent', e.target.checked)} />
            Mark as urgent
          </label>
          <div className="cf-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ClassCard({ cls, onEdit, onDelete }) {
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {cls.urgent && <span className="urgent-flag">!</span>}
            <button className="cc-action" onClick={() => onEdit(cls)} title="Edit">✏️</button>
            <button className="cc-action cc-del" onClick={() => onDelete(cls.id)} title="Delete">🗑</button>
          </div>
        </div>
        <p className="class-days">{cls.days}</p>
        {cls.nextTest && (
          <div className="class-next-test">
            <span className="next-test-label">Next:</span>
            <span className="next-test-name">{cls.nextTestLabel}</span>
            {days !== null && (
              <span className={`next-test-days${days <= 7 ? ' soon' : ''}`}>
                {days === 0 ? 'Today' : days < 0 ? 'Done' : `${days}d`}
              </span>
            )}
          </div>
        )}
        <p className="class-notes">{cls.notes}</p>
        <ul className="task-list">
          {(cls.tasks || []).map((t, i) => <li key={i} className="task-item">{t}</li>)}
        </ul>
      </div>
    </div>
  );
}

export default function Classes() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const seededRef = useRef(false);

  const colRef = collection(db, 'users', user.uid, 'classes');

  useEffect(() => {
    const unsub = onSnapshot(colRef, (snap) => {
      if (snap.empty && !seededRef.current) {
        seededRef.current = true;
        Promise.all(
          CLASSES.map((cls, i) => addDoc(colRef, { ...cls, createdAt: Date.now() + i }))
        ).catch(console.error);
        return;
      }
      const docs = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      setClasses(docs);
      setLoading(false);
    }, (err) => { console.error(err); setLoading(false); });
    return unsub;
  }, [user.uid]);

  async function handleSave(data) {
    if (modal?.id) {
      const { id, ...rest } = data;
      await updateDoc(doc(db, 'users', user.uid, 'classes', modal.id), rest);
    } else {
      await addDoc(colRef, { ...data, createdAt: Date.now() });
    }
    setModal(null);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this class?')) return;
    await deleteDoc(doc(db, 'users', user.uid, 'classes', id));
  }

  if (loading) {
    return (
      <div className="page">
        <p className="empty-state">Loading classes…</p>
      </div>
    );
  }

  const urgent = classes.filter(c => c.urgent);
  const normal = classes.filter(c => !c.urgent);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Classes</h1>
          <p className="page-sub">{classes.length} class{classes.length !== 1 ? 'es' : ''} this semester</p>
        </div>
        <button className="btn-primary" onClick={() => setModal('add')}>+ Add class</button>
      </div>

      {urgent.length > 0 && (
        <>
          <h2 className="section-label">⚠ Needs Attention</h2>
          <div className="classes-grid">
            {urgent.map(cls => (
              <ClassCard key={cls.id} cls={cls} onEdit={c => setModal(c)} onDelete={handleDelete} />
            ))}
          </div>
        </>
      )}

      <h2 className="section-label">All Classes</h2>
      {normal.length === 0 && urgent.length === 0
        ? <p className="empty-state">No classes yet — add your first one above.</p>
        : (
          <div className="classes-grid">
            {normal.map(cls => (
              <ClassCard key={cls.id} cls={cls} onEdit={c => setModal(c)} onDelete={handleDelete} />
            ))}
          </div>
        )
      }

      {modal && (
        <ClassModal
          initial={modal === 'add' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
