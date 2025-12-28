/**
 * NodeHoverCard.tsx
 * 
 * Consolidated hover card for Sankey nodes (steps).
 * Shows key info + social proof + actions on hover.
 * 
 * Two paths to feedback:
 * 1. Click node directly → feedback modal
 * 2. Hover → see social proof → click Feedback → modal
 * 
 * Social proof creates pull: "Others have weighed in, I should too."
 */

import { memo } from 'react';

export interface SocialProof {
  thumbsUp: number;
  thumbsDown: number;
  comments: number;
}

export interface NodeHoverCardProps {
  /** Node/step name */
  name: string;
  
  /** Primary metric to display (e.g., "$3,808/week") */
  metric?: string;
  
  /** Node type for metric coloring */
  nodeType?: 'default' | 'source' | 'solution' | 'loss' | 'new' | 'revenue' | 'destination';
  
  /** Whether card is visible */
  visible: boolean;
  
  /** Position relative to container */
  position: {
    x: number;
    y: number;
  };
  
  /** Accent color for the current lens */
  accentColor?: string;
  
  /** Social proof - reaction counts */
  socialProof?: SocialProof;
  
  /** Whether this node has comparison data */
  hasComparison?: boolean;
  
  /** Callback when Feedback is clicked */
  onFeedbackClick?: () => void;
  
  /** Callback when Compare is clicked */
  onCompareClick?: () => void;
}

export const NodeHoverCard = memo(({
  name,
  metric,
  nodeType = 'default',
  visible,
  position,
  accentColor = '#00e5ff',
  socialProof,
  hasComparison = false,
  onFeedbackClick,
  onCompareClick,
}: NodeHoverCardProps) => {
  
  const hasSocialProof = socialProof && (
    socialProof.thumbsUp > 0 || 
    socialProof.thumbsDown > 0 || 
    socialProof.comments > 0
  );
  
  // Determine metric color based on node type
  const metricColor = (() => {
    switch (nodeType) {
      case 'loss':
        return '#f87171'; // Red for losses/problems
      case 'revenue':
      case 'solution':
      case 'new':
        return '#4ade80'; // Green for positive outcomes
      default:
        return 'rgba(255, 255, 255, 0.9)'; // White for neutral
    }
  })();
  
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
          minWidth: '200px',
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
              style={{ color: metricColor }}
            >
              {metric}
            </span>
          </div>
        )}
        
        {/* Social proof row */}
        {hasSocialProof && (
          <div 
            className="px-3 py-2 flex items-center gap-4 border-t"
            style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
          >
            {socialProof.thumbsUp > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-sm">👍</span>
                <span 
                  className="text-xs font-medium"
                  style={{ color: 'rgba(74, 222, 128, 0.9)' }}
                >
                  {socialProof.thumbsUp}
                </span>
              </div>
            )}
            {socialProof.thumbsDown > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-sm">👎</span>
                <span 
                  className="text-xs font-medium"
                  style={{ color: 'rgba(239, 68, 68, 0.9)' }}
                >
                  {socialProof.thumbsDown}
                </span>
              </div>
            )}
            {socialProof.comments > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-sm">💬</span>
                <span 
                  className="text-xs font-medium"
                  style={{ color: 'rgba(255, 255, 255, 0.6)' }}
                >
                  {socialProof.comments}
                </span>
              </div>
            )}
          </div>
        )}
        
        {/* Actions row */}
        <div 
          className="px-3 py-2 flex items-center gap-2 border-t"
          style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
        >
          {/* Feedback button - always show */}
          <button
            onClick={onFeedbackClick}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-all duration-200 group hover:scale-[1.02]"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            <span className="text-sm">💬</span>
            <span 
              className="text-xs font-medium transition-colors duration-200 group-hover:text-white"
              style={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              Feedback
            </span>
          </button>
          
          {/* Spacer */}
          <div className="flex-1" />
          
          {/* Compare button (if comparison data exists) */}
          {hasComparison && (
            <button
              onClick={onCompareClick}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-all duration-200 group hover:scale-[1.02]"
              style={{
                background: `${accentColor}10`,
                border: `1px solid ${accentColor}30`,
              }}
            >
              <span 
                className="text-xs font-medium transition-colors duration-200"
                style={{ color: accentColor }}
              >
                Compare
              </span>
              <span 
                className="text-xs transition-transform duration-200 group-hover:translate-x-0.5"
                style={{ color: accentColor }}
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