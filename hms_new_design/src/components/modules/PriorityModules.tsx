import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
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
  Settings,
  BookOpen,
  Brain,
  X,
  Check,
  Star,
  Sparkles,
  ChevronRight,
  Grid3x3,
  Zap,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Module {
  id: string;
  label: string;
  icon: any;
  description: string;
  color: string;
  category: string;
}

// All available modules with their icons and metadata
const allModules: Module[] = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: BarChart3,
    description: 'Overview and analytics',
    color: 'from-blue-500 to-blue-600',
    category: 'Core'
  },
  { 
    id: 'analytics', 
    label: 'Analytics', 
    icon: Activity,
    description: 'Data insights and trends',
    color: 'from-purple-500 to-purple-600',
    category: 'Core'
  },
  { 
    id: 'emergency', 
    label: 'Emergency', 
    icon: Ambulance,
    description: 'Emergency department',
    color: 'from-red-500 to-red-600',
    category: 'Critical'
  },
  { 
    id: 'patients', 
    label: 'Patients', 
    icon: Users,
    description: 'Patient management',
    color: 'from-green-500 to-green-600',
    category: 'Core'
  },
  { 
    id: 'doctors', 
    label: 'Doctors', 
    icon: Stethoscope,
    description: 'Doctor directory',
    color: 'from-teal-500 to-teal-600',
    category: 'Core'
  },
  { 
    id: 'appointments', 
    label: 'Appointments', 
    icon: Calendar,
    description: 'Appointment scheduling',
    color: 'from-orange-500 to-orange-600',
    category: 'Operations'
  },
  { 
    id: 'opd', 
    label: 'OPD', 
    icon: Activity,
    description: 'Outpatient department',
    color: 'from-cyan-500 to-cyan-600',
    category: 'Operations'
  },
  { 
    id: 'ipd', 
    label: 'IPD Management', 
    icon: Hospital,
    description: 'Inpatient department',
    color: 'from-indigo-500 to-indigo-600',
    category: 'Operations'
  },
  { 
    id: 'beds', 
    label: 'Bed Management', 
    icon: Bed,
    description: 'Bed allocation and status',
    color: 'from-pink-500 to-pink-600',
    category: 'Operations'
  },
  { 
    id: 'healthrecords', 
    label: 'Health Records', 
    icon: FileText,
    description: 'Medical records',
    color: 'from-blue-500 to-blue-600',
    category: 'Clinical'
  },
  { 
    id: 'laboratory', 
    label: 'Laboratory', 
    icon: TestTube,
    description: 'Lab tests and results',
    color: 'from-green-500 to-green-600',
    category: 'Clinical'
  },
  { 
    id: 'pharmacy', 
    label: 'Pharmacy', 
    icon: Pill,
    description: 'Medication management',
    color: 'from-purple-500 to-purple-600',
    category: 'Clinical'
  },
  { 
    id: 'billing', 
    label: 'Billing', 
    icon: DollarSign,
    description: 'Financial transactions',
    color: 'from-yellow-500 to-yellow-600',
    category: 'Financial'
  },
  { 
    id: 'reports', 
    label: 'Reports', 
    icon: Newspaper,
    description: 'Generate reports',
    color: 'from-gray-500 to-gray-600',
    category: 'Core'
  },
  { 
    id: 'radiology', 
    label: 'Radiology', 
    icon: Brain,
    description: 'Imaging and scans',
    color: 'from-rose-500 to-rose-600',
    category: 'Clinical'
  },
  { 
    id: 'evaluation', 
    label: 'Evaluation', 
    icon: BookOpen,
    description: 'AI-powered insights',
    color: 'from-violet-500 to-violet-600',
    category: 'Analytics'
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: Settings,
    description: 'System configuration',
    color: 'from-slate-500 to-slate-600',
    category: 'System'
  },
];

interface PriorityModulesProps {
  onClose?: () => void;
  userRole?: string;
}

export function PriorityModules({ onClose, userRole = 'admin' }: PriorityModulesProps) {
  // Load saved priority modules from localStorage
  const loadSavedModules = (): string[] => {
    try {
      const saved = localStorage.getItem('priority-modules');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load priority modules:', error);
    }
    // Default 7 priority modules
    return ['dashboard', 'opd', 'emergency', 'patients', 'appointments', 'laboratory', 'pharmacy'];
  };

  const [selectedModules, setSelectedModules] = useState<string[]>(loadSavedModules());
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);

  const handleModuleToggle = (moduleId: string) => {
    if (selectedModules.includes(moduleId)) {
      // Remove module if already selected
      if (selectedModules.length > 1) {
        setSelectedModules(selectedModules.filter(id => id !== moduleId));
        toast.info('Module removed', {
          description: `${allModules.find(m => m.id === moduleId)?.label} has been removed from priority modules`
        });
      } else {
        toast.error('At least one module required', {
          description: 'You must have at least one priority module selected'
        });
      }
    } else {
      // Add module if not already selected
      if (selectedModules.length < 7) {
        setSelectedModules([...selectedModules, moduleId]);
        toast.success('Module added', {
          description: `${allModules.find(m => m.id === moduleId)?.label} has been added to priority modules`
        });
      } else {
        toast.error('Maximum modules reached', {
          description: 'You can only select up to 7 priority modules'
        });
      }
    }
  };

  const handleSave = () => {
    try {
      localStorage.setItem('priority-modules', JSON.stringify(selectedModules));
      toast.success('Priority modules saved successfully!', {
        description: 'Please refresh the page to see the changes in the navigation bar.'
      });
      
      // Trigger a custom event to notify other components
      window.dispatchEvent(new CustomEvent('priority-modules-updated'));
      
      if (onClose) {
        setTimeout(() => onClose(), 1000);
      }
    } catch (error) {
      console.error('Failed to save priority modules:', error);
      toast.error('Failed to save priority modules');
    }
  };

  const handleReset = () => {
    setSelectedModules(['dashboard', 'opd', 'emergency', 'patients', 'appointments', 'laboratory', 'pharmacy']);
    toast.info('Priority modules reset to defaults');
  };

  const isSelected = (moduleId: string) => selectedModules.includes(moduleId);

  // Group modules by category
  const modulesByCategory = allModules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, Module[]>);

  const categories = Object.keys(modulesByCategory);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 z-50 overflow-auto">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Grid3x3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl text-gray-900 flex items-center gap-2">
                  Priority Modules
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    {selectedModules.length}/7 Selected
                  </Badge>
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Select up to 7 modules to display in your navigation bar
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleReset}
                className="border-gray-300"
              >
                Reset to Default
              </Button>
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Info Banner */}
        <Card className="mb-8 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Quick Access Navigation
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  Choose the modules you use most frequently. These will appear in your navigation bar for quick access. 
                  You can always access other modules from the "More" dropdown menu.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-white/50">
                    <Star className="w-3 h-3 mr-1 text-yellow-500" />
                    Up to 7 modules
                  </Badge>
                  <Badge variant="outline" className="bg-white/50">
                    <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                    Instant access
                  </Badge>
                  <Badge variant="outline" className="bg-white/50">
                    <Grid3x3 className="w-3 h-3 mr-1 text-blue-500" />
                    Customizable
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Modules Preview */}
        <Card className="mb-8 shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Your Priority Modules</h3>
              <Badge className="bg-blue-100 text-blue-700">
                {selectedModules.length} of 7 selected
              </Badge>
            </div>
            <div className="flex flex-wrap gap-3">
              {selectedModules.map((moduleId, index) => {
                const module = allModules.find(m => m.id === moduleId);
                if (!module) return null;
                const IconComponent = module.icon;
                return (
                  <div
                    key={moduleId}
                    className="group relative"
                  >
                    <div className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-blue-200 bg-gradient-to-r ${module.color}
                      text-white shadow-lg transition-all
                    `}>
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{module.label}</p>
                        <p className="text-xs text-white/80">Position #{index + 1}</p>
                      </div>
                      <button
                        onClick={() => handleModuleToggle(moduleId)}
                        className="ml-2 w-6 h-6 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {selectedModules.length < 7 && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Grid3x3 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Empty Slot</p>
                    <p className="text-xs">Select a module</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Available Modules by Category */}
        <div className="space-y-8">
          {categories.map(category => (
            <div key={category}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900">{category} Modules</h3>
                <Badge variant="outline" className="text-xs">
                  {modulesByCategory[category].length} modules
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {modulesByCategory[category].map(module => {
                  const IconComponent = module.icon;
                  const selected = isSelected(module.id);
                  
                  return (
                    <Card
                      key={module.id}
                      className={`
                        group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-0
                        ${selected 
                          ? 'ring-2 ring-blue-500 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50' 
                          : 'shadow-md hover:shadow-xl bg-white'
                        }
                      `}
                      onClick={() => handleModuleToggle(module.id)}
                      onMouseEnter={() => setHoveredModule(module.id)}
                      onMouseLeave={() => setHoveredModule(null)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`
                            w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all
                            bg-gradient-to-br ${module.color}
                            ${hoveredModule === module.id ? 'scale-110' : 'scale-100'}
                          `}>
                            <IconComponent className="w-7 h-7 text-white" />
                          </div>
                          
                          <div className={`
                            w-7 h-7 rounded-full flex items-center justify-center transition-all
                            ${selected 
                              ? 'bg-blue-500 scale-100' 
                              : 'bg-gray-200 scale-90'
                            }
                          `}>
                            {selected && <Check className="w-4 h-4 text-white" />}
                          </div>
                        </div>
                        
                        <h4 className="font-semibold text-gray-900 mb-1">{module.label}</h4>
                        <p className="text-xs text-gray-500 mb-3">{module.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {module.category}
                          </Badge>
                          
                          {selected && (
                            <Badge className="bg-blue-500 text-white text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              Priority
                            </Badge>
                          )}
                        </div>
                        
                        {hoveredModule === module.id && !selected && selectedModules.length < 7 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-center gap-2 text-blue-600 text-sm font-medium">
                              <span>Click to add</span>
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>
                        )}
                        
                        {hoveredModule === module.id && selected && (
                          <div className="mt-3 pt-3 border-t border-blue-200">
                            <div className="flex items-center justify-center gap-2 text-red-600 text-sm font-medium">
                              <span>Click to remove</span>
                              <X className="w-4 h-4" />
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <Card className="mt-8 bg-white shadow-lg border-0 sticky bottom-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {selectedModules.length === 7 
                    ? '✅ You have selected all 7 priority modules' 
                    : `Select ${7 - selectedModules.length} more module${7 - selectedModules.length !== 1 ? 's' : ''} (${selectedModules.length}/7)`
                  }
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Changes will be reflected after saving and refreshing the page
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
                  disabled={selectedModules.length === 0}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Save Priority Modules
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Note */}
        <Card className="mt-6 border-l-4 border-l-blue-500 bg-blue-50/50">
          <CardContent className="p-4">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> After saving, please refresh the page to see your changes reflected in the navigation bar. 
              Your selected modules will be displayed prominently at the top of your dashboard for quick access.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
