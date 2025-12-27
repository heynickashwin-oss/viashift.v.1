/**
 * Stakeholder Parallel Datasets
 * 
 * Three views of the same business process, each using stakeholder-native units:
 * - Orders: Volume flow (500 orders/week)
 * - Dollars: Cost flow ($4,100/week budget)
 * - Time: Hours flow (117 hrs/week capacity)
 * 
 * Each dataset tells the same transformation story in different "languages"
 */

import { SankeyData, SankeyMetric } from '../../components/sankeyflowv3';

// ============================================
// VIEW TYPE DEFINITIONS
// ============================================

export type StakeholderViewType = 'orders' | 'dollars' | 'time';

export interface StakeholderViewConfig {
  viewType: StakeholderViewType;
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

export const viewConfigs: Record<StakeholderViewType, StakeholderViewConfig> = {
  orders: {
    viewType: 'orders',
    title: 'Order Flow',
    subtitle: 'Volume Distribution',
    unit: 'orders',
    unitLabel: 'orders/week',
    totalInput: 500,
    insight: '87 orders (18%) require rework, only 72% delivered on-time',
    audienceLabel: 'Sales / Quality View',
  },
  dollars: {
    viewType: 'dollars',
    title: 'Cost Flow',
    subtitle: 'Budget Distribution',
    unit: '$',
    unitLabel: '$/week',
    totalInput: 4100,
    insight: '$987/week (24%) flows to pure waste - zero value recovered',
    audienceLabel: 'CFO / Finance View',
  },
  time: {
    viewType: 'time',
    title: 'Time Flow',
    subtitle: 'Capacity Distribution',
    unit: 'hrs',
    unitLabel: 'hrs/week',
    totalInput: 117,
    insight: '30 hours/week (26%) lost to rework and firefighting',
    audienceLabel: 'Operations View',
  },
};

// ============================================
// ORDERS VIEW - CURRENT STATE
// ============================================

const ordersCurrentData: SankeyData = {
  nodes: [
    // Layer 0: INPUT
    { id: 'intake', label: 'Order Intake', layer: 0, value: 500, type: 'source', displayValue: '500 orders/wk' },
    
    // Layer 1: CLASSIFICATION
    { id: 'valid', label: 'Valid Orders', layer: 1, value: 485, type: 'default', displayValue: '485 orders' },
    { id: 'invalid', label: 'Invalid/Flagged', layer: 1, value: 15, type: 'default', displayValue: '15 orders' },
    
    // Layer 2: PROCESSING (intermediate - not loss)
    { id: 'manual-process', label: 'Manual Processing', layer: 2, value: 485, type: 'default', displayValue: '485 orders' },
    
    // Layer 3: OUTCOMES (intermediate - not loss yet)
    { id: 'processed-ok', label: 'Processed OK', layer: 3, value: 398, type: 'default', displayValue: '398 (82%)' },
    { id: 'errors', label: 'Errors & Rework', layer: 3, value: 87, type: 'default', displayValue: '87 (18%)' },
    
    // Layer 4: FINAL OUTCOMES (terminal - these get loss/revenue)
    { id: 'on-time', label: '✓ On-Time', layer: 4, value: 360, type: 'revenue', displayValue: '360 orders (72%)' },
    { id: 'delayed', label: '⚠ Delayed', layer: 4, value: 110, type: 'loss', displayValue: '110 orders (22%)' },
    { id: 'escalated', label: '✗ Escalated', layer: 4, value: 30, type: 'loss', displayValue: '30 orders (6%)' },
  ],
  links: [
    // Intake → Classification
    { from: 'intake', to: 'valid', value: 485, type: 'default', displayLabel: '485' },
    { from: 'intake', to: 'invalid', value: 15, type: 'loss', displayLabel: '15' },
    
    // Classification → Processing
    { from: 'valid', to: 'manual-process', value: 485, type: 'default', displayLabel: '485' },
    
    // Processing → Outcomes
    { from: 'manual-process', to: 'processed-ok', value: 398, type: 'default', displayLabel: '398' },
    { from: 'manual-process', to: 'errors', value: 87, type: 'loss', displayLabel: '87 (18%)' },
    
    // Outcomes → Final
    { from: 'processed-ok', to: 'on-time', value: 350, type: 'revenue', displayLabel: '350' },
    { from: 'processed-ok', to: 'delayed', value: 48, type: 'default', displayLabel: '48' },
    { from: 'errors', to: 'delayed', value: 62, type: 'loss', displayLabel: '62' },
    { from: 'errors', to: 'escalated', value: 25, type: 'loss', displayLabel: '25' },
    { from: 'invalid', to: 'escalated', value: 5, type: 'loss', displayLabel: '5' },
  ],
};

const ordersCurrentMetrics: SankeyMetric[] = [
  { id: 'total', value: '500', label: 'Orders/Week', type: 'neutral' },
  { id: 'ontime', value: '72%', label: 'On-Time Rate', type: 'negative' },
  { id: 'errors', value: '18%', label: 'Error Rate', type: 'negative' },
];

// ============================================
// DOLLARS VIEW - CURRENT STATE
// ============================================

const dollarsCurrentData: SankeyData = {
  nodes: [
    // Layer 0: INPUT
    { id: 'budget', label: 'Weekly Budget', layer: 0, value: 4100, type: 'source', displayValue: '$4,100/wk' },
    
    // Layer 1: ALLOCATION (intermediate)
    { id: 'validation-cost', label: 'Validation', layer: 1, value: 292, type: 'default', displayValue: '$292' },
    { id: 'labor-pool', label: 'Processing Labor', layer: 1, value: 3808, type: 'default', displayValue: '$3,808' },
    
    // Layer 2: DISTRIBUTION (intermediate - NOT loss yet, money can still recover)
    { id: 'productive-labor', label: 'Productive Work', layer: 2, value: 2513, type: 'default', displayValue: '$2,513' },
    { id: 'error-cost', label: 'Error Handling', layer: 2, value: 1545, type: 'default', displayValue: '$1,545' },
    
    // Layer 3: FINAL OUTCOMES (terminal - these get loss/revenue)
    { id: 'value-created', label: '✓ Value Created', layer: 3, value: 3113, type: 'revenue', displayValue: '$3,113 (76%)' },
    { id: 'waste', label: '✗ Pure Waste', layer: 3, value: 987, type: 'loss', displayValue: '$987 (24%)' },
  ],
  links: [
    // Budget → Allocation
    { from: 'budget', to: 'validation-cost', value: 292, type: 'default', displayLabel: '$292' },
    { from: 'budget', to: 'labor-pool', value: 3808, type: 'default', displayLabel: '$3,808' },
    
    // Allocation → Distribution
    { from: 'validation-cost', to: 'productive-labor', value: 250, type: 'default', displayLabel: '$250' },
    { from: 'validation-cost', to: 'waste', value: 42, type: 'loss', displayLabel: '$42' },
    { from: 'labor-pool', to: 'productive-labor', value: 2263, type: 'default', displayLabel: '$2,263' },
    { from: 'labor-pool', to: 'error-cost', value: 1545, type: 'loss', displayLabel: '$1,545' },
    
    // Distribution → Outcomes
    { from: 'productive-labor', to: 'value-created', value: 2513, type: 'revenue', displayLabel: '$2,513' },
    { from: 'error-cost', to: 'value-created', value: 600, type: 'default', displayLabel: '$600' },
    { from: 'error-cost', to: 'waste', value: 945, type: 'loss', displayLabel: '$945' },
  ],
};

const dollarsCurrentMetrics: SankeyMetric[] = [
  { id: 'total', value: '$4,100', label: 'Weekly Budget', type: 'neutral' },
  { id: 'waste', value: '$987', label: 'Wasted/Week', type: 'negative' },
  { id: 'annual', value: '$51K', label: 'Annual Waste', type: 'negative' },
];

// ============================================
// TIME VIEW - CURRENT STATE
// ============================================

const timeCurrentData: SankeyData = {
  nodes: [
    // Layer 0: INPUT
    { id: 'capacity', label: 'Team Capacity', layer: 0, value: 117, type: 'source', displayValue: '117 hrs/wk' },
    
    // Layer 1: ALLOCATION (intermediate)
    { id: 'validation-time', label: 'Validation', layer: 1, value: 8, type: 'default', displayValue: '8 hrs' },
    { id: 'processing-time', label: 'Processing', layer: 1, value: 109, type: 'default', displayValue: '109 hrs' },
    
    // Layer 2: DISTRIBUTION (intermediate - NOT loss yet, time can still be productive)
    { id: 'productive-time', label: 'Productive Work', layer: 2, value: 72, type: 'default', displayValue: '72 hrs' },
    { id: 'error-time', label: 'Error Handling', layer: 2, value: 44, type: 'default', displayValue: '44 hrs' },
    
    // Layer 3: FINAL OUTCOMES (terminal - these get loss/revenue)
    { id: 'value-hours', label: '✓ Value-Adding', layer: 3, value: 87, type: 'revenue', displayValue: '87 hrs (74%)' },
    { id: 'lost-time', label: '✗ Lost Capacity', layer: 3, value: 30, type: 'loss', displayValue: '30 hrs (26%)' },
  ],
  links: [
    // Capacity → Allocation
    { from: 'capacity', to: 'validation-time', value: 8, type: 'default', displayLabel: '8 hrs' },
    { from: 'capacity', to: 'processing-time', value: 109, type: 'default', displayLabel: '109 hrs' },
    
    // Allocation → Distribution
    { from: 'validation-time', to: 'productive-time', value: 7, type: 'default', displayLabel: '7 hrs' },
    { from: 'validation-time', to: 'lost-time', value: 1, type: 'loss', displayLabel: '1 hr' },
    { from: 'processing-time', to: 'productive-time', value: 65, type: 'default', displayLabel: '65 hrs' },
    { from: 'processing-time', to: 'error-time', value: 44, type: 'loss', displayLabel: '44 hrs' },
    
    // Distribution → Outcomes
    { from: 'productive-time', to: 'value-hours', value: 72, type: 'revenue', displayLabel: '72 hrs' },
    { from: 'error-time', to: 'value-hours', value: 15, type: 'default', displayLabel: '15 hrs' },
    { from: 'error-time', to: 'lost-time', value: 29, type: 'loss', displayLabel: '29 hrs' },
  ],
};

const timeCurrentMetrics: SankeyMetric[] = [
  { id: 'total', value: '117', label: 'Hours/Week', type: 'neutral' },
  { id: 'lost', value: '30', label: 'Hours Lost/Week', type: 'negative' },
  { id: 'percent', value: '26%', label: 'Capacity Wasted', type: 'negative' },
];

// ============================================
// EXPORTED CURRENT STATE DATA
// ============================================

export const stakeholderCurrentState: Record<StakeholderViewType, {
  data: SankeyData;
  metrics: SankeyMetric[];
}> = {
  orders: {
    data: ordersCurrentData,
    metrics: ordersCurrentMetrics,
  },
  dollars: {
    data: dollarsCurrentData,
    metrics: dollarsCurrentMetrics,
  },
  time: {
    data: timeCurrentData,
    metrics: timeCurrentMetrics,
  },
};

// ============================================
// CROSS-REFERENCE DATA FOR COMPARISON CARDS
// (Maps equivalent nodes across views)
// ============================================

export const nodeEquivalenceMap: Record<string, Record<StakeholderViewType, { nodeId: string; value: string }>> = {
  'waste-point': {
    orders: { nodeId: 'errors', value: '87 orders (18%)' },
    dollars: { nodeId: 'waste', value: '$987/week' },
    time: { nodeId: 'lost-time', value: '30 hrs/week' },
  },
  'processing': {
    orders: { nodeId: 'manual-process', value: '485 orders' },
    dollars: { nodeId: 'labor-pool', value: '$3,808/week' },
    time: { nodeId: 'processing-time', value: '109 hrs/week' },
  },
  'success': {
    orders: { nodeId: 'on-time', value: '360 orders (72%)' },
    dollars: { nodeId: 'value-created', value: '$3,113/week' },
    time: { nodeId: 'value-hours', value: '87 hrs/week' },
  },
};

// ============================================
// HELPER: Get FlowState for TransformationExperience
// ============================================

import type { FlowState } from '../../components/sankeyflowv3';

export function getFlowStateForView(viewType: StakeholderViewType): FlowState {
  const config = viewConfigs[viewType];
  const { data, metrics } = stakeholderCurrentState[viewType];
  
  return {
    data,
    metrics,
    stageLabel: config.title,
    anchoredMetric: viewType === 'dollars' 
      ? { value: '$987', label: 'Wasted/Week', type: 'loss', nodeId: 'waste' }
      : viewType === 'time'
      ? { value: '30 hrs', label: 'Lost/Week', type: 'loss', nodeId: 'lost-time' }
      : { value: '18%', label: 'Error Rate', type: 'loss', nodeId: 'errors' },
    insight: config.insight,
  };
}