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

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { SankeyFlowV3, NodePosition } from '../components/sankeyflowv3';
import { NodeHoverCard, SocialProof } from '../components/NodeHoverCard';
import { ComparisonDrawer } from '../components/ComparisonDrawer';
import { NodeInteractionDialog } from '../components/NodeInteractionDialog';
import { NarrativeBar } from '../components/NarrativeBar';
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

// Animation duration must match LAYOUT.drawDuration in sankeyflowv3.tsx
const ANIMATION_DURATION = 16000;

// ============================================
// SEED DATA: Social Proof (mock data for POC)
// In production, this would come from Supabase
// ============================================

const SEED_SOCIAL_PROOF: Record<string, Record<string, SocialProof>> = {
  orders: {
    'intake': { thumbsUp: 2, thumbsDown: 0, comments: 1 },
    'manual-process': { thumbsUp: 1, thumbsDown: 3, comments: 2 },
    'on-time': { thumbsUp: 4, thumbsDown: 1, comments: 0 },
    'delayed': { thumbsUp: 0, thumbsDown: 2, comments: 1 },
    'escalated': { thumbsUp: 0, thumbsDown: 4, comments: 3 },
  },
  dollars: {
    'budget': { thumbsUp: 1, thumbsDown: 0, comments: 0 },
    'labor-pool': { thumbsUp: 2, thumbsDown: 2, comments: 1 },
    'error-cost': { thumbsUp: 0, thumbsDown: 5, comments: 2 },
    'value-created': { thumbsUp: 3, thumbsDown: 0, comments: 0 },
    'waste': { thumbsUp: 0, thumbsDown: 3, comments: 2 },
  },
  time: {
    'capacity': { thumbsUp: 1, thumbsDown: 0, comments: 0 },
    'processing-time': { thumbsUp: 1, thumbsDown: 2, comments: 1 },
    'error-time': { thumbsUp: 0, thumbsDown: 4, comments: 2 },
    'value-hours': { thumbsUp: 2, thumbsDown: 1, comments: 0 },
    'lost-time': { thumbsUp: 0, thumbsDown: 3, comments: 1 },
  },
};

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
  const [animationProgress, setAnimationProgress] = useState(0);
  const animationStartRef = useRef<number | null>(null);
  
  // Animation progress timer - syncs with Sankey draw
  useEffect(() => {
    // Reset on lens change
    animationStartRef.current = Date.now();
    setAnimationProgress(0);
    
    const updateProgress = () => {
      if (!animationStartRef.current) return;
      
      const elapsed = Date.now() - animationStartRef.current;
      const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
      setAnimationProgress(progress);
      
      if (progress < 1) {
        requestAnimationFrame(updateProgress);
      }
    };
    
    requestAnimationFrame(updateProgress);
    
    return () => {
      animationStartRef.current = null;
    };
  }, [activeLens]);
  
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
  
  // Feedback dialog state
  const [feedbackNodeId, setFeedbackNodeId] = useState<string | null>(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  
  // Get flow state and comparisons for current lens
  const flowState = useMemo(() => getFlowStateForLens(activeLens), [activeLens]);
  const comparisons = useMemo(() => getComparisonsForLens(activeLens), [activeLens]);
  
  // Get selected comparison for drawer
  const selectedComparison = useMemo(() => {
    if (!selectedNodeId) return null;
    return getNodeComparisonForLens(activeLens, selectedNodeId);
  }, [activeLens, selectedNodeId]);
  
  // Determine if selected node is terminal (for Step vs Outcome label)
  const selectedNodeIsTerminal = useMemo(() => {
    if (!selectedNodeId) return false;
    const node = flowState.data.nodes.find(n => n.id === selectedNodeId);
    const maxLayer = Math.max(...flowState.data.nodes.map(n => n.layer));
    return node?.layer === maxLayer;
  }, [selectedNodeId, flowState.data.nodes]);
  
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
    const socialProof = SEED_SOCIAL_PROOF[activeLens]?.[nodeId];
    
    // Determine max layer to detect terminal nodes
    const maxLayer = Math.max(...flowState.data.nodes.map(n => n.layer));
    const isTerminal = node?.layer === maxLayer;
    
    return {
      id: nodeId,
      name: node?.label || nodeId,
      metric: node?.displayValue,
      nodeType: node?.type || 'default',
      isTerminal,
      position: {
        x: position.x + position.width + 16, // 16px to the right of node
        y: position.y + position.height / 2, // Centered vertically
      },
      hasComparison: lensCount > 0,
      socialProof,
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
  
  // Open feedback dialog - can be triggered from hover card or direct node click
  const handleFeedbackClick = useCallback((nodeId: string) => {
    setFeedbackNodeId(nodeId);
    setFeedbackDialogOpen(true);
  }, []);
  
  const handleFeedbackDialogClose = useCallback(() => {
    setFeedbackDialogOpen(false);
    setFeedbackNodeId(null);
  }, []);
  
  // Direct node click opens feedback dialog
  const handleNodeClick = useCallback((nodeId: string) => {
    handleFeedbackClick(nodeId);
  }, [handleFeedbackClick]);
  
  // Get node info for feedback dialog
  const feedbackNodeInfo = useMemo(() => {
    if (!feedbackNodeId) return null;
    const node = flowState.data.nodes.find(n => n.id === feedbackNodeId);
    return {
      id: feedbackNodeId,
      label: node?.label || feedbackNodeId,
      value: node?.displayValue || '',
      type: node?.type || 'default',
    };
  }, [feedbackNodeId, flowState.data.nodes]);
  
  return (
    <div 
      className="h-screen w-full flex flex-col"
      style={{ 
        background: 'linear-gradient(180deg, #0a0a0f 0%, #121218 50%, #0a0a0f 100%)',
      }}
    >
      {/* Toggle Cards - fixed height section */}
      <div className="flex-none p-4 z-20">
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
      
      {/* Spacer - pushes narrative to center of gap */}
      <div className="flex-1" />
      
      {/* Narrative - centered between toggles and Sankey */}
      <div className="flex-none flex items-center justify-center z-10">
        <NarrativeBar
          lens={activeLens}
          variant="before"
          progress={animationProgress}
          accentColor={activeLensColor}
          onFeedbackClick={() => {
            const firstNode = flowState.data.nodes[0];
            if (firstNode) {
              handleFeedbackClick(firstNode.id);
            }
          }}
        />
      </div>
      
      {/* Spacer - equal to above, keeps narrative centered */}
      <div className="flex-1" />
      
      {/* Sankey Visualization - takes 4x spacer size */}
      <div className="flex-[4] min-h-0 flex justify-center">
        <div className="w-full max-w-[1400px] h-full relative">
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
            onNodeClick={(nodeId) => handleNodeClick(nodeId)}
          />
          
          {/* Node Hover Card - inside Sankey container for relative positioning */}
          {hoveredNodeData && (
            <div
              onMouseEnter={() => handleCardHover(true)}
              onMouseLeave={() => handleCardHover(false)}
            >
              <NodeHoverCard
                name={hoveredNodeData.name}
                metric={hoveredNodeData.metric}
                nodeType={hoveredNodeData.nodeType}
                visible={showHoverCard}
                position={hoveredNodeData.position}
                accentColor={activeLensColor}
                socialProof={hoveredNodeData.socialProof}
                hasComparison={hoveredNodeData.hasComparison}
                onFeedbackClick={() => handleFeedbackClick(hoveredNodeData.id)}
                onCompareClick={handleCompareClick}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Comparison Drawer */}
      <ComparisonDrawer
        comparison={selectedComparison}
        isOpen={drawerOpen}
        onClose={handleDrawerClose}
        variant="before"
        isTerminal={selectedNodeIsTerminal}
        accentColor={activeLensColor}
        socialProof={selectedNodeId ? SEED_SOCIAL_PROOF[activeLens]?.[selectedNodeId] : undefined}
        onFeedbackClick={() => {
          if (selectedNodeId) {
            handleFeedbackClick(selectedNodeId);
            setDrawerOpen(false);
          }
        }}
      />
      
      {/* Feedback Dialog */}
      {feedbackNodeInfo && (
        <NodeInteractionDialog
          isOpen={feedbackDialogOpen}
          onClose={handleFeedbackDialogClose}
          shiftId="poc-demo"
          elementId={feedbackNodeInfo.id}
          elementType="node"
          elementLabel={feedbackNodeInfo.label}
          currentValue={feedbackNodeInfo.value}
          viewerType="anonymous"
        />
      )}
    </div>
  );
};

export default StakeholderSankeyPOC;