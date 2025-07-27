// Central API configuration for web frontend
const API_CONFIG = {
  // Change this IP address to match your backend server
  BACKEND_IP: '192.168.1.117',
  BACKEND_PORT: '8000',
};

// API Base URL
const API_BASE_URL = `http://${API_CONFIG.BACKEND_IP}:${API_CONFIG.BACKEND_PORT}`;