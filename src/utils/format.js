export const isNum = (v) => typeof v === 'number' && Number.isFinite(v);

// reduction > 0 is cooling, < 0 is warming. Anything that is not a number is "Not modelled".
export function cooling(v) {
  if (!isNum(v)) return 'Not modelled';
  const a = +Math.abs(v).toFixed(2);
  if (a === 0) return '0.00 °C (no change)';
  return v > 0 ? `−${a} °C` : `+${a} °C (warming)`;
}
