import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Button, Chip, ActivityIndicator, Portal, Modal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useGetRecommendationsQuery } from '@/store/api/recommendationApi';
import { Occasion } from '@/types/clothing';
import { WeatherCondition, OutfitRecommendation } from '@/types/outfit';

// Use the enhanced OutfitRecommendation type
type Recommendation = OutfitRecommendation;

const RecommendationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion | null>(null);
  const [selectedWeather, setSelectedWeather] = useState<WeatherCondition | null>(null);
  const [showVirtualTryOnModal, setShowVirtualTryOnModal] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  
  const { data: recommendations = [], isLoading } = useGetRecommendationsQuery({
    occasion: selectedOccasion,
    weather: selectedWeather,
  });

  const occasions = [
    { value: null, label: 'All', icon: 'view-grid' },
    { value: Occasion.CASUAL, label: 'Casual', icon: 'tshirt-crew' },
    { value: Occasion.WORK, label: 'Work', icon: 'briefcase' },
    { value: Occasion.PARTY, label: 'Party', icon: 'party-popper' },
    { value: Occasion.DATE, label: 'Date', icon: 'heart' },
  ];

  const weatherOptions = [
    { value: null, label: 'Any', icon: 'weather-partly-cloudy' },
    { value: WeatherCondition.SUNNY, label: 'Sunny', icon: 'weather-sunny' },
    { value: WeatherCondition.RAINY, label: 'Rainy', icon: 'weather-rainy' },
    { value: WeatherCondition.COLD, label: 'Cold', icon: 'weather-snowy' },
  ];

  const handleVirtualTryOn = (recommendation: Recommendation) => {
    setSelectedRecommendation(recommendation);
    setShowVirtualTryOnModal(true);
  };

  const handleSaveOutfit = (recommendation: Recommendation) => {
    Alert.alert(
      'Save Outfit',
      'This outfit has been saved to your collection!',
      [{ text: 'OK' }]
    );
  };

  const handleTryOnWithUserPhoto = () => {
    setShowVirtualTryOnModal(false);
    // Navigate to virtual try-on with the full outfit
    if (selectedRecommendation?.items && selectedRecommendation.items.length > 0) {
      // For now, try on the first item - in a real app, this would composite all items
      navigation.navigate('VirtualTryOn' as never, { 
        itemId: selectedRecommendation.items[0].id 
      } as never);
    }
  };

  const renderVirtualTryOnModal = () => (
    <Portal>
      <Modal
        visible={showVirtualTryOnModal}
        onDismiss={() => setShowVirtualTryOnModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Card style={styles.modalCard}>
          <Card.Content>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons name="auto-fix" size={28} color="#6C63FF" />
              <Text style={styles.modalTitle}>Virtual Try-On</Text>
            </View>
            
            <Text style={styles.modalSubtitle}>
              Try on "{selectedRecommendation?.reason || 'this outfit'}"
            </Text>
            
            {selectedRecommendation?.items && (
              <View style={styles.outfitPreview}>
                {selectedRecommendation.items.slice(0, 4).map((item, index) => (
                  <Image
                    key={item.id}
                    source={{ uri: item.images?.thumbnail || item.images?.original }}
                    style={styles.outfitItemImage}
                    contentFit="cover"
                  />
                ))}
              </View>
            )}
            
            <View style={styles.modalActions}>
              <Button
                mode="contained"
                onPress={handleTryOnWithUserPhoto}
                style={styles.tryOnButton}
                icon="camera"
              >
                Use Camera
              </Button>
              <Button
                mode="outlined"
                onPress={() => {
                  setShowVirtualTryOnModal(false);
                  // Navigate to user photos to select an existing photo
                  navigation.navigate('UserPhotos' as never);
                }}
                icon="image"
              >
                Choose Photo
              </Button>
            </View>
            
            <Text style={styles.modalNote}>
              💡 Tip: For best results, use a full-body photo with good lighting
            </Text>
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Discover Outfits</Text>
          <Text style={styles.subtitle}>AI-powered recommendations just for you</Text>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Occasion</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {occasions.map((occasion) => (
              <Chip
                key={occasion.label}
                selected={selectedOccasion === occasion.value}
                onPress={() => setSelectedOccasion(occasion.value)}
                style={styles.filterChip}
                icon={occasion.icon}
              >
                {occasion.label}
              </Chip>
            ))}
          </ScrollView>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Weather</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {weatherOptions.map((weather) => (
              <Chip
                key={weather.label}
                selected={selectedWeather === weather.value}
                onPress={() => setSelectedWeather(weather.value)}
                style={styles.filterChip}
                icon={weather.icon}
              >
                {weather.label}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6C63FF" />
            <Text style={styles.loadingText}>Creating perfect outfits...</Text>
          </View>
        ) : (
          <View style={styles.recommendationsContainer}>
            {recommendations.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Card.Content style={styles.emptyContent}>
                  <MaterialCommunityIcons name="wardrobe-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>No recommendations yet</Text>
                  <Text style={styles.emptySubtext}>
                    Add more items to your wardrobe to get personalized suggestions
                  </Text>
                </Card.Content>
              </Card>
            ) : (
              recommendations.map((rec, index) => (
                <Card key={rec.id} style={styles.recommendationCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Outfit Suggestion {index + 1}</Text>
                    <View style={styles.scoreContainer}>
                      <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                      <Text style={styles.score}>{(rec.score * 100).toFixed(0)}%</Text>
                    </View>
                  </View>
                  
                  <View style={styles.itemsContainer}>
                    {rec.outfit?.items?.slice(0, 3).map((outfitItem) => (
                      <Image
                        key={outfitItem.itemId}
                        source={{ uri: outfitItem.item?.images.thumbnail || outfitItem.item?.images.original }}
                        style={styles.itemImage}
                        contentFit="cover"
                      />
                    ))}
                    {rec.outfit?.items && rec.outfit.items.length > 3 && (
                      <View style={styles.moreItems}>
                        <Text style={styles.moreItemsText}>+{rec.outfit.items.length - 3}</Text>
                      </View>
                    )}
                  </View>
                  
                  <Card.Content>
                    <Text style={styles.reason}>{rec.reason}</Text>
                    
                    {/* Styling tips section removed as per new OutfitRecommendation structure */}
                  </Card.Content>
                  
                  <Card.Actions>
                    <Button 
                      mode="outlined" 
                      onPress={() => handleVirtualTryOn(rec)}
                      icon="auto-fix"
                      compact
                    >
                      Try On Outfit
                    </Button>
                    <Button 
                      mode="contained" 
                      onPress={() => handleSaveOutfit(rec)}
                      icon="heart-outline"
                      compact
                    >
                      Save Outfit
                    </Button>
                  </Card.Actions>
                </Card>
              ))
            )}
          </View>
        )}
      </ScrollView>
      {renderVirtualTryOnModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  filterSection: {
    paddingVertical: 8,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  filterChip: {
    marginRight: 8,
  },
  loadingContainer: {
    paddingTop: 100,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  recommendationsContainer: {
    padding: 16,
  },
  recommendationCard: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  score: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  itemsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  itemImage: {
    width: 80,
    height: 100,
    borderRadius: 8,
  },
  moreItems: {
    width: 80,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreItemsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  reason: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  tipsContainer: {
    marginTop: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  emptyCard: {
    marginTop: 32,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 48,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3436',
    marginLeft: 12,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  outfitPreview: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  outfitItemImage: {
    width: 60,
    height: 80,
    borderRadius: 8,
  },
  modalActions: {
    gap: 12,
    marginBottom: 16,
  },
  tryOnButton: {
    backgroundColor: '#6C63FF',
  },
  modalNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default RecommendationsScreen;