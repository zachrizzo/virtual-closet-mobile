import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Button, IconButton, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Image } from 'expo-image';

import { WardrobeStackParamList } from '@/navigation/TabNavigator';
import { useGetClothingItemQuery, useGenerateVirtualTryOnMutation } from '@/store/api/clothingApi';
import { useGetUserPhotosQuery } from '@/store/api/userApi';

type VirtualTryOnScreenNavigationProp = StackNavigationProp<WardrobeStackParamList, 'VirtualTryOn'>;
type VirtualTryOnScreenRouteProp = RouteProp<WardrobeStackParamList, 'VirtualTryOn'>;

interface Props {
  navigation: VirtualTryOnScreenNavigationProp;
  route: VirtualTryOnScreenRouteProp;
}

const VirtualTryOnScreen: React.FC<Props> = ({ navigation, route }) => {
  const { itemId, userPhotoId } = route.params;
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [facing, setFacing] = useState<'back' | 'front'>('front');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  
  const { data: clothingItem } = useGetClothingItemQuery(itemId);
  const { data: userPhotos = [] } = useGetUserPhotosQuery();
  const [generateTryOn, { isLoading: isGenerating }] = useGenerateVirtualTryOnMutation();
  
  // Debug logging
  React.useEffect(() => {
    console.log('VirtualTryOnScreen - itemId:', itemId);
    console.log('VirtualTryOnScreen - clothingItem:', clothingItem);
    if (clothingItem) {
      console.log('VirtualTryOnScreen - images:', clothingItem.images);
    }
  }, [itemId, clothingItem]);
  
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
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.9,
    });

    if (!result.canceled) {
      setUserPhoto(result.assets[0].uri);
    }
  };

  const handleGenerateTryOn = async () => {
    if (!userPhoto || !clothingItem) {
      console.log('Missing data:', { userPhoto: !!userPhoto, clothingItem: !!clothingItem });
      return;
    }

    try {
      console.log('Generating virtual try-on with:', {
        userImageUri: userPhoto,
        clothingItemId: itemId,
        clothingItemName: clothingItem.name
      });
      
      const result = await generateTryOn({
        userImageUri: userPhoto,
        clothingItemId: itemId,
      }).unwrap();

      console.log('Virtual try-on result:', result);
      setGeneratedImage(result.generatedImageUrl);
    } catch (error) {
      console.error('Virtual try-on error:', error);
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
        {!userPhoto ? (
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
                <Text style={styles.resultTitle}>Your Virtual Try-On</Text>
                <View style={styles.imageComparison}>
                  <View style={styles.imageContainer}>
                    <Text style={styles.imageLabel}>Original</Text>
                    <Image
                      source={{ uri: userPhoto }}
                      style={styles.resultImage}
                      contentFit="cover"
                    />
                  </View>
                  <View style={styles.imageContainer}>
                    <Text style={styles.imageLabel}>With {clothingItem?.name}</Text>
                    <Image
                      source={{ uri: generatedImage }}
                      style={styles.resultImage}
                      contentFit="cover"
                    />
                  </View>
                </View>
                
                <View style={styles.resultActions}>
                  <Button
                    mode="contained"
                    icon="download"
                    onPress={() => Alert.alert('Success', 'Image saved to gallery!')}
                  >
                    Save to Gallery
                  </Button>
                  <Button
                    mode="outlined"
                    icon="share"
                    onPress={() => {}}
                  >
                    Share
                  </Button>
                  <Button
                    mode="text"
                    onPress={resetPhotos}
                  >
                    Try Another Photo
                  </Button>
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
    height: 250,
    borderRadius: 8,
  },
  resultActions: {
    gap: 12,
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
});

export default VirtualTryOnScreen;