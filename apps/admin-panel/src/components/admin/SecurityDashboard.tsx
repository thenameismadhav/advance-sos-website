import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Lock, 
  Activity,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface SecurityMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  description: string;
}

interface SecurityAlert {
  id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'login' | 'access' | 'system' | 'network' | 'file';
  message: string;
  resolved: boolean;
}

const SecurityDashboard = () => {
  const [metrics, setMetrics] = useState<SecurityMetric[]>([
    {
      id: '1',
      name: 'Failed Login Attempts',
      value: 3,
      unit: 'attempts',
      status: 'warning',
      trend: 'up',
      description: 'Last 24 hours'
    },
    {
      id: '2',
      name: 'Active Sessions',
      value: 12,
      unit: 'sessions',
      status: 'good',
      trend: 'stable',
      description: 'Currently active'
    },
    {
      id: '3',
      name: 'Security Score',
      value: 92,
      unit: '%',
      status: 'good',
      trend: 'up',
      description: 'Overall security rating'
    },
    {
      id: '4',
      name: 'Blocked Attacks',
      value: 47,
      unit: 'attacks',
      status: 'good',
      trend: 'up',
      description: 'Last 24 hours'
    },
    {
      id: '5',
      name: 'Vulnerable Dependencies',
      value: 4,
      unit: 'packages',
      status: 'warning',
      trend: 'down',
      description: 'Requires attention'
    },
    {
      id: '6',
      name: 'Data Encryption',
      value: 100,
      unit: '%',
      status: 'good',
      trend: 'stable',
      description: 'All data encrypted'
    }
  ]);

  const [alerts, setAlerts] = useState<SecurityAlert[]>([
    {
      id: '1',
      timestamp: new Date().toISOString(),
      severity: 'medium',
      type: 'login',
      message: 'Multiple failed login attempts from IP 192.168.1.100',
      resolved: false
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      severity: 'low',
      type: 'access',
      message: 'User accessed admin panel',
      resolved: true
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      severity: 'high',
      type: 'system',
      message: 'Suspicious file upload detected',
      resolved: false
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      severity: 'critical',
      type: 'network',
      message: 'Potential DDoS attack detected',
      resolved: true
    }
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'login': return <Lock className="h-4 w-4" />;
      case 'access': return <Eye className="h-4 w-4" />;
      case 'system': return <Shield className="h-4 w-4" />;
      case 'network': return <Activity className="h-4 w-4" />;
      case 'file': return <AlertTriangle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical' && !alert.resolved);
  const highAlerts = alerts.filter(alert => alert.severity === 'high' && !alert.resolved);
  const unresolvedAlerts = alerts.filter(alert => !alert.resolved);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Security Dashboard</h2>
          <p className="text-gray-400">Real-time security monitoring and alerts</p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          className="bg-sos-red hover:bg-sos-red/90"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Alert className="border-red-500 bg-red-900/20">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-300">
            {criticalAlerts.length} critical alert{criticalAlerts.length !== 1 ? 's' : ''} require{criticalAlerts.length !== 1 ? '' : 's'} immediate attention
          </AlertDescription>
        </Alert>
      )}

      {/* High Priority Alerts */}
      {highAlerts.length > 0 && (
        <Alert className="border-orange-500 bg-orange-900/20">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <AlertDescription className="text-orange-300">
            {highAlerts.length} high priority alert{highAlerts.length !== 1 ? 's' : ''} need{highAlerts.length !== 1 ? '' : 's'} review
          </AlertDescription>
        </Alert>
      )}

      {/* Security Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.id} className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-300">
                  {metric.name}
                </CardTitle>
                <div className={`w-3 h-3 rounded-full ${getStatusColor(metric.status)}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {metric.value}
                    <span className="text-sm text-gray-400 ml-1">{metric.unit}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(metric.trend)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Security Alerts */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Security Alerts</CardTitle>
          <CardDescription className="text-gray-400">
            Recent security events and notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start space-x-3 p-3 rounded-lg border ${
                  alert.resolved 
                    ? 'bg-gray-800/50 border-gray-600' 
                    : 'bg-red-900/20 border-red-700'
                }`}
              >
                <div className={`w-2 h-2 rounded-full mt-2 ${getSeverityColor(alert.severity)}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    {getTypeIcon(alert.type)}
                    <span className={`text-sm font-medium ${
                      alert.resolved ? 'text-gray-400' : 'text-white'
                    }`}>
                      {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert
                    </span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        alert.resolved ? 'border-gray-600 text-gray-400' : 'border-red-600 text-red-400'
                      }`}
                    >
                      {alert.severity}
                    </Badge>
                    {alert.resolved && (
                      <Badge variant="outline" className="border-green-600 text-green-400 text-xs">
                        Resolved
                      </Badge>
                    )}
                  </div>
                  <p className={`text-sm ${
                    alert.resolved ? 'text-gray-500' : 'text-gray-300'
                  }`}>
                    {alert.message}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
                {!alert.resolved && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resolveAlert(alert.id)}
                    className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                  >
                    <CheckCircle className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityDashboard; 