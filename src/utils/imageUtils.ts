// Utility function to get the proper image source for React Native Image component
export const getImageSource = (image: string | number | undefined | null) => {
  if (!image) {
    return { uri: '' };
  }
  
  // Handle numeric image IDs (local require() images)
  if (typeof image === 'number') {
    return image;
  }
  
  // Handle string URIs (URLs, data URIs, file paths)
  if (typeof image === 'string') {
    return { uri: image };
  }
  
  return { uri: '' };
};

// Get the best available image from clothing item
export const getClothingImage = (images: {
  original?: string | number;
  processed?: string | number;
  thumbnail?: string | number;
}) => {
  return images.thumbnail || images.processed || images.original;
};