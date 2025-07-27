import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch } from '@/store';
import { loginSuccess } from '@/store/slices/authSlice';

const StyleQuizScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const completeOnboarding = () => {
    // In a real app, this would save the style preferences
    // For now, we'll just mark the user as logged in
    dispatch(loginSuccess({
      user: {
        id: '1',
        email: 'user@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        preferences: {
          stylePersonality: [],
          favoriteColors: [],
          sizingInfo: {},
          occasionPreferences: [],
        },
        isActive: true,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      token: 'mock-token',
      refreshToken: 'mock-refresh-token',
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Style Quiz</Text>
        <Text style={styles.subtitle}>Tell us about your style preferences</Text>
        
        <Button
          mode="contained"
          onPress={completeOnboarding}
          style={styles.button}
        >
          Complete Setup
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 48,
  },
  button: {
    paddingHorizontal: 32,
  },
});

export default StyleQuizScreen;