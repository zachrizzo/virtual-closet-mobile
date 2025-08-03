import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Avatar, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ProfileScreenProps {
  onLogout: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout }) => {
  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('@auth_token');
            onLogout();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        <View style={styles.header}>
          <Avatar.Text 
            size={80} 
            label="JD" 
            style={styles.avatar}
          />
          <Text style={styles.name}>Jane Doe</Text>
          <Text style={styles.email}>jane.doe@example.com</Text>
        </View>

        <View style={styles.signOutContainer}>
          <Button
            mode="outlined"
            onPress={handleLogout}
            style={styles.logoutButton}
            textColor="#FF6B6B"
          >
            Sign Out
          </Button>
        </View>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Virtual Closet v1.0.0</Text>
          <Text style={styles.versionText}>Ultra MVP</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#fff',
  },
  avatar: {
    backgroundColor: '#6C63FF',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  statsCard: {
    margin: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  signOutContainer: {
    padding: 16,
    marginTop: 32,
  },
  logoutButton: {
    borderColor: '#FF6B6B',
  },
  versionContainer: {
    alignItems: 'center',
    padding: 32,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
});

export default ProfileScreen;