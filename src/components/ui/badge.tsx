import { ReactNode, CSSProperties } from 'react';

type BadgeVariant = 
  | 'default' 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'warning' 
  | 'danger' 
  | 'info'
  | 'outline';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}: BadgeProps) => {
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
  };

  const variantStyles: Record<BadgeVariant, CSSProperties> = {
    default: {
      background: 'var(--border-default)',
      color: 'var(--text-primary)',
    },
    primary: {
      background: 'var(--color-brand-primary-muted)',
      color: 'var(--color-brand-primary)',
    },
    secondary: {
      background: 'var(--color-brand-secondary-muted)',
      color: 'var(--color-brand-secondary)',
    },
    success: {
      background: 'var(--color-success-muted)',
      color: 'var(--color-success)',
    },
    warning: {
      background: 'var(--color-warning-muted)',
      color: 'var(--color-warning)',
    },
    danger: {
      background: 'var(--color-loss-muted)',
      color: 'var(--color-loss)',
    },
    info: {
      background: 'var(--color-info-muted)',
      color: 'var(--color-info)',
    },
    outline: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border-default)',
    },
  };

  // Dot color matches text color
  const dotColor = variantStyles[variant].color;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium ${sizeClasses[size]} ${className}`}
      style={{
        borderRadius: 'var(--radius-sm)',
        ...variantStyles[variant],
      }}
    >
      {dot && (
        <span 
          className="w-1.5 h-1.5 rounded-full" 
          style={{ background: dotColor }}
        />
      )}
      {children}
    </span>
  );
};

// Stakeholder-specific badges (fixed colors, not brand)
type StakeholderType = 'finance' | 'sales' | 'operations' | 'users' | 'leadership';

interface StakeholderBadgeProps {
  type: StakeholderType;
  children?: ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

const stakeholderLabels: Record<StakeholderType, string> = {
  finance: 'Finance',
  sales: 'Sales',
  operations: 'Operations',
  users: 'Users',
  leadership: 'Leadership',
};

export const StakeholderBadge = ({
  type,
  children,
  size = 'md',
  className = '',
}: StakeholderBadgeProps) => {
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium ${sizeClasses[size]} ${className}`}
      style={{
        borderRadius: 'var(--radius-sm)',
        background: `color-mix(in srgb, var(--color-stakeholder-${type}) 15%, transparent)`,
        color: `var(--color-stakeholder-${type})`,
      }}
    >
      <span 
        className="w-1.5 h-1.5 rounded-full" 
        style={{ background: `var(--color-stakeholder-${type})` }}
      />
      {children || stakeholderLabels[type]}
    </span>
  );
};
