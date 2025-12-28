/**
 * Stakeholder Comparison Types
 */

export type StakeholderRole = 'finance' | 'ops' | 'sales' | 'users' | 'it' | 'leadership';

export type LensType = 'default' | 'cfo' | 'ops' | 'sales';

/** @deprecated Use LensType instead */
export type ViewerType = LensType;

export interface StakeholderRoleMeta {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}

export const STAKEHOLDER_ROLES: Record<StakeholderRole, StakeholderRoleMeta> = {
  finance: { label: 'Finance', icon: '💰', color: '#4ADE80', bgColor: 'rgba(74, 222, 128, 0.15)' },
  ops: { label: 'Operations', icon: '⚙️', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.15)' },
  sales: { label: 'Sales', icon: '📈', color: '#8B5CF6', bgColor: 'rgba(139, 92, 246, 0.15)' },
  users: { label: 'Users', icon: '👤', color: '#06B6D4', bgColor: 'rgba(6, 182, 212, 0.15)' },
  it: { label: 'IT', icon: '💻', color: '#EC4899', bgColor: 'rgba(236, 72, 153, 0.15)' },
  leadership: { label: 'Leadership', icon: '👔', color: '#F97316', bgColor: 'rgba(249, 115, 22, 0.15)' },
};

export const LENS_PRIORITY: Record<LensType, StakeholderRole[]> = {
  cfo: ['finance', 'leadership', 'ops', 'users', 'it', 'sales'],
  ops: ['ops', 'users', 'finance', 'it', 'leadership', 'sales'],
  sales: ['sales', 'leadership', 'finance', 'ops', 'users', 'it'],
  default: ['finance', 'ops', 'users', 'it', 'leadership', 'sales'],
};

export function getOrderedRolesForLens(lensType: LensType, availableRoles: StakeholderRole[]): StakeholderRole[] {
  const priority = LENS_PRIORITY[lensType] || LENS_PRIORITY.default;
  return priority.filter(role => availableRoles.includes(role));
}

export type InsightSentiment = 'pain' | 'neutral' | 'gain';
export type ComparisonPriority = 'high' | 'medium' | 'low';

export interface StakeholderInsight {
  value: string;
  label: string;
  sentiment: InsightSentiment;
  icon?: string;
  detail?: string;
}

export interface NodeComparison {
  nodeId: string;
  nodeName: string;
  priority: ComparisonPriority;
  insights: Partial<Record<StakeholderRole, StakeholderInsight>>;
  alignmentNarrative?: string;
  discussionPrompt?: string;
}

export interface ComparisonCardConfig {
  currentState: NodeComparison[];
  shiftedState: NodeComparison[];
}

export function getHighPriorityComparisons(comparisons: NodeComparison[]): NodeComparison[] {
  return comparisons.filter(c => c.priority === 'high');
}

export function getNodeComparison(comparisons: NodeComparison[], nodeId: string): NodeComparison | undefined {
  return comparisons.find(c => c.nodeId === nodeId);
}

export function hasComparison(comparisons: NodeComparison[], nodeId: string): boolean {
  return comparisons.some(c => c.nodeId === nodeId);
}

export function getActiveRoles(comparison: NodeComparison): StakeholderRole[] {
  return Object.keys(comparison.insights) as StakeholderRole[];
}

export function getSentimentSummary(comparison: NodeComparison): { pain: number; neutral: number; gain: number } {
  const insights = Object.values(comparison.insights);
  return {
    pain: insights.filter(i => i.sentiment === 'pain').length,
    neutral: insights.filter(i => i.sentiment === 'neutral').length,
    gain: insights.filter(i => i.sentiment === 'gain').length,
  };
}

export function hasAlignmentConflict(comparison: NodeComparison): boolean {
  const summary = getSentimentSummary(comparison);
  return summary.pain > 0 && summary.gain > 0;
}