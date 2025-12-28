/**
 * NodeHoverCard.tsx
 * 
 * Consolidated hover card for Sankey nodes (steps).
 * Shows key info + actions on hover, replacing scattered labels/pills.
 * 
 * Appears on hover, positioned to the right of the node.
 * Contains: step name, primary metric, feedback buttons, compare CTA.
 */

import { memo } from 'react';

export interface NodeHoverCardProps {
  /** Node/step name */
  name: string;
  
  /** Primary metric to display (e.g., "$3,808/week") */
  metric?: string;
  
  /** Whether card is visible */
  visible: boolean;
  
  /** Position relative to container */
  position: {
    x: number;
    y: number;
  };
  
  /** Accent color for the current lens */
  accentColor?: string;
  
  /** Whether this node has comparison data */
  hasComparison?: boolean;
  
  /** Callback when Compare is clicked */
  onCompareClick?: () => void;
  
  /** Callback for thumbs up */
  onThumbsUp?: () => void;
  
  /** Callback for thumbs down */
  onThumbsDown?: () => void;
}

export const NodeHoverCard = memo(({
  name,
  metric,
  visible,
  position,
  accentColor = '#00e5ff',
  hasComparison = false,
  onCompareClick,
  onThumbsUp,
  onThumbsDown,
}: NodeHoverCardProps) => {
  
  return (
    <div
      className="absolute z-30 pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translateY(-50%)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.2s ease-out',
      }}
    >
      <div
        className="pointer-events-auto rounded-lg backdrop-blur-xl"
        style={{
          background: 'rgba(15, 15, 20, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.5)',
          minWidth: '180px',
        }}
      >
        {/* Header: Step name */}
        <div 
          className="px-3 py-2 border-b"
          style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
        >
          <span 
            className="text-sm font-semibold"
            style={{ color: 'rgba(255, 255, 255, 0.95)' }}
          >
            {name}
          </span>
        </div>
        
        {/* Metric (if present) */}
        {metric && (
          <div className="px-3 py-2">
            <span 
              className="text-lg font-bold"
              style={{ color: accentColor }}
            >
              {metric}
            </span>
          </div>
        )}
        
        {/* Actions row */}
        <div 
          className="px-3 py-2 flex items-center gap-2 border-t"
          style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
        >
          {/* Feedback buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={onThumbsUp}
              className="w-7 h-7 rounded flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              title="This looks right"
            >
              <span className="text-xs">👍</span>
            </button>
            <button
              onClick={onThumbsDown}
              className="w-7 h-7 rounded flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              title="This needs adjustment"
            >
              <span className="text-xs">👎</span>
            </button>
          </div>
          
          {/* Spacer */}
          <div className="flex-1" />
          
          {/* Compare button (if comparison data exists) */}
          {hasComparison && (
            <button
              onClick={onCompareClick}
              className="flex items-center gap-1.5 px-2 py-1 rounded transition-all duration-200 group"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              <span 
                className="text-xs font-medium transition-colors duration-200 group-hover:text-white"
                style={{ color: 'rgba(255, 255, 255, 0.6)' }}
              >
                Compare
              </span>
              <span 
                className="text-xs transition-transform duration-200 group-hover:translate-x-0.5"
                style={{ color: 'rgba(255, 255, 255, 0.4)' }}
              >
                →
              </span>
            </button>
          )}
        </div>
      </div>
      
      {/* Connector line to node */}
      <div
        className="absolute top-1/2 -left-3 w-3 h-px"
        style={{
          background: `linear-gradient(to right, ${accentColor}60, transparent)`,
          transform: 'translateY(-50%)',
        }}
      />
    </div>
  );
});

NodeHoverCard.displayName = 'NodeHoverCard';

export default NodeHoverCard;