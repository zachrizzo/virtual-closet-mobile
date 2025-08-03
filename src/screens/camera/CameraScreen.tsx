import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Platform, Animated, Dimensions } from 'react-native';
import { Text, Button, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraView, useCameraPermissions, FlashMode } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CameraScreen: React.FC = () => {
  const navigation = useNavigation();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('auto');
  const [showGrid, setShowGrid] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Request permissions on mount
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  useEffect(() => {
    // Pulse animation for guide frame
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const cycleFlashMode = () => {
    setFlashMode(current => {
      switch (current) {
        case 'off':
          return 'on';
        case 'on':
          return 'auto';
        case 'auto':
          return 'off';
        default:
          return 'auto';
      }
    });
  };

  const getFlashIcon = () => {
    switch (flashMode) {
      case 'off':
        return 'flash-off';
      case 'on':
        return 'flash';
      case 'auto':
        return 'flash-auto';
      default:
        return 'flash-auto';
    }
  };

  const takePicture = async () => {
    if (cameraRef.current && !isCapturing) {
      setIsCapturing(true);
      
      // Flash animation
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.9,
          base64: false,
          skipProcessing: false,
        });
        
        if (photo) {
          // Navigate to add clothing screen with the photo
          navigation.navigate('Wardrobe', {
            screen: 'AddClothing',
            params: { photoUri: photo.uri },
          });
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      } finally {
        setIsCapturing(false);
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
      navigation.navigate('Wardrobe', {
        screen: 'AddClothing',
        params: { photoUri: result.assets[0].uri },
      });
    }
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <MaterialCommunityIcons name="camera-off" size={64} color="#666" />
          <Text style={styles.permissionText}>
            We need your permission to use the camera
          </Text>
          <Button mode="contained" onPress={requestPermission} style={styles.permissionButton}>
            Grant Permission
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          flash={flashMode}
        />
        
        {/* Flash animation overlay */}
        <Animated.View
          style={[
            styles.flashOverlay,
            {
              opacity: flashAnim,
            },
          ]}
          pointerEvents="none"
        />

        <View style={styles.overlay}>
          {/* Top Controls */}
          <SafeAreaView edges={['top']} style={styles.topControlsContainer}>
            <LinearGradient
              colors={['rgba(0,0,0,0.6)', 'transparent']}
              style={styles.topGradient}
            >
              <View style={styles.topControls}>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => navigation.goBack()}
                >
                  <MaterialCommunityIcons name="close" size={28} color="white" />
                </TouchableOpacity>
                
                <View style={styles.topRightControls}>
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={cycleFlashMode}
                  >
                    <MaterialCommunityIcons name={getFlashIcon()} size={24} color="white" />
                    <Text style={styles.flashModeText}>{flashMode.toUpperCase()}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={() => setShowGrid(!showGrid)}
                  >
                    <MaterialCommunityIcons 
                      name={showGrid ? "grid" : "grid-off"} 
                      size={24} 
                      color="white" 
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={toggleCameraFacing}
                  >
                    <MaterialCommunityIcons name="camera-flip" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </SafeAreaView>

          {/* Center Guide */}
          <View style={styles.guideContainer} pointerEvents="none">
            <Animated.View 
              style={[
                styles.guideFrame,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <View style={[styles.guideCorner, styles.topLeft]} />
              <View style={[styles.guideCorner, styles.topRight]} />
              <View style={[styles.guideCorner, styles.bottomLeft]} />
              <View style={[styles.guideCorner, styles.bottomRight]} />
              
              {/* Center cross */}
              <View style={styles.centerCross}>
                <View style={styles.crossLineHorizontal} />
                <View style={styles.crossLineVertical} />
              </View>
            </Animated.View>
            
            {/* Grid lines */}
            {showGrid && (
              <View style={styles.gridContainer}>
                <View style={[styles.gridLine, styles.gridLineVertical, { left: '33%' }]} />
                <View style={[styles.gridLine, styles.gridLineVertical, { left: '66%' }]} />
                <View style={[styles.gridLine, styles.gridLineHorizontal, { top: '33%' }]} />
                <View style={[styles.gridLine, styles.gridLineHorizontal, { top: '66%' }]} />
              </View>
            )}
            
            <View style={styles.tipsContainer}>
              <Text style={styles.guideText}>Position item in center</Text>
              <Text style={styles.tipText}>
                • Use good lighting
                • Keep background clean
                • Fill the frame
              </Text>
            </View>
          </View>

          {/* Bottom Controls */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={styles.bottomGradient}
          >
            <SafeAreaView edges={['bottom']} style={styles.bottomControlsContainer}>
              <View style={styles.bottomControls}>
                <TouchableOpacity onPress={pickImage} style={styles.galleryButton}>
                  <MaterialCommunityIcons name="image-multiple" size={28} color="white" />
                  <Text style={styles.galleryText}>Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={takePicture} 
                  style={styles.captureButton}
                  disabled={isCapturing}
                >
                  <View style={styles.captureButtonOuter}>
                    <View style={[
                      styles.captureButtonInner,
                      isCapturing && styles.captureButtonPressed
                    ]} />
                  </View>
                </TouchableOpacity>

                <View style={styles.placeholderButton} />
              </View>
            </SafeAreaView>
          </LinearGradient>
        </View>
      </View>
    </View>
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
  flashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  topControlsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  topGradient: {
    paddingBottom: 20,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  topRightControls: {
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  flashModeText: {
    color: 'white',
    fontSize: 8,
    marginTop: 2,
    fontWeight: '600',
  },
  guideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideFrame: {
    width: screenWidth * 0.75,
    height: screenWidth * 0.75 * 1.33,
    position: 'relative',
  },
  guideCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#FFFFFF',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  centerCross: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 40,
    height: 40,
    marginTop: -20,
    marginLeft: -20,
  },
  crossLineHorizontal: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  crossLineVertical: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  gridContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  gridLineVertical: {
    width: 1,
    top: 0,
    bottom: 0,
  },
  gridLineHorizontal: {
    height: 1,
    left: 0,
    right: 0,
  },
  tipsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  guideText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  tipText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 40,
  },
  bottomControlsContainer: {
    paddingBottom: 20,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  captureButton: {
    padding: 4,
  },
  captureButtonOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  captureButtonPressed: {
    transform: [{ scale: 0.9 }],
  },
  galleryButton: {
    alignItems: 'center',
    padding: 8,
  },
  galleryText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
  placeholderButton: {
    width: 60,
    height: 60,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  permissionText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 32,
    color: '#333',
  },
  permissionButton: {
    paddingHorizontal: 24,
  },
});

export default CameraScreen;