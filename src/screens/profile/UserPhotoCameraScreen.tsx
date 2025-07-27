import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

type UserPhotoCameraScreenNavigationProp = StackNavigationProp<any, 'UserPhotoCamera'>;
type UserPhotoCameraScreenRouteProp = RouteProp<any, 'UserPhotoCamera'>;

interface Props {
  navigation: UserPhotoCameraScreenNavigationProp;
  route: UserPhotoCameraScreenRouteProp;
}

const UserPhotoCameraScreen: React.FC<Props> = ({ navigation, route }) => {
  const [facing, setFacing] = useState<'back' | 'front'>('front');
  const [flashMode, setFlashMode] = useState<'off' | 'on'>('off');
  const cameraRef = useRef<CameraView>(null);
  const { onPhotoTaken } = route.params;

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.9,
          base64: false,
        });
        
        if (photo) {
          onPhotoTaken(photo.uri);
          navigation.goBack();
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          flash={flashMode}
        />
        
        <View style={styles.overlay}>
          {/* Top Controls */}
          <View style={styles.topControls}>
            <IconButton
              icon="close"
              size={28}
              iconColor="white"
              onPress={() => navigation.goBack()}
            />
            <View style={styles.topRightControls}>
              <IconButton
                icon={flashMode === 'on' ? 'flash' : 'flash-off'}
                size={28}
                iconColor="white"
                onPress={() => setFlashMode(flashMode === 'off' ? 'on' : 'off')}
              />
              <IconButton
                icon="camera-flip"
                size={28}
                iconColor="white"
                onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
              />
            </View>
          </View>

          {/* Guide Overlay */}
          <View style={styles.guideContainer}>
            <View style={styles.silhouette}>
              <MaterialCommunityIcons name="human" size={200} color="rgba(255, 255, 255, 0.3)" />
            </View>
            <Text style={styles.guideText}>
              Position yourself in the frame
            </Text>
            <Text style={styles.guideSubtext}>
              For best results, stand against a plain background
            </Text>
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <View style={styles.tipContainer}>
              <Text style={styles.tipText}>Tips:</Text>
              <Text style={styles.tipDetail}>• Good lighting</Text>
              <Text style={styles.tipDetail}>• Full body visible</Text>
              <Text style={styles.tipDetail}>• Neutral pose</Text>
            </View>
            
            <TouchableOpacity onPress={takePicture} style={styles.captureButton}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            
            <View style={styles.placeholderButton} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  topRightControls: {
    flexDirection: 'row',
  },
  guideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  silhouette: {
    marginBottom: 20,
  },
  guideText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  guideSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  tipContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 12,
    borderRadius: 8,
    width: 100,
  },
  tipText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  tipDetail: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
  },
  placeholderButton: {
    width: 100,
  },
});

export default UserPhotoCameraScreen;