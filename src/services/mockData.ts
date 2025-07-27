import { ClothingItem, ClothingCategory, Season, Occasion } from '@/types/clothing';
import { Outfit, WeatherCondition } from '@/types/outfit';

// Mock clothing items
export const mockClothingItems: ClothingItem[] = [
  {
    id: '1',
    userId: '1',
    name: 'Black Blazer',
    category: ClothingCategory.OUTERWEAR,
    subcategory: 'blazer',
    brand: 'Zara',
    color: {
      primary: 'Black',
    },
    season: [Season.FALL, Season.WINTER, Season.SPRING],
    occasion: [Occasion.WORK, Occasion.FORMAL],
    size: 'M',
    purchaseDate: new Date('2024-01-15'),
    cost: 120,
    images: {
      original: 'https://via.placeholder.com/400x600/000000/FFFFFF?text=Black+Blazer',
      processed: 'https://via.placeholder.com/400x600/000000/FFFFFF?text=Black+Blazer',
      thumbnail: 'https://via.placeholder.com/200x300/000000/FFFFFF?text=Black+Blazer',
    },
    tags: ['favorite', 'versatile'],
    wearCount: 15,
    lastWorn: new Date('2024-07-20'),
    isActive: true,
    isFavorite: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-07-20'),
  },
  {
    id: '2',
    userId: '1',
    name: 'White Button-Down Shirt',
    category: ClothingCategory.TOPS,
    subcategory: 'shirt',
    brand: 'Uniqlo',
    color: {
      primary: 'White',
    },
    season: [Season.ALL_SEASON],
    occasion: [Occasion.WORK, Occasion.CASUAL],
    size: 'M',
    purchaseDate: new Date('2024-02-01'),
    cost: 40,
    images: {
      original: 'https://via.placeholder.com/400x600/FFFFFF/000000?text=White+Shirt',
      processed: 'https://via.placeholder.com/400x600/FFFFFF/000000?text=White+Shirt',
      thumbnail: 'https://via.placeholder.com/200x300/FFFFFF/000000?text=White+Shirt',
    },
    tags: ['basic', 'essential'],
    wearCount: 25,
    lastWorn: new Date('2024-07-25'),
    isActive: true,
    isFavorite: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-07-25'),
  },
  {
    id: '3',
    userId: '1',
    name: 'Navy Pencil Skirt',
    category: ClothingCategory.BOTTOMS,
    subcategory: 'skirt',
    brand: 'H&M',
    color: {
      primary: 'Navy',
    },
    season: [Season.ALL_SEASON],
    occasion: [Occasion.WORK, Occasion.FORMAL],
    size: 'M',
    purchaseDate: new Date('2024-03-10'),
    cost: 35,
    images: {
      original: 'https://via.placeholder.com/400x600/000080/FFFFFF?text=Navy+Skirt',
      processed: 'https://via.placeholder.com/400x600/000080/FFFFFF?text=Navy+Skirt',
      thumbnail: 'https://via.placeholder.com/200x300/000080/FFFFFF?text=Navy+Skirt',
    },
    tags: ['professional'],
    wearCount: 18,
    lastWorn: new Date('2024-07-22'),
    isActive: true,
    isFavorite: false,
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-07-22'),
  },
  {
    id: '4',
    userId: '1',
    name: 'Floral Summer Dress',
    category: ClothingCategory.DRESSES,
    subcategory: 'casual_dress',
    brand: 'Zara',
    color: {
      primary: 'Pink',
      secondary: ['White', 'Green'],
    },
    season: [Season.SUMMER, Season.SPRING],
    occasion: [Occasion.CASUAL, Occasion.DATE, Occasion.VACATION],
    size: 'M',
    purchaseDate: new Date('2024-04-20'),
    cost: 65,
    images: {
      original: 'https://via.placeholder.com/400x600/FFC0CB/000000?text=Floral+Dress',
      processed: 'https://via.placeholder.com/400x600/FFC0CB/000000?text=Floral+Dress',
      thumbnail: 'https://via.placeholder.com/200x300/FFC0CB/000000?text=Floral+Dress',
    },
    tags: ['summer', 'romantic'],
    wearCount: 8,
    lastWorn: new Date('2024-07-15'),
    isActive: true,
    isFavorite: false,
    createdAt: new Date('2024-04-20'),
    updatedAt: new Date('2024-07-15'),
  },
  {
    id: '5',
    userId: '1',
    name: 'Black Pumps',
    category: ClothingCategory.SHOES,
    subcategory: 'heels',
    brand: 'Nine West',
    color: {
      primary: 'Black',
    },
    season: [Season.ALL_SEASON],
    occasion: [Occasion.WORK, Occasion.FORMAL, Occasion.PARTY],
    size: '8',
    purchaseDate: new Date('2023-12-01'),
    cost: 90,
    images: {
      original: 'https://via.placeholder.com/400x600/000000/FFFFFF?text=Black+Pumps',
      processed: 'https://via.placeholder.com/400x600/000000/FFFFFF?text=Black+Pumps',
      thumbnail: 'https://via.placeholder.com/200x300/000000/FFFFFF?text=Black+Pumps',
    },
    tags: ['classic', 'heels'],
    wearCount: 20,
    lastWorn: new Date('2024-07-18'),
    isActive: true,
    isFavorite: true,
    createdAt: new Date('2023-12-01'),
    updatedAt: new Date('2024-07-18'),
  },
];

// Mock outfits
export const mockOutfits: Outfit[] = [
  {
    id: '1',
    userId: '1',
    name: 'Professional Monday',
    itemIds: ['1', '2', '3', '5'],
    items: mockClothingItems.filter(item => ['1', '2', '3', '5'].includes(item.id)),
    occasion: Occasion.WORK,
    season: Season.FALL,
    weather: WeatherCondition.MILD,
    rating: 4.5,
    notes: 'Perfect for important meetings',
    image: 'https://via.placeholder.com/400x600/333333/FFFFFF?text=Professional+Outfit',
    wearCount: 10,
    lastWorn: new Date('2024-07-22'),
    isAIGenerated: false,
    isFavorite: true,
    createdAt: new Date('2024-05-01'),
    updatedAt: new Date('2024-07-22'),
  },
  {
    id: '2',
    userId: '1',
    name: 'Summer Brunch',
    itemIds: ['4'],
    items: mockClothingItems.filter(item => ['4'].includes(item.id)),
    occasion: Occasion.CASUAL,
    season: Season.SUMMER,
    weather: WeatherCondition.SUNNY,
    rating: 5,
    notes: 'Light and comfortable for warm days',
    image: 'https://via.placeholder.com/400x600/FFE4E1/000000?text=Summer+Outfit',
    wearCount: 5,
    lastWorn: new Date('2024-07-15'),
    isAIGenerated: true,
    isFavorite: false,
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-07-15'),
  },
];

// Mock recommendations
export const mockRecommendations = [
  {
    id: 'rec1',
    outfitId: null,
    itemIds: ['1', '2', '3'],
    items: mockClothingItems.filter(item => ['1', '2', '3'].includes(item.id)),
    score: 0.92,
    reason: 'Perfect for your upcoming work presentation. Classic and professional.',
    stylingTips: [
      'Add a statement necklace to elevate the look',
      'Consider nude pumps to elongate your legs',
    ],
  },
  {
    id: 'rec2',
    outfitId: null,
    itemIds: ['4'],
    items: mockClothingItems.filter(item => ['4'].includes(item.id)),
    score: 0.88,
    reason: 'Great for the sunny weather forecast this weekend.',
    stylingTips: [
      'Pair with white sneakers for a casual look',
      'Add a denim jacket for cooler evenings',
    ],
  },
];

// Mock API responses
export const getMockClothing = (params?: any) => {
  let items = [...mockClothingItems];
  
  if (params?.category) {
    items = items.filter(item => item.category === params.category);
  }
  
  return Promise.resolve(items);
};

export const getMockOutfits = (params?: any) => {
  let outfits = [...mockOutfits];
  
  if (params?.is_favorite) {
    outfits = outfits.filter(outfit => outfit.isFavorite);
  }
  
  return Promise.resolve(outfits);
};

export const getMockRecommendations = (params?: any) => {
  return Promise.resolve(mockRecommendations);
};

export const getMockClothingItem = (id: string) => {
  const item = mockClothingItems.find(item => item.id === id);
  return Promise.resolve(item);
};