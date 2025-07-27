import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Avatar, List, Card, Button, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppSelector, useAppDispatch } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { authApi } from '@/services/auth';

const ProfileScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = async () => {
    await authApi.logout();
    dispatch(logout());
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        <View style={styles.header}>
          <Avatar.Text 
            size={80} 
            label={user ? `${user.firstName[0]}${user.lastName[0]}` : 'U'} 
            style={styles.avatar}
          />
          <Text style={styles.name}>
            {user ? `${user.firstName} ${user.lastName}` : 'User'}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <Card style={styles.statsCard}>
          <Card.Content>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Items</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Outfits</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>$0</Text>
                <Text style={styles.statLabel}>Value</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.section}>
          <List.Item
            title="Style Preferences"
            description="Manage your style personality"
            left={(props) => <List.Icon {...props} icon="palette" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
          <Divider />
          <List.Item
            title="Sizing Information"
            description="Update your measurements"
            left={(props) => <List.Icon {...props} icon="ruler" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
          <Divider />
          <List.Item
            title="My Try-On Photos"
            description="Manage your saved photos for virtual try-on"
            left={(props) => <List.Icon {...props} icon="camera-account" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
          <Divider />
          <List.Item
            title="Wardrobe Analytics"
            description="View your wardrobe insights"
            left={(props) => <List.Icon {...props} icon="chart-bar" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
        </View>

        <View style={styles.section}>
          <List.Item
            title="Notifications"
            description="Manage notification preferences"
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
          <Divider />
          <List.Item
            title="Privacy & Security"
            description="Manage your data and privacy"
            left={(props) => <List.Icon {...props} icon="lock" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
          <Divider />
          <List.Item
            title="Help & Support"
            description="Get help and contact support"
            left={(props) => <List.Icon {...props} icon="help-circle" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={handleLogout}
            style={styles.logoutButton}
            textColor="#FF6B6B"
          >
            Sign Out
          </Button>
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
  section: {
    backgroundColor: '#fff',
    marginVertical: 8,
  },
  buttonContainer: {
    padding: 16,
  },
  logoutButton: {
    borderColor: '#FF6B6B',
  },
});

export default ProfileScreen;