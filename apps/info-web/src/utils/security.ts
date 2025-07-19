
import { z } from 'zod';

// Input validation schemas
export const emailSchema = z.string().email('Invalid email format').min(1, 'Email is required');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters').regex(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  'Password must contain uppercase, lowercase, number and special character'
);
export const nameSchema = z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long');

// XSS prevention
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};

// Rate limiting simulation
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (identifier: string, maxRequests = 5, windowMs = 60000): boolean => {
  const now = Date.now();
  const userRequests = requestCounts.get(identifier);
  
  if (!userRequests || now > userRequests.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (userRequests.count >= maxRequests) {
    return false;
  }
  
  userRequests.count++;
  return true;
};

// Session management
export const generateSessionId = (): string => {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

export const isValidSession = (sessionId: string): boolean => {
  const storedSession = localStorage.getItem('session_id');
  const sessionExpiry = localStorage.getItem('session_expiry');
  
  if (!storedSession || !sessionExpiry) return false;
  if (Date.now() > parseInt(sessionExpiry)) {
    localStorage.removeItem('session_id');
    localStorage.removeItem('session_expiry');
    return false;
  }
  
  return storedSession === sessionId;
};
