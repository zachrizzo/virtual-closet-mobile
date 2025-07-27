import { Season, Occasion } from './clothing';

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

export interface Outfit {
  id: string;
  userId: string;
  name: string;
  itemIds: string[];
  items?: any[]; // Will be populated with ClothingItem objects
  occasion?: Occasion;
  season?: Season;
  weather?: WeatherCondition;
  rating?: number;
  notes?: string;
  image?: string;
  wearCount: number;
  lastWorn?: Date;
  isAIGenerated: boolean;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}