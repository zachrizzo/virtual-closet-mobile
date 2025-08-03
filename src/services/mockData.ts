import { ClothingItem, ClothingCategory, Season, Occasion, ItemCondition, ColorFamily, Visibility } from '@/types/clothing';
import { Outfit, WeatherCondition, ItemRole, OutfitItem } from '@/types/outfit';

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
      primary: {
        name: 'Black',
        hex: '#000000',
        family: ColorFamily.BLACK
      }
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
    condition: ItemCondition.EXCELLENT,
    materials: ['Wool Blend', 'Polyester'],
    careInstructions: ['Dry clean only'],
    retailValue: 120,
    currentValue: 95,
    tags: ['favorite', 'versatile'],
    notes: 'Perfect for professional settings',
    wearCount: 15,
    lastWorn: new Date('2024-07-20'),
    visibility: Visibility.FRIENDS,
    allowSharing: true,
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
      primary: {
        name: 'White',
        hex: '#FFFFFF', 
        family: ColorFamily.WHITE
      }
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
    condition: ItemCondition.GOOD,
    materials: ['100% Cotton'],
    careInstructions: ['Machine wash cold', 'Tumble dry low'],
    retailValue: 40,
    currentValue: 32,
    tags: ['basic', 'essential'],
    notes: 'Versatile wardrobe staple',
    wearCount: 25,
    lastWorn: new Date('2024-07-25'),
    visibility: Visibility.PRIVATE,
    allowSharing: true,
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
      primary: {
        name: 'Navy Blue',
        hex: '#000080',
        family: ColorFamily.BLUE
      }
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
    condition: ItemCondition.EXCELLENT,
    materials: ['Polyester', 'Spandex'],
    careInstructions: ['Machine wash cold', 'Hang dry'],
    retailValue: 35,
    currentValue: 28,
    tags: ['professional'],
    notes: 'Great for work outfits',
    wearCount: 18,
    lastWorn: new Date('2024-07-22'),
    visibility: Visibility.FRIENDS,
    allowSharing: true,
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
      primary: {
        name: 'Pink',
        hex: '#FFC0CB',
        family: ColorFamily.PINK
      },
      secondary: [
        {
          name: 'White',
          hex: '#FFFFFF',
          family: ColorFamily.WHITE
        },
        {
          name: 'Green',
          hex: '#008000',
          family: ColorFamily.GREEN
        }
      ]
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
    condition: ItemCondition.EXCELLENT,
    materials: ['Chiffon', 'Polyester Lining'],
    careInstructions: ['Hand wash cold', 'Hang dry'],
    retailValue: 65,
    currentValue: 52,
    tags: ['summer', 'romantic'],
    notes: 'Perfect for summer events',
    wearCount: 8,
    lastWorn: new Date('2024-07-15'),
    visibility: Visibility.PUBLIC,
    allowSharing: true,
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
      primary: {
        name: 'Black',
        hex: '#000000',
        family: ColorFamily.BLACK
      }
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
    condition: ItemCondition.GOOD,
    materials: ['Leather', 'Synthetic'],
    careInstructions: ['Wipe clean with damp cloth'],
    retailValue: 90,
    currentValue: 65,
    tags: ['classic', 'heels'],
    notes: 'Comfortable heels for all-day wear',
    wearCount: 20,
    lastWorn: new Date('2024-07-18'),
    visibility: Visibility.FRIENDS,
    allowSharing: true,
    isActive: true,
    isFavorite: true,
    createdAt: new Date('2023-12-01'),
    updatedAt: new Date('2024-07-18'),
  },
];

// Mock outfits with enhanced structure
export const mockOutfits: Outfit[] = [
  {
    id: '1',
    userId: '1',
    name: 'Professional Monday',
    items: [
      {
        itemId: '1',
        role: ItemRole.OUTERWEAR,
        item: mockClothingItems.find(item => item.id === '1')
      },
      {
        itemId: '2',
        role: ItemRole.TOP,
        item: mockClothingItems.find(item => item.id === '2')
      },
      {
        itemId: '3',
        role: ItemRole.BOTTOM,
        item: mockClothingItems.find(item => item.id === '3')
      },
      {
        itemId: '5',
        role: ItemRole.SHOES,
        item: mockClothingItems.find(item => item.id === '5')
      }
    ],
    occasion: Occasion.WORK,
    season: Season.FALL,
    weather: WeatherCondition.MILD,
    tags: ['professional', 'meeting-ready'],
    inspirationSource: 'User Created',
    rating: 4.5,
    notes: 'Perfect for important meetings',
    image: 'https://via.placeholder.com/400x600/333333/FFFFFF?text=Professional+Outfit',
    layoutImage: 'https://via.placeholder.com/600x800/333333/FFFFFF?text=Outfit+Layout',
    wearCount: 10,
    lastWorn: new Date('2024-07-22'),
    plannedWearDate: new Date('2024-08-05'),
    visibility: Visibility.FRIENDS,
    allowSharing: true,
    likes: 8,
    shares: 2,
    isAIGenerated: false,
    isFavorite: true,
    isArchived: false,
    createdAt: new Date('2024-05-01'),
    updatedAt: new Date('2024-07-22'),
  },
  {
    id: '2',
    userId: '1',
    name: 'Summer Brunch',
    items: [
      {
        itemId: '4',
        role: ItemRole.DRESS,
        item: mockClothingItems.find(item => item.id === '4')
      }
    ],
    occasion: Occasion.CASUAL,
    season: Season.SUMMER,
    weather: WeatherCondition.SUNNY,
    tags: ['casual', 'brunch', 'summer'],
    inspirationSource: 'AI Generated',
    rating: 5,
    notes: 'Light and comfortable for warm days',
    image: 'https://via.placeholder.com/400x600/FFE4E1/000000?text=Summer+Outfit',
    layoutImage: 'https://via.placeholder.com/600x800/FFE4E1/000000?text=Summer+Layout',
    wearCount: 5,
    lastWorn: new Date('2024-07-15'),
    visibility: Visibility.PUBLIC,
    allowSharing: true,
    likes: 12,
    shares: 5,
    isAIGenerated: true,
    isFavorite: false,
    isArchived: false,
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-07-15'),
  },
];

// Mock outfit recommendations
export const mockRecommendations = [
  {
    id: 'rec1',
    userId: '1',
    outfit: {
      id: 'temp-rec-1',
      userId: '1',
      name: 'Work Presentation Look',
      items: [
        {
          itemId: '1',
          role: ItemRole.OUTERWEAR,
          item: mockClothingItems.find(item => item.id === '1')
        },
        {
          itemId: '2',
          role: ItemRole.TOP,
          item: mockClothingItems.find(item => item.id === '2')
        },
        {
          itemId: '3',
          role: ItemRole.BOTTOM,
          item: mockClothingItems.find(item => item.id === '3')
        }
      ],
      occasion: Occasion.WORK,
      season: Season.FALL,
      tags: ['professional', 'presentation'],
      wearCount: 0,
      visibility: Visibility.PRIVATE,
      allowSharing: false,
      isAIGenerated: true,
      isFavorite: false,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    reason: 'Perfect for your upcoming work presentation. Classic and professional.',
    score: 0.92,
    context: {
      occasion: Occasion.WORK,
      weather: WeatherCondition.MILD,
      season: Season.FALL,
      event: 'Work Presentation'
    },
    createdAt: new Date(),
  },
  {
    id: 'rec2',
    userId: '1',
    outfit: {
      id: 'temp-rec-2',
      userId: '1',
      name: 'Weekend Casual',
      items: [
        {
          itemId: '4',
          role: ItemRole.DRESS,
          item: mockClothingItems.find(item => item.id === '4')
        }
      ],
      occasion: Occasion.CASUAL,
      season: Season.SUMMER,
      tags: ['weekend', 'casual'],
      wearCount: 0,
      visibility: Visibility.PRIVATE,
      allowSharing: false,
      isAIGenerated: true,
      isFavorite: false,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    reason: 'Great for the sunny weather forecast this weekend.',
    score: 0.88,
    context: {
      occasion: Occasion.CASUAL,
      weather: WeatherCondition.SUNNY,
      season: Season.SUMMER,
      event: 'Weekend Outing'
    },
    createdAt: new Date(),
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
  
  if (params?.occasion) {
    outfits = outfits.filter(outfit => outfit.occasion === params.occasion);
  }
  
  if (params?.season) {
    outfits = outfits.filter(outfit => outfit.season === params.season);
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