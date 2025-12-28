/**
 * NarrativeBar.tsx
 * 
 * Progressive narrative that tells the story of the data.
 * Syncs with Sankey draw animation to reveal in phases.
 * 
 * Structure:
 * - Phase 1 (0-30%): Set the scene - volume, context
 * - Phase 2 (30-60%): Create tension - where value leaks  
 * - Phase 3 (60-90%): Land the impact - what it costs
 * - Final (90-100%): Invite engagement - validate/correct
 */

import { memo, useMemo } from 'react';

// ============================================
// TYPES
// ============================================

export type NarrativeVariant = 'before' | 'after';

export interface NarrativeScript {
  phase1: string;  // Scene setting
  phase2: string;  // Tension/problem
  phase3: string;  // Impact/stakes
  cta: string;     // Call to action question
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
// NARRATIVE SCRIPTS
// ============================================

const NARRATIVES: Record<string, Record<NarrativeVariant, NarrativeScript>> = {
  orders: {
    before: {
      phase1: "Every week, 500 orders enter your pipeline...",
      phase2: "But 87 orders (18%) require manual intervention—rework, corrections, escalations.",
      phase3: "The result? 72% on-time delivery. 140 customers per week wait longer than promised.",
      cta: "Does this match what you're seeing?",
    },
    after: {
      phase1: "With streamlined validation, 500 orders flow through cleanly...",
      phase2: "Automated checks catch issues early—only 5 orders (1%) need manual review.",
      phase3: "The result? 94% on-time delivery. Customer trust restored.",
      cta: "Does this feel achievable?",
    },
  },
  dollars: {
    before: {
      phase1: "Every week, $4,100 flows into your processing budget...",
      phase2: "But $1,545 (38%) gets absorbed by error handling—fixing problems instead of creating value.",
      phase3: "The result? $987/week in pure waste. That's $51K/year paying to clean up mistakes.",
      cta: "Does this match what you're seeing?",
    },
    after: {
      phase1: "With automation handling validation, your $4,100 budget works harder...",
      phase2: "$3,096/week (76%) now flows directly to value creation.",
      phase3: "The result? $161K/year recovered. Budget funds growth, not firefighting.",
      cta: "Does this feel achievable?",
    },
  },
  time: {
    before: {
      phase1: "Every week, your team has 117 hours of capacity...",
      phase2: "But 30 hours (26%) disappear into rework—the same problems, different day.",
      phase3: "The result? Your best people spend a third of their time fixing instead of building.",
      cta: "Does this match what you're seeing?",
    },
    after: {
      phase1: "With errors caught upstream, your 117 hours stay focused...",
      phase2: "111 hours (95%) now flow to strategic work that moves the needle.",
      phase3: "The result? A team that builds instead of firefights. Morale transforms.",
      cta: "Does this feel achievable?",
    },
  },
};

const CTA_BUTTONS: Record<NarrativeVariant, { label: string; subtext: string }> = {
  before: {
    label: "Help us get this right →",
    subtext: "Your input shapes the solution",
  },
  after: {
    label: "Share your concerns →",
    subtext: "Surface doubts before they become blockers",
  },
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
  const ctaButton = CTA_BUTTONS[variant];
  
  // Determine which phases are visible based on progress
  const phases = useMemo(() => {
    return {
      phase1: progress >= 0.05,
      phase2: progress >= 0.35,
      phase3: progress >= 0.65,
      cta: progress >= 0.90,
    };
  }, [progress]);
  
  // Get current narrative text to display
  const currentText = useMemo(() => {
    if (phases.phase3) return script.phase3;
    if (phases.phase2) return script.phase2;
    if (phases.phase1) return script.phase1;
    return '';
  }, [phases, script]);
  
  // Previous texts for stacking effect
  const previousTexts = useMemo(() => {
    const texts: string[] = [];
    if (phases.phase3) {
      texts.push(script.phase1, script.phase2);
    } else if (phases.phase2) {
      texts.push(script.phase1);
    }
    return texts;
  }, [phases, script]);
  
  return (
    <div 
      className="w-full max-w-3xl mx-auto px-6 py-4"
      style={{
        opacity: progress > 0.02 ? 1 : 0,
        transition: 'opacity 0.5s ease-out',
      }}
    >
      {/* Narrative container */}
      <div 
        className="rounded-xl p-6"
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        {/* Previous narrative phases - faded */}
        {previousTexts.map((text, i) => (
          <p
            key={i}
            className="text-base leading-relaxed mb-3 transition-all duration-500"
            style={{
              color: 'rgba(255, 255, 255, 0.35)',
            }}
          >
            {text}
          </p>
        ))}
        
        {/* Current narrative phase - highlighted */}
        <p
          className="text-lg leading-relaxed font-medium transition-all duration-700"
          style={{
            color: phases.phase3 ? accentColor : 'rgba(255, 255, 255, 0.9)',
            opacity: currentText ? 1 : 0,
            transform: currentText ? 'translateY(0)' : 'translateY(10px)',
          }}
        >
          {currentText}
        </p>
        
        {/* CTA Section */}
        <div
          className="mt-6 pt-5 border-t transition-all duration-700"
          style={{
            borderColor: 'rgba(255, 255, 255, 0.08)',
            opacity: phases.cta ? 1 : 0,
            transform: phases.cta ? 'translateY(0)' : 'translateY(10px)',
            pointerEvents: phases.cta ? 'auto' : 'none',
          }}
        >
          {/* Question */}
          <p 
            className="text-base font-medium mb-4"
            style={{ color: 'rgba(255, 255, 255, 0.8)' }}
          >
            {script.cta}
          </p>
          
          {/* CTA Button */}
          <button
            onClick={onFeedbackClick}
            className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: accentColor,
              color: '#000',
            }}
          >
            {ctaButton.label}
          </button>
          
          {/* Subtext */}
          <p 
            className="text-xs mt-2"
            style={{ color: 'rgba(255, 255, 255, 0.4)' }}
          >
            {ctaButton.subtext}
          </p>
        </div>
      </div>
    </div>
  );
});

NarrativeBar.displayName = 'NarrativeBar';

export default NarrativeBar;