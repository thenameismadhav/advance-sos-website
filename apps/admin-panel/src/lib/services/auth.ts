import { supabase } from '../supabase';
import { Admin, LoginCredentials, AuthState, SignupCredentials } from '@/types/auth';

export class AuthService {
  static async signIn(credentials: LoginCredentials): Promise<{ admin: Admin | null; error: any }> {
    try {
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      if (user) {
        // Allow any authenticated user as admin
        const admin = {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          role: 'admin' as const,
          organization: 'Any User',
          phone: user.user_metadata?.phone || '',
          permissions: {
            canViewUsers: true,
            canViewSOSEvents: true,
            canViewHelpers: true,
            canViewResponders: true,
            canViewHospitals: true,
            canViewMedia: true,
            canViewAnalytics: true,
            canExportData: true,
            canEditUsers: true,
            canDeleteUsers: true,
            canEditSOSEvents: true,
            canDeleteSOSEvents: true,
            canEditHelpers: true,
            canDeleteHelpers: true,
            canEditResponders: true,
            canDeleteResponders: true,
            canEditHospitals: true,
            canDeleteHospitals: true,
            canDeleteMedia: true,
            canViewAuditLogs: true,
            canManageAdmins: true,
          },
          is_active: true,
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Log the admin action
        await this.logAdminAction('login', { email: credentials.email });

        return { admin, error: null };
      }

      return { admin: null, error: new Error('Authentication failed') };
    } catch (error) {
      return { admin: null, error };
    }
  }

  static async signOut(): Promise<void> {
    await this.logAdminAction('logout');
    await supabase.auth.signOut();
  }

  static async getCurrentAdmin(): Promise<Admin | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Allow any authenticated user as admin
    return {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      role: 'admin' as const,
      organization: 'Any User',
      phone: user.user_metadata?.phone || '',
      permissions: {
        canViewUsers: true,
        canViewSOSEvents: true,
        canViewHelpers: true,
        canViewResponders: true,
        canViewHospitals: true,
        canViewMedia: true,
        canViewAnalytics: true,
        canExportData: true,
        canEditUsers: true,
        canDeleteUsers: true,
        canEditSOSEvents: true,
        canDeleteSOSEvents: true,
        canEditHelpers: true,
        canDeleteHelpers: true,
        canEditResponders: true,
        canDeleteResponders: true,
        canEditHospitals: true,
        canDeleteHospitals: true,
        canDeleteMedia: true,
        canViewAuditLogs: true,
        canManageAdmins: true,
      },
      is_active: true,
      last_login: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  static async getCurrentUser(): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    return userProfile;
  }

  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  static async signUp(credentials: SignupCredentials): Promise<{ admin: Admin | null; error: any }> {
    try {
      // For development, we can bypass CAPTCHA by using a different approach
      if (import.meta.env.DEV) {
        // Create auth user directly
        const { data: { user }, error: authError } = await supabase.auth.signUp({
          email: credentials.email,
          password: credentials.password,
          options: {
            data: {
              name: credentials.name,
              organization: credentials.organization,
              phone: credentials.phone,
              role: credentials.role,
            }
          }
        });

        if (authError) throw authError;

        if (user) {
          // Return admin profile for any authenticated user
          const admin = {
            id: user.id,
            email: credentials.email,
            name: credentials.name,
            role: 'admin' as const,
            organization: credentials.organization || 'Any User',
            phone: credentials.phone || '',
            permissions: {
              canViewUsers: true,
              canViewSOSEvents: true,
              canViewHelpers: true,
              canViewResponders: true,
              canViewHospitals: true,
              canViewMedia: true,
              canViewAnalytics: true,
              canExportData: true,
              canEditUsers: true,
              canDeleteUsers: true,
              canEditSOSEvents: true,
              canDeleteSOSEvents: true,
              canEditHelpers: true,
              canDeleteHelpers: true,
              canEditResponders: true,
              canDeleteResponders: true,
              canEditHospitals: true,
              canDeleteHospitals: true,
              canDeleteMedia: true,
              canViewAuditLogs: true,
              canManageAdmins: true,
            },
            is_active: true,
            last_login: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // Log the admin action
          await this.logAdminAction('signup', { email: credentials.email });

          return { admin, error: null };
        }

        // Note: In production, you should use proper auth signup
        console.warn('Development mode: Admin created without auth user. Use proper signup in production.');
        return { admin: null, error: new Error('Failed to create user') };
      }

      // Production signup with CAPTCHA handling
      const signUpOptions: any = {
        email: credentials.email,
        password: credentials.password,
        options: {
          emailRedirectTo: `${import.meta.env.VITE_APP_URL || 'http://localhost:8080'}/admin/login`,
          data: {
            name: credentials.name,
            organization: credentials.organization,
            phone: credentials.phone,
            role: credentials.role,
          }
        }
      };

      const { data: { user }, error: authError } = await supabase.auth.signUp(signUpOptions);

      if (authError) {
        // Handle specific CAPTCHA errors
        if (authError.message?.includes('captcha') || authError.message?.includes('verification')) {
          throw new Error('CAPTCHA verification failed. Please try again or contact support if the issue persists.');
        }
        throw authError;
      }

      if (user) {
        // Return admin profile for any authenticated user
        const admin = {
          id: user.id,
          email: credentials.email,
          name: credentials.name,
          role: 'admin' as const,
          organization: credentials.organization || 'Any User',
          phone: credentials.phone || '',
          permissions: {
            canViewUsers: true,
            canViewSOSEvents: true,
            canViewHelpers: true,
            canViewResponders: true,
            canViewHospitals: true,
            canViewMedia: true,
            canViewAnalytics: true,
            canExportData: true,
            canEditUsers: true,
            canDeleteUsers: true,
            canEditSOSEvents: true,
            canDeleteSOSEvents: true,
            canEditHelpers: true,
            canDeleteHelpers: true,
            canEditResponders: true,
            canDeleteResponders: true,
            canEditHospitals: true,
            canDeleteHospitals: true,
            canDeleteMedia: true,
            canViewAuditLogs: true,
            canManageAdmins: true,
          },
          is_active: true,
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Log the admin action
        await this.logAdminAction('signup', { email: credentials.email });

        return { admin, error: null };
      }

      return { admin: null, error: new Error('Failed to create admin') };
    } catch (error) {
      return { admin: null, error };
    }
  }

  static async createAdmin(adminData: {
    email: string;
    password: string;
    name: string;
    role: 'admin' | 'super_admin';
  }): Promise<{ admin: Admin | null; error: any }> {
    try {
      // Create auth user
      const { data: { user }, error: authError } = await supabase.auth.signUp({
        email: adminData.email,
        password: adminData.password,
        options: {
          data: {
            name: adminData.name,
            role: adminData.role,
          }
        }
      });

      if (authError) throw authError;

      if (user) {
        // Return admin profile for any authenticated user
        const admin = {
          id: user.id,
          email: adminData.email,
          name: adminData.name,
          role: 'admin' as const,
          organization: 'Any User',
          phone: '',
          permissions: {
            canViewUsers: true,
            canViewSOSEvents: true,
            canViewHelpers: true,
            canViewResponders: true,
            canViewHospitals: true,
            canViewMedia: true,
            canViewAnalytics: true,
            canExportData: true,
            canEditUsers: true,
            canDeleteUsers: true,
            canEditSOSEvents: true,
            canDeleteSOSEvents: true,
            canEditHelpers: true,
            canDeleteHelpers: true,
            canEditResponders: true,
            canDeleteResponders: true,
            canEditHospitals: true,
            canDeleteHospitals: true,
            canDeleteMedia: true,
            canViewAuditLogs: true,
            canManageAdmins: true,
          },
          is_active: true,
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        return { admin, error: null };
      }

      return { admin: null, error: new Error('Failed to create admin') };
    } catch (error) {
      return { admin: null, error };
    }
  }

  static async updateAdmin(adminId: string, updates: Partial<Admin>): Promise<{ admin: Admin | null; error: any }> {
    try {
      // Since any user is now an admin, we'll update the auth user metadata
      const { data: { user }, error } = await supabase.auth.updateUser({
        data: {
          name: updates.name,
          organization: updates.organization,
          phone: updates.phone,
        }
      });

      if (error) throw error;

      if (user) {
        // Return updated admin profile
        const admin = {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          role: 'admin' as const,
          organization: user.user_metadata?.organization || 'Any User',
          phone: user.user_metadata?.phone || '',
          permissions: {
            canViewUsers: true,
            canViewSOSEvents: true,
            canViewHelpers: true,
            canViewResponders: true,
            canViewHospitals: true,
            canViewMedia: true,
            canViewAnalytics: true,
            canExportData: true,
            canEditUsers: true,
            canDeleteUsers: true,
            canEditSOSEvents: true,
            canDeleteSOSEvents: true,
            canEditHelpers: true,
            canDeleteHelpers: true,
            canEditResponders: true,
            canDeleteResponders: true,
            canEditHospitals: true,
            canDeleteHospitals: true,
            canDeleteMedia: true,
            canViewAuditLogs: true,
            canManageAdmins: true,
          },
          is_active: true,
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        return { admin, error: null };
      }

      return { admin: null, error: new Error('Failed to update admin') };
    } catch (error) {
      return { admin: null, error };
    }
  }

  static async deleteAdmin(adminId: string): Promise<{ error: any }> {
    try {
      // Since any user is now an admin, we'll delete the auth user
      const { error } = await supabase.auth.admin.deleteUser(adminId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  static async getAllAdmins(): Promise<{ admins: Admin[]; error: any }> {
    try {
      // Since any authenticated user is an admin, we'll return all users
      const { data: users, error } = await supabase.auth.admin.listUsers();

      if (error) throw error;

      const admins = users.users.map(user => ({
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        role: 'admin' as const,
        organization: user.user_metadata?.organization || 'Any User',
        phone: user.user_metadata?.phone || '',
        permissions: {
          canViewUsers: true,
          canViewSOSEvents: true,
          canViewHelpers: true,
          canViewResponders: true,
          canViewHospitals: true,
          canViewMedia: true,
          canViewAnalytics: true,
          canExportData: true,
          canEditUsers: true,
          canDeleteUsers: true,
          canEditSOSEvents: true,
          canDeleteSOSEvents: true,
          canEditHelpers: true,
          canDeleteHelpers: true,
          canEditResponders: true,
          canDeleteResponders: true,
          canEditHospitals: true,
          canDeleteHospitals: true,
          canDeleteMedia: true,
          canViewAuditLogs: true,
          canManageAdmins: true,
        },
        is_active: true,
        last_login: user.last_sign_in_at || new Date().toISOString(),
        created_at: user.created_at,
        updated_at: user.updated_at || new Date().toISOString(),
      }));

      return { admins, error: null };
    } catch (error) {
      return { admins: [], error };
    }
  }

  static async resetPassword(email: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${import.meta.env.VITE_APP_URL || 'http://localhost:3000'}/admin/reset-password`,
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  static async changePassword(newPassword: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  static async updateProfile(updates: {
    name?: string;
    avatar_url?: string;
  }): Promise<{ admin: Admin | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Update auth user metadata
      const { data: { user: updatedUser }, error } = await supabase.auth.updateUser({
        data: {
          name: updates.name,
          avatar_url: updates.avatar_url,
        }
      });

      if (error) throw error;

      if (updatedUser) {
        // Return updated admin profile
        const admin = {
          id: updatedUser.id,
          email: updatedUser.email || '',
          name: updatedUser.user_metadata?.name || updatedUser.email?.split('@')[0] || 'User',
          role: 'admin' as const,
          organization: updatedUser.user_metadata?.organization || 'Any User',
          phone: updatedUser.user_metadata?.phone || '',
          permissions: {
            canViewUsers: true,
            canViewSOSEvents: true,
            canViewHelpers: true,
            canViewResponders: true,
            canViewHospitals: true,
            canViewMedia: true,
            canViewAnalytics: true,
            canExportData: true,
            canEditUsers: true,
            canDeleteUsers: true,
            canEditSOSEvents: true,
            canDeleteSOSEvents: true,
            canEditHelpers: true,
            canDeleteHelpers: true,
            canEditResponders: true,
            canDeleteResponders: true,
            canEditHospitals: true,
            canDeleteHospitals: true,
            canDeleteMedia: true,
            canViewAuditLogs: true,
            canManageAdmins: true,
          },
          is_active: true,
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        return { admin, error: null };
      }

      return { admin: null, error: new Error('Failed to update profile') };
    } catch (error) {
      return { admin: null, error };
    }
  }

  static async checkPermission(permission: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Since any authenticated user is now an admin, they have all permissions
      return true;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  static async logAdminAction(action: string, details?: any): Promise<void> {
    try {
      const admin = await this.getCurrentAdmin();
      if (!admin) return;

      await supabase
        .from('admin_logs')
        .insert({
          admin_id: admin.id,
          action,
          details,
          ip_address: '127.0.0.1', // This would be extracted from request
          user_agent: 'Admin Panel', // This would be extracted from request
        });
    } catch (error) {
      console.error('Failed to log admin action:', error);
    }
  }
} 