"""FastAPI backend for Urban Heatmap (matches the architecture in the paper).

Run:  uvicorn main:app --reload --port 8000
The React app proxies /api to this server (see vite.config.js).

The data below is SAMPLE data. Replace the TODOs with your trained XGBoost model,
SHAP explainer and Google Earth Engine / GeoPandas outputs.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Urban Heatmap API")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"], allow_methods=["*"], allow_headers=["*"])

BASE_LST = 43.2

HOTSPOTS = [
    {"id": 1, "name": "Connaught Place", "lat": 28.6315, "lng": 77.2167, "lst": 48.7, "ndvi": 0.12, "builtup": 82, "driver": "Dense built-up, low NDVI", "risk": "Very High"},
    {"id": 2, "name": "Rohini", "lat": 28.7495, "lng": 77.0565, "lst": 46.3, "ndvi": 0.16, "builtup": 71, "driver": "High impervious surface", "risk": "High"},
    {"id": 3, "name": "Noida Sector 62", "lat": 28.6208, "lng": 77.3639, "lst": 45.8, "ndvi": 0.18, "builtup": 68, "driver": "Commercial rooftops", "risk": "High"},
    {"id": 4, "name": "Dwarka", "lat": 28.5921, "lng": 77.046, "lst": 44.2, "ndvi": 0.21, "builtup": 60, "driver": "Low canopy cover", "risk": "Moderate"},
]
SHAP = [
    {"feature": "Built-up Area", "value": 0.32, "color": "#8b5cf6"},
    {"feature": "Land Surface Temp", "value": 0.21, "color": "#3b82f6"},
    {"feature": "NDVI", "value": 0.16, "color": "#38a3d8"},
    {"feature": "Impervious Surface", "value": 0.12, "color": "#22b8b0"},
    {"feature": "Elevation", "value": 0.09, "color": "#2bb99a"},
]
METRICS = {"r2": 0.87, "mae": 2.31, "rmse": 3.76}  # TODO: compute from your test split


class PredictIn(BaseModel):
    area: str


class SimulateIn(BaseModel):
    tree: float
    cool: float
    green: float
    water: float
    baseline: float = BASE_LST


@app.get("/api/hotspots")
def hotspots():
    return HOTSPOTS  # TODO: derive from the predicted LST raster


@app.get("/api/shap")
def shap():
    return SHAP  # TODO: shap.TreeExplainer(model) -> mean(|shap_values|) per feature


@app.get("/api/metrics")
def metrics():
    return METRICS


@app.post("/api/predict")
def predict(body: PredictIn):
    # TODO: build the feature vector for body.area and call model.predict(...)
    match = next((h for h in HOTSPOTS if h["name"] == body.area), None)
    return {"area": body.area, "predicted": round(match["lst"] + 0.3, 1) if match else 34.7}


@app.post("/api/simulate")
def simulate(body: SimulateIn):
    # TODO: modify NDVI / albedo / water features and re-predict with the model
    cut = min(8.0, body.tree * 0.046 + body.cool * 0.032 + body.green * 0.035 + body.water * 0.022)
    return {"reduction": round(cut, 1), "after": round(body.baseline - cut, 1)}
