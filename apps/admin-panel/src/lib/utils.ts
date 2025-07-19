import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return formatDate(date);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validateName(name: string): boolean {
  const re = /^[a-zA-Z\s]{2,50}$/;
  return re.test(name.trim());
}

export function validatePhone(phone: string): boolean {
  const re = /^\+?[\d\s\-\(\)]{10,}$/;
  return re.test(phone);
}

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!password || password.trim().length === 0) {
    errors.push('Password is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function getEmergencyTypeColor(type: string): string {
  switch (type) {
    case 'medical':
      return 'text-blue-500 bg-blue-100';
    case 'fire':
      return 'text-orange-500 bg-orange-100';
    case 'police':
      return 'text-red-500 bg-red-100';
    case 'accident':
      return 'text-yellow-500 bg-yellow-100';
    default:
      return 'text-gray-500 bg-gray-100';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'text-red-500 bg-red-100';
    case 'assigned':
      return 'text-yellow-500 bg-yellow-100';
    case 'resolved':
      return 'text-green-500 bg-green-100';
    case 'cancelled':
      return 'text-gray-500 bg-gray-100';
    default:
      return 'text-gray-500 bg-gray-100';
  }
}

export function getPriorityColor(priority: number): string {
  switch (priority) {
    case 1:
      return 'text-green-500 bg-green-100';
    case 2:
      return 'text-blue-500 bg-blue-100';
    case 3:
      return 'text-yellow-500 bg-yellow-100';
    case 4:
      return 'text-orange-500 bg-orange-100';
    case 5:
      return 'text-red-500 bg-red-100';
    default:
      return 'text-gray-500 bg-gray-100';
  }
}

// Multilanguage support
export const languages = {
  en: 'English',
  hi: 'हिंदी',
  gu: 'ગુજરાતી',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  bn: 'বাংলা',
  mr: 'मराठी',
  kn: 'ಕನ್ನಡ',
  ml: 'മലയാളം',
  pa: 'ਪੰਜਾਬੀ',
};

export type Language = keyof typeof languages;

export function getLanguageName(code: Language): string {
  return languages[code] || code;
}

// Localization helper
export function t(key: string, lang: Language = 'en'): string {
  // This would be replaced with a proper i18n library like next-i18next
  const translations: Record<string, Record<Language, string>> = {
    'sos.emergency': {
      en: 'Emergency',
      hi: 'आपातकाल',
      gu: 'કટોકટી',
      ta: 'அவசரம்',
      te: 'అత్యవసరం',
      bn: 'জরুরি',
      mr: 'आणीबाणी',
      kn: 'ತುರ್ತು',
      ml: 'അടിയന്തിരം',
      pa: 'ਜ਼ਰੂਰੀ',
    },
    'sos.medical': {
      en: 'Medical',
      hi: 'चिकित्सीय',
      gu: 'દવાખાનું',
      ta: 'மருத்துவ',
      te: 'వైద్య',
      bn: 'চিকিৎসা',
      mr: 'वैद्यकीय',
      kn: 'ವೈದ್ಯಕೀಯ',
      ml: 'വൈദ്യ',
      pa: 'ਮੈਡੀਕਲ',
    },
    'sos.fire': {
      en: 'Fire',
      hi: 'आग',
      gu: 'આગ',
      ta: 'தீ',
      te: 'అగ్ని',
      bn: 'আগুন',
      mr: 'आग',
      kn: 'ಅಗ್ನಿ',
      ml: 'തീ',
      pa: 'ਅੱਗ',
    },
    'sos.police': {
      en: 'Police',
      hi: 'पुलिस',
      gu: 'પોલીસ',
      ta: 'காவல்துறை',
      te: 'పోలీసు',
      bn: 'পুলিশ',
      mr: 'पोलीस',
      kn: 'ಪೊಲೀಸ್',
      ml: 'പോലീസ്',
      pa: 'ਪੁਲੀਸ',
    },
    'status.active': {
      en: 'Active',
      hi: 'सक्रिय',
      gu: 'સક્રિય',
      ta: 'செயலில்',
      te: 'క్రియాశీల',
      bn: 'সক্রিয়',
      mr: 'सक्रिय',
      kn: 'ಸಕ್ರಿಯ',
      ml: 'സജീവം',
      pa: 'ਸਰਗਰਮ',
    },
    'status.assigned': {
      en: 'Assigned',
      hi: 'नियुक्त',
      gu: 'સોંપેલું',
      ta: 'நியமிக்கப்பட்டது',
      te: 'కేటాయించబడింది',
      bn: 'নিয়োগকৃত',
      mr: 'नियुक्त',
      kn: 'ಹೊಣೆಗಾರಿಕೆ',
      ml: 'നിയോഗിക്കപ്പെട്ടത്',
      pa: 'ਸੌਂਪਿਆ ਗਿਆ',
    },
    'status.resolved': {
      en: 'Resolved',
      hi: 'समाधान',
      gu: 'સમાધાન',
      ta: 'தீர்க்கப்பட்டது',
      te: 'పరిష్కరించబడింది',
      bn: 'সমাধান',
      mr: 'सोडवले',
      kn: 'ಪರಿಹರಿಸಲಾಗಿದೆ',
      ml: 'പരിഹരിച്ചു',
      pa: 'ਹੱਲ ਕੀਤਾ ਗਿਆ',
    },
  };

  return translations[key]?.[lang] || key;
}
