# Urban Heatmap: API Contract

Frontend ↔ Backend/ML · Version 1.2 · Prepared by the frontend team

## 1. Purpose

This document lists every API the React dashboard needs. The backend builds these endpoints and the frontend calls them exactly as written. If anything must change, tell the frontend team first so both sides stay in sync. Until the backend is ready, the frontend runs on sample data in the same shapes. All numbers in the examples are placeholders only.

### What changed in v1.2 (ML model v3, Central Delhi)

- **Area:** the model covers **Central Delhi** only. The default `city` is the first entry of `/api/cities` (examples below still say `Delhi-NCR`; use the real name).
- **`/api/metrics`** may include `warning` (a text), for example the monsoon warning. The frontend shows it on the metrics card and next to every prediction and scenario.
- **Not modelled:** in `/api/scenarios/compare` and `/api/recommendations`, `reduction` / `est_cooling` is `null` for measures the model cannot estimate (cool roofs, high albedo, water bodies). The frontend shows "Not modelled", never a number. `/api/simulate` still receives `cool` and `water` (the frontend sends 0).
- **Outside the area:** `/api/predict` and `/api/shap/local` return HTTP 422 with code `OUTSIDE_AREA` for points outside the modelled area.
- **Trend:** one point per satellite date (about every 1 to 2 weeks), not per day. The frontend asks for the last 180 days.
- **Tiles:** `tile_url` may be relative (`/tiles/...`, the Vite dev server proxies `/tiles`). Tiles exist for zoom 11 to 16.
- **`/api/shap/summary`** is optional. If the backend answers 404 or 501, the frontend hides the summary plot.

### What changed in v1.1

- **New:** login and sign-up endpoints (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`).
- **New:** `GET /api/shap/summary` for the SHAP summary (beeswarm) plot.
- **Changed:** `tile_url` in `/api/map/layers` may be `null` until raster tiles exist (the frontend then draws hotspot circles).
- **Changed:** the frontend now sends an `Authorization` header on every request (see rules below).
- **Reference implementation:** `backend/contract_stub.py` returns sample data in exactly these shapes. Run it with `uvicorn contract_stub:app --reload --port 8000`.

## 2. General rules

- **Base URL (local):** `http://localhost:8000/api`. The Vite dev server proxies `/api` to port 8000.
- **Format:** JSON, UTF-8. Single words stay as they are (`lat`, `lng`, `lst`, `ndvi`); multi-word names use snake_case (`avg_lst`, `est_cooling`).
- **Units:** temperature in °C, `ndvi` from -1 to 1, built-up and vegetation as percentages from 0 to 100, coordinates in WGS84 decimal degrees (`lat`, `lng`).
- **Dates:** ISO format `YYYY-MM-DD`.
- **Common query parameters:** `city` (default: first entry of `/api/cities`) and `date` (default: latest available scene).
- **Lists** return a plain JSON array. **Single results** return an object.
- **Errors:** HTTP 400, 404, 422 or 500 with body `{"error":{"code":"INVALID_INPUT","message":"lat must be between 28 and 29"}}`.
- **Auth header:** once the user signs in, the frontend sends `Authorization: Bearer <token>` on every request. For now the backend does **not** have to check it, but if it does and returns HTTP 401, the frontend signs the user out and shows the login page.
- **CORS:** allow `http://localhost:5173`.
- **Swagger:** every endpoint must appear at `/docs` using Pydantic models.
- **Speed:** GET endpoints under 2 seconds, `predict` and `simulate` under 3 seconds.

## 3. Priority

| Priority | Endpoints | Why |
|---|---|---|
| P0 (core) | health, overview, hotspots, trend, metrics, predictions/scatter, shap/global, shap/drivers, predict, simulate, scenarios/compare, recommendations | Every dashboard page depends on these |
| P0 (login) | auth/register, auth/login, auth/me | Login and sign-up screens |
| P1 | map/layers, shap/local, shap/summary | Real LST map, click-on-map explanation, SHAP summary plot |
| P2 | cities, locations/search | City selector and search box |

## 4. Endpoints

### GET /api/health

Status check.

```json
{"status":"ok","model_version":"1.0","latest_date":"2026-05-25"}
```

### GET /api/overview

Params: `city`, `date`. Powers the four KPI cards. `change_pct` is positive when the value went up. `vs` says what it is compared with.

```json
{"city":"Delhi-NCR","date":"2026-05-25","avg_lst":{"value":34.2,"change_pct":-2.1,"vs":"last week"},"hotspot_count":{"value":12,"change_pct":3.0,"vs":"last week"},"vegetation_cover":{"value":28.6,"change_pct":-4.2,"vs":"last year"},"builtup_area":{"value":42.3,"change_pct":1.5,"vs":"last year"}}
```

### GET /api/hotspots

Params: `city`, `date`, `limit` (default 50). Sorted by `lst`, highest first. Used by the map, the hotspot tables and the report.

| Field | Type | Meaning |
|---|---|---|
| `id` | integer | Unique id |
| `name` | string | Place name |
| `lat`, `lng` | number | Centre point |
| `lst` | number | Land surface temperature in °C |
| `ndvi` | number | Vegetation index |
| `builtup` | number | Built-up share in % |
| `driver` | string | Short text for the main cause, for example the top SHAP feature |
| `risk` | string | One of `Very High`, `High`, `Moderate`, `Low` |

```json
[{"id":1,"name":"Connaught Place","lat":28.6315,"lng":77.2167,"lst":48.7,"ndvi":0.12,"builtup":82,"driver":"Dense built-up, low NDVI","risk":"Very High"}]
```

### GET /api/trend

Params: `city`, `from`, `to`. One row per day. Powers the temperature trend chart.

```json
[{"date":"2026-05-21","min":29.5,"avg":33.1,"max":43.0},{"date":"2026-05-22","min":29.8,"avg":33.4,"max":43.6}]
```

### GET /api/metrics

Model performance on the **test split**.

```json
{"model":"XGBoost","r2":0.87,"mae":2.31,"rmse":3.76,"n_train":8000,"n_test":2000,"trained_at":"2026-06-01"}
```

### GET /api/predictions/scatter

Param: `limit` (default 500). Test-set points for the actual vs predicted chart.

```json
[{"actual":38.2,"predicted":37.6},{"actual":44.1,"predicted":45.0}]
```

### POST /api/predict

Send either `lat` and `lng`, or an `area` name. `actual_lst` is `null` when no observed value exists.

Request:

```json
{"lat":28.6315,"lng":77.2167}
```

Response:

```json
{"area":"Connaught Place","lat":28.6315,"lng":77.2167,"predicted_lst":47.9,"actual_lst":48.7,"features":{"ndvi":0.12,"builtup":82}}
```

### GET /api/shap/global

Mean absolute SHAP per feature, sorted from highest to lowest. The frontend shows `feature` text as it is and works with any number of features. **Do not send colours**; the frontend picks them.

```json
[{"feature":"Built-up Area","value":0.32},{"feature":"NDVI","value":0.16}]
```

### GET /api/shap/drivers

Top 3 features pushing temperature up and top 3 pulling it down. `value` is the mean signed SHAP value.

```json
{"positive":[{"feature":"Built-up Area","value":0.32}],"negative":[{"feature":"NDVI","value":-0.16}]}
```

### GET /api/shap/local

Params: `lat`, `lng`. Explains one location. `contributions` are in °C, and `base_value` plus their sum should equal `predicted_lst`.

```json
{"lat":28.6315,"lng":77.2167,"predicted_lst":47.9,"base_value":34.0,"contributions":[{"feature":"Built-up Area","value":6.1},{"feature":"NDVI","value":-1.2}]}
```

### GET /api/shap/summary (P1)

Param: `limit` (default 300 samples). One entry per feature, in the same order as `shap/global`. `value` is the feature value scaled to 0 to 1 (0 = lowest, 1 = highest) and `shap` is the signed SHAP value in °C. Powers the SHAP summary (beeswarm) plot.

```json
[{"feature":"Built-up Area","points":[{"value":0.91,"shap":0.42},{"value":0.12,"shap":-0.31}]}]
```

### POST /api/simulate

Each measure is a percentage from 0 to 100. `lat` and `lng` are optional; if missing, use the city average. This must re-run the model with changed inputs, not a fixed formula.

Request:

```json
{"lat":28.6315,"lng":77.2167,"tree":30,"cool":20,"green":25,"water":10}
```

Response:

```json
{"before":43.2,"after":39.9,"reduction":3.3}
```

### GET /api/scenarios/compare

Params: `lat`, `lng` (optional). Reduction in °C when each measure is applied alone. Use `null` for a measure that is not modelled. Names must be exactly: Tree cover, Green roofs, Cool roofs, High albedo, Water bodies.

```json
[{"name":"Tree cover","reduction":4.6},{"name":"Green roofs","reduction":3.5}]
```

### GET /api/recommendations

Param: `location_id` (a hotspot `id`). `impact` is one of `High`, `Medium`, `Low`. Strategies sorted by `est_cooling`, highest first. `overall_cooling` is the combined effect, not the sum.

```json
{"location":{"id":3,"name":"Noida Sector 62","lat":28.6208,"lng":77.3639,"lst":45.8,"driver":"Commercial rooftops"},"strategies":[{"title":"Increase tree cover","description":"Plant more trees, parks and green spaces","impact":"High","est_cooling":4.2}],"overall_cooling":4.2}
```

### GET /api/map/layers (P1)

Map layers for Leaflet. `tile_url` must be a standard XYZ template, or `null` while no raster tiles exist yet (the frontend then draws hotspot circles). Layer ids: `lst`, `ndvi`, `builtup`. Tiles may come from Google Earth Engine or a tile server.

```json
[{"id":"lst","label":"LST","tile_url":"http://localhost:8000/tiles/lst/{z}/{x}/{y}.png","attribution":"Landsat 9","legend":[{"color":"#d62828","label":"50+"},{"color":"#2b6fb5","label":"20-"}]}]
```

### GET /api/cities (P2)

```json
[{"id":"delhi-ncr","name":"Delhi-NCR","center":[28.61,77.21],"zoom":10}]
```

### GET /api/locations/search (P2)

Param: `q`. Return at most 5 matches.

```json
[{"name":"Sector 62, Noida","lat":28.6208,"lng":77.3639}]
```

### Auth endpoints

Passwords must be stored hashed (bcrypt, argon2 or PBKDF2), never as plain text. Minimum password length is 8 characters. `organization` is optional.

**POST /api/auth/register** returns HTTP 201. Errors: 409 `EMAIL_EXISTS`, 422 `INVALID_INPUT`.

```json
{"name":"Nitya Singhal","email":"nitya@example.com","password":"at-least-8-chars","organization":"AKGEC"}
```

```json
{"token":"<opaque string or JWT>","user":{"id":"u_1","name":"Nitya Singhal","email":"nitya@example.com","organization":"AKGEC"}}
```

**POST /api/auth/login** returns the same response shape as register. Error: 401 `INVALID_CREDENTIALS`.

```json
{"email":"nitya@example.com","password":"at-least-8-chars"}
```

**GET /api/auth/me** needs the `Authorization: Bearer <token>` header and returns the `user` object. Error: 401 `UNAUTHORIZED`.

```json
{"id":"u_1","name":"Nitya Singhal","email":"nitya@example.com","organization":"AKGEC"}
```

## 5. Notes for the ML team

- **Target leakage:** the design's sample SHAP list contains "Land Surface Temp" as a feature. If LST is the value being predicted, it should not also be an input. Send whichever features the model really uses; the frontend adapts.
- **Metrics:** report R², MAE and RMSE from the test split, not the training data.
- **Hotspot definition:** decide how a hotspot is detected (fixed temperature threshold, top percentile or a spatial statistic) and tell the frontend team, because the paper and the viva will need to state it.
- **Risk levels:** agree on thresholds for `Very High`, `High`, `Moderate` and `Low` and keep them the same everywhere.
- **Simulation:** map each measure to model inputs (for example tree cover raises NDVI, cool roofs raise albedo), re-predict, and return before and after.

## 6. Handoff checklist

- [ ] All P0 endpoints return data in the shapes above
- [ ] `/docs` shows every endpoint with example responses
- [ ] CORS allows `http://localhost:5173`
- [ ] Error format is the same on every endpoint
- [ ] Register, login and me work, and passwords are stored hashed
- [ ] Backend team tells the frontend team before changing any field name
