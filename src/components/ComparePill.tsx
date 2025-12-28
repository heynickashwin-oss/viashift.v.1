/**
 * ComparePill.tsx
 * 
 * Tactile pill that appears below nodes after animation.
 * Invites users to explore stakeholder perspectives via drawer.
 * 
 * Design principles:
 * - Clear affordance (looks clickable without being shouty)
 * - Matches global interactive element pattern
 * - Fades in as "the only new thing" after animation
 */

import { memo } from 'react';

export interface ComparePillProps {
  /** Number of stakeholder perspectives available */
  lensCount: number;
  
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
  lensCount,
  visible,
  onClick,
  position,
  accentColor = '#00e5ff',
}: ComparePillProps) => {
  if (lensCount === 0) return null;
  
  return (
    <button
      onClick={onClick}
      className="absolute transition-all duration-500 ease-out group cursor-pointer"
      style={{
        left: position.x,
        top: position.y,
        transform: `translateX(-50%) translateY(${visible ? 0 : -8}px)`,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      {/* Main pill container - global interactive element pattern */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 group-hover:-translate-y-0.5"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Compare text */}
        <span
          className="text-xs font-medium transition-colors duration-300 group-hover:text-white"
          style={{
            color: 'rgba(255, 255, 255, 0.6)',
          }}
        >
          Compare Lenses
        </span>
        
        {/* Chevron indicator - signals clickability */}
        <span
          className="text-xs transition-all duration-300 group-hover:translate-x-0.5"
          style={{
            color: 'rgba(255, 255, 255, 0.4)',
          }}
        >
          →
        </span>
      </div>
      
      {/* Hover state glow */}
      <div
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none -z-10"
        style={{
          background: `radial-gradient(ellipse at center, ${accentColor}20 0%, transparent 70%)`,
          transform: 'scale(1.5)',
          filter: 'blur(8px)',
        }}
      />
      
      {/* Hover border enhancement */}
      <div
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"
        style={{
          border: `1px solid ${accentColor}50`,
          boxShadow: `0 4px 16px ${accentColor}20`,
        }}
      />
    </button>
  );
});

ComparePill.displayName = 'ComparePill';

export default ComparePill;