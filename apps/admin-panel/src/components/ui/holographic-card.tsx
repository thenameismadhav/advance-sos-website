import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

interface HolographicCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

const HolographicCard: React.FC<HolographicCardProps> = ({ 
  children, 
  className = '', 
  intensity = 1 
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-15, 15]);

  const springConfig = { damping: 20, stiffness: 300 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);
    
    setMousePosition({ x, y });
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
      animate={{
        scale: isHovered ? 1.02 : 1,
        boxShadow: isHovered 
          ? '0 25px 50px -12px rgba(255, 0, 0, 0.25)' 
          : '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Holographic overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-purple-500/20 opacity-0"
        animate={{
          opacity: isHovered ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        style={{
          background: `linear-gradient(45deg, 
            rgba(255, 0, 0, ${0.2 * intensity}) 0%, 
            transparent 50%, 
            rgba(138, 43, 226, ${0.2 * intensity}) 100%)`,
        }}
      />
      
      {/* Animated border */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        style={{
          background: `conic-gradient(from ${mousePosition.x * 360}deg, 
            rgba(255, 0, 0, 0.5), 
            rgba(0, 102, 255, 0.5), 
            rgba(138, 43, 226, 0.5))`,
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          padding: '1px',
        }}
        animate={{
          opacity: isHovered ? 1 : 0.3,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 p-6"
        style={{
          transform: 'translateZ(50px)',
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </motion.div>

      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-xl opacity-0"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, 
            rgba(255, 0, 0, 0.3) 0%, 
            transparent 50%)`,
        }}
        animate={{
          opacity: isHovered ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default HolographicCard; 