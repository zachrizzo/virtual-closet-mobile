import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getMockClothing, getMockOutfits, getMockRecommendations, getMockClothingItem } from './mockData';
import { mockClothingItems } from '../utils/mockData';
import { getBaseURL } from '../config/api';

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 300000, // 5 minutes for virtual try-on processing
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and handle mock data
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      
      // If using mock token, intercept API calls and return mock data
      if (token === 'mock-access-token') {
        // Handle mock responses for different endpoints
        const url = config.url || '';
        
        // Allow virtual try-on to go to real server even with mock token
        if (url.includes('/ai/virtual-tryon')) {
          console.log('Allowing virtual try-on request to real server');
          console.log('Virtual try-on config:', {
            url: config.url,
            baseURL: config.baseURL,
            fullURL: config.baseURL + config.url,
            method: config.method,
            headers: config.headers
          });
          // Use the real test token for virtual try-on
          config.headers.Authorization = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkNjJjY2Q4ZC05NTJmLTQ2NjgtYWM0OS1jMDM0MGJmZjM0YmEiLCJleHAiOjE3NTM2Mzc0MDAsInR5cGUiOiJhY2Nlc3MifQ.RWmMapgnjO7jRiJLrPNF_QepEIJV7FOiLKMHHHjXX5A';
          return config;
        }
        
        // Mock clothing endpoints
        if (url.includes('/clothing/') && url.split('/clothing/')[1] && !url.split('/clothing/')[1].includes('/')) {
          // Individual clothing item request (e.g., /clothing/1)
          const itemId = url.split('/clothing/')[1];
          const item = mockClothingItems.find(item => item.id === itemId);
          console.log('Mock API - Getting individual item:', itemId, item?.name);
          return Promise.reject({
            config,
            response: {
              status: 200,
              data: item,
              headers: {},
              config,
              statusText: 'OK',
            },
            isAxiosError: true,
            isMockResponse: true,
          });
        } else if (url.includes('/clothing')) {
          // Clothing collection request (e.g., /clothing)
          let items = [...mockClothingItems];
          
          // Filter by category if provided
          if (config.params?.category) {
            items = items.filter(item => item.category === config.params.category);
          }
          
          console.log('Mock API - Returning clothing items:', items.length);
          console.log('Mock API - First item:', items[0]?.name, 'images:', items[0]?.images);
          
          return Promise.reject({
            config,
            response: {
              status: 200,
              data: items,
              headers: {},
              config,
              statusText: 'OK',
            },
            isAxiosError: true,
            isMockResponse: true,
          });
        }
        
        // Mock outfits endpoint
        if (url.includes('/outfits')) {
          return Promise.reject({
            config,
            response: {
              status: 200,
              data: await getMockOutfits(config.params),
              headers: {},
              config,
              statusText: 'OK',
            },
            isAxiosError: true,
            isMockResponse: true,
          });
        }
        
        // Mock recommendations endpoint
        if (url.includes('/recommendations')) {
          return Promise.reject({
            config,
            response: {
              status: 200,
              data: await getMockRecommendations(config.params),
              headers: {},
              config,
              statusText: 'OK',
            },
            isAxiosError: true,
            isMockResponse: true,
          });
        }
        
        // Don't mock AI virtual try-on endpoint - let it go to the real server
        // Comment out to make real requests
        /*
        if (url.includes('/ai/virtual-tryon')) {
          console.log('Mock API - Virtual try-on request:', config.data);
          // Simulate virtual try-on response
          return Promise.reject({
            config,
            response: {
              status: 200,
              data: {
                generated_image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=600&fit=crop',
                processing_time: 2.5,
                success: true
              },
              headers: {},
              config,
              statusText: 'OK',
            },
            isAxiosError: true,
            isMockResponse: true,
          });
        }
        */
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and mock responses
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('API Error:', {
      message: error.message,
      code: error.code,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    
    // Handle mock responses
    if (error.isMockResponse && error.response) {
      return Promise.resolve(error.response);
    }

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { authApi } = await import('./auth');
        const newToken = await authApi.refreshToken();
        
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        const { authApi } = await import('./auth');
        await authApi.logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;