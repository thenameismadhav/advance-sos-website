import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { AuthService } from '@/lib/services/auth';
import { Admin } from '@/types/auth';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadAdmin = async () => {
      const currentAdmin = await AuthService.getCurrentAdmin();
      setAdmin(currentAdmin);
    };
    loadAdmin();
  }, []);

  const handleLogout = async () => {
    try {
      await AuthService.logAdminAction('logout');
      await AuthService.signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
    { name: 'SOS Events', href: '/admin/sos-events', icon: '🚨' },
    { name: 'Helpers', href: '/admin/helpers', icon: '🆘' },
    { name: 'Responders', href: '/admin/responders', icon: '🚑' },
    { name: 'Hospitals', href: '/admin/hospitals', icon: '🏥' },
    { name: 'Users', href: '/admin/users', icon: '👥' },
    { name: 'Media', href: '/admin/media', icon: '📷' },
    { name: 'Analytics', href: '/admin/analytics', icon: '📈' },
    { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
  ];

  if (admin?.role === 'super_admin') {
    navigation.push(
      { name: 'Audit Logs', href: '/admin/audit-logs', icon: '📋' },
      { name: 'Admin Management', href: '/admin/admin-management', icon: '👨‍💼' }
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Sidebar */}
      <div className={`floating-panel inset-y-0 left-0 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 bg-gray-900">
          <div className="flex items-center">
            <div className="text-red-500 text-2xl mr-2">🚨</div>
            <h1 className="text-white text-lg font-bold">SOS Admin</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = window.location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-red-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Admin Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-900 border-t border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {admin?.name?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {admin?.name || 'Admin'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {admin?.role || 'admin'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 text-gray-400 hover:text-white"
              title="Logout"
            >
              🚪
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <div className="floating-panel top-0 left-0 right-0 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              ☰
            </button>

            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <select className="bg-gray-700 text-white text-sm rounded px-2 py-1">
                <option value="en">🇺🇸 English</option>
                <option value="hi">🇮🇳 हिंदी</option>
                <option value="gu">🇮🇳 ગુજરાતી</option>
                <option value="ta">🇮🇳 தமிழ்</option>
                <option value="te">🇮🇳 తెలుగు</option>
                <option value="bn">🇮🇳 বাংলা</option>
                <option value="mr">🇮🇳 मराठी</option>
                <option value="kn">🇮🇳 ಕನ್ನಡ</option>
                <option value="ml">🇮🇳 മലയാളം</option>
                <option value="pa">🇮🇳 ਪੰਜਾਬੀ</option>
              </select>

              {/* Notifications */}
              <button className="text-gray-400 hover:text-white relative">
                🔔
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </button>

              {/* Admin Menu */}
              <div className="relative">
                <button className="flex items-center text-gray-400 hover:text-white">
                  <span className="mr-2">{admin?.name || 'Admin'}</span>
                  ▼
                </button>
                {/* Dropdown menu would go here */}
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="overlay-container bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}; 