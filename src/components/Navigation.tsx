import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  MessageSquare, 
  BookOpen, 
  Settings, 
  Mic,
  Camera,
  Smartphone 
} from 'lucide-react';

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeSection, onSectionChange }) => {
  const navItems = [
    { id: 'translate', label: 'Translate', icon: MessageSquare },
    { id: 'learn', label: 'Learning Studio', icon: BookOpen },
    { id: 'resources', label: 'Resources', icon: BookOpen },
    { id: 'speech', label: 'Speech Recognition', icon: Mic },
    { id: 'camera', label: 'Sign Recognition', icon: Camera },
    { id: 'ar', label: 'AR Mode', icon: Smartphone },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <Card className="p-4 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <div className="flex flex-wrap gap-2 justify-center">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "signar" : "signar-outline"}
              size="sm"
              onClick={() => onSectionChange(item.id)}
              className="flex items-center gap-2"
            >
              <IconComponent size={16} />
              {item.label}
            </Button>
          );
        })}
      </div>
    </Card>
  );
};

export default Navigation;