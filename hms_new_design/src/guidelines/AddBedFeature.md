# Add New Bed Feature - Comprehensive Documentation

## Overview
The "Add New Bed" feature allows hospital administrators to configure and add new beds to any ward with complete facility selection, room rent configuration, and medical equipment pricing.

---

## Access Path
1. Login as **Admin**
2. Navigate to **IPD Management**
3. Click **Ward Management**
4. Select a ward and click **"View Beds"**
5. Click the **"Add Bed"** button in the top-right corner

---

## Dialog Structure - 3 Tabs

### **Tab 1: Basic Details**

#### Fields:

**1. Bed Number*** (Required)
- **Input Type**: Text
- **Placeholder**: "e.g., GEN-A-07, ICU-05"
- **Format**: WARD-SECTION-NUMBER
- **Description**: Must be unique within the ward
- **Example**: 
  - General Ward: GEN-A-07, GEN-B-15
  - ICU: ICU-05, ICU-12
  - Private: PVT-08, PVT-23

**2. Ward*** (Required)
- **Input Type**: Disabled text field
- **Value**: Auto-filled with selected ward name
- **Cannot be changed** (pre-selected from View Beds page)

**3. Floor*** (Required)
- **Input Type**: Number
- **Default**: Ward's floor number
- **Can be modified** if bed is on a different floor

**4. Section** (Optional)
- **Input Type**: Dropdown
- **Options**:
  - Section A
  - Section B
  - Section C
  - Section D
- **Purpose**: Subdivide large wards into manageable sections

**5. Bed Type*** (Required)
- **Input Type**: Dropdown
- **Options**:
  - **General**: Standard patient care
  - **ICU**: Intensive Care Unit
  - **Private**: Single occupancy room
  - **Deluxe**: Premium amenities
  - **Isolation**: Infection control
- **Impact**: Affects default pricing and available features

**6. Initial Status*** (Required)
- **Input Type**: Dropdown
- **Default**: Available
- **Options**:
  - **Available**: Ready for patient assignment
  - **Under Maintenance**: Needs repair before use
  - **Cleaning Required**: Needs cleaning before use
- **Purpose**: Set the bed's initial operational status

**Info Alert:**
> "Bed number should be unique within the ward. Follow your hospital's naming convention."

---

### **Tab 2: Facilities**

#### Purpose
Select all amenities and facilities available in the bed/room to inform patients and billing.

#### Interface

**Header Section:**
- Settings icon
- "Select Room Facilities" heading
- Description: "Choose all facilities available in this bed/room"

**Facility Selection Grid** (3 columns)

#### Available Facilities (16 Options):

1. **AC** (Air Conditioning)
   - Central or split AC
   - Temperature control

2. **TV** (Television)
   - Cable/satellite connection
   - Entertainment

3. **Washroom**
   - Shared bathroom
   - Common facilities

4. **Attached Bathroom**
   - Private bathroom
   - In-room access

5. **WiFi**
   - Internet connectivity
   - For patients & visitors

6. **Refrigerator**
   - Small fridge
   - Food & medicine storage

7. **Nurse Call**
   - Emergency call button
   - Direct communication

8. **Emergency Equipment**
   - Crash cart nearby
   - Defibrillator access

9. **Microwave**
   - Food heating
   - Convenience feature

10. **Sofa**
    - Visitor seating
    - Attendant sleeping

11. **Wardrobe**
    - Storage space
    - Clothes & belongings

12. **Study Table**
    - Work surface
    - Laptop usage

13. **Telephone**
    - Landline connection
    - Local/external calls

14. **Intercom**
    - Internal hospital communication
    - Nurse station connection

15. **Safe Locker**
    - Secure storage
    - Valuables protection

16. **Mini Bar**
    - Beverage fridge
    - Premium feature

#### Selection Interaction

**Unselected State:**
- Gray border card
- Empty circle icon
- White background
- Hover effect (gray border darkens)

**Selected State:**
- Blue border card (#2F80ED)
- Blue checkmark icon
- Light blue background (#EFF6FF)
- Facility name in normal text

**Click to Toggle:**
- Click card to select/deselect
- Visual feedback immediate
- No double-click required

#### Selected Facilities Summary

**Display Box** (Gray background):
- Shows count: "Selected Facilities (X)"
- All selected facilities as blue badges
- Click badge to remove facility
- X icon on each badge
- If none: "No facilities selected" message

**Example Display:**
```
Selected Facilities (5)
[AC ×] [TV ×] [WiFi ×] [Attached Bathroom ×] [Nurse Call ×]
```

---

### **Tab 3: Pricing & Equipment**

This tab is divided into **TWO SECTIONS**:

---

#### **SECTION 1: Room Rent / Pricing**

**Header:**
- Dollar sign icon (green)
- "Room Rent / Pricing" heading

**Pricing Fields** (2×2 Grid):

**1. Daily Rate (Per Day)*** (Required)
- **Input Type**: Number with $ prefix
- **Placeholder**: "500"
- **Min**: 0
- **Step**: 50 (increments of $50)
- **Description**: "Base rate for 24 hours"
- **Example Values**:
  - General Ward: $500/day
  - ICU: $3,500/day
  - Private: $1,500/day
  - Deluxe: $2,500/day

**2. Hourly Rate** (Optional)
- **Input Type**: Number with $ prefix
- **Placeholder**: "25"
- **Min**: 0
- **Step**: 5 (increments of $5)
- **Description**: "For partial day billing"
- **Purpose**: Charge for hours < 24
- **Calculation**: Used when patient stays < 1 day
- **Example**: $25/hour × 8 hours = $200

**3. Weekly Rate** (Optional)
- **Input Type**: Number with $ prefix
- **Placeholder**: "3000"
- **Min**: 0
- **Step**: 100 (increments of $100)
- **Description**: "7-day package rate"
- **Purpose**: Discounted rate for week-long stays
- **Example**: $3,000/week (vs $3,500 for 7 daily rates)
- **Savings**: Patients save $500 for weekly commitment

**4. Monthly Rate** (Optional)
- **Input Type**: Number with $ prefix
- **Placeholder**: "12000"
- **Min**: 0
- **Step**: 500 (increments of $500)
- **Description**: "30-day package rate"
- **Purpose**: Significantly discounted long-term rate
- **Example**: $12,000/month (vs $15,000 for 30 daily rates)
- **Savings**: Patients save $3,000 for monthly stay

**Blue Info Alert:**
> "Pricing may vary based on bed type. ICU/Critical care beds typically have higher rates."

---

#### **SECTION 2: Medical Equipment**

**Header:**
- Activity/heart icon (red)
- "Medical Equipment" heading

**Equipment Cards** (3 Toggle Cards):

---

##### **Equipment 1: Oxygen Supply**

**Collapsed State** (Oxygen OFF):
- Gray border card
- Wind icon (blue)
- Title: "Oxygen Supply"
- Subtitle: "Centralized oxygen pipeline"
- Toggle switch: OFF (gray)

**Expanded State** (Oxygen ON):
- **Blue border** (#2F80ED)
- **Light blue background** (#EFF6FF)
- Wind icon (blue)
- Title: "Oxygen Supply"
- Subtitle: "Centralized oxygen pipeline"
- Toggle switch: **ON (blue)**

**Additional Fields** (appears when ON):
- Border-top separator
- Label: "Additional Charge (per day)"
- Number input with $ prefix
- Placeholder: "50"
- Min: 0
- **Purpose**: Extra daily charge for oxygen usage
- **Example**: Base rate $500 + Oxygen $50 = $550/day

**Toggle Interaction:**
- Click anywhere on card OR toggle switch
- Instant visual feedback
- Additional fields slide in/out

---

##### **Equipment 2: Patient Monitor**

**Collapsed State** (Monitor OFF):
- Gray border card
- Activity icon (green)
- Title: "Patient Monitor"
- Subtitle: "Vital signs monitoring system"
- Toggle switch: OFF (gray)

**Expanded State** (Monitor ON):
- **Green border** (#27AE60)
- **Light green background** (#F0FDF4)
- Activity icon (green)
- Title: "Patient Monitor"
- Subtitle: "Vital signs monitoring system"
- Toggle switch: **ON (green)**

**Additional Fields** (appears when ON):
- Border-top separator
- Label: "Additional Charge (per day)"
- Number input with $ prefix
- Placeholder: "100"
- Min: 0
- **Purpose**: Extra daily charge for monitoring
- **Example**: Base rate $500 + Monitor $100 = $600/day
- **Includes**: Heart rate, BP, SpO2, respiratory rate monitoring

**Features:**
- Real-time vital signs display
- Alarm systems
- Historical data recording
- Nurse station connectivity

---

##### **Equipment 3: Ventilator**

**Collapsed State** (Ventilator OFF):
- Gray border card
- Heart icon (red)
- Title: "Ventilator"
- Subtitle: "Mechanical ventilation support"
- Toggle switch: OFF (gray)

**Expanded State** (Ventilator ON):
- **Red border** (#DC2626)
- **Light red background** (#FEE2E2)
- Heart icon (red)
- Title: "Ventilator"
- Subtitle: "Mechanical ventilation support"
- Toggle switch: **ON (red)**

**Additional Fields** (appears when ON):
- Border-top separator
- Label: "Additional Charge (per day)"
- Number input with $ prefix
- Placeholder: "500"
- Min: 0
- **Purpose**: Extra daily charge for ventilator
- **Example**: Base rate $3,500 + Ventilator $500 = $4,000/day
- **Critical**: Typically used in ICU only

**Features:**
- Life support system
- Breathing assistance
- Pressure/volume controlled modes
- Trained staff required

---

**Green Success Alert:**
> "Equipment charges will be automatically added to the patient's daily room charges."

**Auto-Calculation Example:**
```
Base Rate:        $500/day
+ Oxygen:         $50/day
+ Monitor:        $100/day
+ Ventilator:     $500/day
--------------------------
Total Daily:      $1,150/day
```

---

## Form Validation

### Required Fields:
- ✅ Bed Number
- ✅ Ward (auto-filled)
- ✅ Floor
- ✅ Bed Type
- ✅ Initial Status
- ✅ Daily Rate

### Optional Fields:
- Section
- Hourly Rate
- Weekly Rate
- Monthly Rate
- All Facilities
- All Equipment

### Validation Rules:

**Bed Number:**
- Cannot be empty
- Should be unique within ward
- Alphanumeric with hyphens allowed
- Format: WARD-SECTION-NUMBER

**Floor:**
- Must be a positive number
- Typically 1-10

**Daily Rate:**
- Must be greater than 0
- Should align with hospital pricing policy
- ICU > Private > General

**Equipment Charges:**
- Can be 0 (if included in base rate)
- Should be reasonable amounts

---

## Dialog Actions

### Cancel Button (Bottom Left)
- **Style**: Outline button
- **Action**: Close dialog without saving
- **Confirmation**: None (instant close)
- **Data**: All inputs discarded

### Add Bed Button (Bottom Right)
- **Style**: Blue solid button (#2F80ED)
- **Icon**: Plus icon
- **Label**: "Add Bed"
- **Action**: 
  1. Validate all required fields
  2. Check bed number uniqueness
  3. Create bed record
  4. Show success toast: "New bed added successfully!"
  5. Close dialog
  6. Refresh bed list
  7. Reset form fields

---

## Success Flow

**After clicking "Add Bed":**

1. **Validation Check**
   - All required fields filled?
   - Bed number unique?
   - Rates are valid numbers?

2. **Data Processing**
   - Compile facility list
   - Calculate equipment flags
   - Set pricing structure
   - Assign initial status

3. **Database Update**
   - Create new bed record
   - Update ward bed count
   - Update availability stats

4. **User Feedback**
   - Green toast notification
   - "New bed added successfully!"
   - Dialog closes automatically

5. **UI Update**
   - Bed appears in grid/list
   - Ward statistics update
   - Total beds increment
   - Available beds increment (if status = available)

---

## Use Cases

### Use Case 1: Add General Ward Bed

**Scenario**: Add a standard bed to General Ward A

**Steps:**
1. Click "Add Bed"
2. **Tab 1**: 
   - Bed Number: GEN-A-25
   - Ward: General Ward A (auto-filled)
   - Floor: 2
   - Section: A
   - Bed Type: General
   - Status: Available
3. **Tab 2** - Select Facilities:
   - ✅ AC
   - ✅ TV
   - ✅ Washroom
   - ✅ Nurse Call
4. **Tab 3** - Pricing:
   - Daily Rate: $500
   - Hourly Rate: $25
   - Oxygen: ON ($50/day)
   - Monitor: OFF
   - Ventilator: OFF
5. Click "Add Bed"
6. Success!

**Result:**
- New bed GEN-A-25 created
- Available for assignment
- Daily rate: $550 (with oxygen)

---

### Use Case 2: Add ICU Bed with Full Equipment

**Scenario**: Add fully-equipped ICU bed

**Steps:**
1. Click "Add Bed"
2. **Tab 1**:
   - Bed Number: ICU-13
   - Ward: ICU - Intensive Care Unit
   - Floor: 3
   - Section: (none)
   - Bed Type: ICU
   - Status: Available
3. **Tab 2** - Select Facilities:
   - ✅ Ventilator (from facilities list)
   - ✅ Monitor (from facilities list)
   - ✅ Oxygen (from facilities list)
   - ✅ Emergency Equipment
   - ✅ Nurse Call
4. **Tab 3** - Pricing:
   - Daily Rate: $3,500
   - Oxygen: ON ($50/day)
   - Monitor: ON ($100/day)
   - Ventilator: ON ($500/day)
5. Click "Add Bed"

**Result:**
- ICU-13 created with all equipment
- Total daily rate: $4,150
- Ready for critical patients

---

### Use Case 3: Add Private Deluxe Room

**Scenario**: Add premium private room

**Steps:**
1. Click "Add Bed"
2. **Tab 1**:
   - Bed Number: PVT-25
   - Ward: Private Ward
   - Floor: 4
   - Section: B
   - Bed Type: Deluxe
   - Status: Available
3. **Tab 2** - Select Facilities (Premium):
   - ✅ AC
   - ✅ TV
   - ✅ Attached Bathroom
   - ✅ WiFi
   - ✅ Refrigerator
   - ✅ Sofa
   - ✅ Wardrobe
   - ✅ Study Table
   - ✅ Telephone
   - ✅ Safe Locker
   - ✅ Mini Bar
   - ✅ Nurse Call
4. **Tab 3** - Pricing:
   - Daily Rate: $2,500
   - Hourly Rate: $125
   - Weekly Rate: $16,000 (save $1,500)
   - Monthly Rate: $60,000 (save $15,000)
   - Oxygen: ON ($50/day)
   - Monitor: ON ($100/day)
5. Click "Add Bed"

**Result:**
- Deluxe room PVT-25 created
- All premium amenities
- Package rates available
- Daily: $2,650
- Weekly: $16,000
- Monthly: $60,000

---

## Pricing Strategy Examples

### General Ward
```
Daily:   $500
Hourly:  $25
Weekly:  $3,000 (save $500)
Monthly: $12,000 (save $3,000)
```

### ICU
```
Daily:   $3,500
Hourly:  Not applicable (minimum 24h)
Weekly:  Not applicable (critical care)
Monthly: Not applicable
+ Oxygen: $50/day
+ Monitor: $100/day
+ Ventilator: $500/day
```

### Private
```
Daily:   $1,500
Hourly:  $75
Weekly:  $9,000 (save $1,500)
Monthly: $35,000 (save $10,000)
```

### Deluxe
```
Daily:   $2,500
Hourly:  $125
Weekly:  $16,000 (save $1,500)
Monthly: $60,000 (save $15,000)
```

---

## Best Practices

### Naming Convention
- Use consistent format across hospital
- Include ward code, section, and number
- Examples:
  - GEN-A-01 to GEN-A-30
  - ICU-01 to ICU-12
  - PVT-A-01 to PVT-B-20
  - DEL-01 to DEL-10

### Facility Selection
- Be accurate - affects patient expectations
- General wards: Basic amenities
- Private rooms: More facilities
- Deluxe: All available facilities

### Pricing Guidelines
- Research market rates
- Consider operational costs
- Equipment charges should reflect maintenance
- Offer package discounts for long stays

### Equipment Configuration
- ICU: All equipment ON by default
- General: Oxygen optional, rarely ventilator
- Private: Monitor optional
- Deluxe: As requested

---

## Error Handling

### Duplicate Bed Number
**Error**: "Bed number GEN-A-07 already exists in this ward"
**Solution**: Use next available number

### Missing Required Field
**Error**: "Please fill in all required fields"
**Solution**: Complete Bed Number, Bed Type, and Daily Rate

### Invalid Daily Rate
**Error**: "Daily rate must be greater than $0"
**Solution**: Enter valid positive number

### Floor Out of Range
**Error**: "Floor number should be between 1 and 10"
**Solution**: Enter valid floor number

---

## Integration Points

### 1. Ward Statistics
- Total bed count auto-updates
- Available beds increment (if status = available)
- Occupancy percentage recalculates

### 2. Bed Assignment
- New bed immediately available for patient assignment
- Appears in bed selection dropdowns
- Shows in IPD admission flow

### 3. Billing System
- Daily rates configured
- Equipment charges set
- Package rates available
- Auto-calculation enabled

### 4. Inventory Management
- Facilities linked to requirements
- Equipment tracking
- Maintenance scheduling

---

This comprehensive Add Bed feature ensures complete configuration of new beds with all necessary details for patient care and billing automation.
