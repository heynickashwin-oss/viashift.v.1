/**
 * Interactive Element Styles
 * 
 * Global styling patterns for clickable/interactive elements.
 * Creates consistent "this is clickable" visual language across viashift.
 * 
 * Usage:
 *   import { interactiveStyles, getInteractiveStyle } from '../styles/interactiveElements';
 *   
 *   // In JSX:
 *   <button style={getInteractiveStyle('default', accentColor)}>...</button>
 *   
 *   // Or with Tailwind classes:
 *   <button className={interactiveStyles.classes.base}>...</button>
 */

// ============================================
// STYLE TOKENS
// ============================================

export const INTERACTIVE_TOKENS = {
  // Rest state
  rest: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: 'rgba(255, 255, 255, 0.12)',
    text: 'rgba(255, 255, 255, 0.6)',
    shadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
  },
  
  // Hover state (uses accent color)
  hover: {
    backgroundOpacity: '0.08', // ${accentColor}08
    borderOpacity: '0.50',     // ${accentColor}50
    text: 'rgba(255, 255, 255, 1)',
    shadowOpacity: '0.20',     // ${accentColor}20
    lift: '-1px',              // translateY
  },
  
  // Active/pressed state
  active: {
    backgroundOpacity: '0.12',
    borderOpacity: '0.60',
    lift: '0px',
  },
  
  // Focus state (accessibility)
  focus: {
    ringColor: 'rgba(0, 229, 255, 0.5)', // Parallax Cyan
    ringWidth: '2px',
    ringOffset: '2px',
  },
} as const;

// ============================================
// TAILWIND CLASS PATTERNS
// ============================================

export const interactiveStyles = {
  /** Base classes for any interactive element */
  classes: {
    /** Foundation: cursor, transition, outline removal */
    base: 'cursor-pointer transition-all duration-300 outline-none',
    
    /** Standard pill/button shape */
    pill: 'rounded-full px-3 py-1.5',
    
    /** Card shape */
    card: 'rounded-xl p-4',
    
    /** Hover lift effect */
    hoverLift: 'hover:-translate-y-0.5',
    
    /** Focus ring for accessibility */
    focusRing: 'focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-transparent',
    
    /** Group hover support (for child elements) */
    group: 'group',
    groupHoverText: 'group-hover:text-white',
  },
  
  /** Combined class presets */
  presets: {
    /** Standard interactive pill (Compare Lenses, etc) */
    pill: 'cursor-pointer transition-all duration-300 outline-none rounded-full px-3 py-1.5 hover:-translate-y-0.5 group',
    
    /** Interactive card (toggle cards, etc) */
    card: 'cursor-pointer transition-all duration-300 outline-none rounded-xl p-4 hover:-translate-y-0.5',
    
    /** Minimal interactive (just cursor + transition) */
    minimal: 'cursor-pointer transition-all duration-300',
  },
};

// ============================================
// INLINE STYLE GENERATORS
// ============================================

export type InteractiveVariant = 'default' | 'pill' | 'card' | 'ghost';

interface InteractiveStyleOptions {
  /** Accent color for hover states (hex) */
  accentColor?: string;
  /** Whether element is currently active/selected */
  isActive?: boolean;
  /** Whether to include hover state styles (for CSS-in-JS) */
  includeHover?: boolean;
}

/**
 * Generate inline styles for an interactive element
 */
export function getInteractiveStyle(
  variant: InteractiveVariant = 'default',
  options: InteractiveStyleOptions = {}
): React.CSSProperties {
  const { 
    accentColor = '#00e5ff',
    isActive = false,
  } = options;
  
  const baseStyles: React.CSSProperties = {
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  };
  
  switch (variant) {
    case 'pill':
      return {
        ...baseStyles,
        background: isActive 
          ? `${accentColor}15`
          : INTERACTIVE_TOKENS.rest.background,
        border: `1px solid ${isActive ? `${accentColor}50` : INTERACTIVE_TOKENS.rest.border}`,
        boxShadow: isActive 
          ? `0 4px 16px ${accentColor}20`
          : INTERACTIVE_TOKENS.rest.shadow,
        borderRadius: '9999px',
        padding: '6px 12px',
      };
      
    case 'card':
      return {
        ...baseStyles,
        background: isActive 
          ? `linear-gradient(135deg, ${accentColor}15 0%, ${accentColor}08 100%)`
          : INTERACTIVE_TOKENS.rest.background,
        border: `1px solid ${isActive ? `${accentColor}40` : INTERACTIVE_TOKENS.rest.border}`,
        boxShadow: isActive 
          ? `0 4px 24px ${accentColor}15`
          : 'none',
        borderRadius: '12px',
        padding: '16px',
      };
      
    case 'ghost':
      return {
        ...baseStyles,
        background: 'transparent',
        border: 'none',
      };
      
    default:
      return {
        ...baseStyles,
        background: INTERACTIVE_TOKENS.rest.background,
        border: `1px solid ${INTERACTIVE_TOKENS.rest.border}`,
        boxShadow: INTERACTIVE_TOKENS.rest.shadow,
      };
  }
}

/**
 * Generate hover state styles (for use with onMouseEnter/Leave or CSS-in-JS)
 */
export function getHoverStyle(
  accentColor: string = '#00e5ff'
): React.CSSProperties {
  return {
    background: `${accentColor}${INTERACTIVE_TOKENS.hover.backgroundOpacity}`,
    borderColor: `${accentColor}${INTERACTIVE_TOKENS.hover.borderOpacity}`,
    boxShadow: `0 4px 16px ${accentColor}${INTERACTIVE_TOKENS.hover.shadowOpacity}`,
    transform: `translateY(${INTERACTIVE_TOKENS.hover.lift})`,
  };
}

// ============================================
// CHEVRON INDICATOR
// ============================================

/**
 * Standard chevron/arrow that signals clickability
 * Use as a visual affordance alongside text
 */
export const ChevronIndicator = ({ 
  color = 'rgba(255, 255, 255, 0.4)',
  className = '',
}: { 
  color?: string; 
  className?: string;
}) => (
  <span 
    className={`text-xs transition-all duration-300 group-hover:translate-x-0.5 ${className}`}
    style={{ color }}
  >
    →
  </span>
);

// ============================================
// DOCUMENTATION
// ============================================

/**
 * GLOBAL INTERACTIVE ELEMENT PATTERN
 * ───────────────────────────────────
 * 
 * Rest state:
 * - Border: 1px solid rgba(255, 255, 255, 0.12)
 * - Background: rgba(255, 255, 255, 0.03)
 * - Optional: chevron arrow `→`
 * 
 * Hover state:
 * - Border: 1px solid [accent-color]50
 * - Background: [accent-color]08
 * - Slight lift (translateY -1px)
 * - Cursor: pointer
 * - Text brightens
 * - Chevron shifts right slightly
 * 
 * Active/Focus:
 * - Border: 1px solid [accent-color]60
 * - Subtle glow shadow
 * - Focus ring for accessibility
 * 
 * This creates consistent "this is clickable" language across:
 * - Toggle cards (lens selection)
 * - Compare pills
 * - Buttons
 * - Dropdown items
 * - Any interactive element
 */

export default interactiveStyles;