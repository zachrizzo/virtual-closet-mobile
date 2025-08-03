// Mock wardrobe data for MVP
import { ClothingItem, ClothingCategory, Season, Occasion, ItemCondition, ColorFamily, Visibility } from '../../types/clothing';

// Enhanced mock wardrobe items - using Unsplash for images
const mockItems: ClothingItem[] = [
  {
    id: '1',
    userId: 'mock-user',
    name: 'White T-Shirt',
    category: ClothingCategory.TOPS,
    subcategory: 'basic-tee',
    brand: 'Uniqlo',
    color: {
      primary: {
        name: 'White',
        hex: '#FFFFFF',
        family: ColorFamily.WHITE
      }
    },
    season: [Season.ALL_SEASON],
    occasion: [Occasion.CASUAL, Occasion.LOUNGE],
    size: 'M',
    condition: ItemCondition.GOOD,
    materials: ['100% Cotton'],
    careInstructions: ['Machine wash cold', 'Tumble dry low'],
    purchaseDate: new Date('2024-01-15'),
    cost: 15,
    retailValue: 15,
    currentValue: 12,
    images: {
      original: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=600&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=300&fit=crop',
    },
    tags: ['basic', 'essential', 'versatile'],
    notes: 'Perfect basic white tee, goes with everything',
    wearCount: 25,
    lastWorn: new Date('2024-07-25'),
    visibility: Visibility.PRIVATE,
    allowSharing: true,
    isActive: true,
    isFavorite: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-07-25'),
  },
  {
    id: '2',
    userId: 'mock-user',
    name: 'Blue Jeans',
    category: ClothingCategory.BOTTOMS,
    subcategory: 'straight-jeans',
    brand: 'Levi\'s',
    color: {
      primary: {
        name: 'Indigo Blue',
        hex: '#4B0082',
        family: ColorFamily.BLUE
      }
    },
    season: [Season.ALL_SEASON],
    occasion: [Occasion.CASUAL, Occasion.DATE],
    size: '32x34',
    condition: ItemCondition.EXCELLENT,
    materials: ['98% Cotton', '2% Elastane'],
    careInstructions: ['Machine wash cold', 'Hang dry'],
    purchaseDate: new Date('2023-10-20'),
    cost: 89,
    retailValue: 89,
    currentValue: 65,
    images: {
      original: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=400&h=600&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=200&h=300&fit=crop',
    },
    tags: ['classic', 'denim', 'comfortable'],
    notes: 'Great fit, very comfortable for daily wear',
    wearCount: 35,
    lastWorn: new Date('2024-07-28'),
    visibility: Visibility.FRIENDS,
    allowSharing: true,
    isActive: true,
    isFavorite: true,
    createdAt: new Date('2023-10-20'),
    updatedAt: new Date('2024-07-28'),
  },
  {
    id: '3',
    userId: 'mock-user',
    name: 'Black Dress',
    category: ClothingCategory.DRESSES,
    subcategory: 'little-black-dress',
    brand: 'Zara',
    color: {
      primary: {
        name: 'Black',
        hex: '#000000',
        family: ColorFamily.BLACK
      }
    },
    season: [Season.ALL_SEASON],
    occasion: [Occasion.FORMAL, Occasion.PARTY, Occasion.DATE],
    size: 'S',
    condition: ItemCondition.EXCELLENT,
    materials: ['95% Polyester', '5% Elastane'],
    careInstructions: ['Dry clean only'],
    purchaseDate: new Date('2024-03-10'),
    cost: 65,
    retailValue: 65,
    currentValue: 50,
    images: {
      original: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=600&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&h=300&fit=crop',
    },
    tags: ['elegant', 'versatile', 'special-occasion'],
    notes: 'Perfect LBD for any formal event',
    wearCount: 8,
    lastWorn: new Date('2024-07-15'),
    visibility: Visibility.PUBLIC,
    allowSharing: true,
    isActive: true,
    isFavorite: true,
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-07-15'),
  },
  {
    id: '4',
    userId: 'mock-user',
    name: 'Denim Jacket',
    category: ClothingCategory.OUTERWEAR,
    subcategory: 'denim-jacket',
    brand: 'Gap',
    color: {
      primary: {
        name: 'Medium Blue',
        hex: '#0066CC',
        family: ColorFamily.BLUE
      }
    },
    season: [Season.SPRING, Season.FALL],
    occasion: [Occasion.CASUAL, Occasion.DATE],
    size: 'M',
    condition: ItemCondition.GOOD,
    materials: ['100% Cotton'],
    careInstructions: ['Machine wash cold', 'Hang dry'],
    purchaseDate: new Date('2023-05-15'),
    cost: 55,
    retailValue: 55,
    currentValue: 35,
    images: {
      original: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=600&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=200&h=300&fit=crop',
    },
    tags: ['layering', 'classic', 'casual'],
    notes: 'Great for layering, classic style',
    wearCount: 15,
    lastWorn: new Date('2024-07-10'),
    visibility: Visibility.FRIENDS,
    allowSharing: true,
    isActive: true,
    isFavorite: false,
    createdAt: new Date('2023-05-15'),
    updatedAt: new Date('2024-07-10'),
  },
  {
    id: '5',
    userId: 'mock-user',
    name: 'Striped Shirt',
    category: ClothingCategory.TOPS,
    subcategory: 'striped-shirt',
    brand: 'J.Crew',
    color: {
      primary: {
        name: 'Navy Blue',
        hex: '#000080',
        family: ColorFamily.BLUE
      },
      secondary: [{
        name: 'White',
        hex: '#FFFFFF',
        family: ColorFamily.WHITE
      }]
    },
    season: [Season.SPRING, Season.SUMMER, Season.FALL],
    occasion: [Occasion.CASUAL, Occasion.WORK],
    size: 'M',
    condition: ItemCondition.EXCELLENT,
    materials: ['100% Cotton'],
    careInstructions: ['Machine wash cold', 'Tumble dry low'],
    purchaseDate: new Date('2024-02-28'),
    cost: 48,
    retailValue: 48,
    currentValue: 40,
    images: {
      original: 'https://images.unsplash.com/photo-1588117305388-c2631a279f82?w=400&h=600&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1588117305388-c2631a279f82?w=200&h=300&fit=crop',
    },
    tags: ['nautical', 'professional', 'timeless'],
    notes: 'Classic navy stripes, works for both casual and professional settings',
    wearCount: 18,
    lastWorn: new Date('2024-07-22'),
    visibility: Visibility.PRIVATE,
    allowSharing: false,
    isActive: true,
    isFavorite: false,
    createdAt: new Date('2024-02-28'),
    updatedAt: new Date('2024-07-22'),
  },
];

// Mock storage in memory
let wardrobeItems = [...mockItems];

export const mockWardrobe = {
  // Get all items for the user
  getItems: async (): Promise<ClothingItem[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return wardrobeItems;
  },

  // Get single item
  getItem: async (id: string): Promise<ClothingItem | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return wardrobeItems.find(item => item.id === id) || null;
  },

  // Add new item
  addItem: async (item: Partial<ClothingItem>): Promise<ClothingItem> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newItem: ClothingItem = {
      id: Date.now().toString(),
      userId: 'mock-user',
      name: item.name || 'New Item',
      category: item.category || ClothingCategory.TOPS,
      color: item.color || {
        primary: {
          name: 'Unknown',
          family: ColorFamily.GRAY
        }
      },
      season: item.season || [Season.ALL_SEASON],
      occasion: item.occasion || [Occasion.CASUAL],
      images: item.images || {
        original: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=600&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200&h=300&fit=crop',
      },
      tags: item.tags || [],
      wearCount: 0,
      visibility: Visibility.PRIVATE,
      allowSharing: true,
      isActive: true,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    wardrobeItems.push(newItem);
    return newItem;
  },

  // Update item
  updateItem: async (id: string, updates: Partial<ClothingItem>): Promise<ClothingItem | null> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = wardrobeItems.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    wardrobeItems[index] = {
      ...wardrobeItems[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    return wardrobeItems[index];
  },

  // Delete item
  deleteItem: async (id: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = wardrobeItems.findIndex(item => item.id === id);
    if (index === -1) return false;
    
    wardrobeItems.splice(index, 1);
    return true;
  },

  // Upload image (mock - just returns a placeholder)
  uploadImage: async (itemId: string, imageData: any): Promise<{ original: string; thumbnail: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In real implementation, this would upload to storage
    // For mock, return a random fashion image
    const mockImages = [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1562572159-4efc207f5aff?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=600&fit=crop',
    ];
    
    const image = mockImages[Math.floor(Math.random() * mockImages.length)];
    
    return {
      original: image,
      thumbnail: image.replace('w=400&h=600', 'w=200&h=300'),
    };
  },

  // Reset to default items (useful for demo)
  reset: async (): Promise<void> => {
    wardrobeItems = [...mockItems];
  },
};