import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { UserPlus, Mail, Lock, User, Phone, Building } from 'lucide-react';

interface UserSignupFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const UserSignupForm: React.FC<UserSignupFormProps> = ({ onSuccess, onError }) => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    organization: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!credentials.name) {
      newErrors.name = 'Full name is required';
    }

    if (!credentials.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!credentials.password) {
      newErrors.password = 'Password is required';
    }

    if (!credentials.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (credentials.password !== credentials.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      // Create auth user
      const { data: { user }, error: authError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: credentials.name,
            phone: credentials.phone,
            organization: credentials.organization,
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
            email: credentials.email,
            name: credentials.name,
            phone: credentials.phone,
            role: 'user',
            is_verified: true,
            is_blocked: false,
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Don't throw error as auth user was created successfully
        }

        toast({
          title: "Account Created Successfully!",
          description: "You can now access the admin panel with temporary permissions.",
        });

        onSuccess?.();
        
        // Redirect to admin login after 2 seconds
        setTimeout(() => {
          navigate('/admin/login');
        }, 2000);
      } else {
        throw new Error('Registration failed');
      }
    } catch (error: any) {
      let errorMessage = error.message || 'An error occurred during registration';
      
      // Handle specific errors
      if (errorMessage.includes('CAPTCHA') || errorMessage.includes('captcha')) {
        errorMessage = 'CAPTCHA verification failed. Please try again or refresh the page.';
      } else if (errorMessage.includes('already registered')) {
        errorMessage = 'An account with this email already exists. Please try logging in instead.';
      }
      
      setErrors({ general: errorMessage });
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof credentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-3 rounded-full">
              <UserPlus className="h-8 w-8 text-black" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            CREATE ACCOUNT
          </h1>
          <p className="text-gray-400 text-sm">
            Register to access the SOS Emergency System
          </p>
        </div>

        {/* Form */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-cyan-400/20 rounded-lg p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="border border-red-500/50 bg-red-500/10 rounded p-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-red-400">{errors.general}</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-cyan-300 mb-2">
                  FULL NAME
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={credentials.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border ${
                      errors.name ? 'border-red-500' : 'border-cyan-400/50'
                    } placeholder-gray-500 text-white bg-black/50 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-sm transition-all`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-cyan-300 mb-2">
                  EMAIL ADDRESS
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={credentials.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border ${
                      errors.email ? 'border-red-500' : 'border-cyan-400/50'
                    } placeholder-gray-500 text-white bg-black/50 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-sm transition-all`}
                    placeholder="user@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-cyan-300 mb-2">
                  PHONE NUMBER
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={credentials.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-cyan-400/50 placeholder-gray-500 text-white bg-black/50 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-sm transition-all"
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              {/* Organization */}
              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-cyan-300 mb-2">
                  ORGANIZATION
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    id="organization"
                    name="organization"
                    type="text"
                    value={credentials.organization}
                    onChange={(e) => handleInputChange('organization', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-cyan-400/50 placeholder-gray-500 text-white bg-black/50 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-sm transition-all"
                    placeholder="Your organization (optional)"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-cyan-300 mb-2">
                  PASSWORD
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={credentials.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border ${
                      errors.password ? 'border-red-500' : 'border-cyan-400/50'
                    } placeholder-gray-500 text-white bg-black/50 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-sm transition-all`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Any password is accepted
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-cyan-300 mb-2">
                  CONFIRM PASSWORD
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={credentials.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border ${
                      errors.confirmPassword ? 'border-red-500' : 'border-cyan-400/50'
                    } placeholder-gray-500 text-white bg-black/50 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-sm transition-all`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-cyan-400 focus:ring-cyan-400 border-cyan-400/50 rounded bg-black/50"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-300">
                I agree to the terms and conditions
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold py-3 px-4 rounded-lg hover:from-cyan-300 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/admin/login')}
                  className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-400/30 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-blue-400 text-lg">ℹ️</div>
            <div className="text-sm text-blue-300">
              <p className="font-medium mb-1">Temporary Admin Access</p>
              <p>After registration, you'll have temporary access to the admin panel with limited permissions for viewing data only.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 