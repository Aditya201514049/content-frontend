// Configuration settings for the application
const config = {
  // API URL based on environment
  API_URL: import.meta.env.VITE_API_URL || '/api',
    
  // Direct backend URL for Railway
  DIRECT_API_URL: import.meta.env.VITE_DIRECT_API_URL || 'https://content-backend-production-163e.up.railway.app/api',
    
  // Other configuration settings
  APP_NAME: 'ContentGuardian',
  TOKEN_KEY: 'auth_token',
};

export default config; 