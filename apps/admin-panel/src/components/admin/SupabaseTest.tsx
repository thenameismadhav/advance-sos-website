import React, { useState, useEffect } from 'react';
import { locationService } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Database } from 'lucide-react';

const SupabaseTest: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await locationService.getLocations();
      setLocations(data);
      setIsConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const testInsert = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newLocation = await locationService.insertSampleLocation();
      setLocations(prev => [newLocation, ...prev]);
      setIsConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <Card className="w-full max-w-md bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Database className="w-5 h-5" />
          Supabase Connection Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center gap-2">
          {isConnected === null ? (
            <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
          ) : isConnected ? (
            <CheckCircle className="w-4 h-4 text-green-400" />
          ) : (
            <XCircle className="w-4 h-4 text-red-400" />
          )}
          <span className="text-sm">
            {isConnected === null ? 'Testing connection...' :
             isConnected ? 'Connected to Supabase' : 'Connection failed'}
          </span>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Location Count */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {locations.length} locations in database
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={testConnection}
            disabled={isLoading}
            variant="outline"
            className="flex-1"
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              'Test Connection'
            )}
          </Button>
          <Button
            size="sm"
            onClick={testInsert}
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              'Add Sample'
            )}
          </Button>
        </div>

        {/* Recent Locations */}
        {locations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300">Recent Locations:</h4>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {locations.slice(0, 5).map((location) => (
                <div key={location.id} className="text-xs bg-gray-800/50 p-2 rounded">
                  <p className="text-white">{location.name}</p>
                  <p className="text-gray-400">
                    {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SupabaseTest; 