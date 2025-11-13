# Emergency Department Management - Complete Workflow System

## ✅ Complete Emergency Patient Journey

### **Patient Flow:**
```
1. Patient Arrives → 2. Registration → 3. Triage Assessment → 4. Treatment → 5. Disposition Decision
   (Walk-in/         (ER Number        (ESI Level 1-5)      (Doctor/Nurse   (4 Options)
    Ambulance/         + Personal                              assigned)
    Police/            Info)
    Referred)

Disposition Options:
├── Discharge Home (Patient stable, goes home)
├── Admit to Ward (Needs in-patient care)
├── Admit to Private Room (Private admission)
└── Transfer/Refer to Another Hospital (Specialized care needed)
```

---

## Module Features

### **Tab 1: Overview Dashboard**

#### **Quick Stats Cards (4 Cards):**

1. **Total ER Patients** (Red gradient)
   - Icon: Ambulance
   - Badge: Patient count
   - Shows: Total current patients
   - Example: 5 patients

2. **In Treatment** (Yellow gradient)
   - Icon: Activity
   - Badge: Count
   - Shows: Patients currently being treated
   - Real-time status

3. **Awaiting Disposition** (Orange gradient)
   - Icon: Clock
   - Trending up indicator
   - Shows: Patients ready for discharge/admission decision
   - Critical workflow metric

4. **Avg Wait Time** (Green gradient)
   - Icon: Timer
   - Badge: Minutes
   - Shows: Average waiting time
   - Example: 19 minutes

---

#### **Patient Flow Status Card:**

Shows 5 stages with icons and counts:

1. **Registered** (Blue - UserPlus icon)
   - Just arrived and registered
   - Count: 0

2. **Triaged** (Purple - ClipboardList icon)
   - Triage assessment completed
   - ESI level assigned
   - Count: 1

3. **In Treatment** (Yellow - Stethoscope icon)
   - Active treatment in progress
   - Doctor assigned
   - Count: 2

4. **Awaiting Disposition** (Orange - AlertCircle icon)
   - Treatment complete
   - Ready for disposition decision
   - Count: 1

5. **Completed** (Green - CheckCircle icon)
   - Disposition completed
   - Patient discharged/admitted/transferred
   - Count: 1

---

#### **Disposition Summary Card:**

Shows 4 outcomes with icons and counts:

1. **Discharged Home** (Green - Home icon)
   - Patient stable
   - Goes home with instructions
   - Count: 1

2. **Admitted to Ward** (Blue - Bed icon)
   - Requires in-patient care
   - General ward admission
   - Count: 1

3. **Admitted to Private Room** (Purple - Building2 icon)
   - Private room admission
   - Enhanced care
   - Count: 0

4. **Transferred/Referred** (Orange - Send icon)
   - Sent to another hospital
   - Specialized facility needed
   - Count: 0

---

#### **Triage Level Distribution (ESI):**

5-column grid showing Emergency Severity Index:

**ESI 1 - Resuscitation** (Red)
- Life-threatening conditions
- Immediate intervention required
- Example: Stroke, Cardiac arrest
- Count: 1 (20%)

**ESI 2 - Emergent** (Orange)
- High risk situations
- Cannot wait
- Example: Chest pain, Severe trauma
- Count: 2 (40%)

**ESI 3 - Urgent** (Yellow)
- Moderate risk
- Can wait short time
- Example: Abdominal pain
- Count: 1 (20%)

**ESI 4 - Less Urgent** (Green)
- Low risk
- Stable patients
- Example: Minor laceration
- Count: 1 (20%)

**ESI 5 - Non-Urgent** (Blue)
- Very low risk
- No immediate danger
- Example: Minor complaints
- Count: 0 (0%)

---

### **Tab 2: Active Patients**

#### **Search & Filter Bar:**

**Search Input:**
- Placeholder: "Search by name, ER number, or complaint..."
- Search icon on left
- Live filtering

**Status Filter Dropdown:**
- All Status
- Registered
- Triaged
- In Treatment
- Awaiting Disposition
- Completed

**Refresh Button:**
- Reload current data
- Update patient status

---

#### **Patient Cards (2-column grid):**

Each card displays comprehensive patient information:

**Header Section:**
- **Avatar**: Blue circle with User icon
- **Name**: Bold, large text
- **Demographics**: Age, Gender
- **ER Number**: Font-mono, gray text (ER-2024-XXX)
- **Triage Badge**: Color-coded ESI level
- **Status Badge**: Current workflow status

**Arrival Information (4 items):**
- **Arrival Time**: Clock icon + timestamp
- **Arrival Mode**: Ambulance icon + mode (walk-in/ambulance/police/referred)
- **Wait Time**: Timer icon + minutes
- **Bed Number**: Bed icon + location (if assigned)

**Chief Complaint:**
- Label: "Chief Complaint:"
- Full text description
- Bold for emphasis

**Vital Signs (5 boxes):**

1. **BP** (Red background)
   - Blood Pressure
   - Example: 160/95

2. **HR** (Blue background)
   - Heart Rate (Pulse)
   - Example: 110 bpm

3. **Temp** (Orange background)
   - Temperature
   - Example: 98.6°F

4. **SpO2** (Green background)
   - Oxygen Saturation
   - Example: 92%

5. **RR** (Purple background)
   - Respiratory Rate
   - Example: 22

**Assigned Staff:**
- Blue background box
- Stethoscope icon
- Doctor name
- Example: "Dr. Sarah Mitchell"

**Disposition Status (if completed):**
- Color-coded box
- Icon for disposition type
- Disposition name
- Details text
- Examples:
  - Green: Discharged Home
  - Blue: Admitted to Ward
  - Purple: Admitted to Private Room
  - Orange: Transferred

**Action Buttons:**
- **View Details**: Eye icon, outline button
- **Disposition**: Arrow right icon, green button (only for awaiting-disposition status)

---

#### **Sample Patient Data (5 Patients):**

**Patient 1: John Anderson**
- ER-2024-001
- 45Y / Male
- **ESI 2 - Emergent**
- **Status**: In Treatment
- Arrival: Ambulance (08:30 AM)
- Complaint: Chest pain, shortness of breath
- Vitals: BP 160/95, HR 110, Temp 98.6, SpO2 92%, RR 22
- Doctor: Dr. Sarah Mitchell
- Bed: ER-BED-03
- Investigations: ECG, Troponin, CBC
- Medications: Aspirin, Nitroglycerin
- Wait Time: 12 minutes
- Charges: $15,000

**Patient 2: Maria Garcia**
- ER-2024-002
- 32Y / Female
- **ESI 4 - Less Urgent**
- **Status**: Awaiting Disposition
- Arrival: Walk-in (09:15 AM)
- Complaint: Minor laceration on hand
- Vitals: BP 120/80, HR 78, Temp 98.4, SpO2 98%, RR 16
- Doctor: Dr. James Wilson
- Bed: ER-BED-08
- Investigations: X-Ray Hand
- Medications: Tetanus, Antibiotics
- Wait Time: 45 minutes
- **Disposition**: Discharge
- Details: Wound sutured, follow-up in 7 days
- Charges: $3,500

**Patient 3: Robert Chen**
- ER-2024-003
- 68Y / Male
- **ESI 1 - Resuscitation**
- **Status**: Completed
- Arrival: Ambulance (07:45 AM)
- Complaint: Stroke symptoms - Left sided weakness
- Vitals: BP 180/110, HR 95, Temp 98.2, SpO2 94%, RR 20
- Doctor: Dr. Michael Brown
- Bed: ER-RESUS-01
- Investigations: CT Brain, CBC, PT/INR
- Medications: tPA, Antiplatelets
- Wait Time: 5 minutes
- **Disposition**: Admit to Ward
- Details: Admitted to Neurology ICU
- Time: 10:30 AM
- Charges: $45,000

**Patient 4: Lisa Thompson**
- ER-2024-004
- 28Y / Female
- **ESI 3 - Urgent**
- **Status**: In Treatment
- Arrival: Walk-in (09:45 AM)
- Complaint: Severe abdominal pain
- Vitals: BP 125/82, HR 88, Temp 99.2, SpO2 97%, RR 18
- Doctor: Dr. Emily Davis
- Bed: ER-BED-05
- Investigations: Ultrasound Abdomen, CBC, Urine Analysis
- Medications: Pain relief, Anti-spasmodic
- Wait Time: 30 minutes
- Charges: $8,500

**Patient 5: David Martinez**
- ER-2024-005
- 55Y / Male
- **ESI 2 - Emergent**
- **Status**: Triaged
- Arrival: Referred (10:20 AM)
- Complaint: Road traffic accident - Multiple injuries
- Vitals: BP 100/65, HR 115, Temp 98.0, SpO2 93%, RR 24
- Bed: ER-TRAUMA-02
- Wait Time: 8 minutes
- Charges: $0 (just triaged)

---

### **Tab 3: Register Patient**

**3-Tab Registration Form:**

#### **Tab 1: Personal Info**

**ER Number:**
- Auto-generated
- Disabled field
- Example: ER-2024-006

**Patient Information:**
- **Patient Name*** (Full width)
  - Text input
  - Required field

- **Age*** (Half width)
  - Number input
  - Required

- **Gender*** (Half width)
  - Dropdown: Male/Female/Other
  - Required

- **Contact Number*** (Half width)
  - Phone input
  - Format: +1-555-0000

- **Arrival Mode*** (Half width)
  - Dropdown:
    - Walk-in
    - Ambulance
    - Police
    - Referred

- **Existing UHID** (Full width)
  - Optional field
  - For registered patients
  - Format: UHID-XXXXXX

---

#### **Tab 2: Triage**

**Triage Assessment:**

**Triage Level (ESI)*** (Dropdown)
- ESI 1 - Resuscitation (Life-threatening)
- ESI 2 - Emergent (High risk)
- ESI 3 - Urgent (Moderate risk)
- ESI 4 - Less Urgent (Low risk)
- ESI 5 - Non-Urgent (Very low risk)

**Chief Complaint*** (Textarea)
- 3 rows
- Detailed symptom description
- Primary reason for visit

**Vital Signs Section:**
- Header with HeartPulse icon (Red)

**5 Vital Sign Inputs:**

1. **Blood Pressure** (mmHg)
   - Format: 120/80
   - Systolic/Diastolic

2. **Pulse Rate** (bpm)
   - Number input
   - Example: 72

3. **Temperature** (°F)
   - Decimal input
   - Step: 0.1
   - Example: 98.6

4. **SpO2** (%)
   - Number input
   - Example: 98

5. **Respiratory Rate**
   - Number input
   - Example: 16

---

#### **Tab 3: Clinical Info**

**Staff Assignment:**

**Assign Doctor** (Dropdown)
- Dr. Sarah Mitchell - Cardiology
- Dr. James Wilson - Emergency
- Dr. Emily Davis - General Medicine
- Dr. Michael Brown - Neurology

**Assign Nurse** (Dropdown)
- Nurse Emily
- Nurse John
- Nurse Sarah

**Bed Assignment** (Dropdown)
- ER-BED-01
- ER-BED-02
- ER-BED-03
- ER-RESUS-01 (Resuscitation)
- ER-TRAUMA-01 (Trauma Bay)

**Initial Notes** (Textarea)
- 4 rows
- Allergies
- Current medications
- Additional clinical information

---

**Action Buttons:**

1. **Register Patient** (Primary blue button)
   - Save icon
   - Full width
   - Creates new ER patient

2. **Cancel** (Outline button)
   - X icon
   - Cancels registration

---

### **Disposition Dialog**

**Triggered when:** "Disposition" button clicked on patient card

**Dialog Content:**

**Header:**
- DoorOpen icon (Green)
- Title: "Patient Disposition"
- Description: Patient name

**Info Alert:**
- Blue background
- Info icon
- Text: "Patient has been treated and is ready for disposition decision."

---

**4 Disposition Options (2x2 Grid):**

**1. Discharge Home** (Green border)
- Home icon (Green background)
- Title: "Discharge Home"
- Description: "Patient is stable and can go home"
- Hover: Green background

**2. Admit to Ward** (Blue border)
- Bed icon (Blue background)
- Title: "Admit to Ward"
- Description: "Requires further in-patient care"
- Hover: Blue background

**3. Admit to Private Room** (Purple border)
- Building2 icon (Purple background)
- Title: "Admit to Private Room"
- Description: "Private room admission"
- Hover: Purple background

**4. Transfer/Refer** (Orange border)
- Send icon (Orange background)
- Title: "Transfer/Refer"
- Description: "Transfer to another facility"
- Hover: Orange background

---

**Disposition Details:**

**Disposition Details*** (Textarea)
- 3 rows
- Discharge instructions
- Admission reason
- Transfer details
- Follow-up notes

**Follow-up Required** (Dropdown)
- Yes
- No

**Follow-up Date** (Date picker)
- Optional
- Future date

**Medications Prescribed** (Textarea)
- 2 rows
- List of medications
- Dosages

---

**Action Buttons:**

1. **Confirm Disposition** (Green primary)
   - CheckCircle icon
   - Full width
   - Saves disposition
   - Success toast notification

2. **Cancel** (Outline)
   - Closes dialog
   - No changes saved

---

## Color Coding System

### **Triage Levels (ESI):**
- **ESI 1**: Red (Life-threatening)
- **ESI 2**: Orange (Emergent)
- **ESI 3**: Yellow (Urgent)
- **ESI 4**: Green (Less Urgent)
- **ESI 5**: Blue (Non-Urgent)

### **Patient Status:**
- **Registered**: Blue
- **Triaged**: Purple
- **In Treatment**: Yellow
- **Awaiting Disposition**: Orange
- **Completed**: Green

### **Disposition Types:**
- **Discharge**: Green
- **Admit Ward**: Blue
- **Admit Private**: Purple
- **Transfer**: Orange

### **Vital Signs Backgrounds:**
- **BP**: Red
- **HR**: Blue
- **Temp**: Orange
- **SpO2**: Green
- **RR**: Purple

---

## Complete Workflow Example

### **Scenario: Chest Pain Patient**

**Step 1: Arrival**
- Patient arrives by ambulance at 08:30 AM
- Complaining of chest pain

**Step 2: Registration (Tab 3)**
1. Click "Register New Patient"
2. Fill Personal Info:
   - Name: John Anderson
   - Age: 45
   - Gender: Male
   - Contact: +1-555-0101
   - Arrival Mode: Ambulance
3. Fill Triage:
   - ESI Level: 2 (Emergent)
   - Chief Complaint: "Chest pain, shortness of breath"
   - Vitals: BP 160/95, HR 110, Temp 98.6, SpO2 92%, RR 22
4. Fill Clinical Info:
   - Assign: Dr. Sarah Mitchell
   - Bed: ER-BED-03
5. Click "Register Patient"

**Step 3: Patient appears in Active Patients**
- Status: Registered → Triaged → In Treatment
- Card shows all vital signs
- Doctor assigned
- Investigations ordered: ECG, Troponin, CBC
- Medications given: Aspirin, Nitroglycerin

**Step 4: Treatment Complete**
- Status changes to: Awaiting Disposition
- "Disposition" button appears

**Step 5: Disposition Decision**
1. Click "Disposition" button
2. Dialog opens
3. Choose option based on condition:
   - **If stable**: Select "Discharge Home"
   - **If needs monitoring**: Select "Admit to Ward"
   - **If needs ICU**: Select "Admit to Ward" (specify ICU)
   - **If needs specialized care**: Select "Transfer/Refer"
4. Enter disposition details
5. Set follow-up (if needed)
6. List medications prescribed
7. Click "Confirm Disposition"
8. Success toast appears
9. Patient status: Completed

**Step 6: Patient record shows final disposition**
- Green box with Home icon (if discharged)
- Blue box with Bed icon (if admitted)
- Disposition details visible
- Total charges calculated

---

## Key Features Summary

✅ **Complete Patient Journey** from arrival to disposition
✅ **5 Triage Levels (ESI)** with color coding
✅ **4 Disposition Options** (Home/Ward/Private/Transfer)
✅ **Real-time Status Tracking** through workflow stages
✅ **Comprehensive Vital Signs** display and entry
✅ **Doctor/Nurse Assignment** system
✅ **Bed Management** integration
✅ **Wait Time Tracking** for performance metrics
✅ **Search & Filter** for easy patient lookup
✅ **Professional UI** with HMS color scheme
✅ **Sample Data** for 5 realistic patients
✅ **Responsive Design** for all screen sizes

---

The Emergency Department now follows realistic hospital workflow from patient arrival through registration, triage, treatment, and final disposition decision! 🚑
