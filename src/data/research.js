// Edit this file to update the Research tab. Each project appears as a card.
// status: 'not-started' | 'in-progress' | 'done'
// dueDate: 'YYYY-MM-DD' or null
// sources: array of { label, url } — leave as [] if none yet

export const RESEARCH_PROJECTS = [
  {
    id: 'history-book-review',
    title: 'History Book Review',
    class: 'History',
    status: 'not-started',
    dueDate: '2026-06-23',
    description: 'Book not yet chosen. Proposal must include the main argument and key evidence.',
    notes: '',
    sources: [],
  },
  {
    id: 'academic-skills-kadai1',
    title: 'Academic Skills — 課題1 Poster',
    class: 'Academic Skills',
    status: 'in-progress',
    dueDate: '2026-05-21',
    description: 'Poster presentation on chosen topic.',
    notes: 'Presenting May 21.',
    sources: [],
  },
  {
    id: 'academic-skills-kadai2',
    title: 'Academic Skills — 課題2 Poster',
    class: 'Academic Skills',
    status: 'not-started',
    dueDate: '2026-06-18',
    description: 'Topic TBD after feedback from 課題1.',
    notes: '',
    sources: [],
  },
  {
    id: 'academic-skills-kadai3',
    title: 'Academic Skills — 課題3 Poster',
    class: 'Academic Skills',
    status: 'not-started',
    dueDate: '2026-07-16',
    description: 'Topic TBD after feedback from 課題2.',
    notes: '',
    sources: [],
  },
  {
    id: 'culture-mini-presentation',
    title: 'Culture I Mini-Presentation',
    class: 'Culture I',
    status: 'not-started',
    dueDate: '2026-07-06',
    description: 'One concept or seminal work in cultural studies.',
    notes: 'Topic TBD.',
    sources: [],
  },
];

export const STATUS_META = {
  'not-started': { label: 'Not started', color: '#6B7280' },
  'in-progress':  { label: 'In progress',  color: '#3B82F6' },
  'done':          { label: 'Done',          color: '#10B981' },
};
