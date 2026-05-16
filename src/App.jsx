import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { FinanceAuthProvider, useFinanceAuth } from './context/FinanceAuthContext';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import Deadlines from './pages/Deadlines';
import Classes from './pages/Classes';
import Kanji from './pages/Kanji';
import JLPT from './pages/JLPT';
import Research from './pages/Research';
import Notes from './pages/Notes';
import PinLock from './pages/PinLock';
import FinanceOverview from './pages/FinanceOverview';
import FinanceTracker from './pages/FinanceTracker';
import FinanceInvestments from './pages/FinanceInvestments';
import FinanceNews from './pages/FinanceNews';
import './index.css';

const NAV = [
  { to: '/',         label: 'Dashboard', icon: '⚡' },
  { to: '/schedule', label: 'Schedule',  icon: '📅' },
  { to: '/deadlines',label: 'Deadlines', icon: '🔴' },
  { to: '/classes',  label: 'Classes',   icon: '📚' },
  { to: '/kanji',    label: 'Kanji',     icon: '漢' },
  { to: '/jlpt',     label: 'JLPT N2',   icon: '🎯' },
  { to: '/research', label: 'Research',  icon: '🔬' },
  { to: '/finance',  label: 'Finance',   icon: '💰' },
  { to: '/notes',    label: 'Notes',     icon: '📝' },
];

function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-logo">KEN</span>
        <span className="sidebar-sub">Dashboard</span>
      </div>
      <ul className="sidebar-nav">
        {NAV.map(({ to, label, icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">{icon}</span>
              <span className="nav-label">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function MobileNav() {
  return (
    <nav className="mobile-nav">
      {NAV.slice(0, 6).map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`}
        >
          <span className="nav-icon">{icon}</span>
          <span className="mobile-nav-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

// Redirects to /finance/unlock if not authenticated, preserving the intended destination
function FinanceRoute({ children }) {
  const { authenticated } = useFinanceAuth();
  const location = useLocation();
  if (!authenticated) {
    return <Navigate to="/finance/unlock" state={{ from: location.pathname }} replace />;
  }
  return children;
}

export default function App() {
  return (
    <FinanceAuthProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/"          element={<Dashboard />} />
              <Route path="/schedule"  element={<Schedule />} />
              <Route path="/deadlines" element={<Deadlines />} />
              <Route path="/classes"   element={<Classes />} />
              <Route path="/kanji"     element={<Kanji />} />
              <Route path="/jlpt"      element={<JLPT />} />
              <Route path="/research"  element={<Research />} />
              <Route path="/notes"     element={<Notes />} />
              {/* Finance — PIN protected */}
              <Route path="/finance/unlock" element={<PinLock />} />
              <Route path="/finance" element={<FinanceRoute><FinanceOverview /></FinanceRoute>} />
              <Route path="/finance/tracker" element={<FinanceRoute><FinanceTracker /></FinanceRoute>} />
              <Route path="/finance/investments" element={<FinanceRoute><FinanceInvestments /></FinanceRoute>} />
              <Route path="/finance/news" element={<FinanceNews />} />
            </Routes>
          </main>
          <MobileNav />
        </div>
      </BrowserRouter>
    </FinanceAuthProvider>
  );
}
