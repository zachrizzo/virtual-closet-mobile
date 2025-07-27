import { api } from './index';
import { Occasion, WeatherCondition } from '@/types/outfit';

interface RecommendationContext {
  occasion?: Occasion | null;
  season?: string;
  weather?: WeatherCondition | null;
  temperature?: number;
  eventType?: string;
  timeOfDay?: string;
}

interface Recommendation {
  id: string;
  outfitId?: string;
  itemIds: string[];
  items?: any[];
  score: number;
  reason: string;
  stylingTips?: string[];
  alternatives?: any[];
}

interface GetRecommendationsParams {
  occasion?: Occasion | null;
  weather?: WeatherCondition | null;
  maxResults?: number;
}

interface VirtualTryOnRequest {
  userImage: string;
  clothingItemId: string;
}

interface VirtualTryOnResponse {
  originalImage: string;
  generatedImage: string;
  processingTime: number;
}

export const recommendationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRecommendations: builder.query<Recommendation[], GetRecommendationsParams>({
      query: (params) => ({
        url: '/ai/recommendations',
        method: 'POST',
        body: {
          context: {
            occasion: params.occasion,
            weather: params.weather,
          },
          max_results: params.maxResults || 5,
        },
      }),
      providesTags: ['Recommendation'],
    }),
    
    getStyleAdvice: builder.query<any, string>({
      query: (outfitId) => ({
        url: '/ai/style-advice',
        method: 'POST',
        body: { outfit_id: outfitId },
      }),
    }),
    
    getOccasionOutfits: builder.query<Recommendation[], string>({
      query: (occasion) => ({
        url: '/ai/occasion-outfits',
        method: 'POST',
        body: { occasion },
      }),
      providesTags: ['Recommendation'],
    }),
    
    getWeatherOutfits: builder.query<Recommendation[], { weather: string; temperature: number }>({
      query: ({ weather, temperature }) => ({
        url: '/ai/weather-outfits',
        method: 'POST',
        body: { weather, temperature },
      }),
      providesTags: ['Recommendation'],
    }),
    
    virtualTryOn: builder.mutation<VirtualTryOnResponse, VirtualTryOnRequest>({
      query: (data) => ({
        url: '/ai/virtual-tryon',
        method: 'POST',
        body: data,
      }),
    }),
    
    submitFeedback: builder.mutation<any, { recommendationId: string; isAccepted: boolean; feedback?: string }>({
      query: (data) => ({
        url: '/ai/recommendation-feedback',
        method: 'POST',
        body: {
          recommendation_id: data.recommendationId,
          is_accepted: data.isAccepted,
          feedback: data.feedback,
        },
      }),
    }),
  }),
});

export const {
  useGetRecommendationsQuery,
  useGetStyleAdviceQuery,
  useGetOccasionOutfitsQuery,
  useGetWeatherOutfitsQuery,
  useVirtualTryOnMutation,
  useSubmitFeedbackMutation,
} = recommendationApi;