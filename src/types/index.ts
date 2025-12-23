/**
 * types/index.ts
 *
 * Simplified type definitions for The Riff - Sankey Flow version
 */

// CORE VISUALIZATION TYPES

export interface FlowNode {
  id: string;
  label: string;
  layer: number;
  value: number;
  y?: number;
  type?: FlowNodeType;
  metadata?: Record<string, any>;
}

export type FlowNodeType =
  | 'default' | 'source' | 'destination' | 'solution'
  | 'loss' | 'new' | 'revenue' | 'process';

export interface FlowLink {
  id: string;
  from: string;
  to: string;
  value: number;
  type?: FlowLinkType;
  label?: string;
  metadata?: Record<string, any>;
}

export type FlowLinkType =
  | 'default' | 'loss' | 'new' | 'revenue' | 'conditional';

export interface FlowData {
  nodes: FlowNode[];
  links: FlowLink[];
}

export interface FlowMetric {
  id: string;
  value: string;
  label: string;
  position: { top?: number; bottom?: number; left?: number; right?: number };
  type?: 'default' | 'positive' | 'negative';
  visible?: boolean;
}

export interface FlowState {
  label: string;
  data: FlowData;
  metrics: FlowMetric[];
  insight?: string;
}

export interface TransformationStory {
  id: string;
  title: string;
  description?: string;
  before: FlowState;
  after: FlowState;
  industry?: string;
  useCase?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Workflow {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  story: TransformationStory;
  thumbnail_url?: string;
  settings: WorkflowSettings;
  created_at: string;
  updated_at: string;
}

export interface WorkflowSettings {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  animationSpeed?: number;
  showParticles?: boolean;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  thumbnail_url?: string;
  story: TransformationStory;
  industry?: string;
  tags?: string[];
  isPremium?: boolean;
}

export type TemplateCategory =
  | 'sales' | 'operations' | 'transformation'
  | 'comparison' | 'funnel' | 'distribution' | 'custom';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  tier: 'free' | 'pro' | 'enterprise';
  created_at: string;
}
