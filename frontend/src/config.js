// Global API configuration
// Edit VITE_API_URL in your .env or replace the fallback if your backend binds to a different port (e.g. http://localhost:5001)
export const API_BASE = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000' 
    : (typeof window !== 'undefined' ? window.location.origin : ''));
