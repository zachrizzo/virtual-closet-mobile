import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Screens - Ultra MVP
import WardrobeScreen from '../screens/wardrobe/WardrobeScreen';
import AddClothingScreen from '../screens/wardrobe/AddClothingScreen';
import VirtualTryOnScreen from '../screens/wardrobe/VirtualTryOnScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

export type WardrobeStackParamList = {
  WardrobeMain: undefined;
  AddClothing: { photoUri?: string };
  VirtualTryOn: { itemId: string; userPhotoId?: string };
};

export type TabParamList = {
  Wardrobe: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const WardrobeStack = createStackNavigator<WardrobeStackParamList>();

const WardrobeNavigator = () => {
  return (
    <WardrobeStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6C63FF',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <WardrobeStack.Screen
        name="WardrobeMain"
        component={WardrobeScreen}
        options={{ title: 'My Closet', headerShown: false }}
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
    </WardrobeStack.Navigator>
  );
};

const TabNavigator = ({ onLogout }: { onLogout: () => void }) => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#6C63FF',
        tabBarInactiveTintColor: '#A0A0A0',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
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
        name="Profile"
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={28} color={color} />
          ),
        }}
      >
        {() => <ProfileScreen onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default TabNavigator;