import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Avatar3D from '@/components/Avatar3D';
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
  const [isAvatarAnimating, setIsAvatarAnimating] = useState(false);
  const [currentSign, setCurrentSign] = useState('');

  const handleTranslate = (text: string) => {
    setCurrentSign(text);
    // Auto-start animation when translation happens
    setIsAvatarAnimating(true);
    
    // Auto-stop after 5 seconds for demo
    setTimeout(() => {
      setIsAvatarAnimating(false);
    }, 5000);
  };

  const handleToggleAnimation = () => {
    setIsAvatarAnimating(!isAvatarAnimating);
  };

  const handleStartLesson = (lessonId: string) => {
    setCurrentSign(`Learning: ${lessonId}`);
    setIsAvatarAnimating(true);
    
    setTimeout(() => {
      setIsAvatarAnimating(false);
    }, 3000);
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'translate':
        return (
          <TranslationPanel
            onTranslate={handleTranslate}
            isAnimating={isAvatarAnimating}
            onToggleAnimation={handleToggleAnimation}
          />
        );
      case 'learn':
        return <LearningStudio onStartLesson={handleStartLesson} />;
      case 'resources':
        return <LearningResources onSelectResource={(resource) => {
          setCurrentSign(`Learning: ${resource.title}`);
          setIsAvatarAnimating(true);
          setTimeout(() => setIsAvatarAnimating(false), 3000);
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
      title: "3D Avatar",
      description: "Expressive animated avatar with facial expressions"
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
            {/* Left Panel - Avatar */}
            <Card className="p-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  ISL Avatar
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isAvatarAnimating ? 'Signing...' : 'Ready to sign'}
                </p>
              </div>
              
              <div className="h-[500px] bg-gradient-to-b from-signar-blue-light/20 to-transparent rounded-lg">
                <Avatar3D 
                  isAnimating={isAvatarAnimating}
                  currentSign={currentSign}
                  className="w-full h-full"
                />
              </div>
              
              <div className="mt-4 text-center">
                <Badge 
                  variant={isAvatarAnimating ? "default" : "secondary"}
                  className={isAvatarAnimating ? "bg-signar-success text-white" : ""}
                >
                  {isAvatarAnimating ? "Active" : "Standby"}
                </Badge>
              </div>
            </Card>

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
