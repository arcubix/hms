# Calendar-Based Appointment Scheduling - Implementation Guide

## Overview
This guide outlines the implementation of a calendar-based appointment scheduling system where users can:
1. View a calendar showing doctor's available dates and time slots
2. Click on available slots to schedule appointments
3. Search for existing patients by mobile number OR add new patients directly in a popup

---

## 🎯 User Flow

### Flow Diagram
```
Schedule Appointment Button Click
    ↓
Calendar View Page
    ↓
[Calendar shows doctor's available dates with time slots]
    ↓
User clicks on an available time slot
    ↓
Patient Selection Popup
    ├─ Search by Mobile Number
    │   └─ Select from results
    └─ Add New Patient (Quick Add)
        └─ Fill minimal form → Create → Select
    ↓
Confirm Appointment Details
    ↓
Appointment Created
```

---

## 📋 Component Structure

### 1. Main Scheduling Page
**File**: `frontend/src/components/pages/ScheduleAppointmentPage.tsx`

**Features:**
- Doctor selection dropdown
- Calendar view showing available dates
- Time slots displayed for each date
- Visual indicators for:
  - Available slots (green)
  - Limited availability (yellow)
  - Fully booked (red/gray)
  - No availability (grayed out)

### 2. Calendar Component
**File**: `frontend/src/components/modules/AppointmentCalendar.tsx`

**Features:**
- Month view calendar
- Highlights dates with available slots
- Shows slot count per date
- Navigation (previous/next month)
- Today indicator
- Click handler for date selection

### 3. Time Slot Grid
**File**: `frontend/src/components/modules/TimeSlotGrid.tsx`

**Features:**
- Displays all available time slots for selected date
- Shows capacity (e.g., "2/5 available")
- Color-coded by availability status
- Click handler for slot selection
- Shows slot names if available (Morning, Afternoon, etc.)

### 4. Patient Selection Popup
**File**: `frontend/src/components/modules/PatientSelectionDialog.tsx`

**Features:**
- Two tabs:
  - **Tab 1: Search Patient**
    - Mobile number input
    - Search button
    - Results list (name, mobile, patient ID)
    - Select button
  - **Tab 2: Add New Patient**
    - Quick add form (minimal fields)
    - Name, Mobile, Age, Gender (required)
    - Optional: Email, Date of Birth
    - Create & Select button

### 5. Appointment Confirmation Dialog
**File**: `frontend/src/components/modules/AppointmentConfirmationDialog.tsx`

**Features:**
- Shows appointment summary:
  - Patient name
  - Doctor name
  - Date & time
  - Appointment type
  - Duration
- Reason for visit input
- Notes input
- Confirm button

---

## 🗄️ Database Considerations

### Existing Tables (Already Available)
- `patients` - Patient information
- `doctors` - Doctor information
- `doctor_schedules` - Doctor schedules (multiple slots per day)
- `appointments` - Appointments table

### Required Fields Check
Ensure `appointments` table has:
- ✅ `patient_id` - References patients.id
- ✅ `doctor_doctor_id` - References doctors.id
- ✅ `appointment_date` - DATETIME
- ✅ `appointment_type` - ENUM
- ✅ `status` - ENUM
- ✅ `appointment_duration` - INT
- ✅ `appointment_number` - VARCHAR (auto-generated)

---

## 🔧 Backend API Requirements

### Existing Endpoints (To Verify)
1. **GET /api/appointments/doctor/:id/slots?date=YYYY-MM-DD&duration=30**
   - Returns available slots for a specific date
   - Already implemented ✅

2. **POST /api/appointments**
   - Create appointment
   - Already implemented ✅

3. **GET /api/patients?search=mobile**
   - Search patients by mobile
   - Need to verify if search by mobile works

4. **POST /api/patients**
   - Create new patient
   - Already implemented ✅

### New/Enhanced Endpoints Needed

#### 1. Get Available Dates for Doctor
**Endpoint**: `GET /api/appointments/doctor/:id/available-dates?month=YYYY-MM`

**Purpose**: Get all dates in a month where doctor has available slots

**Response**:
```json
{
  "success": true,
  "data": {
    "month": "2024-01",
    "available_dates": [
      {
        "date": "2024-01-15",
        "available_slots_count": 12,
        "total_slots": 20,
        "has_availability": true
      },
      {
        "date": "2024-01-16",
        "available_slots_count": 0,
        "total_slots": 8,
        "has_availability": false
      }
    ]
  }
}
```

**Implementation Notes:**
- Loop through all days in the month
- For each day, check if doctor has schedule slots
- Count available slots (considering capacity and existing appointments)
- Return dates with availability info

#### 2. Search Patients by Mobile (ENHANCEMENT NEEDED)
**Endpoint**: `GET /api/patients?phone=1234567890` or `GET /api/patients?search=1234567890`

**Purpose**: Search patients by phone number (exact or partial match)

**Current Status**: ⚠️ Not implemented - needs enhancement

**Required Changes:**
- Update `Patients.php` controller to accept `phone` or `search` query parameter
- Update `Patient_model->get_all()` to support phone search filter
- Support partial matching (LIKE query)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "patient_id": "P001",
      "name": "John Doe",
      "phone": "1234567890",
      "email": "john@example.com",
      "age": 35,
      "gender": "Male"
    }
  ]
}
```

---

## 🎨 Frontend Implementation Details

### 1. ScheduleAppointmentPage.tsx Structure

```typescript
interface ScheduleAppointmentPageProps {
  onBack: () => void;
  onSuccess?: () => void;
}

State:
- selectedDoctor: Doctor | null
- selectedDate: string (YYYY-MM-DD)
- selectedSlot: AvailableSlot | null
- currentMonth: Date
- availableDates: AvailableDate[]
- slots: AvailableSlot[]
- showPatientDialog: boolean
- showConfirmationDialog: boolean
```

**Layout:**
```
┌─────────────────────────────────────────┐
│ [Back] Schedule Appointment             │
├─────────────────────────────────────────┤
│ Doctor: [Dropdown]                      │
├─────────────────────────────────────────┤
│ ┌───────────┐  ┌─────────────────────┐ │
│ │ Calendar  │  │  Time Slots Grid    │ │
│ │           │  │                     │ │
│ │ [Month]   │  │  09:00 AM [2/3]     │ │
│ │           │  │  10:00 AM [3/3]     │ │
│ │ [Dates]   │  │  11:00 AM [FULL]    │ │
│ │           │  │  02:00 PM [1/2]     │ │
│ └───────────┘  └─────────────────────┘ │
└─────────────────────────────────────────┘
```

### 2. AppointmentCalendar.tsx

**Features:**
- Month navigation (prev/next)
- Highlight today
- Highlight dates with availability
- Show slot count badge on dates
- Disable dates with no availability
- Click handler passes selected date

**Visual Indicators:**
- **Green dot**: Has available slots
- **Yellow dot**: Limited availability
- **Red dot**: Fully booked
- **No dot**: No schedule/not available

### 3. TimeSlotGrid.tsx

**Features:**
- Receives: `slots: AvailableSlot[]`, `selectedDate: string`
- Grid layout (responsive)
- Each slot shows:
  - Time (e.g., "09:00 AM")
  - Slot name if available (e.g., "Morning")
  - Capacity (e.g., "2/3 available" or "FULL")
  - Color-coded background
- Click handler passes selected slot

### 4. PatientSelectionDialog.tsx

**Structure:**
```
┌─────────────────────────────────────┐
│ Patient Selection          [X]      │
├─────────────────────────────────────┤
│ [Search] [Add New]                  │
├─────────────────────────────────────┤
│                                     │
│ Tab Content:                        │
│                                     │
│ Search Tab:                         │
│   Mobile: [________] [Search]       │
│   Results:                          │
│   - John Doe (1234567890) [Select]  │
│                                     │
│ Add New Tab:                        │
│   Name: [________]                  │
│   Mobile: [________]                │
│   Age: [__] Gender: [M/F]           │
│   [Create & Select]                 │
│                                     │
└─────────────────────────────────────┘
```

**State:**
- activeTab: 'search' | 'add'
- searchQuery: string
- searchResults: Patient[]
- newPatientForm: CreatePatientData
- loading: boolean

### 5. AppointmentConfirmationDialog.tsx

**Structure:**
```
┌─────────────────────────────────────┐
│ Confirm Appointment        [X]      │
├─────────────────────────────────────┤
│ Patient: John Doe                   │
│ Doctor: Dr. Smith - Cardiology       │
│ Date: Monday, Jan 15, 2024          │
│ Time: 09:00 AM - 09:30 AM           │
│                                     │
│ Type: [Consultation ▼]             │
│ Reason: [________________]          │
│ Notes: [________________]           │
│                                     │
│ [Cancel] [Confirm Appointment]     │
└─────────────────────────────────────┘
```

---

## 🔄 Data Flow

### Step 1: Load Available Dates
```
User selects doctor
    ↓
GET /api/appointments/doctor/:id/available-dates?month=2024-01
    ↓
Calendar highlights available dates
```

### Step 2: Load Time Slots
```
User clicks on a date
    ↓
GET /api/appointments/doctor/:id/slots?date=2024-01-15
    ↓
TimeSlotGrid displays available slots
```

### Step 3: Select Slot
```
User clicks on a time slot
    ↓
Open PatientSelectionDialog
    ↓
User searches or adds patient
    ↓
Patient selected
    ↓
Open AppointmentConfirmationDialog
```

### Step 4: Confirm Appointment
```
User fills reason/notes
    ↓
POST /api/appointments
    ↓
Appointment created
    ↓
Close dialogs, show success, refresh list
```

---

## 📐 UI/UX Design Considerations

### Calendar View
- **Month View**: Standard calendar grid
- **Date Indicators**:
  - Green circle = Available slots
  - Yellow circle = Limited slots
  - Red circle = Fully booked
  - Gray = No schedule
- **Hover Effects**: Show slot count on hover
- **Today Highlight**: Blue border

### Time Slot Grid
- **Layout**: Responsive grid (2-4 columns)
- **Slot Card Design**:
  ```
  ┌──────────────┐
  │  09:00 AM    │
  │  Morning     │
  │  2/3 avail   │
  └──────────────┘
  ```
- **Colors**:
  - Green: Fully available
  - Yellow: Limited (1-2 slots left)
  - Red/Gray: Full
  - Disabled: Past dates/times

### Patient Selection Dialog
- **Tabs**: Clear visual separation
- **Search**: Real-time search as user types (debounced)
- **Results**: Clean list with patient info
- **Add New**: Minimal form, only required fields
- **Loading States**: Show spinners during API calls

### Responsive Design
- **Desktop**: Side-by-side calendar and slots
- **Tablet**: Stacked layout
- **Mobile**: Full-width, calendar first, then slots

---

## 🛠️ Implementation Steps

### Phase 1: Backend Enhancements
1. ✅ Verify existing endpoints work
2. ⚠️ Create `get_available_dates()` method in Appointment_model
3. ⚠️ Add endpoint `GET /api/appointments/doctor/:id/available-dates`
4. ⚠️ Enhance patient search to support phone number search

### Phase 2: Calendar Component
1. Create `AppointmentCalendar.tsx`
2. Implement month navigation
3. Add date highlighting logic
4. Add click handlers

### Phase 3: Time Slot Grid
1. Create `TimeSlotGrid.tsx`
2. Implement slot display
3. Add capacity indicators
4. Add click handlers

### Phase 4: Patient Selection Dialog
1. Create `PatientSelectionDialog.tsx`
2. Implement search tab
3. Implement add new tab
4. Add patient creation API call
5. Handle patient selection

### Phase 5: Main Scheduling Page
1. Create `ScheduleAppointmentPage.tsx`
2. Integrate calendar and slot grid
3. Integrate patient dialog
4. Add appointment confirmation
5. Handle appointment creation

### Phase 6: Integration
1. Update AdminDashboard routing
2. Connect to AppointmentList
3. Test full flow

---

## 📝 API Method Signatures

### Backend (PHP)

```php
// Appointment_model.php
public function get_available_dates($doctor_id, $month) {
    // Returns array of dates with availability info
    // Format: YYYY-MM
}

// Appointments.php controller
public function get_available_dates($doctor_id = null) {
    // GET /api/appointments/doctor/:id/available-dates?month=2024-01
}
```

### Frontend (TypeScript)

```typescript
// api.ts
async getDoctorAvailableDates(doctorId: string, month: string): Promise<AvailableDate[]>

interface AvailableDate {
  date: string; // YYYY-MM-DD
  available_slots_count: number;
  total_slots: number;
  has_availability: boolean;
}
```

---

## 🎯 Key Features

### 1. Calendar View
- ✅ Month navigation
- ✅ Visual availability indicators
- ✅ Click to select date
- ✅ Today highlighting
- ✅ Disable past dates
- ✅ Show slot counts

### 2. Time Slot Selection
- ✅ Display all slots for selected date
- ✅ Show capacity (available/total)
- ✅ Color-coded availability
- ✅ Slot names (Morning, Afternoon, etc.)
- ✅ Click to select

### 3. Patient Selection
- ✅ Search by mobile number
- ✅ Quick add new patient
- ✅ Minimal form (only required fields)
- ✅ Auto-select after creation
- ✅ Validation

### 4. Appointment Confirmation
- ✅ Show summary
- ✅ Select appointment type
- ✅ Add reason/notes
- ✅ Confirm creation

---

## 🧪 Testing Scenarios

### Scenario 1: Happy Path
1. Select doctor
2. Calendar shows available dates
3. Click on date with availability
4. Time slots appear
5. Click on available slot
6. Search patient by mobile
7. Select patient
8. Confirm appointment
9. ✅ Appointment created

### Scenario 2: Add New Patient
1. Select doctor → date → slot
2. Click "Add New" tab
3. Fill minimal form
4. Create patient
5. Patient auto-selected
6. Confirm appointment
7. ✅ Appointment created with new patient

### Scenario 3: No Availability
1. Select doctor
2. Calendar shows no available dates
3. Message: "Doctor has no available slots this month"
4. Suggest different month or doctor

### Scenario 4: Slot Becomes Full
1. User selects slot
2. Another user books it
3. On confirmation, show error
4. Refresh slots
5. Show updated availability

---

## 🚀 Quick Start Implementation

### Step 1: Backend - Available Dates Endpoint
```php
// In Appointment_model.php
public function get_available_dates($doctor_id, $month) {
    // Get start and end of month
    // Loop through each day
    // Check if doctor has schedule for that day
    // Count available slots
    // Return array
}
```

### Step 2: Frontend - Calendar Component
```typescript
// AppointmentCalendar.tsx
- Use a calendar library (react-calendar or custom)
- Highlight dates from availableDates
- Handle date clicks
```

### Step 3: Frontend - Patient Dialog
```typescript
// PatientSelectionDialog.tsx
- Two tabs (Search/Add)
- Search: Input + API call
- Add: Form + API call
- Return selected patient
```

### Step 4: Main Page Integration
```typescript
// ScheduleAppointmentPage.tsx
- Doctor selector
- Calendar component
- Time slot grid
- Patient dialog
- Confirmation dialog
- Appointment creation
```

---

## 📦 Dependencies Needed

### Frontend
- **Calendar Library** (Optional):
  - `react-calendar` - Simple calendar component
  - OR custom implementation using date-fns

- **Date Utilities**:
  - `date-fns` - Date manipulation (already likely available)

### Backend
- No new dependencies needed
- Use existing CodeIgniter date functions

---

## 🎨 Visual Mockup

### Desktop Layout
```
┌─────────────────────────────────────────────────────────┐
│ ← Back    Schedule Appointment                          │
├─────────────────────────────────────────────────────────┤
│ Doctor: [Dr. Smith - Cardiology ▼]                       │
├──────────────┬──────────────────────────────────────────┤
│              │  Selected Date: Monday, Jan 15, 2024     │
│   Calendar   │                                          │
│              │  Available Time Slots:                    │
│  [Month]     │  ┌──────┐ ┌──────┐ ┌──────┐            │
│              │  │09:00 │ │10:00 │ │11:00 │            │
│  S  M  T  W  │  │Morning│ │Morning│ │[FULL]│            │
│  1  2  3  4  │  │ 2/3  │ │ 3/3  │ │  0/3 │            │
│  5  6  7  8  │  └──────┘ └──────┘ └──────┘            │
│  9 10 11 12  │  ┌──────┐ ┌──────┐                      │
│ 13 14[15]16  │  │14:00 │ │15:00 │                      │
│ 17 18 19 20  │  │Aftern│ │Aftern│                      │
│ 21 22 23 24  │  │ 1/2  │ │ 2/2  │                      │
│ 25 26 27 28  │  └──────┘ └──────┘                      │
│ 29 30 31     │                                          │
│              │  [Click a slot to continue]             │
└──────────────┴──────────────────────────────────────────┘
```

### Mobile Layout
```
┌─────────────────────┐
│ ← Schedule Appt     │
├─────────────────────┤
│ Doctor: [Select ▼]  │
├─────────────────────┤
│   Calendar          │
│   [Month View]      │
├─────────────────────┤
│ Selected: Jan 15    │
│                     │
│ Time Slots:         │
│ [09:00 AM] [2/3]    │
│ [10:00 AM] [3/3]    │
│ [11:00 AM] [FULL]   │
│ [02:00 PM] [1/2]    │
└─────────────────────┘
```

---

## ✅ Success Criteria

1. ✅ Calendar shows doctor's available dates
2. ✅ Time slots display correctly for selected date
3. ✅ Can search patient by mobile number
4. ✅ Can add new patient in popup
5. ✅ Appointment created successfully
6. ✅ Calendar updates after appointment creation
7. ✅ Handles edge cases (no availability, slot full, etc.)

---

## 🔄 State Management Flow

```
ScheduleAppointmentPage State:
├─ selectedDoctor: Doctor | null
├─ currentMonth: Date
├─ availableDates: AvailableDate[]
├─ selectedDate: string | null
├─ slots: AvailableSlot[]
├─ selectedSlot: AvailableSlot | null
├─ showPatientDialog: boolean
├─ selectedPatient: Patient | null
├─ showConfirmationDialog: boolean
└─ appointmentData: CreateAppointmentData
```

**State Updates:**
1. Doctor selected → Load available dates
2. Date selected → Load time slots
3. Slot selected → Open patient dialog
4. Patient selected → Open confirmation dialog
5. Appointment confirmed → Create appointment → Close dialogs → Refresh

---

## 📋 Component Props & Interfaces

### ScheduleAppointmentPage
```typescript
interface ScheduleAppointmentPageProps {
  onBack: () => void;
  onSuccess?: () => void;
}
```

### AppointmentCalendar
```typescript
interface AppointmentCalendarProps {
  currentMonth: Date;
  availableDates: AvailableDate[];
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  onMonthChange: (month: Date) => void;
}
```

### TimeSlotGrid
```typescript
interface TimeSlotGridProps {
  slots: AvailableSlot[];
  selectedSlot: string | null;
  onSlotSelect: (slot: AvailableSlot) => void;
  disabled?: boolean;
}
```

### PatientSelectionDialog
```typescript
interface PatientSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPatientSelect: (patient: Patient) => void;
}
```

### AppointmentConfirmationDialog
```typescript
interface AppointmentConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
  doctor: Doctor;
  slot: AvailableSlot;
  date: string;
  onConfirm: (data: CreateAppointmentData) => void;
}
```

---

## 🎯 Next Steps

1. **Review this guide** - Ensure all requirements are covered
2. **Backend**: Implement `get_available_dates` endpoint
3. **Frontend**: Create calendar component
4. **Frontend**: Create time slot grid
5. **Frontend**: Create patient selection dialog
6. **Frontend**: Create main scheduling page
7. **Integration**: Connect to AdminDashboard
8. **Testing**: Test all scenarios

---

**Status**: 📋 Implementation Guide Complete  
**Ready for**: Implementation  
**Estimated Time**: 4-6 hours for full implementation

