import { ReactNode, useState } from 'react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

export interface NavigationItem {
  icon: ReactNode;
  label: string;
  id: string;
  badge?: string;
  children?: NavigationItem[]; // Submenu items
}

interface TopNavigationProps {
  items: NavigationItem[];
  activeItem: string;
  onItemClick: (id: string) => void;
}

export function TopNavigation({ items, activeItem, onItemClick }: TopNavigationProps) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const isItemActive = (item: NavigationItem): boolean => {
    if (activeItem === item.id) return true;
    if (item.children) {
      return item.children.some(child => isItemActive(child));
    }
    return false;
  };

  return (
    <nav className="flex items-center gap-1 overflow-x-auto">
      {items.map((item) => {
        // If item has children, render as grouped menu
        if (item.children && item.children.length > 0) {
          const isActive = isItemActive(item);
          
          return (
            <div key={item.id} className="relative">
              <DropdownMenu
                open={openGroups[item.id] || false}
                onOpenChange={(open) => setOpenGroups(prev => ({ ...prev, [item.id]: open }))}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "relative flex items-center gap-2 px-4 h-12 rounded-none border-b-2 transition-colors whitespace-nowrap",
                      isActive
                        ? "border-blue-600 text-blue-700 bg-blue-50/50"
                        : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                    onClick={(e) => {
                      // If clicking the button (not the dropdown), navigate to first child or group id
                      if (!openGroups[item.id] && item.children && item.children.length > 0) {
                        // Optionally navigate to first child or group dashboard
                        // For now, just let dropdown open
                      }
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-1 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    <ChevronDown className={cn("w-4 h-4 transition-transform", openGroups[item.id] && "rotate-180")} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {item.children.map((child) => (
                    <DropdownMenuItem
                      key={child.id}
                      onClick={() => {
                        onItemClick(child.id);
                        setOpenGroups(prev => ({ ...prev, [item.id]: false }));
                      }}
                      className={cn(
                        "flex items-center gap-2 cursor-pointer",
                        activeItem === child.id && "bg-blue-50 text-blue-700"
                      )}
                    >
                      {child.icon}
                      <span>{child.label}</span>
                      {child.badge && (
                        <span className="ml-auto bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                          {child.badge}
                        </span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        }
        
        // Regular menu item without children
        return (
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
        );
      })}
    </nav>
  );
}


