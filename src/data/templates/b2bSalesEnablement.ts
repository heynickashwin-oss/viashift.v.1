import { SankeyData, SankeyMetric, AnchoredMetric, ValueFormat } from '../../components/sankeyflowv3';

// ============================================
// TYPES
// ============================================

export interface SightlineContent {
  line1: string;
  metric: string;
  line2: string;
}

export interface NodeCallout {
  nodeId: string;
  text: string;
  emphasis?: 'pulse' | 'glow';
}

export interface NarrativePhase {
  header: string;
  nodeCallouts?: NodeCallout[];
}

export interface NarrativeScript {
  setup: NarrativePhase;
  bleed: NarrativePhase;
  shift: NarrativePhase;
  result: NarrativePhase;
}

export interface ViewerConfig {
  stageLabels: string[];
  sightline: SightlineContent;
  narrative: NarrativeScript;
}

export type ViewerType = 'default' | 'cfo' | 'sales' | 'ops';

export interface TransformationTemplateData {
  id: string;
  name: string;
  description: string;
  valueFormat: ValueFormat;
  
  // Per-viewer configuration
  viewerConfig: Record<ViewerType, ViewerConfig>;
  
  // Flow data (shared across viewers)
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
    { id: 'seller-effort', label: 'Seller Effort', layer: 0, value: 100, y: 0.5, type: 'source', displayValue: '100%' },
    
    // Layer 1: Delivery Method
    { id: 'static-deck', label: 'Static Deck', layer: 1, value: 60, y: 0.35, type: 'default', displayValue: '60%' },
    { id: 'generic-email', label: 'Generic Email', layer: 1, value: 40, y: 0.65, type: 'default', displayValue: '40%' },
    
    // Layer 2: Distribution
    { id: 'prospect-inbox', label: 'Prospect Inbox', layer: 2, value: 50, y: 0.3, type: 'default', displayValue: '50%' },
    { id: 'spam-ignored', label: 'Spam / Ignored', layer: 2, value: 50, y: 0.7, type: 'loss', displayValue: '50%' },
    
    // Layer 3: Outcomes
    { id: 'opened-unknown', label: 'Opened? Unknown', layer: 3, value: 25, y: 0.2, type: 'default', displayValue: '25%' },
    { id: 'no-response', label: 'No Response', layer: 3, value: 75, y: 0.65, type: 'loss', displayValue: '75%' },
  ],
  links: [
    // Seller effort splits
    { from: 'seller-effort', to: 'static-deck', value: 60, type: 'default', displayLabel: '60%' },
    { from: 'seller-effort', to: 'generic-email', value: 40, type: 'default', displayLabel: '40%' },
    
    // Deck and email outcomes
    { from: 'static-deck', to: 'prospect-inbox', value: 35, type: 'default' },
    { from: 'static-deck', to: 'spam-ignored', value: 25, type: 'loss', displayLabel: '-25%' },
    { from: 'generic-email', to: 'prospect-inbox', value: 15, type: 'default' },
    { from: 'generic-email', to: 'spam-ignored', value: 25, type: 'loss', displayLabel: '-25%' },
    
    // Inbox outcomes
    { from: 'prospect-inbox', to: 'opened-unknown', value: 25, type: 'default' },
    { from: 'prospect-inbox', to: 'no-response', value: 25, type: 'loss', displayLabel: '-25%' },
    
    // Spam leads to no response
    { from: 'spam-ignored', to: 'no-response', value: 50, type: 'loss', displayLabel: '-50%' },
  ],
};

// ============================================
// SHIFTED STATE: "The Engaged Pipeline"
// ============================================

const shiftedStateData: SankeyData = {
  nodes: [
    // Layer 0: Input
    { id: 'seller-effort', label: 'Seller Effort', layer: 0, value: 100, y: 0.5, type: 'source', displayValue: '100%' },
    
    // Layer 1: viashift
    { id: 'viashift', label: 'viashift', layer: 1, value: 100, y: 0.5, type: 'solution', displayValue: '100%' },
    
    // Layer 2: Champion Distribution
    { id: 'champion-views', label: 'Champion Views', layer: 2, value: 94, y: 0.3, type: 'default', displayValue: '94%' },
    { id: 'internal-shares', label: 'Internal Shares', layer: 2, value: 70, y: 0.65, type: 'new', displayValue: '70%' },
    
    // Layer 3: Stakeholder Engagement
    { id: 'finance-engaged', label: 'Finance Engaged', layer: 3, value: 30, y: 0.15, type: 'default', displayValue: '30%' },
    { id: 'ops-engaged', label: 'Ops Engaged', layer: 3, value: 25, y: 0.35, type: 'default', displayValue: '25%' },
    { id: 'vp-engaged', label: 'VP Engaged', layer: 3, value: 35, y: 0.55, type: 'revenue', displayValue: '35%' },
    { id: 'meeting-booked', label: 'Meeting Booked', layer: 3, value: 45, y: 0.8, type: 'revenue', displayValue: '45%' },
  ],
  links: [
    // Seller creates Shift
    { from: 'seller-effort', to: 'viashift', value: 100, type: 'default' },

    // Shift gets engagement
    { from: 'viashift', to: 'champion-views', value: 94, type: 'default', displayLabel: '94%' },
    { from: 'viashift', to: 'internal-shares', value: 70, type: 'new', displayLabel: '+70%' },
    
    // Champion views lead to stakeholder engagement
    { from: 'champion-views', to: 'finance-engaged', value: 30, type: 'default' },
    { from: 'champion-views', to: 'ops-engaged', value: 25, type: 'default' },
    { from: 'champion-views', to: 'vp-engaged', value: 35, type: 'revenue', displayLabel: '+35%' },
    
    // Internal shares lead to meetings
    { from: 'internal-shares', to: 'meeting-booked', value: 45, type: 'revenue', displayLabel: '+45%' },
  ],
};

// ============================================
// VIEWER CONFIGURATIONS
// ============================================

const defaultViewerConfig: ViewerConfig = {
  stageLabels: ['Effort', 'Delivery', 'Distribution', 'Outcome'],
  sightline: {
    line1: 'What if [company] could recover',
    metric: '$1.6M',
    line2: 'from deals dying in silence?',
  },
  narrative: {
    setup: {
      header: 'Where your pipeline goes today',
    },
    bleed: {
      header: 'Where deals go silent',
      nodeCallouts: [
        { nodeId: 'no-response', text: '75% never hear back', emphasis: 'pulse' },
        { nodeId: 'spam-ignored', text: 'Lost before it satisfies', emphasis: 'glow' },
      ],
    },
    shift: {
      header: 'What if you could see who engages?',
      nodeCallouts: [
        { nodeId: 'champion-views', text: '94% actually view it', emphasis: 'glow' },
        { nodeId: 'internal-shares', text: 'They share it internally', emphasis: 'glow' },
      ],
    },
    result: {
      header: 'Visibility changes everything',
    },
  },
};

const cfoViewerConfig: ViewerConfig = {
  stageLabels: ['Investment', 'Allocation', 'Efficiency', 'Return'],
  sightline: {
    line1: 'What if [company] could recover',
    metric: '$1.6M',
    line2: 'from deals dying in silence?',
  },
  narrative: {
    setup: {
      header: 'Where your sales investment goes',
    },
    bleed: {
      header: 'Where budget leaks to silence',
      nodeCallouts: [
        { nodeId: 'no-response', text: '$1.6M lost annually', emphasis: 'pulse' },
        { nodeId: 'spam-ignored', text: 'Zero ROI visibility', emphasis: 'glow' },
      ],
    },
    shift: {
      header: 'What if you could measure engagement?',
      nodeCallouts: [
        { nodeId: 'champion-views', text: 'Track every dollar', emphasis: 'glow' },
        { nodeId: 'vp-engaged', text: 'See decision-maker activity', emphasis: 'glow' },
      ],
    },
    result: {
      header: 'ROI you can actually see',
    },
  },
};

const salesViewerConfig: ViewerConfig = {
  stageLabels: ['Effort', 'Outreach', 'Response', 'Outcome'],
  sightline: {
    line1: 'What if [company] could close',
    metric: '40% more',
    line2: 'of their pipeline?',
  },
  narrative: {
    setup: {
      header: 'Where your deals go today',
    },
    bleed: {
      header: 'Where deals go to die',
      nodeCallouts: [
        { nodeId: 'no-response', text: '75% ghost you', emphasis: 'pulse' },
        { nodeId: 'opened-unknown', text: 'Did they even open it?', emphasis: 'glow' },
      ],
    },
    shift: {
      header: 'What if you knew who was ready?',
      nodeCallouts: [
        { nodeId: 'vp-engaged', text: 'VP is looking right now', emphasis: 'glow' },
        { nodeId: 'meeting-booked', text: 'Auto-book when ready', emphasis: 'glow' },
      ],
    },
    result: {
      header: 'Close what you can see',
    },
  },
};

const opsViewerConfig: ViewerConfig = {
  stageLabels: ['Input', 'Process', 'Handoff', 'Output'],
  sightline: {
    line1: 'What if [company] could save',
    metric: '20 hours',
    line2: 'per rep per month?',
  },
  narrative: {
    setup: {
      header: 'Where the process breaks down',
    },
    bleed: {
      header: 'Where time disappears',
      nodeCallouts: [
        { nodeId: 'static-deck', text: '4 hours per deck', emphasis: 'pulse' },
        { nodeId: 'generic-email', text: 'Copy-paste-pray', emphasis: 'glow' },
      ],
    },
    shift: {
      header: 'What if it was automated?',
      nodeCallouts: [
        { nodeId: 'internal-shares', text: 'Auto-routes to stakeholders', emphasis: 'glow' },
        { nodeId: 'meeting-booked', text: 'Calendar syncs automatically', emphasis: 'glow' },
      ],
    },
    result: {
      header: '20 hours back per rep',
    },
  },
};

// ============================================
// TEMPLATE EXPORT
// ============================================

export const b2bSalesEnablementTemplate: TransformationTemplateData = {
  id: 'b2b-sales-enablement',
  name: 'B2B Sales Enablement',
  description: 'See how deals die in silence vs. engaged pipeline visibility',
  valueFormat: 'percent',

  viewerConfig: {
    default: defaultViewerConfig,
    cfo: cfoViewerConfig,
    sales: salesViewerConfig,
    ops: opsViewerConfig,
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