import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { Text, Card, Button, FAB, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';

import { useGetRecommendationsQuery } from '@/store/api/recommendationApi';
import { useGetOutfitsQuery } from '@/store/api/outfitApi';
import { useAppSelector } from '@/store';

const { width } = Dimensions.get('window');

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  location: string;
}

interface TodaySchedule {
  time: string;
  event: string;
  type: 'work' | 'casual' | 'formal' | 'date';
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 72,
    condition: 'Sunny',
    icon: 'weather-sunny',
    location: 'San Francisco, CA'
  });
  
  const [todaySchedule] = useState<TodaySchedule[]>([
    { time: '9:00 AM', event: 'Team Meeting', type: 'work' },
    { time: '1:00 PM', event: 'Lunch with Sarah', type: 'casual' },
    { time: '7:00 PM', event: 'Dinner Date', type: 'date' },
  ]);

  const { data: recommendations = [], isLoading: recommendationsLoading } = useGetRecommendationsQuery({
    maxResults: 3,
  });

  const { data: recentOutfits = [] } = useGetOutfitsQuery({});
  const user = useAppSelector(state => state.auth.user);

  const quickActions = [
    {
      id: 'ai-chat',
      label: 'Ask AI Stylist',
      icon: 'robot',
      color: '#6C63FF',
      onPress: () => navigation.navigate('AIChat' as never)
    },
    {
      id: 'virtual-tryon',
      label: 'Virtual Try-On',
      icon: 'auto-fix',
      color: '#FF6B6B',
      onPress: () => navigation.navigate('VirtualTryOn' as never)
    },
    {
      id: 'create-outfit',
      label: 'Create Outfit',
      icon: 'plus-circle',
      color: '#4ECDC4',
      onPress: () => navigation.navigate('CreateOutfit' as never)
    },
    {
      id: 'wardrobe',
      label: 'My Wardrobe',
      icon: 'wardrobe',
      color: '#FFE66D',
      onPress: () => navigation.navigate('Wardrobe' as never)
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'work': return 'briefcase';
      case 'casual': return 'coffee';
      case 'formal': return 'tuxedo';
      case 'date': return 'heart';
      default: return 'calendar';
    }
  };

  const generateQuickOutfitSuggestion = () => {
    const suggestions = [
      "Based on today's weather, try a light sweater with jeans!",
      "Perfect day for that floral dress you love!",
      "Your navy blazer would be great for today's meetings.",
      "Feeling casual? Your favorite t-shirt and denim combo awaits!",
    ];
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={() => {}} />}
      >
        {/* Header with Weather */}
        <LinearGradient colors={['#6C63FF', '#8B87FF']} style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.greetingSection}>
              <Text style={styles.greeting}>{getGreeting()}, {user?.firstName || 'there'}!</Text>
              <Text style={styles.date}>{format(new Date(), 'EEEE, MMMM d')}</Text>
            </View>
            
            <View style={styles.weatherCard}>
              <MaterialCommunityIcons name={weather.icon as any} size={32} color="#FFFFFF" />
              <View style={styles.weatherInfo}>
                <Text style={styles.temperature}>{weather.temperature}°F</Text>
                <Text style={styles.weatherCondition}>{weather.condition}</Text>
              </View>
            </View>
          </View>
          
          <Card style={styles.aiSuggestionCard}>
            <Card.Content style={styles.aiSuggestionContent}>
              <View style={styles.aiSuggestionHeader}>
                <MaterialCommunityIcons name="lightbulb" size={20} color="#6C63FF" />
                <Text style={styles.aiSuggestionTitle}>Today's AI Pick</Text>
              </View>
              <Text style={styles.aiSuggestionText}>{generateQuickOutfitSuggestion()}</Text>
              <Button 
                mode="contained" 
                compact 
                style={styles.aiSuggestionButton}
                onPress={() => navigation.navigate('AIChat' as never)}
              >
                Ask AI for More
              </Button>
            </Card.Content>
          </Card>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map(action => (
              <TouchableOpacity
                key={action.id}
                style={[styles.quickActionCard, { backgroundColor: action.color }]}
                onPress={action.onPress}
              >
                <MaterialCommunityIcons name={action.icon as any} size={28} color="#FFFFFF" />
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Today's Schedule */}
        <View style={styles.scheduleSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          
          {todaySchedule.map((event, index) => (
            <Card key={index} style={styles.scheduleCard}>
              <Card.Content style={styles.scheduleContent}>
                <View style={styles.scheduleTime}>
                  <Text style={styles.timeText}>{event.time}</Text>
                </View>
                <View style={styles.scheduleEvent}>
                  <View style={styles.eventHeader}>
                    <MaterialCommunityIcons 
                      name={getEventTypeIcon(event.type) as any} 
                      size={18} 
                      color="#6C63FF" 
                    />
                    <Text style={styles.eventText}>{event.event}</Text>
                  </View>
                  <Button 
                    mode="outlined" 
                    compact 
                    style={styles.outfitButton}
                    onPress={() => navigation.navigate('AIChat' as never)}
                  >
                    Get Outfit Ideas
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* AI Recommendations */}
        <View style={styles.recommendationsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AI Recommendations</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Recommendations' as never)}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recommendations.slice(0, 3).map((rec, index) => (
              <Card key={rec.id || index} style={styles.recommendationCard}>
                <Card.Content style={styles.recommendationContent}>
                  <View style={styles.recommendationHeader}>
                    <Text style={styles.recommendationTitle}>Outfit {index + 1}</Text>
                    <View style={styles.scoreContainer}>
                      <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
                      <Text style={styles.scoreText}>{Math.round((rec.score || 0.8) * 100)}%</Text>
                    </View>
                  </View>
                  
                  <View style={styles.outfitItems}>
                    {rec.items?.slice(0, 2).map(item => (
                      <View key={item.id} style={styles.itemPreview}>
                        <View style={styles.itemImagePlaceholder}>
                          <MaterialCommunityIcons name="tshirt-crew" size={20} color="#ccc" />
                        </View>
                      </View>
                    ))}
                  </View>
                  
                  <Text style={styles.recommendationReason} numberOfLines={2}>
                    {rec.reason || 'Perfect for today\'s weather and activities'}
                  </Text>
                  
                  <Button 
                    mode="contained" 
                    compact 
                    style={styles.tryOnButton}
                    onPress={() => navigation.navigate('VirtualTryOn' as never)}
                  >
                    Try On
                  </Button>
                </Card.Content>
              </Card>
            ))}
          </ScrollView>
        </View>

        {/* Recent Outfits */}
        <View style={styles.recentOutfitsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently Worn</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Outfits' as never)}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recentOutfits.slice(0, 3).map((outfit, index) => (
              <TouchableOpacity 
                key={outfit.id || index} 
                style={styles.recentOutfitCard}
                onPress={() => navigation.navigate('OutfitDetail' as never, { outfitId: outfit.id } as never)}
              >
                <View style={styles.outfitImagePlaceholder}>
                  <MaterialCommunityIcons name="hanger" size={32} color="#ccc" />
                </View>
                <Text style={styles.outfitName} numberOfLines={1}>
                  {outfit.name || `Outfit ${index + 1}`}
                </Text>
                <Text style={styles.outfitDate}>
                  {outfit.lastWorn ? format(new Date(outfit.lastWorn), 'MMM d') : '2 days ago'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Floating AI Assistant */}
      <FAB
        icon="robot"
        style={styles.aiFab}
        onPress={() => navigation.navigate('AIChat' as never)}
        label="Ask AI"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 16,
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  date: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  weatherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  weatherInfo: {
    marginLeft: 12,
  },
  temperature: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  weatherCondition: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  aiSuggestionCard: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    elevation: 4,
  },
  aiSuggestionContent: {
    paddingVertical: 16,
  },
  aiSuggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiSuggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C63FF',
    marginLeft: 8,
  },
  aiSuggestionText: {
    fontSize: 14,
    color: '#2D3436',
    marginBottom: 12,
    lineHeight: 20,
  },
  aiSuggestionButton: {
    backgroundColor: '#6C63FF',
    alignSelf: 'flex-start',
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#6C63FF',
    fontWeight: '500',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: (width - 56) / 2,
    height: 100,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  quickActionLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  scheduleSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  scheduleCard: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  scheduleContent: {
    paddingVertical: 12,
  },
  scheduleTime: {
    marginBottom: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  scheduleEvent: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2D3436',
    marginLeft: 8,
  },
  outfitButton: {
    alignSelf: 'flex-start',
    borderColor: '#6C63FF',
  },
  recommendationsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  recommendationCard: {
    width: 180,
    marginRight: 12,
    backgroundColor: '#FFFFFF',
  },
  recommendationContent: {
    paddingVertical: 12,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  outfitItems: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  itemPreview: {
    flex: 1,
  },
  itemImagePlaceholder: {
    height: 60,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationReason: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    lineHeight: 16,
  },
  tryOnButton: {
    backgroundColor: '#6C63FF',
  },
  recentOutfitsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 100,
  },
  recentOutfitCard: {
    width: 120,
    marginRight: 12,
    alignItems: 'center',
  },
  outfitImagePlaceholder: {
    width: 120,
    height: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
  },
  outfitName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2D3436',
    textAlign: 'center',
    marginBottom: 4,
  },
  outfitDate: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  aiFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 20,
    backgroundColor: '#6C63FF',
    elevation: 8,
  },
});

export default HomeScreen;