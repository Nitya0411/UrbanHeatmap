// SAMPLE DATA ONLY (used when VITE_USE_MOCK is not "false").
// Shapes follow docs/API_CONTRACT.md. Numbers mirror the ML v4 pipeline outputs (Delhi-NCR, XGBoost,
// random 80/20 split, four what-if scenarios) so the UI can be tested before the backend is ready.
export const LATEST_DATE = '2025-06-06';

// Delhi-NCR study area (from the v4 map output)
export const AREA = { minLat: 28.1, maxLat: 29.0, minLng: 76.7, maxLng: 77.7 };

export const hotspots = [
  { id: 1, name: 'Connaught Place', lat: 28.6315, lng: 77.2167, lst: 48.7, ndvi: 0.12, builtup: 82, driver: 'High NDBI, dense buildings', risk: 'Very High' },
  { id: 2, name: 'Rohini', lat: 28.7495, lng: 77.0565, lst: 46.3, ndvi: 0.16, builtup: 71, driver: 'High NDBI, impervious surface', risk: 'High' },
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
  avg_lst: { value: 34.1, change_pct: -2.1, vs: 'last week' },
  hotspot_count: { value: 12, change_pct: 3.0, vs: 'last week' },
  vegetation_cover: { value: 28.6, change_pct: -4.2, vs: 'last year' },
  builtup_area: { value: 42.3, change_pct: 1.5, vs: 'last year' },
};

// Mean |SHAP| in °C, from outputs/simulation/shap_feature_importance.csv (readable names).
export const shapGlobal = [
  { feature: 'Air temperature', value: 5.17 },
  { feature: 'Sun elevation', value: 1.8 },
  { feature: 'NDBI (built-up / bare surface)', value: 1.01 },
  { feature: 'Day of year', value: 0.61 },
  { feature: 'Humidity', value: 0.5 },
  { feature: 'X coordinate (UTM)', value: 0.46 },
  { feature: 'Y coordinate (UTM)', value: 0.37 },
  { feature: 'Albedo', value: 0.35 },
  { feature: 'Wind speed', value: 0.27 },
  { feature: 'MNDWI (water index)', value: 0.19 },
  { feature: 'NDVI', value: 0.16 },
  { feature: 'Road density', value: 0.13 },
  { feature: 'Water fraction (250 m)', value: 0.08 },
  { feature: 'Building cover', value: 0.07 },
];

export const shapDrivers = {
  positive: [{ feature: 'Air temperature', value: 0.1 }, { feature: 'NDBI (built-up / bare surface)', value: 0.01 }, { feature: 'Humidity', value: 0.01 }],
  negative: [{ feature: 'Sun elevation', value: -0.07 }, { feature: 'Day of year', value: -0.03 }, { feature: 'Albedo', value: -0.03 }],
};

// From artifacts/lst_v4/metrics.json
export const metrics = {
  model: 'XGBoost',
  r2: 0.9541,
  mae: 1.48,
  rmse: 2.09,
  n_train: 941634,
  n_test: 235409,
  trained_at: '2026-11-19',
};

// Mean change over the whole area, as in outputs/simulation/cooling_simulation_results.csv.
// reduction > 0 cools, reduction < 0 warms (the cool-roof run shows warming).
export const scenarioBase = [
  { name: 'Tree canopy', reduction: 0.12 },
  { name: 'Cool roofs', reduction: -0.65 },
  { name: 'Reduce built-up density', reduction: 0.0 },
  { name: 'Water bodies', reduction: 0.52 },
];

export const strategyBase = [
  { title: 'Expand tree canopy', description: 'Plant street trees and pocket forests (raises NDVI)', est_cooling: 0.12 },
  { title: 'Cool reflective roofs', description: 'Coat dark roofs and pavements with high-albedo material', est_cooling: -0.65 },
  { title: 'Reduce built-up density', description: 'Replace unused paved lots with grass and permeable ground', est_cooling: 0.0 },
  { title: 'Expand urban water', description: 'Restore ponds, wetlands and canals in heat-stressed districts', est_cooling: 0.52 },
];

export const cities = [{ id: 'delhi-ncr', name: 'Delhi-NCR', center: [28.55, 77.2], zoom: 10 }];

export const layers = [
  { id: 'lst', label: 'LST', tile_url: null, attribution: '', legend: [['#d62828', '50+'], ['#f26a1b', '45'], ['#f5a30a', '40'], ['#e6d20f', '35'], ['#8cc63f', '30'], ['#2f9a7a', '25'], ['#2b6fb5', '20-']].map(([color, label]) => ({ color, label })) },
  { id: 'ndvi', label: 'NDVI', tile_url: null, attribution: '', legend: [['#2f9a7a', '> 0.40'], ['#8cc63f', '0.25–0.40'], ['#f5a30a', '0.15–0.25'], ['#d62828', '< 0.15']].map(([color, label]) => ({ color, label })) },
  { id: 'builtup', label: 'Built-up', tile_url: null, attribution: '', legend: [['#d62828', '> 70%'], ['#f26a1b', '55–70%'], ['#f5a30a', '40–55%'], ['#8cc63f', '< 40%']].map(([color, label]) => ({ color, label })) },
];
