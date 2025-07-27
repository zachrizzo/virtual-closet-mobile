import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ClothingItem, ClothingCategory } from '@/types/clothing';

interface WardrobeState {
  selectedCategory: ClothingCategory | null;
  searchQuery: string;
  sortBy: 'name' | 'date' | 'wearCount';
  filterFavorites: boolean;
}

const initialState: WardrobeState = {
  selectedCategory: null,
  searchQuery: '',
  sortBy: 'date',
  filterFavorites: false,
};

const wardrobeSlice = createSlice({
  name: 'wardrobe',
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<ClothingCategory | null>) => {
      state.selectedCategory = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSortBy: (state, action: PayloadAction<'name' | 'date' | 'wearCount'>) => {
      state.sortBy = action.payload;
    },
    toggleFilterFavorites: (state) => {
      state.filterFavorites = !state.filterFavorites;
    },
    resetFilters: (state) => {
      state.selectedCategory = null;
      state.searchQuery = '';
      state.filterFavorites = false;
    },
  },
});

export const {
  setSelectedCategory,
  setSearchQuery,
  setSortBy,
  toggleFilterFavorites,
  resetFilters,
} = wardrobeSlice.actions;

export default wardrobeSlice.reducer;