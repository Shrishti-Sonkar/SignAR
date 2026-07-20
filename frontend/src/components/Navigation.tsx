import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  MessageSquare,
  BookOpen,
  GraduationCap,
  Settings,
  Mic,
  Camera,
} from 'lucide-react';

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeSection, onSectionChange }) => {
  const navItems = [
    { id: 'translate', label: 'Translate', icon: MessageSquare },
    { id: 'speech', label: 'Speech to Sign', icon: Mic },
    { id: 'camera', label: 'Recognize', icon: Camera },
    { id: 'learn', label: 'Learn', icon: GraduationCap },
    { id: 'resources', label: 'Resources', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <Card className="p-2 sm:p-3 shadow-lg border-0 bg-card/80 backdrop-blur-sm sticky top-2 z-40">
      <nav aria-label="Main">
        <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
          {navItems.map(item => {
            const IconComponent = item.icon;
            const active = activeSection === item.id;
            return (
              <Button
                key={item.id}
                variant={active ? 'signlang' : 'ghost'}
                size="sm"
                onClick={() => onSectionChange(item.id)}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-1.5 transition-all ${
                  active ? 'shadow-md' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <IconComponent size={16} />
                <span className="hidden sm:inline">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </nav>
    </Card>
  );
};

export default Navigation;
