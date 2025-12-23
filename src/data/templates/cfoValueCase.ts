import { SankeyData, SankeyMetric, AnchoredMetric, ValueFormat } from '../../components/sankeyflowv3';
import { TransformationTemplateData, SightlineContent } from './b2bSalesEnablement';

// ============================================
// CFO VALUE CASE: "The Hidden Cost of No Decision"
// Champion Armer template for finance stakeholders
// ============================================

const currentStateData: SankeyData = {
  nodes: [
    // Layer 0: Budget Allocation
    { id: 'annual-budget', label: 'Annual Sales Budget', layer: 0, value: 100, y: 0.5, type: 'source' },
    
    // Layer 1: Spend Categories
    { id: 'rep-salaries', label: 'Rep Salaries', layer: 1, value: 55, y: 0.25, type: 'default' },
    { id: 'tools-tech', label: 'Tools & Tech', layer: 1, value: 25, y: 0.55, type: 'default' },
    { id: 'training', label: 'Training & Enablement', layer: 1, value: 20, y: 0.8, type: 'default' },
    
    // Layer 2: Activity Output
    { id: 'deals-worked', label: 'Deals Worked', layer: 2, value: 60, y: 0.3, type: 'default' },
    { id: 'admin-overhead', label: 'Admin Overhead', layer: 2, value: 40, y: 0.7, type: 'loss' },
    
    // Layer 3: Outcomes
    { id: 'closed-won', label: 'Closed Won', layer: 3, value: 20, y: 0.15, type: 'revenue' },
    { id: 'closed-lost', label: 'Closed Lost', layer: 3, value: 15, y: 0.4, type: 'loss' },
    { id: 'no-decision', label: 'No Decision', layer: 3, value: 65, y: 0.7, type: 'loss' },
  ],
  links: [
    // Budget allocation
    { from: 'annual-budget', to: 'rep-salaries', value: 55, type: 'default' },
    { from: 'annual-budget', to: 'tools-tech', value: 25, type: 'default' },
    { from: 'annual-budget', to: 'training', value: 20, type: 'default' },
    
    // Salaries to output
    { from: 'rep-salaries', to: 'deals-worked', value: 35, type: 'default' },
    { from: 'rep-salaries', to: 'admin-overhead', value: 20, type: 'loss' },
    
    // Tools to output
    { from: 'tools-tech', to: 'deals-worked', value: 15, type: 'default' },
    { from: 'tools-tech', to: 'admin-overhead', value: 10, type: 'loss' },
    
    // Training to output
    { from: 'training', to: 'deals-worked', value: 10, type: 'default' },
    { from: 'training', to: 'admin-overhead', value: 10, type: 'loss' },
    
    // Deal outcomes
    { from: 'deals-worked', to: 'closed-won', value: 20, type: 'revenue' },
    { from: 'deals-worked', to: 'closed-lost', value: 15, type: 'loss' },
    { from: 'deals-worked', to: 'no-decision', value: 25, type: 'loss' },
    
    // Admin overhead to no decision
    { from: 'admin-overhead', to: 'no-decision', value: 40, type: 'loss' },
  ],
};

// ============================================
// SHIFTED STATE: "Recovered Revenue"
// ============================================

const shiftedStateData: SankeyData = {
  nodes: [
    // Layer 0: Same Budget
    { id: 'annual-budget', label: 'Annual Sales Budget', layer: 0, value: 100, y: 0.5, type: 'source' },
    
    // Layer 1: Optimized Allocation
    { id: 'rep-salaries', label: 'Rep Salaries', layer: 1, value: 55, y: 0.25, type: 'default' },
    { id: 'tools-viashift', label: 'Tools + viashift', layer: 1, value: 27, y: 0.55, type: 'solution' },
    { id: 'training', label: 'Training', layer: 1, value: 18, y: 0.8, type: 'default' },
    
    // Layer 2: Higher Efficiency
    { id: 'deals-worked', label: 'Deals Worked', layer: 2, value: 75, y: 0.25, type: 'default' },
    { id: 'engaged-pipeline', label: 'Engaged Pipeline', layer: 2, value: 60, y: 0.55, type: 'new' },
    { id: 'reduced-overhead', label: 'Reduced Overhead', layer: 2, value: 15, y: 0.85, type: 'default' },
    
    // Layer 3: Better Outcomes
    { id: 'closed-won', label: 'Closed Won', layer: 3, value: 38, y: 0.15, type: 'revenue' },
    { id: 'closed-lost', label: 'Closed Lost', layer: 3, value: 20, y: 0.45, type: 'loss' },
    { id: 'active-nurture', label: 'Active Nurture', layer: 3, value: 27, y: 0.7, type: 'default' },
    { id: 'no-decision', label: 'No Decision', layer: 3, value: 15, y: 0.9, type: 'loss' },
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
    { from: 'tools-viashift', to: 'engaged-pipeline', value: 7, type: 'new' },
    
    { from: 'training', to: 'deals-worked', value: 15, type: 'default' },
    { from: 'training', to: 'engaged-pipeline', value: 3, type: 'new' },
    
    // Engaged pipeline creates visibility
    { from: 'deals-worked', to: 'engaged-pipeline', value: 50, type: 'new' },
    
    // Better outcomes
    { from: 'engaged-pipeline', to: 'closed-won', value: 28, type: 'revenue' },
    { from: 'engaged-pipeline', to: 'active-nurture', value: 22, type: 'default' },
    { from: 'engaged-pipeline', to: 'closed-lost', value: 10, type: 'loss' },
    
    { from: 'deals-worked', to: 'closed-won', value: 10, type: 'revenue' },
    { from: 'deals-worked', to: 'closed-lost', value: 10, type: 'loss' },
    { from: 'deals-worked', to: 'no-decision', value: 5, type: 'loss' },
    
    { from: 'active-nurture', to: 'no-decision', value: 5, type: 'loss' },
    { from: 'active-nurture', to: 'closed-lost', value: 0, type: 'loss' },
    { from: 'reduced-overhead', to: 'no-decision', value: 5, type: 'loss' },
  ],
};

export const cfoValueCaseTemplate: TransformationTemplateData = {
  id: 'cfo-value-case',
  name: 'CFO Value Case',
  description: 'The financial impact of deals dying in silence',
  stageLabels: ['Investment', 'Allocation', 'Efficiency', 'Return'],
  valueFormat: 'currency',
 
  sightlines: {
    finance: {
      line1: 'What if [company] could recover',
      metric: '$2.4M',
      line2: 'from "no decision" pipeline leakage?',
    },
    ops: {
      line1: 'What if [company] could reduce',
      metric: '35%',
      line2: 'of sales admin overhead?',
    },
    sales: {
      line1: 'What if [company] could convert',
      metric: '40%',
      line2: 'of stalled deals to closed-won?',
    },
    all: {
      line1: 'What if [company] could recover',
      metric: '$2.4M',
      line2: 'from "no decision" pipeline leakage?',
    },
  },

  currentState: {
    data: currentStateData,
    metrics: [
      { id: 'm1', value: '$2.4M', label: 'Annual Pipeline Leakage', type: 'negative' },
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

export default cfoValueCaseTemplate;