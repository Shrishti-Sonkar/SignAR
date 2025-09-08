export interface YouTubeLearningVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  signs: string[];
  category: string;
}

export interface LearningLesson {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  signs: string[];
  videos: YouTubeLearningVideo[];
  category: string;
  order: number;
}

// Mock YouTube API response structure
interface YouTubeVideo {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      medium: { url: string };
    };
    channelTitle: string;
    publishedAt: string;
  };
  statistics?: {
    viewCount: string;
  };
  contentDetails?: {
    duration: string;
  };
}

class YouTubeLearningService {
  private readonly API_KEY = process.env.YOUTUBE_API_KEY || '';
  private readonly BASE_URL = 'https://www.googleapis.com/youtube/v3';
  
  // Fallback dataset when YouTube API is not available
  private readonly fallbackDataset: LearningLesson[] = [
    {
      id: 'basics-greetings',
      title: 'Basic Greetings in ISL',
      description: 'Learn essential greeting signs in Indian Sign Language',
      difficulty: 'Beginner',
      duration: '15 min',
      category: 'Basics',
      order: 1,
      signs: ['HELLO', 'GOODBYE', 'THANK-YOU', 'PLEASE', 'SORRY'],
      videos: [
        {
          id: 'greeting-1',
          title: 'ISL Basic Greetings - Hello, Goodbye',
          description: 'Learn the most common greeting signs in ISL',
          thumbnail: '/placeholder.svg',
          duration: '3:45',
          channelTitle: 'ISL Learning Hub',
          publishedAt: '2024-01-15',
          viewCount: '15000',
          difficulty: 'Beginner',
          signs: ['HELLO', 'GOODBYE'],
          category: 'Greetings'
        },
        {
          id: 'greeting-2',
          title: 'Polite Expressions in ISL',
          description: 'Master thank you, please, and sorry signs',
          thumbnail: '/placeholder.svg',
          duration: '4:20',
          channelTitle: 'Sign Language Academy',
          publishedAt: '2024-01-18',
          viewCount: '12500',
          difficulty: 'Beginner',
          signs: ['THANK-YOU', 'PLEASE', 'SORRY'],
          category: 'Politeness'
        }
      ]
    },
    {
      id: 'numbers-counting',
      title: 'Numbers and Counting',
      description: 'Practice counting from 1 to 20 in ISL',
      difficulty: 'Beginner',
      duration: '20 min',
      category: 'Numbers',
      order: 2,
      signs: ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN'],
      videos: [
        {
          id: 'numbers-1',
          title: 'ISL Numbers 1-10',
          description: 'Learn to count from 1 to 10 in Indian Sign Language',
          thumbnail: '/placeholder.svg',
          duration: '5:30',
          channelTitle: 'ISL for Everyone',
          publishedAt: '2024-01-20',
          viewCount: '25000',
          difficulty: 'Beginner',
          signs: ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN'],
          category: 'Numbers'
        }
      ]
    },
    {
      id: 'family-relationships',
      title: 'Family Members',
      description: 'Signs for family relationships and members',
      difficulty: 'Beginner',
      duration: '25 min',
      category: 'Family',
      order: 3,
      signs: ['MOTHER', 'FATHER', 'SISTER', 'BROTHER', 'FAMILY', 'GRANDMOTHER', 'GRANDFATHER'],
      videos: [
        {
          id: 'family-1',
          title: 'Family Signs in ISL',
          description: 'Learn signs for immediate family members',
          thumbnail: '/placeholder.svg',
          duration: '6:15',
          channelTitle: 'ISL Family Learning',
          publishedAt: '2024-01-25',
          viewCount: '18000',
          difficulty: 'Beginner',
          signs: ['MOTHER', 'FATHER', 'SISTER', 'BROTHER', 'FAMILY'],
          category: 'Family'
        }
      ]
    },
    {
      id: 'emotions-feelings',
      title: 'Emotions and Feelings',
      description: 'Express different emotions and feelings in ISL',
      difficulty: 'Intermediate',
      duration: '30 min',
      category: 'Emotions',
      order: 4,
      signs: ['HAPPY', 'SAD', 'ANGRY', 'SCARED', 'EXCITED', 'CALM', 'SURPRISED', 'CONFUSED'],
      videos: [
        {
          id: 'emotions-1',
          title: 'Basic Emotions in ISL',
          description: 'Learn to express basic emotions through signs',
          thumbnail: '/placeholder.svg',
          duration: '7:45',
          channelTitle: 'Emotional ISL',
          publishedAt: '2024-02-01',
          viewCount: '22000',
          difficulty: 'Intermediate',
          signs: ['HAPPY', 'SAD', 'ANGRY', 'SCARED'],
          category: 'Emotions'
        }
      ]
    },
    {
      id: 'daily-activities',
      title: 'Daily Activities',
      description: 'Common daily activity signs',
      difficulty: 'Intermediate',
      duration: '35 min',
      category: 'Activities',
      order: 5,
      signs: ['EAT', 'DRINK', 'SLEEP', 'WORK', 'STUDY', 'PLAY', 'READ', 'WRITE'],
      videos: [
        {
          id: 'activities-1',
          title: 'Daily Activities in ISL',
          description: 'Essential signs for everyday activities',
          thumbnail: '/placeholder.svg',
          duration: '8:30',
          channelTitle: 'Daily ISL',
          publishedAt: '2024-02-05',
          viewCount: '19500',
          difficulty: 'Intermediate',
          signs: ['EAT', 'DRINK', 'SLEEP', 'WORK', 'STUDY', 'PLAY'],
          category: 'Activities'
        }
      ]
    },
    {
      id: 'conversation-basics',
      title: 'Basic Conversation',
      description: 'Put it all together in simple conversations',
      difficulty: 'Advanced',
      duration: '45 min',
      category: 'Conversation',
      order: 6,
      signs: ['HOW', 'ARE', 'YOU', 'FINE', 'THANKS', 'NICE', 'MEET', 'WHAT', 'WHERE', 'WHEN'],
      videos: [
        {
          id: 'conversation-1',
          title: 'Basic ISL Conversations',
          description: 'Learn to have simple conversations in ISL',
          thumbnail: '/placeholder.svg',
          duration: '12:20',
          channelTitle: 'ISL Conversations',
          publishedAt: '2024-02-10',
          viewCount: '28000',
          difficulty: 'Advanced',
          signs: ['HOW', 'ARE', 'YOU', 'FINE', 'THANKS', 'NICE', 'MEET'],
          category: 'Conversation'
        }
      ]
    }
  ];

  async searchISLVideos(query: string, maxResults: number = 10): Promise<YouTubeLearningVideo[]> {
    if (!this.API_KEY) {
      console.warn('YouTube API key not available, using fallback data');
      return this.getFallbackVideos(query);
    }

    try {
      const searchUrl = `${this.BASE_URL}/search?` +
        `part=snippet&` +
        `q=${encodeURIComponent(query + ' Indian Sign Language ISL')}&` +
        `type=video&` +
        `maxResults=${maxResults}&` +
        `key=${this.API_KEY}`;

      const response = await fetch(searchUrl);
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Get video details for duration and statistics
      const videoIds = data.items.map((item: YouTubeVideo) => item.id.videoId).join(',');
      const detailsUrl = `${this.BASE_URL}/videos?` +
        `part=contentDetails,statistics&` +
        `id=${videoIds}&` +
        `key=${this.API_KEY}`;

      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();

      return data.items.map((item: YouTubeVideo, index: number) => {
        const details = detailsData.items[index];
        return this.mapYouTubeVideoToLearningVideo(item, details);
      });
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
      return this.getFallbackVideos(query);
    }
  }

  private getFallbackVideos(query: string): YouTubeLearningVideo[] {
    const queryLower = query.toLowerCase();
    return this.fallbackDataset
      .flatMap(lesson => lesson.videos)
      .filter(video => 
        video.title.toLowerCase().includes(queryLower) ||
        video.description.toLowerCase().includes(queryLower) ||
        video.category.toLowerCase().includes(queryLower) ||
        video.signs.some(sign => sign.toLowerCase().includes(queryLower))
      )
      .slice(0, 10);
  }

  private mapYouTubeVideoToLearningVideo(video: YouTubeVideo, details: any): YouTubeLearningVideo {
    // Extract signs from title/description (basic pattern matching)
    const signs = this.extractSignsFromText(video.snippet.title + ' ' + video.snippet.description);
    
    // Determine difficulty based on video title/description
    const difficulty = this.determineDifficulty(video.snippet.title + ' ' + video.snippet.description);

    return {
      id: video.id.videoId,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail: video.snippet.thumbnails.medium.url,
      duration: this.formatDuration(details?.contentDetails?.duration || 'PT0M'),
      channelTitle: video.snippet.channelTitle,
      publishedAt: video.snippet.publishedAt,
      viewCount: details?.statistics?.viewCount || '0',
      difficulty,
      signs,
      category: this.categorizeVideo(video.snippet.title + ' ' + video.snippet.description)
    };
  }

  private extractSignsFromText(text: string): string[] {
    const commonSigns = [
      'HELLO', 'GOODBYE', 'THANK-YOU', 'PLEASE', 'SORRY',
      'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN',
      'MOTHER', 'FATHER', 'SISTER', 'BROTHER', 'FAMILY',
      'HAPPY', 'SAD', 'ANGRY', 'SCARED', 'EXCITED',
      'EAT', 'DRINK', 'SLEEP', 'WORK', 'STUDY', 'PLAY',
      'HOW', 'ARE', 'YOU', 'FINE', 'THANKS', 'NICE', 'MEET'
    ];

    return commonSigns.filter(sign => 
      text.toLowerCase().includes(sign.toLowerCase()) ||
      text.toLowerCase().includes(sign.replace('-', ' ').toLowerCase())
    );
  }

  private determineDifficulty(text: string): 'Beginner' | 'Intermediate' | 'Advanced' {
    const textLower = text.toLowerCase();
    
    if (textLower.includes('basic') || textLower.includes('beginner') || 
        textLower.includes('introduction') || textLower.includes('start')) {
      return 'Beginner';
    }
    
    if (textLower.includes('advanced') || textLower.includes('complex') ||
        textLower.includes('conversation') || textLower.includes('fluent')) {
      return 'Advanced';
    }
    
    return 'Intermediate';
  }

  private categorizeVideo(text: string): string {
    const textLower = text.toLowerCase();
    
    if (textLower.includes('greeting') || textLower.includes('hello')) return 'Greetings';
    if (textLower.includes('number') || textLower.includes('count')) return 'Numbers';
    if (textLower.includes('family')) return 'Family';
    if (textLower.includes('emotion') || textLower.includes('feeling')) return 'Emotions';
    if (textLower.includes('activity') || textLower.includes('daily')) return 'Activities';
    if (textLower.includes('conversation') || textLower.includes('talk')) return 'Conversation';
    
    return 'General';
  }

  private formatDuration(isoDuration: string): string {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0:00';

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  async getLearningLessons(): Promise<LearningLesson[]> {
    // Return the structured learning dataset
    return this.fallbackDataset;
  }

  async getLessonById(id: string): Promise<LearningLesson | null> {
    const lessons = await this.getLearningLessons();
    return lessons.find(lesson => lesson.id === id) || null;
  }

  async searchLessons(category?: string, difficulty?: string): Promise<LearningLesson[]> {
    const lessons = await this.getLearningLessons();
    
    return lessons.filter(lesson => {
      if (category && lesson.category !== category) return false;
      if (difficulty && lesson.difficulty !== difficulty) return false;
      return true;
    });
  }

  async enrichLessonWithYouTubeVideos(lesson: LearningLesson): Promise<LearningLesson> {
    try {
      const searchQuery = `${lesson.title} ${lesson.category} ISL tutorial`;
      const youtubeVideos = await this.searchISLVideos(searchQuery, 3);
      
      return {
        ...lesson,
        videos: [...lesson.videos, ...youtubeVideos]
      };
    } catch (error) {
      console.error('Error enriching lesson with YouTube videos:', error);
      return lesson;
    }
  }
}

export const youtubeLearningService = new YouTubeLearningService();