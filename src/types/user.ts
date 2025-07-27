export interface SizingInfo {
  topSize?: string;
  bottomSize?: string;
  dressSize?: string;
  shoeSize?: string;
  measurements?: Record<string, number>;
}

export interface UserPreferences {
  stylePersonality: string[];
  favoriteColors: string[];
  sizingInfo: SizingInfo;
  occasionPreferences: string[];
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  preferences: UserPreferences;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}