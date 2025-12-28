/**
 * StakeholderSankeyPOC - Proof of Concept
 * 
 * Core experience hierarchy:
 * 1. Toggle cards (lens selection)
 * 2. Sankey visualization + narrative
 * 3. Hover cards → Drawer (deeper dive, pull not push)
 * 
 * Design principles:
 * - FOMU > FOMO: Make them feel safer about deciding
 * - Minimum Friction: Value in minutes, not hours
 * - Premium & Tactile: Proud to share, enjoyable to use
 */

import { useState, useMemo, useCallback, useRef } from 'react';
import { SankeyFlowV3, NodePosition } from '../components/sankeyflowv3';
import { NodeHoverCard } from '../components/NodeHoverCard';
import { ComparisonDrawer } from '../components/ComparisonDrawer';
import { 
  StakeholderViewType as StakeholderLensType, 
  getFlowStateForView as getFlowStateForLens,
} from '../data/templates/stakeholderParallelData';
import { 
  getComparisonsForView as getComparisonsForLens,
  getNodeComparisonForView as getNodeComparisonForLens,
  getViewCountForNode as getLensCountForNode,
} from '../data/templates/stakeholderParallelComparisons';
import { DEFAULT_BRAND } from '../components/branding/brandUtils';

// ============================================
// LENS CONFIGURATION
// ============================================

const LENS_DATA: { 
  type: StakeholderLensType; 
  icon: string; 
  label: string; 
  color: string; 
  currentInsight: string;
  shiftedInsight: string;
}[] = [
  { 
    type: 'orders', 
    icon: '📦', 
    label: 'Orders', 
    color: '#00BFA6',
    currentInsight: '87 orders (18%) require rework → 72% on-time',
    shiftedInsight: '94% on-time delivery, 1% exceptions',
  },
  { 
    type: 'dollars', 
    icon: '💰', 
    label: 'Dollars', 
    color: '#22c55e',
    currentInsight: '$987/week (24%) flows to waste → $51K/year',
    shiftedInsight: '$3,096/week (76%) recovered → $161K/year saved',
  },
  { 
    type: 'time', 
    icon: '⏱️', 
    label: 'Time', 
    color: '#00D4E5',
    currentInsight: '30 hrs/week (26%) lost to rework',
    shiftedInsight: '111 hrs/week (95%) freed for strategic work',
  },
];

// ============================================
// MAIN COMPONENT
// ============================================

export const StakeholderSankeyPOC = () => {
  // Lens state
  const [activeLens, setActiveLens] = useState<StakeholderLensType>('orders');
  
  // Layout and animation state
  const [nodePositions, setNodePositions] = useState<Map<string, NodePosition>>(new Map());
  const [animationComplete, setAnimationComplete] = useState(false);
  
  // Hover state with delay for "hover bridge"
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [isHoveringCard, setIsHoveringCard] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastHoveredNodeRef = useRef<string | null>(null);
  
  // Track last hovered node for card display
  if (hoveredNodeId) {
    lastHoveredNodeRef.current = hoveredNodeId;
  }
  
  // Show card if hovering node OR hovering card
  const showHoverCard = hoveredNodeId !== null || isHoveringCard;
  const activeNodeId = hoveredNodeId || (isHoveringCard ? lastHoveredNodeRef.current : null);
  
  // Drawer state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Get flow state and comparisons for current lens
  const flowState = useMemo(() => getFlowStateForLens(activeLens), [activeLens]);
  const comparisons = useMemo(() => getComparisonsForLens(activeLens), [activeLens]);
  
  // Get selected comparison for drawer
  const selectedComparison = useMemo(() => {
    if (!selectedNodeId) return null;
    return getNodeComparisonForLens(activeLens, selectedNodeId);
  }, [activeLens, selectedNodeId]);
  
  // Get current lens color for accent
  const activeLensColor = useMemo(() => {
    return LENS_DATA.find(v => v.type === activeLens)?.color || '#00e5ff';
  }, [activeLens]);
  
  // Get hovered node data
  const hoveredNodeData = useMemo(() => {
    const nodeId = activeNodeId;
    if (!nodeId || !nodePositions.has(nodeId)) return null;
    
    const position = nodePositions.get(nodeId)!;
    const node = flowState.data.nodes.find(n => n.id === nodeId);
    const lensCount = getLensCountForNode(activeLens, nodeId);
    
    return {
      id: nodeId,
      name: node?.label || nodeId,
      metric: node?.displayValue,
      position: {
        x: position.x + position.width + 16, // 16px to the right of node
        y: position.y + position.height / 2, // Centered vertically
      },
      hasComparison: lensCount > 0,
    };
  }, [activeNodeId, nodePositions, flowState.data.nodes, activeLens]);
  
  // Callbacks
  const handleLayoutReady = useCallback((positions: Map<string, NodePosition>) => {
    setNodePositions(positions);
  }, []);
  
  const handleAnimationComplete = useCallback(() => {
    setAnimationComplete(true);
  }, []);
  
  const handleLensChange = useCallback((lensType: StakeholderLensType) => {
    // Reset state when changing lenses
    setAnimationComplete(false);
    setActiveLens(lensType);
    setSelectedNodeId(null);
    setDrawerOpen(false);
    setHoveredNodeId(null);
  }, []);
  
  const handleNodeHover = useCallback((nodeId: string | null) => {
    // Clear any pending hide timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    if (nodeId) {
      setHoveredNodeId(nodeId);
      setIsHoveringCard(false);
    } else {
      // Delay hiding to allow moving to card
      hoverTimeoutRef.current = setTimeout(() => {
        setHoveredNodeId(null);
      }, 200); // 200ms grace period
    }
  }, []);
  
  const handleCardHover = useCallback((hovering: boolean) => {
    // Clear any pending hide timeout when entering card
    if (hovering && hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    setIsHoveringCard(hovering);
    
    if (!hovering) {
      // Left card - start hide timeout
      hoverTimeoutRef.current = setTimeout(() => {
        setHoveredNodeId(null);
        lastHoveredNodeRef.current = null;
      }, 100);
    }
  }, []);
  
  const handleCompareClick = useCallback(() => {
    const nodeId = activeNodeId;
    if (nodeId) {
      setSelectedNodeId(nodeId);
      setDrawerOpen(true);
    }
  }, [activeNodeId]);
  
  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
  }, []);
  
  const handleThumbsUp = useCallback(() => {
    console.log('Thumbs up for:', hoveredNodeId);
    // TODO: Implement feedback submission
  }, [hoveredNodeId]);
  
  const handleThumbsDown = useCallback(() => {
    console.log('Thumbs down for:', hoveredNodeId);
    // TODO: Implement feedback submission
  }, [hoveredNodeId]);
  
  return (
    <div 
      className="min-h-screen w-full relative"
      style={{ 
        background: 'linear-gradient(180deg, #0a0a0f 0%, #121218 50%, #0a0a0f 100%)',
      }}
    >
      {/* Toggle Cards */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4">
        <div className="flex gap-2">
          {LENS_DATA.map((lens) => {
            const isActive = activeLens === lens.type;
            return (
              <button
                key={lens.type}
                onClick={() => handleLensChange(lens.type)}
                className="flex-1 p-4 rounded-xl text-left transition-all duration-300 group"
                style={{
                  background: isActive 
                    ? `linear-gradient(135deg, ${lens.color}15 0%, ${lens.color}08 100%)`
                    : 'rgba(255, 255, 255, 0.02)',
                  border: isActive 
                    ? `1px solid ${lens.color}40`
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: isActive
                    ? `0 4px 24px ${lens.color}15`
                    : 'none',
                }}
              >
                {/* Header row: Icon + Label */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{lens.icon}</span>
                  <span 
                    className="text-sm font-semibold transition-colors duration-300"
                    style={{ color: isActive ? lens.color : 'rgba(255, 255, 255, 0.5)' }}
                  >
                    {lens.label}
                  </span>
                  {isActive && (
                    <div 
                      className="ml-auto w-2 h-2 rounded-full"
                      style={{ background: lens.color }}
                    />
                  )}
                </div>
                
                {/* Current state insight */}
                <div 
                  className="text-xs leading-relaxed"
                  style={{ 
                    color: isActive ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.35)',
                  }}
                >
                  <span style={{ color: isActive ? '#ef4444' : 'rgba(239, 68, 68, 0.5)' }}>
                    Current:
                  </span>{' '}
                  {lens.currentInsight}
                </div>
                
                {/* Shifted state insight - shown when active */}
                {isActive && (
                  <div 
                    className="text-xs leading-relaxed mt-1.5 pt-1.5"
                    style={{ 
                      color: 'rgba(255, 255, 255, 0.6)',
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <span style={{ color: '#22c55e' }}>
                      Shifted:
                    </span>{' '}
                    {lens.shiftedInsight}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Sankey Visualization */}
      <div className="absolute inset-0 pt-32 pb-4">
        <SankeyFlowV3
          key={activeLens}
          state={flowState}
          stageLabels={[]}
          variant="before"
          brand={DEFAULT_BRAND}
          animated={true}
          showLabels={true}
          hideUI={true}
          onLayoutReady={handleLayoutReady}
          onAnimationComplete={handleAnimationComplete}
          onNodeHover={handleNodeHover}
        />
      </div>
      
      {/* Node Hover Card */}
      {hoveredNodeData && (
        <div
          onMouseEnter={() => handleCardHover(true)}
          onMouseLeave={() => handleCardHover(false)}
        >
          <NodeHoverCard
            name={hoveredNodeData.name}
            metric={hoveredNodeData.metric}
            visible={showHoverCard}
            position={hoveredNodeData.position}
            accentColor={activeLensColor}
            hasComparison={hoveredNodeData.hasComparison}
            onCompareClick={handleCompareClick}
            onThumbsUp={handleThumbsUp}
            onThumbsDown={handleThumbsDown}
          />
        </div>
      )}
      
      {/* Comparison Drawer */}
      <ComparisonDrawer
        comparison={selectedComparison}
        isOpen={drawerOpen}
        onClose={handleDrawerClose}
        accentColor={activeLensColor}
      />
    </div>
  );
};

export default StakeholderSankeyPOC;