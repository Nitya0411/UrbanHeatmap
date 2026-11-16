import { useCallback, useEffect, useRef, useState } from 'react';

// const state = useApi(() => api.hotspots({ city }), [city]);  ->  { data, loading, error, reload }
export function useApi(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    let on = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    Promise.resolve()
      .then(() => fnRef.current())
      .then((data) => on && setState({ data, loading: false, error: null }))
      .catch((error) => on && setState({ data: null, loading: false, error }));
    return () => { on = false; };
  }, [...deps, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}
