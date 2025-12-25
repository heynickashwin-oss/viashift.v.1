export { b2bSalesEnablementTemplate } from './b2bSalesEnablement';
export { salesBudgetEfficiencyTemplate } from './salesBudgetEfficiency';
export { processAutomationTemplate } from './processAutomation';

// Re-export types from b2bSalesEnablement (canonical source)
export type { 
  TransformationTemplateData, 
  SightlineContent, 
  ViewerConfig, 
  ViewerType,
  NarrativeScript,
  NarrativePhase,
  NodeCallout,
} from './b2bSalesEnablement';

// Template registry for easy lookup
import { b2bSalesEnablementTemplate } from './b2bSalesEnablement';
import { salesBudgetEfficiencyTemplate } from './salesBudgetEfficiency';
import { processAutomationTemplate } from './processAutomation';

export const templateRegistry = {
  'b2b-sales-enablement': b2bSalesEnablementTemplate,
  'sales-budget-efficiency': salesBudgetEfficiencyTemplate,
  'process-automation': processAutomationTemplate,
} as const;

export const templates = templateRegistry;
export type TemplateId = keyof typeof templateRegistry;
export const templateList = Object.values(templateRegistry);