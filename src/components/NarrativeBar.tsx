/**
 * NarrativeBar.tsx
 * 
 * Horizontal narrative strip that tells the story as a flowing sentence.
 * Builds left-to-right as the Sankey animates.
 * 
 * Compact design - takes minimal vertical space.
 */

import { memo, useMemo } from 'react';

// ============================================
// TYPES
// ============================================

export type NarrativeVariant = 'before' | 'after';

export interface NarrativeScript {
  part1: string;  // Scene setting
  part2: string;  // Tension/problem
  part3: string;  // Impact/stakes
  cta: string;    // Call to action
}

export interface NarrativeBarProps {
  /** Which lens is active */
  lens: 'orders' | 'dollars' | 'time';
  
  /** Current/shifted state */
  variant: NarrativeVariant;
  
  /** Animation progress 0-1 */
  progress: number;
  
  /** Accent color for the lens */
  accentColor?: string;
  
  /** Callback when feedback CTA is clicked */
  onFeedbackClick?: () => void;
}

// ============================================
// NARRATIVE SCRIPTS - Flowing sentences
// ============================================

const NARRATIVES: Record<string, Record<NarrativeVariant, NarrativeScript>> = {
  orders: {
    before: {
      part1: "Every week, 500 orders enter your pipeline",
      part2: "but 87 (18%) require manual rework",
      part3: "leaving just 72% delivered on-time.",
      cta: "Does this match?",
    },
    after: {
      part1: "With streamlined validation, 500 orders flow through",
      part2: "only 5 (1%) need manual review",
      part3: "delivering 94% on-time.",
      cta: "Feel achievable?",
    },
  },
  dollars: {
    before: {
      part1: "Every week, $4,100 enters your processing budget",
      part2: "but $987 (24%) becomes pure waste",
      part3: "that's $51K/year lost to fixing mistakes.",
      cta: "Does this match?",
    },
    after: {
      part1: "With automation, your $4,100 budget works harder",
      part2: "$3,096 (76%) flows to value creation",
      part3: "recovering $161K/year for growth.",
      cta: "Feel achievable?",
    },
  },
  time: {
    before: {
      part1: "Every week, your team has 117 hours of capacity",
      part2: "but 30 hours (26%) disappear into rework",
      part3: "a third of your best people fixing instead of building.",
      cta: "Does this match?",
    },
    after: {
      part1: "With errors caught upstream, 117 hours stay focused",
      part2: "111 hours (95%) flow to strategic work",
      part3: "a team that builds instead of firefights.",
      cta: "Feel achievable?",
    },
  },
};

const CTA_LABEL: Record<NarrativeVariant, string> = {
  before: "Help us get this right →",
  after: "Share your concerns →",
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
  
  // Determine which parts are visible based on progress
  const visibility = useMemo(() => {
    return {
      part1: progress >= 0.05,
      part2: progress >= 0.35,
      part3: progress >= 0.65,
      cta: progress >= 0.90,
    };
  }, [progress]);
  
  return (
    <div 
      className="w-full max-w-5xl mx-auto px-6"
      style={{
        opacity: progress > 0.02 ? 1 : 0,
        transition: 'opacity 0.5s ease-out',
      }}
    >
      {/* Narrative strip */}
      <div 
        className="rounded-lg px-6 py-4 flex flex-wrap items-center gap-x-1.5 gap-y-1"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        {/* Part 1 */}
        <span
          className="text-base transition-all duration-500"
          style={{
            color: visibility.part2 ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.9)',
            opacity: visibility.part1 ? 1 : 0,
          }}
        >
          {script.part1}
        </span>
        
        {/* Connector */}
        {visibility.part2 && (
          <span 
            className="text-base transition-opacity duration-300"
            style={{ color: 'rgba(255, 255, 255, 0.3)' }}
          >
            →
          </span>
        )}
        
        {/* Part 2 */}
        <span
          className="text-base transition-all duration-500"
          style={{
            color: visibility.part3 ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.9)',
            opacity: visibility.part2 ? 1 : 0,
          }}
        >
          {script.part2}
        </span>
        
        {/* Connector */}
        {visibility.part3 && (
          <span 
            className="text-base transition-opacity duration-300"
            style={{ color: 'rgba(255, 255, 255, 0.3)' }}
          >
            →
          </span>
        )}
        
        {/* Part 3 - emphasized */}
        <span
          className="text-base font-medium transition-all duration-500"
          style={{
            color: accentColor,
            opacity: visibility.part3 ? 1 : 0,
          }}
        >
          {script.part3}
        </span>
        
        {/* Spacer */}
        <span className="flex-1" />
        
        {/* CTA */}
        <span
          className="flex items-center gap-3 transition-all duration-500"
          style={{
            opacity: visibility.cta ? 1 : 0,
          }}
        >
          <span 
            className="text-sm"
            style={{ color: 'rgba(255, 255, 255, 0.6)' }}
          >
            {script.cta}
          </span>
          <button
            onClick={onFeedbackClick}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-[1.03]"
            style={{
              background: accentColor,
              color: '#000',
            }}
          >
            {ctaLabel}
          </button>
        </span>
      </div>
    </div>
  );
});

NarrativeBar.displayName = 'NarrativeBar';

export default NarrativeBar;