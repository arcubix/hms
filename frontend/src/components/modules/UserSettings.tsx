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
  { key: 'doctor', label: 'Doctor Role User Rights' },
  { key: 'admin', label: 'Admin Role User Rights' },
  { key: 'labManager', label: 'Laboratory Manager User Rights' },
  { key: 'labTechnician', label: 'Laboratory Technician User Rights' },
  { key: 'radiologyTechnician', label: 'Radiology Technician User Rights' },
  { key: 'radiologyManager', label: 'Radiology Manager User Rights' }
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
    rolePermissions: {
      doctor: [],
      admin: [],
      labManager: [],
      labTechnician: [],
      radiologyTechnician: [],
      radiologyManager: []
    }
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
      
      // Update role permissions
      setSettings(prev => ({
        ...prev,
        rolePermissions: {
          doctor: grouped['doctor'] || [],
          admin: grouped['admin'] || [],
          labManager: grouped['lab_manager'] || [],
          labTechnician: grouped['lab_technician'] || [],
          radiologyTechnician: grouped['radiology_technician'] || [],
          radiologyManager: grouped['radiology_manager'] || []
        }
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

  const getPermissionsForCategory = (category: string) => {
    return permissionDefinitions.filter(p => {
      const catMap: Record<string, string> = {
        'doctor': 'doctor',
        'admin': 'admin',
        'labManager': 'lab_manager',
        'labTechnician': 'lab_technician',
        'radiologyTechnician': 'radiology_technician',
        'radiologyManager': 'radiology_manager'
      };
      return p.category === catMap[category];
    });
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
            const permissions = getPermissionsForCategory(category.key);
            return (
              <div key={category.key} className="space-y-4">
                <h3 className="text-lg font-semibold">{category.label}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {permissions.map(perm => (
                    <div key={perm.permission_key} className="flex items-center space-x-2">
                      <Checkbox
                        id={perm.permission_key}
                        checked={settings.rolePermissions[category.key as keyof typeof settings.rolePermissions].includes(perm.permission_key)}
                        onCheckedChange={() => handleTogglePermission(
                          category.key as keyof typeof settings.rolePermissions,
                          perm.permission_key
                        )}
                      />
                      <Label htmlFor={perm.permission_key} className="cursor-pointer text-sm">
                        {perm.permission_name}
                      </Label>
                    </div>
                  ))}
                </div>
                <Separator />
              </div>
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

