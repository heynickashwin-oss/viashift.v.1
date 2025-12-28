/**
 * NarrativeBar.tsx
 * 
 * Human-centered narrative - perspective-based storytelling.
 * No chrome, just floating text with a storytelling feel.
 * 
 * Inspired by: Hans Rosling, Spotify Wrapped, NYT visual essays
 */

import { memo, useMemo } from 'react';

// ============================================
// TYPES
// ============================================

export type NarrativeVariant = 'before' | 'after';

export interface NarrativeScript {
  setup: string;      // The human context
  tension: string;    // The problem they feel
  impact: string;     // The cost that matters
  cta: string;
}

export interface NarrativeBarProps {
  lens: 'orders' | 'dollars' | 'time';
  variant: NarrativeVariant;
  progress: number;
  accentColor?: string;
  onFeedbackClick?: () => void;
}

// ============================================
// NARRATIVE SCRIPTS - Human perspective
// ============================================

const NARRATIVES: Record<string, Record<NarrativeVariant, NarrativeScript>> = {
  orders: {
    before: {
      setup: "Your team processes 500 orders every week",
      tension: "but 87 of them need manual fixing",
      impact: "that's 140 customers waiting longer than promised.",
      cta: "Is this what you're seeing?",
    },
    after: {
      setup: "With validation upstream, 500 orders flow through",
      tension: "only 5 need a human touch",
      impact: "94% of customers get what they expected, on time.",
      cta: "Does this feel possible?",
    },
  },
  dollars: {
    before: {
      setup: "Finance allocates $4,100 every week to processing",
      tension: "but $987 of that pays for fixing mistakes",
      impact: "that's $51K a year spent cleaning up problems.",
      cta: "Is this what you're seeing?",
    },
    after: {
      setup: "With automation catching errors early",
      tension: "$3,096 flows straight to productive work",
      impact: "$161K a year goes to growth instead of firefighting.",
      cta: "Does this feel possible?",
    },
  },
  time: {
    before: {
      setup: "Your team has 117 hours of capacity each week",
      tension: "but 30 of those hours go to rework",
      impact: "your best people spend a third of their time fixing.",
      cta: "Is this what you're seeing?",
    },
    after: {
      setup: "With problems caught before they spread",
      tension: "111 hours stay focused on real work",
      impact: "a team that builds instead of firefights.",
      cta: "Does this feel possible?",
    },
  },
};

const CTA_LABEL: Record<NarrativeVariant, string> = {
  before: "Tell us what's different →",
  after: "Share what concerns you →",
};

// ============================================
// MAIN COMPONENT
// ============================================

export const NarrativeBar = memo(({
  lens,
  variant,
  progress,
  accentColor = '#00e5ff',
  onFeedbackClick,
}: NarrativeBarProps) => {
  
  const script = NARRATIVES[lens]?.[variant] || NARRATIVES.orders.before;
  const ctaLabel = CTA_LABEL[variant];
  
  const visibility = useMemo(() => ({
    setup: progress >= 0.05,
    tension: progress >= 0.35,
    impact: progress >= 0.65,
    cta: progress >= 0.90,
  }), [progress]);

  // Serif font for storytelling feel
  const narrativeFont = 'Georgia, "Times New Roman", serif';
  
  return (
    <div 
      className="w-full text-center px-8"
      style={{
        opacity: progress > 0.02 ? 1 : 0,
        transition: 'opacity 0.5s ease-out',
      }}
    >
      {/* Story text - no background, just floating */}
      <p 
        className="text-xl md:text-2xl leading-relaxed"
        style={{ fontFamily: narrativeFont }}
      >
        {/* Setup - the human context */}
        <span
          className="transition-all duration-500"
          style={{
            color: visibility.tension ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.85)',
            fontStyle: 'italic',
            opacity: visibility.setup ? 1 : 0,
          }}
        >
          {script.setup}
        </span>
        
        {/* Connector */}
        <span
          className="mx-2 transition-opacity duration-300"
          style={{
            color: 'rgba(255, 255, 255, 0.25)',
            opacity: visibility.tension ? 1 : 0,
          }}
        >
          —
        </span>
        
        {/* Tension - the problem */}
        <span
          className="transition-all duration-500"
          style={{
            color: visibility.impact ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.9)',
            fontWeight: 500,
            opacity: visibility.tension ? 1 : 0,
          }}
        >
          {script.tension}
        </span>
        
        {/* Connector */}
        <span
          className="mx-2 transition-opacity duration-300"
          style={{
            color: 'rgba(255, 255, 255, 0.25)',
            opacity: visibility.impact ? 1 : 0,
          }}
        >
          —
        </span>
        
        {/* Impact - the punchline */}
        <span
          className="transition-all duration-500"
          style={{
            color: accentColor,
            fontWeight: 600,
            fontStyle: 'normal',
            textShadow: `0 0 40px ${accentColor}50`,
            opacity: visibility.impact ? 1 : 0,
          }}
        >
          {script.impact}
        </span>
      </p>
      
      {/* CTA - subtle, inviting */}
      <div
        className="mt-5 flex items-center justify-center gap-4 transition-all duration-700"
        style={{
          opacity: visibility.cta ? 1 : 0,
          transform: visibility.cta ? 'translateY(0)' : 'translateY(5px)',
        }}
      >
        <span 
          className="text-sm"
          style={{ 
            color: 'rgba(255, 255, 255, 0.5)',
            fontFamily: narrativeFont,
            fontStyle: 'italic',
          }}
        >
          {script.cta}
        </span>
        <button
          onClick={onFeedbackClick}
          className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105"
          style={{
            background: 'transparent',
            color: accentColor,
            border: `1px solid ${accentColor}`,
            boxShadow: `0 0 20px ${accentColor}20`,
          }}
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
});

NarrativeBar.displayName = 'NarrativeBar';

export default NarrativeBar;