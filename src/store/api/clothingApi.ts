import { api } from './index';
import { ClothingItem, ClothingCategory } from '@/types/clothing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../../services/api';
import { Platform } from 'react-native';
import { getBaseURL } from '../../config/api';

interface GetClothingParams {
  category?: ClothingCategory | null;
  season?: string;
  occasion?: string;
}

interface CreateClothingData {
  name: string;
  category: ClothingCategory;
  subcategory?: string;
  brand?: string;
  color: {
    primary: string;
    secondary?: string[];
  };
  season: string[];
  occasion: string[];
  size?: string;
  purchaseDate?: string;
  cost?: number;
  tags: string[];
  notes?: string;
}

export const clothingApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getClothing: builder.query<ClothingItem[], GetClothingParams>({
      queryFn: async (params) => {
        try {
          const response = await axiosInstance.get('/clothing', { params });
          return { data: response.data };
        } catch (error: any) {
          return { error: { status: error.response?.status || 'FETCH_ERROR', data: error.message } };
        }
      },
      providesTags: ['Clothing'],
    }),
    
    getClothingItem: builder.query<ClothingItem, string>({
      queryFn: async (id) => {
        try {
          const response = await axiosInstance.get(`/clothing/${id}`);
          return { data: response.data };
        } catch (error: any) {
          return { error: { status: error.response?.status || 'FETCH_ERROR', data: error.message } };
        }
      },
      providesTags: (result, error, id) => [{ type: 'Clothing', id }],
    }),
    
    createClothing: builder.mutation<ClothingItem, CreateClothingData>({
      query: (data) => ({
        url: '/clothing',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Clothing'],
    }),
    
    updateClothing: builder.mutation<ClothingItem, { id: string; data: Partial<CreateClothingData> }>({
      query: ({ id, data }) => ({
        url: `/clothing/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Clothing', id },
        'Clothing',
      ],
    }),
    
    deleteClothing: builder.mutation<void, string>({
      query: (id) => ({
        url: `/clothing/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Clothing'],
    }),
    
    uploadClothingImage: builder.mutation<any, { id: string; image: FormData }>({
      query: ({ id, image }) => ({
        url: `/clothing/${id}/upload-image`,
        method: 'POST',
        body: image,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Clothing', id }],
    }),
    
    processClothingImage: builder.mutation<any, string>({
      query: (id) => ({
        url: `/clothing/${id}/process-image`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Clothing', id }],
    }),
    
    markAsWorn: builder.mutation<ClothingItem, string>({
      query: (id) => ({
        url: `/clothing/${id}/wear`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Clothing', id }],
    }),
    
    generateVirtualTryOn: builder.mutation<{ generatedImageUrl: string }, { userImageUri: string; clothingItemId: string }>({
      queryFn: async ({ userImageUri, clothingItemId }) => {
        try {
          console.log('clothingApi - Generating virtual try-on:', { userImageUri, clothingItemId });
          
          // Check if this is a mock item (IDs 1-5)
          const isMockItem = ['1', '2', '3', '4', '5'].includes(clothingItemId);
          if (isMockItem) {
            console.log('clothingApi - Detected mock item, will need to handle differently');
          }
          
          // Convert image URI to base64 data URI
          const imageResponse = await fetch(userImageUri);
          const blob = await imageResponse.blob();
          
          // Convert blob to base64
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve, reject) => {
            reader.onloadend = () => {
              if (reader.result) {
                resolve(reader.result as string);
              } else {
                reject(new Error('Failed to convert image to base64'));
              }
            };
            reader.onerror = reject;
          });
          
          reader.readAsDataURL(blob);
          const base64DataUri = await base64Promise;
          
          console.log('clothingApi - Converted image to base64 data URI');
          
          // Get the current auth token from AsyncStorage
          const token = await AsyncStorage.getItem('@auth_token');
          if (!token) {
            throw new Error('No authentication token found. Please log in again.');
          }
          
          // Make direct fetch request to bypass axios interceptors for debugging
          const baseUrl = getBaseURL();
          
          console.log('clothingApi - Making request to:', baseUrl + '/ai/virtual-tryon');
          console.log('clothingApi - Request body:', {
            user_image: base64DataUri.substring(0, 100) + '...',
            clothing_item_id: clothingItemId,
          });
          console.log('clothingApi - Full clothing item ID being sent:', clothingItemId);
          
          const fetchResponse = await fetch(baseUrl + '/ai/virtual-tryon', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              user_image: base64DataUri,
              clothing_item_id: clothingItemId,
            }),
          });
          
          if (!fetchResponse.ok) {
            const errorText = await fetchResponse.text();
            console.error('clothingApi - Fetch error:', fetchResponse.status, errorText);
            throw new Error(`HTTP ${fetchResponse.status}: ${errorText}`);
          }
          
          const response = await fetchResponse.json();
          console.log('clothingApi - Virtual try-on response:', response);
          console.log('clothingApi - Response keys:', Object.keys(response));
          
          // Transform backend response to match frontend expectations
          const backendBaseUrl = getBaseURL();
          
          // Backend returns 'generated_image' according to VirtualTryOnResponse schema
          const imageUrl = response.generated_image;
          
          if (!imageUrl) {
            console.error('clothingApi - No image URL in response:', response);
            console.error('clothingApi - Expected "generated_image" field but got:', Object.keys(response));
            throw new Error('No generated image URL in response');
          }
          
          // Ensure the URL is complete
          // Remove duplicate /api/v1/ if present
          let cleanImageUrl = imageUrl;
          if (imageUrl.startsWith('/api/v1/')) {
            cleanImageUrl = imageUrl.substring(7); // Remove the first /api/v1/
          }
          
          const fullUrl = cleanImageUrl.startsWith('http') ? cleanImageUrl : `${backendBaseUrl}${cleanImageUrl}`;
          console.log('clothingApi - Generated image URL:', fullUrl);
          console.log('clothingApi - Original image URL:', response.original_image);
          console.log('clothingApi - Processing time:', response.processing_time);
          
          return {
            data: {
              generatedImageUrl: fullUrl,
            }
          };
        } catch (error: any) {
          console.error('clothingApi - Virtual try-on error:', error);
          console.error('clothingApi - Error message:', error.message);
          console.error('clothingApi - Error stack:', error.stack);
          console.error('clothingApi - Error response:', error.response);
          console.error('clothingApi - Error config:', error.config);
          
          // Better error message for timeout
          let errorMessage = 'Failed to generate virtual try-on';
          if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            errorMessage = 'Virtual try-on is taking longer than expected. Please try again.';
          } else if (error.response?.data?.detail) {
            errorMessage = error.response.data.detail;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          return { 
            error: { 
              status: error.response?.status || 'FETCH_ERROR', 
              data: errorMessage
            } 
          };
        }
      },
    }),
  }),
});

export const {
  useGetClothingQuery,
  useGetClothingItemQuery,
  useCreateClothingMutation,
  useUpdateClothingMutation,
  useDeleteClothingMutation,
  useUploadClothingImageMutation,
  useProcessClothingImageMutation,
  useMarkAsWornMutation,
  useGenerateVirtualTryOnMutation,
} = clothingApi;