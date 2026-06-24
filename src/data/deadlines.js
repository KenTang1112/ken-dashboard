export const DEADLINES = [
  // ── Past (kept for reference — shown as "Done" once date passes) ───────────
  // May
  { date: '2026-05-20', label: '表現 確認テスト④', class: '表現', type: 'test' },
  { date: '2026-05-21', label: 'Academic Skills 課題1 発表', class: 'Academic Skills', type: 'presentation' },
  { date: '2026-05-25', label: 'Culture I — Chair Duty Session 6 (ibasho)', class: 'Culture I', type: 'presentation' },
  { date: '2026-05-25', label: 'Career Planning レポート (飯田先生)', class: 'Career Planning', type: 'report' },
  { date: '2026-05-27', label: '表現 確認テスト⑤', class: '表現', type: 'test' },
  // June
  { date: '2026-06-01', label: '漢字クイズ 第20–22課', class: 'Career Planning', type: 'test' },
  { date: '2026-06-03', label: 'PE 中間テスト', class: 'PE', type: 'test' },
  { date: '2026-06-08', label: '表現 確認テスト⑥⑦ (double)', class: '表現', type: 'test' },
  { date: '2026-06-08', label: 'やりとり 中間試験①', class: 'やりとり', type: 'test' },
  { date: '2026-06-08', label: '漢字クイズ 第23課', class: 'Career Planning', type: 'test' },
  { date: '2026-06-10', label: 'やりとり 中間試験②', class: 'やりとり', type: 'test' },
  { date: '2026-06-15', label: 'Career Planning レポート (ひろかさん/ユニクロ)', class: 'Career Planning', type: 'report' },
  { date: '2026-06-18', label: 'Academic Skills 課題2 発表', class: 'Academic Skills', type: 'presentation' },
  { date: '2026-06-21', label: 'Career Planning レポート (ヴァンさん/GLOBIS) — Zoom 10:00', class: 'Career Planning', type: 'report' },
  { date: '2026-06-22', label: '漢字クイズ 第24–26課', class: 'Career Planning', type: 'test' },
  { date: '2026-06-23', label: 'History — Book review proposal due', class: 'History', type: 'assignment' },

  // ── Upcoming ───────────────────────────────────────────────────────────────
  // Week of Jun 24
  { date: '2026-06-25', label: 'Academic Skills — 課題3 topic discussion', class: 'Academic Skills', type: 'event' },
  { date: '2026-06-26', label: 'Culture I GC comment (Week 11 — everyday resistance) by 20:00', class: 'Culture I', type: 'recurring' },
  { date: '2026-06-26', label: '運用やりとり³ — Radio program session 11', class: '運用やりとり', type: 'event' },
  { date: '2026-06-29', label: '漢字クイズ 第27課', class: 'Career Planning', type: 'test', urgent: true },

  // Week of Jun 30
  { date: '2026-07-03', label: 'Culture I GC comment (Week 12) by 20:00', class: 'Culture I', type: 'recurring' },
  { date: '2026-07-03', label: '運用やりとり³ — Radio program session 12', class: '運用やりとり', type: 'event' },

  // July — major dates
  { date: '2026-07-05', label: 'JLPT N2 本番 (Sunday)', class: 'JLPT', type: 'exam', urgent: true },
  { date: '2026-07-06', label: 'Career Planning レポート (マルバさん/Amazon)', class: 'Career Planning', type: 'report' },
  { date: '2026-07-06', label: 'Culture I — Mini-presentation (3–5 min, Session 12)', class: 'Culture I', type: 'presentation', urgent: true },
  { date: '2026-07-07', label: 'History — Annotated extract due', class: 'History', type: 'assignment', urgent: true },
  { date: '2026-07-08', label: '表現 2分間スピーチ発表 ⚠', class: '表現', type: 'presentation', urgent: true },
  { date: '2026-07-10', label: 'Culture I GC comment (Week 13) by 20:00', class: 'Culture I', type: 'recurring' },
  { date: '2026-07-13', label: '理解 発表（読解）', class: '理解', type: 'presentation' },
  { date: '2026-07-13', label: '⚠ Sapporo Networking Event (ジョブキタビル8階)', class: 'Career Planning', type: 'event', urgent: true },
  { date: '2026-07-15', label: '理解 発表（聴解）', class: '理解', type: 'presentation' },
  { date: '2026-07-16', label: 'Academic Skills 課題3 発表', class: 'Academic Skills', type: 'presentation', urgent: true },
  { date: '2026-07-17', label: 'Culture I GC comment (Week 14) by 20:00', class: 'Culture I', type: 'recurring' },
  { date: '2026-07-21', label: 'History — 1-on-1 book review discussion with Bull', class: 'History', type: 'exam' },
  { date: '2026-07-22', label: '理解 発表（聴解）', class: '理解', type: 'presentation' },
  { date: '2026-07-22', label: 'PE 期末試験', class: 'PE', type: 'test', urgent: true },
  { date: '2026-07-23', label: 'Academic Skills 最終授業', class: 'Academic Skills', type: 'event' },
  { date: '2026-07-24', label: 'Culture I GC comment (Week 15) by 20:00', class: 'Culture I', type: 'recurring' },
  { date: '2026-07-27', label: '表現 最終レポート締切', class: '表現', type: 'assignment' },
  { date: '2026-07-27', label: '理解 発表（聴解）', class: '理解', type: 'presentation' },
  { date: '2026-07-27', label: '表現 最終プレゼン①', class: '表現', type: 'presentation' },
  { date: '2026-07-27', label: 'Career Planning 最終プレゼン / 最終授業', class: 'Career Planning', type: 'presentation' },
  { date: '2026-07-28', label: 'History — Last class', class: 'History', type: 'event' },
  { date: '2026-07-29', label: 'やりとり 期末試験①', class: 'やりとり', type: 'test', urgent: true },
  { date: '2026-07-29', label: '表現 最終プレゼン②', class: '表現', type: 'presentation' },
  { date: '2026-07-29', label: '理解 期末試験（筆記＋再話）', class: '理解', type: 'test' },
  { date: '2026-07-29', label: 'PE 最終授業', class: 'PE', type: 'event' },
  { date: '2026-07-31', label: '運用やりとり³ 最終授業', class: '運用やりとり', type: 'event' },

  // August
  { date: '2026-08-03', label: 'やりとり 期末試験②', class: 'やりとり', type: 'test' },
  { date: '2026-08-03', label: '表現 最終プレゼン③', class: '表現', type: 'presentation' },
  { date: '2026-08-05', label: '表現 期末試験／最終授業', class: '表現', type: 'test' },
  { date: '2026-08-05', label: 'やりとり 期末試験③／最終授業', class: 'やりとり', type: 'test' },
  { date: '2026-08-05', label: '理解 最終授業', class: '理解', type: 'event' },
  { date: '2026-08-10', label: 'History — Final book review due (1500 words)', class: 'History', type: 'assignment', urgent: true },

  // December / January — Project Study
  { date: '2026-12-07', label: 'Project Study I — Essay submission (50%, 2500–3000 words)', class: 'Project Study', type: 'assignment' },
  { date: '2027-01-15', label: 'Project Study I — Japanese slides submission', class: 'Project Study', type: 'assignment' },
  { date: '2027-01-22', label: 'Project Study I — Oral presentation (4–6 min + 10 min Q&A in JP)', class: 'Project Study', type: 'presentation' },
];

export const TYPE_COLORS = {
  test:         '#EF4444',
  presentation: '#8B5CF6',
  assignment:   '#F59E0B',
  report:       '#3B82F6',
  recurring:    '#6B7280',
  event:        '#10B981',
  exam:         '#EC4899',
};

export const TYPE_LABELS = {
  test:         'Test',
  presentation: 'Presentation',
  assignment:   'Assignment',
  report:       'Report',
  recurring:    'Recurring',
  event:        'Event',
  exam:         'Exam',
};
