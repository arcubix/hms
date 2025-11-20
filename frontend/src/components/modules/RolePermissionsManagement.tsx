import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { api, RolePermission } from '../../services/api';
import { Search, Save, RefreshCw, CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface RolePermissionsManagementProps {
  onBack?: () => void;
}

export function RolePermissionsManagement({ onBack }: RolePermissionsManagementProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [roles, setRoles] = useState<Record<string, string>>({});
  const [permissionDefinitions, setPermissionDefinitions] = useState<RolePermission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Load available roles
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const availableRoles = await api.getAvailableRoles();
        setRoles(availableRoles);
        // Set first role as selected by default
        const firstRole = Object.keys(availableRoles)[0];
        if (firstRole) {
          setSelectedRole(firstRole);
        }
      } catch (error) {
        console.error('Failed to load roles:', error);
        toast.error('Failed to load roles');
      }
    };
    loadRoles();
  }, []);

  // Load permission definitions
  useEffect(() => {
    const loadPermissionDefinitions = async () => {
      try {
        setLoading(true);
        const definitions = await api.getPermissionDefinitions();
        setPermissionDefinitions(definitions);
      } catch (error) {
        console.error('Failed to load permission definitions:', error);
        toast.error('Failed to load permission definitions');
      } finally {
        setLoading(false);
      }
    };
    loadPermissionDefinitions();
  }, []);

  // Load permissions for selected role
  useEffect(() => {
    const loadRolePermissions = async () => {
      if (!selectedRole) return;
      
      try {
        setLoading(true);
        const permissions = await api.getRolePermissions(selectedRole);
        setRolePermissions(prev => ({
          ...prev,
          [selectedRole]: permissions
        }));
      } catch (error) {
        console.error('Failed to load role permissions:', error);
        toast.error('Failed to load role permissions');
      } finally {
        setLoading(false);
      }
    };
    loadRolePermissions();
  }, [selectedRole]);

  // Get unique categories from permission definitions
  const categories = ['all', ...Array.from(new Set(permissionDefinitions.map(p => p.category).filter(Boolean)))];

  // Filter permissions based on search and category
  const filteredPermissions = permissionDefinitions.filter(perm => {
    const matchesSearch = !searchTerm || 
      perm.permission_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perm.permission_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (perm.description && perm.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || perm.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Group permissions by category
  const groupedPermissions = filteredPermissions.reduce((acc, perm) => {
    const category = perm.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(perm);
    return acc;
  }, {} as Record<string, RolePermission[]>);

  const handleTogglePermission = (permissionKey: string) => {
    if (!selectedRole) return;
    
    const currentPerms = rolePermissions[selectedRole] || [];
    const newPerms = currentPerms.includes(permissionKey)
      ? currentPerms.filter(p => p !== permissionKey)
      : [...currentPerms, permissionKey];
    
    setRolePermissions(prev => ({
      ...prev,
      [selectedRole]: newPerms
    }));
  };

  const handleSelectAllInCategory = (category: string) => {
    if (!selectedRole) return;
    
    const categoryPerms = groupedPermissions[category] || [];
    const currentPerms = rolePermissions[selectedRole] || [];
    const categoryKeys = categoryPerms.map(p => p.permission_key);
    
    // Check if all are selected
    const allSelected = categoryKeys.every(key => currentPerms.includes(key));
    
    if (allSelected) {
      // Unselect all in category
      setRolePermissions(prev => ({
        ...prev,
        [selectedRole]: currentPerms.filter(p => !categoryKeys.includes(p))
      }));
    } else {
      // Select all in category
      const newPerms = [...new Set([...currentPerms, ...categoryKeys])];
      setRolePermissions(prev => ({
        ...prev,
        [selectedRole]: newPerms
      }));
    }
  };

  const handleSelectAll = () => {
    if (!selectedRole) return;
    
    const allKeys = permissionDefinitions.map(p => p.permission_key);
    const currentPerms = rolePermissions[selectedRole] || [];
    const allSelected = allKeys.every(key => currentPerms.includes(key));
    
    if (allSelected) {
      setRolePermissions(prev => ({
        ...prev,
        [selectedRole]: []
      }));
    } else {
      setRolePermissions(prev => ({
        ...prev,
        [selectedRole]: allKeys
      }));
    }
  };

  const handleSave = async () => {
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }
    
    try {
      setSaving(true);
      const permissions = rolePermissions[selectedRole] || [];
      await api.updateRolePermissions(selectedRole, permissions);
      toast.success(`Permissions updated successfully for ${selectedRole}`);
    } catch (error) {
      console.error('Failed to save role permissions:', error);
      toast.error('Failed to save role permissions');
    } finally {
      setSaving(false);
    }
  };

  const getSelectedCount = () => {
    if (!selectedRole) return 0;
    return (rolePermissions[selectedRole] || []).length;
  };

  const getTotalCount = () => {
    return permissionDefinitions.length;
  };

  const isPermissionSelected = (permissionKey: string) => {
    if (!selectedRole) return false;
    return (rolePermissions[selectedRole] || []).includes(permissionKey);
  };

  const isCategoryFullySelected = (category: string) => {
    if (!selectedRole) return false;
    const categoryPerms = groupedPermissions[category] || [];
    if (categoryPerms.length === 0) return false;
    const currentPerms = rolePermissions[selectedRole] || [];
    return categoryPerms.every(perm => currentPerms.includes(perm.permission_key));
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const expandAllCategories = () => {
    const allExpanded: Record<string, boolean> = {};
    Object.keys(groupedPermissions).forEach(cat => {
      allExpanded[cat] = true;
    });
    setExpandedCategories(allExpanded);
  };

  const collapseAllCategories = () => {
    setExpandedCategories({});
  };

  // Auto-expand categories when role is selected and permissions are loaded
  useEffect(() => {
    if (selectedRole && permissionDefinitions.length > 0 && Object.keys(groupedPermissions).length > 0) {
      const allExpanded: Record<string, boolean> = {};
      Object.keys(groupedPermissions).forEach(cat => {
        allExpanded[cat] = true; // Start with all expanded, user can collapse
      });
      setExpandedCategories(allExpanded);
    }
  }, [selectedRole, permissionDefinitions.length]);

  return (
    <div className="space-y-6 p-6">
      {onBack && (
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Role Permissions Management</h1>
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
        </div>
      )}
      {!onBack && <h1 className="text-3xl font-bold">Role Permissions Management</h1>}

      <Card>
        <CardHeader>
          <CardTitle>Select Role</CardTitle>
          <CardDescription>Choose a role to manage its permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Role Selection Dropdown */}
            <div className="flex items-center gap-4">
              <Label htmlFor="role-select" className="font-medium min-w-[100px]">
                Role:
              </Label>
              <select
                id="role-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              >
                <option value="">-- Select a Role --</option>
                {Object.entries(roles).map(([roleKey, roleDescription]) => (
                  <option key={roleKey} value={roleKey}>
                    {roleKey}
                  </option>
                ))}
              </select>
              {selectedRole && (
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {getSelectedCount()} / {getTotalCount()} selected
                </Badge>
              )}
            </div>
            
            {/* Role Description */}
            {selectedRole && roles[selectedRole] && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">{selectedRole}:</span> {roles[selectedRole]}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedRole && (
        <>
          <Card className="sticky top-0 z-10 shadow-md">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle>Permissions for {selectedRole}</CardTitle>
                  <CardDescription>
                    {getSelectedCount()} of {getTotalCount()} permissions selected
                  </CardDescription>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={expandAllCategories}
                  >
                    Expand All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={collapseAllCategories}
                  >
                    Collapse All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {getSelectedCount() === getTotalCount() ? 'Unselect All' : 'Select All'}
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              </div>
              {/* Search and Filter */}
              <div className="flex gap-4 mt-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search permissions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px]"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </CardHeader>
          </Card>

              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                  <p className="mt-2 text-gray-600">Loading permissions...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(groupedPermissions).map(([category, perms]) => {
                    const isExpanded = expandedCategories[category] !== false; // Default to expanded
                    const selectedInCategory = perms.filter(p => isPermissionSelected(p.permission_key)).length;
                    
                    return (
                      <Card key={category} className="overflow-hidden">
                        <div 
                          className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer border-b"
                          onClick={() => toggleCategory(category)}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                            <div>
                              <h3 className="font-semibold text-base capitalize">
                                {category === 'other' ? 'Other Permissions' : category.replace(/_/g, ' ')}
                              </h3>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {selectedInCategory} of {perms.length} selected
                              </p>
                            </div>
                            <Badge variant="outline" className="ml-2">
                              {perms.length}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectAllInCategory(category);
                            }}
                            className="ml-2"
                          >
                            {isCategoryFullySelected(category) ? (
                              <>
                                <XCircle className="w-4 h-4 mr-1" />
                                Unselect All
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Select All
                              </>
                            )}
                          </Button>
                        </div>
                        {isExpanded && (
                          <CardContent className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                              {perms.map(perm => (
                                <div
                                  key={perm.permission_key}
                                  className="flex items-start space-x-2 p-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-200"
                                >
                                  <Checkbox
                                    id={perm.permission_key}
                                    checked={isPermissionSelected(perm.permission_key)}
                                    onCheckedChange={() => handleTogglePermission(perm.permission_key)}
                                    className="mt-1"
                                  />
                                  <Label
                                    htmlFor={perm.permission_key}
                                    className="font-normal cursor-pointer text-sm flex-1"
                                  >
                                    <div className="font-medium">{perm.permission_name}</div>
                                    {perm.description && (
                                      <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                        {perm.description}
                                      </div>
                                    )}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                  {filteredPermissions.length === 0 && (
                    <Card>
                      <CardContent className="py-8 text-center text-gray-500">
                        No permissions found matching your search criteria.
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
        </>
      )}

      {!selectedRole && (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            Please select a role to manage its permissions.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

