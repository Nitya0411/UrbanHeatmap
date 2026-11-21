# Urban Heatmap Dashboard

React + Vite + Tailwind frontend for **Urban Heatmap: Spatial Analysis of Thermal Anomalies Using XGBoost and Explainable AI**.
Stack from the paper: React, Leaflet (react-leaflet), FastAPI backend, XGBoost + SHAP outputs.

## Run the frontend

```bash
npm install
cp .env.example .env     # Windows: copy .env.example .env
npm run dev              # http://localhost:5173
```

Open the app, go to **Sign up**, create an account and you land on the dashboard.

## Two modes

| `.env` setting | What happens |
|---|---|
| `VITE_USE_MOCK=true` (default) | No backend needed. Built-in sample data and a fake login stored in this browser. Good for demos. |
| `VITE_USE_MOCK=false` | The app calls the real backend at `VITE_API_URL` (default `/api`, proxied to `http://localhost:8000`). |

Restart `npm run dev` after changing `.env`.

## Connect the backend

1. Backend team builds the endpoints in [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md) (v1.1).
2. To see the contract working before the real backend exists, run the reference stub:
   ```bash
   cd backend
   python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn contract_stub:app --reload --port 8000          # Swagger: http://localhost:8000/docs
   ```
3. Set `VITE_USE_MOCK=false`, restart the frontend, sign up again (the stub keeps users in memory).
4. The real backend replaces `contract_stub.py` but must keep the same response shapes.

`backend/main.py` is the older skeleton and is not used by the current frontend.

## Pages

| Path | Page |
|---|---|
| `/login`, `/signup` | Sign in and create account (public) |
| `/` | Dashboard: KPIs, map, SHAP, trend, model gauge, hotspots |
| `/heatmap` | Map with LST / NDVI / Built-up layers; click the map for a prediction and SHAP explanation |
| `/prediction` | XGBoost prediction for an area or map point, metrics, actual vs predicted |
| `/shap` | Feature importance, SHAP summary plot, top drivers, per-location explanation |
| `/scenarios` | Cooling simulator with before/after and single-measure comparison |
| `/recommendations` | Location-specific strategies and expected cooling |
| `/reports` | CSV download and printable summary |
| `/profile` | Account details and data-source mode |

All pages except login and signup need a signed-in user. The top bar holds the global search, city, date, theme toggle and account menu; city and date apply to every page.

## Project structure

```
src/
  config.js            env flags (USE_MOCK, API_URL)
  services/api.js      one function per contract endpoint + auth token handling
  services/mockApi.js  fake backend used in mock mode
  data/mock.js         sample data (contract shapes)
  hooks/useApi.js      { data, loading, error, reload } for any api call
  context/             Auth, App (city/date/place), Theme
  components/          Layout, HeatMap, Async (loading/error), SHAP plots, auth form pieces
  pages/               one file per route
docs/API_CONTRACT.md   what the frontend needs from the backend
backend/contract_stub.py   reference implementation with sample data
```

## Using the real backend: what to expect

- Every number comes from the API. If a request fails, the page shows an error with a Retry button (no silent fake data).
- `GET /api/map/layers`: when `tile_url` is set, the map draws that raster; while it is `null`, hotspot circles are drawn.
- Login token is kept in `localStorage`. A 401 response signs the user out.
- Mock-mode accounts are for demos only. Do not enter a real password there.

## ML model v4 (Delhi-NCR)

- The area name, map centre and zoom come from `/api/cities` (fallback: Delhi-NCR).
- Four what-if sliders: tree canopy, cool roofs, reduce building density, water bodies. The `green` field of `/api/simulate` means building density.
- A negative `reduction` is shown as warming, with a red note. `null` is shown as "Not modelled".
- Estimates smaller than the model's average error (MAE) get a note saying they show direction only.
- If `/api/metrics` sends a `warning`, it is shown on the metrics card and next to every prediction and scenario.
- If `/api/shap/summary` returns 404, the SHAP summary plot is hidden.
- Map tiles are proxied from `/tiles`; the zoom range is set in `src/config.js`.

## Printing

`Reports` > **Print / Save PDF** hides the menu and header so the page prints cleanly.
