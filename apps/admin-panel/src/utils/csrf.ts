// CSRF Protection Implementation
export class CSRFProtection {
  private static readonly TOKEN_KEY = 'csrf_token';
  private static readonly TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  // Generate a new CSRF token
  static generateToken(): string {
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const tokenData = {
      token,
      expiry: Date.now() + this.TOKEN_EXPIRY
    };
    
    localStorage.setItem(this.TOKEN_KEY, JSON.stringify(tokenData));
    return token;
  }

  // Get the current CSRF token
  static getToken(): string | null {
    try {
      const tokenData = localStorage.getItem(this.TOKEN_KEY);
      if (!tokenData) return null;
      
      const { token, expiry } = JSON.parse(tokenData);
      
      if (Date.now() > expiry) {
        localStorage.removeItem(this.TOKEN_KEY);
        return null;
      }
      
      return token;
    } catch {
      return null;
    }
  }

  // Validate a CSRF token
  static validateToken(token: string): boolean {
    const storedToken = this.getToken();
    return storedToken === token;
  }

  // Refresh the CSRF token
  static refreshToken(): string {
    localStorage.removeItem(this.TOKEN_KEY);
    return this.generateToken();
  }

  // Clear the CSRF token
  static clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // Get token for use in headers
  static getTokenHeader(): Record<string, string> {
    const token = this.getToken();
    return token ? { 'X-CSRF-Token': token } : {};
  }
}

// CSRF middleware for API requests
export const withCSRF = (fetchFn: typeof fetch) => {
  return async (url: string, options: RequestInit = {}) => {
    const token = CSRFProtection.getToken();
    
    if (token) {
      options.headers = {
        ...options.headers,
        'X-CSRF-Token': token
      };
    }
    
    return fetchFn(url, options);
  };
};

// CSRF hook for React components
export const useCSRF = () => {
  const getToken = () => CSRFProtection.getToken();
  const generateToken = () => CSRFProtection.generateToken();
  const validateToken = (token: string) => CSRFProtection.validateToken(token);
  const refreshToken = () => CSRFProtection.refreshToken();
  const clearToken = () => CSRFProtection.clearToken();
  
  return {
    getToken,
    generateToken,
    validateToken,
    refreshToken,
    clearToken
  };
}; 