// src/pages/Index.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import TranslationPanel from '@/components/TranslationPanel';
import LearningStudio from '@/components/LearningStudio';
import LearningResources from '@/components/LearningResources';
import SettingsPanel from '@/components/SettingsPanel';
import SignLanguageFeature from '@/components/SignLanguageFeature';
import SignRecognition from '@/components/SignRecognition';
import ThemeToggle from '@/components/ThemeToggle';
import {
  Sparkles,
  Globe,
  Zap,
  Shield,
  Users,
  Award
} from 'lucide-react';
import { getClipsForWord, SignClip } from '@/utils/signDictionary';

/** One word of the translated sentence; clip is undefined when no video exists. */
interface TrailWord {
  word: string;
  clip?: SignClip;
}

const Index = () => {
  const [activeSection, setActiveSection] = useState<'translate'|'learn'|'resources'|'speech'|'camera'|'settings'>('translate');

  // Video queue state (text → sign playback)
  const [trail, setTrail] = useState<TrailWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0); // index into clipQueue
  const [playbackRate, setPlaybackRate] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Words that have a video, in play order
  const clipQueue = trail.filter(t => t.clip).map(t => t.clip!);

  // Text → word trail; words without a video stay visible but unplayable
  const handleTranslate = (text: string) => {
    setTrail(
      text
        .split(/\s+/)
        .filter(Boolean)
        .map(word => ({ word, clip: getClipsForWord(word)[0] }))
    );
    setCurrentIndex(0);
  };

  // When queue or index changes, load & play
  useEffect(() => {
    const vid = videoRef.current;
    const clip = clipQueue[currentIndex];
    if (vid && clip) {
      vid.src = clip.src;
      vid.playbackRate = playbackRate;
      vid.play().catch(console.error);
    }
  }, [currentIndex, clipQueue, playbackRate]);

  // Move to next clip
  const handleVideoEnded = () => {
    if (currentIndex < clipQueue.length - 1) {
      setCurrentIndex(i => i + 1);
    }
  };

  // Stub for other panels
  const handleStartLesson = (lessonId: string) => { /* … */ };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'translate':
        return (
          <TranslationPanel
            onTranslate={handleTranslate}
            isAnimating={clipQueue.length > 0}
            onToggleAnimation={() => {}}
          />
        );
      case 'learn':
        return <LearningStudio onStartLesson={handleStartLesson} />;
      case 'resources':
        return <LearningResources onSelectResource={() => {}} />;
      case 'speech':
        return <SignLanguageFeature />;
      case 'camera':
        return <SignRecognition />;
      case 'settings':
        return <SettingsPanel onSettingsChange={() => {}} />;
      default:
        return null;
    }
  };

  const features = [
    { icon: <Globe className="w-6 h-6" />,  title: "Real-time Translation", description: "Instant bidirectional translation between text and ISL" },
    { icon: <Sparkles className="w-6 h-6" />, title: "Video Playback",         description: "Plays actual sign-language clips from dataset" },
    { icon: <Zap className="w-6 h-6" />,    title: "Edge-First",             description: "Low-latency processing with offline capability" },
    { icon: <Shield className="w-6 h-6" />, title: "Privacy First",          description: "Your data stays secure with on-device processing" },
    { icon: <Users className="w-6 h-6" />,  title: "Learning Studio",        description: "Interactive lessons and progress tracking" },
    { icon: <Award className="w-6 h-6" />,  title: "Gamified Learning",      description: "Achievements, streaks, and challenges" }
  ];

  // Two-panel layout for translate/learn/resources
  if (['translate','learn','resources'].includes(activeSection)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-signlang-blue-light/20 to-background">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="text-center mb-8 relative">
            <div className="absolute right-0 top-0"><ThemeToggle /></div>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-signlang-blue to-signlang-teal flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-signlang-blue to-signlang-teal bg-clip-text text-transparent">
                SignLang™
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Learn, translate and recognize Indian Sign Language — in real time
            </p>
            <Badge variant="secondary" className="mt-2 bg-signlang-blue-light text-signlang-blue-dark">
              Beta Version - ISL Support
            </Badge>
          </div>

          {/* Navigation */}
          <div className="mb-6">
            <Navigation
              activeSection={activeSection}
              onSectionChange={(s) => setActiveSection(s as typeof activeSection)}
            />
          </div>

          {/* Panels */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left: Video */}
            <Card className="p-6 shadow-xl border-0 bg-card/80 backdrop-blur-sm">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-foreground">ISL Video</h3>
                <p className="text-sm text-muted-foreground">
                  {clipQueue.length > 0
                    ? `Signing: ${clipQueue[currentIndex]?.gloss} (${currentIndex + 1}/${clipQueue.length})`
                    : 'Ready to sign'}
                </p>
              </div>
              <div className="mt-4 flex flex-col items-center gap-3">
                {clipQueue.length > 0 ? (
                  <>
                    <video
                      ref={videoRef}
                      muted
                      playsInline
                      controls={false}
                      onEnded={handleVideoEnded}
                      className="w-full max-w-md rounded-lg shadow"
                    />

                    {/* Word trail — click a playable word to jump to it;
                        words without a video are grayed out */}
                    <div className="flex flex-wrap justify-center gap-1 max-w-md">
                      {(() => {
                        let playIdx = -1;
                        return trail.map((item, i) => {
                          if (!item.clip) {
                            return (
                              <span
                                key={i}
                                title="No sign video available for this word"
                                className="px-2 py-0.5 rounded-full text-xs capitalize bg-muted text-muted-foreground/50 line-through cursor-not-allowed border border-dashed border-border"
                              >
                                {item.word}
                              </span>
                            );
                          }
                          playIdx += 1;
                          const idx = playIdx;
                          return (
                            <button
                              key={i}
                              onClick={() => setCurrentIndex(idx)}
                              className={`px-2 py-0.5 rounded-full text-xs capitalize transition-colors ${
                                idx === currentIndex
                                  ? 'bg-signlang-blue text-white'
                                  : idx < currentIndex
                                    ? 'bg-signlang-blue-light text-signlang-blue-dark'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/70'
                              }`}
                            >
                              {item.clip.gloss}
                            </button>
                          );
                        });
                      })()}
                    </div>

                    {trail.some(t => !t.clip) && (
                      <p className="text-xs text-muted-foreground">
                        Crossed-out words have no sign video yet and are skipped.
                      </p>
                    )}

                    {/* Playback controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentIndex(0)}
                        className="px-3 py-1 rounded-lg border text-sm hover:bg-muted"
                      >
                        ↺ Replay
                      </button>
                      {[0.5, 0.75, 1].map(rate => (
                        <button
                          key={rate}
                          onClick={() => setPlaybackRate(rate)}
                          className={`px-3 py-1 rounded-lg border text-sm transition-colors ${
                            playbackRate === rate
                              ? 'bg-signlang-blue text-white border-signlang-blue'
                              : 'hover:bg-muted'
                          }`}
                        >
                          {rate}×
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-[300px] w-full max-w-md bg-muted rounded-lg flex flex-col items-center justify-center gap-2">
                    <Sparkles className="w-8 h-8 text-muted-foreground/40" />
                    <p className="text-muted-foreground">Type or speak a sentence to see it signed</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Right: Active panel */}
            <div key={activeSection} className="space-y-6 animate-fade-in-up">
              {renderActiveSection()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Single-column for other sections
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-signlang-blue-light/20 to-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-signlang-blue to-signlang-teal flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-signlang-blue to-signlang-teal bg-clip-text text-transparent">
              SignLang™
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Learn, translate and recognize Indian Sign Language — in real time
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <Navigation
            activeSection={activeSection}
            onSectionChange={(s) => setActiveSection(s as typeof activeSection)}
          />
        </div>

        <div className="max-w-4xl mx-auto">
          <div key={activeSection} className="animate-fade-in-up">{renderActiveSection()}</div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {features.map((f, i) => (
              <Card key={i} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-signlang-blue-light flex items-center justify-center text-signlang-blue">
                  {f.icon}
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
