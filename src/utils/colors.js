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

// The backend sends no colours for SHAP features; the frontend assigns them by rank.
export const SHAP_PALETTE = ['#8b5cf6', '#3b82f6', '#38a3d8', '#22b8b0', '#2bb99a', '#5fcfae', '#a8bdc9', '#c4b5fd', '#93c5fd', '#99f6e4'];

export const riskClass = {
  'Very High': 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  High: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  Moderate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300',
  Low: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
};

export const impactClass = {
  High: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  Low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

// value 0..1 -> blue to red (used by the SHAP summary plot)
export function ramp(v) {
  const a = [43, 111, 181], b = [214, 40, 40];
  return `rgb(${a.map((x, i) => Math.round(x + (b[i] - x) * v)).join(',')})`;
}
