import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { unifiedAPI } from '../../services/api/unifiedService';

interface Props {
  onLogin: () => void;
}

const LoginScreen: React.FC<Props> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      
      console.log('Attempting login with:', { email, password });
      
      if (isLogin) {
        await unifiedAPI.auth.login(email, password);
      } else {
        // For MVP, register logs in immediately
        await unifiedAPI.auth.login(email, password);
      }
      
      console.log('Login successful');
      onLogin();
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', isLogin ? 'Invalid credentials' : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#6C63FF', '#8B87FF']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          <View style={styles.header}>
            <MaterialCommunityIcons name="hanger" size={80} color="#FFFFFF" />
            <Text style={styles.title}>Virtual Closet</Text>
            <Text style={styles.subtitle}>Try on your clothes virtually</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              outlineColor="rgba(255, 255, 255, 0.3)"
              activeOutlineColor="#FFFFFF"
              textColor="#FFFFFF"
              theme={{
                colors: {
                  onSurfaceVariant: 'rgba(255, 255, 255, 0.7)',
                },
              }}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
              outlineColor="rgba(255, 255, 255, 0.3)"
              activeOutlineColor="#FFFFFF"
              textColor="#FFFFFF"
              theme={{
                colors: {
                  onSurfaceVariant: 'rgba(255, 255, 255, 0.7)',
                },
              }}
            />

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
              style={styles.button}
              buttonColor="#FFFFFF"
              textColor="#6C63FF"
            >
              {isLogin ? 'Login' : 'Create Account'}
            </Button>

            <TouchableOpacity
              onPress={() => setIsLogin(!isLogin)}
              style={styles.switchButton}
            >
              <Text style={styles.switchText}>
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Login"}
              </Text>
            </TouchableOpacity>

            {/* Test Login Button */}
            <TouchableOpacity
              onPress={async () => {
                setEmail('test@example.com');
                setPassword('password123');
                // Auto-submit after setting credentials
                setTimeout(() => {
                  handleSubmit();
                }, 100);
              }}
              style={styles.testButton}
            >
              <Text style={styles.testButtonText}>Quick Test Login</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  button: {
    marginTop: 8,
    paddingVertical: 8,
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  switchText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  testButton: {
    marginTop: 32,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    alignSelf: 'center',
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LoginScreen;