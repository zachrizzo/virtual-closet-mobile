import { api } from './index';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserPhoto {
  id: string;
  userId: string;
  imageUrl: string;
  label?: string;
  isDefault: boolean;
  createdAt: string;
}

interface UploadPhotoData {
  imageUri: string;
  label?: string;
}

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUserPhotos: builder.query<UserPhoto[], void>({
      queryFn: async () => {
        try {
          // Get mock user photos from AsyncStorage
          const storedPhotos = await AsyncStorage.getItem('@user_photos');
          if (storedPhotos) {
            return { data: JSON.parse(storedPhotos) };
          }
          
          // Return default mock photos
          const defaultPhotos: UserPhoto[] = [
            {
              id: '1',
              userId: '1',
              imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop',
              label: 'Front view',
              isDefault: true,
              createdAt: new Date().toISOString(),
            },
            {
              id: '2',
              userId: '1',
              imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=600&fit=crop',
              label: 'Casual outfit',
              isDefault: false,
              createdAt: new Date(Date.now() - 86400000).toISOString(),
            },
          ];
          
          await AsyncStorage.setItem('@user_photos', JSON.stringify(defaultPhotos));
          return { data: defaultPhotos };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      providesTags: ['User'],
    }),
    
    uploadUserPhoto: builder.mutation<UserPhoto, UploadPhotoData>({
      queryFn: async ({ imageUri, label }) => {
        try {
          // Get existing photos
          const storedPhotos = await AsyncStorage.getItem('@user_photos');
          const photos: UserPhoto[] = storedPhotos ? JSON.parse(storedPhotos) : [];
          
          // Create new photo entry
          const newPhoto: UserPhoto = {
            id: Date.now().toString(),
            userId: '1',
            imageUrl: imageUri, // In real app, this would be uploaded to server
            label,
            isDefault: photos.length === 0, // First photo is default
            createdAt: new Date().toISOString(),
          };
          
          // Add to photos array
          photos.push(newPhoto);
          
          // Save back to storage
          await AsyncStorage.setItem('@user_photos', JSON.stringify(photos));
          
          return { data: newPhoto };
        } catch (error) {
          return { error: { status: 'UPLOAD_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: ['User'],
    }),
    
    deleteUserPhoto: builder.mutation<void, string>({
      queryFn: async (photoId) => {
        try {
          // Get existing photos
          const storedPhotos = await AsyncStorage.getItem('@user_photos');
          const photos: UserPhoto[] = storedPhotos ? JSON.parse(storedPhotos) : [];
          
          // Remove the photo
          const updatedPhotos = photos.filter(p => p.id !== photoId);
          
          // If deleted photo was default, make the first one default
          if (photos.find(p => p.id === photoId)?.isDefault && updatedPhotos.length > 0) {
            updatedPhotos[0].isDefault = true;
          }
          
          // Save back to storage
          await AsyncStorage.setItem('@user_photos', JSON.stringify(updatedPhotos));
          
          return { data: undefined };
        } catch (error) {
          return { error: { status: 'DELETE_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: ['User'],
    }),
    
    setDefaultPhoto: builder.mutation<void, string>({
      queryFn: async (photoId) => {
        try {
          // Get existing photos
          const storedPhotos = await AsyncStorage.getItem('@user_photos');
          const photos: UserPhoto[] = storedPhotos ? JSON.parse(storedPhotos) : [];
          
          // Update default status
          const updatedPhotos = photos.map(p => ({
            ...p,
            isDefault: p.id === photoId,
          }));
          
          // Save back to storage
          await AsyncStorage.setItem('@user_photos', JSON.stringify(updatedPhotos));
          
          return { data: undefined };
        } catch (error) {
          return { error: { status: 'UPDATE_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetUserPhotosQuery,
  useUploadUserPhotoMutation,
  useDeleteUserPhotoMutation,
  useSetDefaultPhotoMutation,
} = userApi;