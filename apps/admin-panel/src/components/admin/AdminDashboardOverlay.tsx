import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, Shield, Users, AlertTriangle, Zap, Globe, Wifi, Database, Lock } from 'lucide-react';

interface AdminDashboardOverlayProps {
  isGeoSweepActive: boolean;
  onToggleGeoSweep: () => void;
}

const AdminDashboardOverlay = ({ isGeoSweepActive, onToggleGeoSweep }: AdminDashboardOverlayProps) => {
  const [liveStats, setLiveStats] = useState({
    activeSOS: 3,
    helpersOnline: 247,
    responseTime: 3.2,
    systemLoad: 67,
    networkLatency: 24,
    threats: 0,
    dataIntegrity: 98.7,
  });

  const [recentActions, setRecentActions] = useState([
    'Admin panel accessed',
    'Geo sweep activated',
    'Helper assigned to SOS-001',
    'Security scan completed',
    'Map layer changed'
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        ...prev,
        helpersOnline: prev.helpersOnline + Math.floor(Math.random() * 3) - 1,
        responseTime: Math.max(1, prev.responseTime + (Math.random() - 0.5) * 0.2),
        systemLoad: Math.max(0, Math.min(100, prev.systemLoad + Math.floor(Math.random() * 6) - 3)),
        networkLatency: Math.max(10, prev.networkLatency + Math.floor(Math.random() * 10) - 5),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Top Status Bar - Clean and minimal */}
      <div className="floating-panel top-16 left-0 right-0 bg-black/20 backdrop-blur-md border-b border-red-500/20">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-red-500">SYSTEM ONLINE</span>
              </div>
              <div className="text-gray-400">
                Last Update: {new Date().toLocaleTimeString()}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                {liveStats.activeSOS} Active SOS
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                {liveStats.helpersOnline} Helpers Online
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Command Center - Bottom Center - Minimal */}
      <div className="floating-panel bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="bg-black/90 backdrop-blur-md border border-red-500/30 rounded-lg px-6 py-3 shadow-lg shadow-red-500/10">
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-xs text-gray-400 uppercase">Command Center</div>
              <div className="text-sm text-red-500 font-bold">ADVANCE SOS</div>
            </div>
            
            <div className="h-8 w-px bg-red-500/30"></div>
            
            <div className="text-center">
              <div className="text-xs text-gray-400 uppercase">Health</div>
              <Progress value={95} className="w-20 h-2 mt-1" />
            </div>
            
            <div className="text-center">
              <div className="text-xs text-gray-400 uppercase">Last Action</div>
              <div className="text-xs text-red-500">{recentActions[0]}</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Icon */}
      <div className="floating-panel bottom-6 right-6">
        <Button
          size="icon"
          className="w-14 h-14 rounded-full bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-500/90 hover:to-purple-600/90 text-white shadow-lg shadow-red-500/20 animate-pulse"
          title="AI Assistant"
        >
          🤖
        </Button>
      </div>
    </>
  );
};

export default AdminDashboardOverlay;
