import { LogOut } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { API_URL, USE_MOCK } from '../config.js';

export default function Profile() {
  const { user, logout } = useAuth();
  const rows = [['Full name', user.name], ['Email', user.email], ['Organization', user.organization || 'Not provided']];
  return (
    <>
      <PageHeader title="Profile" subtitle="Your account and connection details" />
      <div className="grid flex-1 gap-4 lg:grid-cols-3">
      <section className="card lg:col-span-2">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-lg font-bold text-white">{user.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}</span>
          <div><div className="text-lg font-bold">{user.name}</div><div className="muted">{user.email}</div></div>
        </div>
        <dl className="mt-5 divide-y divide-slate-100 text-sm dark:divide-slate-800">
          {rows.map(([k, v]) => <div key={k} className="flex justify-between gap-4 py-3"><dt className="muted text-sm">{k}</dt><dd className="font-medium">{v}</dd></div>)}
        </dl>
        <button className="btn-ghost mt-4" onClick={logout}><LogOut size={16} />Sign out</button>
      </section>
      <section className="card">
        <h2 className="card-title">Data source</h2>
        <p className="mt-2 text-sm">{USE_MOCK ? 'Using built-in sample data (demo mode).' : `Connected to the backend at ${API_URL}.`}</p>
        <p className="muted mt-1">Change this with VITE_USE_MOCK in the .env file.</p>
      </section>
      </div>
    </>
  );
}
