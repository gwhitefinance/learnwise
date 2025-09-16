
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import shopItems from '@/lib/shop-items.json';

interface AIBuddyProps {
  className?: string;
  colorName?: string;
  hatName?: string;
  isThinking?: boolean;
}

const AIBuddy = ({ className, colorName = 'Default', hatName = 'None', isThinking = false }: AIBuddyProps) => {
  const robotColor = shopItems.colors.find(c => c.name === colorName)?.hex || '#4f4f4f';
  const RobotHat = shopItems.hats.find(h => h.name === hatName)?.component;

  return (
    <div className={cn("relative w-64 h-64", className)}>
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Shadow */}
        <ellipse cx="100" cy="180" rx="60" ry="10" fill="rgba(0,0,0,0.2)" />

        {/* Body */}
        <defs>
          <radialGradient id="bodyGradient" cx="0.5" cy="0.5" r="0.7">
            <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="80" fill={robotColor} />
        <circle cx="100" cy="100" r="80" fill="url(#bodyGradient)" />

        {/* Eye Visor */}
        <rect x="40" y="75" width="120" height="50" rx="25" fill="#222" />
        <rect x="42" y="77" width="116" height="46" rx="23" fill="#111" />
        
        {/* Eye */}
        <g>
           <rect x="55" y="85" width="90" height="30" rx="15" fill="#3B82F6" />
           {isThinking && <rect x="55" y="85" width="90" height="30" rx="15" fill="rgba(255,255,255,0.3)" className="animate-pulse" />}
        </g>
        
         {/* Hat */}
        {RobotHat && (
          <foreignObject x="30" y="-20" width="140" height="140">
            <div dangerouslySetInnerHTML={{ __html: RobotHat }} />
          </foreignObject>
        )}

      </svg>
    </div>
  );
};

export default AIBuddy;

    