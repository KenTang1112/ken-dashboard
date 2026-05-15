const KEY = 'ken_quick_notes';

function pad(n) { return String(n).padStart(2, '0'); }

function timestamp() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function getNotes() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}

export function addNote(text) {
  const notes = getNotes();
  const note = { id: Date.now(), timestamp: timestamp(), text: text.trim(), processed: false };
  const updated = [note, ...notes];
  localStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}

export function markProcessed(id) {
  const notes = getNotes().map(n => n.id === id ? { ...n, processed: true } : n);
  localStorage.setItem(KEY, JSON.stringify(notes));
  return notes;
}

export function deleteNote(id) {
  const notes = getNotes().filter(n => n.id !== id);
  localStorage.setItem(KEY, JSON.stringify(notes));
  return notes;
}

export function toMarkdown(notes) {
  const unprocessed = notes.filter(n => !n.processed);
  const processed = notes.filter(n => n.processed);
  const lines = ['# Quick Notes', '', '## Unprocessed'];
  if (unprocessed.length === 0) lines.push('(none)');
  else unprocessed.forEach(n => lines.push(`- [ ] ${n.timestamp} — ${n.text}`));
  if (processed.length) {
    lines.push('', '## Processed');
    processed.forEach(n => lines.push(`- [x] ${n.timestamp} — ${n.text}`));
  }
  return lines.join('\n');
}
