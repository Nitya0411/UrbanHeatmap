// Mock mode is ON unless VITE_USE_MOCK is exactly "false".
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
export const API_URL = import.meta.env.VITE_API_URL || '/api';

// Raster tiles from the ML package exist for zoom levels 11 to 16 only.
export const TILE_ZOOM = { min: 11, max: 16 };
