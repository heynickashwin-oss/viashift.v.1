/**
 * Stakeholder Comparison Types
 * 
 * Enables alignment discovery by showing how different stakeholders
 * view the SAME node from their unique perspectives.
 * 
 * Core insight: viashift doesn't just show YOUR perspective. 
 * It shows how YOUR perspective connects to THEIR perspective 
 * on the SAME problem.
 */

// ============================================
// STAKEHOLDER ROLES
// ============================================

export type StakeholderRole = 'finance' | 'ops' | 'sales' | 'users' | 'it' | 'leadership';

export type LensType = 'default' | 'cfo' | 'ops' | 'sales';

/** @deprecated Use LensType instead - kept for backwards compatibility */
export type ViewerType = LensType;

export interface StakeholderRoleMeta {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}

export const STAKEHOLDER_ROLES: Record<StakeholderRole, StakeholderRoleMeta> = {
  finance: { 
    label: 'Finance', 
    icon: '💰', 
    color: '#4ADE80',
    bgColor: 'rgba(74, 222, 128, 0.15)',
  },
  ops: { 
    label: 'Operations', 
    icon: '⚙️', 
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.15)',
  },
  sales: { 
    label: 'Sales', 
    icon: '📈', 
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
  },
  users: { 
    label: 'Users', 
    icon: '👤', 
    color: '#06B6D4',
    bgColor: 'rgba(6, 182, 212, 0.15)',
  },
  it: { 
    label: 'IT', 
    icon: '💻', 
    color: '#EC4899',
    bgColor: 'rgba(236, 72, 153, 0.15)',
  },
  leadership: { 
    label: 'Leadership', 
    icon: '👔', 
    color: '#F97316',
    bgColor: 'rgba(249, 115, 22, 0.15)',
  },
};

// ============================================
// LENS PRIORITY - "Your lens first, then theirs"
// ============================================

export const LENS_PRIORITY: Record<LensType, StakeholderRole[]> = {
  cfo: ['finance', 'leadership', 'ops', 'users', 'it', 'sales'],
  ops: ['ops', 'users', 'finance', 'it', 'leadership', 'sales'],
  sales: ['sales', 'leadership', 'finance', 'ops', 'users', 'it'],
  default: ['finance', 'ops', 'users', 'it', 'leadership', 'sales'],
};

/**
 * Get ordered roles for a lens type
 */
export function getOrderedRolesForLens(
  lensType: LensType,
  availableRoles: StakeholderRole[]
): StakeholderRole[] {
  const priority = LENS_PRIORITY[lensType] || LENS_PRIORITY.default;
  return priority.filter(role => availableRoles.includes(role));
}

// ============================================
// INSIGHT TYPES
// ============================================

export type InsightSentiment = 'pain' | 'neutral' | 'gain';

export type ComparisonPriority = 'high' | 'medium' | 'low';

export interface StakeholderInsight {
  /** The metric or observation, e.g., "$94K/yr", "8 min", "325/week" */
  value: string;
  
  /** What the value represents, e.g., "Labor cost", "Per entry", "Weekly volume" */
  label: string;
  
  /** Emotional/business sentiment */
  sentiment: InsightSentiment;
  
  /** Optional icon override (defaults to role icon) */
  icon?: string;
  
  /** Optional expanded explanation for tooltip/detail view */
  detail?: string;
}

// ============================================
// NODE COMPARISON INTERFACE
// ============================================

export interface NodeComparison {
  /** Which node this comparison is for (matches SankeyNode.id) */
  nodeId: string;
  
  /** Human-readable node name for the card header */
  nodeName: string;
  
  /** How important is this comparison for alignment discovery */
  priority: ComparisonPriority;
  
  /** Each stakeholder's perspective on this node */
  insights: Partial<Record<StakeholderRole, StakeholderInsight>>;
  
  /** 
   * The "aha" narrative that connects perspectives
   * e.g., "Finance sees cost, but Ops sees the bottleneck causing it"
   */
  alignmentNarrative?: string;
  
  /**
   * Optional question to prompt discussion
   * e.g., "What would reducing this by 50% mean for your team?"
   */
  discussionPrompt?: string;
}

// ============================================
// TEMPLATE EXTENSION CONFIG
// ============================================

export interface ComparisonCardConfig {
  /** Which nodes have comparison data (before state) */
  currentState: NodeComparison[];
  
  /** Which nodes have comparison data (after state) */
  shiftedState: NodeComparison[];
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get high-priority comparisons only (for featured display)
 */
export function getHighPriorityComparisons(
  comparisons: NodeComparison[]
): NodeComparison[] {
  return comparisons.filter(c => c.priority === 'high');
}

/**
 * Get comparison for a specific node
 */
export function getNodeComparison(
  comparisons: NodeComparison[], 
  nodeId: string
): NodeComparison | undefined {
  return comparisons.find(c => c.nodeId === nodeId);
}

/**
 * Check if a node has comparison data
 */
export function hasComparison(
  comparisons: NodeComparison[], 
  nodeId: string
): boolean {
  return comparisons.some(c => c.nodeId === nodeId);
}

/**
 * Get all roles that have insights for a comparison
 */
export function getActiveRoles(
  comparison: NodeComparison
): StakeholderRole[] {
  return Object.keys(comparison.insights) as StakeholderRole[];
}

/**
 * Get sentiment summary for a comparison
 */
export function getSentimentSummary(
  comparison: NodeComparison
): { pain: number; neutral: number; gain: number } {
  const insights = Object.values(comparison.insights);
  return {
    pain: insights.filter(i => i.sentiment === 'pain').length,
    neutral: insights.filter(i => i.sentiment === 'neutral').length,
    gain: insights.filter(i => i.sentiment === 'gain').length,
  };
}

/**
 * Check if there's alignment conflict (mixed sentiments)
 */
export function hasAlignmentConflict(comparison: NodeComparison): boolean {
  const summary = getSentimentSummary(comparison);
  return summary.pain > 0 && summary.gain > 0;
}