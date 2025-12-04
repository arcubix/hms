/**
 * Priority Modules Settings Component
 * Allows users to customize module visibility and order on their dashboard
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { 
  GripVertical,
  Search,
  Star,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  LayoutGrid,
  Save,
  RotateCcw,
  Users,
  Calendar,
  Activity,
  Pill,
  DollarSign,
  FileText,
  Stethoscope,
  Microscope,
  UserCog,
  Building,
  Bed,
  ClipboardList,
  Settings,
  TrendingUp,
  Package,
  AlertCircle,
  Clock,
  Shield,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Module {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: 'core' | 'clinical' | 'administrative' | 'financial' | 'analytics';
  enabled: boolean;
  priority: number;
  isPinned: boolean;
  roleAccess: string[];
}

const moduleIcons: { [key: string]: any } = {
  'patients': Users,
  'appointments': Calendar,
  'emergency': Activity,
  'pharmacy': Pill,
  'billing': DollarSign,
  'records': FileText,
  'doctors': Stethoscope,
  'laboratory': Microscope,
  'staff': UserCog,
  'departments': Building,
  'ipd': Bed,
  'opd': ClipboardList,
  'radiology': Activity,
  'analytics': TrendingUp,
  'inventory': Package,
  'triage': AlertCircle,
  'duty-roster': Clock,
  'indoor-duty-roster': Clock,
  'settings': Settings
};

const initialModules: Module[] = [
  {
    id: 'patients',
    name: 'Patient Management',
    description: 'Register, search, and manage patient records',
    icon: 'patients',
    category: 'core',
    enabled: true,
    priority: 1,
    isPinned: true,
    roleAccess: ['all']
  },
  {
    id: 'appointments',
    name: 'Appointments',
    description: 'Schedule and manage patient appointments',
    icon: 'appointments',
    category: 'core',
    enabled: true,
    priority: 2,
    isPinned: true,
    roleAccess: ['all']
  },
  {
    id: 'emergency',
    name: 'Emergency Department',
    description: 'Emergency triage and management',
    icon: 'emergency',
    category: 'clinical',
    enabled: true,
    priority: 3,
    isPinned: false,
    roleAccess: ['doctor', 'nurse', 'admin']
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy Management',
    description: 'Medicine inventory and POS system',
    icon: 'pharmacy',
    category: 'core',
    enabled: true,
    priority: 4,
    isPinned: true,
    roleAccess: ['pharmacy', 'admin']
  },
  {
    id: 'laboratory',
    name: 'Laboratory',
    description: 'Lab tests, results, and reporting',
    icon: 'laboratory',
    category: 'clinical',
    enabled: true,
    priority: 5,
    isPinned: false,
    roleAccess: ['lab', 'doctor', 'admin']
  },
  {
    id: 'radiology',
    name: 'Radiology',
    description: 'Imaging requests and reports',
    icon: 'radiology',
    category: 'clinical',
    enabled: true,
    priority: 6,
    isPinned: false,
    roleAccess: ['doctor', 'radiology', 'admin']
  },
  {
    id: 'ipd',
    name: 'In-Patient Department',
    description: 'Ward management and admissions',
    icon: 'ipd',
    category: 'clinical',
    enabled: true,
    priority: 7,
    isPinned: false,
    roleAccess: ['doctor', 'nurse', 'admin']
  },
  {
    id: 'opd',
    name: 'Out-Patient Department',
    description: 'OPD consultations and visits',
    icon: 'opd',
    category: 'clinical',
    enabled: true,
    priority: 8,
    isPinned: false,
    roleAccess: ['doctor', 'nurse', 'admin']
  },
  {
    id: 'billing',
    name: 'Billing & Payments',
    description: 'Invoice generation and payment tracking',
    icon: 'billing',
    category: 'financial',
    enabled: true,
    priority: 9,
    isPinned: false,
    roleAccess: ['finance', 'admin']
  },
  {
    id: 'doctors',
    name: 'Doctor Management',
    description: 'Doctor profiles and schedules',
    icon: 'doctors',
    category: 'administrative',
    enabled: true,
    priority: 10,
    isPinned: false,
    roleAccess: ['admin']
  },
  {
    id: 'staff',
    name: 'Staff Management',
    description: 'Employee records and attendance',
    icon: 'staff',
    category: 'administrative',
    enabled: true,
    priority: 11,
    isPinned: false,
    roleAccess: ['admin']
  },
  {
    id: 'departments',
    name: 'Departments',
    description: 'Hospital department management',
    icon: 'departments',
    category: 'administrative',
    enabled: true,
    priority: 12,
    isPinned: false,
    roleAccess: ['admin']
  },
  {
    id: 'inventory',
    name: 'Inventory Management',
    description: 'Medical supplies and equipment',
    icon: 'inventory',
    category: 'administrative',
    enabled: true,
    priority: 13,
    isPinned: false,
    roleAccess: ['admin', 'pharmacy']
  },
  {
    id: 'analytics',
    name: 'Analytics & Reports',
    description: 'Dashboard insights and analytics',
    icon: 'analytics',
    category: 'analytics',
    enabled: true,
    priority: 14,
    isPinned: false,
    roleAccess: ['admin', 'finance']
  },
  {
    id: 'duty-roster',
    name: 'Duty Roster',
    description: 'Staff scheduling and shifts',
    icon: 'duty-roster',
    category: 'administrative',
    enabled: true,
    priority: 15,
    isPinned: false,
    roleAccess: ['admin', 'nurse']
  },
  {
    id: 'indoor-duty-roster',
    name: 'Indoor Duty Roster',
    description: 'Doctor indoor duty scheduling and ward coverage',
    icon: 'indoor-duty-roster',
    category: 'administrative',
    enabled: true,
    priority: 16,
    isPinned: false,
    roleAccess: ['admin', 'doctor']
  },
  {
    id: 'records',
    name: 'Health Records',
    description: 'Medical history and documents',
    icon: 'records',
    category: 'clinical',
    enabled: true,
    priority: 17,
    isPinned: false,
    roleAccess: ['doctor', 'nurse', 'admin']
  }
];

export function PriorityModules() {
  const [modules, setModules] = useState<Module[]>(initialModules);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hasChanges, setHasChanges] = useState(false);

  const categories = [
    { id: 'all', name: 'All Modules', color: 'bg-gray-100 text-gray-800' },
    { id: 'core', name: 'Core', color: 'bg-blue-100 text-blue-800' },
    { id: 'clinical', name: 'Clinical', color: 'bg-green-100 text-green-800' },
    { id: 'administrative', name: 'Administrative', color: 'bg-purple-100 text-purple-800' },
    { id: 'financial', name: 'Financial', color: 'bg-orange-100 text-orange-800' },
    { id: 'analytics', name: 'Analytics', color: 'bg-pink-100 text-pink-800' }
  ];

  const filteredModules = modules
    .filter(module => {
      const matchesSearch = module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          module.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => a.priority - b.priority);

  const handleToggleModule = (moduleId: string) => {
    setModules(prev => prev.map(module => 
      module.id === moduleId ? { ...module, enabled: !module.enabled } : module
    ));
    setHasChanges(true);
  };

  const handleTogglePin = (moduleId: string) => {
    setModules(prev => prev.map(module => 
      module.id === moduleId ? { ...module, isPinned: !module.isPinned } : module
    ));
    setHasChanges(true);
  };

  const handleMovePriority = (moduleId: string, direction: 'up' | 'down') => {
    const index = modules.findIndex(m => m.id === moduleId);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      const newModules = [...modules];
      [newModules[index], newModules[index - 1]] = [newModules[index - 1], newModules[index]];
      // Update priority numbers
      newModules.forEach((module, idx) => {
        module.priority = idx + 1;
      });
      setModules(newModules);
      setHasChanges(true);
    } else if (direction === 'down' && index < modules.length - 1) {
      const newModules = [...modules];
      [newModules[index], newModules[index + 1]] = [newModules[index + 1], newModules[index]];
      // Update priority numbers
      newModules.forEach((module, idx) => {
        module.priority = idx + 1;
      });
      setModules(newModules);
      setHasChanges(true);
    }
  };

  const handleSaveChanges = () => {
    // Save to backend or localStorage
    localStorage.setItem('userModulePriorities', JSON.stringify(modules));
    toast.success('Module priorities saved successfully!');
    setHasChanges(false);
  };

  const handleResetToDefault = () => {
    setModules(initialModules);
    localStorage.removeItem('userModulePriorities');
    toast.success('Module priorities reset to default!');
    setHasChanges(false);
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat?.color || 'bg-gray-100 text-gray-800';
  };

  const enabledModulesCount = modules.filter(m => m.enabled).length;
  const pinnedModulesCount = modules.filter(m => m.isPinned).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Priority Modules</h2>
        <p className="text-sm text-gray-600 mt-1">
          Customize which modules appear on your dashboard and set their display order
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Modules</p>
                <p className="text-2xl font-bold text-gray-900">{modules.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <LayoutGrid className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Enabled</p>
                <p className="text-2xl font-bold text-gray-900">{enabledModulesCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pinned</p>
                <p className="text-2xl font-bold text-gray-900">{pinnedModulesCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Quick Access</p>
                <p className="text-2xl font-bold text-gray-900">{pinnedModulesCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      {hasChanges && (
        <Card className="border-0 shadow-sm bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-800">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">You have unsaved changes</span>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleResetToDefault}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset to Default
                </Button>
                <Button 
                  size="sm"
                  onClick={handleSaveChanges}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input 
                placeholder="Search modules..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={selectedCategory === category.id ? 'bg-[#2F80ED] hover:bg-[#2F80ED]/90' : ''}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modules List */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5" />
            Module Configuration
          </CardTitle>
          <CardDescription>
            Enable or disable modules, set priorities, and pin favorites for quick access
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredModules.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No modules found matching your criteria</p>
              </div>
            ) : (
              filteredModules.map((module, index) => {
                const IconComponent = moduleIcons[module.icon] || Settings;
                
                return (
                  <div 
                    key={module.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !module.enabled ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Priority & Drag Handle */}
                      <div className="flex flex-col items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleMovePriority(module.id, 'up')}
                          disabled={index === 0}
                        >
                          <ChevronUp className="w-4 h-4" />
                        </Button>
                        <div className="flex items-center gap-1">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-500 w-6 text-center">
                            {module.priority}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleMovePriority(module.id, 'down')}
                          disabled={index === filteredModules.length - 1}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Module Icon */}
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        module.enabled ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <IconComponent className={`w-6 h-6 ${
                          module.enabled ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                      </div>

                      {/* Module Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{module.name}</h4>
                          <Badge className={getCategoryColor(module.category)}>
                            {module.category}
                          </Badge>
                          {module.isPinned && (
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                              <Star className="w-3 h-3 mr-1 fill-yellow-600" />
                              Pinned
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{module.description}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {/* Pin/Unpin */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTogglePin(module.id)}
                          className={module.isPinned ? 'text-yellow-600 hover:text-yellow-700' : ''}
                          title={module.isPinned ? 'Unpin from Quick Access' : 'Pin to Quick Access'}
                        >
                          <Star className={`w-4 h-4 ${module.isPinned ? 'fill-yellow-600' : ''}`} />
                        </Button>

                        {/* Enable/Disable Toggle */}
                        <div className="flex items-center gap-2 px-3">
                          <Label htmlFor={`toggle-${module.id}`} className="sr-only">
                            {module.enabled ? 'Disable' : 'Enable'} {module.name}
                          </Label>
                          <Switch
                            id={`toggle-${module.id}`}
                            checked={module.enabled}
                            onCheckedChange={() => handleToggleModule(module.id)}
                          />
                          {module.enabled ? (
                            <Eye className="w-4 h-4 text-green-600" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white border-blue-100">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-2">Module Priority Information</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Priority Order:</strong> Modules with lower numbers appear first on your dashboard</li>
                <li>• <strong>Pinned Modules:</strong> Quick access modules shown in the sidebar navigation</li>
                <li>• <strong>Enabled/Disabled:</strong> Toggle to show or hide modules from your interface</li>
                <li>• <strong>Categories:</strong> Filter modules by type for easier organization</li>
                <li>• <strong>Role Access:</strong> Some modules may be restricted based on your user role</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button at Bottom */}
      {hasChanges && (
        <div className="sticky bottom-4 flex justify-end gap-2">
          <Button 
            variant="outline" 
            size="lg"
            onClick={handleResetToDefault}
            className="shadow-lg"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Default
          </Button>
          <Button 
            size="lg"
            onClick={handleSaveChanges}
            className="bg-[#2F80ED] hover:bg-[#2F80ED]/90 text-white shadow-lg"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Module Priorities
          </Button>
        </div>
      )}
    </div>
  );
}