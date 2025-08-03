import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ScrollView, StatusBar, Platform } from 'react-native';
import { Text, FAB, Chip, Searchbar, Card, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { WardrobeStackParamList } from '@/navigation/TabNavigator';
import { ClothingItem, ClothingCategory } from '@/types/clothing';
import { unifiedAPI } from '@/services/api/unifiedService';

type WardrobeScreenNavigationProp = StackNavigationProp<WardrobeStackParamList, 'WardrobeMain'>;

interface Props {
  navigation: WardrobeScreenNavigationProp;
}

const categories = [
  { label: 'All', value: null, icon: 'all-inclusive' },
  { label: 'Tops', value: ClothingCategory.TOPS, icon: 'tshirt-crew' },
  { label: 'Bottoms', value: ClothingCategory.BOTTOMS, icon: 'human-male' },
  { label: 'Dresses', value: ClothingCategory.DRESSES, icon: 'human-female' },
  { label: 'Outerwear', value: ClothingCategory.OUTERWEAR, icon: 'coat-rack' },
  { label: 'Shoes', value: ClothingCategory.SHOES, icon: 'shoe-heel' },
];

const WardrobeScreen: React.FC<Props> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ClothingCategory | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'items' | 'outfits'>('items');
  
  const [clothing, setClothing] = useState<ClothingItem[]>([]);
  const [outfits, setOutfits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load clothing items
  useEffect(() => {
    loadClothing();
  }, [selectedCategory]);

  const loadClothing = async () => {
    try {
      setIsLoading(true);
      const items = await unifiedAPI.wardrobe.getItems();
      setClothing(items);
    } catch (error) {
      console.error('Error loading clothing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = async () => {
    setIsRefreshing(true);
    await loadClothing();
    setIsRefreshing(false);
  };

  const filteredClothing = clothing.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderClothingItem = ({ item }: { item: ClothingItem }) => {
    return (
      <TouchableOpacity
        style={viewMode === 'grid' ? styles.itemContainer : styles.listItemContainer}
        onPress={() => navigation.navigate('VirtualTryOn', { itemId: item.id })}
      >
        <Card style={viewMode === 'grid' ? styles.card : styles.listCard}>
          <View style={viewMode === 'grid' ? styles.cardContent : styles.listCardContent}>
            <Image
              source={
                typeof item.images.thumbnail === 'number' || typeof item.images.original === 'number'
                  ? item.images.thumbnail || item.images.original
                  : { uri: item.images.thumbnail || item.images.original || '' }
              }
              style={viewMode === 'grid' ? styles.itemImage : styles.listItemImage}
              contentFit="cover"
              placeholder={null}
            />
          {item.isFavorite && (
            <View style={styles.favoriteIcon}>
              <MaterialCommunityIcons name="heart" size={16} color="#FF6B6B" />
            </View>
          )}
          <View style={viewMode === 'grid' ? styles.itemInfo : styles.listItemInfo}>
            <Text style={styles.itemName} numberOfLines={viewMode === 'grid' ? 1 : 2}>
              {item.name}
            </Text>
            {item.brand && (
              <Text style={styles.itemBrand} numberOfLines={1}>
                {item.brand}
              </Text>
            )}
            <View style={styles.itemStats}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="hanger" size={14} color="#666" />
                <Text style={styles.statText}>{item.wearCount || 0}</Text>
              </View>
              {item.color?.primary && (
                <View style={[styles.colorDot, { backgroundColor: item.color.primary.hex || item.color.primary.name }]} />
              )}
              {viewMode === 'list' && item.size && (
                <Text style={styles.sizeText}>Size {item.size}</Text>
              )}
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

  const stats = {
    total: clothing.length,
    favorites: clothing.filter(item => item.isFavorite).length,
    recentlyWorn: clothing.filter(item => item.lastWorn).length,
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6C63FF" />
      <LinearGradient
        colors={['#6C63FF', '#8B87FF']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>My Closet</Text>
            <Text style={styles.subtitle}>
              {activeTab === 'items' 
                ? `${stats.total} items • ${stats.favorites} favorites`
                : `${outfits.length} outfits • ${outfits.filter(o => o.isFavorite).length} favorites`
              }
            </Text>
          </View>
          <View style={styles.headerActions}>
            {activeTab === 'items' && (
              <IconButton
                icon={viewMode === 'grid' ? 'view-list' : 'view-grid'}
                size={24}
                iconColor="#FFFFFF"
                onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              />
            )}
          </View>
        </View>

        {/* Tab Toggle */}
        <View style={styles.tabToggle}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'items' && styles.activeTabButton]}
            onPress={() => setActiveTab('items')}
          >
            <MaterialCommunityIcons 
              name="tshirt-crew" 
              size={20} 
              color={activeTab === 'items' ? '#6C63FF' : '#FFFFFF'} 
            />
            <Text style={[styles.tabButtonText, activeTab === 'items' && styles.activeTabButtonText]}>
              Items
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'outfits' && styles.activeTabButton]}
            onPress={() => setActiveTab('outfits')}
          >
            <MaterialCommunityIcons 
              name="hanger" 
              size={20} 
              color={activeTab === 'outfits' ? '#6C63FF' : '#FFFFFF'} 
            />
            <Text style={[styles.tabButtonText, activeTab === 'outfits' && styles.activeTabButtonText]}>
              Outfits
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons 
              name={activeTab === 'items' ? "wardrobe" : "hanger"} 
              size={18} 
              color="#FFFFFF" 
            />
            <Text style={styles.statNumber}>
              {activeTab === 'items' ? stats.total : outfits.length}
            </Text>
            <Text style={styles.statLabel}>
              {activeTab === 'items' ? 'Items' : 'Outfits'}
            </Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="heart" size={18} color="#FFFFFF" />
            <Text style={styles.statNumber}>
              {activeTab === 'items' 
                ? stats.favorites 
                : outfits.filter(o => o.isFavorite).length
              }
            </Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="clock-outline" size={18} color="#FFFFFF" />
            <Text style={styles.statNumber}>
              {activeTab === 'items' 
                ? stats.recentlyWorn 
                : outfits.filter(o => o.lastWorn).length
              }
            </Text>
            <Text style={styles.statLabel}>Recent</Text>
          </View>
        </View>
      </LinearGradient>

      {activeTab === 'items' ? (
        <>
          <View style={styles.searchSection}>
            <Searchbar
              placeholder="Search items, brands, or tags..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
              icon="magnify"
            />
          </View>

          <View style={styles.filterWrapper}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.filterContainer}
              contentContainerStyle={styles.filterContent}
            >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.label}
                onPress={() => setSelectedCategory(category.value)}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.value && styles.selectedChip
                ]}
              >
                <MaterialCommunityIcons 
                  name={category.icon as any} 
                  size={20} 
                  color={selectedCategory === category.value ? '#FFFFFF' : '#6C63FF'} 
                />
                <Text style={[
                  styles.chipText,
                  selectedCategory === category.value && styles.selectedChipText
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
            </ScrollView>
          </View>

          <FlatList
            data={filteredClothing}
            renderItem={renderClothingItem}
            keyExtractor={(item) => item.id}
            numColumns={viewMode === 'grid' ? 2 : 1}
            key={viewMode}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl 
                refreshing={isRefreshing} 
                onRefresh={refetch}
                tintColor="#6C63FF"
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="wardrobe-outline" size={80} color="#E0E0E0" />
                <Text style={styles.emptyText}>
                  {searchQuery
                    ? 'No items match your search'
                    : selectedCategory
                    ? 'No items in this category'
                    : 'Your wardrobe is empty'}
                </Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Tap the + button to add your first item'}
                </Text>
              </View>
            }
          />
        </>
      ) : (
        <View style={styles.outfitsContainer}>
          <View style={styles.outfitsHeader}>
            <Text style={styles.outfitsTitle}>Your Outfits</Text>
          </View>
          
          {outfits.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="hanger" size={80} color="#E0E0E0" />
              <Text style={styles.emptyText}>No outfits yet</Text>
              <Text style={styles.emptySubtext}>Create your first outfit</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.outfitsList} showsVerticalScrollIndicator={false}>
              {outfits.slice(0, 6).map((outfit) => (
                <TouchableOpacity
                  key={outfit.id}
                  style={styles.outfitItem}
                  onPress={() => {/* TODO: Outfit detail */}}
                >
                  <View style={styles.outfitImagePlaceholder}>
                    <MaterialCommunityIcons name="hanger" size={32} color="#ccc" />
                  </View>
                  <Text style={styles.outfitItemName} numberOfLines={1}>{outfit.name}</Text>
                  <Text style={styles.outfitItemInfo}>
                    {outfit.itemIds.length} items
                    {outfit.isFavorite && ' • ❤️'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      <FAB
        icon={activeTab === 'items' ? 'plus' : 'hanger'}
        style={styles.fab}
        onPress={() => activeTab === 'items' 
          ? navigation.navigate('AddClothing')
          : {}
        }
        color="#FFFFFF"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  headerGradient: {
    paddingBottom: 10,
    paddingTop: Platform.OS === 'ios' ? 45 : StatusBar.currentHeight ? StatusBar.currentHeight + 5 : 25,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  tabToggle: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  activeTabButton: {
    backgroundColor: '#FFFFFF',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  activeTabButtonText: {
    color: '#6C63FF',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 2,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  filterWrapper: {
    height: 68,
    marginBottom: 10,
  },
  filterContainer: {
    flex: 1,
  },
  filterContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    marginRight: 12,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedChip: {
    backgroundColor: '#6C63FF',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C63FF',
  },
  selectedChipText: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 100,
  },
  itemContainer: {
    flex: 1,
    padding: 8,
  },
  listItemContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  card: {
    elevation: 3,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  listCard: {
    elevation: 3,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  cardContent: {
    flex: 1,
  },
  listCardContent: {
    flexDirection: 'row',
  },
  itemImage: {
    width: '100%',
    height: 200,
  },
  listItemImage: {
    width: 100,
    height: 100,
  },
  favoriteIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 6,
  },
  itemInfo: {
    padding: 12,
  },
  listItemInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
  },
  itemBrand: {
    fontSize: 14,
    color: '#636E72',
    marginTop: 2,
  },
  itemStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#636E72',
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sizeText: {
    fontSize: 12,
    color: '#636E72',
    backgroundColor: '#F5F6FA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#636E72',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#B2BEC3',
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 20,
    backgroundColor: '#6C63FF',
    elevation: 8,
  },
  debugButton: {
    marginTop: 20,
    backgroundColor: '#6C63FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  debugButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  outfitsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  outfitsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  outfitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
  },
  viewAllText: {
    fontSize: 14,
    color: '#6C63FF',
    fontWeight: '500',
  },
  outfitsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 100,
  },
  outfitItem: {
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
  },
  outfitImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  outfitItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2D3436',
    textAlign: 'center',
    marginBottom: 4,
  },
  outfitItemInfo: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default WardrobeScreen;