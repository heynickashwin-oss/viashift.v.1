import {
  GatewayIcon,
  DatabaseIcon,
  UserIcon,
  TeamIcon,
  ProcessorIcon,
  DocumentIcon,
  ServerIcon,
  SecurityIcon,
  AnalyticsIcon,
  CloudIcon,
  ApiIcon,
  StorageIcon,
  SalesIcon,
  TechnicalIcon,
  BusinessIcon,
  GeneralIcon,
  PainIcon,
  ImpactIcon,
  DecisionIcon,
  PeopleIcon,
  TimelineIcon,
  CompetitionIcon,
} from './Icon';

// ============================================================================
// NODE TYPE TO ICON MAPPING
// Use in templates: nodeTypeToIcon[node.nodeType]
// ============================================================================

export const nodeTypeToIcon = {
  gateway: GatewayIcon,
  database: DatabaseIcon,
  user: UserIcon,
  team: TeamIcon,
  processor: ProcessorIcon,
  document: DocumentIcon,
  server: ServerIcon,
  security: SecurityIcon,
  analytics: AnalyticsIcon,
  cloud: CloudIcon,
  api: ApiIcon,
  storage: StorageIcon,
} as const;

export type NodeType = keyof typeof nodeTypeToIcon;

// ============================================================================
// CATEGORY TO ICON MAPPING
// ============================================================================

export const categoryToIcon = {
  sales: SalesIcon,
  technical: TechnicalIcon,
  business: BusinessIcon,
  general: GeneralIcon,
} as const;

export type CategoryType = keyof typeof categoryToIcon;

// ============================================================================
// DISCOVERY CONFIDENCE FRAMEWORK MAPPING
// ============================================================================

export const discoveryToIcon = {
  pain: PainIcon,
  impact: ImpactIcon,
  decision: DecisionIcon,
  people: PeopleIcon,
  timeline: TimelineIcon,
  competition: CompetitionIcon,
} as const;

export type DiscoveryType = keyof typeof discoveryToIcon;