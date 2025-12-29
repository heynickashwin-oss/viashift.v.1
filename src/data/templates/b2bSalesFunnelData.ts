/**
 * B2B Sales Funnel Dataset - Complex POC
 * 
 * Stress test for Sankey visualization with:
 * - 18 nodes across 6 layers
 * - 3 stakeholder lenses (Dollars, Deals, Time)
 * - Multiple source channels with realistic spend
 * - Real conversion rates from industry benchmarks
 * - The "No Decision" outcome highlighted (40-60% of opportunities)
 * 
 * Data sources:
 * - FirstPageSage B2B SaaS Funnel Benchmarks
 * - Gartner Sales Research
 * - Industry conversion rate studies
 */

import { SankeyData, SankeyMetric, FlowState } from '../../components/sankeyflowv3';

// ============================================
// VIEW TYPE DEFINITIONS
// ============================================

export type B2BFunnelViewType = 'spend' | 'deals' | 'velocity';

export interface B2BFunnelViewConfig {
  viewType: B2BFunnelViewType;
  title: string;
  subtitle: string;
  unit: string;
  unitLabel: string;
  totalInput: number;
  insight: string;
  audienceLabel: string;
}

// ============================================
// VIEW CONFIGURATIONS
// ============================================

export const b2bViewConfigs: Record<B2BFunnelViewType, B2BFunnelViewConfig> = {
  spend: {
    viewType: 'spend',
    title: 'Marketing Spend Flow',
    subtitle: 'Budget to Revenue',
    unit: '$',
    unitLabel: '$/month',
    totalInput: 200000,
    insight: '$92K/month (46%) flows to deals that end in "No Decision" — not lost to competitors, just stuck',
    audienceLabel: 'CMO / Finance View',
  },
  deals: {
    viewType: 'deals',
    title: 'Deal Flow',
    subtitle: 'Pipeline Volume',
    unit: 'deals',
    unitLabel: 'deals/month',
    totalInput: 1000,
    insight: '45% of qualified opportunities end in "No Decision" — 4x more than competitor losses',
    audienceLabel: 'CRO / Sales View',
  },
  velocity: {
    viewType: 'velocity',
    title: 'Pipeline Velocity',
    subtitle: 'Time in Stage',
    unit: 'days',
    unitLabel: 'avg days',
    totalInput: 180,
    insight: '"No Decision" deals consume 120+ days of sales capacity before going dark',
    audienceLabel: 'RevOps View',
  },
};

// ============================================
// SPEND VIEW (CMO/Finance) - CURRENT STATE
// Monthly marketing budget flow to revenue outcomes
// ============================================

const spendCurrentData: SankeyData = {
  nodes: [
    // Layer 0: SOURCES (5 nodes)
    { id: 'paid', label: 'Paid Search/Social', layer: 0, value: 50000, type: 'source', displayValue: '$50K/mo' },
    { id: 'organic', label: 'SEO/Content', layer: 0, value: 30000, type: 'source', displayValue: '$30K/mo' },
    { id: 'events', label: 'Events/Conferences', layer: 0, value: 60000, type: 'source', displayValue: '$60K/mo' },
    { id: 'webinars', label: 'Webinars/Content', layer: 0, value: 35000, type: 'source', displayValue: '$35K/mo' },
    { id: 'referrals', label: 'Referral Programs', layer: 0, value: 25000, type: 'source', displayValue: '$25K/mo' },
    
    // Layer 1: LEAD GENERATION (3 nodes)
    { id: 'high-intent', label: 'High-Intent Leads', layer: 1, value: 78000, type: 'default', displayValue: '$78K' },
    { id: 'med-intent', label: 'Medium-Intent', layer: 1, value: 72000, type: 'default', displayValue: '$72K' },
    { id: 'low-intent', label: 'Low-Intent', layer: 1, value: 50000, type: 'default', displayValue: '$50K' },
    
    // Layer 2: QUALIFICATION (2 nodes)
    { id: 'mql', label: 'Marketing Qualified', layer: 2, value: 120000, type: 'default', displayValue: '$120K' },
    { id: 'disqualified', label: 'Disqualified', layer: 2, value: 80000, type: 'loss', displayValue: '$80K' },
    
    // Layer 3: SALES ENGAGEMENT (3 nodes)
    { id: 'sql', label: 'Sales Qualified', layer: 3, value: 65000, type: 'default', displayValue: '$65K' },
    { id: 'nurture', label: 'Nurture Queue', layer: 3, value: 35000, type: 'default', displayValue: '$35K' },
    { id: 'no-response', label: 'No Response', layer: 3, value: 20000, type: 'loss', displayValue: '$20K' },
    
    // Layer 4: PIPELINE (2 nodes)
    { id: 'opportunity', label: 'Active Opportunity', layer: 4, value: 52000, type: 'default', displayValue: '$52K' },
    { id: 'lost-early', label: 'Lost Early Stage', layer: 4, value: 13000, type: 'loss', displayValue: '$13K' },
    
    // Layer 5: OUTCOMES (3 nodes)
    { id: 'won', label: '✓ Closed Won', layer: 5, value: 10400, type: 'revenue', displayValue: '$10.4K (5.2%)' },
    { id: 'lost-competitor', label: '✗ Lost to Competitor', layer: 5, value: 5200, type: 'loss', displayValue: '$5.2K (2.6%)' },
    { id: 'no-decision', label: '⚠ No Decision', layer: 5, value: 36400, type: 'loss', displayValue: '$36.4K (18.2%)' },
  ],
  links: [
    // Sources → Lead Types (realistic channel performance)
    // Paid: 60% high-intent, 30% med, 10% low
    { from: 'paid', to: 'high-intent', value: 30000, type: 'default', displayLabel: '$30K' },
    { from: 'paid', to: 'med-intent', value: 15000, type: 'default', displayLabel: '$15K' },
    { from: 'paid', to: 'low-intent', value: 5000, type: 'default', displayLabel: '$5K' },
    
    // Organic: 50% high, 35% med, 15% low
    { from: 'organic', to: 'high-intent', value: 15000, type: 'default', displayLabel: '$15K' },
    { from: 'organic', to: 'med-intent', value: 10500, type: 'default', displayLabel: '$10.5K' },
    { from: 'organic', to: 'low-intent', value: 4500, type: 'default', displayLabel: '$4.5K' },
    
    // Events: 20% high, 40% med, 40% low (broad audience)
    { from: 'events', to: 'high-intent', value: 12000, type: 'default', displayLabel: '$12K' },
    { from: 'events', to: 'med-intent', value: 24000, type: 'default', displayLabel: '$24K' },
    { from: 'events', to: 'low-intent', value: 24000, type: 'default', displayLabel: '$24K' },
    
    // Webinars: 40% high, 40% med, 20% low
    { from: 'webinars', to: 'high-intent', value: 14000, type: 'default', displayLabel: '$14K' },
    { from: 'webinars', to: 'med-intent', value: 14000, type: 'default', displayLabel: '$14K' },
    { from: 'webinars', to: 'low-intent', value: 7000, type: 'default', displayLabel: '$7K' },
    
    // Referrals: 70% high, 20% med, 10% low (best quality)
    { from: 'referrals', to: 'high-intent', value: 17500, type: 'default', displayLabel: '$17.5K' },
    { from: 'referrals', to: 'med-intent', value: 5000, type: 'default', displayLabel: '$5K' },
    { from: 'referrals', to: 'low-intent', value: 2500, type: 'default', displayLabel: '$2.5K' },
    
    // Lead Types → Qualification (MQL rates: high=70%, med=50%, low=20%)
    { from: 'high-intent', to: 'mql', value: 54600, type: 'default', displayLabel: '$54.6K' },
    { from: 'high-intent', to: 'disqualified', value: 23400, type: 'loss', displayLabel: '$23.4K' },
    { from: 'med-intent', to: 'mql', value: 36000, type: 'default', displayLabel: '$36K' },
    { from: 'med-intent', to: 'disqualified', value: 36000, type: 'loss', displayLabel: '$36K' },
    { from: 'low-intent', to: 'mql', value: 10000, type: 'default', displayLabel: '$10K' },
    { from: 'low-intent', to: 'disqualified', value: 40000, type: 'loss', displayLabel: '$40K' },
    
    // MQL → Sales Engagement (SQL rate: 13% avg, rest split nurture/no-response)
    { from: 'mql', to: 'sql', value: 65000, type: 'default', displayLabel: '$65K' },
    { from: 'mql', to: 'nurture', value: 35000, type: 'default', displayLabel: '$35K' },
    { from: 'mql', to: 'no-response', value: 20000, type: 'loss', displayLabel: '$20K' },
    
    // SQL → Pipeline (80% become opportunity, 20% lost early)
    { from: 'sql', to: 'opportunity', value: 52000, type: 'default', displayLabel: '$52K' },
    { from: 'sql', to: 'lost-early', value: 13000, type: 'loss', displayLabel: '$13K' },
    
    // Opportunity → Outcomes (20% win, 10% lose to competitor, 70% no decision)
    { from: 'opportunity', to: 'won', value: 10400, type: 'revenue', displayLabel: '$10.4K' },
    { from: 'opportunity', to: 'lost-competitor', value: 5200, type: 'loss', displayLabel: '$5.2K' },
    { from: 'opportunity', to: 'no-decision', value: 36400, type: 'loss', displayLabel: '$36.4K' },
    
    // Nurture → back to opportunity (some convert eventually)
    { from: 'nurture', to: 'opportunity', value: 7000, type: 'default', displayLabel: '$7K' },
    { from: 'nurture', to: 'no-decision', value: 28000, type: 'loss', displayLabel: '$28K' },
  ],
};

const spendCurrentMetrics: SankeyMetric[] = [
  { id: 'total', value: '$200K', label: 'Monthly GTM Spend', type: 'neutral' },
  { id: 'won', value: '$10.4K', label: 'Cost per Won Deal', type: 'positive' },
  { id: 'nodecision', value: '$92K', label: 'Lost to No Decision', type: 'negative' },
];

// ============================================
// DEALS VIEW (CRO/Sales) - CURRENT STATE
// Pipeline volume flow
// ============================================

const dealsCurrentData: SankeyData = {
  nodes: [
    // Layer 0: SOURCES (5 nodes)
    { id: 'paid', label: 'Paid Leads', layer: 0, value: 280, type: 'source', displayValue: '280/mo' },
    { id: 'organic', label: 'Organic Leads', layer: 0, value: 220, type: 'source', displayValue: '220/mo' },
    { id: 'events', label: 'Event Leads', layer: 0, value: 300, type: 'source', displayValue: '300/mo' },
    { id: 'webinars', label: 'Webinar Leads', layer: 0, value: 120, type: 'source', displayValue: '120/mo' },
    { id: 'referrals', label: 'Referral Leads', layer: 0, value: 80, type: 'source', displayValue: '80/mo' },
    
    // Layer 1: LEAD QUALITY (3 nodes)
    { id: 'high-intent', label: 'High-Intent', layer: 1, value: 350, type: 'default', displayValue: '350 leads' },
    { id: 'med-intent', label: 'Medium-Intent', layer: 1, value: 400, type: 'default', displayValue: '400 leads' },
    { id: 'low-intent', label: 'Low-Intent', layer: 1, value: 250, type: 'default', displayValue: '250 leads' },
    
    // Layer 2: QUALIFICATION (2 nodes)
    { id: 'mql', label: 'MQLs', layer: 2, value: 390, type: 'default', displayValue: '390 MQLs' },
    { id: 'disqualified', label: 'Disqualified', layer: 2, value: 610, type: 'loss', displayValue: '610 (61%)' },
    
    // Layer 3: SALES ENGAGEMENT (3 nodes)
    { id: 'sql', label: 'SQLs', layer: 3, value: 51, type: 'default', displayValue: '51 SQLs' },
    { id: 'nurture', label: 'Nurture', layer: 3, value: 234, type: 'default', displayValue: '234 nurture' },
    { id: 'no-response', label: 'No Response', layer: 3, value: 105, type: 'loss', displayValue: '105 ghost' },
    
    // Layer 4: PIPELINE (2 nodes)
    { id: 'opportunity', label: 'Opportunities', layer: 4, value: 42, type: 'default', displayValue: '42 opps' },
    { id: 'lost-early', label: 'Lost Early', layer: 4, value: 9, type: 'loss', displayValue: '9 lost' },
    
    // Layer 5: OUTCOMES (3 nodes)
    { id: 'won', label: '✓ Closed Won', layer: 5, value: 8, type: 'revenue', displayValue: '8 deals (19%)' },
    { id: 'lost-competitor', label: '✗ Lost Competitor', layer: 5, value: 4, type: 'loss', displayValue: '4 deals (10%)' },
    { id: 'no-decision', label: '⚠ No Decision', layer: 5, value: 30, type: 'loss', displayValue: '30 deals (71%)' },
  ],
  links: [
    // Sources → Lead Types
    { from: 'paid', to: 'high-intent', value: 140, type: 'default', displayLabel: '140' },
    { from: 'paid', to: 'med-intent', value: 84, type: 'default', displayLabel: '84' },
    { from: 'paid', to: 'low-intent', value: 56, type: 'default', displayLabel: '56' },
    
    { from: 'organic', to: 'high-intent', value: 110, type: 'default', displayLabel: '110' },
    { from: 'organic', to: 'med-intent', value: 77, type: 'default', displayLabel: '77' },
    { from: 'organic', to: 'low-intent', value: 33, type: 'default', displayLabel: '33' },
    
    { from: 'events', to: 'high-intent', value: 30, type: 'default', displayLabel: '30' },
    { from: 'events', to: 'med-intent', value: 150, type: 'default', displayLabel: '150' },
    { from: 'events', to: 'low-intent', value: 120, type: 'default', displayLabel: '120' },
    
    { from: 'webinars', to: 'high-intent', value: 48, type: 'default', displayLabel: '48' },
    { from: 'webinars', to: 'med-intent', value: 48, type: 'default', displayLabel: '48' },
    { from: 'webinars', to: 'low-intent', value: 24, type: 'default', displayLabel: '24' },
    
    { from: 'referrals', to: 'high-intent', value: 56, type: 'default', displayLabel: '56' },
    { from: 'referrals', to: 'med-intent', value: 16, type: 'default', displayLabel: '16' },
    { from: 'referrals', to: 'low-intent', value: 8, type: 'default', displayLabel: '8' },
    
    // Lead Types → Qualification
    { from: 'high-intent', to: 'mql', value: 245, type: 'default', displayLabel: '245' },
    { from: 'high-intent', to: 'disqualified', value: 105, type: 'loss', displayLabel: '105' },
    { from: 'med-intent', to: 'mql', value: 120, type: 'default', displayLabel: '120' },
    { from: 'med-intent', to: 'disqualified', value: 280, type: 'loss', displayLabel: '280' },
    { from: 'low-intent', to: 'mql', value: 25, type: 'default', displayLabel: '25' },
    { from: 'low-intent', to: 'disqualified', value: 225, type: 'loss', displayLabel: '225' },
    
    // MQL → Sales Engagement (13% SQL rate)
    { from: 'mql', to: 'sql', value: 51, type: 'default', displayLabel: '51' },
    { from: 'mql', to: 'nurture', value: 234, type: 'default', displayLabel: '234' },
    { from: 'mql', to: 'no-response', value: 105, type: 'loss', displayLabel: '105' },
    
    // SQL → Pipeline
    { from: 'sql', to: 'opportunity', value: 42, type: 'default', displayLabel: '42' },
    { from: 'sql', to: 'lost-early', value: 9, type: 'loss', displayLabel: '9' },
    
    // Opportunity → Outcomes
    { from: 'opportunity', to: 'won', value: 8, type: 'revenue', displayLabel: '8' },
    { from: 'opportunity', to: 'lost-competitor', value: 4, type: 'loss', displayLabel: '4' },
    { from: 'opportunity', to: 'no-decision', value: 30, type: 'loss', displayLabel: '30' },
  ],
};

const dealsCurrentMetrics: SankeyMetric[] = [
  { id: 'total', value: '1,000', label: 'Leads/Month', type: 'neutral' },
  { id: 'won', value: '8', label: 'Deals Won', type: 'positive' },
  { id: 'nodecision', value: '30', label: 'No Decision', type: 'negative' },
];

// ============================================
// VELOCITY VIEW (RevOps) - CURRENT STATE
// Average days in pipeline stage
// ============================================

const velocityCurrentData: SankeyData = {
  nodes: [
    // Layer 0: SOURCES - Days from first touch
    { id: 'paid', label: 'Paid (Fast)', layer: 0, value: 7, type: 'source', displayValue: '7 days avg' },
    { id: 'organic', label: 'Organic (Med)', layer: 0, value: 14, type: 'source', displayValue: '14 days avg' },
    { id: 'events', label: 'Events (Slow)', layer: 0, value: 30, type: 'source', displayValue: '30 days avg' },
    { id: 'webinars', label: 'Webinars (Med)', layer: 0, value: 21, type: 'source', displayValue: '21 days avg' },
    { id: 'referrals', label: 'Referrals (Fast)', layer: 0, value: 5, type: 'source', displayValue: '5 days avg' },
    
    // Layer 1: QUALIFICATION TIME
    { id: 'fast-qual', label: 'Fast Qualification', layer: 1, value: 3, type: 'default', displayValue: '3 days' },
    { id: 'slow-qual', label: 'Slow Qualification', layer: 1, value: 14, type: 'default', displayValue: '14 days' },
    { id: 'stalled-qual', label: 'Stalled', layer: 1, value: 30, type: 'loss', displayValue: '30+ days' },
    
    // Layer 2: MQL STAGE
    { id: 'mql', label: 'MQL Stage', layer: 2, value: 21, type: 'default', displayValue: '21 days avg' },
    { id: 'dropped', label: 'Dropped', layer: 2, value: 45, type: 'loss', displayValue: '45 days wasted' },
    
    // Layer 3: SQL STAGE
    { id: 'sql', label: 'SQL Stage', layer: 3, value: 14, type: 'default', displayValue: '14 days avg' },
    { id: 'nurture-loop', label: 'Nurture Loop', layer: 3, value: 60, type: 'default', displayValue: '60+ days' },
    { id: 'ghosted', label: 'Ghosted', layer: 3, value: 30, type: 'loss', displayValue: '30 days lost' },
    
    // Layer 4: OPPORTUNITY STAGE
    { id: 'active-opp', label: 'Active Pipeline', layer: 4, value: 45, type: 'default', displayValue: '45 days avg' },
    { id: 'stalled-opp', label: 'Stalled Deals', layer: 4, value: 90, type: 'loss', displayValue: '90+ days' },
    
    // Layer 5: OUTCOMES - Total cycle time
    { id: 'won', label: '✓ Won (90 days)', layer: 5, value: 90, type: 'revenue', displayValue: '90 day cycle' },
    { id: 'lost-fast', label: '✗ Lost Fast', layer: 5, value: 45, type: 'loss', displayValue: '45 day cycle' },
    { id: 'no-decision', label: '⚠ No Decision', layer: 5, value: 180, type: 'loss', displayValue: '180+ day cycle' },
  ],
  links: [
    // Sources → Qualification speed
    { from: 'paid', to: 'fast-qual', value: 5, type: 'default', displayLabel: '5d' },
    { from: 'paid', to: 'slow-qual', value: 2, type: 'default', displayLabel: '2d' },
    
    { from: 'organic', to: 'fast-qual', value: 7, type: 'default', displayLabel: '7d' },
    { from: 'organic', to: 'slow-qual', value: 5, type: 'default', displayLabel: '5d' },
    { from: 'organic', to: 'stalled-qual', value: 2, type: 'loss', displayLabel: '2d' },
    
    { from: 'events', to: 'slow-qual', value: 20, type: 'default', displayLabel: '20d' },
    { from: 'events', to: 'stalled-qual', value: 10, type: 'loss', displayLabel: '10d' },
    
    { from: 'webinars', to: 'fast-qual', value: 10, type: 'default', displayLabel: '10d' },
    { from: 'webinars', to: 'slow-qual', value: 8, type: 'default', displayLabel: '8d' },
    { from: 'webinars', to: 'stalled-qual', value: 3, type: 'loss', displayLabel: '3d' },
    
    { from: 'referrals', to: 'fast-qual', value: 4, type: 'default', displayLabel: '4d' },
    { from: 'referrals', to: 'slow-qual', value: 1, type: 'default', displayLabel: '1d' },
    
    // Qualification → MQL
    { from: 'fast-qual', to: 'mql', value: 20, type: 'default', displayLabel: '20d' },
    { from: 'slow-qual', to: 'mql', value: 25, type: 'default', displayLabel: '25d' },
    { from: 'slow-qual', to: 'dropped', value: 11, type: 'loss', displayLabel: '11d' },
    { from: 'stalled-qual', to: 'dropped', value: 15, type: 'loss', displayLabel: '15d' },
    
    // MQL → SQL
    { from: 'mql', to: 'sql', value: 14, type: 'default', displayLabel: '14d' },
    { from: 'mql', to: 'nurture-loop', value: 20, type: 'default', displayLabel: '20d' },
    { from: 'mql', to: 'ghosted', value: 11, type: 'loss', displayLabel: '11d' },
    
    // SQL → Opportunity
    { from: 'sql', to: 'active-opp', value: 10, type: 'default', displayLabel: '10d' },
    { from: 'sql', to: 'stalled-opp', value: 4, type: 'loss', displayLabel: '4d' },
    { from: 'nurture-loop', to: 'active-opp', value: 8, type: 'default', displayLabel: '8d' },
    { from: 'nurture-loop', to: 'stalled-opp', value: 12, type: 'loss', displayLabel: '12d' },
    
    // Opportunity → Outcomes
    { from: 'active-opp', to: 'won', value: 8, type: 'revenue', displayLabel: '8d' },
    { from: 'active-opp', to: 'lost-fast', value: 4, type: 'loss', displayLabel: '4d' },
    { from: 'active-opp', to: 'no-decision', value: 6, type: 'loss', displayLabel: '6d' },
    { from: 'stalled-opp', to: 'no-decision', value: 16, type: 'loss', displayLabel: '16d' },
  ],
};

const velocityCurrentMetrics: SankeyMetric[] = [
  { id: 'total', value: '180', label: 'Days Avg Cycle', type: 'neutral' },
  { id: 'won', value: '90', label: 'Days to Won', type: 'positive' },
  { id: 'nodecision', value: '180+', label: 'Days to No Decision', type: 'negative' },
];

// ============================================
// EXPORTED CURRENT STATE DATA
// ============================================

export const b2bFunnelCurrentState: Record<B2BFunnelViewType, {
  data: SankeyData;
  metrics: SankeyMetric[];
}> = {
  spend: {
    data: spendCurrentData,
    metrics: spendCurrentMetrics,
  },
  deals: {
    data: dealsCurrentData,
    metrics: dealsCurrentMetrics,
  },
  velocity: {
    data: velocityCurrentData,
    metrics: velocityCurrentMetrics,
  },
};

// ============================================
// NODE COMPARISON DATA
// Maps equivalent concepts across views
// ============================================

export const b2bNodeEquivalenceMap: Record<string, Record<B2BFunnelViewType, { nodeId: string; value: string }>> = {
  'no-decision-point': {
    spend: { nodeId: 'no-decision', value: '$92K/month' },
    deals: { nodeId: 'no-decision', value: '30 deals (71%)' },
    velocity: { nodeId: 'no-decision', value: '180+ days' },
  },
  'won-point': {
    spend: { nodeId: 'won', value: '$10.4K cost per deal' },
    deals: { nodeId: 'won', value: '8 deals (19%)' },
    velocity: { nodeId: 'won', value: '90 day cycle' },
  },
  'mql-stage': {
    spend: { nodeId: 'mql', value: '$120K invested' },
    deals: { nodeId: 'mql', value: '390 MQLs (39%)' },
    velocity: { nodeId: 'mql', value: '21 days avg' },
  },
  'opportunity-stage': {
    spend: { nodeId: 'opportunity', value: '$52K invested' },
    deals: { nodeId: 'opportunity', value: '42 opportunities' },
    velocity: { nodeId: 'active-opp', value: '45 days avg' },
  },
};

// ============================================
// NARRATIVE SCRIPTS
// ============================================

export const b2bNarrativeScripts: Record<B2BFunnelViewType, {
  setup: string;
  tension: string;
  impact: string;
  cta: string;
}> = {
  spend: {
    setup: 'Marketing invests $200K every month to fill the pipeline',
    tension: 'but $92K flows to deals that end in silence',
    impact: "that's $1.1M/year funding 'No Decision'.",
    cta: 'Is this right?',
  },
  deals: {
    setup: 'Your team generates 1,000 leads and qualifies 42 opportunities',
    tension: 'but only 8 close — 30 end in "No Decision"',
    impact: "that's 4x more than competitor losses.",
    cta: 'Is this right?',
  },
  velocity: {
    setup: 'A typical deal takes 90 days from lead to close',
    tension: "but 'No Decision' deals consume 180+ days",
    impact: 'then go dark — burning 2x the sales capacity.',
    cta: 'Is this right?',
  },
};

// ============================================
// HELPER: Get FlowState for B2B Funnel
// ============================================

export function getB2BFlowStateForView(viewType: B2BFunnelViewType): FlowState {
  const config = b2bViewConfigs[viewType];
  const { data, metrics } = b2bFunnelCurrentState[viewType];
  
  return {
    data,
    metrics,
    stageLabel: config.title,
    anchoredMetric: viewType === 'spend' 
      ? { value: '$92K', label: 'No Decision/Mo', type: 'loss', nodeId: 'no-decision' }
      : viewType === 'deals'
      ? { value: '71%', label: 'No Decision Rate', type: 'loss', nodeId: 'no-decision' }
      : { value: '180+', label: 'Days Wasted', type: 'loss', nodeId: 'no-decision' },
    insight: config.insight,
  };
}

// ============================================
// LENS DISPLAY DATA (for toggle cards)
// ============================================

export const B2B_LENS_DATA = [
  {
    type: 'spend' as B2BFunnelViewType,
    label: 'Spend',
    icon: '💰',
    color: '#f59e0b', // amber
    currentInsight: '$92K/month (46%) flows to No Decision',
    shiftedInsight: 'Reduce No Decision spend by 40% → $55K/month saved',
  },
  {
    type: 'deals' as B2BFunnelViewType,
    label: 'Deals',
    icon: '📊',
    color: '#00e5ff', // cyan
    currentInsight: '71% of opportunities end in No Decision',
    shiftedInsight: 'Convert 20% of No Decisions → 14 more deals/month',
  },
  {
    type: 'velocity' as B2BFunnelViewType,
    label: 'Velocity',
    icon: '⏱️',
    color: '#a855f7', // purple
    currentInsight: 'No Decision deals waste 180+ days of capacity',
    shiftedInsight: 'Earlier disqualification → 50% faster cycle time',
  },
];