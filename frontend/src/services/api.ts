// Try without index.php first, fallback to with index.php if needed
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/hms';
const API_URL_WITH_INDEX = import.meta.env.VITE_API_URL || 'http://localhost/hms/index.php';

class ApiService {
  private token: string | null = null;

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
          const text = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
        }
        return {} as T;
      }

      const data = await response.json();

      if (!response.ok) {
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
    
    const data = await this.request<{
      success: boolean;
      data: AvailableSlot[];
    }>(`/api/appointments/doctor/${doctorId}/slots?${params.toString()}`);
    return data.data || [];
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

export const api = new ApiService();

