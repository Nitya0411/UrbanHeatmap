// Mock mode is ON unless VITE_USE_MOCK is exactly "false".
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
export const API_URL = import.meta.env.VITE_API_URL || '/api';

// Zoom range of the raster tiles served by the backend (edit if the backend serves a different range).
export const TILE_ZOOM = { min: 8, max: 16 };
