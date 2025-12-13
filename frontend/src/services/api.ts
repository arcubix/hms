// Import billing types
import type {
  Organization,
  SubscriptionPlan,
  OrganizationSubscription,
  SubscriptionAddon,
  Invoice,
  InvoiceItem,
  Payment,
  BillingSettings,
  CreateOrganizationData,
  CreateSubscriptionData,
  CreateInvoiceData,
  CreatePaymentData,
} from '../types/billing';

// Try without index.php first, fallback to with index.php if needed
// @ts-ignore - Vite environment variables
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://0neconnect.com/backendhospital' : 'http://localhost/hms');
// @ts-ignore - Vite environment variables
const API_URL_WITH_INDEX = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://0neconnect.com/backendhospital/index.php' : 'http://localhost/hms/index.php');

class ApiService {
  private token: string | null = null;
  private onUnauthorizedCallback: (() => void) | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('hms-token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('hms-token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('hms-token');
  }

  // Set callback to be called when 401 Unauthorized is detected
  setOnUnauthorized(callback: () => void) {
    this.onUnauthorizedCallback = callback;
  }

  // Clear user data and notify callback
  private handleUnauthorized() {
    this.clearToken();
    localStorage.removeItem('hms-user');
    if (this.onUnauthorizedCallback) {
      this.onUnauthorizedCallback();
    }
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Try with index.php if first attempt fails
    const tryUrl = (url: string) => {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      return fetch(url, {
        ...options,
        headers,
        mode: 'cors', // Explicitly set CORS mode
      });
    };

    try {
      // First try without index.php
      let response = await tryUrl(`${API_URL}${endpoint}`);
      
      // If 404, try with index.php
      if (response.status === 404) {
        response = await tryUrl(`${API_URL_WITH_INDEX}${endpoint}`);
      }

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        if (!response.ok) {
          // Handle 401 Unauthorized even for non-JSON responses
          if (response.status === 401) {
            this.handleUnauthorized();
            throw new Error('Session expired. Please login again.');
          }
          const text = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
        }
        return {} as T;
      }

      const data = await response.json();

      if (!response.ok) {
        // Handle 401 Unauthorized - session expired or invalid token
        if (response.status === 401) {
          this.handleUnauthorized();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(data.message || `API Error: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const data = await this.request<{
      success: boolean;
      data: {
        token: string;
        user: {
          id: string;
          name: string;
          email: string;
          role: string;
        };
        doctor?: {
          id: number;
          doctor_id: string;
          specialty: string;
          experience: number;
          qualification?: string;
          status: string;
          schedule_start: string;
          schedule_end: string;
        };
      };
      message: string;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.success && data.data.token) {
      this.setToken(data.data.token);
      return data.data;
    }

    throw new Error(data.message || 'Login failed');
  }

  async logout() {
    try {
      await this.request('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearToken();
    }
  }

  // Module endpoints
  async getAllModules() {
    const data = await this.request<{
      success: boolean;
      data: Array<{
        module_id: string;
        label: string;
        description: string;
        category: string;
        icon_name: string;
        color_from: string;
        color_to: string;
        is_active: boolean;
        display_order: number;
      }>;
    }>('/api/modules');
    return data.data || [];
  }

  async getPriorityModules() {
    const data = await this.request<{
      success: boolean;
      data: Array<{
        module_id: string;
        label: string;
        description: string;
        category: string;
        icon_name: string;
        color_from: string;
        color_to: string;
        is_active: boolean;
        display_order: number;
        position: number;
      }>;
    }>('/api/priority-modules');
    return data.data || [];
  }

  async savePriorityModules(modules: string[]) {
    const data = await this.request<{
      success: boolean;
      message: string;
      data: Array<{
        module_id: string;
        label: string;
        description: string;
        category: string;
        icon_name: string;
        color_from: string;
        color_to: string;
        is_active: boolean;
        display_order: number;
        position: number;
      }>;
    }>('/api/priority-modules', {
      method: 'POST',
      body: JSON.stringify({ modules }),
    });
    return data.data || [];
  }

  // Patient endpoints
  async getPatients(filters?: { search?: string; phone?: string }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.phone) params.append('phone', filters.phone);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/patients?${queryString}` : '/api/patients';
    
    const data = await this.request<{
      success: boolean;
      data: Patient[];
    }>(endpoint);
    return data.data || [];
  }

  async getPatient(id: string) {
    const data = await this.request<{
      success: boolean;
      data: Patient;
    }>(`/api/patients/${id}`);
    return data.data;
  }

  async createPatient(patientData: CreatePatientData) {
    const data = await this.request<{
      success: boolean;
      data: Patient;
      message: string;
    }>('/api/patients', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
    return data.data;
  }

  async updatePatient(id: string, patientData: Partial<CreatePatientData>) {
    const data = await this.request<{
      success: boolean;
      data: Patient;
      message: string;
    }>(`/api/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patientData),
    });
    return data.data;
  }

  async deletePatient(id: string) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/patients/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  // Doctor endpoints
  async getDoctors(filters?: { search?: string; status?: string; specialty?: string }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.specialty) params.append('specialty', filters.specialty);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/doctors?${queryString}` : '/api/doctors';
    
    const data = await this.request<{
      success: boolean;
      data: Doctor[];
    }>(endpoint);
    return data.data || [];
  }

  async getDoctor(id: string) {
    const data = await this.request<{
      success: boolean;
      data: Doctor;
    }>(`/api/doctors/${id}`);
    return data.data;
  }

  async createDoctor(doctorData: CreateDoctorData) {
    const data = await this.request<{
      success: boolean;
      data: Doctor;
      message: string;
    }>('/api/doctors', {
      method: 'POST',
      body: JSON.stringify(doctorData),
    });
    return data.data;
  }

  async updateDoctor(id: string, doctorData: Partial<CreateDoctorData>) {
    const data = await this.request<{
      success: boolean;
      data: Doctor;
      message: string;
    }>(`/api/doctors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(doctorData),
    });
    return data.data;
  }

  async deleteDoctor(id: string) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/doctors/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  async getDoctorSchedule(id: string) {
    const data = await this.request<{
      success: boolean;
      data: DoctorSchedule[];
    }>(`/api/doctors/${id}/schedule`);
    return data.data || [];
  }

  async updateDoctorSchedule(id: string, schedule: DoctorSchedule[]) {
    const data = await this.request<{
      success: boolean;
      data: DoctorSchedule[];
      message: string;
    }>(`/api/doctors/${id}/schedule`, {
      method: 'PUT',
      body: JSON.stringify({ schedule }),
    });
    return data.data;
  }

  // Appointment endpoints
  async getAppointments(filters?: { 
    search?: string; 
    status?: string; 
    doctor_id?: number; 
    patient_id?: number; 
    date?: string;
    date_from?: string;
    date_to?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.doctor_id) params.append('doctor_id', filters.doctor_id.toString());
    if (filters?.patient_id) params.append('patient_id', filters.patient_id.toString());
    if (filters?.date) params.append('date', filters.date);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/appointments?${queryString}` : '/api/appointments';
    
    const data = await this.request<{
      success: boolean;
      data: Appointment[];
    }>(endpoint);
    return data.data || [];
  }

  async getAppointment(id: string) {
    const data = await this.request<{
      success: boolean;
      data: Appointment;
    }>(`/api/appointments/${id}`);
    return data.data;
  }

  async createAppointment(appointmentData: CreateAppointmentData) {
    const data = await this.request<{
      success: boolean;
      data: Appointment;
      message: string;
    }>('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
    return data.data;
  }

  async updateAppointment(id: string, appointmentData: Partial<CreateAppointmentData>) {
    const data = await this.request<{
      success: boolean;
      data: Appointment;
      message: string;
    }>(`/api/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(appointmentData),
    });
    return data.data;
  }

  async deleteAppointment(id: string) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/appointments/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  async updateAppointmentStatus(id: string, status: Appointment['status']) {
    const data = await this.request<{
      success: boolean;
      data: Appointment;
      message: string;
    }>(`/api/appointments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return data.data;
  }

  async getAvailableSlots(doctorId: string, date: string, duration?: number) {
    const params = new URLSearchParams();
    params.append('date', date);
    if (duration) params.append('duration', duration.toString());
    
    try {
      const data = await this.request<{
        success: boolean;
        data: AvailableSlot[];
      }>(`/api/appointments/doctor/${doctorId}/slots?${params.toString()}`);
      
      // Ensure we always return an array
      if (data && data.data && Array.isArray(data.data)) {
        return data.data;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching slots for doctor ${doctorId}:`, error);
      return [];
    }
  }

  async getDoctorAvailableDates(doctorId: string, month: string) {
    const data = await this.request<{
      success: boolean;
      data: {
        month: string;
        available_dates: AvailableDate[];
      };
    }>(`/api/appointments/doctor/${doctorId}/available-dates?month=${month}`);
    return data.data;
  }

  async getDoctorAppointments(doctorId: string, date?: string) {
    const params = date ? `?date=${date}` : '';
    const data = await this.request<{
      success: boolean;
      data: Appointment[];
    }>(`/api/appointments/doctor/${doctorId}${params}`);
    return data.data || [];
  }

  async getPatientAppointments(patientId: string) {
    const data = await this.request<{
      success: boolean;
      data: Appointment[];
    }>(`/api/appointments/patient/${patientId}`);
    return data.data || [];
  }

  // Prescription endpoints
  async getPrescriptions(filters?: {
    patient_id?: number;
    doctor_id?: number;
    appointment_id?: number;
    status?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.patient_id) params.append('patient_id', filters.patient_id.toString());
    if (filters?.doctor_id) params.append('doctor_id', filters.doctor_id.toString());
    if (filters?.appointment_id) params.append('appointment_id', filters.appointment_id.toString());
    if (filters?.status) params.append('status', filters.status);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/prescriptions?${queryString}` : '/api/prescriptions';
    
    const data = await this.request<{
      success: boolean;
      data: Prescription[];
    }>(endpoint);
    return data.data || [];
  }

  async getPrescription(id: string) {
    const data = await this.request<{
      success: boolean;
      data: Prescription;
    }>(`/api/prescriptions/${id}`);
    return data.data;
  }

  async createPrescription(prescriptionData: CreatePrescriptionData) {
    const data = await this.request<{
      success: boolean;
      data: Prescription;
      message: string;
    }>('/api/prescriptions', {
      method: 'POST',
      body: JSON.stringify(prescriptionData),
    });
    return data.data;
  }

  async updatePrescription(id: string, prescriptionData: Partial<CreatePrescriptionData>) {
    const data = await this.request<{
      success: boolean;
      data: Prescription;
      message: string;
    }>(`/api/prescriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(prescriptionData),
    });
    return data.data;
  }

  // Medicine endpoints
  async getMedicines(filters?: {
    search?: string;
    category?: string;
    status?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/medicines?${queryString}` : '/api/medicines';
    
    const data = await this.request<{
      success: boolean;
      data: Medicine[];
    }>(endpoint);
    return data.data || [];
  }


  async createMedicine(medicineData: {
    name: string;
    generic_name?: string;
    category?: string;
    strength?: string;
    unit?: string;
    min_stock?: number;
    max_stock?: number;
    requires_prescription?: number;
    status?: string;
  }) {
    const data = await this.request<{
      success: boolean;
      data: Medicine;
      message: string;
    }>('/api/medicines', {
      method: 'POST',
      body: JSON.stringify(medicineData),
    });
    return data.data;
  }

  async updateMedicine(id: string, medicineData: Partial<{
    name: string;
    generic_name?: string;
    category?: string;
    strength?: string;
    unit?: string;
    min_stock?: number;
    max_stock?: number;
    requires_prescription?: number;
    status?: string;
  }>) {
    const data = await this.request<{
      success: boolean;
      data: Medicine;
      message: string;
    }>(`/api/medicines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(medicineData),
    });
    return data.data;
  }

  // Radiology test endpoints
  async getRadiologyTests(filters?: {
    search?: string;
    test_type?: string;
    category?: string;
    status?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.test_type) params.append('test_type', filters.test_type);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/radiology-tests?${queryString}` : '/api/radiology-tests';
    
    const data = await this.request<{
      success: boolean;
      data: RadiologyTest[];
    }>(endpoint);
    return data.data || [];
  }

  // Lab test endpoints
  async getLabTests(filters?: {
    search?: string;
    test_type?: string;
    category?: string;
    status?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.test_type) params.append('test_type', filters.test_type);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/lab-tests?${queryString}` : '/api/lab-tests';
    
    const data = await this.request<{
      success: boolean;
      data: LabTest[];
    }>(endpoint);
    return data.data || [];
  }

  async getLabTest(id: string) {
    const data = await this.request<{
      success: boolean;
      data: LabTest;
    }>(`/api/lab-tests/${id}`);
    return data.data;
  }

  async getLabTestCategories() {
    const data = await this.request<{
      success: boolean;
      data: Array<{ category: string }>;
    }>('/api/lab-tests/categories');
    return data.data || [];
  }

  async getLabTestTypes() {
    const data = await this.request<{
      success: boolean;
      data: Array<{ test_type: string }>;
    }>('/api/lab-tests/types');
    return data.data || [];
  }

  async getLabTestSampleTypes() {
    const data = await this.request<{
      success: boolean;
      data: Array<{ sample_type: string }>;
    }>('/api/lab-tests/sample-types');
    return data.data || [];
  }

  // Laboratory Management endpoints
  async getLaboratoryDashboard() {
    const data = await this.request<{
      success: boolean;
      data: {
        pending_orders: number;
        samples_collected_today: number;
        results_pending_verification: number;
        critical_results: number;
        orders_today: number;
        completed_today: number;
      };
    }>('/api/laboratory/dashboard');
    return data.data;
  }

  async getLabOrders(filters?: {
    status?: string;
    order_type?: 'OPD' | 'IPD' | 'Emergency' | 'Walk-in';
    priority?: 'routine' | 'urgent' | 'stat';
    patient_id?: number;
    date_from?: string;
    date_to?: string;
    search?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.order_type) params.append('order_type', filters.order_type);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.patient_id) params.append('patient_id', filters.patient_id.toString());
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/laboratory/orders?${queryString}` : '/api/laboratory/orders';
    
    const data = await this.request<{
      success: boolean;
      data: any[];
    }>(endpoint);
    return data.data || [];
  }

  async getLabOrder(id: number) {
    const data = await this.request<{
      success: boolean;
      data: any;
    }>(`/api/laboratory/orders/${id}`);
    return data.data;
  }

  async createLabOrder(orderData: {
    patient_id: number;
    order_type: 'OPD' | 'IPD' | 'Emergency' | 'Walk-in';
    order_source_id?: number;
    priority?: 'routine' | 'urgent' | 'stat';
    tests: Array<{
      lab_test_id?: number;
      test_name: string;
      test_code?: string;
      price?: number;
      priority?: 'routine' | 'urgent' | 'stat';
      instructions?: string;
    }>;
    notes?: string;
  }) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>('/api/laboratory/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    return data.data;
  }

  async updateLabOrderStatus(id: number, status: string) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/laboratory/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return data.data;
  }

  async getLabSamples(filters?: {
    status?: string;
    order_id?: number;
    collection_date?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.order_id) params.append('order_id', filters.order_id.toString());
    if (filters?.collection_date) params.append('collection_date', filters.collection_date);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/laboratory/samples?${queryString}` : '/api/laboratory/samples';
    
    const data = await this.request<{
      success: boolean;
      data: any[];
    }>(endpoint);
    return data.data || [];
  }

  async getLabSampleByBarcode(barcode: string) {
    const data = await this.request<{
      success: boolean;
      data: any;
    }>(`/api/laboratory/samples/${barcode}`);
    return data.data;
  }

  async createLabSample(sampleData: {
    order_id: number;
    order_test_id: number;
    patient_id: number;
    test_id?: number;
    sample_type?: string;
    collection_date?: string;
    collection_time?: string;
    condition?: string;
    remarks?: string;
  }) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>('/api/laboratory/samples', {
      method: 'POST',
      body: JSON.stringify(sampleData),
    });
    return data.data;
  }

  async getLabResults(filters?: {
    status?: string;
    is_critical?: boolean;
    is_abnormal?: boolean;
  }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.is_critical !== undefined) params.append('is_critical', filters.is_critical.toString());
    if (filters?.is_abnormal !== undefined) params.append('is_abnormal', filters.is_abnormal.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/laboratory/results?${queryString}` : '/api/laboratory/results';
    
    const data = await this.request<{
      success: boolean;
      data: any[];
    }>(endpoint);
    return data.data || [];
  }

  async getLabResult(id: number) {
    const data = await this.request<{
      success: boolean;
      data: any;
    }>(`/api/laboratory/results/${id}`);
    return data.data;
  }

  async createLabResult(resultData: {
    order_id: number;
    order_test_id: number;
    sample_id?: number;
    test_id?: number;
    patient_id: number;
    result_data?: any;
    values?: Array<{
      parameter_name: string;
      result_value: string;
      unit?: string;
      normal_range?: string;
      is_abnormal?: boolean;
      is_critical?: boolean;
    }>;
    comments?: string;
  }) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>('/api/laboratory/results', {
      method: 'POST',
      body: JSON.stringify(resultData),
    });
    return data.data;
  }

  async verifyLabResult(id: number) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/laboratory/results/${id}/verify`, {
      method: 'PUT',
    });
    return data.data;
  }

  async approveLabResult(id: number) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/laboratory/results/${id}/approve`, {
      method: 'PUT',
    });
    return data.data;
  }

  async generateLabReport(orderId: number) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/laboratory/reports/${orderId}`);
    return data.data;
  }

  async getLabBilling(id: number) {
    const data = await this.request<{
      success: boolean;
      data: any;
    }>(`/api/laboratory/billing/${id}`);
    return data.data;
  }

  async createLabBilling(orderId: number, billingData: {
    discount?: number;
    tax?: number;
    opd_bill_id?: number;
    ipd_billing_id?: number;
  }) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/laboratory/orders/${orderId}/billing`, {
      method: 'POST',
      body: JSON.stringify(billingData),
    });
    return data.data;
  }

  async recordLabPayment(billingId: number, paymentData: {
    amount: number;
    payment_method?: string;
  }) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/laboratory/billing/${billingId}/payment`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
    return data.data;
  }

  // Emergency endpoints
  async getEmergencyVisits(filters?: {
    search?: string;
    status?: string;
    date?: string;
    date_from?: string;
    date_to?: string;
    triage_level?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.date) params.append('date', filters.date);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.triage_level) params.append('triage_level', filters.triage_level.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/emergency/visits?${queryString}` : '/api/emergency/visits';
    
    const data = await this.request<{
      success: boolean;
      data: EmergencyVisit[];
    }>(endpoint);
    return data.data || [];
  }

  async getEmergencyVisit(id: string) {
    const data = await this.request<{
      success: boolean;
      data: EmergencyVisit;
    }>(`/api/emergency/visits/${id}`);
    return data.data;
  }

  async createEmergencyVisit(visitData: CreateEmergencyVisitData) {
    const data = await this.request<{
      success: boolean;
      data: EmergencyVisit;
      message: string;
    }>('/api/emergency/visits', {
      method: 'POST',
      body: JSON.stringify(visitData),
    });
    return data.data;
  }

  async updateEmergencyVisit(id: string, visitData: Partial<CreateEmergencyVisitData>) {
    const data = await this.request<{
      success: boolean;
      data: EmergencyVisit;
      message: string;
    }>(`/api/emergency/visits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(visitData),
    });
    return data.data;
  }

  async updateEmergencyTriage(id: string, triageData: {
    triage_level: number;
    chief_complaint?: string;
    vitals_bp?: string;
    vitals_pulse?: number;
    vitals_temp?: number;
    vitals_spo2?: number;
    vitals_resp?: number;
  }) {
    const data = await this.request<{
      success: boolean;
      data: EmergencyVisit;
      message: string;
    }>(`/api/emergency/visits/${id}/triage`, {
      method: 'PUT',
      body: JSON.stringify(triageData),
    });
    return data.data;
  }

  async updateEmergencyDisposition(id: string, dispositionData: {
    disposition: 'discharge' | 'admit-ward' | 'admit-private' | 'transfer' | 'absconded' | 'death';
    disposition_details?: string;
    follow_up_required?: boolean;
    follow_up_date?: string;
    medications_prescribed?: string;
  }) {
    const data = await this.request<{
      success: boolean;
      data: EmergencyVisit;
      message: string;
    }>(`/api/emergency/visits/${id}/disposition`, {
      method: 'PUT',
      body: JSON.stringify(dispositionData),
    });
    return data.data;
  }

  async updateEmergencyStatus(id: string, status: 'registered' | 'triaged' | 'in-treatment' | 'awaiting-disposition' | 'completed') {
    const data = await this.request<{
      success: boolean;
      data: EmergencyVisit;
      message: string;
    }>(`/api/emergency/visits/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return data.data;
  }

  async getEmergencyStats(date?: string) {
    const params = date ? `?date=${date}` : '';
    const data = await this.request<{
      success: boolean;
      data: EmergencyStats;
    }>(`/api/emergency/stats${params}`);
    return data.data;
  }

  async getEmergencyBeds() {
    const data = await this.request<{
      success: boolean;
      data: EmergencyBed[];
    }>('/api/emergency/beds');
    return data.data || [];
  }

  // ============================================
  // WORKFLOW API METHODS
  // ============================================

  async getEmergencyVitals(visitId: number) {
    const data = await this.request<{
      success: boolean;
      data: EmergencyVitalSign[];
    }>(`/api/emergency/visits/${visitId}/vitals`);
    return data.data || [];
  }

  async recordEmergencyVitals(visitId: number, vitals: CreateEmergencyVitalSignData) {
    const data = await this.request<{
      success: boolean;
      data: EmergencyVitalSign[];
      message: string;
    }>(`/api/emergency/visits/${visitId}/vitals`, {
      method: 'POST',
      body: JSON.stringify(vitals),
    });
    return data.data;
  }

  async getEmergencyNotes(visitId: number, filters?: { note_type?: string; date_from?: string; date_to?: string }) {
    const params = new URLSearchParams();
    if (filters?.note_type) params.append('note_type', filters.note_type);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    const query = params.toString() ? `?${params.toString()}` : '';
    const data = await this.request<{
      success: boolean;
      data: EmergencyTreatmentNote[];
    }>(`/api/emergency/visits/${visitId}/notes${query}`);
    return data.data || [];
  }

  async addEmergencyNote(visitId: number, note: CreateEmergencyNoteData) {
    const data = await this.request<{
      success: boolean;
      data: EmergencyTreatmentNote[];
      message: string;
    }>(`/api/emergency/visits/${visitId}/notes`, {
      method: 'POST',
      body: JSON.stringify(note),
    });
    return data.data;
  }

  async getEmergencyInvestigations(visitId: number) {
    const data = await this.request<{
      success: boolean;
      data: EmergencyInvestigationOrder[];
    }>(`/api/emergency/visits/${visitId}/investigations`);
    return data.data || [];
  }

  async orderEmergencyInvestigation(visitId: number, order: CreateEmergencyInvestigationData) {
    const data = await this.request<{
      success: boolean;
      data: EmergencyInvestigationOrder[];
      message: string;
    }>(`/api/emergency/visits/${visitId}/investigations`, {
      method: 'POST',
      body: JSON.stringify(order),
    });
    return data.data;
  }

  async getEmergencyMedications(visitId: number) {
    const data = await this.request<{
      success: boolean;
      data: EmergencyMedication[];
    }>(`/api/emergency/visits/${visitId}/medications`);
    return data.data || [];
  }

  async administerEmergencyMedication(visitId: number, medication: CreateEmergencyMedicationData) {
    const data = await this.request<{
      success: boolean;
      data: EmergencyMedication[];
      message: string;
    }>(`/api/emergency/visits/${visitId}/medications`, {
      method: 'POST',
      body: JSON.stringify(medication),
    });
    return data.data;
  }

  async getEmergencyCharges(visitId: number) {
    const data = await this.request<{
      success: boolean;
      data: {
        charges: EmergencyCharge[];
        total: number;
      };
    }>(`/api/emergency/visits/${visitId}/charges`);
    return data.data || { charges: [], total: 0 };
  }

  async addEmergencyCharge(visitId: number, charge: CreateEmergencyChargeData) {
    const data = await this.request<{
      success: boolean;
      data: {
        charges: EmergencyCharge[];
        total: number;
      };
      message: string;
    }>(`/api/emergency/visits/${visitId}/charges`, {
      method: 'POST',
      body: JSON.stringify(charge),
    });
    return data.data;
  }

  async deleteEmergencyCharge(visitId: number, chargeId: number) {
    const data = await this.request<{
      success: boolean;
      data: {
        charges: EmergencyCharge[];
        total: number;
      };
      message: string;
    }>(`/api/emergency/visits/${visitId}/charges/${chargeId}`, {
      method: 'DELETE',
    });
    return data.data;
  }

  async getEmergencyStatusHistory(visitId: number) {
    const data = await this.request<{
      success: boolean;
      data: EmergencyStatusHistory[];
    }>(`/api/emergency/visits/${visitId}/history`);
    return data.data || [];
  }

  async getEmergencyVisit(visitId: number) {
    const data = await this.request<{
      success: boolean;
      data: EmergencyVisit;
    }>(`/api/emergency/visits/${visitId}`);
    return data.data;
  }

  async getEmergencyPatientFiles(visitId: number) {
    const data = await this.request<{
      success: boolean;
      data: EmergencyPatientFile[];
    }>(`/api/emergency/visits/${visitId}/files`);
    return data.data || [];
  }

  async uploadEmergencyPatientFile(visitId: number, fileData: CreateEmergencyPatientFileData) {
    const formData = new FormData();
    Object.keys(fileData).forEach(key => {
      if (fileData[key as keyof CreateEmergencyPatientFileData] !== undefined) {
        formData.append(key, fileData[key as keyof CreateEmergencyPatientFileData] as string | Blob);
      }
    });

    const data = await this.request<{
      success: boolean;
      data: { id: number };
      message: string;
    }>(`/api/emergency/visits/${visitId}/files`, {
      method: 'POST',
      body: formData,
    });
    return data.data;
  }

  async deleteEmergencyPatientFile(visitId: number, fileId: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/emergency/visits/${visitId}/files/${fileId}`, {
      method: 'DELETE',
    });
    return data;
  }

  async getEmergencyIntakeOutput(visitId: number, filters?: { date_from?: string; date_to?: string }) {
    const params = new URLSearchParams();
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    const query = params.toString() ? `?${params.toString()}` : '';

    const data = await this.request<{
      success: boolean;
      data: EmergencyIntakeOutput[];
    }>(`/api/emergency/visits/${visitId}/intake-output${query}`);
    return data.data || [];
  }

  async addEmergencyIntakeOutput(visitId: number, ioData: CreateEmergencyIntakeOutputData) {
    const data = await this.request<{
      success: boolean;
      data: { id: number };
      message: string;
    }>(`/api/emergency/visits/${visitId}/intake-output`, {
      method: 'POST',
      body: JSON.stringify(ioData),
    });
    return data.data;
  }

  async getEmergencyBloodBankRequests(visitId: number) {
    const data = await this.request<{
      success: boolean;
      data: EmergencyBloodBankRequest[];
    }>(`/api/emergency/visits/${visitId}/blood-bank`);
    return data.data || [];
  }

  async createEmergencyBloodBankRequest(visitId: number, requestData: CreateEmergencyBloodBankRequestData) {
    const data = await this.request<{
      success: boolean;
      data: { id: number };
      message: string;
    }>(`/api/emergency/visits/${visitId}/blood-bank`, {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
    return data.data;
  }

  async updateEmergencyBloodBankRequest(visitId: number, requestId: number, updateData: UpdateEmergencyBloodBankRequestData) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/emergency/visits/${visitId}/blood-bank/${requestId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    return data;
  }

  async getEmergencyHealthPhysical(visitId: number) {
    const data = await this.request<{
      success: boolean;
      data: EmergencyHealthPhysical[];
    }>(`/api/emergency/visits/${visitId}/health-physical`);
    return data.data || [];
  }

  async createEmergencyHealthPhysical(visitId: number, hpData: CreateEmergencyHealthPhysicalData) {
    const data = await this.request<{
      success: boolean;
      data: { id: number };
      message: string;
    }>(`/api/emergency/visits/${visitId}/health-physical`, {
      method: 'POST',
      body: JSON.stringify(hpData),
    });
    return data.data;
  }

  async getEmergencyTimeline(visitId: number) {
    const data = await this.request<{
      success: boolean;
      data: EmergencyStatusHistory[];
    }>(`/api/emergency/visits/${visitId}/timeline`);
    return data.data || [];
  }

  async createIPDAdmissionFromER(visitId: number, admissionData: CreateIPDAdmissionData) {
    const data = await this.request<{
      success: boolean;
      data: EmergencyVisit;
      message: string;
    }>(`/api/emergency/visits/${visitId}/admit-ipd`, {
      method: 'POST',
      body: JSON.stringify(admissionData),
    });
    return data.data;
  }

  // ============================================
  // EMERGENCY MODULE NEW API METHODS
  // ============================================

  // Admitted Patients
  async getAdmittedEmergencyPatients(filters?: {
    search?: string;
    status?: string;
    triage_level?: number;
    ward_id?: number;
    date_from?: string;
    date_to?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.triage_level) params.append('triage_level', filters.triage_level.toString());
    if (filters?.ward_id) params.append('ward_id', filters.ward_id.toString());
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const data = await this.request<{
      success: boolean;
      data: any[];
    }>(`/api/emergency/admitted-patients${query}`);
    return data.data || [];
  }

  // Emergency History
  async getEmergencyHistory(filters?: {
    search?: string;
    patient_id?: number;
    disposition?: string;
    date_from?: string;
    date_to?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.patient_id) params.append('patient_id', filters.patient_id.toString());
    if (filters?.disposition) params.append('disposition', filters.disposition);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const data = await this.request<{
      success: boolean;
      data: any[];
    }>(`/api/emergency/history${query}`);
    return data.data || [];
  }

  // Wards Management
  async getEmergencyWards(filters?: {
    search?: string;
    status?: string;
    type?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const data = await this.request<{
      success: boolean;
      data: any[];
    }>(`/api/emergency/wards${query}`);
    return data.data || [];
  }

  async getEmergencyWard(id: number) {
    const data = await this.request<{
      success: boolean;
      data: any;
    }>(`/api/emergency/wards/${id}`);
    return data.data;
  }

  async createEmergencyWard(wardData: any) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>('/api/emergency/wards', {
      method: 'POST',
      body: JSON.stringify(wardData),
    });
    return data.data;
  }

  async updateEmergencyWard(id: number, wardData: any) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/emergency/wards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(wardData),
    });
    return data.data;
  }

  async deleteEmergencyWard(id: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/emergency/wards/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  async getEmergencyWardStats(wardId: number) {
    const data = await this.request<{
      success: boolean;
      data: any;
    }>(`/api/emergency/wards/${wardId}/stats`);
    return data.data;
  }

  // Ward Beds Management
  async getEmergencyWardBeds(filters?: {
    ward_id?: number;
    status?: string;
    bed_type?: string;
    search?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.ward_id) params.append('ward_id', filters.ward_id.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.bed_type) params.append('bed_type', filters.bed_type);
    if (filters?.search) params.append('search', filters.search);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const data = await this.request<{
      success: boolean;
      data: any[];
    }>(`/api/emergency/ward-beds${query}`);
    return data.data || [];
  }

  async getEmergencyWardBed(id: number) {
    const data = await this.request<{
      success: boolean;
      data: any;
    }>(`/api/emergency/ward-beds/${id}`);
    return data.data;
  }

  async createEmergencyWardBed(bedData: any) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>('/api/emergency/ward-beds', {
      method: 'POST',
      body: JSON.stringify(bedData),
    });
    return data.data;
  }

  async updateEmergencyWardBed(id: number, bedData: any) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/emergency/ward-beds/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bedData),
    });
    return data.data;
  }

  async assignWardBed(bedId: number, visitId: number) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/emergency/ward-beds/${bedId}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ visit_id: visitId }),
    });
    return data.data;
  }

  async releaseWardBed(bedId: number) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/emergency/ward-beds/${bedId}/release`, {
      method: 'PUT',
    });
    return data.data;
  }

  async getAvailableWardBeds(wardId?: number) {
    const params = wardId ? `?ward_id=${wardId}` : '';
    const data = await this.request<{
      success: boolean;
      data: any[];
    }>(`/api/emergency/ward-beds/available${params}`);
    return data.data || [];
  }

  // Duty Roster
  async getEmergencyDutyRoster(filters?: {
    user_id?: number;
    date?: string;
    date_from?: string;
    date_to?: string;
    shift_type?: string;
    status?: string;
    search?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.user_id) params.append('user_id', filters.user_id.toString());
    if (filters?.date) params.append('date', filters.date);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.shift_type) params.append('shift_type', filters.shift_type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const data = await this.request<{
      success: boolean;
      data: any[];
    }>(`/api/emergency/duty-roster${query}`);
    return data.data || [];
  }

  async createEmergencyDutyRoster(rosterData: any) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>('/api/emergency/duty-roster', {
      method: 'POST',
      body: JSON.stringify(rosterData),
    });
    return data.data;
  }

  async updateEmergencyDutyRoster(id: number, rosterData: any) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/emergency/duty-roster/${id}`, {
      method: 'PUT',
      body: JSON.stringify(rosterData),
    });
    return data.data;
  }

  async deleteEmergencyDutyRoster(id: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/emergency/duty-roster/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  async getEmergencyDutyRosterByDate(date: string) {
    const data = await this.request<{
      success: boolean;
      data: any[];
    }>(`/api/emergency/duty-roster/date/${date}`);
    return data.data || [];
  }

  async getCurrentDutyStaff() {
    const data = await this.request<{
      success: boolean;
      data: any[];
    }>('/api/emergency/duty-roster/current');
    return data.data || [];
  }

  // Patient Transfers
  async createEmergencyTransfer(transferData: any) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>('/api/emergency/transfers', {
      method: 'POST',
      body: JSON.stringify(transferData),
    });
    return data.data;
  }

  async getEmergencyTransfers(filters?: {
    transfer_type?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.transfer_type) params.append('transfer_type', filters.transfer_type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.search) params.append('search', filters.search);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const data = await this.request<{
      success: boolean;
      data: any[];
    }>(`/api/emergency/transfers${query}`);
    return data.data || [];
  }

  async getEmergencyTransfersByVisit(visitId: number) {
    const data = await this.request<{
      success: boolean;
      data: any[];
    }>(`/api/emergency/transfers/visit/${visitId}`);
    return data.data || [];
  }

  // Ambulance Requests
  async createAmbulanceRequest(requestData: any) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>('/api/emergency/ambulance-requests', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
    return data.data;
  }

  async getAmbulanceRequests(filters?: {
    status?: string;
    service_type?: string;
    priority?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.service_type) params.append('service_type', filters.service_type);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.search) params.append('search', filters.search);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const data = await this.request<{
      success: boolean;
      data: any[];
    }>(`/api/emergency/ambulance-requests${query}`);
    return data.data || [];
  }

  async updateAmbulanceRequestStatus(id: number, status: string) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/emergency/ambulance-requests/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return data.data;
  }

  async getEmergencyAmbulanceAvailability() {
    const data = await this.request<{
      success: boolean;
      data: any[];
    }>('/api/emergency/ambulance-requests/available');
    return data.data || [];
  }

  // Ward Assignment
  async updateWardAssignment(visitId: number, wardId: number | null, bedId: number | null) {
    const data = await this.request<{
      success: boolean;
      data: EmergencyVisit;
      message: string;
    }>(`/api/emergency/visits/${visitId}/ward-assignment`, {
      method: 'PUT',
      body: JSON.stringify({ ward_id: wardId, bed_id: bedId }),
    });
    return data.data;
  }

  // ============================================
  // PHARMACY API METHODS
  // ============================================

  // Stock Management
  async getPharmacyStock(filters?: {
    medicine_id?: number;
    search?: string;
    category?: string;
    status?: string;
    expiring_soon?: number;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.medicine_id) params.append('medicine_id', filters.medicine_id.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.expiring_soon) params.append('expiring_soon', filters.expiring_soon.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/pharmacy/stock?${queryString}` : '/api/pharmacy/stock';
    
    const data = await this.request<{
      success: boolean;
      data: PharmacyStock[];
    }>(endpoint);
    return data.data || [];
  }

  async getStockByMedicine(medicineId: number, includeExpired = false) {
    const params = includeExpired ? '?include_expired=true' : '';
    const data = await this.request<{
      success: boolean;
      data: PharmacyStock[];
    }>(`/api/pharmacy/stock/medicine/${medicineId}${params}`);
    return data.data || [];
  }

  async createStock(stockData: CreatePharmacyStockData) {
    const data = await this.request<{
      success: boolean;
      data: PharmacyStock;
      message: string;
    }>('/api/pharmacy/stock', {
      method: 'POST',
      body: JSON.stringify(stockData),
    });
    return data.data;
  }

  async updateStock(id: number, stockData: Partial<CreatePharmacyStockData>) {
    const data = await this.request<{
      success: boolean;
      data: PharmacyStock;
      message: string;
    }>(`/api/pharmacy/stock/${id}`, {
      method: 'PUT',
      body: JSON.stringify(stockData),
    });
    return data.data;
  }

  async getLowStockAlerts() {
    const data = await this.request<{
      success: boolean;
      data: LowStockAlert[];
    }>('/api/pharmacy/stock/low-stock');
    return data.data || [];
  }

  async getExpiringStock(days = 90) {
    const data = await this.request<{
      success: boolean;
      data: ExpiringStock[];
    }>(`/api/pharmacy/stock/expiring?days=${days}`);
    return data.data || [];
  }

  async reserveStock(medicineId: number, quantity: number) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>('/api/pharmacy/stock/reserve', {
      method: 'POST',
      body: JSON.stringify({ medicine_id: medicineId, quantity }),
    });
    return data.data;
  }

  async releaseStock(medicineId: number, quantity: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>('/api/pharmacy/stock/release', {
      method: 'POST',
      body: JSON.stringify({ medicine_id: medicineId, quantity }),
    });
    return data;
  }

  async markExpiredStock() {
    const data = await this.request<{
      success: boolean;
      data: { updated: number };
      message: string;
    }>('/api/pharmacy/stock/mark-expired', {
      method: 'POST',
    });
    return data.data;
  }

  async getStockByBarcode(barcode: string) {
    const data = await this.request<{
      success: boolean;
      data: PharmacyStock;
    }>(`/api/pharmacy/stock/barcode/${barcode}`);
    return data.data;
  }

  async importStock(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    const response = await fetch(`${API_URL}/api/pharmacy/stock/import`, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Import failed');
    }
    return data.data;
  }

  async downloadStockImportTemplate() {
    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    const response = await fetch(`${API_URL}/api/pharmacy/stock/import-template`, {
      headers,
    });
    
    if (!response.ok) {
      throw new Error('Failed to download template');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stock_import_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  // Suppliers
  async getSuppliers(filters?: {
    search?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/pharmacy/suppliers?${queryString}` : '/api/pharmacy/suppliers';
    
    const data = await this.request<{
      success: boolean;
      data: Supplier[];
    }>(endpoint);
    return data.data || [];
  }

  async getSupplier(id: number) {
    const data = await this.request<{
      success: boolean;
      data: Supplier;
    }>(`/api/pharmacy/suppliers/${id}`);
    return data.data;
  }

  async createSupplier(supplierData: CreateSupplierData) {
    const data = await this.request<{
      success: boolean;
      data: Supplier;
      message: string;
    }>('/api/pharmacy/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplierData),
    });
    return data.data;
  }

  async updateSupplier(id: number, supplierData: Partial<CreateSupplierData>) {
    const data = await this.request<{
      success: boolean;
      data: Supplier;
      message: string;
    }>(`/api/pharmacy/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(supplierData),
    });
    return data.data;
  }

  async getSupplierPerformance(id: number, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/pharmacy/suppliers/${id}/performance?${queryString}` : `/api/pharmacy/suppliers/${id}/performance`;
    
    const data = await this.request<{
      success: boolean;
      data: SupplierPerformance;
    }>(endpoint);
    return data.data;
  }

  // Purchase Orders
  async getPurchaseOrders(filters?: {
    supplier_id?: number;
    status?: string;
    search?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.supplier_id) params.append('supplier_id', filters.supplier_id.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/pharmacy/purchase-orders?${queryString}` : '/api/pharmacy/purchase-orders';
    
    const data = await this.request<{
      success: boolean;
      data: PurchaseOrder[];
    }>(endpoint);
    return data.data || [];
  }

  async getPurchaseOrder(id: number) {
    const data = await this.request<{
      success: boolean;
      data: PurchaseOrder;
    }>(`/api/pharmacy/purchase-orders/${id}`);
    return data.data;
  }

  async createPurchaseOrder(poData: CreatePurchaseOrderData) {
    const data = await this.request<{
      success: boolean;
      data: PurchaseOrder;
      message: string;
    }>('/api/pharmacy/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(poData),
    });
    return data.data;
  }

  async updatePurchaseOrder(id: number, poData: Partial<CreatePurchaseOrderData>) {
    const data = await this.request<{
      success: boolean;
      data: PurchaseOrder;
      message: string;
    }>(`/api/pharmacy/purchase-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(poData),
    });
    return data.data;
  }

  async approvePurchaseOrder(id: number) {
    const data = await this.request<{
      success: boolean;
      data: PurchaseOrder;
      message: string;
    }>(`/api/pharmacy/purchase-orders/${id}/approve`, {
      method: 'POST',
    });
    return data.data;
  }

  async cancelPurchaseOrder(id: number, reason?: string) {
    const data = await this.request<{
      success: boolean;
      data: PurchaseOrder;
      message: string;
    }>(`/api/pharmacy/purchase-orders/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return data.data;
  }

  async receiveStockFromPO(id: number, receiptData: CreateStockReceiptData) {
    const data = await this.request<{
      success: boolean;
      data: StockReceipt;
      message: string;
    }>(`/api/pharmacy/purchase-orders/${id}/receive`, {
      method: 'POST',
      body: JSON.stringify(receiptData),
    });
    return data.data;
  }

  // Sales
  async getSales(filters?: {
    customer_id?: number;
    patient_id?: number;
    status?: string;
    payment_method?: string;
    search?: string;
    start_date?: string;
    end_date?: string;
    shift_id?: number;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.customer_id) params.append('customer_id', filters.customer_id.toString());
    if (filters?.patient_id) params.append('patient_id', filters.patient_id.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.payment_method) params.append('payment_method', filters.payment_method);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.shift_id) params.append('shift_id', filters.shift_id.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/pharmacy/sales?${queryString}` : '/api/pharmacy/sales';
    
    const data = await this.request<{
      success: boolean;
      data: Sale[];
    }>(endpoint);
    return data.data || [];
  }

  async getSale(id: number | string) {
    // URL encode the ID in case it's an invoice number with special characters
    const encodedId = encodeURIComponent(String(id));
    const data = await this.request<{
      success: boolean;
      data: Sale | Sale[]; // Can return single sale or array of matching sales
    }>(`/api/pharmacy/sales/${encodedId}`);
    return data.data;
  }

  async createSale(saleData: CreateSaleData) {
    const data = await this.request<{
      success: boolean;
      data: Sale;
      message: string;
    }>('/api/pharmacy/sales', {
      method: 'POST',
      body: JSON.stringify(saleData),
    });
    return data.data;
  }

  async getSaleInvoice(id: number) {
    const data = await this.request<{
      success: boolean;
      data: SaleInvoice;
    }>(`/api/pharmacy/sales/${id}/invoice`);
    return data.data;
  }

  async getSalesSummary(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/pharmacy/sales/summary?${queryString}` : '/api/pharmacy/sales/summary';
    
    const data = await this.request<{
      success: boolean;
      data: SalesSummary;
    }>(endpoint);
    return data.data;
  }

  async getTopSellingMedicines(limit = 10, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const data = await this.request<{
      success: boolean;
      data: TopSellingMedicine[];
    }>(`/api/pharmacy/sales/top-selling?${params.toString()}`);
    return data.data || [];
  }

  // Report methods
  async getDailySalesReport(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/pharmacy/reports/daily-sales?${queryString}` : '/api/pharmacy/reports/daily-sales';
    
    const data = await this.request<{
      success: boolean;
      data: DailySalesReport[];
    }>(endpoint);
    return data.data || [];
  }

  async getPaymentMethodReport(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/pharmacy/reports/payment-method?${queryString}` : '/api/pharmacy/reports/payment-method';
    
    const data = await this.request<{
      success: boolean;
      data: PaymentMethodBreakdown[];
    }>(endpoint);
    return data.data || [];
  }

  async getCashierPerformanceReport(startDate?: string, endDate?: string, cashierId?: number) {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (cashierId) params.append('cashier_id', cashierId.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/pharmacy/reports/cashier-performance?${queryString}` : '/api/pharmacy/reports/cashier-performance';
    
    const data = await this.request<{
      success: boolean;
      data: CashierPerformance[];
    }>(endpoint);
    return data.data || [];
  }

  async getShiftSummaryReport(startDate?: string, endDate?: string, shiftId?: number) {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (shiftId) params.append('shift_id', shiftId.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/pharmacy/reports/shift-summary?${queryString}` : '/api/pharmacy/reports/shift-summary';
    
    const data = await this.request<{
      success: boolean;
      data: ShiftSummary[];
    }>(endpoint);
    return data.data || [];
  }

  async voidSale(saleId: number, voidData: { void_reason: string; void_type?: string; restore_stock?: boolean; notes?: string }) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/pharmacy/sales/${saleId}/void`, {
      method: 'POST',
      body: JSON.stringify(voidData),
    });
    return data.data;
  }

  async getVoidedSales(filters?: { start_date?: string; end_date?: string; voided_by?: number; limit?: number; offset?: number }) {
    const params = new URLSearchParams();
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.voided_by) params.append('voided_by', filters.voided_by.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/pharmacy/sales/voided?${queryString}` : '/api/pharmacy/sales/voided';
    
    const data = await this.request<{
      success: boolean;
      data: any[];
    }>(endpoint);
    return data.data || [];
  }

  // Expenses
  async getExpenses(filters?: {
    category_id?: number;
    status?: string;
    payment_method?: string;
    search?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.category_id) params.append('category_id', filters.category_id.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.payment_method) params.append('payment_method', filters.payment_method);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/pharmacy/expenses?${queryString}` : '/api/pharmacy/expenses';
    
    const data = await this.request<{
      success: boolean;
      data: any[];
    }>(endpoint);
    return data.data || [];
  }

  async getExpense(id: number) {
    const data = await this.request<{
      success: boolean;
      data: any;
    }>(`/api/pharmacy/expenses/${id}`);
    return data.data;
  }

  async createExpense(expenseData: {
    category_id: number;
    expense_date: string;
    description: string;
    amount: number;
    payment_method?: string;
    reference_number?: string;
    receipt_file?: string;
    status?: string;
    notes?: string;
  }) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>('/api/pharmacy/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
    return data.data;
  }

  async updateExpense(id: number, expenseData: Partial<{
    category_id: number;
    expense_date: string;
    description: string;
    amount: number;
    payment_method: string;
    reference_number: string;
    receipt_file: string;
    status: string;
    notes: string;
  }>) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/pharmacy/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expenseData),
    });
    return data.data;
  }

  async deleteExpense(id: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/pharmacy/expenses/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  async getExpenseSummary(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/pharmacy/expenses/summary?${queryString}` : '/api/pharmacy/expenses/summary';
    
    const data = await this.request<{
      success: boolean;
      data: any;
    }>(endpoint);
    return data.data;
  }

  // Expense Categories
  async getExpenseCategories(filters?: {
    status?: string;
    search?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/pharmacy/expense-categories?${queryString}` : '/api/pharmacy/expense-categories';
    
    const data = await this.request<{
      success: boolean;
      data: any[];
    }>(endpoint);
    return data.data || [];
  }

  async getExpenseCategory(id: number) {
    const data = await this.request<{
      success: boolean;
      data: any;
    }>(`/api/pharmacy/expense-categories/${id}`);
    return data.data;
  }

  async createExpenseCategory(categoryData: {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    status?: string;
  }) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>('/api/pharmacy/expense-categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
    return data.data;
  }

  async updateExpenseCategory(id: number, categoryData: Partial<{
    name: string;
    description: string;
    color: string;
    icon: string;
    status: string;
  }>) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/pharmacy/expense-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
    return data.data;
  }

  async deleteExpenseCategory(id: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/pharmacy/expense-categories/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  // Cash Drawer methods
  async getCashDrawers(filters?: { status?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/pharmacy/cash-drawers?${queryString}` : '/api/pharmacy/cash-drawers';
    
    const data = await this.request<{
      success: boolean;
      data: any[];
    }>(endpoint);
    return data.data || [];
  }

  async getCashDrawer(id: number) {
    const data = await this.request<{
      success: boolean;
      data: any;
    }>(`/api/pharmacy/cash-drawers/${id}`);
    return data.data;
  }

  async openCashDrawer(drawerData: { drawer_number: string; location?: string; opening_balance?: number }) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>('/api/pharmacy/cash-drawers', {
      method: 'POST',
      body: JSON.stringify(drawerData),
    });
    return data.data;
  }

  async closeCashDrawer(drawerId: number, closeData: { actual_cash: number; notes?: string }) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/pharmacy/cash-drawers/${drawerId}/close`, {
      method: 'POST',
      body: JSON.stringify(closeData),
    });
    return data.data;
  }

  async getOpenCashDrawer(drawerNumber?: string) {
    const params = new URLSearchParams();
    if (drawerNumber) params.append('drawer_number', drawerNumber);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/pharmacy/cash-drawers/open?${queryString}` : '/api/pharmacy/cash-drawers/open';
    
    const data = await this.request<{
      success: boolean;
      data: any;
    }>(endpoint);
    return data.data;
  }

  async recordCashDrop(drawerId: number, dropData: { drop_type: 'Drop' | 'Pickup'; amount: number; reason?: string; notes?: string }) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/pharmacy/cash-drawers/${drawerId}/drop`, {
      method: 'POST',
      body: JSON.stringify(dropData),
    });
    return data.data;
  }

  // Shift methods
  async getShifts(filters?: { cashier_id?: number; drawer_id?: number; status?: string; start_date?: string; end_date?: string; limit?: number; offset?: number }) {
    const params = new URLSearchParams();
    if (filters?.cashier_id) params.append('cashier_id', filters.cashier_id.toString());
    if (filters?.drawer_id) params.append('drawer_id', filters.drawer_id.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/pharmacy/shifts?${queryString}` : '/api/pharmacy/shifts';
    
    const data = await this.request<{
      success: boolean;
      data: any[];
    }>(endpoint);
    return data.data || [];
  }

  async getShift(id: number) {
    const data = await this.request<{
      success: boolean;
      data: any;
    }>(`/api/pharmacy/shifts/${id}`);
    return data.data;
  }

  async openShift(shiftData: { drawer_id?: number; opening_cash?: number }) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>('/api/pharmacy/shifts', {
      method: 'POST',
      body: JSON.stringify(shiftData),
    });
    return data.data;
  }

  async closeShift(shiftId: number, closeData: { actual_cash?: number; handover_notes?: string }) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/pharmacy/shifts/${shiftId}/close`, {
      method: 'POST',
      body: JSON.stringify(closeData),
    });
    return data.data;
  }

  async getCurrentShift(drawerId?: number) {
    const params = new URLSearchParams();
    if (drawerId) params.append('drawer_id', drawerId.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/pharmacy/shifts/current?${queryString}` : '/api/pharmacy/shifts/current';
    
    const data = await this.request<{
      success: boolean;
      data: any;
    }>(endpoint);
    return data.data;
  }

  // Price Override methods
  async getPriceOverrides(filters?: { status?: string; sale_id?: number; limit?: number; offset?: number }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.sale_id) params.append('sale_id', filters.sale_id.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/pharmacy/price-overrides?${queryString}` : '/api/pharmacy/price-overrides';
    
    const data = await this.request<{
      success: boolean;
      data: any[];
    }>(endpoint);
    return data.data || [];
  }

  async createPriceOverride(overrideData: { medicine_id: number; original_price: number; override_price: number; override_reason: string; sale_id?: number; sale_item_id?: number; notes?: string }) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>('/api/pharmacy/price-overrides', {
      method: 'POST',
      body: JSON.stringify(overrideData),
    });
    return data.data;
  }

  async approvePriceOverride(overrideId: number) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/pharmacy/price-overrides/${overrideId}/approve`, {
      method: 'POST',
    });
    return data.data;
  }

  async rejectPriceOverride(overrideId: number) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/pharmacy/price-overrides/${overrideId}/reject`, {
      method: 'POST',
    });
    return data.data;
  }

  async getPendingPriceOverrides() {
    const data = await this.request<{
      success: boolean;
      data: any[];
    }>('/api/pharmacy/price-overrides/pending');
    return data.data || [];
  }

  // Refunds
  async getRefunds(filters?: {
    sale_id?: number;
    status?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.sale_id) params.append('sale_id', filters.sale_id.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/pharmacy/refunds?${queryString}` : '/api/pharmacy/refunds';
    
    const data = await this.request<{
      success: boolean;
      data: Refund[];
    }>(endpoint);
    return data.data || [];
  }

  async getRefund(id: number) {
    const data = await this.request<{
      success: boolean;
      data: Refund;
    }>(`/api/pharmacy/refunds/${id}`);
    return data.data;
  }

  async createRefund(refundData: CreateRefundData) {
    const data = await this.request<{
      success: boolean;
      data: Refund;
      message: string;
    }>('/api/pharmacy/refunds', {
      method: 'POST',
      body: JSON.stringify(refundData),
    });
    return data.data;
  }

  async completeRefund(id: number) {
    const data = await this.request<{
      success: boolean;
      data: Refund;
      message: string;
    }>(`/api/pharmacy/refunds/${id}/complete`, {
      method: 'POST',
    });
    return data.data;
  }

  async getRefundsBySale(saleId: number) {
    const data = await this.request<{
      success: boolean;
      data: Refund[];
    }>(`/api/pharmacy/refunds/sale/${saleId}`);
    return data.data || [];
  }

  // Reorder Management
  async getReorderLevels(filters?: {
    auto_reorder?: boolean;
  }) {
    const params = new URLSearchParams();
    if (filters?.auto_reorder !== undefined) params.append('auto_reorder', filters.auto_reorder.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/pharmacy/reorder?${queryString}` : '/api/pharmacy/reorder';
    
    const data = await this.request<{
      success: boolean;
      data: ReorderLevel[];
    }>(endpoint);
    return data.data || [];
  }

  async getLowStockAlertsReorder(autoReorderOnly = false) {
    const params = autoReorderOnly ? '?auto_reorder_only=true' : '';
    const data = await this.request<{
      success: boolean;
      data: LowStockAlert[];
    }>(`/api/pharmacy/reorder/alerts${params}`);
    return data.data || [];
  }

  async getReorderLevelByMedicine(medicineId: number) {
    const data = await this.request<{
      success: boolean;
      data: ReorderLevel | null;
    }>(`/api/pharmacy/reorder/medicine/${medicineId}`);
    return data.data;
  }

  async setReorderLevel(medicineId: number, reorderData: CreateReorderLevelData) {
    const data = await this.request<{
      success: boolean;
      data: ReorderLevel;
      message: string;
    }>(`/api/pharmacy/reorder/medicine/${medicineId}`, {
      method: 'POST',
      body: JSON.stringify(reorderData),
    });
    return data.data;
  }

  async generateAutoReorderPOs() {
    const data = await this.request<{
      success: boolean;
      data: {
        pos_generated: Array<{
          po_id: number;
          supplier_id: number;
          items_count: number;
          total_amount: number;
        }>;
        count: number;
      };
      message: string;
    }>('/api/pharmacy/reorder/generate-pos', {
      method: 'POST',
    });
    return data.data;
  }

  // Medicine search with stock
  async searchMedicinesWithStock(searchTerm: string, includeOutOfStock = false) {
    const params = new URLSearchParams();
    params.append('search', searchTerm);
    if (includeOutOfStock) params.append('include_out_of_stock', 'true');
    
    const data = await this.request<{
      success: boolean;
      data: MedicineWithStock[];
    }>(`/api/medicines/search-with-stock?${params.toString()}`);
    return data.data || [];
  }

  async getMedicine(id: string | number) {
    const data = await this.request<{
      success: boolean;
      data: Medicine;
    }>(`/api/medicines/${id}`);
    return data.data;
  }

  // ============================================
  // STOCK ADJUSTMENTS API METHODS
  // ============================================

  async getStockAdjustments(filters?: {
    medicine_id?: number;
    adjustment_type?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.medicine_id) params.append('medicine_id', filters.medicine_id.toString());
    if (filters?.adjustment_type) params.append('adjustment_type', filters.adjustment_type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/pharmacy/stock-adjustments?${queryString}` : '/api/pharmacy/stock-adjustments';
    
    const data = await this.request<{
      success: boolean;
      data: StockAdjustment[];
    }>(endpoint);
    return data.data || [];
  }

  async getStockAdjustment(id: number) {
    const data = await this.request<{
      success: boolean;
      data: StockAdjustment;
    }>(`/api/pharmacy/stock-adjustments/${id}`);
    return data.data;
  }

  async createStockAdjustment(adjustmentData: CreateStockAdjustmentData) {
    const data = await this.request<{
      success: boolean;
      data: StockAdjustment;
      message: string;
    }>('/api/pharmacy/stock-adjustments', {
      method: 'POST',
      body: JSON.stringify(adjustmentData),
    });
    return data.data;
  }

  async approveStockAdjustment(id: number) {
    const data = await this.request<{
      success: boolean;
      data: StockAdjustment;
      message: string;
    }>(`/api/pharmacy/stock-adjustments/${id}/approve`, {
      method: 'POST',
    });
    return data.data;
  }

  async rejectStockAdjustment(id: number) {
    const data = await this.request<{
      success: boolean;
      data: StockAdjustment;
      message: string;
    }>(`/api/pharmacy/stock-adjustments/${id}/reject`, {
      method: 'POST',
    });
    return data.data;
  }

  async getPendingAdjustmentsCount() {
    const data = await this.request<{
      success: boolean;
      data: { count: number };
    }>('/api/pharmacy/stock-adjustments/pending');
    return data.data.count;
  }

  // ============================================
  // STOCK MOVEMENTS API METHODS
  // ============================================

  async getStockMovements(filters?: {
    medicine_id?: number;
    movement_type?: string;
    reference_type?: string;
    reference_id?: number;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.medicine_id) params.append('medicine_id', filters.medicine_id.toString());
    if (filters?.movement_type) params.append('movement_type', filters.movement_type);
    if (filters?.reference_type) params.append('reference_type', filters.reference_type);
    if (filters?.reference_id) params.append('reference_id', filters.reference_id.toString());
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/pharmacy/stock-movements?${queryString}` : '/api/pharmacy/stock-movements';
    
    const data = await this.request<{
      success: boolean;
      data: StockMovement[];
    }>(endpoint);
    return data.data || [];
  }

  async getStockMovementsSummary(medicineId?: number, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (medicineId) params.append('medicine_id', medicineId.toString());
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/pharmacy/stock-movements/summary?${queryString}` : '/api/pharmacy/stock-movements/summary';
    
    const data = await this.request<{
      success: boolean;
      data: StockMovementSummary[];
    }>(endpoint);
    return data.data || [];
  }

  async getStockMovementsByMedicine(medicineId: number, limit = 100) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/pharmacy/stock-movements/medicine/${medicineId}?${queryString}` : `/api/pharmacy/stock-movements/medicine/${medicineId}`;
    
    const data = await this.request<{
      success: boolean;
      data: StockMovement[];
    }>(endpoint);
    return data.data || [];
  }

  // ============================================
  // BARCODES API METHODS
  // ============================================

  async getBarcodes(filters?: {
    medicine_id?: number;
    barcode?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.medicine_id) params.append('medicine_id', filters.medicine_id.toString());
    if (filters?.barcode) params.append('barcode', filters.barcode);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/pharmacy/barcodes?${queryString}` : '/api/pharmacy/barcodes';
    
    const data = await this.request<{
      success: boolean;
      data: Barcode[];
    }>(endpoint);
    return data.data || [];
  }

  async getBarcode(id: number) {
    const data = await this.request<{
      success: boolean;
      data: Barcode;
    }>(`/api/pharmacy/barcodes/${id}`);
    return data.data;
  }

  async createBarcode(barcodeData: CreateBarcodeData) {
    const data = await this.request<{
      success: boolean;
      data: Barcode;
      message: string;
    }>('/api/pharmacy/barcodes', {
      method: 'POST',
      body: JSON.stringify(barcodeData),
    });
    return data.data;
  }

  async updateBarcode(id: number, barcodeData: Partial<CreateBarcodeData>) {
    const data = await this.request<{
      success: boolean;
      data: Barcode;
      message: string;
    }>(`/api/pharmacy/barcodes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(barcodeData),
    });
    return data.data;
  }

  async deleteBarcode(id: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/pharmacy/barcodes/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  async generateBarcode(medicineId: number, isPrimary = false) {
    const data = await this.request<{
      success: boolean;
      data: Barcode;
      message: string;
    }>('/api/pharmacy/barcodes/generate', {
      method: 'POST',
      body: JSON.stringify({ medicine_id: medicineId, is_primary: isPrimary }),
    });
    return data.data;
  }

  // POS Settings
  async getPOSSettings(category?: string) {
    const endpoint = category 
      ? `/api/pharmacy/pos-settings/category/${category}`
      : '/api/pharmacy/pos-settings';
    
    const data = await this.request<{
      success: boolean;
      data: any;
    }>(endpoint);
    return data.data || {};
  }

  async updatePOSSettings(settings: Record<string, any>) {
    const data = await this.request<{
      success: boolean;
      data: {
        message: string;
        updated_count: number;
      };
      message: string;
    }>('/api/pharmacy/pos-settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
    return data.data;
  }

  async updatePOSSetting(key: string, value: any) {
    const data = await this.request<{
      success: boolean;
      data: {
        message: string;
        setting: any;
      };
      message: string;
    }>(`/api/pharmacy/pos-settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
    return data.data;
  }

  async resetPOSSettings() {
    const data = await this.request<{
      success: boolean;
      data: {
        message: string;
        updated_count: number;
      };
      message: string;
    }>('/api/pharmacy/pos-settings/reset', {
      method: 'POST',
    });
    return data.data;
  }

  // GST Rates
  async getGSTRates(filters?: { active_only?: boolean; search?: string }) {
    const params = new URLSearchParams();
    if (filters?.active_only) params.append('active_only', '1');
    if (filters?.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/pharmacy/gst-rates?${queryString}` : '/api/pharmacy/gst-rates';
    
    const data = await this.request<{
      success: boolean;
      data: GSTRate[];
    }>(endpoint);
    return data.data || [];
  }

  async getActiveGSTRates() {
    const data = await this.request<{
      success: boolean;
      data: GSTRate[];
    }>('/api/pharmacy/gst-rates/active');
    return data.data || [];
  }

  async getDefaultGSTRate() {
    const data = await this.request<{
      success: boolean;
      data: GSTRate;
    }>('/api/pharmacy/gst-rates/default');
    return data.data;
  }

  async getGSTRate(id: number) {
    const data = await this.request<{
      success: boolean;
      data: GSTRate;
    }>(`/api/pharmacy/gst-rates/${id}`);
    return data.data;
  }

  async createGSTRate(gstRateData: CreateGSTRateData) {
    const data = await this.request<{
      success: boolean;
      data: GSTRate;
      message: string;
    }>('/api/pharmacy/gst-rates', {
      method: 'POST',
      body: JSON.stringify(gstRateData),
    });
    return data.data;
  }

  async updateGSTRate(id: number, gstRateData: Partial<CreateGSTRateData>) {
    const data = await this.request<{
      success: boolean;
      data: GSTRate;
      message: string;
    }>(`/api/pharmacy/gst-rates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(gstRateData),
    });
    return data.data;
  }

  async deleteGSTRate(id: number) {
    const data = await this.request<{
      success: boolean;
      data: { id: number };
      message: string;
    }>(`/api/pharmacy/gst-rates/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  async setDefaultGSTRate(id: number) {
    const data = await this.request<{
      success: boolean;
      data: GSTRate;
      message: string;
    }>(`/api/pharmacy/gst-rates/${id}/set-default`, {
      method: 'PUT',
    });
    return data.data;
  }

  // ============================================
  // USER MANAGEMENT API METHODS
  // ============================================

  async getUsers(filters?: { search?: string; status?: string; role?: string }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.role) params.append('role', filters.role);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/users?${queryString}` : '/api/users';
    
    const data = await this.request<{
      success: boolean;
      data: User[];
    }>(endpoint);
    return data.data || [];
  }

  async getUser(id: string | number) {
    const data = await this.request<{
      success: boolean;
      data: User;
    }>(`/api/users/${id}`);
    return data.data;
  }

  async createUser(userData: UserFormData) {
    const data = await this.request<{
      success: boolean;
      data: User;
      message: string;
    }>('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return data.data;
  }

  async updateUser(id: string | number, userData: Partial<UserFormData>) {
    const data = await this.request<{
      success: boolean;
      data: User;
      message: string;
    }>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    return data.data;
  }

  async deleteUser(id: string | number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/users/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  async getUserPermissions(id: string | number) {
    const data = await this.request<{
      success: boolean;
      data: string[];
    }>(`/api/users/${id}/permissions`);
    return data.data || [];
  }

  async updateUserPermissions(id: string | number, permissions: Record<string, boolean>) {
    const data = await this.request<{
      success: boolean;
      data: string[];
      message: string;
    }>(`/api/users/${id}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ permissions }),
    });
    return data.data;
  }

  async getUserSettings(id: string | number) {
    const data = await this.request<{
      success: boolean;
      data: UserSettings;
    }>(`/api/users/${id}/settings`);
    return data.data;
  }

  async updateUserSettings(id: string | number, settings: Partial<UserSettings>) {
    const data = await this.request<{
      success: boolean;
      data: UserSettings;
      message: string;
    }>(`/api/users/${id}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
    return data.data;
  }

  async getAvailableRoles() {
    const data = await this.request<{
      success: boolean;
      data: AvailableRole;
    }>('/api/users/roles');
    return data.data || {};
  }

  async getPermissionDefinitions(category?: string) {
    const params = category ? `?category=${category}` : '';
    const data = await this.request<{
      success: boolean;
      data: RolePermission[];
    }>(`/api/users/permissions/definitions${params}`);
    return data.data || [];
  }

  async getRolePermissionMappings() {
    const data = await this.request<{
      success: boolean;
      data: Record<string, string[]>;
    }>('/api/users/permissions/role-mappings');
    return data.data || {};
  }

  async getRolePermissions(role: string) {
    const data = await this.request<{
      success: boolean;
      data: string[];
    }>(`/api/users/roles/${encodeURIComponent(role)}/permissions`);
    return data.data || [];
  }

  async updateRolePermissions(role: string, permissions: string[]) {
    const data = await this.request<{
      success: boolean;
      data: string[];
      message?: string;
    }>(`/api/users/roles/${encodeURIComponent(role)}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ permissions })
    });
    return data.data || [];
  }

  // ============================================
  // SETUP MODULE API METHODS - FLOORS
  // ============================================

  async getFloors(filters?: { search?: string; status?: string; building_name?: string }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.building_name) params.append('building_name', filters.building_name);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/floors?${queryString}` : '/api/floors';
    
    const data = await this.request<{
      success: boolean;
      data: Floor[];
    }>(endpoint);
    return data.data || [];
  }

  async getFloor(id: number) {
    const data = await this.request<{
      success: boolean;
      data: Floor;
    }>(`/api/floors/${id}`);
    return data.data;
  }

  async createFloor(floorData: CreateFloorData) {
    const data = await this.request<{
      success: boolean;
      data: Floor;
      message: string;
    }>('/api/floors', {
      method: 'POST',
      body: JSON.stringify(floorData),
    });
    return data.data;
  }

  async updateFloor(id: number, floorData: Partial<CreateFloorData>) {
    const data = await this.request<{
      success: boolean;
      data: Floor;
      message: string;
    }>(`/api/floors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(floorData),
    });
    return data.data;
  }

  async deleteFloor(id: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/floors/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  async getBuildings() {
    const data = await this.request<{
      success: boolean;
      data: string[];
    }>('/api/floors/buildings');
    return data.data || [];
  }

  // ============================================
  // SETUP MODULE API METHODS - ROOMS
  // ============================================

  async getRooms(filters?: { search?: string; status?: string; floor_id?: number; department_id?: number; room_type?: string }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.floor_id) params.append('floor_id', filters.floor_id.toString());
    if (filters?.department_id) params.append('department_id', filters.department_id.toString());
    if (filters?.room_type) params.append('room_type', filters.room_type);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/rooms?${queryString}` : '/api/rooms';
    
    const data = await this.request<{
      success: boolean;
      data: Room[];
    }>(endpoint);
    return data.data || [];
  }

  async getRoom(id: number) {
    const data = await this.request<{
      success: boolean;
      data: Room;
    }>(`/api/rooms/${id}`);
    return data.data;
  }

  async createRoom(roomData: CreateRoomData) {
    const data = await this.request<{
      success: boolean;
      data: Room;
      message: string;
    }>('/api/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData),
    });
    return data.data;
  }

  async updateRoom(id: number, roomData: Partial<CreateRoomData>) {
    const data = await this.request<{
      success: boolean;
      data: Room;
      message: string;
    }>(`/api/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roomData),
    });
    return data.data;
  }

  async deleteRoom(id: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/rooms/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  async getRoomTypes() {
    const data = await this.request<{
      success: boolean;
      data: string[];
    }>('/api/rooms/types');
    return data.data || [];
  }

  // ============================================
  // SETUP MODULE API METHODS - RECEPTIONS
  // ============================================

  async getReceptions(filters?: { search?: string; status?: string; floor_id?: number; department_id?: number }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.floor_id) params.append('floor_id', filters.floor_id.toString());
    if (filters?.department_id) params.append('department_id', filters.department_id.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/receptions?${queryString}` : '/api/receptions';
    
    const data = await this.request<{
      success: boolean;
      data: Reception[];
    }>(endpoint);
    return data.data || [];
  }

  async getReception(id: number) {
    const data = await this.request<{
      success: boolean;
      data: Reception;
    }>(`/api/receptions/${id}`);
    return data.data;
  }

  async createReception(receptionData: CreateReceptionData) {
    const data = await this.request<{
      success: boolean;
      data: Reception;
      message: string;
    }>('/api/receptions', {
      method: 'POST',
      body: JSON.stringify(receptionData),
    });
    return data.data;
  }

  // ============================================
  // SYSTEM SETTINGS API
  // ============================================

  async getSystemSettings(category?: string) {
    const url = category ? `/api/system-settings/category/${category}` : '/api/system-settings';
    return this.request<{ [category: string]: { [key: string]: SystemSetting } }>(url);
  }

  async getSystemSetting(key: string) {
    return this.request<SystemSetting>(`/api/system-settings/${key}`);
  }

  async updateSystemSetting(key: string, value: any) {
    return this.request<SystemSetting>(`/api/system-settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
  }

  async getRoomMode() {
    return this.request<RoomMode>('/api/system-settings/room-mode');
  }


  // ============================================
  // DOCTOR ROOMS API (Fixed Mode)
  // ============================================

  async getDoctorRooms(filters?: { doctor_id?: number; room_id?: number; reception_id?: number; is_active?: boolean }) {
    const params = new URLSearchParams();
    if (filters?.doctor_id) params.append('doctor_id', filters.doctor_id.toString());
    if (filters?.room_id) params.append('room_id', filters.room_id.toString());
    if (filters?.reception_id) params.append('reception_id', filters.reception_id.toString());
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active ? '1' : '0');
    const query = params.toString();
    return this.request<DoctorRoom[]>(`/api/doctor-rooms${query ? '?' + query : ''}`);
  }

  async getDoctorRoom(doctorId: number) {
    return this.request<DoctorRoom>(`/api/doctor-rooms/doctor/${doctorId}`);
  }

  async createDoctorRoom(data: CreateDoctorRoomData) {
    return this.request<DoctorRoom>('/api/doctor-rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDoctorRoom(id: number, data: Partial<CreateDoctorRoomData>) {
    return this.request<DoctorRoom>(`/api/doctor-rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDoctorRoom(id: number) {
    return this.request<void>(`/api/doctor-rooms/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // DOCTOR SLOT ROOMS API (Dynamic Mode)
  // ============================================

  async getDoctorSlotRooms(filters?: {
    doctor_id?: number;
    schedule_id?: number;
    room_id?: number;
    reception_id?: number;
    assignment_date?: string;
    date_from?: string;
    date_to?: string;
    is_active?: boolean;
  }) {
    const params = new URLSearchParams();
    if (filters?.doctor_id) params.append('doctor_id', filters.doctor_id.toString());
    if (filters?.schedule_id) params.append('schedule_id', filters.schedule_id.toString());
    if (filters?.room_id) params.append('room_id', filters.room_id.toString());
    if (filters?.reception_id) params.append('reception_id', filters.reception_id.toString());
    if (filters?.assignment_date) params.append('assignment_date', filters.assignment_date);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active ? '1' : '0');
    const query = params.toString();
    return this.request<DoctorSlotRoom[]>(`/api/doctor-slot-rooms${query ? '?' + query : ''}`);
  }

  async getDoctorSlotRoomsByDate(doctorId: number, date: string) {
    return this.request<DoctorSlotRoom[]>(`/api/doctor-slot-rooms/doctor/${doctorId}/date/${date}`);
  }

  async createDoctorSlotRoom(data: CreateDoctorSlotRoomData) {
    return this.request<DoctorSlotRoom>('/api/doctor-slot-rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async bulkCreateDoctorSlotRooms(data: BulkCreateDoctorSlotRoomData) {
    return this.request<{ inserted: number }>('/api/doctor-slot-rooms/bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDoctorSlotRoom(id: number, data: Partial<CreateDoctorSlotRoomData>) {
    return this.request<DoctorSlotRoom>(`/api/doctor-slot-rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDoctorSlotRoom(id: number) {
    return this.request<void>(`/api/doctor-slot-rooms/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // TOKENS API
  // ============================================

  async getTokensByReception(receptionId: number, date?: string, status?: string) {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (status) params.append('status', status);
    const query = params.toString();
    return this.request<Token[]>(`/api/tokens/reception/${receptionId}${query ? '?' + query : ''}`);
  }

  async getTokensByFloor(floorId: number, date?: string, status?: string) {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (status) params.append('status', status);
    const query = params.toString();
    return this.request<Token[]>(`/api/tokens/floor/${floorId}${query ? '?' + query : ''}`);
  }

  async getTokensByDoctor(doctorId: number, date?: string, status?: string) {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (status) params.append('status', status);
    const query = params.toString();
    return this.request<Token[]>(`/api/tokens/doctor/${doctorId}${query ? '?' + query : ''}`);
  }

  async getTokenQueue(receptionId: number, date?: string) {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    const query = params.toString();
    return this.request<Token[]>(`/api/tokens/queue/${receptionId}${query ? '?' + query : ''}`);
  }

  async updateTokenStatus(tokenId: number, status: 'Waiting' | 'In Progress' | 'Completed' | 'Cancelled' | 'No Show') {
    return this.request<Token>(`/api/tokens/${tokenId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getToken(id: number) {
    return this.request<Token>(`/api/tokens/${id}`);
  }

  async updateReception(id: number, receptionData: Partial<CreateReceptionData>) {
    const data = await this.request<{
      success: boolean;
      data: Reception;
      message: string;
    }>(`/api/receptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(receptionData),
    });
    return data.data;
  }

  async deleteReception(id: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/receptions/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  // ============================================
  // SYSTEM SETTINGS API
  // ============================================

  async getSystemSettings(category?: string) {
    const url = category ? `/api/system-settings/category/${category}` : '/api/system-settings';
    const data = await this.request<{
      success: boolean;
      data: { [category: string]: { [key: string]: SystemSetting } } | { [key: string]: any };
    }>(url);
    return data.data || {};
  }

  async getSystemSetting(key: string) {
    const data = await this.request<{
      success: boolean;
      data: SystemSetting;
    }>(`/api/system-settings/${key}`);
    return data.data;
  }

  async updateSystemSetting(key: string, value: any) {
    const data = await this.request<{
      success: boolean;
      data: SystemSetting;
      message: string;
    }>(`/api/system-settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
    return data.data;
  }

  async getRoomMode() {
    const data = await this.request<{
      success: boolean;
      data: RoomMode;
    }>('/api/system-settings/room-mode');
    return data.data;
  }

  async updateRoomMode(mode: 'Fixed' | 'Dynamic') {
    const data = await this.request<{
      success: boolean;
      data: RoomMode & { warnings?: string[]; warning_message?: string };
      message: string;
    }>('/api/system-settings/room-mode', {
      method: 'PUT',
      body: JSON.stringify({ mode }),
    });
    return data.data;
  }

  // ============================================
  // DOCTOR ROOMS API (Fixed Mode)
  // ============================================

  async getDoctorRooms(filters?: { doctor_id?: number; room_id?: number; reception_id?: number; is_active?: boolean }) {
    const params = new URLSearchParams();
    if (filters?.doctor_id) params.append('doctor_id', filters.doctor_id.toString());
    if (filters?.room_id) params.append('room_id', filters.room_id.toString());
    if (filters?.reception_id) params.append('reception_id', filters.reception_id.toString());
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active ? '1' : '0');
    const query = params.toString();
    const data = await this.request<{
      success: boolean;
      data: DoctorRoom[];
    }>(`/api/doctor-rooms${query ? '?' + query : ''}`);
    return data.data || [];
  }

  async getDoctorRoom(doctorId: number) {
    const data = await this.request<{
      success: boolean;
      data: DoctorRoom;
    }>(`/api/doctor-rooms/doctor/${doctorId}`);
    return data.data;
  }

  async createDoctorRoom(roomData: CreateDoctorRoomData) {
    const data = await this.request<{
      success: boolean;
      data: DoctorRoom;
      message: string;
    }>('/api/doctor-rooms', {
      method: 'POST',
      body: JSON.stringify(roomData),
    });
    return data.data;
  }

  async updateDoctorRoom(id: number, roomData: Partial<CreateDoctorRoomData>) {
    const data = await this.request<{
      success: boolean;
      data: DoctorRoom;
      message: string;
    }>(`/api/doctor-rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roomData),
    });
    return data.data;
  }

  async deleteDoctorRoom(id: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/doctor-rooms/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  // ============================================
  // DOCTOR SLOT ROOMS API (Dynamic Mode)
  // ============================================

  async getDoctorSlotRooms(filters?: {
    doctor_id?: number;
    schedule_id?: number;
    room_id?: number;
    reception_id?: number;
    assignment_date?: string;
    date_from?: string;
    date_to?: string;
    is_active?: boolean;
  }) {
    const params = new URLSearchParams();
    if (filters?.doctor_id) params.append('doctor_id', filters.doctor_id.toString());
    if (filters?.schedule_id) params.append('schedule_id', filters.schedule_id.toString());
    if (filters?.room_id) params.append('room_id', filters.room_id.toString());
    if (filters?.reception_id) params.append('reception_id', filters.reception_id.toString());
    if (filters?.assignment_date) params.append('assignment_date', filters.assignment_date);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active ? '1' : '0');
    const query = params.toString();
    const data = await this.request<{
      success: boolean;
      data: DoctorSlotRoom[];
    }>(`/api/doctor-slot-rooms${query ? '?' + query : ''}`);
    return data.data || [];
  }

  async getDoctorSlotRoomsByDate(doctorId: number, date: string) {
    const data = await this.request<{
      success: boolean;
      data: DoctorSlotRoom[];
    }>(`/api/doctor-slot-rooms/doctor/${doctorId}/date/${date}`);
    return data.data || [];
  }

  async createDoctorSlotRoom(slotRoomData: CreateDoctorSlotRoomData) {
    const data = await this.request<{
      success: boolean;
      data: DoctorSlotRoom;
      message: string;
    }>('/api/doctor-slot-rooms', {
      method: 'POST',
      body: JSON.stringify(slotRoomData),
    });
    return data.data;
  }

  async bulkCreateDoctorSlotRooms(bulkData: BulkCreateDoctorSlotRoomData) {
    const data = await this.request<{
      success: boolean;
      data: { inserted: number };
      message: string;
    }>('/api/doctor-slot-rooms/bulk', {
      method: 'POST',
      body: JSON.stringify(bulkData),
    });
    return data.data;
  }

  async updateDoctorSlotRoom(id: number, slotRoomData: Partial<CreateDoctorSlotRoomData>) {
    const data = await this.request<{
      success: boolean;
      data: DoctorSlotRoom;
      message: string;
    }>(`/api/doctor-slot-rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(slotRoomData),
    });
    return data.data;
  }

  async deleteDoctorSlotRoom(id: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/doctor-slot-rooms/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  // ============================================
  // TOKENS API
  // ============================================

  async getTokensByReception(receptionId: number, date?: string, status?: string) {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (status) params.append('status', status);
    const query = params.toString();
    const data = await this.request<{
      success: boolean;
      data: Token[];
    }>(`/api/tokens/reception/${receptionId}${query ? '?' + query : ''}`);
    return data.data || [];
  }

  async getTokensByFloor(floorId: number, date?: string, status?: string) {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (status) params.append('status', status);
    const query = params.toString();
    const data = await this.request<{
      success: boolean;
      data: Token[];
    }>(`/api/tokens/floor/${floorId}${query ? '?' + query : ''}`);
    return data.data || [];
  }

  async getTokensByDoctor(doctorId: number, date?: string, status?: string) {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (status) params.append('status', status);
    const query = params.toString();
    const data = await this.request<{
      success: boolean;
      data: Token[];
    }>(`/api/tokens/doctor/${doctorId}${query ? '?' + query : ''}`);
    return data.data || [];
  }

  async getTokenQueue(receptionId: number, date?: string) {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    const query = params.toString();
    const data = await this.request<{
      success: boolean;
      data: Token[];
    }>(`/api/tokens/queue/${receptionId}${query ? '?' + query : ''}`);
    return data.data || [];
  }

  async updateTokenStatus(tokenId: number, status: 'Waiting' | 'In Progress' | 'Completed' | 'Cancelled' | 'No Show') {
    const data = await this.request<{
      success: boolean;
      data: Token;
      message: string;
    }>(`/api/tokens/${tokenId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return data.data;
  }

  async getToken(id: number) {
    const data = await this.request<{
      success: boolean;
      data: Token;
    }>(`/api/tokens/${id}`);
    return data.data;
  }

  // ============================================
  // SETUP MODULE API METHODS - DEPARTMENTS
  // ============================================

  async getDepartments(filters?: { search?: string; status?: string; department_type?: string }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.department_type) params.append('department_type', filters.department_type);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/departments?${queryString}` : '/api/departments';
    
    const data = await this.request<{
      success: boolean;
      data: Department[];
    }>(endpoint);
    return data.data || [];
  }

  async getDepartment(id: number) {
    const data = await this.request<{
      success: boolean;
      data: Department;
    }>(`/api/departments/${id}`);
    return data.data;
  }

  async createDepartment(departmentData: CreateDepartmentData) {
    const data = await this.request<{
      success: boolean;
      data: Department;
      message: string;
    }>('/api/departments', {
      method: 'POST',
      body: JSON.stringify(departmentData),
    });
    return data.data;
  }

  async updateDepartment(id: number, departmentData: Partial<CreateDepartmentData>) {
    const data = await this.request<{
      success: boolean;
      data: Department;
      message: string;
    }>(`/api/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(departmentData),
    });
    return data.data;
  }

  async deleteDepartment(id: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/departments/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  async getDepartmentTypes() {
    const data = await this.request<{
      success: boolean;
      data: string[];
    }>('/api/departments/types');
    return data.data || [];
  }

  // Referral Hospitals API
  async getReferralHospitals(filters?: { search?: string; status?: string; specialty_type?: string }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.specialty_type) params.append('specialty_type', filters.specialty_type);
    
    const queryString = params.toString();
    const endpoint = `/api/referral-hospitals${queryString ? `?${queryString}` : ''}`;
    
    const data = await this.request<{
      success: boolean;
      data: ReferralHospital[];
    }>(endpoint);
    return data.data || [];
  }

  async getReferralHospital(id: number) {
    const data = await this.request<{
      success: boolean;
      data: ReferralHospital;
    }>(`/api/referral-hospitals/${id}`);
    return data.data;
  }

  async createReferralHospital(hospitalData: CreateReferralHospitalData) {
    const data = await this.request<{
      success: boolean;
      message: string;
      data: ReferralHospital;
    }>('/api/referral-hospitals', {
      method: 'POST',
      body: JSON.stringify(hospitalData),
    });
    return data.data;
  }

  async updateReferralHospital(id: number, hospitalData: Partial<CreateReferralHospitalData>) {
    const data = await this.request<{
      success: boolean;
      message: string;
      data: ReferralHospital;
    }>(`/api/referral-hospitals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(hospitalData),
    });
    return data.data;
  }

  async deleteReferralHospital(id: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/referral-hospitals/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  async getReferralHospitalTypes() {
    const data = await this.request<{
      success: boolean;
      data: string[];
    }>('/api/referral-hospitals/types');
    return data.data || [];
  }

  // Insurance Organizations API
  async getInsuranceOrganizations(filters?: { search?: string; type?: 'insurance' | 'organization'; status?: string }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    
    const queryString = params.toString();
    const endpoint = `/api/insurance-organizations${queryString ? `?${queryString}` : ''}`;
    
    const data = await this.request<{
      success: boolean;
      data: InsuranceOrganization[];
    }>(endpoint);
    return data.data || [];
  }

  async getInsuranceOrganization(id: number) {
    const data = await this.request<{
      success: boolean;
      data: InsuranceOrganization;
    }>(`/api/insurance-organizations/${id}`);
    return data.data;
  }

  async createInsuranceOrganization(organizationData: CreateInsuranceOrganizationData) {
    const data = await this.request<{
      success: boolean;
      message: string;
      data: InsuranceOrganization;
    }>('/api/insurance-organizations', {
      method: 'POST',
      body: JSON.stringify(organizationData),
    });
    return data.data;
  }

  async updateInsuranceOrganization(id: number, organizationData: Partial<CreateInsuranceOrganizationData>) {
    const data = await this.request<{
      success: boolean;
      message: string;
      data: InsuranceOrganization;
    }>(`/api/insurance-organizations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(organizationData),
    });
    return data.data;
  }

  async deleteInsuranceOrganization(id: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/insurance-organizations/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  async getInsurancePricing(insuranceId: number) {
    const data = await this.request<{
      success: boolean;
      data: {
        procedure: InsurancePricingItem[];
        laboratory: InsurancePricingItem[];
        radiology: InsurancePricingItem[];
        pharmacy: InsurancePricingItem[];
      };
    }>(`/api/insurance-organizations/${insuranceId}/pricing`);
    return data.data;
  }

  async updateInsurancePricing(insuranceId: number, pricingData: { pricing: InsurancePricingItem[] }) {
    const data = await this.request<{
      success: boolean;
      message: string;
      data: InsurancePricingItem[];
    }>(`/api/insurance-organizations/${insuranceId}/pricing`, {
      method: 'PUT',
      body: JSON.stringify(pricingData),
    });
    return data.data;
  }

  async getPricingItems(itemType: 'procedure' | 'laboratory' | 'radiology' | 'pharmacy') {
    const data = await this.request<{
      success: boolean;
      data: PricingItem[];
    }>(`/api/insurance-organizations/pricing-items?type=${itemType}`);
    return data.data || [];
  }

  // Donation Donors API
  async getDonationDonors(filters?: { search?: string; type?: 'individual' | 'corporate' }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.type) params.append('type', filters.type);
    
    const queryString = params.toString();
    const endpoint = `/api/donation-donors${queryString ? `?${queryString}` : ''}`;
    
    const data = await this.request<{
      success: boolean;
      data: DonationDonor[];
    }>(endpoint);
    return data.data || [];
  }

  async getDonationDonor(id: number) {
    const data = await this.request<{
      success: boolean;
      data: DonationDonor;
    }>(`/api/donation-donors/${id}`);
    return data.data;
  }

  async createDonationDonor(donorData: CreateDonationDonorData) {
    const data = await this.request<{
      success: boolean;
      message: string;
      data: DonationDonor;
    }>('/api/donation-donors', {
      method: 'POST',
      body: JSON.stringify(donorData),
    });
    return data.data;
  }

  async updateDonationDonor(id: number, donorData: Partial<CreateDonationDonorData>) {
    const data = await this.request<{
      success: boolean;
      message: string;
      data: DonationDonor;
    }>(`/api/donation-donors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(donorData),
    });
    return data.data;
  }

  async deleteDonationDonor(id: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/donation-donors/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  async getDonationPayments(donorId: number) {
    const data = await this.request<{
      success: boolean;
      data: DonationPayment[];
    }>(`/api/donation-donors/${donorId}/payments`);
    return data.data || [];
  }

  async addDonationPayment(donorId: number, paymentData: CreateDonationPaymentData) {
    const data = await this.request<{
      success: boolean;
      message: string;
      data: DonationPayment[];
    }>(`/api/donation-donors/${donorId}/payments`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
    return data.data;
  }

  // Helper methods for pricing configuration
  async getProceduresForPricing() {
    return this.getPricingItems('procedure');
  }

  async getLabTestsForPricing() {
    return this.getPricingItems('laboratory');
  }

  async getRadiologyTestsForPricing() {
    return this.getPricingItems('radiology');
  }

  async getMedicinesForPricing() {
    return this.getPricingItems('pharmacy');
  }

  // ============================================
  // MESSAGE SETTINGS API
  // ============================================

  // Message Templates
  async getMessageTemplates(filters?: {
    type?: 'sms' | 'email' | 'whatsapp';
    status?: 'active' | 'inactive';
    trigger?: string;
    category?: string;
    search?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.trigger) params.append('trigger', filters.trigger);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    
    const query = params.toString();
    const data = await this.request<{
      success: boolean;
      data: MessageTemplate[];
    }>(`/api/message-templates${query ? '?' + query : ''}`);
    return data.data || [];
  }

  async getMessageTemplate(id: number) {
    const data = await this.request<{
      success: boolean;
      data: MessageTemplate;
    }>(`/api/message-templates/${id}`);
    return data.data;
  }

  async createMessageTemplate(templateData: CreateMessageTemplateData) {
    const data = await this.request<{
      success: boolean;
      data: MessageTemplate;
      message: string;
    }>('/api/message-templates', {
      method: 'POST',
      body: JSON.stringify(templateData),
    });
    return data.data;
  }

  async updateMessageTemplate(id: number, templateData: Partial<MessageTemplate>) {
    const data = await this.request<{
      success: boolean;
      data: MessageTemplate;
      message: string;
    }>(`/api/message-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(templateData),
    });
    return data.data;
  }

  async deleteMessageTemplate(id: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/message-templates/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  async duplicateMessageTemplate(id: number) {
    const data = await this.request<{
      success: boolean;
      data: MessageTemplate;
      message: string;
    }>(`/api/message-templates/${id}/duplicate`, {
      method: 'POST',
    });
    return data.data;
  }

  async toggleTemplateStatus(id: number) {
    const data = await this.request<{
      success: boolean;
      data: MessageTemplate;
      message: string;
    }>(`/api/message-templates/${id}/toggle-status`, {
      method: 'POST',
    });
    return data.data;
  }

  async sendTestMessage(id: number, recipient: string) {
    const data = await this.request<{
      success: boolean;
      data: {
        message: string;
        template_id: number;
        recipient: string;
      };
      message: string;
    }>(`/api/message-templates/${id}/test`, {
      method: 'POST',
      body: JSON.stringify({ recipient }),
    });
    return data.data;
  }

  // Message Platforms
  async getMessagePlatforms() {
    const data = await this.request<{
      success: boolean;
      data: MessagePlatform[];
    }>('/api/message-platforms');
    return data.data || [];
  }

  async getMessagePlatform(type: 'sms' | 'email' | 'whatsapp') {
    const data = await this.request<{
      success: boolean;
      data: MessagePlatform;
    }>(`/api/message-platforms/${type}`);
    return data.data;
  }

  async updateMessagePlatform(type: 'sms' | 'email' | 'whatsapp', settings: Partial<MessagePlatform>) {
    const data = await this.request<{
      success: boolean;
      data: MessagePlatform;
      message: string;
    }>(`/api/message-platforms/${type}`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
    return data.data;
  }

  // Message Recipients
  async getMessageRecipients(type?: 'doctor' | 'staff' | 'admin') {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    
    const query = params.toString();
    const data = await this.request<{
      success: boolean;
      data: MessageRecipient[];
    }>(`/api/message-recipients${query ? '?' + query : ''}`);
    return data.data || [];
  }

  async updateMessageRecipient(id: number, preferences: Partial<MessageRecipient>) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/message-recipients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
    return data;
  }

  async bulkUpdateRecipients(updates: Array<{
    user_id: number;
    user_type: 'doctor' | 'staff' | 'admin';
    appointment_sms?: boolean;
    opd_sms?: boolean;
    appointment_email?: boolean;
    schedule_sms?: boolean;
    schedule_email?: boolean;
    courtesy_message?: boolean;
    day_end_report?: boolean;
  }>) {
    const data = await this.request<{
      success: boolean;
      data: {
        updated: number;
        created: number;
        total: number;
      };
      message: string;
    }>('/api/message-recipients/bulk', {
      method: 'POST',
      body: JSON.stringify({ updates }),
    });
    return data.data;
  }

  // Message Statistics
  async getMessageStatistics(period?: 'daily' | 'weekly' | 'monthly') {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    
    const query = params.toString();
    const data = await this.request<{
      success: boolean;
      data: MessageStatistics;
    }>(`/api/message-statistics${query ? '?' + query : ''}`);
    return data.data;
  }

  // ============================================
  // IPD MANAGEMENT API METHODS
  // ============================================

  // Dashboard
  async getIPDDashboardStats() {
    const data = await this.request<{
      success: boolean;
      data: IPDDashboardStats;
    }>('/api/ipd/dashboard');
    return data.data;
  }

  async getIPDStats() {
    const data = await this.request<{
      success: boolean;
      data: IPDDashboardStats['stats'];
    }>('/api/ipd/stats');
    return data.data;
  }

  // Hospital Dashboard
  async getDashboardOverview() {
    const data = await this.request<{
      success: boolean;
      data: {
        totalPatients: number;
        activeDoctors: number;
        onDutyDoctors: number;
        todayAppointments: number;
        completedAppointments: number;
        pendingAppointments: number;
        monthlyRevenue: number;
        bedOccupancy: number;
        pendingLabs: number;
        urgentLabs: number;
        medicineStock: number;
        satisfaction: number;
        aiPredictions: {
          patientFlow: number;
          revenueForecast: number;
          bedOccupancy: number;
        };
      };
    }>('/api/dashboard/overview');
    return data.data;
  }

  async getPatientTrends(filters?: { date_from?: string; date_to?: string; group_by?: string }) {
    const params = new URLSearchParams();
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.group_by) params.append('group_by', filters.group_by);

    const query = params.toString();
    const data = await this.request<{
      success: boolean;
      data: Array<{
        month: string;
        opd: number;
        ipd: number;
        emergency: number;
        total: number;
      }>;
    }>(`/api/dashboard/patient-trends${query ? '?' + query : ''}`);
    return data.data;
  }

  async getRevenueTrends(filters?: { date_from?: string; date_to?: string }) {
    const params = new URLSearchParams();
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);

    const query = params.toString();
    const data = await this.request<{
      success: boolean;
      data: Array<{
        month: string;
        revenue: number;
        expenses: number;
        profit: number;
      }>;
    }>(`/api/dashboard/revenue-trends${query ? '?' + query : ''}`);
    return data.data;
  }

  async getDepartmentStats() {
    const data = await this.request<{
      success: boolean;
      data: Array<{
        name: string;
        value: number;
        color: string;
        patients: number;
      }>;
    }>('/api/dashboard/department-stats');
    return data.data;
  }

  async getRecentActivities(limit?: number) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', String(limit));

    const query = params.toString();
    const data = await this.request<{
      success: boolean;
      data: Array<{
        id: string;
        type: string;
        patient: string;
        doctor?: string;
        department?: string;
        test?: string;
        time: string;
        status: string;
      }>;
    }>(`/api/dashboard/recent-activities${query ? '?' + query : ''}`);
    return data.data;
  }

  async getUpcomingAppointments(limit?: number) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', String(limit));

    const query = params.toString();
    const data = await this.request<{
      success: boolean;
      data: Array<{
        time: string;
        patient: string;
        doctor: string;
        type: string;
        department: string;
      }>;
    }>(`/api/dashboard/upcoming-appointments${query ? '?' + query : ''}`);
    return data.data;
  }

  async getDashboardAlerts() {
    const data = await this.request<{
      success: boolean;
      data: Array<{
        type: string;
        message: string;
        severity: string;
        time: string;
      }>;
    }>('/api/dashboard/alerts');
    return data.data;
  }

  async getEvaluationDashboard(filters?: { time_range?: string; department?: string }) {
    const params = new URLSearchParams();
    if (filters?.time_range) params.append('time_range', filters.time_range);
    if (filters?.department) params.append('department', filters.department);

    const query = params.toString();
    const data = await this.request<{
      success: boolean;
      data: {
        departmentPerformance: Array<any>;
        doctorMetrics: Array<any>;
        patientTrends: Array<any>;
        revenueBreakdown: Array<any>;
        diseasePatterns: Array<any>;
        financialTrends: Array<any>;
        efficiencyMetrics: Array<any>;
      };
    }>(`/api/dashboard/evaluation${query ? '?' + query : ''}`);
    return data.data;
  }

  // Admissions
  async getIPDAdmissions(filters?: {
    search?: string;
    status?: string;
    ward_id?: number;
    department?: string;
    admission_type?: string;
    date_from?: string;
    date_to?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.ward_id) params.append('ward_id', filters.ward_id.toString());
    if (filters?.department) params.append('department', filters.department);
    if (filters?.admission_type) params.append('admission_type', filters.admission_type);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    
    const query = params.toString();
    const data = await this.request<{
      success: boolean;
      data: IPDAdmission[];
    }>(`/api/ipd/admissions${query ? '?' + query : ''}`);
    return data.data || [];
  }

  async getIPDAdmission(id: number) {
    const data = await this.request<{
      success: boolean;
      data: IPDAdmission;
    }>(`/api/ipd/admissions/${id}`);
    return data.data;
  }

  async createIPDAdmission(admissionData: CreateIPDAdmissionData) {
    const data = await this.request<{
      success: boolean;
      data: IPDAdmission;
      message: string;
    }>('/api/ipd/admissions', {
      method: 'POST',
      body: JSON.stringify(admissionData),
    });
    return data.data;
  }

  async updateIPDAdmission(id: number, admissionData: Partial<CreateIPDAdmissionData>) {
    const data = await this.request<{
      success: boolean;
      data: IPDAdmission;
      message: string;
    }>(`/api/ipd/admissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(admissionData),
    });
    return data.data;
  }

  // Wards
  async getIPDWards(filters?: {
    search?: string;
    status?: string;
    type?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);
    
    const query = params.toString();
    const data = await this.request<{
      success: boolean;
      data: IPDWard[];
    }>(`/api/ipd/wards${query ? '?' + query : ''}`);
    return data.data || [];
  }

  async getIPDWard(id: number) {
    const data = await this.request<{
      success: boolean;
      data: IPDWard;
    }>(`/api/ipd/wards/${id}`);
    return data.data;
  }

  // IPD Duty Roster
  async getIPDDutyRoster(filters?: {
    user_id?: number;
    date?: string;
    date_from?: string;
    date_to?: string;
    shift_type?: string;
    status?: string;
    ward_id?: number;
    department_id?: number;
    search?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.user_id) params.append('user_id', String(filters.user_id));
    if (filters?.date) params.append('date', filters.date);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.shift_type) params.append('shift_type', filters.shift_type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.ward_id) params.append('ward_id', String(filters.ward_id));
    if (filters?.department_id) params.append('department_id', String(filters.department_id));
    if (filters?.search) params.append('search', filters.search);
    
    const query = params.toString();
    const data = await this.request<{
      success: boolean;
      data: any[];
    }>(`/api/ipd/duty-roster${query ? '?' + query : ''}`);
    return data.data || [];
  }

  async createIPDDutyRoster(rosterData: {
    user_id: number;
    date: string;
    shift_type: string;
    shift_start_time: string;
    shift_end_time: string;
    ward_id?: number;
    department_id?: number;
    specialization?: string;
    status?: string;
    notes?: string;
  }) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>('/api/ipd/duty-roster', {
      method: 'POST',
      body: JSON.stringify(rosterData),
    });
    return data.data;
  }

  async updateIPDDutyRoster(id: number, rosterData: Partial<{
    user_id: number;
    date: string;
    shift_type: string;
    shift_start_time: string;
    shift_end_time: string;
    ward_id?: number;
    department_id?: number;
    specialization?: string;
    status?: string;
    notes?: string;
  }>) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/ipd/duty-roster/${id}`, {
      method: 'PUT',
      body: JSON.stringify(rosterData),
    });
    return data.data;
  }

  async deleteIPDDutyRoster(id: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/ipd/duty-roster/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  async getIPDWardBeds(wardId: number) {
    const data = await this.request<{
      success: boolean;
      data: IPDBed[];
    }>(`/api/ipd/wards/${wardId}/beds`);
    return data.data || [];
  }

  async createIPDWard(wardData: CreateIPDWardData) {
    const data = await this.request<{
      success: boolean;
      data: IPDWard;
      message: string;
    }>(`/api/ipd/wards`, {
      method: 'POST',
      body: JSON.stringify(wardData),
    });
    return data.data;
  }

  async updateIPDWard(id: number, wardData: Partial<CreateIPDWardData>) {
    const data = await this.request<{
      success: boolean;
      data: IPDWard;
      message: string;
    }>(`/api/ipd/wards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(wardData),
    });
    return data.data;
  }

  async deleteIPDWard(id: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/ipd/wards/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  // Beds
  async getIPDBeds(filters?: {
    search?: string;
    status?: string;
    ward_id?: number;
    bed_type?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.ward_id) params.append('ward_id', filters.ward_id.toString());
    if (filters?.bed_type) params.append('bed_type', filters.bed_type);
    
    const query = params.toString();
    const data = await this.request<{
      success: boolean;
      data: IPDBed[];
    }>(`/api/ipd/beds${query ? '?' + query : ''}`);
    return data.data || [];
  }

  async getIPDBed(id: number) {
    const data = await this.request<{
      success: boolean;
      data: IPDBed;
    }>(`/api/ipd/beds/${id}`);
    return data.data;
  }

  async getAvailableIPDBeds(filters?: {
    ward_id?: number;
    bed_type?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.ward_id) params.append('ward_id', filters.ward_id.toString());
    if (filters?.bed_type) params.append('bed_type', filters.bed_type);
    
    const query = params.toString();
    const data = await this.request<{
      success: boolean;
      data: IPDBed[];
    }>(`/api/ipd/beds/available${query ? '?' + query : ''}`);
    return data.data || [];
  }

  async createIPDBed(bedData: CreateIPDBedData) {
    const data = await this.request<{
      success: boolean;
      data: IPDBed;
      message: string;
    }>(`/api/ipd/beds`, {
      method: 'POST',
      body: JSON.stringify(bedData),
    });
    return data.data;
  }

  async updateIPDBed(id: number, bedData: Partial<CreateIPDBedData>) {
    const data = await this.request<{
      success: boolean;
      data: IPDBed;
      message: string;
    }>(`/api/ipd/beds/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bedData),
    });
    return data.data;
  }

  async deleteIPDBed(id: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/ipd/beds/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  // Rooms
  async getIPDRooms(filters?: {
    search?: string;
    status?: string;
    room_type?: string;
    floor_id?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.room_type) params.append('room_type', filters.room_type);
    if (filters?.floor_id) params.append('floor_id', filters.floor_id.toString());
    
    const query = params.toString();
    const data = await this.request<{
      success: boolean;
      data: IPDRoom[];
    }>(`/api/ipd/rooms${query ? '?' + query : ''}`);
    return data.data || [];
  }

  async getIPDRoom(id: number) {
    const data = await this.request<{
      success: boolean;
      data: IPDRoom;
    }>(`/api/ipd/rooms/${id}`);
    return data.data;
  }

  async getAvailableIPDRooms(filters?: {
    room_type?: string;
    floor_id?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.room_type) params.append('room_type', filters.room_type);
    if (filters?.floor_id) params.append('floor_id', filters.floor_id.toString());
    
    const query = params.toString();
    const data = await this.request<{
      success: boolean;
      data: IPDRoom[];
    }>(`/api/ipd/rooms/available${query ? '?' + query : ''}`);
    return data.data || [];
  }

  async createIPDRoom(roomData: CreateIPDRoomData) {
    const data = await this.request<{
      success: boolean;
      data: IPDRoom;
      message: string;
    }>(`/api/ipd/rooms`, {
      method: 'POST',
      body: JSON.stringify(roomData),
    });
    return data.data;
  }

  async updateIPDRoom(id: number, roomData: Partial<CreateIPDRoomData>) {
    const data = await this.request<{
      success: boolean;
      data: IPDRoom;
      message: string;
    }>(`/api/ipd/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roomData),
    });
    return data.data;
  }

  async deleteIPDRoom(id: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/ipd/rooms/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  // Vital Signs
  async getIPDVitals(admissionId: number) {
    const data = await this.request<{
      success: boolean;
      data: IPDVitalSign[];
    }>(`/api/ipd/admissions/${admissionId}/vitals`);
    return data.data || [];
  }

  async recordIPDVitals(admissionId: number, vitalData: CreateIPDVitalSignData) {
    const data = await this.request<{
      success: boolean;
      data: IPDVitalSign;
      message: string;
    }>(`/api/ipd/admissions/${admissionId}/vitals`, {
      method: 'POST',
      body: JSON.stringify(vitalData),
    });
    return data.data;
  }

  // Treatment Orders
  async getIPDTreatmentOrders(admissionId: number) {
    const data = await this.request<{
      success: boolean;
      data: IPDTreatmentOrder[];
    }>(`/api/ipd/admissions/${admissionId}/orders`);
    return data.data || [];
  }

  async createIPDTreatmentOrder(admissionId: number, orderData: CreateIPDTreatmentOrderData) {
    const data = await this.request<{
      success: boolean;
      data: IPDTreatmentOrder;
      message: string;
    }>(`/api/ipd/admissions/${admissionId}/orders`, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    return data.data;
  }

  // Nursing Notes
  async getIPDNursingNotes(admissionId: number) {
    const data = await this.request<{
      success: boolean;
      data: IPDNursingNote[];
    }>(`/api/ipd/admissions/${admissionId}/nursing-notes`);
    return data.data || [];
  }

  async addIPDNursingNote(admissionId: number, noteData: CreateIPDNursingNoteData) {
    const data = await this.request<{
      success: boolean;
      data: IPDNursingNote;
      message: string;
    }>(`/api/ipd/admissions/${admissionId}/nursing-notes`, {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
    return data.data;
  }

  // Billing
  async getIPDBilling(admissionId: number) {
    const data = await this.request<{
      success: boolean;
      data: IPDBilling;
    }>(`/api/ipd/admissions/${admissionId}/billing`);
    return data.data;
  }

  async recordIPDPayment(admissionId: number, paymentData: RecordIPDPaymentData) {
    const data = await this.request<{
      success: boolean;
      data: IPDBilling;
      message: string;
    }>(`/api/ipd/admissions/${admissionId}/billing/payment`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
    return data.data;
  }

  // Patient Payments
  async recordPatientPayment(paymentData: CreatePatientPaymentData) {
    const data = await this.request<{
      success: boolean;
      data: PatientPayment;
      message: string;
    }>('/api/patient-payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
    return data.data;
  }

  async getPatientPayments(filters?: PatientPaymentFilters) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    const data = await this.request<{
      success: boolean;
      data: PatientPayment[];
    }>(`/api/patient-payments${queryString ? `?${queryString}` : ''}`);
    return data.data;
  }

  async getPatientPayment(paymentId: number) {
    const data = await this.request<{
      success: boolean;
      data: PatientPayment;
    }>(`/api/patient-payments/${paymentId}`);
    return data.data;
  }

  async recordBillPayment(billType: string, billId: number, paymentData: CreatePatientPaymentData) {
    const data = await this.request<{
      success: boolean;
      data: PatientPayment;
      message: string;
    }>('/api/patient-payments/bill-payment', {
      method: 'POST',
      body: JSON.stringify({
        bill_type: billType,
        bill_id: billId,
        ...paymentData,
      }),
    });
    return data.data;
  }

  async recordAdvancePayment(patientId: number, paymentData: CreatePatientPaymentData) {
    const data = await this.request<{
      success: boolean;
      data: PatientPayment;
      message: string;
    }>('/api/patient-payments/advance', {
      method: 'POST',
      body: JSON.stringify({
        patient_id: patientId,
        ...paymentData,
      }),
    });
    return data.data;
  }

  async getPatientPaymentHistory(patientId: number, filters?: PatientPaymentFilters) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    const data = await this.request<{
      success: boolean;
      data: {
        payments: PatientPayment[];
        advance_balance: number;
      };
    }>(`/api/patient-payments/history/${patientId}${queryString ? `?${queryString}` : ''}`);
    return data.data;
  }

  async getBillPayments(billType: string, billId: number) {
    const data = await this.request<{
      success: boolean;
      data: {
        payments: PatientPayment[];
        total_paid: number;
      };
    }>(`/api/patient-payments/bill/${billType}/${billId}`);
    return data.data;
  }

  async getPatientAdvanceBalance(patientId: number) {
    const data = await this.request<{
      success: boolean;
      data: {
        advance_balance: number;
      };
    }>(`/api/patient-payments/advance-balance/${patientId}`);
    return data.data.advance_balance;
  }

  async applyAdvanceBalance(billType: string, billId: number, amount: number) {
    const data = await this.request<{
      success: boolean;
      data: {
        success: boolean;
        advance_applied: number;
      };
      message: string;
    }>('/api/patient-payments/apply-advance', {
      method: 'POST',
      body: JSON.stringify({
        bill_type: billType,
        bill_id: billId,
        amount: amount,
      }),
    });
    return data.data;
  }

  async generatePaymentReceipt(paymentId: number) {
    const data = await this.request<{
      success: boolean;
      data: PaymentReceipt;
      message: string;
    }>(`/api/patient-payments/generate-receipt/${paymentId}`, {
      method: 'POST',
    });
    return data.data;
  }

  async getPaymentReceipt(receiptNumber: string) {
    const data = await this.request<{
      success: boolean;
      data: PaymentReceipt;
    }>(`/api/patient-payments/receipt/${receiptNumber}`);
    return data.data;
  }

  // OPD Billing
  async createOpdBill(billData: CreateOpdBillData) {
    const data = await this.request<{
      success: boolean;
      data: OpdBill;
      message: string;
    }>('/api/opd-billing', {
      method: 'POST',
      body: JSON.stringify(billData),
    });
    return data.data;
  }

  async getOpdBills(filters?: OpdBillFilters) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    const data = await this.request<{
      success: boolean;
      data: OpdBill[];
    }>(`/api/opd-billing${queryString ? `?${queryString}` : ''}`);
    return data.data;
  }

  async getOpdBill(billId: number) {
    const data = await this.request<{
      success: boolean;
      data: OpdBill;
    }>(`/api/opd-billing/${billId}`);
    return data.data;
  }

  async getOpdBillByAppointment(appointmentId: number) {
    const data = await this.request<{
      success: boolean;
      data: OpdBill | null;
    }>(`/api/opd-billing/appointment/${appointmentId}`);
    // Return null if no bill found (instead of throwing error)
    return data.data || null;
  }

  async collectOpdPayment(billId: number, paymentData: CreatePatientPaymentData) {
    const data = await this.request<{
      success: boolean;
      data: {
        payment: PatientPayment;
        bill: OpdBill;
      };
      message: string;
    }>(`/api/opd-billing/payment/${billId}`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
    return data.data;
  }

  async collectAppointmentPayment(appointmentId: number, paymentData: CreatePatientPaymentData & {
    consultation_fee?: number;
    lab_charges?: number;
    radiology_charges?: number;
    medication_charges?: number;
    discount?: number;
    discount_percentage?: number;
    tax_rate?: number;
    insurance_covered?: number;
    bill_notes?: string;
  }) {
    const data = await this.request<{
      success: boolean;
      data: {
        payment: PatientPayment;
        bill: OpdBill;
        appointment: any;
      };
      message: string;
    }>(`/api/appointments/${appointmentId}/payment`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
    return data.data;
  }

  async getOpdBillsByPatient(patientId: number, filters?: OpdBillFilters) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    const data = await this.request<{
      success: boolean;
      data: OpdBill[];
    }>(`/api/opd-billing/patient/${patientId}${queryString ? `?${queryString}` : ''}`);
    return data.data;
  }

  // Discharge
  async getIPDDischarges(filters?: {
    search?: string;
    date_from?: string;
    date_to?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    
    const query = params.toString();
    const data = await this.request<{
      success: boolean;
      data: IPDDischargeSummary[];
    }>(`/api/ipd/discharges${query ? '?' + query : ''}`);
    return data.data || [];
  }

  async getIPDDischarge(admissionId: number) {
    const data = await this.request<{
      success: boolean;
      data: IPDDischargeSummary;
    }>(`/api/ipd/admissions/${admissionId}/discharge`);
    return data.data;
  }

  async createIPDDischarge(admissionId: number, dischargeData: CreateIPDDischargeData) {
    const data = await this.request<{
      success: boolean;
      data: IPDDischargeSummary;
      message: string;
    }>(`/api/ipd/admissions/${admissionId}/discharge`, {
      method: 'POST',
      body: JSON.stringify(dischargeData),
    });
    return data.data;
  }

  // Transfers
  async getIPDTransfers(admissionId: number) {
    const data = await this.request<{
      success: boolean;
      data: IPDTransfer[];
    }>(`/api/ipd/admissions/${admissionId}/transfers`);
    return data.data || [];
  }

  async transferIPDPatient(admissionId: number, transferData: CreateIPDTransferData) {
    const data = await this.request<{
      success: boolean;
      data: IPDTransfer;
      message: string;
    }>(`/api/ipd/admissions/${admissionId}/transfer`, {
      method: 'POST',
      body: JSON.stringify(transferData),
    });
    return data.data;
  }

  // Rehabilitation Requests
  async getIPDRehabilitationRequests(filters?: {
    status?: string;
    admission_id?: number;
    patient_id?: number;
    service_type?: string;
    search?: string;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    const url = `/api/ipd/rehabilitation-requests${queryString ? '?' + queryString : ''}`;
    const data = await this.request<{
      success: boolean;
      data: {
        requests: IPDRehabilitationRequest[];
        stats: IPDRehabilitationStats;
      };
    }>(url);
    return data.data;
  }

  async getIPDRehabilitationRequest(id: number) {
    const data = await this.request<{
      success: boolean;
      data: IPDRehabilitationRequest;
    }>(`/api/ipd/rehabilitation-requests/${id}`);
    return data.data;
  }

  async createIPDRehabilitationRequest(requestData: CreateIPDRehabilitationRequestData) {
    const data = await this.request<{
      success: boolean;
      data: IPDRehabilitationRequest;
      message: string;
    }>(`/api/ipd/rehabilitation-requests`, {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
    return data.data;
  }

  async updateIPDRehabilitationRequest(id: number, requestData: Partial<CreateIPDRehabilitationRequestData>) {
    const data = await this.request<{
      success: boolean;
      data: IPDRehabilitationRequest;
      message: string;
    }>(`/api/ipd/rehabilitation-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(requestData),
    });
    return data.data;
  }

  async deleteIPDRehabilitationRequest(id: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/ipd/rehabilitation-requests/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  // Admission Requests
  async getIPDAdmissionRequests(filters?: {
    status?: string;
    priority?: string;
    department?: string;
    doctor_id?: number;
    patient_id?: number;
    search?: string;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    const url = `/api/ipd/admission-requests${queryString ? '?' + queryString : ''}`;
    const data = await this.request<{
      success: boolean;
      data: {
        requests: IPDAdmissionRequest[];
        stats: IPDAdmissionRequestStats;
      };
    }>(url);
    return data.data;
  }

  async getIPDAdmissionRequest(id: number) {
    const data = await this.request<{
      success: boolean;
      data: IPDAdmissionRequest;
    }>(`/api/ipd/admission-requests/${id}`);
    return data.data;
  }

  async createIPDAdmissionRequest(requestData: CreateIPDAdmissionRequestData) {
    const data = await this.request<{
      success: boolean;
      data: IPDAdmissionRequest;
      message: string;
    }>(`/api/ipd/admission-requests`, {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
    return data.data;
  }

  async approveIPDAdmissionRequest(id: number, admissionId?: number) {
    const data = await this.request<{
      success: boolean;
      data: IPDAdmissionRequest;
      message: string;
    }>(`/api/ipd/admission-requests/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ admission_id: admissionId }),
    });
    return data.data;
  }

  async rejectIPDAdmissionRequest(id: number, rejectionReason?: string) {
    const data = await this.request<{
      success: boolean;
      data: IPDAdmissionRequest;
      message: string;
    }>(`/api/ipd/admission-requests/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejection_reason: rejectionReason }),
    });
    return data.data;
  }

  async updateIPDAdmissionRequest(id: number, requestData: Partial<CreateIPDAdmissionRequestData>) {
    const data = await this.request<{
      success: boolean;
      data: IPDAdmissionRequest;
      message: string;
    }>(`/api/ipd/admission-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(requestData),
    });
    return data.data;
  }

  async deleteIPDAdmissionRequest(id: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/ipd/admission-requests/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  // Birth Certificates
  async getBirthCertificates(filters?: {
    search?: string;
    status?: 'Pending' | 'Issued' | 'Verified';
    date_from?: string;
    date_to?: string;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    const url = `/api/birth-certificates${queryString ? '?' + queryString : ''}`;
    const data = await this.request<{
      success: boolean;
      data: {
        certificates: BirthCertificate[];
        stats: {
          total: number;
          Pending?: number;
          Issued?: number;
          Verified?: number;
        };
      };
    }>(url);
    return data.data;
  }

  async getBirthCertificate(id: number) {
    const data = await this.request<{
      success: boolean;
      data: BirthCertificate;
    }>(`/api/birth-certificates/${id}`);
    return data.data;
  }

  async createBirthCertificate(certificateData: CreateBirthCertificateData) {
    const data = await this.request<{
      success: boolean;
      data: BirthCertificate;
      message: string;
    }>(`/api/birth-certificates`, {
      method: 'POST',
      body: JSON.stringify(certificateData),
    });
    return data.data;
  }

  async updateBirthCertificate(id: number, certificateData: Partial<CreateBirthCertificateData>) {
    const data = await this.request<{
      success: boolean;
      data: BirthCertificate;
      message: string;
    }>(`/api/birth-certificates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(certificateData),
    });
    return data.data;
  }

  async deleteBirthCertificate(id: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/birth-certificates/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  // Death Certificates
  async getDeathCertificates(filters?: {
    search?: string;
    status?: 'Pending' | 'Issued' | 'Verified';
    date_from?: string;
    date_to?: string;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    const url = `/api/death-certificates${queryString ? '?' + queryString : ''}`;
    const data = await this.request<{
      success: boolean;
      data: {
        certificates: DeathCertificate[];
        stats: {
          total: number;
          Pending?: number;
          Issued?: number;
          Verified?: number;
        };
      };
    }>(url);
    return data.data;
  }

  async getDeathCertificate(id: number) {
    const data = await this.request<{
      success: boolean;
      data: DeathCertificate;
    }>(`/api/death-certificates/${id}`);
    return data.data;
  }

  async createDeathCertificate(certificateData: CreateDeathCertificateData) {
    const data = await this.request<{
      success: boolean;
      data: DeathCertificate;
      message: string;
    }>(`/api/death-certificates`, {
      method: 'POST',
      body: JSON.stringify(certificateData),
    });
    return data.data;
  }

  async updateDeathCertificate(id: number, certificateData: Partial<CreateDeathCertificateData>) {
    const data = await this.request<{
      success: boolean;
      data: DeathCertificate;
      message: string;
    }>(`/api/death-certificates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(certificateData),
    });
    return data.data;
  }

  async deleteDeathCertificate(id: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/death-certificates/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  // ============================================
  // SOFTWARE TEAM CONTACTS API METHODS
  // ============================================

  async getSoftwareTeamContacts(filters?: {
    search?: string;
    department?: string;
    status?: 'available' | 'busy' | 'offline';
  }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.department) params.append('department', filters.department);
    if (filters?.status) params.append('status', filters.status);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/software-team-contacts?${queryString}` : '/api/software-team-contacts';
    
    const data = await this.request<{
      success: boolean;
      data: {
        contacts: SoftwareTeamContact[];
        departments: string[];
      };
    }>(endpoint);
    return data.data;
  }

  async getSoftwareTeamContact(id: string | number) {
    const data = await this.request<{
      success: boolean;
      data: SoftwareTeamContact;
    }>(`/api/software-team-contacts/${id}`);
    return data.data;
  }

  async createSoftwareTeamContact(contactData: CreateSoftwareTeamContactData) {
    const data = await this.request<{
      success: boolean;
      data: SoftwareTeamContact;
      message: string;
    }>('/api/software-team-contacts', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
    return data.data;
  }

  async updateSoftwareTeamContact(id: string | number, contactData: Partial<CreateSoftwareTeamContactData>) {
    const data = await this.request<{
      success: boolean;
      data: SoftwareTeamContact;
      message: string;
    }>(`/api/software-team-contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contactData),
    });
    return data.data;
  }

  async deleteSoftwareTeamContact(id: string | number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/software-team-contacts/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  async getSoftwareTeamContactDepartments() {
    const data = await this.request<{
      success: boolean;
      data: string[];
    }>('/api/software-team-contacts/departments');
    return data.data || [];
  }

  // ============================================
  // SUPPORT TICKETS API METHODS
  // ============================================

  async getSupportTickets(filters?: {
    search?: string;
    status?: 'open' | 'in-progress' | 'resolved' | 'closed';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    module?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.module) params.append('module', filters.module);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/support-tickets?${queryString}` : '/api/support-tickets';
    
    const data = await this.request<{
      success: boolean;
      data: {
        tickets: SupportTicket[];
        stats: SupportTicketStats;
      };
    }>(endpoint);
    return data.data;
  }

  async getSupportTicket(id: string | number) {
    const data = await this.request<{
      success: boolean;
      data: SupportTicket;
    }>(`/api/support-tickets/${id}`);
    return data.data;
  }

  async createSupportTicket(ticketData: CreateSupportTicketData) {
    const data = await this.request<{
      success: boolean;
      data: SupportTicket;
      message: string;
    }>('/api/support-tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
    return data.data;
  }

  async updateSupportTicket(id: string | number, ticketData: Partial<UpdateSupportTicketData>) {
    const data = await this.request<{
      success: boolean;
      data: SupportTicket;
      message: string;
    }>(`/api/support-tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ticketData),
    });
    return data.data;
  }

  async deleteSupportTicket(id: string | number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/support-tickets/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  async getSupportTicketComments(ticketId: string | number) {
    const data = await this.request<{
      success: boolean;
      data: SupportTicketComment[];
    }>(`/api/support-tickets/${ticketId}/comments`);
    return data.data || [];
  }

  async addSupportTicketComment(ticketId: string | number, commentData: { content: string }) {
    const data = await this.request<{
      success: boolean;
      data: SupportTicketComment;
      message: string;
    }>(`/api/support-tickets/${ticketId}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
    return data.data;
  }

  async updateSupportTicketComment(ticketId: string | number, commentId: string | number, commentData: { content: string }) {
    const data = await this.request<{
      success: boolean;
      data: SupportTicketComment;
      message: string;
    }>(`/api/support-tickets/${ticketId}/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify(commentData),
    });
    return data.data;
  }

  async deleteSupportTicketComment(ticketId: string | number, commentId: string | number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/support-tickets/${ticketId}/comments/${commentId}`, {
      method: 'DELETE',
    });
    return data;
  }

  async getSupportTicketAttachments(ticketId: string | number) {
    const data = await this.request<{
      success: boolean;
      data: SupportTicketAttachment[];
    }>(`/api/support-tickets/${ticketId}/attachments`);
    return data.data || [];
  }

  async uploadSupportTicketAttachment(ticketId: string | number, formData: FormData) {
    const data = await this.request<{
      success: boolean;
      data: SupportTicketAttachment;
      message: string;
    }>(`/api/support-tickets/${ticketId}/attachments`, {
      method: 'POST',
      body: formData,
    });
    return data.data;
  }

  async deleteSupportTicketAttachment(ticketId: string | number, attachmentId: string | number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/support-tickets/${ticketId}/attachments/${attachmentId}`, {
      method: 'DELETE',
    });
    return data;
  }

  async getSupportTicketStats() {
    const data = await this.request<{
      success: boolean;
      data: SupportTicketStats;
    }>('/api/support-tickets/stats');
    return data.data;
  }

  // Update Vital Signs
  async updateIPDVital(id: number, vitalData: Partial<CreateIPDVitalSignData>) {
    const data = await this.request<{
      success: boolean;
      data: IPDVitalSign;
      message: string;
    }>(`/api/ipd/vitals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vitalData),
    });
    return data.data;
  }

  async deleteIPDVital(id: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/ipd/vitals/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  // Daily Care Orders
  async getIPDDailyCareOrders(admissionId: number) {
    const data = await this.request<{
      success: boolean;
      data: any[];
    }>(`/api/ipd/admissions/${admissionId}/daily-care-orders`);
    return data.data || [];
  }

  async createIPDDailyCareOrder(admissionId: number, orderData: CreateIPDDailyCareOrderData) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/ipd/admissions/${admissionId}/daily-care-orders`, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    return data.data;
  }

  async updateIPDDailyCareOrder(id: number, orderData: Partial<CreateIPDDailyCareOrderData>) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/ipd/daily-care-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
    return data.data;
  }

  async deleteIPDDailyCareOrder(id: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/ipd/daily-care-orders/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  // Medications
  async getIPDMedications(admissionId: number) {
    const data = await this.request<{
      success: boolean;
      data: any[];
    }>(`/api/ipd/admissions/${admissionId}/medications`);
    return data.data || [];
  }

  async createIPDMedication(admissionId: number, medicationData: CreateIPDMedicationData) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/ipd/admissions/${admissionId}/medications`, {
      method: 'POST',
      body: JSON.stringify(medicationData),
    });
    return data.data;
  }

  async updateIPDMedication(id: number, medicationData: Partial<CreateIPDMedicationData>) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/ipd/medications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(medicationData),
    });
    return data.data;
  }

  async deleteIPDMedication(id: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/ipd/medications/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  // Lab Orders
  async getIPDLabOrders(admissionId: number) {
    const data = await this.request<{
      success: boolean;
      data: any[];
    }>(`/api/ipd/admissions/${admissionId}/lab-orders`);
    return data.data || [];
  }

  async createIPDLabOrder(admissionId: number, orderData: CreateIPDLabOrderData) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/ipd/admissions/${admissionId}/lab-orders`, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    return data.data;
  }

  async updateIPDLabOrder(id: number, orderData: Partial<CreateIPDLabOrderData>) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/ipd/lab-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
    return data.data;
  }

  async deleteIPDLabOrder(id: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/ipd/lab-orders/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  // Radiology Orders
  async getIPDRadiologyOrders(admissionId: number) {
    const data = await this.request<{
      success: boolean;
      data: any[];
    }>(`/api/ipd/admissions/${admissionId}/radiology-orders`);
    return data.data || [];
  }

  async createIPDRadiologyOrder(admissionId: number, orderData: CreateIPDRadiologyOrderData) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/ipd/admissions/${admissionId}/radiology-orders`, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    return data.data;
  }

  async updateIPDRadiologyOrder(id: number, orderData: Partial<CreateIPDRadiologyOrderData>) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/ipd/radiology-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
    return data.data;
  }

  async deleteIPDRadiologyOrder(id: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/ipd/radiology-orders/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  // Doctor Notes
  async getIPDDoctorNotes(admissionId: number) {
    const data = await this.request<{
      success: boolean;
      data: any[];
    }>(`/api/ipd/admissions/${admissionId}/doctor-notes`);
    return data.data || [];
  }

  async createIPDDoctorNote(admissionId: number, noteData: CreateIPDDoctorNoteData) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/ipd/admissions/${admissionId}/doctor-notes`, {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
    return data.data;
  }

  async updateIPDDoctorNote(id: number, noteData: Partial<CreateIPDDoctorNoteData>) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/ipd/doctor-notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(noteData),
    });
    return data.data;
  }

  async deleteIPDDoctorNote(id: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/ipd/doctor-notes/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  // Pharmacist Notes
  async getIPDPharmacistNotes(admissionId: number) {
    const data = await this.request<{
      success: boolean;
      data: any[];
    }>(`/api/ipd/admissions/${admissionId}/pharmacist-notes`);
    return data.data || [];
  }

  async createIPDPharmacistNote(admissionId: number, noteData: CreateIPDPharmacistNoteData) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/ipd/admissions/${admissionId}/pharmacist-notes`, {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
    return data.data;
  }

  async updateIPDPharmacistNote(id: number, noteData: Partial<CreateIPDPharmacistNoteData>) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/ipd/pharmacist-notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(noteData),
    });
    return data.data;
  }

  async deleteIPDPharmacistNote(id: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/ipd/pharmacist-notes/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  // Procedures
  async getIPDProcedures(admissionId: number) {
    const data = await this.request<{
      success: boolean;
      data: any[];
    }>(`/api/ipd/admissions/${admissionId}/procedures`);
    return data.data || [];
  }

  async createIPDProcedure(admissionId: number, procedureData: CreateIPDProcedureData) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/ipd/admissions/${admissionId}/procedures`, {
      method: 'POST',
      body: JSON.stringify(procedureData),
    });
    return data.data;
  }

  async updateIPDProcedure(id: number, procedureData: Partial<CreateIPDProcedureData>) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/ipd/procedures/${id}`, {
      method: 'PUT',
      body: JSON.stringify(procedureData),
    });
    return data.data;
  }

  async deleteIPDProcedure(id: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/ipd/procedures/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  // OT Schedules
  async getOTSchedules(filters?: {
    date?: string;
    ot_number?: string;
    status?: string;
    surgeon_id?: number;
    patient_id?: number;
    admission_id?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.date) params.append('date', filters.date);
    if (filters?.ot_number) params.append('ot_number', filters.ot_number);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.surgeon_id) params.append('surgeon_id', filters.surgeon_id.toString());
    if (filters?.patient_id) params.append('patient_id', filters.patient_id.toString());
    if (filters?.admission_id) params.append('admission_id', filters.admission_id.toString());
    
    const queryString = params.toString();
    const url = `/api/ipd/ot-schedules${queryString ? '?' + queryString : ''}`;
    const data = await this.request<{
      success: boolean;
      data: OTSchedule[];
    }>(url);
    return data.data || [];
  }

  async getOTSchedule(id: number) {
    const data = await this.request<{
      success: boolean;
      data: OTSchedule;
    }>(`/api/ipd/ot-schedules/${id}`);
    return data.data;
  }

  async createOTSchedule(scheduleData: CreateOTScheduleData) {
    const data = await this.request<{
      success: boolean;
      data: OTSchedule;
      message: string;
    }>(`/api/ipd/ot-schedules`, {
      method: 'POST',
      body: JSON.stringify(scheduleData),
    });
    return data.data;
  }

  async updateOTSchedule(id: number, scheduleData: Partial<CreateOTScheduleData>) {
    const data = await this.request<{
      success: boolean;
      data: OTSchedule;
      message: string;
    }>(`/api/ipd/ot-schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(scheduleData),
    });
    return data.data;
  }

  async deleteOTSchedule(id: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/ipd/ot-schedules/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  async startSurgery(id: number, startTime?: string) {
    const data = await this.request<{
      success: boolean;
      data: OTSchedule;
      message: string;
    }>(`/api/ipd/ot-schedules/${id}/start`, {
      method: 'POST',
      body: JSON.stringify({ start_time: startTime }),
    });
    return data.data;
  }

  async completeSurgery(id: number, endTime?: string, actualDurationMinutes?: number, complications?: string) {
    const data = await this.request<{
      success: boolean;
      data: OTSchedule;
      message: string;
    }>(`/api/ipd/ot-schedules/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({
        end_time: endTime,
        actual_duration_minutes: actualDurationMinutes,
        complications: complications,
      }),
    });
    return data.data;
  }

  async cancelSurgery(id: number, reason: string, rescheduleDate?: string, rescheduleTime?: string) {
    const data = await this.request<{
      success: boolean;
      data: OTSchedule;
      message: string;
    }>(`/api/ipd/ot-schedules/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({
        reason: reason,
        reschedule_date: rescheduleDate,
        reschedule_time: rescheduleTime,
      }),
    });
    return data.data;
  }

  async checkOTAvailability(otNumber: string, date: string, startTime: string, durationMinutes: number) {
    const params = new URLSearchParams({
      ot_number: otNumber,
      date: date,
      start_time: startTime,
      duration_minutes: durationMinutes.toString(),
    });
    const data = await this.request<{
      success: boolean;
      data: {
        available: boolean;
        conflicts: OTSchedule[];
        alternative_slots: Array<{ date: string; time: string; ot_number: string }>;
      };
    }>(`/api/ipd/ot-availability?${params.toString()}`);
    return data.data;
  }

  async getOperationTheatres() {
    const data = await this.request<{
      success: boolean;
      data: OperationTheatre[];
    }>(`/api/ipd/operation-theatres`);
    return data.data || [];
  }

  // Surgery Charges
  async getSurgeryCharges(otScheduleId: number) {
    const data = await this.request<{
      success: boolean;
      data: any;
    }>(`/api/ipd/surgeries/${otScheduleId}/charges`);
    return data.data;
  }

  async createSurgeryCharges(otScheduleId: number, chargesData: any) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/ipd/surgeries/${otScheduleId}/charges`, {
      method: 'POST',
      body: JSON.stringify(chargesData),
    });
    return data.data;
  }

  async updateSurgeryCharges(otScheduleId: number, chargesData: any) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/ipd/surgeries/${otScheduleId}/charges`, {
      method: 'PUT',
      body: JSON.stringify(chargesData),
    });
    return data.data;
  }

  // Surgery Consumables
  async getSurgeryConsumables(otScheduleId: number) {
    const data = await this.request<{
      success: boolean;
      data: any[];
    }>(`/api/ipd/surgeries/${otScheduleId}/consumables`);
    return data.data || [];
  }

  async addSurgeryConsumable(otScheduleId: number, consumableData: any) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/ipd/surgeries/${otScheduleId}/consumables`, {
      method: 'POST',
      body: JSON.stringify(consumableData),
    });
    return data.data;
  }

  async updateSurgeryConsumable(otScheduleId: number, consumableId: number, consumableData: any) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/ipd/surgeries/${otScheduleId}/consumables/${consumableId}`, {
      method: 'PUT',
      body: JSON.stringify(consumableData),
    });
    return data.data;
  }

  async deleteSurgeryConsumable(otScheduleId: number, consumableId: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/ipd/surgeries/${otScheduleId}/consumables/${consumableId}`, {
      method: 'DELETE',
    });
    return data;
  }

  // Pre-Operative Checklist
  async getPreOpChecklist(otScheduleId: number) {
    const data = await this.request<{
      success: boolean;
      data: any;
    }>(`/api/ipd/ot-schedules/${otScheduleId}/pre-op-checklist`);
    return data.data;
  }

  async updatePreOpChecklist(otScheduleId: number, checklistData: any) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/ipd/ot-schedules/${otScheduleId}/pre-op-checklist`, {
      method: 'PUT',
      body: JSON.stringify(checklistData),
    });
    return data.data;
  }

  // Nutrition
  async getIPDNutrition(admissionId: number) {
    const data = await this.request<{
      success: boolean;
      data: any[];
    }>(`/api/ipd/admissions/${admissionId}/nutrition`);
    return data.data || [];
  }

  async createIPDNutrition(admissionId: number, nutritionData: CreateIPDNutritionData) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/ipd/admissions/${admissionId}/nutrition`, {
      method: 'POST',
      body: JSON.stringify(nutritionData),
    });
    return data.data;
  }

  async updateIPDNutrition(id: number, nutritionData: Partial<CreateIPDNutritionData>) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/ipd/nutrition/${id}`, {
      method: 'PUT',
      body: JSON.stringify(nutritionData),
    });
    return data.data;
  }

  async deleteIPDNutrition(id: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/ipd/nutrition/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  // Intake & Output
  async getIPDIntakeOutput(admissionId: number) {
    const data = await this.request<{
      success: boolean;
      data: any[];
    }>(`/api/ipd/admissions/${admissionId}/intake-output`);
    return data.data || [];
  }

  async createIPDIntakeOutput(admissionId: number, ioData: CreateIPDIntakeOutputData) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/ipd/admissions/${admissionId}/intake-output`, {
      method: 'POST',
      body: JSON.stringify(ioData),
    });
    return data.data;
  }

  async updateIPDIntakeOutput(id: number, ioData: Partial<CreateIPDIntakeOutputData>) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/ipd/intake-output/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ioData),
    });
    return data.data;
  }

  async deleteIPDIntakeOutput(id: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/ipd/intake-output/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  // Health & Physical Habit
  async getIPDHealthPhysicalHabits(admissionId: number) {
    const data = await this.request<{
      success: boolean;
      data: any[];
    }>(`/api/ipd/admissions/${admissionId}/health-physical-habits`);
    return data.data || [];
  }

  async createIPDHealthPhysicalHabit(admissionId: number, assessmentData: CreateIPDHealthPhysicalHabitData) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/ipd/admissions/${admissionId}/health-physical-habits`, {
      method: 'POST',
      body: JSON.stringify(assessmentData),
    });
    return data.data;
  }

  async deleteIPDHealthPhysicalHabit(id: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/ipd/health-physical-habits/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  // Forms
  async getIPDForms(admissionId: number) {
    const data = await this.request<{
      success: boolean;
      data: any[];
    }>(`/api/ipd/admissions/${admissionId}/forms`);
    return data.data || [];
  }

  async createIPDForm(admissionId: number, formData: CreateIPDFormData) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/ipd/admissions/${admissionId}/forms`, {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    return data.data;
  }

  async deleteIPDForm(id: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/ipd/forms/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  // Doctor Recommendations
  async getIPDDoctorRecommendations(admissionId: number) {
    const data = await this.request<{
      success: boolean;
      data: any[];
    }>(`/api/ipd/admissions/${admissionId}/doctor-recommendations`);
    return data.data || [];
  }

  async createIPDDoctorRecommendation(admissionId: number, recommendationData: CreateIPDDoctorRecommendationData) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/ipd/admissions/${admissionId}/doctor-recommendations`, {
      method: 'POST',
      body: JSON.stringify(recommendationData),
    });
    return data.data;
  }

  async deleteIPDDoctorRecommendation(id: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/ipd/doctor-recommendations/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  // Doctor Consultations
  async getIPDDoctorConsultations(admissionId: number) {
    const data = await this.request<{
      success: boolean;
      data: any[];
    }>(`/api/ipd/admissions/${admissionId}/doctor-consultations`);
    return data.data || [];
  }

  async createIPDDoctorConsultation(admissionId: number, consultationData: CreateIPDDoctorConsultationData) {
    const data = await this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/ipd/admissions/${admissionId}/doctor-consultations`, {
      method: 'POST',
      body: JSON.stringify(consultationData),
    });
    return data.data;
  }

  async deleteIPDDoctorConsultation(id: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/ipd/doctor-consultations/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  // Patient Files
  async getIPDPatientFiles(admissionId: number) {
    const data = await this.request<{
      success: boolean;
      data: any[];
    }>(`/api/ipd/admissions/${admissionId}/files`);
    return data.data || [];
  }

  // IPD Reports
  async getIPDReport(reportId: string, filters?: {
    date_from?: string;
    date_to?: string;
    ward_id?: number;
    department?: string;
    consultant_id?: number;
    panel_id?: string;
    admission_type?: string;
    status?: string;
    group_by?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.ward_id) params.append('ward_id', String(filters.ward_id));
    if (filters?.department) params.append('department', filters.department);
    if (filters?.consultant_id) params.append('consultant_id', String(filters.consultant_id));
    if (filters?.panel_id) params.append('panel_id', filters.panel_id);
    if (filters?.admission_type) params.append('admission_type', filters.admission_type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.group_by) params.append('group_by', filters.group_by);
    
    const query = params.toString();
    const data = await this.request<{
      success: boolean;
      data: {
        data: any[];
        summary: any;
      };
    }>(`/api/ipd/reports/${reportId}${query ? '?' + query : ''}`);
    return data.data || { data: [], summary: {} };
  }

  async uploadIPDFile(admissionId: number, formData: FormData) {
    // For FormData, we need to make a direct fetch call without Content-Type header
    const url = `${API_URL}/api/ipd/admissions/${admissionId}/files`;
    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.handleUnauthorized();
      }
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Upload failed');
    }

    const data = await response.json();
    return data.data;
  }

  async deleteIPDFile(id: number) {
    const data = await this.request<{
      success: boolean;
      message: string;
    }>(`/api/ipd/files/${id}`, {
      method: 'DELETE',
    });
    return data;
  }

  // ============================================
  // AUDIT LOGS API METHODS
  // ============================================

  async getAuditLogs(filters?: AuditLogFilters) {
    const params = new URLSearchParams();
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.user_id) params.append('user_id', filters.user_id.toString());
    if (filters?.action_type) params.append('action_type', filters.action_type);
    if (filters?.module) params.append('module', filters.module);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('offset', ((filters.page - 1) * (filters.limit || 15)).toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/audit-logs?${queryString}` : '/api/audit-logs';
    
    const data = await this.request<{
      success: boolean;
      data: AuditLogResponse;
    }>(endpoint);
    return data.data;
  }

  async getAuditLog(id: string | number) {
    const data = await this.request<{
      success: boolean;
      data: AuditLog;
    }>(`/api/audit-logs/${id}`);
    return data.data;
  }

  async getAuditLogStatistics(filters?: { date_from?: string; date_to?: string; user_id?: number }) {
    const params = new URLSearchParams();
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.user_id) params.append('user_id', filters.user_id.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/audit-logs/statistics?${queryString}` : '/api/audit-logs/statistics';
    
    const data = await this.request<{
      success: boolean;
      data: AuditLogStatistics;
    }>(endpoint);
    return data.data;
  }

  async getUserAuditLogs(userId: string | number, filters?: AuditLogFilters) {
    const params = new URLSearchParams();
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.action_type) params.append('action_type', filters.action_type);
    if (filters?.module) params.append('module', filters.module);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.page) params.append('offset', ((filters.page - 1) * (filters.limit || 15)).toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/audit-logs/users/${userId}?${queryString}` : `/api/audit-logs/users/${userId}`;
    
    const data = await this.request<{
      success: boolean;
      data: {
        logs: AuditLog[];
        total: number;
      };
    }>(endpoint);
    return data.data;
  }

  async exportAuditLogs(filters?: AuditLogFilters) {
    const params = new URLSearchParams();
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.user_id) params.append('user_id', filters.user_id.toString());
    if (filters?.action_type) params.append('action_type', filters.action_type);
    if (filters?.module) params.append('module', filters.module);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/audit-logs/export?${queryString}` : '/api/audit-logs/export';
    
    // For file download, we need to handle it differently
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  async getAuditLogModules() {
    const data = await this.request<{
      success: boolean;
      data: string[];
    }>('/api/audit-logs/modules');
    return data.data || [];
  }

  async getAuditLogUsers() {
    const data = await this.request<{
      success: boolean;
      data: AuditLogUser[];
    }>('/api/audit-logs/users-list');
    return data.data || [];
  }

  // ============================================
  // BILLING API METHODS
  // ============================================

  // Organizations
  async getOrganizations(filters?: { search?: string; status?: string; subscription_status?: string; organization_type?: string }) {
    const queryParams = new URLSearchParams();
    if (filters?.search) queryParams.append('search', filters.search);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.subscription_status) queryParams.append('subscription_status', filters.subscription_status);
    if (filters?.organization_type) queryParams.append('organization_type', filters.organization_type);
    
    return this.request<{ success: boolean; data: Organization[] }>(`/api/organizations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
  }

  async getOrganization(id: number) {
    return this.request<{ success: boolean; data: Organization }>(`/api/organizations/${id}`);
  }

  async getCurrentOrganization() {
    return this.request<{ success: boolean; data: Organization }>('/api/organizations/current');
  }

  async createOrganization(data: CreateOrganizationData) {
    return this.request<{ success: boolean; data: Organization }>('/api/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOrganization(id: number, data: Partial<CreateOrganizationData>) {
    return this.request<{ success: boolean; data: Organization }>(`/api/organizations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteOrganization(id: number) {
    return this.request<{ success: boolean }>(`/api/organizations/${id}`, {
      method: 'DELETE',
    });
  }

  // Subscription Plans
  async getSubscriptionPlans(filters?: { plan_type?: string; billing_cycle?: string; is_active?: boolean }) {
    const queryParams = new URLSearchParams();
    if (filters?.plan_type) queryParams.append('plan_type', filters.plan_type);
    if (filters?.billing_cycle) queryParams.append('billing_cycle', filters.billing_cycle);
    if (filters?.is_active !== undefined) queryParams.append('is_active', filters.is_active.toString());
    
    return this.request<{ success: boolean; data: SubscriptionPlan[] }>(`/api/subscription-plans${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
  }

  async getSubscriptionPlan(id: number) {
    return this.request<{ success: boolean; data: SubscriptionPlan }>(`/api/subscription-plans/${id}`);
  }

  // Invoices
  async getInvoices(filters?: { organization_id?: number; payment_status?: string; invoice_type?: string; date_from?: string; date_to?: string; search?: string }) {
    const queryParams = new URLSearchParams();
    if (filters?.organization_id) queryParams.append('organization_id', filters.organization_id.toString());
    if (filters?.payment_status) queryParams.append('payment_status', filters.payment_status);
    if (filters?.invoice_type) queryParams.append('invoice_type', filters.invoice_type);
    if (filters?.date_from) queryParams.append('date_from', filters.date_from);
    if (filters?.date_to) queryParams.append('date_to', filters.date_to);
    if (filters?.search) queryParams.append('search', filters.search);
    
    return this.request<{ success: boolean; data: Invoice[] }>(`/api/invoices${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
  }

  async getInvoice(id: number) {
    return this.request<{ success: boolean; data: Invoice }>(`/api/invoices/${id}`);
  }

  async createInvoice(data: CreateInvoiceData) {
    return this.request<{ success: boolean; data: Invoice }>('/api/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInvoice(id: number, data: Partial<CreateInvoiceData>) {
    return this.request<{ success: boolean; data: Invoice }>(`/api/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async sendInvoice(id: number) {
    return this.request<{ success: boolean; data: Invoice }>(`/api/invoices/${id}/send`, {
      method: 'POST',
    });
  }

  async getOverdueInvoices(organization_id?: number) {
    const queryParams = organization_id ? `?organization_id=${organization_id}` : '';
    return this.request<{ success: boolean; data: Invoice[] }>(`/api/invoices/overdue${queryParams}`);
  }

  // Payments
  async getPayments(filters?: { organization_id?: number; invoice_id?: number; payment_status?: string; payment_method?: string; date_from?: string; date_to?: string; search?: string }) {
    const queryParams = new URLSearchParams();
    if (filters?.organization_id) queryParams.append('organization_id', filters.organization_id.toString());
    if (filters?.invoice_id) queryParams.append('invoice_id', filters.invoice_id.toString());
    if (filters?.payment_status) queryParams.append('payment_status', filters.payment_status);
    if (filters?.payment_method) queryParams.append('payment_method', filters.payment_method);
    if (filters?.date_from) queryParams.append('date_from', filters.date_from);
    if (filters?.date_to) queryParams.append('date_to', filters.date_to);
    if (filters?.search) queryParams.append('search', filters.search);
    
    return this.request<{ success: boolean; data: Payment[] }>(`/api/payments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
  }

  async getPayment(id: number) {
    return this.request<{ success: boolean; data: Payment }>(`/api/payments/${id}`);
  }

  async createPayment(data: CreatePaymentData) {
    return this.request<{ success: boolean; data: Payment }>('/api/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePayment(id: number, data: Partial<CreatePaymentData>) {
    return this.request<{ success: boolean; data: Payment }>(`/api/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePayment(id: number) {
    return this.request<{ success: boolean }>(`/api/payments/${id}`, {
      method: 'DELETE',
    });
  }

  async getInvoicePayments(invoice_id: number) {
    return this.request<{ success: boolean; data: Payment[] }>(`/api/payments/invoice/${invoice_id}`);
  }

  // Billing Settings
  async getBillingSettings(organization_id?: number) {
    const endpoint = organization_id ? `/api/billing-settings/${organization_id}` : '/api/billing-settings';
    return this.request<{ success: boolean; data: BillingSettings }>(endpoint);
  }

  async updateBillingSettings(organization_id: number, data: Partial<BillingSettings>) {
    return this.request<{ success: boolean; data: BillingSettings }>(`/api/billing-settings/${organization_id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export interface Patient {
  id: number;
  patient_id: string;
  name: string;
  email?: string;
  phone: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  date_of_birth?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  blood_group?: string;
  status: 'Active' | 'Inactive' | 'Critical';
  created_at: string;
}

// ============================================
// EMERGENCY WORKFLOW INTERFACES
// ============================================

export interface EmergencyVitalSign {
  id: number;
  emergency_visit_id: number;
  recorded_at: string;
  recorded_by?: number;
  recorded_by_name?: string;
  bp?: string;
  pulse?: number;
  temp?: number;
  spo2?: number;
  resp?: number;
  pain_score?: number;
  consciousness_level?: 'Alert' | 'Drowsy' | 'Confused' | 'Unconscious';
  notes?: string;
  created_at: string;
}

export interface CreateEmergencyVitalSignData {
  bp?: string;
  pulse?: number;
  temp?: number;
  spo2?: number;
  resp?: number;
  pain_score?: number;
  consciousness_level?: 'Alert' | 'Drowsy' | 'Confused' | 'Unconscious';
  notes?: string;
  recorded_at?: string;
}

export interface EmergencyTreatmentNote {
  id: number;
  emergency_visit_id: number;
  note_type: 'observation' | 'progress' | 'procedure' | 'nursing' | 'doctor';
  note_text: string;
  recorded_by?: number;
  recorded_by_name?: string;
  recorded_by_role?: string;
  recorded_at: string;
  attachments?: string[];
  created_at: string;
}

export interface CreateEmergencyNoteData {
  note_type?: 'observation' | 'progress' | 'procedure' | 'nursing' | 'doctor';
  note_text: string;
  attachments?: string[];
  recorded_at?: string;
}

export interface EmergencyInvestigationOrder {
  id: number;
  emergency_visit_id: number;
  investigation_type: 'lab' | 'radiology' | 'other';
  test_name: string;
  test_code?: string;
  lab_test_id?: number;
  lab_test_name?: string;
  priority: 'normal' | 'urgent' | 'stat';
  ordered_by?: number;
  ordered_by_name?: string;
  ordered_at: string;
  status: 'ordered' | 'in-progress' | 'completed' | 'cancelled';
  result_id?: number;
  result_value?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEmergencyInvestigationData {
  investigation_type?: 'lab' | 'radiology' | 'other';
  test_name: string;
  test_code?: string;
  lab_test_id?: number;
  priority?: 'normal' | 'urgent' | 'stat';
  notes?: string;
}

export interface EmergencyMedication {
  id: number;
  emergency_visit_id: number;
  medication_name: string;
  dosage: string;
  route: 'IV' | 'IM' | 'PO' | 'Sublingual' | 'Topical' | 'Inhalation' | 'Other';
  frequency?: string;
  administered_by?: number;
  administered_by_name?: string;
  administered_at?: string;
  status: 'pending' | 'given' | 'missed' | 'refused';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEmergencyMedicationData {
  medication_name: string;
  dosage: string;
  route?: 'IV' | 'IM' | 'PO' | 'Sublingual' | 'Topical' | 'Inhalation' | 'Other';
  frequency?: string;
  status?: 'pending' | 'given' | 'missed' | 'refused';
  notes?: string;
  administered_at?: string;
}

export interface EmergencyCharge {
  id: number;
  emergency_visit_id: number;
  charge_type: 'consultation' | 'procedure' | 'medication' | 'investigation' | 'bed' | 'other';
  item_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  charged_by?: number;
  charged_by_name?: string;
  charged_at: string;
  notes?: string;
  created_at: string;
}

export interface CreateEmergencyChargeData {
  charge_type: 'consultation' | 'procedure' | 'medication' | 'investigation' | 'bed' | 'other';
  item_name: string;
  quantity?: number;
  unit_price: number;
  notes?: string;
}

export interface EmergencyStatusHistory {
  id: number;
  emergency_visit_id: number;
  from_status?: 'registered' | 'triaged' | 'in-treatment' | 'awaiting-disposition' | 'completed';
  to_status: 'registered' | 'triaged' | 'in-treatment' | 'awaiting-disposition' | 'completed';
  changed_by?: number;
  changed_by_name?: string;
  changed_at: string;
  notes?: string;
}

export interface EmergencyPatientFile {
  id: number;
  emergency_visit_id: number;
  file_name: string;
  file_type?: string;
  file_path: string;
  file_size?: number;
  category: 'Lab Results' | 'Radiology' | 'Forms' | 'Consent' | 'ECG' | 'Medical History' | 'Other';
  description?: string;
  uploaded_by?: number;
  uploaded_by_name?: string;
  uploaded_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEmergencyPatientFileData {
  file_name: string;
  file_type?: string;
  file_path: string;
  file_size?: number;
  category?: 'Lab Results' | 'Radiology' | 'Forms' | 'Consent' | 'ECG' | 'Medical History' | 'Other';
  description?: string;
}

export interface EmergencyIntakeOutput {
  id: number;
  emergency_visit_id: number;
  record_time: string;
  intake_type?: 'IV Fluids' | 'Oral (Water)' | 'Oral (Food)' | 'NG Tube' | 'PEG Tube' | 'TPN' | 'Blood Products' | 'Other';
  intake_amount_ml: number;
  output_type?: 'Urine' | 'Drainage' | 'NG Aspirate' | 'Vomitus' | 'Stool' | 'Blood Loss' | 'Other';
  output_amount_ml: number;
  balance_ml: number;
  recorded_by?: number;
  recorded_by_name?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEmergencyIntakeOutputData {
  record_time?: string;
  intake_type?: 'IV Fluids' | 'Oral (Water)' | 'Oral (Food)' | 'NG Tube' | 'PEG Tube' | 'TPN' | 'Blood Products' | 'Other';
  intake_amount_ml?: number;
  output_type?: 'Urine' | 'Drainage' | 'NG Aspirate' | 'Vomitus' | 'Stool' | 'Blood Loss' | 'Other';
  output_amount_ml?: number;
  notes?: string;
}

export interface EmergencyBloodBankRequest {
  id: number;
  emergency_visit_id: number;
  request_number?: string;
  product_type: 'Packed Red Blood Cells' | 'Fresh Frozen Plasma' | 'Platelets' | 'Cryoprecipitate' | 'Whole Blood' | 'Albumin' | 'Other';
  units: number;
  request_date: string;
  urgency: 'Routine' | 'Urgent' | 'Emergency';
  status: 'Requested' | 'Processing' | 'Ready' | 'Issued' | 'Transfused' | 'Cancelled';
  requested_by?: number;
  requested_by_name?: string;
  issued_at?: string;
  issued_by?: number;
  issued_by_name?: string;
  transfusion_date?: string;
  transfusion_start_time?: string;
  transfusion_end_time?: string;
  reaction_notes?: string;
  cross_match_status?: 'Pending' | 'Compatible' | 'Incompatible' | 'Not Required';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEmergencyBloodBankRequestData {
  product_type: 'Packed Red Blood Cells' | 'Fresh Frozen Plasma' | 'Platelets' | 'Cryoprecipitate' | 'Whole Blood' | 'Albumin' | 'Other';
  units: number;
  request_date?: string;
  urgency?: 'Routine' | 'Urgent' | 'Emergency';
  cross_match_status?: 'Pending' | 'Compatible' | 'Incompatible' | 'Not Required';
  notes?: string;
}

export interface UpdateEmergencyBloodBankRequestData {
  status?: 'Requested' | 'Processing' | 'Ready' | 'Issued' | 'Transfused' | 'Cancelled';
  issued_by?: number;
  transfusion_date?: string;
  transfusion_start_time?: string;
  transfusion_end_time?: string;
  reaction_notes?: string;
  notes?: string;
}

export interface EmergencyHealthPhysical {
  id: number;
  emergency_visit_id: number;
  examination_date: string;
  chief_complaint?: string;
  history_of_present_illness?: string;
  past_medical_history?: string;
  allergies?: string;
  medications?: string;
  social_history?: string;
  family_history?: string;
  review_of_systems?: string;
  physical_examination: string;
  assessment?: string;
  plan?: string;
  provider_id?: number;
  provider_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEmergencyHealthPhysicalData {
  examination_date?: string;
  chief_complaint?: string;
  history_of_present_illness?: string;
  past_medical_history?: string;
  allergies?: string;
  medications?: string;
  social_history?: string;
  family_history?: string;
  review_of_systems?: string;
  physical_examination: string;
  assessment?: string;
  plan?: string;
  provider_id?: number;
}

export interface CreatePatientData {
  name: string;
  email?: string;
  phone: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  date_of_birth?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  blood_group?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

export interface Doctor {
  id: number;
  doctor_id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  experience: number;
  qualification?: string;
  status: 'Available' | 'Busy' | 'Off Duty';
  schedule_start: string;
  schedule_end: string;
  avatar?: string;
  patients?: number;
  rating?: number;
  total_appointments?: number;
  user_id?: number;
  created_at: string;
}

export interface CreateDoctorData {
  name: string;
  specialty: string;
  phone: string;
  email: string;
  experience?: number;
  qualification?: string;
  status?: 'Available' | 'Busy' | 'Off Duty';
  schedule_start?: string;
  schedule_end?: string;
  avatar?: string;
  schedule?: DoctorSchedule[]; // Optional schedule data for create/update
}

export interface DoctorSchedule {
  id?: number;
  doctor_id?: number;
  day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  start_time: string;
  end_time: string;
  is_available: boolean;
  slot_order?: number; // Order of slot within the day (0, 1, 2, etc.)
  slot_name?: string | null; // Optional name (e.g., "Morning", "Afternoon")
  max_appointments_per_slot?: number; // Maximum patients per time slot
  appointment_duration?: number; // Duration in minutes
  break_start?: string | null; // Break start time
  break_end?: string | null; // Break end time
  notes?: string | null; // Additional notes
}

export interface Appointment {
  id: number;
  appointment_number?: string;
  patient_id: number;
  patient_name?: string;
  patient_id_string?: string; // patient_id from patients table (P001, P002, etc.)
  patient_phone?: string;
  patient_email?: string;
  doctor_doctor_id?: number;
  doctor_name?: string;
  specialty?: string;
  doctor_doctor_id_string?: string; // doctor_id from doctors table (D001, D002, etc.)
  appointment_date: string;
  appointment_end_time?: string;
  appointment_type: 'Consultation' | 'Follow-up' | 'Check-up' | 'Emergency' | 'Surgery';
  status: 'Scheduled' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled' | 'No Show';
  reason?: string;
  notes?: string;
  appointment_duration?: number;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateAppointmentData {
  patient_id: number;
  doctor_doctor_id: number;
  appointment_date: string;
  appointment_type?: 'Consultation' | 'Follow-up' | 'Check-up' | 'Emergency' | 'Surgery';
  reason?: string;
  notes?: string;
  appointment_duration?: number;
  status?: 'Scheduled' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled' | 'No Show';
}

export interface AvailableSlot {
  time: string;
  datetime: string;
  available: number;
  total: number;
  current: number;
  status: 'available' | 'limited' | 'full';
  is_available: boolean;
  slot_name?: string | null;
}

export interface AvailableDate {
  date: string; // YYYY-MM-DD
  available_slots_count: number;
  total_slots: number;
  has_availability: boolean;
}

// Prescription interfaces
export interface Medicine {
  id: number;
  medicine_code: string;
  name: string;
  generic_name?: string;
  manufacturer?: string;
  category?: string;
  unit?: string;
  strength?: string;
  description?: string;
  status: 'Active' | 'Inactive' | 'Discontinued';
  requires_prescription?: boolean | number;
  created_at: string;
  updated_at: string;
}

export interface LabTest {
  id: number;
  test_code: string;
  test_name: string;
  test_type?: string;
  category?: string;
  description?: string;
  preparation_instructions?: string;
  normal_range?: string;
  duration?: string;
  status: 'Active' | 'Inactive';
  created_at: string;
  updated_at: string;
}

export interface PrescriptionMedicine {
  id?: number;
  medicine_id?: number;
  medicine_name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  quantity?: number;
  instructions?: string;
  timing?: string;
  status?: 'Pending' | 'Dispensed' | 'Cancelled';
}

export interface PrescriptionLabTest {
  id?: number;
  lab_test_id?: number;
  test_name: string;
  test_type?: string;
  instructions?: string;
  priority?: 'Normal' | 'Urgent' | 'Emergency';
  status?: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
}

export interface RadiologyTest {
  id: number;
  test_code: string;
  test_name: string;
  test_type?: string;
  category?: string;
  description?: string;
  preparation_instructions?: string;
  duration?: string;
  status: 'Active' | 'Inactive';
  created_at: string;
  updated_at: string;
}

export interface PrescriptionRadiologyTest {
  id?: number;
  radiology_test_id?: number;
  test_name: string;
  test_type?: string;
  body_part?: string;
  indication?: string;
  instructions?: string;
  priority?: 'Normal' | 'Urgent' | 'Emergency';
  status?: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
}

export interface Prescription {
  id: number;
  prescription_number: string;
  appointment_id?: number;
  patient_id: number;
  patient_name?: string;
  patient_id_string?: string;
  patient_phone?: string;
  patient_email?: string;
  doctor_id: number;
  doctor_name?: string;
  specialty?: string;
  diagnosis?: string;
  chief_complaint?: string;
  clinical_notes?: string;
  advice?: string;
  follow_up_date?: string;
  status: 'Draft' | 'Active' | 'Completed' | 'Cancelled';
  medicines?: PrescriptionMedicine[];
  lab_tests?: PrescriptionLabTest[];
  appointment_date?: string;
  appointment_number?: string;
  vitals_pulse?: number;
  vitals_temperature?: number;
  vitals_blood_pressure?: string;
  vitals_respiratory_rate?: number;
  vitals_blood_sugar?: string;
  vitals_weight?: string;
  vitals_height?: string;
  vitals_bmi?: string;
  vitals_oxygen_saturation?: number;
  vitals_body_surface_area?: string;
  radiology_tests?: string; // JSON array of selected tests
  radiology_body_part?: string;
  radiology_indication?: string;
  investigation?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePrescriptionData {
  appointment_id?: number;
  patient_id: number;
  doctor_id: number;
  diagnosis?: string;
  chief_complaint?: string;
  clinical_notes?: string;
  advice?: string;
  follow_up_date?: string;
  medicines?: PrescriptionMedicine[];
  lab_tests?: PrescriptionLabTest[];
  status?: 'Draft' | 'Active' | 'Completed' | 'Cancelled';
  vitals_pulse?: number;
  vitals_temperature?: number;
  vitals_blood_pressure?: string;
  vitals_respiratory_rate?: number;
  vitals_blood_sugar?: string;
  vitals_weight?: string;
  vitals_height?: string;
  vitals_bmi?: string;
  vitals_oxygen_saturation?: number;
  vitals_body_surface_area?: string;
  radiology_tests?: PrescriptionRadiologyTest[];
  investigation?: string;
}

// Emergency interfaces
export interface EmergencyVisit {
  id: number;
  erNumber: string;
  uhid?: string;
  name: string;
  age: number;
  gender: string;
  phone?: string;
  email?: string;
  bloodGroup?: string;
  arrivalTime: string;
  arrivalMode: 'walk-in' | 'ambulance' | 'police' | 'referred';
  triageLevel: number;
  chiefComplaint: string;
  vitals: {
    bp: string;
    pulse: number;
    temp: number;
    spo2: number;
    resp: number;
  };
  currentStatus: 'registered' | 'triaged' | 'in-treatment' | 'awaiting-disposition' | 'completed';
  assignedDoctor?: string;
  assignedNurse?: string;
  bedNumber?: string;
  disposition?: 'discharge' | 'admit-ward' | 'admit-private' | 'transfer' | 'absconded' | 'death';
  dispositionDetails?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
  medicationsPrescribed?: string;
  investigations?: string[];
  medications?: string[];
  totalCharges: number;
  waitTime: number;
  createdAt?: string;
}

export interface CreateEmergencyVisitData {
  patient_id: number;
  arrival_time?: string;
  arrival_mode?: 'walk-in' | 'ambulance' | 'police' | 'referred';
  triage_level: 1 | 2 | 3 | 4 | 5;
  chief_complaint: string;
  vitals_bp?: string;
  vitals_pulse?: number;
  vitals_temp?: number;
  vitals_spo2?: number;
  vitals_resp?: number;
  current_status?: 'registered' | 'triaged' | 'in-treatment' | 'awaiting-disposition' | 'completed';
  assigned_doctor_id?: number;
  assigned_nurse_id?: number;
  bed_number?: string;
  investigations?: string[];
  medications?: string[];
  total_charges?: number;
}

export interface EmergencyStats {
  total: number;
  registered: number;
  triaged: number;
  in_treatment: number;
  awaiting_disposition: number;
  completed: number;
  discharged: number;
  admitted_ward: number;
  admitted_private: number;
  transferred: number;
  avg_wait_time: number;
  triage_distribution: {
    [key: number]: number;
  };
}

export interface EmergencyBed {
  id: number;
  bed_number: string;
  bed_type: 'standard' | 'resuscitation' | 'trauma' | 'isolation';
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  current_visit_id?: number;
  location?: string;
  notes?: string;
}

// ============================================
// PHARMACY INTERFACES
// ============================================

export interface PharmacyStock {
  id: number;
  medicine_id: number;
  medicine_name?: string;
  medicine_code?: string;
  generic_name?: string;
  category?: string;
  batch_number: string;
  manufacture_date?: string;
  expiry_date: string;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  cost_price: number;
  selling_price: number;
  location?: string;
  supplier_id?: number;
  supplier_name?: string;
  purchase_order_id?: number;
  stock_receipt_id?: number;
  status: 'Active' | 'Expired' | 'Damaged' | 'Sold Out';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePharmacyStockData {
  medicine_id: number;
  batch_number: string;
  manufacture_date?: string;
  expiry_date: string;
  quantity: number;
  cost_price: number;
  selling_price: number;
  location?: string;
  supplier_id?: number;
  purchase_order_id?: number;
  stock_receipt_id?: number;
  notes?: string;
}

export interface LowStockAlert {
  medicine_id: number;
  medicine_code: string;
  name: string;
  generic_name?: string;
  available_stock: number;
  minimum_stock: number;
  reorder_quantity: number;
  preferred_supplier_id?: number;
  preferred_supplier_name?: string;
}

export interface ExpiringStock {
  stock_id: number;
  medicine_id: number;
  medicine_code: string;
  name: string;
  batch_number: string;
  expiry_date: string;
  quantity: number;
  days_until_expiry: number;
}

export interface Supplier {
  id: number;
  supplier_code: string;
  name: string;
  company_name?: string;
  contact_person?: string;
  email?: string;
  phone: string;
  alternate_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  zip_code?: string;
  tax_id?: string;
  payment_terms?: string;
  credit_limit: number;
  outstanding_balance: number;
  rating?: number;
  status: 'Active' | 'Inactive' | 'Suspended';
  notes?: string;
  performance?: SupplierPerformance;
  created_at: string;
  updated_at: string;
}

export interface CreateSupplierData {
  name: string;
  company_name?: string;
  contact_person?: string;
  email?: string;
  phone: string;
  alternate_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
  tax_id?: string;
  payment_terms?: string;
  credit_limit?: number;
  notes?: string;
}

export interface SupplierPerformance {
  total_orders: number;
  total_purchase_amount: number;
  avg_order_value: number;
  completed_orders: number;
  pending_orders: number;
}

export interface PurchaseOrder {
  id: number;
  po_number: string;
  supplier_id: number;
  supplier_name?: string;
  supplier_code?: string;
  order_date: string;
  expected_delivery_date?: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  shipping_cost: number;
  discount: number;
  total_amount: number;
  status: 'Draft' | 'Pending' | 'Approved' | 'Partially Received' | 'Received' | 'Cancelled';
  approved_by?: number;
  approved_at?: string;
  approved_by_name?: string;
  notes?: string;
  created_by?: number;
  created_by_name?: string;
  items?: PurchaseOrderItem[];
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderItem {
  id: number;
  purchase_order_id: number;
  medicine_id: number;
  medicine_name?: string;
  medicine_code?: string;
  generic_name?: string;
  category?: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  received_quantity: number;
  notes?: string;
}

export interface CreatePurchaseOrderData {
  supplier_id: number;
  order_date?: string;
  expected_delivery_date?: string;
  tax_rate?: number;
  shipping_cost?: number;
  discount?: number;
  notes?: string;
  items: Array<{
    medicine_id: number;
    quantity: number;
    unit_cost: number;
  }>;
}

export interface StockReceipt {
  id: number;
  receipt_number: string;
  purchase_order_id?: number;
  po_number?: string;
  supplier_id: number;
  supplier_name?: string;
  supplier_code?: string;
  receipt_date: string;
  received_by?: number;
  received_by_name?: string;
  notes?: string;
  created_by?: number;
  items?: StockReceiptItem[];
  created_at: string;
  updated_at: string;
}

export interface StockReceiptItem {
  id: number;
  stock_receipt_id: number;
  medicine_id: number;
  medicine_name?: string;
  medicine_code?: string;
  generic_name?: string;
  batch_number: string;
  manufacture_date?: string;
  expiry_date: string;
  quantity: number;
  cost_price: number;
  selling_price: number;
  location?: string;
  purchase_order_item_id?: number;
}

export interface CreateStockReceiptData {
  receipt_date?: string;
  notes?: string;
  items: Array<{
    medicine_id: number;
    batch_number: string;
    manufacture_date?: string;
    expiry_date: string;
    quantity: number;
    cost_price: number;
    selling_price: number;
    location?: string;
    purchase_order_item_id?: number;
  }>;
}

export interface Sale {
  id: number;
  invoice_number: string;
  customer_id?: number;
  patient_id?: number;
  patient_name?: string;
  prescription_id?: number;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  customer_address?: string;
  sale_date: string;
  subtotal: number;
  discount_amount: number;
  discount_percentage: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  payment_method: 'Cash' | 'Card' | 'Insurance' | 'Credit' | 'Wallet';
  amount_received?: number;
  change_amount: number;
  status: 'Completed' | 'Pending' | 'Cancelled' | 'Refunded' | 'Voided';
  payments?: SalePayment[];
  shift_id?: number;
  drawer_id?: number;
  cashier_id?: number;
  cashier_name?: string;
  notes?: string;
  items?: SaleItem[];
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  id: number;
  sale_id: number;
  medicine_id: number;
  stock_id: number;
  medicine_name: string;
  batch_number: string;
  expiry_date?: string;
  quantity: number;
  unit_price: number;
  discount_percentage: number;
  discount_amount: number;
  subtotal: number;
}

export interface SalePayment {
  id: number;
  sale_id: number;
  payment_method: 'Cash' | 'Card' | 'Insurance' | 'Credit' | 'Wallet';
  amount: number;
  reference_number?: string;
  notes?: string;
  created_at: string;
}

export interface CreateSaleData {
  customer_id?: number;
  patient_id?: number;
  prescription_id?: number;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  customer_address?: string;
  customer_city?: string;
  items: Array<{
    medicine_id: number;
    medicine_name: string;
    quantity: number;
    unit_price: number;
    discount_percentage?: number;
  }>;
  discount_percentage?: number;
  tax_rate?: number;
  payment_method: 'Cash' | 'Card' | 'Insurance' | 'Credit' | 'Wallet';
  amount_received?: number;
  payments?: Array<{
    payment_method: 'Cash' | 'Card' | 'Insurance' | 'Credit' | 'Wallet';
    amount: number;
    reference_number?: string;
    notes?: string;
  }>;
  shift_id?: number;
  drawer_id?: number;
  notes?: string;
}

export interface SaleInvoice {
  invoice_number: string;
  sale_date: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  items: SaleItem[];
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  payment_method: string;
  amount_received?: number;
  change_amount: number;
  cashier: string;
}

export interface SalesSummary {
  total_sales: number;
  total_customers: number;
  total_subtotal: number;
  total_discount: number;
  total_tax: number;
  total_revenue: number;
  cash_sales: number;
  card_sales: number;
  insurance_sales: number;
}

export interface TopSellingMedicine {
  medicine_id: number;
  name: string;
  generic_name?: string;
  total_quantity_sold: number;
  total_revenue: number;
}

export interface DailySalesReport {
  sale_day: string;
  transaction_count: number;
  daily_revenue: number;
  daily_subtotal: number;
  daily_discount: number;
  daily_tax: number;
  avg_transaction_value: number;
}

export interface PaymentMethodBreakdown {
  payment_method: string;
  transaction_count: number;
  total_amount: number;
  avg_amount: number;
  percentage: number;
}

export interface CashierPerformance {
  cashier_id: number;
  cashier_name: string;
  sales_count: number;
  total_revenue: number;
  avg_transaction_value: number;
  min_transaction: number;
  max_transaction: number;
}

export interface ShiftSummary {
  shift_id: number;
  shift_number: string;
  start_time: string;
  end_time?: string;
  status: string;
  total_sales?: number;
  total_revenue?: number;
  cash_sales?: number;
  card_sales?: number;
  other_sales?: number;
  opening_cash?: number;
  closing_cash?: number;
  expected_cash?: number;
  actual_cash?: number;
  difference?: number;
  cashier_name?: string;
  drawer_number?: string;
  location?: string;
}

export interface Refund {
  id: number;
  refund_number: string;
  sale_id: number;
  invoice_number?: string;
  sale_date?: string;
  customer_name?: string;
  customer_phone?: string;
  refund_date: string;
  refund_type: 'Full' | 'Partial';
  refund_reason?: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  payment_method: 'Cash' | 'Card' | 'Original';
  status: 'Pending' | 'Completed' | 'Cancelled';
  processed_by?: number;
  processed_by_name?: string;
  notes?: string;
  items?: RefundItem[];
  created_at: string;
  updated_at: string;
}

export interface RefundItem {
  id: number;
  refund_id: number;
  sale_item_id: number;
  medicine_id: number;
  medicine_name?: string;
  batch_number?: string;
  stock_id?: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  return_to_stock: boolean;
}

export interface CreateRefundData {
  sale_id: number;
  refund_reason?: string;
  payment_method?: 'Cash' | 'Card' | 'Original';
  items: Array<{
    sale_item_id: number;
    medicine_id: number;
    quantity: number;
    unit_price: number;
    subtotal: number;
    return_to_stock?: boolean;
  }>;
  notes?: string;
}

export interface ReorderLevel {
  id: number;
  medicine_id: number;
  medicine_name?: string;
  medicine_code?: string;
  generic_name?: string;
  category?: string;
  minimum_stock: number;
  reorder_quantity: number;
  maximum_stock?: number;
  preferred_supplier_id?: number;
  preferred_supplier_name?: string;
  auto_reorder: boolean;
  last_reorder_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateReorderLevelData {
  minimum_stock: number;
  reorder_quantity: number;
  maximum_stock?: number;
  preferred_supplier_id?: number;
  auto_reorder?: boolean;
}

export interface MedicineWithStock extends Medicine {
  available_stock: number;
  in_stock: boolean;
  selling_price: number;
  cost_price: number;
}

export interface StockAdjustment {
  id: number;
  adjustment_number: string;
  medicine_id: number;
  medicine_name?: string;
  medicine_code?: string;
  generic_name?: string;
  stock_id?: number;
  batch_number?: string;
  expiry_date?: string;
  adjustment_type: 'Increase' | 'Decrease' | 'Expiry Write-off' | 'Damage Write-off' | 'Theft' | 'Correction';
  quantity: number;
  reason: string;
  notes?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  requested_by?: number;
  requested_by_name?: string;
  approved_by?: number;
  approved_by_name?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateStockAdjustmentData {
  medicine_id: number;
  stock_id?: number;
  adjustment_type: 'Increase' | 'Decrease' | 'Expiry Write-off' | 'Damage Write-off' | 'Theft' | 'Correction';
  quantity: number;
  reason: string;
  notes?: string;
}

export interface StockMovement {
  id: number;
  medicine_id: number;
  medicine_name?: string;
  medicine_code?: string;
  generic_name?: string;
  stock_id?: number;
  movement_type: string;
  quantity: number;
  stock_before?: number;
  stock_after?: number;
  reference_type?: string;
  reference_id?: number;
  notes?: string;
  created_by?: number;
  created_by_name?: string;
  created_at: string;
}

export interface StockMovementSummary {
  movement_type: string;
  total_in: number;
  total_out: number;
  movement_count: number;
}

export interface Barcode {
  id: number;
  medicine_id: number;
  medicine_name?: string;
  medicine_code?: string;
  barcode: string;
  barcode_type: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBarcodeData {
  medicine_id: number;
  barcode: string;
  barcode_type?: string;
  is_primary?: boolean;
}

export interface GSTRate {
  id: number;
  rate_name: string;
  rate_percentage: number;
  category?: string;
  description?: string;
  is_active: boolean;
  is_default: boolean;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateGSTRateData {
  rate_name: string;
  rate_percentage: number;
  category?: string;
  description?: string;
  is_active?: boolean;
  is_default?: boolean;
}

// ============================================
// USER MANAGEMENT INTERFACES
// ============================================

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
  charges?: number; // The actual charge/price for the procedure
  share_type: 'percentage' | 'rupees';
  share_value: number; // Share percentage or amount
}

export interface UserFormData {
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
  qualifications: string[];
  services: string[];
  timings: TimingEntry[];
  faqs: FAQEntry[];
  share_procedures: ShareProcedure[];
  follow_up_share_types: string[];
  // Financial settings
  consultation_fee?: number;
  share_price?: number;
  share_type?: 'Rupees' | 'Percentage';
  follow_up_charges?: number;
  follow_up_share_price?: number;
  follow_up_share_type?: 'percentage' | 'rupees';
  lab_share_value?: number;
  lab_share_type?: 'percentage' | 'rupees';
  radiology_share_value?: number;
  radiology_share_type?: 'percentage' | 'rupees';
  instant_booking?: boolean;
  visit_charges?: boolean;
  invoice_edit_count?: number;
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

// Setup module types
export interface Floor {
  id: number;
  floor_number: number;
  floor_name?: string;
  building_name?: string;
  description?: string;
  status: 'Active' | 'Inactive' | 'Under Maintenance';
  created_by?: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFloorData {
  floor_number: number;
  floor_name?: string;
  building_name?: string;
  description?: string;
  status?: 'Active' | 'Inactive' | 'Under Maintenance';
}

export interface Room {
  id: number;
  room_number: string;
  room_name?: string;
  floor_id: number;
  floor_number?: number;
  floor_name?: string;
  building_name?: string;
  department_id?: number;
  department_name?: string;
  room_type: 'Consultation' | 'Examination' | 'Procedure' | 'Waiting' | 'Storage' | 'Other';
  capacity: number;
  equipment?: string;
  description?: string;
  status: 'Active' | 'Inactive' | 'Under Maintenance' | 'Reserved';
  created_by?: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRoomData {
  room_number: string;
  room_name?: string;
  floor_id: number;
  department_id?: number;
  room_type?: 'Consultation' | 'Examination' | 'Procedure' | 'Waiting' | 'Storage' | 'Other';
  capacity?: number;
  equipment?: string;
  description?: string;
  status?: 'Active' | 'Inactive' | 'Under Maintenance' | 'Reserved';
}

export interface Reception {
  id: number;
  reception_code: string;
  reception_name: string;
  floor_id: number;
  floor_number?: number;
  floor_name?: string;
  building_name?: string;
  department_id?: number;
  department_name?: string;
  location?: string;
  description?: string;
  status: 'Active' | 'Inactive' | 'Under Maintenance';
  created_by?: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateReceptionData {
  reception_code?: string;
  reception_name: string;
  floor_id: number;
  department_id?: number;
  location?: string;
  description?: string;
  status?: 'Active' | 'Inactive' | 'Under Maintenance';
}

export interface Department {
  id: number;
  department_code: string;
  department_name: string;
  short_name?: string;
  description?: string;
  department_type: 'OPD' | 'Emergency' | 'IPD' | 'Diagnostic' | 'Other';
  status: 'Active' | 'Inactive';
  created_by?: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDepartmentData {
  department_code?: string;
  department_name: string;
  short_name?: string;
  description?: string;
  department_type?: 'OPD' | 'Emergency' | 'IPD' | 'Diagnostic' | 'Other';
  status?: 'Active' | 'Inactive';
}

export interface ReferralHospital {
  id: number;
  hospital_name: string;
  specialty_type: 'Multi-Specialty' | 'Single-Specialty' | 'General' | 'Specialized';
  address?: string;
  email?: string;
  phone?: string;
  associated_doctor?: string;
  specialties?: string[];
  status: 'Active' | 'Inactive';
  created_by?: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateReferralHospitalData {
  hospital_name: string;
  specialty_type?: 'Multi-Specialty' | 'Single-Specialty' | 'General' | 'Specialized';
  address?: string;
  email?: string;
  phone?: string;
  associated_doctor?: string;
  specialties?: string[];
  status?: 'Active' | 'Inactive';
}

// Insurance Organizations Interfaces
export interface InsuranceOrganization {
  id: number;
  name: string;
  type: 'insurance' | 'organization';
  policy_prefix?: string;
  account_prefix?: string;
  contact_person: string;
  phone: string;
  email: string;
  website?: string;
  address?: string;
  credit_allowance: number;
  discount_rate: number;
  status: 'active' | 'inactive';
  contract_date?: string;
  created_by?: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInsuranceOrganizationData {
  name: string;
  type?: 'insurance' | 'organization';
  policy_prefix?: string;
  account_prefix?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  credit_allowance?: number;
  discount_rate?: number;
  status?: 'active' | 'inactive';
  contract_date?: string;
}

export interface InsurancePricingItem {
  id?: number;
  insurance_organization_id: number;
  item_type: 'procedure' | 'laboratory' | 'radiology' | 'pharmacy';
  item_id: number;
  item_name: string;
  price: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PricingItem {
  id: number;
  name: string;
  default_price: number;
}

// Donation Donors Interfaces
export interface DonationDonor {
  id: number;
  donor_id: string;
  name: string;
  type: 'individual' | 'corporate';
  cnic?: string;
  phone: string;
  email: string;
  address?: string;
  city?: string;
  country: string;
  total_donated: number;
  last_donation?: string;
  frequency: 'one-time' | 'monthly' | 'yearly';
  tax_exempt: boolean;
  notes?: string;
  created_by?: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDonationDonorData {
  donor_id?: string;
  name: string;
  type?: 'individual' | 'corporate';
  cnic?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  total_donated?: number;
  last_donation?: string;
  frequency?: 'one-time' | 'monthly' | 'yearly';
  tax_exempt?: boolean;
  notes?: string;
}

export interface DonationPayment {
  id: number;
  donor_id: number;
  amount: number;
  payment_date: string;
  payment_method: 'cash' | 'card' | 'bank-transfer' | 'cheque' | 'online';
  transaction_id?: string;
  cheque_number?: string;
  bank_name?: string;
  purpose?: string;
  receipt_number: string;
  status: 'completed' | 'pending' | 'failed';
  notes?: string;
  processed_by?: number;
  processed_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDonationPaymentData {
  amount: number;
  payment_date: string;
  payment_method?: 'cash' | 'card' | 'bank-transfer' | 'cheque' | 'online';
  transaction_id?: string;
  cheque_number?: string;
  bank_name?: string;
  purpose?: string;
  receipt_number?: string;
  status?: 'completed' | 'pending' | 'failed';
  notes?: string;
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
  [key: string]: string;
}

// ============================================
// ROOM MANAGEMENT SYSTEM INTERFACES
// ============================================

export interface SystemSetting {
  key: string;
  value: any;
  category: string;
  description?: string;
  updated_by?: number;
  updated_at: string;
}

export interface RoomMode {
  mode: 'Fixed' | 'Dynamic';
}

export interface DoctorRoom {
  id: number;
  doctor_id: number;
  doctor_name?: string;
  doctor_doctor_id?: string;
  specialty?: string;
  room_id: number;
  room_number?: string;
  room_name?: string;
  room_type?: string;
  reception_id: number;
  reception_code?: string;
  reception_name?: string;
  floor_id?: number;
  floor_number?: number;
  floor_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateDoctorRoomData {
  doctor_id: number;
  room_id: number;
  reception_id: number;
  is_active?: boolean;
}

export interface DoctorSlotRoom {
  id: number;
  doctor_id: number;
  doctor_name?: string;
  doctor_doctor_id?: string;
  specialty?: string;
  schedule_id: number;
  day_of_week?: string;
  slot_start_time?: string;
  slot_end_time?: string;
  room_id: number;
  room_number?: string;
  room_name?: string;
  room_type?: string;
  assignment_date: string;
  reception_id: number;
  reception_code?: string;
  reception_name?: string;
  floor_id?: number;
  floor_number?: number;
  floor_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateDoctorSlotRoomData {
  doctor_id: number;
  schedule_id: number;
  room_id: number;
  assignment_date: string;
  reception_id: number;
  is_active?: boolean;
}

export interface BulkCreateDoctorSlotRoomData {
  doctor_id: number;
  schedule_id: number;
  room_id: number;
  reception_id: number;
  date_from: string;
  date_to: string;
}

// ============================================
// MESSAGE SETTINGS INTERFACES
// ============================================

export interface MessageTemplate {
  id: number;
  name: string;
  type: 'sms' | 'email' | 'whatsapp';
  trigger_event: string;
  category?: string;
  content: string;
  subject?: string;
  status: 'active' | 'inactive';
  sent_count?: number;
  delivery_rate?: number;
  last_used_at?: string;
  created_by?: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMessageTemplateData {
  name: string;
  type: 'sms' | 'email' | 'whatsapp';
  trigger_event: string;
  category?: string;
  content: string;
  subject?: string;
  is_active?: boolean;
}

export interface MessagePlatform {
  id: number;
  platform: 'sms' | 'email' | 'whatsapp';
  is_enabled: boolean;
  provider_name?: string;
  api_key?: string;
  api_secret?: string;
  api_url?: string;
  sender_id?: string;
  sender_email?: string;
  settings?: Record<string, any>;
  updated_by?: number;
  updated_at: string;
}

export interface MessageRecipient {
  id: number | null;
  user_id: number;
  user_name: string;
  user_type: 'doctor' | 'staff' | 'admin';
  appointment_sms: boolean;
  opd_sms: boolean;
  appointment_email: boolean;
  schedule_sms: boolean;
  schedule_email: boolean;
  courtesy_message: boolean;
  day_end_report: boolean;
}

export interface MessageStatistics {
  sms: {
    active_templates: number;
    sent_today: number;
    sent_period: number;
    delivery_rate: number;
  };
  email: {
    active_templates: number;
    sent_today: number;
    sent_period: number;
    delivery_rate: number;
  };
  whatsapp: {
    active_templates: number;
    sent_today: number;
    sent_period: number;
    delivery_rate: number;
  };
  overall: {
    total_sent: number;
    total_delivered: number;
    delivery_rate: number;
  };
}

export interface Token {
  id: number;
  token_number: string;
  appointment_id: number;
  reception_id: number;
  floor_id: number;
  room_id: number;
  doctor_id: number;
  patient_id: number;
  token_date: string;
  status: 'Waiting' | 'In Progress' | 'Completed' | 'Cancelled' | 'No Show';
  called_at?: string;
  completed_at?: string;
  appointment_date?: string;
  appointment_type?: string;
  appointment_status?: string;
  patient_name?: string;
  patient_id_string?: string;
  doctor_name?: string;
  specialty?: string;
  room_number?: string;
  room_name?: string;
  floor_number?: number;
  floor_name?: string;
  reception_name?: string;
  reception_code?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// IPD MANAGEMENT INTERFACES
// ============================================

export interface IPDWard {
  id: number;
  name: string;
  type: 'General' | 'ICU' | 'NICU' | 'PICU' | 'CCU' | 'HDU' | 'Isolation' | 'Private' | 'Deluxe';
  building?: string;
  floor_id?: number;
  floor_number?: number;
  floor_name?: string;
  building_name?: string;
  total_beds: number;
  incharge_user_id?: number;
  incharge_name?: string;
  incharge_email?: string;
  incharge_phone?: string;
  contact?: string;
  email?: string;
  facilities?: string[];
  description?: string;
  status: 'active' | 'maintenance' | 'closed';
  established_date?: string;
  last_inspection_date?: string;
  occupied_beds?: number;
  available_beds?: number;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface IPDBed {
  id: number;
  ward_id: number;
  ward_name?: string;
  ward_type?: string;
  bed_number: string;
  bed_type: 'General' | 'ICU' | 'Private' | 'Deluxe' | 'Isolation';
  status: 'available' | 'occupied' | 'reserved' | 'maintenance' | 'cleaning';
  current_admission_id?: number;
  daily_rate: number;
  facilities?: string[];
  last_cleaned_at?: string;
  maintenance_notes?: string;
  patient_name?: string;
  patient_age?: number;
  patient_gender?: string;
  ipd_number?: string;
  uhid?: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface IPDRoom {
  id: number;
  room_number: string;
  room_type: 'Private' | 'Deluxe' | 'Suite';
  floor_id?: number;
  floor_number?: number;
  floor_name?: string;
  building_name?: string;
  building?: string;
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  current_admission_id?: number;
  daily_rate: number;
  facilities?: string[];
  amenities?: string[];
  capacity: number;
  description?: string;
  attendant_bed?: boolean;
  remarks?: string;
  patient_name?: string;
  patient_age?: number;
  patient_gender?: string;
  ipd_number?: string;
  uhid?: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface IPDAdmission {
  id: number;
  ipd_number: string;
  patient_id: number;
  patient_name?: string;
  patient_age?: number;
  patient_gender?: string;
  patient_phone?: string;
  patient_address?: string;
  patient_email?: string;
  patient_city?: string;
  patient_state?: string;
  patient_zip_code?: string;
  blood_group?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  uhid?: string;
  admission_date: string;
  admission_time: string;
  admission_type: 'Emergency' | 'Planned' | 'Transfer' | 'Referral';
  department?: string;
  consulting_doctor_id?: number;
  consulting_doctor_name?: string;
  consulting_doctor_specialty?: string;
  consulting_doctor_phone?: string;
  admitted_by_user_id?: number;
  admitted_by_name?: string;
  ward_id?: number;
  ward_name?: string;
  ward_type?: string;
  bed_id?: number;
  bed_number?: string;
  bed_type?: string;
  room_id?: number;
  room_number?: string;
  room_type?: string;
  diagnosis?: string;
  estimated_duration?: number;
  actual_duration?: number;
  status: 'admitted' | 'under-treatment' | 'critical' | 'stable' | 'discharged' | 'absconded';
  insurance_provider?: string;
  insurance_policy_number?: string;
  insurance_coverage_amount?: number;
  insurance_approval_number?: string;
  advance_payment?: number;
  payment_mode?: 'Cash' | 'Card' | 'UPI' | 'Insurance' | 'Cheque';
  discharge_date?: string;
  discharge_time?: string;
  vital_signs?: IPDVitalSign[];
  treatment_orders?: IPDTreatmentOrder[];
  nursing_notes?: IPDNursingNote[];
  billing?: IPDBilling;
  discharge?: IPDDischargeSummary;
  transfers?: IPDTransfer[];
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface IPDVitalSign {
  id: number;
  admission_id: number;
  patient_id: number;
  recorded_date: string;
  recorded_time: string;
  recorded_by_user_id?: number;
  recorded_by_name?: string;
  temperature?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  blood_sugar?: number;
  pain_score?: number;
  consciousness_level: 'Alert' | 'Drowsy' | 'Confused' | 'Unconscious';
  notes?: string;
  created_at: string;
}

export interface IPDTreatmentOrder {
  id: number;
  admission_id: number;
  patient_id: number;
  order_date: string;
  order_time: string;
  ordered_by_doctor_id?: number;
  ordered_by_doctor_name?: string;
  ordered_by_doctor_specialty?: string;
  order_type: 'Medication' | 'Procedure' | 'Lab Test' | 'Imaging' | 'Diet' | 'Physiotherapy' | 'Consultation';
  order_details: string;
  frequency?: string;
  duration?: string;
  priority: 'routine' | 'urgent' | 'stat';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'on-hold';
  start_date?: string;
  end_date?: string;
  administered_by_user_id?: number;
  administered_by_name?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface IPDNursingNote {
  id: number;
  admission_id: number;
  patient_id: number;
  date: string;
  time: string;
  shift: 'Morning' | 'Evening' | 'Night';
  nurse_user_id?: number;
  nurse_name?: string;
  category: 'General' | 'Medication' | 'Vital Signs' | 'Procedure' | 'Incident' | 'Assessment';
  note: string;
  severity?: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface IPDBilling {
  id: number;
  admission_id: number;
  patient_id: number;
  billing_date: string;
  room_charges?: {
    bed_type?: string;
    room_type?: string;
    rate_per_day: number;
    days: number;
    total: number;
  };
  consultation_charges?: Array<{
    doctor: string;
    visits: number;
    rate_per_visit: number;
    total: number;
  }>;
  medication_charges: number;
  lab_charges: number;
  imaging_charges: number;
  procedure_charges?: Array<{
    procedure_name: string;
    date: string;
    amount: number;
  }>;
  other_charges?: Array<{
    description: string;
    amount: number;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  total_amount: number;
  advance_paid: number;
  insurance_covered: number;
  due_amount: number;
  payment_status: 'pending' | 'partial' | 'paid';
  created_by?: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface IPDDischargeSummary {
  id: number;
  admission_id: number;
  patient_id: number;
  discharge_date: string;
  discharge_time: string;
  admitting_diagnosis?: string;
  final_diagnosis: string;
  treatment_given: string;
  procedures_performed?: string[];
  condition_at_discharge: 'Improved' | 'Stable' | 'Critical' | 'Expired' | 'LAMA';
  discharge_advice: string;
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  follow_up_date?: string;
  follow_up_doctor_id?: number;
  follow_up_doctor_name?: string;
  dietary_advice?: string;
  activity_restrictions?: string;
  discharging_doctor_id?: number;
  discharging_doctor_name?: string;
  created_by?: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface IPDTransfer {
  id: number;
  admission_id: number;
  patient_id: number;
  transfer_date: string;
  transfer_time: string;
  from_ward_id?: number;
  from_ward_name?: string;
  from_bed_id?: number;
  from_bed_number?: string;
  from_room_id?: number;
  from_room_number?: string;
  to_ward_id?: number;
  to_ward_name?: string;
  to_bed_id?: number;
  to_bed_number?: string;
  to_room_id?: number;
  to_room_number?: string;
  transfer_reason?: string;
  transferred_by_user_id?: number;
  transferred_by_name?: string;
  notes?: string;
  created_at: string;
}

export interface IPDDashboardStats {
  stats: {
    current_patients: number;
    critical_patients: number;
    today_admissions: number;
    pending_discharges: number;
    total_beds: number;
    available_beds: number;
    total_rooms: number;
    available_rooms: number;
  };
  admission_trend: Array<{
    date: string;
    admissions: number;
  }>;
  discharge_trend: Array<{
    date: string;
    discharges: number;
  }>;
  department_distribution: Array<{
    department: string;
    patient_count: number;
  }>;
  wards: IPDWard[];
}

export interface CreateIPDAdmissionData {
  patient_id: number;
  uhid?: string;
  admission_date: string;
  admission_time?: string;
  admission_type: 'Emergency' | 'Planned' | 'Transfer' | 'Referral';
  department?: string;
  consulting_doctor_id?: number;
  ward_id?: number;
  bed_id?: number;
  room_id?: number;
  diagnosis?: string;
  estimated_duration?: number;
  insurance_provider?: string;
  insurance_policy_number?: string;
  insurance_coverage_amount?: number;
  insurance_approval_number?: string;
  advance_payment?: number;
  payment_mode?: 'Cash' | 'Card' | 'UPI' | 'Insurance' | 'Cheque';
}

export interface CreateIPDVitalSignData {
  recorded_date?: string;
  recorded_time?: string;
  temperature?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  blood_sugar?: number;
  pain_score?: number;
  consciousness_level?: 'Alert' | 'Drowsy' | 'Confused' | 'Unconscious';
  notes?: string;
}

export interface CreateIPDTreatmentOrderData {
  order_date?: string;
  order_time?: string;
  ordered_by_doctor_id?: number;
  order_type: 'Medication' | 'Procedure' | 'Lab Test' | 'Imaging' | 'Diet' | 'Physiotherapy' | 'Consultation';
  order_details: string;
  frequency?: string;
  duration?: string;
  priority?: 'routine' | 'urgent' | 'stat';
  status?: 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'on-hold';
  start_date?: string;
  end_date?: string;
  notes?: string;
}

export interface CreateIPDNursingNoteData {
  date?: string;
  time?: string;
  shift?: 'Morning' | 'Evening' | 'Night';
  category?: 'General' | 'Medication' | 'Vital Signs' | 'Procedure' | 'Incident' | 'Assessment';
  note: string;
  severity?: 'low' | 'medium' | 'high';
}

export interface CreateIPDDischargeData {
  discharge_date?: string;
  discharge_time?: string;
  admitting_diagnosis?: string;
  final_diagnosis: string;
  treatment_given: string;
  procedures_performed?: string[];
  condition_at_discharge: 'Improved' | 'Stable' | 'Critical' | 'Expired' | 'LAMA';
  discharge_advice: string;
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  follow_up_date?: string;
  follow_up_doctor_id?: number;
  dietary_advice?: string;
  activity_restrictions?: string;
  discharging_doctor_id?: number;
}

export interface CreateIPDTransferData {
  transfer_date?: string;
  transfer_time?: string;
  to_ward_id?: number;
  to_bed_id?: number;
  to_room_id?: number;
  transfer_reason?: string;
  notes?: string;
}

export interface RecordIPDPaymentData {
  payment_amount: number;
  payment_mode?: 'Cash' | 'Card' | 'UPI' | 'Insurance' | 'Cheque';
}

// Patient Payment Interfaces
export interface PatientPayment {
  id: number;
  payment_number: string;
  receipt_number?: string;
  patient_id: number;
  patient_name?: string;
  patient_code?: string;
  bill_type: 'ipd' | 'opd' | 'emergency' | 'lab' | 'radiology' | 'advance';
  bill_id?: number;
  payment_type: 'advance' | 'partial' | 'full' | 'refund';
  payment_method: 'cash' | 'card' | 'bank_transfer' | 'cheque';
  amount: number;
  payment_date: string;
  payment_time?: string;
  transaction_id?: string;
  bank_name?: string;
  cheque_number?: string;
  cheque_date?: string;
  receipt_path?: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  notes?: string;
  processed_by?: number;
  processed_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePatientPaymentData {
  patient_id: number;
  bill_type?: 'ipd' | 'opd' | 'emergency' | 'lab' | 'radiology' | 'advance';
  bill_id?: number;
  payment_type?: 'advance' | 'partial' | 'full' | 'refund';
  payment_method: 'cash' | 'card' | 'bank_transfer' | 'cheque';
  amount: number;
  payment_date?: string;
  payment_time?: string;
  transaction_id?: string;
  bank_name?: string;
  cheque_number?: string;
  cheque_date?: string;
  notes?: string;
}

export interface PatientPaymentFilters {
  patient_id?: number;
  bill_type?: 'ipd' | 'opd' | 'emergency' | 'lab' | 'radiology' | 'advance' | 'all';
  bill_id?: number;
  payment_type?: 'advance' | 'partial' | 'full' | 'refund' | 'all';
  payment_status?: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled' | 'all';
  payment_method?: 'cash' | 'card' | 'bank_transfer' | 'cheque' | 'all';
  date_from?: string;
  date_to?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface PaymentReceipt {
  id: number;
  receipt_number: string;
  payment_id: number;
  patient_id: number;
  patient_name?: string;
  patient_code?: string;
  receipt_date: string;
  receipt_path?: string;
  receipt_url?: string;
  template_type?: string;
  generated_by?: number;
  generated_by_name?: string;
  is_emailed?: boolean;
  is_sms_sent?: boolean;
  email_sent_at?: string;
  sms_sent_at?: string;
  created_at: string;
  updated_at: string;
}

// OPD Billing Interfaces
export interface OpdBill {
  id: number;
  bill_number: string;
  patient_id: number;
  patient_name?: string;
  patient_code?: string;
  appointment_id?: number;
  consultation_id?: number;
  bill_date: string;
  consultation_fee: number;
  procedure_fees?: Array<{
    procedure_name: string;
    amount: number;
  }>;
  lab_charges: number;
  radiology_charges: number;
  medication_charges: number;
  other_charges?: Array<{
    description: string;
    amount: number;
  }>;
  subtotal: number;
  discount: number;
  discount_percentage: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  advance_applied: number;
  insurance_covered: number;
  paid_amount: number;
  total_paid?: number;
  due_amount: number;
  payment_status: 'pending' | 'partial' | 'paid' | 'cancelled';
  notes?: string;
  items?: OpdBillItem[];
  payments?: PatientPayment[];
  created_by?: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface OpdBillItem {
  id: number;
  bill_id: number;
  item_type: 'consultation' | 'procedure' | 'lab_test' | 'radiology_test' | 'medication' | 'other';
  item_name: string;
  item_id?: number;
  quantity: number;
  unit_price: number;
  total_amount: number;
  created_at: string;
}

export interface CreateOpdBillData {
  patient_id: number;
  appointment_id?: number;
  consultation_id?: number;
  bill_date?: string;
  consultation_fee?: number;
  procedure_fees?: Array<{
    procedure_name: string;
    amount: number;
  }>;
  lab_charges?: number;
  radiology_charges?: number;
  medication_charges?: number;
  other_charges?: Array<{
    description: string;
    amount: number;
  }>;
  discount?: number;
  discount_percentage?: number;
  tax_rate?: number;
  insurance_covered?: number;
  notes?: string;
  items?: Array<{
    item_type: 'consultation' | 'procedure' | 'lab_test' | 'radiology_test' | 'medication' | 'other';
    item_name: string;
    item_id?: number;
    quantity?: number;
    unit_price: number;
  }>;
}

export interface OpdBillFilters {
  patient_id?: number;
  payment_status?: 'pending' | 'partial' | 'paid' | 'cancelled' | 'all';
  date_from?: string;
  date_to?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface IPDRehabilitationRequest {
  id: number;
  admission_id?: number;
  patient_id: number;
  patient_name?: string;
  patient_age?: number;
  patient_gender?: string;
  ipd_number?: string;
  service_type: string;
  requested_by_doctor_id?: number;
  requested_by_name?: string;
  doctor_name?: string;
  doctor_specialty?: string;
  frequency?: string;
  duration?: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'on-hold';
  start_date?: string;
  end_date?: string;
  next_session_date?: string;
  next_session_time?: string;
  total_sessions?: number;
  completed_sessions?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface IPDRehabilitationStats {
  activePatients: number;
  pendingRequests: number;
  todaysSessions: number;
  completed: number;
}

export interface CreateIPDRehabilitationRequestData {
  admission_id?: number;
  patient_id: number;
  service_type: string;
  requested_by_doctor_id?: number;
  requested_by_name?: string;
  frequency?: string;
  duration?: string;
  status?: 'pending' | 'active' | 'completed' | 'cancelled' | 'on-hold';
  start_date?: string;
  end_date?: string;
  next_session_date?: string;
  next_session_time?: string;
  total_sessions?: number;
  completed_sessions?: number;
  notes?: string;
}

export interface IPDAdmissionRequest {
  id: number;
  request_id: string;
  patient_id: number;
  patient_name?: string;
  patient_age?: number;
  patient_gender?: string;
  patient_phone?: string;
  requested_by_doctor_id: number;
  doctor_name?: string;
  doctor_specialty?: string;
  department: string;
  priority: 'normal' | 'urgent' | 'emergency';
  ward_preference?: string;
  room_preference?: string;
  diagnosis?: string;
  reason?: string;
  estimated_duration?: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approved_by?: number;
  approved_by_name?: string;
  approved_at?: string;
  rejection_reason?: string;
  admission_id?: number;
  requested_at: string;
  created_at: string;
  updated_at: string;
}

export interface IPDAdmissionRequestStats {
  pending: number;
  approvedToday: number;
  rejected: number;
  urgent: number;
}

export interface CreateIPDAdmissionRequestData {
  patient_id: number;
  requested_by_doctor_id: number;
  department: string;
  priority?: 'normal' | 'urgent' | 'emergency';
  ward_preference?: string;
  room_preference?: string;
  diagnosis?: string;
  reason?: string;
  estimated_duration?: number;
}

export interface OperationTheatre {
  id: number;
  ot_number: string;
  ot_name?: string;
  specialty?: string;
  location?: string;
  capacity: number;
  hourly_rate: number;
  minimum_charge_hours: number;
  equipment?: any;
  status: 'active' | 'maintenance' | 'inactive';
  notes?: string;
}

export interface OTSchedule {
  id: number;
  admission_id: number;
  patient_id: number;
  procedure_id?: number;
  ot_number: string;
  scheduled_date: string;
  scheduled_time: string;
  procedure_name: string;
  procedure_type?: string;
  surgeon_user_id?: number;
  surgeon_name?: string;
  assistant_surgeon_user_id?: number;
  assistant_surgeon_name?: string;
  anesthetist_user_id?: number;
  anesthetist_name?: string;
  anesthesia_type?: string;
  estimated_duration_minutes?: number;
  actual_duration_minutes?: number;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled' | 'Postponed';
  start_time?: string;
  end_time?: string;
  complications?: string;
  asa_score?: number;
  notes?: string;
  created_by_user_id?: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  patient_name?: string;
  patient_code?: string;
  patient_phone?: string;
  patient_age?: number;
  patient_gender?: string;
  ipd_number?: string;
  created_by_name?: string;
}

export interface CreateOTScheduleData {
  admission_id: number;
  ot_number: string;
  scheduled_date: string;
  scheduled_time: string;
  procedure_name: string;
  procedure_type?: string;
  surgeon_user_id?: number;
  assistant_surgeon_user_id?: number;
  anesthetist_user_id?: number;
  anesthesia_type?: string;
  estimated_duration_minutes?: number;
  asa_score?: number;
  notes?: string;
}

export interface CreateIPDWardData {
  name: string;
  type: 'General' | 'ICU' | 'NICU' | 'PICU' | 'CCU' | 'HDU' | 'Isolation' | 'Private' | 'Deluxe';
  total_beds: number;
  floor_id?: number;
  building?: string;
  incharge_user_id?: number;
  contact?: string;
  email?: string;
  facilities?: string[];
  description?: string;
  status?: 'active' | 'maintenance' | 'closed';
  established_date?: string;
}

export interface CreateIPDBedData {
  ward_id: number;
  bed_number: string;
  bed_type: 'General' | 'ICU' | 'Private' | 'Deluxe' | 'Isolation';
  daily_rate: number;
  facilities?: string[];
  status?: 'available' | 'occupied' | 'reserved' | 'maintenance' | 'cleaning';
  maintenance_notes?: string;
}

export interface CreateIPDRoomData {
  room_number: string;
  room_type: 'Private' | 'Deluxe' | 'Suite';
  floor_id?: number;
  building?: string;
  daily_rate: number;
  capacity: number;
  facilities?: string[];
  amenities?: string[];
  description?: string;
  status?: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  attendant_bed?: boolean;
  remarks?: string;
}

// Daily Care Orders
export interface CreateIPDDailyCareOrderData {
  order_date?: string;
  order_time?: string;
  order_type: string;
  order_description: string;
  frequency?: string;
  priority?: 'routine' | 'urgent' | 'stat';
  status?: 'active' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  notes?: string;
}

// Medications
export interface CreateIPDMedicationData {
  medication_name: string;
  dosage: string;
  frequency: string;
  route?: string;
  start_date: string;
  end_date?: string;
  duration?: number;
  instructions?: string;
  status?: 'active' | 'completed' | 'discontinued';
}

// Lab Orders
export interface CreateIPDLabOrderData {
  order_date?: string;
  order_time?: string;
  test_name: string;
  test_type?: string;
  priority?: 'routine' | 'urgent' | 'stat';
  status?: 'ordered' | 'collected' | 'completed' | 'cancelled';
  notes?: string;
}

// Radiology Orders
export interface CreateIPDRadiologyOrderData {
  order_date?: string;
  order_time?: string;
  test_name: string;
  test_type?: string;
  body_part?: string;
  priority?: 'routine' | 'urgent' | 'stat';
  status?: 'ordered' | 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

// Doctor Notes
export interface CreateIPDDoctorNoteData {
  note_date?: string;
  note_time?: string;
  note_type?: string;
  note: string;
  assessment?: string;
  plan?: string;
}

// Pharmacist Notes
export interface CreateIPDPharmacistNoteData {
  note_date?: string;
  note_time?: string;
  note_type?: string;
  note: string;
}

// Procedures
export interface CreateIPDProcedureData {
  procedure_name: string;
  procedure_date: string;
  procedure_time?: string;
  procedure_type?: string;
  anesthesia_type?: string;
  procedure_notes?: string;
  complications?: string;
  status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

// Nutrition
export interface CreateIPDNutritionData {
  date: string;
  meal_type?: string;
  diet_type?: string;
  items?: string;
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fats?: number;
  notes?: string;
}

// Intake & Output
export interface CreateIPDIntakeOutputData {
  date: string;
  time?: string;
  intake_type?: string;
  intake_amount?: number;
  output_type?: string;
  output_amount?: number;
  balance?: number;
  notes?: string;
}

// Health & Physical Habit
export interface CreateIPDHealthPhysicalHabitData {
  assessment_date?: string;
  height?: number;
  weight?: number;
  bmi?: number;
  smoking_status?: string;
  alcohol_consumption?: string;
  exercise_habit?: string;
  dietary_restrictions?: string;
  allergies?: string;
  chronic_conditions?: string;
  family_history?: string;
  social_history?: string;
}

// Forms
export interface CreateIPDFormData {
  form_name: string;
  form_type?: string;
  form_data?: any;
  status?: 'draft' | 'completed' | 'archived';
}

// Doctor Recommendations
export interface CreateIPDDoctorRecommendationData {
  recommendation_date?: string;
  recommendation_time?: string;
  recommendation_type?: string;
  recommendation: string;
  priority?: 'routine' | 'urgent' | 'stat';
  status?: 'pending' | 'approved' | 'rejected' | 'completed';
}

// Doctor Consultations
export interface CreateIPDDoctorConsultationData {
  request_date?: string;
  request_time?: string;
  department: string;
  reason: string;
  priority?: 'routine' | 'urgent' | 'stat';
  status?: 'pending' | 'approved' | 'rejected' | 'completed';
}

// Birth Certificates
export interface BirthCertificate {
  id: number;
  certificate_no: string;
  baby_name: string;
  baby_gender: 'Male' | 'Female';
  date_of_birth: string;
  time_of_birth: string;
  weight?: string;
  height?: string;
  head_circumference?: string;
  mother_name: string;
  mother_mrn?: string;
  mother_nic?: string;
  mother_patient_id?: number;
  father_name: string;
  father_cnic?: string;
  delivery_no?: string;
  mode_of_delivery?: string;
  birthmark?: string;
  doctor_id?: number;
  doctor_name?: string;
  phone_number?: string;
  address?: string;
  status: 'Pending' | 'Issued' | 'Verified';
  remarks?: string;
  registration_date: string;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateBirthCertificateData {
  baby_name: string;
  baby_gender: 'Male' | 'Female';
  date_of_birth: string;
  time_of_birth?: string;
  weight?: string;
  height?: string;
  head_circumference?: string;
  mother_name: string;
  mother_mrn?: string;
  mother_nic?: string;
  mother_patient_id?: number;
  father_name: string;
  father_cnic?: string;
  delivery_no?: string;
  mode_of_delivery?: string;
  birthmark?: string;
  doctor_id?: number;
  doctor_name?: string;
  phone_number?: string;
  address?: string;
  status?: 'Pending' | 'Issued' | 'Verified';
  remarks?: string;
  registration_date?: string;
}

// Death Certificates
export interface DeathCertificate {
  id: number;
  certificate_no: string;
  patient_id?: number;
  patient_name: string;
  patient_nic?: string;
  patient_gender: 'Male' | 'Female';
  date_of_birth: string;
  age_years?: number;
  age_months?: number;
  age_days?: number;
  father_name?: string;
  address?: string;
  admission_id?: number;
  date_of_admission?: string;
  guardian_name?: string;
  guardian_nic?: string;
  phone_number?: string;
  date_of_death: string;
  cause_of_death: string;
  doctor_id?: number;
  doctor_name?: string;
  status: 'Pending' | 'Issued' | 'Verified';
  registration_date: string;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateDeathCertificateData {
  patient_id?: number;
  patient_name: string;
  patient_nic?: string;
  patient_gender: 'Male' | 'Female';
  date_of_birth: string;
  age_years?: number;
  age_months?: number;
  age_days?: number;
  father_name?: string;
  address?: string;
  admission_id?: number;
  date_of_admission?: string;
  guardian_name?: string;
  guardian_nic?: string;
  phone_number?: string;
  date_of_death: string;
  cause_of_death: string;
  doctor_id?: number;
  doctor_name?: string;
  status?: 'Pending' | 'Issued' | 'Verified';
  registration_date?: string;
}

// Software Team Contacts
export interface SoftwareTeamContact {
  id: number;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  mobile?: string;
  extension?: string;
  availability: string;
  status: 'available' | 'busy' | 'offline';
  specialization: string[];
  avatar?: string;
  location?: string;
  created_by?: number;
  created_by_name?: string;
  created_at?: string;
  updated_at?: string;
  is_active?: number;
}

export interface CreateSoftwareTeamContactData {
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  mobile?: string;
  extension?: string;
  availability: string;
  status?: 'available' | 'busy' | 'offline';
  specialization?: string[];
  avatar?: string;
  location?: string;
}

// Support Tickets
export interface SupportTicket {
  id: number;
  ticket_number: string;
  practice_id?: string;
  subject: string;
  module: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  contact_number: string;
  assigned_to_user_id?: number;
  assigned_to_name?: string;
  assigned_to_role?: string;
  created_by_user_id: number;
  created_by_name?: string;
  created_by_role?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  closed_at?: string;
  comments?: SupportTicketComment[];
  attachments?: SupportTicketAttachment[];
}

export interface SupportTicketComment {
  id: number;
  ticket_id: number;
  author_user_id: number;
  author_name: string;
  author_role?: string;
  content: string;
  type: 'user' | 'support';
  created_at: string;
  updated_at: string;
}

export interface SupportTicketAttachment {
  id: number;
  ticket_id: number;
  file_name: string;
  file_path: string;
  file_type?: string;
  file_size?: number;
  uploaded_by_user_id: number;
  created_at: string;
}

export interface SupportTicketStats {
  open: number;
  'in-progress': number;
  resolved: number;
  closed: number;
  total: number;
}

export interface CreateSupportTicketData {
  practice_id?: string;
  module: string;
  description: string;
  subject?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  contact_number: string;
}

export interface UpdateSupportTicketData {
  subject?: string;
  module?: string;
  description?: string;
  status?: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  contact_number?: string;
  assigned_to_user_id?: number;
}

// ============================================
// AUDIT LOGS API METHODS
// ============================================

export interface AuditLog {
  id: number;
  user_id?: number;
  user_name?: string;
  user_role?: string;
  action_type: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view' | 'export' | 'settings' | 'error';
  action: string;
  module: string;
  entity_type?: string;
  entity_id?: number;
  details?: string;
  ip_address?: string;
  user_agent?: string;
  request_method?: string;
  request_url?: string;
  status: 'success' | 'failed' | 'warning';
  error_message?: string;
  metadata?: any;
  created_at: string;
}

export interface AuditLogFilters {
  date_from?: string;
  date_to?: string;
  user_id?: number;
  action_type?: 'all' | 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view' | 'export' | 'settings' | 'error';
  module?: string;
  status?: 'success' | 'failed' | 'warning';
  search?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogStatistics {
  total: number;
  creates: number;
  updates: number;
  deletes: number;
  logins: number;
  logouts: number;
  views: number;
  exports: number;
  settings: number;
  errors: number;
  failed: number;
}

export interface AuditLogResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
}

export interface AuditLogUser {
  user_id: number;
  user_name: string;
  user_role: string;
}

export const api = new ApiService();

