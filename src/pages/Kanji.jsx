import { useState, useEffect } from 'react';
import { QUIZ_SCHEDULE, KANJI_LS_KEYS, getKanjiProgress, getWeaknessScores } from '../data/kanji';

function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(dateStr) - today) / (1000 * 60 * 60 * 24));
}

export default function Kanji() {
  const [progress, setProgress] = useState({});
  const [scores, setScores] = useState({});
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const p = getKanjiProgress();
    const s = getWeaknessScores();
    setProgress(p);
    setScores(s);
    setConnected(Object.keys(p).length > 0 || Object.keys(s).length > 0);
  }, []);

  const totalWords = Object.values(scores).length;
  const weakWords = Object.values(scores).filter(v => v >= 5).length;
  const masteredWords = Object.values(scores).filter(v => v <= 1).length;

  const nextQuiz = QUIZ_SCHEDULE.find(q => !q.done && daysUntil(q.date) >= 0);
  const nextQuizDays = nextQuiz ? daysUntil(nextQuiz.date) : null;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">漢字 Kanji</h1>
          <p className="page-sub">Advanced Japanese Kanji — chapter tracker</p>
        </div>
        <a
          href="https://kanji-study-app-weld.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
        >
          Open App ↗
        </a>
      </div>

      {/* Connection status */}
      <div className={`connection-banner ${connected ? 'connected' : 'disconnected'}`}>
        {connected ? (
          <>✓ Connected to kanji app localStorage — {totalWords} words tracked</>
        ) : (
          <>No kanji data found in localStorage. Open your kanji app first, then refresh this page.</>
        )}
      </div>

      {/* Stats */}
      {connected && (
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-num">{totalWords}</span>
            <span className="stat-label">Words tracked</span>
          </div>
          <div className="stat-card stat-green">
            <span className="stat-num">{masteredWords}</span>
            <span className="stat-label">Mastered (≤1 score)</span>
          </div>
          <div className="stat-card stat-red">
            <span className="stat-num">{weakWords}</span>
            <span className="stat-label">Weak (≥5 score)</span>
          </div>
        </div>
      )}

      {/* Next quiz */}
      {nextQuiz && (
        <div className={`card next-quiz-card ${nextQuizDays <= 7 ? 'urgent' : ''}`}>
          <h2 className="card-title">Next 漢字クイズ</h2>
          <div className="next-quiz-info">
            <div>
              <span className="next-quiz-chapters">{nextQuiz.chapters}</span>
              <span className="next-quiz-date">{nextQuiz.date}</span>
            </div>
            <span className={`badge ${nextQuizDays <= 3 ? 'badge-urgent' : nextQuizDays <= 7 ? 'badge-soon' : 'badge-normal'}`}>
              {nextQuizDays === 0 ? 'Today' : `${nextQuizDays}d`}
            </span>
          </div>
        </div>
      )}

      {/* Quiz schedule */}
      <div className="card">
        <h2 className="card-title">Quiz Schedule</h2>
        <div className="quiz-schedule">
          {QUIZ_SCHEDULE.map((q, i) => {
            const days = daysUntil(q.date);
            return (
              <div key={i} className={`quiz-row ${q.done ? 'quiz-done' : ''}`}>
                <span className={`quiz-status ${q.done ? 'done' : days <= 0 ? 'overdue' : ''}`}>
                  {q.done ? '✓' : '○'}
                </span>
                <span className="quiz-chapters">{q.chapters}</span>
                <span className="quiz-date">{q.date}</span>
                {!q.done && (
                  <span className={`badge ${days <= 3 ? 'badge-urgent' : days <= 7 ? 'badge-soon' : 'badge-normal'}`}>
                    {days < 0 ? 'Past' : days === 0 ? 'Today' : `${days}d`}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* localStorage keys reference */}
      <div className="card info-card">
        <h2 className="card-title">localStorage Keys</h2>
        <p className="info-note">
          This dashboard reads from the same localStorage as your kanji app.
          If data isn't showing, verify these keys match <code>src/services/dataService.js</code>:
        </p>
        <div className="ls-keys">
          {Object.entries(KANJI_LS_KEYS).map(([k, v]) => (
            <div key={k} className="ls-key-row">
              <code className="ls-key-name">{k}</code>
              <code className="ls-key-value">"{v}"</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
