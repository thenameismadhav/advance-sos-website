import React from 'react';
import { motion } from 'framer-motion';
import './RadarScan.css';

interface RadarScanProps {
  isVisible: boolean;
}

const RadarScan: React.FC<RadarScanProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <motion.div
      className="radar-container"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.5 }}
    >
      <div className="radar-pulse"></div>
      <div className="radar-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="radar-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="radar-sweep"></div>
      <div className="radar-grid radar-grid-1"></div>
      <div className="radar-grid radar-grid-2"></div>
      <div className="radar-center-dot"></div>
    </motion.div>
  );
};

export default RadarScan; 