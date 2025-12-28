/**
 * ComparisonDrawer.tsx
 * 
 * Slide-up drawer showing stakeholder perspectives for a specific node.
 * 
 * FOMU-aligned language changes based on state:
 * - Current (before): Validate understanding, surface disagreements
 * - Shifted (after): Make change feel safe, surface concerns
 * 
 * Design principles:
 * - Slide up feels tactile and alive
 * - Premium dark aesthetic
 * - Clear hierarchy: node name → perspectives → narrative → CTA
 * - Every surface has path to engagement (viral loop)
 */

import { memo, useEffect, useCallback } from 'react';
import type { NodeComparison, StakeholderRole } from '../types/stakeholderComparison';
import { STAKEHOLDER_ROLES, getActiveRoles } from '../types/stakeholderComparison';
import type { SocialProof } from './NodeHoverCard';

// ============================================
// TYPES
// ============================================

export interface ComparisonDrawerProps {
  /** The comparison data to display */
  comparison: NodeComparison | null;
  
  /** Whether the drawer is open */
  isOpen: boolean;
  
  /** Close handler */
  onClose: () => void;
  
  /** Which state we're showing */
  variant?: 'before' | 'after';
  
  /** Accent color for the current view */
  accentColor?: string;
  
  /** Social proof data for this node */
  socialProof?: SocialProof;
  
  /** Callback when feedback CTA is clicked */
  onFeedbackClick?: () => void;
}

// ============================================
// FOMU LANGUAGE CONFIG
// ============================================

const FOMU_LANGUAGE = {
  before: {
    subtitle: 'What this means for each stakeholder',
    question: 'Does this match what you're seeing?',
    cta: 'Help us get this right →',
    ctaSubtext: 'Your input shapes the solution',
  },
  after: {
    subtitle: 'How this changes for each stakeholder',
    question: 'Does this feel achievable?',
    cta: 'Share your concerns →',
    ctaSubtext: 'Surface doubts before they become blockers',
  },
};

// ============================================
// SENTIMENT STYLING
// ============================================

const SENTIMENT_STYLES = {
  pain: {
    bg: 'rgba(239, 68, 68, 0.08)',
    border: 'rgba(239, 68, 68, 0.25)',
    text: '#f87171',
    icon: '↓',
  },
  neutral: {
    bg: 'rgba(148, 163, 184, 0.08)',
    border: 'rgba(148, 163, 184, 0.25)',
    text: '#94a3b8',
    icon: '→',
  },
  gain: {
    bg: 'rgba(74, 222, 128, 0.08)',
    border: 'rgba(74, 222, 128, 0.25)',
    text: '#4ade80',
    icon: '↑',
  },
};

// ============================================
// INSIGHT CARD COMPONENT
// ============================================

interface InsightCardProps {
  role: StakeholderRole;
  insight: {
    value: string;
    label: string;
    sentiment: 'pain' | 'neutral' | 'gain';
    detail?: string;
  };
  delay: number;
  isVisible: boolean;
}

const InsightCard = memo(({ role, insight, delay, isVisible }: InsightCardProps) => {
  const roleMeta = STAKEHOLDER_ROLES[role];
  const sentimentStyle = SENTIMENT_STYLES[insight.sentiment];
  
  return (
    <div
      className="rounded-xl transition-all duration-500 ease-out"
      style={{
        background: sentimentStyle.bg,
        border: `1px solid ${sentimentStyle.border}`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      <div className="p-4">
        {/* Role header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">{roleMeta.icon}</span>
          <span 
            className="text-sm font-semibold"
            style={{ color: roleMeta.color }}
          >
            {roleMeta.label}
          </span>
        </div>
        
        {/* Value + Label */}
        <div className="flex items-baseline gap-2 mb-1">
          <span 
            className="text-2xl font-bold"
            style={{ color: sentimentStyle.text }}
          >
            {insight.value}
          </span>
          <span 
            className="text-sm"
            style={{ color: 'rgba(255, 255, 255, 0.6)' }}
          >
            {insight.label}
          </span>
        </div>
        
        {/* Detail (if present) */}
        {insight.detail && (
          <p 
            className="text-xs mt-2 leading-relaxed"
            style={{ color: 'rgba(255, 255, 255, 0.45)' }}
          >
            {insight.detail}
          </p>
        )}
      </div>
    </div>
  );
});

InsightCard.displayName = 'InsightCard';

// ============================================
// SOCIAL PROOF COMPONENT
// ============================================

interface SocialProofRowProps {
  socialProof: SocialProof;
  isVisible: boolean;
  delay: number;
}

const SocialProofRow = memo(({ socialProof, isVisible, delay }: SocialProofRowProps) => {
  const hasSocialProof = socialProof.thumbsUp > 0 || 
                         socialProof.thumbsDown > 0 || 
                         socialProof.comments > 0;
  
  if (!hasSocialProof) return null;
  
  return (
    <div
      className="flex items-center gap-4 transition-all duration-500"
      style={{
        opacity: isVisible ? 1 : 0,
        transitionDelay: `${delay}ms`,
      }}
    >
      {socialProof.thumbsUp > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="text-base">👍</span>
          <span 
            className="text-sm font-medium"
            style={{ color: 'rgba(74, 222, 128, 0.9)' }}
          >
            {socialProof.thumbsUp}
          </span>
        </div>
      )}
      {socialProof.thumbsDown > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="text-base">👎</span>
          <span 
            className="text-sm font-medium"
            style={{ color: 'rgba(239, 68, 68, 0.9)' }}
          >
            {socialProof.thumbsDown}
          </span>
        </div>
      )}
      {socialProof.comments > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="text-base">💬</span>
          <span 
            className="text-sm font-medium"
            style={{ color: 'rgba(255, 255, 255, 0.6)' }}
          >
            {socialProof.comments}
          </span>
        </div>
      )}
      <span 
        className="text-xs"
        style={{ color: 'rgba(255, 255, 255, 0.4)' }}
      >
        have weighed in
      </span>
    </div>
  );
});

SocialProofRow.displayName = 'SocialProofRow';

// ============================================
// MAIN DRAWER COMPONENT
// ============================================

export const ComparisonDrawer = memo(({
  comparison,
  isOpen,
  onClose,
  variant = 'before',
  accentColor = '#00e5ff',
  socialProof,
  onFeedbackClick,
}: ComparisonDrawerProps) => {
  
  // Get FOMU language for current variant
  const fomu = FOMU_LANGUAGE[variant];
  
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  // Get active roles for this comparison
  const activeRoles = comparison ? getActiveRoles(comparison) : [];
  
  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);
  
  // Calculate animation delays
  const baseDelay = activeRoles.length * 75;
  
  return (
    <>
      {/* Backdrop - dims the Sankey */}
      <div
        className="fixed inset-0 z-40 transition-all duration-500"
        style={{
          background: isOpen ? 'rgba(10, 10, 15, 0.7)' : 'transparent',
          backdropFilter: isOpen ? 'blur(4px)' : 'none',
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
        onClick={handleBackdropClick}
      />
      
      {/* Drawer */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 transition-transform duration-500 ease-out"
        style={{
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        <div
          className="mx-auto max-w-4xl rounded-t-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(20, 20, 25, 0.98) 0%, rgba(15, 15, 20, 0.99) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderBottom: 'none',
            boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div 
              className="w-12 h-1 rounded-full"
              style={{ background: 'rgba(255, 255, 255, 0.2)' }}
            />
          </div>
          
          {/* Header */}
          <div 
            className="px-6 py-4 border-b flex items-center justify-between"
            style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
          >
            <div>
              <h2 
                className="text-lg font-semibold"
                style={{ color: 'rgba(255, 255, 255, 0.95)' }}
              >
                {comparison?.nodeName || 'Node'} Step
              </h2>
              <p 
                className="text-sm mt-0.5"
                style={{ color: 'rgba(255, 255, 255, 0.5)' }}
              >
                {fomu.subtitle}
              </p>
            </div>
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>✕</span>
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {/* Insight cards grid */}
            {comparison && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {activeRoles.map((role, index) => {
                  const insight = comparison.insights[role];
                  if (!insight) return null;
                  
                  return (
                    <InsightCard
                      key={role}
                      role={role}
                      insight={insight}
                      delay={index * 75}
                      isVisible={isOpen}
                    />
                  );
                })}
              </div>
            )}
            
            {/* Alignment narrative */}
            {comparison?.alignmentNarrative && (
              <div
                className="p-4 rounded-xl transition-all duration-500 ease-out"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  opacity: isOpen ? 1 : 0,
                  transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
                  transitionDelay: `${baseDelay + 100}ms`,
                }}
              >
                <p 
                  className="text-sm leading-relaxed italic"
                  style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  "{comparison.alignmentNarrative}"
                </p>
              </div>
            )}
            
            {/* FOMU Feedback Section */}
            <div
              className="mt-6 p-5 rounded-xl transition-all duration-500 ease-out"
              style={{
                background: `linear-gradient(135deg, ${accentColor}08 0%, ${accentColor}04 100%)`,
                border: `1px solid ${accentColor}20`,
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: `${baseDelay + 200}ms`,
              }}
            >
              {/* Social proof row */}
              {socialProof && (
                <div className="mb-4">
                  <SocialProofRow 
                    socialProof={socialProof} 
                    isVisible={isOpen}
                    delay={baseDelay + 250}
                  />
                </div>
              )}
              
              {/* FOMU question */}
              <p 
                className="text-base font-medium mb-4"
                style={{ color: 'rgba(255, 255, 255, 0.9)' }}
              >
                {fomu.question}
              </p>
              
              {/* Feedback CTA */}
              <button
                onClick={onFeedbackClick}
                className="w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] group"
                style={{
                  background: accentColor,
                  color: '#000',
                }}
              >
                <span className="font-semibold">{fomu.cta}</span>
              </button>
              
              {/* CTA subtext */}
              <p 
                className="text-xs text-center mt-2"
                style={{ color: 'rgba(255, 255, 255, 0.4)' }}
              >
                {fomu.ctaSubtext}
              </p>
            </div>
          </div>
          
          {/* Bottom padding for safe area */}
          <div className="h-6" />
        </div>
      </div>
    </>
  );
});

ComparisonDrawer.displayName = 'ComparisonDrawer';

export default ComparisonDrawer;