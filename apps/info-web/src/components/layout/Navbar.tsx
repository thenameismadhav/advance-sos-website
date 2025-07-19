
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const goToAdmin = () => {
    if (import.meta.env.DEV) {
      // In development, open admin panel in a new tab on port 8081
      window.open('http://localhost:8081', '_blank');
    } else {
      // In production, navigate to /admin route
      window.location.href = '/admin';
    }
  };

  return (
    <header 
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled ? "bg-black/80 backdrop-blur-md py-3 shadow-lg" : "bg-transparent py-5"
      )}
    >
      <div className="container flex items-center justify-between">
        <div className="flex items-center">
          <div className="text-sos-red font-bold text-2xl tracking-tight flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <span className="text-white">Advance</span>
            <span className="ml-1">SOS</span>
          </div>
        </div>
        <nav className="hidden md:flex space-x-6 text-sm">
          <a href="#features" className="text-white hover:text-sos-red transition-colors">Features</a>
          <a href="#tech" className="text-white hover:text-sos-red transition-colors">Tech Stack</a>
          <a href="#vision" className="text-white hover:text-sos-red transition-colors">Vision</a>
          <button 
            onClick={goToAdmin}
            className="text-white hover:text-sos-red transition-colors"
          >
            Admin Panel
          </button>
        </nav>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-white">
            <User className="h-4 w-4" />
            <span className="hidden sm:block">Admin</span>
            <span className="bg-sos-red text-white text-xs px-2 py-1 rounded-full">
              ADMIN
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="text-white border-sos-red hover:bg-sos-red hover:text-white transition-colors"
            onClick={goToAdmin}
          >
            Admin Panel
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
