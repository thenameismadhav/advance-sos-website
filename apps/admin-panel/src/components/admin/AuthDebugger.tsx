import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AuthService } from '@/lib/services/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle, User, Database, Shield } from 'lucide-react';

interface DebugResult {
  test: string;
  success: boolean;
  message: string;
  details?: any;
}

export const AuthDebugger: React.FC = () => {
  const [results, setResults] = useState<DebugResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);

    const tests: DebugResult[] = [];

    try {
      // Test 1: Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      tests.push({
        test: 'User Authentication',
        success: !!user && !authError,
        message: user ? `Authenticated as: ${user.email}` : 'No user authenticated',
        details: { user: user?.email, error: authError?.message }
      });

      if (!user) {
        tests.push({
          test: 'Admin Access',
          success: false,
          message: 'Cannot test admin access without authentication',
          details: { error: 'User not authenticated' }
        });
        setResults(tests);
        setIsRunning(false);
        return;
      }

      // Test 2: Check if user profile exists
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      tests.push({
        test: 'User Profile',
        success: !!userProfile && !profileError,
        message: userProfile ? `Profile found: ${userProfile.name}` : 'No user profile found',
        details: { profile: userProfile, error: profileError?.message }
      });

      // Test 3: Check if admin profile exists
      const { data: adminProfile, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('id', user.id)
        .single();

      tests.push({
        test: 'Admin Profile',
        success: !!adminProfile && !adminError,
        message: adminProfile ? `Admin profile found: ${adminProfile.role}` : 'No admin profile found',
        details: { admin: adminProfile, error: adminError?.message }
      });

      // Test 4: Test AuthService.getCurrentAdmin()
      try {
        const admin = await AuthService.getCurrentAdmin();
        tests.push({
          test: 'AuthService.getCurrentAdmin()',
          success: !!admin,
          message: admin ? `Admin access granted: ${admin.name}` : 'Admin access denied',
          details: { admin: admin }
        });
      } catch (error: any) {
        tests.push({
          test: 'AuthService.getCurrentAdmin()',
          success: false,
          message: `Error: ${error.message}`,
          details: { error: error.message }
        });
      }

      // Test 5: Test AuthService.signIn()
      try {
        const { admin, error } = await AuthService.signIn({
          email: user.email || '',
          password: 'test-password' // This will fail but we can see the flow
        });
        tests.push({
          test: 'AuthService.signIn()',
          success: !error || error.message.includes('Invalid login credentials'),
          message: error ? `Expected error: ${error.message}` : 'Unexpected success',
          details: { error: error?.message }
        });
      } catch (error: any) {
        tests.push({
          test: 'AuthService.signIn()',
          success: false,
          message: `Unexpected error: ${error.message}`,
          details: { error: error.message }
        });
      }

      // Test 6: Check database tables
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .in('table_name', ['users', 'admins']);

      tests.push({
        test: 'Database Tables',
        success: !tablesError && tables && tables.length >= 2,
        message: tablesError ? 'Error checking tables' : `Found ${tables?.length || 0} required tables`,
        details: { tables: tables?.map(t => t.table_name), error: tablesError?.message }
      });

      // Test 7: Check RLS policies
      const { data: policies, error: policiesError } = await supabase
        .from('pg_policies')
        .select('tablename, policyname')
        .eq('schemaname', 'public')
        .in('tablename', ['users', 'admins']);

      tests.push({
        test: 'RLS Policies',
        success: !policiesError && policies && policies.length > 0,
        message: policiesError ? 'Error checking policies' : `Found ${policies?.length || 0} policies`,
        details: { policies: policies?.map(p => `${p.tablename}.${p.policyname}`), error: policiesError?.message }
      });

    } catch (error: any) {
      tests.push({
        test: 'General Error',
        success: false,
        message: `Unexpected error: ${error.message}`,
        details: { error: error.message }
      });
    }

    setResults(tests);
    setIsRunning(false);
  };

  const createTestUser = async () => {
    setIsRunning(true);
    try {
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = 'test123';

      // Create auth user
      const { data: { user }, error: authError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            name: 'Test User',
            phone: '+1234567890',
          }
        }
      });

      if (authError) throw authError;

      if (user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: testEmail,
            name: 'Test User',
            phone: '+1234567890',
            role: 'user',
            is_verified: true,
            is_blocked: false,
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        alert(`Test user created!\nEmail: ${testEmail}\nPassword: ${testPassword}\n\nTry logging in with these credentials.`);
      }
    } catch (error: any) {
      alert(`Error creating test user: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (success: boolean) => {
    return success ? (
      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">PASS</Badge>
    ) : (
      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">FAIL</Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Auth Debugger</h1>
          <p className="text-gray-400">Diagnose authentication and admin access issues</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={runDiagnostics}
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isRunning ? 'Running...' : 'Run Diagnostics'}
          </Button>
          <Button
            onClick={createTestUser}
            disabled={isRunning}
            variant="outline"
            className="border-green-500 text-green-400 hover:bg-green-500/20"
          >
            Create Test User
          </Button>
        </div>
      </div>

      {/* Current User Info */}
      {currentUser && (
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5" />
              Current User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-400">Email:</span> <span className="text-white">{currentUser.email}</span></div>
              <div><span className="text-gray-400">ID:</span> <span className="text-white font-mono text-xs">{currentUser.id}</span></div>
              <div><span className="text-gray-400">Created:</span> <span className="text-white">{new Date(currentUser.created_at).toLocaleString()}</span></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Test Results</h2>
          {results.map((result, index) => (
            <Card key={index} className="bg-gray-900/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.success)}
                    <span className="font-medium text-white">{result.test}</span>
                  </div>
                  {getStatusBadge(result.success)}
                </div>
                <p className="text-gray-300 text-sm mb-2">{result.message}</p>
                {result.details && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-gray-400 hover:text-gray-300">
                      View Details
                    </summary>
                    <pre className="mt-2 p-2 bg-black/50 rounded text-gray-300 overflow-x-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Troubleshooting Tips */}
      <Card className="bg-blue-900/20 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-blue-400 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Troubleshooting Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-300">
          <p>• If "User Profile" fails, the user wasn't created properly in the users table</p>
          <p>• If "Admin Profile" fails, the temporary admin creation isn't working</p>
          <p>• If "RLS Policies" fails, database permissions might be blocking access</p>
          <p>• Use "Create Test User" to generate a fresh test account</p>
          <p>• Check browser console for additional error messages</p>
        </CardContent>
      </Card>
    </div>
  );
}; 