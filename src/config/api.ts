// API Configuration for SignAR
// Note: In production, these should be environment variables or stored securely

export const API_CONFIG = {
  GEMINI_API_KEY: 'AIzaSyChjRjdQYgQyH1vrhceTAokM9azU7x-uuo',
  YOUTUBE_API_KEY: 'AIzaSyC2431m-8k6-2-5q9UkNgz9XhdH7PL531E',
  GROQ_API_KEY: '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',
  TAVILY_API_KEY: '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',
  OPENAI_API_KEY: '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'
};

export const API_ENDPOINTS = {
  GEMINI: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent',
  GROQ: 'https://api.groq.com/openai/v1/chat/completions',
  OPENAI: 'https://api.openai.com/v1/chat/completions',
  YOUTUBE: 'https://www.googleapis.com/youtube/v3',
  TAVILY: 'https://api.tavily.com/search'
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