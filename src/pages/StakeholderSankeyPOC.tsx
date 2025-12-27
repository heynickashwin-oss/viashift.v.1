/**
 * StakeholderSankeyPOC - Proof of Concept
 * 
 * Tests the hypothesis: Same visual framework, stakeholder-native data
 * - CFO sees dollars flowing
 * - Ops sees time flowing  
 * - Sales sees orders flowing
 * 
 * Current state only (no shifted state yet)
 * 
 * Usage: Add route in App.tsx:
 *   <Route path="/poc" element={<StakeholderSankeyPOC />} />
 */

import { useState, useMemo } from 'react';
import { SankeyFlowV3 } from '../components/sankeyflowv3';
import { 
  StakeholderViewType, 
  viewConfigs, 
  getFlowStateForView,
} from '../data/templates/stakeholderParallelData';
import { DEFAULT_BRAND } from '../components/branding/brandUtils';

// View toggle button styling
const VIEW_BUTTONS: { type: StakeholderViewType; icon: string; label: string; color: string }[] = [
  { type: 'orders', icon: '📦', label: 'Orders', color: '#00BFA6' },
  { type: 'dollars', icon: '💰', label: 'Dollars', color: '#22c55e' },
  { type: 'time', icon: '⏱️', label: 'Time', color: '#00D4E5' },
];

export const StakeholderSankeyPOC = () => {
  const [activeView, setActiveView] = useState<StakeholderViewType>('orders');
  
  // Get the flow state for the active view
  const flowState = useMemo(() => getFlowStateForView(activeView), [activeView]);
  const viewConfig = viewConfigs[activeView];
  
  return (
    <div 
      className="min-h-screen w-full"
      style={{ 
        background: 'linear-gradient(180deg, #0a0a0f 0%, #121218 50%, #0a0a0f 100%)',
      }}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6">
        <div className="flex items-center justify-between">
          {/* Title */}
          <div>
            <h1 className="text-xl font-semibold text-white/90">
              Stakeholder View POC
            </h1>
            <p className="text-sm text-white/50 mt-1">
              Same process, different stakeholder "languages"
            </p>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
            {VIEW_BUTTONS.map((btn) => (
              <button
                key={btn.type}
                onClick={() => setActiveView(btn.type)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: activeView === btn.type 
                    ? `linear-gradient(135deg, ${btn.color}20 0%, ${btn.color}10 100%)`
                    : 'transparent',
                  border: activeView === btn.type 
                    ? `1px solid ${btn.color}40`
                    : '1px solid transparent',
                  color: activeView === btn.type 
                    ? btn.color 
                    : 'rgba(255, 255, 255, 0.6)',
                }}
              >
                <span>{btn.icon}</span>
                <span>{btn.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* View Info Banner */}
      <div className="absolute top-24 left-6 right-6 z-20">
        <div 
          className="flex items-center justify-between p-4 rounded-xl"
          style={{
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
              style={{ 
                background: `${VIEW_BUTTONS.find(b => b.type === activeView)?.color}15`,
                border: `1px solid ${VIEW_BUTTONS.find(b => b.type === activeView)?.color}30`,
              }}
            >
              {VIEW_BUTTONS.find(b => b.type === activeView)?.icon}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {viewConfig.title}
              </h2>
              <p className="text-sm text-white/60">
                {viewConfig.audienceLabel} • {viewConfig.totalInput.toLocaleString()} {viewConfig.unit} total input
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-white/40 mb-1">Key Insight</div>
            <div className="text-sm text-white/80 max-w-md">
              {viewConfig.insight}
            </div>
          </div>
        </div>
      </div>
      
      {/* Sankey Visualization */}
      <div className="absolute inset-0 pt-44">
        <SankeyFlowV3
          key={activeView} // Force remount on view change for clean animation
          state={flowState}
          stageLabels={['Input', 'Allocation', 'Distribution', 'Outcomes']}
          variant="before"
          brand={DEFAULT_BRAND}
          animated={true}
          showLabels={true}
        />
      </div>
      
      {/* Comparison Hint */}
      <div className="absolute bottom-6 left-6 right-6 z-20">
        <div 
          className="flex items-center justify-center gap-8 p-4 rounded-xl"
          style={{
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {activeView === 'orders' ? '18%' : activeView === 'dollars' ? '24%' : '26%'}
            </div>
            <div className="text-xs text-white/50">
              {activeView === 'orders' ? 'Orders with Errors' : activeView === 'dollars' ? 'Budget Wasted' : 'Capacity Lost'}
            </div>
          </div>
          
          <div className="h-8 w-px bg-white/20" />
          
          <div className="text-sm text-white/60 max-w-sm">
            <span className="text-white/40">Toggle views above to see:</span>
            <br />
            Same process, same problems—
            <span style={{ color: VIEW_BUTTONS.find(b => b.type === activeView)?.color }}>
              {' '}different stakeholder impact
            </span>
          </div>
          
          <div className="h-8 w-px bg-white/20" />
          
          {/* Cross-reference hints */}
          <div className="flex items-center gap-4">
            {VIEW_BUTTONS.filter(b => b.type !== activeView).map(btn => (
              <button
                key={btn.type}
                onClick={() => setActiveView(btn.type)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all duration-200 hover:bg-white/10"
                style={{
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: 'rgba(255, 255, 255, 0.7)',
                }}
              >
                <span>{btn.icon}</span>
                <span>See {btn.label} View</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakeholderSankeyPOC;