import { SankeyData } from '../components/editor/SankeyFlow';
import { b2bSalesEnablementTemplate } from './templates/b2bSalesEnablement';

export const currentViewData: SankeyData = b2bSalesEnablementTemplate.currentState.data;

export const shiftedViewData: SankeyData = b2bSalesEnablementTemplate.shiftedState.data;

export { b2bSalesEnablementTemplate };
