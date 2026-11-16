import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';
import { api } from '../services/api.js';
import { useApp } from '../context/AppContext.jsx';

export default function LocationSearch() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const box = useRef(null);
  const navigate = useNavigate();
  const { setPlace } = useApp();

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setResults([]); setMsg(''); return; }
    let on = true;
    const t = setTimeout(() => {
      api.search({ q: term })
        .then((r) => { if (on) { setResults(r); setMsg(r.length ? '' : 'No matching place found'); } })
        .catch((e) => { if (on) { setResults([]); setMsg(e.message); } });
    }, 300);
    return () => { on = false; clearTimeout(t); };
  }, [q]);

  useEffect(() => {
    const close = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const pick = (r) => {
    setPlace({ name: r.name, lat: r.lat, lng: r.lng });
    setQ(''); setResults([]); setOpen(false);
    navigate('/heatmap');
  };

  return (
    <div ref={box} className="relative min-w-[180px] max-w-md flex-1">
      <label>
        <span className="sr-only">Search location</span>
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="search" value={q} placeholder="Search a place, e.g. Dwarka"
          onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </label>
      {open && (results.length > 0 || msg) && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
          {results.map((r) => (
            <li key={`${r.name}${r.lat}`}>
              <button className="flex min-h-[44px] w-full items-center gap-2 px-3 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => pick(r)}>
                <MapPin size={14} className="flex-none text-teal-600" />{r.name}
              </button>
            </li>
          ))}
          {msg && <li className="px-3 py-3 text-sm text-slate-500">{msg}</li>}
        </ul>
      )}
    </div>
  );
}
