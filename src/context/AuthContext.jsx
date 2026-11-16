import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from '../services/api.js';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  // Restore the session on page load
  useEffect(() => {
    if (!getToken()) return;
    api.me().then(setUser).catch(() => setToken(null)).finally(() => setLoading(false));
  }, []);

  const logout = useCallback(() => { setToken(null); setUser(null); }, []);

  // Any 401 from the backend signs the user out
  useEffect(() => {
    window.addEventListener('uh:unauthorized', logout);
    return () => window.removeEventListener('uh:unauthorized', logout);
  }, [logout]);

  const finish = ({ token, user: u }) => { setToken(token); setUser(u); return u; };
  const login = async (email, password) => finish(await api.login({ email, password }));
  const register = async (form) => finish(await api.register(form));

  return <AuthCtx.Provider value={{ user, loading, login, register, logout }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
