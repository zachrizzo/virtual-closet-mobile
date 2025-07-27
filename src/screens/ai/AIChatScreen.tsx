import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { Text, TextInput, IconButton, Card, Chip, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  message: string;
  timestamp: Date;
  suggestions?: OutfitSuggestion[];
  quickActions?: QuickAction[];
}

interface OutfitSuggestion {
  id: string;
  name: string;
  items: Array<{
    id: string;
    name: string;
    image: string;
  }>;
  confidence: number;
  reason: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: string;
}

const AIChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      message: "Hi! I'm your AI stylist. What can I help you with today? 👗✨",
      timestamp: new Date(),
      quickActions: [
        { id: '1', label: 'Outfit for today', icon: 'weather-sunny', action: 'today_outfit' },
        { id: '2', label: 'Date night look', icon: 'heart', action: 'date_night' },
        { id: '3', label: 'Work outfit', icon: 'briefcase', action: 'work_outfit' },
        { id: '4', label: 'Casual weekend', icon: 'sofa', action: 'casual_weekend' },
      ]
    }
  ]);
  
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingAnimation = useRef(new Animated.Value(0)).current;

  const quickPrompts = [
    "What should I wear today?",
    "Help me pick a date outfit",
    "I need something for work",
    "Show me casual looks",
    "What goes with my blue jeans?",
    "I have a party tonight",
  ];

  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnimation, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(typingAnimation, { toValue: 0, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      typingAnimation.setValue(0);
    }
  }, [isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(text);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 2000);
  };

  const generateAIResponse = (userText: string): ChatMessage => {
    const lowerText = userText.toLowerCase();
    
    if (lowerText.includes('today') || lowerText.includes('what should i wear')) {
      return {
        id: Date.now().toString(),
        type: 'ai',
        message: "Based on today's weather and your schedule, here are some perfect outfits! ☀️",
        timestamp: new Date(),
        suggestions: [
          {
            id: '1',
            name: 'Casual Chic',
            items: [
              { id: '1', name: 'White Blouse', image: 'https://example.com/blouse.jpg' },
              { id: '2', name: 'Blue Jeans', image: 'https://example.com/jeans.jpg' },
              { id: '3', name: 'Sneakers', image: 'https://example.com/sneakers.jpg' },
            ],
            confidence: 0.92,
            reason: 'Perfect for the sunny weather and your casual meetings today'
          },
          {
            id: '2',
            name: 'Professional Look',
            items: [
              { id: '4', name: 'Black Blazer', image: 'https://example.com/blazer.jpg' },
              { id: '5', name: 'White Shirt', image: 'https://example.com/shirt.jpg' },
              { id: '6', name: 'Dark Pants', image: 'https://example.com/pants.jpg' },
            ],
            confidence: 0.88,
            reason: 'Great for your 2 PM meeting, looks polished and confident'
          }
        ]
      };
    }

    if (lowerText.includes('date') || lowerText.includes('romantic')) {
      return {
        id: Date.now().toString(),
        type: 'ai',
        message: "For a date night, you want to look stunning yet comfortable! Here are my top picks: 💕",
        timestamp: new Date(),
        suggestions: [
          {
            id: '3',
            name: 'Elegant Evening',
            items: [
              { id: '7', name: 'Little Black Dress', image: 'https://example.com/dress.jpg' },
              { id: '8', name: 'Heels', image: 'https://example.com/heels.jpg' },
              { id: '9', name: 'Gold Jewelry', image: 'https://example.com/jewelry.jpg' },
            ],
            confidence: 0.95,
            reason: 'Classic, elegant, and always impressive for date nights'
          }
        ]
      };
    }

    return {
      id: Date.now().toString(),
      type: 'ai',
      message: "I'd love to help you with that! Can you tell me more about the occasion or what style you're going for? 🤔",
      timestamp: new Date(),
      quickActions: [
        { id: '5', label: 'Casual day out', icon: 'walk', action: 'casual' },
        { id: '6', label: 'Formal event', icon: 'tuxedo', action: 'formal' },
        { id: '7', label: 'Workout', icon: 'dumbbell', action: 'workout' },
        { id: '8', label: 'Travel', icon: 'airplane', action: 'travel' },
      ]
    };
  };

  const handleQuickAction = (action: string) => {
    const actionMap: { [key: string]: string } = {
      'today_outfit': 'What should I wear today?',
      'date_night': 'Help me pick a date night outfit',
      'work_outfit': 'I need a professional work outfit',
      'casual_weekend': 'Show me casual weekend looks',
      'casual': 'I want a casual outfit for going out',
      'formal': 'I need a formal outfit for an event',
      'workout': 'What should I wear for working out?',
      'travel': 'Help me pick travel outfits',
    };
    
    sendMessage(actionMap[action] || action);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[styles.messageContainer, item.type === 'user' ? styles.userMessage : styles.aiMessage]}>
      {item.type === 'ai' && (
        <View style={styles.aiAvatar}>
          <MaterialCommunityIcons name="robot" size={20} color="#6C63FF" />
        </View>
      )}
      
      <View style={[styles.messageBubble, item.type === 'user' ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.messageText, item.type === 'user' ? styles.userText : styles.aiText]}>
          {item.message}
        </Text>
        
        {item.quickActions && (
          <View style={styles.quickActionsContainer}>
            {item.quickActions.map(action => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionButton}
                onPress={() => handleQuickAction(action.action)}
              >
                <MaterialCommunityIcons name={action.icon as any} size={16} color="#6C63FF" />
                <Text style={styles.quickActionText}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {item.suggestions && (
          <View style={styles.suggestionsContainer}>
            {item.suggestions.map(suggestion => (
              <Card key={suggestion.id} style={styles.suggestionCard}>
                <Card.Content style={styles.suggestionContent}>
                  <View style={styles.suggestionHeader}>
                    <Text style={styles.suggestionName}>{suggestion.name}</Text>
                    <View style={styles.confidenceContainer}>
                      <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
                      <Text style={styles.confidenceText}>{Math.round(suggestion.confidence * 100)}%</Text>
                    </View>
                  </View>
                  
                  <View style={styles.itemsRow}>
                    {suggestion.items.slice(0, 3).map(item => (
                      <View key={item.id} style={styles.itemPreview}>
                        <View style={styles.itemImagePlaceholder}>
                          <MaterialCommunityIcons name="tshirt-crew" size={24} color="#ccc" />
                        </View>
                        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                      </View>
                    ))}
                  </View>
                  
                  <Text style={styles.suggestionReason}>{suggestion.reason}</Text>
                  
                  <View style={styles.suggestionActions}>
                    <Button mode="contained" compact style={styles.tryOnButton}>
                      Try On
                    </Button>
                    <Button mode="outlined" compact style={styles.saveButton}>
                      Save Outfit
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
      </View>
      
      {item.type === 'user' && (
        <View style={styles.userAvatar}>
          <MaterialCommunityIcons name="account" size={20} color="#FFFFFF" />
        </View>
      )}
    </View>
  );

  const renderTypingIndicator = () => {
    if (!isTyping) return null;
    
    return (
      <View style={[styles.messageContainer, styles.aiMessage]}>
        <View style={styles.aiAvatar}>
          <MaterialCommunityIcons name="robot" size={20} color="#6C63FF" />
        </View>
        <View style={[styles.messageBubble, styles.aiBubble, styles.typingBubble]}>
          <Animated.View style={[styles.typingDots, { opacity: typingAnimation }]}>
            <Text style={styles.typingText}>● ● ●</Text>
          </Animated.View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#6C63FF', '#8B87FF']} style={styles.header}>
        <Text style={styles.headerTitle}>AI Stylist</Text>
        <Text style={styles.headerSubtitle}>Your personal fashion assistant</Text>
      </LinearGradient>

      <KeyboardAvoidingView style={styles.chatContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          ListFooterComponent={renderTypingIndicator}
        />

        {messages.length <= 1 && (
          <View style={styles.quickPromptsContainer}>
            <Text style={styles.quickPromptsTitle}>Try asking:</Text>
            <View style={styles.quickPrompts}>
              {quickPrompts.map((prompt, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickPrompt}
                  onPress={() => sendMessage(prompt)}
                >
                  <Text style={styles.quickPromptText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask your AI stylist anything..."
            style={styles.textInput}
            mode="outlined"
            multiline
            maxLength={500}
            right={
              <TextInput.Icon
                icon="send"
                onPress={() => sendMessage(inputText)}
                disabled={!inputText.trim() || isTyping}
              />
            }
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 16,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0EFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#6C63FF',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    elevation: 1,
  },
  typingBubble: {
    paddingVertical: 16,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  aiText: {
    color: '#2D3436',
  },
  typingDots: {
    alignItems: 'center',
  },
  typingText: {
    color: '#999',
    fontSize: 20,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  quickActionText: {
    fontSize: 12,
    color: '#6C63FF',
    fontWeight: '500',
  },
  suggestionsContainer: {
    marginTop: 12,
    gap: 12,
  },
  suggestionCard: {
    backgroundColor: '#FAFBFF',
  },
  suggestionContent: {
    paddingVertical: 12,
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  confidenceText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  itemsRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  itemPreview: {
    alignItems: 'center',
    flex: 1,
  },
  itemImagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  suggestionReason: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  suggestionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  tryOnButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  quickPromptsContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 1,
  },
  quickPromptsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  quickPrompts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickPrompt: {
    backgroundColor: '#F0EFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  quickPromptText: {
    fontSize: 12,
    color: '#6C63FF',
    fontWeight: '500',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  textInput: {
    maxHeight: 100,
    backgroundColor: '#FFFFFF',
  },
});

export default AIChatScreen;