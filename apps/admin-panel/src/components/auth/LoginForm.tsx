import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '@/lib/services/auth';
import { LoginCredentials } from '@/types/auth';
import { validateEmail, validatePassword } from '@/lib/utils';
import { Shield, Lock, AlertTriangle } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onError }) => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!credentials.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(credentials.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!credentials.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const { admin, error } = await AuthService.signIn(credentials);

      if (error) {
        throw error;
      }

      if (admin) {
        // Log successful login
        await AuthService.logAdminAction('login', { email: credentials.email });
        
        onSuccess?.();
        navigate('/admin/dashboard');
      } else {
        throw new Error('Login failed');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred during login';
      setErrors({ general: errorMessage });
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-cyan-500/20 border border-cyan-400 mb-4">
          <Shield className="h-6 w-6 text-cyan-400" />
        </div>
        <h2 className="text-xl font-bold text-cyan-300 tracking-widest">
          ADMIN ACCESS
        </h2>
        <p className="mt-2 text-sm text-gray-400">
          Emergency Response System
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {errors.general && (
          <div className="border border-red-500/50 bg-red-500/10 rounded p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span className="text-sm text-red-400">{errors.general}</span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-cyan-300 mb-2">
              EMAIL ADDRESS
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={credentials.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-3 py-2 border ${
                errors.email ? 'border-red-500' : 'border-cyan-400/50'
              } placeholder-gray-500 text-white bg-black/50 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-sm transition-all`}
              placeholder="admin@advancesos.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-cyan-300 mb-2">
              PASSWORD
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={credentials.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`w-full px-3 py-2 border ${
                errors.password ? 'border-red-500' : 'border-cyan-400/50'
              } placeholder-gray-500 text-white bg-black/50 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-sm transition-all`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-400">{errors.password}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-cyan-400 focus:ring-cyan-400 border-cyan-400/50 rounded bg-black/50"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <button
              type="button"
              onClick={() => navigate('/admin/forgot-password')}
              className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Forgot password?
            </button>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-cyan-400 text-sm font-medium rounded text-white bg-cyan-500/20 hover:bg-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_15px_#00fff7]"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400"></div>
                <span>ACCESSING...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>ACCESS SYSTEM</span>
              </div>
            )}
          </button>
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/admin/signup')}
              className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Create admin account
            </button>
          </p>
          <p className="text-sm text-gray-400">
            Or{' '}
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              create a regular account
            </button>
            {' '}for temporary admin access
          </p>
        </div>
      </form>
    </div>
  );
}; 