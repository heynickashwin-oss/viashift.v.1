import React from 'react';
import { tokens, IconSize } from './tokens';

// ============================================================================
// BASE ICON COMPONENT
// ============================================================================

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, 'color'> {
  size?: IconSize;
  color?: string;
  children?: React.ReactNode;
}

const getColor = (color: string): string => {
  if (color === 'currentColor') return color;
  if (color.startsWith('#') || color.startsWith('rgb')) return color;
  
  // Handle simple token names: 'primary', 'accent', etc.
  const simpleColor = (tokens.colors as Record<string, unknown>)[color];
  if (typeof simpleColor === 'string') return simpleColor;
  
  // Handle dot notation: 'text.primary' -> tokens.colors.text.primary
  const parts = color.split('.');
  let result: unknown = tokens.colors;
  for (const part of parts) {
    result = (result as Record<string, unknown>)?.[part];
  }
  return typeof result === 'string' ? result : color;
};

const getSize = (size: IconSize): number => {
  return typeof size === 'number' ? size : tokens.sizes[size] || 20;
};

export const Icon: React.FC<IconProps> = ({
  children,
  size = 'md',
  color = 'currentColor',
  className = '',
  style = {},
  ...props
}) => {
  const pixelSize = getSize(size);
  const fillColor = getColor(color);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 24 24"
      fill="none"
      stroke={fillColor}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`viashift-icon ${className}`}
      style={{ flexShrink: 0, ...style }}
      {...props}
    >
      {children}
    </svg>
  );
};

// ============================================================================
// FLOW NODE ICONS
// ============================================================================

export const GatewayIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
    <line x1="12" y1="2" x2="12" y2="22" />
  </Icon>
);

export const DatabaseIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 5v14c0 1.66-4.03 3-9 3s-9-1.34-9-3V5" />
    <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
  </Icon>
);

export const UserIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" />
  </Icon>
);

export const TeamIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <circle cx="9" cy="7" r="3" />
    <circle cx="17" cy="7" r="3" />
    <path d="M2 21v-1a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1" />
    <path d="M14 21v-1a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v1" />
  </Icon>
);

export const ProcessorIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3v3" />
    <path d="M12 18v3" />
    <path d="M3 12h3" />
    <path d="M18 12h3" />
  </Icon>
);

export const DocumentIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="16" y2="17" />
  </Icon>
);

export const ServerIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <rect x="2" y="3" width="20" height="6" rx="1" />
    <rect x="2" y="15" width="20" height="6" rx="1" />
    <circle cx="6" cy="6" r="1" fill="currentColor" />
    <circle cx="6" cy="18" r="1" fill="currentColor" />
    <line x1="10" y1="6" x2="18" y2="6" />
    <line x1="10" y1="18" x2="18" y2="18" />
  </Icon>
);

export const SecurityIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M12 2L3 7v6c0 5.25 3.82 10.16 9 11 5.18-.84 9-5.75 9-11V7l-9-5z" />
    <polyline points="9 12 11 14 15 10" />
  </Icon>
);

export const AnalyticsIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M21 21H4a1 1 0 0 1-1-1V3" />
    <path d="M7 14l4-4 4 4 5-5" />
    <circle cx="20" cy="9" r="2" fill="currentColor" />
  </Icon>
);

export const CloudIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M18 10h-1.26A7 7 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
  </Icon>
);

export const ApiIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </Icon>
);

export const StorageIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </Icon>
);

// ============================================================================
// NAVIGATION ICONS
// ============================================================================

export const HomeIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </Icon>
);

export const TemplatesIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </Icon>
);

export const ShiftsIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M2 12h4l3-9 4 18 3-9h6" />
  </Icon>
);

export const ShareIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </Icon>
);

export const SettingsIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Icon>
);

export const ProfileIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Icon>
);

export const LogoutIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </Icon>
);

export const HelpIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </Icon>
);

export const NotificationIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </Icon>
);

export const SearchIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Icon>
);

// ============================================================================
// ACTION ICONS
// ============================================================================

export const AddIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </Icon>
);

export const EditIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </Icon>
);

export const DeleteIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </Icon>
);

export const DuplicateIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Icon>
);

export const SaveIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </Icon>
);

export const DownloadIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </Icon>
);

export const UploadIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </Icon>
);

export const PlayIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none" />
  </Icon>
);

export const PauseIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <rect x="6" y="4" width="4" height="16" fill="currentColor" stroke="none" />
    <rect x="14" y="4" width="4" height="16" fill="currentColor" stroke="none" />
  </Icon>
);

export const RefreshIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </Icon>
);

export const ExternalLinkIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </Icon>
);

export const LinkIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </Icon>
);

// ============================================================================
// STATUS ICONS
// ============================================================================

export const SuccessIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon color={props.color || 'accent'} {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="9 12 11 14 15 10" />
  </Icon>
);

export const WarningIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon color={props.color || 'warning'} {...props}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </Icon>
);

export const ErrorIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon color={props.color || 'error'} {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </Icon>
);

export const InfoIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon color={props.color || 'primary'} {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </Icon>
);

export const PendingIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </Icon>
);

// ============================================================================
// DISCOVERY CONFIDENCE FRAMEWORK ICONS
// ============================================================================

export const PainIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 15h8" />
    <path d="M9 9h.01" />
    <path d="M15 9h.01" />
  </Icon>
);

export const ImpactIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v8" />
    <path d="M8 12h8" />
  </Icon>
);

export const DecisionIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16l4-4-4-4" />
    <path d="M8 12h8" />
  </Icon>
);

export const PeopleIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="5" r="3" />
    <circle cx="5" cy="19" r="2" />
    <circle cx="19" cy="19" r="2" />
    <path d="M12 8v5" />
    <path d="M7 17l5-4 5 4" />
  </Icon>
);

export const TimelineIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </Icon>
);

export const CompetitionIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="12" y1="3" x2="12" y2="21" />
    <line x1="3" y1="12" x2="21" y2="12" />
  </Icon>
);

// ============================================================================
// TEMPLATE CATEGORY ICONS
// ============================================================================

export const SalesIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </Icon>
);

export const TechnicalIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
    <line x1="14" y1="4" x2="10" y2="20" />
  </Icon>
);

export const BusinessIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </Icon>
);

export const GeneralIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </Icon>
);

// ============================================================================
// UTILITY ICONS
// ============================================================================

export const ChevronUpIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <polyline points="18 15 12 9 6 15" />
  </Icon>
);

export const ChevronDownIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <polyline points="6 9 12 15 18 9" />
  </Icon>
);

export const ChevronLeftIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <polyline points="15 18 9 12 15 6" />
  </Icon>
);

export const ChevronRightIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <polyline points="9 18 15 12 9 6" />
  </Icon>
);

export const CloseIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </Icon>
);

export const MenuIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </Icon>
);

export const MoreIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="19" cy="12" r="1" fill="currentColor" />
    <circle cx="5" cy="12" r="1" fill="currentColor" />
  </Icon>
);

export const MoreVerticalIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="12" cy="5" r="1" fill="currentColor" />
    <circle cx="12" cy="19" r="1" fill="currentColor" />
  </Icon>
);

export const EyeIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);

export const EyeOffIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </Icon>
);

export const LockIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Icon>
);

export const UnlockIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </Icon>
);

export const ClockIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </Icon>
);

export const CalendarIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </Icon>
);

export const MailIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22 6 12 13 2 6" />
  </Icon>
);

export const MessageIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" />
  </Icon>
);

export const StarIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </Icon>
);

export const FilterIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </Icon>
);

export const SortIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <line x1="4" y1="6" x2="16" y2="6" />
    <line x1="4" y1="12" x2="12" y2="12" />
    <line x1="4" y1="18" x2="8" y2="18" />
    <polyline points="16 14 20 18 16 22" />
    <line x1="20" y1="18" x2="20" y2="10" />
  </Icon>
);

export const GridViewIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </Icon>
);

export const ListViewIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </Icon>
);

// ============================================================================
// VIASHIFT LOGO ICON (Custom viewBox)
// ============================================================================

export const ViashiftLogoIcon: React.FC<Omit<IconProps, 'children'>> = ({
  size = 'md',
  color = 'primary',
  className = '',
  style = {},
  ...props
}) => {
  const pixelSize = typeof size === 'number' ? size : tokens.sizes[size] || 20;
  const fillColor = getColor(color);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 32 32"
      fill="none"
      stroke={fillColor}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`viashift-icon viashift-logo ${className}`}
      style={{ flexShrink: 0, ...style }}
      {...props}
    >
      <path d="M16 4L6 14h8v14l6-10h-8V4z" />
      <path d="M20 8l6 10h-8" />
    </svg>
  );
};