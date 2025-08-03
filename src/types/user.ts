import { Visibility } from './clothing';

export interface SizingInfo {
  topSize?: string;
  bottomSize?: string;
  dressSize?: string;
  shoeSize?: string;
  measurements?: {
    bust?: number;
    waist?: number;
    hips?: number;
    inseam?: number;
    height?: number;
    weight?: number;
  };
}

export interface UserPreferences {
  stylePersonality: string[];
  favoriteColors: string[];
  sizingInfo: SizingInfo;
  occasionPreferences: string[];
}

export interface PrivacySettings {
  profileVisibility: Visibility;
  wardrobeVisibility: Visibility;
  outfitsVisibility: Visibility;
  analyticsVisibility: Visibility;
  allowFriendRequests: boolean;
  allowMessages: boolean;
}

export interface User {
  id: string;
  email: string;
  username?: string;  // For social features
  firstName: string;
  lastName: string;
  profileImage?: string;
  bio?: string;
  location?: string;
  preferences: UserPreferences;
  privacy: PrivacySettings;
  isActive: boolean;
  isVerified: boolean;
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Extended user profile with subscription info
export interface UserProfile extends User {
  subscription: {
    plan: 'free' | 'premium';
    tryOnsRemaining?: number;
    tryOnsResetDate?: string;
    expiresAt?: string;
    features: string[];
  };
  stats: {
    itemsCount: number;
    outfitsCount: number;
    tryOnsCount: number;
    tryOnsThisMonth: number;
    friendsCount: number;
    followersCount: number;
    followingCount: number;
  };
  achievements?: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  progress?: {
    current: number;
    target: number;
  };
}

// Social features
export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserActivity {
  id: string;
  userId: string;
  type: 'added_item' | 'created_outfit' | 'shared_item' | 'liked_outfit' | 'commented';
  entityType: 'clothing' | 'outfit';
  entityId: string;
  metadata?: any;
  isPublic: boolean;
  createdAt: Date;
}