
import React from 'react';
import { Bell, MapPin, Users, Lock, Clock, Shield } from 'lucide-react';

const featureData = [
  {
    icon: Bell,
    color: 'bg-sos-red',
    title: 'One-Tap SOS Trigger',
    description: 'Instantly alerts nearby helpers, responders, and emergency contacts with a single tap.'
  },
  {
    icon: MapPin,
    color: 'bg-blue-500',
    title: 'Live Location Tracking',
    description: 'Real-time GPS tracking of user and helper movements with continuous updates.'
  },
  {
    icon: Users,
    color: 'bg-amber-500',
    title: 'Community Safety Groups',
    description: 'Private groups where trusted users get notified together during emergencies.'
  },
  {
    icon: Clock,
    color: 'bg-purple-600',
    title: 'Hospital Notification System',
    description: 'Notifies nearest hospital during an accident for immediate preparation and response.'
  },
  {
    icon: Lock,
    color: 'bg-rose-600',
    title: 'Secure PIN Cancel & Lockdown',
    description: '20-second buffer, camera/audio recording, and phone lockdown for maximum security.'
  },
  {
    icon: Shield,
    color: 'bg-emerald-600',
    title: 'Emergency Response Network',
    description: 'Connect with verified first responders and emergency services in your area.'
  }
];

const FeatureCard = ({ feature, index }: { feature: typeof featureData[0], index: number }) => (
  <div 
    className="feature-card group"
    style={{ animationDelay: `${index * 150}ms` }}
  >
    <div className={`feature-icon ${feature.color}`}>
      <feature.icon className="w-6 h-6" />
    </div>
    <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-sos-red transition-colors">
      {feature.title}
    </h3>
    <p className="text-sos-lightgray">
      {feature.description}
    </p>
    
    {/* Glow effect */}
    <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-sos-red via-sos-blue to-sos-red opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-md"></div>
  </div>
);

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-sos-dark relative">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-sos-blue/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-sos-red/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="section-container relative z-10">
        <div className="flex flex-col items-center mb-16 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Core Features</span>
          </h2>
          <div className="w-20 h-1 bg-sos-red mb-6"></div>
          <p className="text-sos-lightgray max-w-2xl text-lg">
            Discover the powerful capabilities that make Advance SOS the most comprehensive emergency response system available.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6">
          {featureData.map((feature, index) => (
            <div key={feature.title} className="w-full md:w-80 lg:w-96">
              <FeatureCard feature={feature} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
