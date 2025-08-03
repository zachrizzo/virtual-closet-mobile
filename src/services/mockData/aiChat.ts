// Mock AI chat responses for MVP
import { AIMessage } from '../../types/outfit';

// Legacy interface for backward compatibility
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestions?: string[]; // Outfit suggestions with item IDs
}

// Predefined responses for common queries
const responses = {
  greeting: [
    "Hi! I'm your personal style assistant. I can help you create outfits from your wardrobe. What are you looking for today?",
    "Hello! Ready to find the perfect outfit? Tell me about the occasion or what style you're going for.",
    "Hey there! I'm here to help you style your wardrobe. What's the occasion?",
  ],
  
  casualOutfit: [
    "For a casual look, try pairing your White T-Shirt with Blue Jeans. Simple and classic!",
    "How about your Striped Shirt with Blue Jeans? It's a timeless casual combination.",
    "Your Denim Jacket over the White T-Shirt with jeans would make a great casual outfit!",
  ],
  
  dressUp: [
    "Your Black Dress is perfect for dressing up! Add some accessories to complete the look.",
    "For a more formal occasion, the Black Dress is your go-to. Consider adding a jacket if it's cool.",
    "The Black Dress is elegant on its own. You could layer the Denim Jacket for a chic contrast.",
  ],
  
  weather: [
    "If it's chilly, layer your Denim Jacket over any top. It's versatile and stylish!",
    "For warm weather, the White T-Shirt or Striped Shirt will keep you cool and comfortable.",
    "The Black Dress is great for warm weather, and you can add the Denim Jacket if it gets cool.",
  ],
  
  default: [
    "Based on your wardrobe, I'd suggest trying different combinations. What type of look are you going for?",
    "You have some great basics! Tell me more about what you need the outfit for.",
    "I can help you create outfits. Are you looking for something casual, formal, or specific to an occasion?",
  ],
};

// Simple keyword matching for responses with enhanced metadata
const getResponse = (message: string): { text: string; suggestions?: string[]; metadata?: any } => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return { 
      text: responses.greeting[Math.floor(Math.random() * responses.greeting.length)],
      metadata: {
        intent: 'greeting',
        confidence: 0.95,
        actionButtons: [
          { label: 'Browse Wardrobe', action: 'navigate', data: { screen: 'wardrobe' } },
          { label: 'Create Outfit', action: 'navigate', data: { screen: 'outfit-creator' } }
        ]
      }
    };
  }
  
  if (lowerMessage.includes('casual') || lowerMessage.includes('everyday') || lowerMessage.includes('comfortable')) {
    return { 
      text: responses.casualOutfit[Math.floor(Math.random() * responses.casualOutfit.length)],
      suggestions: ['1', '2'], // White T-Shirt + Blue Jeans
      metadata: {
        suggestedItemIds: ['1', '2'],
        intent: 'outfit_suggestion',
        confidence: 0.88,
        actionButtons: [
          { label: 'Try This Outfit', action: 'create_outfit', data: { itemIds: ['1', '2'] } },
          { label: 'Virtual Try-On', action: 'virtual_tryon', data: { itemIds: ['1', '2'] } }
        ]
      }
    };
  }
  
  if (lowerMessage.includes('dress up') || lowerMessage.includes('formal') || lowerMessage.includes('party') || lowerMessage.includes('date')) {
    return { 
      text: responses.dressUp[Math.floor(Math.random() * responses.dressUp.length)],
      suggestions: ['3'], // Black Dress
      metadata: {
        suggestedItemIds: ['3'],
        intent: 'formal_outfit',
        confidence: 0.92,
        actionButtons: [
          { label: 'View Dress', action: 'view_item', data: { itemId: '3' } },
          { label: 'Add Accessories', action: 'suggest_accessories', data: { baseItemId: '3' } }
        ]
      }
    };
  }
  
  if (lowerMessage.includes('cold') || lowerMessage.includes('warm') || lowerMessage.includes('weather') || lowerMessage.includes('chilly')) {
    return { 
      text: responses.weather[Math.floor(Math.random() * responses.weather.length)],
      suggestions: ['4'], // Denim Jacket
      metadata: {
        suggestedItemIds: ['4'],
        intent: 'weather_based',
        confidence: 0.85,
        actionButtons: [
          { label: 'Layer Options', action: 'layering_suggestions', data: { layerItemId: '4' } },
          { label: 'Weather Outfits', action: 'weather_outfits', data: { condition: 'chilly' } }
        ]
      }
    };
  }
  
  return { 
    text: responses.default[Math.floor(Math.random() * responses.default.length)],
    metadata: {
      intent: 'general_help',
      confidence: 0.5,
      actionButtons: [
        { label: 'Show Categories', action: 'show_categories', data: {} },
        { label: 'Random Outfit', action: 'random_outfit', data: {} }
      ]
    }
  };
};

// Enhanced chat history storage
let chatHistory: AIMessage[] = [
  {
    id: 0,
    text: "Hi! I'm your personal style assistant. I can help you create outfits from your wardrobe. What are you looking for today?",
    isUser: false,
    timestamp: new Date(),
    metadata: {
      intent: 'welcome',
      confidence: 1.0,
      actionButtons: [
        { label: 'Browse Wardrobe', action: 'navigate', data: { screen: 'wardrobe' } },
        { label: 'Create Outfit', action: 'navigate', data: { screen: 'outfit-creator' } },
        { label: 'Style Tips', action: 'show_tips', data: {} }
      ]
    }
  },
];

// Legacy chat history for backward compatibility
let legacyChatHistory: ChatMessage[] = [
  {
    id: '0',
    role: 'assistant',
    content: "Hi! I'm your personal style assistant. I can help you create outfits from your wardrobe. What are you looking for today?",
    timestamp: new Date().toISOString(),
  },
];

export const mockAIChat = {
  // Send message and get enhanced response
  sendMessage: async (message: string): Promise<AIMessage> => {
    // Add user message to history
    const userMessage: AIMessage = {
      id: Date.now(),
      text: message,
      isUser: true,
      timestamp: new Date(),
    };
    chatHistory.push(userMessage);
    
    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    // Get AI response
    const response = getResponse(message);
    const aiMessage: AIMessage = {
      id: Date.now() + 1,
      text: response.text,
      isUser: false,
      timestamp: new Date(),
      metadata: response.metadata
    };
    
    chatHistory.push(aiMessage);
    return aiMessage;
  },
  
  // Legacy method for backward compatibility
  sendLegacyMessage: async (message: string): Promise<ChatMessage> => {
    // Add user message to legacy history
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    legacyChatHistory.push(userMessage);
    
    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    // Get AI response
    const response = getResponse(message);
    const aiMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.text,
      timestamp: new Date().toISOString(),
      suggestions: response.suggestions,
    };
    
    legacyChatHistory.push(aiMessage);
    return aiMessage;
  },
  
  // Get enhanced chat history
  getHistory: async (): Promise<AIMessage[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return chatHistory;
  },
  
  // Get legacy chat history
  getLegacyHistory: async (): Promise<ChatMessage[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return legacyChatHistory;
  },
  
  // Clear chat history
  clearHistory: async (): Promise<void> => {
    chatHistory = [
      {
        id: 0,
        text: "Hi! I'm your personal style assistant. I can help you create outfits from your wardrobe. What are you looking for today?",
        isUser: false,
        timestamp: new Date(),
        metadata: {
          intent: 'welcome',
          confidence: 1.0,
          actionButtons: [
            { label: 'Browse Wardrobe', action: 'navigate', data: { screen: 'wardrobe' } },
            { label: 'Create Outfit', action: 'navigate', data: { screen: 'outfit-creator' } },
            { label: 'Style Tips', action: 'show_tips', data: {} }
          ]
        }
      },
    ];
    
    legacyChatHistory = [
      {
        id: '0',
        role: 'assistant',
        content: "Hi! I'm your personal style assistant. I can help you create outfits from your wardrobe. What are you looking for today?",
        timestamp: new Date().toISOString(),
      },
    ];
  },
  
  // Get outfit suggestions based on criteria
  getOutfitSuggestions: async (criteria: string): Promise<string[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return random combinations of item IDs
    const suggestions = [
      ['1', '2'], // White T-Shirt + Blue Jeans
      ['5', '2'], // Striped Shirt + Blue Jeans
      ['3'],      // Black Dress
      ['1', '2', '4'], // White T-Shirt + Blue Jeans + Denim Jacket
    ];
    
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  },
};