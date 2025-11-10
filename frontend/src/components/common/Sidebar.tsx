import { ReactNode } from 'react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

export interface SidebarItem {
  icon: ReactNode;
  label: string;
  id: string;
  badge?: string;
}

interface SidebarProps {
  items: SidebarItem[];
  activeItem: string;
  onItemClick: (id: string) => void;
  title?: string;
}

export function Sidebar({ items, activeItem, onItemClick, title }: SidebarProps) {
  return (
    <div className="h-full flex flex-col">
      {title && (
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg text-gray-900">{title}</h2>
        </div>
      )}
      
      <nav className="flex-1 p-4 space-y-2">
        {items.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 h-12 text-left",
              activeItem === item.id
                ? "bg-blue-50 text-blue-700 border-blue-100"
                : "text-gray-700 hover:bg-gray-50"
            )}
            onClick={() => onItemClick(item.id)}
          >
            {item.icon}
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                {item.badge}
              </span>
            )}
          </Button>
        ))}
      </nav>
    </div>
  );
}