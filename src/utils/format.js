export const isNum = (v) => typeof v === 'number' && Number.isFinite(v);

// "−0.5 °C" for numbers; anything else (null, text such as "not modelled") is shown as "Not modelled"
export const cooling = (v) => (isNum(v) ? `−${+v.toFixed(2)} °C` : 'Not modelled');
