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

  async getMedicine(id: string) {
    const data = await this.request<{
      success: boolean;
      data: Medicine;
    }>(`/api/medicines/${id}`);
    return data.data;
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

export interface CreateIPDAdmissionData {
  admission_type: 'ward' | 'private';
  ward_id?: number;
  bed_id?: number;
  notes?: string;
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

export const api = new ApiService();

