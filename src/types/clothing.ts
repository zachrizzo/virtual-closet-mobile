export enum ClothingCategory {
  TOPS = 'tops',
  BOTTOMS = 'bottoms',
  DRESSES = 'dresses',
  OUTERWEAR = 'outerwear',
  SHOES = 'shoes',
  ACCESSORIES = 'accessories',
  BAGS = 'bags',
  JEWELRY = 'jewelry',
}

export enum Season {
  SPRING = 'spring',
  SUMMER = 'summer',
  FALL = 'fall',
  WINTER = 'winter',
  ALL_SEASON = 'all_season',
}

export enum Occasion {
  CASUAL = 'casual',
  WORK = 'work',
  FORMAL = 'formal',
  PARTY = 'party',
  DATE = 'date',
  ATHLETIC = 'athletic',
  LOUNGE = 'lounge',
  VACATION = 'vacation',
}

export enum ItemCondition {
  NEW = 'new',
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
}

export enum ColorFamily {
  RED = 'red',
  ORANGE = 'orange',
  YELLOW = 'yellow',
  GREEN = 'green',
  BLUE = 'blue',
  PURPLE = 'purple',
  PINK = 'pink',
  BROWN = 'brown',
  GRAY = 'gray',
  BLACK = 'black',
  WHITE = 'white',
  BEIGE = 'beige',
  MULTICOLOR = 'multicolor',
}

export enum Visibility {
  PRIVATE = 'private',
  FRIENDS = 'friends',
  PUBLIC = 'public',
}

export interface Color {
  name: string;        // e.g., "Navy Blue"
  hex?: string;        // e.g., "#000080"
  family: ColorFamily; // e.g., "blue"
}

export interface ColorInfo {
  primary: Color;
  secondary?: Color[];
}

export interface ImageInfo {
  original: string;
  processed?: string;
  thumbnail?: string;
}

export interface ClothingItem {
  // Core fields
  id: string;
  userId: string;
  name: string;
  category: ClothingCategory;
  subcategory?: string;
  
  // Details
  brand?: string;
  color: ColorInfo;
  season: Season[];
  occasion: Occasion[];
  size?: string;
  
  // Condition & Care
  condition?: ItemCondition;
  materials?: string[];
  careInstructions?: string[];
  
  // Financial
  purchaseDate?: Date;
  cost?: number;
  retailValue?: number;
  currentValue?: number;
  
  // Images
  images: ImageInfo;
  
  // Organization
  tags: string[];
  notes?: string;
  
  // Usage tracking
  wearCount: number;
  lastWorn?: Date;
  
  // Social features
  visibility?: Visibility;
  allowSharing?: boolean;
  
  // Status
  isActive: boolean;
  isFavorite: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Analytics type
export interface WardrobeAnalytics {
  userId: string;
  totalItems: number;
  totalValue: number;
  mostWornItems: Array<{
    itemId: string;
    wearCount: number;
  }>;
  leastWornItems: Array<{
    itemId: string;
    wearCount: number;
  }>;
  costPerWear: { [itemId: string]: number };
  favoriteColors: Array<{
    color: ColorFamily;
    count: number;
  }>;
  favoriteBrands: Array<{
    brand: string;
    count: number;
  }>;
  seasonalDistribution: { [key in Season]: number };
  categoryDistribution: { [key in ClothingCategory]: number };
  lastUpdated: Date;
}

// Wishlist type
export interface WishlistItem {
  id: string;
  userId: string;
  name: string;
  category?: ClothingCategory;
  brand?: string;
  targetPrice?: number;
  currentPrice?: number;
  productUrl?: string;
  imageUrl?: string;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
  addedAt: Date;
  updatedAt: Date;
}