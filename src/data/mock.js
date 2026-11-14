// SAMPLE DATA ONLY. Replace with real outputs of your trained XGBoost/SHAP pipeline
// (served by backend/main.py). The UI shows a "Sample data" badge while this is in use.
export const BASE_LST = 43.2;

export const kpis = [
  { key: 'lst', label: 'Avg. LST', value: '34.2 °C', delta: '↓ 2.1% vs. last week', bad: false, tone: 'orange' },
  { key: 'hot', label: 'Hotspots Detected', value: '12', delta: '↑ 3.0% vs. last week', bad: true, tone: 'red' },
  { key: 'veg', label: 'Vegetation Cover', value: '28.6%', delta: '↓ 4.2% vs. last year', bad: true, tone: 'green' },
  { key: 'built', label: 'Built-up Area', value: '42.3%', delta: '↑ 1.5% vs. last year', bad: true, tone: 'blue' },
];

export const hotspots = [
  { id: 1, name: 'Connaught Place', lat: 28.6315, lng: 77.2167, lst: 48.7, ndvi: 0.12, builtup: 82, driver: 'Dense built-up, low NDVI', risk: 'Very High' },
  { id: 2, name: 'Rohini', lat: 28.7495, lng: 77.0565, lst: 46.3, ndvi: 0.16, builtup: 71, driver: 'High impervious surface', risk: 'High' },
  { id: 3, name: 'Noida Sector 62', lat: 28.6208, lng: 77.3639, lst: 45.8, ndvi: 0.18, builtup: 68, driver: 'Commercial rooftops', risk: 'High' },
  { id: 4, name: 'Dwarka', lat: 28.5921, lng: 77.046, lst: 44.2, ndvi: 0.21, builtup: 60, driver: 'Low canopy cover', risk: 'Moderate' },
  { id: 5, name: 'Greater Noida', lat: 28.4744, lng: 77.504, lst: 42.7, ndvi: 0.27, builtup: 48, driver: 'Bare soil, new construction', risk: 'Moderate' },
  { id: 6, name: 'Gurgaon', lat: 28.4595, lng: 77.0266, lst: 41.5, ndvi: 0.3, builtup: 52, driver: 'Glass and concrete density', risk: 'Moderate' },
];

export const shap = [
  { feature: 'Built-up Area', value: 0.32, color: '#8b5cf6' },
  { feature: 'Land Surface Temp', value: 0.21, color: '#3b82f6' },
  { feature: 'NDVI', value: 0.16, color: '#38a3d8' },
  { feature: 'Impervious Surface', value: 0.12, color: '#22b8b0' },
  { feature: 'Elevation', value: 0.09, color: '#2bb99a' },
  { feature: 'Soil Moisture', value: 0.08, color: '#5fcfae' },
  { feature: 'Others', value: 0.04, color: '#a8bdc9' },
];

export const drivers = {
  positive: [
    { feature: 'Built-up Area', value: 0.32 },
    { feature: 'Land Surface Temp', value: 0.21 },
    { feature: 'Impervious Surface', value: 0.12 },
  ],
  negative: [
    { feature: 'NDVI', value: -0.16 },
    { feature: 'Vegetation Cover', value: -0.1 },
    { feature: 'Elevation', value: -0.09 },
  ],
};

export const metrics = { r2: 0.87, mae: 2.31, rmse: 3.76 };

export const trend = [
  { d: 'May 21', min: 29.5, avg: 33.1, max: 43.0 },
  { d: 'May 22', min: 29.8, avg: 33.4, max: 43.6 },
  { d: 'May 23', min: 30.1, avg: 33.8, max: 44.1 },
  { d: 'May 24', min: 30.4, avg: 34.0, max: 44.9 },
  { d: 'May 25', min: 30.9, avg: 34.2, max: 46.0 },
];

export const scenarioCompare = [
  { name: 'Tree cover', cut: 4.6 },
  { name: 'Green roofs', cut: 3.5 },
  { name: 'Cool roofs', cut: 3.2 },
  { name: 'High albedo', cut: 3.7 },
  { name: 'Water bodies', cut: 2.2 },
];

export const strategies = [
  { title: 'Increase tree cover', desc: 'Plant more trees, parks and green spaces', impact: 'High', cut: 4.2 },
  { title: 'Install cool roofs', desc: 'Use high-albedo roofing on residential and commercial buildings', impact: 'Medium', cut: 3.2 },
  { title: 'Create water bodies', desc: 'Develop water bodies or wetlands in nearby open spaces', impact: 'Medium', cut: 2.5 },
];

export const scatter = Array.from({ length: 60 }, (_, i) => {
  const actual = 26 + ((i * 17) % 29);
  const predicted = +(actual + Math.sin(i * 12.9898) * 2.4).toFixed(1);
  return { actual, predicted };
});

export const LEGENDS = {
  lst: [['#d62828', '50+'], ['#f26a1b', '45'], ['#f5a30a', '40'], ['#e6d20f', '35'], ['#8cc63f', '30'], ['#2f9a7a', '25'], ['#2b6fb5', '20−']],
  ndvi: [['#2f9a7a', '> 0.40'], ['#8cc63f', '0.25–0.40'], ['#f5a30a', '0.15–0.25'], ['#d62828', '< 0.15']],
  builtup: [['#d62828', '> 70%'], ['#f26a1b', '55–70%'], ['#f5a30a', '40–55%'], ['#8cc63f', '< 40%']],
};

export function layerColor(layer, h) {
  if (layer === 'ndvi') return h.ndvi > 0.4 ? '#2f9a7a' : h.ndvi > 0.25 ? '#8cc63f' : h.ndvi > 0.15 ? '#f5a30a' : '#d62828';
  if (layer === 'builtup') return h.builtup > 70 ? '#d62828' : h.builtup > 55 ? '#f26a1b' : h.builtup > 40 ? '#f5a30a' : '#8cc63f';
  const t = h.lst;
  return t >= 50 ? '#d62828' : t >= 45 ? '#f26a1b' : t >= 40 ? '#f5a30a' : t >= 35 ? '#e6d20f' : t >= 30 ? '#8cc63f' : '#2f9a7a';
}

export const riskClass = {
  'Very High': 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  High: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  Moderate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300',
};
