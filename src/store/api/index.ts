import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { RootState } from '../index';

const getBaseURL = () => {
  if (__DEV__) {
    return Platform.OS === 'ios' 
      ? 'http://192.168.1.136:8000/api/v1'
      : 'http://10.0.2.2:8000/api/v1';
  }
  return process.env.API_URL || 'https://api.virtualcloset.com/api/v1';
};

const baseQuery = fetchBaseQuery({
  baseUrl: getBaseURL(),
  prepareHeaders: async (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['User', 'Clothing', 'Outfit', 'Recommendation'],
  endpoints: () => ({}),
});

export default api;