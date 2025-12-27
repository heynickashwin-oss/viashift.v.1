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

// Cross-reference data - what other views see for the same "waste point"
const CROSS_REFERENCE_DATA: Record<StakeholderViewType, { 
  metric: string; 
  label: string;
  subtext: string;
}> = {
  orders: { 
    metric: '87', 
    label: 'orders with errors',
    subtext: '18% error rate',
  },
  dollars: { 
    metric: '$987', 
    label: 'wasted per week',
    subtext: '$51K annually',
  },
  time: { 
    metric: '30 hrs', 
    label: 'lost capacity',
    subtext: '26% of team time',
  },
};

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
      
      {/* Cross-Reference Bar - Shows other stakeholder perspectives */}
      <div className="absolute bottom-6 left-6 right-6 z-20">
        <div 
          className="p-4 rounded-xl"
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {/* Current view indicator */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span 
                className="text-xs font-medium px-2 py-1 rounded"
                style={{ 
                  background: `${VIEW_BUTTONS.find(b => b.type === activeView)?.color}20`,
                  color: VIEW_BUTTONS.find(b => b.type === activeView)?.color,
                }}
              >
                {VIEW_BUTTONS.find(b => b.type === activeView)?.icon} Currently viewing: {viewConfig.title}
              </span>
            </div>
            <div className="text-xs text-white/40">
              Same problem, different perspectives
            </div>
          </div>
          
          {/* Cross-reference cards for other views */}
          <div className="flex items-stretch gap-4">
            {VIEW_BUTTONS.filter(btn => btn.type !== activeView).map((btn) => {
              const crossRef = CROSS_REFERENCE_DATA[btn.type];
              return (
                <button
                  key={btn.type}
                  onClick={() => setActiveView(btn.type)}
                  className="flex-1 p-3 rounded-lg transition-all duration-200 hover:scale-[1.02] text-left group"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                      style={{ 
                        background: `${btn.color}15`,
                        border: `1px solid ${btn.color}25`,
                      }}
                    >
                      {btn.icon}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span 
                          className="text-xl font-bold"
                          style={{ color: btn.color }}
                        >
                          {crossRef.metric}
                        </span>
                        <span className="text-sm text-white/70">
                          {crossRef.label}
                        </span>
                      </div>
                      <div className="text-xs text-white/40 mt-0.5">
                        {crossRef.subtext}
                      </div>
                    </div>
                    
                    {/* Hover hint */}
                    <div 
                      className="text-xs opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      style={{ color: btn.color }}
                    >
                      View →
                    </div>
                  </div>
                </button>
              );
            })}
            
            {/* Alignment indicator */}
            <div 
              className="w-px self-stretch"
              style={{ background: 'rgba(255, 255, 255, 0.1)' }}
            />
            <div className="flex flex-col justify-center px-4 shrink-0">
              <div className="text-xs text-white/40 mb-1">The same problem</div>
              <div className="text-sm text-white/70">
                <span style={{ color: '#ef4444' }}>3 stakeholders</span> feeling the pain
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakeholderSankeyPOC;