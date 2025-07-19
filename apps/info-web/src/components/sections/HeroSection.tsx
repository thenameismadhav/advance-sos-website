
import React from 'react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-b from-black to-sos-darkgray pt-16">
      {/* Background elements */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        <div className="absolute w-96 h-96 rounded-full bg-sos-blue/20 blur-3xl -top-20 -left-20"></div>
        <div className="absolute w-96 h-96 rounded-full bg-sos-red/10 blur-3xl -bottom-20 -right-20"></div>
        
        {/* Grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      </div>
      
      <div className="container relative z-10 flex flex-col items-center justify-center text-center">
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            <span className="block text-white">Advance SOS – Redefining</span>
            <span className="block bg-gradient-to-r from-sos-red to-sos-blue bg-clip-text text-transparent">Emergency Response</span>
          </h1>
          
          <p className="text-lg text-sos-lightgray mb-10 max-w-2xl mx-auto">
            Experience the smartest, fastest, and most connected SOS system ever built.
            Designed for the future of community safety and rapid emergency response.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-sos-red hover:bg-sos-red/90 text-white px-8 py-6 text-lg rounded-md">
              <a href="#features">Explore Features</a>
            </Button>
            <Button variant="outline" className="border-sos-blue text-sos-blue hover:bg-sos-blue/10 px-8 py-6 text-lg rounded-md">
              Learn More
            </Button>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        <span className="text-sos-lightgray text-sm animate-bounce">Scroll Down</span>
        <svg className="w-6 h-6 mt-1 text-sos-lightgray" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
