import { Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { USE_MOCK } from '../config.js';

export default function AuthShell({ title, subtitle, children, footer }) {
  const { dark, toggle } = useTheme();
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 p-10 text-white lg:flex">
        <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-600" /><b className="text-lg">Urban Heatmap</b></div>
        <div>
          <h2 className="max-w-md text-4xl font-bold leading-tight">Find the heat. Explain it. Cool it down.</h2>
          <p className="mt-4 max-w-md text-teal-100">Satellite-derived land surface temperature, XGBoost predictions and SHAP explanations to plan cooling strategies for Delhi-NCR.</p>
        </div>
        <div className="text-xs text-teal-200">Ajay Kumar Garg Engineering College, Ghaziabad</div>
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-500/30 blur-3xl" aria-hidden="true" />
      </div>
      <div className="relative flex items-center justify-center px-5 py-10">
        <button onClick={toggle} className="btn-ghost absolute right-4 top-4 !min-h-[40px] !rounded-full !px-3" aria-label="Switch between light and dark theme">{dark ? <Sun size={16} /> : <Moon size={16} />}</button>
        <div className="w-full max-w-md">
          <Link to="/login" className="mb-8 flex items-center gap-3 lg:hidden"><div className="h-9 w-9 rounded-xl bg-gradient-to-br from-teal-400 to-teal-700" /><b>Urban Heatmap</b></Link>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="muted mt-1 text-sm">{subtitle}</p>
          <div className="mt-6">{children}</div>
          <div className="muted mt-6 text-center text-sm">{footer}</div>
          {USE_MOCK && <p className="mt-6 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">Demo mode: accounts are stored only in this browser. Do not use a real password.</p>}
        </div>
      </div>
    </div>
  );
}
