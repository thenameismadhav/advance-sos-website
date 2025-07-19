import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '@/lib/services/auth';
import { SignupCredentials } from '@/types/auth';
import { validateEmail, validatePassword, validateName } from '@/lib/utils';
import { UserPlus, Lock, AlertTriangle, Shield, CheckCircle } from 'lucide-react';

interface SignupFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSuccess, onError }) => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<SignupCredentials>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin',
    organization: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!credentials.name) {
      newErrors.name = 'Full name is required';
    } else if (!validateName(credentials.name)) {
      newErrors.name = 'Please enter a valid full name';
    }

    // Email validation
    if (!credentials.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(credentials.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!credentials.password) {
      newErrors.password = 'Password is required';
    }

    // Confirm password validation
    if (!credentials.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (credentials.password !== credentials.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Organization validation
    if (!credentials.organization) {
      newErrors.organization = 'Organization is required';
    }

    // Phone validation
    if (!credentials.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(credentials.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
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
      const { admin, error } = await AuthService.signUp(credentials);

      if (error) {
        throw error;
      }

      if (admin) {
        // Log successful registration
        await AuthService.logAdminAction('signup', { 
          email: credentials.email,
          name: credentials.name,
          organization: credentials.organization 
        });
        
        setSuccess(true);
        onSuccess?.();
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/admin/login');
        }, 3000);
      } else {
        throw new Error('Registration failed');
      }
    } catch (error: any) {
      let errorMessage = error.message || 'An error occurred during registration';
      
      // Handle CAPTCHA errors specifically
      if (errorMessage.includes('CAPTCHA') || errorMessage.includes('captcha')) {
        errorMessage = 'CAPTCHA verification failed. Please try again or refresh the page.';
      }
      
      setErrors({ general: errorMessage });
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof SignupCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (success) {
    return (
      <div className="w-full space-y-6 text-center">
        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-500/20 border border-green-400 mb-4">
          <CheckCircle className="h-8 w-8 text-green-400" />
        </div>
        <h2 className="text-xl font-bold text-green-300 tracking-widest">
          REGISTRATION SUCCESSFUL
        </h2>
        <p className="text-gray-400 text-sm">
          Admin account created successfully. Redirecting to login...
        </p>
        <div className="animate-pulse">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-cyan-500/20 border border-cyan-400 mb-4">
          <UserPlus className="h-6 w-6 text-cyan-400" />
        </div>
        <h2 className="text-xl font-bold text-cyan-300 tracking-widest">
          ADMIN REGISTRATION
        </h2>
        <p className="mt-2 text-sm text-gray-400">
          Create New Admin Account
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {errors.general && (
          <div className="border border-red-500/50 bg-red-500/10 rounded p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span className="text-sm text-red-400">{errors.general}</span>
            </div>
            {errors.general.includes('CAPTCHA') && (
              <button
                type="button"
                onClick={() => {
                  setErrors({});
                  window.location.reload();
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Refresh page and try again
              </button>
            )}
          </div>
        )}

        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-cyan-300 mb-2">
              FULL NAME
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={credentials.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border ${
                errors.name ? 'border-red-500' : 'border-cyan-400/50'
              } placeholder-gray-500 text-white bg-black/50 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-sm transition-all`}
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Email */}
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
              placeholder="admin@organization.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Organization */}
          <div>
            <label htmlFor="organization" className="block text-sm font-medium text-cyan-300 mb-2">
              ORGANIZATION
            </label>
            <input
              id="organization"
              name="organization"
              type="text"
              autoComplete="organization"
              required
              value={credentials.organization}
              onChange={(e) => handleInputChange('organization', e.target.value)}
              className={`w-full px-3 py-2 border ${
                errors.organization ? 'border-red-500' : 'border-cyan-400/50'
              } placeholder-gray-500 text-white bg-black/50 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-sm transition-all`}
              placeholder="Emergency Response Unit"
            />
            {errors.organization && (
              <p className="mt-1 text-sm text-red-400">{errors.organization}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-cyan-300 mb-2">
              PHONE NUMBER
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              value={credentials.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full px-3 py-2 border ${
                errors.phone ? 'border-red-500' : 'border-cyan-400/50'
              } placeholder-gray-500 text-white bg-black/50 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-sm transition-all`}
              placeholder="+91 98765 43210"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-cyan-300 mb-2">
              ADMIN ROLE
            </label>
            <select
              id="role"
              name="role"
              value={credentials.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-cyan-400/50 placeholder-gray-500 text-white bg-black/50 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-sm transition-all"
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-cyan-300 mb-2">
              PASSWORD
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
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
            <p className="mt-1 text-xs text-gray-500">
              Any password is accepted
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-cyan-300 mb-2">
              CONFIRM PASSWORD
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={credentials.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={`w-full px-3 py-2 border ${
                errors.confirmPassword ? 'border-red-500' : 'border-cyan-400/50'
              } placeholder-gray-500 text-white bg-black/50 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-sm transition-all`}
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
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
                <span>CREATING ACCOUNT...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>CREATE ADMIN ACCOUNT</span>
              </div>
            )}
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-400">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/admin/login')}
              className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Sign in here
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}; 