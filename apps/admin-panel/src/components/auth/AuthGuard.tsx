import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AuthService } from '@/lib/services/auth';
import { Admin } from '@/types/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAdmin = true 
}) => {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentAdmin = await AuthService.getCurrentAdmin();
        
        if (!currentAdmin) {
          // No admin found, redirect to login
          router.push('/admin/login');
          return;
        }

        if (requireAdmin && !currentAdmin.is_active) {
          // Admin is not active, redirect to unauthorized
          router.push('/admin/unauthorized');
          return;
        }

        setAdmin(currentAdmin);
        setIsAuthorized(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/admin/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, requireAdmin]);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = AuthService.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setAdmin(null);
          setIsAuthorized(false);
          router.push('/admin/login');
        } else if (event === 'SIGNED_IN') {
          const currentAdmin = await AuthService.getCurrentAdmin();
          if (currentAdmin) {
            setAdmin(currentAdmin);
            setIsAuthorized(true);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">🚫</div>
          <h1 className="text-white text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-4">You don't have permission to access this page.</p>
          <button
            onClick={() => router.push('/admin/login')}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}; 