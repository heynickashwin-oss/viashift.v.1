/**
 * SankeyFlowV3 - v3.10
 *
 * CHANGES from v3.9:
 * - Removed arrow markers from flow endpoints (visual cleanup)
 * - Added node highlighting when comparison card is active
 * - Added stakeholder comparison card integration
 *
 * CHANGES from v3.8:
 * - Removed particle system for cleaner static visualization
 * - Reduced performance overhead
 *
 * CHANGES from v3.7:
 * - Added displayValue to SankeyNode for showing values on nodes
 * - Added displayLabel to SankeyLink for showing values on flows
 * - Added showLabels prop to toggle value visibility
 * - Labels appear below node names and at flow midpoints
 * - Only loss/new/revenue flows show labels (reduces clutter)
 *
 * CHANGES from v3.6:
 * - FIXED: Infinite re-render loop
 *   - Wrapped component with React.memo() for stable renders
 *   - Converted layout from useState/useEffect to useMemo (derived state)
 *   - Track animation completion by data identity, not layout reference
 *   - Moved pulsePhase to useRef + requestAnimationFrame (no state re-renders)
 *   - Removed console.log spam
 */

import { useEffect, useRef, useState, useCallback, useMemo, memo } from 'react';
import { BrandConfig, DEFAULT_BRAND, resolveTheme } from './branding/brandUtils';
import { useNarrativeController } from '../hooks/useNarrativeController';
import { NodeCallouts, NodePosition } from './NodeCallout';
import { NarrativeScript } from '../data/templates/b2bSalesEnablement';
import { timeline, DEBUG_TIMELINE } from '../utils/debugTimeline';
import { NodeComparisonBand } from './NodeComparisonBand';
import type { NodeComparison, ViewerType } from '../types/stakeholderComparison';

// ============================================
// TYPES
// ============================================

export type ValueFormat = 'percent' | 'currency' | 'number';

export interface SankeyNode {
  id: string;
  label: string;
  layer: number;
  value: number;
  y?: number;
  type?: 'default' | 'source' | 'solution' | 'loss' | 'new' | 'revenue' | 'destination';
  displayValue?: string; // e.g., "$550K", "55%"
}

export interface SankeyLink {
  id?: string;
  from: string;
  to: string;
  value: number;
  type?: 'default' | 'loss' | 'new' | 'revenue';
  displayLabel?: string; // e.g., "-$200K", "+20%"
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
  onNodeClick?: (nodeId: string, nodeInfo: { label: string; value: string; type: string }) => void;
  transitionPhase?: 'idle' | 'anticipation' | 'shifting' | 'revealing';
  hideUI?: boolean;
  showLabels?: boolean;
  editable?: boolean;
  onNodeValueChange?: (nodeId: string, newValue: string) => void;
  onLinkLabelChange?: (linkId: string, newLabel: string) => void;
  narrative?: NarrativeScript;
  /** Stakeholder comparison data for alignment discovery */
  comparisons?: NodeComparison[];
  /** Current viewer type for comparison priority */
  viewerType?: ViewerType;
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
  displayLabel?: string;
  midpoint: { x: number; y: number };
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

// Generate a stable identity key for the data
function getDataIdentity(data: SankeyData): string {
  return `${data.nodes.length}-${data.links.length}-${data.nodes.map(n => n.id).join(',')}`;
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
// LAYOUT CONSTANTS
// ============================================

const LAYOUT = {
  padding: { top: 100, right: 60, bottom: 120, left: 60 },
  nodeWidth: 18,
  nodeMinHeight: 35,
  nodeMaxHeight: 90,
  drawDuration: 16000,     // Doubled from 8000 for better storytelling
  staggerDelay: 200,       // Slightly more stagger
  forgeDuration: 2000,     // Slower forge for after state
};
const layerXPercent: Record<number, number> = {
  0: 0.05,
  1: 0.28,
  2: 0.58,
  3: 0.92,
};

// ============================================
// MAIN COMPONENT
// ============================================

const SankeyFlowV3Inner = ({
  state,
  stageLabels = ['Ingest', 'Process', 'Distribute', 'Monetize'],
  variant,
  brand = DEFAULT_BRAND,
  animated = true,
  className = '',
  onNodeClick,
  transitionPhase = 'idle',
  hideUI = false,
  showLabels = true,
  editable = false,
  onNodeValueChange,
  onLinkLabelChange,
  narrative,
  comparisons = [],
  viewerType = 'default',
}: SankeyFlowProps) => {
  const theme = useMemo(() => resolveTheme(brand), [brand]);

  // Narrative controller for phased storytelling
  const narrativeState = useNarrativeController({
  variant,
  isActive: animated && !hideUI,
  layerCount: 4,
  metricCount: state.metrics.length,
  hasAnchoredMetric: !!state.anchoredMetric,
  narrative,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [drawProgress, setDrawProgress] = useState(0);
  const [uiVisible, setUiVisible] = useState(false);
  const [metricsVisible, setMetricsVisible] = useState<boolean[]>([]);
  const [anchoredVisible, setAnchoredVisible] = useState(false);
  const [revealPhase, setRevealPhase] = useState(0);
  const [forgeProgress, setForgeProgress] = useState(1);
  const [forgeLayer, setForgeLayer] = useState(-1);
  const [isForging, setIsForging] = useState(false);
  const [exitPhase, setExitPhase] = useState<'none' | 'freeze' | 'desaturate' | 'gone'>('none');
  // Edit state
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  // Comparison card highlight state
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);

  // Use ref for pulse to avoid re-renders
  const pulsePhaseRef = useRef(0);
  const [, forceUpdate] = useState(0);

  const drawAnimationRef = useRef<number | null>(null);
  const pulseAnimationRef = useRef<number | null>(null);

  // Refs for animation loop
  const drawProgressRef = useRef(0);
  const revealPhaseRef = useRef(0);
  const isForgingRef = useRef(false);
  const forgeLayerRef = useRef(-1);
  const exitPhaseRef = useRef<'none' | 'freeze' | 'desaturate' | 'gone'>('none');
  const isBeforeRef = useRef(true);

  // CRITICAL FIX: Calculate layout with useMemo instead of useEffect
  // This ensures layout only changes when data or dimensions actually change
  const layout = useMemo(() => {
    if (!state.data.nodes.length || dimensions.width < 100) return null;
    const { padding, nodeWidth, nodeMinHeight, nodeMaxHeight } = LAYOUT;
    const nodes: LayoutNode[] = [];
    const nodeMap = new Map<string, LayoutNode>();
    const maxLayer = Math.max(...state.data.nodes.map(n => n.layer), 0);
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

      // Calculate bezier midpoint at t=0.5 for label positioning
      const t = 0.5;
      const cp1x = x0 + dx * 0.45;
      const cp2x = x0 + dx * 0.55;
      const mt = 1 - t;
      const midpoint = {
        x: mt*mt*mt*x0 + 3*mt*mt*t*cp1x + 3*mt*t*t*cp2x + t*t*t*x1,
        y: mt*mt*mt*y0 + 3*mt*mt*t*y0 + 3*mt*t*t*y1 + t*t*t*y1,
      };

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
        displayLabel: link.displayLabel,
        midpoint,
      };
    }).filter(Boolean) as LayoutLink[];

    return { nodes, links };
  }, [state.data, dimensions]);

  // Build nodePositions map for callout positioning
  const nodePositions = useMemo((): Map<string, NodePosition> => {
    const positions = new Map<string, NodePosition>();
    if (!layout) return positions;
    
    layout.nodes.forEach(node => {
      positions.set(node.id, {
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
        layer: node.layer,
      });
    });
    
    return positions;
  }, [layout]);
  
  // Memoized max layer for layer-staggered animation
  const maxLayer = useMemo(() => {
    if (!layout) return 3;
    return Math.max(...layout.nodes.map(n => n.layer), 0);
  }, [layout]);
  
  // Calculate which layers are visible for comparison cards
  // A layer is "visible" when its nodes have started drawing
  const visibleLayers = useMemo((): number[] => {
    const layers: number[] = [];
    
    // For after state with forge animation, use forge layer
    // For before state, use draw progress
    if (isForging) {
      // Include all layers up to and including current forge layer
      for (let layer = 0; layer <= forgeLayer; layer++) {
        layers.push(layer);
      }
    } else {
      // Use draw progress for before state
      for (let layer = 0; layer <= maxLayer; layer++) {
        const layerDuration = 0.4;
        const layerOverlap = 0.15;
        const layerStart = layer * (layerDuration - layerOverlap);
        
        if (drawProgress > layerStart + 0.1) {
          layers.push(layer);
        }
      }
    }
    
    return layers;
  }, [maxLayer, drawProgress, isForging, forgeLayer]);

  // Calculate progress for a specific layer based on overall draw progress
  // Layers overlap slightly for smoother visual flow
  const getLayerProgress = useCallback((layer: number, overallProgress: number): number => {
    const layerCount = maxLayer + 1;
    
    // Each layer takes 40% of total time, overlapping by 15%
    const layerDuration = 0.4;
    const layerOverlap = 0.15;
    const layerStart = layer * (layerDuration - layerOverlap);
    const layerEnd = layerStart + layerDuration;

    if (overallProgress <= layerStart) return 0;
    if (overallProgress >= layerEnd) return 1;

    const rawProgress = (overallProgress - layerStart) / (layerEnd - layerStart);
    return easeOutCubic(rawProgress);
  }, [maxLayer]);

  // Edit handlers
  const handleStartEditNode = useCallback((nodeId: string, currentValue: string) => {
    if (!editable) return;
    setEditingNodeId(nodeId);
    setEditValue(currentValue);
  }, [editable]);

  const handleStartEditLink = useCallback((linkId: string, currentLabel: string) => {
    if (!editable) return;
    setEditingLinkId(linkId);
    setEditValue(currentLabel);
  }, [editable]);

  const handleSaveEdit = useCallback(() => {
    if (editingNodeId && onNodeValueChange) {
      onNodeValueChange(editingNodeId, editValue);
    }
    if (editingLinkId && onLinkLabelChange) {
      onLinkLabelChange(editingLinkId, editValue);
    }
    setEditingNodeId(null);
    setEditingLinkId(null);
    setEditValue('');
  }, [editingNodeId, editingLinkId, editValue, onNodeValueChange, onLinkLabelChange]);

  const handleCancelEdit = useCallback(() => {
    setEditingNodeId(null);
    setEditingLinkId(null);
    setEditValue('');
  }, []);

  // Pulse animation using requestAnimationFrame instead of setInterval
  useEffect(() => {
    let running = true;
    
    const animatePulse = () => {
      if (!running) return;
      pulsePhaseRef.current = (pulsePhaseRef.current + 1) % 360;
      // Only force update every 50ms (20fps) for pulse, not every frame
      pulseAnimationRef.current = requestAnimationFrame(animatePulse);
    };
    
    // Trigger re-render for pulse at lower frequency
    const pulseInterval = setInterval(() => {
      if (running) forceUpdate(n => n + 1);
    }, 50);
    
    pulseAnimationRef.current = requestAnimationFrame(animatePulse);
    
    return () => {
      running = false;
      clearInterval(pulseInterval);
      if (pulseAnimationRef.current) {
        cancelAnimationFrame(pulseAnimationRef.current);
      }
    };
  }, []);

  // Resize observer for dimensions
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

// DEBUG: Track which dependency triggers re-runs
useEffect(() => {
  console.log('[DEP] layout changed', getDataIdentity(state.data));
}, [layout]);

useEffect(() => {
  console.log('[DEP] animated changed', animated);
}, [animated]);

useEffect(() => {
  console.log('[DEP] state.metrics.length changed', state.metrics.length);
}, [state.metrics.length]);

useEffect(() => {
  console.log('[DEP] maxLayer changed', maxLayer);
}, [maxLayer]);

useEffect(() => {
  console.log('[DEP] getLayerProgress changed');
}, [getLayerProgress]);
  
  // Sync refs
  useEffect(() => { drawProgressRef.current = drawProgress; }, [drawProgress]);
  useEffect(() => { revealPhaseRef.current = revealPhase; }, [revealPhase]);
  useEffect(() => { isForgingRef.current = isForging; }, [isForging]);
  useEffect(() => { forgeLayerRef.current = forgeLayer; }, [forgeLayer]);
  useEffect(() => { exitPhaseRef.current = exitPhase; }, [exitPhase]);
  useEffect(() => { isBeforeRef.current = variant === 'before'; }, [variant]);

  // CRITICAL FIX: Track animation by data identity, not layout reference
  // This prevents resize from restarting animation
useEffect(() => {
    if (!layout) return;

    // Cancel any existing animation
    if (drawAnimationRef.current) {
      cancelAnimationFrame(drawAnimationRef.current);
      drawAnimationRef.current = null;
    }

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
    
    // Start timeline logging
    timeline.start();
    timeline.log('Animation', 'BEGIN', 0);
    
    // Track which UI elements have been triggered
    let uiTriggered = false;
    const metricsTriggered: boolean[] = state.metrics.map(() => false);
    let anchoredTriggered = false;
    const layersLogged: boolean[] = [false, false, false, false];

    const animateDraw = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setDrawProgress(easeOutCubic(progress));

      // Log layer progress
      for (let layer = 0; layer <= maxLayer; layer++) {
        const layerProg = getLayerProgress(layer, easeOutCubic(progress));
        if (layerProg > 0.01 && !layersLogged[layer]) {
          layersLogged[layer] = true;
          timeline.log(`Layer ${layer}`, 'START', progress);
        }
        if (layerProg > 0.99 && layersLogged[layer]) {
          timeline.log(`Layer ${layer}`, 'COMPLETE', progress);
          layersLogged[layer] = false; // Prevent duplicate logs
        }
      }

      // Stagger UI elements DURING draw
      if (progress > 0.1 && !uiTriggered) {
        uiTriggered = true;
        setUiVisible(true);
        timeline.log('Stage Labels', 'APPEAR', progress);
        timeline.log('Narrative Header', 'APPEAR', progress);
      }
      
      // Show metrics as layers complete
      state.metrics.forEach((metric, i) => {
        const metricThreshold = 0.3 + (i * 0.2);
        if (progress > metricThreshold && !metricsTriggered[i]) {
          metricsTriggered[i] = true;
          setMetricsVisible(prev => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
          timeline.log(`Metric ${i} (${metric.label})`, 'APPEAR', progress);
        }
      });
      
      // Show anchored metric at 60% progress
      if (progress > 0.6 && !anchoredTriggered) {
        anchoredTriggered = true;
        setAnchoredVisible(true);
        timeline.log('Anchored Metric', 'APPEAR', progress);
      }

      if (progress < 1) {
        drawAnimationRef.current = requestAnimationFrame(animateDraw);
      } else {
        drawAnimationRef.current = null;
        timeline.log('Animation', 'COMPLETE', 1);
        timeline.stop();
      }
    };

    drawAnimationRef.current = requestAnimationFrame(animateDraw);

    return () => {
      if (drawAnimationRef.current) {
        cancelAnimationFrame(drawAnimationRef.current);
        drawAnimationRef.current = null;
      }
    };
  }, [layout, animated, state.metrics.length, maxLayer, getLayerProgress]);

  // Forge transition with slower timing
  useEffect(() => {
    if (variant === 'after' && transitionPhase === 'revealing') {
      setIsForging(true);
      setForgeProgress(0);
      setForgeLayer(0);
      setRevealPhase(0);

      const layerDuration = LAYOUT.forgeDuration;
      const maxLayerVal = Math.max(...(layout?.nodes.map(n => n.layer) || [0]), 0);

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
    const phase = pulsePhaseRef.current;
    if (node.type === 'loss') {
      return 0.85 + Math.sin(phase * 0.15) * 0.1 + Math.sin(phase * 0.23) * 0.05;
    }
    if (node.type === 'solution') {
      return 0.95 + Math.sin(phase * 0.05) * 0.05;
    }
    return 0.9 + Math.sin(phase * 0.08) * 0.08;
  };

  const isBefore = variant === 'before';

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

      {/* Stakeholder Comparison Cards - Top Band */}
      {comparisons && comparisons.length > 0 && !hideUI && (
        <NodeComparisonBand
          comparisons={comparisons}
          nodePositions={nodePositions}
          viewerType={viewerType}
          visibleLayers={visibleLayers}
          containerWidth={dimensions.width}
          topOffset={80}
          cycleDelay={5000}
          onActiveNodeChange={setHighlightedNodeId}
        />
      )}

      {/* SVG for links and nodes */}
      <svg width={dimensions.width} height={dimensions.height} className="absolute inset-0">
        <style>
          {`
            @keyframes glowPulse {
              0%, 100% { opacity: 0.8; }
              50% { opacity: 1.0; }
            }

            @keyframes lossFlowPulse {
              0%, 100% { opacity: 0.5; }
              50% { opacity: 0.65; }
            }

            .node-hover:hover {
              filter: brightness(1.15);
}

            .flow-hover:hover {
              filter: brightness(1.2);
            }

            .node-transition {
              transition: transform 0.2s ease, filter 0.2s ease;
            }

            .flow-transition {
              transition: filter 0.2s ease;
            }

            .solution-glow {
              animation: glowPulse 3s ease-in-out infinite;
            }

            .new-glow {
              animation: glowPulse 3s ease-in-out infinite;
            }

            .loss-flow {
              animation: lossFlowPulse 5.5s ease-in-out infinite;
            }
          `}
        </style>
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
            <stop offset="100%" stopColor={theme.colors.loss + '88'} />
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
        </defs>

        {/* Links */}
        <g>
          {layout?.links.map(link => {
            const gradId = link.type === 'loss' ? 'grad-loss' :
                          (link.type === 'new' || link.type === 'revenue') ? 'grad-secondary' : 'grad-primary';

            const linkLayer = Math.max(link.source.layer, link.target.layer);
            const layerDrawProgress = getLayerProgress(linkLayer, drawProgress);
            const isLoss = link.type === 'loss';

            // ALL flows draw in sequence now (loss flows included)
            const baseOpacity = isLoss ? 0.6 : 0.7;
            const opacity = exitPhase === 'desaturate' 
              ? baseOpacity * 0.4 
              : baseOpacity * layerDrawProgress;

            return (
              <g key={link.id}>
                {/* Glow layer */}
                <path
                  d={link.path}
                  fill="none"
                  stroke={`url(#${gradId})`}
                  strokeWidth={link.thickness + 8}
                  strokeLinecap="round"
                  opacity={opacity * 0.15}
                  filter="url(#glow)"
                  style={{
                    strokeDasharray: link.pathLength,
                    strokeDashoffset: link.pathLength * (1 - layerDrawProgress),
                    transition: exitPhase !== 'none' ? 'opacity 0.3s' : 'none',
                  }}
                />

                {/* Main stroke */}
                <path
                  d={link.path}
                  fill="none"
                  stroke={`url(#${gradId})`}
                  strokeWidth={link.thickness}
                  strokeLinecap="round"
                  opacity={opacity}
                  className={`flow-transition flow-hover ${isLoss ? 'loss-flow' : ''}`}
                  style={{
                    strokeDasharray: link.pathLength,
                    strokeDashoffset: link.pathLength * (1 - layerDrawProgress),
                    transition: exitPhase !== 'none' ? 'opacity 0.3s' : 'none',
                  }}
                />

                {/* Flow label at midpoint */}
                {showLabels && link.displayLabel && (link.type === 'loss' || link.type === 'new' || link.type === 'revenue') && layerDrawProgress > 0.5 && (
                  editingLinkId === link.id ? (
                    <foreignObject
                      x={link.midpoint.x - 32}
                      y={link.midpoint.y - 12}
                      width={64}
                      height={24}
                      style={{
                        opacity: Math.min(1, (layerDrawProgress - 0.5) * 2),
                      }}
                    >
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSaveEdit();
                          } else if (e.key === 'Escape') {
                            e.preventDefault();
                            handleCancelEdit();
                          }
                        }}
                        onBlur={handleSaveEdit}
                        autoFocus
                        style={{
                          width: '64px',
                          height: '24px',
                          background: 'rgba(0, 0, 0, 0.85)',
                          border: `1px solid ${link.type === 'loss' ? theme.colors.accent + '66' : theme.colors.secondary + '66'}`,
                          borderRadius: '12px',
                          color: link.type === 'loss' ? theme.colors.accent : theme.colors.secondary,
                          fontSize: '13px',
                          fontWeight: 600,
                          fontFamily: 'Inter, system-ui, sans-serif',
                          textAlign: 'center',
                          outline: 'none',
                          padding: '0',
                        }}
                      />
                    </foreignObject>
                  ) : (
                    <g
                      transform={`translate(${link.midpoint.x}, ${link.midpoint.y})`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEditLink(link.id, link.displayLabel || '');
                      }}
                      style={{
                        opacity: Math.min(1, (layerDrawProgress - 0.5) * 2),
                        transition: 'opacity 0.3s ease-out',
                        cursor: editable ? 'pointer' : 'default',
                      }}
                    >
                      <rect
                        x={-32}
                        y={-12}
                        width={64}
                        height={24}
                        rx={12}
                        fill="rgba(0, 0, 0, 0.85)"
                        stroke={link.type === 'loss' ? theme.colors.accent + '66' : theme.colors.secondary + '66'}
                        strokeWidth={1}
                      />
                      <text
                        x={0}
                        y={0}
                        dy="0.35em"
                        textAnchor="middle"
                        fill={link.type === 'loss' ? theme.colors.accent : theme.colors.secondary}
                        fontSize={13}
                        fontWeight={600}
                        fontFamily="Inter, system-ui, sans-serif"
                      >
                        {link.displayLabel}
                      </text>
                    </g>
                  )
                )}
              </g>
            );
          })}
        </g>

        {/* Nodes */}
        <g>
          {layout?.nodes.map(node => {
            const layerProgress = getLayerProgress(node.layer, drawProgress);
            const nodeScale = easeOutBack(Math.min(1, layerProgress * 1.2));
            const nodeOpacity = layerProgress;

            const gradId = `nodeGrad-${node.type || 'default'}`;
            const isLossNode = node.type === 'loss';
            const isSolutionNode = node.type === 'solution';
            const isNewNode = node.type === 'new' || node.type === 'revenue';
            
            const pulseOpacity = getNodePulse(node);
            const strokeColor = isLossNode ? theme.colors.accent :
                               isSolutionNode ? theme.colors.primary :
                               isNewNode ? theme.colors.secondary :
                               'rgba(255, 255, 255, 0.2)';

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="node-transition node-hover"
                style={{
                  opacity: exitPhase === 'desaturate' ? nodeOpacity * 0.4
                         : exitPhase === 'gone' ? 0
                         : nodeOpacity,
                  cursor: onNodeClick ? 'pointer' : 'default',
                  transition: exitPhase !== 'none' ? 'opacity 0.3s' : 'none',
                }}
                onClick={() => onNodeClick?.(node.id, { 
                label: node.label, 
                value: node.displayValue || '', 
                type: node.type || 'default' 
})}
              >
                {/* Highlight glow for comparison card active node */}
                {highlightedNodeId === node.id && (
                  <rect
                    x={-6}
                    y={-6}
                    width={node.width + 12}
                    height={node.height + 12}
                    rx={10}
                    fill="none"
                    stroke="#00D4E5"
                    strokeWidth={2}
                    opacity={0.8}
                    filter="url(#solutionGlow)"
                    style={{
                      animation: 'glowPulse 2s ease-in-out infinite',
                    }}
                  />
                )}
                
                {/* Glow behind node */}
                {(isSolutionNode || isNewNode) && (
                  <rect
                    x={-4}
                    y={-4}
                    width={node.width + 8}
                    height={node.height + 8}
                    rx={8}
                    fill={isSolutionNode ? theme.colors.primary : theme.colors.secondary}
                    opacity={0.2 * pulseOpacity}
                    filter="url(#solutionGlow)"
                    className={isSolutionNode ? 'solution-glow' : 'new-glow'}
                  />
                )}

                {/* Node rectangle */}
                <rect
                  width={node.width}
                  height={node.height}
                  rx={5}
                  fill={`url(#${gradId})`}
                  stroke={strokeColor}
                  strokeWidth={isLossNode || isSolutionNode || isNewNode ? 1.5 : 1}
                  opacity={pulseOpacity}
                  style={{
                    transform: `scale(${nodeScale})`,
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
                  fontWeight={node.type === 'solution' ? 600 : 500}
                  fontFamily="Inter, system-ui, sans-serif"
                  style={{
                    textShadow: node.type === 'solution' ? `0 0 15px ${theme.colors.primary}` : undefined,
                  }}
                >
                  {node.label}
                </text>

               {/* Node displayValue - pill box below label */}
{showLabels && node.displayValue && (
  editingNodeId === node.id ? (
    <foreignObject
      x={node.layer < 2 ? node.width + 16 : -16 - 56}
      y={node.height / 2 + 8}
      width={56}
      height={20}
    >
      <input
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSaveEdit();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancelEdit();
          }
        }}
        onBlur={handleSaveEdit}
        autoFocus
        style={{
          width: '56px',
          height: '20px',
          background: 'rgba(0, 0, 0, 0.85)',
          border: `1px solid ${node.type === 'loss' ? theme.colors.accent + '66' :
                  node.type === 'solution' || node.type === 'new' || node.type === 'revenue'
                    ? theme.colors.secondary + '66'
                    : 'rgba(255, 255, 255, 0.2)'}`,
          borderRadius: '10px',
          color: node.type === 'loss' ? theme.colors.accent :
                node.type === 'solution' || node.type === 'new' || node.type === 'revenue'
                  ? theme.colors.secondary
                  : 'rgba(255, 255, 255, 0.8)',
          fontSize: '11px',
          fontWeight: 600,
          fontFamily: 'Inter, system-ui, sans-serif',
          textAlign: 'center',
          outline: 'none',
          padding: '0',
        }}
      />
    </foreignObject>
  ) : (
    <g
      transform={`translate(${node.layer < 2 ? node.width + 16 : -16}, ${node.height / 2 + 18})`}
      onClick={(e) => {
        e.stopPropagation();
        handleStartEditNode(node.id, node.displayValue || '');
      }}
      style={{ cursor: editable ? 'pointer' : 'default' }}
    >
      <rect
        x={node.layer < 2 ? 0 : -56}
        y={-10}
        width={56}
        height={20}
        rx={10}
        fill="rgba(0, 0, 0, 0.85)"
        stroke={node.type === 'loss' ? theme.colors.accent + '66' :
                node.type === 'solution' || node.type === 'new' || node.type === 'revenue'
                  ? theme.colors.secondary + '66'
                  : 'rgba(255, 255, 255, 0.2)'}
        strokeWidth={1}
      />
      <text
        x={node.layer < 2 ? 28 : -28}
        y={0}
        dy="0.35em"
        textAnchor="middle"
        fill={node.type === 'loss' ? theme.colors.accent :
              node.type === 'solution' || node.type === 'new' || node.type === 'revenue'
                ? theme.colors.secondary
                : 'rgba(255, 255, 255, 0.8)'}
        fontSize={11}
        fontWeight={600}
        fontFamily="Inter, system-ui, sans-serif"
      >
        {node.displayValue}
      </text>
    </g>
  )
)}

                {/* NEW badge - only show if no displayValue */}
                {node.type === 'new' && !node.displayValue && (
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
          opacity: uiVisible ? 1 : 0,
          transform: `translateX(-50%) translateY(${uiVisible ? 0 : -10}px)`,
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
          opacity: uiVisible ? 1 : 0,
          transform: `translateY(${uiVisible ? 0 : -10}px)`,
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

      {/* Narrative header - shows phase-specific messaging */}
      {narrativeState.header && !hideUI && (
        <div
          className="absolute top-36 left-1/2 -translate-x-1/2 z-20"
          style={{
            opacity: uiVisible ? 1 : 0,
            transform: `translateX(-50%) translateY(${uiVisible ? 0 : -10}px)`,
            transition: 'all 0.5s ease 0.3s',
          }}
        >
          <div
            className="px-6 py-2 rounded-full backdrop-blur-md text-sm font-medium"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              border: `1px solid ${isBefore ? 'rgba(255, 255, 255, 0.1)' : theme.colors.primary + '33'}`,
              color: isBefore ? 'rgba(255, 255, 255, 0.8)' : theme.colors.primary,
            }}
          >
            {narrativeState.header}
          </div>
        </div>
      )}

      {/* Node callouts - positioned labels near specific nodes */}
      {!hideUI && (
        <NodeCallouts
          callouts={narrativeState.activeCallouts}
          nodePositions={nodePositions}
          visible={uiVisible && narrativeState.activeCallouts.length > 0}
          accentColor={theme.colors.accent}
          primaryColor={theme.colors.primary}
        />
      )}
      {/* Metrics panel - right side */}
      {!hideUI && (
        <div
          className="absolute top-1/2 right-8 -translate-y-1/2 z-20 flex flex-col gap-4"
          style={{ opacity: uiVisible ? 1 : 0, transition: 'opacity 0.5s ease' }}
        >
          {state.metrics.map((metric, i) => {
            const metricVisible = metricsVisible[i] && (!isForging || revealPhase >= 5);
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
            opacity: anchoredVisible ? 1 : 0,
            transform: anchoredVisible ? 'scale(1)' : 'scale(0.9)',
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
              style={{ background: theme.colors.accent }}
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
          <span>Powered viashift</span>
          <span style={{ color: '#00D4E5', fontWeight: 600 }}>Shift</span>
        </div>
      </div>
    </div>
  );
};

// Wrap with React.memo - use shallow comparison
export const SankeyFlowV3 = memo(SankeyFlowV3Inner);

export default SankeyFlowV3;