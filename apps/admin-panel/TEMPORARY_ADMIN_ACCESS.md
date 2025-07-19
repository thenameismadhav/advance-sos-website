# 🔓 Temporary Admin Access Feature

## Overview

The SOS Emergency System now includes a **temporary admin access feature** that allows normal users to access the admin panel with limited permissions. This is useful for:

- **Testing and demonstration purposes**
- **Temporary access for stakeholders**
- **Development and debugging**
- **User onboarding and training**

## 🚀 How It Works

### 1. User Registration
- Users can register at `/signup` (regular user signup)
- Creates a normal user account in the `users` table
- No admin privileges initially

### 2. Automatic Admin Access Grant
When a user tries to access the admin panel:
- System checks if they have an admin profile
- If not, automatically creates a **temporary admin profile**
- Grants limited viewing permissions
- User can now access the admin dashboard

### 3. Temporary Admin Profile
```typescript
{
  id: user.id,
  email: user.email,
  name: userProfile?.name || 'Temporary Admin',
  role: 'admin',
  organization: 'Temporary Access',
  permissions: {
    // View permissions only
    canViewUsers: true,
    canViewSOSEvents: true,
    canViewHelpers: true,
    canViewResponders: true,
    canViewHospitals: true,
    canViewMedia: true,
    canViewAnalytics: true,
    canExportData: true,
    
    // No edit/delete permissions
    canEditUsers: false,
    canDeleteUsers: false,
    canEditSOSEvents: false,
    canDeleteSOSEvents: false,
    canEditHelpers: false,
    canDeleteHelpers: false,
    canEditResponders: false,
    canDeleteResponders: false,
    canEditHospitals: false,
    canDeleteHospitals: false,
    canDeleteMedia: false,
    canViewAuditLogs: false,
    canManageAdmins: false,
  }
}
```

## 📋 Access Levels

### 🔵 Regular Users (Temporary Admin Access)
- **Can View**: All data (users, SOS events, helpers, responders, hospitals, media)
- **Can Export**: Data for analysis
- **Can Access**: Analytics dashboard
- **Cannot**: Edit, delete, or manage any data
- **Cannot**: Access audit logs or manage other admins

### 🟢 Full Admins
- **Can View**: All data
- **Can Edit**: Most data (depending on permissions)
- **Can Delete**: Data (depending on permissions)
- **Can Access**: Full admin features

### 🟡 Super Admins
- **Can Do Everything**: Full system access
- **Can Manage**: Other admins
- **Can Access**: Audit logs and advanced features

## 🔧 Implementation Details

### Modified Files:
1. **`src/lib/services/auth.ts`**
   - Updated `signIn()` method to create temporary admin profiles
   - Updated `getCurrentAdmin()` method to handle temporary access

2. **`src/components/auth/UserSignupForm.tsx`**
   - New component for regular user registration
   - Creates user profiles in `users` table

3. **`src/pages/user/signup.tsx`**
   - New page for user signup at `/signup`

4. **`src/components/auth/LoginForm.tsx`**
   - Added link to regular user signup

5. **`src/App.tsx`**
   - Added route for user signup

## 🛡️ Security Considerations

### Temporary Access Limitations:
- **Read-only access** to prevent data modification
- **No admin management** to prevent privilege escalation
- **No audit log access** to maintain security
- **Clear labeling** as "Temporary Access"

### Database Safety:
- Temporary admins are stored in the `admins` table
- Can be easily identified by `organization: 'Temporary Access'`
- Can be cleaned up later if needed

## 🧹 Cleanup and Management

### To Remove Temporary Access:
```sql
-- Remove all temporary admin profiles
DELETE FROM public.admins 
WHERE organization = 'Temporary Access';

-- Or deactivate them
UPDATE public.admins 
SET is_active = false 
WHERE organization = 'Temporary Access';
```

### To Convert Temporary to Full Admin:
```sql
-- Update a temporary admin to full admin
UPDATE public.admins 
SET 
  organization = 'Your Organization',
  permissions = '{"canViewUsers": true, "canEditUsers": true, ...}',
  role = 'admin'
WHERE id = 'user-id-here';
```

## 🚨 Important Notes

### Development vs Production:
- **Development**: This feature is always enabled
- **Production**: Should be disabled or restricted based on your security requirements

### To Disable Temporary Access:
1. Remove the temporary admin creation logic from `auth.ts`
2. Restore the original admin-only access check
3. Update the error message to redirect users to proper admin signup

### Monitoring:
- Check console logs for "Temporary admin access granted" messages
- Monitor the `admins` table for temporary access entries
- Review audit logs for any suspicious activity

## 📞 Support

If you need to:
- **Disable this feature**: Remove the temporary admin creation code
- **Modify permissions**: Update the `permissions` object in the code
- **Add more restrictions**: Modify the RLS policies or add additional checks
- **Clean up temporary access**: Use the SQL commands above

This feature provides a safe way to give temporary access while maintaining system security and data integrity. 