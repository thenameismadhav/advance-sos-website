import React from 'react';
import { Button } from '@/components/ui/button';
import { Command, Globe, Map, Layers } from 'lucide-react';

interface AdminToolsPanelProps {
  onOpenAICommandCenter: () => void;
}

const HudButton = ({ icon: Icon, children, ...props }: any) => (
  <Button
    variant="ghost"
    className="w-full justify-start text-hud-text-primary hover:bg-hud-cyan-transparent hover:text-hud-cyan"
    {...props}
  >
    <Icon className="w-4 h-4 mr-2 text-hud-cyan" />
    {children}
  </Button>
);

const AdminToolsPanel: React.FC<AdminToolsPanelProps> = ({ onOpenAICommandCenter }) => {
  return (
    <div className="w-full h-full flex flex-col justify-between p-2">
      <div className="flex flex-col space-y-2">
        <HudButton icon={Command} onClick={onOpenAICommandCenter}>
          AI Command
        </HudButton>
        <HudButton icon={Map}>
          Map Overlays
        </HudButton>
        <HudButton icon={Globe}>
          Global View
        </HudButton>
        <HudButton icon={Layers}>
          Data Layers
        </HudButton>
      </div>
      <div className="text-xs text-center text-hud-text-secondary">
        All systems nominal.
      </div>
    </div>
  );
};

export default AdminToolsPanel;
