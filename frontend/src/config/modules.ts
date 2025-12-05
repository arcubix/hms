/**
 * Module Icons Configuration
 * Maps database icon_name to React icon components
 */
import {
  BarChart3,
  Activity,
  Ambulance,
  Users,
  Stethoscope,
  Calendar,
  Hospital,
  Bed,
  FileText,
  TestTube,
  Pill,
  DollarSign,
  Newspaper,
  Brain,
  BookOpen,
  Settings,
  UserCheck,
  Scan,
  Package,
  MessageSquare,
  UserCog,
  Clock,
  AlertCircle,
  TrendingUp,
  Building,
  ClipboardList,
  Microscope,
} from 'lucide-react';

export const moduleIcons: Record<string, any> = {
  'BarChart3': BarChart3,
  'Activity': Activity,
  'Ambulance': Ambulance,
  'Users': Users,
  'Stethoscope': Stethoscope,
  'Calendar': Calendar,
  'Hospital': Hospital,
  'Bed': Bed,
  'FileText': FileText,
  'TestTube': TestTube,
  'Pill': Pill,
  'DollarSign': DollarSign,
  'Newspaper': Newspaper,
  'Brain': Brain,
  'BookOpen': BookOpen,
  'Settings': Settings,
  'UserCheck': UserCheck,
  'Scan': Scan,
  'Package': Package,
  'MessageSquare': MessageSquare,
  'UserCog': UserCog,
  'Clock': Clock,
  'AlertCircle': AlertCircle,
  'TrendingUp': TrendingUp,
  'Building': Building,
  'ClipboardList': ClipboardList,
  'Microscope': Microscope,
};

/**
 * Get React icon component from icon name
 */
export const getModuleIcon = (iconName: string | null | undefined) => {
  if (!iconName) {
    return Settings; // Default icon
  }
  return moduleIcons[iconName] || Settings;
};

/**
 * Get gradient colors from color strings
 */
export const getModuleGradient = (colorFrom: string, colorTo: string): { from: string; to: string } => {
  const colorMap: Record<string, { from: string; to: string }> = {
    'blue-500': { from: '#3b82f6', to: '#2563eb' },
    'blue-600': { from: '#2563eb', to: '#1d4ed8' },
    'purple-500': { from: '#a855f7', to: '#9333ea' },
    'purple-600': { from: '#9333ea', to: '#7e22ce' },
    'red-500': { from: '#ef4444', to: '#dc2626' },
    'red-600': { from: '#dc2626', to: '#b91c1c' },
    'green-500': { from: '#10b981', to: '#059669' },
    'green-600': { from: '#059669', to: '#047857' },
    'teal-500': { from: '#14b8a6', to: '#0d9488' },
    'teal-600': { from: '#0d9488', to: '#0f766e' },
    'orange-500': { from: '#f97316', to: '#ea580c' },
    'orange-600': { from: '#ea580c', to: '#c2410c' },
    'cyan-500': { from: '#06b6d4', to: '#0891b2' },
    'cyan-600': { from: '#0891b2', to: '#0e7490' },
    'indigo-500': { from: '#6366f1', to: '#4f46e5' },
    'indigo-600': { from: '#4f46e5', to: '#4338ca' },
    'pink-500': { from: '#ec4899', to: '#db2777' },
    'pink-600': { from: '#db2777', to: '#be185d' },
    'yellow-500': { from: '#eab308', to: '#ca8a04' },
    'yellow-600': { from: '#ca8a04', to: '#a16207' },
    'gray-500': { from: '#6b7280', to: '#4b5563' },
    'gray-600': { from: '#4b5563', to: '#374151' },
    'rose-500': { from: '#f43f5e', to: '#e11d48' },
    'rose-600': { from: '#e11d48', to: '#be123c' },
    'violet-500': { from: '#8b5cf6', to: '#7c3aed' },
    'violet-600': { from: '#7c3aed', to: '#6d28d9' },
    'slate-500': { from: '#64748b', to: '#475569' },
    'slate-600': { from: '#475569', to: '#334155' },
  };

  const fromColor = colorMap[colorFrom]?.from || colorMap['blue-500'].from;
  const toColor = colorMap[colorTo]?.to || colorMap['blue-600'].to;

  return { from: fromColor, to: toColor };
};

