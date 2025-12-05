import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  X,
  Check,
  Star,
  Sparkles,
  ChevronRight,
  Grid3x3,
  Zap,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { api } from '../../services/api';
import { getModuleIcon, getModuleGradient } from '../../config/modules';

interface Module {
  id: string;
  label: string;
  icon: any;
  description: string;
  color: string; // Format: "from-blue-500 to-blue-600"
  colorFrom?: string; // For direct access
  colorTo?: string; // For direct access
  category: string;
}

// Module data will be loaded from API

interface PriorityModulesProps {
  onClose?: () => void;
  userRole?: string;
}


export function PriorityModules({ onClose, userRole = 'admin' }: PriorityModulesProps) {
  const [allModules, setAllModules] = useState<Module[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load modules from API
  useEffect(() => {
    const loadModules = async () => {
      try {
        setLoading(true);
        
        // Fetch all available modules
        const modulesData = await api.getAllModules();
        
        // Fetch user's priority modules
        const priorityModulesData = await api.getPriorityModules();
        
        // Map database modules to component structure
        const mappedModules: Module[] = modulesData.map((module) => {
          const IconComponent = getModuleIcon(module.icon_name);
          const gradient = getModuleGradient(module.color_from, module.color_to);
          
          return {
            id: module.module_id,
            label: module.label,
            icon: IconComponent,
            description: module.description || '',
            color: `from-${module.color_from} to-${module.color_to}`,
            colorFrom: module.color_from,
            colorTo: module.color_to,
            category: module.category,
          };
        });
        
        setAllModules(mappedModules);
        
        // Set selected modules from priority modules
        const priorityIds = priorityModulesData.map((pm) => pm.module_id);
        setSelectedModules(priorityIds.length > 0 ? priorityIds : ['dashboard', 'opd', 'emergency', 'patients', 'appointments', 'laboratory', 'pharmacy']);
        
      } catch (error) {
        console.error('Failed to load modules:', error);
        toast.error('Failed to load modules', {
          description: 'Please refresh the page and try again.'
        });
        
        // Fallback to default modules if API fails
        const defaultModules: Module[] = [
          { id: 'dashboard', label: 'Dashboard', icon: getModuleIcon('BarChart3'), description: 'Overview and analytics', color: 'from-blue-500 to-blue-600', colorFrom: 'blue-500', colorTo: 'blue-600', category: 'Core' },
          { id: 'opd', label: 'OPD', icon: getModuleIcon('Activity'), description: 'Outpatient department', color: 'from-cyan-500 to-cyan-600', colorFrom: 'cyan-500', colorTo: 'cyan-600', category: 'Operations' },
          { id: 'emergency', label: 'Emergency', icon: getModuleIcon('Ambulance'), description: 'Emergency department', color: 'from-red-500 to-red-600', colorFrom: 'red-500', colorTo: 'red-600', category: 'Critical' },
          { id: 'patients', label: 'Patients', icon: getModuleIcon('Users'), description: 'Patient management', color: 'from-green-500 to-green-600', colorFrom: 'green-500', colorTo: 'green-600', category: 'Core' },
          { id: 'appointments', label: 'Appointments', icon: getModuleIcon('Calendar'), description: 'Appointment scheduling', color: 'from-orange-500 to-orange-600', colorFrom: 'orange-500', colorTo: 'orange-600', category: 'Operations' },
          { id: 'laboratory', label: 'Laboratory', icon: getModuleIcon('TestTube'), description: 'Lab tests and results', color: 'from-green-500 to-green-600', colorFrom: 'green-500', colorTo: 'green-600', category: 'Clinical' },
          { id: 'pharmacy', label: 'Pharmacy', icon: getModuleIcon('Pill'), description: 'Medication management', color: 'from-purple-500 to-purple-600', colorFrom: 'purple-500', colorTo: 'purple-600', category: 'Clinical' },
        ];
        setAllModules(defaultModules);
        setSelectedModules(['dashboard', 'opd', 'emergency', 'patients', 'appointments', 'laboratory', 'pharmacy']);
      } finally {
        setLoading(false);
      }
    };

    loadModules();
  }, []);

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

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Save to database via API
      await api.savePriorityModules(selectedModules);
      
      toast.success('Priority modules saved successfully!', {
        description: 'Your navigation menu will update automatically.'
      });
      
      // Trigger a custom event to notify other components
      window.dispatchEvent(new CustomEvent('priority-modules-updated'));
      
      if (onClose) {
        setTimeout(() => onClose(), 1000);
      }
    } catch (error: any) {
      console.error('Failed to save priority modules:', error);
      toast.error('Failed to save priority modules', {
        description: error?.message || 'Please try again later.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const defaultModules = ['dashboard', 'opd', 'emergency', 'patients', 'appointments', 'laboratory', 'pharmacy'];
    setSelectedModules(defaultModules);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading modules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Grid3x3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
                  Priority Modules
                  <Badge className="bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium px-3 py-1 rounded-full">
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
      <div className="max-w-7xl mx-auto px-6 py-8 pb-24">
        {/* Info Banner */}
        <Card className="mb-8 border border-blue-100 bg-blue-50/30 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2 text-base">
                  Quick Access Navigation
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  Choose the modules you use most frequently. These will appear in your navigation bar for quick access. 
                  You can always access other modules from the "More" dropdown menu.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-white border-gray-200 text-gray-700 text-xs font-medium px-2.5 py-1">
                    <Star className="w-3 h-3 mr-1.5 text-amber-500" />
                    Up to 7 modules
                  </Badge>
                  <Badge variant="outline" className="bg-white border-gray-200 text-gray-700 text-xs font-medium px-2.5 py-1">
                    <TrendingUp className="w-3 h-3 mr-1.5 text-emerald-500" />
                    Instant access
                  </Badge>
                  <Badge variant="outline" className="bg-white border-gray-200 text-gray-700 text-xs font-medium px-2.5 py-1">
                    <Grid3x3 className="w-3 h-3 mr-1.5 text-blue-500" />
                    Customizable
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Modules Preview */}
        <Card className="mb-8 shadow-sm border border-gray-200 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Your Priority Modules</h3>
              <Badge className="bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                {selectedModules.length} of 7 selected
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedModules.map((moduleId, index) => {
                const module = allModules.find(m => m.id === moduleId);
                if (!module) return null;
                const IconComponent = module.icon;
                const gradient = module.colorFrom && module.colorTo 
                  ? getModuleGradient(module.colorFrom, module.colorTo)
                  : getModuleGradient('blue-500', 'blue-600');
                
                return (
                  <div
                    key={moduleId}
                    className="group relative inline-flex"
                  >
                    <div 
                      className="flex items-center gap-2 px-4 py-3 rounded-full text-white shadow-sm hover:shadow-md transition-all h-10"
                      style={{
                        background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`
                      }}
                    >
                      <IconComponent className="w-4 h-4 text-white flex-shrink-0" />
                      <span className="font-semibold text-sm text-white whitespace-nowrap leading-tight">{module.label}</span>
                      <span className="text-xs text-white/90 font-medium leading-tight">Position #{index + 1}</span>
                      <button
                        onClick={() => handleModuleToggle(moduleId)}
                        className="ml-1 w-5 h-5 hover:bg-white/25 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                      >
                        <X className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {selectedModules.length < 7 && (
                Array.from({ length: 7 - selectedModules.length }).map((_, idx) => (
                  <div 
                    key={`empty-${idx}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border-2 border-dashed border-gray-300 bg-white text-gray-400"
                  >
                    <Grid3x3 className="w-4 h-4" />
                    <span className="text-sm font-medium">Empty</span>
                  </div>
                ))
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
                  const gradient = module.colorFrom && module.colorTo 
                  ? getModuleGradient(module.colorFrom, module.colorTo)
                  : getModuleGradient('blue-500', 'blue-600');
                  
                  return (
                    <Card
                      key={module.id}
                      className={`
                        group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1
                        ${selected 
                          ? 'ring-2 ring-blue-500 shadow-lg bg-white border-2 border-blue-200' 
                          : 'shadow-md hover:shadow-lg bg-white border border-gray-200'
                        }
                      `}
                      onClick={() => handleModuleToggle(module.id)}
                      onMouseEnter={() => setHoveredModule(module.id)}
                      onMouseLeave={() => setHoveredModule(null)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div 
                            className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-md transition-all ${hoveredModule === module.id ? 'scale-110' : 'scale-100'}`}
                            style={{
                              background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`
                            }}
                          >
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          
                          <div className={`
                            w-6 h-6 rounded-full flex items-center justify-center transition-all flex-shrink-0
                            ${selected 
                              ? 'bg-blue-500 scale-100' 
                              : 'bg-gray-200 scale-90'
                            }
                          `}>
                            {selected && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                        </div>
                        
                        <h4 className="font-semibold text-gray-900 mb-1.5 text-base leading-tight">{module.label}</h4>
                        <p className="text-xs text-gray-500 mb-4 leading-relaxed">{module.description}</p>
                        
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200 text-gray-600 px-2 py-0.5">
                            {module.category}
                          </Badge>
                          
                          {selected && (
                            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm flex-shrink-0">
                              <Star className="w-3 h-3 fill-white" />
                              Priority
                            </span>
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
        <Card className="mt-8 bg-white shadow-sm border border-gray-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                {selectedModules.length === 7 ? (
                  <p className="text-sm font-medium text-emerald-700 flex items-center gap-2">
                    <span className="text-base">✅</span>
                    You have selected all 7 priority modules
                  </p>
                ) : (
                  <p className="text-sm font-medium text-gray-900">
                    Select {7 - selectedModules.length} more module{7 - selectedModules.length !== 1 ? 's' : ''} ({selectedModules.length}/7)
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1.5">
                  Changes will be reflected after saving and refreshing the page
                </p>
              </div>
              <div className="flex gap-3">
                {onClose && (
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="px-6 border-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 shadow-sm"
                  disabled={selectedModules.length === 0 || saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Save Priority Modules
                    </>
                  )}
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
