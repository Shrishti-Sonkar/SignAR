import { API_CONFIG, API_ENDPOINTS } from '@/config/api';

// Enhanced translation service using multiple AI APIs
export class TranslationService {
  
  // Translate text to ISL glosses using Groq (fast inference)
  static async translateToGlosses(text: string): Promise<string[]> {
    try {
      const response = await fetch(API_ENDPOINTS.GROQ, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_CONFIG.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are an expert in Indian Sign Language (ISL). Convert the given English text into ISL glosses. 
              ISL glosses are simplified word representations used in sign language. 
              Rules:
              1. Use uppercase words
              2. Remove articles (a, an, the)
              3. Simplify grammar to basic word order
              4. Use present tense
              5. Return only the glosses separated by spaces
              
              Example: "Hello, how are you today?" → "HELLO HOW YOU TODAY"
              Example: "Thank you for helping me" → "THANK-YOU HELP ME"
              Example: "My name is John" → "MY NAME J-O-H-N"`
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.3,
          max_tokens: 150
        })
      });

      const data = await response.json();
      const glossString = data.choices[0]?.message?.content || '';
      return glossString.split(' ').filter(word => word.length > 0);
      
    } catch (error) {
      console.error('Groq translation error:', error);
      return this.fallbackTranslation(text);
    }
  }

  // Translate glosses back to natural language using OpenAI
  static async translateGlossesToText(glosses: string[]): Promise<string> {
    try {
      const response = await fetch(API_ENDPOINTS.OPENAI, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_CONFIG.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'Convert ISL glosses back to natural English. Add proper grammar, articles, and natural flow while maintaining the original meaning.'
            },
            {
              role: 'user',
              content: `Convert these ISL glosses to natural English: ${glosses.join(' ')}`
            }
          ],
          temperature: 0.4,
          max_tokens: 200
        })
      });

      const data = await response.json();
      return data.choices[0]?.message?.content || glosses.join(' ');
      
    } catch (error) {
      console.error('OpenAI translation error:', error);
      return glosses.join(' ');
    }
  }

  // Enhanced context understanding using Gemini
  static async getSigningContext(text: string) {
    try {
      const response = await fetch(`${API_ENDPOINTS.GEMINI}?key=${API_CONFIG.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze this text for sign language context: "${text}"
              
              Provide:
              1. Emotion level (1-10)
              2. Facial expression needed (neutral, happy, sad, surprised, angry)
              3. Movement intensity (gentle, normal, strong)
              4. Cultural context (formal, informal, technical, casual)
              5. Any special non-manual markers needed
              
              Return as JSON format.`
            }]
          }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 300
          }
        })
      });

      const data = await response.json();
      const content = data.candidates[0]?.content?.parts[0]?.text || '{}';
      
      try {
        return JSON.parse(content);
      } catch {
        return {
          emotion: 5,
          expression: 'neutral',
          intensity: 'normal',
          context: 'casual',
          nonManualMarkers: []
        };
      }
      
    } catch (error) {
      console.error('Gemini context analysis error:', error);
      return {
        emotion: 5,
        expression: 'neutral',
        intensity: 'normal',
        context: 'casual',
        nonManualMarkers: []
      };
    }
  }

  // Fallback translation using local dictionary
  private static fallbackTranslation(text: string): string[] {
    const words = text.toLowerCase().split(' ').filter(word => word.length > 0);
    const glossMap: Record<string, string> = {
      'hello': 'HELLO',
      'hi': 'HELLO',
      'good': 'GOOD',
      'morning': 'MORNING',
      'afternoon': 'AFTERNOON',
      'evening': 'EVENING',
      'night': 'NIGHT',
      'thank': 'THANK',
      'you': 'YOU',
      'please': 'PLEASE',
      'sorry': 'SORRY',
      'yes': 'YES',
      'no': 'NO',
      'help': 'HELP',
      'water': 'WATER',
      'food': 'FOOD',
      'eat': 'EAT',
      'drink': 'DRINK',
      'sleep': 'SLEEP',
      'home': 'HOME',
      'school': 'SCHOOL',
      'work': 'WORK',
      'family': 'FAMILY',
      'friend': 'FRIEND',
      'love': 'LOVE',
      'happy': 'HAPPY',
      'sad': 'SAD',
      'angry': 'ANGRY',
      'scared': 'SCARED',
      'surprised': 'SURPRISED',
      'how': 'HOW',
      'what': 'WHAT',
      'where': 'WHERE',
      'when': 'WHEN',
      'why': 'WHY',
      'who': 'WHO',
      'nice': 'NICE',
      'meet': 'MEET',
      'name': 'NAME',
      'my': 'MY',
      'is': 'IS',
      'am': 'AM',
      'are': 'ARE',
      'we': 'WE',
      'they': 'THEY',
      'he': 'HE',
      'she': 'SHE',
      'it': 'IT',
      'and': 'AND',
      'but': 'BUT',
      'or': 'OR',
      'not': 'NOT',
      'can': 'CAN',
      'will': 'WILL',
      'want': 'WANT',
      'need': 'NEED',
      'have': 'HAVE',
      'get': 'GET',
      'go': 'GO',
      'come': 'COME',
      'see': 'SEE',
      'hear': 'HEAR',
      'speak': 'SPEAK',
      'understand': 'UNDERSTAND',
      'know': 'KNOW',
      'learn': 'LEARN',
      'teach': 'TEACH',
      'mother': 'MOTHER',
      'father': 'FATHER',
      'sister': 'SISTER',
      'brother': 'BROTHER',
      'child': 'CHILD',
      'baby': 'BABY',
      'man': 'MAN',
      'woman': 'WOMAN',
      'boy': 'BOY',
      'girl': 'GIRL',
      'one': 'ONE',
      'two': 'TWO',
      'three': 'THREE',
      'four': 'FOUR',
      'five': 'FIVE',
      'six': 'SIX',
      'seven': 'SEVEN',
      'eight': 'EIGHT',
      'nine': 'NINE',
      'ten': 'TEN'
    };

    // Skip common articles and prepositions
    const skipWords = ['the', 'a', 'an', 'to', 'of', 'in', 'on', 'at', 'by', 'for', 'with', 'from'];
    
    return words
      .filter(word => !skipWords.includes(word))
      .map(word => glossMap[word] || word.toUpperCase());
  }
}

// Search service using Tavily for educational content
export class SearchService {
  static async searchSignLanguageContent(query: string) {
    try {
      const response = await fetch(API_ENDPOINTS.TAVILY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_CONFIG.TAVILY_API_KEY}`
        },
        body: JSON.stringify({
          query: `${query} sign language ISL Indian`,
          search_depth: 'basic',
          include_answer: true,
          include_domains: ['youtube.com', 'educational sites', 'sign language resources'],
          max_results: 5
        })
      });

      const data = await response.json();
      return data.results || [];
      
    } catch (error) {
      console.error('Tavily search error:', error);
      return [];
    }
  }
}

// YouTube service for educational videos
export class YouTubeService {
  static async searchSignLanguageVideos(query: string) {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.YOUTUBE}/search?part=snippet&q=${encodeURIComponent(query + ' Indian Sign Language ISL')}&type=video&maxResults=10&key=${API_CONFIG.YOUTUBE_API_KEY}`
      );

      const data = await response.json();
      return data.items?.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium.url,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`
      })) || [];
      
    } catch (error) {
      console.error('YouTube search error:', error);
      return [];
    }
  }
}