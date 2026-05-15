import { useState, useEffect } from 'react';
import { getNotes, addNote, markProcessed, deleteNote, toMarkdown } from '../data/notes';

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => { setNotes(getNotes()); }, []);

  function handleAdd() {
    if (!input.trim()) return;
    setNotes(addNote(input));
    setInput('');
  }

  function handleKey(e) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAdd();
  }

  function handleMark(id) { setNotes(markProcessed(id)); }
  function handleDelete(id) { setNotes(deleteNote(id)); }

  function handleCopy() {
    navigator.clipboard.writeText(toMarkdown(notes));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const unprocessed = notes.filter(n => !n.processed);
  const processed = notes.filter(n => n.processed);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quick Notes</h1>
          <p className="page-sub">Captured for daily routine processing</p>
        </div>
        <button className={`btn-primary${copied ? ' btn-saved' : ''}`} onClick={handleCopy}>
          {copied ? '✓ Copied' : 'Copy as Markdown'}
        </button>
      </div>

      {/* Input */}
      <div className="card">
        <h2 className="card-title">New Note</h2>
        <textarea
          className="notes-textarea"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="e.g. history book chosen: Dusinberre — Mooring the Global Archive&#10;e.g. music club confirmed: Thursdays 18:30&#10;e.g. update finance: karaoke wages ¥52,000"
          rows={3}
        />
        <div className="notes-input-row">
          <button className="btn-primary" onClick={handleAdd} disabled={!input.trim()}>
            Save Note
          </button>
          <span className="info-note">Ctrl+Enter to save</span>
        </div>
      </div>

      {/* Unprocessed */}
      <div className="card">
        <h2 className="card-title">Unprocessed ({unprocessed.length})</h2>
        {unprocessed.length === 0 ? (
          <p className="empty-state">No unprocessed notes.</p>
        ) : (
          <div className="notes-list">
            {unprocessed.map(n => (
              <div key={n.id} className="note-item">
                <span className="note-checkbox">[ ]</span>
                <div className="note-body">
                  <span className="note-ts">{n.timestamp}</span>
                  <span className="note-text">{n.text}</span>
                </div>
                <div className="note-actions">
                  <button className="note-btn note-done" onClick={() => handleMark(n.id)}>✓ Done</button>
                  <button className="note-btn note-del" onClick={() => handleDelete(n.id)}>×</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Processed */}
      {processed.length > 0 && (
        <div className="card">
          <h2 className="card-title">Processed ({processed.length})</h2>
          <div className="notes-list">
            {processed.map(n => (
              <div key={n.id} className="note-item note-item-done">
                <span className="note-checkbox note-checkbox-done">[x]</span>
                <div className="note-body">
                  <span className="note-ts">{n.timestamp}</span>
                  <span className="note-text">{n.text}</span>
                </div>
                <button className="note-btn note-del" onClick={() => handleDelete(n.id)}>×</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
