import { SankeyData, SankeyMetric, AnchoredMetric } from '../../components/sankeyflowv3';
import { TransformationTemplateData, ViewerConfig } from './b2bSalesEnablement';

// ============================================
// SALES BUDGET EFFICIENCY
// Use case: "Where does your sales budget actually go?"
// ============================================

// ============================================
// CURRENT STATE: "Budget Leakage"
// ============================================

const currentStateData: SankeyData = {
  nodes: [
    // Layer 0: Budget Allocation
    { id: 'annual-budget', label: 'Annual Sales Budget', layer: 0, value: 100, y: 0.5, type: 'source', displayValue: '$10M' },
    
    // Layer 1: Spend Categories
    { id: 'rep-salaries', label: 'Rep Salaries', layer: 1, value: 55, y: 0.25, type: 'default', displayValue: '$5.5M' },
    { id: 'tools-tech', label: 'Tools & Tech', layer: 1, value: 25, y: 0.55, type: 'default', displayValue: '$2.5M' },
    { id: 'training', label: 'Training & Enablement', layer: 1, value: 20, y: 0.8, type: 'default', displayValue: '$2M' },
    
    // Layer 2: Activity Output
    { id: 'deals-worked', label: 'Deals Worked', layer: 2, value: 60, y: 0.3, type: 'default', displayValue: '60%' },
    { id: 'admin-overhead', label: 'Admin Overhead', layer: 2, value: 40, y: 0.7, type: 'loss', displayValue: '40%' },
    
    // Layer 3: Outcomes
    { id: 'closed-won', label: 'Closed Won', layer: 3, value: 20, y: 0.15, type: 'revenue', displayValue: '$2M' },
    { id: 'closed-lost', label: 'Closed Lost', layer: 3, value: 15, y: 0.4, type: 'loss', displayValue: '$1.5M' },
    { id: 'no-decision', label: 'No Decision', layer: 3, value: 65, y: 0.7, type: 'loss', displayValue: '$6.5M' },
  ],
  links: [
    // Budget allocation
    { from: 'annual-budget', to: 'rep-salaries', value: 55, type: 'default' },
    { from: 'annual-budget', to: 'tools-tech', value: 25, type: 'default' },
    { from: 'annual-budget', to: 'training', value: 20, type: 'default' },
    
    // Salaries to output
    { from: 'rep-salaries', to: 'deals-worked', value: 35, type: 'default' },
    { from: 'rep-salaries', to: 'admin-overhead', value: 20, type: 'loss', displayLabel: '-20%' },
    
    // Tools to output
    { from: 'tools-tech', to: 'deals-worked', value: 15, type: 'default' },
    { from: 'tools-tech', to: 'admin-overhead', value: 10, type: 'loss', displayLabel: '-10%' },
    
    // Training to output
    { from: 'training', to: 'deals-worked', value: 10, type: 'default' },
    { from: 'training', to: 'admin-overhead', value: 10, type: 'loss', displayLabel: '-10%' },
    
    // Deal outcomes
    { from: 'deals-worked', to: 'closed-won', value: 20, type: 'revenue', displayLabel: '+$2M' },
    { from: 'deals-worked', to: 'closed-lost', value: 15, type: 'loss', displayLabel: '-$1.5M' },
    { from: 'deals-worked', to: 'no-decision', value: 25, type: 'loss', displayLabel: '-$2.5M' },
    
    // Admin overhead to no decision
    { from: 'admin-overhead', to: 'no-decision', value: 40, type: 'loss', displayLabel: '-$4M' },
  ],
};

// ============================================
// SHIFTED STATE: "Recovered Revenue"
// ============================================

const shiftedStateData: SankeyData = {
  nodes: [
    // Layer 0: Same Budget
    { id: 'annual-budget', label: 'Annual Sales Budget', layer: 0, value: 100, y: 0.5, type: 'source', displayValue: '$10M' },
    
    // Layer 1: Optimized Allocation
    { id: 'rep-salaries', label: 'Rep Salaries', layer: 1, value: 55, y: 0.25, type: 'default', displayValue: '$5.5M' },
    { id: 'tools-viashift', label: 'Tools + viashift', layer: 1, value: 27, y: 0.55, type: 'solution', displayValue: '$2.7M' },
    { id: 'training', label: 'Training', layer: 1, value: 18, y: 0.8, type: 'default', displayValue: '$1.8M' },
    
    // Layer 2: Higher Efficiency
    { id: 'deals-worked', label: 'Deals Worked', layer: 2, value: 75, y: 0.25, type: 'default', displayValue: '75%' },
    { id: 'engaged-pipeline', label: 'Engaged Pipeline', layer: 2, value: 60, y: 0.55, type: 'new', displayValue: '60%' },
    { id: 'reduced-overhead', label: 'Reduced Overhead', layer: 2, value: 15, y: 0.85, type: 'default', displayValue: '15%' },
    
    // Layer 3: Better Outcomes
    { id: 'closed-won', label: 'Closed Won', layer: 3, value: 38, y: 0.15, type: 'revenue', displayValue: '$3.8M' },
    { id: 'closed-lost', label: 'Closed Lost', layer: 3, value: 20, y: 0.45, type: 'loss', displayValue: '$2M' },
    { id: 'active-nurture', label: 'Active Nurture', layer: 3, value: 27, y: 0.7, type: 'default', displayValue: '$2.7M' },
    { id: 'no-decision', label: 'No Decision', layer: 3, value: 15, y: 0.9, type: 'loss', displayValue: '$1.5M' },
  ],
  links: [
    // Budget allocation (slightly optimized)
    { from: 'annual-budget', to: 'rep-salaries', value: 55, type: 'default' },
    { from: 'annual-budget', to: 'tools-viashift', value: 27, type: 'default' },
    { from: 'annual-budget', to: 'training', value: 18, type: 'default' },
    
    // Higher efficiency from viashift
    { from: 'rep-salaries', to: 'deals-worked', value: 40, type: 'default' },
    { from: 'rep-salaries', to: 'reduced-overhead', value: 15, type: 'default' },
    
    { from: 'tools-viashift', to: 'deals-worked', value: 20, type: 'default' },
    { from: 'tools-viashift', to: 'engaged-pipeline', value: 7, type: 'new', displayLabel: '+7%' },
    
    { from: 'training', to: 'deals-worked', value: 15, type: 'default' },
    { from: 'training', to: 'engaged-pipeline', value: 3, type: 'new' },
    
    // Engaged pipeline creates visibility
    { from: 'deals-worked', to: 'engaged-pipeline', value: 50, type: 'new', displayLabel: '+50%' },
    
    // Better outcomes
    { from: 'engaged-pipeline', to: 'closed-won', value: 28, type: 'revenue', displayLabel: '+$2.8M' },
    { from: 'engaged-pipeline', to: 'active-nurture', value: 22, type: 'default' },
    { from: 'engaged-pipeline', to: 'closed-lost', value: 10, type: 'loss' },
    
    { from: 'deals-worked', to: 'closed-won', value: 10, type: 'revenue', displayLabel: '+$1M' },
    { from: 'deals-worked', to: 'closed-lost', value: 10, type: 'loss' },
    { from: 'deals-worked', to: 'no-decision', value: 5, type: 'loss' },
    
    { from: 'active-nurture', to: 'no-decision', value: 5, type: 'loss' },
    { from: 'reduced-overhead', to: 'no-decision', value: 5, type: 'loss' },
  ],
};

// ============================================
// VIEWER CONFIGURATIONS
// ============================================

const defaultViewerConfig: ViewerConfig = {
  stageLabels: ['Budget', 'Allocation', 'Activity', 'Return'],
  sightline: {
    line1: 'What if [company] could recover',
    metric: '$2.4M',
    line2: 'from "no decision" pipeline leakage?',
  },
  narrative: {
    setup: {
      header: 'Where your sales budget goes',
    },
    bleed: {
      header: 'Where investment disappears',
      nodeCallouts: [
        { nodeId: 'no-decision', text: '$6.5M stuck in limbo', emphasis: 'pulse' },
        { nodeId: 'admin-overhead', text: '40% lost to admin', emphasis: 'glow' },
      ],
    },
    shift: {
      header: 'What if you could redirect that spend?',
      nodeCallouts: [
        { nodeId: 'engaged-pipeline', text: 'Visibility into every deal', emphasis: 'glow' },
        { nodeId: 'closed-won', text: '+90% more closes', emphasis: 'glow' },
      ],
    },
    result: {
      header: '$2.4M recovered annually',
    },
  },
};

const cfoViewerConfig: ViewerConfig = {
  stageLabels: ['Investment', 'Allocation', 'Efficiency', 'ROI'],
  sightline: {
    line1: 'What if [company] could recover',
    metric: '$2.4M',
    line2: 'from pipeline leakage?',
  },
  narrative: {
    setup: {
      header: 'Where your $10M investment goes',
    },
    bleed: {
      header: 'Where margin erodes',
      nodeCallouts: [
        { nodeId: 'no-decision', text: '65% of budget → no return', emphasis: 'pulse' },
        { nodeId: 'admin-overhead', text: '$4M in overhead waste', emphasis: 'glow' },
      ],
    },
    shift: {
      header: 'What if you could see deal health?',
      nodeCallouts: [
        { nodeId: 'tools-viashift', text: '+$200K investment', emphasis: 'glow' },
        { nodeId: 'closed-won', text: '4.2x ROI', emphasis: 'glow' },
      ],
    },
    result: {
      header: '15% margin recovery',
    },
  },
};

const salesViewerConfig: ViewerConfig = {
  stageLabels: ['Budget', 'Resources', 'Pipeline', 'Results'],
  sightline: {
    line1: 'What if [company] could convert',
    metric: '40%',
    line2: 'of stalled deals to closed-won?',
  },
  narrative: {
    setup: {
      header: 'Where your team spends time',
    },
    bleed: {
      header: 'Where deals stall and die',
      nodeCallouts: [
        { nodeId: 'no-decision', text: '65% end in silence', emphasis: 'pulse' },
        { nodeId: 'admin-overhead', text: 'Half your day is admin', emphasis: 'glow' },
      ],
    },
    shift: {
      header: 'What if you knew which deals were real?',
      nodeCallouts: [
        { nodeId: 'engaged-pipeline', text: 'See who is engaging', emphasis: 'glow' },
        { nodeId: 'active-nurture', text: 'Know when to follow up', emphasis: 'glow' },
      ],
    },
    result: {
      header: '12 more closes per quarter',
    },
  },
};

const opsViewerConfig: ViewerConfig = {
  stageLabels: ['Input', 'Process', 'Throughput', 'Output'],
  sightline: {
    line1: 'What if [company] could reduce',
    metric: '35%',
    line2: 'of sales admin overhead?',
  },
  narrative: {
    setup: {
      header: 'Where the process breaks',
    },
    bleed: {
      header: 'Where efficiency dies',
      nodeCallouts: [
        { nodeId: 'admin-overhead', text: '40% waste in the system', emphasis: 'pulse' },
        { nodeId: 'no-decision', text: 'No feedback loop', emphasis: 'glow' },
      ],
    },
    shift: {
      header: 'What if it was automated?',
      nodeCallouts: [
        { nodeId: 'reduced-overhead', text: '60% less admin', emphasis: 'glow' },
        { nodeId: 'engaged-pipeline', text: 'Auto-tracks engagement', emphasis: 'glow' },
      ],
    },
    result: {
      header: '200 hours back per quarter',
    },
  },
};

// ============================================
// TEMPLATE EXPORT
// ============================================

export const salesBudgetEfficiencyTemplate: TransformationTemplateData = {
  id: 'sales-budget-efficiency',
  name: 'Sales Budget Efficiency',
  description: 'The financial impact of deals dying in silence',
  valueFormat: 'currency',

  viewerConfig: {
    default: defaultViewerConfig,
    cfo: cfoViewerConfig,
    sales: salesViewerConfig,
    ops: opsViewerConfig,
  },

  currentState: {
    data: currentStateData,
    metrics: [
      { id: 'm1', value: '$6.5M', label: 'Annual Pipeline Leakage', type: 'negative' },
      { id: 'm2', value: '65%', label: 'Deals End in No Decision', type: 'negative' },
      { id: 'm3', value: '40%', label: 'Budget Lost to Overhead', type: 'negative' },
    ],
    stageLabel: 'Current State',
    anchoredMetric: {
      value: '65%',
      label: 'No Decision',
      type: 'loss',
      nodeId: 'no-decision',
    },
  },

  shiftedState: {
    data: shiftedStateData,
    metrics: [
      { id: 'm1', value: '90%', label: 'Win Rate Improvement', type: 'positive' },
      { id: 'm2', value: '77%', label: 'Pipeline Visibility', type: 'positive' },
      { id: 'm3', value: '4.2x', label: 'ROI on viashift', type: 'positive' },
    ],
    stageLabel: 'With viashift',
    anchoredMetric: {
      value: '+90%',
      label: 'Win Rate',
      type: 'gain',
      nodeId: 'closed-won',
    },
    insight: '[company] could recover $2.4M annually by converting "no decision" deals into engaged opportunities with clear stakeholder visibility.',
  },
};

export default salesBudgetEfficiencyTemplate;