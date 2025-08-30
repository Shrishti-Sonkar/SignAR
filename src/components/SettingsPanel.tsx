import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Palette, 
  Volume2, 
  Mic,
  Settings as SettingsIcon,
  Save,
  RotateCcw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SettingsPanelProps {
  onSettingsChange: (settings: any) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onSettingsChange }) => {
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    // Speech Recognition Settings
    speechLanguage: 'en-US', // en-US, hi-IN for ISL context
    speechSensitivity: 0.7, // 0-1 range
    continuousRecognition: false,
    interimResults: true,
    
    // Video Playback Settings
    videoPlaybackSpeed: 1.0, // 0.5-2.0 range
    autoPlaySequence: true,
    preloadVideos: true,
    showVideoProgress: true,
    
    // ISL Translation Settings
    showGlosses: true,
    showWordHighlight: true,
    splitLongSentences: true,
    darkMode: false,
    
    // Audio Settings
    enableSounds: true,
    videoVolume: 0.8,
    feedbackSounds: true,
    
    // Learning Mode
    practiceMode: false,
    showMissingWords: true,
    difficultyLevel: 'intermediate',
    
    // Accessibility
    highContrast: false,
    largeText: false,
    reducedMotion: false
  });

  const updateSetting = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      speechLanguage: 'en-US',
      speechSensitivity: 0.7,
      continuousRecognition: false,
      interimResults: true,
      videoPlaybackSpeed: 1.0,
      autoPlaySequence: true,
      preloadVideos: true,
      showVideoProgress: true,
      showGlosses: true,
      showWordHighlight: true,
      splitLongSentences: true,
      darkMode: false,
      enableSounds: true,
      videoVolume: 0.8,
      feedbackSounds: true,
      practiceMode: false,
      showMissingWords: true,
      difficultyLevel: 'intermediate',
      highContrast: false,
      largeText: false,
      reducedMotion: false
    };
    
    setSettings(defaultSettings);
    onSettingsChange(defaultSettings);
    
    toast({
      title: "Settings Reset",
      description: "All settings have been restored to defaults",
    });
  };

  const saveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem('isl_translator_settings', JSON.stringify(settings));
    
    toast({
      title: "Settings Saved",
      description: "Your preferences have been saved successfully",
    });
  };

  const skinToneOptions = [
    { value: 0, label: 'Very Light', color: '#FDBCB4' },
    { value: 1, label: 'Light', color: '#F1C27D' },
    { value: 2, label: 'Medium', color: '#E0AC69' },
    { value: 3, label: 'Dark', color: '#C68642' },
    { value: 4, label: 'Very Dark', color: '#8D5524' }
  ];

  const clothingOptions = [
    { value: 'tracksuit', label: 'Tracksuit (Blue)', preview: '🏃‍♂️' },
    { value: 'formal', label: 'Formal Wear', preview: '👔' },
    { value: 'casual', label: 'Casual Wear', preview: '👕' },
    { value: 'traditional', label: 'Traditional', preview: '🥻' }
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-signar-blue flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">ISL Translator Settings</h2>
            <p className="text-sm text-muted-foreground">Customize your translation experience</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Speech Recognition */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Speech Recognition
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="continuous-recognition" className="text-sm font-medium">
                    Continuous Recognition
                  </Label>
                  <Switch
                    id="continuous-recognition"
                    checked={settings.continuousRecognition}
                    onCheckedChange={(checked) => updateSetting('continuousRecognition', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="interim-results" className="text-sm font-medium">
                    Show Interim Results
                  </Label>
                  <Switch
                    id="interim-results"
                    checked={settings.interimResults}
                    onCheckedChange={(checked) => updateSetting('interimResults', checked)}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Speech Sensitivity</Label>
                  <div className="mt-2">
                    <Slider
                      value={[settings.speechSensitivity]}
                      onValueChange={(value) => updateSetting('speechSensitivity', value[0])}
                      min={0}
                      max={1}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Low</span>
                      <span>{Math.round(settings.speechSensitivity * 100)}%</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Playback */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                Video Playback
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-play" className="text-sm font-medium">
                    Auto-play Sequences
                  </Label>
                  <Switch
                    id="auto-play"
                    checked={settings.autoPlaySequence}
                    onCheckedChange={(checked) => updateSetting('autoPlaySequence', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="preload-videos" className="text-sm font-medium">
                    Preload Videos
                  </Label>
                  <Switch
                    id="preload-videos"
                    checked={settings.preloadVideos}
                    onCheckedChange={(checked) => updateSetting('preloadVideos', checked)}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Playback Speed</Label>
                  <div className="mt-2">
                    <Slider
                      value={[settings.videoPlaybackSpeed]}
                      onValueChange={(value) => updateSetting('videoPlaybackSpeed', value[0])}
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Slow</span>
                      <span>{settings.videoPlaybackSpeed.toFixed(1)}x</span>
                      <span>Fast</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Video Volume</Label>
                  <div className="mt-2">
                    <Slider
                      value={[settings.videoVolume]}
                      onValueChange={(value) => updateSetting('videoVolume', value[0])}
                      min={0}
                      max={1}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Quiet</span>
                      <span>{Math.round(settings.videoVolume * 100)}%</span>
                      <span>Loud</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Display & Accessibility */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Display & Accessibility
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-glosses" className="text-sm font-medium">
                    Show ISL Glosses
                  </Label>
                  <Switch
                    id="show-glosses"
                    checked={settings.showGlosses}
                    onCheckedChange={(checked) => updateSetting('showGlosses', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="high-contrast" className="text-sm font-medium">
                    High Contrast Mode
                  </Label>
                  <Switch
                    id="high-contrast"
                    checked={settings.highContrast}
                    onCheckedChange={(checked) => updateSetting('highContrast', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="large-text" className="text-sm font-medium">
                    Large Text
                  </Label>
                  <Switch
                    id="large-text"
                    checked={settings.largeText}
                    onCheckedChange={(checked) => updateSetting('largeText', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="reduced-motion" className="text-sm font-medium">
                    Reduced Motion
                  </Label>
                  <Switch
                    id="reduced-motion"
                    checked={settings.reducedMotion}
                    onCheckedChange={(checked) => updateSetting('reducedMotion', checked)}
                  />
                </div>
              </div>
            </div>

            {/* Audio Settings */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                Audio
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-sounds" className="text-sm font-medium">
                    Enable Sounds
                  </Label>
                  <Switch
                    id="enable-sounds"
                    checked={settings.enableSounds}
                    onCheckedChange={(checked) => updateSetting('enableSounds', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="feedback-sounds" className="text-sm font-medium">
                    Feedback Sounds
                  </Label>
                  <Switch
                    id="feedback-sounds"
                    checked={settings.feedbackSounds}
                    onCheckedChange={(checked) => updateSetting('feedbackSounds', checked)}
                  />
                </div>
              </div>
            </div>

            {/* ISL Learning */}
            <div>
              <h3 className="text-lg font-semibold mb-4">ISL Learning</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="practice-mode" className="text-sm font-medium">
                    Practice Mode
                  </Label>
                  <Switch
                    id="practice-mode"
                    checked={settings.practiceMode}
                    onCheckedChange={(checked) => updateSetting('practiceMode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-missing" className="text-sm font-medium">
                    Show Missing Words
                  </Label>
                  <Switch
                    id="show-missing"
                    checked={settings.showMissingWords}
                    onCheckedChange={(checked) => updateSetting('showMissingWords', checked)}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Difficulty Level</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {['beginner', 'intermediate', 'advanced'].map((level) => (
                      <Button
                        key={level}
                        variant={settings.difficultyLevel === level ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateSetting('difficultyLevel', level)}
                        className="capitalize"
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6 border-t">
          <Button onClick={saveSettings} variant="signar">
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
          <Button onClick={resetToDefaults} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPanel;