export interface Admin {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
  organization?: string;
  phone?: string;
  permissions: Record<string, any>;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  phone: string | null;
  name: string;
  role: 'user' | 'helper' | 'responder' | 'admin';
  avatar_url: string | null;
  is_verified: boolean;
  is_blocked: boolean;
  last_active: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  admin: Admin | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'admin' | 'super_admin';
  organization: string;
  phone: string;
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: 'user' | 'helper' | 'responder';
}

export interface PasswordResetData {
  email: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AdminPermissions {
  canViewUsers: boolean;
  canEditUsers: boolean;
  canDeleteUsers: boolean;
  canViewSOSEvents: boolean;
  canEditSOSEvents: boolean;
  canDeleteSOSEvents: boolean;
  canViewHelpers: boolean;
  canEditHelpers: boolean;
  canDeleteHelpers: boolean;
  canViewResponders: boolean;
  canEditResponders: boolean;
  canDeleteResponders: boolean;
  canViewHospitals: boolean;
  canEditHospitals: boolean;
  canDeleteHospitals: boolean;
  canViewMedia: boolean;
  canDeleteMedia: boolean;
  canViewAuditLogs: boolean;
  canManageAdmins: boolean;
  canViewAnalytics: boolean;
  canExportData: boolean;
}

export const DEFAULT_ADMIN_PERMISSIONS: AdminPermissions = {
  canViewUsers: true,
  canEditUsers: true,
  canDeleteUsers: false,
  canViewSOSEvents: true,
  canEditSOSEvents: true,
  canDeleteSOSEvents: false,
  canViewHelpers: true,
  canEditHelpers: true,
  canDeleteHelpers: false,
  canViewResponders: true,
  canEditResponders: true,
  canDeleteResponders: false,
  canViewHospitals: true,
  canEditHospitals: true,
  canDeleteHospitals: false,
  canViewMedia: true,
  canDeleteMedia: true,
  canViewAuditLogs: false,
  canManageAdmins: false,
  canViewAnalytics: true,
  canExportData: true,
};

export const SUPER_ADMIN_PERMISSIONS: AdminPermissions = {
  canViewUsers: true,
  canEditUsers: true,
  canDeleteUsers: true,
  canViewSOSEvents: true,
  canEditSOSEvents: true,
  canDeleteSOSEvents: true,
  canViewHelpers: true,
  canEditHelpers: true,
  canDeleteHelpers: true,
  canViewResponders: true,
  canEditResponders: true,
  canDeleteResponders: true,
  canViewHospitals: true,
  canEditHospitals: true,
  canDeleteHospitals: true,
  canViewMedia: true,
  canDeleteMedia: true,
  canViewAuditLogs: true,
  canManageAdmins: true,
  canViewAnalytics: true,
  canExportData: true,
}; 