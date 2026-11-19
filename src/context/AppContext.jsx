import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';
import { useAuth } from './AuthContext.jsx';

const AppCtx = createContext(null);
const FALLBACK_CITY = { id: 'central-delhi', name: 'Central Delhi', center: [28.632, 77.219], zoom: 12 };

// Holds the city, date and map location that every page shares.
export function AppProvider({ children }) {
  const { user } = useAuth();
  const [cities, setCities] = useState([FALLBACK_CITY]);
  const [cityId, setCityId] = useState(FALLBACK_CITY.id);
  const [date, setDate] = useState(''); // '' = latest available scene
  const [latestDate, setLatestDate] = useState('');
  const [place, setPlace] = useState(null); // {name, lat, lng} chosen via search or map click

  useEffect(() => {
    if (!user) return;
    api.cities().then((c) => c?.length && setCities(c)).catch(() => {});
    api.health().then((h) => h?.latest_date && setLatestDate(h.latest_date)).catch(() => {});
  }, [user]);

  const value = useMemo(() => {
    const city = cities.find((c) => c.id === cityId) || cities[0];
    return { cities, city, cityName: city.name, setCityId, date, setDate, latestDate, effectiveDate: date || latestDate, place, setPlace };
  }, [cities, cityId, date, latestDate, place]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export const useApp = () => useContext(AppCtx);
