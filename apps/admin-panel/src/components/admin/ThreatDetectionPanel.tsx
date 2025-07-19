import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ThreatItem = ({ threat, level, location }: { threat: string; level: 'High' | 'Medium' | 'Low'; location: string }) => {
  const levelColor = {
    High: 'text-red-500',
    Medium: 'text-yellow-500',
    Low: 'text-green-500',
  }[level];

  return (
    <motion.div
      className="flex justify-between items-center py-2 border-b border-hud-border/50 text-sm"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <span className="text-hud-text-secondary">{threat}</span>
      <span className="text-hud-text-primary">{location}</span>
      <span className={`font-bold ${levelColor}`}>{level}</span>
    </motion.div>
  );
};

const ThreatDetectionPanel: React.FC = () => {
  const threats = [
    { threat: 'Anomalous Signal', level: 'Medium', location: 'Sector 7G' },
    { threat: 'Cyber Attack', level: 'High', location: 'Mainframe' },
    { threat: 'UAV Intrusion', level: 'Low', location: 'Perimeter' },
    { threat: 'Power Surge', level: 'Medium', location: 'Grid B' },
  ];

  return (
    <div className="p-2 h-full">
      {threats.map((t, i) => (
        <ThreatItem key={i} {...t} />
      ))}
    </div>
  );
};

export default ThreatDetectionPanel;
