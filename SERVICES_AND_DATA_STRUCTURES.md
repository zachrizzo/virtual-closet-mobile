# Virtual Closet - Services and Data Structures Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Enhanced Data Models](#enhanced-data-models)
3. [Services](#services)
4. [API Endpoints](#api-endpoints)
5. [Database Schema](#database-schema)

---

## Architecture Overview

The Virtual Closet app uses a **hybrid architecture** that supports both mock data (for development) and real API connections (for production).

### Key Architectural Components:
- **Unified API Service**: Central service layer that switches between mock/real data
- **Feature Flags**: Environment-based configuration for service selection
- **Data Transformation**: Automatic conversion between backend (snake_case) and frontend (camelCase)
- **Type Safety**: Comprehensive TypeScript interfaces
- **Social Features**: User interactions, sharing, and community features
- **Analytics Engine**: Comprehensive wardrobe and usage analytics
- **AI Recommendations**: Enhanced outfit suggestions and virtual try-on

### Current Implementation Status:
- ✅ Mock data fully implemented with all enhanced features
- ✅ Real API connection structure in place
- ✅ Enhanced data models with social, analytics, and advanced features
- ✅ Database schema planning complete
- ⚠️ Backend endpoints partially implemented
- 🔄 Database migrations need to be executed

---

## Enhanced Data Models

### 1. ClothingItem (Enhanced)

```typescript
interface ClothingItem {
  // Core fields
  id: string;                    // UUID
  userId: string;                // Foreign key to User
  name: string;                  // Required: Item name
  category: ClothingCategory;    // Required: Main category
  subcategory?: string;          // Optional: More specific category
  
  // Details
  brand?: string;                // Optional: Brand name
  color: ColorInfo;              // Enhanced color structure
  season: Season[];              // Multiple seasons allowed
  occasion: Occasion[];          // Multiple occasions allowed
  size?: string;                 // Optional: Size label
  
  // Condition & Care (NEW)
  condition?: ItemCondition;     // Item condition
  materials?: string[];          // Material composition
  careInstructions?: string[];   // Care instructions
  
  // Financial (Enhanced)
  purchaseDate?: Date;           // When item was purchased
  cost?: number;                 // Purchase price
  retailValue?: number;          // Original retail price
  currentValue?: number;         // Current estimated value
  
  // Images (Enhanced)
  images: ImageInfo;             // Structured image info
  
  // Organization
  tags: string[];                // User-defined tags
  notes?: string;                // User notes
  
  // Usage tracking
  wearCount: number;             // Times worn (default: 0)
  lastWorn?: Date;               // Last wear date
  
  // Social features (NEW)
  visibility?: Visibility;       // Privacy setting
  allowSharing?: boolean;        // Allow others to share
  
  // Status
  isActive: boolean;             // Active in wardrobe (default: true)
  isFavorite: boolean;           // Marked as favorite (default: false)
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

#### Enhanced Supporting Types:

```typescript
enum ClothingCategory {
  TOPS = 'tops',
  BOTTOMS = 'bottoms',
  DRESSES = 'dresses',
  OUTERWEAR = 'outerwear',
  SHOES = 'shoes',
  ACCESSORIES = 'accessories',
  BAGS = 'bags',
  JEWELRY = 'jewelry'
}

enum Season {
  SPRING = 'spring',
  SUMMER = 'summer',
  FALL = 'fall',
  WINTER = 'winter',
  ALL_SEASON = 'all_season'
}

enum Occasion {
  CASUAL = 'casual',
  WORK = 'work',
  FORMAL = 'formal',
  PARTY = 'party',
  DATE = 'date',
  ATHLETIC = 'athletic',
  LOUNGE = 'lounge',
  VACATION = 'vacation'
}

enum ItemCondition {
  NEW = 'new',
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor'
}

enum ColorFamily {
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
  MULTICOLOR = 'multicolor'
}

enum Visibility {
  PRIVATE = 'private',
  FRIENDS = 'friends',
  PUBLIC = 'public'
}

interface Color {
  name: string;        // e.g., "Navy Blue"
  hex?: string;        // e.g., "#000080"
  family: ColorFamily; // e.g., "blue"
}

interface ColorInfo {
  primary: Color;
  secondary?: Color[];
}

interface ImageInfo {
  original: string;
  processed?: string;
  thumbnail?: string;
}
```

### 2. User (Enhanced)

```typescript
interface User {
  // Primary Fields
  id: string;                    // UUID
  email: string;                 // Unique, used for login
  username?: string;             // For social features (NEW)
  
  // Personal Information
  firstName: string;
  lastName: string;
  profileImage?: string;         // Profile photo URL
  bio?: string;                  // User bio (NEW)
  location?: string;             // User location (NEW)
  
  // Style Preferences (Enhanced)
  preferences: UserPreferences;
  
  // Privacy Settings (NEW)
  privacy: PrivacySettings;
  
  // Account Status
  isActive: boolean;             // Account active (default: true)
  isVerified: boolean;           // Email verified (default: false)
  isPremium: boolean;            // Premium subscription status (NEW)
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

interface UserPreferences {
  stylePersonality: string[];     // e.g., ['classic', 'trendy', 'casual']
  favoriteColors: string[];       // Preferred color palette
  sizingInfo: SizingInfo;        // Enhanced sizing information
  occasionPreferences: string[]; // Frequently used occasions
}

interface SizingInfo {
  topSize?: string;              // e.g., 'M', 'L'
  bottomSize?: string;           // e.g., '32', '34'
  dressSize?: string;            // e.g., '8', '10'
  shoeSize?: string;             // e.g., '9', '10.5'
  measurements?: {               // Enhanced measurements (NEW)
    bust?: number;
    waist?: number;
    hips?: number;
    inseam?: number;
    height?: number;             // Height in inches
    weight?: number;             // Weight in lbs
  };
}

interface PrivacySettings {
  profileVisibility: Visibility;
  wardrobeVisibility: Visibility;
  outfitsVisibility: Visibility;
  analyticsVisibility: Visibility;
  allowFriendRequests: boolean;
  allowMessages: boolean;
}
```

### 3. UserProfile (Extended with Social & Analytics)

```typescript
interface UserProfile extends User {
  // Subscription Information (Enhanced)
  subscription: {
    plan: 'free' | 'premium';
    tryOnsRemaining?: number;    // For free tier (5/month)
    tryOnsResetDate?: string;    // When counter resets
    expiresAt?: string;          // Premium expiration
    features: string[];          // Available features
  };
  
  // Usage Statistics (Enhanced)
  stats: {
    itemsCount: number;          // Total wardrobe items
    outfitsCount: number;        // Total outfits created
    tryOnsCount: number;         // Total try-ons ever
    tryOnsThisMonth: number;     // Current month usage
    friendsCount: number;        // Number of friends (NEW)
    followersCount: number;      // Number of followers (NEW)
    followingCount: number;      // Number of people following (NEW)
  };
  
  // Achievements System (NEW)
  achievements?: Achievement[];
}

interface Achievement {
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
```

### 4. Outfit (Enhanced)

```typescript
interface Outfit {
  id: string;
  userId: string;
  name: string;
  
  // Enhanced item structure
  items: OutfitItem[];           // Structured item roles
  
  // Context
  occasion?: Occasion;
  season?: Season;
  weather?: WeatherCondition;    // Enhanced weather conditions
  
  // Organization (NEW)
  tags?: string[];               // Tags for organization
  inspirationSource?: string;    // e.g., "Pinterest", "Magazine", "AI Generated"
  
  // User feedback
  rating?: number;               // 1-5 star rating
  notes?: string;                // User notes
  
  // Visuals (Enhanced)
  image?: string;                // Outfit photo
  layoutImage?: string;          // Composite image showing all items
  
  // Usage tracking (Enhanced)
  wearCount: number;             // Times worn (default: 0)
  lastWorn?: Date;               // Last wear date
  plannedWearDate?: Date;        // Planned wear date (NEW)
  
  // Social features (NEW)
  visibility?: Visibility;       // Privacy setting
  allowSharing?: boolean;        // Allow others to share
  likes?: number;                // Number of likes
  shares?: number;               // Number of shares
  
  // Metadata (Enhanced)
  isAIGenerated: boolean;        // Created by AI (default: false)
  isFavorite: boolean;           // User favorite (default: false)
  isArchived: boolean;           // Archived status (NEW)
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

enum WeatherCondition {
  SUNNY = 'sunny',
  CLOUDY = 'cloudy',
  RAINY = 'rainy',
  SNOWY = 'snowy',
  WINDY = 'windy',
  HOT = 'hot',
  COLD = 'cold',
  MILD = 'mild'
}

enum ItemRole {
  TOP = 'top',
  BOTTOM = 'bottom',
  DRESS = 'dress',
  OUTERWEAR = 'outerwear',
  SHOES = 'shoes',
  BAG = 'bag',
  ACCESSORY = 'accessory',
  JEWELRY = 'jewelry'
}

interface OutfitItem {
  itemId: string;
  role: ItemRole;
  item?: ClothingItem; // Populated when fetched
}
```

### 5. VirtualTryOn (Enhanced)

```typescript
interface VirtualTryOnRequest {
  clothingItemId: string;
  userPhotoId: string;
  options?: {                    // Enhanced options (NEW)
    fitAdjustment?: 'tight' | 'regular' | 'loose';
    lightingCondition?: 'natural' | 'indoor' | 'studio';
  };
}

interface VirtualTryOnResult {
  id: string;
  userId: string;
  clothingItemId: string;
  userPhotoId: string;
  resultImageUrl: string;
  thumbnailUrl?: string;         // Thumbnail for quick loading (NEW)
  quality: 'high' | 'medium' | 'low'; // Result quality (NEW)
  processingTime: number;        // Processing time in milliseconds (NEW)
  
  feedback?: {                   // User feedback (NEW)
    rating: number;
    issues?: string[];
    comments?: string;
  };
  
  metadata?: {                   // Processing metadata (NEW)
    modelVersion: string;
    processingNode?: string;
  };
  
  createdAt: Date;
}
```

### 6. AI Chat (Enhanced)

```typescript
interface AIMessage {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  metadata?: {                   // Enhanced metadata
    suggestedOutfitIds?: string[];
    suggestedItemIds?: string[]; // Item suggestions (NEW)
    intent?: string;             // Detected user intent
    confidence?: number;         // Confidence score (NEW)
    actionButtons?: Array<{      // Interactive buttons (NEW)
      label: string;
      action: string;
      data?: any;
    }>;
  };
}
```

### 7. Analytics (NEW)

```typescript
interface WardrobeAnalytics {
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
```

### 8. Wishlist (NEW)

```typescript
interface WishlistItem {
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
```

### 9. Social Features (NEW)

```typescript
interface Friend {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: Date;
  updatedAt: Date;
}

interface UserActivity {
  id: string;
  userId: string;
  type: 'added_item' | 'created_outfit' | 'shared_item' | 'liked_outfit' | 'commented';
  entityType: 'clothing' | 'outfit';
  entityId: string;
  metadata?: any;
  isPublic: boolean;
  createdAt: Date;
}
```

### 10. Recommendations (Enhanced)

```typescript
interface OutfitRecommendation {
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
```

---

## Services

### 1. Authentication Service

**Purpose**: Handle user authentication and session management

#### Methods:
```typescript
interface AuthService {
  login(email: string, password: string): Promise<{
    access_token: string;
    refresh_token: string;
    user: User;
  }>;
  
  register(
    email: string, 
    password: string, 
    firstName?: string, 
    lastName?: string
  ): Promise<{
    access_token: string;
    refresh_token: string;
    user: User;
  }>;
  
  logout(): Promise<void>;
  
  refreshToken(refreshToken: string): Promise<{
    access_token: string;
    refresh_token: string;
  }>;
  
  isAuthenticated(): Promise<boolean>;
}
```

### 2. Wardrobe Service (Enhanced)

**Purpose**: Manage clothing items with analytics and social features

#### Methods:
```typescript
interface WardrobeService {
  // Read Operations
  getItems(filters?: {
    category?: ClothingCategory;
    season?: Season;
    occasion?: Occasion;
    isFavorite?: boolean;
    condition?: ItemCondition;
    brand?: string;
    visibility?: Visibility;
  }): Promise<ClothingItem[]>;
  
  getItem(id: string): Promise<ClothingItem | null>;
  
  // Analytics (NEW)
  getAnalytics(): Promise<WardrobeAnalytics>;
  
  // Write Operations
  addItem(item: Partial<ClothingItem>): Promise<ClothingItem>;
  
  updateItem(id: string, updates: Partial<ClothingItem>): Promise<ClothingItem>;
  
  deleteItem(id: string): Promise<boolean>;
  
  // Image Management (Enhanced)
  uploadImage(itemId: string, imageData: {
    uri: string;
    type: string;
    name: string;
  }): Promise<{ imageUrl: string }>;
  
  processImage(itemId: string): Promise<{ processedUrl: string }>;
  
  // Usage Tracking
  recordWear(itemId: string, date?: Date): Promise<void>;
  
  toggleFavorite(itemId: string): Promise<void>;
  
  // Social Features (NEW)
  shareItem(itemId: string, visibility: Visibility): Promise<void>;
  
  // Wishlist (NEW)
  addToWishlist(item: Partial<WishlistItem>): Promise<WishlistItem>;
  
  getWishlist(): Promise<WishlistItem[]>;
  
  removeFromWishlist(itemId: string): Promise<void>;
}
```

### 3. AI Chat Service (Enhanced)

**Purpose**: Provide AI-powered style recommendations and chat with enhanced features

#### Methods:
```typescript
interface AIChatService {
  sendMessage(message: string): Promise<{
    id: number;
    text: string;
    suggestedOutfitIds?: string[];
    suggestedItemIds?: string[];
    actionButtons?: Array<{
      label: string;
      action: string;
      data?: any;
    }>;
  }>;
  
  getHistory(): Promise<AIMessage[]>;
  
  clearHistory(): Promise<void>;
  
  // Enhanced Recommendations (NEW)
  getOutfitSuggestions(criteria: {
    occasion?: Occasion;
    weather?: WeatherCondition;
    season?: Season;
    event?: string;
    temperature?: number;
  }): Promise<OutfitRecommendation[]>;
  
  getStyleAdvice(outfitId: string): Promise<{
    advice: string;
    tips: string[];
    alternatives: string[];
  }>;
  
  submitFeedback(
    recommendationId: string, 
    isAccepted: boolean, 
    feedback?: string
  ): Promise<void>;
}
```

### 4. User Profile Service (Enhanced)

**Purpose**: Manage user profile, subscription, and social features

#### Methods:
```typescript
interface UserProfileService {
  getProfile(): Promise<UserProfile>;
  
  updateProfile(updates: Partial<User>): Promise<User>;
  
  updatePreferences(preferences: Partial<UserPreferences>): Promise<void>;
  
  updatePrivacySettings(privacy: Partial<PrivacySettings>): Promise<void>;
  
  // Subscription Management
  subscribeToPremium(): Promise<void>;
  
  cancelSubscription(): Promise<void>;
  
  // Try-On Management
  canTryOn(): Promise<boolean>;
  
  useTryOn(): Promise<{ allowed: boolean; remaining?: number }>;
  
  // Achievements (NEW)
  getAchievements(): Promise<Achievement[]>;
  
  unlockAchievement(achievementId: string): Promise<Achievement>;
  
  // Social Features (NEW)
  sendFriendRequest(userId: string): Promise<void>;
  
  acceptFriendRequest(requestId: string): Promise<void>;
  
  getFriends(): Promise<Friend[]>;
  
  getActivity(): Promise<UserActivity[]>;
  
  updateActivity(activity: Partial<UserActivity>): Promise<void>;
}
```

### 5. Virtual Try-On Service (Enhanced)

**Purpose**: Handle AI-powered virtual try-on functionality with advanced features

#### Methods:
```typescript
interface VirtualTryOnService {
  // User Photos
  uploadUserPhoto(photoData: {
    uri: string;
    type: string;
    name: string;
    label?: string;
  }): Promise<{ photoId: string }>;
  
  getUserPhotos(): Promise<Array<{
    id: string;
    url: string;
    label?: string;
    isDefault: boolean;
    createdAt: Date;
  }>>;
  
  deleteUserPhoto(photoId: string): Promise<void>;
  
  setDefaultPhoto(photoId: string): Promise<void>;
  
  // Try-On Processing (Enhanced)
  processTryOn(request: VirtualTryOnRequest): Promise<VirtualTryOnResult>;
  
  getTryOnHistory(): Promise<VirtualTryOnResult[]>;
  
  // Feedback (NEW)
  submitTryOnFeedback(
    resultId: string, 
    feedback: {
      rating: number;
      issues?: string[];
      comments?: string;
    }
  ): Promise<void>;
  
  // Quality Enhancement (NEW)
  enhanceResult(resultId: string): Promise<{ enhancedUrl: string }>;
}
```

### 6. Outfit Service (Enhanced)

**Purpose**: Manage outfits with social features and advanced organization

#### Methods:
```typescript
interface OutfitService {
  // CRUD Operations
  getOutfits(filters?: {
    occasion?: Occasion;
    season?: Season;
    weather?: WeatherCondition;
    isFavorite?: boolean;
    isArchived?: boolean;
    visibility?: Visibility;
  }): Promise<Outfit[]>;
  
  getOutfit(id: string): Promise<Outfit | null>;
  
  createOutfit(outfit: Partial<Outfit>): Promise<Outfit>;
  
  updateOutfit(id: string, updates: Partial<Outfit>): Promise<Outfit>;
  
  deleteOutfit(id: string): Promise<boolean>;
  
  // Advanced Features (NEW)
  duplicateOutfit(id: string): Promise<Outfit>;
  
  archiveOutfit(id: string): Promise<void>;
  
  scheduleOutfit(id: string, date: Date): Promise<void>;
  
  // Social Features (NEW)
  shareOutfit(id: string, visibility: Visibility): Promise<void>;
  
  likeOutfit(id: string): Promise<void>;
  
  // Analytics
  recordWear(id: string, date?: Date): Promise<void>;
  
  getOutfitAnalytics(): Promise<{
    totalOutfits: number;
    favoriteOccasions: Array<{ occasion: Occasion; count: number }>;
    wearFrequency: Array<{ outfitId: string; wearCount: number }>;
  }>;
}
```

---

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout

### User Profile (Enhanced)
- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update user profile
- `PUT /users/me/preferences` - Update style preferences
- `PUT /users/me/privacy` - Update privacy settings (NEW)
- `POST /users/me/subscription` - Subscribe to premium
- `DELETE /users/me/subscription` - Cancel subscription
- `GET /users/me/achievements` - Get user achievements (NEW)
- `POST /users/me/achievements/:id/unlock` - Unlock achievement (NEW)

### Social Features (NEW)
- `GET /users/me/friends` - Get friends list
- `POST /users/me/friends/request` - Send friend request
- `PUT /users/me/friends/:id/accept` - Accept friend request
- `DELETE /users/me/friends/:id` - Remove friend
- `GET /users/me/activity` - Get user activity feed
- `POST /users/me/activity` - Create activity entry

### Wardrobe (Enhanced)
- `GET /clothing` - Get all clothing items (with enhanced filters)
- `GET /clothing/:id` - Get single item
- `POST /clothing` - Create new item
- `PUT /clothing/:id` - Update item
- `DELETE /clothing/:id` - Delete item
- `POST /clothing/:id/upload-image` - Upload item image
- `POST /clothing/:id/process-image` - Process image with AI (NEW)
- `POST /clothing/:id/wear` - Record wear
- `PUT /clothing/:id/favorite` - Toggle favorite
- `PUT /clothing/:id/share` - Update sharing settings (NEW)

### Analytics (NEW)
- `GET /analytics/wardrobe` - Get wardrobe analytics
- `GET /analytics/outfits` - Get outfit analytics
- `GET /analytics/usage` - Get usage statistics

### Wishlist (NEW)
- `GET /wishlist` - Get wishlist items
- `POST /wishlist` - Add item to wishlist
- `PUT /wishlist/:id` - Update wishlist item
- `DELETE /wishlist/:id` - Remove from wishlist

### Outfits (Enhanced)
- `GET /outfits` - Get all outfits (with enhanced filters)
- `GET /outfits/:id` - Get single outfit
- `POST /outfits` - Create outfit
- `PUT /outfits/:id` - Update outfit
- `DELETE /outfits/:id` - Delete outfit
- `POST /outfits/:id/duplicate` - Duplicate outfit (NEW)
- `PUT /outfits/:id/archive` - Archive outfit (NEW)
- `POST /outfits/:id/schedule` - Schedule outfit (NEW)
- `PUT /outfits/:id/share` - Update sharing settings (NEW)
- `POST /outfits/:id/like` - Like outfit (NEW)

### AI Services (Enhanced)
- `POST /ai/chat` - Send chat message
- `GET /ai/chat/history` - Get chat history
- `DELETE /ai/chat/history` - Clear history
- `POST /ai/recommendations` - Get outfit recommendations (enhanced)
- `POST /ai/style-advice` - Get style advice for outfit (NEW)
- `POST /ai/occasion-outfits` - Get outfits for occasion (NEW)
- `POST /ai/weather-outfits` - Get weather-appropriate outfits (NEW)
- `POST /ai/recommendation-feedback` - Submit recommendation feedback (NEW)

### Virtual Try-On (Enhanced)
- `POST /ai/virtual-tryon` - Process try-on request
- `GET /ai/virtual-tryon/history` - Get try-on history
- `POST /ai/virtual-tryon/:id/feedback` - Submit try-on feedback (NEW)
- `POST /ai/virtual-tryon/:id/enhance` - Enhance result quality (NEW)
- `POST /users/me/photos` - Upload user photo
- `GET /users/me/photos` - Get user photos
- `DELETE /users/me/photos/:id` - Delete user photo
- `PUT /users/me/photos/:id/default` - Set default photo (NEW)

---

## Database Schema

### Core Tables

#### 1. `users` (Enhanced)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE,                    -- NEW: For social features
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    profile_image_url VARCHAR(500),
    bio TEXT,                                       -- NEW: User bio
    location VARCHAR(200),                          -- NEW: User location
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,               -- NEW: Premium status
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. `user_preferences` (Enhanced)
```sql
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    style_personality JSONB DEFAULT '[]',           -- Array of strings
    favorite_colors JSONB DEFAULT '[]',             -- Array of strings
    sizing_info JSONB DEFAULT '{}',                 -- Enhanced with measurements
    occasion_preferences JSONB DEFAULT '[]',        -- Array of strings
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. `user_privacy_settings` (NEW)
```sql
CREATE TABLE user_privacy_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    profile_visibility VARCHAR(20) DEFAULT 'friends' CHECK (profile_visibility IN ('private', 'friends', 'public')),
    wardrobe_visibility VARCHAR(20) DEFAULT 'private' CHECK (wardrobe_visibility IN ('private', 'friends', 'public')),
    outfits_visibility VARCHAR(20) DEFAULT 'friends' CHECK (outfits_visibility IN ('private', 'friends', 'public')),
    analytics_visibility VARCHAR(20) DEFAULT 'private' CHECK (analytics_visibility IN ('private', 'friends', 'public')),
    allow_friend_requests BOOLEAN DEFAULT true,
    allow_messages BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. `user_subscriptions` (Enhanced)
```sql
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
    try_ons_remaining INTEGER DEFAULT 5,
    try_ons_reset_date DATE,
    expires_at TIMESTAMP,
    features JSONB DEFAULT '["basic_wardrobe", "limited_tryon"]',  -- Available features
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 5. `clothing_items` (Enhanced)
```sql
CREATE TABLE clothing_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    subcategory VARCHAR(100),
    brand VARCHAR(100),
    color_info JSONB NOT NULL,                      -- Enhanced color structure
    seasons JSONB DEFAULT '[]',
    occasions JSONB DEFAULT '[]',
    size VARCHAR(50),
    condition VARCHAR(20) DEFAULT 'good',           -- NEW: Item condition
    materials JSONB DEFAULT '[]',                   -- NEW: Material composition
    care_instructions JSONB DEFAULT '[]',           -- NEW: Care instructions
    purchase_date DATE,
    cost DECIMAL(10,2),
    retail_value DECIMAL(10,2),                     -- NEW: Original retail price
    current_value DECIMAL(10,2),                    -- NEW: Current estimated value
    tags JSONB DEFAULT '[]',
    notes TEXT,
    wear_count INTEGER DEFAULT 0,
    last_worn DATE,
    visibility VARCHAR(20) DEFAULT 'private',       -- NEW: Privacy setting
    allow_sharing BOOLEAN DEFAULT true,             -- NEW: Sharing permission
    is_active BOOLEAN DEFAULT true,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 6. `clothing_images` (Enhanced)
```sql
CREATE TABLE clothing_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clothing_item_id UUID REFERENCES clothing_items(id) ON DELETE CASCADE,
    image_type VARCHAR(20) CHECK (image_type IN ('original', 'processed', 'thumbnail')),
    image_url VARCHAR(500) NOT NULL,
    file_size INTEGER,                              -- NEW: File size in bytes
    dimensions VARCHAR(20),                         -- NEW: Image dimensions (e.g., "400x600")
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 7. `outfits` (Enhanced)
```sql
CREATE TABLE outfits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    occasion VARCHAR(50),
    season VARCHAR(50),
    weather VARCHAR(50),
    tags JSONB DEFAULT '[]',                        -- NEW: Tags for organization
    inspiration_source VARCHAR(200),                -- NEW: Inspiration source
    rating DECIMAL(2,1) CHECK (rating >= 1 AND rating <= 5),
    notes TEXT,
    image_url VARCHAR(500),
    layout_image_url VARCHAR(500),                  -- NEW: Composite layout image
    wear_count INTEGER DEFAULT 0,
    last_worn DATE,
    planned_wear_date DATE,                         -- NEW: Planned wear date
    visibility VARCHAR(20) DEFAULT 'friends',       -- NEW: Privacy setting
    allow_sharing BOOLEAN DEFAULT true,             -- NEW: Sharing permission
    likes_count INTEGER DEFAULT 0,                  -- NEW: Social engagement
    shares_count INTEGER DEFAULT 0,                 -- NEW: Social engagement
    is_ai_generated BOOLEAN DEFAULT false,
    is_favorite BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,              -- NEW: Archive status
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 8. `outfit_items` (Enhanced Junction table)
```sql
CREATE TABLE outfit_items (
    outfit_id UUID REFERENCES outfits(id) ON DELETE CASCADE,
    clothing_item_id UUID REFERENCES clothing_items(id) ON DELETE CASCADE,
    item_role VARCHAR(20) NOT NULL,                 -- NEW: Item role in outfit
    position_order INTEGER DEFAULT 0,              -- NEW: Display order
    PRIMARY KEY (outfit_id, clothing_item_id)
);
```

### Social Features Tables (NEW)

#### 9. `user_friends`
```sql
CREATE TABLE user_friends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, friend_id)
);
```

#### 10. `user_activities`
```sql
CREATE TABLE user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(20) CHECK (entity_type IN ('clothing', 'outfit')),
    entity_id UUID NOT NULL,
    metadata JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 11. `user_achievements`
```sql
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id VARCHAR(100) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    icon VARCHAR(10),
    progress_current INTEGER DEFAULT 0,
    progress_target INTEGER,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Analytics Tables (NEW)

#### 12. `wardrobe_analytics`
```sql
CREATE TABLE wardrobe_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total_items INTEGER DEFAULT 0,
    total_value DECIMAL(12,2) DEFAULT 0,
    most_worn_items JSONB DEFAULT '[]',
    least_worn_items JSONB DEFAULT '[]',
    cost_per_wear JSONB DEFAULT '{}',
    favorite_colors JSONB DEFAULT '[]',
    favorite_brands JSONB DEFAULT '[]',
    seasonal_distribution JSONB DEFAULT '{}',
    category_distribution JSONB DEFAULT '{}',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 13. `outfit_analytics`
```sql
CREATE TABLE outfit_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total_outfits INTEGER DEFAULT 0,
    favorite_occasions JSONB DEFAULT '[]',
    wear_frequency JSONB DEFAULT '[]',
    seasonal_preferences JSONB DEFAULT '{}',
    style_evolution JSONB DEFAULT '[]',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Wishlist Tables (NEW)

#### 14. `wishlist_items`
```sql
CREATE TABLE wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50),
    brand VARCHAR(100),
    target_price DECIMAL(10,2),
    current_price DECIMAL(10,2),
    product_url VARCHAR(500),
    image_url VARCHAR(500),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    notes TEXT,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### AI and Virtual Try-On Tables (Enhanced)

#### 15. `ai_chat_messages` (Enhanced)
```sql
CREATE TABLE ai_chat_messages (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    is_user BOOLEAN NOT NULL,
    metadata JSONB DEFAULT '{}',                    -- Enhanced metadata
    intent VARCHAR(100),                            -- NEW: Detected intent
    confidence DECIMAL(3,2),                        -- NEW: Confidence score
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 16. `user_photos` (Enhanced)
```sql
CREATE TABLE user_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    photo_url VARCHAR(500) NOT NULL,
    label VARCHAR(100),                             -- NEW: Photo label
    is_default BOOLEAN DEFAULT false,               -- NEW: Default photo flag
    file_size INTEGER,                              -- NEW: File size
    dimensions VARCHAR(20),                         -- NEW: Image dimensions
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 17. `virtual_try_on_results` (Enhanced)
```sql
CREATE TABLE virtual_try_on_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    clothing_item_id UUID REFERENCES clothing_items(id) ON DELETE CASCADE,
    user_photo_id UUID REFERENCES user_photos(id) ON DELETE CASCADE,
    result_image_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),                     -- NEW: Thumbnail URL
    quality VARCHAR(20) DEFAULT 'medium',           -- NEW: Result quality
    processing_time INTEGER,                        -- NEW: Processing time (ms)
    feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),  -- NEW
    feedback_issues JSONB DEFAULT '[]',             -- NEW: Issues reported
    feedback_comments TEXT,                         -- NEW: User comments
    model_version VARCHAR(50),                      -- NEW: AI model version
    processing_node VARCHAR(100),                   -- NEW: Processing node
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 18. `outfit_recommendations` (NEW)
```sql
CREATE TABLE outfit_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    outfit_id UUID REFERENCES outfits(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    score DECIMAL(3,2) NOT NULL,
    context JSONB DEFAULT '{}',
    is_accepted BOOLEAN,
    user_feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Audit Tables (NEW)

#### 19. `audit_log`
```sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes for Performance

```sql
-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Clothing items indexes
CREATE INDEX idx_clothing_items_user_id ON clothing_items(user_id);
CREATE INDEX idx_clothing_items_category ON clothing_items(category);
CREATE INDEX idx_clothing_items_is_active ON clothing_items(is_active);
CREATE INDEX idx_clothing_items_visibility ON clothing_items(visibility);
CREATE INDEX idx_clothing_items_created_at ON clothing_items(created_at);
CREATE INDEX idx_clothing_items_wear_count ON clothing_items(wear_count);

-- Outfits indexes
CREATE INDEX idx_outfits_user_id ON outfits(user_id);
CREATE INDEX idx_outfits_occasion ON outfits(occasion);
CREATE INDEX idx_outfits_season ON outfits(season);
CREATE INDEX idx_outfits_is_archived ON outfits(is_archived);
CREATE INDEX idx_outfits_visibility ON outfits(visibility);
CREATE INDEX idx_outfits_created_at ON outfits(created_at);

-- Social features indexes
CREATE INDEX idx_user_friends_user_id ON user_friends(user_id);
CREATE INDEX idx_user_friends_friend_id ON user_friends(friend_id);
CREATE INDEX idx_user_friends_status ON user_friends(status);
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_is_public ON user_activities(is_public);

-- AI and try-on indexes
CREATE INDEX idx_ai_chat_messages_user_id ON ai_chat_messages(user_id);
CREATE INDEX idx_virtual_try_on_results_user_id ON virtual_try_on_results(user_id);
CREATE INDEX idx_virtual_try_on_results_created_at ON virtual_try_on_results(created_at);

-- Analytics indexes
CREATE INDEX idx_wardrobe_analytics_user_id ON wardrobe_analytics(user_id);
CREATE INDEX idx_outfit_analytics_user_id ON outfit_analytics(user_id);

-- Wishlist indexes
CREATE INDEX idx_wishlist_items_user_id ON wishlist_items(user_id);
CREATE INDEX idx_wishlist_items_priority ON wishlist_items(priority);

-- Composite indexes for common query patterns
CREATE INDEX idx_clothing_items_user_category ON clothing_items(user_id, category);
CREATE INDEX idx_clothing_items_user_favorite ON clothing_items(user_id, is_favorite);
CREATE INDEX idx_outfits_user_occasion ON outfits(user_id, occasion);
CREATE INDEX idx_outfits_user_favorite ON outfits(user_id, is_favorite);
```

### Constraints and Triggers

```sql
-- Ensure users can't friend themselves
ALTER TABLE user_friends ADD CONSTRAINT check_not_self_friend 
CHECK (user_id != friend_id);

-- Ensure positive values for financial fields
ALTER TABLE clothing_items ADD CONSTRAINT check_positive_cost 
CHECK (cost IS NULL OR cost >= 0);

ALTER TABLE clothing_items ADD CONSTRAINT check_positive_retail_value 
CHECK (retail_value IS NULL OR retail_value >= 0);

-- Trigger to update analytics when items are added/modified
CREATE OR REPLACE FUNCTION update_wardrobe_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update analytics when clothing items change
    INSERT INTO wardrobe_analytics (user_id, last_updated)
    VALUES (NEW.user_id, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id) DO UPDATE SET last_updated = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_wardrobe_analytics
    AFTER INSERT OR UPDATE ON clothing_items
    FOR EACH ROW EXECUTE FUNCTION update_wardrobe_analytics();

-- Trigger to update user stats
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- This would update user statistics in user_subscriptions table
    -- Implementation depends on specific requirements
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Database Views for Common Queries

```sql
-- View for user wardrobe summary
CREATE VIEW user_wardrobe_summary AS
SELECT 
    u.id as user_id,
    u.first_name,
    u.last_name,
    COUNT(ci.id) as total_items,
    COUNT(CASE WHEN ci.is_favorite THEN 1 END) as favorite_items,
    SUM(ci.cost) as total_spent,
    AVG(ci.wear_count) as avg_wear_count
FROM users u
LEFT JOIN clothing_items ci ON u.id = ci.user_id AND ci.is_active = true
GROUP BY u.id, u.first_name, u.last_name;

-- View for popular items across users
CREATE VIEW popular_items AS
SELECT 
    ci.name,
    ci.brand,
    ci.category,
    COUNT(*) as user_count,
    AVG(ci.wear_count) as avg_wear_count
FROM clothing_items ci
WHERE ci.is_active = true AND ci.visibility = 'public'
GROUP BY ci.name, ci.brand, ci.category
HAVING COUNT(*) > 1
ORDER BY user_count DESC, avg_wear_count DESC;
```

---

## Database Migration Strategy

### Phase 1: Core Tables
1. Create user-related tables (users, user_preferences, user_privacy_settings, user_subscriptions)
2. Create clothing and outfit tables with basic functionality
3. Test basic CRUD operations

### Phase 2: Enhanced Features
1. Add enhanced fields to existing tables (social features, analytics fields)
2. Create social feature tables (user_friends, user_activities, user_achievements)
3. Create analytics tables (wardrobe_analytics, outfit_analytics)

### Phase 3: Advanced Features
1. Create wishlist tables
2. Enhance AI and virtual try-on tables
3. Add audit logging and advanced constraints

### Phase 4: Performance Optimization
1. Add all indexes
2. Create views for common queries
3. Implement triggers for real-time analytics
4. Add partitioning for large tables if needed

---

## Data Migration Considerations

1. **Backup Strategy**: Full database backups before each migration phase
2. **Rollback Plan**: Script to revert each migration if issues occur
3. **Data Validation**: Scripts to verify data integrity after migration
4. **Performance Testing**: Benchmark queries before and after schema changes
5. **Zero-Downtime**: Use blue-green deployment for production migrations
6. **Gradual Rollout**: Feature flags to enable new functionality progressively

---

## Next Steps for Implementation

1. **Set up enhanced database**:
   - Execute migration scripts in phases
   - Set up proper connection pooling
   - Configure backup and monitoring

2. **Update backend models**:
   - Implement all enhanced Pydantic models
   - Add new service methods for social features and analytics
   - Update API endpoints with new functionality

3. **Frontend integration**:
   - Update TypeScript interfaces to match enhanced models
   - Implement new UI components for social features
   - Add analytics dashboards and visualization

4. **Testing strategy**:
   - Unit tests for all new database operations
   - Integration tests for enhanced API endpoints
   - Performance tests for analytics queries
   - User acceptance testing for social features

5. **Monitoring and analytics**:
   - Set up database performance monitoring
   - Implement application-level analytics
   - Create dashboards for system health and user engagement