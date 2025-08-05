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
  Zap,
  User,
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
    // Avatar Appearance
    avatarSkinTone: 2, // 0-4 range
    avatarClothing: 'tracksuit', // tracksuit, formal, casual
    avatarHairStyle: 'default',
    
    // Animation Settings
    animationSpeed: 1.0, // 0.5-2.0 range
    expressionIntensity: 0.8, // 0-1 range
    smoothTransitions: true,
    
    // Display Settings
    showGlosses: true,
    showTransliteration: false,
    darkMode: false,
    reducedMotion: false,
    
    // Audio Settings
    enableSounds: true,
    voiceFeedback: false,
    volume: 0.7,
    
    // Learning Preferences
    difficultyLevel: 'intermediate',
    learningGoals: ['daily-conversation', 'academic'],
    reminderFrequency: 'daily',
    
    // Accessibility
    highContrast: false,
    largeText: false,
    keyboardNavigation: true
  });

  const updateSetting = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      avatarSkinTone: 2,
      avatarClothing: 'tracksuit',
      avatarHairStyle: 'default',
      animationSpeed: 1.0,
      expressionIntensity: 0.8,
      smoothTransitions: true,
      showGlosses: true,
      showTransliteration: false,
      darkMode: false,
      reducedMotion: false,
      enableSounds: true,
      voiceFeedback: false,
      volume: 0.7,
      difficultyLevel: 'intermediate',
      learningGoals: ['daily-conversation'],
      reminderFrequency: 'daily',
      highContrast: false,
      largeText: false,
      keyboardNavigation: true
    };
    
    setSettings(defaultSettings);
    onSettingsChange(defaultSettings);
    
    toast({
      title: "Settings Reset",
      description: "All settings have been restored to defaults",
    });
  };

  const saveSettings = () => {
    // In a real app, this would save to localStorage or backend
    localStorage.setItem('signar_settings', JSON.stringify(settings));
    
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
            <h2 className="text-xl font-semibold">SignAR Settings</h2>
            <p className="text-sm text-muted-foreground">Customize your experience</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Avatar Customization */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Avatar Appearance
              </h3>
              
              {/* Skin Tone */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Skin Tone</Label>
                <div className="flex gap-2">
                  {skinToneOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateSetting('avatarSkinTone', option.value)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        settings.avatarSkinTone === option.value 
                          ? 'border-signar-blue scale-110' 
                          : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: option.color }}
                      title={option.label}
                    />
                  ))}
                </div>
              </div>

              {/* Clothing */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Clothing Style</Label>
                <div className="grid grid-cols-2 gap-2">
                  {clothingOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={settings.avatarClothing === option.value ? "signar" : "outline"}
                      size="sm"
                      onClick={() => updateSetting('avatarClothing', option.value)}
                      className="h-12 text-xs"
                    >
                      <span className="mr-2">{option.preview}</span>
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Animation Settings */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Animation
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Animation Speed</Label>
                  <div className="mt-2">
                    <Slider
                      value={[settings.animationSpeed]}
                      onValueChange={(value) => updateSetting('animationSpeed', value[0])}
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Slow</span>
                      <span>{settings.animationSpeed.toFixed(1)}x</span>
                      <span>Fast</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Expression Intensity</Label>
                  <div className="mt-2">
                    <Slider
                      value={[settings.expressionIntensity]}
                      onValueChange={(value) => updateSetting('expressionIntensity', value[0])}
                      min={0}
                      max={1}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Subtle</span>
                      <span>{Math.round(settings.expressionIntensity * 100)}%</span>
                      <span>Dramatic</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="smooth-transitions" className="text-sm font-medium">
                    Smooth Transitions
                  </Label>
                  <Switch
                    id="smooth-transitions"
                    checked={settings.smoothTransitions}
                    onCheckedChange={(checked) => updateSetting('smoothTransitions', checked)}
                  />
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

                {settings.enableSounds && (
                  <div>
                    <Label className="text-sm font-medium">Volume</Label>
                    <div className="mt-2">
                      <Slider
                        value={[settings.volume]}
                        onValueChange={(value) => updateSetting('volume', value[0])}
                        min={0}
                        max={1}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Quiet</span>
                        <span>{Math.round(settings.volume * 100)}%</span>
                        <span>Loud</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Learning Preferences */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Learning Preferences</h3>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Difficulty Level</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {['beginner', 'intermediate', 'advanced'].map((level) => (
                      <Button
                        key={level}
                        variant={settings.difficultyLevel === level ? "signar" : "outline"}
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