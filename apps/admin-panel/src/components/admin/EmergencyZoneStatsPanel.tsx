import React, { useState, useEffect } from 'react';
import { GeospatialService } from '@/lib/services/geospatial';
import { EmergencyZoneStats, Zone } from '@/types/geospatial';
import { 
  Activity, 
  Users, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface EmergencyZoneStatsPanelProps {
  selectedZone?: Zone | null;
  autoRefresh?: boolean;
  refreshInterval?: number; // in seconds
}

export const EmergencyZoneStatsPanel: React.FC<EmergencyZoneStatsPanelProps> = ({
  selectedZone,
  autoRefresh = true,
  refreshInterval = 15,
}) => {
  const [stats, setStats] = useState<EmergencyZoneStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [previousStats, setPreviousStats] = useState<EmergencyZoneStats | null>(null);

  // Load stats when zone changes
  useEffect(() => {
    if (selectedZone) {
      loadZoneStats(selectedZone.id);
    } else {
      setStats(null);
      setPreviousStats(null);
    }
  }, [selectedZone]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !selectedZone) return;

    const interval = setInterval(() => {
      if (selectedZone) {
        loadZoneStats(selectedZone.id);
      }
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, selectedZone, refreshInterval]);

  const loadZoneStats = async (zoneId: string) => {
    try {
      setLoading(true);
      const { stats: newStats, error } = await GeospatialService.getZoneStats(zoneId);
      
      if (error) {
        console.error('Failed to load zone stats:', error);
        return;
      }

      if (newStats) {
        setPreviousStats(stats);
        setStats(newStats);
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error('Error loading zone stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = () => {
    if (selectedZone) {
      loadZoneStats(selectedZone.id);
    }
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (previous === null || previous === undefined) return <Minus className="w-4 h-4 text-gray-400" />;
    if (current > previous) return <TrendingUp className="w-4 h-4 text-red-400" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-green-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getTrendValue = (current: number, previous: number) => {
    if (previous === null || previous === undefined) return null;
    const diff = current - previous;
    return diff > 0 ? `+${diff}` : `${diff}`;
  };

  const getSeverityColor = (count: number, threshold: number) => {
    if (count >= threshold * 1.5) return 'text-red-400';
    if (count >= threshold) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getResponseTimeColor = (time: number) => {
    if (time <= 5) return 'text-green-400';
    if (time <= 10) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!selectedZone) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Zone Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-gray-500">
            Select a zone to view statistics
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Zone Statistics
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleManualRefresh}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <MapPin className="w-4 h-4" />
          {selectedZone.name}
          <Badge variant="outline" className="text-xs">
            {selectedZone.type}
          </Badge>
        </div>
        <div className="text-xs text-gray-500">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">Loading statistics...</div>
          </div>
        ) : stats ? (
          <div className="space-y-6">
            {/* Active SOS Cases */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="font-medium">Active SOS Cases</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${getSeverityColor(stats.activeSOSCases, 5)}`}>
                    {stats.activeSOSCases}
                  </span>
                  {getTrendIcon(stats.activeSOSCases, previousStats?.activeSOSCases)}
                </div>
              </div>
              {previousStats && (
                <div className="text-xs text-gray-500">
                  {getTrendValue(stats.activeSOSCases, previousStats.activeSOSCases)} from last update
                </div>
              )}
              <Progress 
                value={Math.min((stats.activeSOSCases / 10) * 100, 100)} 
                className="h-2"
              />
            </div>

            {/* Available Helpers */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-400" />
                  <span className="font-medium">Available Helpers</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-green-400">
                    {stats.availableHelpers}
                  </span>
                  {getTrendIcon(stats.availableHelpers, previousStats?.availableHelpers)}
                </div>
              </div>
              {previousStats && (
                <div className="text-xs text-gray-500">
                  {getTrendValue(stats.availableHelpers, previousStats.availableHelpers)} from last update
                </div>
              )}
              <Progress 
                value={Math.min((stats.availableHelpers / 20) * 100, 100)} 
                className="h-2"
              />
            </div>

            {/* Assigned Responders */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="font-medium">Assigned Responders</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-blue-400">
                    {stats.assignedResponders}
                  </span>
                  {getTrendIcon(stats.assignedResponders, previousStats?.assignedResponders)}
                </div>
              </div>
              {previousStats && (
                <div className="text-xs text-gray-500">
                  {getTrendValue(stats.assignedResponders, previousStats.assignedResponders)} from last update
                </div>
              )}
              <Progress 
                value={Math.min((stats.assignedResponders / 15) * 100, 100)} 
                className="h-2"
              />
            </div>

            {/* Average Response Time */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <span className="font-medium">Avg Response Time</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${getResponseTimeColor(stats.averageResponseTime)}`}>
                    {stats.averageResponseTime} min
                  </span>
                  {getTrendIcon(stats.averageResponseTime, previousStats?.averageResponseTime)}
                </div>
              </div>
              {previousStats && (
                <div className="text-xs text-gray-500">
                  {getTrendValue(stats.averageResponseTime, previousStats.averageResponseTime)} min from last update
                </div>
              )}
              <Progress 
                value={Math.min((stats.averageResponseTime / 20) * 100, 100)} 
                className="h-2"
              />
            </div>

            {/* Zone Health Score */}
            <div className="pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Zone Health Score</span>
                <Badge 
                  variant={stats.activeSOSCases > 5 ? "destructive" : stats.activeSOSCases > 2 ? "secondary" : "default"}
                >
                  {stats.activeSOSCases > 5 ? "Critical" : stats.activeSOSCases > 2 ? "Warning" : "Good"}
                </Badge>
              </div>
              <div className="text-sm text-gray-400">
                Based on SOS cases, response times, and resource availability
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-gray-500">
            No statistics available for this zone
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 