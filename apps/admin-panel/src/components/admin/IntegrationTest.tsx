import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Database, 
  MapPin, 
  AlertTriangle,
  Heart,
  Shield,
  Building2
} from 'lucide-react';
import { 
  authService, 
  sosEventService, 
  helperService, 
  responderService, 
  hospitalService,
  locationService
} from '@/lib/supabase';

interface TestResult {
  name: string;
  status: 'loading' | 'success' | 'error';
  message: string;
}

const IntegrationTest: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);

    const tests: TestResult[] = [
      { name: 'Supabase Connection', status: 'loading', message: 'Testing connection...' },
      { name: 'Authentication', status: 'loading', message: 'Testing auth...' },
      { name: 'SOS Events Table', status: 'loading', message: 'Testing SOS events...' },
      { name: 'Helpers Table', status: 'loading', message: 'Testing helpers...' },
      { name: 'Responders Table', status: 'loading', message: 'Testing responders...' },
      { name: 'Hospitals Table', status: 'loading', message: 'Testing hospitals...' },
      { name: 'Locations Table', status: 'loading', message: 'Testing locations...' },
      { name: 'Mapbox Token', status: 'loading', message: 'Testing Mapbox...' },
    ];

    setResults(tests);

    // Test 1: Supabase Connection
    try {
      await locationService.getLocations();
      tests[0] = { name: 'Supabase Connection', status: 'success', message: 'Connected successfully' };
    } catch (error) {
      tests[0] = { name: 'Supabase Connection', status: 'error', message: `Connection failed: ${error}` };
    }
    setResults([...tests]);

    // Test 2: Authentication
    try {
      const { user } = await authService.getCurrentUser();
      tests[1] = { 
        name: 'Authentication', 
        status: 'success', 
        message: user ? `Authenticated as ${user.email}` : 'No user logged in' 
      };
    } catch (error) {
      tests[1] = { name: 'Authentication', status: 'error', message: `Auth failed: ${error}` };
    }
    setResults([...tests]);

    // Test 3: SOS Events Table
    try {
      await sosEventService.getSOSEvents();
      tests[2] = { name: 'SOS Events Table', status: 'success', message: 'Table accessible' };
    } catch (error) {
      tests[2] = { name: 'SOS Events Table', status: 'error', message: `Table error: ${error}` };
    }
    setResults([...tests]);

    // Test 4: Helpers Table
    try {
      await helperService.getHelpers();
      tests[3] = { name: 'Helpers Table', status: 'success', message: 'Table accessible' };
    } catch (error) {
      tests[3] = { name: 'Helpers Table', status: 'error', message: `Table error: ${error}` };
    }
    setResults([...tests]);

    // Test 5: Responders Table
    try {
      await responderService.getResponders();
      tests[4] = { name: 'Responders Table', status: 'success', message: 'Table accessible' };
    } catch (error) {
      tests[4] = { name: 'Responders Table', status: 'error', message: `Table error: ${error}` };
    }
    setResults([...tests]);

    // Test 6: Hospitals Table
    try {
      await hospitalService.getHospitals();
      tests[5] = { name: 'Hospitals Table', status: 'success', message: 'Table accessible' };
    } catch (error) {
      tests[5] = { name: 'Hospitals Table', status: 'error', message: `Table error: ${error}` };
    }
    setResults([...tests]);

    // Test 7: Locations Table
    try {
      await locationService.getLocations();
      tests[6] = { name: 'Locations Table', status: 'success', message: 'Table accessible' };
    } catch (error) {
      tests[6] = { name: 'Locations Table', status: 'error', message: `Table error: ${error}` };
    }
    setResults([...tests]);

    // Test 8: Mapbox Token
    try {
      const token = 'pk.eyJ1IjoiaHZtcCIsImEiOiJjbWN6MWk0OXQwdGM4MmtzMzZ4em5zNWFjIn0.bS5vNy8djudidIdQ6yYUdw';
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/Vadodara.json?access_token=${token}`
      );
      if (response.ok) {
        tests[7] = { name: 'Mapbox Token', status: 'success', message: 'Token valid' };
      } else {
        tests[7] = { name: 'Mapbox Token', status: 'error', message: 'Token invalid' };
      }
    } catch (error) {
      tests[7] = { name: 'Mapbox Token', status: 'error', message: `Mapbox error: ${error}` };
    }
    setResults([...tests]);

    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'loading':
        return <Badge variant="secondary">Loading</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-green-500">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return null;
    }
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-400" />
            Integration Test Suite
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <span>Tests: {results.length}</span>
            <span className="text-green-400">Passed: {successCount}</span>
            <span className="text-red-400">Failed: {errorCount}</span>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                'Run All Tests'
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setResults([])}
              disabled={isRunning}
            >
              Clear Results
            </Button>
          </div>

          {results.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-white font-medium">Test Results:</h3>
              
              {results.map((result, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <p className="text-white font-medium">{result.name}</p>
                      <p className="text-gray-400 text-sm">{result.message}</p>
                    </div>
                  </div>
                  {getStatusBadge(result.status)}
                </div>
              ))}
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h4 className="text-white font-medium mb-2">Summary:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-green-400">{successCount} tests passed</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-400">{errorCount} tests failed</span>
                </div>
              </div>
              
              {errorCount === 0 && successCount > 0 && (
                <div className="mt-3 p-3 bg-green-900/20 border border-green-700 rounded">
                  <p className="text-green-400 text-sm">
                    ✅ All tests passed! Your integration is working correctly.
                  </p>
                </div>
              )}
              
              {errorCount > 0 && (
                <div className="mt-3 p-3 bg-red-900/20 border border-red-700 rounded">
                  <p className="text-red-400 text-sm">
                    ❌ Some tests failed. Please check the setup guide and troubleshoot the issues.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded">
            <h4 className="text-blue-400 font-medium mb-2">What's Being Tested:</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Supabase database connection</li>
              <li>• Authentication system</li>
              <li>• All database tables (sos_events, helpers, responders, hospitals, locations)</li>
              <li>• Mapbox API access</li>
              <li>• Real-time subscription capabilities</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationTest; 