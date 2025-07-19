// File Upload Security Implementation

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedFileName?: string;
}

export interface FileTypeConfig {
  allowedExtensions: string[];
  allowedMimeTypes: string[];
  maxSize: number; // in bytes
  scanForMalware: boolean;
}

// Default file type configurations
export const FILE_TYPE_CONFIGS: Record<string, FileTypeConfig> = {
  image: {
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    maxSize: 5 * 1024 * 1024, // 5MB
    scanForMalware: true
  },
  document: {
    allowedExtensions: ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
    allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/rtf'],
    maxSize: 10 * 1024 * 1024, // 10MB
    scanForMalware: true
  }
};

// Malicious file patterns to detect
const MALICIOUS_PATTERNS = [
  /\.(exe|bat|cmd|com|pif|scr|vbs|js|jar|msi|dll|sys)$/i,
  /\.(php|asp|aspx|jsp|jspx|pl|py|rb|sh|cgi)$/i,
  /\.(htaccess|htpasswd|ini|log|conf)$/i,
  /\.(zip|rar|7z|tar|gz|bz2)$/i, // Compressed files (potential zip bombs)
];

export class FileSecurity {
  // Validate file type and size
  static validateFile(file: File, allowedTypes: string[] = ['image', 'document']): FileValidationResult {
    try {
      // Check file size
      const maxSize = Math.max(...allowedTypes.map(type => FILE_TYPE_CONFIGS[type]?.maxSize || 0));
      if (file.size > maxSize) {
        return {
          isValid: false,
          error: `File size exceeds maximum allowed size of ${this.formatFileSize(maxSize)}`
        };
      }

      // Check file extension
      const extension = this.getFileExtension(file.name);
      const allowedExtensions = allowedTypes.flatMap(type => FILE_TYPE_CONFIGS[type]?.allowedExtensions || []);
      
      if (!allowedExtensions.includes(extension.toLowerCase())) {
        return {
          isValid: false,
          error: `File type not allowed. Allowed types: ${allowedExtensions.join(', ')}`
        };
      }

      // Check MIME type
      const allowedMimeTypes = allowedTypes.flatMap(type => FILE_TYPE_CONFIGS[type]?.allowedMimeTypes || []);
      if (!allowedMimeTypes.includes(file.type)) {
        return {
          isValid: false,
          error: `MIME type not allowed: ${file.type}`
        };
      }

      // Check for malicious patterns
      if (this.hasMaliciousPattern(file.name)) {
        return {
          isValid: false,
          error: 'File appears to be potentially malicious'
        };
      }

      // Sanitize filename
      const sanitizedFileName = this.sanitizeFileName(file.name);

      return {
        isValid: true,
        sanitizedFileName
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'File validation failed'
      };
    }
  }

  // Check for malicious file patterns
  static hasMaliciousPattern(fileName: string): boolean {
    return MALICIOUS_PATTERNS.some(pattern => pattern.test(fileName));
  }

  // Sanitize filename
  static sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special characters
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
      .substring(0, 255); // Limit length
  }

  // Get file extension
  static getFileExtension(fileName: string): string {
    const lastDotIndex = fileName.lastIndexOf('.');
    return lastDotIndex !== -1 ? fileName.substring(lastDotIndex) : '';
  }

  // Format file size for display
  static formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Generate secure file name
  static generateSecureFileName(originalName: string, userId: string): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const extension = this.getFileExtension(originalName);
    const sanitizedExtension = this.sanitizeFileName(extension);
    
    return `${userId}_${timestamp}_${randomId}${sanitizedExtension}`;
  }
}

// React hook for file validation
export const useFileValidation = () => {
  const validateFile = (file: File, allowedTypes?: string[]) => 
    FileSecurity.validateFile(file, allowedTypes);
  
  const sanitizeFileName = (fileName: string) => 
    FileSecurity.sanitizeFileName(fileName);
  
  const generateSecureFileName = (originalName: string, userId: string) => 
    FileSecurity.generateSecureFileName(originalName, userId);
  
  return {
    validateFile,
    sanitizeFileName,
    generateSecureFileName
  };
}; 