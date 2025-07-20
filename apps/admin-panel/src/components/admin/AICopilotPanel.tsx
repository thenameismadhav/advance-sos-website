import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Users, 
  Clock, 
  Star, 
  MapPin, 
  Zap, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { APIService } from '@/lib/services/api';
import { Helper, Responder, SOSEvent } from '@/types/sos';

interface AIRecommendation {
  id: string;
  type: 'helper' | 'responder';
  entity: Helper | Responder;
  score: number;
  eta: number; // in minutes
  successRate: number;
  currentLoad: number;
  distance: number; // in meters
  reasoning: string[];
  priority: 'high' | 'medium' | 'low';
}

interface AICopilotPanelProps {
  currentSOSEvent?: SOSEvent;
  onAssignHelper?: (helperId: string) => void;
  onAssignResponder?: (responderId: string) => void;
}

export const AICopilotPanel: React.FC<AICopilotPanelProps> = ({
  currentSOSEvent,
  onAssignHelper,
  onAssignResponder
}) => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState<'idle' | 'analyzing' | 'ready' | 'error'>('idle');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Simulate AI analysis and recommendations
  const generateAIRecommendations = async (sosEvent: SOSEvent) => {
    setIsLoading(true);
    setAiStatus('analyzing');

    try {
      // Get all helpers and responders
      const [helpersRes, respondersRes] = await Promise.all([
        APIService.getHelpers(),
        APIService.getResponders()
      ]);

      const helpers = helpersRes.helpers || [];
      const responders = respondersRes.responders || [];

      // Calculate distances and scores
      const recommendations: AIRecommendation[] = [];

      // Process helpers
      helpers.forEach(helper => {
        const distance = calculateDistance(
          sosEvent.latitude,
          sosEvent.longitude,
          helper.latitude,
          helper.longitude
        );

        const eta = calculateETA(distance, helper.status === 'available' ? 5 : 15);
        const successRate = helper.rating / 5 * 100;
        const currentLoad = helper.status === 'busy' ? 80 : helper.status === 'available' ? 20 : 60;
        
        const score = calculateAIScore({
          distance,
          eta,
          successRate,
          currentLoad,
          emergencyType: sosEvent.emergency_type,
          helperTypes: helper.emergency_types
        });

        const reasoning = generateReasoning({
          distance,
          eta,
          successRate,
          currentLoad,
          emergencyType: sosEvent.emergency_type,
          helperTypes: helper.emergency_types
        });

        recommendations.push({
          id: `helper-${helper.id}`,
          type: 'helper',
          entity: helper,
          score,
          eta,
          successRate,
          currentLoad,
          distance,
          reasoning,
          priority: score > 80 ? 'high' : score > 60 ? 'medium' : 'low'
        });
      });

      // Process responders
      responders.forEach(responder => {
        const distance = calculateDistance(
          sosEvent.latitude,
          sosEvent.longitude,
          responder.latitude,
          responder.longitude
        );

        const eta = calculateETA(distance, responder.status === 'available' ? 3 : 10);
        const successRate = 95; // Responders have high success rate
        const currentLoad = responder.status === 'busy' ? 70 : responder.status === 'available' ? 10 : 50;
        
        const score = calculateAIScore({
          distance,
          eta,
          successRate,
          currentLoad,
          emergencyType: sosEvent.emergency_type,
          helperTypes: responder.emergency_types
        });

        const reasoning = generateReasoning({
          distance,
          eta,
          successRate,
          currentLoad,
          emergencyType: sosEvent.emergency_type,
          helperTypes: responder.emergency_types
        });

        recommendations.push({
          id: `responder-${responder.id}`,
          type: 'responder',
          entity: responder,
          score,
          eta,
          successRate,
          currentLoad,
          distance,
          reasoning,
          priority: score > 80 ? 'high' : score > 60 ? 'medium' : 'low'
        });
      });

      // Sort by score (highest first)
      recommendations.sort((a, b) => b.score - a.score);

      setRecommendations(recommendations);
      setAiStatus('ready');
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      setAiStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // Calculate ETA based on distance and status
  const calculateETA = (distance: number, baseTime: number): number => {
    const speed = 30; // km/h average speed
    const distanceKm = distance / 1000;
    return Math.round(baseTime + (distanceKm / speed) * 60);
  };

  // Calculate AI score based on multiple factors
  const calculateAIScore = ({
    distance,
    eta,
    successRate,
    currentLoad,
    emergencyType,
    helperTypes
  }: {
    distance: number;
    eta: number;
    successRate: number;
    currentLoad: number;
    emergencyType: string;
    helperTypes: string[];
  }): number => {
    let score = 0;

    // Distance factor (closer is better)
    const distanceScore = Math.max(0, 100 - (distance / 1000) * 10);
    score += distanceScore * 0.3;

    // ETA factor (faster is better)
    const etaScore = Math.max(0, 100 - eta * 2);
    score += etaScore * 0.25;

    // Success rate factor
    score += successRate * 0.2;

    // Load factor (less busy is better)
    const loadScore = 100 - currentLoad;
    score += loadScore * 0.15;

    // Emergency type match
    if (helperTypes.includes(emergencyType)) {
      score += 10;
    }

    return Math.min(100, Math.max(0, score));
  };

  // Generate reasoning for AI recommendations
  const generateReasoning = ({
    distance,
    eta,
    successRate,
    currentLoad,
    emergencyType,
    helperTypes
  }: {
    distance: number;
    eta: number;
    successRate: number;
    currentLoad: number;
    emergencyType: string;
    helperTypes: string[];
  }): string[] => {
    const reasons: string[] = [];

    if (distance < 2000) {
      reasons.push('Very close proximity to emergency');
    } else if (distance < 5000) {
      reasons.push('Good proximity to emergency');
    }

    if (eta < 10) {
      reasons.push('Fast response time');
    } else if (eta < 20) {
      reasons.push('Reasonable response time');
    }

    if (successRate > 90) {
      reasons.push('Excellent success rate');
    } else if (successRate > 80) {
      reasons.push('Good success rate');
    }

    if (currentLoad < 30) {
      reasons.push('Low current workload');
    } else if (currentLoad < 60) {
      reasons.push('Moderate workload');
    }

    if (helperTypes.includes(emergencyType)) {
      reasons.push(`Specialized in ${emergencyType} emergencies`);
    }

    return reasons;
  };

  // Handle assignment
  const handleAssign = (recommendation: AIRecommendation) => {
    if (recommendation.type === 'helper' && onAssignHelper) {
      onAssignHelper(recommendation.entity.id);
    } else if (recommendation.type === 'responder' && onAssignResponder) {
      onAssignResponder(recommendation.entity.id);
    }
  };

  // Auto-refresh recommendations when SOS event changes
  useEffect(() => {
    if (currentSOSEvent) {
      generateAIRecommendations(currentSOSEvent);
    }
  }, [currentSOSEvent]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (aiStatus) {
      case 'analyzing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Brain className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <CardTitle>AI Copilot</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className="text-sm text-gray-500">
              {aiStatus === 'analyzing' ? 'Analyzing...' : 
               aiStatus === 'ready' ? 'Ready' : 
               aiStatus === 'error' ? 'Error' : 'Idle'}
            </span>
          </div>
        </div>
        <CardDescription>
          AI-powered recommendations for optimal helper/responder assignment
        </CardDescription>
        {lastUpdate && (
          <div className="text-xs text-gray-400">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {!currentSOSEvent ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Select an SOS event to get AI recommendations
            </AlertDescription>
          </Alert>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2">Analyzing optimal assignments...</span>
          </div>
        ) : aiStatus === 'error' ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to generate AI recommendations. Please try again.
            </AlertDescription>
          </Alert>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All ({recommendations.length})</TabsTrigger>
              <TabsTrigger value="helpers">
                Helpers ({recommendations.filter(r => r.type === 'helper').length})
              </TabsTrigger>
              <TabsTrigger value="responders">
                Responders ({recommendations.filter(r => r.type === 'responder').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-4">
              {recommendations.slice(0, 5).map((recommendation) => (
                <RecommendationCard
                  key={recommendation.id}
                  recommendation={recommendation}
                  onAssign={handleAssign}
                />
              ))}
            </TabsContent>

            <TabsContent value="helpers" className="space-y-4 mt-4">
              {recommendations
                .filter(r => r.type === 'helper')
                .slice(0, 5)
                .map((recommendation) => (
                  <RecommendationCard
                    key={recommendation.id}
                    recommendation={recommendation}
                    onAssign={handleAssign}
                  />
                ))}
            </TabsContent>

            <TabsContent value="responders" className="space-y-4 mt-4">
              {recommendations
                .filter(r => r.type === 'responder')
                .slice(0, 5)
                .map((recommendation) => (
                  <RecommendationCard
                    key={recommendation.id}
                    recommendation={recommendation}
                    onAssign={handleAssign}
                  />
                ))}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

interface RecommendationCardProps {
  recommendation: AIRecommendation;
  onAssign: (recommendation: AIRecommendation) => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation, onAssign }) => {
  const entity = recommendation.entity;
  const isHelper = recommendation.type === 'helper';

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={entity.avatar} />
              <AvatarFallback>
                {entity.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold">{entity.name}</h4>
                <Badge variant={isHelper ? 'secondary' : 'default'}>
                  {isHelper ? 'Helper' : 'Responder'}
                </Badge>
                <div className={`w-2 h-2 rounded-full ${getPriorityColor(recommendation.priority)}`} />
              </div>
              
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{(recommendation.distance / 1000).toFixed(1)}km</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{recommendation.eta}min</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3" />
                  <span>{recommendation.successRate.toFixed(0)}%</span>
                </div>
              </div>

              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>AI Score</span>
                  <span>{recommendation.score.toFixed(0)}%</span>
                </div>
                <Progress value={recommendation.score} className="h-2" />
              </div>

              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Current Load</span>
                  <span>{recommendation.currentLoad}%</span>
                </div>
                <Progress value={recommendation.currentLoad} className="h-2" />
              </div>

              <div className="mt-2">
                <p className="text-xs text-gray-600 font-medium">AI Reasoning:</p>
                <ul className="text-xs text-gray-500 mt-1 space-y-1">
                  {recommendation.reasoning.slice(0, 3).map((reason, index) => (
                    <li key={index} className="flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => onAssign(recommendation)}
            className="ml-4"
          >
            <Zap className="h-4 w-4 mr-1" />
            Assign
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
}; 