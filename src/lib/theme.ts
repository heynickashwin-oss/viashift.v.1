/**
 * viashift Theme System
 * 
 * Handles brand color resolution and CSS variable injection.
 * 
 * Usage:
 *   const theme = resolveTheme(brandColors);
 *   <ThemeProvider brand={brandColors}>...</ThemeProvider>
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface BrandTheme {
  /** Interactive elements, focus states, active UI */
  primary: string;
  /** Success states, positive outcomes */
  secondary: string;
  /** CTA buttons, warnings, high-contrast actions */
  tertiary: string;
}

export interface ResolvedTheme {
  // Brand colors with opacity variants
  primary: string;
  primaryMuted: string;
  primaryStrong: string;
  secondary: string;
  secondaryMuted: string;
  secondaryStrong: string;
  tertiary: string;
  tertiaryMuted: string;
  
  // Fixed semantic colors (never change with brand)
  loss: string;
  lossMuted: string;
  warning: string;
  warningMuted: string;
  success: string;
  successMuted: string;
  info: string;
  infoMuted: string;
  
  // Fixed stakeholder colors (semantic, not brand)
  stakeholders: {
    finance: string;
    sales: string;
    operations: string;
    users: string;
    leadership: string;
  };
  
  // Sankey-specific
  nodeNeutralStart: string;
  nodeNeutralEnd: string;
  flowNeutral: string;
  flowNeutralHover: string;
}

export type StakeholderType = keyof ResolvedTheme['stakeholders'];

// ============================================
// DEFAULT THEME (viashift brand)
// ============================================

export const DEFAULT_BRAND: BrandTheme = {
  primary: '#00e5ff',    // Cyan - interactive
  secondary: '#00ffaa',  // Teal - success
  tertiary: '#f59e0b',   // Amber - CTA
};

// ============================================
// FIXED COLORS (never change with brand)
// ============================================

const SEMANTIC_COLORS = {
  loss: '#ff6b6b',
  warning: '#f59e0b',
  success: '#22c55e',
  info: '#3b82f6',
} as const;

const STAKEHOLDER_COLORS = {
  finance: '#f59e0b',     // Amber - money, budgets
  sales: '#10b981',       // Green - growth, revenue
  operations: '#8b5cf6',  // Purple - processes
  users: '#f97316',       // Orange - people
  leadership: '#3b82f6',  // Blue - strategy
} as const;

const SANKEY_NEUTRALS = {
  nodeNeutralStart: 'rgba(30, 32, 38, 0.95)',
  nodeNeutralEnd: 'rgba(22, 24, 28, 0.98)',
  flowNeutral: 'rgba(255, 255, 255, 0.08)',
  flowNeutralHover: 'rgba(255, 255, 255, 0.15)',
} as const;

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Convert hex color to rgba with opacity
 */
export function hexToRgba(hex: string, opacity: number): string {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Parse hex values
  const r = parseInt(cleanHex.slice(0, 2), 16);
  const g = parseInt(cleanHex.slice(2, 4), 16);
  const b = parseInt(cleanHex.slice(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Generate muted version of color (15% opacity)
 */
export function getMutedColor(hex: string): string {
  return hexToRgba(hex, 0.15);
}

/**
 * Generate strong version of color (40% opacity)
 */
export function getStrongColor(hex: string): string {
  return hexToRgba(hex, 0.40);
}

// ============================================
// THEME RESOLUTION
// ============================================

/**
 * Resolve brand colors into full theme with all variants
 */
export function resolveTheme(brand: BrandTheme = DEFAULT_BRAND): ResolvedTheme {
  return {
    // Brand colors with variants
    primary: brand.primary,
    primaryMuted: getMutedColor(brand.primary),
    primaryStrong: getStrongColor(brand.primary),
    
    secondary: brand.secondary,
    secondaryMuted: getMutedColor(brand.secondary),
    secondaryStrong: getStrongColor(brand.secondary),
    
    tertiary: brand.tertiary,
    tertiaryMuted: getMutedColor(brand.tertiary),
    
    // Fixed semantic colors
    loss: SEMANTIC_COLORS.loss,
    lossMuted: getMutedColor(SEMANTIC_COLORS.loss),
    warning: SEMANTIC_COLORS.warning,
    warningMuted: getMutedColor(SEMANTIC_COLORS.warning),
    success: SEMANTIC_COLORS.success,
    successMuted: getMutedColor(SEMANTIC_COLORS.success),
    info: SEMANTIC_COLORS.info,
    infoMuted: getMutedColor(SEMANTIC_COLORS.info),
    
    // Fixed stakeholder colors
    stakeholders: { ...STAKEHOLDER_COLORS },
    
    // Sankey neutrals
    ...SANKEY_NEUTRALS,
  };
}

// ============================================
// CSS VARIABLE INJECTION
// ============================================

/**
 * Apply brand theme to CSS custom properties
 * Call this when brand changes (e.g., in ThemeProvider)
 */
export function applyThemeToCSSVars(brand: BrandTheme): void {
  const root = document.documentElement;
  
  root.style.setProperty('--color-brand-primary', brand.primary);
  root.style.setProperty('--color-brand-primary-muted', getMutedColor(brand.primary));
  root.style.setProperty('--color-brand-primary-strong', getStrongColor(brand.primary));
  
  root.style.setProperty('--color-brand-secondary', brand.secondary);
  root.style.setProperty('--color-brand-secondary-muted', getMutedColor(brand.secondary));
  root.style.setProperty('--color-brand-secondary-strong', getStrongColor(brand.secondary));
  
  root.style.setProperty('--color-brand-tertiary', brand.tertiary);
  root.style.setProperty('--color-brand-tertiary-muted', getMutedColor(brand.tertiary));
}

/**
 * Reset to default viashift brand
 */
export function resetToDefaultTheme(): void {
  applyThemeToCSSVars(DEFAULT_BRAND);
}

// ============================================
// TIMING CONSTANTS (for JS animations)
// ============================================

export const TIMING = {
  instant: 100,
  fast: 200,
  normal: 300,
  slow: 900,
  slower: 2000,
  draw: 16000,
  background: 1200,
  
  // Pulse durations
  pulseHero: 2000,
  pulseSolution: 3000,
  pulseLoss: 5500,
  shimmer: 1500,
  
  // Stagger
  staggerDelay: 200,
  layerOverlap: 0.3,
  
  // Exit sequence
  exitFreeze: 0,
  exitDesaturate: 100,
  exitGone: 400,
} as const;

// ============================================
// EASING FUNCTIONS (for JS animations)
// ============================================

export const EASING = {
  /** Primary easing - arriving, draw progress */
  outCubic: (t: number): number => 1 - Math.pow(1 - t, 3),
  
  /** Node entrance - overshoot + settle */
  outBack: (t: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  
  /** Leaving/exiting */
  in: (t: number): number => Math.pow(t, 3),
  
  /** State changes, pulses */
  inOut: (t: number): number => {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  },
  
  /** Linear interpolation helper */
  lerp: (start: number, end: number, t: number): number => {
    return start + (end - start) * t;
  },
} as const;

// ============================================
// NODE STATE HELPERS
// ============================================

export type NodeState = 'default' | 'hover' | 'active' | 'success' | 'loss';

/**
 * Get border style for node state
 */
export function getNodeBorderStyle(state: NodeState, theme: ResolvedTheme) {
  switch (state) {
    case 'default':
      return {
        stroke: 'rgba(255, 255, 255, 0.12)',
        strokeWidth: 1,
        strokeOpacity: 1,
      };
    case 'hover':
      return {
        stroke: 'rgba(255, 255, 255, 0.25)',
        strokeWidth: 1.5,
        strokeOpacity: 1,
      };
    case 'active':
      return {
        stroke: 'rgba(255, 255, 255, 0.5)',
        strokeWidth: 2,
        strokeOpacity: 1,
        strokeDasharray: '6 4',
      };
    case 'success':
      return {
        stroke: theme.secondary,
        strokeWidth: 2,
        strokeOpacity: 0.6,
      };
    case 'loss':
      return {
        stroke: theme.loss,
        strokeWidth: 1.5,
        strokeOpacity: 0.5,
      };
  }
}

// ============================================
// FLOW VARIANT HELPERS
// ============================================

export type FlowVariant = 'neutral' | 'stakeholder' | 'success' | 'loss';

/**
 * Get flow style for variant
 */
export function getFlowStyle(
  variant: FlowVariant,
  theme: ResolvedTheme,
  stakeholderType?: StakeholderType,
  isHovered = false
) {
  switch (variant) {
    case 'neutral':
      return {
        stroke: theme.flowNeutral,
        opacity: isHovered ? 0.15 : 0.08,
      };
    case 'stakeholder':
      const color = stakeholderType ? theme.stakeholders[stakeholderType] : theme.primary;
      return {
        stroke: color,
        opacity: isHovered ? 0.5 : 0.3,
        filter: isHovered ? `drop-shadow(0 0 8px ${getMutedColor(color)})` : 'none',
      };
    case 'success':
      return {
        stroke: theme.secondary,
        opacity: isHovered ? 0.6 : 0.4,
        filter: isHovered ? `drop-shadow(0 0 8px ${theme.secondaryMuted})` : 'none',
      };
    case 'loss':
      return {
        stroke: theme.loss,
        opacity: isHovered ? 0.5 : 0.25,
        // No glow for loss flows
      };
  }
}