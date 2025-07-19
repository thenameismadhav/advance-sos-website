
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AdminPanelSection = () => {
  const navigate = useNavigate();

  const handleAdminDemo = () => {
    navigate('/admin');
  };
  
  return (
    <section id="admin" className="py-24 bg-black relative overflow-hidden">
      {/* Background elements - enhanced for more visibility */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(46,91,255,0.25),transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>
      
      <div className="section-container relative z-10 text-center">
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Admin Panel</span>
          </h2>
          <div className="w-20 h-1 bg-sos-red mx-auto mb-6"></div>
          <p className="text-sos-lightgray max-w-2xl mx-auto text-lg">
            A powerful command center for emergency response coordination and management
          </p>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="mt-8">
            <Button 
              className="bg-sos-blue hover:bg-sos-blue/90 text-white"
              onClick={handleAdminDemo}
            >
              View Admin Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminPanelSection;
