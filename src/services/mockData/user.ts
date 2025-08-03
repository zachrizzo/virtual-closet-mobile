// Mock user profile and subscription data for MVP
import { SUBSCRIPTION_TIERS } from '@/config/environment';
import { UserProfile, PrivacySettings, UserPreferences, Achievement } from '../../types/user';
import { Visibility, ColorFamily } from '../../types/clothing';

// Mock user data with enhanced profile
let currentUser: UserProfile = {
  id: 'mock-user',
  email: 'user@example.com',
  username: 'fashionlover123',
  firstName: 'Fashion',
  lastName: 'Lover',
  profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e9?w=200&h=200&fit=crop&crop=face',
  bio: 'Style enthusiast and fashion lover. Always looking for the perfect outfit!',
  location: 'New York, NY',
  preferences: {
    stylePersonality: ['classic', 'modern', 'chic'],
    favoriteColors: ['black', 'white', 'navy', 'beige'],
    sizingInfo: {
      topSize: 'M',
      bottomSize: '32',
      dressSize: 'S',
      shoeSize: '8',
      measurements: {
        bust: 34,
        waist: 28,
        hips: 36,
        inseam: 32,
        height: 65, // inches
        weight: 130, // lbs
      },
    },
    occasionPreferences: ['work', 'casual', 'date'],
  },
  privacy: {
    profileVisibility: Visibility.FRIENDS,
    wardrobeVisibility: Visibility.PRIVATE,
    outfitsVisibility: Visibility.FRIENDS,
    analyticsVisibility: Visibility.PRIVATE,
    allowFriendRequests: true,
    allowMessages: true,
  },
  isActive: true,
  isVerified: false,
  isPremium: false,
  subscription: {
    plan: 'free',
    tryOnsRemaining: 3,
    tryOnsResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    features: ['basic_wardrobe', 'limited_tryon'],
  },
  stats: {
    itemsCount: 5,
    outfitsCount: 2,
    tryOnsCount: 12,
    tryOnsThisMonth: 2,
    friendsCount: 8,
    followersCount: 15,
    followingCount: 12,
  },
  achievements: [
    {
      id: 'first_item',
      name: 'First Steps',
      description: 'Added your first clothing item',
      icon: '👗',
      unlockedAt: new Date('2024-01-15'),
    },
    {
      id: 'outfit_creator',
      name: 'Outfit Creator',
      description: 'Created your first outfit',
      icon: '✨',
      unlockedAt: new Date('2024-02-01'),
    },
    {
      id: 'wardrobe_builder',
      name: 'Wardrobe Builder',
      description: 'Added 5 items to your wardrobe',
      icon: '🏆',
      unlockedAt: new Date('2024-03-10'),
      progress: {
        current: 5,
        target: 5,
      },
    },
  ],
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-07-30T10:30:00Z'),
};

export const mockUser = {
  // Get current user profile
  getProfile: async (): Promise<UserProfile> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return currentUser;
  },
  
  // Update profile
  updateProfile: async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    currentUser = {
      ...currentUser,
      ...updates,
      // Don't allow updating certain fields
      id: currentUser.id,
      createdAt: currentUser.createdAt,
      updatedAt: new Date(),
    };
    
    return currentUser;
  },
  
  // Update privacy settings
  updatePrivacySettings: async (privacy: Partial<PrivacySettings>): Promise<UserProfile> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    currentUser.privacy = {
      ...currentUser.privacy,
      ...privacy,
    };
    currentUser.updatedAt = new Date();
    
    return currentUser;
  },
  
  // Update preferences
  updatePreferences: async (preferences: Partial<UserPreferences>): Promise<UserProfile> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    currentUser.preferences = {
      ...currentUser.preferences,
      ...preferences,
    };
    currentUser.updatedAt = new Date();
    
    return currentUser;
  },
  
  // Add achievement
  addAchievement: async (achievement: Achievement): Promise<UserProfile> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (!currentUser.achievements) {
      currentUser.achievements = [];
    }
    
    // Check if achievement already exists
    const existingIndex = currentUser.achievements.findIndex(a => a.id === achievement.id);
    if (existingIndex === -1) {
      currentUser.achievements.push(achievement);
      currentUser.updatedAt = new Date();
    }
    
    return currentUser;
  },
  
  // Subscribe to premium
  subscribeToPremium: async (): Promise<UserProfile> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    currentUser.subscription = {
      plan: 'premium',
      features: ['unlimited_wardrobe', 'unlimited_tryon', 'advanced_analytics', 'social_features'],
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
    };
    currentUser.isPremium = true;
    currentUser.updatedAt = new Date();
    
    return currentUser;
  },
  
  // Cancel subscription
  cancelSubscription: async (): Promise<UserProfile> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const daysRemaining = currentUser.subscription.expiresAt 
      ? Math.floor((new Date(currentUser.subscription.expiresAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
      : 0;
    
    currentUser.subscription = {
      plan: 'free',
      tryOnsRemaining: SUBSCRIPTION_TIERS.FREE.tryOnsPerMonth,
      tryOnsResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      features: ['basic_wardrobe', 'limited_tryon'],
    };
    currentUser.isPremium = false;
    currentUser.updatedAt = new Date();
    
    return currentUser;
  },
  
  // Use a try-on (decrements counter for free users)
  useTryOn: async (): Promise<{ allowed: boolean; remaining?: number }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (currentUser.subscription.plan === 'premium') {
      currentUser.stats.tryOnsCount++;
      currentUser.stats.tryOnsThisMonth++;
      return { allowed: true };
    }
    
    // Free user
    if (currentUser.subscription.tryOnsRemaining! > 0) {
      currentUser.subscription.tryOnsRemaining!--;
      currentUser.stats.tryOnsCount++;
      currentUser.stats.tryOnsThisMonth++;
      return { allowed: true, remaining: currentUser.subscription.tryOnsRemaining };
    }
    
    return { allowed: false, remaining: 0 };
  },
  
  // Check if user can try on
  canTryOn: async (): Promise<{ allowed: boolean; remaining?: number }> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (currentUser.subscription.plan === 'premium') {
      return { allowed: true };
    }
    
    return { 
      allowed: currentUser.subscription.tryOnsRemaining! > 0,
      remaining: currentUser.subscription.tryOnsRemaining,
    };
  },
  
  // Update stats
  updateStats: async (stats: Partial<UserProfile['stats']>): Promise<void> => {
    currentUser.stats = {
      ...currentUser.stats,
      ...stats,
    };
    currentUser.updatedAt = new Date();
  },
  
  // Reset to default (for demo)
  reset: async (): Promise<void> => {
    currentUser = {
      id: 'mock-user',
      email: 'user@example.com',
      username: 'fashionlover123',
      firstName: 'Fashion',
      lastName: 'Lover',
      profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e9?w=200&h=200&fit=crop&crop=face',
      bio: 'Style enthusiast and fashion lover. Always looking for the perfect outfit!',
      location: 'New York, NY',
      preferences: {
        stylePersonality: ['classic', 'modern', 'chic'],
        favoriteColors: ['black', 'white', 'navy', 'beige'],
        sizingInfo: {
          topSize: 'M',
          bottomSize: '32',
          dressSize: 'S',
          shoeSize: '8',
          measurements: {
            bust: 34,
            waist: 28,
            hips: 36,
            inseam: 32,
            height: 65,
            weight: 130,
          },
        },
        occasionPreferences: ['work', 'casual', 'date'],
      },
      privacy: {
        profileVisibility: Visibility.FRIENDS,
        wardrobeVisibility: Visibility.PRIVATE,
        outfitsVisibility: Visibility.FRIENDS,
        analyticsVisibility: Visibility.PRIVATE,
        allowFriendRequests: true,
        allowMessages: true,
      },
      isActive: true,
      isVerified: false,
      isPremium: false,
      subscription: {
        plan: 'free',
        tryOnsRemaining: 3,
        tryOnsResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        features: ['basic_wardrobe', 'limited_tryon'],
      },
      stats: {
        itemsCount: 5,
        outfitsCount: 2,
        tryOnsCount: 12,
        tryOnsThisMonth: 2,
        friendsCount: 8,
        followersCount: 15,
        followingCount: 12,
      },
      achievements: [
        {
          id: 'first_item',
          name: 'First Steps',
          description: 'Added your first clothing item',
          icon: '👗',
          unlockedAt: new Date('2024-01-15'),
        },
        {
          id: 'outfit_creator',
          name: 'Outfit Creator',
          description: 'Created your first outfit',
          icon: '✨',
          unlockedAt: new Date('2024-02-01'),
        },
        {
          id: 'wardrobe_builder',
          name: 'Wardrobe Builder',
          description: 'Added 5 items to your wardrobe',
          icon: '🏆',
          unlockedAt: new Date('2024-03-10'),
          progress: {
            current: 5,
            target: 5,
          },
        },
      ],
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-07-30T10:30:00Z'),
    };
  },
};