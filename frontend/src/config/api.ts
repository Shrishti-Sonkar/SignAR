// API Configuration for SignLang
// All AI provider keys live in backend/.env — the frontend only talks to our Flask backend.

export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000';

export const API_ENDPOINTS = {
  PREDICT: `${BACKEND_URL}/predict`,
  PREDICT_SEQUENCE: `${BACKEND_URL}/predict-sequence`,
  SPEAK: `${BACKEND_URL}/speak`,
  GLOSSES: `${BACKEND_URL}/api/glosses`,
  GLOSSES_TO_TEXT: `${BACKEND_URL}/api/glosses-to-text`,
  SEARCH: `${BACKEND_URL}/api/search`,
  YOUTUBE: `${BACKEND_URL}/api/youtube`,
};
