// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8000'  // Local development
  : 'https://structures-production.up.railway.app';  // Production

export { API_BASE_URL };