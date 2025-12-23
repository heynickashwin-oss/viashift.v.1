// ============================================================================
// VIASHIFT ICON SYSTEM - PUBLIC API
// Usage: import { DatabaseIcon, tokens } from '@/components/icons'
// ============================================================================

// Design tokens
export { tokens, type IconSize, type TokenColor } from './tokens';

// Base component and all icons
export {
  Icon,
  type IconProps,
  // Flow Node Icons
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
  // Navigation Icons
  HomeIcon,
  TemplatesIcon,
  ShiftsIcon,
  ShareIcon,
  SettingsIcon,
  ProfileIcon,
  LogoutIcon,
  HelpIcon,
  NotificationIcon,
  SearchIcon,
  // Action Icons
  AddIcon,
  EditIcon,
  DeleteIcon,
  DuplicateIcon,
  SaveIcon,
  DownloadIcon,
  UploadIcon,
  PlayIcon,
  PauseIcon,
  RefreshIcon,
  ExternalLinkIcon,
  LinkIcon,
  // Status Icons
  SuccessIcon,
  WarningIcon,
  ErrorIcon,
  InfoIcon,
  PendingIcon,
  // Discovery Framework Icons
  PainIcon,
  ImpactIcon,
  DecisionIcon,
  PeopleIcon,
  TimelineIcon,
  CompetitionIcon,
  // Template Category Icons
  SalesIcon,
  TechnicalIcon,
  BusinessIcon,
  GeneralIcon,
  // Utility Icons
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  MenuIcon,
  MoreIcon,
  MoreVerticalIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  UnlockIcon,
  ClockIcon,
  CalendarIcon,
  MailIcon,
  MessageIcon,
  StarIcon,
  FilterIcon,
  SortIcon,
  GridViewIcon,
  ListViewIcon,
  // Logo
  ViashiftLogoIcon,
} from './Icon';

// Mappings for templates
export {
  nodeTypeToIcon,
  categoryToIcon,
  discoveryToIcon,
  type NodeType,
  type CategoryType,
  type DiscoveryType,
} from './mappings';