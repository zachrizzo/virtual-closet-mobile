import { Platform } from 'react-native';

// Central API configuration
export const API_CONFIG = {
  // Change this IP address to match your backend server
  BACKEND_IP: '192.168.1.117',
  BACKEND_PORT: '8000',
  API_VERSION: 'api/v1',
};

// Helper function to get the base URL
export const getBaseURL = () => {
  if (__DEV__) {
    // For development, use the configured IP address
    return `http://${API_CONFIG.BACKEND_IP}:${API_CONFIG.BACKEND_PORT}/${API_CONFIG.API_VERSION}`;
  }
  // For production, use environment variable or default
  return process.env.API_URL || 'https://api.virtualcloset.com/api/v1';
};

// Helper function to get base URL without API version (for web frontend)
export const getBaseURLWithoutVersion = () => {
  if (__DEV__) {
    return `http://${API_CONFIG.BACKEND_IP}:${API_CONFIG.BACKEND_PORT}`;
  }
  return process.env.API_URL?.replace('/api/v1', '') || 'https://api.virtualcloset.com';
};