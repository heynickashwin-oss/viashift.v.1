import { ReactNode, useState, useRef, useEffect } from 'react';

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
}

export const Dropdown = ({ trigger, children }: DropdownProps) => {
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
        <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-lg shadow-lg overflow-hidden z-50">
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
}

export const DropdownItem = ({ onClick, children, danger = false }: DropdownItemProps) => {
  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-3 text-left transition-all duration-150 ease-smooth ${
        danger
          ? 'text-red-400 hover:bg-red-500/10'
          : 'text-white hover:bg-primary/10'
      }`}
    >
      {children}
    </button>
  );
};
