import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList, Animated, PanGestureHandler, State } from 'react-native';
import { Text, IconButton, TextInput, Button, Card, Chip, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';

import { OutfitStackParamList } from '@/navigation/TabNavigator';
import { useGetClothingQuery } from '@/store/api/clothingApi';
import { ClothingItem, ClothingCategory } from '@/types/clothing';

type CreateOutfitScreenNavigationProp = StackNavigationProp<OutfitStackParamList, 'CreateOutfit'>;

interface Props {
  navigation: CreateOutfitScreenNavigationProp;
}

interface DraggedItem {
  item: ClothingItem;
  position: Animated.ValueXY;
  scale: Animated.Value;
}

interface OutfitSlot {
  id: string;
  category: ClothingCategory;
  label: string;
  icon: string;
  item: ClothingItem | null;
}

const CreateOutfitScreen: React.FC<Props> = ({ navigation }) => {
  const [outfitName, setOutfitName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ClothingCategory | null>(null);
  const [outfitSlots, setOutfitSlots] = useState<OutfitSlot[]>([
    { id: 'top', category: ClothingCategory.TOPS, label: 'Top', icon: 'tshirt-crew', item: null },
    { id: 'bottom', category: ClothingCategory.BOTTOMS, label: 'Bottom', icon: 'human-male', item: null },
    { id: 'shoes', category: ClothingCategory.SHOES, label: 'Shoes', icon: 'shoe-heel', item: null },
    { id: 'outerwear', category: ClothingCategory.OUTERWEAR, label: 'Outerwear', icon: 'coat-rack', item: null },
  ]);
  const [isAIMode, setIsAIMode] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<ClothingItem[]>([]);

  const { data: clothing = [], isLoading } = useGetClothingQuery({
    category: selectedCategory,
  });

  const categories = [
    { label: 'All', value: null, icon: 'all-inclusive' },
    { label: 'Tops', value: ClothingCategory.TOPS, icon: 'tshirt-crew' },
    { label: 'Bottoms', value: ClothingCategory.BOTTOMS, icon: 'human-male' },
    { label: 'Dresses', value: ClothingCategory.DRESSES, icon: 'human-female' },
    { label: 'Outerwear', value: ClothingCategory.OUTERWEAR, icon: 'coat-rack' },
    { label: 'Shoes', value: ClothingCategory.SHOES, icon: 'shoe-heel' },
  ];

  const addItemToSlot = (item: ClothingItem, slotId: string) => {
    setOutfitSlots(prev => prev.map(slot => 
      slot.id === slotId ? { ...slot, item } : slot
    ));
  };

  const removeItemFromSlot = (slotId: string) => {
    setOutfitSlots(prev => prev.map(slot => 
      slot.id === slotId ? { ...slot, item: null } : slot
    ));
  };

  const generateAISuggestions = async () => {
    setIsAIMode(true);
    // Simulate AI suggestions based on current outfit
    const currentItems = outfitSlots.filter(slot => slot.item).map(slot => slot.item!);
    
    // Mock AI suggestions - in real app, this would call the AI service
    const suggestions = clothing.slice(0, 6);
    setAiSuggestions(suggestions);
  };

  const saveOutfit = async () => {
    const selectedItems = outfitSlots.filter(slot => slot.item).map(slot => slot.item!);
    
    if (selectedItems.length === 0) {
      return;
    }

    // Mock save - in real app, this would call the API
    console.log('Saving outfit:', { name: outfitName, items: selectedItems });
    navigation.goBack();
  };

  const renderClothingItem = ({ item }: { item: ClothingItem }) => (
    <TouchableOpacity
      style={styles.clothingItem}
      onLongPress={() => {
        // Handle drag start
      }}
    >
      <Image
        source={
          typeof item.images.thumbnail === 'number' 
            ? item.images.thumbnail 
            : { uri: item.images.thumbnail || item.images.original }
        }
        style={styles.clothingImage}
        contentFit="cover"
      />
      <Text style={styles.clothingName} numberOfLines={2}>{item.name}</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          // Auto-assign to appropriate slot
          const appropriateSlot = outfitSlots.find(slot => 
            slot.category === item.category && !slot.item
          );
          if (appropriateSlot) {
            addItemToSlot(item, appropriateSlot.id);
          }
        }}
      >
        <MaterialCommunityIcons name="plus" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderOutfitSlot = (slot: OutfitSlot) => (
    <Card key={slot.id} style={styles.outfitSlot}>
      <Card.Content style={styles.slotContent}>
        <View style={styles.slotHeader}>
          <MaterialCommunityIcons name={slot.icon as any} size={20} color="#6C63FF" />
          <Text style={styles.slotLabel}>{slot.label}</Text>
          {slot.item && (
            <TouchableOpacity onPress={() => removeItemFromSlot(slot.id)}>
              <MaterialCommunityIcons name="close" size={20} color="#FF6B6B" />
            </TouchableOpacity>
          )}
        </View>
        
        {slot.item ? (
          <View style={styles.slotWithItem}>
            <Image
              source={
                typeof slot.item.images.thumbnail === 'number' 
                  ? slot.item.images.thumbnail 
                  : { uri: slot.item.images.thumbnail || slot.item.images.original }
              }
              style={styles.slotItemImage}
              contentFit="cover"
            />
            <Text style={styles.slotItemName} numberOfLines={1}>{slot.item.name}</Text>
          </View>
        ) : (
          <View style={styles.emptySlot}>
            <MaterialCommunityIcons name="plus" size={32} color="#DDD" />
            <Text style={styles.emptySlotText}>Add {slot.label.toLowerCase()}</Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#6C63FF', '#8B87FF']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <IconButton icon="arrow-left" iconColor="#FFFFFF" onPress={() => navigation.goBack()} />
            <View>
              <Text style={styles.headerTitle}>Create Outfit</Text>
              <Text style={styles.headerSubtitle}>Mix and match your style</Text>
            </View>
          </View>
          <IconButton 
            icon={isAIMode ? "robot" : "auto-fix"} 
            iconColor="#FFFFFF" 
            onPress={generateAISuggestions}
          />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Outfit Name Input */}
        <View style={styles.nameSection}>
          <TextInput
            label="Outfit Name"
            value={outfitName}
            onChangeText={setOutfitName}
            placeholder="My awesome outfit"
            style={styles.nameInput}
            mode="outlined"
          />
        </View>

        {/* Outfit Builder */}
        <View style={styles.outfitBuilder}>
          <Text style={styles.sectionTitle}>Your Outfit</Text>
          <View style={styles.outfitSlots}>
            {outfitSlots.map(renderOutfitSlot)}
          </View>
          
          {isAIMode && (
            <Card style={styles.aiSuggestionsCard}>
              <Card.Content>
                <View style={styles.aiHeader}>
                  <MaterialCommunityIcons name="robot" size={24} color="#6C63FF" />
                  <Text style={styles.aiTitle}>AI Suggestions</Text>
                </View>
                <Text style={styles.aiSubtitle}>Based on your current selection</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.aiSuggestions}>
                  {aiSuggestions.map(item => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.aiSuggestionItem}
                      onPress={() => {
                        const slot = outfitSlots.find(s => s.category === item.category && !s.item);
                        if (slot) addItemToSlot(item, slot.id);
                      }}
                    >
                      <Image
                        source={{ uri: item.images.thumbnail || item.images.original }}
                        style={styles.aiSuggestionImage}
                        contentFit="cover"
                      />
                      <Text style={styles.aiSuggestionName} numberOfLines={1}>{item.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </Card.Content>
            </Card>
          )}
        </View>

        {/* Category Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Add Items</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
            {categories.map(category => (
              <TouchableOpacity
                key={category.label}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.value && styles.selectedChip
                ]}
                onPress={() => setSelectedCategory(category.value)}
              >
                <MaterialCommunityIcons 
                  name={category.icon as any} 
                  size={18} 
                  color={selectedCategory === category.value ? '#FFFFFF' : '#6C63FF'} 
                />
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.value && styles.selectedCategoryText
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Clothing Items */}
        <View style={styles.clothingSection}>
          <FlatList
            data={clothing}
            renderItem={renderClothingItem}
            keyExtractor={(item) => item.id}
            numColumns={3}
            contentContainerStyle={styles.clothingGrid}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.saveSection}>
        <Button
          mode="contained"
          onPress={saveOutfit}
          disabled={outfitSlots.every(slot => !slot.item)}
          style={styles.saveButton}
          contentStyle={styles.saveButtonContent}
        >
          Save Outfit
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  header: {
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
  },
  nameSection: {
    padding: 16,
  },
  nameInput: {
    backgroundColor: '#FFFFFF',
  },
  outfitBuilder: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 12,
  },
  outfitSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  outfitSlot: {
    width: '48%',
    backgroundColor: '#FFFFFF',
  },
  slotContent: {
    paddingVertical: 12,
  },
  slotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  slotLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
    flex: 1,
    marginLeft: 8,
  },
  slotWithItem: {
    alignItems: 'center',
  },
  slotItemImage: {
    width: 80,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  slotItemName: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  emptySlot: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  emptySlotText: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  aiSuggestionsCard: {
    marginTop: 16,
    backgroundColor: '#FAFBFF',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C63FF',
    marginLeft: 8,
  },
  aiSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  aiSuggestions: {
    flexDirection: 'row',
  },
  aiSuggestionItem: {
    width: 80,
    marginRight: 12,
    alignItems: 'center',
  },
  aiSuggestionImage: {
    width: 80,
    height: 100,
    borderRadius: 8,
    marginBottom: 4,
  },
  aiSuggestionName: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  filterSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryFilter: {
    flexDirection: 'row',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    gap: 6,
  },
  selectedChip: {
    backgroundColor: '#6C63FF',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6C63FF',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  clothingSection: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  clothingGrid: {
    paddingVertical: 8,
  },
  clothingItem: {
    flex: 1,
    margin: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    position: 'relative',
  },
  clothingImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  clothingName: {
    fontSize: 12,
    color: '#2D3436',
    textAlign: 'center',
    marginBottom: 8,
  },
  addButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#6C63FF',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  saveButton: {
    backgroundColor: '#6C63FF',
  },
  saveButtonContent: {
    paddingVertical: 8,
  },
});

export default CreateOutfitScreen;