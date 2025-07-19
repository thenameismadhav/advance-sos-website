import DOMPurify from 'dompurify';

// HTML sanitization to prevent XSS
export const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOW_DATA_ATTR: false
  });
};

// Text sanitization (remove HTML tags)
export const sanitizeText = (input: string): string => {
  return input.replace(/<[^>]*>/g, '');
};

// URL sanitization
export const sanitizeUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }
    return parsed.toString();
  } catch {
    return '';
  }
};

// Email sanitization
export const sanitizeEmail = (email: string): string => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? email.toLowerCase().trim() : '';
};

// SQL injection prevention (basic)
export const sanitizeSqlInput = (input: string): string => {
  // Remove common SQL injection patterns
  const sqlPatterns = [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script)\b)/gi,
    /(['";])/g,
    /(--)/g,
    /(\/\*|\*\/)/g,
    /(xp_|sp_)/gi
  ];
  
  let sanitized = input;
  sqlPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  return sanitized.trim();
};

// Command injection prevention
export const sanitizeCommandInput = (input: string): string => {
  const commandPatterns = [
    /[;&|`$(){}[\]]/g,
    /(\b(cat|ls|pwd|whoami|id|uname|ps|netstat|ifconfig|ipconfig)\b)/gi,
    /(\b(rm|del|mkdir|touch|chmod|chown|sudo|su)\b)/gi
  ];
  
  let sanitized = input;
  commandPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  return sanitized.trim();
};

// File path sanitization
export const sanitizeFilePath = (path: string): string => {
  // Remove directory traversal attempts
  const traversalPatterns = [
    /\.\./g,
    /\/\//g,
    /\\/g,
    /~\/\.\./g
  ];
  
  let sanitized = path;
  traversalPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  return sanitized.replace(/[^a-zA-Z0-9._-]/g, '');
};

// JSON sanitization
export const sanitizeJson = (input: string): string => {
  try {
    const parsed = JSON.parse(input);
    return JSON.stringify(parsed);
  } catch {
    return '';
  }
};

// Phone number sanitization
export const sanitizePhone = (phone: string): string => {
  return phone.replace(/[^\d+\-()\s]/g, '');
};

// Credit card number sanitization (masking)
export const sanitizeCreditCard = (cardNumber: string): string => {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length >= 4) {
    return '*'.repeat(digits.length - 4) + digits.slice(-4);
  }
  return '*'.repeat(digits.length);
};

// General input sanitization
export const sanitizeInput = (input: string, type: 'text' | 'email' | 'url' | 'phone' | 'html' = 'text'): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  switch (type) {
    case 'email':
      return sanitizeEmail(input);
    case 'url':
      return sanitizeUrl(input);
    case 'phone':
      return sanitizePhone(input);
    case 'html':
      return sanitizeHtml(input);
    default:
      return sanitizeText(input);
  }
};

// Validate and sanitize form data
export const sanitizeFormData = (data: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeFormData(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}; 