import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Database, 
  Wifi, 
  WifiOff,
  AlertTriangle,
  RefreshCw,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';
import { 
  supabase, 
  sosEventService, 
  helperService, 
  responderService, 
  hospitalService,
  locationService,
  mediaService
} from '@/lib/supabase';

const LiveDataSyncTest: React.FC = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [liveData, setLiveData] = useState<any>({
    sosEvents: [],
    helpers: [],
    responders: [],
    hospitals: [],
    locations: [],
    media: []
  });
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Test real-time subscriptions
  const testRealtimeSubscriptions = async () => {
    setIsTesting(true);
    setResults([]);

    const tests = [
      {
        name: 'SOS Events Subscription',
        test: async () => {
          try {
            const sub = sosEventService.subscribeToSOSEvents((payload) => {
              console.log('SOS Events real-time update:', payload);
              setLastUpdate(new Date());
              setLiveData(prev => ({
                ...prev,
                sosEvents: [...prev.sosEvents, { type: 'update', payload, timestamp: new Date() }]
              }));
            });
            
            // Test initial data fetch
            const events = await sosEventService.getSOSEvents();
            
            return {
              success: true,
              message: `Subscription active. Found ${events.length} SOS events`,
              details: { subscription: 'active', eventCount: events.length }
            };
          } catch (error) {
            return {
              success: false,
              message: 'SOS Events subscription failed',
              details: { error: error.message }
            };
          }
        }
      },
      {
        name: 'Helpers Subscription',
        test: async () => {
          try {
            const sub = helperService.subscribeToHelpers((payload) => {
              console.log('Helpers real-time update:', payload);
              setLastUpdate(new Date());
              setLiveData(prev => ({
                ...prev,
                helpers: [...prev.helpers, { type: 'update', payload, timestamp: new Date() }]
              }));
            });
            
            const helpers = await helperService.getHelpers();
            
            return {
              success: true,
              message: `Subscription active. Found ${helpers.length} helpers`,
              details: { subscription: 'active', helperCount: helpers.length }
            };
          } catch (error) {
            return {
              success: false,
              message: 'Helpers subscription failed',
              details: { error: error.message }
            };
          }
        }
      },
      {
        name: 'Responders Subscription',
        test: async () => {
          try {
            const sub = responderService.subscribeToResponders((payload) => {
              console.log('Responders real-time update:', payload);
              setLastUpdate(new Date());
              setLiveData(prev => ({
                ...prev,
                responders: [...prev.responders, { type: 'update', payload, timestamp: new Date() }]
              }));
            });
            
            const responders = await responderService.getResponders();
            
            return {
              success: true,
              message: `Subscription active. Found ${responders.length} responders`,
              details: { subscription: 'active', responderCount: responders.length }
            };
          } catch (error) {
            return {
              success: false,
              message: 'Responders subscription failed',
              details: { error: error.message }
            };
          }
        }
      },
      {
        name: 'Hospitals Subscription',
        test: async () => {
          try {
            const sub = hospitalService.subscribeToHospitals((payload) => {
              console.log('Hospitals real-time update:', payload);
              setLastUpdate(new Date());
              setLiveData(prev => ({
                ...prev,
                hospitals: [...prev.hospitals, { type: 'update', payload, timestamp: new Date() }]
              }));
            });
            
            const hospitals = await hospitalService.getHospitals();
            
            return {
              success: true,
              message: `Subscription active. Found ${hospitals.length} hospitals`,
              details: { subscription: 'active', hospitalCount: hospitals.length }
            };
          } catch (error) {
            return {
              success: false,
              message: 'Hospitals subscription failed',
              details: { error: error.message }
            };
          }
        }
      },
      {
        name: 'Locations Subscription',
        test: async () => {
          try {
            const sub = locationService.subscribeToLocations((payload) => {
              console.log('Locations real-time update:', payload);
              setLastUpdate(new Date());
              setLiveData(prev => ({
                ...prev,
                locations: [...prev.locations, { type: 'update', payload, timestamp: new Date() }]
              }));
            });
            
            const locations = await locationService.getLocations();
            
            return {
              success: true,
              message: `Subscription active. Found ${locations.length} locations`,
              details: { subscription: 'active', locationCount: locations.length }
            };
          } catch (error) {
            return {
              success: false,
              message: 'Locations subscription failed',
              details: { error: error.message }
            };
          }
        }
      },
      {
        name: 'WebSocket Connection',
        test: async () => {
          try {
            // Test WebSocket connection by creating a simple channel
            const channel = supabase.channel('test-channel');
            const status = await channel.subscribe();
            
            return {
              success: status === 'SUBSCRIBED',
              message: status === 'SUBSCRIBED' ? 'WebSocket connected' : 'WebSocket failed',
              details: { status }
            };
          } catch (error) {
            return {
              success: false,
              message: 'WebSocket connection failed',
              details: { error: error.message }
            };
          }
        }
      }
    ];

    for (const test of tests) {
      try {
        const result = await test.test();
        setResults(prev => [...prev, { name: test.name, ...result }]);
      } catch (error) {
        setResults(prev => [...prev, {
          name: test.name,
          success: false,
          message: 'Test failed with exception',
          details: { error: error.message }
        }]);
      }
    }

    setIsTesting(false);
  };

  // Test data insertion
  const testDataInsertion = async () => {
    try {
      // Insert a test location
      const testLocation = await locationService.insertLocation(
        `Test Location ${new Date().toLocaleTimeString()}`,
        22.3072 + (Math.random() - 0.5) * 0.01, // Random offset
        73.1812 + (Math.random() - 0.5) * 0.01
      );
      
      console.log('Test location inserted:', testLocation);
      return { success: true, message: 'Test data inserted successfully' };
    } catch (error) {
      console.error('Test data insertion failed:', error);
      return { success: false, message: 'Test data insertion failed', error: error.message };
    }
  };

  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wifi className="w-6 h-6 text-green-400" />
            Live Data Sync Test
          </CardTitle>
          <p className="text-gray-400 text-sm">
            Test real-time subscriptions and data synchronization with Supabase
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={testRealtimeSubscriptions} 
              disabled={isTesting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing Subscriptions...
                </>
              ) : (
                <>
                  <Wifi className="w-4 h-4 mr-2" />
                  Test Real-time Subscriptions
                </>
              )}
            </Button>
            
            <Button 
              onClick={testDataInsertion}
              variant="outline"
              className="text-green-400 border-green-400 hover:bg-green-400/10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Insert Test Data
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => {
                setResults([]);
                setLiveData({
                  sosEvents: [],
                  helpers: [],
                  responders: [],
                  hospitals: [],
                  locations: [],
                  media: []
                });
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Clear Results
            </Button>
          </div>

          {results.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-white">Tests: {totalCount}</span>
                <span className="text-green-400">Passed: {successCount}</span>
                <span className="text-red-400">Failed: {totalCount - successCount}</span>
                {lastUpdate && (
                  <span className="text-blue-400">
                    Last Update: {lastUpdate.toLocaleTimeString()}
                  </span>
                )}
              </div>
              
              {results.map((result, index) => (
                <div 
                  key={index}
                  className={`flex items-start justify-between p-3 rounded-lg border ${
                    result.success 
                      ? 'bg-green-900/20 border-green-700' 
                      : 'bg-red-900/20 border-red-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400 mt-0.5" />
                    )}
                    <div>
                      <p className="text-white font-medium">{result.name}</p>
                      <p className={`text-sm ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                        {result.message}
                      </p>
                      {result.details && (
                        <div className="mt-2 text-xs text-gray-400">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.success ? 'PASS' : 'FAIL'}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {/* Live Data Display */}
          <div className="mt-6">
            <h4 className="text-white font-medium mb-3">Live Data Updates:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(liveData).map(([key, updates]) => (
                <div key={key} className="bg-gray-800 p-3 rounded border border-gray-700">
                  <h5 className="text-white font-medium capitalize mb-2">{key}</h5>
                  <div className="text-sm text-gray-400">
                    <p>Updates: {Array.isArray(updates) ? updates.length : 0}</p>
                    {Array.isArray(updates) && updates.length > 0 && (
                      <div className="mt-2 max-h-32 overflow-y-auto">
                        {updates.slice(-3).map((update, index) => (
                          <div key={index} className="text-xs bg-gray-700 p-1 rounded mb-1">
                            <p className="text-blue-400">
                              {update.timestamp?.toLocaleTimeString() || 'Unknown'}
                            </p>
                            <p className="text-gray-300">
                              {update.payload?.eventType || 'Update'}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Connection Status */}
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded">
            <h4 className="text-blue-400 font-medium mb-2">Connection Status:</h4>
            <div className="text-sm text-gray-300 space-y-1">
              <p>Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? '✓ Connected' : '✗ Missing'}</p>
              <p>WebSocket: {successCount > 0 ? '✓ Active' : '✗ Inactive'}</p>
              <p>Real-time: {lastUpdate ? '✓ Receiving updates' : '✗ No updates'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveDataSyncTest; 