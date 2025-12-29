import { ReactNode, CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'sunken';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  interactive?: boolean;
}

export const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  style,
  onClick,
  interactive = false,
}: CardProps) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const variantStyles: Record<string, CSSProperties> = {
    default: {
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
    },
    elevated: {
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-default)',
      boxShadow: 'var(--shadow-md)',
    },
    outlined: {
      background: 'transparent',
      border: '1px solid var(--border-default)',
    },
    sunken: {
      background: 'var(--bg-sunken)',
      border: '1px solid var(--border-subtle)',
    },
  };

  return (
    <div
      className={`${paddingClasses[padding]} ${className}`}
      style={{
        borderRadius: 'var(--radius-lg)',
        transition: interactive 
          ? 'transform var(--duration-fast) var(--ease-out-cubic), border-color var(--duration-fast) var(--ease-out-cubic), box-shadow var(--duration-fast) var(--ease-out-cubic)' 
          : undefined,
        cursor: onClick || interactive ? 'pointer' : undefined,
        ...variantStyles[variant],
        ...style,
      }}
      onClick={onClick}
      onMouseEnter={interactive ? (e) => {
        e.currentTarget.style.borderColor = 'var(--border-hover)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
      } : undefined}
      onMouseLeave={interactive ? (e) => {
        e.currentTarget.style.borderColor = variantStyles[variant].border?.toString().split(' ').pop() || '';
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = variantStyles[variant].boxShadow?.toString() || '';
      } : undefined}
    >
      {children}
    </div>
  );
};

// Card subcomponents
export const CardHeader = ({ 
  children, 
  className = '' 
}: { 
  children: ReactNode; 
  className?: string;
}) => (
  <div 
    className={`pb-3 mb-3 ${className}`}
    style={{ borderBottom: '1px solid var(--border-subtle)' }}
  >
    {children}
  </div>
);

export const CardTitle = ({ 
  children, 
  className = '' 
}: { 
  children: ReactNode; 
  className?: string;
}) => (
  <h3 
    className={`text-base font-semibold ${className}`}
    style={{ color: 'var(--text-primary)' }}
  >
    {children}
  </h3>
);

export const CardDescription = ({ 
  children, 
  className = '' 
}: { 
  children: ReactNode; 
  className?: string;
}) => (
  <p 
    className={`text-sm mt-1 ${className}`}
    style={{ color: 'var(--text-muted)' }}
  >
    {children}
  </p>
);

export const CardContent = ({ 
  children, 
  className = '' 
}: { 
  children: ReactNode; 
  className?: string;
}) => (
  <div className={className}>
    {children}
  </div>
);

export const CardFooter = ({ 
  children, 
  className = '' 
}: { 
  children: ReactNode; 
  className?: string;
}) => (
  <div 
    className={`pt-3 mt-3 flex items-center gap-2 ${className}`}
    style={{ borderTop: '1px solid var(--border-subtle)' }}
  >
    {children}
  </div>
);
