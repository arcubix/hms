/**
 * User Settings Component
 * Manages user permissions and settings based on screenshots
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { Info, Save } from 'lucide-react';
import { api, UserSettings, RolePermission, UserSettingsFormData } from '../../services/api';
import { toast } from 'sonner';

interface UserSettingsProps {
  userId: number;
  onSuccess?: () => void;
}

const FOLLOW_UP_SHARE_TYPES = [
  'Patient Care Order',
  'Reports',
  'Pharmacy Orders',
  'Files',
  'Blood Bank',
  'Doctor Recommendation',
  'Vitals',
  'Nursing Notes',
  'Lab Order',
  'Intake & Output',
  'Operation Requests',
  'Doctor Consultation Request',
  'Admission Form',
  'Procedures',
  'Radiology Order',
  'Laboratory',
  'Health Records',
  'Health and Physical',
  'Nutrition',
  'Nursing Forms',
  'Radiology',
  'Rehabilation'
];

const ROLE_CATEGORIES = [
  { key: 'staff', label: 'Staff Role User Rights', category: 'staff' },
  { key: 'bloodBankManager', label: 'Blood Bank Manager User Rights', category: 'blood_bank_manager' },
  { key: 'nurse', label: 'Nurse Role User Rights', category: 'nurse' },
  { key: 'inventoryManager', label: 'Inventory Manager User Rights', category: 'inventory_manager' },
  { key: 'labManager', label: 'Laboratory Manager User Rights', category: 'lab_manager' },
  { key: 'accountant', label: 'Accountant Role User Rights', category: 'accountant' },
  { key: 'labTechnician', label: 'Laboratory Technician User Rights', category: 'lab_technician' },
  { key: 'radiologyTechnician', label: 'Radiology Technician User Rights', category: 'radiology_technician' },
  { key: 'radiologyManager', label: 'Radiology Manager User Rights', category: 'radiology_manager' },
  { key: 'pharmacist', label: 'Pharmacist User Rights', category: 'pharmacist' },
  { key: 'labReceptionist', label: 'Lab Receptionist User Rights', category: 'lab_receptionist' },
  { key: 'doctor', label: 'Doctor Role User Rights', category: 'doctor' },
  { key: 'admin', label: 'Admin Role User Rights', category: 'admin' }
];

export function UserSettings({ userId, onSuccess }: UserSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [permissionDefinitions, setPermissionDefinitions] = useState<RolePermission[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  
  const [settings, setSettings] = useState<UserSettingsFormData>({
    consultation_fee: 0,
    follow_up_charges: 0,
    follow_up_share_price: 0,
    share_price: 0,
    share_type: 'Rupees',
    follow_up_share_types: [],
    lab_share_value: 0,
    lab_share_type: 'percentage',
    radiology_share_value: 0,
    radiology_share_type: 'percentage',
    instant_booking: false,
    visit_charges: false,
    invoice_edit_count: 0,
    rolePermissions: {}
  });

  useEffect(() => {
    loadSettings();
    loadPermissionDefinitions();
    loadUserPermissions();
  }, [userId]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const userSettings = await api.getUserSettings(userId);
      if (userSettings) {
        setSettings(prev => ({
          ...prev,
          ...userSettings,
          rolePermissions: prev.rolePermissions // Keep existing role permissions structure
        }));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPermissionDefinitions = async () => {
    try {
      const definitions = await api.getPermissionDefinitions();
      setPermissionDefinitions(definitions);
      
      // Group permissions by category
      const grouped: Record<string, string[]> = {};
      definitions.forEach(perm => {
        const category = perm.category || 'other';
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push(perm.permission_key);
      });
      
      // Update role permissions dynamically based on available categories
      const rolePerms: Record<string, string[]> = {};
      ROLE_CATEGORIES.forEach(roleCat => {
        rolePerms[roleCat.key] = grouped[roleCat.category] || [];
      });
      
      setSettings(prev => ({
        ...prev,
        rolePermissions: rolePerms
      }));
    } catch (error) {
      console.error('Failed to load permission definitions:', error);
    }
  };

  const loadUserPermissions = async () => {
    try {
      const permissions = await api.getUserPermissions(userId);
      setUserPermissions(permissions);
    } catch (error) {
      console.error('Failed to load user permissions:', error);
    }
  };

  const handleTogglePermission = (roleKey: keyof typeof settings.rolePermissions, permissionKey: string) => {
    setSettings(prev => {
      const rolePerms = prev.rolePermissions[roleKey];
      const newPerms = rolePerms.includes(permissionKey)
        ? rolePerms.filter(p => p !== permissionKey)
        : [...rolePerms, permissionKey];
      
      return {
        ...prev,
        rolePermissions: {
          ...prev.rolePermissions,
          [roleKey]: newPerms
        }
      };
    });
  };

  const handleToggleFollowUpShareType = (type: string) => {
    setSettings(prev => ({
      ...prev,
      follow_up_share_types: prev.follow_up_share_types.includes(type)
        ? prev.follow_up_share_types.filter(t => t !== type)
        : [...prev.follow_up_share_types, type]
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Save settings
      const settingsToSave: Partial<UserSettings> = {
        consultation_fee: settings.consultation_fee,
        follow_up_charges: settings.follow_up_charges,
        follow_up_share_price: settings.follow_up_share_price,
        share_price: settings.share_price,
        share_type: settings.share_type,
        follow_up_share_types: settings.follow_up_share_types,
        lab_share_value: settings.lab_share_value,
        lab_share_type: settings.lab_share_type,
        radiology_share_value: settings.radiology_share_value,
        radiology_share_type: settings.radiology_share_type,
        instant_booking: settings.instant_booking,
        visit_charges: settings.visit_charges,
        invoice_edit_count: settings.invoice_edit_count
      };
      
      await api.updateUserSettings(userId, settingsToSave);
      
      // Save permissions - combine all role permissions
      const allPermissions: Record<string, boolean> = {};
      Object.values(settings.rolePermissions).forEach(perms => {
        perms.forEach(perm => {
          allPermissions[perm] = true;
        });
      });
      
      await api.updateUserPermissions(userId, allPermissions);
      
      toast.success('Settings saved successfully');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings');
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* General Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">General Settings</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Consultation fee in Rs.</Label>
                <Input
                  type="number"
                  value={settings.consultation_fee || ''}
                  onChange={(e) => setSettings({
                    ...settings,
                    consultation_fee: parseFloat(e.target.value) || 0
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label>Follow up charges</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={settings.follow_up_charges || ''}
                    onChange={(e) => setSettings({
                      ...settings,
                      follow_up_charges: parseFloat(e.target.value) || 0
                    })}
                  />
                  <Info className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Follow Up Share</Label>
                <Input
                  type="number"
                  value={settings.follow_up_share_price || ''}
                  onChange={(e) => setSettings({
                    ...settings,
                    follow_up_share_price: parseFloat(e.target.value) || 0
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label>Share Price in Rs.</Label>
                <Input
                  type="number"
                  value={settings.share_price || ''}
                  onChange={(e) => setSettings({
                    ...settings,
                    share_price: parseFloat(e.target.value) || 0
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label>Share type</Label>
                <Select
                  value={settings.share_type}
                  onValueChange={(value: 'Rupees' | 'Percentage') => 
                    setSettings({ ...settings, share_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rupees">Rupees</SelectItem>
                    <SelectItem value="Percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Follow Up Share Types */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Follow up share type</h3>
            <div className="grid grid-cols-2 gap-4">
              {FOLLOW_UP_SHARE_TYPES.map(type => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={type}
                    checked={settings.follow_up_share_types.includes(type)}
                    onCheckedChange={() => handleToggleFollowUpShareType(type)}
                  />
                  <Label htmlFor={type} className="cursor-pointer">{type}</Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Lab and Radiology Shares */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Lab Share</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={settings.lab_share_value || ''}
                  onChange={(e) => setSettings({
                    ...settings,
                    lab_share_value: parseFloat(e.target.value) || 0
                  })}
                />
                <Select
                  value={settings.lab_share_type}
                  onValueChange={(value: 'percentage' | 'rupees') => 
                    setSettings({ ...settings, lab_share_type: value })
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">percentage</SelectItem>
                    <SelectItem value="rupees">rupees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Radiology Share</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={settings.radiology_share_value || ''}
                  onChange={(e) => setSettings({
                    ...settings,
                    radiology_share_value: parseFloat(e.target.value) || 0
                  })}
                />
                <Select
                  value={settings.radiology_share_type}
                  onValueChange={(value: 'percentage' | 'rupees') => 
                    setSettings({ ...settings, radiology_share_type: value })
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">percentage</SelectItem>
                    <SelectItem value="rupees">rupees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Role Permissions */}
          {ROLE_CATEGORIES.map(category => {
            const permissions = permissionDefinitions.filter(p => p.category === category.category);
            const rolePerms = settings.rolePermissions[category.key] || [];
            
            if (permissions.length === 0) {
              return null; // Don't show empty sections
            }
            
            return (
              <Card key={category.key} className="border-0 shadow-sm mb-6">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{category.label}</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const allPermissionKeys = permissions.map(p => p.permission_key);
                          setSettings(prev => ({
                            ...prev,
                            rolePermissions: {
                              ...prev.rolePermissions,
                              [category.key]: allPermissionKeys
                            }
                          }));
                        }}
                      >
                        Select All
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSettings(prev => ({
                            ...prev,
                            rolePermissions: {
                              ...prev.rolePermissions,
                              [category.key]: []
                            }
                          }));
                        }}
                      >
                        Unselect All
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {permissions.map(perm => (
                      <div key={perm.permission_key} className="flex items-start space-x-2 p-2 hover:bg-gray-50 rounded">
                        <Checkbox
                          id={perm.permission_key}
                          checked={rolePerms.includes(perm.permission_key)}
                          onCheckedChange={() => handleTogglePermission(
                            category.key as keyof typeof settings.rolePermissions,
                            perm.permission_key
                          )}
                          className="mt-1"
                        />
                        <Label htmlFor={perm.permission_key} className="cursor-pointer text-sm flex-1">
                          {perm.permission_name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Additional Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="instant_booking"
                checked={settings.instant_booking}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  instant_booking: checked === true
                })}
              />
              <Label htmlFor="instant_booking">Instant Booking</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="visit_charges"
                checked={settings.visit_charges}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  visit_charges: checked === true
                })}
              />
              <Label htmlFor="visit_charges">Visit Charges</Label>
            </div>

            <div className="space-y-2">
              <Label>Invoice Edit Limit</Label>
              <Input
                type="number"
                value={settings.invoice_edit_count || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  invoice_edit_count: parseInt(e.target.value) || 0
                })}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

