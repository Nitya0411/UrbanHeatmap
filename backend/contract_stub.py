"""Reference stub for docs/API_CONTRACT.md (v1.1).

Returns SAMPLE data in exactly the shapes the frontend expects, so the backend/ML team can
see the contract working and the frontend can be tested end to end.
Replace each function body with the real model / data pipeline, keeping the response shapes.

Run:  uvicorn contract_stub:app --reload --port 8000     (docs at http://localhost:8000/docs)
Then set VITE_USE_MOCK=false in the frontend .env.
"""
import base64
import hashlib
import math
import secrets
from typing import Dict, List, Optional

from fastapi import APIRouter, FastAPI, Header, Query, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

app = FastAPI(title="Urban Heatmap API (contract stub)")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"], allow_methods=["*"], allow_headers=["*"])
api = APIRouter(prefix="/api")


# ---------- errors: always {"error": {"code", "message"}} ----------
class ApiError(Exception):
    def __init__(self, status: int, code: str, message: str):
        self.status, self.code, self.message = status, code, message


@app.exception_handler(ApiError)
async def api_error(_: Request, e: ApiError):
    return JSONResponse(status_code=e.status, content={"error": {"code": e.code, "message": e.message}})


@app.exception_handler(RequestValidationError)
async def validation_error(_: Request, e: RequestValidationError):
    first = e.errors()[0]
    where = ".".join(str(p) for p in first["loc"] if p not in ("body", "query"))
    return JSONResponse(status_code=422, content={"error": {"code": "INVALID_INPUT", "message": f"{where}: {first['msg']}"}})


# ---------- sample data (replace with real outputs) ----------
LATEST_DATE = "2026-05-25"
HOTSPOTS = [
    {"id": 1, "name": "Connaught Place", "lat": 28.6315, "lng": 77.2167, "lst": 48.7, "ndvi": 0.12, "builtup": 82, "driver": "Dense built-up, low NDVI", "risk": "Very High"},
    {"id": 2, "name": "Rohini", "lat": 28.7495, "lng": 77.0565, "lst": 46.3, "ndvi": 0.16, "builtup": 71, "driver": "High impervious surface", "risk": "High"},
    {"id": 3, "name": "Noida Sector 62", "lat": 28.6208, "lng": 77.3639, "lst": 45.8, "ndvi": 0.18, "builtup": 68, "driver": "Commercial rooftops", "risk": "High"},
    {"id": 4, "name": "Dwarka", "lat": 28.5921, "lng": 77.046, "lst": 44.2, "ndvi": 0.21, "builtup": 60, "driver": "Low canopy cover", "risk": "Moderate"},
    {"id": 5, "name": "Greater Noida", "lat": 28.4744, "lng": 77.504, "lst": 42.7, "ndvi": 0.27, "builtup": 48, "driver": "Bare soil, new construction", "risk": "Moderate"},
    {"id": 6, "name": "Gurgaon", "lat": 28.4595, "lng": 77.0266, "lst": 41.5, "ndvi": 0.3, "builtup": 52, "driver": "Glass and concrete density", "risk": "Moderate"},
]
SHAP_GLOBAL = [
    {"feature": "Built-up Area", "value": 0.32}, {"feature": "Impervious Surface", "value": 0.21},
    {"feature": "NDVI", "value": 0.16}, {"feature": "Building Density", "value": 0.12},
    {"feature": "Elevation", "value": 0.09}, {"feature": "Soil Moisture", "value": 0.08}, {"feature": "Others", "value": 0.04},
]
SCENARIOS = [("Tree cover", 4.6), ("Green roofs", 3.5), ("Cool roofs", 3.2), ("High albedo", 3.7), ("Water bodies", 2.2)]
PLACES = [(h["name"], h["lat"], h["lng"]) for h in HOTSPOTS] + [("India Gate, New Delhi", 28.6129, 77.2295), ("Ghaziabad", 28.6692, 77.4538)]


def nearest(lat: float, lng: float):
    return min(HOTSPOTS, key=lambda h: math.hypot(h["lat"] - lat, h["lng"] - lng))


# ---------- request models ----------
class PredictIn(BaseModel):
    lat: Optional[float] = None
    lng: Optional[float] = None
    area: Optional[str] = None


class SimulateIn(BaseModel):
    tree: float = Field(ge=0, le=100)
    cool: float = Field(ge=0, le=100)
    green: float = Field(ge=0, le=100)
    water: float = Field(ge=0, le=100)
    lat: Optional[float] = None
    lng: Optional[float] = None


class RegisterIn(BaseModel):
    name: str = Field(min_length=1)
    email: str = Field(pattern=r"^\S+@\S+\.\S+$")
    password: str = Field(min_length=8)
    organization: Optional[str] = None


class LoginIn(BaseModel):
    email: str
    password: str


# ---------- endpoints ----------
@api.get("/health")
def health():
    return {"status": "ok", "model_version": "stub", "latest_date": LATEST_DATE}


@api.get("/overview")
def overview(city: str = "Delhi-NCR", date: Optional[str] = None):
    return {"city": city, "date": date or LATEST_DATE,
            "avg_lst": {"value": 34.2, "change_pct": -2.1, "vs": "last week"},
            "hotspot_count": {"value": len(HOTSPOTS), "change_pct": 3.0, "vs": "last week"},
            "vegetation_cover": {"value": 28.6, "change_pct": -4.2, "vs": "last year"},
            "builtup_area": {"value": 42.3, "change_pct": 1.5, "vs": "last year"}}


@api.get("/hotspots")
def hotspots(city: str = "Delhi-NCR", date: Optional[str] = None, limit: int = 50):
    return sorted(HOTSPOTS, key=lambda h: -h["lst"])[:limit]  # TODO: derive from the predicted LST raster


@api.get("/trend")
def trend(city: str = "Delhi-NCR", from_: Optional[str] = Query(None, alias="from"), to: Optional[str] = None):
    from datetime import date as d, timedelta
    end = d.fromisoformat(to or LATEST_DATE)
    return [{"date": (end - timedelta(days=4 - i)).isoformat(), "min": 29.5 + i * 0.35, "avg": 33.1 + i * 0.27, "max": 43.0 + i * 0.75} for i in range(5)]


@api.get("/metrics")
def metrics():
    return {"model": "XGBoost", "r2": 0.87, "mae": 2.31, "rmse": 3.76, "n_train": 8000, "n_test": 2000, "trained_at": "2026-06-01"}  # TODO: real test-split metrics


@api.get("/predictions/scatter")
def scatter(limit: int = 500):
    return [{"actual": 26 + (i * 17) % 29, "predicted": round(26 + (i * 17) % 29 + math.sin(i * 12.9898) * 2.4, 1)} for i in range(min(limit, 200))]


@api.post("/predict")
def predict(body: PredictIn):
    # TODO: build the feature vector for the point / area and call model.predict(...)
    if body.area:
        h = next((x for x in HOTSPOTS if x["name"] == body.area), None)
        if not h:
            raise ApiError(404, "NOT_FOUND", f"Unknown area: {body.area}")
    elif body.lat is not None and body.lng is not None:
        h = nearest(body.lat, body.lng)
    else:
        raise ApiError(422, "INVALID_INPUT", "Send either area, or both lat and lng")
    return {"area": h["name"], "lat": h["lat"], "lng": h["lng"], "predicted_lst": round(h["lst"] + 0.3, 1), "actual_lst": h["lst"], "features": {"ndvi": h["ndvi"], "builtup": h["builtup"]}}


@api.get("/shap/global")
def shap_global():
    return SHAP_GLOBAL  # TODO: mean(|shap_values|) per feature from shap.TreeExplainer(model)


@api.get("/shap/drivers")
def shap_drivers():
    return {"positive": SHAP_GLOBAL[:2] + [SHAP_GLOBAL[3]], "negative": [{"feature": "NDVI", "value": -0.16}, {"feature": "Elevation", "value": -0.09}, {"feature": "Soil Moisture", "value": -0.08}]}


@api.get("/shap/local")
def shap_local(lat: float, lng: float):
    h = nearest(lat, lng)
    delta = h["lst"] - 34.0
    weights = [("Built-up Area", .34), ("Impervious Surface", .22), ("NDVI", .22), ("Building Density", .12), ("Elevation", -.04), ("Soil Moisture", .06), ("Others", .08)]
    return {"lat": lat, "lng": lng, "predicted_lst": h["lst"], "base_value": 34.0, "contributions": [{"feature": f, "value": round(delta * w, 2)} for f, w in weights]}


@api.get("/shap/summary")
def shap_summary(limit: int = 300):
    return [{"feature": f["feature"], "points": [{"value": round(i / 39, 2), "shap": round((i / 39 - 0.5) * f["value"] * 2.4, 3)} for i in range(40)]} for f in SHAP_GLOBAL]


@api.post("/simulate")
def simulate(body: SimulateIn):
    # TODO: change NDVI / albedo / water features according to the percentages and re-predict with the model
    before = nearest(body.lat, body.lng)["lst"] if body.lat is not None and body.lng is not None else 43.2
    cut = round(min(8.0, body.tree * 0.046 + body.cool * 0.032 + body.green * 0.035 + body.water * 0.022), 1)
    return {"before": before, "after": round(before - cut, 1), "reduction": cut}


@api.get("/scenarios/compare")
def scenarios_compare(lat: Optional[float] = None, lng: Optional[float] = None):
    f = nearest(lat, lng)["lst"] / 48.7 if lat is not None and lng is not None else 0.9
    return [{"name": n, "reduction": round(r * f, 1)} for n, r in SCENARIOS]


@api.get("/recommendations")
def recommendations(location_id: int):
    h = next((x for x in HOTSPOTS if x["id"] == location_id), None)
    if not h:
        raise ApiError(404, "NOT_FOUND", "Location not found")
    f = min(1.1, max(0.4, (h["lst"] - 36) / 10))
    base = [("Increase tree cover", "Plant more trees, parks and green spaces", 4.2), ("Install cool roofs", "Use high-albedo roofing on buildings", 3.2), ("Create water bodies", "Develop water bodies or wetlands in open spaces", 2.5)]
    strategies = [{"title": t, "description": d, "impact": "High" if c * f >= 3.5 else "Medium" if c * f >= 2 else "Low", "est_cooling": round(c * f, 1)} for t, d, c in base]
    return {"location": {k: h[k] for k in ("id", "name", "lat", "lng", "lst", "driver")}, "strategies": strategies, "overall_cooling": strategies[0]["est_cooling"]}


@api.get("/map/layers")
def map_layers():
    # tile_url may be null until raster tiles exist; the frontend then draws hotspot circles instead.
    # Later: "http://localhost:8000/tiles/lst/{z}/{x}/{y}.png"
    return [{"id": "lst", "label": "LST", "tile_url": None, "attribution": "Landsat 9", "legend": [{"color": "#d62828", "label": "50+"}, {"color": "#2b6fb5", "label": "20-"}]},
            {"id": "ndvi", "label": "NDVI", "tile_url": None, "attribution": "Sentinel-2", "legend": [{"color": "#2f9a7a", "label": "> 0.40"}, {"color": "#d62828", "label": "< 0.15"}]},
            {"id": "builtup", "label": "Built-up", "tile_url": None, "attribution": "Sentinel-2 / OSM", "legend": [{"color": "#d62828", "label": "> 70%"}, {"color": "#8cc63f", "label": "< 40%"}]}]


@api.get("/cities")
def cities():
    return [{"id": "delhi-ncr", "name": "Delhi-NCR", "center": [28.61, 77.21], "zoom": 10}]


@api.get("/locations/search")
def search(q: str):
    return [{"name": n, "lat": la, "lng": ln} for n, la, ln in PLACES if q.strip().lower() in n.lower()][:5]


# ---------- auth (in-memory; use a database + a real JWT/session library in production) ----------
USERS: Dict[str, dict] = {}
TOKENS: Dict[str, str] = {}


def _hash(password: str, salt: bytes) -> str:
    return base64.b64encode(hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100_000)).decode()


def _public(u: dict) -> dict:
    return {"id": u["email"], "name": u["name"], "email": u["email"], "organization": u["organization"] or ""}


def _session(u: dict) -> dict:
    token = secrets.token_urlsafe(32)
    TOKENS[token] = u["email"]
    return {"token": token, "user": _public(u)}


@api.post("/auth/register", status_code=201)
def register(body: RegisterIn):
    email = body.email.strip().lower()
    if email in USERS:
        raise ApiError(409, "EMAIL_EXISTS", "An account with this email already exists")
    salt = secrets.token_bytes(16)
    USERS[email] = {"name": body.name.strip(), "email": email, "organization": body.organization, "salt": salt, "hash": _hash(body.password, salt)}
    return _session(USERS[email])


@api.post("/auth/login")
def login(body: LoginIn):
    u = USERS.get(body.email.strip().lower())
    if not u or u["hash"] != _hash(body.password, u["salt"]):
        raise ApiError(401, "INVALID_CREDENTIALS", "Incorrect email or password")
    return _session(u)


@api.get("/auth/me")
def me(authorization: Optional[str] = Header(None)):
    token = (authorization or "").removeprefix("Bearer ").strip()
    email = TOKENS.get(token)
    if not email:
        raise ApiError(401, "UNAUTHORIZED", "Please sign in again")
    return _public(USERS[email])


app.include_router(api)
