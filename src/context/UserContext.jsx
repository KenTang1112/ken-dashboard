import { createContext, useContext, useState, useCallback } from 'react';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [activeUser, setActiveUser] = useState(
    () => localStorage.getItem('active_user') || null
  );

  function switchUser(username) {
    localStorage.setItem('active_user', username);
    setActiveUser(username);
  }

  function logout() {
    localStorage.removeItem('active_user');
    setActiveUser(null);
  }

  const getItem = useCallback((key) => {
    if (!activeUser) return null;
    return localStorage.getItem(`${activeUser}_${key}`);
  }, [activeUser]);

  const setItem = useCallback((key, value) => {
    if (!activeUser) return;
    localStorage.setItem(`${activeUser}_${key}`, value);
  }, [activeUser]);

  const removeItem = useCallback((key) => {
    if (!activeUser) return;
    localStorage.removeItem(`${activeUser}_${key}`);
  }, [activeUser]);

  return (
    <UserContext.Provider value={{ activeUser, switchUser, logout, getItem, setItem, removeItem }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
