import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, X } from 'lucide-react';
import { Viewer, SkyBox, Color, createWorldImagery, ImageryStyle } from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

interface GlobeViewProps {
  isVisible: boolean;
  onClose: () => void;
}

const CesiumGlobe: React.FC = () => {
  const cesiumContainer = React.useRef<HTMLDivElement>(null);
  const viewerRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (cesiumContainer.current && !viewerRef.current) {
      // @ts-ignore
      viewerRef.current = new Viewer(cesiumContainer.current, {
        animation: false,
        timeline: false,
        baseLayerPicker: false,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        navigationHelpButton: false,
        infoBox: false,
        fullscreenButton: false,
      });
    }
    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  return <div ref={cesiumContainer} style={{ width: '100%', height: '100%' }} />;
};

const GlobeView: React.FC<GlobeViewProps> = ({ isVisible, onClose }) => {
  const cesiumContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && cesiumContainerRef.current) {
      // Prevent multiple instances
      if (cesiumContainerRef.current.children.length > 0) {
        return;
      }

      const viewer = new Viewer(cesiumContainerRef.current, {
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        navigationHelpButton: false,
        skyAtmosphere: true,
        skyBox: new SkyBox({
          sources: {
            positiveX: '/path/to/posx.png',
            negativeX: '/path/to/negx.png',
            positiveY: '/path/to/posy.png',
            negativeY: '/path/to/negy.png',
            positiveZ: '/path/to/posz.png',
            negativeZ: '/path/to/negz.png'
          }
        }),
      });

      // Add a dark space background
      viewer.scene.backgroundColor = Color.BLACK;

      // Add stars
      const stars = viewer.scene.primitives.add(createWorldImagery({
        style: ImageryStyle.AERIAL_WITH_LABELS
      }));

      // Clean up on unmount
      return () => {
        viewer.destroy();
      };
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="w-full h-full">
      <div ref={cesiumContainerRef} className="w-full h-full" />
      <Button
        onClick={onClose}
        className="absolute top-24 right-4 z-50 bg-red-500/20 hover:bg-red-500/30 text-red-300"
      >
        Return to Map
      </Button>
    </div>
  );
};

export default GlobeView;
