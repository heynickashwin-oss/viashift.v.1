import { supabase } from '../lib/supabase';
import { Workflow, Layer, WorkflowSettings, Node, Connection, Stage } from '../types';

const defaultLayers: Layer[] = [
  { id: 'layer-0', name: 'Infrastructure', color: '#00e5ff', visible: true },
  { id: 'layer-1', name: 'Application', color: '#00ffaa', visible: true },
  { id: 'layer-2', name: 'Business', color: '#ff00ff', visible: true },
];

const defaultSettings: WorkflowSettings = {
  maxTime: 30,
  primaryColor: '#00e5ff',
  accentColor: '#00ffaa',
  highlightColor: '#ff00ff',
};

interface DbWorkflow {
  id: string;
  user_id: string;
  title: string;
  nodes: Node[];
  connections: Connection[];
  settings: WorkflowSettings & { layers?: Layer[] };
  stages?: Stage[];
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

const defaultNodes: Node[] = [
  {
    id: '1',
    type: 'start',
    icon: '◉',
    label: 'Start',
    x: -200,
    y: 0,
    layer: 0,
    color: '#00e5ff',
    selected: false,
    animation: {
      type: 'fade',
      duration: 1,
      sizeChange: 0,
      startTime: 0,
      loop: 'once',
    },
  },
  {
    id: '2',
    type: 'process',
    icon: '◎',
    label: 'Process',
    x: 0,
    y: 0,
    layer: 1,
    color: '#00ffaa',
    selected: false,
    animation: {
      type: 'grow',
      duration: 1,
      sizeChange: 20,
      startTime: 1,
      loop: 'once',
    },
  },
  {
    id: '3',
    type: 'end',
    icon: '▦',
    label: 'End',
    x: 200,
    y: 0,
    layer: 2,
    color: '#ff00ff',
    selected: false,
    animation: {
      type: 'pulse',
      duration: 2,
      sizeChange: 15,
      startTime: 2,
      loop: 'loop',
    },
  },
];

const defaultConnections: Connection[] = [
  { id: 'c1', from: '1', to: '2', type: 'normal' },
  { id: 'c2', from: '2', to: '3', type: 'normal' },
];

const defaultStages: Stage[] = [
  { id: 'stage-1', name: 'Input', time: 0, color: '#00D4E5' },
  { id: 'stage-2', name: 'Processing', time: 1.5, color: '#00FFAA' },
  { id: 'stage-3', name: 'Output', time: 3, color: '#FF00FF' },
];

export interface WorkflowSummary {
  id: string;
  title: string;
  updated_at: string;
  nodeCount: number;
}

export async function createWorkflow(
  userId: string,
  name: string = 'Untitled Workflow'
): Promise<Workflow> {
  const settingsWithLayers = {
    ...defaultSettings,
    layers: defaultLayers,
  };

  const { data, error } = await supabase
    .from('workflows')
    .insert({
      user_id: userId,
      title: name,
      nodes: defaultNodes,
      connections: defaultConnections,
      stages: defaultStages,
      settings: settingsWithLayers,
    })
    .select()
    .single();

  if (error) throw error;

  const dbWorkflow = data as DbWorkflow;
  return {
    id: dbWorkflow.id,
    user_id: dbWorkflow.user_id,
    title: dbWorkflow.title,
    nodes: dbWorkflow.nodes,
    connections: dbWorkflow.connections,
    layers: dbWorkflow.settings.layers || defaultLayers,
    stages: dbWorkflow.stages || defaultStages,
    settings: {
      maxTime: dbWorkflow.settings.maxTime,
      primaryColor: dbWorkflow.settings.primaryColor,
      accentColor: dbWorkflow.settings.accentColor,
      highlightColor: dbWorkflow.settings.highlightColor,
    },
    created_at: dbWorkflow.created_at,
    updated_at: dbWorkflow.updated_at,
  };
}

export async function saveWorkflow(workflow: Workflow): Promise<void> {
  const settingsWithLayers = {
    ...workflow.settings,
    layers: workflow.layers,
  };

  const { error } = await supabase
    .from('workflows')
    .update({
      title: workflow.title,
      nodes: workflow.nodes,
      connections: workflow.connections,
      stages: workflow.stages,
      settings: settingsWithLayers,
      updated_at: new Date().toISOString(),
    })
    .eq('id', workflow.id);

  if (error) throw error;
}

export async function loadWorkflow(workflowId: string): Promise<Workflow | null> {
  const { data, error } = await supabase
    .from('workflows')
    .select('*')
    .eq('id', workflowId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const dbWorkflow = data as DbWorkflow;
  return {
    id: dbWorkflow.id,
    user_id: dbWorkflow.user_id,
    title: dbWorkflow.title,
    nodes: dbWorkflow.nodes,
    connections: dbWorkflow.connections,
    layers: dbWorkflow.settings.layers || defaultLayers,
    stages: dbWorkflow.stages || [],
    settings: {
      maxTime: dbWorkflow.settings.maxTime,
      primaryColor: dbWorkflow.settings.primaryColor,
      accentColor: dbWorkflow.settings.accentColor,
      highlightColor: dbWorkflow.settings.highlightColor,
    },
    created_at: dbWorkflow.created_at,
    updated_at: dbWorkflow.updated_at,
  };
}

export async function listWorkflows(userId: string): Promise<WorkflowSummary[]> {
  const { data, error } = await supabase
    .from('workflows')
    .select('id, title, updated_at, nodes')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((workflow) => ({
    id: workflow.id,
    title: workflow.title,
    updated_at: workflow.updated_at,
    nodeCount: Array.isArray(workflow.nodes) ? workflow.nodes.length : 0,
  }));
}

export async function deleteWorkflow(workflowId: string): Promise<boolean> {
  const { error } = await supabase.from('workflows').delete().eq('id', workflowId);

  if (error) {
    console.error('Error deleting workflow:', error);
    return false;
  }

  return true;
}

export async function duplicateWorkflow(
  workflowId: string,
  userId: string
): Promise<Workflow> {
  const original = await loadWorkflow(workflowId);
  if (!original) throw new Error('Workflow not found');

  const settingsWithLayers = {
    ...original.settings,
    layers: original.layers,
  };

  const { data, error } = await supabase
    .from('workflows')
    .insert({
      user_id: userId,
      title: `Copy of ${original.title}`,
      nodes: original.nodes,
      connections: original.connections,
      stages: original.stages,
      settings: settingsWithLayers,
    })
    .select()
    .single();

  if (error) throw error;

  const dbWorkflow = data as DbWorkflow;
  return {
    id: dbWorkflow.id,
    user_id: dbWorkflow.user_id,
    title: dbWorkflow.title,
    nodes: dbWorkflow.nodes,
    connections: dbWorkflow.connections,
    layers: dbWorkflow.settings.layers || defaultLayers,
    stages: dbWorkflow.stages || [],
    settings: {
      maxTime: dbWorkflow.settings.maxTime,
      primaryColor: dbWorkflow.settings.primaryColor,
      accentColor: dbWorkflow.settings.accentColor,
      highlightColor: dbWorkflow.settings.highlightColor,
    },
    created_at: dbWorkflow.created_at,
    updated_at: dbWorkflow.updated_at,
  };
}
