// This script creates placeholder images for mock clothing items
// In a real app, these would be actual photos of clothing

const mockClothingImages = {
  // Placeholder image URLs - you can replace these with actual images
  tops: [
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=600&fit=crop', // T-shirt
    'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=400&h=600&fit=crop', // Blouse
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=600&fit=crop', // Sweater
    'https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=400&h=600&fit=crop', // Shirt
    'https://images.unsplash.com/photo-1571455786673-9d9d6c194f90?w=400&h=600&fit=crop', // Tank top
  ],
  bottoms: [
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=600&fit=crop', // Jeans
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop', // Trousers
    'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&h=600&fit=crop', // Skirt
    'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=600&fit=crop', // Shorts
    'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=600&fit=crop', // Leggings
  ],
  dresses: [
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=600&fit=crop', // Casual dress
    'https://images.unsplash.com/photo-1566479179817-0ddb5fa87cd9?w=400&h=600&fit=crop', // Cocktail dress
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=600&fit=crop', // Maxi dress
  ],
  outerwear: [
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=600&fit=crop', // Blazer
    'https://images.unsplash.com/photo-1559551409-dadc959f76b8?w=400&h=600&fit=crop', // Jacket
    'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=600&fit=crop', // Coat
  ],
  shoes: [
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=600&fit=crop', // Sneakers
    'https://images.unsplash.com/photo-1566479117447-cafd7d0a6d1e?w=400&h=600&fit=crop', // Heels
    'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=400&h=600&fit=crop', // Boots
  ],
};

// Export for use in the app
export default mockClothingImages;

// If you have the test images provided by the user, you can save them as:
// assets/mock-clothing/test-image-1.jpg
// assets/mock-clothing/test-image-2.jpg
// assets/mock-clothing/test-image-3.jpg
// assets/mock-clothing/test-image-4.jpg

// Then update the mock data to use these local images:
const localMockImages = {
  tops: [
    require('../assets/mock-clothing/test-image-1.jpg'),
    require('../assets/mock-clothing/test-image-2.jpg'),
  ],
  bottoms: [
    require('../assets/mock-clothing/test-image-3.jpg'),
    require('../assets/mock-clothing/test-image-4.jpg'),
  ],
};