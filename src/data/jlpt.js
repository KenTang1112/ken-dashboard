export const JLPT_SECTIONS = [
  { id: 'vocab', label: '語彙 (Vocabulary)', status: 'not_started', notes: 'Identify main study book (新完全マスター or TRY! N2)' },
  { id: 'grammar', label: '文法 (Grammar)', status: 'not_started', notes: '' },
  { id: 'reading', label: '読解 (Reading)', status: 'supported', notes: 'Supported by 理解 class' },
  { id: 'listening', label: '聴解 (Listening)', status: 'supported', notes: 'Supported by 理解 class' },
  { id: 'kanji', label: '漢字', status: 'active', notes: 'Supported by Career Planning quiz schedule' },
];

export const JLPT_RESOURCES = [
  { label: 'Choose N2 study book', done: false },
  { label: 'Set up Anki or vocab review system', done: false },
  { label: 'Confirm exam registration date', done: false },
  { label: 'Add practice test schedule', done: false },
];

export const BEST_STUDY_WINDOWS = [
  { day: 'Friday', time: 'Before 10:30', note: 'Primary JLPT window' },
  { day: 'Tuesday', time: 'Before 13:00', note: 'Secondary window' },
];
