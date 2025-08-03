// Mock authentication for MVP
export const mockAuth = {
  // Login - accepts any email/password for demo
  login: async (email: string, password: string): Promise<{ token: string; user: any }> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // For demo, accept any credentials
    if (!email || !password) {
      throw new Error('Email and password required');
    }
    
    return {
      token: 'mock-token-' + Date.now(),
      user: {
        id: 'mock-user',
        email: email,
        name: email.split('@')[0],
      },
    };
  },
  
  // Register - creates mock account
  register: async (email: string, password: string, name?: string): Promise<{ token: string; user: any }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!email || !password) {
      throw new Error('Email and password required');
    }
    
    return {
      token: 'mock-token-' + Date.now(),
      user: {
        id: 'mock-user',
        email: email,
        name: name || email.split('@')[0],
      },
    };
  },
  
  // Logout
  logout: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    // Clear any stored data
  },
  
  // Check if logged in
  isAuthenticated: async (): Promise<boolean> => {
    // For mock, always return true if we have a token
    return true;
  },
  
  // Refresh token
  refreshToken: async (): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return 'mock-token-refreshed-' + Date.now();
  },
};