
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Lock, Eye, Activity } from 'lucide-react';

interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'login' | 'access' | 'warning' | 'error';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface AdminSecurityPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

const AdminSecurityPanel = ({ isVisible, onClose }: AdminSecurityPanelProps) => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([
    {
      id: '1',
      timestamp: new Date().toISOString(),
      type: 'login',
      message: 'Admin login successful',
      severity: 'low'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      type: 'access',
      message: 'Map view accessed',
      severity: 'low'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      type: 'warning',
      message: 'Multiple failed login attempts detected',
      severity: 'medium'
    }
  ]);

  const [systemStatus, setSystemStatus] = useState({
    firewall: 'active',
    encryption: 'enabled',
    monitoring: 'active',
    backup: 'scheduled'
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'login': return <Lock className="h-4 w-4" />;
      case 'access': return <Eye className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="overlay-container bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden bg-gray-900 border-sos-cyan/30">
        <CardHeader className="border-b border-sos-cyan/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sos-cyan flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Security Dashboard
            </CardTitle>
            <Button 
              onClick={onClose}
              variant="ghost" 
              className="text-sos-cyan hover:bg-sos-cyan/10"
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 overflow-y-auto max-h-[60vh]">
          {/* System Status */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Firewall</span>
                <Badge className="bg-green-500">Active</Badge>
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Encryption</span>
                <Badge className="bg-green-500">Enabled</Badge>
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Monitoring</span>
                <Badge className="bg-green-500">Active</Badge>
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Backup</span>
                <Badge className="bg-blue-500">Scheduled</Badge>
              </div>
            </div>
          </div>

          {/* Security Events */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-sos-cyan">Recent Security Events</h3>
            {securityEvents.map((event) => (
              <div key={event.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(event.type)}
                    <div>
                      <p className="text-white">{event.message}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge className={getSeverityColor(event.severity)}>
                    {event.severity.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Security Actions */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button className="bg-sos-cyan text-black hover:bg-sos-cyan/90">
              Generate Security Report
            </Button>
            <Button variant="outline" className="border-sos-cyan text-sos-cyan hover:bg-sos-cyan/10">
              View Audit Logs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSecurityPanel;
