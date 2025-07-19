// Email Security Implementation (SPF, DKIM, DMARC)

export interface EmailValidationResult {
  isValid: boolean;
  spf: SPFResult;
  dkim: DKIMResult;
  dmarc: DMARCResult;
  overallScore: number;
  recommendations: string[];
}

interface SPFResult {
  valid: boolean;
  record?: string;
  explanation?: string;
}

interface DKIMResult {
  valid: boolean;
  signature?: string;
  explanation?: string;
}

interface DMARCResult {
  valid: boolean;
  policy?: string;
  explanation?: string;
}

// SPF Record Validation
export class SPFValidator {
  private static readonly SPF_PATTERN = /^v=spf1\s+([^\s]+\s*)*$/i;
  private static readonly ALLOWED_MECHANISMS = [
    'all', 'ip4:', 'ip6:', 'a', 'mx', 'include:', 'exists:', 'ptr'
  ];

  static validateSPFRecord(domain: string): Promise<SPFResult> {
    return new Promise((resolve) => {
      // Simulate DNS lookup for SPF record
      // In production, this would use a DNS resolver
      const spfRecord = this.getSPFRecord(domain);
      
      if (!spfRecord) {
        resolve({
          valid: false,
          explanation: 'No SPF record found for domain'
        });
        return;
      }

      if (!this.SPF_PATTERN.test(spfRecord)) {
        resolve({
          valid: false,
          record: spfRecord,
          explanation: 'Invalid SPF record format'
        });
        return;
      }

      const mechanisms = spfRecord.split(/\s+/).slice(1);
      const hasValidMechanisms = mechanisms.every(mechanism => 
        this.ALLOWED_MECHANISMS.some(allowed => 
          mechanism.toLowerCase().startsWith(allowed.toLowerCase())
        )
      );

      resolve({
        valid: hasValidMechanisms,
        record: spfRecord,
        explanation: hasValidMechanisms ? 'Valid SPF record' : 'Invalid SPF mechanisms'
      });
    });
  }

  private static getSPFRecord(domain: string): string | null {
    // Simulated SPF records for common domains
    const spfRecords: Record<string, string> = {
      'gmail.com': 'v=spf1 include:_spf.google.com ~all',
      'outlook.com': 'v=spf1 include:spf.protection.outlook.com -all',
      'yahoo.com': 'v=spf1 include:spf.mail.yahoo.com ~all',
      'advancesos.com': 'v=spf1 ip4:192.168.1.100 include:_spf.advancesos.com -all'
    };

    return spfRecords[domain] || null;
  }

  static generateSPFRecord(domain: string, ipAddresses: string[], includes: string[] = []): string {
    const mechanisms = [
      ...ipAddresses.map(ip => `ip4:${ip}`),
      ...includes.map(include => `include:${include}`),
      '~all' // Soft fail for unknown sources
    ];

    return `v=spf1 ${mechanisms.join(' ')}`;
  }
}

// DKIM Validation
export class DKIMValidator {
  static validateDKIMSignature(email: string, signature: string): Promise<DKIMResult> {
    return new Promise((resolve) => {
      // Simulate DKIM signature validation
      // In production, this would use a cryptographic library
      const isValid = this.verifyDKIMSignature(email, signature);
      
      resolve({
        valid: isValid,
        signature: signature,
        explanation: isValid ? 'Valid DKIM signature' : 'Invalid DKIM signature'
      });
    });
  }

  private static verifyDKIMSignature(email: string, signature: string): boolean {
    // Simulated DKIM verification
    // In production, this would:
    // 1. Extract the signature from email headers
    // 2. Retrieve the public key from DNS
    // 3. Verify the signature cryptographically
    
    // For demo purposes, we'll simulate a valid signature
    return signature.length > 0 && signature.includes('rsa-sha256');
  }

  static generateDKIMSignature(email: string, privateKey: string): string {
    // Simulated DKIM signature generation
    // In production, this would use a cryptographic library
    const timestamp = Math.floor(Date.now() / 1000);
    const domain = email.split('@')[1];
    
    return `v=1; a=rsa-sha256; d=${domain}; s=default; t=${timestamp}; bh=...; b=...`;
  }
}

// DMARC Validation
export class DMARCValidator {
  private static readonly DMARC_PATTERN = /^v=DMARC1;\s*([^;]+;?\s*)*$/i;

  static validateDMARCRecord(domain: string): Promise<DMARCResult> {
    return new Promise((resolve) => {
      const dmarcRecord = this.getDMARCRecord(domain);
      
      if (!dmarcRecord) {
        resolve({
          valid: false,
          explanation: 'No DMARC record found for domain'
        });
        return;
      }

      if (!this.DMARC_PATTERN.test(dmarcRecord)) {
        resolve({
          valid: false,
          policy: dmarcRecord,
          explanation: 'Invalid DMARC record format'
        });
        return;
      }

      const hasPolicy = dmarcRecord.includes('p=');
      const hasReporting = dmarcRecord.includes('rua=') || dmarcRecord.includes('ruf=');

      resolve({
        valid: hasPolicy,
        policy: dmarcRecord,
        explanation: hasPolicy ? 'Valid DMARC record' : 'Missing DMARC policy'
      });
    });
  }

  private static getDMARCRecord(domain: string): string | null {
    // Simulated DMARC records
    const dmarcRecords: Record<string, string> = {
      'gmail.com': 'v=DMARC1; p=quarantine; rua=mailto:dmarc@google.com; ruf=mailto:dmarc@google.com; sp=quarantine; adkim=r; aspf=r;',
      'outlook.com': 'v=DMARC1; p=reject; rua=mailto:dmarc@microsoft.com; ruf=mailto:dmarc@microsoft.com;',
      'advancesos.com': 'v=DMARC1; p=quarantine; rua=mailto:dmarc@advancesos.com; pct=100;'
    };

    return dmarcRecords[domain] || null;
  }

  static generateDMARCRecord(
    domain: string, 
    policy: 'none' | 'quarantine' | 'reject' = 'quarantine',
    reportingEmail?: string
  ): string {
    const parts = [`v=DMARC1; p=${policy};`];
    
    if (reportingEmail) {
      parts.push(`rua=mailto:${reportingEmail};`);
      parts.push(`ruf=mailto:${reportingEmail};`);
    }
    
    parts.push('pct=100; adkim=r; aspf=r;');
    
    return parts.join(' ');
  }
}

// Main Email Security Validator
export class EmailSecurityValidator {
  static async validateEmail(email: string): Promise<EmailValidationResult> {
    const domain = email.split('@')[1];
    
    if (!domain) {
      return {
        isValid: false,
        spf: { valid: false, explanation: 'Invalid email format' },
        dkim: { valid: false, explanation: 'Invalid email format' },
        dmarc: { valid: false, explanation: 'Invalid email format' },
        overallScore: 0,
        recommendations: ['Use a valid email address']
      };
    }

    const [spfResult, dkimResult, dmarcResult] = await Promise.all([
      SPFValidator.validateSPFRecord(domain),
      DKIMValidator.validateDKIMSignature(email, 'simulated-signature'),
      DMARCValidator.validateDMARCRecord(domain)
    ]);

    const score = this.calculateSecurityScore(spfResult, dkimResult, dmarcResult);
    const recommendations = this.generateRecommendations(spfResult, dkimResult, dmarcResult);

    return {
      isValid: score >= 70,
      spf: spfResult,
      dkim: dkimResult,
      dmarc: dmarcResult,
      overallScore: score,
      recommendations
    };
  }

  private static calculateSecurityScore(
    spf: SPFResult, 
    dkim: DKIMResult, 
    dmarc: DMARCResult
  ): number {
    let score = 0;
    
    if (spf.valid) score += 30;
    if (dkim.valid) score += 30;
    if (dmarc.valid) score += 40;
    
    return score;
  }

  private static generateRecommendations(
    spf: SPFResult, 
    dkim: DKIMResult, 
    dmarc: DMARCResult
  ): string[] {
    const recommendations: string[] = [];
    
    if (!spf.valid) {
      recommendations.push('Implement SPF record for email authentication');
    }
    
    if (!dkim.valid) {
      recommendations.push('Implement DKIM signatures for email integrity');
    }
    
    if (!dmarc.valid) {
      recommendations.push('Implement DMARC policy for email authentication');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Email security is properly configured');
    }
    
    return recommendations;
  }
}

// React hook for email validation
export const useEmailSecurity = () => {
  const validateEmail = (email: string) => EmailSecurityValidator.validateEmail(email);
  const generateSPFRecord = (domain: string, ipAddresses: string[], includes?: string[]) => 
    SPFValidator.generateSPFRecord(domain, ipAddresses, includes);
  const generateDMARCRecord = (domain: string, policy?: 'none' | 'quarantine' | 'reject', reportingEmail?: string) => 
    DMARCValidator.generateDMARCRecord(domain, policy, reportingEmail);
  
  return {
    validateEmail,
    generateSPFRecord,
    generateDMARCRecord
  };
}; 