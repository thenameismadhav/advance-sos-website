import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface HudPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const HudPanel = React.forwardRef<HTMLDivElement, HudPanelProps>(
  ({ className, children, title, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          'bg-black/50 backdrop-blur-sm border border-hud-border p-4 pt-8 relative', // extra top padding
          'shadow-[0_0_15px_rgba(0,246,255,0.2)]',
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        {...props}
      >
        {/* Corner brackets */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-hud-cyan"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-hud-cyan"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-hud-cyan"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-hud-cyan"></div>
        {title && (
          <div className="absolute -top-5 left-6 z-20 px-2">
            <h3 className="text-xs uppercase tracking-widest text-hud-cyan bg-hud-background px-3 py-1 rounded shadow border border-hud-border">
              {title}
            </h3>
          </div>
        )}
        <div className="w-full h-full">
          {children}
        </div>
      </motion.div>
    );
  }
);

HudPanel.displayName = 'HudPanel';

export default HudPanel; 