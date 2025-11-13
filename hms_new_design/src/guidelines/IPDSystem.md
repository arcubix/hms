# IPD (In-Patient Department) Management System

## Overview
The IPD Management System is a comprehensive module designed to manage all aspects of in-patient care from admission to discharge. It integrates with bed management, pharmacy, laboratory, and billing systems to provide complete IPD workflow automation.

## System Architecture

### Main Sections
1. **Dashboard** - Real-time overview of IPD operations
2. **IPD Admissions** - Complete patient admission management
3. **Patient Details** - Comprehensive patient care tracking
4. **Ward Management** - Ward and bed allocation
5. **Discharge Management** - Discharge planning and execution
6. **Reports & Analytics** - IPD performance metrics

---

## Features Breakdown

### 1. IPD Dashboard

#### Key Metrics Cards
- **Current IPD Patients**: Total admitted patients with trend analysis
- **Bed Occupancy**: Real-time occupancy percentage with bed availability
- **Critical Patients**: Count of critical patients requiring monitoring
- **IPD Revenue**: Daily revenue tracking with comparisons

#### Charts & Visualizations
- **Admission & Discharge Trend**: 7-day area chart showing admission/discharge patterns
- **Department-wise Distribution**: Pie chart showing patient distribution across departments
- **Ward-wise Bed Occupancy**: Progress bars showing occupancy rates for each ward

#### Quick Actions
- New Admission button
- Ward Management access
- Analytics & Reports access

### 2. IPD Admissions Management

#### Patient List Features
- **Search & Filter**:
  - Search by patient name, IPD number, UHID
  - Filter by status (Admitted, Critical, Stable, Discharged)
  - Filter by ward
  - Advanced filters option

- **Admission Table Columns**:
  - IPD Number & UHID
  - Patient Details (Name, Age, Gender, Contact)
  - Ward & Bed assignment
  - Consulting Doctor & Department
  - Admission Date & Time
  - Length of Stay (Days)
  - Patient Status with color coding
  - Total Charges & Due Amount
  - Action buttons (View, Edit)

#### New Admission Dialog (4-Tab Interface)

**Tab 1: Patient Information**
- UHID/Patient Search
- Full Name
- Age & Gender
- Contact Number
- Emergency Contact
- Complete Address

**Tab 2: Admission Details**
- Admission Type (Emergency, Planned, Transfer, Referral)
- Department Selection
- Consulting Doctor
- Admitted By
- Ward Selection (shows availability)
- Bed Number Selection
- Primary Diagnosis
- Estimated Duration (days)

**Tab 3: Insurance Details**
- Insurance Coverage Toggle
- Insurance Provider
- Policy Number
- Coverage Amount
- TPA Approval Number

**Tab 4: Billing Setup**
- Advance Payment
- Payment Mode (Cash, Card, UPI, Insurance)
- Minimum advance calculation based on ward type

### 3. Patient Details View (7-Tab System)

#### Overview Tab
- **Patient Information Card**:
  - Complete demographics
  - Contact details
  - Admission information
  - Consulting doctor details
  - Admission type and status
  
- **Current Location Card**:
  - Ward name with icon
  - Bed number
  - Length of stay indicator
  - Transfer patient option

- **Diagnosis Card**:
  - Primary diagnosis display

- **Insurance Details Card** (if applicable):
  - Provider information
  - Policy details
  - Coverage amount
  - Approval number with visual badge

#### Vital Signs Tab
- **Vital Parameters Display**:
  - Temperature (°C)
  - Blood Pressure (Systolic/Diastolic)
  - Heart Rate (bpm)
  - Respiratory Rate (per minute)
  - Oxygen Saturation (%)
  - Blood Sugar (mg/dL)
  - Pain Score (0-10 scale)
  - Consciousness Level

- **Visual Cards** for each vital:
  - Color-coded by parameter type
  - Icon representation
  - Trend indicators

- **Recording Features**:
  - Date & Time stamp
  - Recorded by (nurse/staff name)
  - Clinical notes section
  - Historical view of all recordings

#### Treatment Orders Tab
- **Order Management Table**:
  - Date/Time of order
  - Order Type (Medication, Procedure, Lab Test, Imaging, Diet, Physiotherapy, Consultation)
  - Detailed order description
  - Frequency & Duration
  - Priority (Routine, Urgent, STAT)
  - Status tracking
  - Ordered by doctor
  - Action buttons

- **New Order Dialog**:
  - Order type selection
  - Priority level
  - Detailed instructions
  - Frequency & duration fields
  - Start & end dates
  - Additional notes

#### Nursing Notes Tab
- **Note Display Cards**:
  - Category badges (General, Medication, Vital Signs, Procedure, Incident, Assessment)
  - Shift indicator (Morning, Evening, Night)
  - Severity level (Low, Medium, High)
  - Date & time stamp
  - Detailed note text
  - Nurse name

- **Features**:
  - Add new note button
  - Edit capability
  - Chronological display
  - Filter by category/shift

#### Billing Tab
- **Summary Cards**:
  - Total Charges (Blue card)
  - Paid Amount (Green card)
  - Due Amount (Red card)

- **Detailed Breakdown**:
  - Room charges (with days calculation)
  - Doctor consultation fees
  - Medication charges
  - Laboratory test charges
  - Imaging charges
  - Procedure charges
  - Other miscellaneous charges

- **Actions**:
  - Download bill
  - Print bill
  - Collect payment button

#### Documents Tab
- Upload medical documents
- View uploaded files
- Document categorization
- Download/print options

#### Timeline Tab
- Chronological patient journey
- Admission event
- Vital signs recordings
- Treatment milestones
- Procedure dates
- Key events with icons

### 4. Ward Management

#### Ward Cards Display
Each ward card shows:
- Ward name and floor
- Ward type (General, ICU, NICU, PICU, CCU, HDU, Isolation, Private, Deluxe)
- Bed occupancy progress bar
- Available beds count
- Occupancy percentage
- Status badge (Active, Maintenance, Closed)
- Nurse in-charge details
- Contact number
- Facilities list (badges)
- View Beds and Edit actions

#### Ward Types Supported
1. **General Ward**: Standard patient care
2. **ICU** (Intensive Care Unit): Critical care with ventilators
3. **NICU** (Neonatal ICU): Newborn intensive care
4. **PICU** (Pediatric ICU): Children's intensive care
5. **CCU** (Cardiac Care Unit): Cardiac monitoring
6. **HDU** (High Dependency Unit): Step-down care
7. **Isolation Ward**: Infection control
8. **Private Ward**: Single occupancy
9. **Deluxe Ward**: Premium amenities

### 5. Discharge Management

#### Discharge Dialog (3-Tab Interface)

**Tab 1: Discharge Summary**
- Final Diagnosis (editable from admission diagnosis)
- Treatment Given (summary text)
- Procedures Performed (list)
- Condition at Discharge:
  - Improved
  - Stable
  - Critical
  - LAMA (Left Against Medical Advice)
  - Expired
- Discharge Advice (detailed instructions)
- Follow-up Date
- Follow-up Doctor

**Tab 2: Discharge Medications**
- Add Medication button
- Medication details:
  - Name
  - Dosage
  - Frequency
  - Duration
- Dietary Advice
- Activity Restrictions

**Tab 3: Final Billing**
- Outstanding amount alert
- Complete billing summary
- Insurance coverage display
- Payment collection:
  - Amount input
  - Payment mode selection
- Print/Download options

#### Discharge Actions
- Cancel
- Print Summary
- Complete Discharge (with success notification)

---

## Data Models

### IPDPatient
```typescript
{
  id: string
  ipdNumber: string (unique)
  uhid: string
  patientName: string
  age: number
  gender: 'male' | 'female' | 'other'
  contactNumber: string
  emergencyContact: string
  address: string
  admissionDate: string
  admissionTime: string
  admittedBy: string
  consultingDoctor: string
  department: string
  wardName: string
  bedNumber: string
  diagnosis: string
  admissionType: 'Emergency' | 'Planned' | 'Transfer' | 'Referral'
  status: 'admitted' | 'under-treatment' | 'critical' | 'stable' | 'discharged' | 'absconded'
  insurance?: {
    provider: string
    policyNumber: string
    coverageAmount: number
    approvalNumber?: string
  }
  estimatedDuration: number
  actualDuration?: number
  totalCharges: number
  paidAmount: number
  dueAmount: number
}
```

### Ward
```typescript
{
  id: string
  name: string
  floor: number
  type: WardType
  totalBeds: number
  occupiedBeds: number
  availableBeds: number
  nurseInCharge: string
  contactNumber: string
  facilities: string[]
  status: 'active' | 'maintenance' | 'closed'
}
```

### VitalSigns
```typescript
{
  id: string
  patientId: string
  recordedDate: string
  recordedTime: string
  recordedBy: string
  temperature: number
  bloodPressureSystolic: number
  bloodPressureDiastolic: number
  heartRate: number
  respiratoryRate: number
  oxygenSaturation: number
  bloodSugar?: number
  painScore?: number
  consciousness: 'Alert' | 'Drowsy' | 'Confused' | 'Unconscious'
  notes?: string
}
```

### TreatmentOrder
```typescript
{
  id: string
  patientId: string
  patientName: string
  orderDate: string
  orderTime: string
  orderedBy: string
  orderType: 'Medication' | 'Procedure' | 'Lab Test' | 'Imaging' | 'Diet' | 'Physiotherapy' | 'Consultation'
  orderDetails: string
  frequency?: string
  duration?: string
  priority: 'routine' | 'urgent' | 'stat'
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'on-hold'
  startDate?: string
  endDate?: string
  administeredBy?: string
  notes?: string
}
```

### NursingNote
```typescript
{
  id: string
  patientId: string
  patientName: string
  date: string
  time: string
  shift: 'Morning' | 'Evening' | 'Night'
  nurseName: string
  category: 'General' | 'Medication' | 'Vital Signs' | 'Procedure' | 'Incident' | 'Assessment'
  note: string
  severity?: 'low' | 'medium' | 'high'
}
```

### IPDBilling
```typescript
{
  id: string
  patientId: string
  patientName: string
  ipdNumber: string
  admissionDate: string
  dischargeDate?: string
  lengthOfStay: number
  roomCharges: {
    bedType: string
    ratePerDay: number
    days: number
    total: number
  }
  consultationCharges: Array<{
    doctor: string
    visits: number
    ratePerVisit: number
    total: number
  }>
  medicationCharges: number
  labCharges: number
  imagingCharges: number
  procedureCharges: Array<{
    procedureName: string
    date: string
    amount: number
  }>
  otherCharges: Array<{
    description: string
    amount: number
  }>
  subtotal: number
  discount: number
  tax: number
  totalAmount: number
  advancePaid: number
  insuranceCovered: number
  dueAmount: number
}
```

### DischargeSummary
```typescript
{
  id: string
  patientId: string
  patientName: string
  ipdNumber: string
  admissionDate: string
  dischargeDate: string
  lengthOfStay: number
  admittingDiagnosis: string
  finalDiagnosis: string
  treatmentGiven: string
  proceduresPerformed: string[]
  conditionAtDischarge: 'Improved' | 'Stable' | 'Critical' | 'Expired' | 'LAMA'
  dischargeAdvice: string
  medications: Array<{
    name: string
    dosage: string
    frequency: string
    duration: string
  }>
  followUpDate?: string
  followUpDoctor?: string
  dietaryAdvice?: string
  activityRestrictions?: string
  dischargingDoctor: string
}
```

---

## Color Coding System

### Status Colors
- **Stable/Completed/Available**: Green (`bg-green-100 text-green-800`)
- **Critical/Urgent/STAT**: Red (`bg-red-100 text-red-800`)
- **Under Treatment/In-Progress/Occupied**: Blue (`bg-blue-100 text-blue-800`)
- **Admitted/Pending/Reserved**: Yellow (`bg-yellow-100 text-yellow-800`)
- **Discharged**: Gray (`bg-gray-100 text-gray-800`)

### Ward Type Colors
Ward cards use gradient backgrounds:
- Primary: Blue gradient (`from-blue-50 to-white`)
- Success: Green gradient (`from-green-50 to-white`)
- Warning: Orange gradient (`from-orange-50 to-white`)
- Info: Purple gradient (`from-purple-50 to-white`)

---

## Integration Points

### 1. Bed Management Integration
- Real-time bed availability checking
- Automatic bed status updates on admission/discharge
- Transfer patient between beds
- Ward occupancy tracking

### 2. Pharmacy Integration
- Medication order creation from IPD
- Automatic billing for dispensed medications
- Stock deduction for IPD patients
- Prescription generation for discharge

### 3. Laboratory Integration
- Lab test ordering from IPD
- Results viewing in patient details
- Automatic billing for tests
- Critical value alerts

### 4. Billing Integration
- Real-time charge accumulation
- Automated billing based on:
  - Room charges (daily rate × days)
  - Doctor consultations
  - Medications dispensed
  - Lab tests ordered
  - Procedures performed
  - Other services
- Insurance claim processing
- Payment collection tracking

### 5. Doctor Consultation
- Doctor visit logging
- Consultation charges
- Treatment order creation
- Progress notes

### 6. Emergency Department
- Direct admission from ED
- Patient handover
- Transfer of medical records

---

## Workflow Processes

### Admission Workflow
1. Patient arrives (Emergency/Planned)
2. Registration/UHID verification
3. Doctor consultation
4. Ward & bed assignment
5. Insurance verification (if applicable)
6. Advance payment collection
7. Admission form completion
8. Patient shifted to ward
9. Initial vital signs recording
10. Treatment orders initiation

### Daily Care Workflow
1. Morning vital signs
2. Doctor rounds
3. Treatment order execution
4. Medication administration
5. Lab tests as ordered
6. Nursing notes documentation
7. Evening vital signs
8. Night monitoring
9. Daily charge posting

### Discharge Workflow
1. Doctor discharge order
2. Final examination
3. Discharge summary preparation
4. Medication prescription
5. Final billing calculation
6. Payment settlement
7. Discharge instructions
8. Follow-up appointment
9. Patient handover to family
10. Bed release and cleaning

---

## User Roles & Permissions

### Admin
- Full access to all IPD functions
- Ward creation/management
- Billing oversight
- Analytics access
- System configuration

### Doctor
- Patient admission
- Treatment orders
- Progress notes
- Discharge summary
- View billing

### Nurse
- Vital signs recording
- Nursing notes
- Medication administration
- Sample collection
- View orders

### Billing Staff
- Charge entry
- Payment collection
- Bill generation
- Insurance processing
- Discharge clearance

### Ward Supervisor
- Bed allocation
- Transfer management
- Staff assignment
- Ward operations

---

## Reports Available

1. **Daily Census Report**
   - Admissions today
   - Discharges today
   - Current bed occupancy
   - Department-wise distribution

2. **Ward Occupancy Report**
   - Ward-wise bed status
   - Occupancy trends
   - Available capacity

3. **Financial Reports**
   - IPD revenue
   - Outstanding dues
   - Insurance claims
   - Department-wise revenue

4. **Clinical Reports**
   - Average length of stay
   - Diagnosis-wise admissions
   - Mortality statistics
   - Readmission rates

5. **Performance Reports**
   - Bed turnover rate
   - Average occupancy
   - Staff productivity
   - TAT metrics

---

## Advanced Features

### Auto-Calculations
- Bed charges based on ward type and duration
- Automatic discharge date estimation
- Real-time billing updates
- Insurance coverage calculation

### Alerts & Notifications
- Critical patient alerts
- Bed availability notifications
- Payment due reminders
- Discharge due alerts
- Test result alerts

### AI Features (Future Enhancement)
- Bed allocation optimization
- Length of stay prediction
- Readmission risk assessment
- Resource utilization analytics
- Treatment outcome predictions

---

## Design System

### Typography
- Headers: Default system font
- Body text: Sans-serif (Inter/Roboto)
- No custom font sizes (using globals.css defaults)

### Color Scheme
- Primary: Blue (#2F80ED)
- Success: Green (#27AE60)
- Warning: Orange
- Danger: Red
- Info: Purple
- Neutral: Gray shades

### Components Used
- ShadCN UI components
- Recharts for visualizations
- Lucide React icons
- Custom dialog forms
- Responsive tables
- Progress bars
- Badge components

### Responsive Design
- Mobile-friendly layouts
- Tablet optimization
- Desktop-first approach
- Scrollable sections
- Collapsible sidebars

---

## Performance Considerations

- Lazy loading for large patient lists
- Paginated tables
- Optimized re-renders
- Efficient state management
- Cached data where applicable

---

## Future Enhancements

1. **Mobile App Integration**
   - Patient tracking app for families
   - Staff mobile access
   - Real-time updates

2. **Advanced Analytics**
   - Predictive modeling
   - Resource optimization
   - Cost analysis

3. **Telemedicine**
   - Virtual consultations for IPD
   - Remote monitoring
   - Family video calls

4. **IoT Integration**
   - Automated vital signs monitoring
   - Smart bed management
   - Equipment tracking

5. **AI-Powered Features**
   - Intelligent bed allocation
   - Discharge planning assistance
   - Complication prediction
   - Treatment recommendations

---

## Access Instructions

### For Admin Users:
1. Login to admin portal
2. Click "IPD Management" in the top navigation (Hospital icon)
3. Badge shows current patient count (80)
4. Navigate through sections using left sidebar

### Main Navigation:
- **Dashboard**: Overview and quick actions
- **IPD Patients**: Complete patient list and management
- **Ward Management**: Ward and bed administration
- **Discharge Management**: Discharge processing
- **IPD Reports**: Analytics and reports

This comprehensive IPD Management System provides end-to-end patient care workflow from admission through discharge, with complete integration across hospital departments.
