# Ward Bed View - Complete Bed Management Interface

## Overview
The Ward Bed View is a comprehensive visual interface that shows all beds in a selected ward with their current status, patient assignments, and management capabilities. It's accessible from the Ward Management section in the IPD Management module.

---

## Access Path
1. Login as **Admin**
2. Navigate to **IPD Management**
3. Click **Ward Management** in the left sidebar
4. Click **"View Beds"** button on any ward card

---

## Main Features

### 1. **Visual Bed Display**

#### Two View Modes

**Grid View** (Default)
- Visual card-based layout
- Color-coded by bed status
- Quick status recognition
- Hover for more details
- Click to view full details
- 4-column responsive grid

**List View**
- Comprehensive table format
- All information at a glance
- Sortable columns
- Better for large wards
- Detailed patient information

### 2. **Bed Status System**

#### Status Types with Color Coding

**Available** (Green)
- ✅ Ready for patient assignment
- Shows daily rate
- "Assign Patient" button visible
- Last cleaned timestamp

**Occupied** (Blue)
- 👤 Patient currently admitted
- Shows patient details
- Length of stay indicator
- Patient condition badge
- Equipment status icons

**Reserved** (Yellow)
- 📋 Held for incoming patient
- Shows reservation details
- Reserved for emergency or scheduled admission

**Maintenance** (Orange)
- 🔧 Under repair
- Shows maintenance reason
- Scheduled completion date
- Temporarily unavailable

**Cleaning** (Purple)
- 🧹 Cleaning in progress
- Short-term unavailability
- Typically 30-60 minutes

---

## Interface Components

### Header Section

**Left Side:**
- Back to Wards button
- Ward name and details
- Floor information
- Ward type badge

**Right Side:**
- Export button (CSV/Excel/PDF)
- Print button (bed status report)
- Add Bed button (create new bed)

### Statistics Cards (6 Cards)

1. **Total Beds**
   - Gray card with Bed icon
   - Total bed count badge

2. **Available**
   - Green card with CheckCircle icon
   - Count of available beds

3. **Occupied**
   - Blue card with Users icon
   - Count of occupied beds

4. **Reserved**
   - Yellow card with AlertCircle icon
   - Count of reserved beds

5. **Maintenance**
   - Orange card with Wrench icon
   - Count of beds under maintenance

6. **Cleaning**
   - Purple card with RefreshCw icon
   - Count of beds being cleaned

### Filters & Controls

**Search Bar**
- Search by:
  - Bed number
  - Patient name
  - UHID
  - IPD number

**Status Filter Dropdown**
- All Status (default)
- Available only
- Occupied only
- Reserved only
- Maintenance only
- Cleaning only

**View Mode Toggle**
- Grid view button (default)
- List view button
- Toggle with icons

**Refresh Button**
- Reload bed status
- Real-time updates

---

## Grid View Details

### Occupied Bed Card Shows:

**Header:**
- Bed icon with bed number
- Status badge (color-coded)

**Patient Information:**
- 👤 Patient name
- Age / Gender
- 🏥 Diagnosis (abbreviated)
- 🩺 Consulting doctor name
- 📅 Length of stay (Day X)
- ❤️ Patient condition badge (Stable/Moderate/Critical)

**Equipment Indicators:**
- 💨 O2 - Oxygen available
- 📊 Monitor icon - Patient monitor
- ❤️ Ventilator icon - Ventilator support

**Click Action:**
- Opens detailed bed information dialog

### Available Bed Card Shows:

**Header:**
- Bed icon with bed number
- Green "available" badge

**Center Content:**
- ✅ Large green checkmark
- "Bed Available" text
- Daily rate (e.g., $500/day)
- "Assign Patient" button

**Click Actions:**
- View bed details
- Quick assign patient

### Reserved Bed Card Shows:

**Header:**
- Bed icon with bed number
- Yellow "reserved" badge

**Center Content:**
- ⚠️ Yellow alert icon
- "Reserved" text
- Reservation details or "Reserved for Emergency"

### Maintenance Bed Card Shows:

**Header:**
- Bed icon with bed number
- Orange "maintenance" badge

**Center Content:**
- 🔧 Orange wrench icon
- "Under Maintenance" text
- Maintenance reason (e.g., "AC repair required")

### Cleaning Bed Card Shows:

**Header:**
- Bed icon with bed number
- Purple "cleaning" badge

**Center Content:**
- 🔄 Purple refresh icon
- "Cleaning in Progress" text
- "Please wait..." message

---

## List View Details

### Table Columns:

1. **Bed Number**
   - Bed icon + number
   - Example: GEN-A-01, ICU-02, PVT-12

2. **Status**
   - Color-coded badge
   - One of 5 statuses

3. **Patient Details**
   - Patient name
   - Age / Gender
   - UHID number
   - (or "—" if empty)

4. **Diagnosis**
   - Primary diagnosis
   - Truncated if too long
   - (or "—" if empty)

5. **Doctor**
   - Consulting doctor name
   - (or "—" if empty)

6. **Admitted On**
   - Date
   - Time
   - (or "—" if empty)

7. **LOS** (Length of Stay)
   - Badge showing days
   - Example: "3 days"
   - (or "—" if empty)

8. **Condition**
   - Color-coded badge
   - Stable (green)
   - Moderate (yellow)
   - Critical (red)
   - (or "—" if empty)

9. **Equipment**
   - Dot icons for available equipment
   - Blue dot = Oxygen
   - Green Activity icon = Monitor
   - Red Heart icon = Ventilator

10. **Actions**
    - 👁️ View button (always visible)
    - ➕ Assign button (only for available beds)

---

## Bed Details Dialog (3 Tabs)

### Tab 1: Details

**Bed Information:**
- Bed Number
- Ward / Floor
- Bed Type (badge)
- Daily Rate (large text)
- Current Status (badge)

**Equipment & Facilities:**
- ✅/❌ Oxygen Supply
- ✅/❌ Patient Monitor
- ✅/❌ Ventilator
- Additional facilities (badges):
  - AC
  - TV
  - Attached Bathroom
  - WiFi
  - Refrigerator
  - Nurse Call
  - Emergency Equipment

**Maintenance Info:**
- Last cleaned timestamp
- Maintenance reason (if applicable)
- Scheduled date (if applicable)

### Tab 2: Patient Info

**If Occupied:**
- Patient Name
- Age / Gender
- UHID (monospace font)
- IPD Number (blue, monospace)
- Admission Date & Time
- Length of Stay (badge)
- Consulting Doctor
- Department
- Diagnosis (in gray box)
- Patient Condition (color badge)

**If Not Occupied:**
- User icon (gray)
- "No patient assigned to this bed"

### Tab 3: History

- Clock icon
- "Bed history not available"
- (Placeholder for future feature)

**Dialog Actions:**

**Always Available:**
- Close button

**For Available Beds:**
- 🆕 "Assign Patient" button (blue)

**For Occupied Beds:**
- 🔄 "Transfer Patient" button (orange outline)

**For All Beds:**
- 🔧 "Set Maintenance" button (outline)

---

## Action Dialogs

### 1. Assign Patient Dialog

**Purpose:** Assign a patient to an available bed

**Content:**
- Bed information display
- Search bar (UHID, IPD Number, Patient Name)
- Information alert about admission flow
- "Pending Admissions" dropdown

**Actions:**
- Cancel button
- "Assign to Bed" button (blue)
  - Shows success toast on completion
  - Closes dialog
  - Updates bed status

### 2. Maintenance Dialog

**Purpose:** Mark a bed for maintenance or cleaning

**Form Fields:**

1. **Maintenance Type** (dropdown)
   - Cleaning Required
   - Repair Required
   - Equipment Issue
   - Other

2. **Reason / Description** (textarea)
   - Detailed description
   - Issue details
   - Special instructions

3. **Scheduled Date** (date picker)
   - Expected completion date
   - Calendar selection

**Actions:**
- Cancel button
- "Set Maintenance" button (orange)
  - Shows success toast
  - Updates bed status
  - Marks bed unavailable

---

## Bed Data Structure

```typescript
interface BedDetails {
  id: string
  bedNumber: string              // e.g., "GEN-A-01", "ICU-02"
  wardId: string
  wardName: string
  floor: number
  section?: string                // A, B, C subdivisions
  type: 'General' | 'ICU' | 'Private' | 'Deluxe' | 'Isolation'
  status: 'available' | 'occupied' | 'reserved' | 'maintenance' | 'cleaning'
  dailyRate: number
  
  // Patient Info (if occupied)
  patientId?: string
  patientName?: string
  patientAge?: number
  patientGender?: 'male' | 'female' | 'other'
  uhid?: string
  ipdNumber?: string
  admissionDate?: string
  admissionTime?: string
  lengthOfStay?: number
  diagnosis?: string
  consultingDoctor?: string
  department?: string
  condition?: 'stable' | 'critical' | 'moderate'
  
  // Bed Features
  facilities: string[]            // ['AC', 'TV', 'WiFi', etc.]
  hasOxygen: boolean
  hasMonitor: boolean
  hasVentilator: boolean
  
  // Maintenance Info
  lastCleaned?: string
  maintenanceReason?: string
  maintenanceScheduledDate?: string
}
```

---

## Mock Data Examples

### General Ward Bed (Occupied)
```javascript
{
  bedNumber: 'GEN-A-01',
  wardName: 'General Ward A',
  floor: 2,
  type: 'General',
  status: 'occupied',
  dailyRate: 500,
  patientName: 'James Wilson',
  patientAge: 72,
  diagnosis: 'Pneumonia with Respiratory Distress',
  consultingDoctor: 'Dr. Jennifer Adams',
  lengthOfStay: 4,
  condition: 'moderate',
  facilities: ['AC', 'TV', 'Washroom', 'Nurse Call'],
  hasOxygen: true,
  hasMonitor: true,
  hasVentilator: false
}
```

### ICU Bed (Critical Patient)
```javascript
{
  bedNumber: 'ICU-01',
  wardName: 'ICU - Intensive Care Unit',
  floor: 3,
  type: 'ICU',
  status: 'occupied',
  dailyRate: 3500,
  patientName: 'Robert Johnson',
  patientAge: 58,
  diagnosis: 'Acute Myocardial Infarction',
  consultingDoctor: 'Dr. Michael Stevens',
  lengthOfStay: 3,
  condition: 'critical',
  facilities: ['Ventilator', 'Monitor', 'Oxygen', 'Emergency Equipment'],
  hasOxygen: true,
  hasMonitor: true,
  hasVentilator: true
}
```

### Private Ward Bed (Available)
```javascript
{
  bedNumber: 'PVT-03',
  wardName: 'Private Ward',
  floor: 4,
  type: 'Private',
  status: 'available',
  dailyRate: 1500,
  facilities: ['AC', 'TV', 'Attached Bathroom', 'WiFi', 'Refrigerator'],
  hasOxygen: true,
  hasMonitor: false,
  hasVentilator: false,
  lastCleaned: '2024-11-11 07:00'
}
```

---

## Color System

### Status Colors
- **Available**: Green background (#f0fdf4), green text (#166534), green border
- **Occupied**: Blue background (#eff6ff), blue text (#1e40af), blue border
- **Reserved**: Yellow background (#fefce8), yellow text (#854d0e), yellow border
- **Maintenance**: Orange background (#fff7ed), orange text (#9a3412), orange border
- **Cleaning**: Purple background (#faf5ff), purple text (#6b21a8), purple border

### Condition Colors
- **Stable**: Green (#dcfce7 background, #166534 text)
- **Moderate**: Yellow (#fef9c3 background, #854d0e text)
- **Critical**: Red (#fee2e2 background, #991b1b text)

---

## User Workflows

### Workflow 1: View Ward Beds
1. Navigate to Ward Management
2. Select a ward
3. Click "View Beds" button
4. See all beds in grid/list view
5. Apply filters if needed
6. Click on any bed for details

### Workflow 2: Assign Patient to Bed
1. View ward beds
2. Identify available bed (green)
3. Click "Assign Patient" button
4. Search for patient by UHID/name
5. Or select from pending admissions
6. Click "Assign to Bed"
7. Bed status updates to "Occupied"

### Workflow 3: Transfer Patient
1. View ward beds
2. Find occupied bed
3. Click on bed card
4. Click "Transfer Patient" button
5. Select destination ward & bed
6. Confirm transfer
7. Both beds update status

### Workflow 4: Mark Bed for Maintenance
1. View ward beds
2. Select any bed
3. Click "Set Maintenance"
4. Choose maintenance type
5. Enter reason/description
6. Set scheduled date
7. Submit
8. Bed marked as "Maintenance"

---

## Integration Points

### 1. IPD Admission System
- Bed availability checked during admission
- Auto-assignment option
- Bed reserved upon admission approval
- Status updated to occupied on patient shift

### 2. Patient Transfer
- Source bed freed after transfer
- Destination bed occupied
- Transfer history maintained
- Billing updated for both beds

### 3. Discharge Management
- Bed auto-released on discharge
- Status changes to "Cleaning"
- Timer-based auto-update to "Available"
- Housekeeping notification

### 4. Billing Integration
- Daily room charges calculated
- Bed type determines rate
- Equipment charges added
- Auto-posting to patient bill

### 5. Housekeeping System
- Cleaning requests generated
- Priority based on bed demand
- Completion tracked
- Status auto-updated

---

## Real-time Features

### Auto-refresh
- Bed status updates every 30 seconds
- New assignments reflected immediately
- Discharge updates in real-time
- Occupancy statistics refresh

### Notifications
- Critical bed shortage alerts
- Maintenance completion alerts
- Cleaning completion notifications
- New patient assignment alerts

---

## Export & Reporting

### Export Options
1. **CSV Export**
   - All bed data in spreadsheet
   - Filterable results
   - Patient information included

2. **PDF Export**
   - Printable bed status report
   - Ward layout included
   - Professional formatting

3. **Excel Export**
   - Detailed workbook
   - Multiple sheets by status
   - Charts and summaries

### Print Layout
- Ward name header
- Floor plan (visual)
- Bed status legend
- Patient list
- Equipment status
- Occupancy statistics

---

## Responsive Design

### Desktop (1920px+)
- 4-column grid view
- Full table in list view
- All features visible
- Side-by-side dialogs

### Laptop (1366px)
- 3-column grid view
- Scrollable table
- Compact statistics
- Modal dialogs

### Tablet (768px)
- 2-column grid view
- Horizontal scroll table
- Stacked statistics
- Full-screen dialogs

### Mobile (375px)
- 1-column grid view
- Card-based list view
- Vertical statistics
- Bottom-sheet dialogs

---

## Performance Optimization

- Lazy loading for large wards (>50 beds)
- Virtual scrolling in list view
- Debounced search (300ms)
- Cached bed status
- Optimized re-renders

---

## Future Enhancements

1. **3D Ward Visualization**
   - Interactive floor plan
   - Drag-and-drop bed layout
   - Visual bed arrangement

2. **Bed Heatmap**
   - Usage patterns
   - Peak hours visualization
   - Demand forecasting

3. **QR Code Integration**
   - Scan bed QR for instant access
   - Mobile-first bed management
   - Quick patient assignment

4. **Voice Commands**
   - Voice-activated bed search
   - Hands-free status updates
   - Accessibility feature

5. **IoT Integration**
   - Smart bed sensors
   - Automated occupancy detection
   - Real-time patient monitoring

---

## Access Control

### Admin
- Full access to all features
- Create/edit/delete beds
- Override bed status
- Access all wards

### Ward Supervisor
- View assigned ward only
- Assign patients
- Set maintenance
- Generate reports

### Nurse
- View assigned ward
- Update bed status
- Mark for cleaning
- View patient info

### Doctor
- View-only access
- See patient assignments
- Check bed availability
- No administrative actions

---

This comprehensive Ward Bed View system provides complete visibility and control over hospital bed management, ensuring optimal utilization and efficient patient care.
