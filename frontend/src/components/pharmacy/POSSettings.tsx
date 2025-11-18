/**
 * POS Settings Component
 * Features: Comprehensive POS configuration with multiple categories
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { 
  Settings, 
  Save, 
  RotateCcw,
  Building2,
  Percent,
  Receipt,
  CreditCard,
  Package,
  Tag,
  Clock,
  Barcode,
  Monitor,
  User,
  FileText,
  Printer,
  Bell,
  AlertCircle,
  Link as LinkIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';

interface POSSettingsData {
  [key: string]: any;
}

export function POSSettings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<POSSettingsData>({});
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await api.getPOSSettings();
      console.log('Settings response:', response);
      
      // Flatten the nested structure
      const flattened: POSSettingsData = {};
      
      // Check if response is an object with categories
      if (response && typeof response === 'object') {
        Object.keys(response).forEach(category => {
          if (response[category] && typeof response[category] === 'object') {
            Object.keys(response[category]).forEach(key => {
              let value;
              // Handle both structures: {value: ...} or direct value
              if (response[category][key] && typeof response[category][key] === 'object' && 'value' in response[category][key]) {
                value = response[category][key].value;
              } else {
                value = response[category][key];
              }
              
              // Convert string booleans to actual booleans (only if it's a string)
              if (typeof value === 'string') {
                if (value === 'true') {
                  value = true;
                } else if (value === 'false') {
                  value = false;
                }
                // Convert string numbers to numbers (only for numeric settings)
                else if (!isNaN(Number(value)) && value.trim() !== '' && /^-?\d*\.?\d+$/.test(value.trim())) {
                  // Only convert if it's a pure number (not a string like "PKR" or "INV-")
                  const numValue = value.includes('.') ? parseFloat(value) : parseInt(value, 10);
                  // Only convert numeric settings (not strings that happen to be numeric)
                  const numericSettings = ['default_tax_rate', 'low_stock_threshold', 'stock_reservation_timeout', 
                    'expiry_alert_days', 'max_item_discount', 'max_global_discount', 'discount_approval_threshold',
                    'max_price_override', 'items_per_page', 'paper_width', 'toast_duration', 'min_card_amount',
                    'default_opening_cash'];
                  if (numericSettings.includes(key)) {
                    value = numValue;
                  }
                }
              }
              
              flattened[key] = value;
            });
          }
        });
      }
      
      console.log('Flattened settings:', flattened);
      
      // Check if we got any settings
      if (Object.keys(flattened).length === 0) {
        console.warn('No settings loaded from database. Using defaults.');
        toast.warning('No settings found in database. Using default values.');
      }
      
      setSettings(flattened);
    } catch (error: any) {
      console.error('Error loading settings:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      toast.error(error.message || 'Failed to load POS settings');
      // Set empty settings object so form doesn't break
      setSettings({});
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await api.updatePOSSettings(settings);
      console.log('Settings save response:', response);
      
      // Show success message
      toast.success('Settings saved successfully', {
        description: `Updated ${response?.updated_count || 'all'} setting(s)`,
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings', {
        description: error.message || 'An error occurred while saving',
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      return;
    }
    try {
      setSaving(true);
      await api.resetPOSSettings();
      toast.success('Settings reset to defaults');
      loadSettings();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="w-8 h-8" />
            POS Settings
          </h1>
          <p className="text-gray-500 mt-1">Configure your Point of Sale system</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={saving}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save All Settings'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="tax">Tax & Pricing</TabsTrigger>
          <TabsTrigger value="receipt">Receipt</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="stock">Stock</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={settings.company_name || ''}
                  onChange={(e) => updateSetting('company_name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="company_address">Address</Label>
                <Textarea
                  id="company_address"
                  value={settings.company_address || ''}
                  onChange={(e) => updateSetting('company_address', e.target.value)}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company_phone">Phone</Label>
                  <Input
                    id="company_phone"
                    value={settings.company_phone || ''}
                    onChange={(e) => updateSetting('company_phone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="company_email">Email</Label>
                  <Input
                    id="company_email"
                    type="email"
                    value={settings.company_email || ''}
                    onChange={(e) => updateSetting('company_email', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency_symbol">Currency Symbol</Label>
                  <Input
                    id="currency_symbol"
                    value={settings.currency_symbol || ''}
                    onChange={(e) => updateSetting('currency_symbol', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="currency_code">Currency Code</Label>
                  <Input
                    id="currency_code"
                    value={settings.currency_code || ''}
                    onChange={(e) => updateSetting('currency_code', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax & Pricing Settings */}
        <TabsContent value="tax" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="w-5 h-5" />
                Tax & Pricing Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <LinkIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">GST Rates Management</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Manage multiple GST rates for different product categories
                    </p>
                    <p className="text-xs text-blue-600 mt-2">
                      Use the "GST Rates" menu item in the sidebar to manage GST rates
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="default_tax_rate">Default Tax Rate (%)</Label>
                <Input
                  id="default_tax_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={settings.default_tax_rate || 14}
                  onChange={(e) => updateSetting('default_tax_rate', parseFloat(e.target.value) || 0)}
                />
                <p className="text-xs text-gray-500 mt-1">Used when no category-specific rate is found</p>
              </div>
              <div>
                <Label htmlFor="tax_calculation_method">Tax Calculation Method</Label>
                <Select
                  value={settings.tax_calculation_method || 'exclusive'}
                  onValueChange={(value) => updateSetting('tax_calculation_method', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exclusive">Exclusive (Tax added on top)</SelectItem>
                    <SelectItem value="inclusive">Inclusive (Tax included in price)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tax_rounding">Tax Rounding</Label>
                <Select
                  value={settings.tax_rounding || 'round'}
                  onValueChange={(value) => updateSetting('tax_rounding', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="round">Round</SelectItem>
                    <SelectItem value="floor">Floor (Round Down)</SelectItem>
                    <SelectItem value="ceil">Ceil (Round Up)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Receipt Settings */}
        <TabsContent value="receipt" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Receipt & Invoice Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="invoice_prefix">Invoice Number Prefix</Label>
                <Input
                  id="invoice_prefix"
                  value={settings.invoice_prefix || ''}
                  onChange={(e) => updateSetting('invoice_prefix', e.target.value)}
                  placeholder="INV-"
                />
              </div>
              <div>
                <Label htmlFor="receipt_footer">Receipt Footer Text</Label>
                <Textarea
                  id="receipt_footer"
                  value={settings.receipt_footer || ''}
                  onChange={(e) => updateSetting('receipt_footer', e.target.value)}
                  rows={2}
                  placeholder="Thank you for your purchase!"
                />
              </div>
              <div>
                <Label htmlFor="paper_size">Paper Size</Label>
                <Select
                  value={settings.paper_size || '80mm'}
                  onValueChange={(value) => updateSetting('paper_size', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="80mm">80mm (Thermal)</SelectItem>
                    <SelectItem value="A4">A4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto_print">Auto-Print After Payment</Label>
                  <Switch
                    id="auto_print"
                    checked={settings.auto_print === true || settings.auto_print === 'true'}
                    onCheckedChange={(checked) => updateSetting('auto_print', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show_stock_on_receipt">Show Stock on Receipt</Label>
                  <Switch
                    id="show_stock_on_receipt"
                    checked={settings.show_stock_on_receipt === true || settings.show_stock_on_receipt === 'true'}
                    onCheckedChange={(checked) => updateSetting('show_stock_on_receipt', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show_expiry_on_receipt">Show Expiry Dates on Receipt</Label>
                  <Switch
                    id="show_expiry_on_receipt"
                    checked={settings.show_expiry_on_receipt === true || settings.show_expiry_on_receipt === 'true'}
                    onCheckedChange={(checked) => updateSetting('show_expiry_on_receipt', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="payment_methods_cash">Enable Cash Payment</Label>
                  <Switch
                    id="payment_methods_cash"
                    checked={settings.payment_methods_cash === true || settings.payment_methods_cash === 'true'}
                    onCheckedChange={(checked) => updateSetting('payment_methods_cash', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="payment_methods_card">Enable Card Payment</Label>
                  <Switch
                    id="payment_methods_card"
                    checked={settings.payment_methods_card === true || settings.payment_methods_card === 'true'}
                    onCheckedChange={(checked) => updateSetting('payment_methods_card', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="payment_methods_insurance">Enable Insurance Payment</Label>
                  <Switch
                    id="payment_methods_insurance"
                    checked={settings.payment_methods_insurance === true || settings.payment_methods_insurance === 'true'}
                    onCheckedChange={(checked) => updateSetting('payment_methods_insurance', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="payment_methods_credit">Enable Credit Payment</Label>
                  <Switch
                    id="payment_methods_credit"
                    checked={settings.payment_methods_credit === true || settings.payment_methods_credit === 'true'}
                    onCheckedChange={(checked) => updateSetting('payment_methods_credit', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="payment_methods_wallet">Enable Wallet Payment</Label>
                  <Switch
                    id="payment_methods_wallet"
                    checked={settings.payment_methods_wallet === true || settings.payment_methods_wallet === 'true'}
                    onCheckedChange={(checked) => updateSetting('payment_methods_wallet', checked)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="default_payment_method">Default Payment Method</Label>
                <Select
                  value={settings.default_payment_method || 'cash'}
                  onValueChange={(value) => updateSetting('default_payment_method', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                    <SelectItem value="wallet">Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="split_payment_allowed">Allow Split Payments</Label>
                <Switch
                  id="split_payment_allowed"
                  checked={settings.split_payment_allowed === true || settings.split_payment_allowed === 'true'}
                  onCheckedChange={(checked) => updateSetting('split_payment_allowed', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Settings */}
        <TabsContent value="stock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Stock & Inventory Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="stock_allocation_method">Stock Allocation Method</Label>
                <Select
                  value={settings.stock_allocation_method || 'FIFO'}
                  onValueChange={(value) => updateSetting('stock_allocation_method', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIFO">FIFO (First In, First Out)</SelectItem>
                    <SelectItem value="LIFO">LIFO (Last In, First Out)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="low_stock_threshold">Low Stock Threshold (%)</Label>
                <Input
                  id="low_stock_threshold"
                  type="number"
                  min="0"
                  max="100"
                  value={settings.low_stock_threshold || 10}
                  onChange={(e) => updateSetting('low_stock_threshold', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto_reserve_stock">Auto-Reserve Stock on Cart Add</Label>
                <Switch
                  id="auto_reserve_stock"
                  checked={settings.auto_reserve_stock === true || settings.auto_reserve_stock === 'true'}
                  onCheckedChange={(checked) => updateSetting('auto_reserve_stock', checked)}
                />
              </div>
              <div>
                <Label htmlFor="stock_reservation_timeout">Stock Reservation Timeout (minutes)</Label>
                <Input
                  id="stock_reservation_timeout"
                  type="number"
                  min="1"
                  value={settings.stock_reservation_timeout || 30}
                  onChange={(e) => updateSetting('stock_reservation_timeout', parseInt(e.target.value) || 30)}
                />
              </div>
              <div>
                <Label htmlFor="expiry_alert_days">Expiry Alert Days Before</Label>
                <Input
                  id="expiry_alert_days"
                  type="number"
                  min="1"
                  value={settings.expiry_alert_days || 30}
                  onChange={(e) => updateSetting('expiry_alert_days', parseInt(e.target.value) || 30)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other Settings */}
        <TabsContent value="other" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Discount Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Tag className="w-4 h-4" />
                  Discounts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="max_item_discount">Max Item Discount (%)</Label>
                  <Input
                    id="max_item_discount"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.max_item_discount || 50}
                    onChange={(e) => updateSetting('max_item_discount', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="max_global_discount">Max Global Discount (%)</Label>
                  <Input
                    id="max_global_discount"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.max_global_discount || 30}
                    onChange={(e) => updateSetting('max_global_discount', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="discount_approval_threshold">Discount Approval Threshold (%)</Label>
                  <Input
                    id="discount_approval_threshold"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.discount_approval_threshold || 20}
                    onChange={(e) => updateSetting('discount_approval_threshold', parseInt(e.target.value) || 0)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* UI Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Monitor className="w-4 h-4" />
                  Display & UI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="default_view_mode">Default View Mode</Label>
                  <Select
                    value={settings.default_view_mode || 'grid'}
                    onValueChange={(value) => updateSetting('default_view_mode', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grid</SelectItem>
                      <SelectItem value="list">List</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="items_per_page">Items Per Page</Label>
                  <Input
                    id="items_per_page"
                    type="number"
                    min="10"
                    max="100"
                    value={settings.items_per_page || 20}
                    onChange={(e) => updateSetting('items_per_page', parseInt(e.target.value) || 20)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="keyboard_shortcuts_enabled">Enable Keyboard Shortcuts</Label>
                  <Switch
                    id="keyboard_shortcuts_enabled"
                    checked={settings.keyboard_shortcuts_enabled === true || settings.keyboard_shortcuts_enabled === 'true'}
                    onCheckedChange={(checked) => updateSetting('keyboard_shortcuts_enabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Barcode Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Barcode className="w-4 h-4" />
                  Barcode & Scanning
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="barcode_auto_focus">Auto-Focus Scanner Input</Label>
                  <Switch
                    id="barcode_auto_focus"
                    checked={settings.barcode_auto_focus === true || settings.barcode_auto_focus === 'true'}
                    onCheckedChange={(checked) => updateSetting('barcode_auto_focus', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="barcode_beep_sound">Beep Sound on Scan</Label>
                  <Switch
                    id="barcode_beep_sound"
                    checked={settings.barcode_beep_sound === true || settings.barcode_beep_sound === 'true'}
                    onCheckedChange={(checked) => updateSetting('barcode_beep_sound', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="barcode_auto_add">Auto-Add to Cart on Scan</Label>
                  <Switch
                    id="barcode_auto_add"
                    checked={settings.barcode_auto_add === true || settings.barcode_auto_add === 'true'}
                    onCheckedChange={(checked) => updateSetting('barcode_auto_add', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shift Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="w-4 h-4" />
                  Shift & Drawer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto_open_shift">Auto-Open Shift on Login</Label>
                  <Switch
                    id="auto_open_shift"
                    checked={settings.auto_open_shift === true || settings.auto_open_shift === 'true'}
                    onCheckedChange={(checked) => updateSetting('auto_open_shift', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="require_shift_closing">Require Shift Closing</Label>
                  <Switch
                    id="require_shift_closing"
                    checked={settings.require_shift_closing === true || settings.require_shift_closing === 'true'}
                    onCheckedChange={(checked) => updateSetting('require_shift_closing', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="cash_drawer_auto_open">Auto-Open Drawer on Sale</Label>
                  <Switch
                    id="cash_drawer_auto_open"
                    checked={settings.cash_drawer_auto_open === true || settings.cash_drawer_auto_open === 'true'}
                    onCheckedChange={(checked) => updateSetting('cash_drawer_auto_open', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

