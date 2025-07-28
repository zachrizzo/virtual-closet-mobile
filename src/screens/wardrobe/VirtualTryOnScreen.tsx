import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { Text, Button, IconButton, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Image } from 'expo-image';
import Slider from '@react-native-community/slider';

import { WardrobeStackParamList } from '@/navigation/TabNavigator';
import { useGetClothingItemQuery, useGenerateVirtualTryOnMutation, useGetClothingQuery } from '@/store/api/clothingApi';
import { useGetUserPhotosQuery } from '@/store/api/userApi';

type VirtualTryOnScreenNavigationProp = StackNavigationProp<WardrobeStackParamList, 'VirtualTryOn'>;
type VirtualTryOnScreenRouteProp = RouteProp<WardrobeStackParamList, 'VirtualTryOn'>;

interface Props {
  navigation: VirtualTryOnScreenNavigationProp;
  route: VirtualTryOnScreenRouteProp;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const VirtualTryOnScreen: React.FC<Props> = ({ navigation, route }) => {
  const { itemId: routeItemId, userPhotoId } = route.params || {};
  const [selectedItemId, setSelectedItemId] = useState<string | null>(routeItemId || null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [facing, setFacing] = useState<'back' | 'front'>('front');
  const [viewMode, setViewMode] = useState<'side-by-side' | 'overlay'>('side-by-side');
  const [overlayOpacity, setOverlayOpacity] = useState(0.5);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  
  const { data: allClothing = [] } = useGetClothingQuery({});
  const { data: clothingItem } = useGetClothingItemQuery(selectedItemId || '', {
    skip: !selectedItemId
  });
  const { data: userPhotos = [] } = useGetUserPhotosQuery();
  const [generateTryOn, { isLoading: isGenerating }] = useGenerateVirtualTryOnMutation();
  
  // Debug logging
  React.useEffect(() => {
    console.log('VirtualTryOnScreen - selectedItemId:', selectedItemId);
    console.log('VirtualTryOnScreen - clothingItem:', clothingItem);
    if (clothingItem) {
      console.log('VirtualTryOnScreen - images:', clothingItem.images);
    }
  }, [selectedItemId, clothingItem]);
  
  // If userPhotoId provided, use that photo
  React.useEffect(() => {
    if (userPhotoId && userPhotos.length > 0) {
      const photo = userPhotos.find(p => p.id === userPhotoId);
      if (photo) {
        setUserPhoto(photo.imageUrl);
      }
    }
  }, [userPhotoId, userPhotos]);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.9,
          base64: false,
        });
        
        if (photo) {
          setUserPhoto(photo.uri);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const pickImage = async () => {
    console.log('pickImage called on VirtualTryOnScreen');
    
    // Request permissions first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Gallery permission is required to select photos');
      return;
    }
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.9,
      });

      console.log('Image picker result:', result);
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUserPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image from gallery');
    }
  };

  const handleGenerateTryOn = async () => {
    if (!userPhoto || !clothingItem) {
      console.log('Missing data:', { userPhoto: !!userPhoto, clothingItem: !!clothingItem });
      Alert.alert('Error', 'Please select a photo and ensure clothing item is loaded');
      return;
    }

    try {
      console.log('=== VIRTUAL TRY-ON GENERATION START ===');
      console.log('User Photo URI:', userPhoto);
      console.log('Selected Clothing Item ID:', selectedItemId);
      console.log('Clothing Item Full Details:', clothingItem);
      console.log('Clothing Item Summary:', {
        id: clothingItem.id,
        name: clothingItem.name,
        category: clothingItem.category,
        images: clothingItem.images,
      });
      
      // Double-check we're using the right item
      if (clothingItem.id !== selectedItemId) {
        console.error('MISMATCH: clothingItem.id !== selectedItemId', clothingItem.id, selectedItemId);
        Alert.alert('Error', 'Item mismatch detected. Please try again.');
        return;
      }
      
      // Log the actual image URLs
      console.log('Clothing Image URLs:', {
        processed: clothingItem.images.processed,
        original: clothingItem.images.original,
        thumbnail: clothingItem.images.thumbnail,
      });
      
      // Check if clothing item has images
      if (!clothingItem.images || (!clothingItem.images.processed && !clothingItem.images.original)) {
        console.error('Clothing item has no images!');
        Alert.alert('Error', 'This clothing item has no associated image. Please ensure the item has been properly uploaded with an image.');
        return;
      }
      
      // Check if user photo is accessible
      try {
        const photoCheck = await fetch(userPhoto);
        console.log('User photo fetch status:', photoCheck.status);
        console.log('User photo content type:', photoCheck.headers.get('content-type'));
      } catch (err) {
        console.error('User photo not accessible:', err);
      }
      
      const result = await generateTryOn({
        userImageUri: userPhoto,
        clothingItemId: selectedItemId!,
      }).unwrap();

      console.log('Virtual try-on SUCCESS:', result);
      console.log('Generated image URL:', result.generatedImageUrl);
      
      // Validate the generated image URL
      if (!result.generatedImageUrl) {
        throw new Error('No generated image URL in result');
      }
      
      setGeneratedImage(result.generatedImageUrl);
      
      // Try to prefetch the image to check if it's accessible
      try {
        const imageCheck = await fetch(result.generatedImageUrl, { method: 'HEAD' });
        console.log('Generated image accessibility check:', imageCheck.status);
      } catch (err) {
        console.warn('Generated image may not be accessible:', err);
      }
    } catch (error) {
      console.error('=== VIRTUAL TRY-ON ERROR ===');
      console.error('Error details:', error);
      Alert.alert('Error', 'Failed to generate virtual try-on. Please try again.');
    }
  };

  const resetPhotos = () => {
    setUserPhoto(null);
    setGeneratedImage(null);
  };

  if (!permission?.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <MaterialCommunityIcons name="camera-off" size={64} color="#666" />
          <Text style={styles.permissionText}>
            We need camera permission for virtual try-on
          </Text>
          <Button mode="contained" onPress={requestPermission}>
            Grant Permission
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.title}>Virtual Try-On</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Show Selected Clothing Item */}
        {selectedItemId && clothingItem && (
          <View style={styles.selectedItemContainer}>
            <Text style={styles.selectedItemTitle}>Selected Item</Text>
            <View style={styles.selectedItemCard}>
              <Image
                source={{ uri: clothingItem.images.thumbnail || clothingItem.images.original }}
                style={styles.selectedItemImage}
                contentFit="cover"
              />
              <View style={styles.selectedItemInfo}>
                <Text style={styles.selectedItemName}>{clothingItem.name}</Text>
                {clothingItem.brand && (
                  <Text style={styles.selectedItemBrand}>{clothingItem.brand}</Text>
                )}
                <TouchableOpacity
                  onPress={() => setSelectedItemId(null)}
                  style={styles.changeItemButton}
                >
                  <Text style={styles.changeItemText}>Change Item</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Clothing Item Selector - show when no item is pre-selected */}
        {!selectedItemId && allClothing.length > 0 && (
          <View style={styles.clothingSelector}>
            <Text style={styles.sectionTitle}>Select a Clothing Item</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {allClothing.map(item => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    console.log('Selected clothing item:', item.id, item.name);
                    setSelectedItemId(item.id);
                  }}
                  style={styles.clothingItem}
                >
                  <Image
                    source={{ uri: item.images.thumbnail || item.images.original }}
                    style={styles.clothingItemImage}
                    contentFit="cover"
                  />
                  <Text style={styles.clothingItemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {!selectedItemId ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="hanger" size={64} color="#666" />
            <Text style={styles.emptyStateText}>
              Please select a clothing item to try on
            </Text>
          </View>
        ) : !userPhoto ? (
          <View style={styles.cameraSection}>
            <Text style={styles.instruction}>
              Take a photo of yourself or choose from your saved photos
            </Text>
            
            {/* Saved Photos Section */}
            {userPhotos.length > 0 && (
              <View style={styles.savedPhotosSection}>
                <Text style={styles.sectionTitle}>Your Saved Photos</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {userPhotos.map(photo => (
                    <TouchableOpacity
                      key={photo.id}
                      onPress={() => setUserPhoto(photo.imageUrl)}
                      style={styles.savedPhotoItem}
                    >
                      <Image
                        source={{ uri: photo.imageUrl }}
                        style={styles.savedPhotoImage}
                        contentFit="cover"
                      />
                      {photo.isDefault && (
                        <View style={styles.defaultBadge}>
                          <MaterialCommunityIcons name="star" size={12} color="#fff" />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    onPress={() => navigation.navigate('UserPhotos' as any)}
                    style={[styles.savedPhotoItem, styles.managePhotosButton]}
                  >
                    <MaterialCommunityIcons name="cog" size={24} color="#666" />
                    <Text style={styles.managePhotosText}>Manage</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            )}
            
            <View style={styles.cameraContainer}>
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing={facing}
              />
              <View style={styles.cameraOverlay}>
                <IconButton
                  icon="camera-flip"
                  size={28}
                  iconColor="white"
                  style={styles.flipButton}
                  onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
                />
              </View>
            </View>

            <View style={styles.cameraControls}>
              <Button
                mode="contained"
                onPress={takePicture}
                icon="camera"
                style={styles.captureButton}
              >
                Take Photo
              </Button>
              <Button
                mode="outlined"
                onPress={pickImage}
                icon="image"
              >
                Choose from Gallery
              </Button>
            </View>
          </View>
        ) : (
          <View style={styles.resultSection}>
            {generatedImage ? (
              <>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultTitle}>Virtual Try-On Result</Text>
                  <Text style={styles.resultSubtitle}>
                    {clothingItem?.name} • {clothingItem?.brand}
                  </Text>
                </View>

                {/* Tab selector for view mode */}
                <View style={styles.viewModeSelector}>
                  <TouchableOpacity
                    style={[styles.viewModeButton, viewMode === 'side-by-side' && styles.viewModeButtonActive]}
                    onPress={() => setViewMode('side-by-side')}
                  >
                    <MaterialCommunityIcons 
                      name="view-split-vertical" 
                      size={20} 
                      color={viewMode === 'side-by-side' ? '#fff' : '#666'} 
                    />
                    <Text style={[styles.viewModeText, viewMode === 'side-by-side' && styles.viewModeTextActive]}>
                      Side by Side
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.viewModeButton, viewMode === 'overlay' && styles.viewModeButtonActive]}
                    onPress={() => setViewMode('overlay')}
                  >
                    <MaterialCommunityIcons 
                      name="layers" 
                      size={20} 
                      color={viewMode === 'overlay' ? '#fff' : '#666'} 
                    />
                    <Text style={[styles.viewModeText, viewMode === 'overlay' && styles.viewModeTextActive]}>
                      Overlay
                    </Text>
                  </TouchableOpacity>
                </View>

                {viewMode === 'side-by-side' ? (
                  <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.imageScrollView}>
                    <View style={styles.fullScreenImageContainer}>
                      <View style={styles.imageLabelContainer}>
                        <Text style={styles.fullScreenImageLabel}>Before</Text>
                      </View>
                      <Image
                        source={{ uri: userPhoto }}
                        style={styles.fullScreenImage}
                        contentFit="contain"
                      />
                    </View>
                    <View style={styles.fullScreenImageContainer}>
                      <View style={styles.imageLabelContainer}>
                        <Text style={styles.fullScreenImageLabel}>After</Text>
                      </View>
                      <Image
                        source={{ uri: generatedImage }}
                        style={styles.fullScreenImage}
                        contentFit="contain"
                        onError={(error) => {
                          console.error('Failed to load generated image:', error);
                          Alert.alert('Error', 'Failed to load the generated image');
                        }}
                        onLoad={() => {
                          console.log('Generated image loaded successfully');
                        }}
                      />
                    </View>
                  </ScrollView>
                ) : (
                  <View style={styles.overlayContainer}>
                    <Image
                      source={{ uri: userPhoto }}
                      style={[styles.overlayImage, { opacity: 1 - overlayOpacity }]}
                      contentFit="contain"
                    />
                    <Image
                      source={{ uri: generatedImage }}
                      style={[styles.overlayImage, styles.overlayImageTop, { opacity: overlayOpacity }]}
                      contentFit="contain"
                    />
                    <View style={styles.sliderContainer}>
                      <Text style={styles.sliderLabel}>Before</Text>
                      <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={1}
                        value={overlayOpacity}
                        onValueChange={setOverlayOpacity}
                        minimumTrackTintColor="#6C63FF"
                        maximumTrackTintColor="#ccc"
                        thumbTintColor="#6C63FF"
                      />
                      <Text style={styles.sliderLabel}>After</Text>
                    </View>
                  </View>
                )}

                <View style={styles.resultActions}>
                  <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Success', 'Image saved to gallery!')}>
                    <MaterialCommunityIcons name="download" size={24} color="#6C63FF" />
                    <Text style={styles.actionButtonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
                    <MaterialCommunityIcons name="share-variant" size={24} color="#6C63FF" />
                    <Text style={styles.actionButtonText}>Share</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton} onPress={resetPhotos}>
                    <MaterialCommunityIcons name="camera-retake" size={24} color="#6C63FF" />
                    <Text style={styles.actionButtonText}>Try Again</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.previewTitle}>Preview</Text>
                <View style={styles.previewContainer}>
                  <Image
                    source={{ uri: userPhoto }}
                    style={styles.previewImage}
                    contentFit="cover"
                  />
                  <Card style={styles.clothingCard}>
                    <Card.Content style={styles.clothingCardContent}>
                      {clothingItem ? (
                        <>
                          <Image
                            source={
                              typeof clothingItem.images.processed === 'number' || typeof clothingItem.images.original === 'number' || typeof clothingItem.images.thumbnail === 'number'
                                ? clothingItem.images.processed || clothingItem.images.original || clothingItem.images.thumbnail
                                : { uri: clothingItem.images.processed || clothingItem.images.original || clothingItem.images.thumbnail }
                            }
                            style={styles.clothingPreview}
                            contentFit="contain"
                          />
                          <Text style={styles.clothingName}>{clothingItem.name}</Text>
                        </>
                      ) : (
                        <Text style={styles.loadingText}>Loading clothing item...</Text>
                      )}
                    </Card.Content>
                  </Card>
                </View>

                <View style={styles.generateSection}>
                  {isGenerating ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" />
                      <Text style={styles.loadingText}>
                        Generating your virtual try-on...
                      </Text>
                    </View>
                  ) : (
                    <>
                      <Button
                        mode="contained"
                        onPress={handleGenerateTryOn}
                        icon="auto-fix"
                        style={styles.generateButton}
                      >
                        Generate Try-On
                      </Button>
                      <Button
                        mode="text"
                        onPress={() => setUserPhoto(null)}
                      >
                        Choose Different Photo
                      </Button>
                    </>
                  )}
                </View>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  cameraSection: {
    padding: 16,
  },
  instruction: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  cameraContainer: {
    height: 400,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 16,
  },
  flipButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  cameraControls: {
    gap: 12,
  },
  captureButton: {
    marginBottom: 8,
  },
  resultSection: {
    padding: 16,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  imageComparison: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  imageContainer: {
    flex: 1,
  },
  imageLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  resultImage: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  viewModeSelector: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  viewModeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  viewModeButtonActive: {
    backgroundColor: '#6C63FF',
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  viewModeTextActive: {
    color: '#fff',
  },
  imageScrollView: {
    height: screenHeight * 0.6,
    marginBottom: 20,
  },
  fullScreenImageContainer: {
    width: screenWidth - 32,
    height: screenHeight * 0.6,
    marginHorizontal: 16,
    position: 'relative',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  imageLabelContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 1,
  },
  fullScreenImageLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  overlayContainer: {
    height: screenHeight * 0.6,
    marginBottom: 20,
    position: 'relative',
  },
  overlayImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  overlayImageTop: {
    zIndex: 1,
  },
  sliderContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  resultActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#6C63FF',
    marginTop: 4,
    fontWeight: '500',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  previewContainer: {
    marginBottom: 24,
  },
  previewImage: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    marginBottom: 16,
  },
  clothingCard: {
    backgroundColor: '#f5f5f5',
  },
  clothingCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  clothingPreview: {
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  clothingName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  generateSection: {
    gap: 12,
  },
  generateButton: {
    marginBottom: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
    color: '#666',
  },
  savedPhotosSection: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  savedPhotoItem: {
    marginRight: 12,
    position: 'relative',
  },
  savedPhotoImage: {
    width: 80,
    height: 100,
    borderRadius: 8,
  },
  defaultBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,
    padding: 4,
  },
  managePhotosButton: {
    width: 80,
    height: 100,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  managePhotosText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  tryOnContainer: {
    position: 'relative',
  },
  overlayContainer: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    right: '10%',
    bottom: '30%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clothingOverlay: {
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },
  selectedItemContainer: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  selectedItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  selectedItemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedItemImage: {
    width: 80,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
  },
  selectedItemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  selectedItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  selectedItemBrand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  changeItemButton: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: '#6C63FF',
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  changeItemText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  clothingSelector: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  clothingItem: {
    marginHorizontal: 8,
    alignItems: 'center',
    width: 100,
  },
  clothingItemImage: {
    width: 100,
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  clothingItemName: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default VirtualTryOnScreen;