/**
 * SankeyFlowV3 - v4.0
 *
 * CHANGES from v3.4:
 * - Integrated NarrativeController for phased reveals
 * - Layer-by-layer flow drawing in "before" state
 * - Loss highlighting with pulse during bleed phase
 * - Metrics tied to narrative phases
 * - Backwards compatible - works without narrative props
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { BrandConfig, DEFAULT_BRAND, resolveTheme } from './branding/brandUtils';
import { useNarrativeController, NarrativePhase, NarrativeState } from '../hooks/useNarrativeController';

// ============================================
// TYPES
// ============================================

export interface SankeyNode {
  id: string;
  label: string;
  layer: number;
  value: number;
  y?: number;
  type?: 'default' | 'source' | 'solution' | 'loss' | 'new' | 'revenue' | 'destination';
}

export interface SankeyLink {
  id?: string;
  from: string;
  to: string;
  value: number;
  type?: 'default' | 'loss' | 'new' | 'revenue';
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

export interface SankeyMetric {
  id: string;
  value: string;
  label: string;
  type?: 'positive' | 'negative' | 'neutral';
}

export interface AnchoredMetric {
  value: string;
  label: string;
  type: 'loss' | 'gain';
  nodeId: string;
}

export interface FlowState {
  data: SankeyData;
  metrics: SankeyMetric[];
  stageLabel: string;
  anchoredMetric?: AnchoredMetric;
  insight?: string;
}

export interface SankeyFlowProps {
  state: FlowState;
  stageLabels?: string[];
  variant: 'before' | 'after';
  brand?: BrandConfig;
  animated?: boolean;
  className?: string;
  onNodeClick?: (nodeId: string) => void;
  transitionPhase?: 'idle' | 'anticipation' | 'shifting' | 'revealing';
  hideUI?: boolean;
  // New: narrative controller integration
  useNarrative?: boolean;  // Enable narrative mode (default true for 'before')
  onNarrativePhaseChange?: (phase: NarrativePhase) => void;
  onNarrativeComplete?: () => void;
  onButtonReady?: (ready: boolean) => void;
}

// ============================================
// LAYOUT TYPES
// ============================================

interface LayoutNode extends SankeyNode {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LayoutLink {
  id: string;
  from: string;
  to: string;
  value: number;
  type: string;
  source: LayoutNode;
  target: LayoutNode;
  thickness: number;
  path: string;
  pathLength: number;
}

interface Particle {
  link: LayoutLink;
  t: number;
  speed: number;
  size: number;
  offset: number;
  opacity: number;
  fallOffset: number;
  fadeProgress: number;
  isFalling: boolean;
}

// ============================================
// UTILITIES
// ============================================

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

// ============================================
// ANIMATED VALUE COMPONENT
// ============================================

const AnimatedValue = ({
  value,
  duration = 900,
  delay = 0
}: {
  value: string;
  duration?: number;
  delay?: number;
}) => {
  const [displayValue, setDisplayValue] = useState('0');
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    hasAnimatedRef.current = false;
  }, [value]);

  useEffect(() => {
    if (hasAnimatedRef.current) return;

    const match = value.match(/^([+-]?\$?)(\d+(?:\.\d+)?)(.*)/);
    if (!match) {
      setDisplayValue(value);
      hasAnimatedRef.current = true;
      return;
    }

    const [, prefix, numStr, suffix] = match;
    const targetNum = parseFloat(numStr);
    const hasDecimal = numStr.includes('.');

    const timeout = setTimeout(() => {
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutCubic(progress);
        const currentNum = lerp(0, targetNum, easedProgress);

        const formatted = hasDecimal
          ? currentNum.toFixed(1)
          : Math.round(currentNum).toString();

        setDisplayValue(`${prefix}${formatted}${suffix}`);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayValue(value);
          hasAnimatedRef.current = true;
        }
      };

      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, duration, delay]);

  return <>{displayValue}</>;
};

// ============================================
// MAIN COMPONENT
// ============================================

export const SankeyFlowV3 = ({
  state,
  stageLabels = ['Ingest', 'Process', 'Distribute', 'Monetize'],
  variant,
  brand = DEFAULT_BRAND,
  animated = true,
  className = '',
  onNodeClick,
  transitionPhase = 'idle',
  hideUI = false,
  useNarrative = true,
  onNarrativePhaseChange,
  onNarrativeComplete,
  onButtonReady,
}: SankeyFlowProps) => {
  const theme = useMemo(() => resolveTheme(brand), [brand]);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [layout, setLayout] = useState<{ nodes: LayoutNode[]; links: LayoutLink[] } | null>(null);
  
  // Legacy state (used when narrative is disabled or for 'after' variant)
  const [drawProgress, setDrawProgress] = useState(0);
  const [uiVisible, setUiVisible] = useState(false);
  const [metricsVisible, setMetricsVisible] = useState<boolean[]>([]);
  const [anchoredVisible, setAnchoredVisible] = useState(false);
  const [revealPhase, setRevealPhase] = useState(0);
  const [forgeProgress, setForgeProgress] = useState(1);
  const [forgeLayer, setForgeLayer] = useState(-1);
  const [isForging, setIsForging] = useState(false);
  const [exitPhase, setExitPhase] = useState<'none' | 'freeze' | 'desaturate' | 'gone'>('none');
  const [pulsePhase, setPulsePhase] = useState(0);

  const particlesRef = useRef<Particle[]>([]);
  const leaderParticlesRef = useRef<Array<{
    link: LayoutLink;
    t: number;
    speed: number;
    brightness: number;
  }>>([]);
  const animationRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);

  // Refs for animation loop
  const drawProgressRef = useRef(0);
  const revealPhaseRef = useRef(0);
  const isForgingRef = useRef(false);
  const forgeLayerRef = useRef(-1);
  const exitPhaseRef = useRef<'none' | 'freeze' | 'desaturate' | 'gone'>('none');
  const isBeforeRef = useRef(true);
  
  // New: Narrative controller refs
  const narrativeStateRef = useRef<NarrativeState | null>(null);

  const LAYOUT = {
    padding: { top: 100, right: 60, bottom: 120, left: 60 },
    nodeWidth: 18,
    nodeMinHeight: 35,
    nodeMaxHeight: 90,
    drawDuration: 1400,
    staggerDelay: 60,
    particleSpeed: 0.0015,
    forgeDuration: 1200,
  };

  const layerXPercent: Record<number, number> = {
    0: 0.05,
    1: 0.28,
    2: 0.58,
    3: 0.92,
  };

  const isBefore = variant === 'before';
  const maxLayer = useMemo(() => 
    Math.max(...(state.data.nodes.map(n => n.layer) || [0]), 0),
    [state.data.nodes]
  );
  
  // Initialize narrative controller for "before" state
  const narrativeEnabled = useNarrative && isBefore && animated && transitionPhase === 'idle';
  
  const narrative = useNarrativeController({
    variant,
    isActive: narrativeEnabled && !!layout,
    layerCount: maxLayer + 1,
    metricCount: state.metrics.length,
    hasAnchoredMetric: !!state.anchoredMetric,
    config: {
      layerDrawDuration: 600,
      layerStagger: 350,
      bleedDuration: 2200,
      bleedPulseCycles: 4,
      metricRevealDelay: 800,
      readyDuration: 1200,
    },
    onPhaseChange: onNarrativePhaseChange,
    onComplete: onNarrativeComplete,
  });
  
  // Sync narrative state to ref for animation loop
  useEffect(() => {
    narrativeStateRef.current = narrativeEnabled ? narrative : null;
  }, [narrativeEnabled, narrative]);
  
  // Notify parent when button becomes ready
  useEffect(() => {
    if (narrativeEnabled && onButtonReady) {
      onButtonReady(narrative.buttonReady);
    }
  }, [narrativeEnabled, narrative.buttonReady, onButtonReady]);

  // Pulse animation for nodes
  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase(p => (p + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Layout calculation
  useEffect(() => {
    if (!state.data.nodes.length || dimensions.width < 100) return;

    const { padding, nodeWidth, nodeMinHeight, nodeMaxHeight } = LAYOUT;
    const nodes: LayoutNode[] = [];
    const nodeMap = new Map<string, LayoutNode>();

    const usableWidth = dimensions.width - padding.left - padding.right;

    const nodesByLayer = new Map<number, SankeyNode[]>();
    state.data.nodes.forEach(n => {
      const arr = nodesByLayer.get(n.layer) || [];
      arr.push(n);
      nodesByLayer.set(n.layer, arr);
    });

    const maxValue = Math.max(...state.data.nodes.map(n => n.value), 1);

    state.data.nodes.forEach(node => {
      const layerNodes = nodesByLayer.get(node.layer) || [];
      const idx = layerNodes.indexOf(node);
      const totalInLayer = layerNodes.length;
      const yPos = node.y ?? (idx + 1) / (totalInLayer + 1);
      
      const heightRatio = node.value / maxValue;
      const height = Math.max(nodeMinHeight, Math.min(nodeMaxHeight, heightRatio * nodeMaxHeight * 1.2));

      const xPercent = layerXPercent[node.layer] ?? (node.layer / Math.max(maxLayer, 1));

      const layoutNode: LayoutNode = {
        ...node,
        x: padding.left + xPercent * usableWidth,
        y: padding.top + yPos * (dimensions.height - padding.top - padding.bottom),
        width: nodeWidth,
        height,
      };

      nodes.push(layoutNode);
      nodeMap.set(node.id, layoutNode);
    });

    const links: LayoutLink[] = state.data.links.map((link, i) => {
      const source = nodeMap.get(link.from);
      const target = nodeMap.get(link.to);

      if (!source || !target) return null;

      const x0 = source.x + source.width;
      const y0 = source.y;
      const x1 = target.x;
      const y1 = target.y;
      const dx = x1 - x0;

      return {
        id: link.id || `link-${i}`,
        from: link.from,
        to: link.to,
        value: link.value,
        type: link.type || 'default',
        source,
        target,
        thickness: Math.max(4, Math.min(28, link.value * 0.25)),
        path: `M${x0},${y0} C${x0 + dx * 0.45},${y0} ${x0 + dx * 0.55},${y1} ${x1},${y1}`,
        pathLength: Math.sqrt(dx * dx + (y1 - y0) * (y1 - y0)) * 1.3,
      };
    }).filter(Boolean) as LayoutLink[];

    setLayout({ nodes, links });
  }, [state.data, dimensions, maxLayer]);

  // Sync refs
  useEffect(() => { drawProgressRef.current = drawProgress; }, [drawProgress]);
  useEffect(() => { revealPhaseRef.current = revealPhase; }, [revealPhase]);
  useEffect(() => { isForgingRef.current = isForging; }, [isForging]);
  useEffect(() => { forgeLayerRef.current = forgeLayer; }, [forgeLayer]);
  useEffect(() => { exitPhaseRef.current = exitPhase; }, [exitPhase]);
  useEffect(() => { isBeforeRef.current = variant === 'before'; }, [variant]);

  const getBezierPoint = useCallback((link: LayoutLink, t: number) => {
    const x0 = link.source.x + link.source.width;
    const y0 = link.source.y;
    const x1 = link.target.x;
    const y1 = link.target.y;
    const dx = x1 - x0;
    const cp1x = x0 + dx * 0.45;
    const cp2x = x0 + dx * 0.55;

    const mt = 1 - t;
    return {
      x: mt*mt*mt*x0 + 3*mt*mt*t*cp1x + 3*mt*t*t*cp2x + t*t*t*x1,
      y: mt*mt*mt*y0 + 3*mt*mt*t*y0 + 3*mt*t*t*y1 + t*t*t*y1,
    };
  }, []);

  // Legacy draw animation (used when narrative disabled or for 'after')
  useEffect(() => {
    // Skip if narrative is handling the animation
    if (narrativeEnabled) return;
    if (!layout) return;

    setDrawProgress(0);
    setUiVisible(false);
    setMetricsVisible([]);
    setAnchoredVisible(false);

    if (!animated) {
      setDrawProgress(1);
      setUiVisible(true);
      setMetricsVisible(state.metrics.map(() => true));
      setAnchoredVisible(true);
      return;
    }

    const duration = LAYOUT.drawDuration;
    const startTime = performance.now();

    const animateDraw = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setDrawProgress(easeOutCubic(progress));

      if (progress < 1) {
        requestAnimationFrame(animateDraw);
      } else {
        setUiVisible(true);

        state.metrics.forEach((_, i) => {
          setTimeout(() => {
            setMetricsVisible(prev => {
              const next = [...prev];
              next[i] = true;
              return next;
            });
          }, 200 + i * 150);
        });

        setTimeout(() => setAnchoredVisible(true), 600);
      }
    };

    requestAnimationFrame(animateDraw);
  }, [layout, animated, state.metrics, narrativeEnabled]);

  // Forge transition for 'after' variant
  useEffect(() => {
    if (variant === 'after' && transitionPhase === 'revealing') {
      setIsForging(true);
      setForgeProgress(0);
      setForgeLayer(0);
      setRevealPhase(0);

      const layerDuration = LAYOUT.forgeDuration;

      setTimeout(() => setRevealPhase(1), 0);

      setTimeout(() => {
        setRevealPhase(2);
        setForgeLayer(0);
        setForgeProgress(0.25);
      }, 300);

      setTimeout(() => {
        setForgeLayer(1);
        setForgeProgress(0.5);
        setMetricsVisible(prev => { const next = [...prev]; next[0] = true; return next; });
      }, layerDuration);

      setTimeout(() => {
        setRevealPhase(3);
        setForgeLayer(2);
        setForgeProgress(0.75);
        setMetricsVisible(prev => { const next = [...prev]; next[1] = true; return next; });
      }, layerDuration * 2);

      setTimeout(() => {
        setForgeLayer(3);
        setForgeProgress(1);
        setRevealPhase(4);
        setMetricsVisible(prev => { const next = [...prev]; next[2] = true; return next; });
      }, layerDuration * 3);

      setTimeout(() => {
        setRevealPhase(5);
        setIsForging(false);
        leaderParticlesRef.current = [];
      }, layerDuration * 4);

    } else if (variant === 'before' && transitionPhase === 'idle') {
      setRevealPhase(5);
      setForgeProgress(1);
      setForgeLayer(-1);
      setIsForging(false);
      setExitPhase('none');

    } else if (variant === 'before' && transitionPhase === 'anticipation') {
      setExitPhase('freeze');
      setTimeout(() => setExitPhase('desaturate'), 100);
      setTimeout(() => setExitPhase('gone'), 400);

    } else if (variant === 'after' && transitionPhase === 'idle') {
      setRevealPhase(5);
      setForgeProgress(1);
      setForgeLayer(-1);
      setIsForging(false);
    }
  }, [variant, transitionPhase, layout]);

  // Initialize particles
  useEffect(() => {
    if (!layout || !animated) return;

    particlesRef.current = [];
    layout.links.forEach(link => {
      const isLoss = link.type === 'loss';
      const baseCount = Math.max(3, Math.ceil(link.value / 10));
      const count = variant === 'after' ? Math.ceil(baseCount * 1.5) : baseCount;
      
      for (let i = 0; i < count; i++) {
        particlesRef.current.push({
          link,
          t: Math.random(),
          speed: isLoss 
            ? LAYOUT.particleSpeed * 0.6
            : LAYOUT.particleSpeed * (variant === 'after' ? (0.9 + Math.random() * 0.6) : (0.7 + Math.random() * 0.5)),
          size: isLoss
            ? (2 + Math.random() * 2)
            : (variant === 'after' ? (2.5 + Math.random() * 2.5) : (2 + Math.random() * 2)),
          offset: (Math.random() - 0.5) * link.thickness * 0.4,
          opacity: isLoss ? (0.4 + Math.random() * 0.3) : (0.6 + Math.random() * 0.3),
          fallOffset: 0,
          fadeProgress: 0,
          isFalling: isLoss && Math.random() > 0.5,
        });
      }
    });

    // Leader particles for forge
    if (variant === 'after') {
      leaderParticlesRef.current = [];
      layout.links.forEach(link => {
        if (link.type === 'loss') return;
        for (let i = 0; i < 2; i++) {
          leaderParticlesRef.current.push({
            link,
            t: 0,
            speed: LAYOUT.particleSpeed * 2.5,
            brightness: 1.3 + Math.random() * 0.4,
          });
        }
      });
    }

    isRunningRef.current = true;

    const animate = () => {
      if (!isRunningRef.current || !canvasRef.current) return;

      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, dimensions.width * dpr, dimensions.height * dpr);

      const currentDrawProgress = drawProgressRef.current;
      const currentRevealPhase = revealPhaseRef.current;
      const currentIsForging = isForgingRef.current;
      const currentForgeLayer = forgeLayerRef.current;
      const currentExitPhase = exitPhaseRef.current;
      const currentIsBefore = isBeforeRef.current;
      const currentNarrative = narrativeStateRef.current;

      if (currentExitPhase === 'gone') {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const shouldAnimate = currentExitPhase === 'none' || currentExitPhase === 'freeze';

      // For narrative mode, check if we should show particles
      const narrativeParticlesActive = currentNarrative 
        ? currentNarrative.phase === 'complete' || currentNarrative.phase === 'ready'
        : false;

      // Determine if particles should be visible
      const minDrawProgress = currentNarrative 
        ? Math.min(...currentNarrative.layerDrawProgress.filter(p => p > 0), 1)
        : currentDrawProgress;
        
      if (minDrawProgress < 0.25 && !narrativeParticlesActive) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Leader particles during forge
      if (currentIsForging && leaderParticlesRef.current.length > 0) {
        leaderParticlesRef.current.forEach(leader => {
          const linkLayer = Math.max(leader.link.source.layer, leader.link.target.layer);
          if (linkLayer > currentForgeLayer + 1) return;

          if (shouldAnimate) {
            leader.t += leader.speed;
            if (leader.t > 1) leader.t = 0;
          }

          const pos = getBezierPoint(leader.link, leader.t);
          if (!pos) return;

          const color = theme.colors.primary;
          const size = 5;

          const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, size * 6);
          glow.addColorStop(0, color + 'AA');
          glow.addColorStop(0.3, color + '55');
          glow.addColorStop(0.6, color + '18');
          glow.addColorStop(1, 'transparent');

          ctx.beginPath();
          ctx.arc(pos.x, pos.y, size * 6, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();

          // Trail
          for (let trail = 1; trail <= 3; trail++) {
            const trailT = Math.max(0, leader.t - trail * 0.025);
            const trailPos = getBezierPoint(leader.link, trailT);
            if (trailPos) {
              ctx.beginPath();
              ctx.arc(trailPos.x, trailPos.y, size * (1 - trail * 0.2), 0, Math.PI * 2);
              ctx.fillStyle = color + Math.floor((1 - trail * 0.25) * 180).toString(16).padStart(2, '0');
              ctx.fill();
            }
          }
        });
      }

      // Regular particles
      const particlesActive = narrativeParticlesActive ||
        ((!currentIsForging && currentRevealPhase >= 4) || (currentIsBefore && currentExitPhase === 'none' && !currentNarrative));

      if (particlesActive) {
        particlesRef.current.forEach(p => {
          const isLoss = p.link.type === 'loss';
          
          // Check if this link's layer is visible in narrative mode
          if (currentNarrative) {
            const linkLayer = Math.max(p.link.source.layer, p.link.target.layer);
            const layerProgress = currentNarrative.layerDrawProgress[linkLayer] || 0;
            if (layerProgress < 0.8) return; // Don't show particles until layer nearly drawn
          }
          
          if (shouldAnimate) {
            p.t += p.speed;
            
            if (isLoss && p.t > 0.7) {
              p.isFalling = true;
              p.fallOffset += 1.5;
              p.fadeProgress = Math.min(1, p.fadeProgress + 0.02);
            }
            
            if (p.t > 1) {
              p.t = 0;
              if (isLoss) {
                p.fallOffset = 0;
                p.fadeProgress = 0;
                p.isFalling = Math.random() > 0.5;
              }
            }
          }
          
          const effectiveDrawProgress = currentNarrative
            ? Math.max(...currentNarrative.layerDrawProgress)
            : currentDrawProgress;
            
          if (p.t > effectiveDrawProgress && !narrativeParticlesActive) return;

          const pos = getBezierPoint(p.link, p.t);
          if (!pos) return;

          const yOffset = p.offset + (isLoss ? p.fallOffset : 0);
          
          // Enhanced loss particle rendering during bleed phase
          let particleOpacity = isLoss 
            ? p.opacity * (1 - p.fadeProgress * 0.8)
            : (currentExitPhase === 'desaturate' ? p.opacity * 0.3 : p.opacity);
            
          // Pulse loss particles during bleed
          if (isLoss && currentNarrative?.lossHighlightActive) {
            const pulseBoost = currentNarrative.lossPulseIntensity * 0.5;
            particleOpacity = Math.min(1, particleOpacity * (1.3 + pulseBoost));
          }

          if (particleOpacity < 0.05) return;

          const color = isLoss
            ? theme.colors.accent
            : (p.link.type === 'new' || p.link.type === 'revenue')
              ? theme.colors.secondary
              : theme.colors.primary;

          const glowSize = isLoss ? p.size * 3 : p.size * 4;
          
          // Enhanced glow during bleed
          const glowIntensity = (isLoss && currentNarrative?.lossHighlightActive)
            ? Math.floor(particleOpacity * 60)
            : Math.floor(particleOpacity * 40);
            
          const glow = ctx.createRadialGradient(
            pos.x, pos.y + yOffset, 0,
            pos.x, pos.y + yOffset, glowSize
          );
          glow.addColorStop(0, color + glowIntensity.toString(16).padStart(2, '0'));
          glow.addColorStop(0.5, color + '10');
          glow.addColorStop(1, 'transparent');

          ctx.beginPath();
          ctx.arc(pos.x, pos.y + yOffset, glowSize, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(pos.x, pos.y + yOffset, p.size * (isLoss ? (1 - p.fadeProgress * 0.5) : 1), 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.globalAlpha = particleOpacity;
          ctx.fill();
          ctx.globalAlpha = 1;
        });
      }

      ctx.restore();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      isRunningRef.current = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [layout, animated, dimensions, theme, variant, getBezierPoint]);

  const anchoredPosition = useMemo(() => {
    if (!state.anchoredMetric || !layout) return null;

    const node = layout.nodes.find(n => n.id === state.anchoredMetric!.nodeId);
    if (!node) return null;

    return {
      left: node.x + node.width + 20,
      top: node.y - 20,
    };
  }, [state.anchoredMetric, layout]);

  const getNodePulse = (node: LayoutNode): number => {
    // Enhanced pulse during bleed phase for loss nodes
    if (node.type === 'loss' && narrativeEnabled && narrative.lossHighlightActive) {
      const basePulse = 0.85 + Math.sin(pulsePhase * 0.15) * 0.1;
      const bleedPulse = narrative.lossPulseIntensity * 0.3;
      return basePulse + bleedPulse;
    }
    
    if (node.type === 'loss') {
      return 0.85 + Math.sin(pulsePhase * 0.15) * 0.1 + Math.sin(pulsePhase * 0.23) * 0.05;
    }
    if (node.type === 'solution') {
      return 0.95 + Math.sin(pulsePhase * 0.05) * 0.05;
    }
    return 0.9 + Math.sin(pulsePhase * 0.08) * 0.08;
  };

  // Calculate effective visibility based on narrative or legacy state
  const effectiveUiVisible = narrativeEnabled 
    ? narrative.phase !== 'idle'
    : uiVisible;
    
  const effectiveMetricsVisible = narrativeEnabled
    ? narrative.summaryMetricsVisible
    : metricsVisible;
    
  const effectiveAnchoredVisible = narrativeEnabled
    ? narrative.anchoredMetricVisible
    : anchoredVisible;
    
  const effectiveRevealPhase = narrativeEnabled
    ? (narrative.isComplete ? 5 : narrative.isReadyPhase ? 4 : narrative.isBleedPhase ? 3 : narrative.isSetupPhase ? 2 : 1)
    : revealPhase;

  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

  // Calculate per-layer draw progress for narrative mode
  const getLayerDrawProgress = (layer: number): number => {
    if (narrativeEnabled) {
      return narrative.layerDrawProgress[layer] || 0;
    }
    return drawProgress;
  };

  return (
    <div
      ref={containerRef}
      className={`sankey-v3 relative w-full h-full min-h-screen overflow-hidden ${className}`}
      style={{
        background: isBefore
          ? `radial-gradient(ellipse at 50% 0%, ${theme.colors.bgSurface} 0%, ${theme.colors.bgDark} 70%)`
          : `radial-gradient(ellipse at 50% 30%, ${theme.colors.primary}12 0%, ${theme.colors.bgSurface} 40%, ${theme.colors.bgDark} 100%)`,
        transition: 'background 1.5s ease-out',
      }}
    >
      {/* Background layers */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: isBefore ? 0.4 : 0.6,
          background: isBefore
            ? `radial-gradient(circle at 75% 70%, ${theme.colors.accent}12 0%, transparent 45%),
               radial-gradient(circle at 25% 30%, rgba(255, 255, 255, 0.02) 0%, transparent 40%)`
            : `radial-gradient(circle at 30% 35%, ${theme.colors.primary}18 0%, transparent 50%),
               radial-gradient(circle at 70% 55%, ${theme.colors.secondary}14 0%, transparent 45%)`,
          transition: 'opacity 1.2s ease-out, background 1.2s ease-out',
        }}
      />

      {/* Bleed phase ambient glow for loss areas */}
      {narrativeEnabled && narrative.lossHighlightActive && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: narrative.lossPulseIntensity * 0.4,
            background: `radial-gradient(circle at 75% 70%, ${theme.colors.accent}30 0%, transparent 50%)`,
            transition: 'opacity 0.15s ease-out',
          }}
        />
      )}

      <div
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          backgroundImage: `
            linear-gradient(${theme.colors.borderLight} 1px, transparent 1px),
            linear-gradient(90deg, ${theme.colors.borderLight} 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Exit overlay */}
      <div
        className="absolute inset-0 pointer-events-none transition-all"
        style={{
          background: exitPhase === 'desaturate' ? 'rgba(10, 10, 15, 0.4)' : 'transparent',
          opacity: exitPhase === 'gone' ? 0 : 1,
          filter: exitPhase === 'desaturate' ? 'saturate(0.3) brightness(0.7)' : 'none',
          transition: 'filter 0.3s ease-out, background 0.3s ease-out, opacity 0.3s ease-out',
          zIndex: exitPhase !== 'none' ? 100 : -1,
        }}
      />

      {/* Canvas for particles */}
      <canvas
        ref={canvasRef}
        width={dimensions.width * dpr}
        height={dimensions.height * dpr}
        className="absolute inset-0 pointer-events-none"
        style={{ width: dimensions.width, height: dimensions.height }}
      />

      {/* SVG for links and nodes */}
      <svg width={dimensions.width} height={dimensions.height} className="absolute inset-0">
        <defs>
          <linearGradient id="grad-primary" x1="0%" x2="100%">
            <stop offset="0%" stopColor={theme.colors.primary} />
            <stop offset="100%" stopColor={theme.colors.secondary} />
          </linearGradient>
          <linearGradient id="grad-secondary" x1="0%" x2="100%">
            <stop offset="0%" stopColor={theme.colors.secondary} />
            <stop offset="100%" stopColor={theme.colors.secondary + '99'} />
          </linearGradient>
          <linearGradient id="grad-loss" x1="0%" x2="100%">
            <stop offset="0%" stopColor={theme.colors.accent + 'AA'} />
            <stop offset="100%" stopColor={theme.colors.accent + '88'} />
          </linearGradient>
          <linearGradient id="nodeGrad-default" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(30, 30, 35, 0.9)" />
            <stop offset="100%" stopColor="rgba(20, 20, 25, 0.95)" />
          </linearGradient>
          <linearGradient id="nodeGrad-source" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(30, 30, 35, 0.85)" />
            <stop offset="100%" stopColor="rgba(20, 20, 25, 0.9)" />
          </linearGradient>
          <linearGradient id="nodeGrad-solution" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={theme.colors.primary + 'DD'} />
            <stop offset="50%" stopColor={theme.colors.primary + 'BB'} />
            <stop offset="100%" stopColor={theme.colors.primary + '99'} />
          </linearGradient>
          <linearGradient id="nodeGrad-loss" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={theme.colors.accent + 'BB'} />
            <stop offset="100%" stopColor={theme.colors.accent + '88'} />
          </linearGradient>
          <linearGradient id="nodeGrad-new" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={theme.colors.secondary + 'DD'} />
            <stop offset="100%" stopColor={theme.colors.secondary + 'AA'} />
          </linearGradient>
          <linearGradient id="nodeGrad-revenue" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={theme.colors.secondary + 'DD'} />
            <stop offset="100%" stopColor={theme.colors.secondary + 'AA'} />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="nodeGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="solutionGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* New: Loss glow filter for bleed phase */}
          <filter id="lossGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Links - now with layer-aware drawing */}
        <g>
          {layout?.links.map(link => {
            const gradId = link.type === 'loss' ? 'grad-loss' :
                          (link.type === 'new' || link.type === 'revenue') ? 'grad-secondary' : 'grad-primary';

            const sourceLayer = link.source.layer;
            const targetLayer = link.target.layer;
            const linkLayer = Math.max(sourceLayer, targetLayer);

            // Use layer-specific progress in narrative mode
            const layerProgress = getLayerDrawProgress(linkLayer);
            
            const linkForgeProgress = forgeLayer >= linkLayer ? 1 :
                                     forgeLayer === linkLayer - 1 ? (forgeProgress % 0.25) * 4 : 0;

            const connectionVisible = effectiveRevealPhase >= 2 || 
              (isForging && linkForgeProgress > 0) ||
              (narrativeEnabled && layerProgress > 0);
              
            const currentDrawProgressForLink = isForging 
              ? linkForgeProgress 
              : (narrativeEnabled ? layerProgress : drawProgress);

            const strokeMultiplier = isBefore ? 1 : 1.1;
            
            // Enhanced opacity for loss links during bleed
            let linkOpacity = connectionVisible
              ? (link.type === 'loss'
                  ? (isBefore ? 0.35 : 0.25)
                  : (isBefore ? 0.4 : 0.6))
              : 0;
              
            if (link.type === 'loss' && narrativeEnabled && narrative.lossHighlightActive) {
              linkOpacity = 0.35 + narrative.lossPulseIntensity * 0.25;
            }
            
            return (
              <path
                key={link.id}
                d={link.path}
                fill="none"
                stroke={`url(#${gradId})`}
                strokeWidth={link.thickness * strokeMultiplier}
                strokeLinecap="round"
                strokeOpacity={linkOpacity}
                strokeDasharray={link.type === 'loss' ? '8 4' : link.pathLength}
                strokeDashoffset={link.type === 'loss' ? 0 : link.pathLength * (1 - currentDrawProgressForLink)}
                filter={
                  link.type === 'loss' && narrativeEnabled && narrative.lossHighlightActive
                    ? 'url(#lossGlow)'
                    : (!isBefore && link.type !== 'loss' ? 'url(#glow)' : undefined)
                }
                style={{
                  transition: isForging || narrativeEnabled ? 'none' : 'stroke-opacity 0.8s ease-out',
                }}
              />
            );
          })}
        </g>

        {/* Nodes - layer-aware visibility */}
        <g>
          {layout?.nodes.map((node, i) => {
            const delay = i * LAYOUT.staggerDelay;
            
            // Calculate node progress based on narrative or legacy mode
            let nodeProgress: number;
            if (narrativeEnabled) {
              const layerProgress = narrative.layerDrawProgress[node.layer] || 0;
              nodeProgress = layerProgress;
            } else {
              nodeProgress = Math.max(0, Math.min(1,
                (drawProgress * LAYOUT.drawDuration - delay) / 350
              ));
            }
            
            const scale = easeOutBack(nodeProgress);

            const nodeLayerVisible = !isForging || forgeLayer >= node.layer;
            const nodeVisible = narrativeEnabled 
              ? nodeProgress > 0.1
              : (effectiveRevealPhase >= 2 && nodeLayerVisible);
            const nodeOpacity = nodeVisible ? Math.min(1, nodeProgress * 1.2) * getNodePulse(node) : 0;

            const isBeingForged = isForging && forgeLayer === node.layer;
            const isBeingHighlighted = node.type === 'loss' && narrativeEnabled && narrative.lossHighlightActive;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y - node.height / 2})`}
                style={{
                  opacity: nodeOpacity,
                  cursor: onNodeClick ? 'pointer' : 'default',
                  filter: isBeingForged ? 'brightness(1.2)' : 
                          isBeingHighlighted ? `brightness(${1 + narrative.lossPulseIntensity * 0.3})` : 'none',
                  transition: isForging || narrativeEnabled
                    ? 'opacity 0.3s ease-out, filter 0.15s ease-out'
                    : `opacity 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 80}ms`,
                }}
                onClick={() => onNodeClick?.(node.id)}
              >
                {/* Outer glow for non-loss nodes in after state */}
                {!isBefore && node.type !== 'loss' && (
                  <rect
                    x={-3}
                    y={-3}
                    width={node.width + 6}
                    height={node.height + 6}
                    rx={9}
                    fill="none"
                    stroke={node.type === 'solution' ? theme.colors.primary :
                            node.type === 'new' || node.type === 'revenue' ? theme.colors.secondary :
                            'rgba(255, 255, 255, 0.08)'}
                    strokeWidth={1.5}
                    opacity={0.3}
                    filter="url(#nodeGlow)"
                  />
                )}
                
                {/* Loss node highlight glow during bleed */}
                {node.type === 'loss' && isBeingHighlighted && (
                  <rect
                    x={-4}
                    y={-4}
                    width={node.width + 8}
                    height={node.height + 8}
                    rx={10}
                    fill="none"
                    stroke={theme.colors.accent}
                    strokeWidth={2}
                    opacity={narrative.lossPulseIntensity * 0.6}
                    filter="url(#lossGlow)"
                  />
                )}

                {/* Main node rect */}
                <rect
                  width={node.width}
                  height={node.height}
                  rx={6}
                  fill={`url(#nodeGrad-${node.type || 'default'})`}
                  stroke={node.type === 'solution' ? theme.colors.primary :
                          node.type === 'loss' ? theme.colors.accent :
                          node.type === 'new' || node.type === 'revenue' ? theme.colors.secondary :
                          theme.colors.border}
                  strokeWidth={node.type === 'solution' ? 1.5 : (isBeingHighlighted ? 2 : 1)}
                  strokeOpacity={node.type === 'solution' ? 0.9 : (isBeingHighlighted ? 0.9 : 0.5)}
                  filter={node.type === 'solution' && !isBefore ? 'url(#solutionGlow)' : undefined}
                  style={{
                    transform: `scale(${scale})`,
                    transformOrigin: `${node.width / 2}px ${node.height / 2}px`,
                  }}
                />

                {/* Inner highlight */}
                <rect
                  x={2}
                  y={2}
                  width={node.width - 4}
                  height={node.height - 4}
                  rx={4}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth={1}
                  style={{
                    transform: `scale(${scale})`,
                    transformOrigin: `${node.width / 2}px ${node.height / 2}px`,
                  }}
                />

                {/* Node label */}
                <text
                  x={node.layer < 2 ? node.width + 16 : -16}
                  y={node.height / 2}
                  dy="0.35em"
                  textAnchor={node.layer < 2 ? 'start' : 'end'}
                  fill={node.type === 'loss' ? theme.colors.accent : theme.colors.text}
                  fontSize={12}
                  fontWeight={node.type === 'solution' ? 600 : (isBeingHighlighted ? 600 : 500)}
                  fontFamily="Inter, system-ui, sans-serif"
                  style={{
                    textShadow: node.type === 'solution' ? `0 0 15px ${theme.colors.primary}` :
                                isBeingHighlighted ? `0 0 12px ${theme.colors.accent}` : undefined,
                  }}
                >
                  {node.label}
                </text>

                {/* NEW badge */}
                {node.type === 'new' && (
                  <text
                    x={node.layer < 2 ? node.width + 16 : -16}
                    y={node.height / 2 + 14}
                    textAnchor={node.layer < 2 ? 'start' : 'end'}
                    fill={theme.colors.secondary}
                    fontSize={9}
                    fontWeight={600}
                    opacity={0.7}
                  >
                    NEW
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Brand logo - top left */}
      <div className="absolute top-7 left-8 z-30 flex items-center gap-3.5">
        {brand.logoUrl ? (
          <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.08)' }}>
            <img
              src={brand.logoUrl}
              alt={brand.name}
              className="h-10 w-auto object-contain"
              style={{ maxWidth: '160px' }}
            />
          </div>
        ) : (
          <>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-lg"
              style={{ background: theme.gradients.primary, color: theme.colors.bgDark }}
            >
              {brand.name.charAt(0)}
            </div>
            <h1 className="text-base font-semibold tracking-tight" style={{ color: theme.colors.text }}>
              {brand.name}
            </h1>
          </>
        )}
      </div>

      {/* State label - top center */}
      <div
        className="absolute top-7 left-1/2 -translate-x-1/2 z-20"
        style={{
          opacity: effectiveUiVisible ? 1 : 0,
          transform: `translateX(-50%) translateY(${effectiveUiVisible ? 0 : -10}px)`,
          transition: 'all 0.5s ease',
        }}
      >
        <div
          className="px-5 py-2.5 rounded-full backdrop-blur-xl text-sm font-semibold tracking-wide"
          style={{
            background: isBefore
              ? 'rgba(10, 10, 10, 0.8)'
              : 'linear-gradient(135deg, #00D4E5 0%, #00BFA6 100%)',
            border: `1px solid ${isBefore ? 'rgba(255, 255, 255, 0.1)' : 'transparent'}`,
            color: isBefore ? 'rgba(255, 255, 255, 0.7)' : '#0A0A0A',
          }}
        >
          {state.stageLabel}
        </div>
      </div>

      {/* Stage labels */}
      <div
        className="absolute top-24 left-0 right-0 z-15 flex justify-center px-16"
        style={{
          opacity: effectiveUiVisible ? 1 : 0,
          transform: `translateY(${effectiveUiVisible ? 0 : -10}px)`,
          transition: 'all 0.6s ease 0.2s',
        }}
      >
        {stageLabels.map((label, i) => (
          <div key={i} className="flex-1 text-center">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: theme.colors.textDim }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Metrics panel - right side */}
      {!hideUI && (
        <div
          className="absolute top-1/2 right-8 -translate-y-1/2 z-20 flex flex-col gap-4"
          style={{ opacity: effectiveUiVisible ? 1 : 0, transition: 'opacity 0.5s ease' }}
        >
          {state.metrics.map((metric, i) => {
            const metricVisible = effectiveRevealPhase >= 5 && effectiveMetricsVisible[i];
            return (
              <div
                key={metric.id}
                className="p-5 rounded-2xl backdrop-blur-xl min-w-40"
                style={{
                  background: 'rgba(0, 0, 0, 0.7)',
                  border: `1px solid ${
                    metric.type === 'negative' ? theme.colors.accent + '33' :
                    metric.type === 'positive' ? theme.colors.primary + '33' :
                    theme.colors.borderLight
                  }`,
                  opacity: metricVisible ? 1 : 0,
                  transform: metricVisible ? 'translateX(0)' : 'translateX(20px)',
                  transition: `all 0.4s ease-out ${i * 150}ms`,
                }}
              >
                <div
                  className="text-3xl font-bold leading-none"
                  style={{
                    color: metric.type === 'negative' ? '#FF6B6B'
                      : metric.type === 'positive' ? '#4ADE80'
                      : 'rgba(255, 255, 255, 0.7)',
                  }}
                >
                  <AnimatedValue value={metric.value} delay={200 + i * 150} />
                </div>
                <div className="text-xs mt-1.5" style={{ color: theme.colors.textDim }}>
                  {metric.label}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Anchored metric */}
      {!hideUI && state.anchoredMetric && anchoredPosition && (
        <div
          className="absolute z-25 px-3.5 py-2.5 rounded-xl backdrop-blur-md pointer-events-none"
          style={{
            left: anchoredPosition.left,
            top: anchoredPosition.top,
            background: 'rgba(0, 0, 0, 0.85)',
            border: `1px solid ${
              state.anchoredMetric.type === 'loss'
                ? theme.colors.accent + '55'
                : theme.colors.primary + '55'
            }`,
            boxShadow: `0 4px 16px ${
              state.anchoredMetric.type === 'loss'
                ? theme.colors.accent + '20'
                : theme.colors.primary + '20'
            }`,
            opacity: effectiveAnchoredVisible ? 1 : 0,
            transform: effectiveAnchoredVisible ? 'scale(1)' : 'scale(0.9)',
            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <div
            className="text-lg font-bold"
            style={{
              color: state.anchoredMetric.type === 'loss'
                ? theme.colors.accent
                : theme.colors.primary,
            }}
          >
            {state.anchoredMetric.value}
          </div>
          <div className="text-xs uppercase tracking-wide mt-0.5" style={{ color: theme.colors.textDim }}>
            {state.anchoredMetric.label}
          </div>
        </div>
      )}

      {/* Legend */}
      {!hideUI && (
        <div
          className="absolute bottom-24 left-8 z-20 flex flex-col gap-2 px-4 py-3 rounded-xl"
          style={{
            background: 'rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: theme.colors.primary }}
            />
            <span className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {isBefore ? 'Value captured' : 'Value captured (increased)'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ 
                background: theme.colors.accent,
                boxShadow: narrativeEnabled && narrative.lossHighlightActive 
                  ? `0 0 8px ${theme.colors.accent}` 
                  : 'none'
              }}
            />
            <span className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {isBefore ? 'Value at risk' : 'Remaining risk (reduced)'}
            </span>
          </div>
          {!isBefore && (
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ background: theme.colors.secondary }}
              />
              <span className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                New capability
              </span>
            </div>
          )}
        </div>
      )}

      {/* Powered by footer */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pb-4 flex justify-center">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
          style={{
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          <span>Powered by</span>
          <span style={{ color: '#00D4E5', fontWeight: 600 }}>viashift</span>
        </div>
      </div>
    </div>
  );
};

export default SankeyFlowV3;