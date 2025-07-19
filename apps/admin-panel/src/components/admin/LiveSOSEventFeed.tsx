import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const eventTypes = [
  { type: 'MEDICAL', color: 'text-blue-400' },
  { type: 'FIRE', color: 'text-orange-400' },
  { type: 'SECURITY', color: 'text-red-400' },
  { type: 'SYSTEM', color: 'text-purple-400' },
];

const locations = ['Sector 4', 'Downtown', 'North Bridge', 'Power Plant', 'Sub-level 3'];

const generateEvent = () => {
  const event = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  const location = locations[Math.floor(Math.random() * locations.length)];
  return {
    id: Date.now() + Math.random(),
    ...event,
    location,
    timestamp: new Date().toLocaleTimeString(),
  };
};

const LiveSOSEventFeed: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    setEvents(Array.from({ length: 5 }, generateEvent));
    const interval = setInterval(() => {
      setEvents(prev => [generateEvent(), ...prev.slice(0, 4)]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-2 h-full overflow-hidden">
      <div className="flex flex-col-reverse">
        {events.map((event) => (
          <motion.div
            key={event.id}
            layout
            initial={{ opacity: 0, y: 50, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="flex justify-between items-center py-2 border-b border-hud-border/50 text-sm"
          >
            <span className={`font-bold ${event.color}`}>{`[${event.type}]`}</span>
            <span className="text-hud-text-primary">{event.location}</span>
            <span className="text-hud-text-secondary">{event.timestamp}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LiveSOSEventFeed;
