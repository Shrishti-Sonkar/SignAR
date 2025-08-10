import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Play, Square, RotateCcw, Volume2, MessageSquare, Sparkles, Zap } from 'lucide-react';
import { TranslationService } from '@/services/aiServices';
import { useToast } from '@/hooks/use-toast';

interface TranslationPanelProps {
  onTranslate: (text: string, glosses: string[]) => void;
  isAnimating: boolean;
  onToggleAnimation: () => void;
}

const TranslationPanel: React.FC<TranslationPanelProps> = ({
  onTranslate,
  isAnimating,
  onToggleAnimation
}) => {
  const [inputText, setInputText] = useState('');
  const [translatedGlosses, setTranslatedGlosses] = useState<string[]>([]);
  const { toast } = useToast();

  // Mock ISL gloss dictionary for demonstration
  const mockTranslateToGlosses = (text: string): string[] => {
    const words = text.toLowerCase().split(' ').filter(word => word.length > 0);
    const glossMap: Record<string, string> = {
      'hello': 'HELLO',
      'hi': 'HELLO',
      'good': 'GOOD',
      'morning': 'MORNING',
      'thank': 'THANK',
      'you': 'YOU',
      'please': 'PLEASE',
      'sorry': 'SORRY',
      'yes': 'YES',
      'no': 'NO',
      'help': 'HELP',
      'water': 'WATER',
      'food': 'FOOD',
      'home': 'HOME',
      'school': 'SCHOOL',
      'work': 'WORK',
      'family': 'FAMILY',
      'friend': 'FRIEND',
      'love': 'LOVE',
      'happy': 'HAPPY',
      'sad': 'SAD',
      'how': 'HOW',
      'what': 'WHAT',
      'where': 'WHERE',
      'when': 'WHEN',
      'why': 'WHY',
      'nice': 'NICE',
      'meet': 'MEET',
      'name': 'NAME',
      'my': 'MY',
      'is': 'IS',
      'i': 'I',
      'am': 'AM',
      'are': 'ARE',
      'we': 'WE',
      'they': 'THEY'
    };

    return words.map(word => glossMap[word] || word.toUpperCase());
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Please enter text",
        description: "Enter some text to translate to sign language",
        variant: "destructive"
      });
      return;
    }

    try {
      // Use AI-powered translation
      const glosses = await TranslationService.translateToGlosses(inputText);
      setTranslatedGlosses(glosses);
      onTranslate(inputText, glosses);
      
      toast({
        title: "AI Translation complete",
        description: `Translated "${inputText}" to ${glosses.length} sign(s) using Groq AI`,
      });
    } catch (error) {
      // Fallback to local translation
      const glosses = mockTranslateToGlosses(inputText);
      setTranslatedGlosses(glosses);
      onTranslate(inputText, glosses);
      
      toast({
        title: "Translation complete (offline)",
        description: `Translated "${inputText}" to ${glosses.length} sign(s)`,
      });
    }
  };

  const handleSpeechToText = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        toast({
          title: "Speech captured",
          description: `Recognized: "${transcript}"`,
        });
      };

      recognition.onerror = (event) => {
        toast({
          title: "Speech recognition error",
          description: "Could not capture speech. Please try again.",
          variant: "destructive"
        });
      };

      recognition.start();
      
      toast({
        title: "Listening...",
        description: "Speak now to convert speech to text",
      });
    } else {
      toast({
        title: "Speech recognition not supported",
        description: "Your browser doesn't support speech recognition",
        variant: "destructive"
      });
    }
  };

  const predefinedPhrases = [
    "Hello, nice to meet you",
    "Thank you for your help",
    "How are you today?",
    "Please help me",
    "I love you",
    "Good morning",
    "My name is...",
    "Where is the school?"
  ];

  return (
    <Card className="p-6 space-y-4 shadow-lg">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Text to Sign Translation
          </h3>
          <p className="text-sm text-muted-foreground">
            Enter text or speak to convert to Indian Sign Language
          </p>
        </div>

        <div className="space-y-3">
          <Textarea
            placeholder="Type your message here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-h-[100px] resize-none"
          />
          
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="signar" 
              onClick={handleTranslate}
              disabled={!inputText.trim()}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Translate to Signs
            </Button>
            
            <Button 
              variant="signar-outline" 
              onClick={handleSpeechToText}
            >
              <Volume2 className="w-4 h-4 mr-2" />
              Speech to Text
            </Button>
            
            <Button 
              variant={isAnimating ? "destructive" : "secondary"} 
              onClick={onToggleAnimation}
              disabled={translatedGlosses.length === 0}
            >
              {isAnimating ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Play Signs
                </>
              )}
            </Button>

            <Button 
              variant="ghost" 
              onClick={() => {
                setInputText('');
                setTranslatedGlosses([]);
              }}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        {translatedGlosses.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">ISL Glosses:</h4>
            <div className="flex flex-wrap gap-2">
              {translatedGlosses.map((gloss, index) => (
                <Badge key={index} variant="secondary" className="bg-signar-blue-light text-signar-blue-dark">
                  {gloss}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Quick Phrases:</h4>
          <div className="flex flex-wrap gap-2">
            {predefinedPhrases.map((phrase, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => setInputText(phrase)}
                className="text-xs h-8"
              >
                {phrase}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TranslationPanel;