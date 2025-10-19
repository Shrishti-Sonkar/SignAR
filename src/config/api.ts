// API Configuration for SignAR
// Note: In production, these should be environment variables or stored securely

export const API_CONFIG = {
  GEMINI_API_KEY: 'xxxx',
  YOUTUBE_API_KEY: 'xxxx',
  GROQ_API_KEY: 'xxxx',
  TAVILY_API_KEY: 'xxxx',
  OPENAI_API_KEY: 'xxxx'
};

export const API_ENDPOINTS = {
  GEMINI: 'xxx',
  GROQ: 'xxxx',
  OPENAI: 'xxx',
  YOUTUBE: 'xxxx',
  TAVILY: 'xxxxxx'
};

// Utility function to check if APIs are configured
export const checkAPIConfiguration = () => {
  const missingKeys = [];
  
  Object.entries(API_CONFIG).forEach(([key, value]) => {
    if (!value || value === '') {
      missingKeys.push(key);
    }
  });
  
  return {
    isConfigured: missingKeys.length === 0,
    missingKeys
  };
};
