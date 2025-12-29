/**
 * NarrativeBar.tsx
 * 
 * Human-centered narrative - single line storytelling.
 * The hook that draws viewers in before they explore the data.
 */

import { memo, useMemo } from 'react';

// ============================================
// TYPES
// ============================================

export type NarrativeVariant = 'before' | 'after';

export interface NarrativeScript {
  setup: string;
  tension: string;
  impact: string;
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
// NARRATIVE SCRIPTS
// ============================================

const NARRATIVES: Record<string, Record<NarrativeVariant, NarrativeScript>> = {
  orders: {
    before: {
      setup: "Your team processes 500 orders every week",
      tension: "but 87 of them need manual fixing",
      impact: "that's 140 customers left waiting.",
      cta: "Is this right?",
    },
    after: {
      setup: "With validation upstream, 500 orders flow through",
      tension: "only 5 need a human touch",
      impact: "94% of customers get what they expected.",
      cta: "Feel possible?",
    },
  },
  dollars: {
    before: {
      setup: "Finance allocates $4,100 every week to processing",
      tension: "but $987 pays for fixing mistakes",
      impact: "that's $51K a year wasted.",
      cta: "Is this right?",
    },
    after: {
      setup: "With automation catching errors early",
      tension: "$3,096 flows straight to productive work",
      impact: "$161K a year recovered.",
      cta: "Feel possible?",
    },
  },
  time: {
    before: {
      setup: "Your team has 117 hours of capacity each week",
      tension: "but 30 hours go to rework",
      impact: "a third of their time fixing.",
      cta: "Is this right?",
    },
    after: {
      setup: "With problems caught before they spread",
      tension: "111 hours stay focused on real work",
      impact: "a team that builds.",
      cta: "Feel possible?",
    },
  },
};

const CTA_LABEL: Record<NarrativeVariant, string> = {
  before: "Tell us →",
  after: "Concerns? →",
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

  const narrativeFont = 'Georgia, "Times New Roman", serif';
  
  return (
    <div 
      className="w-full text-center px-4"
      style={{
        opacity: progress > 0.02 ? 1 : 0,
        transition: 'opacity 0.5s ease-out',
      }}
    >
      {/* Single line: narrative + CTA */}
      <div className="flex items-center justify-center gap-6 flex-wrap">
        <p 
          className="text-lg md:text-xl leading-relaxed"
          style={{ fontFamily: narrativeFont }}
        >
          {/* Setup - subtle entrance */}
          <span
            className="inline-block transition-all duration-700 ease-out"
            style={{
              color: visibility.tension ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.85)',
              fontStyle: 'italic',
              opacity: visibility.setup ? 1 : 0,
              transform: visibility.setup 
                ? 'translate(0, 0) scale(1)' 
                : 'translate(-30px, 20px) scale(0.95)',
            }}
          >
            {script.setup}
          </span>
          
          <span
            className="inline-block transition-all duration-500 ease-out mx-2"
            style={{
              color: 'rgba(255, 255, 255, 0.25)',
              opacity: visibility.tension ? 1 : 0,
              transform: visibility.tension
                ? 'translate(0, 0)'
                : 'translate(-3px, 2px)',
            }}
          >
            —
          </span>
          
          {/* Tension - slightly more movement */}
          <span
            className="inline-block transition-all duration-700 ease-out"
            style={{
              color: visibility.impact ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.9)',
              fontWeight: 500,
              opacity: visibility.tension ? 1 : 0,
              transform: visibility.tension 
                ? 'translate(0, 0)' 
                : 'translate(-6px, 4px)',
            }}
          >
            {script.tension}
          </span>
          
          <span
            className="inline-block transition-all duration-500 ease-out mx-2"
            style={{
              color: 'rgba(255, 255, 255, 0.25)',
              opacity: visibility.impact ? 1 : 0,
              transform: visibility.impact
                ? 'translate(0, 0)'
                : 'translate(-3px, 2px)',
            }}
          >
            —
          </span>
          
          {/* Impact - the punchline, most movement */}
          <span
            className="inline-block transition-all duration-700 ease-out"
            style={{
              color: accentColor,
              fontWeight: 600,
              fontStyle: 'normal',
              textShadow: `0 0 30px ${accentColor}40`,
              opacity: visibility.impact ? 1 : 0,
              transform: visibility.impact 
                ? 'translate(0, 0)' 
                : 'translate(-8px, 5px)',
            }}
          >
            {script.impact}
          </span>
        </p>
        
        {/* Inline CTA - gentle entrance */}
        <div
          className="flex items-center gap-2 transition-all duration-700 ease-out"
          style={{
            opacity: visibility.cta ? 1 : 0,
            transform: visibility.cta 
              ? 'translate(0, 0)' 
              : 'translate(-6px, 4px)',
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
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105"
            style={{
              background: 'transparent',
              color: accentColor,
              border: `1px solid ${accentColor}80`,
            }}
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
});

NarrativeBar.displayName = 'NarrativeBar';

export default NarrativeBar;