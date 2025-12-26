/**
 * Process Automation Comparisons
 * 
 * Example stakeholder comparison data for the process automation template.
 * Shows how Finance, Ops, IT, and Users view the same pain points differently.
 */

import type { NodeComparison, ComparisonCardConfig } from '../../types/stakeholderComparison';

// ============================================
// CURRENT STATE COMPARISONS (Pain Points)
// ============================================

export const currentStateComparisons: NodeComparison[] = [
  {
    nodeId: 'manual-entry',
    nodeName: 'Manual Data Entry',
    priority: 'high',
    insights: {
      finance: {
        value: '$94K/yr',
        label: 'Labor cost',
        sentiment: 'pain',
        detail: 'Direct salary cost for manual data entry tasks',
      },
      ops: {
        value: '325/week',
        label: 'Entries processed',
        sentiment: 'pain',
        detail: 'Weekly volume creating consistent backlog',
      },
      users: {
        value: '8 min',
        label: 'Per entry',
        sentiment: 'pain',
        detail: 'Repetitive task causing fatigue and errors',
      },
      it: {
        value: 'No API',
        label: 'Integration gap',
        sentiment: 'pain',
        detail: 'Legacy system lacks modern integration options',
      },
    },
    alignmentNarrative: 'Finance sees the cost, but Ops feels the bottleneck that causes it. Users bear the daily burden while IT lacks the tools to fix it.',
    discussionPrompt: 'If you could cut this by 80%, what would your team do with that time?',
  },
  
  {
    nodeId: 'errors-rework',
    nodeName: 'Errors & Rework',
    priority: 'high',
    insights: {
      finance: {
        value: '$42K/yr',
        label: 'Error cost',
        sentiment: 'pain',
        detail: 'Cost of corrections, refunds, and customer recovery',
      },
      ops: {
        value: '12%',
        label: 'Error rate',
        sentiment: 'pain',
        detail: 'One in eight entries requires correction',
      },
      users: {
        value: '2.5 hrs',
        label: 'Daily rework',
        sentiment: 'pain',
        detail: 'Time spent fixing mistakes instead of moving forward',
      },
      leadership: {
        value: '-15 NPS',
        label: 'CSAT impact',
        sentiment: 'pain',
        detail: 'Customer satisfaction hit from error-related issues',
      },
    },
    alignmentNarrative: 'Errors ripple across the org: Finance counts the cost, Ops measures the rate, Users fix the mess, and Leadership sees it in CSAT scores.',
    discussionPrompt: 'What would near-zero errors mean for customer trust?',
  },
  
  {
    nodeId: 'overtime-required',
    nodeName: 'Overtime Required',
    priority: 'medium',
    insights: {
      finance: {
        value: '$28K/yr',
        label: 'OT expense',
        sentiment: 'pain',
      },
      ops: {
        value: '15 hrs',
        label: 'Weekly OT',
        sentiment: 'pain',
      },
      users: {
        value: 'Burnout',
        label: 'Team morale',
        sentiment: 'pain',
        detail: 'Sustained overtime leading to turnover risk',
      },
    },
    alignmentNarrative: 'Overtime is a symptom, not the disease. The real cost is team sustainability.',
  },
  
  {
    nodeId: 'specialist-queue',
    nodeName: 'Specialist Queue',
    priority: 'medium',
    insights: {
      leadership: {
        value: '2.5 days',
        label: 'Avg wait',
        sentiment: 'pain',
        detail: 'Complex orders stuck waiting for specialists',
      },
      finance: {
        value: '$18K',
        label: 'Queue cost',
        sentiment: 'pain',
        detail: 'Lost revenue from delayed processing',
      },
      ops: {
        value: '125/week',
        label: 'Backlog',
        sentiment: 'pain',
        detail: 'Constant queue pressure on specialists',
      },
    },
    alignmentNarrative: 'When specialists are the bottleneck, everything slows down—and the cost compounds daily.',
  },
];

// ============================================
// SHIFTED STATE COMPARISONS (Gains)
// ============================================

export const shiftedStateComparisons: NodeComparison[] = [
  {
    nodeId: 'auto-processing',
    nodeName: 'Auto-Processing',
    priority: 'high',
    insights: {
      finance: {
        value: '$71K',
        label: 'Annual savings',
        sentiment: 'gain',
        detail: '75% reduction in manual processing cost',
      },
      ops: {
        value: '98%',
        label: 'Auto-processed',
        sentiment: 'gain',
        detail: 'Only exceptions require human review',
      },
      users: {
        value: '< 1 min',
        label: 'Review time',
        sentiment: 'gain',
        detail: 'Spot-check instead of data entry',
      },
      it: {
        value: 'API-first',
        label: 'Integration',
        sentiment: 'gain',
        detail: 'Modern stack with full connectivity',
      },
    },
    alignmentNarrative: 'Same data, zero drudgery. Finance sees ROI, Ops sees throughput, Users get their time back, IT gets modern tools.',
    discussionPrompt: 'What strategic work could your team tackle with this capacity freed up?',
  },
  
  {
    nodeId: 'on-time-delivery',
    nodeName: 'On-Time Delivery',
    priority: 'high',
    insights: {
      finance: {
        value: '$38K',
        label: 'Error savings',
        sentiment: 'gain',
        detail: 'Near-elimination of error-related costs',
      },
      ops: {
        value: '94%',
        label: 'On-time rate',
        sentiment: 'gain',
        detail: 'Dramatic improvement in delivery performance',
      },
      users: {
        value: 'Zero',
        label: 'Rework',
        sentiment: 'gain',
        detail: 'No more fixing yesterday\'s mistakes',
      },
      leadership: {
        value: '+22 NPS',
        label: 'CSAT lift',
        sentiment: 'gain',
        detail: 'Customer experience transformation',
      },
    },
    alignmentNarrative: 'Quality isn\'t a trade-off anymore. Everyone wins: lower costs, happier customers, and a team that can focus forward.',
  },
  
  {
    nodeId: 'capacity-freed',
    nodeName: 'Capacity Freed',
    priority: 'high',
    insights: {
      finance: {
        value: '2.5 FTE',
        label: 'Equivalent',
        sentiment: 'gain',
        detail: 'Capacity without additional headcount',
      },
      ops: {
        value: '40 hrs',
        label: 'Weekly gain',
        sentiment: 'gain',
        detail: 'Redirected to strategic initiatives',
      },
      users: {
        value: 'Growth',
        label: 'Career path',
        sentiment: 'gain',
        detail: 'Higher-value work and skill development',
      },
    },
    alignmentNarrative: 'This isn\'t about doing less—it\'s about doing more of what matters.',
    discussionPrompt: 'What\'s the first thing your team would tackle with this freed capacity?',
  },
  
];

// ============================================
// COMBINED CONFIG
// ============================================

export const processAutomationComparisons: ComparisonCardConfig = {
  currentState: currentStateComparisons,
  shiftedState: shiftedStateComparisons,
};

// ============================================
// UTILITY: Get comparisons for a template
// ============================================

export function getComparisonsForState(
  config: ComparisonCardConfig,
  viewState: 'before' | 'after'
): NodeComparison[] {
  return viewState === 'before' ? config.currentState : config.shiftedState;
}

export default processAutomationComparisons;