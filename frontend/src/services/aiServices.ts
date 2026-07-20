import { API_ENDPOINTS } from '@/config/api';

// Translation service — all AI calls go through the Flask backend so API keys stay server-side.
export class TranslationService {

  // Translate text to ISL glosses (backend proxies to Groq)
  static async translateToGlosses(text: string): Promise<string[]> {
    try {
      const response = await fetch(API_ENDPOINTS.GLOSSES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) throw new Error(`Backend returned ${response.status}`);
      const data = await response.json();
      return data.glosses || [];
    } catch (error) {
      console.error('Gloss translation error:', error);
      return this.fallbackTranslation(text);
    }
  }

  // Translate glosses back to natural language (backend proxies to OpenAI)
  static async translateGlossesToText(glosses: string[]): Promise<string> {
    try {
      const response = await fetch(API_ENDPOINTS.GLOSSES_TO_TEXT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ glosses }),
      });
      if (!response.ok) throw new Error(`Backend returned ${response.status}`);
      const data = await response.json();
      return data.text || glosses.join(' ');
    } catch (error) {
      console.error('Glosses-to-text error:', error);
      return glosses.join(' ');
    }
  }

  // Fallback translation using local dictionary
  private static fallbackTranslation(text: string): string[] {
    const words = text.toLowerCase().split(' ').filter(word => word.length > 0);
    const glossMap: Record<string, string> = {
      'hello': 'HELLO', 'hi': 'HELLO', 'good': 'GOOD', 'morning': 'MORNING',
      'afternoon': 'AFTERNOON', 'evening': 'EVENING', 'night': 'NIGHT',
      'thank': 'THANK', 'you': 'YOU', 'please': 'PLEASE', 'sorry': 'SORRY',
      'yes': 'YES', 'no': 'NO', 'help': 'HELP', 'water': 'WATER',
      'food': 'FOOD', 'eat': 'EAT', 'drink': 'DRINK', 'sleep': 'SLEEP',
      'home': 'HOME', 'school': 'SCHOOL', 'work': 'WORK', 'family': 'FAMILY',
      'friend': 'FRIEND', 'love': 'LOVE', 'happy': 'HAPPY', 'sad': 'SAD',
      'how': 'HOW', 'what': 'WHAT', 'where': 'WHERE', 'when': 'WHEN',
      'why': 'WHY', 'who': 'WHO', 'nice': 'NICE', 'meet': 'MEET',
      'name': 'NAME', 'my': 'MY', 'we': 'WE', 'they': 'THEY',
      'can': 'CAN', 'will': 'WILL', 'want': 'WANT', 'need': 'NEED',
      'go': 'GO', 'come': 'COME', 'see': 'SEE', 'learn': 'LEARN',
    };

    const skipWords = ['the', 'a', 'an', 'to', 'of', 'in', 'on', 'at', 'by', 'for', 'is', 'am', 'are'];

    return words
      .filter(word => !skipWords.includes(word))
      .map(word => glossMap[word] || word.toUpperCase());
  }
}

// Search service for educational content (backend proxies to Tavily)
export class SearchService {
  static async searchSignLanguageContent(query: string) {
    try {
      const response = await fetch(API_ENDPOINTS.SEARCH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (!response.ok) throw new Error(`Backend returned ${response.status}`);
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }
}

// YouTube service for educational videos (backend proxies to YouTube Data API)
export class YouTubeService {
  static async searchSignLanguageVideos(query: string) {
    try {
      const response = await fetch(API_ENDPOINTS.YOUTUBE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (!response.ok) throw new Error(`Backend returned ${response.status}`);
      const data = await response.json();
      return data.videos || [];
    } catch (error) {
      console.error('YouTube search error:', error);
      return [];
    }
  }
}
