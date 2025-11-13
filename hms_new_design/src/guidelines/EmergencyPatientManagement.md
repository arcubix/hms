# Emergency Patient Management - Complete Documentation

## Overview
The Emergency Patient Management system provides comprehensive tracking of all emergency room patients with advanced registration, triage assessment, and real-time status monitoring using the ESI (Emergency Severity Index) system.

---

## Access Path
1. Login as **Admin**, **Doctor**, or **Nurse**
2. Navigate to **Emergency** in the top navigation
3. Click **"Patients"** in the left sidebar
4. View all emergency patients or click **"Register Patient"**

---

## Main Features

### 1. **Complete Patient List View**

#### Table Columns (10 columns):

**1. ER Number**
- Format: ER-2024-XXXXXX
- Auto-generated unique identifier
- Arrival time displayed below
- Example: ER-2024-001842 | 14:23

**2. Patient Info**
- Full name
- Age / Gender
- UHID (if existing patient)
- Example: John Martinez | 45Y / male | UHID-892401

**3. ESI (Emergency Severity Index)**
- 5-level triage system
- Color-coded badges
- ESI 1-5 indicators
- Critical to non-urgent

**4. Chief Complaint**
- Primary reason for visit
- Truncated with tooltip
- Trauma badge if applicable
- Example: "Chest pain with shortness of breath..."

**5. Vitals**
- Blood Pressure (BP: 180/110)
- Heart Rate (HR: 125 bpm)
- Oxygen Saturation (SpO2: 89%)
- Pain Level (Pain: 9/10)

**6. Status**
- Current treatment status
- Color-coded badges
- CODE badge if emergency active
- Real-time updates

**7. Location**
- Current physical location
- ER Bay, Trauma Bay, etc.
- Example: "Resuscitation Room 1"

**8. Wait Time**
- Minutes waiting
- Clock icon
- Red text if > 60 minutes
- Example: "45m"

**9. Assigned Staff**
- Doctor (with stethoscope icon)
- Nurse (with user icon)
- Shows abbreviated names
- Example: "Sarah Mitchell" | "Jennifer Adams"

**10. Actions**
- View details button (eye icon)
- Quick access to patient info

---

### 2. **ESI Triage Level System**

#### **ESI Level 1 - Immediate/Resuscitation** 🔴
- **Color**: Red badge (bg-red-600)
- **Priority**: Life-threatening
- **Wait Time**: 0 minutes
- **Examples**:
  - Cardiac arrest
  - Severe trauma
  - Respiratory failure
  - Unresponsive patient
- **Location**: Resuscitation room
- **Staff**: Multiple physicians + specialized team

#### **ESI Level 2 - Emergent/High Risk** 🟠
- **Color**: Orange badge (bg-orange-500)
- **Priority**: High risk situation
- **Wait Time**: < 10 minutes
- **Examples**:
  - Chest pain
  - Severe abdominal pain
  - Altered mental status
  - Major trauma
- **Location**: Trauma bay or monitored bed
- **Staff**: Physician + nurse immediately

#### **ESI Level 3 - Urgent/Stable** 🟡
- **Color**: Yellow badge (bg-yellow-500)
- **Priority**: Multiple resources needed
- **Wait Time**: 30-60 minutes
- **Examples**:
  - Moderate pain
  - Fever in children
  - Minor trauma
  - Dehydration
- **Location**: ER bay
- **Staff**: Physician when available

#### **ESI Level 4 - Less Urgent** 🟢
- **Color**: Green badge (bg-green-500)
- **Priority**: One resource needed
- **Wait Time**: 1-2 hours
- **Examples**:
  - Minor lacerations
  - Simple sprains
  - UTI symptoms
  - Prescription refills
- **Location**: Fast track
- **Staff**: Physician assistant or NP

#### **ESI Level 5 - Non-Urgent** 🔵
- **Color**: Blue badge (bg-blue-500)
- **Priority**: No resources needed
- **Wait Time**: 2+ hours
- **Examples**:
  - Chronic medication refill
  - Minor cold symptoms
  - Follow-up care
  - Non-emergency concerns
- **Location**: Fast track
- **Staff**: Can be deferred

---

### 3. **Patient Status System**

#### Status Types with Color Coding:

**Critical** (Red)
- Life-threatening condition
- Active emergency code
- Multiple interventions
- Constant monitoring

**In Treatment** (Blue)
- Being actively treated
- Doctor/nurse assigned
- Tests ordered
- Ongoing care

**Waiting** (Yellow)
- Triaged, waiting for care
- In queue
- Vital signs stable
- Prioritized by ESI

**Awaiting Results** (Purple)
- Tests completed
- Waiting for lab/imaging
- Doctor review pending
- Patient stable

**Admitted** (Green)
- Moving to IPD
- Bed assigned
- Admission in progress
- No longer ER responsibility

**Discharged** (Gray)
- Treatment complete
- Released from ER
- Discharge instructions given
- Follow-up scheduled

---

### 4. **Statistics Dashboard (5 Cards)**

**Card 1: Total Patients**
- Blue gradient card
- Users icon
- Current count of all ER patients
- Real-time updates

**Card 2: Critical/Urgent**
- Red gradient card
- Siren icon
- ESI 1-2 patients + critical status
- High priority count

**Card 3: Waiting**
- Yellow gradient card
- Clock icon
- Patients waiting for treatment
- Queue management

**Card 4: In Treatment**
- Green gradient card
- Activity icon
- Actively being treated
- Resource allocation

**Card 5: Avg Wait Time**
- Purple gradient card
- Timer icon
- Average minutes waiting
- Performance metric

---

### 5. **Advanced Filters**

#### Search Bar
- **Search by**:
  - ER Number (ER-2024-XXXXXX)
  - Patient Name
  - UHID
  - Chief Complaint keywords
- Real-time filtering
- Case-insensitive
- Partial matches

#### ESI Level Filter
- **Dropdown Options**:
  - All ESI Levels
  - ESI 1 - Critical
  - ESI 2 - Emergent
  - ESI 3 - Urgent
  - ESI 4 - Less Urgent
  - ESI 5 - Non-Urgent

#### Status Filter
- **Dropdown Options**:
  - All Status
  - Waiting
  - In Treatment
  - Awaiting Results
  - Critical
  - Admitted
  - Discharged

#### Actions
- **Refresh Button**: Reload patient list
- **Export Button**: CSV/Excel export
- **Print Button**: Printable patient list

---

## Register Patient Feature

### Access
Click the red **"Register Patient"** button in the top-right corner

### 4-Tab Registration Dialog

---

#### **Tab 1: Patient Info**

**Patient Type Toggle**
- Switch: New Patient / Existing Patient
- If existing: Search by UHID or name
- Auto-fill demographics if found

**Fields:**

1. **Full Name*** (Required)
   - Text input
   - Patient's complete name

2. **Age*** (Required)
   - Number input
   - Years old

3. **Gender*** (Required)
   - Dropdown: Male / Female / Other

4. **Contact Number*** (Required)
   - Phone input
   - Format: +1-555-0000

5. **Arrival Mode*** (Required)
   - Dropdown:
     - Walk-In (self-arrival)
     - Ambulance (EMS transport)
     - Police (police custody/escort)
     - Referral (from another facility)

6. **Emergency Contact** (Optional)
   - Phone input
   - Family/friend contact

7. **Address** (Optional)
   - Textarea
   - Patient residence

---

#### **Tab 2: Triage**

**Red Alert Box**
> "ESI Triage is critical for proper patient prioritization"

**Fields:**

1. **Chief Complaint*** (Required)
   - Textarea (3 rows)
   - Primary reason for ER visit
   - Example: "Chest pain radiating to left arm"

2. **ESI Triage Level*** (Required)
   - 5 clickable cards (horizontal)
   - Color-coded badges
   - ESI 1 (Red) to ESI 5 (Blue)
   - Descriptions shown
   - Click to select

3. **Trauma Case** (Toggle)
   - Switch: Yes/No
   - Activates trauma protocols
   - Alerts trauma team

4. **Emergency Code** (Toggle)
   - Switch: Yes/No
   - Activates emergency code
   - Immediate response

5. **Presenting Symptoms** (Optional)
   - Textarea (4 rows)
   - Detailed symptoms
   - Clinical observations

---

#### **Tab 3: Vitals**

**All vital signs required for complete triage**

**Fields (Grid Layout):**

1. **Blood Pressure*** (Required)
   - Text input
   - Format: 120/80
   - Systolic/Diastolic

2. **Heart Rate (bpm)*** (Required)
   - Number input
   - Beats per minute
   - Normal: 60-100

3. **Temperature (°F)*** (Required)
   - Number with decimals
   - Default: 98.6
   - Normal: 97.0-99.0

4. **Respiratory Rate*** (Required)
   - Number input
   - Breaths per minute
   - Normal: 12-20

5. **Oxygen Saturation (%)*** (Required)
   - Number input
   - 0-100%
   - Normal: > 95%

6. **Pain Level (0-10)*** (Required)
   - Number input
   - 0 = No pain
   - 10 = Worst pain

7. **Glasgow Coma Scale (GCS)** (Optional)
   - Number input
   - 3-15 scale
   - 15 = Fully conscious
   - < 8 = Severe impairment

8. **Weight (kg)** (Optional)
   - Number input
   - For medication dosing

---

#### **Tab 4: Medical History**

**Important for safe treatment**

**Fields:**

1. **Known Allergies** (Important)
   - Text input
   - Comma-separated list
   - Example: "Penicillin, Latex, Nuts"
   - Red flag for medications

2. **Current Medications** (Important)
   - Textarea (3 rows)
   - All current prescriptions
   - Dosages if known
   - Drug interaction check

3. **Medical History** (Important)
   - Textarea (4 rows)
   - Chronic conditions
   - Previous surgeries
   - Relevant history
   - Example: "Hypertension, Previous MI 2 years ago"

4. **Last Meal** (Important)
   - DateTime input
   - Required for surgery planning
   - NPO status determination

5. **Additional Notes** (Optional)
   - Textarea (3 rows)
   - Any relevant information
   - Special considerations
   - Social history

---

### Registration Actions

**Cancel Button**
- Discard all inputs
- Close dialog
- No patient created

**Register & Start Triage Button** (Red)
- Validates required fields
- Creates ER number
- Assigns to queue
- Success toast
- Auto-assigns location
- Opens patient chart

---

## Patient Details Dialog

### Access
Click the **eye icon** in the Actions column of any patient

### 4-Tab Details View

---

#### **Tab 1: Overview**

**Left Column:**
- ER Number (font-mono)
- Patient Name
- Age / Gender
- UHID (if exists)
- ESI Triage Level (color badge)

**Right Column:**
- Arrival Time (date + time)
- Arrival Mode (badge)
- Current Status (color badge)
- Current Location
- Wait Time (minutes)

**Full Width:**
- Chief Complaint (gray background box)
- Assigned Doctor
- Assigned Nurse

---

#### **Tab 2: Vitals**

**6 Vital Signs Cards (Grid Layout):**

**Card 1: Blood Pressure**
- Large display: "180/110"
- Red heart icon
- Label: "Blood Pressure"

**Card 2: Heart Rate**
- Large display: "125 bpm"
- Red pulse icon
- Label: "Heart Rate"

**Card 3: Temperature**
- Large display: "98.6°F"
- Orange thermometer icon
- Label: "Temperature"

**Card 4: Oxygen Saturation**
- Large display: "89%"
- Blue wind icon
- Label: "Oxygen Saturation"

**Card 5: Respiratory Rate**
- Large display: "28 /min"
- Green activity icon
- Label: "Respiratory Rate"

**Card 6: Pain Level**
- Large display: "9/10"
- Yellow gauge icon
- Label: "Pain Level"

**Visual Format:**
- Clean cards with icons
- Large readable numbers
- Color-coded by type
- Easy to scan

---

#### **Tab 3: Treatment**

**Placeholder:**
- Clipboard icon
- "Treatment timeline not available"
- Future enhancement

**Will Include:**
- Orders placed
- Medications given
- Procedures performed
- Test results
- Provider notes

---

#### **Tab 4: History**

**Displays:**

**Allergies Section** (if any)
- Red-tinted badges
- Each allergy as separate badge
- Example: [Penicillin] [Latex]

**Current Medications Section** (if any)
- Outline badges
- Each medication listed
- Example: [Aspirin] [Metoprolol]

**Medical History Section** (if entered)
- Gray background box
- Full text display
- Previous conditions
- Surgical history

---

### Patient Details Actions

**Close Button**
- Exit dialog
- Return to patient list

**Update Patient Button** (Blue)
- Edit patient information
- Update vitals
- Change status
- Modify treatment

---

## Special Indicators

### CODE Badge
- **Appearance**: Red badge with siren icon
- **Meaning**: Emergency code active
- **Actions**: Immediate response required
- **Location**: Next to status badge

### Trauma Badge
- **Appearance**: Outline badge with warning triangle
- **Meaning**: Trauma patient
- **Actions**: Trauma team notified
- **Location**: Below chief complaint

### Row Highlighting
- **Red background**: Patient with active CODE
- **Normal background**: Standard patients
- **Hover effect**: Gray background on mouseover

---

## Wait Time Management

### Color Coding
- **Normal** (Black): < 60 minutes
- **Warning** (Red): > 60 minutes
- Helps identify delays
- Prioritization visual aid

### Calculation
- From arrival time to current time
- Updates in real-time
- Excludes treatment time
- Only counts waiting period

---

## Arrival Modes

### Walk-In
- Patient arrived independently
- Most common for ESI 3-5
- Standard registration

### Ambulance
- EMS transport
- Pre-hospital care documented
- Often ESI 1-3
- Trauma protocols

### Police
- Law enforcement escort
- May need security
- Special documentation
- Legal considerations

### Referral
- From another facility
- Transfer paperwork
- Medical records included
- Specialist coordination

---

## Workflows

### Workflow 1: Register New Walk-In Patient

1. Click **"Register Patient"** button
2. **Tab 1**: Enter patient demographics
   - Name: Sarah Johnson
   - Age: 35
   - Gender: Female
   - Contact: +1-555-0151
   - Arrival Mode: Walk-In
3. **Tab 2**: Document triage
   - Chief Complaint: "Migraine headache with visual disturbances"
   - ESI Level: Select ESI 3 (Yellow)
   - Trauma: No
   - Code: No
4. **Tab 3**: Record vitals
   - BP: 125/80
   - HR: 78
   - Temp: 98.4
   - RR: 16
   - SpO2: 99%
   - Pain: 6/10
5. **Tab 4**: Medical history
   - Allergies: None
   - Medications: Sumatriptan PRN
   - History: Chronic migraines
6. Click **"Register & Start Triage"**
7. Patient added to list
8. Auto-assigned ER Number: ER-2024-001845
9. Placed in queue

---

### Workflow 2: Critical Ambulance Arrival

1. Ambulance en route notification
2. Click **"Register Patient"**
3. **Quick Entry Mode** (Critical):
   - Name: John Martinez
   - Age: 45
   - Arrival Mode: Ambulance
4. **Immediate Triage**:
   - Chief Complaint: "Chest pain with SOB, radiating to left arm"
   - **ESI Level 1** (Red) - Critical
   - Code: YES (activate CODE)
5. **Vitals** (EMS provided):
   - BP: 180/110
   - HR: 125
   - SpO2: 89%
   - Pain: 9/10
   - GCS: 15
6. **Quick History**:
   - Allergies: Penicillin
   - Medications: Aspirin, Metoprolol
   - History: HTN, Previous MI
7. **Register** → Auto-assigns:
   - Location: Resuscitation Room 1
   - Doctor: On-call cardiologist
   - Nurse: ER charge nurse
   - CODE team activated
   - 0 minute wait time

---

### Workflow 3: View & Update Patient

1. Locate patient in list
   - Use search or filters
   - Find by ER number or name
2. Click **eye icon** in Actions
3. Review **Overview tab**
   - Verify demographics
   - Check ESI level
   - Note assigned staff
4. View **Vitals tab**
   - Monitor trends
   - Compare to norms
   - Identify abnormalities
5. Check **History tab**
   - Review allergies
   - Note medications
   - Consider interactions
6. Click **"Update Patient"**
   - Change status
   - Update location
   - Record new vitals
   - Document interventions

---

## Data Management

### Mock Data Includes:
- 9 diverse emergency patients
- ESI levels 1-5 represented
- Various age groups (8-62 years)
- Different arrival modes
- Multiple status types
- Realistic vitals
- Actual medical conditions

### Auto-Generated:
- ER Numbers (sequential)
- Arrival timestamps
- Wait time calculations
- Location assignments

---

## Export & Reporting

### Export Options
1. **CSV Export**
   - All patient data
   - Filter results included
   - Opens in Excel

2. **Print Layout**
   - Patient list table
   - Statistics included
   - Professional format

### Use Cases
- Shift handoff reports
- Daily census
- Quality metrics
- Compliance documentation

---

## Performance Metrics

### Tracked Automatically:
- Total patient volume
- Critical patient count
- Average wait times
- Treatment times
- Bed utilization
- Staff assignments

### Dashboard Display:
- Real-time statistics
- Color-coded alerts
- Trend indicators
- Capacity warnings

---

## Future Enhancements

1. **Real-time Tracking**
   - WebSocket updates
   - Live vital signs
   - Auto-refresh

2. **Treatment Timeline**
   - Order tracking
   - Medication administration
   - Procedure documentation
   - Results integration

3. **Bed Management**
   - ER bed board
   - Visual layout
   - Drag-and-drop assignment

4. **Analytics Dashboard**
   - Wait time trends
   - ESI distribution
   - Outcome tracking
   - Quality metrics

5. **Mobile Integration**
   - Bedside documentation
   - QR code scanning
   - Photo capture
   - Voice notes

---

This comprehensive Emergency Patient Management system streamlines ER operations with efficient registration, accurate triage, and complete patient tracking!
