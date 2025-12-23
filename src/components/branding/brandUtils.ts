/**
 * Branding System - Types and Utilities
 */

export interface BrandConfig {
  name: string;
  logoUrl?: string;
  colors: BrandColors;
  vendor?: {
    name: string;
    logoUrl?: string;
  };
  source?: 'manual' | 'extracted' | 'ai';
  extractedFrom?: string;
}

export interface BrandColors {
  primary: string;
  secondary: string;
  accent?: string;
  background?: string;
}

export interface ExtractedColors {
  dominant: string;
  palette: string[];
  suggested: {
    primary: string;
    secondary: string;
  };
}

export const DEFAULT_BRAND: BrandConfig = {
  name: 'The Riff',
  colors: {
    primary: '#00D4E5',
    secondary: '#00BFA6',
    accent: '#FF6B6B',
    background: '#0A0A0A',
  },
  source: 'manual',
};

export async function extractColorsFromImage(imageSource: string | File): Promise<ExtractedColors> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const colors = analyzeImage(img);
        resolve(colors);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));

    if (imageSource instanceof File) {
      img.src = URL.createObjectURL(imageSource);
    } else {
      img.src = imageSource;
    }
  });
}

function analyzeImage(img: HTMLImageElement): ExtractedColors {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const sampleSize = 100;
  canvas.width = sampleSize;
  canvas.height = sampleSize;

  ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
  const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
  const pixels = imageData.data;

  const colorCounts: Map<string, number> = new Map();

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];

    if (a < 128) continue;

    const brightness = (r + g + b) / 3;
    if (brightness < 30 || brightness > 225) continue;

    const qr = Math.round(r / 32) * 32;
    const qg = Math.round(g / 32) * 32;
    const qb = Math.round(b / 32) * 32;

    const key = `${qr},${qg},${qb}`;
    colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
  }

  const sorted = Array.from(colorCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([key]) => {
      const [r, g, b] = key.split(',').map(Number);
      return rgbToHex(r, g, b);
    });

  if (sorted.length === 0) {
    return {
      dominant: DEFAULT_BRAND.colors.primary,
      palette: [DEFAULT_BRAND.colors.primary, DEFAULT_BRAND.colors.secondary],
      suggested: {
        primary: DEFAULT_BRAND.colors.primary,
        secondary: DEFAULT_BRAND.colors.secondary,
      },
    };
  }

  const dominant = sorted[0];
  const secondary = sorted.length > 1 ? findComplementaryColor(sorted) : adjustColor(dominant, 30);

  return {
    dominant,
    palette: sorted,
    suggested: { primary: dominant, secondary },
  };
}

function findComplementaryColor(palette: string[]): string {
  if (palette.length < 2) return adjustColor(palette[0], 30);

  const primary = hexToHsl(palette[0]);
  let bestMatch = palette[1];
  let bestDiff = 0;

  for (let i = 1; i < palette.length; i++) {
    const hsl = hexToHsl(palette[i]);
    const hueDiff = Math.abs(primary.h - hsl.h);
    const satDiff = Math.abs(primary.s - hsl.s);
    const diff = hueDiff * 2 + satDiff;

    if (diff > bestDiff) {
      bestDiff = diff;
      bestMatch = palette[i];
    }
  }

  return bestMatch;
}

function adjustColor(hex: string, amount: number): string {
  const hsl = hexToHsl(hex);
  hsl.l = Math.max(0, Math.min(100, hsl.l + amount));
  return hslToHex(hsl.h, hsl.s, hsl.l);
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const { r, g, b } = hexToRgb(hex);
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case rNorm: h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6; break;
      case gNorm: h = ((bNorm - rNorm) / d + 2) / 6; break;
      case bNorm: h = ((rNorm - gNorm) / d + 4) / 6; break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  return rgbToHex(
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  );
}

export function isLightColor(hex: string): boolean {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

export function generateBackgroundTint(primary: string, intensity: number = 0.03): string {
  const { r, g, b } = hexToRgb(primary);
  const baseR = 10, baseG = 10, baseB = 10;

  return rgbToHex(
    Math.round(baseR + (r - baseR) * intensity),
    Math.round(baseG + (g - baseG) * intensity),
    Math.round(baseB + (b - baseB) * intensity)
  );
}

export interface ResolvedTheme {
  colors: {
    primary: string;
    primaryDim: string;
    secondary: string;
    secondaryDim: string;
    accent: string;
    accentDim: string;
    loss: string;
    bgDark: string;
    bgSurface: string;
    bgElevated: string;
    border: string;
    borderLight: string;
    text: string;
    textMuted: string;
    textDim: string;
  };
  gradients: {
    primary: string;
    secondary: string;
    loss: string;
    cta: string;
  };
}

export function resolveTheme(brand: BrandConfig): ResolvedTheme {
  const { primary, secondary, accent, background } = brand.colors;

  const resolvedAccent = accent || '#FF6B6B';
  const resolvedBg = background || '#0A0A0A';
  const bgTint = generateBackgroundTint(primary, 0.02);

  return {
    colors: {
      primary,
      primaryDim: primary + '80',
      secondary,
      secondaryDim: secondary + '80',
      accent: resolvedAccent,
      accentDim: resolvedAccent + '80',
      loss: '#993333',
      bgDark: resolvedBg,
      bgSurface: bgTint,
      bgElevated: '#1E1E1E',
      border: '#252525',
      borderLight: 'rgba(255, 255, 255, 0.08)',
      text: '#F5F5F5',
      textMuted: 'rgba(255, 255, 255, 0.6)',
      textDim: 'rgba(255, 255, 255, 0.35)',
    },
    gradients: {
      primary: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
      secondary: `linear-gradient(135deg, ${secondary} 0%, ${adjustColor(secondary, -20)} 100%)`,
      loss: `linear-gradient(135deg, ${resolvedAccent} 0%, #993333 100%)`,
      cta: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
    },
  };
}
