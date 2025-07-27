import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { RootState } from '../index';
import { getBaseURL } from '../../config/api';

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