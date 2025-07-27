import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, Chip, HelperText, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useForm, Controller } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { WardrobeStackParamList } from '@/navigation/TabNavigator';
import { ClothingCategory, Season, Occasion } from '@/types/clothing';
import { useCreateClothingMutation, useUploadClothingImageMutation } from '@/store/api/clothingApi';

type AddClothingScreenNavigationProp = StackNavigationProp<WardrobeStackParamList, 'AddClothing'>;
type AddClothingScreenRouteProp = RouteProp<WardrobeStackParamList, 'AddClothing'>;

interface Props {
  navigation: AddClothingScreenNavigationProp;
  route: AddClothingScreenRouteProp;
}

interface ClothingForm {
  name: string;
  brand?: string;
  size?: string;
  cost?: string;
  primaryColor: string;
  notes?: string;
}

const AddClothingScreen: React.FC<Props> = ({ navigation, route }) => {
  const initialPhotoUri = route.params?.photoUri;
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(initialPhotoUri || null);
  
  const [category, setCategory] = useState<ClothingCategory>(ClothingCategory.TOPS);
  const [selectedSeasons, setSelectedSeasons] = useState<Season[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<Occasion[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  
  const [createClothing, { isLoading: isCreating }] = useCreateClothingMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadClothingImageMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ClothingForm>({
    defaultValues: {
      name: '',
      brand: '',
      size: '',
      cost: '',
      primaryColor: '',
      notes: '',
    },
  });

  const toggleSeason = (season: Season) => {
    setSelectedSeasons(current =>
      current.includes(season)
        ? current.filter(s => s !== season)
        : [...current, season]
    );
  };

  const toggleOccasion = (occasion: Occasion) => {
    setSelectedOccasions(current =>
      current.includes(occasion)
        ? current.filter(o => o !== occasion)
        : [...current, occasion]
    );
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.9,
    });

    if (!result.canceled) {
      setSelectedPhoto(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaType.Images,
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

      // Create clothing item
      const result = await createClothing({
        name: data.name,
        category,
        brand: data.brand,
        size: data.size,
        cost: data.cost ? parseFloat(data.cost) : undefined,
        color: {
          primary: data.primaryColor,
        },
        season: selectedSeasons,
        occasion: selectedOccasions,
        tags,
        notes: data.notes,
      }).unwrap();

      // Upload image
      if (result.id && selectedPhoto) {
        const formData = new FormData();
        formData.append('file', {
          uri: selectedPhoto,
          type: 'image/jpeg',
          name: 'clothing.jpg',
        } as any);

        await uploadImage({
          id: result.id,
          image: formData,
        }).unwrap();
      }

      Alert.alert('Success', 'Clothing item added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error adding clothing:', error);
      Alert.alert('Error', 'Failed to add clothing item');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          {selectedPhoto ? (
            <>
              <Image source={{ uri: selectedPhoto }} style={styles.image} contentFit="cover" />
              <IconButton
                icon="close"
                size={24}
                onPress={() => setSelectedPhoto(null)}
                style={styles.removePhotoButton}
                iconColor="#fff"
              />
            </>
          ) : (
            <View style={styles.photoPlaceholder}>
              <MaterialCommunityIcons name="camera-plus" size={48} color="#666" />
              <Text style={styles.photoPlaceholderText}>Add Photo</Text>
              <View style={styles.photoButtons}>
                <Button mode="contained" onPress={takePhoto} style={styles.photoButton}>
                  Take Photo
                </Button>
                <Button mode="outlined" onPress={pickImage} style={styles.photoButton}>
                  Choose from Gallery
                </Button>
              </View>
            </View>
          )}
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="name"
            rules={{ required: 'Name is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Item Name *"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                mode="outlined"
                error={!!errors.name}
                style={styles.input}
              />
            )}
          />
          <HelperText type="error" visible={!!errors.name}>
            {errors.name?.message}
          </HelperText>

          <Text style={styles.sectionTitle}>Category *</Text>
          <SegmentedButtons
            value={category}
            onValueChange={(value) => setCategory(value as ClothingCategory)}
            buttons={[
              { value: ClothingCategory.TOPS, label: 'Tops' },
              { value: ClothingCategory.BOTTOMS, label: 'Bottoms' },
              { value: ClothingCategory.DRESSES, label: 'Dresses' },
              { value: ClothingCategory.OUTERWEAR, label: 'Outerwear' },
            ]}
            style={styles.segmentedButtons}
          />

          <Controller
            control={control}
            name="brand"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Brand"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                mode="outlined"
                style={styles.input}
              />
            )}
          />

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Controller
                control={control}
                name="size"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Size"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                  />
                )}
              />
            </View>

            <View style={styles.halfField}>
              <Controller
                control={control}
                name="cost"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Cost ($)"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    keyboardType="numeric"
                  />
                )}
              />
            </View>
          </View>

          <Controller
            control={control}
            name="primaryColor"
            rules={{ required: 'Primary color is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Primary Color *"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                mode="outlined"
                error={!!errors.primaryColor}
                style={styles.input}
              />
            )}
          />
          <HelperText type="error" visible={!!errors.primaryColor}>
            {errors.primaryColor?.message}
          </HelperText>

          <Text style={styles.sectionTitle}>Season</Text>
          <View style={styles.chipContainer}>
            {Object.values(Season).map(season => (
              <Chip
                key={season}
                selected={selectedSeasons.includes(season)}
                onPress={() => toggleSeason(season)}
                style={styles.chip}
              >
                {season}
              </Chip>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Occasion</Text>
          <View style={styles.chipContainer}>
            {Object.values(Occasion).map(occasion => (
              <Chip
                key={occasion}
                selected={selectedOccasions.includes(occasion)}
                onPress={() => toggleOccasion(occasion)}
                style={styles.chip}
              >
                {occasion}
              </Chip>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tagInputContainer}>
            <TextInput
              label="Add tag"
              value={newTag}
              onChangeText={setNewTag}
              mode="outlined"
              style={styles.tagInput}
              onSubmitEditing={addTag}
            />
            <Button mode="text" onPress={addTag}>
              Add
            </Button>
          </View>
          <View style={styles.chipContainer}>
            {tags.map(tag => (
              <Chip
                key={tag}
                onClose={() => removeTag(tag)}
                style={styles.chip}
              >
                {tag}
              </Chip>
            ))}
          </View>

          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Notes"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
              />
            )}
          />

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.button}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              loading={isCreating || isUploading}
              disabled={isCreating || isUploading}
              style={styles.button}
            >
              Add to Wardrobe
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  imageContainer: {
    height: 300,
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  photoPlaceholderText: {
    fontSize: 18,
    color: '#666',
    marginTop: 12,
    marginBottom: 24,
  },
  photoButtons: {
    width: '100%',
    gap: 12,
  },
  photoButton: {
    marginVertical: 6,
  },
  form: {
    padding: 16,
  },
  input: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  halfField: {
    flex: 1,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    marginBottom: 4,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagInput: {
    flex: 1,
    marginRight: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
  },
});

export default AddClothingScreen;