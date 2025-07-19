
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

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
    navigate('/admin');
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
