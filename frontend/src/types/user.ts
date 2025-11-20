/**
 * User Management TypeScript Types
 * Based on the User Module Implementation Guide
 */

export interface TimingEntry {
  day_of_week: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  start_time: string;
  end_time: string;
  duration: number;
  is_available: boolean;
}

export interface FAQEntry {
  question: string;
  answer: string;
}

export interface ShareProcedure {
  procedure_name: string;
  share_type: 'percentage' | 'rupees';
  share_value: number;
}

export interface UserFormData {
  // Biography Data
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  password?: string;
  departments: string[];
  shift: string;
  roles: string[];
  opd_access: boolean;
  ipd_access: boolean;
  booking_type: 'Token' | 'Appointment';
  
  // Biography
  professional_statement?: string;
  awards?: string;
  expertise?: string;
  registrations?: string;
  professional_memberships?: string;
  languages?: string;
  experience?: string;
  degree_completion_date?: string;
  summary?: string;
  pmdc?: string;
  
  // Qualifications
  qualifications: string[];
  
  // Services
  services: string[];
  
  // Timings
  timings: TimingEntry[];
  
  // FAQs
  faqs: FAQEntry[];
  
  // Share Procedures
  share_procedures: ShareProcedure[];
  
  // Follow Up Share Types
  follow_up_share_types: string[];
}

export interface UserSettings {
  consultation_fee?: number;
  follow_up_charges?: number;
  follow_up_share_price?: number;
  share_price?: number;
  share_type: 'Rupees' | 'Percentage';
  follow_up_share_types: string[];
  lab_share_value?: number;
  lab_share_type: 'percentage' | 'rupees';
  radiology_share_value?: number;
  radiology_share_type: 'percentage' | 'rupees';
  instant_booking: boolean;
  visit_charges: boolean;
  invoice_edit_count: number;
}

export interface RolePermission {
  permission_key: string;
  permission_name: string;
  description?: string;
  category?: string;
}

export interface RolePermissions {
  doctor?: string[];
  admin?: string[];
  staff?: string[];
  bloodBankManager?: string[];
  nurse?: string[];
  inventoryManager?: string[];
  labManager?: string[];
  accountant?: string[];
  labTechnician?: string[];
  radiologyTechnician?: string[];
  radiologyManager?: string[];
  pharmacist?: string[];
  labReceptionist?: string[];
  emergencyManager?: string[];
  emergencyNurse?: string[];
  emergencyReceptionist?: string[];
  receptionist?: string[];
  qualityControlManager?: string[];
  radiologyReceptionist?: string[];
  [key: string]: string[] | undefined; // Allow dynamic role keys
}

export interface UserSettingsFormData extends UserSettings {
  rolePermissions: RolePermissions;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  gender?: 'Male' | 'Female' | 'Other';
  status: 'active' | 'inactive';
  role?: string;
  avatar?: string;
  roles?: string[];
  departments?: string[];
  qualifications?: string[];
  services?: string[];
  timings?: TimingEntry[];
  faqs?: FAQEntry[];
  share_procedures?: ShareProcedure[];
  follow_up_share_types?: string[];
  permissions?: string[];
  settings?: UserSettings;
  created_at?: string;
  updated_at?: string;
}

export interface AvailableRole {
  [key: string]: string; // role name -> description
}

export interface UserFilters {
  search?: string;
  status?: 'active' | 'inactive' | 'all';
  role?: string;
}

