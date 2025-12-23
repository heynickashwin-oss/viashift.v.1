// ============================================================================
// VIASHIFT DESIGN TOKENS
// Shared across icons and other components
// ============================================================================

export const tokens = {
  colors: {
    primary: '#00e5ff',
    accent: '#00ffaa',
    highlight: '#ff00ff',
    warning: '#ffaa00',
    error: '#ff4466',
    surface: {
      dark: '#0a0e14',
      elevated: '#141b24',
      muted: '#1e2832',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
      muted: 'rgba(255, 255, 255, 0.4)',
    },
  },
  sizes: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
} as const;

export type IconSize = keyof typeof tokens.sizes | number;
export type TokenColor = keyof typeof tokens.colors;