/**
 * NodeComparisonBand.tsx
 * 
 * Displays stakeholder comparison cards in a horizontal band at the top,
 * aligned with their respective nodes in the Sankey visualization.
 * 
 * - Cards are horizontally aligned with node x-position
 * - All cards share same y-position (top band)
 * - Multiple cards per layer slot paginate with dots
 * - Viewer-aware prioritization of stakeholder insights
 */

import React, { memo, useMemo, useState, useEffect, useCallback } from 'react';
import type { 
  NodeComparison, 
  StakeholderRole, 
  StakeholderInsight,
  InsightSentiment,
  ViewerType,
} from '../types/stakeholderComparison';
import { 
  STAKEHOLDER_ROLES, 
  getActiveRoles, 
  hasAlignmentConflict,
  getOrderedRolesForViewer,
} from '../types/stakeholderComparison';

// ============================================
// TYPES
// ============================================

export interface NodePosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  layer: number;
}

export interface NodeComparisonBandProps {
  /** All available comparisons */
  comparisons: NodeComparison[];
  
  /** Node positions from layout */
  nodePositions: Map<string, NodePosition>;
  
  /** Current viewer type for priority ordering */
  viewerType: ViewerType;
  
  /** Which layers have been "reached" by the forge animation */
  visibleLayers: number[];
  
  /** Container width for positioning calculations */
  containerWidth: number;
  
  /** Band position - top edge offset */
  topOffset?: number;
  
  /** Auto-cycle delay for pagination (ms) */
  cycleDelay?: number;
  
  /** Callback when active comparison changes (for node highlighting) */
  onActiveNodeChange?: (nodeId: string | null) => void;
}

// ============================================
// STYLING CONSTANTS
// ============================================

const SENTIMENT_COLORS: Record<InsightSentiment, { bg: string; border: string; text: string }> = {
  pain: { 
    bg: 'rgba(239, 68, 68, 0.15)', 
    border: 'rgba(239, 68, 68, 0.4)', 
    text: '#f87171' 
  },
  neutral: { 
    bg: 'rgba(148, 163, 184, 0.15)', 
    border: 'rgba(148, 163, 184, 0.4)', 
    text: '#94a3b8' 
  },
  gain: { 
    bg: 'rgba(74, 222, 128, 0.15)', 
    border: 'rgba(74, 222, 128, 0.4)', 
    text: '#4ade80' 
  },
};

const CARD_WIDTH = 200;
const CARD_MIN_GAP = 16;

// ============================================
// COMPACT COMPARISON CARD (for band display)
// ============================================

interface CompactCardProps {
  comparison: NodeComparison;
  viewerType: ViewerType;
  visible: boolean;
  xPosition: number;
}

const CompactCard = memo(({ comparison, viewerType, visible, xPosition }: CompactCardProps) => {
  const activeRoles = useMemo(() => getActiveRoles(comparison), [comparison]);
  const orderedRoles = useMemo(
    () => getOrderedRolesForViewer(viewerType, activeRoles),
    [viewerType, activeRoles]
  );
  const hasConflict = useMemo(() => hasAlignmentConflict(comparison), [comparison]);
  
  // Show top 3 insights based on viewer priority
  const displayRoles = orderedRoles.slice(0, 3);
  
  return (
    <div
      className="absolute transition-all duration-500"
      style={{
        left: xPosition,
        transform: 'translateX(-50%)',
        opacity: visible ? 1 : 0,
        top: visible ? 0 : -20,
      }}
    >
      <div
        className="rounded-lg backdrop-blur-xl"
        style={{
          width: CARD_WIDTH,
          background: 'rgba(10, 10, 15, 0.95)',
          border: hasConflict 
            ? '1px solid rgba(245, 158, 11, 0.4)' 
            : '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Header */}
        <div 
          className="px-3 py-2 border-b flex items-center justify-between"
          style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
        >
          <span 
            className="text-xs font-semibold truncate"
            style={{ color: 'rgba(255, 255, 255, 0.95)', maxWidth: '140px' }}
          >
            {comparison.nodeName}
          </span>
          {hasConflict && (
            <span 
              className="text-[10px] px-1.5 py-0.5 rounded-full"
              style={{ 
                background: 'rgba(245, 158, 11, 0.2)',
                color: '#F59E0B',
              }}
            >
              ⚡
            </span>
          )}
        </div>
        
        {/* Insights - compact grid */}
        <div className="p-2 space-y-1.5">
          {displayRoles.map((role) => {
            const insight = comparison.insights[role];
            if (!insight) return null;
            
            const roleMeta = STAKEHOLDER_ROLES[role];
            const sentimentStyle = SENTIMENT_COLORS[insight.sentiment];
            
            return (
              <div
                key={role}
                className="flex items-center gap-2 px-2 py-1.5 rounded"
                style={{
                  background: sentimentStyle.bg,
                  border: `1px solid ${sentimentStyle.border}`,
                }}
              >
                <span className="text-xs" title={roleMeta.label}>
                  {insight.icon || roleMeta.icon}
                </span>
                <span 
                  className="text-xs font-semibold"
                  style={{ color: sentimentStyle.text }}
                >
                  {insight.value}
                </span>
                <span 
                  className="text-[10px] truncate"
                  style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                >
                  {insight.label}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* "More" indicator if we truncated */}
        {orderedRoles.length > 3 && (
          <div 
            className="px-3 py-1.5 text-center border-t"
            style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <span 
              className="text-[10px]"
              style={{ color: 'rgba(255, 255, 255, 0.4)' }}
            >
              +{orderedRoles.length - 3} more perspectives
            </span>
          </div>
        )}
      </div>
      
      {/* Connector line to node */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: '100%',
          width: 1,
          height: 24,
          background: 'linear-gradient(to bottom, rgba(0, 212, 229, 0.5), transparent)',
        }}
      />
    </div>
  );
});

CompactCard.displayName = 'CompactCard';

// ============================================
// LAYER SLOT (handles pagination for multiple cards per layer)
// ============================================

interface LayerSlotProps {
  comparisons: NodeComparison[];
  xPosition: number;
  viewerType: ViewerType;
  visible: boolean;
  cycleDelay: number;
  onActiveNodeChange?: (nodeId: string | null) => void;
}

const LayerSlot = memo(({ comparisons, xPosition, viewerType, visible, cycleDelay, onActiveNodeChange }: LayerSlotProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Auto-cycle through comparisons
  useEffect(() => {
    if (!visible || comparisons.length <= 1) return;
    
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % comparisons.length);
    }, cycleDelay);
    
    return () => clearInterval(timer);
  }, [visible, comparisons.length, cycleDelay]);
  
  // Reset when visibility changes
  useEffect(() => {
    if (!visible) setActiveIndex(0);
  }, [visible]);
  
  // Report active node changes
  useEffect(() => {
    if (visible && comparisons[activeIndex]) {
      onActiveNodeChange?.(comparisons[activeIndex].nodeId);
    } else {
      onActiveNodeChange?.(null);
    }
  }, [visible, activeIndex, comparisons, onActiveNodeChange]);
  
  const activeComparison = comparisons[activeIndex];
  if (!activeComparison) return null;
  
  return (
    <div className="relative">
      <CompactCard
        comparison={activeComparison}
        viewerType={viewerType}
        visible={visible}
        xPosition={xPosition}
      />
      
      {/* Pagination dots */}
      {comparisons.length > 1 && visible && (
        <div 
          className="absolute flex items-center justify-center gap-1"
          style={{
            left: xPosition,
            transform: 'translateX(-50%)',
            top: -16,
          }}
        >
          {comparisons.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className="w-1.5 h-1.5 rounded-full transition-all"
              style={{
                background: idx === activeIndex 
                  ? '#00D4E5' 
                  : 'rgba(255, 255, 255, 0.3)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
});

LayerSlot.displayName = 'LayerSlot';

// ============================================
// MAIN BAND COMPONENT
// ============================================

export const NodeComparisonBand = memo(({
  comparisons,
  nodePositions,
  viewerType,
  visibleLayers,
  containerWidth,
  topOffset = 24,
  cycleDelay = 4000,
  onActiveNodeChange,
}: NodeComparisonBandProps) => {
  
  // Track active nodes from each layer slot
  const [activeNodes, setActiveNodes] = useState<Map<number, string | null>>(new Map());
  
  // Create stable callback for layer slots
  const handleLayerNodeChange = useCallback((layer: number, nodeId: string | null) => {
    setActiveNodes(prev => {
      const next = new Map(prev);
      if (nodeId) {
        next.set(layer, nodeId);
      } else {
        next.delete(layer);
      }
      return next;
    });
  }, []);
  
  // Report combined active nodes to parent
  useEffect(() => {
    const activeNodeIds = Array.from(activeNodes.values()).filter(Boolean) as string[];
    // Report the first active node (most visible layer)
    onActiveNodeChange?.(activeNodeIds[0] || null);
  }, [activeNodes, onActiveNodeChange]);
  
  // Group comparisons by layer and calculate x-position
  const layerSlots = useMemo(() => {
    const slots = new Map<number, { comparisons: NodeComparison[]; xPosition: number }>();
    
    comparisons.forEach(comparison => {
      const nodePos = nodePositions.get(comparison.nodeId);
      if (!nodePos) return;
      
      const layer = nodePos.layer;
      const existing = slots.get(layer);
      
      if (existing) {
        existing.comparisons.push(comparison);
        // Use average x-position if multiple nodes in same layer
        existing.xPosition = (existing.xPosition + nodePos.x + nodePos.width / 2) / 2;
      } else {
        slots.set(layer, {
          comparisons: [comparison],
          xPosition: nodePos.x + nodePos.width / 2,
        });
      }
    });
    
    return slots;
  }, [comparisons, nodePositions]);
  
  // Adjust positions to prevent overlap
  const adjustedSlots = useMemo(() => {
    const entries = Array.from(layerSlots.entries()).sort((a, b) => a[0] - b[0]);
    const adjusted: Array<{ layer: number; comparisons: NodeComparison[]; xPosition: number }> = [];
    
    entries.forEach(([layer, slot]) => {
      let xPos = slot.xPosition;
      
      // Check for overlap with previous slot
      const prev = adjusted[adjusted.length - 1];
      if (prev) {
        const minX = prev.xPosition + CARD_WIDTH / 2 + CARD_MIN_GAP + CARD_WIDTH / 2;
        if (xPos < minX) {
          xPos = minX;
        }
      }
      
      // Clamp to container bounds
      xPos = Math.max(CARD_WIDTH / 2 + 16, Math.min(xPos, containerWidth - CARD_WIDTH / 2 - 16));
      
      adjusted.push({ layer, comparisons: slot.comparisons, xPosition: xPos });
    });
    
    return adjusted;
  }, [layerSlots, containerWidth]);
  
  if (comparisons.length === 0) return null;
  
  return (
    <div 
      className="absolute left-0 right-0 z-20 pointer-events-none"
      style={{ top: topOffset }}
    >
      <div className="relative h-40 pointer-events-auto">
        {adjustedSlots.map(({ layer, comparisons: slotComparisons, xPosition }) => (
          <LayerSlot
            key={layer}
            comparisons={slotComparisons}
            xPosition={xPosition}
            viewerType={viewerType}
            visible={visibleLayers.includes(layer)}
            cycleDelay={cycleDelay}
            onActiveNodeChange={(nodeId) => handleLayerNodeChange(layer, nodeId)}
          />
        ))}
      </div>
    </div>
  );
});

NodeComparisonBand.displayName = 'NodeComparisonBand';

export default NodeComparisonBand;