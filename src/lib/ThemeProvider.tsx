/**
 * ThemeProvider
 * 
 * Wraps application to provide brand theming context.
 * Automatically injects brand colors as CSS custom properties.
 * 
 * Usage:
 *   <ThemeProvider brand={{ primary: '#ff0000', secondary: '#00ff00', tertiary: '#0000ff' }}>
 *     <App />
 *   </ThemeProvider>
 */

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import {
  BrandTheme,
  ResolvedTheme,
  DEFAULT_BRAND,
  resolveTheme,
  applyThemeToCSSVars,
} from './theme';

// ============================================
// CONTEXT
// ============================================

interface ThemeContextValue {
  brand: BrandTheme;
  theme: ResolvedTheme;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ============================================
// PROVIDER
// ============================================

interface ThemeProviderProps {
  children: React.ReactNode;
  /** Brand colors to apply. Defaults to viashift brand. */
  brand?: Partial<BrandTheme>;
}

export function ThemeProvider({ children, brand }: ThemeProviderProps) {
  // Merge provided brand with defaults
  const fullBrand: BrandTheme = useMemo(() => ({
    ...DEFAULT_BRAND,
    ...brand,
  }), [brand]);
  
  // Resolve to full theme
  const theme = useMemo(() => resolveTheme(fullBrand), [fullBrand]);
  
  // Apply to CSS variables when brand changes
  useEffect(() => {
    applyThemeToCSSVars(fullBrand);
  }, [fullBrand]);
  
  const value = useMemo(() => ({
    brand: fullBrand,
    theme,
  }), [fullBrand, theme]);
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

/**
 * Access current theme in components
 * 
 * Usage:
 *   const { theme } = useTheme();
 *   <div style={{ color: theme.primary }}>...</div>
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  
  if (!context) {
    // Return default theme if used outside provider
    // This allows gradual adoption without breaking existing code
    return {
      brand: DEFAULT_BRAND,
      theme: resolveTheme(DEFAULT_BRAND),
    };
  }
  
  return context;
}

// ============================================
// RE-EXPORTS
// ============================================

export {
  DEFAULT_BRAND,
  resolveTheme,
  TIMING,
  EASING,
  getNodeBorderStyle,
  getFlowStyle,
} from './theme';

export type {
  BrandTheme,
  ResolvedTheme,
  NodeState,
  FlowVariant,
  StakeholderType,
} from './theme';