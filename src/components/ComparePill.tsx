/**
 * ComparePill.tsx
 * 
 * Small, tactile pill that appears below nodes after narrative completes.
 * Shows stakeholder perspective count, invites click to open drawer.
 * 
 * Design principles:
 * - Understated until hovered (premium feel)
 * - Matches toggle card styling
 * - Fades in as "the only new thing" after animation
 */

import { memo } from 'react';

export interface ComparePillProps {
  /** Number of stakeholder perspectives available */
  viewCount: number;
  
  /** Whether the pill is visible (fades in after animation) */
  visible: boolean;
  
  /** Click handler to open comparison drawer */
  onClick: () => void;
  
  /** Position relative to node */
  position: {
    x: number;
    y: number;
  };
  
  /** Optional: accent color for hover state */
  accentColor?: string;
}

export const ComparePill = memo(({
  viewCount,
  visible,
  onClick,
  position,
  accentColor = '#00e5ff',
}: ComparePillProps) => {
  if (viewCount === 0) return null;
  
  return (
    <button
      onClick={onClick}
      className="absolute transition-all duration-500 ease-out group"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translateX(-50%)',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all duration-300"
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        }}
      >
        {/* Indicator dot */}
        <span
          className="w-1.5 h-1.5 rounded-full transition-all duration-300 group-hover:scale-125"
          style={{
            background: `rgba(255, 255, 255, 0.4)`,
          }}
        />
        
        {/* View count text */}
        <span
          className="text-xs font-medium transition-colors duration-300"
          style={{
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          {viewCount} {viewCount === 1 ? 'view' : 'views'}
        </span>
      </div>
      
      {/* Hover state overlay */}
      <div
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${accentColor}15 0%, ${accentColor}08 100%)`,
          border: `1px solid ${accentColor}40`,
          boxShadow: `0 4px 16px ${accentColor}15`,
        }}
      />
      
      {/* Hover text color change */}
      <style>{`
        .group:hover .compare-pill-dot {
          background: ${accentColor};
        }
        .group:hover .compare-pill-text {
          color: ${accentColor};
        }
      `}</style>
    </button>
  );
});

ComparePill.displayName = 'ComparePill';

export default ComparePill;
