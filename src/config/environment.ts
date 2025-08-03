// Environment configuration for MVP
// Toggle this to switch between mock and real data
export const USE_MOCK_DATA = true; // Set to false when backend is ready

// Feature flags for granular control
export const FEATURES = {
  USE_MOCK_AUTH: USE_MOCK_DATA,
  USE_MOCK_WARDROBE: USE_MOCK_DATA,
  USE_MOCK_CHAT: USE_MOCK_DATA,
  USE_MOCK_PROFILE: USE_MOCK_DATA,
  // Virtual Try-On always uses real API
  USE_MOCK_TRYON: false,
};

// API Configuration
export const API_CONFIG = {
  // Update this with your backend URL
  BASE_URL: __DEV__ ? 'http://192.168.1.117:8000' : 'https://api.virtualcloset.com',
  TIMEOUT: 300000, // 5 minutes for virtual try-on
};

// Subscription Tiers
export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: 'Free',
    price: 0,
    itemsLimit: 10,
    tryOnsPerMonth: 5,
  },
  PREMIUM: {
    name: 'Premium',
    price: 9.99,
    itemsLimit: -1, // Unlimited
    tryOnsPerMonth: -1, // Unlimited
  },
};