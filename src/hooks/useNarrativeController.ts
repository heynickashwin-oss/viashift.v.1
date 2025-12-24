/**
 * useNarrativeController - v1.1
 * 
 * Orchestrates the phased reveal of the Sankey visualization story.
 * Now integrates with template NarrativeScript for viewer-specific content.
 * 
 * PHASES:
 * 1. SETUP    - Flows draw layer by layer (sequential reveal)
 * 2. BLEED    - Loss flows pulse, loss labels appear with pain metrics
 * 3. READY    - Insight text appears, transform button powers up
 * 4. COMPLETE - All UI visible, particles flowing normally
 * 
 * For "after" state:
 * 1. SHIFT    - New flows drawing, solution nodes highlighted
 * 2. RESULT   - Final state, all metrics visible
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { NarrativeScript, NodeCallout } from '../data/templates/b2bSalesEnablement';
import { timeline } from '../utils/debugTimeline';

export type NarrativePhase = 
  | 'idle'           // Not started
  | 'setup-0'        // Drawing layer 0
  | 'setup-1'        // Drawing layer 1  
  | 'setup-2'        // Drawing layer 2
  | 'setup-3'        // Drawing layer 3
  | 'bleed'          // Loss flows pulsing, pain metrics appearing
  | 'ready'          // Insight visible, button powering up
  | 'complete'       // All revealed, normal animation
  // After-state phases
  | 'shift'          // Drawing new/solution flows
  | 'result';        // Final transformed state

export interface NarrativeState {
  phase: NarrativePhase;
  
  // Granular visibility controls
  visibleLayers: number[];           // Which flow layers are drawn
  lossHighlightActive: boolean;      // Loss nodes/flows pulsing
  lossPulseIntensity: number;        // 0-1 pulse animation value
  
  // Metric visibility
  anchoredMetricVisible: boolean;    // The metric anchored to a node
  summaryMetricsVisible: boolean[];  // The side panel metrics
  insightVisible: boolean;           // The insight text in action zone
  
  // Progress values for animations
  layerDrawProgress: number[];       // 0-1 draw progress per layer
  overallProgress: number;           // 0-1 overall narrative progress
  
  // For the transform button
  buttonReady: boolean;
  
  // NEW: Narrative content from template
  header: string;                    // Current phase header text
  activeCallouts: NodeCallout[];     // Callouts to display near nodes
  narrativePhaseId: 'setup' | 'bleed' | 'shift' | 'result'; // Mapped phase for template lookup
}

export interface NarrativeConfig {
  // Timing (all in ms)
  layerDrawDuration: number;      // How long to draw each layer
  layerStagger: number;           // Delay between starting each layer
  bleedDuration: number;          // How long the bleed phase lasts
  bleedPulseCycles: number;       // How many pulse cycles during bleed
  metricRevealDelay: number;      // Delay before metrics appear in bleed
  readyDuration: number;          // How long before complete
}

const DEFAULT_CONFIG: NarrativeConfig = {
  layerDrawDuration: 2000,   // Increased from 800 - each layer takes 2s to draw
  layerStagger: 1500,        // Increased from 400 - wait 1.5s between layers
  bleedDuration: 3000,       // Increased from 2000 - more time to absorb pain
  bleedPulseCycles: 4,       // Increased from 3 - more pulses
  metricRevealDelay: 800,    // Increased from 600
  readyDuration: 2000,       // Increased from 1500
};

export interface UseNarrativeControllerProps {
  variant: 'before' | 'after';
  isActive: boolean;                 // Should narrative be running
  layerCount: number;                // Number of layers (usually 4: 0-3)
  metricCount: number;               // Number of summary metrics
  hasAnchoredMetric: boolean;        // Whether there's a node-anchored metric
  config?: Partial<NarrativeConfig>;
  onPhaseChange?: (phase: NarrativePhase) => void;
  onComplete?: () => void;
  
  // NEW: Template narrative content
  narrative?: NarrativeScript;
}

/**
 * Maps internal phases to template narrative phase IDs
 */
function mapPhaseToNarrativeId(phase: NarrativePhase, variant: 'before' | 'after'): 'setup' | 'bleed' | 'shift' | 'result' {
  if (variant === 'before') {
    if (phase.startsWith('setup')) return 'setup';
    if (phase === 'bleed' || phase === 'ready') return 'bleed';
    return 'bleed'; // complete stays on bleed content
  } else {
    if (phase === 'shift' || phase.startsWith('setup')) return 'shift';
    return 'result';
  }
}

/**
 * Gets active callouts based on phase progress
 */
function getActiveCallouts(
  callouts: NodeCallout[] | undefined, 
  phaseProgress: number
): NodeCallout[] {
  if (!callouts?.length) return [];
  
  // Stagger callout appearance across the phase
  const calloutInterval = 1 / (callouts.length + 1);
  
  return callouts.filter((_, index) => {
    const calloutThreshold = (index + 1) * calloutInterval;
    return phaseProgress >= calloutThreshold;
  });
}

export function useNarrativeController({
  variant,
  isActive,
  layerCount,
  metricCount,
  hasAnchoredMetric,
  config: configOverrides,
  onPhaseChange,
  onComplete,
  narrative,
}: UseNarrativeControllerProps) {
  const config = { ...DEFAULT_CONFIG, ...configOverrides };
  
  const [state, setState] = useState<NarrativeState>({
    phase: 'idle',
    visibleLayers: [],
    lossHighlightActive: false,
    lossPulseIntensity: 0,
    anchoredMetricVisible: false,
    summaryMetricsVisible: Array(metricCount).fill(false),
    insightVisible: false,
    layerDrawProgress: Array(layerCount).fill(0),
    overallProgress: 0,
    buttonReady: false,
    // NEW defaults
    header: '',
    activeCallouts: [],
    narrativePhaseId: 'setup',
  });
  
  const animationRef = useRef<number | null>(null);
  const phaseStartTimeRef = useRef<number>(0);
  const currentPhaseRef = useRef<NarrativePhase>('idle');
  
  // Memoize narrative content lookup
  const getNarrativeContent = useCallback((phase: NarrativePhase, progress: number) => {
    if (!narrative) {
      return { header: '', activeCallouts: [] };
    }
    
    const narrativePhaseId = mapPhaseToNarrativeId(phase, variant);
    const phaseContent = narrative[narrativePhaseId];
    
    return {
      header: phaseContent?.header || '',
      activeCallouts: getActiveCallouts(phaseContent?.nodeCallouts, progress),
    };
  }, [narrative, variant]);
  
  // Update phase and notify
  const setPhase = useCallback((phase: NarrativePhase) => {
    currentPhaseRef.current = phase;
    phaseStartTimeRef.current = performance.now();
    setState(prev => ({ ...prev, phase }));
    onPhaseChange?.(phase);
  }, [onPhaseChange]);
  
  // Reset to initial state
  const reset = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    const initialContent = getNarrativeContent('idle', 0);
    
    setState({
      phase: 'idle',
      visibleLayers: [],
      lossHighlightActive: false,
      lossPulseIntensity: 0,
      anchoredMetricVisible: false,
      summaryMetricsVisible: Array(metricCount).fill(false),
      insightVisible: false,
      layerDrawProgress: Array(layerCount).fill(0),
      overallProgress: 0,
      buttonReady: false,
      header: initialContent.header,
      activeCallouts: initialContent.activeCallouts,
      narrativePhaseId: 'setup',
    });
    
    currentPhaseRef.current = 'idle';
  }, [metricCount, layerCount, getNarrativeContent]);
  
  // Skip to complete (for non-animated scenarios)
  const skipToComplete = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    const finalPhaseId = variant === 'before' ? 'bleed' : 'result';
    const finalContent = getNarrativeContent('complete', 1);
    
    setState({
      phase: 'complete',
      visibleLayers: Array.from({ length: layerCount }, (_, i) => i),
      lossHighlightActive: false,
      lossPulseIntensity: 0,
      anchoredMetricVisible: hasAnchoredMetric,
      summaryMetricsVisible: Array(metricCount).fill(true),
      insightVisible: true,
      layerDrawProgress: Array(layerCount).fill(1),
      overallProgress: 1,
      buttonReady: true,
      header: finalContent.header,
      activeCallouts: finalContent.activeCallouts,
      narrativePhaseId: finalPhaseId,
    });
    
    currentPhaseRef.current = 'complete';
    onComplete?.();
  }, [layerCount, metricCount, hasAnchoredMetric, onComplete, variant, getNarrativeContent]);
  
  // Main animation loop for "before" variant
  useEffect(() => {
    // Only run narrative for "before" variant when active
    // "after" variant uses the existing forge system
    if (!isActive || variant !== 'before') {
      return;
    }
    
    reset();
    
    const {
      layerDrawDuration,
      layerStagger,
      bleedDuration,
      bleedPulseCycles,
      metricRevealDelay,
      readyDuration,
    } = config;
    
    // Calculate total timeline
    const setupDuration = layerDrawDuration + (layerCount - 1) * layerStagger;
    const totalDuration = setupDuration + bleedDuration + readyDuration;
    
    const startTime = performance.now();
    phaseStartTimeRef.current = startTime;
    setPhase('setup-0');
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const overallProgress = Math.min(elapsed / totalDuration, 1);
      
      // Determine current phase based on elapsed time
      let newPhase: NarrativePhase = currentPhaseRef.current;
      
      // SETUP PHASES (layer by layer)
      for (let layer = 0; layer < layerCount; layer++) {
        const layerStartTime = layer * layerStagger;
        if (elapsed >= layerStartTime && elapsed < setupDuration) {
          newPhase = `setup-${layer}` as NarrativePhase;
        }
      }
      
      // BLEED PHASE
      if (elapsed >= setupDuration && elapsed < setupDuration + bleedDuration) {
        newPhase = 'bleed';
      }
      
      // READY PHASE
      if (elapsed >= setupDuration + bleedDuration && elapsed < totalDuration) {
        newPhase = 'ready';
      }
      
      // COMPLETE
      if (elapsed >= totalDuration) {
        newPhase = 'complete';
      }
      
     // Update phase if changed
      if (newPhase !== currentPhaseRef.current) {
        setPhase(newPhase);
        timeline.log(`Narrative Phase`, newPhase.toUpperCase(), overallProgress);
      }
```

---

Now when you run the app, open the browser console. You'll see:
```
[0.00s] Timeline: START
[0.00s] Animation: BEGIN (0.0%)
[0.15s] Narrative Phase: SETUP-0 (1.2%)
[0.82s] Layer 0: START (5.1%)
[1.60s] Stage Labels: APPEAR (10.0%)
[1.60s] Narrative Header: APPEAR (10.0%)
[2.40s] Layer 1: START (15.0%)
...
[16.00s] Animation: COMPLETE (100.0%)

═══════════════════════════════════════════════════════════════
                    TIMELINE SUMMARY                            
═══════════════════════════════════════════════════════════════

Layer 0              ░░░░░█████████████████████████████████████ 0.82s
Stage Labels         ░░░░░░░░██████████████████████████████████ 1.60s
Layer 1              ░░░░░░░░░░░░████████████████████████████████ 2.40s
...
      // Calculate layer draw progress
      const layerDrawProgress = Array(layerCount).fill(0).map((_, layer) => {
        const layerStartTime = layer * layerStagger;
        const layerElapsed = elapsed - layerStartTime;
        if (layerElapsed <= 0) return 0;
        return Math.min(layerElapsed / layerDrawDuration, 1);
      });
      
      // Calculate visible layers (any with progress > 0)
      const visibleLayers = layerDrawProgress
        .map((progress, layer) => progress > 0 ? layer : -1)
        .filter(layer => layer >= 0);
      
      // Bleed phase calculations
      const inBleed = elapsed >= setupDuration && elapsed < setupDuration + bleedDuration;
      const bleedElapsed = Math.max(0, elapsed - setupDuration);
      const bleedProgress = Math.min(bleedElapsed / bleedDuration, 1);
      
      // Pulse intensity (sin wave during bleed)
      const pulseFrequency = (bleedPulseCycles * Math.PI * 2) / bleedDuration;
      const lossPulseIntensity = inBleed 
        ? Math.sin(bleedElapsed * pulseFrequency) * 0.5 + 0.5
        : 0;
      
      // Anchored metric appears during bleed after delay
      const anchoredMetricVisible = hasAnchoredMetric && 
        (bleedElapsed > metricRevealDelay || newPhase === 'ready' || newPhase === 'complete');
      
      // Summary metrics appear during ready phase, staggered
      const inReady = elapsed >= setupDuration + bleedDuration;
      const readyElapsed = Math.max(0, elapsed - setupDuration - bleedDuration);
      const summaryMetricsVisible = Array(metricCount).fill(false).map((_, i) => {
        const metricDelay = i * 200;
        return inReady && readyElapsed > metricDelay;
      });
      
      // Insight and button ready
      const insightVisible = inReady && readyElapsed > 300;
      const buttonReady = newPhase === 'complete' || (newPhase === 'ready' && readyElapsed > 800);
      
      // Calculate phase-specific progress for callout staggering
      let phaseProgress = 0;
      if (newPhase.startsWith('setup')) {
        phaseProgress = elapsed / setupDuration;
      } else if (newPhase === 'bleed') {
        phaseProgress = bleedProgress;
      } else if (newPhase === 'ready' || newPhase === 'complete') {
        phaseProgress = 1;
      }
      
      // Get narrative content for current phase
      const narrativeContent = getNarrativeContent(newPhase, phaseProgress);
      const narrativePhaseId = mapPhaseToNarrativeId(newPhase, variant);
      
      // Update state
      setState({
        phase: newPhase,
        visibleLayers,
        lossHighlightActive: inBleed,
        lossPulseIntensity,
        anchoredMetricVisible,
        summaryMetricsVisible,
        insightVisible,
        layerDrawProgress,
        overallProgress,
        buttonReady,
        header: narrativeContent.header,
        activeCallouts: narrativeContent.activeCallouts,
        narrativePhaseId,
      });
      
      // Continue or complete
      if (newPhase !== 'complete') {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isActive, variant, layerCount, metricCount, hasAnchoredMetric, config, setPhase, reset, onComplete, getNarrativeContent]);
  
  // For "after" variant, derive narrative content from forge progress
  useEffect(() => {
    if (variant !== 'after' || !isActive) return;
    
    // After variant uses forge system, but we still need to provide narrative content
    const narrativeContent = getNarrativeContent('shift', 0.5);
    const narrativePhaseId = 'shift';
    
    setState(prev => ({
      ...prev,
      header: narrativeContent.header,
      activeCallouts: narrativeContent.activeCallouts,
      narrativePhaseId,
    }));
  }, [variant, isActive, getNarrativeContent]);
  
  return {
    ...state,
    reset,
    skipToComplete,
    isSetupPhase: state.phase.startsWith('setup'),
    isBleedPhase: state.phase === 'bleed',
    isReadyPhase: state.phase === 'ready',
    isComplete: state.phase === 'complete',
    // NEW: Convenience getters
    isShiftPhase: state.phase === 'shift',
    isResultPhase: state.phase === 'result',
  };
}

export default useNarrativeController;