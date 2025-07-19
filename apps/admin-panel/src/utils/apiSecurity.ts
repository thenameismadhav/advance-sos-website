// API Security Middleware

export interface ApiRequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  identifier?: string;
}

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Default configurations
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000; // 1 second

export class ApiSecurity {
  // Rate limiting check
  static checkRateLimit(identifier: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const key = `${identifier}_${config.identifier || 'default'}`;
    const userRequests = rateLimitStore.get(key);
    
    if (!userRequests || now > userRequests.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs });
      return true;
    }
    
    if (userRequests.count >= config.maxRequests) {
      return false;
    }
    
    userRequests.count++;
    return true;
  }

  // Add security headers to request
  static addSecurityHeaders(headers: HeadersInit = {}): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      ...headers
    };
  }

  // Validate request payload
  static validatePayload(payload: any): boolean {
    if (payload === null || payload === undefined) {
      return true;
    }

    // Check for circular references
    try {
      JSON.stringify(payload);
    } catch {
      return false;
    }

    // Check payload size (prevent large payload attacks)
    const payloadSize = JSON.stringify(payload).length;
    const maxSize = 1024 * 1024; // 1MB
    if (payloadSize > maxSize) {
      return false;
    }

    return true;
  }

  // Sanitize URL parameters
  static sanitizeUrlParams(params: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string') {
        // Remove potential injection patterns
        sanitized[key] = value
          .replace(/[<>\"'&]/g, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+=/gi, '')
          .trim();
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  // Secure fetch with timeout and retries
  static async secureFetch(
    url: string, 
    config: ApiRequestConfig = {},
    rateLimitConfig?: RateLimitConfig
  ): Promise<Response> {
    const {
      timeout = DEFAULT_TIMEOUT,
      retries = DEFAULT_RETRIES,
      retryDelay = DEFAULT_RETRY_DELAY,
      ...fetchConfig
    } = config;

    // Rate limiting check
    if (rateLimitConfig) {
      const identifier = new URL(url).hostname;
      if (!this.checkRateLimit(identifier, rateLimitConfig)) {
        throw new Error('Rate limit exceeded');
      }
    }

    // Validate payload
    if (fetchConfig.body && !this.validatePayload(fetchConfig.body)) {
      throw new Error('Invalid request payload');
    }

    // Add security headers
    fetchConfig.headers = this.addSecurityHeaders(fetchConfig.headers);

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      let lastError: Error;
      
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const response = await fetch(url, {
            ...fetchConfig,
            signal: controller.signal
          });

          // Check for security-related response headers
          this.validateResponseHeaders(response);

          clearTimeout(timeoutId);
          return response;
        } catch (error) {
          lastError = error as Error;
          
          if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Request timeout');
          }
          
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
          }
        }
      }
      
      throw lastError!;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Validate response headers for security
  static validateResponseHeaders(response: Response): void {
    const securityHeaders = [
      'X-Content-Type-Options',
      'X-Frame-Options',
      'X-XSS-Protection',
      'Content-Security-Policy'
    ];

    const missingHeaders = securityHeaders.filter(header => 
      !response.headers.has(header)
    );

    if (missingHeaders.length > 0) {
      console.warn('Missing security headers:', missingHeaders);
    }
  }

  // Create secure API client
  static createSecureApiClient(baseUrl: string, defaultConfig: ApiRequestConfig = {}) {
    return {
      get: (endpoint: string, config?: ApiRequestConfig) =>
        this.secureFetch(`${baseUrl}${endpoint}`, { ...defaultConfig, ...config, method: 'GET' }),
      
      post: (endpoint: string, data?: any, config?: ApiRequestConfig) =>
        this.secureFetch(`${baseUrl}${endpoint}`, { 
          ...defaultConfig, 
          ...config, 
          method: 'POST',
          body: data ? JSON.stringify(data) : undefined
        }),
      
      put: (endpoint: string, data?: any, config?: ApiRequestConfig) =>
        this.secureFetch(`${baseUrl}${endpoint}`, { 
          ...defaultConfig, 
          ...config, 
          method: 'PUT',
          body: data ? JSON.stringify(data) : undefined
        }),
      
      delete: (endpoint: string, config?: ApiRequestConfig) =>
        this.secureFetch(`${baseUrl}${endpoint}`, { ...defaultConfig, ...config, method: 'DELETE' })
    };
  }
}

// React hook for secure API calls
export const useSecureApi = (baseUrl: string, defaultConfig?: ApiRequestConfig) => {
  const apiClient = ApiSecurity.createSecureApiClient(baseUrl, defaultConfig);
  
  return {
    get: apiClient.get,
    post: apiClient.post,
    put: apiClient.put,
    delete: apiClient.delete,
    secureFetch: (url: string, config?: ApiRequestConfig) => 
      ApiSecurity.secureFetch(url, config)
  };
}; 