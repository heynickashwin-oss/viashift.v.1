import { ReactNode, useState, useRef, useEffect } from 'react';

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
}

export const Dropdown = ({ trigger, children, align = 'right' }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div 
          className={`absolute mt-2 w-48 overflow-hidden z-50 ${align === 'right' ? 'right-0' : 'left-0'}`}
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            animation: 'scaleIn var(--duration-fast) var(--ease-out-cubic) forwards',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

interface DropdownItemProps {
  onClick: () => void;
  children: ReactNode;
  danger?: boolean;
  icon?: ReactNode;
}

export const DropdownItem = ({ onClick, children, danger = false, icon }: DropdownItemProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2.5"
      style={{
        color: danger ? 'var(--color-loss)' : 'var(--text-primary)',
        transition: 'background var(--duration-instant) var(--ease-out-cubic)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger 
          ? 'var(--color-loss-muted)' 
          : 'var(--color-brand-primary-muted)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      {icon && <span className="opacity-70">{icon}</span>}
      {children}
    </button>
  );
};

export const DropdownDivider = () => (
  <div 
    className="my-1 mx-2" 
    style={{ 
      height: '1px', 
      background: 'var(--border-subtle)' 
    }} 
  />
);
