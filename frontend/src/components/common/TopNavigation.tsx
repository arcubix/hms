import { ReactNode } from 'react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

export interface NavigationItem {
  icon: ReactNode;
  label: string;
  id: string;
  badge?: string;
}

interface TopNavigationProps {
  items: NavigationItem[];
  activeItem: string;
  onItemClick: (id: string) => void;
}

export function TopNavigation({ items, activeItem, onItemClick }: TopNavigationProps) {
  return (
    <nav className="flex items-center gap-1 overflow-x-auto">
      {items.map((item) => (
        <Button
          key={item.id}
          variant="ghost"
          className={cn(
            "relative flex items-center gap-2 px-4 h-12 rounded-none border-b-2 transition-colors whitespace-nowrap",
            activeItem === item.id
              ? "border-blue-600 text-blue-700 bg-blue-50/50"
              : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          )}
          onClick={() => onItemClick(item.id)}
        >
          {item.icon}
          <span>{item.label}</span>
          {item.badge && (
            <span className="ml-1 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
              {item.badge}
            </span>
          )}
        </Button>
      ))}
    </nav>
  );
}


