/**
 * useNarrativeController - v1.2 (FIXED)
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { NarrativeScript, NodeCallout } from '../data/templates/b2bSalesEnablement';
import { timeline } from '../utils/debugTimeline';

export type NarrativePhase = 
  | 'idle'
  | 'setup-0'
  | 'setup-1'  
  | 'setup-2'
  | 'setup-3'
  | 'bleed'
  | 'ready'
  | 'complete'
  | 'shift'
  | 'result';

export interface NarrativeState {
  phase: NarrativePhase;
  visibleLayers: number[];
  lossHighlightActive: boolean;
  lossPulseIntensity: number;
  anchoredMetricVisible: boolean;
  summaryMetricsVisible: boolean[];
  insightVisible: boolean;
  layerDrawProgress: number[];
  overallProgress: number;
  buttonReady: boolean;
  header: string;
  activeCallouts: NodeCallout[];
  narrativePhaseId: 'setup' | 'bleed' | 'shift' | 'result';
}

export interface NarrativeConfig {
  layerDrawDuration: number;
  layerStagger: number;
  bleedDuration: number;
  bleedPulseCycles: number;
  metricRevealDelay: number;
  readyDuration: number;
}

const DEFAULT_CONFIG: NarrativeConfig = {
  layerDrawDuration: 2000,
  layerStagger: 1500,
  bleedDuration: 3000,
  bleedPulseCycles: 4,
  metricRevealDelay: 800,
  readyDuration: 2000,
};

export interface UseNarrativeControllerProps {
  variant: 'before' | 'after';
  isActive: boolean;
  layerCount: number;
  metricCount: number;
  hasAnchoredMetric: boolean;
  config?: Partial<NarrativeConfig>;
  onPhaseChange?: (phase: NarrativePhase) => void;
  onComplete?: () => void;
  narrative?: NarrativeScript;
}

function mapPhaseToNarrativeId(phase: NarrativePhase, variant: 'before' | 'after'): 'setup' | 'bleed' | 'shift' | 'result' {
  if (variant === 'before') {
    if (phase.startsWith('setup')) return 'setup';
    if (phase === 'bleed' || phase === 'ready') return 'bleed';
    return 'bleed';
  } else {
    if (phase === 'shift' || phase.startsWith('setup')) return 'shift';
    return 'result';
  }
}

function getActiveCallouts(
  callouts: NodeCallout[] | undefined, 
  phaseProgress: number
): NodeCallout[] {
  if (!callouts?.length) return [];
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
  // Memoize config to prevent recreation
  const config = useMemo(
    () => ({ ...DEFAULT_CONFIG, ...configOverrides }),
    [configOverrides]
  );
  
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
    header: '',
    activeCallouts: [],
    narrativePhaseId: 'setup',
  });
  
  const animationRef = useRef<number | null>(null);
  const phaseStartTimeRef = useRef<number>(0);
  const currentPhaseRef = useRef<NarrativePhase>('idle');
  const afterInitializedRef = useRef(false);
  const hasStartedRef = useRef(false);
  
  // Store callbacks in refs to avoid dependency issues
  const onPhaseChangeRef = useRef(onPhaseChange);
  const onCompleteRef = useRef(onComplete);
  const narrativeRef = useRef(narrative);
  
  // Keep refs updated
  useEffect(() => {
    onPhaseChangeRef.current = onPhaseChange;
    onCompleteRef.current = onComplete;
    narrativeRef.current = narrative;
  });
  
  // Stable narrative content getter using ref
  const getNarrativeContent = useCallback((phase: NarrativePhase, progress: number) => {
    const narrativeData = narrativeRef.current;
    if (!narrativeData) {
      return { header: '', activeCallouts: [] };
    }
    const narrativePhaseId = mapPhaseToNarrativeId(phase, variant);
    const phaseContent = narrativeData[narrativePhaseId];
    return {
      header: phaseContent?.header || '',
      activeCallouts: getActiveCallouts(phaseContent?.nodeCallouts, progress),
    };
  }, [variant]);
  
  // Stable setPhase using ref for callback
  const setPhase = useCallback((phase: NarrativePhase) => {
    currentPhaseRef.current = phase;
    phaseStartTimeRef.current = performance.now();
    setState(prev => ({ ...prev, phase }));
    onPhaseChangeRef.current?.(phase);
  }, []);
  
  // Stable reset
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
    hasStartedRef.current = false;
  }, [metricCount, layerCount, getNarrativeContent]);
  
  // Skip to complete
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
    onCompleteRef.current?.();
  }, [layerCount, metricCount, hasAnchoredMetric, variant, getNarrativeContent]);
  
  // Main animation loop for "before" variant
  useEffect(() => {
    if (!isActive || variant !== 'before') {
      hasStartedRef.current = false;
      return;
    }
    
    // Prevent re-running if already started
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    
    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    // Reset state inline instead of calling reset()
    currentPhaseRef.current = 'idle';
    
    const {
      layerDrawDuration,
      layerStagger,
      bleedDuration,
      bleedPulseCycles,
      metricRevealDelay,
      readyDuration,
    } = config;
    
    const setupDuration = layerDrawDuration + (layerCount - 1) * layerStagger;
    const totalDuration = setupDuration + bleedDuration + readyDuration;
    
    const startTime = performance.now();
    phaseStartTimeRef.current = startTime;
    setPhase('setup-0');
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const overallProgress = Math.min(elapsed / totalDuration, 1);
      
      let newPhase: NarrativePhase = currentPhaseRef.current;
      
      for (let layer = 0; layer < layerCount; layer++) {
        const layerStartTime = layer * layerStagger;
        if (elapsed >= layerStartTime && elapsed < setupDuration) {
          newPhase = `setup-${layer}` as NarrativePhase;
        }
      }
      
      if (elapsed >= setupDuration && elapsed < setupDuration + bleedDuration) {
        newPhase = 'bleed';
      }
      
      if (elapsed >= setupDuration + bleedDuration && elapsed < totalDuration) {
        newPhase = 'ready';
      }
      
      if (elapsed >= totalDuration) {
        newPhase = 'complete';
      }
      
      if (newPhase !== currentPhaseRef.current) {
        setPhase(newPhase);
        timeline.log(`Narrative Phase`, newPhase.toUpperCase(), overallProgress);
      }

      const layerDrawProgress = Array(layerCount).fill(0).map((_, layer) => {
        const layerStartTime = layer * layerStagger;
        const layerElapsed = elapsed - layerStartTime;
        if (layerElapsed <= 0) return 0;
        return Math.min(layerElapsed / layerDrawDuration, 1);
      });
      
      const visibleLayers = layerDrawProgress
        .map((progress, layer) => progress > 0 ? layer : -1)
        .filter(layer => layer >= 0);
      
      const inBleed = elapsed >= setupDuration && elapsed < setupDuration + bleedDuration;
      const bleedElapsed = Math.max(0, elapsed - setupDuration);
      const bleedProgress = Math.min(bleedElapsed / bleedDuration, 1);
      
      const pulseFrequency = (bleedPulseCycles * Math.PI * 2) / bleedDuration;
      const lossPulseIntensity = inBleed 
        ? Math.sin(bleedElapsed * pulseFrequency) * 0.5 + 0.5
        : 0;
      
      const anchoredMetricVisible = hasAnchoredMetric && 
        (bleedElapsed > metricRevealDelay || newPhase === 'ready' || newPhase === 'complete');
      
      const inReady = elapsed >= setupDuration + bleedDuration;
      const readyElapsed = Math.max(0, elapsed - setupDuration - bleedDuration);
      const summaryMetricsVisible = Array(metricCount).fill(false).map((_, i) => {
        const metricDelay = i * 200;
        return inReady && readyElapsed > metricDelay;
      });
      
      const insightVisible = inReady && readyElapsed > 300;
      const buttonReady = newPhase === 'complete' || (newPhase === 'ready' && readyElapsed > 800);
      
      let phaseProgress = 0;
      if (newPhase.startsWith('setup')) {
        phaseProgress = elapsed / setupDuration;
      } else if (newPhase === 'bleed') {
        phaseProgress = bleedProgress;
      } else if (newPhase === 'ready' || newPhase === 'complete') {
        phaseProgress = 1;
      }
      
      const narrativeContent = getNarrativeContent(newPhase, phaseProgress);
      const narrativePhaseId = mapPhaseToNarrativeId(newPhase, variant);
      
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
      
      if (newPhase !== 'complete') {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        onCompleteRef.current?.();
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      hasStartedRef.current = false;
    };
  }, [isActive, variant, layerCount, metricCount, hasAnchoredMetric, config, setPhase, getNarrativeContent]);
  
  // For "after" variant
  useEffect(() => {
    if (variant !== 'after' || !isActive) {
      afterInitializedRef.current = false;
      return;
    }
    
    if (afterInitializedRef.current) return;
    afterInitializedRef.current = true;
    
    const narrativeContent = getNarrativeContent('shift', 0.5);
    
    setState(prev => ({
      ...prev,
      header: narrativeContent.header,
      activeCallouts: narrativeContent.activeCallouts,
      narrativePhaseId: 'shift',
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
    isShiftPhase: state.phase === 'shift',
    isResultPhase: state.phase === 'result',
  };
}

export default useNarrativeController;