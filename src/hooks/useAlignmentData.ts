/**
 * useAlignmentData.ts
 * 
 * React hook for fetching alignment intelligence data.
 * Provides shift-level alignment, stakeholder engagement, and critical gap detection.
 * 
 * Usage:
 *   const { alignment, stakeholders, criticalGaps, loading, refresh } = useAlignmentData(shiftId);
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// ============================================
// TYPES
// ============================================

export type EngagementLevel = 'none' | 'viewed' | 'engaged' | 'committed';

export type NodeAlignmentStatus = 'no_signal' | 'aligned' | 'contested' | 'mixed';

export type ShiftAlignmentStatus = 
  | 'no_signal' 
  | 'champion' 
  | 'lukewarm_consensus' 
  | 'contested' 
  | 'ready';

export type LinkType = 'all' | 'exec' | 'finance' | 'ops' | 'sales' | 'tech';

export interface ShiftAlignment {
  id: string;
  shift_id: string;
  total_views: number;
  unique_viewers: number;
  total_reactions: number;
  stakeholder_types_engaged: LinkType[];
  target_stakeholder_types: LinkType[];
  overall_depth: number;
  overall_width: number;
  readiness_score: number;
  status: ShiftAlignmentStatus;
  top_aligned_node: string | null;
  top_contested_node: string | null;
  total_critical_gaps: number;
  avg_viewer_depth: number;
  viewers_committed: number;
  viewers_engaged: number;
  viewers_passive: number;
  calculated_at: string;
}

export interface StakeholderEngagement {
  stakeholder_id: string;
  shift_id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  stakeholder_type_label: string;
  link_type: LinkType | null;
  engagement_depth: number;
  engagement_level: EngagementLevel;
  nodes_interacted: number;
  nodes_reacted: number;
  view_count: number;
  total_duration_seconds: number;
  is_critical_gap: boolean;
  gap_reason: string | null;
  first_viewed_at: string;
  last_viewed_at: string;
  engagement_bar: number;
}

export interface CriticalGap {
  shift_id: string;
  shift_title: string | null;
  stakeholder_id: string;
  name: string | null;
  email: string | null;
  stakeholder_type: string;
  engagement_depth: number;
  engagement_level: EngagementLevel;
  gap_reason: string | null;
  last_viewed_at: string;
}

export interface NodeAlignment {
  shift_id: string;
  node_id: string;
  agree_count: number;
  disagree_count: number;
  question_count: number;
  depth_score: number;
  width_score: number;
  status: NodeAlignmentStatus;
  stakeholder_types_reacted: LinkType[];
  total_reactions: number;
}

export interface AlignmentData {
  alignment: ShiftAlignment | null;
  stakeholders: StakeholderEngagement[];
  criticalGaps: CriticalGap[];
  nodes: NodeAlignment[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  recalculate: () => Promise<void>;
}

// ============================================
// DISPLAY HELPERS
// ============================================

export const ALIGNMENT_STATUS_CONFIG: Record<ShiftAlignmentStatus, { 
  label: string; 
  color: string; 
  bgColor: string;
  description: string;
}> = {
  no_signal: { 
    label: 'Awaiting Signal', 
    color: '#6B7280', 
    bgColor: 'rgba(107, 114, 128, 0.15)',
    description: 'Not enough engagement to determine alignment',
  },
  champion: { 
    label: 'Champion Building', 
    color: '#F59E0B', 
    bgColor: 'rgba(245, 158, 11, 0.15)',
    description: 'Strong support from one stakeholder group',
  },
  lukewarm_consensus: { 
    label: 'Lukewarm Consensus', 
    color: '#3B82F6', 
    bgColor: 'rgba(59, 130, 246, 0.15)',
    description: 'Broad coverage but shallow engagement',
  },
  contested: { 
    label: 'Contested', 
    color: '#EF4444', 
    bgColor: 'rgba(239, 68, 68, 0.15)',
    description: 'Active disagreement among stakeholders',
  },
  ready: { 
    label: 'Ready to Decide', 
    color: '#10B981', 
    bgColor: 'rgba(16, 185, 129, 0.15)',
    description: 'Strong alignment across stakeholder groups',
  },
};

export const ENGAGEMENT_LEVEL_CONFIG: Record<EngagementLevel, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  none: { label: 'No Engagement', color: '#6B7280', bgColor: 'rgba(107, 114, 128, 0.15)' },
  viewed: { label: 'Viewed Only', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.15)' },
  engaged: { label: 'Engaged', color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.15)' },
  committed: { label: 'Committed', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.15)' },
};

export const LINK_TYPE_CONFIG: Record<LinkType, {
  label: string;
  shortLabel: string;
  color: string;
}> = {
  all: { label: 'General', shortLabel: 'All', color: '#00D4E5' },
  exec: { label: 'Executive / CEO', shortLabel: 'Exec', color: '#8B5CF6' },
  finance: { label: 'Finance / CFO', shortLabel: 'Finance', color: '#4ADE80' },
  ops: { label: 'Operations / COO', shortLabel: 'Ops', color: '#F59E0B' },
  sales: { label: 'Sales / CRO', shortLabel: 'Sales', color: '#EC4899' },
  tech: { label: 'Technology / CTO', shortLabel: 'Tech', color: '#06B6D4' },
};

// High-value stakeholder types for critical gap detection
export const HIGH_VALUE_TYPES: LinkType[] = ['exec', 'finance', 'tech'];

// Target types for width calculation (excludes 'all')
export const TARGET_STAKEHOLDER_TYPES: LinkType[] = ['exec', 'finance', 'ops', 'sales', 'tech'];

// ============================================
// HOOK: useAlignmentData
// ============================================

export function useAlignmentData(shiftId: string | undefined): AlignmentData {
  const [alignment, setAlignment] = useState<ShiftAlignment | null>(null);
  const [stakeholders, setStakeholders] = useState<StakeholderEngagement[]>([]);
  const [criticalGaps, setCriticalGaps] = useState<CriticalGap[]>([]);
  const [nodes, setNodes] = useState<NodeAlignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Recalculate alignment (call before fetching for fresh data)
  // TODO: Deploy recalculate_shift_alignment RPC function
  // For now, do nothing to prevent 404 spam
  const recalculate = useCallback(async () => {
    // Stubbed - RPC doesn't exist yet
  }, [shiftId]);

  // Fetch all alignment data
  // TODO: Deploy shift_alignment, stakeholder_engagement_detail, stakeholders tables
  // For now, return empty data to prevent 404 spam
  const fetchData = useCallback(async () => {
    if (!shiftId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Stubbed - tables don't exist yet
      setAlignment(null);
      setStakeholders([]);
      setCriticalGaps([]);
      setNodes([]);
    } catch (err) {
      console.error('Error fetching alignment data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [shiftId]);

  // Refresh: recalculate then fetch
  const refresh = useCallback(async () => {
    await recalculate();
    await fetchData();
  }, [recalculate, fetchData]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    alignment,
    stakeholders,
    criticalGaps,
    nodes,
    loading,
    error,
    refresh,
    recalculate,
  };
}

// ============================================
// HOOK: useAlignmentSummary (lightweight)
// ============================================

export interface AlignmentSummary {
  status: ShiftAlignmentStatus;
  depth: number;
  width: number;
  readiness: number;
  viewers: number;
  reactions: number;
  criticalGaps: number;
  loading: boolean;
}

export function useAlignmentSummary(shiftId: string | undefined): AlignmentSummary {
  const [summary, setSummary] = useState<AlignmentSummary>({
    status: 'no_signal',
    depth: 0,
    width: 0,
    readiness: 0,
    viewers: 0,
    reactions: 0,
    criticalGaps: 0,
    loading: true,
  });

  useEffect(() => {
    if (!shiftId) {
      setSummary(prev => ({ ...prev, loading: false }));
      return;
    }

    const fetch = async () => {
      // TODO: Deploy shift_alignment table to Supabase
      // For now, return default values to prevent 404 spam
      setSummary({
        status: 'no_signal',
        depth: 0,
        width: 0,
        readiness: 0,
        viewers: 0,
        reactions: 0,
        criticalGaps: 0,
        loading: false,
      });
    };

    fetch();
  }, [shiftId]);

  return summary;
}

// ============================================
// UTILITY: Format engagement bar
// ============================================

export function formatEngagementBar(engagement: number, maxBars: number = 10): string {
  const filled = Math.round(engagement * maxBars);
  const empty = maxBars - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

// ============================================
// UTILITY: Get missing stakeholder types (for alignment)
// ============================================

export function getMissingStakeholderTypes(engaged: LinkType[]): LinkType[] {
  return TARGET_STAKEHOLDER_TYPES.filter(t => !engaged.includes(t));
}

// ============================================
// UTILITY: Calculate alignment percentage
// ============================================

export function calculateAlignmentPercent(engaged: LinkType[]): number {
  const validTypes = engaged.filter(t => t !== 'all');
  return Math.round((validTypes.length / TARGET_STAKEHOLDER_TYPES.length) * 100);
}