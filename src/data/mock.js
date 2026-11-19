// SAMPLE DATA ONLY (used when VITE_USE_MOCK is not "false").
// Shapes follow docs/API_CONTRACT.md and the ML v3 package (Central Delhi, monsoon warning,
// cool roofs / albedo / water bodies "not modelled"). Real values come from the backend.
export const LATEST_DATE = '2026-04-23';

export const AREA = { minLat: 28.55, maxLat: 28.73, minLng: 77.1, maxLng: 77.32 };

export const hotspots = [
  { id: 1, name: 'Connaught Place', lat: 28.6315, lng: 77.2167, lst: 47.6, ndvi: 0.12, builtup: 74, driver: 'High NDBI, dense buildings', risk: 'Very High' },
  { id: 2, name: 'Karol Bagh', lat: 28.6519, lng: 77.1909, lst: 46.9, ndvi: 0.11, builtup: 78, driver: 'High NDBI, dense buildings', risk: 'Very High' },
  { id: 3, name: 'Central Ridge', lat: 28.601, lng: 77.183, lst: 46.1, ndvi: 0.2, builtup: 2, driver: 'Bare rocky ridge (high NDBI, few buildings)', risk: 'High' },
  { id: 4, name: 'ITO', lat: 28.628, lng: 77.241, lst: 45.5, ndvi: 0.14, builtup: 70, driver: 'High NDBI near major roads', risk: 'High' },
  { id: 5, name: 'Paharganj', lat: 28.6448, lng: 77.2167, lst: 45.0, ndvi: 0.1, builtup: 82, driver: 'High NDBI, dense buildings', risk: 'High' },
  { id: 6, name: 'Lodhi Road', lat: 28.5921, lng: 77.219, lst: 43.2, ndvi: 0.27, builtup: 35, driver: 'Moderate NDBI, partial tree cover', risk: 'Moderate' },
];

export const places = [
  ...hotspots.map((h) => ({ name: h.name, lat: h.lat, lng: h.lng })),
  { name: 'India Gate', lat: 28.6129, lng: 77.2295 },
  { name: 'Jantar Mantar', lat: 28.627, lng: 77.2166 },
  { name: 'Khan Market', lat: 28.6003, lng: 77.2273 },
  { name: 'Delhi Gate', lat: 28.6393, lng: 77.2384 },
];

export const overview = {
  avg_lst: { value: 41.3, change_pct: 1.8, vs: 'last date' },
  hotspot_count: { value: 77, change_pct: 6.9, vs: 'last date' },
  vegetation_cover: { value: 24.5, change_pct: -3.1, vs: 'last year' },
  builtup_area: { value: 38.2, change_pct: 0.9, vs: 'last year' },
};

// Sample importances (°C). Names are display text, shown exactly as sent.
export const shapGlobal = [
  { feature: 'Air temperature', value: 3.72 },
  { feature: 'Built-up / bare-surface index (NDBI)', value: 0.44 },
  { feature: 'NDVI', value: 0.23 },
  { feature: 'Humidity', value: 0.18 },
  { feature: 'Sun elevation', value: 0.12 },
  { feature: 'Day of year', value: 0.09 },
  { feature: 'Wind speed', value: 0.05 },
];

export const shapDrivers = {
  positive: [{ feature: 'Air temperature', value: 3.72 }, { feature: 'Built-up / bare-surface index (NDBI)', value: 0.44 }, { feature: 'Sun elevation', value: 0.12 }],
  negative: [{ feature: 'NDVI', value: -0.23 }, { feature: 'Humidity', value: -0.18 }, { feature: 'Wind speed', value: -0.05 }],
};

export const metrics = {
  model: 'XGBoost',
  r2: 0.71,
  mae: 2.36,
  rmse: 3.17,
  n_train: 4390000,
  n_test: 409039,
  trained_at: '2026-11-16',
  warning: 'Less reliable in the monsoon (June–September): 2026 test MAE 3.4 °C, up to 6.8 °C on single dates',
};

export const scenarioBase = [
  { name: 'Tree cover', reduction: 0.5 },
  { name: 'Green roofs', reduction: 0.04 },
  { name: 'Cool roofs', reduction: null },
  { name: 'High albedo', reduction: null },
  { name: 'Water bodies', reduction: null },
];

export const strategyBase = [
  { title: 'Increase tree cover', description: 'Plant more trees, parks and green spaces', est_cooling: 0.5 },
  { title: 'Install green roofs', description: 'Add vegetation on roofs of dense buildings', est_cooling: 0.04 },
  { title: 'Install cool roofs', description: 'Use high-albedo roofing on residential and commercial buildings', est_cooling: null },
  { title: 'Create water bodies', description: 'Develop water bodies or wetlands in nearby open spaces', est_cooling: null },
];

export const cities = [{ id: 'central-delhi', name: 'Central Delhi', center: [28.632, 77.219], zoom: 12 }];

export const layers = [
  { id: 'lst', label: 'LST', tile_url: null, attribution: '', legend: [['#d62828', '50+'], ['#f26a1b', '45'], ['#f5a30a', '40'], ['#e6d20f', '35'], ['#8cc63f', '30'], ['#2f9a7a', '25'], ['#2b6fb5', '20-']].map(([color, label]) => ({ color, label })) },
  { id: 'ndvi', label: 'NDVI', tile_url: null, attribution: '', legend: [['#2f9a7a', '> 0.40'], ['#8cc63f', '0.25–0.40'], ['#f5a30a', '0.15–0.25'], ['#d62828', '< 0.15']].map(([color, label]) => ({ color, label })) },
  { id: 'builtup', label: 'Built-up', tile_url: null, attribution: '', legend: [['#d62828', '> 70%'], ['#f26a1b', '55–70%'], ['#f5a30a', '40–55%'], ['#8cc63f', '< 40%']].map(([color, label]) => ({ color, label })) },
];
