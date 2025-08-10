import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ISLVideoPlayer, { ISLVideoPlayerHandle } from '@/components/ISLVideoPlayer';
import Navigation from '@/components/Navigation';
import TranslationPanel from '@/components/TranslationPanel';
import LearningStudio from '@/components/LearningStudio';
import LearningResources from '@/components/LearningResources';
import SettingsPanel from '@/components/SettingsPanel';
import SignLanguageFeature from '@/components/SignLanguageFeature';
import { 
  Sparkles, 
  Globe, 
  Zap, 
  Shield,
  Users,
  Award
} from 'lucide-react';

const Index = () => {
  const [activeSection, setActiveSection] = useState('translate');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [currentGlosses, setCurrentGlosses] = useState<string[]>([]);
  const [currentText, setCurrentText] = useState('');
  const videoPlayerRef = useRef<ISLVideoPlayerHandle>(null);

  const handleTranslate = async (text: string, glosses: string[]) => {
    setCurrentText(text);
    setCurrentGlosses(glosses);
    setIsVideoPlaying(true);
    
    // Play the video sequence
    if (videoPlayerRef.current) {
      await videoPlayerRef.current.playSequence(glosses);
    }
    
    // Update playing state after sequence
    setTimeout(() => {
      setIsVideoPlaying(false);
    }, glosses.length * 3000); // Estimate duration
  };

  const handleToggleAnimation = () => {
    if (isVideoPlaying) {
      videoPlayerRef.current?.stopSequence();
      setIsVideoPlaying(false);
    } else if (currentGlosses.length > 0) {
      setIsVideoPlaying(true);
      videoPlayerRef.current?.playSequence(currentGlosses);
    }
  };

  const handleStartLesson = (lessonId: string) => {
    setCurrentText(`Learning: ${lessonId}`);
    setCurrentGlosses([lessonId.toUpperCase()]);
    setIsVideoPlaying(true);
    
    if (videoPlayerRef.current) {
      videoPlayerRef.current.playSequence([lessonId.toUpperCase()]);
    }
    
    setTimeout(() => {
      setIsVideoPlaying(false);
    }, 3000);
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'translate':
        return (
          <TranslationPanel
            onTranslate={handleTranslate}
            isAnimating={isVideoPlaying}
            onToggleAnimation={handleToggleAnimation}
          />
        );
      case 'learn':
        return <LearningStudio onStartLesson={handleStartLesson} />;
      case 'resources':
        return <LearningResources onSelectResource={(resource) => {
          setCurrentText(`Learning: ${resource.title}`);
          setCurrentGlosses([resource.title.toUpperCase()]);
          setIsVideoPlaying(true);
          if (videoPlayerRef.current) {
            videoPlayerRef.current.playSequence([resource.title.toUpperCase()]);
          }
          setTimeout(() => setIsVideoPlaying(false), 3000);
        }} />;
      case 'speech':
        return <SignLanguageFeature />;
      case 'camera':
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Sign Recognition</h3>
            <p className="text-muted-foreground">Camera-based sign language recognition coming soon!</p>
          </Card>
        );
      case 'ar':
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">AR Mode</h3>
            <p className="text-muted-foreground">Augmented Reality sign language overlay coming soon!</p>
          </Card>
        );
      case 'settings':
        return <SettingsPanel onSettingsChange={(settings) => {
          console.log('Settings updated:', settings);
          // Apply settings to avatar and UI
        }} />;
      default:
        return null;
    }
  };

  const features = [
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Real-time Translation",
      description: "Instant bidirectional translation between text and ISL"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Video Signs",
      description: "Real ISL sign videos for authentic learning"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Edge-First",
      description: "Low-latency processing with offline capability"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Privacy First",
      description: "Your data stays secure with on-device processing"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Learning Studio",
      description: "Interactive lessons and progress tracking"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Gamified Learning",
      description: "Achievements, streaks, and challenges"
    }
  ];

  if (activeSection === 'translate' || activeSection === 'learn' || activeSection === 'resources') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-signar-blue-light/20 to-background">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-signar-blue to-signar-teal flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-signar-blue to-signar-teal bg-clip-text text-transparent">
                SignAR™
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Real-time sign language translation with 3D avatar powered by AI
            </p>
            <Badge variant="secondary" className="mt-2 bg-signar-blue-light text-signar-blue-dark">
              Beta Version - ISL Support
            </Badge>
          </div>

          {/* Navigation */}
          <div className="mb-6">
            <Navigation 
              activeSection={activeSection} 
              onSectionChange={setActiveSection} 
            />
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Panel - ISL Video Player */}
            <div className="space-y-4">
              <ISLVideoPlayer 
                ref={videoPlayerRef}
                currentGlosses={currentGlosses}
                isPlaying={isVideoPlaying}
                className="w-full"
              />
              
              <Card className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Badge 
                    variant={isVideoPlaying ? "default" : "secondary"}
                    className={isVideoPlaying ? "bg-green-500 text-white" : ""}
                  >
                    {isVideoPlaying ? "Playing" : "Ready"}
                  </Badge>
                </div>
                
                {currentText && (
                  <p className="text-sm text-muted-foreground">
                    Current: <span className="font-medium text-primary">{currentText}</span>
                  </p>
                )}
                
                {currentGlosses.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentGlosses.length} sign(s) in sequence
                  </p>
                )}
              </Card>
            </div>

            {/* Right Panel - Active Section */}
            <div className="space-y-6">
              {renderActiveSection()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Other sections (simplified view)
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-signar-blue-light/20 to-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-signar-blue to-signar-teal flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-signar-blue to-signar-teal bg-clip-text text-transparent">
              SignAR™
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real-time sign language translation with 3D avatar powered by AI
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <Navigation 
            activeSection={activeSection} 
            onSectionChange={setActiveSection} 
          />
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          {renderActiveSection()}
          
          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-signar-blue-light flex items-center justify-center text-signar-blue">
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
