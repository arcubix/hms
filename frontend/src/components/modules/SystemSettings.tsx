import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, Settings, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { api, RoomMode } from '../../services/api';
import { toast } from 'sonner';

export function SystemSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roomMode, setRoomMode] = useState<'Fixed' | 'Dynamic'>('Fixed');
  const [tokenResetDaily, setTokenResetDaily] = useState(true);
  const [tokenPrefixFormat, setTokenPrefixFormat] = useState('F{floor}-{reception}');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load room mode
      const modeData = await api.getRoomMode();
      setRoomMode(modeData.mode);
      
      // Load other settings
      try {
        const settings = await api.getSystemSettings('opd');
        if (settings && typeof settings === 'object') {
          // Handle different response formats
          let opdSettings: any = null;
          if ('opd' in settings) {
            opdSettings = (settings as any).opd;
          } else if (Array.isArray(settings)) {
            // If it's an array, find opd category
            opdSettings = settings.find((s: any) => s.category === 'opd');
          } else {
            // If it's already the opd settings object
            opdSettings = settings;
          }
          
          if (opdSettings) {
            if (opdSettings.token_reset_daily) {
              const resetValue = opdSettings.token_reset_daily.value || opdSettings.token_reset_daily;
              setTokenResetDaily(resetValue === true || resetValue === 'true');
            }
            if (opdSettings.token_prefix_format) {
              const formatValue = opdSettings.token_prefix_format.value || opdSettings.token_prefix_format;
              // Remove quotes if present
              const format = typeof formatValue === 'string' && formatValue.startsWith('"') && formatValue.endsWith('"')
                ? formatValue.slice(1, -1)
                : formatValue;
              setTokenPrefixFormat(format || 'F{floor}-{reception}');
            }
          }
        }
      } catch (err: any) {
        // If category endpoint fails, try getting all settings
        console.warn('Could not load OPD settings, trying all settings:', err);
        try {
          const allSettings = await api.getSystemSettings();
          // Process all settings to find OPD category
          if (allSettings && typeof allSettings === 'object' && 'opd' in allSettings) {
            const opdSettings = (allSettings as any).opd;
            if (opdSettings.token_reset_daily) {
              const resetValue = opdSettings.token_reset_daily.value || opdSettings.token_reset_daily;
              setTokenResetDaily(resetValue === true || resetValue === 'true');
            }
            if (opdSettings.token_prefix_format) {
              const formatValue = opdSettings.token_prefix_format.value || opdSettings.token_prefix_format;
              const format = typeof formatValue === 'string' && formatValue.startsWith('"') && formatValue.endsWith('"')
                ? formatValue.slice(1, -1)
                : formatValue;
              setTokenPrefixFormat(format || 'F{floor}-{reception}');
            }
          }
        } catch (err2: any) {
          console.warn('Could not load settings:', err2);
        }
      }
    } catch (err: any) {
      console.error('Error loading settings:', err);
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      // Update room mode
      const modeResult = await api.updateRoomMode(roomMode);
      
      // Check for warnings in response
      if (modeResult && (modeResult as any).warnings && (modeResult as any).warnings.length > 0) {
        const warningMsg = (modeResult as any).warning_message || 'Mode switched with warnings';
        setSuccess(warningMsg);
        toast.warning(warningMsg, {
          description: 'Some doctors may need room assignments configured.',
          duration: 5000
        });
      } else {
        setSuccess('Settings saved successfully');
        toast.success('System settings updated');
      }
      
      // Update other settings
      await api.updateSystemSetting('token_reset_daily', tokenResetDaily);
      await api.updateSystemSetting('token_prefix_format', tokenPrefixFormat);
      
      if (!modeResult || !(modeResult as any).warnings) {
        setSuccess('Settings saved successfully');
        toast.success('System settings updated');
      }
    } catch (err: any) {
      console.error('Error saving settings:', err);
      // Check if it's a validation error that we should allow
      if (err.message && err.message.includes('has no room assignments')) {
        // This is now a warning, not an error - try to proceed anyway
        toast.warning('Mode switch completed with warnings: ' + err.message);
        setSuccess('Mode switched. Please configure room assignments for doctors.');
      } else {
        setError(err.message || 'Failed to save settings');
        toast.error(err.message || 'Failed to save settings');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
        <p className="text-sm text-gray-600 mt-1">Configure room management mode and token settings</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Room Management Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Room Management Mode
          </CardTitle>
          <CardDescription>
            Choose how rooms are assigned to doctors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Room Assignment Mode</Label>
            <Select value={roomMode} onValueChange={(value: 'Fixed' | 'Dynamic') => setRoomMode(value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fixed">Fixed Room Mode</SelectItem>
                <SelectItem value="Dynamic">Dynamic Room Mode</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription>
              {roomMode === 'Fixed' ? (
                <div>
                  <strong>Fixed Mode:</strong> Each doctor has a permanent room assignment. 
                  The system automatically selects the room when creating appointments.
                </div>
              ) : (
                <div>
                  <strong>Dynamic Mode:</strong> Rooms are assigned per time slot and date. 
                  You must assign rooms to each doctor's schedule slots for specific dates.
                </div>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Token Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Token Settings</CardTitle>
          <CardDescription>
            Configure token number generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Reset Token Numbers Daily</Label>
              <p className="text-sm text-gray-500">
                Token numbers will restart from 001 each day
              </p>
            </div>
            <Switch
              checked={tokenResetDaily}
              onCheckedChange={setTokenResetDaily}
            />
          </div>

          <div className="space-y-2">
            <Label>Token Prefix Format</Label>
            <Select value={tokenPrefixFormat} onValueChange={setTokenPrefixFormat}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="F{floor}-{reception}">
                  F{'{'}floor{'}'}-{'{'}reception{'}'}-{'{'}number{'}'} (e.g., F1-REC001-001)
                </SelectItem>
                <SelectItem value="{reception}">
                  {'{'}reception{'}'}-{'{'}number{'}'} (e.g., REC001-001)
                </SelectItem>
                <SelectItem value="{floor}">
                  {'{'}floor{'}'}-{'{'}number{'}'} (e.g., F1-001)
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Format: {tokenPrefixFormat.replace('{floor}', '1').replace('{reception}', 'REC001')}-001
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={loadSettings}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
