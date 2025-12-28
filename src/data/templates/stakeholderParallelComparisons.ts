/**
 * Stakeholder Parallel Comparisons
 * 
 * Comparison card data for the three parallel views (Orders, Dollars, Time).
 * Each node shows how different stakeholders perceive that same process step.
 * 
 * Key insight: The SAME node looks completely different depending on who's looking.
 * Finance sees cost, Ops sees bottleneck, Sales sees delays, Users see frustration.
 */

import type { NodeComparison } from '../../types/stakeholderComparison';
import type { StakeholderViewType } from './stakeholderParallelData';

// ============================================
// ORDERS VIEW COMPARISONS
// ============================================

const ordersComparisons: NodeComparison[] = [
  {
    nodeId: 'intake',
    nodeName: 'Order Intake',
    priority: 'medium',
    insights: {
      sales: {
        value: '500/wk',
        label: 'Pipeline volume',
        sentiment: 'neutral',
        detail: 'Steady inbound, but what happens next matters more',
      },
      ops: {
        value: '100/day',
        label: 'Daily processing load',
        sentiment: 'neutral',
        detail: 'Manageable volume if downstream flows smoothly',
      },
      finance: {
        value: '$8.20',
        label: 'Cost per intake',
        sentiment: 'neutral',
        detail: 'Intake cost is fine—it\'s the rework that kills us',
      },
    },
    alignmentNarrative: 'Intake looks healthy on the surface. The problems start downstream.',
  },
  {
    nodeId: 'manual-process',
    nodeName: 'Manual Processing',
    priority: 'high',
    insights: {
      ops: {
        value: '485/wk',
        label: 'Manual touches',
        sentiment: 'pain',
        detail: 'Every order requires human handling—no automation',
      },
      finance: {
        value: '$3,808',
        label: 'Weekly labor cost',
        sentiment: 'pain',
        detail: '93% of budget consumed by manual processing',
      },
      users: {
        value: '8 min',
        label: 'Per order',
        sentiment: 'pain',
        detail: 'Repetitive data entry causing fatigue and errors',
      },
      it: {
        value: 'Legacy',
        label: 'System constraint',
        sentiment: 'pain',
        detail: 'No API—can\'t automate even if we wanted to',
      },
    },
    alignmentNarrative: 'This is where the money burns. Ops feels the volume, Finance sees the cost, Users bear the burden, and IT can\'t fix it with current systems.',
    discussionPrompt: 'If you could automate 80% of this, what would your team do instead?',
  },
  {
    nodeId: 'on-time',
    nodeName: 'On-Time Delivery',
    priority: 'medium',
    insights: {
      sales: {
        value: '72%',
        label: 'Promise kept',
        sentiment: 'pain',
        detail: 'Nearly 1 in 3 customers waiting longer than promised',
      },
      leadership: {
        value: '-12 NPS',
        label: 'CSAT impact',
        sentiment: 'pain',
        detail: 'Delays are the #1 driver of negative reviews',
      },
      finance: {
        value: '$3,113',
        label: 'Value delivered',
        sentiment: 'neutral',
        detail: 'Revenue recognized, but at what reputation cost?',
      },
    },
    alignmentNarrative: '72% on-time sounds okay until you realize 140 customers per week are let down.',
  },
  {
    nodeId: 'delayed',
    nodeName: 'Delayed Orders',
    priority: 'high',
    insights: {
      sales: {
        value: '110/wk',
        label: 'Unhappy customers',
        sentiment: 'pain',
        detail: 'Each delay is a churn risk and referral lost',
      },
      ops: {
        value: '22%',
        label: 'Of total volume',
        sentiment: 'pain',
        detail: 'More than 1 in 5 orders miss their window',
      },
      finance: {
        value: '$587',
        label: 'Recovery cost',
        sentiment: 'pain',
        detail: 'Expediting, credits, and customer recovery',
      },
      leadership: {
        value: '3.2 days',
        label: 'Avg delay',
        sentiment: 'pain',
        detail: 'Long enough to trigger complaint calls',
      },
    },
    alignmentNarrative: 'Delays ripple everywhere: Sales loses trust, Ops scrambles to recover, Finance pays for cleanup, Leadership fields complaints.',
    discussionPrompt: 'What would cutting delays in half mean for customer retention?',
  },
  {
    nodeId: 'escalated',
    nodeName: 'Escalated Issues',
    priority: 'high',
    insights: {
      leadership: {
        value: '30/wk',
        label: 'Executive attention',
        sentiment: 'pain',
        detail: 'Senior time spent on preventable issues',
      },
      ops: {
        value: '6%',
        label: 'Escalation rate',
        sentiment: 'pain',
        detail: 'Too high—indicates systemic problems',
      },
      finance: {
        value: '$400',
        label: 'Cost per escalation',
        sentiment: 'pain',
        detail: 'Senior labor + recovery + goodwill credits',
      },
      users: {
        value: 'Stress',
        label: 'Team impact',
        sentiment: 'pain',
        detail: 'Escalations create pressure and blame culture',
      },
    },
    alignmentNarrative: 'Escalations are the visible tip of the iceberg. By the time it reaches leadership, the damage is done.',
  },
];

// ============================================
// DOLLARS VIEW COMPARISONS
// ============================================

const dollarsComparisons: NodeComparison[] = [
  {
    nodeId: 'budget',
    nodeName: 'Weekly Budget',
    priority: 'low',
    insights: {
      finance: {
        value: '$4,100',
        label: 'Allocated spend',
        sentiment: 'neutral',
        detail: 'Budget is set—question is where it goes',
      },
      leadership: {
        value: '$213K',
        label: 'Annual commitment',
        sentiment: 'neutral',
        detail: 'Significant investment in this process',
      },
    },
    alignmentNarrative: 'The budget isn\'t the problem. It\'s how much of it reaches value vs. waste.',
  },
  {
    nodeId: 'labor-pool',
    nodeName: 'Processing Labor',
    priority: 'high',
    insights: {
      finance: {
        value: '$3,808',
        label: 'Weekly cost',
        sentiment: 'pain',
        detail: '93% of budget goes to manual labor',
      },
      ops: {
        value: '3.2 FTE',
        label: 'Headcount equivalent',
        sentiment: 'pain',
        detail: 'People doing work that could be automated',
      },
      users: {
        value: '$23/hr',
        label: 'Loaded cost',
        sentiment: 'neutral',
        detail: 'Reasonable rate, but applied to low-value work',
      },
    },
    alignmentNarrative: 'We\'re paying skilled people to do unskilled work. Finance sees inefficiency, Ops sees trapped capacity.',
    discussionPrompt: 'What strategic work could this team tackle if freed from manual processing?',
  },
  {
    nodeId: 'error-cost',
    nodeName: 'Error Handling',
    priority: 'high',
    insights: {
      finance: {
        value: '$1,545',
        label: 'Weekly waste',
        sentiment: 'pain',
        detail: '38% of labor budget flows to fixing mistakes',
      },
      ops: {
        value: '40%',
        label: 'Rework ratio',
        sentiment: 'pain',
        detail: 'Nearly half of effort spent on corrections',
      },
      users: {
        value: '2.5 hrs',
        label: 'Daily rework',
        sentiment: 'pain',
        detail: 'Demoralizing cycle of fixing yesterday\'s errors',
      },
      leadership: {
        value: '$80K',
        label: 'Annual impact',
        sentiment: 'pain',
        detail: 'Enough to fund a new role or initiative',
      },
    },
    alignmentNarrative: 'Error handling isn\'t a cost center—it\'s a symptom. We\'re paying to clean up problems we create.',
  },
  {
    nodeId: 'value-created',
    nodeName: 'Value Created',
    priority: 'medium',
    insights: {
      finance: {
        value: '$3,113',
        label: 'Productive spend',
        sentiment: 'neutral',
        detail: '76% of budget actually creates value',
      },
      leadership: {
        value: '76%',
        label: 'Efficiency rate',
        sentiment: 'pain',
        detail: 'Industry benchmark is 90%+',
      },
      ops: {
        value: '360',
        label: 'Orders fulfilled',
        sentiment: 'neutral',
        detail: 'Output is acceptable, but cost is too high',
      },
    },
    alignmentNarrative: '76% efficiency sounds decent until you realize we\'re leaving $51K/year on the table.',
  },
  {
    nodeId: 'waste',
    nodeName: 'Pure Waste',
    priority: 'high',
    insights: {
      finance: {
        value: '$987',
        label: 'Weekly loss',
        sentiment: 'pain',
        detail: 'Money spent with zero value recovered',
      },
      leadership: {
        value: '$51K',
        label: 'Annual waste',
        sentiment: 'pain',
        detail: 'Enough for a senior hire or major initiative',
      },
      ops: {
        value: '24%',
        label: 'Of budget',
        sentiment: 'pain',
        detail: 'Nearly a quarter of spend produces nothing',
      },
    },
    alignmentNarrative: 'This isn\'t overhead or acceptable loss. This is money burned with nothing to show for it.',
    discussionPrompt: 'If you could recover half of this, where would you invest it?',
  },
];

// ============================================
// TIME VIEW COMPARISONS
// ============================================

const timeComparisons: NodeComparison[] = [
  {
    nodeId: 'capacity',
    nodeName: 'Team Capacity',
    priority: 'low',
    insights: {
      ops: {
        value: '117 hrs',
        label: 'Weekly capacity',
        sentiment: 'neutral',
        detail: 'Fixed resource—question is allocation',
      },
      finance: {
        value: '$2,691',
        label: 'Labor value',
        sentiment: 'neutral',
        detail: 'At $23/hr loaded cost',
      },
      leadership: {
        value: '3 FTE',
        label: 'Team size',
        sentiment: 'neutral',
        detail: 'Right-sized for volume if efficient',
      },
    },
    alignmentNarrative: 'Capacity isn\'t the constraint. It\'s how much of it goes to value vs. waste.',
  },
  {
    nodeId: 'processing-time',
    nodeName: 'Processing Time',
    priority: 'high',
    insights: {
      ops: {
        value: '109 hrs',
        label: 'Weekly hours',
        sentiment: 'pain',
        detail: '93% of capacity consumed by processing',
      },
      users: {
        value: '22 hrs',
        label: 'Per person daily',
        sentiment: 'pain',
        detail: 'Leaves no bandwidth for improvement',
      },
      finance: {
        value: '$2,507',
        label: 'Weekly cost',
        sentiment: 'neutral',
        detail: 'Cost is fixed—output is variable',
      },
    },
    alignmentNarrative: 'The team is maxed out on processing. No slack for training, improvement, or strategic work.',
    discussionPrompt: 'What could your team accomplish with 30 hours back per week?',
  },
  {
    nodeId: 'error-time',
    nodeName: 'Error Handling Time',
    priority: 'high',
    insights: {
      ops: {
        value: '44 hrs',
        label: 'Weekly rework',
        sentiment: 'pain',
        detail: '40% of processing time is fixing mistakes',
      },
      users: {
        value: '2.5 hrs',
        label: 'Daily per person',
        sentiment: 'pain',
        detail: 'Soul-crushing cycle of cleanup',
      },
      leadership: {
        value: 'Turnover',
        label: 'Risk factor',
        sentiment: 'pain',
        detail: 'High rework correlates with attrition',
      },
    },
    alignmentNarrative: 'People don\'t leave jobs—they leave frustrating work. 44 hours of rework is 44 hours of frustration.',
  },
  {
    nodeId: 'value-hours',
    nodeName: 'Value-Adding Hours',
    priority: 'medium',
    insights: {
      ops: {
        value: '87 hrs',
        label: 'Productive time',
        sentiment: 'neutral',
        detail: '74% of capacity actually creates value',
      },
      leadership: {
        value: '74%',
        label: 'Utilization',
        sentiment: 'pain',
        detail: 'Best-in-class is 90%+',
      },
      finance: {
        value: '$2,001',
        label: 'Value captured',
        sentiment: 'neutral',
        detail: 'Revenue per productive hour',
      },
    },
    alignmentNarrative: '74% sounds good until you realize the team could handle 30% more volume with zero additional headcount.',
  },
  {
    nodeId: 'lost-time',
    nodeName: 'Lost Capacity',
    priority: 'high',
    insights: {
      ops: {
        value: '30 hrs',
        label: 'Weekly waste',
        sentiment: 'pain',
        detail: 'Time spent with nothing to show for it',
      },
      finance: {
        value: '$690',
        label: 'Weekly cost',
        sentiment: 'pain',
        detail: 'Paying for work that produces nothing',
      },
      users: {
        value: '1 hr',
        label: 'Daily lost',
        sentiment: 'pain',
        detail: 'Per person—adds up to frustration',
      },
      leadership: {
        value: '26%',
        label: 'Capacity wasted',
        sentiment: 'pain',
        detail: 'Over a quarter of team time gone',
      },
    },
    alignmentNarrative: '30 hours is almost a full FTE. We\'re paying for capacity we\'re not using.',
    discussionPrompt: 'What would your team do with an extra day per week?',
  },
];

// ============================================
// EXPORT BY VIEW TYPE
// ============================================

export const stakeholderParallelComparisons: Record<StakeholderViewType, NodeComparison[]> = {
  orders: ordersComparisons,
  dollars: dollarsComparisons,
  time: timeComparisons,
};

/**
 * Get comparisons for a specific view type
 */
export function getComparisonsForView(viewType: StakeholderViewType): NodeComparison[] {
  return stakeholderParallelComparisons[viewType] || [];
}

/**
 * Get comparison for a specific node in a view
 */
export function getNodeComparisonForView(
  viewType: StakeholderViewType,
  nodeId: string
): NodeComparison | undefined {
  const comparisons = stakeholderParallelComparisons[viewType];
  return comparisons?.find(c => c.nodeId === nodeId);
}

/**
 * Check if a node has comparison data in a view
 */
export function nodeHasComparison(viewType: StakeholderViewType, nodeId: string): boolean {
  return !!getNodeComparisonForView(viewType, nodeId);
}

/**
 * Get count of stakeholder perspectives for a node
 */
export function getViewCountForNode(viewType: StakeholderViewType, nodeId: string): number {
  const comparison = getNodeComparisonForView(viewType, nodeId);
  if (!comparison) return 0;
  return Object.keys(comparison.insights).length;
}

export default stakeholderParallelComparisons;
