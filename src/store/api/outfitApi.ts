import { api } from './index';
import { Outfit, Occasion, Season, WeatherCondition } from '@/types/outfit';

interface GetOutfitsParams {
  occasion?: Occasion;
  season?: Season;
  isFavorite?: boolean;
}

interface CreateOutfitData {
  name: string;
  itemIds: string[];
  occasion?: Occasion;
  season?: Season;
  weather?: WeatherCondition;
  notes?: string;
}

export const outfitApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getOutfits: builder.query<Outfit[], GetOutfitsParams>({
      query: (params) => ({
        url: '/outfits',
        params: {
          ...(params.occasion && { occasion: params.occasion }),
          ...(params.season && { season: params.season }),
          ...(params.isFavorite !== undefined && { is_favorite: params.isFavorite }),
        },
      }),
      providesTags: ['Outfit'],
    }),
    
    getOutfit: builder.query<Outfit, string>({
      query: (id) => `/outfits/${id}`,
      providesTags: (result, error, id) => [{ type: 'Outfit', id }],
    }),
    
    createOutfit: builder.mutation<Outfit, CreateOutfitData>({
      query: (data) => ({
        url: '/outfits',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Outfit'],
    }),
    
    updateOutfit: builder.mutation<Outfit, { id: string; data: Partial<CreateOutfitData> }>({
      query: ({ id, data }) => ({
        url: `/outfits/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Outfit', id },
        'Outfit',
      ],
    }),
    
    deleteOutfit: builder.mutation<void, string>({
      query: (id) => ({
        url: `/outfits/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Outfit'],
    }),
    
    markOutfitWorn: builder.mutation<Outfit, string>({
      query: (id) => ({
        url: `/outfits/${id}/wear`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Outfit', id }],
    }),
    
    generateOutfitImage: builder.mutation<any, string>({
      query: (id) => ({
        url: `/outfits/${id}/generate-image`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Outfit', id }],
    }),
  }),
});

export const {
  useGetOutfitsQuery,
  useGetOutfitQuery,
  useCreateOutfitMutation,
  useUpdateOutfitMutation,
  useDeleteOutfitMutation,
  useMarkOutfitWornMutation,
  useGenerateOutfitImageMutation,
} = outfitApi;