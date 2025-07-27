import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Chip, IconButton, Menu, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';

import { WardrobeStackParamList } from '@/navigation/TabNavigator';
import { useGetClothingItemQuery, useDeleteClothingMutation, useMarkAsWornMutation } from '@/store/api/clothingApi';

type ClothingDetailScreenNavigationProp = StackNavigationProp<WardrobeStackParamList, 'ClothingDetail'>;
type ClothingDetailScreenRouteProp = RouteProp<WardrobeStackParamList, 'ClothingDetail'>;

interface Props {
  navigation: ClothingDetailScreenNavigationProp;
  route: ClothingDetailScreenRouteProp;
}

const ClothingDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { itemId } = route.params;
  const [menuVisible, setMenuVisible] = useState(false);
  
  const { data: item, isLoading } = useGetClothingItemQuery(itemId);
  const [deleteItem] = useDeleteClothingMutation();
  const [markAsWorn] = useMarkAsWornMutation();

  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item from your wardrobe?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteItem(itemId).unwrap();
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  const handleMarkAsWorn = async () => {
    try {
      await markAsWorn(itemId).unwrap();
      Alert.alert('Success', 'Item marked as worn!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update wear count');
    }
  };

  if (isLoading || !item) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView>
        <View style={styles.imageContainer}>
          <Image
            source={
              typeof item.images.processed === 'number' || typeof item.images.original === 'number' || typeof item.images.thumbnail === 'number'
                ? item.images.processed || item.images.original || item.images.thumbnail
                : { uri: item.images.processed || item.images.original || item.images.thumbnail }
            }
            style={styles.image}
            contentFit="cover"
          />
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor="#fff"
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          />
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon="dots-vertical"
                size={24}
                iconColor="#fff"
                style={styles.menuButton}
                onPress={() => setMenuVisible(true)}
              />
            }
          >
            <Menu.Item onPress={() => {}} title="Edit" />
            <Menu.Item onPress={handleDelete} title="Delete" />
          </Menu>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.name}>{item.name}</Text>
              {item.brand && <Text style={styles.brand}>{item.brand}</Text>}
            </View>
            {item.isFavorite && (
              <MaterialCommunityIcons name="heart" size={24} color="#FF6B6B" />
            )}
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <MaterialCommunityIcons name="hanger" size={20} color="#666" />
              <Text style={styles.statText}>Worn {item.wearCount} times</Text>
            </View>
            {item.lastWorn && (
              <View style={styles.stat}>
                <MaterialCommunityIcons name="calendar" size={20} color="#666" />
                <Text style={styles.statText}>
                  Last worn {format(new Date(item.lastWorn), 'MMM d, yyyy')}
                </Text>
              </View>
            )}
            {item.cost && (
              <View style={styles.stat}>
                <Text style={styles.statText}>
                  Cost per wear: ${(item.cost / (item.wearCount || 1)).toFixed(2)}
                </Text>
              </View>
            )}
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category:</Text>
              <Text style={styles.detailValue}>{item.category}</Text>
            </View>
            {item.size && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Size:</Text>
                <Text style={styles.detailValue}>{item.size}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Color:</Text>
              <View style={styles.colorContainer}>
                <View style={[styles.colorSwatch, { backgroundColor: item.color.primary }]} />
                <Text style={styles.detailValue}>{item.color.primary}</Text>
              </View>
            </View>
            {item.purchaseDate && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Purchased:</Text>
                <Text style={styles.detailValue}>
                  {format(new Date(item.purchaseDate), 'MMM d, yyyy')}
                </Text>
              </View>
            )}
          </View>

          {item.season.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Season</Text>
              <View style={styles.chipContainer}>
                {item.season.map(season => (
                  <Chip key={season} style={styles.chip}>
                    {season}
                  </Chip>
                ))}
              </View>
            </View>
          )}

          {item.occasion.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Occasion</Text>
              <View style={styles.chipContainer}>
                {item.occasion.map(occasion => (
                  <Chip key={occasion} style={styles.chip}>
                    {occasion}
                  </Chip>
                ))}
              </View>
            </View>
          )}

          {item.tags.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.chipContainer}>
                {item.tags.map(tag => (
                  <Chip key={tag} style={styles.chip}>
                    {tag}
                  </Chip>
                ))}
              </View>
            </View>
          )}

          {item.notes && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.notes}>{item.notes}</Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleMarkAsWorn}
              style={styles.button}
              icon="hanger"
            >
              Mark as Worn
            </Button>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('VirtualTryOn', { itemId })}
              style={styles.button}
              icon="camera"
            >
              Try On
            </Button>
          </View>
          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => {}}
              style={{ flex: 1 }}
              icon="plus"
            >
              Add to Outfit
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    height: 400,
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  brand: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  statsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    marginVertical: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1A1A1A',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  colorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 4,
  },
  notes: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  button: {
    flex: 1,
  },
});

export default ClothingDetailScreen;