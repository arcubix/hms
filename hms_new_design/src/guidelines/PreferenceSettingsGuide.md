# Preference Settings Module - Complete Guide

## Overview

Complete hospital settings and configuration management system with 7 major sections matching your screenshot requirements.

---

## Layout Structure

### **Sidebar Navigation (Left)**
- Width: 320px
- White background
- Fixed position
- Scrollable menu

**Header:**
- Settings icon (Blue)
- Title: "Preferences"
- Subtitle: "Hospital settings & configuration"

**Menu Items (7):**
1. **Forms** - FileText icon
2. **Doctor's Timings** - Clock icon
3. **Departments** - Building2 icon
4. **Insurances & Organizations** - Shield icon
5. **Donation Donors** - Heart icon
6. **Message Settings** - MessageSquare icon
7. **Referral Hospitals** - Hospital icon

**Active State:**
- Blue background (bg-blue-50)
- Blue text (text-blue-700)
- Bold font
- Chevron right arrow

---

## 1. Forms Configuration

### **Header Section:**
- Title: "Forms Configuration"
- Subtitle: "Manage hospital forms and templates"
- **Add New Form** button (Blue, Plus icon)

### **Features:**

**Search & Filter Bar:**
- Search input with Search icon
- Filter button

**Forms Table:**

| Column | Description |
|--------|-------------|
| **Form ID** | Font-mono format (F001, F002) |
| **Form Name** | Bold text |
| **Category** | Badge (IPD, OPD, Surgery, etc.) |
| **Fields** | Number of fields |
| **Last Modified** | Date |
| **Status** | Active/Inactive badge |
| **Actions** | Edit, View, Delete buttons |

### **Sample Data (3 Forms):**

**Form 1: Patient Admission Form**
- ID: F001
- Category: IPD
- Fields: 25
- Last Modified: 2024-11-10
- Status: Active

**Form 2: Consent Form - Surgery**
- ID: F002
- Category: Surgery
- Fields: 15
- Last Modified: 2024-11-08
- Status: Active

**Form 3: Discharge Summary**
- ID: F003
- Category: IPD
- Fields: 20
- Last Modified: 2024-11-05
- Status: Active

### **Add New Form Dialog:**

**Fields:**
1. **Form Name*** (Text input)
2. **Category*** (Dropdown):
   - IPD
   - OPD
   - Surgery
   - Emergency
   - Laboratory
   - Pharmacy
3. **Status** (Dropdown):
   - Active
   - Inactive
4. **Description** (Textarea, 3 rows)

**Buttons:**
- Save Form (Green, primary)
- Cancel (Outline)

---

## 2. Doctor's Timings

### **Header Section:**
- Title: "Doctor's Timings"
- Subtitle: "Manage doctor schedules and availability"
- **Add Schedule** button (Blue)

### **Timings Table:**

| Column | Description |
|--------|-------------|
| **Doctor Name** | Bold text |
| **Department** | Badge |
| **Day** | Weekday |
| **Time** | Font-mono (HH:MM - HH:MM) |
| **Max Patients** | Number |
| **Fee** | Dollar amount |
| **Status** | Active/Inactive |
| **Actions** | Edit, Delete |

### **Sample Data (3 Schedules):**

**Schedule 1: Dr. Sarah Mitchell**
- Department: Cardiology
- Day: Monday
- Time: 09:00 - 17:00
- Max Patients: 30
- Fee: $500
- Status: Active

**Schedule 2: Dr. James Wilson**
- Department: Neurology
- Day: Monday
- Time: 10:00 - 18:00
- Max Patients: 25
- Fee: $600
- Status: Active

**Schedule 3: Dr. Emily Davis**
- Department: Pediatrics
- Day: Tuesday
- Time: 08:00 - 16:00
- Max Patients: 40
- Fee: $400
- Status: Active

---

## 3. Departments

### **Header Section:**
- Title: "Departments"
- Subtitle: "Manage hospital departments and resources"
- **Add Department** button (Blue)

### **Department Cards (4-column grid):**

**Card Layout:**

**Header:**
- Department icon (Blue circle, Building2 icon)
- Status badge (Active/Inactive)

**Content:**
- **Department Name** (Bold, large)
- **Code** (Font-mono, gray)

**Details:**
- Department Head (Stethoscope icon)
- Beds count (Users icon)
- Staff count (Users icon)
- Phone number (Phone icon)

**Actions:**
- Edit button
- View button

### **Sample Data (4 Departments):**

**1. Cardiology**
- Code: CARD
- Head: Dr. Sarah Mitchell
- Beds: 25
- Staff: 45
- Phone: +1-555-0201
- Status: Active

**2. Neurology**
- Code: NEUR
- Head: Dr. James Wilson
- Beds: 20
- Staff: 35
- Phone: +1-555-0202
- Status: Active

**3. Pediatrics**
- Code: PED
- Head: Dr. Emily Davis
- Beds: 30
- Staff: 50
- Phone: +1-555-0203
- Status: Active

**4. Emergency**
- Code: ER
- Head: Dr. Michael Brown
- Beds: 15
- Staff: 60
- Phone: +1-555-0204
- Status: Active

---

## 4. Insurances & Organizations

### **Header Section:**
- Title: "Insurances & Organizations"
- Subtitle: "Manage insurance companies and corporate partners"
- **Add Insurance/Organization** button (Blue)

### **Insurance Table:**

| Column | Description |
|--------|-------------|
| **Name** | Bold text |
| **Type** | Insurance/Organization badge |
| **Policy Prefix** | Font-mono |
| **Contact Person** | Name |
| **Phone** | Phone number |
| **Discount** | Percentage badge (green) |
| **Status** | Active/Inactive |
| **Actions** | Edit, Delete |

### **Sample Data (3 Entries):**

**1. Blue Cross Blue Shield**
- Type: Insurance (Blue badge)
- Policy Prefix: BCBS
- Contact: John Anderson
- Phone: +1-555-0301
- Email: contact@bcbs.com
- Discount: 20%
- Status: Active

**2. United Healthcare**
- Type: Insurance (Blue badge)
- Policy Prefix: UHC
- Contact: Sarah Johnson
- Phone: +1-555-0302
- Email: info@uhc.com
- Discount: 15%
- Status: Active

**3. Corporate Health - Tech Corp**
- Type: Organization (Purple badge)
- Policy Prefix: TECH
- Contact: Mike Roberts
- Phone: +1-555-0303
- Email: hr@techcorp.com
- Discount: 25%
- Status: Active

---

## 5. Donation Donors

### **Header Section:**
- Title: "Donation Donors"
- Subtitle: "Manage hospital donors and donations"
- **Add Donor** button (Blue)

### **Donor Cards (3-column grid):**

**Card Layout:**

**Header:**
- Avatar (User icon for individual, Building icon for corporate)
- Gradient background (Pink to Red)
- Type badge (Individual/Corporate)

**Content:**
- **Donor Name** (Bold)
- **Donor ID** (Gray, small)

**Contact Info:**
- Phone (Phone icon)
- Email (Mail icon)

**Donation Details:**
- Total Donated (Green, bold, large)
- Last Donation (Date)
- Frequency badge (One-time/Monthly/Yearly)

**Actions:**
- Edit button
- View button

### **Sample Data (3 Donors):**

**1. Robert Thompson**
- ID: DN001
- Type: Individual
- Phone: +1-555-0401
- Email: robert.t@email.com
- Total Donated: $50,000
- Last Donation: 2024-10-15
- Frequency: Monthly

**2. Smith Foundation**
- ID: DN002
- Type: Corporate
- Phone: +1-555-0402
- Email: contact@smithfoundation.org
- Total Donated: $500,000
- Last Donation: 2024-11-01
- Frequency: Yearly

**3. Maria Garcia**
- ID: DN003
- Type: Individual
- Phone: +1-555-0403
- Email: maria.g@email.com
- Total Donated: $25,000
- Last Donation: 2024-09-20
- Frequency: One-time

---

## 6. Message Settings

### **Header Section:**
- Title: "Message Settings"
- Subtitle: "Configure automated message templates"
- **Add Template** button (Blue)

### **Message Template Cards:**

**Card Layout:**

**Header:**
- Icon box (SMS=Green, Email=Blue, WhatsApp=Purple)
- Template name (Bold)
- Trigger text (Small, gray)

**Badges:**
- Status (Active/Inactive)
- Type (SMS/EMAIL/WHATSAPP)

**Content Box:**
- Gray background
- Template content with variables

**Actions:**
- Edit button
- Duplicate button
- Test button
- Delete button (Red)

### **Sample Templates (3):**

**1. Appointment Confirmation**
- Type: SMS (Green)
- Trigger: Appointment Booked
- Content: "Dear {patient_name}, your appointment with {doctor_name} is confirmed for {date} at {time}. Thank you!"
- Status: Active

**2. Appointment Reminder**
- Type: WhatsApp (Purple)
- Trigger: 1 Day Before
- Content: "Hello {patient_name}, this is a reminder for your appointment tomorrow at {time} with {doctor_name}."
- Status: Active

**3. Lab Results Ready**
- Type: Email (Blue)
- Trigger: Lab Results Completed
- Content: "Dear {patient_name}, your lab results are ready. Please visit the hospital to collect your reports."
- Status: Active

### **Available Variables Card:**

**8 Variables (4-column grid):**
1. `{patient_name}`
2. `{doctor_name}`
3. `{date}`
4. `{time}`
5. `{hospital_name}`
6. `{department}`
7. `{bill_amount}`
8. `{appointment_id}`

**Style:**
- Gray background boxes
- Font-mono
- Small text
- Border
- Centered

---

## 7. Referral Hospitals

### **Header Section:**
- Title: "Referral Hospitals"
- Subtitle: "Manage referral and partner hospitals"
- **Add Hospital** button (Blue)

### **Hospital Cards (Full-width):**

**Card Layout:**

**Header Section:**
- Large hospital icon (Blue gradient circle, 64x64)
- Hospital name (Bold, large)
- Hospital type (Gray text)
- Status badge (Active/Inactive)

**Contact Grid (2 columns):**
- Address (MapPin icon)
- Phone (Phone icon)
- Email (Mail icon)
- Contact Person (User icon)

**Specialties Section:**
- Label: "Specialties:"
- Multiple badges with specialty names

**Action Buttons:**
- Edit
- View Details
- Contact
- Remove (Red, right-aligned)

### **Sample Data (3 Hospitals):**

**1. City General Hospital**
- Type: Multi-Specialty
- Address: 123 Main Street, Downtown
- Phone: +1-555-0501
- Email: info@citygeneral.com
- Contact: Dr. William Parker
- Specialties:
  - Cardiology
  - Neurosurgery
  - Oncology
- Status: Active

**2. Advanced Cancer Center**
- Type: Specialty
- Address: 456 Medical Plaza, Healthcare District
- Phone: +1-555-0502
- Email: referrals@cancercenter.com
- Contact: Dr. Lisa Chen
- Specialties:
  - Oncology
  - Radiation Therapy
  - Chemotherapy
- Status: Active

**3. Trauma & Emergency Hospital**
- Type: Emergency
- Address: 789 Emergency Lane, Medical Zone
- Phone: +1-555-0503
- Email: emergency@traumacenter.com
- Contact: Dr. Mark Davis
- Specialties:
  - Trauma Surgery
  - Critical Care
  - Burn Unit
- Status: Active

---

## Color Scheme

### **Status Badges:**
- **Active**: Green background (bg-green-100), Green text (text-green-800)
- **Inactive**: Gray background (bg-gray-100), Gray text (text-gray-800)

### **Type Badges:**
- **Insurance**: Blue background (bg-blue-50)
- **Organization**: Purple background (bg-purple-50)
- **Individual**: Blue background (bg-blue-50)
- **Corporate**: Purple background (bg-purple-50)

### **Message Type Colors:**
- **SMS**: Green (bg-green-100, text-green-600)
- **Email**: Blue (bg-blue-100, text-blue-600)
- **WhatsApp**: Purple (bg-purple-100, text-purple-600)

### **Frequency Badges:**
- Blue background (bg-blue-100)
- Blue text (text-blue-800)

---

## Key Features Summary

✅ **7 Complete Sections** matching screenshot
✅ **Sidebar Navigation** with active states
✅ **Forms Management** with template builder
✅ **Doctor Scheduling** with time slots
✅ **Department Management** with resource tracking
✅ **Insurance Integration** with discount rates
✅ **Donor Management** with donation tracking
✅ **Message Templates** with SMS/Email/WhatsApp support
✅ **Referral Hospitals** with specialty tracking
✅ **Search & Filter** functionality
✅ **CRUD Operations** (Create, Read, Update, Delete)
✅ **Professional UI** with HMS color scheme
✅ **Responsive Design** for all screen sizes
✅ **Sample Data** for all sections

---

## Usage in Dashboard

To add this to your admin dashboard, import it like:

```tsx
import { PreferenceSettings } from './components/modules/PreferenceSettings';

// In your dashboard:
<PreferenceSettings />
```

The module is fully self-contained with sidebar navigation and all 7 sections ready to use! ⚙️🏥
