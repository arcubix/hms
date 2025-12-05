/**
 * Add User - Comprehensive Form
 * 
 * Features:
 * - 7-Tab comprehensive form matching screenshots
 * - Biography Data, Biography, Qualification, Service, Timings, FAQs, Share Procedures
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import {
  User,
  Mail,
  Phone,
  Plus,
  X,
  Trash2,
  Info,
  ArrowLeft,
  ArrowRight,
  Save
} from 'lucide-react';
import { api, UserFormData, TimingEntry, FAQEntry, ShareProcedure, DoctorSchedule } from '../../services/api';
import { DoctorScheduleContent } from './DoctorScheduleContent';
import { toast } from 'sonner';
import { validateUserForm, ValidationError } from '../../utils/userValidation';
import { usePermissions } from '../../contexts/PermissionContext';
import { PermissionButton } from '../common/PermissionButton';

interface AddUserProps {
  onBack: () => void;
  onSuccess?: () => void;
  userId?: number; // For editing existing user
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

const AVAILABLE_ROLES = [
  { value: 'Admin', label: 'Admin', description: 'Complete system access with full administrative privileges' },
  { value: 'Doctor', label: 'Doctor', description: 'Access to appointments and reports of patients specific to the doctor only' },
  { value: 'Staff', label: 'Staff', description: 'General staff access with comprehensive permissions for patient management, invoicing, and reporting' },
  { value: 'Blood Bank Manager', label: 'Blood Bank Manager', description: 'Access to blood bank management, donor management, and blood inventory' },
  { value: 'Nurse', label: 'Nurse', description: 'Access to nursing functions, patient care, and medical records' },
  { value: 'Inventory Manager', label: 'Inventory Manager', description: 'Access to inventory management, stock control, and procurement' },
  { value: 'Lab Manager', label: 'Lab Manager', description: 'Access to Laboratory Module, can Validate Lab Tests' },
  { value: 'Accountant', label: 'Accountant', description: 'Access to financial reports, invoices, expenses, and accounting functions' },
  { value: 'Lab Technician', label: 'Lab Technician', description: 'Access to Laboratory Module, cannot view other modules' },
  { value: 'Radiology Technician', label: 'Radiology Technician', description: 'Access to Radiology Module only, cannot access other modules' },
  { value: 'Radiology Manager', label: 'Radiology Manager', description: 'Access to Radiology Module with management capabilities' },
  { value: 'Pharmacist', label: 'Pharmacist', description: 'Access to Pharmacy Module, medication dispensing, and inventory management' },
  { value: 'Lab Receptionist', label: 'Lab Receptionist', description: 'Access to Laboratory reception, patient registration, and sample collection' },
  { value: 'Emergency Manager', label: 'Emergency Manager', description: 'Access to Emergency Department management and operations' },
  { value: 'Emergency Nurse', label: 'Emergency Nurse', description: 'Access to Emergency Department nursing functions and patient care' },
  { value: 'Emergency Receptionist', label: 'Emergency Receptionist', description: 'Access to Emergency Department reception and patient registration' },
  { value: 'Quality Control Manager', label: 'Quality Control Manager', description: 'Access to quality control, compliance, and audit functions' },
  { value: 'Radiology Receptionist', label: 'Radiology Receptionist', description: 'Access to Radiology reception, patient registration, and appointment scheduling' },
  { value: 'Receptionist', label: 'Receptionist', description: 'Access to general reception, patient registration, and appointment scheduling' }
];

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

const PROCEDURE_TYPES = [
  'Visit Charges',
  'Consultation Charges',
  'Follow-up Consultation',
  'Emergency Consultation',
  'Surgery',
  'Minor Surgery',
  'Major Surgery',
  'Operation Theatre Charges',
  'Anesthesia Charges',
  'Lab Tests',
  'Radiology Procedures',
  'X-Ray',
  'CT Scan',
  'MRI',
  'Ultrasound',
  'ECG',
  'Echo',
  'Endoscopy',
  'Colonoscopy',
  'Biopsy',
  'Injection Charges',
  'Dressing Charges',
  'Physiotherapy',
  'Occupational Therapy',
  'Speech Therapy',
  'Dialysis',
  'Chemotherapy',
  'Radiotherapy',
  'Vaccination',
  'Health Checkup',
  'Preventive Care',
  'Post-operative Care',
  'ICU Charges',
  'Emergency Room Charges',
  'Ambulance Charges'
];

export function AddUser({ onBack, onSuccess, userId }: AddUserProps) {
  const { hasPermission } = usePermissions();
  const [currentTab, setCurrentTab] = useState('biography-data');
  const [loading, setLoading] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [permissionDefinitions, setPermissionDefinitions] = useState<any[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});
  const [rolePermissionMappings, setRolePermissionMappings] = useState<Record<string, string[]>>({});
  const [schedule, setSchedule] = useState<DoctorSchedule[]>([]);

  // Form state
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    gender: 'Male',
    phone: '',
    email: '',
    password: '',
    departments: [],
    shift: '',
    roles: [],
    opd_access: false,
    ipd_access: false,
    booking_type: 'Appointment',
    professional_statement: '',
    awards: '',
    expertise: '',
    registrations: '',
    professional_memberships: '',
    languages: 'English, Urdu',
    experience: '',
    degree_completion_date: '',
    summary: '',
    pmdc: 'Pmdc',
    qualifications: [''],
    services: [''],
    timings: DAYS_OF_WEEK.map(day => ({
      day_of_week: day,
      start_time: '5:00 PM',
      end_time: '9:00 PM',
      duration: 30,
      is_available: true
    })),
    faqs: [],
    share_procedures: [],
    follow_up_share_types: [],
    // Financial settings
    consultation_fee: 0,
    share_price: 0,
    share_type: 'Rupees' as 'Rupees' | 'Percentage',
    follow_up_charges: 0,
    follow_up_share_price: 0,
    follow_up_share_type: 'percentage' as 'percentage' | 'rupees',
    lab_share_value: 0,
    lab_share_type: 'percentage' as 'percentage' | 'rupees',
    radiology_share_value: 0,
    radiology_share_type: 'percentage' as 'percentage' | 'rupees',
    instant_booking: false,
    visit_charges: false,
    invoice_edit_count: 0
  });

  useEffect(() => {
    const initializeData = async () => {
      await loadAvailableRoles();
      await loadPermissionDefinitions();
      if (userId) {
        // Load user data after permission definitions are loaded
        await loadUserData();
      } else {
        // Initialize schedule with default values
        const initialSchedule: DoctorSchedule[] = DAYS_OF_WEEK.map(day => ({
          day_of_week: day as DoctorSchedule['day_of_week'],
          start_time: '17:00',
          end_time: '21:00',
          is_available: true,
          slot_order: 0,
          slot_name: null,
          max_appointments_per_slot: 1,
          appointment_duration: 30,
          break_start: null,
          break_end: null,
          notes: null
        }));
        setSchedule(initialSchedule);
      }
    };
    initializeData();
  }, [userId]);

  // Load user permissions when editing and permission definitions are available
  useEffect(() => {
    const loadUserPermissions = async () => {
      if (!userId || permissionDefinitions.length === 0) return;
      
      // Wait a bit for roles to be loaded if they're not available yet
      if (userId && formData.roles.length === 0) {
        // Give it a moment for roles to load
        await new Promise(resolve => setTimeout(resolve, 100));
        // If still no roles after waiting, proceed anyway (roles might be empty)
      }
      
      try {
        // Get user permissions and role-permission mappings
        const [userPermissions, roleMappings] = await Promise.all([
          api.getUserPermissions(userId),
          api.getRolePermissionMappings()
        ]);
        
        console.log('Loading permissions for user:', userId);
        console.log('User permissions from API:', userPermissions);
        console.log('User roles:', formData.roles);
        
        // Check if user has Admin role
        const hasAdminRole = formData.roles.includes('Admin');
        console.log('Has Admin role:', hasAdminRole);
        
        // Map role names to role keys (as used in the frontend)
        const roleNameToKey: Record<string, string> = {
          'Admin': 'admin',
          'Doctor': 'doctor',
          'Staff': 'staff',
          'Blood Bank Manager': 'bloodBankManager',
          'Nurse': 'nurse',
          'Inventory Manager': 'inventoryManager',
          'Lab Manager': 'labManager',
          'Accountant': 'accountant',
          'Lab Technician': 'labTechnician',
          'Radiology Technician': 'radiologyTechnician',
          'Radiology Manager': 'radiologyManager',
          'Pharmacist': 'pharmacist',
          'Lab Receptionist': 'labReceptionist',
          'Emergency Manager': 'emergencyManager',
          'Emergency Nurse': 'emergencyNurse',
          'Emergency Receptionist': 'emergencyReceptionist',
          'Receptionist': 'receptionist',
          'Quality Control Manager': 'qualityControlManager',
          'Radiology Receptionist': 'radiologyReceptionist'
        };
        
        // Group permissions by role based on role-permission mappings
        const rolePerms: Record<string, string[]> = {};
        
        // For each permission the user has, find which roles it belongs to
        userPermissions.forEach(permKey => {
          // Check each role to see if this permission belongs to it
          Object.keys(roleMappings).forEach(roleName => {
            const roleKey = roleNameToKey[roleName];
            if (roleKey && roleMappings[roleName].includes(permKey)) {
              if (!rolePerms[roleKey]) {
                rolePerms[roleKey] = [];
              }
              if (!rolePerms[roleKey].includes(permKey)) {
                rolePerms[roleKey].push(permKey);
              }
            }
          });
        });
        
        // If user has Admin role, also add Admin-specific permissions from role_permissions table
        if (hasAdminRole) {
          const adminRolePerms = roleMappings['Admin'] || [];
          adminRolePerms.forEach(permKey => {
            if (userPermissions.includes(permKey)) {
              if (!rolePerms['admin']) {
                rolePerms['admin'] = [];
              }
              if (!rolePerms['admin'].includes(permKey)) {
                rolePerms['admin'].push(permKey);
              }
            }
          });
          console.log('Added Admin role permissions:', rolePerms['admin']);
        }
        
        console.log('Final role permissions mapping:', rolePerms);
        setRolePermissions(rolePerms);
      } catch (permError) {
        console.error('Failed to load user permissions:', permError);
      }
    };
    
    loadUserPermissions();
  }, [userId, permissionDefinitions, formData.roles]);

  // Handle tab switching when Admin role is selected/deselected
  useEffect(() => {
    const isAdmin = formData.roles.includes('Admin');
    // If Admin is selected and user is on any tab other than biography-data, switch to biography-data
    if (isAdmin && currentTab !== 'biography-data') {
      setCurrentTab('biography-data');
    }
  }, [formData.roles, currentTab]);

  const loadPermissionDefinitions = async () => {
    try {
      setLoading(true);
      const [definitions, mappings] = await Promise.all([
        api.getPermissionDefinitions(),
        api.getRolePermissionMappings()
      ]);
      console.log('Loaded permission definitions:', definitions);
      setPermissionDefinitions(definitions);
      setRolePermissionMappings(mappings);
      
      // Initialize role permissions if not already set (preserve user selections)
      setRolePermissions(prev => {
        const grouped: Record<string, string[]> = {
          doctor: prev.doctor || [],
          admin: prev.admin || [],
          labManager: prev.labManager || [],
          labTechnician: prev.labTechnician || [],
          radiologyTechnician: prev.radiologyTechnician || [],
          radiologyManager: prev.radiologyManager || []
        };
        
        // Only initialize if empty
        if (definitions.length > 0 && Object.values(grouped).every(arr => arr.length === 0)) {
          definitions.forEach(perm => {
            const category = perm.category || 'other';
            const catMap: Record<string, keyof typeof grouped> = {
              'doctor': 'doctor',
              'admin': 'admin',
              'lab_manager': 'labManager',
              'lab_technician': 'labTechnician',
              'radiology_technician': 'radiologyTechnician',
              'radiology_manager': 'radiologyManager'
            };
            const mappedKey = catMap[category];
            if (mappedKey && grouped[mappedKey]) {
              // Don't overwrite if already has values
              if (!grouped[mappedKey].includes(perm.permission_key)) {
                grouped[mappedKey].push(perm.permission_key);
              }
            }
          });
        }
        
        return grouped;
      });
    } catch (error) {
      console.error('Failed to load permission definitions:', error);
      toast.error('Failed to load permissions. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableRoles = async () => {
    try {
      const roles = await api.getAvailableRoles();
      setAvailableRoles(roles);
    } catch (error) {
      console.error('Failed to load roles:', error);
    }
  };

  const loadUserData = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const user = await api.getUser(userId);
      
      // Transform user data to form data
      setFormData({
        name: user.name || '',
        gender: user.gender || 'Male',
        phone: user.phone || '',
        email: user.email || '',
        password: '',
        departments: user.departments || [],
        shift: '',
        roles: user.roles || [],
        opd_access: false,
        ipd_access: false,
        booking_type: 'Appointment',
        professional_statement: '',
        awards: '',
        expertise: '',
        registrations: '',
        professional_memberships: '',
        languages: user.languages || 'English, Urdu',
        experience: user.experience || '',
        degree_completion_date: '',
        summary: '',
        pmdc: user.pmdc || 'Pmdc',
        qualifications: user.qualifications && user.qualifications.length > 0 ? user.qualifications : [''],
        services: user.services && user.services.length > 0 ? user.services : [''],
        timings: user.timings && user.timings.length > 0 
          ? user.timings.map(t => ({
              day_of_week: t.day_of_week,
              start_time: t.start_time.substring(0, 5),
              end_time: t.end_time.substring(0, 5),
              duration: t.duration || 30,
              is_available: t.is_available !== undefined ? t.is_available : true
            }))
          : DAYS_OF_WEEK.map(day => ({
              day_of_week: day,
              start_time: '5:00 PM',
              end_time: '9:00 PM',
              duration: 30,
              is_available: true
            })),
        faqs: user.faqs || [],
        share_procedures: user.share_procedures || [],
        follow_up_share_types: user.follow_up_share_types || []
      });
      
      // Load user permissions and map to rolePermissions
      // This will be handled in a separate useEffect that depends on permissionDefinitions
      
      // Convert timings to schedule format
      if (user.timings && user.timings.length > 0) {
        const userSchedule: DoctorSchedule[] = user.timings.map((t, index) => ({
          day_of_week: t.day_of_week as DoctorSchedule['day_of_week'],
          start_time: t.start_time.substring(0, 5),
          end_time: t.end_time.substring(0, 5),
          is_available: t.is_available !== undefined ? t.is_available : true,
          slot_order: 0,
          slot_name: null,
          max_appointments_per_slot: 1,
          appointment_duration: t.duration || 30,
          break_start: null,
          break_end: null,
          notes: null
        }));
        setSchedule(userSchedule);
      } else {
        // Initialize with default schedule
        const defaultSchedule: DoctorSchedule[] = DAYS_OF_WEEK.map(day => ({
          day_of_week: day as DoctorSchedule['day_of_week'],
          start_time: '17:00',
          end_time: '21:00',
          is_available: true,
          slot_order: 0,
          slot_name: null,
          max_appointments_per_slot: 1,
          appointment_duration: 30,
          break_start: null,
          break_end: null,
          notes: null
        }));
        setSchedule(defaultSchedule);
      }
    } catch (error) {
      toast.error('Failed to load user data');
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQualification = () => {
    setFormData({
      ...formData,
      qualifications: [...formData.qualifications, '']
    });
  };

  const handleRemoveQualification = (index: number) => {
    setFormData({
      ...formData,
      qualifications: formData.qualifications.filter((_, i) => i !== index)
    });
  };

  const handleAddService = () => {
    setFormData({
      ...formData,
      services: [...formData.services, '']
    });
  };

  const handleRemoveService = (index: number) => {
    setFormData({
      ...formData,
      services: formData.services.filter((_, i) => i !== index)
    });
  };

  const handleAddFAQ = () => {
    setFormData({
      ...formData,
      faqs: [...formData.faqs, { question: '', answer: '' }]
    });
  };

  const handleRemoveFAQ = (index: number) => {
    setFormData({
      ...formData,
      faqs: formData.faqs.filter((_, i) => i !== index)
    });
  };

  const handleAddShareProcedure = () => {
    setFormData({
      ...formData,
      share_procedures: [...formData.share_procedures, {
        procedure_name: '',
        share_type: 'percentage',
        share_value: 0
      }]
    });
  };

  const handleRemoveShareProcedure = (index: number) => {
    setFormData({
      ...formData,
      share_procedures: formData.share_procedures.filter((_, i) => i !== index)
    });
  };

  const handleToggleRole = (role: string) => {
    const isAddingAdmin = role === 'Admin' && !formData.roles.includes(role);
    const newRoles = formData.roles.includes(role)
      ? formData.roles.filter(r => r !== role)
      : [...formData.roles, role];
    
    setFormData({
      ...formData,
      roles: newRoles
    });
    
    // If Admin is being selected and user is on any tab other than biography-data, switch to biography-data tab
    if (isAddingAdmin && currentTab !== 'biography-data') {
      setCurrentTab('biography-data');
    }
  };

  const handleToggleFollowUpShareType = (type: string) => {
    if (formData.follow_up_share_types.includes(type)) {
      setFormData({
        ...formData,
        follow_up_share_types: formData.follow_up_share_types.filter(t => t !== type)
      });
    } else {
      setFormData({
        ...formData,
        follow_up_share_types: [...formData.follow_up_share_types, type]
      });
    }
  };

  // Convert schedule to timings format for submission
  const convertScheduleToTimings = (scheduleData: DoctorSchedule[]): TimingEntry[] => {
    return scheduleData.map(slot => ({
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
      duration: slot.appointment_duration || 30,
      is_available: slot.is_available
    }));
  };

  // Validate current tab before proceeding
  const validateCurrentTab = (): boolean => {
    const errors: ValidationError[] = [];
    const timingsFromSchedule = convertScheduleToTimings(schedule);
    const formDataWithSchedule = { ...formData, timings: timingsFromSchedule };

    switch (currentTab) {
      case 'biography-data':
        if (!formData.name || formData.name.trim().length === 0) {
          errors.push({ field: 'name', message: 'Name is required' });
        }
        if (!formData.email || formData.email.trim().length === 0) {
          errors.push({ field: 'email', message: 'Email is required' });
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          errors.push({ field: 'email', message: 'Invalid email format' });
        }
        if (!formData.phone || formData.phone.trim().length === 0) {
          errors.push({ field: 'phone', message: 'Phone is required' });
        } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
          errors.push({ field: 'phone', message: 'Invalid phone format' });
        }
        if (!userId && (!formData.password || formData.password.length < 6)) {
          errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
        }
        if (formData.roles.length === 0) {
          errors.push({ field: 'roles', message: 'At least one role must be selected' });
        }
        break;

      case 'qualification':
        // Skip validation if Admin role is selected
        if (!formData.roles.includes('Admin')) {
          const validQualifications = formData.qualifications.filter(q => q.trim().length > 0);
          if (validQualifications.length === 0) {
            errors.push({ field: 'qualifications', message: 'At least one qualification is required' });
          }
        }
        break;

      case 'service':
        // Skip validation if Admin role is selected
        if (!formData.roles.includes('Admin')) {
          const validServices = formData.services.filter(s => s.trim().length > 0);
          if (validServices.length === 0) {
            errors.push({ field: 'services', message: 'At least one service is required' });
          }
        }
        break;

      case 'timings':
        // Skip validation if Admin role is selected
        if (!formData.roles.includes('Admin')) {
          const availableSlots = schedule.filter(s => s.is_available);
          if (availableSlots.length === 0) {
            errors.push({ field: 'timings', message: 'At least one time slot must be available' });
          }
          // Validate each available slot
          schedule.forEach((slot, index) => {
            if (slot.is_available) {
              if (!slot.start_time || !slot.end_time) {
                errors.push({
                  field: `timing_${index}`,
                  message: `Start time and end time are required for ${slot.day_of_week}`
                });
              }
              if (slot.appointment_duration && (slot.appointment_duration < 5 || slot.appointment_duration > 120)) {
                errors.push({
                  field: `timing_duration_${index}`,
                  message: `Duration must be between 5 and 120 minutes for ${slot.day_of_week}`
                });
              }
            }
          });
        }
        break;

      case 'faqs':
        // Skip validation if Admin role is selected
        if (!formData.roles.includes('Admin')) {
          formData.faqs.forEach((faq, index) => {
            if (!faq.question || faq.question.trim().length === 0) {
              errors.push({ field: `faq_question_${index}`, message: 'FAQ question is required' });
            }
            if (!faq.answer || faq.answer.trim().length === 0) {
              errors.push({ field: `faq_answer_${index}`, message: 'FAQ answer is required' });
            }
          });
        }
        break;

      case 'share-procedures':
        // Skip validation if Admin role is selected
        if (!formData.roles.includes('Admin')) {
          formData.share_procedures.forEach((procedure, index) => {
            if (!procedure.procedure_name || procedure.procedure_name.trim().length === 0) {
              errors.push({ field: `procedure_name_${index}`, message: 'Procedure name is required' });
            }
            if (procedure.share_value <= 0) {
              errors.push({ field: `procedure_value_${index}`, message: 'Share value must be greater than 0' });
            }
          });
        }
        break;

      case 'biography':
        // Biography tab is optional, no validation needed
        break;
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      const firstError = errors[0];
      toast.error(firstError.message || 'Please fix validation errors');
      return false;
    }

    setValidationErrors([]);
    return true;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Convert schedule to timings format for validation
      const timingsFromSchedule = convertScheduleToTimings(schedule);
      const formDataWithSchedule = { ...formData, timings: timingsFromSchedule };
      
      // Validate entire form
      const errors = validateUserForm(formDataWithSchedule);
      if (errors.length > 0) {
        setValidationErrors(errors);
        const firstError = errors[0];
        toast.error(firstError.message || 'Please fix validation errors');
        
        // Navigate to tab with error if needed
        const isAdmin = formData.roles.includes('Admin');
        if (firstError.field === 'name' || firstError.field === 'email' || firstError.field === 'phone' || firstError.field === 'password' || firstError.field === 'roles') {
          setCurrentTab('biography-data');
        } else if (!isAdmin && firstError.field.startsWith('qualification')) {
          setCurrentTab('qualification');
        } else if (!isAdmin && firstError.field.startsWith('service')) {
          setCurrentTab('service');
        } else if (!isAdmin && firstError.field.startsWith('timing')) {
          setCurrentTab('timings');
        } else if (firstError.field.startsWith('faq')) {
          setCurrentTab('faqs');
        } else if (firstError.field.startsWith('procedure')) {
          setCurrentTab('share-procedures');
        }
        
        return;
      }

      setValidationErrors([]);
      
      // Clean up empty qualifications and services
      const cleanedData = {
        ...formData,
        timings: timingsFromSchedule,
        qualifications: formData.qualifications.filter(q => q.trim().length > 0),
        services: formData.services.filter(s => s.trim().length > 0)
      };

      let savedUserId = userId;
      if (userId) {
        await api.updateUser(userId, cleanedData);
        savedUserId = userId;
        toast.success('User updated successfully');
      } else {
        const newUser = await api.createUser(cleanedData);
        savedUserId = newUser.id;
        toast.success('User created successfully');
      }
      
      // Save permissions after user is created/updated
      if (savedUserId && Object.keys(rolePermissions).length > 0) {
        try {
          // Convert rolePermissions to the format expected by API (Record<string, boolean>)
          const permissionsToSave: Record<string, boolean> = {};
          
          // Get all selected permissions from all roles
          Object.values(rolePermissions).forEach(permKeys => {
            permKeys.forEach(permKey => {
              permissionsToSave[permKey] = true;
            });
          });
          
          if (Object.keys(permissionsToSave).length > 0) {
            await api.updateUserPermissions(savedUserId, permissionsToSave);
          }
        } catch (permError) {
          console.error('Failed to save permissions:', permError);
          toast.error('User saved but failed to update permissions');
        }
      }
      
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save user');
      console.error('Error saving user:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter tabs based on selected roles - show only Biography Data for Admin
  const isAdmin = formData.roles.includes('Admin');
  const tabsList = isAdmin 
    ? [
        { id: 'biography-data', label: 'Biography Data' }
      ]
    : [
        { id: 'biography-data', label: 'Biography Data' },
        { id: 'biography', label: 'Biography' },
        { id: 'qualification', label: 'Qualification' },
        { id: 'service', label: 'Service' },
        { id: 'timings', label: 'Timings' },
        { id: 'faqs', label: 'FAQs' },
        { id: 'share-procedures', label: "Doctor's Share Procedures" }
      ];

  const currentTabIndex = tabsList.findIndex(t => t.id === currentTab);
  const canGoNext = currentTabIndex < tabsList.length - 1;
  const canGoPrev = currentTabIndex > 0;

  const handleNext = () => {
    if (!canGoNext) return;
    
    // Validate current tab before proceeding
    if (!validateCurrentTab()) {
      return; // Don't proceed if validation fails
    }
    
    setCurrentTab(tabsList[currentTabIndex + 1].id);
  };

  const handlePrev = () => {
    if (canGoPrev) {
      setCurrentTab(tabsList[currentTabIndex - 1].id);
    }
  };

  if (loading && userId) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{userId ? 'Edit User' : 'Add User'}</h1>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-gray-100 p-1 text-gray-600 w-full overflow-x-auto">
          {tabsList.map(tab => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id} 
              className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-950 data-[state=active]:shadow-sm"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab 1: Biography Data */}
        <TabsContent value="biography-data" className="mt-6 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Biography Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Name*</Label>
                  <Input
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setValidationErrors(validationErrors.filter(e => e.field !== 'name'));
                    }}
                    className={validationErrors.some(e => e.field === 'name') ? 'border-red-500' : ''}
                  />
                  {validationErrors.some(e => e.field === 'name') && (
                    <p className="text-sm text-red-600">
                      {validationErrors.find(e => e.field === 'name')?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  <RadioGroup
                    value={formData.gender}
                    onValueChange={(value: 'Male' | 'Female' | 'Other') => 
                      setFormData({ ...formData, gender: value })
                    }
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Male" id="male" />
                      <Label htmlFor="male" className="font-normal cursor-pointer">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Female" id="female" />
                      <Label htmlFor="female" className="font-normal cursor-pointer">Female</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Other" id="other" />
                      <Label htmlFor="other" className="font-normal cursor-pointer">Other</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Phone*</Label>
                  <div className="flex gap-2">
                    <Input
                      className="w-20 bg-gray-50"
                      value="+92"
                      readOnly
                    />
                    <Input
                      className="flex-1"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email*</Label>
                  <Input
                    type="email"
                    placeholder="something@healthwire.pk"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      setValidationErrors(validationErrors.filter(e => e.field !== 'email'));
                    }}
                    className={validationErrors.some(e => e.field === 'email') ? 'border-red-500' : ''}
                  />
                  {validationErrors.some(e => e.field === 'email') && (
                    <p className="text-sm text-red-600">
                      {validationErrors.find(e => e.field === 'email')?.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>User departments</Label>
                  <Input
                    placeholder="Enter departments"
                    value={formData.departments.join(', ')}
                    onChange={(e) => setFormData({
                      ...formData,
                      departments: e.target.value.split(',').map(d => d.trim()).filter(d => d)
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Password{!userId && '*'}</Label>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      setValidationErrors(validationErrors.filter(e => e.field !== 'password'));
                    }}
                    className={validationErrors.some(e => e.field === 'password') ? 'border-red-500' : ''}
                  />
                  {validationErrors.some(e => e.field === 'password') && (
                    <p className="text-sm text-red-600">
                      {validationErrors.find(e => e.field === 'password')?.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Shift</Label>
                <Select value={formData.shift} onValueChange={(value) => setFormData({ ...formData, shift: value })}>
                  <SelectTrigger className="w-full md:w-1/2">
                    <SelectValue placeholder="Select shifts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="afternoon">Afternoon</SelectItem>
                    <SelectItem value="night">Night</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="text-base font-semibold">Roles*</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg">
                  {AVAILABLE_ROLES.map(role => (
                    <div key={role.value} className="flex items-start space-x-3 p-2 hover:bg-white rounded transition-colors">
                      <Checkbox
                        id={role.value}
                        checked={formData.roles.includes(role.value)}
                        onCheckedChange={() => {
                          handleToggleRole(role.value);
                          setValidationErrors(validationErrors.filter(e => e.field !== 'roles'));
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor={role.value} className="font-medium cursor-pointer text-sm">
                          {role.label}
                        </Label>
                        <p className="text-xs text-gray-600 mt-1">{role.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {validationErrors.some(e => e.field === 'roles') && (
                  <p className="text-sm text-red-600">
                    {validationErrors.find(e => e.field === 'roles')?.message}
                  </p>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="opd"
                    checked={formData.opd_access}
                    onCheckedChange={(checked) => setFormData({ ...formData, opd_access: checked === true })}
                  />
                  <Label htmlFor="opd" className="font-normal cursor-pointer">OPD</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ipd"
                    checked={formData.ipd_access}
                    onCheckedChange={(checked) => setFormData({ ...formData, ipd_access: checked === true })}
                  />
                  <Label htmlFor="ipd" className="font-normal cursor-pointer">IPD</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Booking Type</Label>
                <RadioGroup
                  value={formData.booking_type}
                  onValueChange={(value: 'Token' | 'Appointment') => 
                    setFormData({ ...formData, booking_type: value })
                  }
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Token" id="token" />
                    <Label htmlFor="token" className="font-normal cursor-pointer">Token</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Appointment" id="appointment" />
                    <Label htmlFor="appointment" className="font-normal cursor-pointer">Appointment</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Separator className="my-6" />

          {/* Role-Based Permissions - Show sections for all selected roles */}
          {(() => {
            const roleSections: JSX.Element[] = [];
            
            // Show Admin Role User Rights if Admin is selected
            if (formData.roles.includes('Admin')) {
              const adminRolePermissions = rolePermissionMappings['Admin'] || [];
              const adminPermsToShow = permissionDefinitions.filter(p => 
                adminRolePermissions.includes(p.permission_key)
              );
              
              roleSections.push(
                <Card key="admin" className="border-0 shadow-sm mb-6">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Admin Role User Rights</CardTitle>
                        <CardDescription>
                          Permissions assigned to Admin role ({adminPermsToShow.length} available)
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const allAdminPermissionKeys = adminPermsToShow.map(p => p.permission_key);
                            setRolePermissions({
                              ...rolePermissions,
                              admin: allAdminPermissionKeys
                            });
                          }}
                        >
                          Select All
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setRolePermissions({
                              ...rolePermissions,
                              admin: []
                            });
                          }}
                        >
                          Unselect All
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {permissionDefinitions.length === 0 ? (
                      <div className="text-sm text-gray-500 py-4">Loading permissions...</div>
                    ) : adminPermsToShow.length === 0 ? (
                      <div className="text-sm text-gray-500 py-4">
                        No permissions assigned to Admin role. Please assign permissions in Role Permissions Management.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {adminPermsToShow.map(perm => (
                          <div key={perm.permission_key} className="flex items-start space-x-2 p-2 hover:bg-gray-50 rounded">
                            <Checkbox
                              id={perm.permission_key}
                              checked={rolePermissions['admin']?.includes(perm.permission_key) || false}
                              onCheckedChange={(checked) => {
                                const currentPerms = rolePermissions['admin'] || [];
                                if (checked) {
                                  setRolePermissions({
                                    ...rolePermissions,
                                    admin: [...currentPerms, perm.permission_key]
                                  });
                                } else {
                                  setRolePermissions({
                                    ...rolePermissions,
                                    admin: currentPerms.filter(p => p !== perm.permission_key)
                                  });
                                }
                              }}
                              className="mt-1"
                            />
                            <Label htmlFor={perm.permission_key} className="font-normal cursor-pointer text-sm flex-1">
                              {perm.permission_name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            }
            
            // Show permissions for other selected roles (including Doctor, etc.)
            const otherRoleCategories = [
              { key: 'staff', label: 'Staff Role User Rights', roleValue: 'Staff' },
              { key: 'bloodBankManager', label: 'Blood Bank Manager User Rights', roleValue: 'Blood Bank Manager' },
              { key: 'nurse', label: 'Nurse Role User Rights', roleValue: 'Nurse' },
              { key: 'inventoryManager', label: 'Inventory Manager User Rights', roleValue: 'Inventory Manager' },
              { key: 'labManager', label: 'Laboratory Manager User Rights', roleValue: 'Lab Manager' },
              { key: 'accountant', label: 'Accountant Role User Rights', roleValue: 'Accountant' },
              { key: 'labTechnician', label: 'Laboratory Technician User Rights', roleValue: 'Lab Technician' },
              { key: 'radiologyTechnician', label: 'Radiology Technician User Rights', roleValue: 'Radiology Technician' },
              { key: 'radiologyManager', label: 'Radiology Manager User Rights', roleValue: 'Radiology Manager' },
              { key: 'pharmacist', label: 'Pharmacist User Rights', roleValue: 'Pharmacist' },
              { key: 'labReceptionist', label: 'Lab Receptionist User Rights', roleValue: 'Lab Receptionist' },
              { key: 'doctor', label: 'Doctor Role User Rights', roleValue: 'Doctor' },
              { key: 'emergencyManager', label: 'Emergency Manager User Rights', roleValue: 'Emergency Manager' },
              { key: 'emergencyNurse', label: 'Emergency Nurse User Rights', roleValue: 'Emergency Nurse' },
              { key: 'emergencyReceptionist', label: 'Emergency Receptionist User Rights', roleValue: 'Emergency Receptionist' },
              { key: 'qualityControlManager', label: 'Quality Control Manager User Rights', roleValue: 'Quality Control Manager' },
              { key: 'radiologyReceptionist', label: 'Radiology Receptionist User Rights', roleValue: 'Radiology Receptionist' },
              { key: 'receptionist', label: 'Receptionist User Rights', roleValue: 'Receptionist' }
            ]
            .filter(category => formData.roles.includes(category.roleValue))
            .forEach(category => {
              // Get permissions assigned to this role from role_permissions table
              const rolePermissionKeys = rolePermissionMappings[category.roleValue] || [];
              const permissions = permissionDefinitions.filter(p => 
                rolePermissionKeys.includes(p.permission_key)
              );
              
              roleSections.push(
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
                            setRolePermissions({
                              ...rolePermissions,
                              [category.key]: allPermissionKeys
                            });
                          }}
                        >
                          Select All
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setRolePermissions({
                              ...rolePermissions,
                              [category.key]: []
                            });
                          }}
                        >
                          Unselect All
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {permissions.length === 0 ? (
                      <div className="text-sm text-gray-500 py-4">
                        {permissionDefinitions.length === 0 ? 'Loading permissions...' : 'No permissions available for this role.'}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {permissions.map(perm => (
                          <div key={perm.permission_key} className="flex items-start space-x-2 p-2 hover:bg-gray-50 rounded">
                            <Checkbox
                              id={perm.permission_key}
                              checked={rolePermissions[category.key]?.includes(perm.permission_key) || false}
                              onCheckedChange={(checked) => {
                                const currentPerms = rolePermissions[category.key] || [];
                                if (checked) {
                                  setRolePermissions({
                                    ...rolePermissions,
                                    [category.key]: [...currentPerms, perm.permission_key]
                                  });
                                } else {
                                  setRolePermissions({
                                    ...rolePermissions,
                                    [category.key]: currentPerms.filter(p => p !== perm.permission_key)
                                  });
                                }
                              }}
                              className="mt-1"
                            />
                            <Label htmlFor={perm.permission_key} className="font-normal cursor-pointer text-sm flex-1">
                              {perm.permission_name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            });
            
            // Return all role sections
            return <>{roleSections}</>;
          })()}

          <Separator className="my-6" />

          {/* Additional Settings */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Additional Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="instant_booking"
                  checked={formData.instant_booking}
                  onCheckedChange={(checked) => setFormData({ ...formData, instant_booking: checked === true })}
                />
                <Label htmlFor="instant_booking" className="font-normal cursor-pointer">Instant Booking</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="visit_charges"
                  checked={formData.visit_charges}
                  onCheckedChange={(checked) => setFormData({ ...formData, visit_charges: checked === true })}
                />
                <Label htmlFor="visit_charges" className="font-normal cursor-pointer">Visit Charges</Label>
              </div>

              <div className="space-y-2">
                <Label>Invoice Edit Limit</Label>
                <Input
                  type="number"
                  placeholder="Invoice Edit Limit"
                  value={formData.invoice_edit_count || ''}
                  onChange={(e) => setFormData({ ...formData, invoice_edit_count: parseInt(e.target.value) || 0 })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Biography */}
        <TabsContent value="biography" className="mt-6 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Biography</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Professional Statement</Label>
                <Textarea
                  placeholder="Enter professional statement"
                  value={formData.professional_statement}
                  onChange={(e) => setFormData({ ...formData, professional_statement: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Awards</Label>
                <Input
                  placeholder="Enter awards"
                  value={formData.awards}
                  onChange={(e) => setFormData({ ...formData, awards: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Expertise</Label>
                <Input
                  placeholder="Enter expertise"
                  value={formData.expertise}
                  onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Registrations</Label>
                <Input
                  placeholder="Enter registrations"
                  value={formData.registrations}
                  onChange={(e) => setFormData({ ...formData, registrations: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Professional Memberships</Label>
                <Input
                  placeholder="Enter professional memberships"
                  value={formData.professional_memberships}
                  onChange={(e) => setFormData({ ...formData, professional_memberships: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Languages</Label>
                <Input
                  placeholder="Languages"
                  value={formData.languages}
                  onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Experience</Label>
                <Input
                  placeholder="Enter experience"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Degree Completion Date</Label>
                <Input
                  type="date"
                  value={formData.degree_completion_date}
                  onChange={(e) => setFormData({ ...formData, degree_completion_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Summary</Label>
                <Textarea
                  placeholder="Enter summary"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>PMDC</Label>
                <Input
                  placeholder="Pmdc"
                  value={formData.pmdc}
                  onChange={(e) => setFormData({ ...formData, pmdc: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Qualification */}
        <TabsContent value="qualification" className="space-y-6 mt-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Qualification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.qualifications.map((qualification, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Qualification"
                    value={qualification}
                    onChange={(e) => {
                      const newQualifications = [...formData.qualifications];
                      newQualifications[index] = e.target.value;
                      setFormData({ ...formData, qualifications: newQualifications });
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveQualification(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={handleAddQualification}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                QUALIFICATION
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Service */}
        <TabsContent value="service" className="space-y-6 mt-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.services.map((service, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Service"
                    value={service}
                    onChange={(e) => {
                      const newServices = [...formData.services];
                      newServices[index] = e.target.value;
                      setFormData({ ...formData, services: newServices });
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveService(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={handleAddService}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                SERVICE
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Timings */}
        <TabsContent value="timings" className="space-y-6 mt-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Timings</CardTitle>
            </CardHeader>
            <CardContent>
              <DoctorScheduleContent
                schedule={schedule}
                setSchedule={setSchedule}
                defaultStartTime="09:00"
                defaultEndTime="17:00"
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 6: FAQs */}
        <TabsContent value="faqs" className="space-y-6 mt-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">FAQs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.faqs.length === 0 && (
                <Alert>
                  <Info className="w-4 h-4" />
                  <AlertDescription>No FAQs added yet. Click "Add FAQ" to add one.</AlertDescription>
                </Alert>
              )}
              {formData.faqs.map((faq, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Question</Label>
                      <Input
                        placeholder="Enter question"
                        value={faq.question}
                        onChange={(e) => {
                          const newFaqs = [...formData.faqs];
                          newFaqs[index].question = e.target.value;
                          setFormData({ ...formData, faqs: newFaqs });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Answer</Label>
                      <Textarea
                        placeholder="Enter answer"
                        value={faq.answer}
                        onChange={(e) => {
                          const newFaqs = [...formData.faqs];
                          newFaqs[index].answer = e.target.value;
                          setFormData({ ...formData, faqs: newFaqs });
                        }}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFAQ(index)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </Card>
              ))}
              <Button
                variant="outline"
                onClick={handleAddFAQ}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add FAQ
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 7: Share Procedures */}
        <TabsContent value="share-procedures" className="space-y-6 mt-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Doctor's Share Procedures</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.share_procedures.map((procedure, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1 space-y-2">
                    <Label>Procedure</Label>
                    <Select
                      value={procedure.procedure_name}
                      onValueChange={(value) => {
                        const newProcedures = [...formData.share_procedures];
                        newProcedures[index].procedure_name = value;
                        setFormData({ ...formData, share_procedures: newProcedures });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select procedure" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROCEDURE_TYPES.map((procType) => (
                          <SelectItem key={procType} value={procType}>
                            {procType}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-32 space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={procedure.share_type}
                      onValueChange={(value: 'percentage' | 'rupees') => {
                        const newProcedures = [...formData.share_procedures];
                        newProcedures[index].share_type = value;
                        setFormData({ ...formData, share_procedures: newProcedures });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">percentage</SelectItem>
                        <SelectItem value="rupees">rupees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-32 space-y-2">
                    <Label>Value</Label>
                    <Input
                      type="number"
                      value={procedure.share_value}
                      onChange={(e) => {
                        const newProcedures = [...formData.share_procedures];
                        newProcedures[index].share_value = parseFloat(e.target.value) || 0;
                        setFormData({ ...formData, share_procedures: newProcedures });
                      }}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveShareProcedure(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={handleAddShareProcedure}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Doctor Share
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-4 border-t">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={!canGoPrev}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          {canGoNext ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <PermissionButton 
              permission={userId ? "admin.edit_users" : "admin.create_users"}
              tooltipMessage={userId ? "You need permission to edit users" : "You need permission to create users"}
              onClick={handleSubmit} 
              disabled={loading}
            >
              {loading ? 'Saving...' : userId ? 'Update' : 'Add'}
            </PermissionButton>
          )}
        </div>
      </div>
    </div>
  );
}

