/**
 * SankeyFlowV3 - v3.18
 *
 * CHANGES from v3.17:
 * - DISABLED: Comparison cards (debugging layout issues first)
 * - REWRITTEN: Layout calculation with cleaner logic
 * - ADDED: Debug logging for nodes and links
 * - FIXED: Simplified thickness/height calculation flow
 *
 * CHANGES from v3.16:
 * - Flow labels now show only order count (link.value)
 *   - Removed displayLabel from flows to avoid stakeholder metric confusion
 *
 * CHANGES from v3.15:
 * - FIXED: Reduced minNodeHeight to match minThickness for alignment
 * - IMPROVED: Node highlight now simple white dashed border
 * - RESTORED: Flow labels at midpoints
 *
 * CHANGES from v3.14:
 * - FIXED: Node height now correctly matches flow heights
 *   - Link thicknesses are now scaled same as node heights
 *   - Flows should align perfectly with node edges
 * - IMPROVED: Node highlight indicator for comparison cards
 *   - Changed from cyan (conflicts with flows) to white dashed border
 *   - Clearer visual distinction from flow colors
 *
 * CHANGES from v3.13:
 * - Increased vertical spacing between nodes (nodeGap: 30 → 60)
 * - Removed rounded ends from flows (strokeLinecap: round → butt)
 * - Removed rounded corners from nodes (rx: 5 → 0)
 * - Flows and nodes now have flat/square edges for clean alignment
 * - Adjusted scaling to use more vertical space
 *
 * CHANGES from v3.12:
 * - FIXED: Proper Sankey layout behavior
 *   - Node height now equals sum of incoming/outgoing flow thicknesses
 *   - Flows stack vertically at node edges (no more overlapping)
 *   - Nodes within layers are vertically centered and properly spaced
 *   - Links sorted for consistent visual stacking order
 *
 * CHANGES from v3.11:
 * - FIXED: Flow thickness now proportional to value (was capped/floored incorrectly)
 *   - Uses maxLinkValue to calculate relative thickness
 *   - 270 orders vs 80 orders now visually ~3.4x wider as expected
 * - DISABLED: Node callouts temporarily removed to reduce visual complexity
 *
 * CHANGES from v3.10:
 * - Removed duplicate data display:
 *   - Node displayValue pills (metrics now in comparison cards)
 *   - Link labels at flow midpoints
 *   - Metrics panel hidden when comparison cards visible
 * - Cleaner visualization focuses on flow structure
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
import { TIMING, EASING } from '../lib/theme';
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

// Re-export NodePosition for external use
export type { NodePosition };

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
  /** Called when layout is calculated with node positions */
  onLayoutReady?: (nodePositions: Map<string, NodePosition>) => void;
  /** Called when draw animation completes */
  onAnimationComplete?: () => void;
  /** Called when hovering over a node */
  onNodeHover?: (nodeId: string | null) => void;
  /** Node significance data for delta-driven glow/pulse (shifted state) */
  nodeSignificance?: Map<string, { deltaPercent: number; significance: 'hero' | 'high' | 'medium' | 'low' }>;
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
  targetPoint: { x: number; y: number };
}

// ============================================
// UTILITIES
// ============================================

// Use easing functions from design system
const { outCubic: easeOutCubic, outBack: easeOutBack, lerp } = EASING;

// Generate a stable identity key for the data
function getDataIdentity(data: SankeyData): string {
  return `${data.nodes.length}-${data.links.length}-${data.nodes.map(n => n.id).join(',')}`;
}

// ============================================
// ANIMATED VALUE COMPONENT
// ============================================

const AnimatedValue = ({
  value,
  duration = TIMING.slow,  // 900ms from design system
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
  padding: { top: 20, right: 40, bottom: 60, left: 40 },  // Reduced side padding for wider nodes
  nodeWidth: 90,  // Wider nodes to contain labels internally
  nodeMinHeight: 48,  // Increased min height for label readability
  nodeMaxHeight: 95,
  drawDuration: TIMING.draw,         // 16000ms - from design system
  staggerDelay: TIMING.staggerDelay, // 200ms - from design system
  forgeDuration: TIMING.slower,      // 2000ms - from design system
};
const layerXPercent: Record<number, number> = {
  0: 0.00,    // Far left - Sources
  1: 0.17,    // Lead quality
  2: 0.34,    // Qualification
  3: 0.51,    // Sales engagement
  4: 0.68,    // Pipeline
  5: 0.85,    // Outcomes
};

// ============================================
// LABEL ABBREVIATION HELPER
// ============================================

// Common abbreviations for B2B sales terms
const LABEL_ABBREVIATIONS: Record<string, string> = {
  'Marketing Qualified': 'MQL',
  'Marketing Qualified Leads': 'MQL',
  'Sales Qualified': 'SQL',
  'Sales Qualified Leads': 'SQL',
  'High-Intent Leads': 'High-Intent',
  'Medium-Intent': 'Med-Intent',
  'Medium-Intent Leads': 'Med-Intent',
  'Low-Intent Leads': 'Low-Intent',
  'Active Opportunity': 'Opportunity',
  'Paid Search/Social': 'Paid',
  'SEO/Content': 'Organic',
  'Events/Conferences': 'Events',
  'Webinars/Content': 'Webinars',
  'Referral Programs': 'Referrals',
  'Disqualified Early': 'Disqualified',
  'Lost Early Stage': 'Lost Early',
  'Lost to Competitor': 'Lost Comp.',
  'Nurture Queue': 'Nurture',
  'No Response': 'No Response',
  'No Decision': 'No Decision',
  'Closed Won': 'Won',
};

// Abbreviate label for internal node display
const getAbbreviatedLabel = (label: string, maxLength: number = 12): string => {
  // Check for known abbreviations first
  if (LABEL_ABBREVIATIONS[label]) {
    return LABEL_ABBREVIATIONS[label];
  }
  
  // If short enough, use as-is
  if (label.length <= maxLength) {
    return label;
  }
  
  // Try to find natural break point
  const words = label.split(/[\s/-]+/);
  if (words.length > 1) {
    // Take first word if it fits, otherwise truncate
    const firstWord = words[0];
    if (firstWord.length <= maxLength) {
      return firstWord;
    }
  }
  
  // Last resort: truncate with ellipsis
  return label.slice(0, maxLength - 1) + '…';
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
  onLayoutReady,
  onAnimationComplete,
  onNodeHover,
  nodeSignificance,
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
    
    const { padding, nodeWidth } = LAYOUT;
    const maxLayer = Math.max(...state.data.nodes.map(n => n.layer), 0);
    const usableWidth = dimensions.width - padding.left - padding.right;
    const usableHeight = dimensions.height - padding.top - padding.bottom;

    // === DYNAMIC SIZING based on data density ===
    const nodeCount = state.data.nodes.length;
    const linkCount = state.data.links.length;
    const layerCount = maxLayer + 1;
    
    // Group nodes by layer to find max density
    const tempNodesByLayer = new Map<number, number>();
    state.data.nodes.forEach(n => {
      tempNodesByLayer.set(n.layer, (tempNodesByLayer.get(n.layer) || 0) + 1);
    });
    const maxNodesInLayer = Math.max(...tempNodesByLayer.values(), 1);
    
    // Dynamic thickness: scale based on available height and node density
    // More nodes = thinner flows to fit; fewer nodes = thicker flows for visual impact
    const baseMinThickness = Math.max(8, Math.min(25, usableHeight / (maxNodesInLayer * 8)));
    const baseMaxThickness = Math.max(baseMinThickness * 2, Math.min(80, usableHeight / (maxNodesInLayer * 3)));
    
    const minThickness = baseMinThickness;
    const maxThickness = baseMaxThickness;
    
    // Dynamic gap: less gap when more nodes per layer
    const baseGap = Math.max(15, Math.min(40, usableHeight / (maxNodesInLayer * 4)));
    const nodeGap = baseGap;

    // === STEP 1: Calculate base link thicknesses (unscaled) ===
    const maxLinkValue = Math.max(...state.data.links.map(l => l.value), 1);
    
    // Map from "from->to" to base thickness
    const baseThickness = new Map<string, number>();
    state.data.links.forEach(link => {
      const key = `${link.from}->${link.to}`;
      const thickness = minThickness + (link.value / maxLinkValue) * (maxThickness - minThickness);
      baseThickness.set(key, thickness);
    });

    // === STEP 2: Calculate node heights (sum of connected flows) ===
    const nodeOutgoingSum = new Map<string, number>();
    const nodeIncomingSum = new Map<string, number>();
    
    state.data.nodes.forEach(n => {
      nodeOutgoingSum.set(n.id, 0);
      nodeIncomingSum.set(n.id, 0);
    });
    
    state.data.links.forEach(link => {
      const key = `${link.from}->${link.to}`;
      const thickness = baseThickness.get(key) || minThickness;
      nodeOutgoingSum.set(link.from, (nodeOutgoingSum.get(link.from) || 0) + thickness);
      nodeIncomingSum.set(link.to, (nodeIncomingSum.get(link.to) || 0) + thickness);
    });

    // Node height = max(incoming, outgoing) - this ensures node can accommodate all flows
    const nodeBaseHeight = new Map<string, number>();
    state.data.nodes.forEach(n => {
      const incoming = nodeIncomingSum.get(n.id) || 0;
      const outgoing = nodeOutgoingSum.get(n.id) || 0;
      nodeBaseHeight.set(n.id, Math.max(minThickness, incoming, outgoing));
    });

    // === STEP 3: Group nodes by layer and calculate scaling ===
    const nodesByLayer = new Map<number, SankeyNode[]>();
    state.data.nodes.forEach(n => {
      const arr = nodesByLayer.get(n.layer) || [];
      arr.push(n);
      nodesByLayer.set(n.layer, arr);
    });

    // Sort nodes within each layer by their y position hint
    nodesByLayer.forEach((layerNodes) => {
      layerNodes.sort((a, b) => (a.y ?? 0.5) - (b.y ?? 0.5));
    });

    // Calculate total height needed per layer
    let maxTotalHeight = 0;
    nodesByLayer.forEach((layerNodes) => {
      let totalHeight = layerNodes.reduce((sum, n) => sum + (nodeBaseHeight.get(n.id) || minThickness), 0);
      totalHeight += (layerNodes.length - 1) * nodeGap;
      maxTotalHeight = Math.max(maxTotalHeight, totalHeight);
    });

    // Scale factor to fit in available height (use 90% to leave some breathing room)
    const scaleFactor = Math.min(1.5, (usableHeight * 0.90) / Math.max(maxTotalHeight, 1));

    // === STEP 4: Position nodes ===
    const nodes: LayoutNode[] = [];
    const nodeMap = new Map<string, LayoutNode>();

    nodesByLayer.forEach((layerNodes, layer) => {
      // Dynamic X positioning: spread layers evenly, leaving room for labels
      // Reserve ~10% on left for source labels, ~15% on right for outcome labels
      const leftMargin = 0.05;  // 5% for source labels
      const rightMargin = 0.12; // 12% for outcome labels
      const spreadWidth = 1 - leftMargin - rightMargin;
      
      // Calculate position: evenly distributed across available width
      const xPercent = layerCount === 1 
        ? 0.5 
        : leftMargin + (layer / (layerCount - 1)) * spreadWidth;
      
      const x = padding.left + xPercent * usableWidth;
      
      // Calculate total scaled height for this layer
      let totalLayerHeight = 0;
      const scaledHeights: number[] = [];
      layerNodes.forEach(node => {
        const height = (nodeBaseHeight.get(node.id) || minThickness) * scaleFactor;
        scaledHeights.push(height);
        totalLayerHeight += height;
      });
      totalLayerHeight += (layerNodes.length - 1) * nodeGap * scaleFactor;

      // Center the layer vertically - bias slightly toward top (0.4 instead of 0.5)
      // This accounts for UI elements at top making true center feel low
      let currentY = padding.top + (usableHeight - totalLayerHeight) * 0.4;

      layerNodes.forEach((node, idx) => {
        const height = scaledHeights[idx];
        
        const layoutNode: LayoutNode = {
          ...node,
          x,
          y: currentY,
          width: nodeWidth,
          height,
        };
        
        nodes.push(layoutNode);
        nodeMap.set(node.id, layoutNode);
        
        currentY += height + nodeGap * scaleFactor;
      });
    });

    // === STEP 5: Create links with stacked Y positions ===
    // Track current Y offset at each node's edges
    const nodeSourceYOffset = new Map<string, number>(); // Right edge (outgoing)
    const nodeTargetYOffset = new Map<string, number>(); // Left edge (incoming)
    
    nodes.forEach(node => {
      nodeSourceYOffset.set(node.id, 0);
      nodeTargetYOffset.set(node.id, 0);
    });

    // Sort links for consistent stacking: by source Y, then target Y
    const sortedLinks = [...state.data.links].sort((a, b) => {
      const sourceA = nodeMap.get(a.from);
      const sourceB = nodeMap.get(b.from);
      const targetA = nodeMap.get(a.to);
      const targetB = nodeMap.get(b.to);
      
      if (!sourceA || !sourceB) return 0;
      if (sourceA.y !== sourceB.y) return sourceA.y - sourceB.y;
      if (!targetA || !targetB) return 0;
      return targetA.y - targetB.y;
    });

    const links: LayoutLink[] = sortedLinks.map((link) => {
      const source = nodeMap.get(link.from);
      const target = nodeMap.get(link.to);
      if (!source || !target) return null;

      const key = `${link.from}->${link.to}`;
      const thickness = (baseThickness.get(key) || minThickness) * scaleFactor;
      
      // Get current Y offsets
      const sourceYOffset = nodeSourceYOffset.get(link.from) || 0;
      const targetYOffset = nodeTargetYOffset.get(link.to) || 0;
      
      // Update offsets for next link
      nodeSourceYOffset.set(link.from, sourceYOffset + thickness);
      nodeTargetYOffset.set(link.to, targetYOffset + thickness);

      // Calculate Y positions (top edge of this flow's band, then center it)
      const y0 = source.y + sourceYOffset + thickness / 2;
      const y1 = target.y + targetYOffset + thickness / 2;
      const x0 = source.x + source.width;
      const x1 = target.x;
      const dx = x1 - x0;

      // Bezier control points for smooth curve
      const cp1x = x0 + dx * 0.4;
      const cp2x = x0 + dx * 0.6;

      // Calculate midpoint for debugging (kept for reference)
      const t = 0.5;
      const mt = 1 - t;
      const midpoint = {
        x: mt*mt*mt*x0 + 3*mt*mt*t*cp1x + 3*mt*t*t*cp2x + t*t*t*x1,
        y: mt*mt*mt*y0 + 3*mt*mt*t*y0 + 3*mt*t*t*y1 + t*t*t*y1,
      };
      
      // Calculate target point (near destination node) for label positioning
      // Using t=0.9 to place labels close to where flows enter the next node
      const tTarget = 0.9;
      const mtTarget = 1 - tTarget;
      const targetPoint = {
        x: mtTarget*mtTarget*mtTarget*x0 + 3*mtTarget*mtTarget*tTarget*cp1x + 3*mtTarget*tTarget*tTarget*cp2x + tTarget*tTarget*tTarget*x1,
        y: mtTarget*mtTarget*mtTarget*y0 + 3*mtTarget*mtTarget*tTarget*y0 + 3*mtTarget*tTarget*tTarget*y1 + tTarget*tTarget*tTarget*y1,
      };

      return {
        id: link.id || key,
        from: link.from,
        to: link.to,
        value: link.value,
        type: link.type || 'default',
        source,
        target,
        thickness,
        path: `M${x0},${y0} C${cp1x},${y0} ${cp2x},${y1} ${x1},${y1}`,
        pathLength: Math.sqrt(dx * dx + (y1 - y0) * (y1 - y0)) * 1.3,
        displayLabel: link.displayLabel,
        midpoint,
        targetPoint,
      };
    }).filter(Boolean) as LayoutLink[];

    return { nodes, links };
  }, [state.data, dimensions]);

  // DEBUG: Log layout info with overflow detection
  useEffect(() => {
    if (layout) {
      console.log('=== SANKEY DEBUG ===');
      console.log('Nodes:', layout.nodes.length);
      console.log('Links:', layout.links.length);
      
      // Calculate actual outgoing/incoming sums per node
      const outgoingSums = new Map<string, number>();
      const incomingSums = new Map<string, number>();
      
      layout.links.forEach(l => {
        outgoingSums.set(l.from, (outgoingSums.get(l.from) || 0) + l.thickness);
        incomingSums.set(l.to, (incomingSums.get(l.to) || 0) + l.thickness);
      });
      
      layout.nodes.forEach(n => {
        const outgoing = outgoingSums.get(n.id) || 0;
        const incoming = incomingSums.get(n.id) || 0;
        const maxFlow = Math.max(outgoing, incoming);
        const overflow = maxFlow > n.height;
        console.log(`  Node: ${n.id}, height: ${n.height.toFixed(1)}, outgoing: ${outgoing.toFixed(1)}, incoming: ${incoming.toFixed(1)}${overflow ? ' ⚠️ OVERFLOW' : ''}`);
      });
      
      layout.links.forEach(l => {
        console.log(`  Link: ${l.from} → ${l.to}, thickness: ${l.thickness.toFixed(1)}, value: ${l.value}`);
      });
    }
  }, [layout]);

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
  
  // Notify parent when layout is ready
  useEffect(() => {
    if (nodePositions.size > 0 && onLayoutReady) {
      onLayoutReady(nodePositions);
    }
  }, [nodePositions, onLayoutReady]);
  
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
    
    // Dynamically scale timing based on layer count
    // Each layer takes proportional time with 30% overlap
    const overlapFactor = 0.3;
    const effectiveSlots = layerCount - (layerCount - 1) * overlapFactor;
    const slotDuration = 1 / effectiveSlots;
    const layerDuration = slotDuration * (1 + overlapFactor);
    
    const layerStart = layer * slotDuration * (1 - overlapFactor);
    const layerEnd = Math.min(1, layerStart + layerDuration);

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
        // Notify parent that animation is complete
        onAnimationComplete?.();
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
      className={`sankey-v3 relative w-full h-full overflow-hidden ${className}`}
      style={{
        background: 'transparent',
      }}
    >
      {/* Background layers - disabled for transparent mode */}
      {!hideUI && (
        <>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: isBefore ? 0.4 : 0.6,
              background: isBefore
                ? `radial-gradient(circle at 75% 70%, ${theme.colors.accent}12 0%, transparent 45%),
                   radial-gradient(circle at 25% 30%, rgba(255, 255, 255, 0.02) 0%, transparent 40%)`
                : `radial-gradient(circle at 30% 35%, ${theme.colors.primary}18 0%, transparent 50%),
                   radial-gradient(circle at 70% 55%, ${theme.colors.secondary}14 0%, transparent 45%)`,
              transition: 'opacity var(--duration-background) ease-out, background var(--duration-background) ease-out',
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
        </>
      )}

      {/* Exit overlay */}
      <div
        className="absolute inset-0 pointer-events-none transition-all"
        style={{
          background: exitPhase === 'desaturate' ? 'rgba(10, 10, 15, 0.4)' : 'transparent',
          opacity: exitPhase === 'gone' ? 0 : 1,
          filter: exitPhase === 'desaturate' ? 'saturate(0.3) brightness(0.7)' : 'none',
          transition: 'filter var(--duration-normal) ease-out, background var(--duration-normal) ease-out, opacity var(--duration-normal) ease-out',
          zIndex: exitPhase !== 'none' ? 100 : -1,
        }}
      />

      {/* Stakeholder Comparison Cards - DISABLED for debugging
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
      */}

      {/* SVG for links and nodes */}
      <svg width={dimensions.width} height={dimensions.height} className="absolute inset-0">
        <style>
          {`
            /* Keyframes now defined in design-tokens.css, these are kept for SVG scope */
            @keyframes glowPulse {
              0%, 100% { opacity: 0.8; }
              50% { opacity: 1.0; }
            }

            @keyframes lossFlowPulse {
              0%, 100% { opacity: 0.5; }
              50% { opacity: 0.65; }
            }
            
            @keyframes heroPulse {
              0%, 100% { 
                opacity: 0.3;
                transform: scale(1);
              }
              50% { 
                opacity: 0.5;
                transform: scale(1.05);
              }
            }
            
            @keyframes heroGlowPulse {
              0%, 100% { opacity: 0.25; }
              50% { opacity: 0.45; }
            }

            .node-hover:hover {
              filter: brightness(1.15);
            }

            .flow-hover:hover {
              filter: brightness(1.2);
            }

            .node-transition {
              transition: transform var(--duration-fast) ease, filter var(--duration-fast) ease;
            }

            .flow-transition {
              transition: filter var(--duration-fast) ease;
            }

            .solution-glow {
              animation: glowPulse var(--pulse-solution) var(--ease-in-out) infinite;
            }

            .loss-flow {
              animation: lossFlowPulse var(--pulse-loss) var(--ease-in-out) infinite;
            }
            
            .hero-pulse {
              animation: heroPulse var(--pulse-hero) var(--ease-in-out) infinite;
            }
            
            .hero-glow-rect {
              animation: heroGlowPulse var(--pulse-hero) var(--ease-in-out) infinite;
            }
          `}
        </style>
        <defs>
          {/* === FLOW GRADIENTS === */}
          {/* Neutral flow - default for most flows */}
          <linearGradient id="grad-neutral" x1="0%" x2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.18)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.12)" />
          </linearGradient>
          {/* Primary flow - for emphasis */}
          <linearGradient id="grad-primary" x1="0%" x2="100%">
            <stop offset="0%" stopColor={theme.colors.primary} />
            <stop offset="100%" stopColor={theme.colors.secondary} />
          </linearGradient>
          {/* Secondary/success flow - for revenue/new targets */}
          <linearGradient id="grad-secondary" x1="0%" x2="100%">
            <stop offset="0%" stopColor={theme.colors.secondary} />
            <stop offset="100%" stopColor={theme.colors.secondary + '99'} />
          </linearGradient>
          {/* Loss flow */}
          <linearGradient id="grad-loss" x1="0%" x2="100%">
            <stop offset="0%" stopColor="var(--color-loss)" />
            <stop offset="100%" stopColor="rgba(255, 107, 107, 0.6)" />
          </linearGradient>
          
          {/* === NODE GRADIENT - Single neutral for ALL nodes === */}
          {/* Per design system: all nodes share identical neutral base */}
          {/* State (success/loss/default) indicated via border and glow only */}
          <linearGradient id="nodeGrad-neutral" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--sankey-node-neutral-start, rgba(30, 32, 38, 0.95))" />
            <stop offset="100%" stopColor="var(--sankey-node-neutral-end, rgba(22, 24, 28, 0.98))" />
          </linearGradient>
          
          {/* Inner highlight for subtle depth */}
          <linearGradient id="nodeHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.08)" />
            <stop offset="50%" stopColor="rgba(255, 255, 255, 0.02)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0.05)" />
          </linearGradient>
          
          {/* === FILTERS === */}
          {/* Node drop shadow */}
          <filter id="nodeDropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="rgba(0,0,0,0.5)" />
          </filter>
          
          {/* Success glow - for solution/new nodes */}
          <filter id="successGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          {/* Flow glow */}
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
          {/* Delta-driven glow filters for shifted state significance */}
          <filter id="heroGlow" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="15" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="highGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="mediumGlow" x="-75%" y="-75%" width="250%" height="250%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Links */}
        <g>
          {layout?.links.map(link => {
            // Flow color logic per design system:
            // - Loss flows: red (entering loss nodes)
            // - Success flows: secondary color (entering solution/revenue/new nodes)
            // - Default flows: neutral gray (all others)
            const targetIsLoss = link.target.type === 'loss';
            const targetIsGain = link.target.type === 'revenue' || link.target.type === 'new' || link.target.type === 'solution';
            
            // Per design system: neutral by default, color only for semantic emphasis
            const gradId = targetIsLoss ? 'grad-loss' :
                          targetIsGain ? 'grad-secondary' : 'grad-neutral';

            const linkLayer = Math.max(link.source.layer, link.target.layer);
            const layerDrawProgress = getLayerProgress(linkLayer, drawProgress);
            const isLoss = targetIsLoss;

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
                  strokeLinecap="butt"
                  opacity={opacity * 0.15}
                  filter="url(#glow)"
                  style={{
                    strokeDasharray: link.pathLength,
                    strokeDashoffset: link.pathLength * (1 - layerDrawProgress),
                    transition: exitPhase !== 'none' ? 'opacity var(--duration-normal)' : 'none',
                  }}
                />

                {/* Main stroke */}
                <path
                  d={link.path}
                  fill="none"
                  stroke={`url(#${gradId})`}
                  strokeWidth={link.thickness}
                  strokeLinecap="butt"
                  opacity={opacity}
                  className={`flow-transition flow-hover ${isLoss ? 'loss-flow' : ''}`}
                  style={{
                    strokeDasharray: link.pathLength,
                    strokeDashoffset: link.pathLength * (1 - layerDrawProgress),
                    transition: exitPhase !== 'none' ? 'opacity var(--duration-normal)' : 'none',
                  }}
                />

                {/* Flow label near target node - shows displayLabel or value */}
                {showLabels && layerDrawProgress > 0.6 && (
                  <g
                    transform={`translate(${link.targetPoint.x - 8}, ${link.targetPoint.y})`}
                    style={{
                      opacity: Math.min(0.85, (layerDrawProgress - 0.6) * 2),
                      transition: 'opacity var(--duration-normal) ease-out',
                    }}
                  >
                    <text
                      x={0}
                      y={0}
                      dy="0.35em"
                      textAnchor="end"
                      fill={isLoss ? theme.colors.accent : 'rgba(255, 255, 255, 0.9)'}
                      fontSize={11}
                      fontWeight={600}
                      fontFamily="Inter, system-ui, sans-serif"
                      style={{
                        textShadow: '0 1px 4px rgba(0, 0, 0, 0.9), 0 0 10px rgba(0, 0, 0, 0.7)',
                      }}
                    >
                      {link.displayLabel || link.value}
                    </text>
                  </g>
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

            // Per design system: ALL nodes use neutral gradient
            // State (success/loss/default) indicated via border and glow only
            const isLossNode = node.type === 'loss';
            const isSuccessNode = node.type === 'solution' || node.type === 'new' || node.type === 'revenue';
            
            // Delta significance for shifted state glow
            const significance = nodeSignificance?.get(node.id);
            const isHeroNode = variant === 'after' && significance?.significance === 'hero';
            const isHighSignificance = variant === 'after' && significance?.significance === 'high';
            const isMediumSignificance = variant === 'after' && significance?.significance === 'medium';
            const hasSignificantDelta = isHeroNode || isHighSignificance || isMediumSignificance;
            
            // Determine glow color based on delta direction (improvement = green, regression = red)
            const deltaPercent = significance?.deltaPercent || 0;
            const isImprovement = deltaPercent < 0 && isLossNode || deltaPercent > 0 && !isLossNode;
            const glowColor = isImprovement ? 'var(--color-success, #22c55e)' : 'var(--color-loss, #ef4444)';
            
            const pulseOpacity = getNodePulse(node);
            
            // Per design system: border indicates state
            // - Default: subtle gray border (12% white)
            // - Success (solution/new/revenue): secondary color at 60% opacity
            // - Loss: loss color at 50% opacity
            const strokeColor = isLossNode 
              ? 'var(--color-loss, #ff6b6b)'
              : isSuccessNode 
                ? 'var(--color-brand-secondary, #00ffaa)'
                : 'var(--border-default, rgba(255, 255, 255, 0.12))';
            
            const strokeOpacity = isLossNode ? 0.5 : isSuccessNode ? 0.6 : 1;
            const strokeWidth = isLossNode ? 1.5 : isSuccessNode ? 2 : 1;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className={`node-transition node-hover ${isHeroNode ? 'hero-pulse' : ''}`}
                style={{
                  opacity: exitPhase === 'desaturate' ? nodeOpacity * 0.4
                         : exitPhase === 'gone' ? 0
                         : nodeOpacity,
                  cursor: 'pointer',
                  transition: exitPhase !== 'none' ? 'opacity var(--duration-normal)' : 'none',
                }}
                onClick={() => onNodeClick?.(node.id, { 
                  label: node.label, 
                  value: node.displayValue || '', 
                  type: node.type || 'default' 
                })}
                onMouseEnter={() => onNodeHover?.(node.id)}
                onMouseLeave={() => onNodeHover?.(null)}
              >
                {/* Highlight indicator for comparison card active node - dashed white border */}
                {highlightedNodeId === node.id && (
                  <rect
                    x={-3}
                    y={-3}
                    width={node.width + 6}
                    height={node.height + 6}
                    rx={5}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.7)"
                    strokeWidth={2}
                    strokeDasharray="6 4"
                  />
                )}
                
                {/* Delta-driven significance glow (shifted state only) */}
                {hasSignificantDelta && (
                  <rect
                    x={isHeroNode ? -8 : isHighSignificance ? -6 : -4}
                    y={isHeroNode ? -8 : isHighSignificance ? -6 : -4}
                    width={node.width + (isHeroNode ? 16 : isHighSignificance ? 12 : 8)}
                    height={node.height + (isHeroNode ? 16 : isHighSignificance ? 12 : 8)}
                    rx={6}
                    fill={glowColor}
                    opacity={isHeroNode ? 0.35 : isHighSignificance ? 0.25 : 0.15}
                    filter={isHeroNode ? 'url(#heroGlow)' : isHighSignificance ? 'url(#highGlow)' : 'url(#mediumGlow)'}
                    className={isHeroNode ? 'hero-glow-rect' : ''}
                  />
                )}
                
                {/* Success glow behind node - per design system: "success glows, loss doesn't" */}
                {isSuccessNode && !hasSignificantDelta && (
                  <rect
                    x={-4}
                    y={-4}
                    width={node.width + 8}
                    height={node.height + 8}
                    rx={5}
                    fill="var(--color-brand-secondary, #00ffaa)"
                    opacity={0.2 * pulseOpacity}
                    filter="url(#successGlow)"
                    className="solution-glow"
                  />
                )}

                {/* Outer stroke - creates separation from flows behind */}
                <rect
                  x={-1}
                  y={-1}
                  width={node.width + 2}
                  height={node.height + 2}
                  rx={6}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.15)"
                  strokeWidth={1}
                  opacity={pulseOpacity}
                  style={{
                    transform: `scale(${nodeScale})`,
                    transformOrigin: `${node.width / 2}px ${node.height / 2}px`,
                  }}
                />

                {/* Node rectangle - neutral base with state-based border */}
                <rect
                  width={node.width}
                  height={node.height}
                  rx={5}
                  fill="url(#nodeGrad-neutral)"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeOpacity={strokeOpacity}
                  opacity={pulseOpacity}
                  filter="url(#nodeDropShadow)"
                  style={{
                    transform: `scale(${nodeScale})`,
                    transformOrigin: `${node.width / 2}px ${node.height / 2}px`,
                  }}
                />
                
                {/* Metallic highlight overlay */}
                <rect
                  width={node.width}
                  height={node.height}
                  rx={5}
                  fill="url(#nodeHighlight)"
                  opacity={pulseOpacity * 0.6}
                  style={{
                    transform: `scale(${nodeScale})`,
                    transformOrigin: `${node.width / 2}px ${node.height / 2}px`,
                    pointerEvents: 'none',
                  }}
                />
                
                {/* Subtle top edge highlight for 3D effect */}
                <line
                  x1={2}
                  y1={1}
                  x2={node.width - 2}
                  y2={1}
                  stroke="rgba(255, 255, 255, 0.15)"
                  strokeWidth={1}
                  opacity={pulseOpacity}
                  style={{
                    transform: `scale(${nodeScale})`,
                    transformOrigin: `${node.width / 2}px ${node.height / 2}px`,
                  }}
                />

                {/* Node label - INTERNAL, centered in node */}
                {(() => {
                  // Dynamic sizing based on node height
                  const isSmallNode = node.height < 55;
                  const labelFontSize = isSmallNode ? 9 : 11;
                  const valueFontSize = isSmallNode ? 8 : 10;
                  const verticalGap = isSmallNode ? 4 : 6;
                  
                  return (
                    <>
                      <text
                        x={node.width / 2}
                        y={node.displayValue ? node.height / 2 - verticalGap : node.height / 2}
                        dy="0.35em"
                        textAnchor="middle"
                        fill={node.type === 'loss' ? theme.colors.accent : '#ffffff'}
                        fontSize={labelFontSize}
                        fontWeight={600}
                        fontFamily="Inter, system-ui, sans-serif"
                        style={{
                          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                          pointerEvents: 'none',
                        }}
                      >
                        {getAbbreviatedLabel(node.label, isSmallNode ? 10 : 12)}
                      </text>

                      {/* Node displayValue - shown below label, inside node */}
                      {node.displayValue && (
                        <text
                          x={node.width / 2}
                          y={node.height / 2 + verticalGap + 2}
                          textAnchor="middle"
                          fill={node.type === 'loss' ? 'rgba(255,150,150,0.9)' : node.type === 'revenue' || node.type === 'solution' ? theme.colors.primary : 'rgba(255,255,255,0.75)'}
                          fontSize={valueFontSize}
                          fontWeight={500}
                          fontFamily="Inter, system-ui, sans-serif"
                          style={{
                            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                            pointerEvents: 'none',
                          }}
                        >
                          {node.displayValue}
                        </text>
                      )}

                      {/* NEW badge - only show if no displayValue, inside node */}
                      {node.type === 'new' && !node.displayValue && (
                        <text
                          x={node.width / 2}
                          y={node.height / 2 + verticalGap + 2}
                          textAnchor="middle"
                          fill={theme.colors.secondary}
                          fontSize={isSmallNode ? 7 : 9}
                          fontWeight={700}
                          style={{
                            pointerEvents: 'none',
                          }}
                        >
                          NEW
                        </text>
                      )}
                    </>
                  );
                })()}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Brand logo - top left */}
      {!hideUI && (
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
      )}

      {/* State label - top center */}
      {!hideUI && (
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
      )}

    {/* Stage labels */}
      {!hideUI && stageLabels.length > 0 && (
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
      )}

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

      {/* Node callouts - DISABLED to reduce visual complexity
      {!hideUI && (
        <NodeCallouts
          callouts={narrativeState.activeCallouts}
          nodePositions={nodePositions}
          visible={uiVisible && narrativeState.activeCallouts.length > 0}
          accentColor={theme.colors.accent}
          primaryColor={theme.colors.primary}
        />
      )}
      */}
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
            transition: 'all 0.4s var(--ease-out-back)',
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