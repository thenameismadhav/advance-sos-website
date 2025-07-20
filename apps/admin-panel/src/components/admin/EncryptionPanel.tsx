import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Lock, 
  Unlock, 
  Key, 
  Database, 
  FileText, 
  Video, 
  Mic,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Zap,
  Loader2,
  Activity
} from 'lucide-react';

interface EncryptionStatus {
  userData: boolean;
  audioStreams: boolean;
  videoStreams: boolean;
  sosMessages: boolean;
  locationData: boolean;
  medicalRecords: boolean;
}

interface EncryptionMetrics {
  encryptedFiles: number;
  encryptionRate: number;
  keyRotationCount: number;
  lastKeyRotation: Date;
  securityScore: number;
  activeKeys: number;
}

interface SecurityAudit {
  id: string;
  type: 'encryption' | 'key_rotation' | 'access_control' | 'data_integrity';
  status: 'passed' | 'failed' | 'warning';
  timestamp: Date;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface EncryptionKey {
  id: string;
  name: string;
  algorithm: 'AES-256' | 'AES-128' | 'ChaCha20';
  status: 'active' | 'rotating' | 'expired';
  created: Date;
  expires: Date;
  usage: number;
}

export const EncryptionPanel: React.FC = () => {
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [encryptionStatus, setEncryptionStatus] = useState<EncryptionStatus>({
    userData: true,
    audioStreams: true,
    videoStreams: true,
    sosMessages: true,
    locationData: true,
    medicalRecords: true
  });
  const [metrics, setMetrics] = useState<EncryptionMetrics>({
    encryptedFiles: 0,
    encryptionRate: 0,
    keyRotationCount: 0,
    lastKeyRotation: new Date(),
    securityScore: 0,
    activeKeys: 0
  });
  const [securityAudits, setSecurityAudits] = useState<SecurityAudit[]>([]);
  const [encryptionKeys, setEncryptionKeys] = useState<EncryptionKey[]>([]);
  const [isRotatingKeys, setIsRotatingKeys] = useState(false);
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  // Simulate real-time encryption metrics
  useEffect(() => {
    if (!encryptionEnabled) return;

    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        encryptedFiles: Math.floor(Math.random() * 10000) + 5000,
        encryptionRate: Math.random() * 20 + 80,
        securityScore: Math.random() * 10 + 90
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [encryptionEnabled]);

  // Initialize encryption keys
  useEffect(() => {
    const keys: EncryptionKey[] = [
      {
        id: '1',
        name: 'Primary AES-256 Key',
        algorithm: 'AES-256',
        status: 'active',
        created: new Date(Date.now() - 86400000 * 7), // 7 days ago
        expires: new Date(Date.now() + 86400000 * 23), // 23 days from now
        usage: 85
      },
      {
        id: '2',
        name: 'Secondary AES-256 Key',
        algorithm: 'AES-256',
        status: 'active',
        created: new Date(Date.now() - 86400000 * 3), // 3 days ago
        expires: new Date(Date.now() + 86400000 * 27), // 27 days from now
        usage: 15
      },
      {
        id: '3',
        name: 'Legacy AES-128 Key',
        algorithm: 'AES-128',
        status: 'expired',
        created: new Date(Date.now() - 86400000 * 30), // 30 days ago
        expires: new Date(Date.now() - 86400000 * 1), // 1 day ago
        usage: 0
      }
    ];

    setEncryptionKeys(keys);
    setMetrics(prev => ({ ...prev, activeKeys: keys.filter(k => k.status === 'active').length }));

    // Initialize security audits
    const audits: SecurityAudit[] = [
      {
        id: '1',
        type: 'encryption',
        status: 'passed',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        description: 'All user data encrypted with AES-256',
        severity: 'low'
      },
      {
        id: '2',
        type: 'key_rotation',
        status: 'passed',
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
        description: 'Encryption keys rotated successfully',
        severity: 'medium'
      },
      {
        id: '3',
        type: 'access_control',
        status: 'warning',
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        description: 'Multiple failed login attempts detected',
        severity: 'high'
      },
      {
        id: '4',
        type: 'data_integrity',
        status: 'passed',
        timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
        description: 'Data integrity checks passed',
        severity: 'low'
      }
    ];

    setSecurityAudits(audits);
  }, []);

  const handleToggleEncryption = async () => {
    try {
      // Simulate API call to toggle encryption
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEncryptionEnabled(!encryptionEnabled);
    } catch (error) {
      console.error('Error toggling encryption:', error);
    }
  };

  const handleRotateKeys = async () => {
    setIsRotatingKeys(true);
    try {
      // Simulate key rotation process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update keys
      setEncryptionKeys(prev => 
        prev.map(key => ({
          ...key,
          status: key.status === 'active' ? 'rotating' : key.status
        }))
      );

      // Update metrics
      setMetrics(prev => ({
        ...prev,
        keyRotationCount: prev.keyRotationCount + 1,
        lastKeyRotation: new Date()
      }));

      // Add audit log
      const newAudit: SecurityAudit = {
        id: Date.now().toString(),
        type: 'key_rotation',
        status: 'passed',
        timestamp: new Date(),
        description: 'Encryption keys rotated successfully',
        severity: 'medium'
      };

      setSecurityAudits(prev => [newAudit, ...prev]);
    } catch (error) {
      console.error('Error rotating keys:', error);
    } finally {
      setIsRotatingKeys(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getKeyStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'rotating': return 'text-yellow-500';
      case 'expired': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Encryption Control */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <CardTitle>Military-Grade Encryption</CardTitle>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={encryptionEnabled}
                  onCheckedChange={handleToggleEncryption}
                />
                <span className="text-sm font-medium">
                  {encryptionEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowSensitiveData(!showSensitiveData)}
              >
                {showSensitiveData ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <CardDescription>
            AES-256 encryption for all user data, audio, video, and SOS messages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(encryptionStatus).map(([key, enabled]) => (
              <div key={key} className="text-center">
                <div className={`p-3 rounded-lg ${enabled ? 'bg-green-100' : 'bg-red-100'}`}>
                  {key === 'userData' && <Database className={`h-6 w-6 mx-auto ${enabled ? 'text-green-600' : 'text-red-600'}`} />}
                  {key === 'audioStreams' && <Mic className={`h-6 w-6 mx-auto ${enabled ? 'text-green-600' : 'text-red-600'}`} />}
                  {key === 'videoStreams' && <Video className={`h-6 w-6 mx-auto ${enabled ? 'text-green-600' : 'text-red-600'}`} />}
                  {key === 'sosMessages' && <AlertTriangle className={`h-6 w-6 mx-auto ${enabled ? 'text-green-600' : 'text-red-600'}`} />}
                  {key === 'locationData' && <FileText className={`h-6 w-6 mx-auto ${enabled ? 'text-green-600' : 'text-red-600'}`} />}
                  {key === 'medicalRecords' && <FileText className={`h-6 w-6 mx-auto ${enabled ? 'text-green-600' : 'text-red-600'}`} />}
                </div>
                <p className="text-sm mt-2 font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</p>
                <Badge variant={enabled ? 'default' : 'destructive'} className="mt-1">
                  {enabled ? 'Encrypted' : 'Unencrypted'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Encryption Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Encryption Metrics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.encryptedFiles.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Encrypted Files</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.encryptionRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-500">Encryption Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{metrics.securityScore.toFixed(0)}</div>
              <div className="text-sm text-gray-500">Security Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{metrics.activeKeys}</div>
              <div className="text-sm text-gray-500">Active Keys</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-sm mb-1">
              <span>Overall Security Score</span>
              <span>{metrics.securityScore.toFixed(0)}%</span>
            </div>
            <Progress value={metrics.securityScore} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Encryption Keys */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5" />
              <span>Encryption Keys</span>
            </CardTitle>
            <Button
              size="sm"
              onClick={handleRotateKeys}
              disabled={isRotatingKeys}
            >
              {isRotatingKeys ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Rotate Keys
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {encryptionKeys.map((key) => (
              <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getKeyStatusColor(key.status).replace('text-', 'bg-')}`} />
                  <div>
                    <h4 className="font-semibold">{key.name}</h4>
                    <div className="flex space-x-4 text-sm text-gray-500">
                      <span>{key.algorithm}</span>
                      <span>Usage: {key.usage}%</span>
                      <span>Expires: {key.expires.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <Badge variant={
                  key.status === 'active' ? 'default' :
                  key.status === 'rotating' ? 'secondary' : 'destructive'
                }>
                  {key.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Audits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Security Audits</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {securityAudits.slice(0, 5).map((audit) => (
              <div key={audit.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(audit.status)}
                  <div>
                    <h4 className="font-medium">{audit.description}</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{audit.timestamp.toLocaleString()}</span>
                      <div className={`w-2 h-2 rounded-full ${getSeverityColor(audit.severity)}`} />
                      <span className="capitalize">{audit.severity}</span>
                    </div>
                  </div>
                </div>
                <Badge variant={
                  audit.status === 'passed' ? 'default' :
                  audit.status === 'warning' ? 'secondary' : 'destructive'
                }>
                  {audit.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 