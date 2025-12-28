/**
 * NarrativeBar.tsx
 * 
 * Cinematic horizontal narrative - flows like a sentence.
 * No boxes, just floating text that reads left to right.
 */

import { memo, useMemo } from 'react';

// ============================================
// TYPES
// ============================================

export type NarrativeVariant = 'before' | 'after';

export interface NarrativeScript {
  part1: string;
  part2: string;
  part3: string;
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
      part3: "a third of your time fixing instead of building.",
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
  
  const visibility = useMemo(() => ({
    part1: progress >= 0.05,
    part2: progress >= 0.35,
    part3: progress >= 0.65,
    cta: progress >= 0.90,
  }), [progress]);

  const textShadow = '0 2px 20px rgba(0, 0, 0, 0.9), 0 1px 3px rgba(0, 0, 0, 0.9)';
  
  return (
    <div 
      className="w-full text-center px-8"
      style={{
        opacity: progress > 0.02 ? 1 : 0,
        transition: 'opacity 0.5s ease-out',
      }}
    >
      {/* Narrative - single flowing line */}
      <p className="text-xl md:text-2xl font-light tracking-wide leading-relaxed">
        {/* Part 1 */}
        <span
          className="transition-all duration-500"
          style={{
            color: visibility.part2 ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.9)',
            textShadow,
            opacity: visibility.part1 ? 1 : 0,
          }}
        >
          {script.part1}
        </span>
        
        {/* Arrow 1 */}
        <span
          className="transition-opacity duration-300 mx-2"
          style={{
            color: 'rgba(255, 255, 255, 0.3)',
            textShadow,
            opacity: visibility.part2 ? 1 : 0,
          }}
        >
          →
        </span>
        
        {/* Part 2 */}
        <span
          className="transition-all duration-500"
          style={{
            color: visibility.part3 ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.9)',
            textShadow,
            opacity: visibility.part2 ? 1 : 0,
          }}
        >
          {script.part2}
        </span>
        
        {/* Arrow 2 */}
        <span
          className="transition-opacity duration-300 mx-2"
          style={{
            color: 'rgba(255, 255, 255, 0.3)',
            textShadow,
            opacity: visibility.part3 ? 1 : 0,
          }}
        >
          →
        </span>
        
        {/* Part 3 - emphasized */}
        <span
          className="font-medium transition-all duration-500"
          style={{
            color: accentColor,
            textShadow: `${textShadow}, 0 0 30px ${accentColor}50`,
            opacity: visibility.part3 ? 1 : 0,
          }}
        >
          {script.part3}
        </span>
      </p>
      
      {/* CTA row */}
      <div
        className="mt-4 transition-all duration-700 flex items-center justify-center gap-4"
        style={{
          opacity: visibility.cta ? 1 : 0,
          transform: visibility.cta ? 'translateY(0)' : 'translateY(5px)',
        }}
      >
        <span 
          className="text-base"
          style={{ 
            color: 'rgba(255, 255, 255, 0.5)',
            textShadow,
          }}
        >
          {script.cta}
        </span>
        <button
          onClick={onFeedbackClick}
          className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 100%)`,
            color: '#000',
            boxShadow: `0 4px 20px ${accentColor}40`,
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