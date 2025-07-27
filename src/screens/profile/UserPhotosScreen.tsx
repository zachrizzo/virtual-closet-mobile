import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, FlatList } from 'react-native';
import { Text, Button, IconButton, Card, FAB, Dialog, Portal, TextInput, Menu } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { Image } from 'expo-image';

import { useGetUserPhotosQuery, useUploadUserPhotoMutation, useDeleteUserPhotoMutation, useSetDefaultPhotoMutation } from '@/store/api/userApi';

type UserPhotosScreenNavigationProp = StackNavigationProp<any, 'UserPhotos'>;

interface Props {
  navigation: UserPhotosScreenNavigationProp;
}

interface UserPhoto {
  id: string;
  userId: string;
  imageUrl: string;
  label?: string;
  isDefault: boolean;
  createdAt: string;
}

const UserPhotosScreen: React.FC<Props> = ({ navigation }) => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [photoLabel, setPhotoLabel] = useState('');
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  
  const { data: userPhotos = [], isLoading, refetch } = useGetUserPhotosQuery();
  const [uploadPhoto, { isLoading: isUploading }] = useUploadUserPhotoMutation();
  const [deletePhoto] = useDeleteUserPhotoMutation();
  const [setDefaultPhoto] = useSetDefaultPhotoMutation();
  
  const [permission, requestPermission] = useCameraPermissions();

  const handleTakePhoto = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) return;
    }

    navigation.navigate('UserPhotoCamera', {
      onPhotoTaken: (photoUri: string) => {
        setSelectedPhoto(photoUri);
        setShowUploadDialog(true);
      },
    });
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.9,
    });

    if (!result.canceled) {
      setSelectedPhoto(result.assets[0].uri);
      setShowUploadDialog(true);
    }
  };

  const handleUploadPhoto = async () => {
    if (!selectedPhoto) return;

    try {
      await uploadPhoto({
        imageUri: selectedPhoto,
        label: photoLabel || undefined,
      }).unwrap();
      
      setShowUploadDialog(false);
      setSelectedPhoto(null);
      setPhotoLabel('');
      refetch();
      
      Alert.alert('Success', 'Photo uploaded successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to upload photo');
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePhoto(photoId).unwrap();
              refetch();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete photo');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (photoId: string) => {
    try {
      await setDefaultPhoto(photoId).unwrap();
      refetch();
      Alert.alert('Success', 'Default photo updated!');
    } catch (error) {
      Alert.alert('Error', 'Failed to set default photo');
    }
  };

  const renderPhotoItem = ({ item }: { item: UserPhoto }) => (
    <Card style={styles.photoCard}>
      <TouchableOpacity
        onPress={() => navigation.navigate('VirtualTryOn', { userPhotoId: item.id })}
      >
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.photoImage}
          contentFit="cover"
        />
      </TouchableOpacity>
      
      {item.isDefault && (
        <View style={styles.defaultBadge}>
          <MaterialCommunityIcons name="star" size={16} color="#fff" />
          <Text style={styles.defaultText}>Default</Text>
        </View>
      )}
      
      <Card.Actions style={styles.cardActions}>
        <View style={styles.photoInfo}>
          <Text style={styles.photoLabel}>{item.label || 'No label'}</Text>
          <Text style={styles.photoDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        
        <Menu
          visible={menuVisible === item.id}
          onDismiss={() => setMenuVisible(null)}
          anchor={
            <IconButton
              icon="dots-vertical"
              size={20}
              onPress={() => setMenuVisible(item.id)}
            />
          }
        >
          {!item.isDefault && (
            <Menu.Item
              onPress={() => {
                setMenuVisible(null);
                handleSetDefault(item.id);
              }}
              title="Set as Default"
              leadingIcon="star"
            />
          )}
          <Menu.Item
            onPress={() => {
              setMenuVisible(null);
              navigation.navigate('VirtualTryOn', { userPhotoId: item.id });
            }}
            title="Use for Try-On"
            leadingIcon="hanger"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(null);
              handleDeletePhoto(item.id);
            }}
            title="Delete"
            leadingIcon="delete"
          />
        </Menu>
      </Card.Actions>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.title}>My Try-On Photos</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.description}>
          Save photos of yourself to quickly try on different outfits. 
          Your default photo will be used automatically for virtual try-ons.
        </Text>

        {userPhotos.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="camera-off" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No photos yet</Text>
            <Text style={styles.emptySubtext}>
              Add photos to start virtual try-ons
            </Text>
          </View>
        ) : (
          <FlatList
            data={userPhotos}
            renderItem={renderPhotoItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            scrollEnabled={false}
          />
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          Alert.alert(
            'Add Photo',
            'Choose how to add a photo',
            [
              { text: 'Take Photo', onPress: handleTakePhoto },
              { text: 'Choose from Gallery', onPress: handlePickImage },
              { text: 'Cancel', style: 'cancel' },
            ]
          );
        }}
      />

      <Portal>
        <Dialog visible={showUploadDialog} onDismiss={() => setShowUploadDialog(false)}>
          <Dialog.Title>Upload Photo</Dialog.Title>
          <Dialog.Content>
            {selectedPhoto && (
              <Image
                source={{ uri: selectedPhoto }}
                style={styles.previewImage}
                contentFit="cover"
              />
            )}
            <TextInput
              label="Label (optional)"
              value={photoLabel}
              onChangeText={setPhotoLabel}
              placeholder="e.g., Front view, Side view"
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowUploadDialog(false)}>Cancel</Button>
            <Button 
              onPress={handleUploadPhoto} 
              loading={isUploading}
              disabled={isUploading}
            >
              Upload
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    padding: 16,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    color: '#333',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  photoCard: {
    width: '48%',
    marginBottom: 8,
  },
  photoImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  defaultBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  defaultText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  photoInfo: {
    flex: 1,
  },
  photoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  photoDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'transparent',
  },
});

export default UserPhotosScreen;