import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, FAB, Chip, Card, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';

import { OutfitStackParamList } from '@/navigation/TabNavigator';
import { useGetOutfitsQuery } from '@/store/api/outfitApi';
import { Outfit } from '@/types/outfit';

type OutfitsScreenNavigationProp = StackNavigationProp<OutfitStackParamList, 'OutfitsMain'>;

interface Props {
  navigation: OutfitsScreenNavigationProp;
}

const OutfitsScreen: React.FC<Props> = ({ navigation }) => {
  const [filterFavorites, setFilterFavorites] = useState(false);
  const { data: outfits = [], isLoading, refetch } = useGetOutfitsQuery({
    isFavorite: filterFavorites || undefined,
  });

  const renderOutfit = ({ item }: { item: Outfit }) => (
    <TouchableOpacity
      style={styles.outfitCard}
      onPress={() => navigation.navigate('OutfitDetail', { outfitId: item.id })}
    >
      <Card style={styles.card}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.outfitImage} contentFit="cover" />
        ) : (
          <View style={styles.placeholderImage}>
            <MaterialCommunityIcons name="hanger" size={48} color="#ccc" />
          </View>
        )}
        
        <Card.Content style={styles.cardContent}>
          <View style={styles.outfitHeader}>
            <Text style={styles.outfitName} numberOfLines={1}>
              {item.name}
            </Text>
            {item.isFavorite && (
              <MaterialCommunityIcons name="heart" size={16} color="#FF6B6B" />
            )}
          </View>
          
          <View style={styles.outfitInfo}>
            <Text style={styles.itemCount}>{item.items.length} items</Text>
            {item.lastWorn && (
              <Text style={styles.lastWorn}>
                Worn {format(new Date(item.lastWorn), 'MMM d')}
              </Text>
            )}
          </View>
          
          <View style={styles.chipRow}>
            {item.occasion && (
              <Chip compact style={styles.chip}>
                {item.occasion}
              </Chip>
            )}
            {item.season && (
              <Chip compact style={styles.chip}>
                {item.season}
              </Chip>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Outfits</Text>
        <View style={styles.headerRight}>
          <Chip
            selected={filterFavorites}
            onPress={() => setFilterFavorites(!filterFavorites)}
            style={styles.filterChip}
          >
            Favorites
          </Chip>
        </View>
      </View>

      <FlatList
        data={outfits}
        renderItem={renderOutfit}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="wardrobe-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No outfits yet</Text>
            <Text style={styles.emptySubtext}>
              Create your first outfit by tapping the + button
            </Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateOutfit')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    marginLeft: 8,
  },
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 80,
  },
  row: {
    justifyContent: 'space-between',
  },
  outfitCard: {
    flex: 1,
    padding: 8,
  },
  card: {
    overflow: 'hidden',
  },
  outfitImage: {
    width: '100%',
    height: 200,
  },
  placeholderImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    paddingTop: 12,
  },
  outfitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  outfitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
  },
  outfitInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemCount: {
    fontSize: 12,
    color: '#666',
  },
  lastWorn: {
    fontSize: 12,
    color: '#666',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 4,
  },
  chip: {
    height: 24,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6C63FF',
  },
});

export default OutfitsScreen;