// Unified API service that handles mock/real data switching
import { Platform } from 'react-native';
import { FEATURES } from '../../config/environment';
import { mockWardrobe } from '../mockData/wardrobe';
import { mockAIChat } from '../mockData/aiChat';
import { mockUser } from '../mockData/user';
import { mockAuth } from '../mockData/auth';
import api from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClothingCategory } from '../../types/clothing';

// Transform backend snake_case to frontend camelCase
const transformClothingFromBackend = (item: any) => ({
  id: item.id,
  userId: item.user_id,
  name: item.name,
  category: item.category,
  images: {
    original: item.images?.original || '',
    thumbnail: item.images?.thumbnail || item.images?.original || '',
  },
  createdAt: item.created_at,
  updatedAt: item.updated_at,
});

// Transform frontend camelCase to backend snake_case
const transformClothingToBackend = (item: any) => ({
  name: item.name,
  category: item.category,
  brand: 'Generic', // Default for MVP
  size: 'M', // Default for MVP
  color: {
    primary: 'Multi', // Default for MVP
  },
  season: ['all_season'],
  occasion: ['casual'],
  tags: [],
  notes: '',
});

// Simplified clothing item for MVP
export interface SimplifiedClothingItem {
  id: string;
  userId: string;
  name: string;
  category: ClothingCategory;
  images: {
    original: string;
    thumbnail?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const unifiedAPI = {
  // Authentication
  auth: {
    login: async (email: string, password: string) => {
      if (FEATURES.USE_MOCK_AUTH) {
        const result = await mockAuth.login(email, password);
        await AsyncStorage.setItem('@auth_token', result.token);
        return result;
      }
      
      // Real API
      const response = await api.post('/auth/login', 
        new URLSearchParams({ username: email, password }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      await AsyncStorage.setItem('@auth_token', response.data.access_token);
      return {
        token: response.data.access_token,
        user: { email },
      };
    },
    
    logout: async () => {
      await AsyncStorage.removeItem('@auth_token');
      if (FEATURES.USE_MOCK_AUTH) {
        return mockAuth.logout();
      }
      // Real API doesn't need logout endpoint
    },
    
    isAuthenticated: async () => {
      const token = await AsyncStorage.getItem('@auth_token');
      return !!token;
    },
  },
  
  // Wardrobe
  wardrobe: {
    getItems: async (): Promise<SimplifiedClothingItem[]> => {
      if (FEATURES.USE_MOCK_WARDROBE) {
        const items = await mockWardrobe.getItems();
        return items.map(item => ({
          ...item,
          // Property names are already correct in the updated mock data
        }));
      }
      
      // Real API
      const response = await api.get('/clothing');
      return response.data.map(transformClothingFromBackend);
    },
    
    getItem: async (id: string): Promise<SimplifiedClothingItem | null> => {
      if (FEATURES.USE_MOCK_WARDROBE) {
        const item = await mockWardrobe.getItem(id);
        if (!item) return null;
        return {
          ...item,
          // Property names are already correct in the updated mock data
        };
      }
      
      // Real API
      const response = await api.get(`/clothing/${id}`);
      return transformClothingFromBackend(response.data);
    },
    
    addItem: async (name: string, category: ClothingCategory): Promise<SimplifiedClothingItem> => {
      if (FEATURES.USE_MOCK_WARDROBE) {
        const item = await mockWardrobe.addItem({ name, category });
        return {
          ...item,
          // Property names are already correct in the updated mock data
        };
      }
      
      // Real API
      const data = transformClothingToBackend({ name, category });
      const response = await api.post('/clothing', data);
      return transformClothingFromBackend(response.data);
    },
    
    uploadImage: async (itemId: string, imageData: any) => {
      if (FEATURES.USE_MOCK_WARDROBE) {
        return mockWardrobe.uploadImage(itemId, imageData);
      }
      
      try {
        console.log('Uploading image with data:', imageData);
        
        // Real API - always upload images
        const formData = new FormData();
        
        // Platform-specific URI handling
        const fileUri = Platform.OS === 'ios' 
          ? imageData.uri.replace('file://', '') 
          : imageData.uri;
        
        // React Native requires this specific structure for file uploads
        formData.append('file', {
          uri: fileUri,
          type: imageData.type || 'image/jpeg',
          name: imageData.name || 'photo.jpg',
        } as any);
        
        console.log('FormData created, sending to:', `/clothing/${itemId}/upload-image`);
        
        const response = await api.post(`/clothing/${itemId}/upload-image`, formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
          },
        });
        
        console.log('Upload response:', response.data);
        return response.data;
      } catch (error: any) {
        console.error('Upload error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers,
        });
        throw error;
      }
    },
    
    deleteItem: async (id: string): Promise<boolean> => {
      if (FEATURES.USE_MOCK_WARDROBE) {
        return mockWardrobe.deleteItem(id);
      }
      
      // Real API
      await api.delete(`/clothing/${id}`);
      return true;
    },
  },
  
  // AI Chat
  chat: {
    sendMessage: async (message: string) => {
      if (FEATURES.USE_MOCK_CHAT) {
        return mockAIChat.sendMessage(message);
      }
      
      // Real API
      const response = await api.post('/ai/chat', { message });
      return response.data;
    },
    
    getHistory: async () => {
      if (FEATURES.USE_MOCK_CHAT) {
        return mockAIChat.getHistory();
      }
      
      // Real API
      const response = await api.get('/ai/chat/history');
      return response.data;
    },
    
    clearHistory: async () => {
      if (FEATURES.USE_MOCK_CHAT) {
        return mockAIChat.clearHistory();
      }
      
      // Real API
      await api.delete('/ai/chat/history');
    },
  },
  
  // User Profile
  user: {
    getProfile: async () => {
      if (FEATURES.USE_MOCK_PROFILE) {
        return mockUser.getProfile();
      }
      
      // Real API
      const response = await api.get('/users/me');
      return response.data;
    },
    
    updateProfile: async (updates: any) => {
      if (FEATURES.USE_MOCK_PROFILE) {
        return mockUser.updateProfile(updates);
      }
      
      // Real API
      const response = await api.put('/users/me', updates);
      return response.data;
    },
    
    subscribeToPremium: async () => {
      if (FEATURES.USE_MOCK_PROFILE) {
        return mockUser.subscribeToPremium();
      }
      
      // Real API
      const response = await api.post('/subscriptions/create', { plan: 'premium' });
      return response.data;
    },
    
    canTryOn: async () => {
      if (FEATURES.USE_MOCK_PROFILE) {
        return mockUser.canTryOn();
      }
      
      // Real API
      const response = await api.get('/users/me/can-tryon');
      return response.data;
    },
    
    useTryOn: async () => {
      if (FEATURES.USE_MOCK_PROFILE) {
        return mockUser.useTryOn();
      }
      
      // Real API
      const response = await api.post('/users/me/use-tryon');
      return response.data;
    },
  },
  
  // Virtual Try-On (ALWAYS REAL - NEVER MOCKED)
  virtualTryOn: {
    tryOn: async (clothingItemId: string, userImageBase64: string) => {
      // Always use real API for virtual try-on
      const response = await api.post('/ai/virtual-tryon', {
        clothing_item_id: clothingItemId,
        user_image: userImageBase64,
      });
      return response.data;
    },
  },
};