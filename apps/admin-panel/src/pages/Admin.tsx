import React, { useState, useEffect } from 'react';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminAuth from '@/components/admin/AdminAuth';
import ConnectionTest from '@/components/admin/ConnectionTest';
import LiveDataSyncTest from '@/components/admin/LiveDataSyncTest';
import { AuthDebugger } from '@/components/admin/AuthDebugger';
import { authService } from '@/lib/supabase';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showLiveSyncTest, setShowLiveSyncTest] = useState(false);
  const [showAuthDebugger, setShowAuthDebugger] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user } = await authService.getCurrentUser();
        setIsAuthenticated(!!user);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-2 text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // Show auth debugger if requested
  if (showAuthDebugger) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="p-4">
          <button 
            onClick={() => setShowAuthDebugger(false)}
            className="mb-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            ← Back to Admin
          </button>
        </div>
        <AuthDebugger />
      </div>
    );
  }

  // Show live sync test if requested
  if (showLiveSyncTest) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="p-4">
          <button 
            onClick={() => setShowLiveSyncTest(false)}
            className="mb-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            ← Back to Admin
          </button>
        </div>
        <LiveDataSyncTest />
      </div>
    );
  }

  // Show diagnostics if requested
  if (showDiagnostics) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="p-4">
          <button 
            onClick={() => setShowDiagnostics(false)}
            className="mb-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            ← Back to Admin
          </button>
        </div>
        <ConnectionTest />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="p-4 space-y-2">
          <button 
            onClick={() => setShowDiagnostics(true)}
            className="block w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            🔧 Run Connection Diagnostics
          </button>
          <button 
            onClick={() => setShowLiveSyncTest(true)}
            className="block w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            📡 Test Live Data Sync
          </button>
          <button 
            onClick={() => setShowAuthDebugger(true)}
            className="block w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            🔍 Debug Authentication Issues
          </button>
        </div>
        <AdminAuth onAuthSuccess={handleAuthSuccess} />
      </div>
    );
  }

  return <AdminDashboard />;
};

export default Admin;
