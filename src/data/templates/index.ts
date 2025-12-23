export { b2bSalesEnablementTemplate } from './b2bSalesEnablement';
export { cfoValueCaseTemplate } from './cfoValueCase';

// Re-export types
export type { TransformationTemplateData, SightlineContent } from './b2bSalesEnablement';

// Template registry for easy lookup
import { b2bSalesEnablementTemplate } from './b2bSalesEnablement';
import { cfoValueCaseTemplate } from './cfoValueCase';

export const templateRegistry = {
  'b2b-sales-enablement': b2bSalesEnablementTemplate,
  'cfo-value-case': cfoValueCaseTemplate,
} as const;

export const templates = templateRegistry;

export type TemplateId = keyof typeof templateRegistry;

export const templateList = Object.values(templateRegistry);