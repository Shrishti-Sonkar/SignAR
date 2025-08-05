import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  ExternalLink, 
  Play,
  BookOpen,
  Youtube,
  Globe,
  Lightbulb
} from 'lucide-react';
import { SearchService, YouTubeService } from '@/services/aiServices';
import { useToast } from '@/hooks/use-toast';

interface LearningResourcesProps {
  onSelectResource: (resource: any) => void;
}

const LearningResources: React.FC<LearningResourcesProps> = ({ onSelectResource }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [youtubeVideos, setYoutubeVideos] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Enter search term",
        description: "Please enter a topic to search for learning resources",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);

    try {
      // Search for general content
      const webResults = await SearchService.searchSignLanguageContent(searchQuery);
      setSearchResults(webResults);

      // Search for YouTube videos
      const videoResults = await YouTubeService.searchSignLanguageVideos(searchQuery);
      setYoutubeVideos(videoResults);

      toast({
        title: "Search complete",
        description: `Found ${webResults.length} articles and ${videoResults.length} videos`,
      });

    } catch (error) {
      toast({
        title: "Search failed",
        description: "Could not fetch learning resources. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const popularTopics = [
    'Basic greetings',
    'Family members',
    'Numbers 1-10',
    'Colors',
    'Days of the week',
    'Emotions',
    'Food and drinks',
    'Common phrases',
    'Alphabet fingerspelling',
    'Pronouns in ISL'
  ];

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-signar-blue" />
          Learning Resources
        </h3>
        <p className="text-sm text-muted-foreground">
          Discover educational content, videos, and articles about Indian Sign Language
        </p>
      </div>

      {/* Search Section */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search for ISL topics, lessons, or signs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button 
            onClick={handleSearch}
            disabled={isSearching}
            variant="signar"
          >
            <Search className="w-4 h-4 mr-2" />
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {/* Popular Topics */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Popular Topics
          </h4>
          <div className="flex flex-wrap gap-2">
            {popularTopics.map((topic, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery(topic);
                  // Auto-search popular topics
                  setTimeout(() => handleSearch(), 100);
                }}
                className="h-8 text-xs"
              >
                {topic}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Section */}
      {(searchResults.length > 0 || youtubeVideos.length > 0) && (
        <div className="space-y-6">
          {/* YouTube Videos */}
          {youtubeVideos.length > 0 && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Youtube className="w-4 h-4 text-red-500" />
                Educational Videos ({youtubeVideos.length})
              </h4>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {youtubeVideos.map((video, index) => (
                    <Card key={index} className="p-3 hover:shadow-md transition-shadow">
                      <div className="flex gap-3">
                        <img 
                          src={video.thumbnail} 
                          alt={video.title}
                          className="w-20 h-14 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-sm line-clamp-2 mb-1">
                            {video.title}
                          </h5>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {video.description}
                          </p>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="signar-outline"
                              onClick={() => window.open(video.url, '_blank')}
                              className="h-6 text-xs"
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Watch
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => onSelectResource(video)}
                              className="h-6 text-xs"
                            >
                              Use in Lesson
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Web Articles */}
          {searchResults.length > 0 && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-signar-blue" />
                Articles & Resources ({searchResults.length})
              </h4>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {searchResults.map((result, index) => (
                    <Card key={index} className="p-3 hover:shadow-md transition-shadow">
                      <div>
                        <h5 className="font-medium text-sm mb-1 line-clamp-2">
                          {result.title}
                        </h5>
                        <p className="text-xs text-muted-foreground line-clamp-3 mb-2">
                          {result.content || result.snippet}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            {result.domain || 'Educational'}
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => window.open(result.url, '_blank')}
                            className="h-6 text-xs"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Read More
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {isSearching === false && searchQuery && searchResults.length === 0 && youtubeVideos.length === 0 && (
        <Card className="p-6 text-center">
          <div className="text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="mb-2">No resources found for "{searchQuery}"</p>
            <p className="text-sm">Try searching for basic ISL terms or popular topics above.</p>
          </div>
        </Card>
      )}
    </Card>
  );
};

export default LearningResources;