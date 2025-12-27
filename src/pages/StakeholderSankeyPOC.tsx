/**
 * StakeholderSankeyPOC - Proof of Concept
 * 
 * Tests the hypothesis: Same visual framework, stakeholder-native data
 * - CFO sees dollars flowing
 * - Ops sees time flowing  
 * - Sales sees orders flowing
 * 
 * Clean layout: Toggle + insight at top, visualization middle, bottom reserved for comparison cards
 */

import { useState, useMemo } from 'react';
import { SankeyFlowV3 } from '../components/sankeyflowv3';
import { 
  StakeholderViewType, 
  viewConfigs, 
  getFlowStateForView,
} from '../data/templates/stakeholderParallelData';
import { DEFAULT_BRAND } from '../components/branding/brandUtils';

// View configuration with icons and colors
const VIEW_BUTTONS: { type: StakeholderViewType; icon: string; label: string; color: string; insight: string }[] = [
  { 
    type: 'orders', 
    icon: '📦', 
    label: 'Orders', 
    color: '#00BFA6',
    insight: '87 orders (18%) require rework → only 72% on-time delivery',
  },
  { 
    type: 'dollars', 
    icon: '💰', 
    label: 'Dollars', 
    color: '#22c55e',
    insight: '$987/week (24%) flows to pure waste → $51K annually',
  },
  { 
    type: 'time', 
    icon: '⏱️', 
    label: 'Time', 
    color: '#00D4E5',
    insight: '30 hours/week (26%) lost to rework and firefighting',
  },
];

export const StakeholderSankeyPOC = () => {
  const [activeView, setActiveView] = useState<StakeholderViewType>('orders');
  
  const flowState = useMemo(() => getFlowStateForView(activeView), [activeView]);
  const activeButton = VIEW_BUTTONS.find(b => b.type === activeView)!;
  
  return (
    <div 
      className="min-h-screen w-full"
      style={{ 
        background: 'linear-gradient(180deg, #0a0a0f 0%, #121218 50%, #0a0a0f 100%)',
      }}
    >
      {/* Unified Top Bar: Toggle + Insight */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4">
        <div 
          className="flex items-center justify-between p-3 rounded-xl"
          style={{
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Left: View Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5">
            {VIEW_BUTTONS.map((btn) => (
              <button
                key={btn.type}
                onClick={() => setActiveView(btn.type)}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
                style={{
                  background: activeView === btn.type 
                    ? `linear-gradient(135deg, ${btn.color}25 0%, ${btn.color}15 100%)`
                    : 'transparent',
                  border: activeView === btn.type 
                    ? `1px solid ${btn.color}50`
                    : '1px solid transparent',
                  color: activeView === btn.type 
                    ? btn.color 
                    : 'rgba(255, 255, 255, 0.5)',
                  boxShadow: activeView === btn.type
                    ? `0 0 20px ${btn.color}20`
                    : 'none',
                }}
              >
                <span>{btn.icon}</span>
                <span>{btn.label}</span>
              </button>
            ))}
          </div>
          
          {/* Right: Current View Insight */}
          <div className="flex items-center gap-3">
            <div 
              className="w-px h-8"
              style={{ background: 'rgba(255, 255, 255, 0.1)' }}
            />
            <div className="text-sm text-white/70 max-w-md">
              <span style={{ color: activeButton.color }}>{activeButton.icon}</span>
              {' '}
              {activeButton.insight}
            </div>
          </div>
        </div>
      </div>
      
      {/* Sankey Visualization - Clean, full space */}
      <div className="absolute inset-0 pt-20 pb-4">
        <SankeyFlowV3
          key={activeView}
          state={flowState}
          stageLabels={['Input', 'Allocation', 'Distribution', 'Outcomes']}
          variant="before"
          brand={DEFAULT_BRAND}
          animated={true}
          showLabels={true}
          hideUI={true}
        />
      </div>
      
      {/* Bottom: Reserved for comparison cards (empty for now) */}
      {/* 
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
        Comparison cards will appear here on node hover/click
      </div>
      */}
    </div>
  );
};

export default StakeholderSankeyPOC;