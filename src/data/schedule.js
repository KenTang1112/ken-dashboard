export const PERIODS = [
  { id: 1, time: '08:45–10:15' },
  { id: 2, time: '10:30–12:00' },
  { id: 3, time: '13:00–14:30' },
  { id: 4, time: '14:45–16:15' },
  { id: 5, time: '16:30–18:00' },
];

export const TIMETABLE = {
  Monday: [
    { period: 1, class: '中級3やりとり',    short: 'やりとり', color: '#3B82F6' },
    { period: 2, class: '中級3表現',        short: '表現 ✓テスト', color: '#8B5CF6' },
    { period: 3, class: '中級3理解',        short: '理解',     color: '#06B6D4' },
    { period: 4, class: 'Japanese Culture I', short: 'Culture', color: '#F59E0B' },
    { period: 5, class: 'Career Planning',  short: 'Career',   color: '#10B981' },
  ],
  Tuesday: [
    { period: 3, class: 'Japanese History',   short: 'History', color: '#EF4444' },
    { period: 4, class: 'Gym',                short: 'Gym 💪',  color: '#6B7280', optional: true },
    { period: 5, class: 'Political Cartoon',  short: 'Cartoon', color: '#F97316' },
  ],
  Wednesday: [
    { period: 1, class: '中級3やりとり',    short: 'やりとり', color: '#3B82F6' },
    { period: 2, class: '中級3表現',        short: '表現 ✓テスト', color: '#8B5CF6' },
    { period: 3, class: '中級3理解',        short: '理解',     color: '#06B6D4' },
    { period: 5, class: 'PE Lecture',       short: 'PE',       color: '#84CC16' },
  ],
  Thursday: [
    { period: 4, class: 'Japanese Management',  short: 'Management', color: '#14B8A6' },
    { period: 5, class: 'Academic Skills',      short: 'Acad Skills', color: '#A78BFA' },
  ],
  Friday: [
    { period: 2, class: 'Intro to Economics',   short: 'Econ',       color: '#EC4899' },
    { period: 3, class: 'Gym',                  short: 'Gym 💪',     color: '#6B7280', optional: true },
    { period: 4, class: '運用やりとり³',        short: 'Radio/討論', color: '#6366F1' },
  ],
};

export const FREE_WINDOWS = [
  { day: 'Mon', window: '18:00+',      note: 'Light tasks only — heaviest day' },
  { day: 'Tue', window: 'Before 13:00', note: 'Deep study, JLPT, projects' },
  { day: 'Wed', window: '12:00–13:00', note: 'Quick prep for afternoon' },
  { day: 'Thu', window: '12:00–13:00', note: 'Econ or Management prep' },
  { day: 'Fri', window: 'Before 10:30', note: 'JLPT or personal project' },
  { day: 'Fri', window: 'After 16:15', note: 'Weekend prep, long study block' },
];
