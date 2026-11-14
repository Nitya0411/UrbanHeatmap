# Urban Heatmap Dashboard

React + Vite + Tailwind dashboard for **Urban Heatmap: Spatial Analysis of Thermal Anomalies Using XGBoost and Explainable AI**.
Stack from the paper: React, Leaflet (react-leaflet), FastAPI backend, XGBoost + SHAP outputs.

## Run the frontend

```bash
npm install
npm run dev        # http://localhost:5173
```

## Run the backend (optional)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Without the backend, the UI uses the sample data in `src/data/mock.js`.
Set `VITE_API_URL` in `.env` to point to a deployed API.

## Routes

| Path | Page |
|---|---|
| `/` | Dashboard (KPIs, map, SHAP, trend, model gauge, hotspots) |
| `/heatmap` | Full map with LST / NDVI / Built-up layers |
| `/prediction` | XGBoost prediction, metrics, actual vs predicted |
| `/shap` | Feature importance and top positive/negative drivers |
| `/scenarios` | Cooling simulator with sliders |
| `/recommendations` | Location-specific strategies |
| `/reports` | CSV download and printable summary |

## Replace the sample data

All numbers (R² 0.87, SHAP values, hotspots, scenario coefficients) are placeholders.
Put your real results in `backend/main.py` (see the TODOs) or `src/data/mock.js` before presenting.
The map draws hotspot circles; to show a real LST raster, serve tiles from Google Earth Engine and add a `TileLayer` in `src/components/HeatMap.jsx`.

## Features

Responsive layout (drawer menu on mobile), light/dark theme (saved in localStorage), React Router, Recharts charts.
