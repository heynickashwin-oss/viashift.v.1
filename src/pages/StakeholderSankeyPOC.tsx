/**
 * StakeholderSankeyPOC - Proof of Concept
 * 
 * Core experience hierarchy:
 * 1. Toggle cards (lens selection)
 * 2. Sankey visualization + narrative
 * 3. Compare pills → Drawer (deeper dive, pull not push)
 * 
 * Design principles:
 * - FOMU > FOMO: Make them feel safer about deciding
 * - Minimum Friction: Value in minutes, not hours
 * - Premium & Tactile: Proud to share, enjoyable to use
 */

import { useState, useMemo, useCallback } from 'react';
import { SankeyFlowV3, NodePosition } from '../components/sankeyflowv3';
import { ComparePill } from '../components/ComparePill';
import { ComparisonDrawer } from '../components/ComparisonDrawer';
import { 
  StakeholderViewType, 
  getFlowStateForView,
} from '../data/templates/stakeholderParallelData';
import { 
  getComparisonsForView,
  getNodeComparisonForView,
  getViewCountForNode,
} from '../data/templates/stakeholderParallelComparisons';
import { DEFAULT_BRAND } from '../components/branding/brandUtils';

// ============================================
// VIEW CONFIGURATION
// ============================================

const VIEW_DATA: { 
  type: StakeholderViewType; 
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
  // View state
  const [activeView, setActiveView] = useState<StakeholderViewType>('orders');
  
  // Layout and animation state
  const [nodePositions, setNodePositions] = useState<Map<string, NodePosition>>(new Map());
  const [animationComplete, setAnimationComplete] = useState(false);
  
  // Drawer state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Get flow state and comparisons for current view
  const flowState = useMemo(() => getFlowStateForView(activeView), [activeView]);
  const comparisons = useMemo(() => getComparisonsForView(activeView), [activeView]);
  
  // Get selected comparison for drawer
  const selectedComparison = useMemo(() => {
    if (!selectedNodeId) return null;
    return getNodeComparisonForView(activeView, selectedNodeId);
  }, [activeView, selectedNodeId]);
  
  // Get current view color for accent
  const activeViewColor = useMemo(() => {
    return VIEW_DATA.find(v => v.type === activeView)?.color || '#00e5ff';
  }, [activeView]);
  
  // Callbacks
  const handleLayoutReady = useCallback((positions: Map<string, NodePosition>) => {
    setNodePositions(positions);
  }, []);
  
  const handleAnimationComplete = useCallback(() => {
    setAnimationComplete(true);
  }, []);
  
  const handleViewChange = useCallback((viewType: StakeholderViewType) => {
    // Reset animation state when changing views
    setAnimationComplete(false);
    setActiveView(viewType);
    setSelectedNodeId(null);
    setDrawerOpen(false);
  }, []);
  
  const handlePillClick = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    setDrawerOpen(true);
  }, []);
  
  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
  }, []);
  
  // Calculate pill positions based on node positions
  const pillPositions = useMemo(() => {
    const positions: Array<{
      nodeId: string;
      x: number;
      y: number;
      viewCount: number;
    }> = [];
    
    nodePositions.forEach((pos, nodeId) => {
      const viewCount = getViewCountForNode(activeView, nodeId);
      if (viewCount > 0) {
        positions.push({
          nodeId,
          x: pos.x + pos.width / 2,
          y: pos.y + pos.height + 12, // 12px below node
          viewCount,
        });
      }
    });
    
    return positions;
  }, [nodePositions, activeView]);
  
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
          {VIEW_DATA.map((view) => {
            const isActive = activeView === view.type;
            return (
              <button
                key={view.type}
                onClick={() => handleViewChange(view.type)}
                className="flex-1 p-4 rounded-xl text-left transition-all duration-300"
                style={{
                  background: isActive 
                    ? `linear-gradient(135deg, ${view.color}15 0%, ${view.color}08 100%)`
                    : 'rgba(255, 255, 255, 0.02)',
                  border: isActive 
                    ? `1px solid ${view.color}40`
                    : '1px solid rgba(255, 255, 255, 0.06)',
                  boxShadow: isActive
                    ? `0 4px 24px ${view.color}15`
                    : 'none',
                }}
              >
                {/* Header row: Icon + Label */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{view.icon}</span>
                  <span 
                    className="text-sm font-semibold"
                    style={{ color: isActive ? view.color : 'rgba(255, 255, 255, 0.5)' }}
                  >
                    {view.label}
                  </span>
                  {isActive && (
                    <div 
                      className="ml-auto w-2 h-2 rounded-full"
                      style={{ background: view.color }}
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
                  {view.currentInsight}
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
                    {view.shiftedInsight}
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
          key={activeView}
          state={flowState}
          stageLabels={[]}
          variant="before"
          brand={DEFAULT_BRAND}
          animated={true}
          showLabels={true}
          hideUI={true}
          onLayoutReady={handleLayoutReady}
          onAnimationComplete={handleAnimationComplete}
        />
      </div>
      
      {/* Compare Pills - positioned below nodes */}
      {pillPositions.map(({ nodeId, x, y, viewCount }) => (
        <ComparePill
          key={nodeId}
          viewCount={viewCount}
          visible={animationComplete}
          onClick={() => handlePillClick(nodeId)}
          position={{ x, y }}
          accentColor={activeViewColor}
        />
      ))}
      
      {/* Comparison Drawer */}
      <ComparisonDrawer
        comparison={selectedComparison}
        isOpen={drawerOpen}
        onClose={handleDrawerClose}
        accentColor={activeViewColor}
      />
    </div>
  );
};

export default StakeholderSankeyPOC;