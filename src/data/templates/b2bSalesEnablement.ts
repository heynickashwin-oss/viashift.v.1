import { SankeyData, SankeyMetric, AnchoredMetric, ValueFormat } from '../../components/sankeyflowv3';

export interface SightlineContent {
  line1: string;
  metric: string;
  line2: string;
}

export interface TransformationTemplateData {
  id: string;
  name: string;
  description: string;
  stageLabels: string[];
  valueFormat: ValueFormat; 
  sightlines: {
    finance: SightlineContent;
    ops: SightlineContent;
    sales: SightlineContent;
    all: SightlineContent;
  };
  currentState: {
    data: SankeyData;
    metrics: SankeyMetric[];
    stageLabel: string;
    anchoredMetric?: AnchoredMetric;
  };
  shiftedState: {
    data: SankeyData;
    metrics: SankeyMetric[];
    stageLabel: string;
    anchoredMetric?: AnchoredMetric;
    insight: string;
  };
}

// ============================================
// CURRENT STATE: "The Proposal Black Hole"
// ============================================

const currentStateData: SankeyData = {
  nodes: [
    // Layer 0: Input
    { id: 'seller-effort', label: 'Seller Effort', layer: 0, value: 100, y: 0.5, type: 'source' },
    
    // Layer 1: Delivery Method
    { id: 'static-deck', label: 'Static Deck', layer: 1, value: 60, y: 0.35, type: 'default' },
    { id: 'generic-email', label: 'Generic Email', layer: 1, value: 40, y: 0.65, type: 'default' },
    
    // Layer 2: Distribution
    { id: 'prospect-inbox', label: 'Prospect Inbox', layer: 2, value: 50, y: 0.3, type: 'default' },
    { id: 'spam-ignored', label: 'Spam / Ignored', layer: 2, value: 50, y: 0.7, type: 'loss' },
    
    // Layer 3: Outcomes
    { id: 'opened-unknown', label: 'Opened? Unknown', layer: 3, value: 25, y: 0.2, type: 'default' },
    { id: 'no-response', label: 'No Response', layer: 3, value: 75, y: 0.65, type: 'loss' },
  ],
  links: [
    // Seller effort splits
    { from: 'seller-effort', to: 'static-deck', value: 60, type: 'default' },
    { from: 'seller-effort', to: 'generic-email', value: 40, type: 'default' },
    
    // Deck and email outcomes
    { from: 'static-deck', to: 'prospect-inbox', value: 35, type: 'default' },
    { from: 'static-deck', to: 'spam-ignored', value: 25, type: 'loss' },
    { from: 'generic-email', to: 'prospect-inbox', value: 15, type: 'default' },
    { from: 'generic-email', to: 'spam-ignored', value: 25, type: 'loss' },
    
    // Inbox outcomes
    { from: 'prospect-inbox', to: 'opened-unknown', value: 25, type: 'default' },
    { from: 'prospect-inbox', to: 'no-response', value: 25, type: 'loss' },
    
    // Spam leads to no response
    { from: 'spam-ignored', to: 'no-response', value: 50, type: 'loss' },
  ],
};

// ============================================
// SHIFTED STATE: "The Engaged Pipeline"
// ============================================

const shiftedStateData: SankeyData = {
  nodes: [
    // Layer 0: Input
    { id: 'viashift', label: 'viashift', layer: 1, value: 100, y: 0.5, type: 'solution' },
    
    // Layer 1: Parallax
    { id: 'parallax-shift', label: 'Parallax Shift', layer: 1, value: 100, y: 0.5, type: 'solution' },
    
    // Layer 2: Champion Distribution
    { id: 'champion-views', label: 'Champion Views', layer: 2, value: 94, y: 0.3, type: 'default' },
    { id: 'internal-shares', label: 'Internal Shares', layer: 2, value: 70, y: 0.65, type: 'new' },
    
    // Layer 3: Stakeholder Engagement
    { id: 'finance-engaged', label: 'Finance Engaged', layer: 3, value: 30, y: 0.15, type: 'default' },
    { id: 'ops-engaged', label: 'Ops Engaged', layer: 3, value: 25, y: 0.35, type: 'default' },
    { id: 'vp-engaged', label: 'VP Engaged', layer: 3, value: 35, y: 0.55, type: 'revenue' },
    { id: 'meeting-booked', label: 'Meeting Booked', layer: 3, value: 45, y: 0.8, type: 'revenue' },
  ],
  links: [
    // Seller creates Shift
    { from: 'seller-effort', to: 'viashift', value: 100, type: 'default' },

// Shift gets engagement
{ from: 'viashift', to: 'champion-views', value: 94, type: 'default' },
{ from: 'viashift', to: 'internal-shares', value: 70, type: 'new' },
    
    // Champion views lead to stakeholder engagement
    { from: 'champion-views', to: 'finance-engaged', value: 30, type: 'default' },
    { from: 'champion-views', to: 'ops-engaged', value: 25, type: 'default' },
    { from: 'champion-views', to: 'vp-engaged', value: 35, type: 'revenue' },
    
    // Internal shares lead to meetings
    { from: 'internal-shares', to: 'meeting-booked', value: 45, type: 'revenue' },
  ],
};

export const b2bSalesEnablementTemplate: TransformationTemplateData = {
  id: 'b2b-sales-enablement',
  name: 'B2B Sales Enablement',
  description: 'See how deals die in silence vs. engaged pipeline visibility',
  stageLabels: ['Effort', 'Delivery', 'Distribution', 'Outcome'],
  valueFormat: 'percent', 

  sightlines: {
    finance: {
      line1: 'What if [company] could recover',
      metric: '$1.6M',
      line2: 'from deals dying in silence?',
    },
    ops: {
      line1: 'What if [company] could save',
      metric: '20 hours',
      line2: 'per rep per month?',
    },
    sales: {
      line1: 'What if [company] could close',
      metric: '40% more',
      line2: 'of their pipeline?',
    },
    all: {
      line1: 'What if [company] could recover',
      metric: '$1.6M',
      line2: 'from deals dying in silence?',
    },
  },

  currentState: {
    data: currentStateData,
    metrics: [
      { id: 'm1', value: '40-60%', label: 'Deals Lost to "No Decision"', type: 'negative' },
      { id: 'm2', value: '6.8', label: 'Stakeholders Per Deal', type: 'neutral' },
      { id: 'm3', value: '0%', label: 'Visibility Into Engagement', type: 'negative' },
    ],
    stageLabel: 'Current State',
    anchoredMetric: {
      value: '0%',
      label: 'Visibility',
      type: 'loss',
      nodeId: 'opened-unknown',
    },
  },

  shiftedState: {
    data: shiftedStateData,
    metrics: [
      { id: 'm1', value: '94%', label: 'Share View Rate', type: 'positive' },
      { id: 'm2', value: '2.3 hrs', label: 'Avg Response Time', type: 'positive' },
      { id: 'm3', value: '3.2x', label: 'Stakeholder Reach', type: 'positive' },
    ],
  stageLabel: 'With viashift',
    anchoredMetric: {
      value: '+340%',
      label: 'Engagement',
      type: 'gain',
      nodeId: 'viashift',
    },
    insight: '[company] could recover $1.6M in annual revenue by replacing static decks with viashift that shows exactly who engages and when.',
  },
};

export default b2bSalesEnablementTemplate;