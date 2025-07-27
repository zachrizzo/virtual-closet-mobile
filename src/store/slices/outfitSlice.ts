import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Outfit } from '@/types/outfit';

interface OutfitState {
  selectedItems: string[];
  isCreatingOutfit: boolean;
}

const initialState: OutfitState = {
  selectedItems: [],
  isCreatingOutfit: false,
};

const outfitSlice = createSlice({
  name: 'outfit',
  initialState,
  reducers: {
    toggleItemSelection: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      const index = state.selectedItems.indexOf(itemId);
      
      if (index > -1) {
        state.selectedItems.splice(index, 1);
      } else {
        state.selectedItems.push(itemId);
      }
    },
    clearSelectedItems: (state) => {
      state.selectedItems = [];
    },
    setIsCreatingOutfit: (state, action: PayloadAction<boolean>) => {
      state.isCreatingOutfit = action.payload;
      if (!action.payload) {
        state.selectedItems = [];
      }
    },
  },
});

export const {
  toggleItemSelection,
  clearSelectedItems,
  setIsCreatingOutfit,
} = outfitSlice.actions;

export default outfitSlice.reducer;