import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  children: ReactNode;
  fullWidth?: boolean;
}

export const Button = ({
  variant = 'primary',
  children,
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) => {
  const baseClasses = 'h-9 px-4 py-2 rounded-lg font-medium transition-all duration-150 ease-smooth disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';

  const variantClasses = {
    primary: 'bg-primary text-background hover:shadow hover:brightness-110',
    secondary: 'bg-accent text-background hover:shadow hover:brightness-110',
    ghost: 'bg-transparent border border-border text-white hover:border-primary hover:text-primary',
    danger: 'bg-red-600 text-white hover:bg-red-700 hover:shadow',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
