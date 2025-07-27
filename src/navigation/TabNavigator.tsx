import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

// Screens
import HomeScreen from '@/screens/home/HomeScreen';
import WardrobeScreen from '@/screens/wardrobe/WardrobeScreen';
import ClothingDetailScreen from '@/screens/wardrobe/ClothingDetailScreen';
import AddClothingScreen from '@/screens/wardrobe/AddClothingScreen';
import VirtualTryOnScreen from '@/screens/wardrobe/VirtualTryOnScreen';
import OutfitsScreen from '@/screens/outfits/OutfitsScreen';
import OutfitDetailScreen from '@/screens/outfits/OutfitDetailScreen';
import CreateOutfitScreen from '@/screens/outfits/CreateOutfitScreen';
import CameraScreen from '@/screens/camera/CameraScreen';
import ProfileScreen from '@/screens/profile/ProfileScreen';
import AIChatScreen from '@/screens/ai/AIChatScreen';

export type WardrobeStackParamList = {
  WardrobeMain: undefined;
  ClothingDetail: { itemId: string };
  AddClothing: { photoUri?: string };
  VirtualTryOn: { itemId: string; userPhotoId?: string };
  OutfitsMain: undefined;
  OutfitDetail: { outfitId: string };
  CreateOutfit: undefined;
};

export type TabParamList = {
  Home: undefined;
  Wardrobe: undefined;
  Camera: undefined;
  AIChat: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const WardrobeStack = createStackNavigator<WardrobeStackParamList>();

const WardrobeNavigator = () => {
  return (
    <WardrobeStack.Navigator>
      <WardrobeStack.Screen
        name="WardrobeMain"
        component={WardrobeScreen}
        options={{ title: 'My Closet' }}
      />
      <WardrobeStack.Screen
        name="ClothingDetail"
        component={ClothingDetailScreen}
        options={{ title: 'Item Details' }}
      />
      <WardrobeStack.Screen
        name="AddClothing"
        component={AddClothingScreen}
        options={{ title: 'Add New Item' }}
      />
      <WardrobeStack.Screen
        name="VirtualTryOn"
        component={VirtualTryOnScreen}
        options={{ title: 'Virtual Try-On' }}
      />
      <WardrobeStack.Screen
        name="OutfitsMain"
        component={OutfitsScreen}
        options={{ title: 'My Outfits' }}
      />
      <WardrobeStack.Screen
        name="OutfitDetail"
        component={OutfitDetailScreen}
        options={{ title: 'Outfit Details' }}
      />
      <WardrobeStack.Screen
        name="CreateOutfit"
        component={CreateOutfitScreen}
        options={{ title: 'Create Outfit' }}
      />
    </WardrobeStack.Navigator>
  );
};

const TabNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#6C63FF',
        tabBarInactiveTintColor: '#A0A0A0',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          paddingBottom: 10,
          paddingTop: 10,
          height: 85,
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={28} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Wardrobe"
        component={WardrobeNavigator}
        options={{
          tabBarLabel: 'My Closet',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="wardrobe" size={28} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Camera"
        component={CameraScreen}
        options={{
          tabBarLabel: 'Add',
          tabBarIcon: ({ color, size }) => (
            <View style={{
              backgroundColor: '#6C63FF',
              width: 56,
              height: 56,
              borderRadius: 28,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 10,
              shadowColor: '#6C63FF',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}>
              <MaterialCommunityIcons name="plus" size={32} color="#FFFFFF" />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="AIChat"
        component={AIChatScreen}
        options={{
          tabBarLabel: 'AI Stylist',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="robot" size={28} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={28} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;