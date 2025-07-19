import React, { useState, useEffect } from 'react';
import { GeospatialService } from '@/lib/services/geospatial';
import { Zone } from '@/types/geospatial';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  MapPin, 
  Calendar,
  User,
  Layers,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface ZoneManagementPanelProps {
  onZoneSelect?: (zone: Zone) => void;
  onZoneUpdate?: (zone: Zone) => void;
  onZoneDelete?: (zoneId: string) => void;
}

export const ZoneManagementPanel: React.FC<ZoneManagementPanelProps> = ({
  onZoneSelect,
  onZoneUpdate,
  onZoneDelete,
}) => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Form state for create/edit
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'polygon' as 'polygon' | 'circle' | 'rectangle',
    color: '#ff0000',
    opacity: 0.3,
  });

  // Load zones on component mount
  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    try {
      setLoading(true);
      const { zones: loadedZones, error } = await GeospatialService.getZones();
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to load zones",
          variant: "destructive",
        });
        return;
      }

      setZones(loadedZones);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load zones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateZone = async () => {
    try {
      // For now, we'll create a sample zone since we need GeoJSON data
      // In a real implementation, this would come from the map drawing
      const sampleGeoJSON = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[73.15, 22.30], [73.18, 22.30], [73.18, 22.33], [73.15, 22.33], [73.15, 22.30]]]
        },
        properties: {}
      };

      const zoneData = {
        name: formData.name,
        description: formData.description,
        geojson: sampleGeoJSON,
        type: formData.type,
        color: formData.color,
        opacity: formData.opacity,
        created_by: 'current-user-id', // Get from auth
        is_active: true,
      };

      const { zone, error } = await GeospatialService.createZone(zoneData);
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to create zone",
          variant: "destructive",
        });
        return;
      }

      if (zone) {
        setZones(prev => [zone, ...prev]);
        setIsCreateDialogOpen(false);
        resetForm();
        toast({
          title: "Success",
          description: "Zone created successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create zone",
        variant: "destructive",
      });
    }
  };

  const handleUpdateZone = async () => {
    if (!selectedZone) return;

    try {
      const updates = {
        name: formData.name,
        description: formData.description,
        color: formData.color,
        opacity: formData.opacity,
      };

      const { zone, error } = await GeospatialService.updateZone(selectedZone.id, updates);
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to update zone",
          variant: "destructive",
        });
        return;
      }

      if (zone) {
        setZones(prev => prev.map(z => z.id === zone.id ? zone : z));
        setIsEditDialogOpen(false);
        resetForm();
        onZoneUpdate?.(zone);
        toast({
          title: "Success",
          description: "Zone updated successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update zone",
        variant: "destructive",
      });
    }
  };

  const handleDeleteZone = async (zoneId: string) => {
    if (!confirm('Are you sure you want to delete this zone?')) return;

    try {
      const { error } = await GeospatialService.deleteZone(zoneId);
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete zone",
          variant: "destructive",
        });
        return;
      }

      setZones(prev => prev.filter(z => z.id !== zoneId));
      onZoneDelete?.(zoneId);
      toast({
        title: "Success",
        description: "Zone deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete zone",
        variant: "destructive",
      });
    }
  };

  const handleEditZone = (zone: Zone) => {
    setSelectedZone(zone);
    setFormData({
      name: zone.name,
      description: zone.description || '',
      type: zone.type,
      color: zone.color,
      opacity: zone.opacity,
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'polygon',
      color: '#ff0000',
      opacity: 0.3,
    });
    setSelectedZone(null);
  };

  // Filter zones
  const filteredZones = zones.filter(zone => {
    const matchesType = filterType === 'all' || zone.type === filterType;
    const matchesSearch = zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (zone.description && zone.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const getZoneTypeIcon = (type: string) => {
    switch (type) {
      case 'polygon':
        return <Layers className="w-4 h-4" />;
      case 'circle':
        return <MapPin className="w-4 h-4" />;
      case 'rectangle':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const getZoneTypeColor = (type: string) => {
    switch (type) {
      case 'polygon':
        return 'bg-blue-500';
      case 'circle':
        return 'bg-green-500';
      case 'rectangle':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Zone Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">Loading zones...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Zone Management
          </CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Zone
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Zone</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Zone Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter zone name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter zone description"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'polygon' | 'circle' | 'rectangle') => 
                      setFormData(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="polygon">Polygon</SelectItem>
                      <SelectItem value="circle">Circle</SelectItem>
                      <SelectItem value="rectangle">Rectangle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Color</label>
                  <Input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Opacity</label>
                  <Input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.opacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
                  />
                  <span className="text-xs text-gray-500">{formData.opacity}</span>
                </div>
                <Button onClick={handleCreateZone} className="w-full">
                  Create Zone
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Filters */}
        <div className="flex gap-2 mt-4">
          <Input
            placeholder="Search zones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="polygon">Polygon</SelectItem>
              <SelectItem value="circle">Circle</SelectItem>
              <SelectItem value="rectangle">Rectangle</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {filteredZones.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No zones found
            </div>
          ) : (
            filteredZones.map((zone) => (
              <div
                key={zone.id}
                className="flex items-center justify-between p-3 border border-gray-700 rounded-lg hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-2 rounded ${getZoneTypeColor(zone.type)}`}>
                    {getZoneTypeIcon(zone.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-white">{zone.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {zone.type}
                      </Badge>
                    </div>
                    {zone.description && (
                      <p className="text-sm text-gray-400 mt-1">{zone.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(zone.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {zone.created_by}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onZoneSelect?.(zone)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditZone(zone)}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteZone(zone.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Zone</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Zone Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter zone name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter zone description"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Color</label>
              <Input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Opacity</label>
              <Input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={formData.opacity}
                onChange={(e) => setFormData(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
              />
              <span className="text-xs text-gray-500">{formData.opacity}</span>
            </div>
            <Button onClick={handleUpdateZone} className="w-full">
              Update Zone
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}; 