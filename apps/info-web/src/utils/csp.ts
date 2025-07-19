
// Enhanced Content Security Policy utilities for maximum security
export const cspDirectives = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'", 
    "'unsafe-inline'", 
    "https://cdn.gpteng.co", 
    "https://maps.googleapis.com",
    "https://www.gstatic.com"
  ],
  'style-src': [
    "'self'", 
    "'unsafe-inline'", 
    "https://fonts.googleapis.com",
    "https://www.gstatic.com"
  ],
  'font-src': [
    "'self'", 
    "https://fonts.gstatic.com",
    "https://www.gstatic.com"
  ],
  'img-src': [
    "'self'", 
    "data:", 
    "https:", 
    "blob:", 
    "https://maps.gstatic.com", 
    "https://*.googleapis.com", 
    "https://*.ggpht.com",
    "https://www.gstatic.com",
    "https://maps.google.com"
  ],
  'connect-src': [
    "'self'", 
    "https://identitytoolkit.googleapis.com",
    "https://securetoken.googleapis.com",
    "https://www.googleapis.com",
    "https://*.firebaseapp.com",
    "https://*.googleapis.com",
    "https://maps.googleapis.com",
    "https://www.gstatic.com"
  ],
  'worker-src': ["'self'", "blob:"],
  'child-src': ["'self'", "blob:"],
  'frame-src': [
    "'self'", 
    "https://www.google.com",
    "https://maps.google.com",
    "https://www.gstatic.com"
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': []
};

export const generateCSPHeader = (): string => {
  return Object.entries(cspDirectives)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
};

// Enhanced security headers
export const addSecurityHeaders = () => {
  try {
    // Add CSP meta tag if not exists
    const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!existingCSP) {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = generateCSPHeader();
      document.head.appendChild(meta);
    }

    // Add comprehensive security headers
    const securityMeta = [
      { httpEquiv: 'X-Content-Type-Options', content: 'nosniff' },
      { httpEquiv: 'X-Frame-Options', content: 'DENY' },
      { httpEquiv: 'X-XSS-Protection', content: '1; mode=block' },
      { httpEquiv: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' },
      { httpEquiv: 'Permissions-Policy', content: 'geolocation=(), microphone=(), camera=()' },
      { httpEquiv: 'Strict-Transport-Security', content: 'max-age=63072000; includeSubDomains; preload' }
    ];

    securityMeta.forEach(({ httpEquiv, content }) => {
      const existing = document.querySelector(`meta[http-equiv="${httpEquiv}"]`);
      if (!existing) {
        const meta = document.createElement('meta');
        meta.httpEquiv = httpEquiv;
        meta.content = content;
        document.head.appendChild(meta);
      }
    });

    // Add integrity monitoring
    console.log('[SECURITY] Security headers applied successfully');
  } catch (error) {
    console.error('[SECURITY] Security headers could not be applied:', error);
  }
};

// Security monitoring utilities
export const logSecurityEvent = (event: string, details?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[SECURITY] ${timestamp}: ${event}`, details);
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/javascript:/gi, '')
              .replace(/on\w+\s*=/gi, '');
};
