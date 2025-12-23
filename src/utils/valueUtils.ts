/**
 * Value formatting utilities for viashift
 * 
 * These utilities generate display values for nodes and links
 * based on the template's valueFormat setting.
 */

import { SankeyData, SankeyNode, SankeyLink, ValueFormat } from '../components/sankeyflowv3';

// Value overrides structure (stored in DB)
export interface ValueOverrides {
  nodes: Record<string, { displayValue: string }>;
  links: Record<string, { displayLabel: string }>; // key format: "fromId->toId"
}

// Helper to generate link key for overrides
export function getLinkKey(from: string, to: string): string {
  return `${from}->${to}`;
}

/**
 * Format a numeric value according to the template's valueFormat
 */
export function formatValue(
  value: number, 
  format: ValueFormat, 
  options?: { 
    prefix?: string;  // e.g., '+' or '-'
    scale?: number;   // multiplier for currency
  }
): string {
  const { prefix = '', scale = 1 } = options || {};
  const scaledValue = value * scale;
  
  switch (format) {
    case 'percent':
      return `${prefix}${value}%`;
    
    case 'currency':
      // Smart formatting: K for thousands, M for millions
      if (scaledValue >= 1000000) {
        return `${prefix}$${(scaledValue / 1000000).toFixed(1)}M`;
      } else if (scaledValue >= 1000) {
        return `${prefix}$${(scaledValue / 1000).toFixed(0)}K`;
      } else {
        return `${prefix}$${scaledValue.toFixed(0)}`;
      }
    
    case 'number':
    default:
      return `${prefix}${value}`;
  }
}

/**
 * Generate display values for all nodes based on format
 */
export function generateNodeDisplayValues(
  nodes: SankeyNode[],
  format: ValueFormat,
  currencyScale: number = 10000
): SankeyNode[] {
  return nodes.map(node => ({
    ...node,
    displayValue: node.displayValue || formatValue(node.value, format, { 
      scale: format === 'currency' ? currencyScale : 1 
    }),
  }));
}

/**
 * Generate display labels for links based on type and format
 * Only loss/new/revenue links get labels by default
 */
export function generateLinkDisplayLabels(
  links: SankeyLink[],
  format: ValueFormat,
  currencyScale: number = 10000
): SankeyLink[] {
  return links.map(link => {
    // Skip default links - too cluttered
    if (link.type === 'default' || !link.type) {
      return link;
    }
    
    // Determine prefix based on link type
    let prefix = '';
    if (link.type === 'loss') {
      prefix = '-';
    } else if (link.type === 'new' || link.type === 'revenue') {
      prefix = '+';
    }
    
    return {
      ...link,
      displayLabel: link.displayLabel || formatValue(link.value, format, { 
        prefix, 
        scale: format === 'currency' ? currencyScale : 1 
      }),
    };
  });
}

/**
 * Apply display values to a SankeyData object
 */
export function applyDisplayValues(
  data: SankeyData,
  format: ValueFormat,
  currencyScale: number = 10000
): SankeyData {
  return {
    nodes: generateNodeDisplayValues(data.nodes, format, currencyScale),
    links: generateLinkDisplayLabels(data.links, format, currencyScale),
  };
}

/**
 * Merge user overrides with generated values
 */
export function mergeOverrides(
  data: SankeyData,
  overrides: ValueOverrides | null | undefined
): SankeyData {
  if (!overrides) return data;
  
  const nodes = data.nodes.map(node => {
    const override = overrides.nodes?.[node.id];
    if (override?.displayValue) {
      return { ...node, displayValue: override.displayValue };
    }
    return node;
  });
  
  const links = data.links.map(link => {
    const key = getLinkKey(link.from, link.to);
    const override = overrides.links?.[key];
    if (override?.displayLabel) {
      return { ...link, displayLabel: override.displayLabel };
    }
    return link;
  });
  
  return { nodes, links };
}

/**
 * Full pipeline: generate display values then apply overrides
 */
export function prepareFlowData(
  data: SankeyData,
  format: ValueFormat,
  overrides?: ValueOverrides | null,
  currencyScale: number = 10000
): SankeyData {
  // First generate default display values
  const withDefaults = applyDisplayValues(data, format, currencyScale);
  
  // Then apply any user overrides
  return mergeOverrides(withDefaults, overrides);
}