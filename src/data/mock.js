// SAMPLE DATA ONLY (used when VITE_USE_MOCK is not "false").
// Shapes follow docs/API_CONTRACT.md. Real values come from the backend / ML team.
export const LATEST_DATE = '2026-05-25';

export const hotspots = [
  { id: 1, name: 'Connaught Place', lat: 28.6315, lng: 77.2167, lst: 48.7, ndvi: 0.12, builtup: 82, driver: 'Dense built-up, low NDVI', risk: 'Very High' },
  { id: 2, name: 'Rohini', lat: 28.7495, lng: 77.0565, lst: 46.3, ndvi: 0.16, builtup: 71, driver: 'High impervious surface', risk: 'High' },
  { id: 3, name: 'Noida Sector 62', lat: 28.6208, lng: 77.3639, lst: 45.8, ndvi: 0.18, builtup: 68, driver: 'Commercial rooftops', risk: 'High' },
  { id: 4, name: 'Dwarka', lat: 28.5921, lng: 77.046, lst: 44.2, ndvi: 0.21, builtup: 60, driver: 'Low canopy cover', risk: 'Moderate' },
  { id: 5, name: 'Greater Noida', lat: 28.4744, lng: 77.504, lst: 42.7, ndvi: 0.27, builtup: 48, driver: 'Bare soil, new construction', risk: 'Moderate' },
  { id: 6, name: 'Gurgaon', lat: 28.4595, lng: 77.0266, lst: 41.5, ndvi: 0.3, builtup: 52, driver: 'Glass and concrete density', risk: 'Moderate' },
];

export const places = [
  ...hotspots.map((h) => ({ name: h.name, lat: h.lat, lng: h.lng })),
  { name: 'India Gate, New Delhi', lat: 28.6129, lng: 77.2295 },
  { name: 'Ghaziabad', lat: 28.6692, lng: 77.4538 },
  { name: 'Faridabad', lat: 28.4089, lng: 77.3178 },
  { name: 'Noida Sector 18', lat: 28.5707, lng: 77.3261 },
];

export const overview = {
  avg_lst: { value: 34.2, change_pct: -2.1, vs: 'last week' },
  hotspot_count: { value: 12, change_pct: 3.0, vs: 'last week' },
  vegetation_cover: { value: 28.6, change_pct: -4.2, vs: 'last year' },
  builtup_area: { value: 42.3, change_pct: 1.5, vs: 'last year' },
};

export const shapGlobal = [
  { feature: 'Built-up Area', value: 0.32 },
  { feature: 'Impervious Surface', value: 0.21 },
  { feature: 'NDVI', value: 0.16 },
  { feature: 'Building Density', value: 0.12 },
  { feature: 'Elevation', value: 0.09 },
  { feature: 'Soil Moisture', value: 0.08 },
  { feature: 'Others', value: 0.04 },
];

export const shapDrivers = {
  positive: [{ feature: 'Built-up Area', value: 0.32 }, { feature: 'Impervious Surface', value: 0.21 }, { feature: 'Building Density', value: 0.12 }],
  negative: [{ feature: 'NDVI', value: -0.16 }, { feature: 'Elevation', value: -0.09 }, { feature: 'Soil Moisture', value: -0.08 }],
};

export const metrics = { model: 'XGBoost', r2: 0.87, mae: 2.31, rmse: 3.76, n_train: 8000, n_test: 2000, trained_at: '2026-06-01' };

export const trendBase = [
  { min: 29.5, avg: 33.1, max: 43.0 },
  { min: 29.8, avg: 33.4, max: 43.6 },
  { min: 30.1, avg: 33.8, max: 44.1 },
  { min: 30.4, avg: 34.0, max: 44.9 },
  { min: 30.9, avg: 34.2, max: 46.0 },
];

export const scenarioBase = [
  { name: 'Tree cover', reduction: 4.6 },
  { name: 'Green roofs', reduction: 3.5 },
  { name: 'Cool roofs', reduction: 3.2 },
  { name: 'High albedo', reduction: 3.7 },
  { name: 'Water bodies', reduction: 2.2 },
];

export const strategyBase = [
  { title: 'Increase tree cover', description: 'Plant more trees, parks and green spaces', est_cooling: 4.2 },
  { title: 'Install cool roofs', description: 'Use high-albedo roofing on residential and commercial buildings', est_cooling: 3.2 },
  { title: 'Create water bodies', description: 'Develop water bodies or wetlands in nearby open spaces', est_cooling: 2.5 },
];

export const cities = [{ id: 'delhi-ncr', name: 'Delhi-NCR', center: [28.61, 77.21], zoom: 10 }];

export const layers = [
  { id: 'lst', label: 'LST', tile_url: null, attribution: '', legend: [['#d62828', '50+'], ['#f26a1b', '45'], ['#f5a30a', '40'], ['#e6d20f', '35'], ['#8cc63f', '30'], ['#2f9a7a', '25'], ['#2b6fb5', '20-']].map(([color, label]) => ({ color, label })) },
  { id: 'ndvi', label: 'NDVI', tile_url: null, attribution: '', legend: [['#2f9a7a', '> 0.40'], ['#8cc63f', '0.25–0.40'], ['#f5a30a', '0.15–0.25'], ['#d62828', '< 0.15']].map(([color, label]) => ({ color, label })) },
  { id: 'builtup', label: 'Built-up', tile_url: null, attribution: '', legend: [['#d62828', '> 70%'], ['#f26a1b', '55–70%'], ['#f5a30a', '40–55%'], ['#8cc63f', '< 40%']].map(([color, label]) => ({ color, label })) },
];
