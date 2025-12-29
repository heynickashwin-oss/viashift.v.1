import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth = false,
  loading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  const sizeClasses = {
    sm: 'h-8 px-3 text-sm gap-1.5',
    md: 'h-9 px-4 text-sm gap-2',
    lg: 'h-11 px-6 text-base gap-2.5',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`
        inline-flex items-center justify-center font-medium
        rounded-[var(--radius-md)] 
        transition-all duration-[var(--duration-fast)] ease-[var(--ease-out-cubic)]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${widthClass}
        ${className}
      `}
      disabled={disabled || loading}
      style={{
        // Variant styles via CSS variables
        ...(variant === 'primary' && {
          background: 'var(--color-brand-primary)',
          color: 'var(--bg-canvas)',
        }),
        ...(variant === 'secondary' && {
          background: 'var(--color-brand-secondary)',
          color: 'var(--bg-canvas)',
        }),
        ...(variant === 'ghost' && {
          background: 'transparent',
          border: '1px solid var(--border-default)',
          color: 'var(--text-primary)',
        }),
        ...(variant === 'danger' && {
          background: 'var(--color-loss)',
          color: 'var(--text-primary)',
        }),
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.filter = 'brightness(1.1)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          if (variant === 'ghost') {
            e.currentTarget.style.borderColor = 'var(--color-brand-primary)';
            e.currentTarget.style.color = 'var(--color-brand-primary)';
          }
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter = '';
        e.currentTarget.style.boxShadow = '';
        if (variant === 'ghost') {
          e.currentTarget.style.borderColor = 'var(--border-default)';
          e.currentTarget.style.color = 'var(--text-primary)';
        }
      }}
      {...props}
    >
      {loading && (
        <svg 
          className="animate-spin h-4 w-4" 
          viewBox="0 0 24 24"
          style={{ animation: 'spin var(--duration-slower) linear infinite' }}
        >
          <circle 
            className="opacity-25" 
            cx="12" cy="12" r="10" 
            stroke="currentColor" 
            strokeWidth="4" 
            fill="none" 
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};
