import { useState, useEffect, useRef } from 'react';
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [classNames, setClassNames] = useState([]);
  const [filterGroup, setFilterGroup] = useState('all');
  const [title, setTitle] = useState('');
  const [group, setGroup] = useState('');
  const inputRef = useRef(null);

  const colRef = collection(db, 'users', user.uid, 'tasks');

  useEffect(() => {
    const unsub = onSnapshot(colRef, snap => {
      setTasks(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
      );
    });
    return unsub;
  }, [user.uid]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users', user.uid, 'classes'), snap => {
      setClassNames(snap.docs.map(d => d.data().name).filter(Boolean));
    });
    return unsub;
  }, [user.uid]);

  const taskGroups = [...new Set(tasks.map(t => t.group).filter(Boolean))];
  const allGroupOptions = [...new Set([...taskGroups, ...classNames])].sort();

  async function handleAdd(e) {
    e.preventDefault();
    if (!title.trim()) return;
    await addDoc(colRef, {
      title: title.trim(),
      group: group.trim() || 'General',
      done: false,
      createdAt: Date.now(),
    });
    setTitle('');
    inputRef.current?.focus();
  }

  async function toggle(task) {
    await updateDoc(doc(db, 'users', user.uid, 'tasks', task.id), { done: !task.done });
  }

  async function remove(id) {
    await deleteDoc(doc(db, 'users', user.uid, 'tasks', id));
  }

  const visible = filterGroup === 'all'
    ? tasks
    : tasks.filter(t => t.group === filterGroup);

  const byGroup = visible.reduce((acc, t) => {
    const g = t.group || 'General';
    (acc[g] = acc[g] || []).push(t);
    return acc;
  }, {});

  const pending = tasks.filter(t => !t.done).length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-sub">{pending} remaining</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <form onSubmit={handleAdd} className="task-add-form">
          <input
            ref={inputRef}
            className="cf-input"
            style={{ flex: '1 1 200px' }}
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="New task…"
            autoComplete="off"
          />
          <input
            className="cf-input"
            style={{ flex: '0 1 180px' }}
            value={group}
            onChange={e => setGroup(e.target.value)}
            placeholder="Group"
            list="task-groups-list"
            autoComplete="off"
          />
          <datalist id="task-groups-list">
            {allGroupOptions.map(g => <option key={g} value={g} />)}
          </datalist>
          <button type="submit" className="btn-primary">Add</button>
        </form>
      </div>

      {taskGroups.length > 0 && (
        <div className="task-filter-row">
          {['all', ...taskGroups].map(g => (
            <button
              key={g}
              className={filterGroup === g ? 'task-filter-btn active' : 'task-filter-btn'}
              onClick={() => setFilterGroup(g)}
            >
              {g === 'all' ? 'All' : g}
            </button>
          ))}
        </div>
      )}

      {tasks.length === 0 && (
        <p className="empty-state">No tasks yet — add your first one above.</p>
      )}

      {Object.entries(byGroup).map(([g, groupTasks]) => (
        <div key={g} style={{ marginBottom: 20 }}>
          {filterGroup === 'all' && <h2 className="section-label">{g}</h2>}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {groupTasks.map(task => (
              <div key={task.id} className={`task-row${task.done ? ' task-row-done' : ''}`}>
                <button
                  className={`task-check${task.done ? ' task-check-done' : ''}`}
                  onClick={() => toggle(task)}
                  aria-label={task.done ? 'Mark undone' : 'Mark done'}
                />
                <span className="task-row-title">{task.title}</span>
                {filterGroup !== 'all' && task.group && (
                  <span className="task-group-badge">{task.group}</span>
                )}
                <button
                  className="cc-action cc-del"
                  onClick={() => remove(task.id)}
                  title="Delete"
                >🗑</button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
