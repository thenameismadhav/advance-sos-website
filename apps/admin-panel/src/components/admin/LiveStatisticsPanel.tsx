
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, X } from 'lucide-react';

interface LiveStatisticsPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

const LiveStatisticsPanel = ({ isVisible, onClose }: LiveStatisticsPanelProps) => {
  const [liveStats, setLiveStats] = useState({
    activeSOS: 3,
    helpersOnline: 247,
    responseTime: 3.2,
    threats: 0,
  });

  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        ...prev,
        helpersOnline: prev.helpersOnline + Math.floor(Math.random() * 3) - 1,
        responseTime: Math.max(1, prev.responseTime + (Math.random() - 0.5) * 0.2),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="floating-panel top-32 right-96 w-72">
      <Card className="bg-black/80 backdrop-blur-md border-sos-cyan/30 shadow-lg shadow-sos-cyan/10">
        <CardHeader className="border-b border-sos-cyan/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sos-cyan font-bold uppercase tracking-wider text-sm flex items-center gap-2">
              <Users className="h-5 w-5" />
              Live Statistics
            </CardTitle>
            <Button 
              onClick={onClose}
              variant="ghost" 
              size="icon"
              className="text-sos-cyan hover:bg-sos-cyan/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-sos-red">{liveStats.activeSOS}</div>
              <div className="text-xs text-gray-400 uppercase">Active SOS</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{liveStats.helpersOnline}</div>
              <div className="text-xs text-gray-400 uppercase">Helpers</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-sos-cyan">{liveStats.responseTime.toFixed(1)}m</div>
              <div className="text-xs text-gray-400 uppercase">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-400">{liveStats.threats}</div>
              <div className="text-xs text-gray-400 uppercase">Threats</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveStatisticsPanel;
