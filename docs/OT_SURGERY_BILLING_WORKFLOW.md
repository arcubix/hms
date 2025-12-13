# OT Surgery Management & Billing Workflow Guide

## Table of Contents
1. [Overview](#overview)
2. [Complete Workflow Diagram](#complete-workflow-diagram)
3. [Phase 1: OT Scheduling](#phase-1-ot-scheduling)
4. [Phase 2: Pre-Operative Preparation](#phase-2-pre-operative-preparation)
5. [Phase 3: Surgery Execution](#phase-3-surgery-execution)
6. [Phase 4: Post-Operative](#phase-4-post-operative)
7. [Phase 5: Billing & Payment](#phase-5-billing--payment)
8. [Integration Points](#integration-points)
9. [User Roles & Permissions](#user-roles--permissions)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The OT Surgery Management system handles the complete lifecycle of surgical procedures from initial scheduling through final billing. This document provides a detailed walkthrough of each phase in the workflow.

### Key Components
- **OT Scheduling**: Book operation theatre slots
- **Pre-Op Checklist**: Verify patient and equipment readiness
- **Surgery Execution**: Track surgery progress and duration
- **Consumables Tracking**: Record items used during surgery
- **Billing**: Calculate and collect surgery charges
- **Integration**: Link with IPD billing system

---

## Complete Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    OT SURGERY WORKFLOW                          │
└─────────────────────────────────────────────────────────────────┘

1. SCHEDULING PHASE
   ┌──────────────┐
   │ IPD Patient  │
   │  Admitted    │
   └──────┬───────┘
          │
          ▼
   ┌─────────────────────┐
   │ Book OT Schedule     │
   │ - Select OT          │
   │ - Choose Date/Time   │
   │ - Assign Team        │
   │ - Set Duration       │
   └──────┬───────────────┘
          │
          ▼
   ┌─────────────────────┐
   │ Check Availability   │
   │ - OT Available?      │
   │ - Team Available?    │
   │ - Conflicts?         │
   └──────┬───────────────┘
          │
          ▼
   ┌─────────────────────┐
   │ Schedule Confirmed   │
   │ Status: Scheduled    │
   └──────┬───────────────┘
          │
          ▼
2. PRE-OPERATIVE PHASE
   ┌─────────────────────┐
   │ Pre-Op Checklist    │
   │ - Patient Prep      │
   │ - Equipment Check   │
   │ - Team Briefing     │
   └──────┬───────────────┘
          │
          ▼
   ┌─────────────────────┐
   │ All Items Complete? │
   └──────┬───────────────┘
          │ Yes
          ▼
   ┌─────────────────────┐
   │ Ready for Surgery    │
   └──────┬───────────────┘
          │
          ▼
3. SURGERY EXECUTION
   ┌─────────────────────┐
   │ Start Surgery        │
   │ Status: In Progress │
   │ - Record Start Time │
   └──────┬───────────────┘
          │
          ▼
   ┌─────────────────────┐
   │ During Surgery       │
   │ - Track Duration     │
   │ - Record Consumables │
   │ - Monitor Progress   │
   └──────┬───────────────┘
          │
          ▼
   ┌─────────────────────┐
   │ Complete Surgery     │
   │ Status: Completed   │
   │ - Record End Time    │
   │ - Calculate Duration │
   │ - Note Complications │
   └──────┬───────────────┘
          │
          ▼
4. POST-OPERATIVE
   ┌─────────────────────┐
   │ Post-Op Notes       │
   │ - Recovery Status    │
   │ - Complications      │
   │ - Follow-up Plan     │
   └──────┬───────────────┘
          │
          ▼
5. BILLING PHASE
   ┌─────────────────────┐
   │ Calculate Charges    │
   │ - Surgeon Fees       │
   │ - OT Charges         │
   │ - Anesthesia         │
   │ - Consumables        │
   └──────┬───────────────┘
          │
          ▼
   ┌─────────────────────┐
   │ Add to IPD Bill      │
   │ - Link to Admission  │
   │ - Update Totals      │
   └──────┬───────────────┘
          │
          ▼
   ┌─────────────────────┐
   │ Collect Payment      │
   │ - Advance (if any)   │
   │ - Final Payment      │
   └─────────────────────┘
```

---

## Phase 1: OT Scheduling

### Step-by-Step Process

#### 1.1 Access OT Scheduling
- **Location**: IPD Management → OT Schedules tab
- **User**: Doctor, Admin, OT Coordinator
- **Prerequisites**: Patient must be admitted to IPD

#### 1.2 Create OT Schedule
1. Click **"Book Surgery"** button
2. Select **Admission** (patient must be admitted)
3. Choose **OT Number** (e.g., OT 1, OT 2)
4. Select **Date** and **Time**
5. Enter **Procedure Name** (e.g., "Total Knee Replacement")
6. Select **Procedure Type** (optional)
7. Set **Estimated Duration** (in minutes)
8. Assign **Team Members**:
   - Primary Surgeon (required)
   - Assistant Surgeon (optional)
   - Anesthetist (required)
9. Select **Anesthesia Type**:
   - General
   - Spinal
   - Epidural
   - Local
   - Regional
10. Set **ASA Score** (1-5, optional)
11. Add **Notes** (optional)

#### 1.3 Availability Check
The system automatically checks:
- **OT Availability**: Is the OT free at the requested time?
- **Duration Conflict**: Will the surgery overlap with existing schedules?
- **Team Availability**: Are surgeon/anesthetist available? (Future enhancement)

**If Conflict Detected**:
- System shows error message
- Suggests alternative time slots
- User can reschedule or choose different OT

#### 1.4 Schedule Confirmation
- Schedule is saved with status: **"Scheduled"**
- OT slot is reserved
- Team members are assigned
- Patient record is updated

### Database Changes
- **Table**: `ipd_ot_schedules`
- **Status**: `Scheduled`
- **Fields Created**:
  - `scheduled_date`, `scheduled_time`
  - `surgeon_user_id`, `assistant_surgeon_user_id`, `anesthetist_user_id`
  - `estimated_duration_minutes`
  - `ot_number`

### API Endpoints Used
- `POST /api/ipd/ot-schedules` - Create schedule
- `GET /api/ipd/ot-availability` - Check availability
- `GET /api/ipd/operation-theatres` - List available OTs

---

## Phase 2: Pre-Operative Preparation

### Step-by-Step Process

#### 2.1 Access Pre-Op Checklist
- **Location**: OT Schedules → Click "Pre-Op Checklist" icon on scheduled surgery
- **User**: Nurse, Doctor, OT Coordinator
- **Timing**: Before surgery day or on surgery day

#### 2.2 Complete Patient Preparation Checklist
**Patient Preparation Items**:
1. ✅ **NPO Status**: Patient fasting confirmed (Nothing Per Oral)
2. ✅ **Pre-op Medications**: Required medications given
3. ✅ **Blood Work**: Lab tests completed and reviewed
4. ✅ **Imaging Studies**: X-rays, CT scans, MRIs completed
5. ✅ **Consent Signed**: Surgical and anesthesia consent forms signed
6. ✅ **Patient Identified**: Patient identity verified (name, DOB, ID)

#### 2.3 Complete Equipment Preparation Checklist
**Equipment Items**:
1. ✅ **Instruments Ready**: Surgical instruments sterilized and ready
2. ✅ **Consumables Available**: Gloves, drapes, sutures available
3. ✅ **Equipment Tested**: All equipment tested and functional
4. ✅ **Implants Available**: If needed, implants are ready

#### 2.4 Complete Team Preparation Checklist
**Team Items**:
1. ✅ **Team Briefed**: Surgical team briefed on procedure
2. ✅ **Anesthesia Ready**: Anesthesia equipment and drugs ready

#### 2.5 Add Notes (Optional)
- Any special instructions
- Patient-specific concerns
- Equipment notes

#### 2.6 Mark Checklist as Complete
- Click **"Mark as Complete"** button
- System validates all required items are checked
- **Required Items** (must all be checked):
  - NPO Status
  - Blood Work Completed
  - Imaging Completed
  - Consent Signed
  - Patient Identified
  - Instruments Ready
  - Consumables Available
  - Equipment Tested
  - Team Briefed
  - Anesthesia Ready

**If Incomplete**:
- System shows error: "Please complete all required checklist items"
- User must check all required items before completing

**On Completion**:
- `checklist_completed` = TRUE
- `completed_at` = Current timestamp
- `completed_by_user_id` = Current user
- Checklist is locked (cannot be edited)

### Database Changes
- **Table**: `ipd_pre_op_checklist`
- **Status**: `checklist_completed` = TRUE
- **All boolean fields** updated based on user input

### API Endpoints Used
- `GET /api/ipd/ot-schedules/{id}/pre-op-checklist` - Get checklist
- `PUT /api/ipd/ot-schedules/{id}/pre-op-checklist` - Update checklist

---

## Phase 3: Surgery Execution

### Step-by-Step Process

#### 3.1 Start Surgery
- **Location**: OT Schedules → Click "Start" button (Play icon)
- **User**: Surgeon, OT Coordinator
- **Timing**: When patient enters OT and surgery begins

**Actions**:
1. Click **"Start Surgery"** button
2. Confirm action
3. System automatically:
   - Sets status to **"In Progress"**
   - Records `start_time` = Current time
   - Updates OT schedule record

**Status Change**:
- **Before**: `Scheduled`
- **After**: `In Progress`

#### 3.2 During Surgery
**Optional Actions** (can be done anytime during surgery):
- Add consumables (see Phase 5.2)
- Update notes
- Record complications (if any)

**System Tracking**:
- Real-time duration calculation
- OT is marked as "Occupied"
- Team members marked as "Busy"

#### 3.3 Complete Surgery
- **Location**: OT Schedules → Click "Complete" button (Square icon)
- **User**: Surgeon, OT Coordinator
- **Timing**: When surgery ends

**Actions**:
1. Click **"Complete Surgery"** button
2. Enter **Actual Duration** (in minutes)
3. Enter **Complications** (if any, optional)
4. Click **"Complete"**

**System Actions**:
- Sets status to **"Completed"**
- Records `end_time` = Current time
- Calculates `actual_duration_minutes`
- Updates `complications` field (if provided)
- OT becomes available for next surgery
- Team members marked as "Available"

**Status Change**:
- **Before**: `In Progress`
- **After**: `Completed`

### Database Changes
- **Table**: `ipd_ot_schedules`
- **Fields Updated**:
  - `status` = 'Completed'
  - `start_time` = Recorded at start
  - `end_time` = Recorded at completion
  - `actual_duration_minutes` = Calculated or entered
  - `complications` = User entered (optional)

### API Endpoints Used
- `POST /api/ipd/ot-schedules/{id}/start` - Start surgery
- `POST /api/ipd/ot-schedules/{id}/complete` - Complete surgery

---

## Phase 4: Post-Operative

### Step-by-Step Process

#### 4.1 Post-Op Documentation
- **Location**: OT Schedules → View Details → Post-Op section
- **User**: Surgeon, Doctor
- **Timing**: After surgery completion

**Information Recorded**:
- Surgery notes (already in `notes` field)
- Complications (if any)
- Recovery status
- Follow-up instructions

#### 4.2 Recovery Monitoring
- Patient transferred to recovery room
- Vital signs monitored
- Pain management
- Wound care

**Note**: Detailed recovery tracking is handled in IPD Vital Signs and Nursing Notes modules.

### Database Changes
- **Table**: `ipd_ot_schedules`
- **Fields**: `notes`, `complications` (already updated in Phase 3)

---

## Phase 5: Billing & Payment

### Step-by-Step Process

#### 5.1 Access Surgery Billing
- **Location**: OT Schedules → Completed surgery → Click "Billing" icon (DollarSign)
- **User**: Billing Staff, Admin
- **Timing**: After surgery completion

#### 5.2 Add Consumables (During or After Surgery)

**Add Consumable Item**:
1. Click **"Add Consumable"** button
2. Enter **Item Name** (e.g., "Surgical Gloves")
3. Select **Item Type**:
   - Instrument
   - Disposable
   - Implant
   - Equipment
   - Other
4. Enter **Quantity**
5. Enter **Unit Price**
6. System calculates **Total Price** = Quantity × Unit Price
7. Enter **Serial Number** (for implants)
8. Enter **Batch Number** (for consumables)
9. Add **Notes** (optional)
10. Click **"Add Consumable"**

**Consumables Automatically Update**:
- `consumables_charge` = Sum of all non-implant consumables
- `implants_charge` = Sum of all implant consumables
- `consumables_details` = JSON array of all items

#### 5.3 Calculate Surgery Charges

**Charge Components**:

1. **Surgeon Fees**:
   - **Surgeon Fee**: Enter amount
   - **Assistant Surgeon Fee**: Enter amount (if applicable)
   - **Surgeon Share**: Calculated if surgeon has share percentage

2. **OT Charges** (Auto-calculated if surgery completed):
   - **OT Room Charge**: Based on actual duration
     - Formula: `max(actual_duration, minimum_charge_hours) × hourly_rate`
   - **OT Equipment Charge**: Enter if special equipment used
   - **OT Overtime Charge**: If actual > estimated duration
     - Formula: `(actual_duration - estimated_duration) × hourly_rate`

3. **Anesthesia Charges**:
   - **Anesthetist Fee**: Enter amount
   - **Anesthesia Type Charge**: Based on type (General > Spinal > Local)
   - **Anesthesia Duration Charge**: Based on duration

4. **Consumables** (Auto-calculated from consumables list):
   - **Consumables Charge**: Sum of disposables/instruments
   - **Implants Charge**: Sum of implants

5. **Procedure Charges**:
   - **Procedure Base Charge**: Enter base amount
   - **Complexity Multiplier**: Set multiplier (1.0 = simple, 1.5 = moderate, 2.0 = complex)
   - **Procedure Final Charge**: Auto-calculated = Base × Multiplier

6. **Payment Adjustments**:
   - **Discount**: Enter discount amount
   - **Tax**: Enter tax amount
   - **Advance Paid**: Enter advance payment (if collected before surgery)
   - **Paid Amount**: Enter amount paid after surgery

**Automatic Calculations**:
```
Subtotal = Surgeon Fee + Assistant Fee + OT Room + OT Equipment + OT Overtime
         + Anesthetist Fee + Anesthesia Type + Anesthesia Duration
         + Consumables + Implants + Procedure Final Charge

Total Amount = Subtotal - Discount + Tax

Due Amount = Total Amount - Advance Paid - Paid Amount

Payment Status:
- If Due Amount <= 0: "paid"
- Else if Paid Amount > 0 or Advance Paid > 0: "partial"
- Else: "pending"
```

#### 5.4 Save Charges
1. Review all charges
2. Verify calculations
3. Click **"Save Charges"** button
4. System saves to `ipd_surgery_charges` table
5. Charges are linked to OT schedule and admission

#### 5.5 Integration with IPD Billing

**Automatic Integration**:
- Surgery charges are automatically included in IPD bill
- When viewing IPD billing for the admission:
  - Surgery charges appear in `procedure_charges` section
  - Total includes surgery charges
  - Breakdown shows individual surgery charges

**Manual Integration** (if needed):
- Link `billing_id` in `ipd_surgery_charges` to `ipd_billing.id`
- This ensures charges are included in final IPD bill

#### 5.6 Payment Collection

**Advance Payment** (Before Surgery):
- Collect 50-70% of estimated surgery cost
- Record in `advance_paid` field
- Applied to final bill

**Final Payment** (After Surgery):
- Calculate actual charges
- Collect remaining balance
- Record in `paid_amount` field
- Update `payment_status`

**Payment Methods**:
- Cash
- Card
- UPI
- Bank Transfer
- Insurance (if applicable)

### Database Changes

**Table**: `ipd_surgery_charges`
- All charge fields saved
- Totals calculated and saved
- Payment status updated

**Table**: `ipd_surgery_consumables`
- Each consumable item saved
- Linked to surgery charges

**Table**: `ipd_billing`
- Surgery charges included in `procedure_charges` JSON field
- Or linked via `billing_id` foreign key

### API Endpoints Used
- `GET /api/ipd/surgeries/{ot_schedule_id}/charges` - Get charges
- `POST /api/ipd/surgeries/{ot_schedule_id}/charges` - Create charges
- `PUT /api/ipd/surgeries/{ot_schedule_id}/charges` - Update charges
- `GET /api/ipd/surgeries/{ot_schedule_id}/consumables` - Get consumables
- `POST /api/ipd/surgeries/{ot_schedule_id}/consumables` - Add consumable
- `PUT /api/ipd/surgeries/{ot_schedule_id}/consumables/{id}` - Update consumable
- `DELETE /api/ipd/surgeries/{ot_schedule_id}/consumables/{id}` - Delete consumable

---

## Integration Points

### 1. IPD Admission Integration
- Surgeries are part of IPD admission
- `ipd_ot_schedules.admission_id` links to `ipd_admissions.id`
- Surgery charges added to IPD bill
- Surgery status affects patient care plan

### 2. User/Doctor Management
- Surgeons, assistants, anesthetists are users
- `surgeon_user_id`, `assistant_surgeon_user_id`, `anesthetist_user_id` link to `users.id`
- User availability can be checked (future enhancement)
- Surgeon fee structure from user settings (future enhancement)

### 3. Billing System Integration
- Surgery charges integrated into IPD billing
- Uses `PaymentProcessor` library for payment collection
- Surgery charges in `ipd_billing.procedure_charges` JSON field
- Or separate `ipd_surgery_charges` table linked via `billing_id`

### 4. Inventory Integration (Future)
- Consumables can link to inventory system
- Stock deduction for consumables used
- Implant tracking with serial numbers

---

## User Roles & Permissions

### OT Coordinator
- **Can**: Create, edit, cancel OT schedules
- **Can**: Complete pre-op checklist
- **Can**: Start/complete surgeries
- **Can**: Add consumables
- **Cannot**: Create billing (unless also billing staff)

### Surgeon
- **Can**: View assigned surgeries
- **Can**: Start/complete own surgeries
- **Can**: Add surgery notes
- **Can**: View pre-op checklist
- **Cannot**: Create schedules (unless also coordinator)

### Billing Staff
- **Can**: View all surgeries
- **Can**: Create/update surgery charges
- **Can**: Add consumables
- **Can**: Collect payments
- **Cannot**: Start/complete surgeries

### Admin
- **Can**: All operations
- **Can**: Manage OT master data
- **Can**: View reports

---

## Troubleshooting

### Common Issues

#### Issue 1: OT Not Available
**Problem**: Cannot book OT at requested time
**Solution**:
- Check existing schedules for that OT
- Choose different time slot
- Choose different OT
- System suggests alternative slots

#### Issue 2: Cannot Complete Pre-Op Checklist
**Problem**: "Please complete all required items" error
**Solution**:
- Check all required items are checked
- Required items are marked with asterisk (*)
- Cannot mark complete until all required items done

#### Issue 3: Charges Not Calculating
**Problem**: OT charges showing as 0
**Solution**:
- Ensure surgery is completed (has `actual_duration_minutes`)
- Check OT master data has `hourly_rate` set
- Manually enter OT charges if needed

#### Issue 4: Consumables Not Updating Charges
**Problem**: Consumables added but charges not updated
**Solution**:
- Ensure consumable has `surgery_charges_id` linked
- Charges auto-update when consumable added/updated/deleted
- Refresh charges page

#### Issue 5: Surgery Charges Not in IPD Bill
**Problem**: Charges created but not showing in IPD bill
**Solution**:
- Check `billing_id` is linked in `ipd_surgery_charges`
- Verify IPD bill includes `procedure_charges` JSON field
- Surgery charges should appear in procedure charges section

---

## Workflow Summary

### Quick Reference

1. **Schedule**: Book OT → Check availability → Confirm
2. **Pre-Op**: Complete checklist → Verify readiness → Mark complete
3. **Surgery**: Start → Track duration → Complete
4. **Billing**: Add consumables → Calculate charges → Save → Collect payment
5. **Integration**: Charges automatically added to IPD bill

### Status Flow
```
Scheduled → (Pre-Op Complete) → In Progress → Completed → Billed → Paid
     ↓                              ↓
Cancelled                      Postponed
```

### Key Timestamps
- `scheduled_date`, `scheduled_time` - When surgery is booked
- `start_time` - When surgery actually starts
- `end_time` - When surgery completes
- `actual_duration_minutes` - Calculated duration
- `completed_at` - When pre-op checklist completed
- `created_at` (charges) - When billing created
- `updated_at` - Last modification time

---

## Best Practices

1. **Schedule Early**: Book OT slots as soon as surgery is planned
2. **Complete Pre-Op Early**: Finish checklist day before surgery
3. **Track Consumables Real-Time**: Add items during surgery, not after
4. **Verify Charges**: Review all charges before saving
5. **Link to IPD Bill**: Ensure surgery charges are included in final bill
6. **Document Everything**: Add notes for any special circumstances
7. **Monitor Status**: Regularly check surgery status and completion

---

## Future Enhancements

1. **Team Availability Checking**: Automatic conflict detection for surgeons/anesthetists
2. **OT Calendar View**: Visual calendar with drag-and-drop scheduling
3. **Automated Notifications**: Email/SMS alerts for schedule changes
4. **Inventory Integration**: Automatic stock deduction for consumables
5. **Surgeon Fee Templates**: Pre-defined fee structures by procedure type
6. **Analytics Dashboard**: OT utilization, surgeon performance, revenue reports
7. **Mobile App**: Mobile interface for OT staff

---

**Document Version**: 1.0  
**Last Updated**: 2024-12-09  
**Author**: HMS Development Team

