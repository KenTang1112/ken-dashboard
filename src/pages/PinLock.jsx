import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFinanceAuth } from '../context/FinanceAuthContext';

const NUMPAD = [
  ['1','2','3'],
  ['4','5','6'],
  ['7','8','9'],
  ['del','0','ok'],
];

export default function PinLock() {
  const [digits, setDigits] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { unlock } = useFinanceAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/finance';

  function press(key) {
    if (key === 'del') {
      setDigits(d => d.slice(0, -1));
      setError('');
    } else if (key === 'ok') {
      submit();
    } else if (digits.length < 4) {
      setError('');
      setDigits(d => [...d, key]);
    }
  }

  async function submit() {
    if (digits.length < 4 || loading) return;
    setLoading(true);
    const ok = await unlock(digits.join(''));
    setLoading(false);
    if (ok) {
      navigate(from, { replace: true });
    } else {
      setError('Incorrect PIN');
      setDigits([]);
    }
  }

  // Auto-submit when 4 digits are entered
  useEffect(() => {
    if (digits.length === 4) submit();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits]);

  // Keyboard support
  useEffect(() => {
    function onKey(e) {
      if (e.key >= '0' && e.key <= '9') press(e.key);
      if (e.key === 'Backspace') press('del');
      if (e.key === 'Enter') press('ok');
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits, loading]);

  return (
    <div className="page pin-page">
      <div style={{ textAlign: 'center' }}>
        <div className="pin-lock-icon">🔒</div>
        <h1 className="pin-title">Finance</h1>
        <p className="pin-sub">Enter your PIN to continue</p>
      </div>

      <div className="pin-display">
        {[0,1,2,3].map(i => (
          <div key={i} className={`pin-dot${digits.length > i ? ' filled' : ''}`} />
        ))}
      </div>

      <p className="pin-error">{error}</p>

      <div className="pin-numpad">
        {NUMPAD.flat().map(key => {
          if (key === 'del') return (
            <button key="del" className="pin-btn pin-btn-delete" onClick={() => press('del')}>⌫</button>
          );
          if (key === 'ok') return (
            <button
              key="ok"
              className="pin-btn pin-btn-confirm"
              onClick={() => press('ok')}
              disabled={digits.length < 4 || loading}
            >
              {loading ? '…' : '✓'}
            </button>
          );
          return (
            <button key={key} className="pin-btn" onClick={() => press(key)}>{key}</button>
          );
        })}
      </div>
    </div>
  );
}
