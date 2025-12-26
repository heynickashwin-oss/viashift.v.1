// ============================================
// VIASHIFT ALIGNMENT TYPES
// TypeScript definitions for alignment intelligence layer
// ============================================

// ============================================
// ENUMS
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

// ============================================
// STAKEHOLDER (extended with engagement)
// ============================================

export interface Stakeholder {
  id: string;
  shift_id: string;
  email: string | null;
  name: string | null;
  role: string | null;
  link_type: LinkType | null;
  first_viewed_at: string;
  last_viewed_at: string;
  view_count: number;
  total_duration_seconds: number;
  shared_to_others: boolean;
  created_at: string;
  
  // Engagement depth fields (new)
  engagement_depth: number;
  engagement_level: EngagementLevel;
  nodes_interacted: number;
  nodes_reacted: number;
  is_critical_gap: boolean;
  gap_reason: string | null;
  engagement_calculated_at: string | null;
}

// ============================================
// NODE ALIGNMENT
// ============================================

export interface NodeAlignment {
  id: string;
  shift_id: string;
  node_id: string;
  
  // Reaction counts
  agree_count: number;
  disagree_count: number;
  question_count: number;
  comment_count: number;
  
  // Stakeholder coverage
  stakeholder_types_reacted: LinkType[];
  
  // Scores
  depth_score: number;  // 0.00 - 1.00
  width_score: number;  // 0.00 - 1.00
  
  // Status
  status: NodeAlignmentStatus;
  
  calculated_at: string;
}

// ============================================
// SHIFT ALIGNMENT
// ============================================

export interface ShiftAlignment {
  id: string;
  shift_id: string;
  
  // Engagement metrics
  total_views: number;
  unique_viewers: number;
  total_reactions: number;
  
  // Stakeholder coverage
  stakeholder_types_engaged: LinkType[];
  target_stakeholder_types: LinkType[];
  
  // Alignment scores
  overall_depth: number;  // 0.00 - 1.00
  overall_width: number;  // 0.00 - 1.00
  readiness_score: number;  // 0.00 - 1.00
  
  // Status
  status: ShiftAlignmentStatus;
  
  // Highlights
  top_aligned_node: string | null;
  top_contested_node: string | null;
  
  // Viewer engagement summary
  total_critical_gaps: number;
  avg_viewer_depth: number;
  viewers_committed: number;
  viewers_engaged: number;
  viewers_passive: number;
  
  calculated_at: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// VIEW TYPES (from database views)
// ============================================

export interface ShiftAlignmentSummary {
  shift_id: string;
  shift_title: string | null;
  company_input: string;
  status: ShiftAlignmentStatus;
  overall_depth: number;
  overall_width: number;
  readiness_score: number;
  unique_viewers: number;
  total_reactions: number;
  total_critical_gaps: number;
  stakeholder_types_engaged: LinkType[];
  viewers_committed: number;
  viewers_engaged: number;
  viewers_passive: number;
  calculated_at: string;
}

export interface StakeholderEngagementDetail {
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
  engagement_bar: number;  // 0-10 for visualization
}

export interface NodeAlignmentGrid {
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

export interface CriticalGapAlert {
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

// ============================================
// API RESPONSE TYPES
// ============================================

export interface AlignmentDashboardData {
  alignment: ShiftAlignment | null;
  stakeholders: StakeholderEngagementDetail[];
  nodes: NodeAlignmentGrid[];
  criticalGaps: CriticalGapAlert[];
}

// ============================================
// HELPER TYPES
// ============================================

export interface AlignmentScores {
  depth: number;
  width: number;
  readiness: number;
}

export interface ViewerBreakdown {
  committed: number;
  engaged: number;
  viewed: number;
  none: number;
  total: number;
}

export interface StakeholderCoverage {
  engaged: LinkType[];
  missing: LinkType[];
  widthPercent: number;
}

// ============================================
// STATUS DISPLAY HELPERS
// ============================================

export const ALIGNMENT_STATUS_LABELS: Record<ShiftAlignmentStatus, string> = {
  no_signal: 'Awaiting Signal',
  champion: 'Champion Building',
  lukewarm_consensus: 'Lukewarm Consensus',
  contested: 'Contested',
  ready: 'Ready to Decide',
};

export const ALIGNMENT_STATUS_COLORS: Record<ShiftAlignmentStatus, string> = {
  no_signal: '#6B7280',     // gray
  champion: '#F59E0B',      // amber
  lukewarm_consensus: '#3B82F6', // blue
  contested: '#EF4444',     // red
  ready: '#10B981',         // green
};

export const ENGAGEMENT_LEVEL_LABELS: Record<EngagementLevel, string> = {
  none: 'No Engagement',
  viewed: 'Viewed Only',
  engaged: 'Engaged',
  committed: 'Committed',
};

export const ENGAGEMENT_LEVEL_COLORS: Record<EngagementLevel, string> = {
  none: '#6B7280',      // gray
  viewed: '#F59E0B',    // amber
  engaged: '#3B82F6',   // blue
  committed: '#10B981', // green
};

export const NODE_STATUS_LABELS: Record<NodeAlignmentStatus, string> = {
  no_signal: 'No Signal',
  aligned: 'Aligned',
  contested: 'Contested',
  mixed: 'Mixed Reactions',
};

export const NODE_STATUS_COLORS: Record<NodeAlignmentStatus, string> = {
  no_signal: '#6B7280',  // gray
  aligned: '#10B981',    // green
  contested: '#EF4444',  // red
  mixed: '#F59E0B',      // amber
};

// ============================================
// LINK TYPE DISPLAY
// ============================================

export const LINK_TYPE_LABELS: Record<LinkType, string> = {
  all: 'General',
  exec: 'Executive / CEO',
  finance: 'Finance / CFO',
  ops: 'Operations / COO',
  sales: 'Sales / CRO',
  tech: 'Technology / CTO',
};

export const LINK_TYPE_SHORT: Record<LinkType, string> = {
  all: 'All',
  exec: 'Exec',
  finance: 'Finance',
  ops: 'Ops',
  sales: 'Sales',
  tech: 'Tech',
};

// High-value stakeholder types for critical gap detection
export const HIGH_VALUE_STAKEHOLDER_TYPES: LinkType[] = ['exec', 'finance', 'tech'];

// Target stakeholder types for width calculation (excludes 'all')
export const TARGET_STAKEHOLDER_TYPES: LinkType[] = ['exec', 'finance', 'ops', 'sales', 'tech'];