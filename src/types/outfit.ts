import { Season, Occasion, ClothingItem, Visibility } from './clothing';

export enum WeatherCondition {
  SUNNY = 'sunny',
  CLOUDY = 'cloudy',
  RAINY = 'rainy',
  SNOWY = 'snowy',
  WINDY = 'windy',
  HOT = 'hot',
  COLD = 'cold',
  MILD = 'mild',
}

export enum ItemRole {
  TOP = 'top',
  BOTTOM = 'bottom',
  DRESS = 'dress',
  OUTERWEAR = 'outerwear',
  SHOES = 'shoes',
  BAG = 'bag',
  ACCESSORY = 'accessory',
  JEWELRY = 'jewelry',
}

export interface OutfitItem {
  itemId: string;
  role: ItemRole;
  item?: ClothingItem; // Populated when fetched
}

export interface Outfit {
  id: string;
  userId: string;
  name: string;
  
  // Enhanced item structure
  items: OutfitItem[];
  
  // Context
  occasion?: Occasion;
  season?: Season;
  weather?: WeatherCondition;
  
  // Organization
  tags?: string[];
  inspirationSource?: string; // e.g., "Pinterest", "Magazine", "AI Generated"
  
  // User feedback
  rating?: number; // 1-5
  notes?: string;
  
  // Visuals
  image?: string;
  layoutImage?: string; // Composite image showing all items
  
  // Usage tracking
  wearCount: number;
  lastWorn?: Date;
  plannedWearDate?: Date;
  
  // Social features
  visibility?: Visibility;
  allowSharing?: boolean;
  likes?: number;
  shares?: number;
  
  // Metadata
  isAIGenerated: boolean;
  isFavorite: boolean;
  isArchived: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Virtual Try-On Enhanced
export interface VirtualTryOnRequest {
  clothingItemId: string;
  userPhotoId: string;
  options?: {
    fitAdjustment?: 'tight' | 'regular' | 'loose';
    lightingCondition?: 'natural' | 'indoor' | 'studio';
  };
}

export interface VirtualTryOnResult {
  id: string;
  userId: string;
  clothingItemId: string;
  userPhotoId: string;
  resultImageUrl: string;
  thumbnailUrl?: string;
  quality: 'high' | 'medium' | 'low';
  processingTime: number; // milliseconds
  feedback?: {
    rating: number;
    issues?: string[];
    comments?: string;
  };
  metadata?: {
    modelVersion: string;
    processingNode?: string;
  };
  createdAt: Date;
}

// AI Chat Enhanced
export interface AIMessage {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  metadata?: {
    suggestedOutfitIds?: string[];
    suggestedItemIds?: string[];
    intent?: string;
    confidence?: number;
    actionButtons?: Array<{
      label: string;
      action: string;
      data?: any;
    }>;
  };
}

// Outfit recommendations
export interface OutfitRecommendation {
  id: string;
  userId: string;
  outfit: Outfit;
  reason: string;
  score: number;
  context: {
    occasion?: Occasion;
    weather?: WeatherCondition;
    season?: Season;
    event?: string;
  };
  isAccepted?: boolean;
  feedback?: string;
  createdAt: Date;
}