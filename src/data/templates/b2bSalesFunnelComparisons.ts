/**
 * B2B Sales Funnel Comparisons
 * 
 * Comparison card data for the three B2B funnel views (Spend, Deals, Velocity).
 * Shows how different stakeholders perceive the same funnel stages.
 * 
 * Key insight: "No Decision" looks different to CMO, CRO, RevOps, and Sales Reps.
 * CMO sees wasted spend, CRO sees lost quota, RevOps sees capacity drain, Reps see frustration.
 */

import type { NodeComparison, StakeholderRole } from '../../types/stakeholderComparison';
import type { B2BFunnelViewType } from './b2bSalesFunnelData';

// Extend stakeholder roles for B2B context
// Using existing roles but with B2B interpretations:
// - finance = CMO (budget owner)
// - sales = CRO (quota owner)  
// - ops = RevOps (process owner)
// - users = Sales Reps (execution)
// - leadership = CEO/Board (outcomes)
// - it = Sales Ops/Tools

// ============================================
// SPEND VIEW COMPARISONS
// ============================================

const spendComparisons: NodeComparison[] = [
  {
    nodeId: 'paid',
    nodeName: 'Paid Search/Social',
    priority: 'medium',
    insights: {
      finance: {
        value: '$50K',
        label: 'Monthly spend',
        sentiment: 'neutral',
        detail: 'Largest channel investment—needs to justify ROI',
      },
      ops: {
        value: '60%',
        label: 'High-intent rate',
        sentiment: 'gain',
        detail: 'Best quality leads of all paid channels',
      },
      sales: {
        value: '280',
        label: 'Leads/month',
        sentiment: 'neutral',
        detail: 'Volume is there—conversion is the question',
      },
    },
    alignmentNarrative: 'Paid is our most expensive channel, but delivers highest intent. The question is downstream conversion.',
  },
  {
    nodeId: 'events',
    nodeName: 'Events/Conferences',
    priority: 'high',
    insights: {
      finance: {
        value: '$60K',
        label: 'Monthly spend',
        sentiment: 'pain',
        detail: 'Highest cost channel—hard to attribute ROI',
      },
      sales: {
        value: '4.2%',
        label: 'Event conversion',
        sentiment: 'pain',
        detail: 'Lowest converting channel—mostly badge scans',
      },
      ops: {
        value: '40%',
        label: 'Low-intent',
        sentiment: 'pain',
        detail: 'Many tire-kickers, few real buyers',
      },
      leadership: {
        value: '???',
        label: 'Attribution',
        sentiment: 'pain',
        detail: 'Can\'t prove events drive revenue',
      },
    },
    alignmentNarrative: 'Events are our biggest spend but worst conversion. Brand value is real but hard to measure.',
    discussionPrompt: 'If you cut events by 50%, what would you lose? What would you gain?',
  },
  {
    nodeId: 'mql',
    nodeName: 'Marketing Qualified',
    priority: 'medium',
    insights: {
      finance: {
        value: '$120K',
        label: 'Cost to MQL',
        sentiment: 'neutral',
        detail: '60% of budget invested by this point',
      },
      ops: {
        value: '39%',
        label: 'MQL rate',
        sentiment: 'neutral',
        detail: 'On par with industry benchmarks',
      },
      sales: {
        value: '390',
        label: 'MQLs/month',
        sentiment: 'neutral',
        detail: 'Volume is healthy—quality is the question',
      },
    },
    alignmentNarrative: 'MQL volume looks good on paper. The real test is how many become real opportunities.',
  },
  {
    nodeId: 'sql',
    nodeName: 'Sales Qualified',
    priority: 'high',
    insights: {
      finance: {
        value: '$65K',
        label: 'Cost to SQL',
        sentiment: 'neutral',
        detail: 'Investment is committed—now it\'s on sales',
      },
      sales: {
        value: '13%',
        label: 'MQL→SQL',
        sentiment: 'pain',
        detail: 'Industry average—room for improvement',
      },
      ops: {
        value: '51',
        label: 'SQLs/month',
        sentiment: 'pain',
        detail: 'Not enough to hit quota targets',
      },
      users: {
        value: '84 days',
        label: 'MQL to SQL',
        sentiment: 'pain',
        detail: 'Too slow—leads go cold',
      },
    },
    alignmentNarrative: 'The MQL→SQL gap is where deals die. Marketing says leads are good. Sales says they\'re not ready.',
    discussionPrompt: 'What would happen if marketing and sales agreed on MQL criteria?',
  },
  {
    nodeId: 'opportunity',
    nodeName: 'Active Opportunity',
    priority: 'high',
    insights: {
      finance: {
        value: '$52K',
        label: 'Pipeline investment',
        sentiment: 'neutral',
        detail: 'Significant spend now in active deals',
      },
      sales: {
        value: '42',
        label: 'Active opps',
        sentiment: 'pain',
        detail: 'Not enough pipe to hit number',
      },
      ops: {
        value: '45 days',
        label: 'Avg stage time',
        sentiment: 'neutral',
        detail: 'Normal cycle—but many stall',
      },
      users: {
        value: '8-10',
        label: 'Per rep',
        sentiment: 'pain',
        detail: 'Spread too thin across deals',
      },
    },
    alignmentNarrative: 'We have opportunities, but reps are spread thin. Not enough focus on winnable deals.',
  },
  {
    nodeId: 'no-decision',
    nodeName: 'No Decision',
    priority: 'high',
    insights: {
      finance: {
        value: '$92K',
        label: 'Monthly waste',
        sentiment: 'pain',
        detail: '46% of GTM spend goes to deals that stall',
      },
      sales: {
        value: '71%',
        label: 'Of opportunities',
        sentiment: 'pain',
        detail: 'Biggest loss category—bigger than competitors',
      },
      ops: {
        value: '180+ days',
        label: 'Before giving up',
        sentiment: 'pain',
        detail: 'Burning capacity on dead deals',
      },
      users: {
        value: 'Frustration',
        label: 'Rep sentiment',
        sentiment: 'pain',
        detail: 'Chasing ghosts kills morale',
      },
      leadership: {
        value: '$1.1M',
        label: 'Annual loss',
        sentiment: 'pain',
        detail: 'Enough for 10 more sales reps',
      },
    },
    alignmentNarrative: 'This is the hidden killer. Not losing to competitors—losing to indecision. Everyone feels it differently.',
    discussionPrompt: 'What if you could convert just 20% of No Decisions? What would that mean?',
  },
  {
    nodeId: 'won',
    nodeName: 'Closed Won',
    priority: 'medium',
    insights: {
      finance: {
        value: '$10.4K',
        label: 'Cost per deal',
        sentiment: 'neutral',
        detail: 'CAC is in range—but volume is low',
      },
      sales: {
        value: '8',
        label: 'Deals/month',
        sentiment: 'pain',
        detail: 'Below target—need 12+ to hit plan',
      },
      leadership: {
        value: '19%',
        label: 'Win rate',
        sentiment: 'pain',
        detail: 'Should be 25%+ with this investment',
      },
    },
    alignmentNarrative: 'We\'re winning, but not enough. CAC is okay—it\'s the conversion rate that\'s killing us.',
  },
  {
    nodeId: 'lost-competitor',
    nodeName: 'Lost to Competitor',
    priority: 'medium',
    insights: {
      sales: {
        value: '4',
        label: 'Deals/month',
        sentiment: 'neutral',
        detail: 'Only 10% of outcomes—not the main problem',
      },
      leadership: {
        value: 'Acme, Rival',
        label: 'Who\'s winning',
        sentiment: 'neutral',
        detail: 'Known competitors—we know how to fight them',
      },
      finance: {
        value: '$5.2K',
        label: 'Spend wasted',
        sentiment: 'neutral',
        detail: 'Acceptable loss rate in competitive market',
      },
    },
    alignmentNarrative: 'Losing to competitors is normal. Losing to "nothing" is the real problem.',
  },
];

// ============================================
// DEALS VIEW COMPARISONS
// ============================================

const dealsComparisons: NodeComparison[] = [
  {
    nodeId: 'organic',
    nodeName: 'Organic Leads',
    priority: 'medium',
    insights: {
      finance: {
        value: '$30K',
        label: 'Content investment',
        sentiment: 'gain',
        detail: 'Lower cost per lead than paid',
      },
      ops: {
        value: '31.3%',
        label: 'Conversion rate',
        sentiment: 'gain',
        detail: 'Highest converting channel',
      },
      sales: {
        value: '220',
        label: 'Leads/month',
        sentiment: 'gain',
        detail: 'Quality over quantity',
      },
    },
    alignmentNarrative: 'Organic is our most efficient channel. The question is whether we can scale it.',
  },
  {
    nodeId: 'referrals',
    nodeName: 'Referral Leads',
    priority: 'medium',
    insights: {
      sales: {
        value: '24.7%',
        label: 'Conversion',
        sentiment: 'gain',
        detail: 'Second-best converting source',
      },
      finance: {
        value: '$25K',
        label: 'Program cost',
        sentiment: 'gain',
        detail: 'Low cost, high quality',
      },
      ops: {
        value: '70%',
        label: 'High-intent',
        sentiment: 'gain',
        detail: 'Pre-qualified by referrer',
      },
    },
    alignmentNarrative: 'Referrals are gold. Why aren\'t we investing more here?',
    discussionPrompt: 'What would 2x referral volume do to your pipeline?',
  },
  {
    nodeId: 'disqualified',
    nodeName: 'Disqualified',
    priority: 'high',
    insights: {
      finance: {
        value: '$80K',
        label: 'Wasted spend',
        sentiment: 'pain',
        detail: '40% of budget goes to non-buyers',
      },
      ops: {
        value: '61%',
        label: 'Disqual rate',
        sentiment: 'pain',
        detail: 'More than half of leads don\'t qualify',
      },
      users: {
        value: 'Time sink',
        label: 'SDR impact',
        sentiment: 'pain',
        detail: 'Calling people who will never buy',
      },
    },
    alignmentNarrative: 'We\'re generating leads, but most aren\'t real buyers. Targeting or messaging problem?',
  },
  {
    nodeId: 'no-decision',
    nodeName: 'No Decision',
    priority: 'high',
    insights: {
      sales: {
        value: '30',
        label: 'Deals stuck',
        sentiment: 'pain',
        detail: '71% of pipeline going nowhere',
      },
      users: {
        value: '4-5',
        label: 'Per rep/month',
        sentiment: 'pain',
        detail: 'Each rep has deals that will never close',
      },
      leadership: {
        value: '4x',
        label: 'vs competitors',
        sentiment: 'pain',
        detail: 'Losing to "nothing" more than to rivals',
      },
      ops: {
        value: 'Pipeline',
        label: 'Clogging',
        sentiment: 'pain',
        detail: 'Dead deals make forecasting impossible',
      },
    },
    alignmentNarrative: 'Thirty deals per month stall out. Not lost—just stuck. Why can\'t buyers decide?',
    discussionPrompt: 'What\'s stopping these buyers from making a decision?',
  },
  {
    nodeId: 'won',
    nodeName: 'Closed Won',
    priority: 'medium',
    insights: {
      sales: {
        value: '8',
        label: 'Wins/month',
        sentiment: 'pain',
        detail: 'Need 50% more to hit plan',
      },
      leadership: {
        value: '0.8%',
        label: 'Lead→Win',
        sentiment: 'pain',
        detail: 'Only 8 of 1,000 leads convert',
      },
      finance: {
        value: '$25K',
        label: 'CAC',
        sentiment: 'neutral',
        detail: 'Within target, but volume is low',
      },
    },
    alignmentNarrative: 'Eight wins from a thousand leads. The funnel is leaking everywhere.',
  },
];

// ============================================
// VELOCITY VIEW COMPARISONS
// ============================================

const velocityComparisons: NodeComparison[] = [
  {
    nodeId: 'fast-qual',
    nodeName: 'Fast Qualification',
    priority: 'medium',
    insights: {
      ops: {
        value: '3 days',
        label: 'Avg time',
        sentiment: 'gain',
        detail: 'Best-case qualification path',
      },
      sales: {
        value: '53%',
        label: 'Conversion',
        sentiment: 'gain',
        detail: 'Speed-to-lead = higher conversion',
      },
      users: {
        value: '< 1 hr',
        label: 'Response time',
        sentiment: 'gain',
        detail: 'Fastest responders win',
      },
    },
    alignmentNarrative: 'Speed matters. Leads that qualify fast convert at 3x the rate.',
  },
  {
    nodeId: 'stalled-qual',
    nodeName: 'Stalled Qualification',
    priority: 'high',
    insights: {
      ops: {
        value: '30+ days',
        label: 'In limbo',
        sentiment: 'pain',
        detail: 'Leads aging out before qualification',
      },
      sales: {
        value: '17%',
        label: 'Conversion',
        sentiment: 'pain',
        detail: 'Slow response = cold leads',
      },
      users: {
        value: 'Backlog',
        label: 'SDR stress',
        sentiment: 'pain',
        detail: 'Too many leads, not enough time',
      },
    },
    alignmentNarrative: 'Slow qualification kills deals before they start. 30-day-old leads are dead leads.',
    discussionPrompt: 'What would happen if every lead got a response within 1 hour?',
  },
  {
    nodeId: 'active-opp',
    nodeName: 'Active Pipeline',
    priority: 'medium',
    insights: {
      ops: {
        value: '45 days',
        label: 'Avg stage time',
        sentiment: 'neutral',
        detail: 'Normal for enterprise deals',
      },
      sales: {
        value: '42',
        label: 'Active deals',
        sentiment: 'neutral',
        detail: 'Healthy pipeline—but watch velocity',
      },
      users: {
        value: '2-3',
        label: 'Touches/week',
        sentiment: 'neutral',
        detail: 'Keeping deals warm',
      },
    },
    alignmentNarrative: 'Active deals are moving. The question is: toward close or toward stall?',
  },
  {
    nodeId: 'stalled-opp',
    nodeName: 'Stalled Deals',
    priority: 'high',
    insights: {
      ops: {
        value: '90+ days',
        label: 'No movement',
        sentiment: 'pain',
        detail: 'Deals that should be dead',
      },
      users: {
        value: 'False hope',
        label: 'Rep impact',
        sentiment: 'pain',
        detail: 'Chasing ghosts instead of real deals',
      },
      sales: {
        value: '16',
        label: 'Stalled/month',
        sentiment: 'pain',
        detail: 'Nearly half of pipeline is stuck',
      },
      leadership: {
        value: 'Forecast',
        label: 'Unreliable',
        sentiment: 'pain',
        detail: 'Can\'t predict revenue with zombie deals',
      },
    },
    alignmentNarrative: 'Stalled deals pollute the pipeline. Reps can\'t focus, leaders can\'t forecast.',
  },
  {
    nodeId: 'no-decision',
    nodeName: 'No Decision',
    priority: 'high',
    insights: {
      ops: {
        value: '180+ days',
        label: 'Cycle time',
        sentiment: 'pain',
        detail: '2x longer than won deals',
      },
      users: {
        value: '120+ hrs',
        label: 'Rep time wasted',
        sentiment: 'pain',
        detail: 'Per deal that goes nowhere',
      },
      sales: {
        value: '3x',
        label: 'Capacity drain',
        sentiment: 'pain',
        detail: 'These deals eat as much time as wins',
      },
      leadership: {
        value: '30%',
        label: 'Capacity locked',
        sentiment: 'pain',
        detail: 'Reps spending 1/3 of time on dead deals',
      },
    },
    alignmentNarrative: 'No Decisions consume 180+ days then vanish. That\'s 120 hours per rep per deal—for nothing.',
    discussionPrompt: 'What if you could identify No Decisions 60 days earlier?',
  },
  {
    nodeId: 'won',
    nodeName: 'Won Deals',
    priority: 'medium',
    insights: {
      ops: {
        value: '90 days',
        label: 'Avg cycle',
        sentiment: 'neutral',
        detail: 'Normal for mid-market deals',
      },
      sales: {
        value: '40 hrs',
        label: 'Rep time',
        sentiment: 'neutral',
        detail: 'Reasonable investment for a win',
      },
      leadership: {
        value: 'Predictable',
        label: 'Pattern',
        sentiment: 'gain',
        detail: 'Won deals follow a rhythm',
      },
    },
    alignmentNarrative: 'Won deals have a pattern. What if we could apply that pattern earlier?',
  },
];

// ============================================
// EXPORT BY VIEW TYPE
// ============================================

export const b2bFunnelComparisons: Record<B2BFunnelViewType, NodeComparison[]> = {
  spend: spendComparisons,
  deals: dealsComparisons,
  velocity: velocityComparisons,
};

/**
 * Get comparisons for a specific view type
 */
export function getB2BComparisonsForView(viewType: B2BFunnelViewType): NodeComparison[] {
  return b2bFunnelComparisons[viewType] || [];
}

/**
 * Get comparison for a specific node in a view
 */
export function getB2BNodeComparisonForView(
  viewType: B2BFunnelViewType,
  nodeId: string
): NodeComparison | undefined {
  const comparisons = b2bFunnelComparisons[viewType];
  return comparisons?.find(c => c.nodeId === nodeId);
}

/**
 * Check if a node has comparison data in a view
 */
export function b2bNodeHasComparison(viewType: B2BFunnelViewType, nodeId: string): boolean {
  return !!getB2BNodeComparisonForView(viewType, nodeId);
}

/**
 * Get count of stakeholder perspectives for a node
 */
export function getB2BViewCountForNode(viewType: B2BFunnelViewType, nodeId: string): number {
  const comparison = getB2BNodeComparisonForView(viewType, nodeId);
  if (!comparison) return 0;
  return Object.keys(comparison.insights).length;
}

export default b2bFunnelComparisons;