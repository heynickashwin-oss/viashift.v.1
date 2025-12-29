interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white' | 'muted';
  className?: string;
}

export const Spinner = ({
  size = 'md',
  color = 'primary',
  className = '',
}: SpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const colorStyles = {
    primary: 'var(--color-brand-primary)',
    secondary: 'var(--color-brand-secondary)',
    white: 'var(--text-primary)',
    muted: 'var(--text-muted)',
  };

  return (
    <svg
      className={`${sizeClasses[size]} ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      style={{
        animation: 'spin var(--duration-slower) linear infinite',
      }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeOpacity={0.2}
        style={{ color: colorStyles[color] }}
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        style={{ color: colorStyles[color] }}
      />
    </svg>
  );
};

// Full-page loading overlay
interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay = ({ message }: LoadingOverlayProps) => (
  <div 
    className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4"
    style={{ background: 'rgba(10, 10, 15, 0.9)' }}
  >
    <Spinner size="lg" />
    {message && (
      <p 
        className="text-sm"
        style={{ color: 'var(--text-secondary)' }}
      >
        {message}
      </p>
    )}
  </div>
);

// Inline loading state
interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState = ({ message = 'Loading...', className = '' }: LoadingStateProps) => (
  <div className={`flex items-center justify-center gap-3 py-8 ${className}`}>
    <Spinner size="md" color="muted" />
    <span style={{ color: 'var(--text-muted)' }}>{message}</span>
  </div>
);
