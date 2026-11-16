import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Map as MapIcon, LineChart, BarChart3, Snowflake, Lightbulb, FileText, Menu, X, Moon, Sun, LogOut, UserRound } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { USE_MOCK } from '../config.js';
import LocationSearch from './LocationSearch.jsx';

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/heatmap', label: 'Heatmap', icon: MapIcon },
  { to: '/prediction', label: 'XGBoost Prediction', icon: LineChart },
  { to: '/shap', label: 'Explainability (SHAP)', icon: BarChart3 },
  { to: '/scenarios', label: 'Cooling Scenarios', icon: Snowflake },
  { to: '/recommendations', label: 'Recommendations', icon: Lightbulb },
  { to: '/reports', label: 'Reports', icon: FileText },
];

const initials = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || 'U';

export default function Layout() {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef(null);
  const { dark, toggle } = useTheme();
  const { user, logout } = useAuth();
  const { cities, city, setCityId, date, setDate, latestDate } = useApp();

  useEffect(() => {
    const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div className="min-h-screen">
      {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden print:hidden" onClick={() => setOpen(false)} aria-hidden="true" />}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white p-4 transition-transform dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0 print:hidden ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-700" />
            <div>
              <div className="font-bold leading-tight">Urban Heatmap</div>
              <div className="muted">Smart Cities, Cooler Futures</div>
            </div>
          </div>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X size={20} /></button>
        </div>
        <nav className="flex flex-col gap-1" aria-label="Main">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm transition ${isActive ? 'bg-gradient-to-r from-teal-500 to-teal-300 font-medium text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
              <Icon size={18} />{label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl bg-teal-50 p-4 text-xs leading-relaxed text-teal-800 dark:bg-teal-950 dark:text-teal-300">
          <b>Greener Cities</b><br />Lower Temperatures<br />A Sustainable Tomorrow
        </div>
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-64 print:pl-0">
        <header className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-slate-200 bg-slate-50/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 sm:px-7 print:hidden">
          <button className="rounded-lg p-2 hover:bg-slate-200 dark:hover:bg-slate-800 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={22} /></button>
          <LocationSearch />
          <div className="ml-auto flex flex-wrap items-center gap-2 sm:gap-3">
            <label className="sr-only" htmlFor="city">City</label>
            <select id="city" value={city.id} onChange={(e) => setCityId(e.target.value)} className="chip !py-2">
              {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <label className="sr-only" htmlFor="date">Date</label>
            <input id="date" type="date" value={date || latestDate} max={latestDate || undefined} onChange={(e) => setDate(e.target.value)} className="chip !py-1.5" />
            {USE_MOCK && <span className="chip hidden xl:inline-block" title="Showing built-in sample data. Set VITE_USE_MOCK=false to use the backend.">Sample data</span>}
            <button className="btn-ghost !min-h-[40px] !rounded-full !px-3.5" onClick={toggle} aria-label="Switch between light and dark theme">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
              <span className="hidden sm:inline">{dark ? 'Light' : 'Dark'}</span>
            </button>
            <div ref={menuRef} className="relative">
              <button onClick={() => setMenu((m) => !m)} aria-haspopup="menu" aria-expanded={menu} aria-label="Account menu"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">{initials(user?.name)}</button>
              {menu && (
                <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
                  <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                    <div className="truncate text-sm font-bold">{user?.name}</div>
                    <div className="muted truncate">{user?.email}</div>
                  </div>
                  <Link role="menuitem" to="/profile" onClick={() => setMenu(false)} className="flex min-h-[44px] items-center gap-2 px-4 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"><UserRound size={16} />Profile</Link>
                  <button role="menuitem" onClick={logout} className="flex min-h-[44px] w-full items-center gap-2 px-4 text-left text-sm text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800"><LogOut size={16} />Sign out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-5 px-4 py-6 sm:px-7 [&>*:last-child]:flex-1"><Outlet /></main>

        <footer className="flex flex-wrap justify-between gap-x-6 gap-y-2 border-t border-slate-200 px-4 py-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:px-7 print:hidden">
          <span>© 2026 Urban Heatmap · Ajay Kumar Garg Engineering College, Ghaziabad</span>
          <span>Landsat 9 · Sentinel-2 · ERA5 · OpenStreetMap · XGBoost + SHAP</span>
        </footer>
      </div>
    </div>
  );
}
