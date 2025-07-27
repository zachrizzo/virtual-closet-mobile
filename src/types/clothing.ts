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

export interface ColorInfo {
  primary: string;
  secondary?: string[];
}

export interface ImageInfo {
  original: string;
  processed?: string;
  thumbnail?: string;
}

export interface ClothingItem {
  id: string;
  userId: string;
  name: string;
  category: ClothingCategory;
  subcategory?: string;
  brand?: string;
  color: ColorInfo;
  season: Season[];
  occasion: Occasion[];
  size?: string;
  purchaseDate?: Date;
  cost?: number;
  images: ImageInfo;
  tags: string[];
  wearCount: number;
  lastWorn?: Date;
  isActive: boolean;
  isFavorite: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}