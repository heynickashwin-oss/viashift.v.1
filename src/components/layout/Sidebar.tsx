import { ReactNode } from 'react';
import { Logo } from '../ui/Logo';

interface SidebarProps {
  children: ReactNode;
}

export const Sidebar = ({ children }: SidebarProps) => {
  return (
    <div className="w-80 bg-surface border-r border-border h-screen flex flex-col">
      <div className="p-4 flex-shrink-0">
        <Logo size="sm" />
      </div>
      <div className="flex-1 p-4 space-y-6 overflow-y-auto pb-32">{children}</div>
    </div>
  );
};

interface SidebarSectionProps {
  title: string;
  children: ReactNode;
}

export const SidebarSection = ({ title, children }: SidebarSectionProps) => {
  return (
    <div>
      <h3 className="text-sm font-medium text-[#A0A0A0] mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
};
