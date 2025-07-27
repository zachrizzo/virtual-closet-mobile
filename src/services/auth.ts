import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '@/store';
import { loginSuccess, loginFailure, logout } from '@/store/slices/authSlice';
import api from '@/services/api';

const AUTH_TOKEN_KEY = '@auth_token';
const REFRESH_TOKEN_KEY = '@refresh_token';

class AuthService {
  async login(email: string, password: string) {
    // Check if this is a test login
    if (email === 'jane.doe@example.com' && password === 'secret') {
      // Mock successful login for testing
      const mockUser = {
        id: '1',
        email: 'jane.doe@example.com',
        first_name: 'Jane',
        last_name: 'Doe',
        firstName: 'Jane',
        lastName: 'Doe',
        profile_image: null,
        preferences: {
          stylePersonality: ['classic', 'minimalist'],
          favoriteColors: ['Black', 'White', 'Navy'],
          sizingInfo: {
            topSize: 'M',
            bottomSize: 'M',
            dressSize: '8',
            shoeSize: '8'
          },
          occasionPreferences: ['work', 'casual']
        },
        is_active: true,
        isActive: true,
        is_verified: true,
        isVerified: true,
        created_at: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const mockToken = 'mock-access-token';
      const mockRefreshToken = 'mock-refresh-token';

      // Store mock tokens
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, mockToken);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, mockRefreshToken);
      
      // Don't create mock clothing data here - we'll use TEST_IMAGES from utils/mockData.ts
      // await this.createMockClothingData();

      // Update Redux store with mock data
      store.dispatch(
        loginSuccess({
          user: mockUser,
          token: mockToken,
          refreshToken: mockRefreshToken,
        })
      );

      return mockUser;
    }

    // Regular API login
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { access_token, refresh_token } = response.data;

      // Store tokens
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, access_token);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);

      // Get user info
      const userResponse = await api.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      // Update Redux store
      store.dispatch(
        loginSuccess({
          user: userResponse.data,
          token: access_token,
          refreshToken: refresh_token,
        })
      );

      return userResponse.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Login failed';
      store.dispatch(loginFailure(errorMessage));
      throw new Error(errorMessage);
    }
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    try {
      const response = await api.post('/auth/register', data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Registration failed';
      throw new Error(errorMessage);
    }
  }

  async logout() {
    try {
      // Clear tokens
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);

      // Update Redux store
      store.dispatch(logout());
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async getStoredToken() {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  }

  async getStoredRefreshToken() {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  }

  async refreshToken() {
    try {
      const refreshToken = await this.getStoredRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('/auth/refresh', {
        refresh_token: refreshToken,
      });

      const { access_token, refresh_token: newRefreshToken } = response.data;

      // Update stored tokens
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, access_token);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);

      return access_token;
    } catch (error) {
      // If refresh fails, logout user
      await this.logout();
      throw error;
    }
  }

  async createMockClothingData() {
    // This creates mock clothing data in AsyncStorage for testing
    const mockClothingItems = [
      {
        id: '1',
        userId: '1',
        name: 'Black T-Shirt',
        category: 'tops',
        subcategory: 't-shirt',
        brand: 'Uniqlo',
        color: { primary: 'Black' },
        season: ['spring', 'summer', 'fall', 'winter'],
        occasion: ['casual', 'lounge'],
        size: 'M',
        images: {
          original: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=600&fit=crop',
          processed: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=600&fit=crop',
          thumbnail: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=150&h=150&fit=crop',
        },
        tags: ['basic', 'essential'],
        wearCount: 15,
        lastWorn: null,
        isActive: true,
        isFavorite: true,
        notes: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        userId: '1',
        name: 'Blue Jeans',
        category: 'bottoms',
        subcategory: 'jeans',
        brand: "Levi's",
        color: { primary: 'Blue' },
        season: ['spring', 'summer', 'fall', 'winter'],
        occasion: ['casual', 'work'],
        size: 'M',
        images: {
          original: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=600&fit=crop',
          processed: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=600&fit=crop',
          thumbnail: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=150&h=150&fit=crop',
        },
        tags: ['denim', 'essential'],
        wearCount: 20,
        lastWorn: null,
        isActive: true,
        isFavorite: true,
        notes: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        userId: '1',
        name: 'White Blouse',
        category: 'tops',
        subcategory: 'blouse',
        brand: 'Zara',
        color: { primary: 'White' },
        season: ['spring', 'summer'],
        occasion: ['work', 'formal'],
        size: 'M',
        images: {
          original: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=400&h=600&fit=crop',
          processed: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=400&h=600&fit=crop',
          thumbnail: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=150&h=150&fit=crop',
        },
        tags: ['professional'],
        wearCount: 8,
        lastWorn: null,
        isActive: true,
        isFavorite: false,
        notes: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '4',
        userId: '1',
        name: 'Floral Dress',
        category: 'dresses',
        subcategory: 'casual_dress',
        brand: 'H&M',
        color: { primary: 'Pink' },
        season: ['spring', 'summer'],
        occasion: ['casual', 'date', 'party'],
        size: 'M',
        images: {
          original: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=600&fit=crop',
          processed: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=600&fit=crop',
          thumbnail: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=150&h=150&fit=crop',
        },
        tags: ['floral', 'feminine'],
        wearCount: 5,
        lastWorn: null,
        isActive: true,
        isFavorite: false,
        notes: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '5',
        userId: '1',
        name: 'Navy Blazer',
        category: 'outerwear',
        subcategory: 'blazer',
        brand: 'Ralph Lauren',
        color: { primary: 'Navy' },
        season: ['spring', 'fall', 'winter'],
        occasion: ['work', 'formal'],
        size: 'M',
        images: {
          original: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=600&fit=crop',
          processed: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=600&fit=crop',
          thumbnail: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=150&h=150&fit=crop',
        },
        tags: ['professional', 'classic'],
        wearCount: 12,
        lastWorn: null,
        isActive: true,
        isFavorite: true,
        notes: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // Add more items for testing
      {
        id: '6',
        userId: '1',
        name: 'Red Sweater',
        category: 'tops',
        subcategory: 'sweater',
        brand: 'Gap',
        color: { primary: 'Red' },
        season: ['fall', 'winter'],
        occasion: ['casual', 'date'],
        size: 'M',
        images: {
          original: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=600&fit=crop',
          processed: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=600&fit=crop',
          thumbnail: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=150&h=150&fit=crop',
        },
        tags: ['cozy', 'winter'],
        wearCount: 10,
        lastWorn: null,
        isActive: true,
        isFavorite: false,
        notes: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '7',
        userId: '1',
        name: 'Black Skirt',
        category: 'bottoms',
        subcategory: 'skirt',
        brand: 'Zara',
        color: { primary: 'Black' },
        season: ['spring', 'summer', 'fall'],
        occasion: ['work', 'party'],
        size: 'M',
        images: {
          original: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&h=600&fit=crop',
          processed: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&h=600&fit=crop',
          thumbnail: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=150&h=150&fit=crop',
        },
        tags: ['versatile', 'essential'],
        wearCount: 15,
        lastWorn: null,
        isActive: true,
        isFavorite: true,
        notes: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '8',
        userId: '1',
        name: 'Denim Jacket',
        category: 'outerwear',
        subcategory: 'jacket',
        brand: 'Levi\'s',
        color: { primary: 'Blue' },
        season: ['spring', 'fall'],
        occasion: ['casual'],
        size: 'M',
        images: {
          original: 'https://images.unsplash.com/photo-1559551409-dadc959f76b8?w=400&h=600&fit=crop',
          processed: 'https://images.unsplash.com/photo-1559551409-dadc959f76b8?w=400&h=600&fit=crop',
          thumbnail: 'https://images.unsplash.com/photo-1559551409-dadc959f76b8?w=150&h=150&fit=crop',
        },
        tags: ['denim', 'classic'],
        wearCount: 18,
        lastWorn: null,
        isActive: true,
        isFavorite: true,
        notes: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Store mock data
    await AsyncStorage.setItem('@mock_clothing', JSON.stringify(mockClothingItems));
    
    // Log for debugging
    console.log('Created mock clothing data with', mockClothingItems.length, 'items');
  }
}

export const authApi = new AuthService();