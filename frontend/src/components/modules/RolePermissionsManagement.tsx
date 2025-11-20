import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { api, RolePermission } from '../../services/api';
import { Search, Save, RefreshCw } from 'lucide-react';

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
  const [rolePermissionMappings, setRolePermissionMappings] = useState<Record<string, string[]>>({});
  const [searchTerm, setSearchTerm] = useState('');

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

  // Load permission definitions and role mappings
  useEffect(() => {
    const loadPermissionDefinitions = async () => {
      try {
        setLoading(true);
        const [definitions, mappings] = await Promise.all([
          api.getPermissionDefinitions(),
          api.getRolePermissionMappings()
        ]);
        setPermissionDefinitions(definitions);
        setRolePermissionMappings(mappings);
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

  // Filter permissions based on search and remove duplicates
  const filteredPermissions = permissionDefinitions.filter(perm => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      perm.permission_name.toLowerCase().includes(searchLower) ||
      perm.permission_key.toLowerCase().includes(searchLower) ||
      (perm.description && perm.description.toLowerCase().includes(searchLower))
    );
  });

  // Remove duplicates based on permission_key (in case there are any)
  const uniquePermissions = filteredPermissions.filter((perm, index, self) =>
    index === self.findIndex(p => p.permission_key === perm.permission_key)
  );

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
              {/* Search */}
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
              </div>
            </CardHeader>
          </Card>

              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                  <p className="mt-2 text-gray-600">Loading permissions...</p>
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    {uniquePermissions.length === 0 ? (
                      <div className="py-8 text-center text-gray-500">
                        No permissions found matching your search criteria.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {uniquePermissions.map(perm => (
                          <div
                            key={perm.permission_key}
                            className="flex items-start space-x-2 p-2 hover:bg-gray-50 rounded"
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
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {perm.description}
                                </div>
                              )}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
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

