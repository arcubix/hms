import { ChevronRight, Home } from 'lucide-react';
import { Button } from '../ui/button';
import { ShareButton } from './ShareButton';

interface BreadcrumbItem {
  label: string;
  id?: string;
  onClick?: () => void;
}

interface NavigationBreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate?: (sectionId: string) => void;
  showShare?: boolean;
}

export function NavigationBreadcrumb({ items, onNavigate, showShare = true }: NavigationBreadcrumbProps) {
  return (
    <nav className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-1 text-sm text-gray-600">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-gray-600 hover:text-gray-900"
          onClick={() => onNavigate?.('dashboard')}
        >
          <Home className="w-4 h-4" />
        </Button>
        {items.map((item, index) => (
          <div key={index} className="flex items-center">
            <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
            {item.onClick || item.id ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-gray-600 hover:text-gray-900"
                onClick={() => {
                  if (item.onClick) {
                    item.onClick();
                  } else if (item.id && onNavigate) {
                    onNavigate(item.id);
                  }
                }}
              >
                {item.label}
              </Button>
            ) : (
              <span className="px-2 py-1 text-gray-900 font-medium">
                {item.label}
              </span>
            )}
          </div>
        ))}
      </div>
      {showShare && (
        <ShareButton title={`HMS Pharmacy - ${items[items.length - 1]?.label || 'Dashboard'}`} />
      )}
    </nav>
  );
}