// Cache Security Implementation - Cache Poisoning Prevention

export interface CacheValidationResult {
  isValid: boolean;
  risk: 'low' | 'medium' | 'high' | 'critical';
  vulnerabilities: string[];
  recommendations: string[];
}

export interface CacheConfig {
  maxAge: number;
  staleWhileRevalidate: number;
  immutable: boolean;
  noCache: boolean;
  noStore: boolean;
  private: boolean;
  public: boolean;
  mustRevalidate: boolean;
  proxyRevalidate: boolean;
  sMaxAge: number;
}

// Cache Poisoning Detection
export class CachePoisoningDetector {
  private static readonly POISONING_PATTERNS = [
    // Host header injection patterns
    /host:\s*[^:\s]+\.(?:localhost|127\.0\.0\.1|0\.0\.0\.0)/i,
    /host:\s*[^:\s]+\.(?:internal|local|test|dev)/i,
    
    // Cache control bypass patterns
    /cache-control:\s*(?:no-cache|no-store|private)/i,
    /pragma:\s*no-cache/i,
    
    // X-Forwarded-* header poisoning
    /x-forwarded-(?:host|proto|for):\s*[^,\s]+/i,
    
    // Content-Type manipulation
    /content-type:\s*(?:text\/html|application\/javascript)/i,
    
    // Response splitting patterns
    /[\r\n]+/g,
    /%0d%0a/i,
    /%0a%0d/i
  ];

  private static readonly DANGEROUS_HEADERS = [
    'x-forwarded-host',
    'x-forwarded-proto',
    'x-forwarded-for',
    'x-real-ip',
    'x-original-url',
    'x-rewrite-url'
  ];

  static detectPoisoningAttempt(headers: Record<string, string>): CacheValidationResult {
    const vulnerabilities: string[] = [];
    const recommendations: string[] = [];

    // Check for dangerous header patterns
    for (const [headerName, headerValue] of Object.entries(headers)) {
      const lowerHeaderName = headerName.toLowerCase();
      
      // Check for dangerous headers
      if (this.DANGEROUS_HEADERS.includes(lowerHeaderName)) {
        vulnerabilities.push(`Dangerous header detected: ${headerName}`);
        recommendations.push(`Remove or validate ${headerName} header`);
      }

      // Check for poisoning patterns
      for (const pattern of this.POISONING_PATTERNS) {
        if (pattern.test(`${headerName}: ${headerValue}`)) {
          vulnerabilities.push(`Cache poisoning pattern detected in ${headerName}`);
          recommendations.push(`Sanitize ${headerName} header value`);
        }
      }
    }

    // Check for missing security headers
    if (!headers['cache-control']) {
      vulnerabilities.push('Missing Cache-Control header');
      recommendations.push('Add appropriate Cache-Control header');
    }

    if (!headers['x-content-type-options']) {
      vulnerabilities.push('Missing X-Content-Type-Options header');
      recommendations.push('Add X-Content-Type-Options: nosniff header');
    }

    const risk = this.calculateRisk(vulnerabilities);
    
    return {
      isValid: vulnerabilities.length === 0,
      risk,
      vulnerabilities,
      recommendations
    };
  }

  private static calculateRisk(vulnerabilities: string[]): 'low' | 'medium' | 'high' | 'critical' {
    if (vulnerabilities.length === 0) return 'low';
    if (vulnerabilities.length <= 2) return 'medium';
    if (vulnerabilities.length <= 5) return 'high';
    return 'critical';
  }
}

// Secure Cache Configuration
export class SecureCacheManager {
  private static readonly DEFAULT_CONFIG: CacheConfig = {
    maxAge: 3600, // 1 hour
    staleWhileRevalidate: 86400, // 24 hours
    immutable: false,
    noCache: false,
    noStore: false,
    private: false,
    public: true,
    mustRevalidate: true,
    proxyRevalidate: true,
    sMaxAge: 3600
  };

  static generateSecureCacheHeaders(config: Partial<CacheConfig> = {}): Record<string, string> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    const directives: string[] = [];

    // Basic cache control
    if (finalConfig.noStore) {
      directives.push('no-store');
    } else if (finalConfig.noCache) {
      directives.push('no-cache');
    } else {
      if (finalConfig.public) {
        directives.push('public');
      } else if (finalConfig.private) {
        directives.push('private');
      }

      if (finalConfig.maxAge > 0) {
        directives.push(`max-age=${finalConfig.maxAge}`);
      }

      if (finalConfig.sMaxAge > 0) {
        directives.push(`s-maxage=${finalConfig.sMaxAge}`);
      }

      if (finalConfig.staleWhileRevalidate > 0) {
        directives.push(`stale-while-revalidate=${finalConfig.staleWhileRevalidate}`);
      }

      if (finalConfig.mustRevalidate) {
        directives.push('must-revalidate');
      }

      if (finalConfig.proxyRevalidate) {
        directives.push('proxy-revalidate');
      }

      if (finalConfig.immutable) {
        directives.push('immutable');
      }
    }

    const headers: Record<string, string> = {
      'Cache-Control': directives.join(', '),
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    };

    // Add ETag for cache validation
    if (!finalConfig.noStore && !finalConfig.noCache) {
      headers['ETag'] = this.generateETag();
    }

    return headers;
  }

  private static generateETag(): string {
    // Generate a secure ETag based on content hash and timestamp
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `"${timestamp}-${random}"`;
  }

  static validateCacheHeaders(headers: Record<string, string>): CacheValidationResult {
    const vulnerabilities: string[] = [];
    const recommendations: string[] = [];

    // Check Cache-Control header
    const cacheControl = headers['cache-control'];
    if (!cacheControl) {
      vulnerabilities.push('Missing Cache-Control header');
      recommendations.push('Add Cache-Control header with appropriate directives');
    } else {
      // Check for insecure cache directives
      if (cacheControl.includes('public') && !cacheControl.includes('no-cache')) {
        vulnerabilities.push('Public cache without no-cache directive');
        recommendations.push('Add no-cache directive for public resources or use private');
      }

      if (!cacheControl.includes('must-revalidate') && !cacheControl.includes('no-cache')) {
        vulnerabilities.push('Missing must-revalidate directive');
        recommendations.push('Add must-revalidate directive for cached resources');
      }
    }

    // Check for security headers
    if (!headers['x-content-type-options']) {
      vulnerabilities.push('Missing X-Content-Type-Options header');
      recommendations.push('Add X-Content-Type-Options: nosniff');
    }

    if (!headers['x-frame-options']) {
      vulnerabilities.push('Missing X-Frame-Options header');
      recommendations.push('Add X-Frame-Options: DENY');
    }

    const risk = this.calculateRisk(vulnerabilities);
    
    return {
      isValid: vulnerabilities.length === 0,
      risk,
      vulnerabilities,
      recommendations
    };
  }

  private static calculateRisk(vulnerabilities: string[]): 'low' | 'medium' | 'high' | 'critical' {
    if (vulnerabilities.length === 0) return 'low';
    if (vulnerabilities.length <= 2) return 'medium';
    if (vulnerabilities.length <= 4) return 'high';
    return 'critical';
  }
}

// Cache Key Security
export class CacheKeySecurity {
  private static readonly UNSAFE_CHARS = /[^a-zA-Z0-9\-_\.]/g;
  private static readonly MAX_KEY_LENGTH = 250;

  static sanitizeCacheKey(key: string): string {
    return key
      .replace(this.UNSAFE_CHARS, '_')
      .substring(0, this.MAX_KEY_LENGTH)
      .toLowerCase();
  }

  static generateSecureCacheKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    const key = `${prefix}:${sortedParams}`;
    return this.sanitizeCacheKey(key);
  }

  static validateCacheKey(key: string): boolean {
    if (!key || key.length > this.MAX_KEY_LENGTH) {
      return false;
    }

    if (this.UNSAFE_CHARS.test(key)) {
      return false;
    }

    return true;
  }
}

// Cache Invalidation Security
export class CacheInvalidationSecurity {
  private static readonly INVALIDATION_PATTERNS = [
    /\.\./g, // Directory traversal
    /\/\//g, // Double slashes
    /[<>:"|?*]/g, // Invalid filename characters
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i // Reserved names
  ];

  static validateInvalidationPattern(pattern: string): boolean {
    for (const invalidPattern of this.INVALIDATION_PATTERNS) {
      if (invalidPattern.test(pattern)) {
        return false;
      }
    }
    return true;
  }

  static sanitizeInvalidationPattern(pattern: string): string {
    return pattern
      .replace(/\.\./g, '')
      .replace(/\/\//g, '/')
      .replace(/[<>:"|?*]/g, '_')
      .replace(/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, '_$1_');
  }

  static generateSecureInvalidationKey(resource: string, version: string): string {
    const sanitizedResource = this.sanitizeInvalidationPattern(resource);
    const sanitizedVersion = this.sanitizeInvalidationPattern(version);
    return `invalidate:${sanitizedResource}:${sanitizedVersion}`;
  }
}

// Main Cache Security Manager
export class CacheSecurityManager {
  static async validateCacheSecurity(
    headers: Record<string, string>,
    url: string,
    method: string
  ): Promise<CacheValidationResult> {
    const poisoningResult = CachePoisoningDetector.detectPoisoningAttempt(headers);
    const cacheHeadersResult = SecureCacheManager.validateCacheHeaders(headers);
    
    const allVulnerabilities = [
      ...poisoningResult.vulnerabilities,
      ...cacheHeadersResult.vulnerabilities
    ];
    
    const allRecommendations = [
      ...poisoningResult.recommendations,
      ...cacheHeadersResult.recommendations
    ];

    // Additional checks for sensitive endpoints
    if (this.isSensitiveEndpoint(url, method)) {
      if (!headers['cache-control']?.includes('no-store')) {
        allVulnerabilities.push('Sensitive endpoint should not be cached');
        allRecommendations.push('Add Cache-Control: no-store for sensitive endpoints');
      }
    }

    const risk = this.calculateOverallRisk(allVulnerabilities);
    
    return {
      isValid: allVulnerabilities.length === 0,
      risk,
      vulnerabilities: allVulnerabilities,
      recommendations: allRecommendations
    };
  }

  private static isSensitiveEndpoint(url: string, method: string): boolean {
    const sensitivePatterns = [
      /\/api\/auth\//i,
      /\/api\/admin\//i,
      /\/api\/user\//i,
      /\/api\/payment\//i,
      /\/api\/sensitive\//i
    ];

    const sensitiveMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];

    return sensitivePatterns.some(pattern => pattern.test(url)) ||
           sensitiveMethods.includes(method.toUpperCase());
  }

  private static calculateOverallRisk(vulnerabilities: string[]): 'low' | 'medium' | 'high' | 'critical' {
    if (vulnerabilities.length === 0) return 'low';
    if (vulnerabilities.length <= 3) return 'medium';
    if (vulnerabilities.length <= 6) return 'high';
    return 'critical';
  }

  static generateSecureCacheConfig(
    isPublic: boolean = false,
    isSensitive: boolean = false,
    maxAge: number = 3600
  ): CacheConfig {
    if (isSensitive) {
      return {
        maxAge: 0,
        staleWhileRevalidate: 0,
        immutable: false,
        noCache: false,
        noStore: true,
        private: true,
        public: false,
        mustRevalidate: false,
        proxyRevalidate: false,
        sMaxAge: 0
      };
    }

    return {
      maxAge,
      staleWhileRevalidate: maxAge * 2,
      immutable: false,
      noCache: false,
      noStore: false,
      private: !isPublic,
      public: isPublic,
      mustRevalidate: true,
      proxyRevalidate: true,
      sMaxAge: maxAge
    };
  }
}

// React hook for cache security
export const useCacheSecurity = () => {
  const validateCacheSecurity = (headers: Record<string, string>, url: string, method: string) => 
    CacheSecurityManager.validateCacheSecurity(headers, url, method);
  
  const generateSecureCacheHeaders = (config?: Partial<CacheConfig>) => 
    SecureCacheManager.generateSecureCacheHeaders(config);
  
  const generateSecureCacheConfig = (isPublic?: boolean, isSensitive?: boolean, maxAge?: number) => 
    CacheSecurityManager.generateSecureCacheConfig(isPublic, isSensitive, maxAge);
  
  const sanitizeCacheKey = (key: string) => CacheKeySecurity.sanitizeCacheKey(key);
  
  return {
    validateCacheSecurity,
    generateSecureCacheHeaders,
    generateSecureCacheConfig,
    sanitizeCacheKey
  };
}; 