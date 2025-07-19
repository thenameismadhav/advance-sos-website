
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Clock, Users, MapPin, X } from 'lucide-react';

interface AnalyticsDashboardProps {
  isVisible: boolean;
  onClose: () => void;
}

const AnalyticsDashboard = ({ isVisible, onClose }: AnalyticsDashboardProps) => {
  const sosVolumeData = [
    { day: 'Mon', alerts: 12 },
    { day: 'Tue', alerts: 19 },
    { day: 'Wed', alerts: 8 },
    { day: 'Thu', alerts: 15 },
    { day: 'Fri', alerts: 22 },
    { day: 'Sat', alerts: 18 },
    { day: 'Sun', alerts: 14 },
  ];

  const responseTimeData = [
    { time: '00:00', avgTime: 3.2 },
    { time: '06:00', avgTime: 2.8 },
    { time: '12:00', avgTime: 4.1 },
    { time: '18:00', avgTime: 3.9 },
  ];

  const demographicData = [
    { name: 'Male 18-30', value: 35, color: '#66fcf1' },
    { name: 'Female 18-30', value: 28, color: '#FF3A46' },
    { name: 'Male 30-50', value: 22, color: '#FFD700' },
    { name: 'Female 30-50', value: 15, color: '#90EE90' },
  ];

  if (!isVisible) return null;

  return (
    <div className="overlay-container bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden bg-gray-900 border-sos-cyan/30">
        <CardHeader className="border-b border-sos-cyan/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sos-cyan flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Analytics Dashboard
            </CardTitle>
            <Button 
              onClick={onClose}
              variant="ghost" 
              className="text-sos-cyan hover:bg-sos-cyan/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 overflow-y-auto max-h-[70vh]">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800">
              <TabsTrigger value="overview" className="text-white data-[state=active]:bg-sos-cyan data-[state=active]:text-black">Overview</TabsTrigger>
              <TabsTrigger value="performance" className="text-white data-[state=active]:bg-sos-cyan data-[state=active]:text-black">Performance</TabsTrigger>
              <TabsTrigger value="demographics" className="text-white data-[state=active]:bg-sos-cyan data-[state=active]:text-black">Demographics</TabsTrigger>
              <TabsTrigger value="regions" className="text-white data-[state=active]:bg-sos-cyan data-[state=active]:text-black">Regions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gray-800 border-sos-cyan/30">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-sos-cyan">1,208</div>
                    <p className="text-gray-400 text-sm">Total SOS Alerts</p>
                    <p className="text-green-400 text-xs">+12% from last week</p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800 border-sos-cyan/30">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-sos-cyan">3.2min</div>
                    <p className="text-gray-400 text-sm">Avg Response Time</p>
                    <p className="text-red-400 text-xs">+0.3min from last week</p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800 border-sos-cyan/30">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-sos-cyan">94.7%</div>
                    <p className="text-gray-400 text-sm">Success Rate</p>
                    <p className="text-green-400 text-xs">+2.1% from last week</p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800 border-sos-cyan/30">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-sos-cyan">247</div>
                    <p className="text-gray-400 text-sm">Active Helpers</p>
                    <p className="text-green-400 text-xs">+15 new this week</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gray-800 border-sos-cyan/30">
                <CardHeader>
                  <CardTitle className="text-white">Weekly SOS Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sosVolumeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="day" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #66fcf1', 
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }} 
                      />
                      <Bar dataKey="alerts" fill="#66fcf1" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <Card className="bg-gray-800 border-sos-cyan/30">
                <CardHeader>
                  <CardTitle className="text-white">Response Time Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={responseTimeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="time" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #66fcf1', 
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }} 
                      />
                      <Line type="monotone" dataKey="avgTime" stroke="#66fcf1" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="demographics" className="space-y-4">
              <Card className="bg-gray-800 border-sos-cyan/30">
                <CardHeader>
                  <CardTitle className="text-white">User Demographics</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={demographicData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label
                      >
                        {demographicData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #66fcf1', 
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="regions" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gray-800 border-sos-cyan/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-sos-cyan" />
                      High Activity Regions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">New York City</span>
                      <span className="text-sos-cyan font-bold">124 alerts</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Los Angeles</span>
                      <span className="text-sos-cyan font-bold">98 alerts</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Chicago</span>
                      <span className="text-sos-cyan font-bold">76 alerts</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-sos-cyan/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Clock className="h-5 w-5 text-sos-cyan" />
                      Fastest Response Times
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">San Francisco</span>
                      <span className="text-green-400 font-bold">1.8 min</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Boston</span>
                      <span className="text-green-400 font-bold">2.1 min</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Seattle</span>
                      <span className="text-green-400 font-bold">2.4 min</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
