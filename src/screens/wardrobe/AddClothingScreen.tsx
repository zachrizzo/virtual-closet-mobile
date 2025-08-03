import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, StatusBar, Platform, Animated } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, Chip, HelperText, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useForm, Controller } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { WardrobeStackParamList } from '@/navigation/TabNavigator';
import { ClothingCategory } from '@/types/clothing';
import { unifiedAPI } from '@/services/api/unifiedService';

type AddClothingScreenNavigationProp = StackNavigationProp<WardrobeStackParamList, 'AddClothing'>;
type AddClothingScreenRouteProp = RouteProp<WardrobeStackParamList, 'AddClothing'>;

interface Props {
  navigation: AddClothingScreenNavigationProp;
  route: AddClothingScreenRouteProp;
}

interface ClothingForm {
  name: string;
  category: ClothingCategory;
}

const categoryData = [
  { value: ClothingCategory.TOPS, label: 'Tops', icon: 'tshirt-crew', color: '#FF6B6B' },
  { value: ClothingCategory.BOTTOMS, label: 'Bottoms', icon: 'human-male', color: '#4ECDC4' },
  { value: ClothingCategory.DRESSES, label: 'Dresses', icon: 'human-female', color: '#FF8CC8' },
  { value: ClothingCategory.OUTERWEAR, label: 'Outerwear', icon: 'coat-rack', color: '#95E1D3' },
  { value: ClothingCategory.SHOES, label: 'Shoes', icon: 'shoe-heel', color: '#FFA502' },
  { value: ClothingCategory.ACCESSORIES, label: 'Accessories', icon: 'glasses', color: '#A29BFE' },
];

const AddClothingScreen: React.FC<Props> = ({ navigation, route }) => {
  const initialPhotoUri = route.params?.photoUri;
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(initialPhotoUri || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ClothingForm>({
    defaultValues: {
      name: '',
      category: ClothingCategory.TOPS,
    },
  });

  const selectedCategory = watch('category');

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const pickImage = async () => {
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
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image from gallery');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.9,
    });

    if (!result.canceled) {
      setSelectedPhoto(result.assets[0].uri);
    }
  };

  const onSubmit = async (data: ClothingForm) => {
    try {
      if (!selectedPhoto) {
        Alert.alert('Error', 'Please select a photo');
        return;
      }

      setIsSubmitting(true);

      const item = await unifiedAPI.wardrobe.addItem(data.name, data.category);
      
      if (item && selectedPhoto) {
        const imageData = {
          uri: selectedPhoto,
          type: 'image/jpeg',
          name: 'photo.jpg',
        };
        await unifiedAPI.wardrobe.uploadImage(item.id, imageData);
      }

      Alert.alert('Success', 'Clothing item added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error('Error adding clothing:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to add clothing item';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Photo Section */}
          <View style={styles.photoSection}>
            {selectedPhoto ? (
              <View style={styles.selectedPhotoContainer}>
                <Image source={{ uri: selectedPhoto }} style={styles.selectedPhoto} contentFit="cover" />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.5)']}
                  style={styles.photoGradient}
                />
                <TouchableOpacity
                  style={styles.changePhotoButton}
                  onPress={() => setSelectedPhoto(null)}
                >
                  <MaterialCommunityIcons name="camera-retake" size={20} color="#FFFFFF" />
                  <Text style={styles.changePhotoText}>Change Photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoUploadContainer}>
                <LinearGradient
                  colors={['#F0F0F5', '#E8E8ED']}
                  style={styles.photoUploadGradient}
                >
                  <MaterialCommunityIcons name="hanger" size={64} color="#B2BEC3" />
                  <Text style={styles.uploadTitle}>Add Your Item</Text>
                  <Text style={styles.uploadSubtitle}>Upload a photo to get started</Text>
                  
                  <View style={styles.uploadButtons}>
                    <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
                      <LinearGradient
                        colors={['#6C63FF', '#8B87FF']}
                        style={styles.uploadButtonGradient}
                      >
                        <MaterialCommunityIcons name="camera" size={24} color="#FFFFFF" />
                        <Text style={styles.uploadButtonText}>Take Photo</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                      <View style={styles.uploadButtonOutline}>
                        <MaterialCommunityIcons name="image-multiple" size={24} color="#6C63FF" />
                        <Text style={styles.uploadButtonTextOutline}>Choose from Gallery</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            )}
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Item Details</Text>
              <Text style={styles.formSubtitle}>Tell us about your new item</Text>
            </View>

            <Controller
              control={control}
              name="name"
              rules={{ required: 'Please name your item' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Item Name</Text>
                  <TextInput
                    placeholder="e.g., Vintage Denim Jacket"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    error={!!errors.name}
                    style={styles.input}
                    outlineColor="#E0E0E0"
                    activeOutlineColor="#6C63FF"
                    outlineStyle={{ borderRadius: 12 }}
                  />
                  {errors.name && (
                    <Text style={styles.errorText}>{errors.name.message}</Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="category"
              render={({ field: { onChange, value } }) => (
                <View style={styles.categoryContainer}>
                  <Text style={styles.inputLabel}>Category</Text>
                  <View style={styles.categoryGrid}>
                    {categoryData.map((category) => (
                      <TouchableOpacity
                        key={category.value}
                        style={[
                          styles.categoryCard,
                          value === category.value && styles.categoryCardSelected
                        ]}
                        onPress={() => onChange(category.value)}
                      >
                        <View style={[
                          styles.categoryIconContainer,
                          value === category.value && { backgroundColor: category.color }
                        ]}>
                          <MaterialCommunityIcons 
                            name={category.icon as any} 
                            size={24} 
                            color={value === category.value ? '#FFFFFF' : category.color} 
                          />
                        </View>
                        <Text style={[
                          styles.categoryLabel,
                          value === category.value && styles.categoryLabelSelected
                        ]}>
                          {category.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            />

            {/* Quick Tips */}
            <View style={styles.tipsContainer}>
              <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#FFA502" />
              <Text style={styles.tipText}>
                Tip: Good lighting and a clean background make your items look their best!
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => navigation.goBack()}
          disabled={isSubmitting}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]} 
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          <LinearGradient
            colors={isSubmitting ? ['#B2BEC3', '#B2BEC3'] : ['#6C63FF', '#8B87FF']}
            style={styles.saveButtonGradient}
          >
            {isSubmitting ? (
              <>
                <MaterialCommunityIcons name="loading" size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Adding...</Text>
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Add to Closet</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    flex: 1,
  },
  photoSection: {
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 20,
  },
  selectedPhotoContainer: {
    height: 400,
    position: 'relative',
  },
  selectedPhoto: {
    width: '100%',
    height: '100%',
  },
  photoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  changePhotoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  photoUploadContainer: {
    height: 350,
  },
  photoUploadGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  uploadTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2D3436',
    marginTop: 16,
  },
  uploadSubtitle: {
    fontSize: 16,
    color: '#636E72',
    marginTop: 8,
    marginBottom: 32,
  },
  uploadButtons: {
    width: '100%',
    gap: 16,
  },
  uploadButton: {
    width: '100%',
  },
  uploadButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadButtonOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6C63FF',
    gap: 8,
  },
  uploadButtonTextOutline: {
    color: '#6C63FF',
    fontSize: 16,
    fontWeight: '600',
  },
  formSection: {
    padding: 20,
  },
  formHeader: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2D3436',
  },
  formSubtitle: {
    fontSize: 14,
    color: '#636E72',
    marginTop: 4,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    fontSize: 16,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '30%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F0F0F5',
  },
  categoryCardSelected: {
    borderColor: '#6C63FF',
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F0F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#636E72',
    fontWeight: '500',
  },
  categoryLabelSelected: {
    color: '#6C63FF',
    fontWeight: '600',
  },
  tipsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#F57C00',
    lineHeight: 20,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F5',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#636E72',
  },
  saveButton: {
    flex: 2,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddClothingScreen;