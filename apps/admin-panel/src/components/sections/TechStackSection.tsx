
import React from 'react';

const technologies = [
  {
    name: 'Flutter',
    description: 'Mobile App Development',
    icon: '📱'
  },
  {
    name: 'Supabase',
    description: 'Realtime DB & Backend Services',
    icon: '🚀'
  },
  {
    name: 'Mapbox',
    description: 'Interactive Maps & Navigation',
    icon: '🗺️'
  },
  {
    name: 'WebSockets',
    description: 'Real-time Communication',
    icon: '📡'
  },
  {
    name: 'JWT Authentication',
    description: 'Secure User Management',
    icon: '🔐'
  },
  {
    name: 'React & TypeScript',
    description: 'Modern Web Development',
    icon: '⚛️'
  }
];

const TechStackSection = () => {
  return (
    <section id="tech" className="py-16 bg-gradient-to-b from-black to-sos-darkgray relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        {/* Code-like background */}
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="text-xs font-mono text-sos-blue" style={{ 
              position: 'absolute',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 90 - 45}deg)`
            }}>
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j}>
                  {'{'}function handleSOS(location) {'{'}alert(emergency){'}'}{'}'} 
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      <div className="section-container relative z-10">
        <div className="flex flex-col items-center mb-16 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Tech Stack</span>
          </h2>
          <div className="w-20 h-1 bg-sos-blue mb-6"></div>
          <p className="text-sos-lightgray max-w-2xl text-lg">
            Built with cutting-edge technologies to ensure reliability, speed, and security in emergency situations
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {technologies.map((tech, index) => (
            <div 
              key={tech.name}
              className="relative bg-gradient-to-br from-sos-darkgray to-black p-6 rounded-xl border border-gray-800 hover:border-sos-blue/50 group transition-all"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-sos-blue/10 rounded-lg text-2xl">
                  {tech.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-sos-blue transition-colors">
                    {tech.name}
                  </h3>
                  <p className="text-sos-lightgray">
                    {tech.description}
                  </p>
                </div>
              </div>
              
              {/* Glow effect */}
              <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-sos-blue to-sos-blue opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-md"></div>
            </div>
          ))}
        </div>
        
        <div className="mt-10">
          <div className="inline-block bg-sos-darkgray glass-effect p-5 rounded-xl">
            <p className="text-sos-lightgray">
              Our technology stack is continuously evolving to incorporate the latest advancements 
              in emergency response systems and real-time communications.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechStackSection;
