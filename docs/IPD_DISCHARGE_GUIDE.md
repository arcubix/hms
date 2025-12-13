# IPD Patient Discharge Guide

## Overview

This guide explains the complete process of discharging an IPD (Inpatient Department) patient from the hospital using the HMS system. The discharge process involves multiple steps including medical documentation, medication prescriptions, billing settlement, and bed release.

## Prerequisites

- Patient must be currently admitted (status: 'admitted', 'under-treatment', 'stable', or 'critical')
- Access to IPD Management module
- Appropriate user permissions (Doctor, Admin, or Billing Staff)

## Discharge Workflow

### Step 1: Access Patient Details

1. Navigate to **IPD Management** module
2. Go to **Admissions** section
3. Select the patient you want to discharge from the admissions list
4. Click on the patient row to open patient details view

### Step 2: Initiate Discharge Process

1. In the patient details view header, locate the **Discharge Patient** button
   - The button is located in the top-right action buttons area
   - It appears between "Collect Payment" and "Daily Visit" buttons
   - The button is only visible if the patient is NOT already discharged or absconded
   - Button text: "Discharge Patient" with a green checkmark icon
   - Button has green background styling

2. Click the **Discharge Patient** button to open the Discharge Dialog

**Note:** If the patient is already discharged or absconded, the button will not appear in the header.

### Step 3: Complete Discharge Summary (Tab 1)

The discharge dialog has 3 tabs. Start with **Tab 1: Discharge Summary**

**Required Fields:**

- **Final Diagnosis** (required)
  - Pre-filled with admission diagnosis (editable)
  - Enter the final/confirmed diagnosis at discharge
  - Can be different from admitting diagnosis

- **Treatment Given** (required)
  - Summary of all treatments provided during admission
  - Include medications, procedures, therapies, etc.

- **Procedures Performed** (optional)
  - List all procedures/surgeries performed
  - Enter one procedure per line

- **Condition at Discharge** (required)
  - Select from dropdown:
    - **Improved**: Patient condition improved
    - **Stable**: Patient condition stable
    - **Critical**: Patient still in critical condition
    - **LAMA**: Left Against Medical Advice
    - **Expired**: Patient expired

- **Discharge Advice** (required)
  - Post-discharge care instructions
  - Include activity restrictions, diet, medications, warning signs

- **Follow-up Date** (optional)
  - Date for follow-up appointment

- **Follow-up Doctor** (optional)
  - Name of doctor for follow-up consultation

### Step 4: Add Discharge Medications (Tab 2)

Switch to **Tab 2: Medications**

**For each medication:**

1. Click **"Add Medication"** button
2. Fill in medication details:
   - **Medication Name**: Name of the medicine
   - **Dosage**: e.g., "500mg", "10ml"
   - **Frequency**: e.g., "Twice daily", "After meals"
   - **Duration**: e.g., "7 days", "2 weeks"
3. Click **X** button to remove a medication if needed

**Additional Fields:**

- **Dietary Advice** (optional)
  - Special dietary instructions
  - Food restrictions or recommendations

- **Activity Restrictions** (optional)
  - Physical activity limitations
  - Exercise restrictions
  - Work/activity recommendations

### Step 5: Final Billing & Payment (Tab 3)

Switch to **Tab 3: Final Billing**

**Review Billing Summary:**

- **Total Charges**: All charges accumulated during stay
- **Paid Amount**: Amount already paid
- **Insurance Coverage**: Insurance covered amount (if applicable)
- **Due Amount**: Outstanding balance (highlighted in red if > 0)

**If Outstanding Amount Exists:**

1. Enter **Payment Amount** (can be partial or full)
2. Select **Payment Mode**:
   - Cash
   - Card
   - UPI
   - Insurance
   - Cheque
3. Payment will be recorded automatically when discharge is completed

**Note:** Discharge can proceed even if full payment is not collected, but outstanding amount will remain in the system.

### Step 6: Complete Discharge

1. Review all information across all 3 tabs
2. Click **"Print Summary"** button if you need a printed copy (optional)
3. Click **"Complete Discharge"** button (green button at bottom)
4. System will:
   - Validate all required fields
   - Create discharge summary record
   - Update admission status to 'discharged'
   - Set discharge date and time
   - Release bed/room assignment
   - Record payment (if provided)
   - Generate audit log entry
5. Success notification will appear: "Patient discharged successfully!"

### Step 7: Post-Discharge Actions

After successful discharge:

- Patient status changes to 'discharged'
- Bed/room becomes available for new admissions
- Discharge summary is saved and can be retrieved later
- Patient appears in "Discharges" section
- Billing records are finalized
- Discharge button disappears from patient details header

## System Processes (Backend)

When discharge is completed, the system automatically:

1. **Creates Discharge Summary Record**
   - Stores in `ipd_discharge_summaries` table
   - Links to admission and patient records
   - Stores all discharge information including medications (as JSON)

2. **Updates Admission Status**
   - Changes status from current state to 'discharged'
   - Sets `discharge_date` and `discharge_time` in `ipd_admissions` table

3. **Releases Resources**
   - Releases bed assignment (sets bed status to 'available')
   - Releases room assignment (if applicable)
   - Updates bed/room occupancy counts

4. **Records Payment** (if provided)
   - Creates payment record in billing system
   - Updates billing totals

5. **Audit Logging**
   - Logs discharge action with user ID and timestamp
   - Records patient ID and admission ID

## API Endpoints

**Get Discharge Summary:**

```
GET /api/ipd/admissions/:admission_id/discharge
```

**Create Discharge:**

```
POST /api/ipd/admissions/:admission_id/discharge
```

**Request Body:**

```json
{
  "discharge_date": "2025-12-11",
  "discharge_time": "14:30",
  "final_diagnosis": "Final diagnosis text",
  "treatment_given": "Treatment summary",
  "procedures_performed": ["Procedure 1", "Procedure 2"],
  "condition_at_discharge": "Improved",
  "discharge_advice": "Post-discharge instructions",
  "medications": [
    {
      "name": "Medicine Name",
      "dosage": "500mg",
      "frequency": "Twice daily",
      "duration": "7 days"
    }
  ],
  "follow_up_date": "2025-12-18",
  "follow_up_doctor_name": "Dr. Smith",
  "dietary_advice": "Diet instructions",
  "activity_restrictions": "Activity limitations"
}
```

## Important Notes

1. **Required Fields**: Final Diagnosis, Treatment Given, Condition at Discharge, and Discharge Advice are mandatory
2. **Bed Release**: Bed/room is automatically released upon discharge
3. **Payment**: Payment collection is optional but recommended before discharge
4. **Discharge Time**: Automatically set to current date/time if not specified
5. **Medications**: Can be added later or updated if discharge summary is edited
6. **Print Summary**: Discharge summary can be printed for patient records
7. **Follow-up**: Follow-up appointment can be scheduled during discharge
8. **Button Visibility**: Discharge button only appears for active admissions (not discharged or absconded)

## Troubleshooting

**Issue: "Discharge button not visible"**

- Verify patient status is not 'discharged' or 'absconded'
- Check that you're viewing the patient details page (not the admissions list)
- Ensure you have appropriate permissions (Doctor, Admin, or Billing Staff)
- Refresh the page if patient status was recently changed

**Issue: "Failed to discharge patient"**

- Check all required fields are filled (Final Diagnosis, Treatment Given, Condition at Discharge, Discharge Advice)
- Verify patient admission exists
- Check user permissions
- Review server logs for detailed error

**Issue: "Bed not released"**

- Check bed assignment in admission record
- Verify bed model release function
- Check database constraints

**Issue: "Payment not recorded"**

- Payment recording failure doesn't prevent discharge
- Payment can be recorded separately later
- Check payment API endpoint

## Related Files

- Frontend Component: `frontend/src/components/modules/IPDManagement.tsx`
  - DischargeDialog component (lines 8323-8741)
  - Patient details header action buttons (lines 1575-1593) - **Discharge button implemented**
- Backend Controller: `application/controllers/Ipd.php` (discharge method)
- Backend Model: `application/models/Ipd_discharge_model.php`
- Database Schema: `database/ipd_discharge_summaries_schema.sql`
- API Service: `frontend/src/services/api.ts` (createIPDDischarge method)

## User Roles & Permissions

- **Doctor**: Can create discharge summaries, prescribe medications
- **Admin**: Full access to discharge process
- **Billing Staff**: Can process payments during discharge
- **Nurse**: Typically view-only access to discharge summaries

## Visual Guide

### Discharge Button Location

The Discharge Patient button appears in the patient details header:

```
[Back] Patient Name (IPD Number • MRN • UHID)
                                    [Collect Payment] [Discharge Patient] [Daily Visit] [Print Visit]
```

- **Green button** with checkmark icon
- Only visible for active admissions
- Positioned between payment and visit buttons

### Discharge Dialog Structure

```
┌─────────────────────────────────────────┐
│  Discharge Patient                      │
│  Complete discharge summary and billing │
├─────────────────────────────────────────┤
│  [Discharge Summary] [Medications] [Final Billing] │
├─────────────────────────────────────────┤
│  Tab Content Area                       │
│  (3 tabs with forms)                    │
├─────────────────────────────────────────┤
│  [Cancel] [Print Summary] [Complete Discharge] │
└─────────────────────────────────────────┘
```

---

**Last Updated**: December 11, 2025
**Version**: 1.0

