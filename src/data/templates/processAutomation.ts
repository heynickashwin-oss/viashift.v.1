/**
 * Process Automation Template
 * 
 * Test scenario: Manual Order Fulfillment → Automated Workflow
 * Demonstrates multi-stakeholder alignment discovery
 * 
 * Stakeholder views: default, ops, cfo (finance), sales
 */

import { SankeyData, SankeyMetric, AnchoredMetric } from '../../components/sankeyflowv3';
import { 
  TransformationTemplateData, 
  ViewerConfig,
} from './b2bSalesEnablement';

// ============================================
// BEFORE STATE: "Where Your Orders Go Today"
// ============================================

const currentStateData: SankeyData = {
  nodes: [
    // Layer 0: INTAKE
    { id: 'orders-received', label: 'Orders Received', layer: 0, value: 500, y: 0.5, type: 'source', displayValue: '500/week' },
    
    // Layer 1: CLASSIFICATION
    { id: 'standard-orders', label: 'Standard Orders', layer: 1, value: 325, y: 0.2, type: 'default', displayValue: '65%' },
    { id: 'complex-orders', label: 'Complex Orders', layer: 1, value: 125, y: 0.5, type: 'default', displayValue: '25%' },
    { id: 'urgent-orders', label: 'Urgent/Rush', layer: 1, value: 50, y: 0.8, type: 'default', displayValue: '10%' },
    
    // Layer 2: PROCESSING
    { id: 'manual-entry', label: 'Manual Data Entry', layer: 2, value: 325, y: 0.15, type: 'loss', displayValue: '8 min avg' },
    { id: 'specialist-queue', label: 'Specialist Queue', layer: 2, value: 125, y: 0.45, type: 'loss', displayValue: '2.5 day wait' },
    { id: 'rush-handling', label: 'Rush Handling', layer: 2, value: 50, y: 0.75, type: 'default', displayValue: '45 min avg' },
    
    // Layer 3: OUTCOMES
    { id: 'processed-ok', label: 'Processed OK', layer: 3, value: 360, y: 0.2, type: 'default', displayValue: '72%' },
    { id: 'errors-rework', label: 'Errors & Rework', layer: 3, value: 90, y: 0.5, type: 'loss', displayValue: '18%' },
    { id: 'overtime-required', label: 'Overtime Required', layer: 3, value: 50, y: 0.8, type: 'loss', displayValue: '12 hrs/wk' },
  ],
  links: [
    // Intake → Classification
    { from: 'orders-received', to: 'standard-orders', value: 325, type: 'default' },
    { from: 'orders-received', to: 'complex-orders', value: 125, type: 'default' },
    { from: 'orders-received', to: 'urgent-orders', value: 50, type: 'default' },
    
    // Classification → Processing
    { from: 'standard-orders', to: 'manual-entry', value: 325, type: 'loss', displayLabel: '8 min each' },
    { from: 'complex-orders', to: 'specialist-queue', value: 125, type: 'loss', displayLabel: '2.5 day wait' },
    { from: 'urgent-orders', to: 'rush-handling', value: 50, type: 'default' },
    
    // Processing → Outcomes
    { from: 'manual-entry', to: 'processed-ok', value: 270, type: 'default' },
    { from: 'manual-entry', to: 'errors-rework', value: 55, type: 'loss', displayLabel: '17% errors' },
    { from: 'specialist-queue', to: 'processed-ok', value: 80, type: 'default' },
    { from: 'specialist-queue', to: 'errors-rework', value: 35, type: 'loss' },
    { from: 'specialist-queue', to: 'overtime-required', value: 10, type: 'loss' },
    { from: 'rush-handling', to: 'processed-ok', value: 10, type: 'default' },
    { from: 'rush-handling', to: 'overtime-required', value: 40, type: 'loss', displayLabel: '12 hrs/wk' },
  ],
};

// ============================================
// AFTER STATE: "Where Orders Could Go"
// ============================================

const shiftedStateData: SankeyData = {
  nodes: [
    // Layer 0: INTAKE
    { id: 'orders-received', label: 'Orders Received', layer: 0, value: 500, y: 0.5, type: 'source', displayValue: '500/week' },
    
    // Layer 1: AUTO-CLASSIFICATION
    { id: 'auto-classified', label: 'Auto-Classified', layer: 1, value: 460, y: 0.3, type: 'new', displayValue: '92%' },
    { id: 'manual-triage', label: 'Manual Triage', layer: 1, value: 40, y: 0.8, type: 'default', displayValue: '8%' },
    
    // Layer 2: AUTOMATED PROCESSING
    { id: 'auto-processing', label: 'Auto-Processing', layer: 2, value: 460, y: 0.25, type: 'new', displayValue: '<1 min' },
    { id: 'specialist-review', label: 'Specialist Review', layer: 2, value: 40, y: 0.75, type: 'default', displayValue: '4 hr wait' },
    
    // Layer 3: OUTCOMES
    { id: 'on-time-delivery', label: 'On-Time Delivery', layer: 3, value: 470, y: 0.2, type: 'revenue', displayValue: '94%' },
    { id: 'minor-delays', label: 'Minor Delays', layer: 3, value: 26, y: 0.55, type: 'default', displayValue: '5%' },
    { id: 'capacity-freed', label: 'Capacity Freed', layer: 3, value: 75, y: 0.85, type: 'new', displayValue: '15 hrs/wk' },
  ],
  links: [
    // Intake → Auto-Classification
    { from: 'orders-received', to: 'auto-classified', value: 460, type: 'new', displayLabel: 'AI classifies' },
    { from: 'orders-received', to: 'manual-triage', value: 40, type: 'default' },
    
    // Classification → Processing
    { from: 'auto-classified', to: 'auto-processing', value: 460, type: 'new', displayLabel: '<1 min' },
    { from: 'manual-triage', to: 'specialist-review', value: 40, type: 'default' },
    
    // Processing → Outcomes
    { from: 'auto-processing', to: 'on-time-delivery', value: 430, type: 'revenue', displayLabel: '94% on-time' },
    { from: 'auto-processing', to: 'minor-delays', value: 26, type: 'default' },
    { from: 'auto-processing', to: 'capacity-freed', value: 75, type: 'new', displayLabel: '15 hrs saved' },
    { from: 'specialist-review', to: 'on-time-delivery', value: 40, type: 'revenue' },
  ],
};

// ============================================
// VIEWER CONFIGURATIONS
// ============================================

const defaultViewerConfig: ViewerConfig = {
  stageLabels: ['Intake', 'Classify', 'Process', 'Outcome'],
  sightline: {
    line1: 'What if [company] could save',
    metric: '$190K',
    line2: 'by automating manual order processing?',
  },
  narrative: {
    setup: {
      header: 'Your current order flow',
    },
    bleed: {
      header: 'Where time and money disappear',
      nodeCallouts: [
        { nodeId: 'manual-entry', text: '8 minutes per order', emphasis: 'pulse' },
        { nodeId: 'errors-rework', text: '18% need rework', emphasis: 'glow' },
        { nodeId: 'overtime-required', text: '12 hrs overtime/week', emphasis: 'pulse' },
      ],
    },
    shift: {
      header: 'What automation changes',
      nodeCallouts: [
        { nodeId: 'auto-processing', text: 'Under 1 minute', emphasis: 'glow' },
        { nodeId: 'on-time-delivery', text: '94% on-time', emphasis: 'glow' },
      ],
    },
    result: {
      header: 'The transformation',
    },
  },
};

const opsViewerConfig: ViewerConfig = {
  stageLabels: ['Intake', 'Classify', 'Process', 'Outcome'],
  sightline: {
    line1: 'What if [company] could eliminate',
    metric: '12 hrs/week',
    line2: 'of overtime from manual processing?',
  },
  narrative: {
    setup: {
      header: 'Current operational flow',
    },
    bleed: {
      header: 'Where your team gets stuck',
      nodeCallouts: [
        { nodeId: 'specialist-queue', text: '2.5 day average wait', emphasis: 'pulse' },
        { nodeId: 'overtime-required', text: '12 hrs overtime/week', emphasis: 'glow' },
        { nodeId: 'errors-rework', text: '18% requires rework', emphasis: 'pulse' },
      ],
    },
    shift: {
      header: 'Eliminating the bottlenecks',
      nodeCallouts: [
        { nodeId: 'auto-classified', text: '92% auto-routed', emphasis: 'glow' },
        { nodeId: 'capacity-freed', text: '15 hrs back per week', emphasis: 'glow' },
      ],
    },
    result: {
      header: 'Team focuses on exceptions, not data entry',
    },
  },
};

const cfoViewerConfig: ViewerConfig = {
  stageLabels: ['Intake', 'Classify', 'Process', 'Outcome'],
  sightline: {
    line1: 'What if [company] could recover',
    metric: '$190K/year',
    line2: 'hidden in manual process costs?',
  },
  narrative: {
    setup: {
      header: 'Where budget goes today',
    },
    bleed: {
      header: 'The hidden costs',
      nodeCallouts: [
        { nodeId: 'manual-entry', text: '$94K/year labor cost', emphasis: 'pulse' },
        { nodeId: 'overtime-required', text: '$18K/year overtime', emphasis: 'glow' },
        { nodeId: 'errors-rework', text: '$78K/year in rework', emphasis: 'pulse' },
      ],
    },
    shift: {
      header: 'Recovering the value',
      nodeCallouts: [
        { nodeId: 'auto-processing', text: '$82K labor savings', emphasis: 'glow' },
        { nodeId: 'on-time-delivery', text: 'Customer retention up', emphasis: 'glow' },
      ],
    },
    result: {
      header: '$190K annual savings, 14-month payback',
    },
  },
};

const salesViewerConfig: ViewerConfig = {
  stageLabels: ['Intake', 'Classify', 'Process', 'Outcome'],
  sightline: {
    line1: 'What if [company] could improve',
    metric: '22%',
    line2: 'on-time delivery for customers?',
  },
  narrative: {
    setup: {
      header: 'Current customer experience',
    },
    bleed: {
      header: 'Where we lose customer trust',
      nodeCallouts: [
        { nodeId: 'errors-rework', text: '18% orders have issues', emphasis: 'pulse' },
        { nodeId: 'processed-ok', text: 'Only 72% on-time', emphasis: 'glow' },
      ],
    },
    shift: {
      header: 'Delivering on promises',
      nodeCallouts: [
        { nodeId: 'on-time-delivery', text: '94% on-time delivery', emphasis: 'glow' },
        { nodeId: 'minor-delays', text: 'Only 5% delayed', emphasis: 'glow' },
      ],
    },
    result: {
      header: 'Happy customers, easier renewals',
    },
  },
};

// ============================================
// TEMPLATE EXPORT
// ============================================

export const processAutomationTemplate: TransformationTemplateData = {
  id: 'process-automation',
  name: 'Process Automation Decision',
  description: 'Manual order fulfillment → Automated workflow',
  valueFormat: 'number',

  viewerConfig: {
    default: defaultViewerConfig,
    cfo: cfoViewerConfig,
    sales: salesViewerConfig,
    ops: opsViewerConfig,
  },

  currentState: {
    data: currentStateData,
    metrics: [
      { id: 'm-ontime', value: '72%', label: 'On-Time Delivery', type: 'negative' },
      { id: 'm-errors', value: '18%', label: 'Error & Rework Rate', type: 'negative' },
      { id: 'm-overtime', value: '12 hrs', label: 'Weekly Overtime', type: 'negative' },
    ],
    stageLabel: 'Current State',
    anchoredMetric: {
      value: '72%',
      label: 'On-Time',
      type: 'loss',
      nodeId: 'processed-ok',
    },
  },

  shiftedState: {
    data: shiftedStateData,
    metrics: [
      { id: 'm-ontime', value: '94%', label: 'On-Time Delivery', type: 'positive' },
      { id: 'm-errors', value: '1%', label: 'Error Rate', type: 'positive' },
      { id: 'm-saved', value: '15 hrs', label: 'Capacity Freed/Week', type: 'positive' },
    ],
    stageLabel: 'With Automation',
    anchoredMetric: {
      value: '94%',
      label: 'On-Time',
      type: 'gain',
      nodeId: 'on-time-delivery',
    },
    insight: '[company] could save $190K annually and improve on-time delivery from 72% to 94% by automating the manual order fulfillment process.',
  },
};

export default processAutomationTemplate;