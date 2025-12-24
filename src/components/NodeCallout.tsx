/**
 * NodeCallout.tsx
 * 
 * Positioned callout that appears near Sankey nodes during narrative phases.
 * Supports emphasis effects (pulse, glow) to draw attention.
 */

import { memo, useMemo } from 'react';
import { NodeCallout as NodeCalloutData } from '../data/templates/b2bSalesEnablement';

export interface NodePosition {
  x: number;
  y: number;
  width: number;
  height: number;
  layer: number;
}

export interface NodeCalloutProps {
  /** Callout data from narrative */
  callout: NodeCalloutData;
  
  /** Position of the target node */
  nodePosition: NodePosition;
  
  /** Whether the callout is visible */
  visible: boolean;
  
  /** Index for staggered animation */
  index?: number;
  
  /** Theme colors */
  accentColor?: string;
  primaryColor?: string;
}

export const NodeCallout = memo(({
  callout,
  nodePosition,
  visible,
  index = 0,
  accentColor = '#FF6B6B',
  primaryColor = '#00D4E5',
}: NodeCalloutProps) => {
  
  // Calculate position based on node layer
  // Layers 0-1: callout on right, layers 2-3: callout on left
  const position = useMemo(() => {
    const { x, y, width, height, layer } = nodePosition;
    const isLeftSide = layer >= 2;
    
    return {
      left: isLeftSide ? x - 160 : x + width + 16,
      top: y + height / 2,
      anchor: isLeftSide ? 'right' : 'left' as const,
    };
  }, [nodePosition]);
  
  // Determine color based on emphasis
  const color = useMemo(() => {
    if (callout.emphasis === 'pulse') return accentColor;
    if (callout.emphasis === 'glow') return primaryColor;
    return 'rgba(255, 255, 255, 0.9)';
  }, [callout.emphasis, accentColor, primaryColor]);
  
  // Border color with transparency
  const borderColor = useMemo(() => {
    if (callout.emphasis === 'pulse') return `${accentColor}66`;
    if (callout.emphasis === 'glow') return `${primaryColor}66`;
    return 'rgba(255, 255, 255, 0.2)';
  }, [callout.emphasis, accentColor, primaryColor]);
  
  // Glow shadow for emphasis
  const boxShadow = useMemo(() => {
    if (callout.emphasis === 'pulse') {
      return `0 0 20px ${accentColor}40, 0 4px 12px rgba(0, 0, 0, 0.3)`;
    }
    if (callout.emphasis === 'glow') {
      return `0 0 20px ${primaryColor}40, 0 4px 12px rgba(0, 0, 0, 0.3)`;
    }
    return '0 4px 12px rgba(0, 0, 0, 0.3)';
  }, [callout.emphasis, accentColor, primaryColor]);
  
  // Animation class
  const animationClass = callout.emphasis === 'pulse' 
    ? 'animate-callout-pulse' 
    : callout.emphasis === 'glow'
    ? 'animate-callout-glow'
    : '';

  return (
    <div
      className={`absolute pointer-events-none z-30 ${animationClass}`}
      style={{
        left: position.left,
        top: position.top,
        transform: `translateY(-50%) ${visible ? 'translateX(0) scale(1)' : position.anchor === 'left' ? 'translateX(-20px) scale(0.9)' : 'translateX(20px) scale(0.9)'}`,
        opacity: visible ? 1 : 0,
        transition: `all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 150}ms`,
      }}
    >
      {/* Connector line to node */}
      <div
        className="absolute top-1/2 -translate-y-1/2"
        style={{
          [position.anchor === 'left' ? 'left' : 'right']: -12,
          width: 12,
          height: 2,
          background: `linear-gradient(${position.anchor === 'left' ? '90deg' : '270deg'}, ${borderColor}, transparent)`,
        }}
      />
      
      {/* Callout card */}
      <div
        className="px-3 py-2 rounded-lg backdrop-blur-md"
        style={{
          background: 'rgba(10, 10, 15, 0.9)',
          border: `1px solid ${borderColor}`,
          boxShadow,
          maxWidth: 140,
        }}
      >
        <span
          className="text-xs font-semibold leading-tight block"
          style={{ 
            color,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {callout.text}
        </span>
      </div>
    </div>
  );
});

NodeCallout.displayName = 'NodeCallout';

/**
 * Container component that renders multiple callouts
 */
export interface NodeCalloutsProps {
  callouts: NodeCalloutData[];
  nodePositions: Map<string, NodePosition>;
  visible: boolean;
  accentColor?: string;
  primaryColor?: string;
}

export const NodeCallouts = memo(({
  callouts,
  nodePositions,
  visible,
  accentColor,
  primaryColor,
}: NodeCalloutsProps) => {
  return (
    <>
      {callouts.map((callout, index) => {
        const nodePos = nodePositions.get(callout.nodeId);
        if (!nodePos) return null;
        
        return (
          <NodeCallout
            key={`${callout.nodeId}-${index}`}
            callout={callout}
            nodePosition={nodePos}
            visible={visible}
            index={index}
            accentColor={accentColor}
            primaryColor={primaryColor}
          />
        );
      })}
      
      {/* CSS animations */}
      <style>{`
        @keyframes calloutPulse {
          0%, 100% { 
            box-shadow: 0 0 20px ${accentColor || '#FF6B6B'}40, 0 4px 12px rgba(0, 0, 0, 0.3);
          }
          50% { 
            box-shadow: 0 0 30px ${accentColor || '#FF6B6B'}60, 0 4px 16px rgba(0, 0, 0, 0.4);
          }
        }
        
        @keyframes calloutGlow {
          0%, 100% { 
            box-shadow: 0 0 20px ${primaryColor || '#00D4E5'}40, 0 4px 12px rgba(0, 0, 0, 0.3);
          }
          50% { 
            box-shadow: 0 0 28px ${primaryColor || '#00D4E5'}50, 0 4px 14px rgba(0, 0, 0, 0.35);
          }
        }
        
        .animate-callout-pulse > div:last-child {
          animation: calloutPulse 2s ease-in-out infinite;
        }
        
        .animate-callout-glow > div:last-child {
          animation: calloutGlow 3s ease-in-out infinite;
        }
      `}</style>
    </>
  );
});

NodeCallouts.displayName = 'NodeCallouts';

export default NodeCallout