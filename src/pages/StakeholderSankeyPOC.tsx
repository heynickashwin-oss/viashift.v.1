/**
 * StakeholderSankeyPOC - Proof of Concept
 * 
 * Clean layout: Full-width toggle cards with embedded insights
 * Toggle IS the information - not separate from it
 */

import { useState, useMemo } from 'react';
import { SankeyFlowV3 } from '../components/sankeyflowv3';
import { 
  StakeholderViewType, 
  getFlowStateForView,
} from '../data/templates/stakeholderParallelData';
import { DEFAULT_BRAND } from '../components/branding/brandUtils';

// View configuration with current and shifted state insights
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

export const StakeholderSankeyPOC = () => {
  const [activeView, setActiveView] = useState<StakeholderViewType>('orders');
  const [showShifted, setShowShifted] = useState(false); // For future shifted state toggle
  
  const flowState = useMemo(() => getFlowStateForView(activeView), [activeView]);
  
  return (
    <div 
      className="min-h-screen w-full"
      style={{ 
        background: 'linear-gradient(180deg, #0a0a0f 0%, #121218 50%, #0a0a0f 100%)',
      }}
    >
      {/* Full-Width Toggle Cards */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4">
        <div className="flex gap-2">
          {VIEW_DATA.map((view) => {
            const isActive = activeView === view.type;
            return (
              <button
                key={view.type}
                onClick={() => setActiveView(view.type)}
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
                
                {/* Shifted state insight - shown when active (preview of transformation) */}
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
      
      {/* Sankey Visualization - Clean, full space */}
      <div className="absolute inset-0 pt-32 pb-4">
        <SankeyFlowV3
          key={activeView}
          state={flowState}
          stageLabels={[]} // Empty - removed for cleaner look
          variant="before"
          brand={DEFAULT_BRAND}
          animated={true}
          showLabels={true}
          hideUI={true}
        />
      </div>
      
      {/* Bottom: Reserved for comparison cards on node interaction */}
    </div>
  );
};

export default StakeholderSankeyPOC;