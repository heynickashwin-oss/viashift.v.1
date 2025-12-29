import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = ({ label, error, hint, className = '', ...props }: InputProps) => {
  return (
    <div className="w-full">
      {label && (
        <label 
          className="block text-sm font-medium mb-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          {label}
        </label>
      )}
      <input
        className={`w-full h-10 px-3 py-2 text-sm outline-none ${className}`}
        style={{
          background: 'var(--bg-surface)',
          border: error ? '1px solid var(--color-loss)' : '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-primary)',
          transition: 'border-color var(--duration-fast) var(--ease-out-cubic), box-shadow var(--duration-fast) var(--ease-out-cubic)',
        }}
        onFocus={(e) => {
          if (!error) {
            e.currentTarget.style.borderColor = 'var(--color-brand-primary)';
            e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-brand-primary-muted)';
          }
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? 'var(--color-loss)' : 'var(--border-default)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        {...props}
      />
      {hint && !error && (
        <p className="mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
          {hint}
        </p>
      )}
      {error && (
        <p className="mt-1.5 text-xs" style={{ color: 'var(--color-loss)' }}>
          {error}
        </p>
      )}
    </div>
  );
};
