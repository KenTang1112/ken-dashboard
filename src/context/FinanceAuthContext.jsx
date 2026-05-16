import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from './UserContext';

const SESSION_TIMEOUT = 15 * 60 * 1000;
const DEFAULT_PIN = '0000';

const FinanceAuthContext = createContext(null);

async function hashPin(pin) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pin));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function FinanceAuthProvider({ children }) {
  const { activeUser, getItem, setItem } = useUser();
  const [authenticated, setAuthenticated] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    setAuthenticated(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [activeUser]);

  useEffect(() => {
    if (!getItem('pin_hash')) {
      hashPin(DEFAULT_PIN).then(h => {
        if (!getItem('pin_hash')) setItem('pin_hash', h);
      });
    }
  }, [activeUser, getItem, setItem]);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAuthenticated(false), SESSION_TIMEOUT);
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    const onActivity = () => startTimer();
    events.forEach(e => window.addEventListener(e, onActivity, { passive: true }));
    startTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, onActivity));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [authenticated, startTimer]);

  async function unlock(pin) {
    const hash = await hashPin(pin);
    const stored = getItem('pin_hash');
    if (hash === stored) { setAuthenticated(true); return true; }
    return false;
  }

  function lock() {
    setAuthenticated(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  return (
    <FinanceAuthContext.Provider value={{ authenticated, unlock, lock }}>
      {children}
    </FinanceAuthContext.Provider>
  );
}

export function useFinanceAuth() {
  return useContext(FinanceAuthContext);
}
