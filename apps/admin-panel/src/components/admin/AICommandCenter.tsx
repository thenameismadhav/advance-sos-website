import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Zap, 
  Target, 
  Shield, 
  AlertTriangle, 
  Users, 
  Map, 
  Camera,
  Mic,
  Send,
  Bot,
  Sparkles,
  Clock,
  TrendingUp,
  Activity,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Command,
  History,
  Star,
  Copy,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import HolographicCard from '@/components/ui/holographic-card';
import VoiceCommand from '@/components/ui/voice-command';

interface AICommandCenterProps {
  isVisible: boolean;
  onClose: () => void;
}

interface AICommand {
  id: string;
  type: 'security' | 'medical' | 'traffic' | 'surveillance' | 'general' | 'system' | 'emergency';
  command: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  timestamp: Date;
  response?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  executionTime?: number;
  aiConfidence?: number;
  affectedSystems?: string[];
}

interface CommandTemplate {
  id: string;
  name: string;
  description: string;
  command: string;
  type: AICommand['type'];
  priority: AICommand['priority'];
  category: string;
  isFavorite: boolean;
}

const AICommandCenter: React.FC<AICommandCenterProps> = ({ isVisible, onClose }) => {
  const [commands, setCommands] = useState<AICommand[]>([]);
  const [inputCommand, setInputCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiStatus, setAiStatus] = useState<'idle' | 'thinking' | 'executing' | 'learning'>('idle');
  const [aiConfidence, setAiConfidence] = useState(98.7);
  const [systemHealth, setSystemHealth] = useState(95.2);
  const [activeConnections, setActiveConnections] = useState(1247);
  const [voiceFeedback, setVoiceFeedback] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'commands' | 'templates' | 'analytics' | 'settings'>('commands');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Enhanced command templates with categories
  const commandTemplates: CommandTemplate[] = [
    // Emergency Commands
    { id: '1', name: 'Emergency Response', description: 'Deploy all emergency response teams', command: 'deploy emergency response teams to all active incidents', type: 'emergency', priority: 'critical', category: 'Emergency', isFavorite: true },
    { id: '2', name: 'Mass Alert', description: 'Send mass alert to all users', command: 'send mass alert to all registered users in affected areas', type: 'emergency', priority: 'critical', category: 'Emergency', isFavorite: true },
    
    // Security Commands
    { id: '3', name: 'Security Sweep', description: 'Initiate comprehensive security sweep', command: 'initiate security sweep of all zones and facilities', type: 'security', priority: 'high', category: 'Security', isFavorite: false },
    { id: '4', name: 'Threat Assessment', description: 'Conduct real-time threat assessment', command: 'conduct real-time threat assessment of all monitored areas', type: 'security', priority: 'high', category: 'Security', isFavorite: false },
    { id: '5', name: 'Lockdown Protocol', description: 'Activate lockdown protocols', command: 'activate lockdown protocols for all secure facilities', type: 'security', priority: 'critical', category: 'Security', isFavorite: true },
    
    // Medical Commands
    { id: '6', name: 'Medical Response', description: 'Deploy medical response teams', command: 'deploy medical response teams to all medical emergencies', type: 'medical', priority: 'high', category: 'Medical', isFavorite: false },
    { id: '7', name: 'Health Monitoring', description: 'Monitor health metrics', command: 'monitor health metrics for all active users', type: 'medical', priority: 'medium', category: 'Medical', isFavorite: false },
    
    // Traffic Commands
    { id: '8', name: 'Traffic Optimization', description: 'Optimize traffic flow', command: 'optimize traffic flow in all affected areas', type: 'traffic', priority: 'medium', category: 'Traffic', isFavorite: false },
    { id: '9', name: 'Route Planning', description: 'Plan optimal routes', command: 'plan optimal routes for all emergency vehicles', type: 'traffic', priority: 'high', category: 'Traffic', isFavorite: false },
    
    // Surveillance Commands
    { id: '10', name: 'Surveillance Focus', description: 'Focus surveillance on high-risk areas', command: 'focus surveillance systems on high-risk areas', type: 'surveillance', priority: 'high', category: 'Surveillance', isFavorite: false },
    { id: '11', name: 'Crowd Analysis', description: 'Analyze crowd patterns', command: 'analyze crowd patterns and density in all monitored areas', type: 'surveillance', priority: 'medium', category: 'Surveillance', isFavorite: false },
    
    // System Commands
    { id: '12', name: 'System Diagnostics', description: 'Run system diagnostics', command: 'run comprehensive system diagnostics', type: 'system', priority: 'low', category: 'System', isFavorite: false },
    { id: '13', name: 'Data Backup', description: 'Initiate data backup', command: 'initiate secure data backup of all critical systems', type: 'system', priority: 'medium', category: 'System', isFavorite: false },
  ];

  // Smart command suggestions based on context
  const getSmartSuggestions = (input: string): CommandTemplate[] => {
    if (!input.trim()) return commandTemplates.filter(t => t.isFavorite);
    
    const lowerInput = input.toLowerCase();
    return commandTemplates.filter(template => 
      template.name.toLowerCase().includes(lowerInput) ||
      template.description.toLowerCase().includes(lowerInput) ||
      template.command.toLowerCase().includes(lowerInput) ||
      template.category.toLowerCase().includes(lowerInput)
    ).slice(0, 5);
  };

  const executeCommand = async (commandText: string, type: AICommand['type'] = 'general', priority: AICommand['priority'] = 'medium') => {
    const startTime = Date.now();
    const newCommand: AICommand = {
      id: Date.now().toString(),
      type,
      command: commandText,
      status: 'pending',
      timestamp: new Date(),
      priority,
      aiConfidence: Math.random() * 20 + 80, // 80-100% confidence
      affectedSystems: getAffectedSystems(type),
    };

    setCommands(prev => [newCommand, ...prev]);
    setIsProcessing(true);
    setAiStatus('thinking');

    // Simulate AI processing with realistic timing
    setTimeout(() => {
      setAiStatus('executing');
      
      setTimeout(() => {
        const executionTime = Date.now() - startTime;
        setCommands(prev => prev.map(cmd => 
          cmd.id === newCommand.id 
            ? { 
                ...cmd, 
                status: 'completed',
                response: generateAIResponse(commandText, type),
                executionTime
              }
            : cmd
        ));
        setIsProcessing(false);
        setAiStatus('idle');
        
        // Add to command history
        setCommandHistory(prev => [commandText, ...prev.slice(0, 9)]);
        
        // Play success sound if voice feedback is enabled
        if (voiceFeedback) {
          playFeedbackSound('success');
        }
      }, 2000);
    }, 1500);
  };

  const getAffectedSystems = (type: AICommand['type']): string[] => {
    const systemMap = {
      security: ['Surveillance', 'Access Control', 'Alert System'],
      medical: ['Health Monitoring', 'Emergency Response', 'Medical Database'],
      traffic: ['Traffic Management', 'GPS Systems', 'Route Optimization'],
      surveillance: ['Camera Networks', 'AI Detection', 'Analytics'],
      emergency: ['Alert System', 'Emergency Response', 'Communication'],
      system: ['Core Systems', 'Database', 'Network'],
      general: ['General Systems']
    };
    return systemMap[type] || ['General Systems'];
  };

  const generateAIResponse = (command: string, type: AICommand['type']) => {
    const responses = {
      security: [
        'Security protocols activated. All zones under surveillance. Threat level: LOW',
        'Threat assessment complete. No immediate threats detected. Security status: OPTIMAL',
        'Security sweep initiated. Scanning for anomalies. Coverage: 100%',
        'Lockdown protocols activated. All secure facilities secured.',
      ],
      medical: [
        'Emergency response teams deployed. ETA: 3 minutes. Medical protocols: ACTIVE',
        'Medical protocols activated. First responders en route. Health monitoring: ENABLED',
        'Emergency services notified. Coordinating response. Patient tracking: ACTIVE',
        'Medical teams mobilized. Critical care units on standby.',
      ],
      traffic: [
        'Traffic optimization algorithms applied. Flow improved by 23%. Congestion: REDUCED',
        'Route optimization complete. Congestion reduced by 18%. ETA improvements: 15%',
        'Traffic patterns analyzed. Alternative routes suggested. Emergency lanes: CLEAR',
        'Traffic management systems optimized. Real-time routing: ACTIVE',
      ],
      surveillance: [
        'Surveillance systems focused on target areas. Coverage: ENHANCED',
        'Crowd analysis complete. Density levels normal. Anomaly detection: ACTIVE',
        'Monitoring systems enhanced. Real-time tracking active. AI detection: ENABLED',
        'Surveillance networks optimized. Threat detection: MAXIMIZED',
      ],
      emergency: [
        'EMERGENCY PROTOCOLS ACTIVATED. All systems at maximum alert.',
        'Mass alert sent to 12,847 users. Response teams: DEPLOYED',
        'Emergency broadcast initiated. All channels: ACTIVE',
        'Critical incident response: IMMEDIATE. All resources: MOBILIZED',
      ],
      system: [
        'System diagnostics complete. All systems: OPERATIONAL',
        'Data backup initiated. Security protocols: ACTIVE',
        'System optimization complete. Performance: ENHANCED',
        'Core systems verified. Integrity: 100%',
      ],
      general: [
        'Command executed successfully. System status: OPTIMAL',
        'AI processing complete. All systems operational. Performance: PEAK',
        'Task completed. Performance metrics updated. Efficiency: IMPROVED',
        'Operation successful. All parameters: NOMINAL',
      ],
    };

    const typeResponses = responses[type] || responses.general;
    return typeResponses[Math.floor(Math.random() * typeResponses.length)];
  };

  const handleVoiceCommand = (command: string) => {
    executeCommand(command);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCommand.trim()) {
      executeCommand(inputCommand.trim());
      setInputCommand('');
    }
  };

  const handleTemplateClick = (template: CommandTemplate) => {
    executeCommand(template.command, template.type, template.priority);
  };

  const copyCommand = (command: string) => {
    navigator.clipboard.writeText(command);
    setCopiedCommand(command);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const playFeedbackSound = (type: 'success' | 'error' | 'alert') => {
    // In a real implementation, you would play actual audio files
    console.log(`Playing ${type} sound`);
  };

  const getStatusColor = (status: AICommand['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-400';
      case 'executing': return 'text-blue-400';
      case 'completed': return 'text-green-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: AICommand['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'executing': return '⚡';
      case 'completed': return '✅';
      case 'failed': return '❌';
      default: return '•';
    }
  };

  const getPriorityColor = (priority: AICommand['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTemplateIcon = (type: AICommand['type']) => {
    switch (type) {
      case 'security': return Shield;
      case 'medical': return AlertTriangle;
      case 'traffic': return Map;
      case 'surveillance': return Camera;
      case 'emergency': return Zap;
      case 'system': return Settings;
      default: return Command;
    }
  };

  const suggestions = getSmartSuggestions(inputCommand);

  // Real-time system monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      setAiConfidence(prev => Math.max(80, Math.min(100, prev + (Math.random() - 0.5) * 2)));
      setSystemHealth(prev => Math.max(85, Math.min(100, prev + (Math.random() - 0.5) * 1)));
      setActiveConnections(prev => prev + Math.floor(Math.random() * 10) - 5);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="overlay-container flex items-center justify-center bg-black/90 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="w-full max-w-7xl h-[95vh] bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl border border-gray-700/50 overflow-hidden shadow-2xl"
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            transition={{ duration: 0.3 }}
          >
            {/* Enhanced Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-900 to-black">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ 
                    rotate: aiStatus === 'thinking' ? 360 : 0,
                    scale: aiStatus === 'executing' ? [1, 1.1, 1] : 1
                  }}
                  transition={{ 
                    duration: aiStatus === 'thinking' ? 2 : 0.3,
                    repeat: aiStatus === 'thinking' ? Infinity : 0
                  }}
                  className="relative"
                >
                  <Brain className="w-10 h-10 text-red-500" />
                  {aiStatus === 'executing' && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-red-500"
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </motion.div>
                <div>
                  <h2 className="text-3xl font-bold text-white">AI Command Center</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>Status: <span className={`${aiStatus === 'idle' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {aiStatus === 'idle' ? 'Ready' : aiStatus === 'thinking' ? 'Processing...' : aiStatus === 'executing' ? 'Executing...' : 'Learning...'}
                    </span></span>
                    <span>Confidence: <span className="text-blue-400">{aiConfidence.toFixed(1)}%</span></span>
                    <span>Health: <span className="text-green-400">{systemHealth.toFixed(1)}%</span></span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setVoiceFeedback(!voiceFeedback)}
                  variant="ghost"
                  size="sm"
                  className={`${voiceFeedback ? 'text-green-400' : 'text-gray-400'}`}
                >
                  {voiceFeedback ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
                <Button onClick={onClose} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  ✕
                </Button>
              </div>
            </div>

            <div className="flex h-full">
              {/* Left Panel - Enhanced with Tabs */}
              <div className="w-1/3 border-r border-gray-700/50 flex flex-col">
                {/* Tab Navigation */}
                <div className="flex border-b border-gray-700/50">
                  {[
                    { id: 'commands', label: 'Commands', icon: Command },
                    { id: 'templates', label: 'Templates', icon: Star },
                    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                    { id: 'settings', label: 'Settings', icon: Settings }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedTab(tab.id as any)}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 text-sm font-medium transition-colors ${
                        selectedTab === tab.id 
                          ? 'text-red-500 border-b-2 border-red-500 bg-red-500/5' 
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                  {selectedTab === 'commands' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white mb-4">Quick Commands</h3>
                      <div className="grid grid-cols-1 gap-3">
                        {commandTemplates.filter(t => t.isFavorite).map((cmd, index) => {
                          const IconComponent = getTemplateIcon(cmd.type);
                          return (
                            <motion.div
                              key={cmd.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <Button
                                onClick={() => handleTemplateClick(cmd)}
                                className="w-full justify-start bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-300"
                                disabled={isProcessing}
                              >
                                <IconComponent className="w-4 h-4 mr-2" />
                                {cmd.name}
                              </Button>
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Voice Command */}
                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-400 mb-3">Voice Commands</h4>
                        <VoiceCommand onCommand={handleVoiceCommand} />
                      </div>
                    </div>
                  )}

                  {selectedTab === 'templates' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white mb-4">Command Templates</h3>
                      <div className="space-y-3">
                        {Object.entries(
                          commandTemplates.reduce((acc, template) => {
                            if (!acc[template.category]) acc[template.category] = [];
                            acc[template.category].push(template);
                            return acc;
                          }, {} as Record<string, CommandTemplate[]>)
                        ).map(([category, templates]) => (
                          <div key={category}>
                            <h4 className="text-sm font-medium text-gray-400 mb-2">{category}</h4>
                            <div className="space-y-2">
                              {templates.map((template) => (
                                <motion.div
                                  key={template.id}
                                  whileHover={{ scale: 1.02 }}
                                  className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 cursor-pointer hover:border-red-500/50 transition-colors"
                                  onClick={() => handleTemplateClick(template)}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-white">{template.name}</span>
                                    <Badge className={getPriorityColor(template.priority)}>
                                      {template.priority}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-gray-400 mb-2">{template.description}</p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">{template.type}</span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copyCommand(template.command);
                                      }}
                                      className="h-6 w-6 p-0"
                                    >
                                      {copiedCommand === template.command ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    </Button>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTab === 'analytics' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white mb-4">AI Analytics</h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-800/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">AI Confidence</span>
                            <span className="text-sm text-blue-400">{aiConfidence.toFixed(1)}%</span>
                          </div>
                          <Progress value={aiConfidence} className="h-2" />
                        </div>
                        <div className="p-4 bg-gray-800/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">System Health</span>
                            <span className="text-sm text-green-400">{systemHealth.toFixed(1)}%</span>
                          </div>
                          <Progress value={systemHealth} className="h-2" />
                        </div>
                        <div className="p-4 bg-gray-800/50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Active Connections</span>
                            <span className="text-sm text-purple-400">{activeConnections.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedTab === 'settings' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white mb-4">AI Settings</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Voice Feedback</span>
                          <Button
                            size="sm"
                            variant={voiceFeedback ? "default" : "secondary"}
                            onClick={() => setVoiceFeedback(!voiceFeedback)}
                          >
                            {voiceFeedback ? 'ON' : 'OFF'}
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Smart Suggestions</span>
                          <Button
                            size="sm"
                            variant={showSuggestions ? "default" : "secondary"}
                            onClick={() => setShowSuggestions(!showSuggestions)}
                          >
                            {showSuggestions ? 'ON' : 'OFF'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel - Enhanced Command Interface */}
              <div className="flex-1 flex flex-col">
                <div className="p-6 border-b border-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Command Interface</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Activity className="w-4 h-4" />
                      AI Assistant Active
                    </div>
                  </div>

                  {/* Enhanced Command Input */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <Input
                        value={inputCommand}
                        onChange={(e) => setInputCommand(e.target.value)}
                        placeholder="Enter AI command or ask for assistance..."
                        className="w-full bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 pr-12"
                        disabled={isProcessing}
                      />
                      <Button 
                        type="submit" 
                        disabled={isProcessing || !inputCommand.trim()}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Smart Suggestions */}
                    {showSuggestions && suggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-2"
                      >
                        <p className="text-xs text-gray-400">Suggestions:</p>
                        <div className="flex flex-wrap gap-2">
                          {suggestions.map((suggestion) => (
                            <Button
                              key={suggestion.id}
                              size="sm"
                              variant="outline"
                              onClick={() => setInputCommand(suggestion.command)}
                              className="text-xs bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                              {suggestion.name}
                            </Button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </form>
                </div>

                {/* Enhanced Command History */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Command History</h3>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" className="text-gray-400">
                        <History className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-gray-400">
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <AnimatePresence>
                      {commands.map((command) => (
                        <motion.div
                          key={command.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <HolographicCard className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={getStatusColor(command.status)}>
                                    {getStatusIcon(command.status)}
                                  </span>
                                  <span className="text-sm text-gray-400">
                                    {command.timestamp.toLocaleTimeString()}
                                  </span>
                                  <Badge className={getPriorityColor(command.priority)}>
                                    {command.priority}
                                  </Badge>
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    command.type === 'security' ? 'bg-red-500/20 text-red-400' :
                                    command.type === 'medical' ? 'bg-green-500/20 text-green-400' :
                                    command.type === 'traffic' ? 'bg-blue-500/20 text-blue-400' :
                                    command.type === 'surveillance' ? 'bg-purple-500/20 text-purple-400' :
                                    command.type === 'emergency' ? 'bg-red-600/20 text-red-300' :
                                    command.type === 'system' ? 'bg-gray-500/20 text-gray-400' :
                                    'bg-gray-500/20 text-gray-400'
                                  }`}>
                                    {command.type}
                                  </span>
                                </div>
                                <p className="text-white text-sm mb-2">{command.command}</p>
                                {command.response && (
                                  <div className="bg-gray-800/50 rounded p-3 border-l-2 border-red-500">
                                    <p className="text-red-300 text-xs mb-2">{command.response}</p>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                      {command.executionTime && (
                                        <span>⏱️ {command.executionTime}ms</span>
                                      )}
                                      {command.aiConfidence && (
                                        <span>🧠 {command.aiConfidence.toFixed(1)}% confidence</span>
                                      )}
                                      {command.affectedSystems && (
                                        <span>🔧 {command.affectedSystems.join(', ')}</span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </HolographicCard>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AICommandCenter; 