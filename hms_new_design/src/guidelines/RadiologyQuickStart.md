# Radiology Module - Quick Start Guide

## Access the Radiology Module

### Step 1: Login
- Open the HMS application
- Login as **Admin** (or any role with radiology access)
- Credentials: admin@hospital.com / password

### Step 2: Navigate to Radiology
- Click **"Radiology"** in the top navigation bar
- Badge shows "8" indicating 8 active orders
- The Radiology Information System (RIS) opens

---

## Dashboard Overview

### What You'll See:

#### 1. Header Section
- **Title**: "Radiology Information System (RIS)"
- **Subtitle**: "Advanced imaging workflow and PACS integration"
- **PACS Status**: Green badge "PACS Connected"
- **Alerts Button**: "Alerts (3)" - notification count
- **New Order Button**: Blue button to create orders

#### 2. Statistics Cards (7 Cards)
```
[Total Orders: 8] [Scheduled: 2] [In Progress: 2] 
[Completed: 2] [Reported: 3] [Critical: 1] [STAT/Emergency: 1]
```

#### 3. Studies by Modality
Visual breakdown showing:
- X-Ray: 3 studies (37.5%)
- CT: 2 studies (25%)
- MRI: 1 study (12.5%)
- Ultrasound: 1 study (12.5%)
- Mammography: 1 study (12.5%)

#### 4. Priority Queue
Shows urgent and STAT studies:
- **STAT CT Head** - Robert Thompson, 62Y - "in-progress"
- **Urgent Mammography** - Linda Martinez, 52F - "completed"
- Red/Orange highlighted for visibility

#### 5. Equipment Status
6 equipment cards showing:
- **CT Scanner 1** - Operational (78% utilized)
- **MRI Scanner 1** - Operational (65% utilized)
- **X-Ray Room 1** - Operational (85% utilized)
- **Ultrasound Unit 2** - Operational (72% utilized)
- **Mammography Unit** - Operational (58% utilized)
- **CT Scanner 2** - Maintenance (0% utilized)

#### 6. Critical Findings Alert (If Any)
Red alert banner:
```
⚠️ 1 Critical Finding(s) require immediate attention and notification
[Review Now →]
```

---

## 7 Main Sections

### Navigation Tabs:
1. **Dashboard** - Overview (default view)
2. **Order Management** - Create and track orders
3. **Radiologist Worklist** - Studies for interpretation
4. **Reporting** - Report generation
5. **Image Viewer** - DICOM viewer
6. **Equipment** - Equipment tracking
7. **Analytics** - Performance metrics

---

## Create a New Radiology Order

### Quick Steps:

1. **Click "New Order" button** (Blue, top-right)

2. **Tab 1: Patient Info**
   - Toggle: Existing Patient / New Patient
   - If existing: Search by UHID
   - Fill: Name, Age, Gender
   - Select Department (Emergency, IPD, OPD, ICU)

3. **Tab 2: Study Details**
   - Select **Modality**: X-Ray, CT, MRI, Ultrasound, etc.
   - Choose **Study Type**: Based on modality
   - Enter **Body Part**: Head, Chest, Abdomen
   - Optional: Laterality (Left/Right/Bilateral)
   - **Contrast**: Toggle ON if needed
     - Select type: Iodinated, Gadolinium, Barium
   - ⚠️ Alert: "Ensure patient has recent creatinine levels"

4. **Tab 3: Clinical Info**
   - Select **Ordering Physician**
   - Enter **Clinical History** (detailed)
   - Enter **Indication** (reason for study)
   - Add **Lab Values** (Creatinine, eGFR)
   - List **Allergies** (CRITICAL for contrast)
   - Note **Previous Studies** for comparison

5. **Tab 4: Scheduling**
   - Select **Priority**:
     - ○ Routine (Next available slot)
     - ○ Urgent (Within 4-6 hours)
     - ○ STAT (Immediate)
   - Choose **Preferred Date & Time**
   - Select **Equipment** (or "Any Available")
   - Add **Special Instructions**
   - Toggle options:
     - □ Requires assistance/wheelchair
     - □ Mobility issues
     - □ Isolation precautions

6. **Click "Create Order"**
   - Success toast appears
   - Order ID generated (RAD-2024-XXXXX)
   - Order appears in list

---

## View Order Details

### Method 1: From Order Management

1. Click **"Order Management"** tab
2. Find patient in table
3. Click **eye icon** in Actions column
4. Order Details dialog opens with 4 tabs:
   - **Order Info**: Complete demographics
   - **Clinical**: History and indication
   - **Images**: Thumbnail grid (if acquired)
   - **Report**: Report content (if completed)

### Method 2: From Priority Queue

1. Find urgent/STAT order in dashboard
2. Click on the order card
3. Details view opens

---

## Order Management Features

### Search & Filter

**Search Bar:**
- Type: Order ID, Patient Name, UHID
- Real-time filtering
- Example: "RAD-2024-00842" or "Thompson"

**Modality Filter:**
- Dropdown: All Modalities, X-Ray, CT, MRI, etc.
- Narrows results by imaging type

**Status Filter:**
- Dropdown: All Status, Scheduled, In Progress, etc.
- Shows orders in specific workflow state

**Refresh Button:**
- Updates list with latest data
- Syncs with PACS

---

## Understanding Order Table

### 8 Columns Explained:

**1. Order ID**
```
RAD-2024-00842
2024-11-11
```
- Unique order identifier
- Date order was created

**2. Patient Info**
```
Robert Thompson
62Y / male • UHID-892401
```
- Full name
- Age, gender, UHID

**3. Study Details**
```
[CT]
CT Head without Contrast
Head
```
- Modality badge
- Study type
- Body part

**4. Priority**
```
[STAT] or [URGENT] or [ROUTINE]
```
- Color-coded:
  - Red: STAT/Emergency
  - Orange: Urgent
  - Green: Routine

**5. Scheduled**
```
2024-11-11
15:30
```
- Date
- Time

**6. Status**
```
[in-progress]
[CRITICAL]
```
- Current workflow status
- Critical flag if applicable

**7. Assigned Staff**
```
👤 John Ramirez, RT
🔬 Dr. Michael Chen, MD
```
- Technologist
- Radiologist

**8. Actions**
- 👁️ View details
- ✏️ Edit order

---

## Priority System

### STAT / Emergency (RED)
- **Timeline**: Immediate (within 1 hour)
- **Examples**:
  - Head trauma
  - Suspected stroke
  - Acute abdomen
- **Workflow**: Interrupts current studies
- **Location**: Patient brought directly to modality

### Urgent (ORANGE)
- **Timeline**: Within 4-6 hours
- **Examples**:
  - Suspected PE
  - Acute pain
  - Mass evaluation
- **Workflow**: Scheduled same day
- **Location**: Next available slot

### Routine (GREEN)
- **Timeline**: Next available (1-3 days)
- **Examples**:
  - Screening
  - Follow-up
  - Chronic conditions
- **Workflow**: Normal scheduling
- **Location**: Scheduled appointment

---

## Status Progression

### Normal Workflow:
```
Scheduled → In Progress → Completed → Reported → Verified
```

**Scheduled** (Purple)
- Order created
- Appointment booked
- Patient notified

**In Progress** (Yellow)
- Patient in modality room
- Images being acquired
- Technologist working

**Completed** (Green)
- Images acquired
- Sent to PACS
- Ready for radiologist

**Reported** (Cyan)
- Radiologist dictated
- Report preliminary or final
- Sent to ordering physician

**Verified** (Blue)
- Report verified
- Signed off
- Final version

**Critical** (Red)
- Critical finding identified
- Immediate notification required
- Physician contacted

**Cancelled** (Gray)
- Order cancelled
- Patient no-show or other reason

---

## Equipment Status Codes

### Operational (Green)
- Fully functional
- Accepting studies
- Normal workflow
- Example: CT Scanner 1 (78% utilized)

### Maintenance (Yellow)
- Scheduled service
- Temporarily unavailable
- Patients rescheduled
- Example: CT Scanner 2 (Maintenance today)

### Down (Red)
- Equipment failure
- Repairs needed
- Extended downtime
- Urgent service call

### Calibration (Blue)
- Quality control
- Physics QC
- Precision testing
- Temporary unavailable

---

## Modality Types

### 1. X-Ray
- **Speed**: 5-10 minutes
- **Uses**: Bones, chest, abdomen
- **Radiation**: Yes (low)
- **Common**: Most frequent studies

### 2. CT (Computed Tomography)
- **Speed**: 10-30 minutes
- **Uses**: Trauma, cancer, detailed anatomy
- **Radiation**: Yes (moderate)
- **Contrast**: Often used

### 3. MRI (Magnetic Resonance)
- **Speed**: 30-60 minutes
- **Uses**: Brain, spine, soft tissue
- **Radiation**: None
- **Contrast**: Gadolinium sometimes

### 4. Ultrasound
- **Speed**: 15-45 minutes
- **Uses**: Abdomen, pregnancy, vessels
- **Radiation**: None
- **Portable**: Yes

### 5. Mammography
- **Speed**: 15-30 minutes
- **Uses**: Breast screening/diagnosis
- **Radiation**: Yes (very low)
- **Screening**: Annual for women 40+

### 6. PET/CT
- **Speed**: 60-90 minutes
- **Uses**: Cancer staging
- **Radiation**: Yes
- **Cost**: Highest

### 7. Fluoroscopy
- **Speed**: Variable
- **Uses**: Real-time X-ray, GI studies
- **Radiation**: Yes
- **Dynamic**: Live imaging

### 8. Nuclear Medicine
- **Speed**: 2-4 hours (including uptake)
- **Uses**: Bone scans, thyroid
- **Radiation**: Yes
- **Functional**: Organ function

---

## Sample Orders in System

### Order 1: STAT Emergency CT
```
Order ID: RAD-2024-00842
Patient: Robert Thompson, 62Y, Male
Study: CT Head without Contrast
Priority: STAT
Indication: "Fall with head trauma, loss of consciousness"
Status: In Progress
Location: CT Suite 1
Critical: Yes
```

### Order 2: Routine Chest X-Ray
```
Order ID: RAD-2024-00843
Patient: Maria Garcia, 45Y, Female
Study: Chest X-Ray 2 Views
Priority: Routine
Indication: "Persistent cough for 3 weeks, fever"
Status: Reported (Final)
Findings: Normal
```

### Order 3: Scheduled MRI
```
Order ID: RAD-2024-00844
Patient: James Anderson, 58Y, Male
Study: MRI Lumbar Spine with Contrast
Priority: Routine
Indication: "Chronic lower back pain, radiculopathy"
Status: Scheduled (2024-11-12 at 09:00)
Contrast: Gadolinium
```

### Order 4: Urgent Mammography
```
Order ID: RAD-2024-00845
Patient: Linda Martinez, 52Y, Female
Study: Diagnostic Mammography Bilateral
Priority: Urgent
Indication: "Palpable lump in right breast"
Status: Completed (Awaiting report)
Critical Finding: Yes
```

---

## Critical Findings

### What are Critical Findings?
Urgent or unexpected findings requiring immediate physician notification

### Examples:
- Intracranial hemorrhage
- Pneumothorax
- Pulmonary embolism
- Aortic dissection
- Bowel perforation
- Acute fractures (spine, skull)
- Suspicious masses

### Critical Finding Workflow:

1. **Radiologist Identifies**
   - Reviews images
   - Finds critical abnormality

2. **Report Marked**
   - "CRITICAL" badge added
   - Red highlighting in system

3. **Immediate Notification**
   - Direct phone call to ordering physician
   - Read-back confirmation
   - Documented in report

4. **Follow-up**
   - Ensure appropriate action taken
   - Emergency intervention if needed

5. **Documentation**
   ```
   *** CRITICAL FINDING ***
   Finding: Large acute subdural hematoma
   Notified: Dr. Sarah Mitchell (ER)
   Time: 2024-11-11 at 15:45
   Acknowledged: Yes
   ```

---

## Common Workflows

### Workflow 1: Outpatient X-Ray

**Patient arrives for scheduled X-ray**

1. Registration verifies patient
2. Patient changes (if needed)
3. Technologist positions patient
4. Images acquired (5 minutes)
5. Quality check
6. Images sent to PACS
7. Radiologist interprets (within 2 hours)
8. Report sent to ordering physician
9. Patient portal updated

**Total time**: 30 minutes visit, report in 2-4 hours

### Workflow 2: Emergency CT

**Trauma patient needs immediate CT**

1. Order placed as STAT
2. Current study interrupted
3. Patient brought to CT
4. Scan completed (10 minutes)
5. Radiologist alerted
6. Images reviewed immediately
7. Critical finding identified
8. Direct phone call to ER physician
9. Preliminary report (15 minutes from scan)
10. Patient to surgery

**Total time**: Order to report = 18 minutes

### Workflow 3: Scheduled MRI

**Outpatient scheduled MRI**

1. Appointment scheduled 3 days out
2. Pre-procedure instructions sent
3. Patient fasts if contrast
4. Safety screening completed
5. IV placed for contrast
6. MRI acquired (45 minutes)
7. Images sent to PACS
8. Radiologist reads next business day
9. Final report within 24-48 hours

**Total time**: Visit = 90 minutes, Report in 1-2 days

---

## Tips & Best Practices

### For Creating Orders:

✅ **Always verify patient identity**
- Use two identifiers (Name + UHID)
- Confirm date of birth

✅ **Provide detailed clinical history**
- More context = better interpretation
- Include relevant symptoms
- Note duration and severity

✅ **Check for previous studies**
- Comparison is valuable
- Note dates of prior imaging
- Request prior CDs if from outside

✅ **Verify allergies**
- CRITICAL for contrast studies
- Document previous reactions
- Note severity

✅ **Check creatinine for contrast**
- CT contrast: Cr < 1.5 mg/dL
- MRI contrast: eGFR > 30 mL/min
- Elderly patients at higher risk

✅ **Select appropriate priority**
- Don't overuse STAT
- STAT = life-threatening only
- Urgent = same day needed
- Routine = standard scheduling

### For Safety:

⚠️ **MRI Safety Checklist**
- Screen for pacemakers
- Check for metal implants
- Ask about metal fragments
- Review medication patches
- Claustrophobia assessment

⚠️ **Contrast Safety**
- Renal function assessment
- Allergy history
- Hydration status
- Premedication if needed
- Post-procedure monitoring

⚠️ **Radiation Safety**
- Pregnancy screening for women
- ALARA principle (As Low As Reasonably Achievable)
- Justify study necessity
- Consider non-radiation alternatives (MRI, Ultrasound)

---

## Export & Reporting

### Export Options:

**CSV Export**
- All order data
- Filtered results
- Opens in Excel
- Use for: Shift reports, statistics

**Print**
- Formatted patient list
- Statistics included
- Use for: Handoff, records

**Individual Reports**
- PDF format
- Full diagnostic report
- DICOM images
- Patient CDs

---

## Quick Reference - Badges & Colors

### Priority Badges:
- 🔴 **Red** = STAT/Emergency (Immediate)
- 🟠 **Orange** = Urgent (4-6 hours)
- 🟢 **Green** = Routine (1-3 days)

### Status Badges:
- 🟣 **Purple** = Scheduled
- 🟡 **Yellow** = In Progress
- 🟢 **Green** = Completed
- 🔵 **Cyan** = Reported
- 🔵 **Blue** = Verified
- 🔴 **Red** = Critical
- ⚫ **Gray** = Cancelled

### Equipment Status:
- 🟢 **Green** = Operational
- 🟡 **Yellow** = Maintenance
- 🔴 **Red** = Down
- 🔵 **Blue** = Calibration

---

## Need Help?

### Common Issues:

**Q: Order not appearing?**
- A: Click refresh button
- Check filters (modality, status)
- Verify search spelling

**Q: Can't create contrast order?**
- A: Check creatinine entered
- Verify allergy screening done
- Ensure contrast type selected

**Q: Equipment unavailable?**
- A: Check equipment status
- Select "Any Available"
- Reschedule if all down

**Q: Critical finding not notifying?**
- A: Check alert settings
- Verify phone numbers
- Use manual notification

---

## System Status Indicators

### Header Indicators:

**PACS Connected** (Green)
- ✅ System operational
- Images syncing properly
- Normal workflow

**PACS Disconnected** (Red)
- ⚠️ System issue
- Images not syncing
- Contact IT immediately

**Alerts (Number)**
- Shows count of pending alerts
- Critical findings
- Equipment issues
- System notifications

---

This quick start guide covers the essential features of the Radiology module. For detailed documentation, refer to the complete RadiologyModule.md guide.
