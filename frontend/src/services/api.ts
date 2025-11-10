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
  async getPatients() {
    const data = await this.request<{
      success: boolean;
      data: Patient[];
    }>('/api/patients');
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

export const api = new ApiService();

