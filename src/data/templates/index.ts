export { b2bSalesEnablementTemplate } from './b2bSalesEnablement';
export { processAutomationTemplate } from './processAutomation';

// Re-export types from processAutomation (most complete type definitions)
export type { 
  TransformationTemplateData, 
  SightlineContent, 
  ViewerConfig, 
  ViewerType,
  NarrativeScript,
  NarrativePhase,
  NodeCallout,
  FlowState,
  SankeyData,
  SankeyNode,
  SankeyLink,
  SankeyMetric,
  AnchoredMetric,
} from './processAutomation';

// Template registry for easy lookup
import { b2bSalesEnablementTemplate } from './b2bSalesEnablement';
import { processAutomationTemplate } from './processAutomation';

export const templateRegistry = {
  'b2b-sales-enablement': b2bSalesEnablementTemplate,
  'process-automation': processAutomationTemplate,
} as const;

export const templates = templateRegistry;
export type TemplateId = keyof typeof templateRegistry;
export const templateList = Object.values(templateRegistry);