// Billing System TypeScript Interfaces

export interface Organization {
  id: number;
  organization_code: string;
  name: string;
  legal_name?: string;
  organization_type: 'Hospital' | 'Clinic' | 'Medical Center' | 'Pharmacy' | 'Laboratory' | 'Other';
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  subscription_status: 'active' | 'trial' | 'suspended' | 'cancelled' | 'expired';
  status: 'active' | 'inactive' | 'suspended';
  max_users: number;
  currency: string;
  statistics?: {
    total_users: number;
    active_users: number;
    total_patients: number;
    active_subscription: boolean;
  };
  active_subscription?: OrganizationSubscription;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: number;
  plan_code: string;
  name: string;
  description?: string;
  plan_type: 'basic' | 'professional' | 'enterprise' | 'custom';
  billing_cycle: 'monthly' | 'yearly';
  base_price: number;
  yearly_discount: number;
  included_modules?: string[];
  max_users: number;
  max_patients?: number;
  max_storage_gb: number;
  features?: string[];
  is_active: boolean;
  display_order: number;
}

export interface OrganizationSubscription {
  id: number;
  organization_id: number;
  subscription_plan_id: number;
  subscription_number: string;
  start_date: string;
  end_date: string;
  next_billing_date: string;
  billing_cycle: 'monthly' | 'yearly';
  status: 'active' | 'expired' | 'cancelled' | 'suspended' | 'pending';
  auto_renew: boolean;
  plan_name?: string;
  plan_code?: string;
  base_price?: number;
}

export interface SubscriptionAddon {
  id: number;
  organization_id: number;
  addon_type: 'module' | 'user' | 'storage' | 'feature';
  addon_key: string;
  addon_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  billing_cycle: 'monthly' | 'yearly' | 'one-time';
  status: 'active' | 'cancelled' | 'expired';
  start_date: string;
  end_date?: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  organization_id: number;
  subscription_id?: number;
  invoice_date: string;
  due_date: string;
  billing_period_start?: string;
  billing_period_end?: string;
  subtotal: number;
  discount: number;
  discount_percentage: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  currency: string;
  payment_status: 'draft' | 'sent' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  invoice_type: 'subscription' | 'addon' | 'adjustment' | 'manual';
  notes?: string;
  terms?: string;
  pdf_path?: string;
  sent_at?: string;
  paid_at?: string;
  organization_name?: string;
  organization_code?: string;
  items?: InvoiceItem[];
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  item_type: 'subscription' | 'module_addon' | 'user_addon' | 'storage_addon' | 'adjustment' | 'other';
  item_code?: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total: number;
  notes?: string;
}

export interface Payment {
  id: number;
  payment_number: string;
  invoice_id: number;
  organization_id: number;
  payment_date: string;
  amount: number;
  payment_method: 'cash' | 'bank_transfer' | 'credit_card' | 'debit_card' | 'cheque' | 'online' | 'other';
  transaction_id?: string;
  bank_name?: string;
  cheque_number?: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  notes?: string;
  receipt_path?: string;
  invoice_number?: string;
  organization_name?: string;
  processed_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface BillingSettings {
  id: number;
  organization_id: number;
  invoice_prefix: string;
  invoice_number_format: string;
  next_invoice_number: number;
  payment_prefix: string;
  payment_number_format: string;
  next_payment_number: number;
  tax_rate: number;
  tax_name: string;
  payment_terms_days: number;
  currency: string;
  currency_symbol: string;
  invoice_footer?: string;
  invoice_notes?: string;
  email_invoice: boolean;
  email_template?: string;
  auto_generate_invoice: boolean;
  reminder_days_before_due: number;
  overdue_reminder_interval: number;
}

export interface CreateOrganizationData {
  name: string;
  email: string;
  phone: string;
  organization_type?: Organization['organization_type'];
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  currency?: string;
  // Admin user fields (optional but recommended)
  admin_name?: string;
  admin_email?: string;
  admin_password?: string;
  admin_phone?: string;
}

export interface CreateSubscriptionData {
  organization_id: number;
  subscription_plan_id: number;
  start_date?: string;
  billing_cycle?: 'monthly' | 'yearly';
  auto_renew?: boolean;
}

export interface CreateInvoiceData {
  organization_id: number;
  subscription_id?: number;
  invoice_date?: string;
  due_date?: string;
  items: Array<{
    item_type: InvoiceItem['item_type'];
    description: string;
    quantity: number;
    unit_price: number;
  }>;
  notes?: string;
  terms?: string;
}

export interface CreatePaymentData {
  invoice_id: number;
  amount: number;
  payment_date?: string;
  payment_method?: Payment['payment_method'];
  transaction_id?: string;
  bank_name?: string;
  cheque_number?: string;
  notes?: string;
}

