// localStorage keys — update these to match your kanji app's exact keys if different
// Check src/services/dataService.js in kanji-study-app for the actual keys
export const KANJI_LS_KEYS = {
  weaknessScores: 'kanji_weakness_scores',   // { [wordId]: number 0–10 }
  chapterProgress: 'kanji_chapter_progress', // { [chapterId]: { mastered, total } }
  sessionHistory: 'kanji_session_history',   // array of session records
  activeChapters: 'kanji_active_chapters',   // array of chapter IDs currently active
};

export const QUIZ_SCHEDULE = [
  { date: '2026-05-13', chapters: '第15–19課', done: true },
  { date: '2026-06-01', chapters: '第20–22課', done: false },
  { date: '2026-06-08', chapters: '第23課', done: false },
  { date: '2026-06-22', chapters: '第24–26課', done: false },
  { date: '2026-06-29', chapters: '第27課', done: false },
];

export function getKanjiProgress() {
  try {
    const raw = localStorage.getItem(KANJI_LS_KEYS.chapterProgress);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function getWeaknessScores() {
  try {
    const raw = localStorage.getItem(KANJI_LS_KEYS.weaknessScores);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function getActiveChapters() {
  try {
    const raw = localStorage.getItem(KANJI_LS_KEYS.activeChapters);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
