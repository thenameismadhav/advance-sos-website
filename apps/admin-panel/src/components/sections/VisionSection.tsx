
import React from 'react';
import { Button } from '@/components/ui/button';

const VisionSection = () => {
  return (
    <section id="vision" className="py-20 bg-black relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_800px_at_100%_200px,rgba(255,58,70,0.1),transparent)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_800px_at_0%_70%,rgba(46,91,255,0.1),transparent)]"></div>
      </div>
      
      <div className="section-container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-10">
            <div className="p-1 rounded-full bg-gradient-to-r from-sos-red via-sos-blue to-sos-red">
              <div className="bg-sos-darkgray rounded-full px-6 py-2">
                <span className="text-white font-semibold">Our Vision</span>
              </div>
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              A Future Where Every Emergency Has an Instant Response
            </span>
          </h2>
          
          <div className="relative mb-12">
            <div className="absolute -left-12 top-0 text-6xl text-sos-red opacity-30">"</div>
            <p className="text-sos-lightgray text-lg md:text-xl italic relative z-10">
              Advance SOS is designed for the future – a connected, community-driven, 
              real-time safety network that empowers citizens and authorities to respond 
              faster and smarter.
            </p>
            <div className="absolute -right-12 bottom-0 text-6xl text-sos-red opacity-30">"</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="bg-gradient-to-br from-sos-darkgray to-black p-6 rounded-xl border border-gray-800">
              <div className="w-14 h-14 rounded-full bg-sos-red/10 text-sos-red flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Speed</h3>
              <p className="text-sos-lightgray">
                Reducing response time from minutes to seconds when every moment matters.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-sos-darkgray to-black p-6 rounded-xl border border-gray-800">
              <div className="w-14 h-14 rounded-full bg-sos-blue/10 text-sos-blue flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Community</h3>
              <p className="text-sos-lightgray">
                Building networks of trusted helpers and responders in every community.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-sos-darkgray to-black p-6 rounded-xl border border-gray-800">
              <div className="w-14 h-14 rounded-full bg-purple-600/10 text-purple-600 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Innovation</h3>
              <p className="text-sos-lightgray">
                Continuously evolving with cutting-edge technology for better outcomes.
              </p>
            </div>
          </div>
          
          <div className="mt-16">
            <Button className="bg-gradient-to-r from-sos-red to-sos-blue hover:opacity-90 text-white px-8 py-6 text-lg rounded-md">
              Join Our Mission
            </Button>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute left-4 bottom-4 w-24 h-24 border border-sos-red/20 rounded-full"></div>
      <div className="absolute right-8 top-8 w-16 h-16 border border-sos-blue/20 rounded-full"></div>
    </section>
  );
};

export default VisionSection;
