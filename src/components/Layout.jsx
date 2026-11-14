import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Map as MapIcon, LineChart, BarChart3, Snowflake, Lightbulb, FileText, Menu, X, Moon, Sun, Search } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/heatmap', label: 'Heatmap', icon: MapIcon },
  { to: '/prediction', label: 'XGBoost Prediction', icon: LineChart },
  { to: '/shap', label: 'Explainability (SHAP)', icon: BarChart3 },
  { to: '/scenarios', label: 'Cooling Scenarios', icon: Snowflake },
  { to: '/recommendations', label: 'Recommendations', icon: Lightbulb },
  { to: '/reports', label: 'Reports', icon: FileText },
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { dark, toggle } = useTheme();

  return (
    <div className="min-h-screen">
      {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} aria-hidden="true" />}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white p-4 transition-transform dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
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
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm transition ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500 to-teal-300 font-medium text-white'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl bg-teal-50 p-4 text-xs leading-relaxed text-teal-800 dark:bg-teal-950 dark:text-teal-300">
          <b>Greener Cities</b><br />Lower Temperatures<br />A Sustainable Tomorrow
        </div>
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-slate-50/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 sm:px-7">
          <button className="rounded-lg p-2 hover:bg-slate-200 dark:hover:bg-slate-800 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
          <label className="relative hidden max-w-md flex-1 sm:block">
            <span className="sr-only">Search location</span>
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search location (e.g., Delhi-NCR, Sector 62…)"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
          <div className="ml-auto flex items-center gap-3">
            <span className="chip hidden md:inline-block" title="Figures are placeholders until the trained model is connected">Sample data</span>
            <button className="btn-ghost !min-h-[40px] !rounded-full !px-3.5" onClick={toggle} aria-label="Switch between light and dark theme">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
              <span className="hidden sm:inline">{dark ? 'Light mode' : 'Dark mode'}</span>
            </button>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">NS</span>
            <b className="hidden text-sm md:inline">Nitya Singhal</b>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-5 px-4 py-6 sm:px-7">
          <Outlet />
        </main>

        <footer className="flex flex-wrap justify-between gap-x-6 gap-y-2 border-t border-slate-200 px-4 py-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:px-7">
          <span>© 2026 Urban Heatmap · Ajay Kumar Garg Engineering College, Ghaziabad</span>
          <span>Landsat 9 · Sentinel-2 · ERA5 · OpenStreetMap · XGBoost + SHAP</span>
        </footer>
      </div>
    </div>
  );
}
