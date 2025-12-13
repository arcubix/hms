# Surgery Management System - Complete Guide

## Overview

The Surgery Management System is a specialized module within the IPD (Inpatient Department) that handles surgical procedures, Operation Theatre (OT) scheduling, surgery workflow management, and surgery-specific billing. While surgeries are part of IPD admissions, they require specialized resource management, team coordination, and billing components that differ significantly from regular IPD care.

## Table of Contents

1. [Key Differences from General IPD](#key-differences-from-general-ipd)
2. [Surgery Scheduling Components](#surgery-scheduling-components)
3. [Surgery Workflow Management](#surgery-workflow-management)
4. [Surgery Payment & Billing](#surgery-payment--billing)
5. [Database Schema Requirements](#database-schema-requirements)
6. [API Endpoints Required](#api-endpoints-required)
7. [Frontend Components Required](#frontend-components-required)
8. [Integration Points](#integration-points)
9. [Reports & Analytics](#reports--analytics)
10. [Implementation Phases](#implementation-phases)

---

## Key Differences from General IPD

### 1. Resource Scheduling

**IPD**: 
- Patients are assigned to beds/rooms based on availability
- Assignment is on a daily basis (patient stays for days/weeks)
- Simple availability check (bed available or not)

**Surgery**:
- Requires specific OT room booking with precise time slots
- Time-based scheduling (e.g., 8:00 AM - 12:00 PM)
- Multiple resources must be available simultaneously (OT room, surgeon, anesthetist)
- Duration estimation and actual tracking required

### 2. Team Coordination

**IPD**:
- Usually one consulting doctor per patient
- Doctor visits are scheduled independently
- No team coordination required

**Surgery**:
- Requires multiple specialists scheduled together:
  - **Primary Surgeon** (required)
  - **Assistant Surgeon** (often needed for complex surgeries)
  - **Anesthetist** (required for most surgeries)
  - **OT Staff** (nurses, technicians)
- All team members must be available at the same time
- Team availability conflicts must be detected and resolved

### 3. Billing Structure

**IPD Billing (Current)**:
- Room charges (daily rate × number of days)
- Consultation charges (doctor visits × rate per visit)
- Medication charges
- Lab test charges
- Imaging/radiology charges
- Simple procedure charges (basic procedures)

**Surgery Billing (Additional/Enhanced)**:
- **Surgeon Fees** (separate from consultation charges)
  - Primary surgeon fee (fixed amount or percentage-based)
  - Assistant surgeon fee
  - Surgeon share calculation (if applicable)
- **OT Charges** (time-based, not room-based)
  - OT room charge per hour/minute
  - Minimum charge (even if surgery is shorter than estimated)
  - Overtime charges (if surgery exceeds estimated duration)
- **Anesthesia Charges**
  - Anesthetist fee
  - Anesthesia type-based charges (General vs Spinal vs Local)
  - Anesthesia duration-based charges
- **Surgery-Specific Consumables**
  - Surgical instruments usage charges
  - Disposables (gloves, drapes, sutures, etc.)
  - Implants (if applicable - stents, pacemakers, etc.)
  - Special equipment usage charges
- **Surgery Procedure Charges**
  - Base procedure charge (different from simple procedures)
  - Complexity-based pricing (simple vs complex surgery)
  - Multiple procedure discounts (if applicable)

### 4. Workflow Complexity

**IPD Workflow**: 
```
Admission → Daily Care → Discharge
```

**Surgery Workflow** (within IPD admission):
```
Pre-operative → Intra-operative → Post-operative
```

- **Pre-op Phase**: Checklists, consent forms, patient preparation, equipment preparation
- **Intra-op Phase**: Real-time tracking, time recording, complications monitoring
- **Post-op Phase**: Recovery monitoring, surgeon notes, follow-up scheduling

### 5. Status Tracking

**IPD**: 
- Admission status (admitted, under-treatment, discharged, etc.)
- Status affects bed availability

**Surgery**:
- Independent status tracking (Scheduled → In Progress → Completed/Cancelled/Postponed)
- Status affects OT availability
- Can be cancelled/postponed independently of IPD admission
- Multiple surgeries can be scheduled for same patient during one admission

### 6. Time Management

**IPD**: 
- Charges based on days stayed
- Simple calculation: daily rate × days

**Surgery**:
- Charges based on actual surgery duration (minutes/hours)
- Requires start time and end time tracking
- Actual duration vs estimated duration comparison
- Overtime charges calculation

---

## Surgery Scheduling Components

### 1. Operation Theatre (OT) Management

#### OT Rooms as Resources
- OT rooms are specialized resources (OT 1, OT 2, OT 3, etc.)
- Different from patient rooms/beds
- Each OT may have specific specialties:
  - OT 1: General Surgery
  - OT 2: Orthopedics
  - OT 3: Cardiothoracic
  - OT 4: Neurosurgery
  - OT 5: ENT & Ophthalmology
  - OT 6: Obstetrics & Gynecology

#### OT Availability Calendar
- Time-based slot booking (not just bed availability)
- Typical slots: 8:00 AM - 12:00 PM, 1:00 PM - 5:00 PM, etc.
- Block booking for emergency cases
- Maintenance/cleaning time slots
- Weekend/holiday availability

#### OT Equipment Mapping
- Each OT has specific equipment
- Equipment availability affects which surgeries can be scheduled
- Equipment maintenance scheduling

### 2. OT Availability and Booking

#### Time Slot Booking
- Select date and time slot
- Duration estimation (e.g., 2 hours, 4 hours)
- Conflict detection:
  - OT already booked
  - Surgeon unavailable
  - Anesthetist unavailable
  - Patient not ready (pre-op requirements not met)

#### Duration Estimation
- Based on procedure type
- Historical data analysis
- Surgeon preference
- Complexity factors

#### Conflict Detection and Resolution
- Real-time availability checking
- Alternative time slot suggestions
- Surgeon conflict resolution
- OT conflict resolution
- Patient readiness validation

### 3. Surgeon Assignment and Team Management

#### Primary Surgeon (Required)
- Surgeon selection based on:
  - Procedure type/specialty
  - Surgeon availability
  - Surgeon expertise
  - Patient preference (if applicable)
- Surgeon fee calculation
- Surgeon schedule integration

#### Assistant Surgeon (Optional but Often Needed)
- Required for complex surgeries
- Selection based on:
  - Primary surgeon's preference
  - Assistant availability
  - Procedure complexity
- Assistant surgeon fee calculation

#### Anesthetist (Required for Most Surgeries)
- Anesthetist selection based on:
  - Anesthesia type required
  - Anesthetist availability
  - Procedure complexity
  - Patient condition (ASA score)
- Anesthetist fee calculation

#### Team Availability Coordination
- Check all team members' availability
- Send notifications to team members
- Handle last-minute changes
- Backup team assignment (if primary unavailable)

### 4. Anesthesia Planning

#### Anesthesia Type Selection
- **General Anesthesia**: Full unconsciousness
- **Spinal Anesthesia**: Lower body numbing
- **Epidural Anesthesia**: Similar to spinal, different technique
- **Local Anesthesia**: Small area numbing
- **Regional Anesthesia**: Larger area numbing

#### Anesthetist Assignment
- Based on anesthesia type
- Based on procedure complexity
- Based on patient condition (ASA score)

#### Pre-Anesthesia Assessment
- Patient history review
- ASA score calculation (1-5 scale)
- Risk assessment
- Consent forms

### 5. Pre-Operative Requirements

#### Pre-Op Checklists
- Patient preparation checklist:
  - NPO (Nothing Per Oral) status
  - Pre-op medications
  - Blood work completed
  - Imaging studies completed
  - Consent forms signed
  - Patient identification verified
- Equipment preparation checklist:
  - Surgical instruments ready
  - Consumables available
  - Equipment tested
  - Implants available (if needed)

#### Patient Preparation
- Fasting instructions
- Medication adjustments
- Pre-op shower/bathing
- Jewelry removal
- Patient positioning requirements

#### Consent Forms
- Surgical consent form
- Anesthesia consent form
- Blood transfusion consent (if applicable)
- Photography/video consent (if applicable)

### 6. Scheduling Conflicts and Rescheduling

#### Conflict Types
- **Surgeon Conflicts**: Surgeon already scheduled for another surgery
- **OT Conflicts**: OT room already booked
- **Patient Conflicts**: Patient not ready (pre-op requirements not met)
- **Equipment Conflicts**: Required equipment unavailable

#### Rescheduling Workflow
- Identify conflict
- Notify all stakeholders
- Find alternative time slots
- Confirm new schedule
- Update all records
- Notify patient and family

---

## Surgery Workflow Management

### 1. Pre-Operative Phase

#### Pre-Op Assessment
- Patient history review
- Physical examination
- Lab results review
- Imaging studies review
- Risk assessment
- ASA score assignment

#### Pre-Op Checklist Completion
- Patient preparation verified
- Consent forms signed
- Equipment ready
- Team briefed
- Patient ready for surgery

#### Status: Scheduled → Ready for Surgery

### 2. Intra-Operative Phase

#### Surgery Start
- Patient transferred to OT
- Team assembled
- Pre-operative verification (time-out)
- Surgery start time recorded
- Status changed to "In Progress"

#### During Surgery
- Real-time status updates
- Procedure notes entry
- Anesthesia monitoring
- Complications recording (if any)
- Equipment usage tracking
- Consumables usage tracking

#### Surgery End
- Surgery end time recorded
- Actual duration calculated
- Post-operative notes
- Patient transferred to recovery
- Status changed to "Completed"

### 3. Post-Operative Phase

#### Recovery Room Transfer
- Patient transferred to recovery room
- Recovery room monitoring
- Vital signs monitoring
- Pain management
- Wound care

#### Post-Op Complications Tracking
- Immediate complications
- Delayed complications
- Infection tracking
- Readmission tracking (if applicable)

#### Surgeon Post-Op Notes
- Procedure summary
- Findings
- Complications (if any)
- Recommendations
- Follow-up instructions

#### Follow-Up Scheduling
- Post-op visit scheduling
- Suture removal scheduling
- Follow-up tests scheduling

### 4. Status Tracking

#### Status Flow
```
Scheduled → In Progress → Completed
                ↓
           Cancelled/Postponed
```

#### Status Descriptions
- **Scheduled**: Surgery is booked and confirmed
- **In Progress**: Surgery has started
- **Completed**: Surgery finished successfully
- **Cancelled**: Surgery cancelled before start
- **Postponed**: Surgery rescheduled for later

#### Status Impact
- **Scheduled**: OT is reserved, team is assigned
- **In Progress**: OT is occupied, team is busy
- **Completed**: OT available for cleaning, team available
- **Cancelled**: OT available immediately, team available
- **Postponed**: Original slot released, new slot reserved

---

## Surgery Payment & Billing

### 1. Surgery Charges Structure

#### Surgeon Fees
- **Primary Surgeon Fee**:
  - Fixed amount per procedure type
  - Or percentage of total surgery charges
  - Based on surgeon's fee structure
- **Assistant Surgeon Fee**:
  - Usually 30-50% of primary surgeon fee
  - Or fixed amount
- **Surgeon Share Calculation**:
  - If surgeon has share percentage in system
  - Calculate surgeon's share of total charges
  - Track for payment distribution

#### OT Charges
- **OT Room Charge**:
  - Per hour rate (e.g., ₹5,000/hour)
  - Minimum charge (e.g., 2 hours minimum)
  - Based on OT type/specialty
- **Time-Based Calculation**:
  - Actual duration in hours/minutes
  - Round up to nearest 15 minutes or 30 minutes
  - Overtime charges if exceeds estimated duration
- **OT Equipment Charges**:
  - Special equipment usage charges
  - Per use or per hour

#### Anesthesia Charges
- **Anesthetist Fee**:
  - Fixed amount per procedure type
  - Or per hour rate
  - Based on anesthesia type complexity
- **Anesthesia Type-Based Charges**:
  - General anesthesia: Higher charge
  - Spinal/Epidural: Medium charge
  - Local anesthesia: Lower charge
- **Anesthesia Duration Charges**:
  - Additional charges for extended duration
  - Based on actual anesthesia time

#### Surgery Consumables
- **Surgical Instruments**:
  - Instrument usage charges
  - Sterilization charges
- **Disposables**:
  - Gloves, drapes, gowns
  - Sutures, staples
  - Catheters, drains
- **Implants** (if applicable):
  - Stents, pacemakers
  - Joint replacements
  - Plates, screws
  - Tracking by serial numbers

#### Surgery Procedure Charges
- **Base Procedure Charge**:
  - Different from simple procedures
  - Based on procedure complexity
  - Procedure code-based pricing
- **Complexity-Based Pricing**:
  - Simple surgery: Base rate
  - Moderate surgery: Base rate × 1.5
  - Complex surgery: Base rate × 2.0
- **Multiple Procedure Discounts**:
  - If multiple procedures in one session
  - Discount on secondary procedures

### 2. Integration with IPD Billing

#### Surgery Charges in IPD Bill
- Surgery charges added to `ipd_billing.procedure_charges` JSON field
- Or separate `ipd_surgery_charges` table linked to IPD bill
- Total surgery cost included in IPD bill subtotal

#### Billing Calculation Flow
```
IPD Bill Subtotal = 
  Room Charges +
  Consultation Charges +
  Medication Charges +
  Lab Charges +
  Imaging Charges +
  Surgery Charges +  ← Added here
  Other Charges
```

#### Surgery Charges Breakdown in IPD Bill
```json
{
  "surgery_charges": [
    {
      "surgery_id": 123,
      "procedure_name": "Total Knee Replacement",
      "date": "2024-12-09",
      "surgeon_fee": 50000,
      "assistant_surgeon_fee": 15000,
      "ot_charges": 20000,
      "anesthesia_charges": 15000,
      "consumables": 10000,
      "procedure_charge": 30000,
      "total": 140000
    }
  ]
}
```

### 3. Payment Collection Workflow

#### Advance Payment for Scheduled Surgeries
- Collect advance payment before surgery
- Typically 50-70% of estimated surgery cost
- Refundable if surgery cancelled (with terms)
- Applied to final bill

#### Post-Surgery Payment Collection
- Calculate actual charges after surgery
- Adjust for actual duration
- Adjust for consumables used
- Collect remaining balance
- Issue final receipt

#### Surgeon Fee Distribution
- If surgeon has share percentage
- Calculate surgeon's share
- Track for payment to surgeon
- Generate surgeon payment report

---

## Database Schema Requirements

### Existing Tables (Review and Enhance)

#### 1. `ipd_procedures` (Exists)
```sql
CREATE TABLE IF NOT EXISTS `ipd_procedures` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `admission_id` INT(11) NOT NULL,
  `patient_id` INT(11) NOT NULL,
  `procedure_date` DATE NOT NULL,
  `procedure_time` TIME NOT NULL,
  `procedure_name` VARCHAR(255) NOT NULL,
  `procedure_type` VARCHAR(100) DEFAULT NULL,
  `performed_by_user_id` INT(11) DEFAULT NULL,
  `assistant_user_id` INT(11) DEFAULT NULL,
  `anesthesia_type` VARCHAR(100) DEFAULT NULL,
  `procedure_notes` TEXT DEFAULT NULL,
  `complications` TEXT DEFAULT NULL,
  `status` ENUM('scheduled', 'in-progress', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_admission_id` (`admission_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_procedure_date` (`procedure_date`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Enhancements Needed**:
- Add `ot_schedule_id` (link to OT schedule)
- Add `estimated_duration_minutes`
- Add `actual_duration_minutes`
- Add `start_time` and `end_time`
- Add `asa_score`
- Add `surgery_charges_id` (link to surgery charges)

#### 2. `ipd_ot_schedules` (Exists)
```sql
CREATE TABLE IF NOT EXISTS `ipd_ot_schedules` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `admission_id` INT(11) NOT NULL,
  `patient_id` INT(11) NOT NULL,
  `procedure_id` INT(11) DEFAULT NULL,
  `ot_number` VARCHAR(50) NOT NULL,
  `scheduled_date` DATE NOT NULL,
  `scheduled_time` TIME NOT NULL,
  `procedure_name` VARCHAR(255) NOT NULL,
  `procedure_type` VARCHAR(100) DEFAULT NULL,
  `surgeon_user_id` INT(11) DEFAULT NULL,
  `surgeon_name` VARCHAR(255) DEFAULT NULL,
  `assistant_surgeon_user_id` INT(11) DEFAULT NULL,
  `assistant_surgeon_name` VARCHAR(255) DEFAULT NULL,
  `anesthetist_user_id` INT(11) DEFAULT NULL,
  `anesthetist_name` VARCHAR(255) DEFAULT NULL,
  `anesthesia_type` VARCHAR(100) DEFAULT NULL,
  `estimated_duration_minutes` INT(4) DEFAULT NULL,
  `actual_duration_minutes` INT(4) DEFAULT NULL,
  `status` ENUM('Scheduled', 'In Progress', 'Completed', 'Cancelled', 'Postponed') NOT NULL DEFAULT 'Scheduled',
  `start_time` TIME DEFAULT NULL,
  `end_time` TIME DEFAULT NULL,
  `complications` TEXT DEFAULT NULL,
  `asa_score` INT(1) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_by_user_id` INT(11) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_admission_id` (`admission_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_procedure_id` (`procedure_id`),
  INDEX `idx_ot_number` (`ot_number`),
  INDEX `idx_scheduled_date` (`scheduled_date`),
  INDEX `idx_status` (`status`),
  INDEX `idx_surgeon_user_id` (`surgeon_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Status**: Table exists and is well-structured. May need minor enhancements.

### New Tables Required

#### 3. `ipd_surgery_charges` (New)
```sql
CREATE TABLE IF NOT EXISTS `ipd_surgery_charges` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `ot_schedule_id` INT(11) NOT NULL COMMENT 'Foreign key to ipd_ot_schedules.id',
  `procedure_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to ipd_procedures.id',
  `admission_id` INT(11) NOT NULL COMMENT 'Foreign key to ipd_admissions.id',
  `patient_id` INT(11) NOT NULL COMMENT 'Foreign key to patients.id',
  `billing_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to ipd_billing.id',
  
  -- Surgeon Fees
  `surgeon_fee` DECIMAL(10, 2) DEFAULT 0.00,
  `assistant_surgeon_fee` DECIMAL(10, 2) DEFAULT 0.00,
  `surgeon_share_percentage` DECIMAL(5, 2) DEFAULT NULL COMMENT 'Surgeon share % if applicable',
  `surgeon_share_amount` DECIMAL(10, 2) DEFAULT 0.00,
  
  -- OT Charges
  `ot_room_charge` DECIMAL(10, 2) DEFAULT 0.00,
  `ot_equipment_charge` DECIMAL(10, 2) DEFAULT 0.00,
  `ot_duration_hours` DECIMAL(5, 2) DEFAULT 0.00 COMMENT 'Actual OT usage in hours',
  `ot_rate_per_hour` DECIMAL(10, 2) DEFAULT 0.00,
  `ot_minimum_charge` DECIMAL(10, 2) DEFAULT 0.00,
  `ot_overtime_charge` DECIMAL(10, 2) DEFAULT 0.00,
  
  -- Anesthesia Charges
  `anesthetist_fee` DECIMAL(10, 2) DEFAULT 0.00,
  `anesthesia_type_charge` DECIMAL(10, 2) DEFAULT 0.00,
  `anesthesia_duration_charge` DECIMAL(10, 2) DEFAULT 0.00,
  
  -- Consumables
  `consumables_charge` DECIMAL(10, 2) DEFAULT 0.00,
  `implants_charge` DECIMAL(10, 2) DEFAULT 0.00,
  `consumables_details` JSON DEFAULT NULL COMMENT 'Breakdown of consumables used',
  
  -- Procedure Charges
  `procedure_base_charge` DECIMAL(10, 2) DEFAULT 0.00,
  `procedure_complexity_multiplier` DECIMAL(3, 2) DEFAULT 1.00,
  `procedure_final_charge` DECIMAL(10, 2) DEFAULT 0.00,
  
  -- Totals
  `subtotal` DECIMAL(10, 2) DEFAULT 0.00,
  `discount` DECIMAL(10, 2) DEFAULT 0.00,
  `tax` DECIMAL(10, 2) DEFAULT 0.00,
  `total_amount` DECIMAL(10, 2) DEFAULT 0.00,
  
  -- Payment Status
  `advance_paid` DECIMAL(10, 2) DEFAULT 0.00,
  `paid_amount` DECIMAL(10, 2) DEFAULT 0.00,
  `due_amount` DECIMAL(10, 2) DEFAULT 0.00,
  `payment_status` ENUM('pending', 'partial', 'paid') NOT NULL DEFAULT 'pending',
  
  `created_by` INT(11) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_ot_schedule_id` (`ot_schedule_id`),
  INDEX `idx_procedure_id` (`procedure_id`),
  INDEX `idx_admission_id` (`admission_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_billing_id` (`billing_id`),
  INDEX `idx_payment_status` (`payment_status`),
  FOREIGN KEY (`ot_schedule_id`) REFERENCES `ipd_ot_schedules`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`admission_id`) REFERENCES `ipd_admissions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 4. `ipd_surgery_team` (New - Optional, can use existing structure)
```sql
CREATE TABLE IF NOT EXISTS `ipd_surgery_team` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `ot_schedule_id` INT(11) NOT NULL,
  `user_id` INT(11) NOT NULL COMMENT 'Team member user ID',
  `role` ENUM('surgeon', 'assistant_surgeon', 'anesthetist', 'ot_nurse', 'ot_technician', 'other') NOT NULL,
  `fee` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Individual fee for this team member',
  `share_percentage` DECIMAL(5, 2) DEFAULT NULL COMMENT 'Share % if applicable',
  `confirmed` BOOLEAN DEFAULT FALSE COMMENT 'Team member confirmed availability',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_ot_schedule_id` (`ot_schedule_id`),
  INDEX `idx_user_id` (`user_id`),
  FOREIGN KEY (`ot_schedule_id`) REFERENCES `ipd_ot_schedules`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 5. `ipd_pre_op_checklist` (New)
```sql
CREATE TABLE IF NOT EXISTS `ipd_pre_op_checklist` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `ot_schedule_id` INT(11) NOT NULL,
  `admission_id` INT(11) NOT NULL,
  `patient_id` INT(11) NOT NULL,
  
  -- Patient Preparation
  `npo_status` BOOLEAN DEFAULT FALSE COMMENT 'Nothing Per Oral',
  `pre_op_medications_given` BOOLEAN DEFAULT FALSE,
  `blood_work_completed` BOOLEAN DEFAULT FALSE,
  `imaging_completed` BOOLEAN DEFAULT FALSE,
  `consent_signed` BOOLEAN DEFAULT FALSE,
  `patient_identified` BOOLEAN DEFAULT FALSE,
  
  -- Equipment Preparation
  `instruments_ready` BOOLEAN DEFAULT FALSE,
  `consumables_available` BOOLEAN DEFAULT FALSE,
  `equipment_tested` BOOLEAN DEFAULT FALSE,
  `implants_available` BOOLEAN DEFAULT FALSE,
  
  -- Team Preparation
  `team_briefed` BOOLEAN DEFAULT FALSE,
  `anesthesia_ready` BOOLEAN DEFAULT FALSE,
  
  -- Status
  `checklist_completed` BOOLEAN DEFAULT FALSE,
  `completed_by_user_id` INT(11) DEFAULT NULL,
  `completed_at` TIMESTAMP NULL DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_ot_schedule_id` (`ot_schedule_id`),
  INDEX `idx_admission_id` (`admission_id`),
  INDEX `idx_patient_id` (`patient_id`),
  FOREIGN KEY (`ot_schedule_id`) REFERENCES `ipd_ot_schedules`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 6. `ipd_surgery_consumables` (New)
```sql
CREATE TABLE IF NOT EXISTS `ipd_surgery_consumables` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `ot_schedule_id` INT(11) NOT NULL,
  `surgery_charges_id` INT(11) DEFAULT NULL,
  `item_name` VARCHAR(255) NOT NULL,
  `item_type` ENUM('instrument', 'disposable', 'implant', 'equipment', 'other') NOT NULL,
  `quantity` INT(11) NOT NULL DEFAULT 1,
  `unit_price` DECIMAL(10, 2) NOT NULL,
  `total_price` DECIMAL(10, 2) NOT NULL,
  `serial_number` VARCHAR(100) DEFAULT NULL COMMENT 'For implants',
  `batch_number` VARCHAR(100) DEFAULT NULL COMMENT 'For consumables',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_ot_schedule_id` (`ot_schedule_id`),
  INDEX `idx_surgery_charges_id` (`surgery_charges_id`),
  FOREIGN KEY (`ot_schedule_id`) REFERENCES `ipd_ot_schedules`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 7. `operation_theatres` (New - Master Table)
```sql
CREATE TABLE IF NOT EXISTS `operation_theatres` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `ot_number` VARCHAR(50) NOT NULL UNIQUE COMMENT 'OT 1, OT 2, etc.',
  `ot_name` VARCHAR(255) DEFAULT NULL COMMENT 'OT 1 (General Surgery)',
  `specialty` VARCHAR(100) DEFAULT NULL COMMENT 'General Surgery, Orthopedics, etc.',
  `location` VARCHAR(255) DEFAULT NULL,
  `capacity` INT(11) DEFAULT 1 COMMENT 'Number of simultaneous surgeries',
  `hourly_rate` DECIMAL(10, 2) DEFAULT 0.00,
  `minimum_charge_hours` DECIMAL(3, 1) DEFAULT 2.0 COMMENT 'Minimum chargeable hours',
  `equipment` JSON DEFAULT NULL COMMENT 'Available equipment list',
  `status` ENUM('active', 'maintenance', 'inactive') NOT NULL DEFAULT 'active',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ot_number` (`ot_number`),
  INDEX `idx_specialty` (`specialty`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## API Endpoints Required

### OT Scheduling Endpoints

#### 1. Get OT Schedules
```
GET /api/ipd/ot-schedules
Query Parameters:
  - date: Filter by date (YYYY-MM-DD)
  - ot_number: Filter by OT number
  - status: Filter by status
  - surgeon_id: Filter by surgeon
  - patient_id: Filter by patient
Response: Array of OT schedules
```

#### 2. Get OT Schedule by ID
```
GET /api/ipd/ot-schedules/{id}
Response: OT schedule details
```

#### 3. Create OT Schedule
```
POST /api/ipd/ot-schedules
Body: {
  admission_id: number,
  ot_number: string,
  scheduled_date: string (YYYY-MM-DD),
  scheduled_time: string (HH:mm),
  procedure_name: string,
  surgeon_user_id: number,
  assistant_surgeon_user_id?: number,
  anesthetist_user_id: number,
  anesthesia_type: string,
  estimated_duration_minutes: number,
  notes?: string
}
Response: Created OT schedule
```

#### 4. Update OT Schedule
```
PUT /api/ipd/ot-schedules/{id}
Body: Same as create (partial update)
Response: Updated OT schedule
```

#### 5. Delete/Cancel OT Schedule
```
DELETE /api/ipd/ot-schedules/{id}
Response: Success message
```

#### 6. Check OT Availability
```
GET /api/ipd/ot-availability
Query Parameters:
  - ot_number: OT number
  - date: Date to check (YYYY-MM-DD)
  - start_time: Start time (HH:mm)
  - duration_minutes: Duration in minutes
Response: {
  available: boolean,
  conflicts: array,
  alternative_slots: array
}
```

### Surgery Workflow Endpoints

#### 7. Start Surgery
```
POST /api/ipd/ot-schedules/{id}/start
Body: {
  start_time?: string (HH:mm), // Optional, defaults to current time
  notes?: string
}
Response: Updated OT schedule with status "In Progress"
```

#### 8. Complete Surgery
```
POST /api/ipd/ot-schedules/{id}/complete
Body: {
  end_time?: string (HH:mm), // Optional, defaults to current time
  actual_duration_minutes?: number,
  complications?: string,
  notes?: string
}
Response: Updated OT schedule with status "Completed"
```

#### 9. Cancel/Postpone Surgery
```
POST /api/ipd/ot-schedules/{id}/cancel
Body: {
  reason: string,
  reschedule_date?: string,
  reschedule_time?: string
}
Response: Updated OT schedule
```

### Surgery Billing Endpoints

#### 10. Get Surgery Charges
```
GET /api/ipd/surgeries/{ot_schedule_id}/charges
Response: Surgery charges details
```

#### 11. Create/Update Surgery Charges
```
POST /api/ipd/surgeries/{ot_schedule_id}/charges
PUT /api/ipd/surgeries/{ot_schedule_id}/charges
Body: {
  surgeon_fee: number,
  assistant_surgeon_fee?: number,
  ot_room_charge: number,
  anesthetist_fee: number,
  consumables_charge: number,
  procedure_charge: number,
  // ... other charge fields
}
Response: Surgery charges
```

#### 12. Add Surgery Consumables
```
POST /api/ipd/surgeries/{ot_schedule_id}/consumables
Body: {
  item_name: string,
  item_type: string,
  quantity: number,
  unit_price: number
}
Response: Added consumable
```

### Team Management Endpoints

#### 13. Get Surgery Team
```
GET /api/ipd/ot-schedules/{id}/team
Response: Array of team members
```

#### 14. Assign Team Member
```
POST /api/ipd/ot-schedules/{id}/team
Body: {
  user_id: number,
  role: string,
  fee?: number
}
Response: Team member assigned
```

### Pre-Op Checklist Endpoints

#### 15. Get Pre-Op Checklist
```
GET /api/ipd/ot-schedules/{id}/pre-op-checklist
Response: Pre-op checklist details
```

#### 16. Update Pre-Op Checklist
```
PUT /api/ipd/ot-schedules/{id}/pre-op-checklist
Body: {
  npo_status: boolean,
  pre_op_medications_given: boolean,
  // ... other checklist items
  checklist_completed: boolean
}
Response: Updated checklist
```

---

## Frontend Components Required

### 1. OT Schedule Calendar View
**Component**: `OTScheduleCalendar.tsx`
- Monthly/weekly/daily view
- Color-coded by status
- Click to view/edit schedule
- Drag-and-drop rescheduling
- Filter by OT, surgeon, status
- Show conflicts

### 2. Surgery Booking Dialog
**Component**: `SurgeryBookingDialog.tsx`
- Patient selection (from IPD admissions)
- OT selection with availability
- Date/time picker
- Surgeon selection
- Assistant surgeon selection
- Anesthetist selection
- Procedure name and type
- Duration estimation
- Pre-op requirements checklist
- Conflict detection and warnings

### 3. Surgery Workflow Dashboard
**Component**: `SurgeryWorkflow.tsx`
- List of surgeries for today
- Status indicators
- Quick actions (Start, Complete, Cancel)
- Pre-op checklist status
- Team member status
- Real-time updates

### 4. Surgery Details View
**Component**: `SurgeryDetails.tsx`
- Complete surgery information
- Patient details
- Team members
- Timeline (scheduled → started → completed)
- Pre-op checklist
- Consumables used
- Charges breakdown
- Notes and complications

### 5. Surgery Billing Interface
**Component**: `SurgeryBilling.tsx`
- Surgery charges calculation
- Surgeon fee entry
- OT charges calculation (time-based)
- Anesthesia charges
- Consumables entry
- Total calculation
- Link to IPD bill
- Payment collection

### 6. OT Utilization Report
**Component**: `OTUtilizationReport.tsx`
- OT utilization by day/week/month
- Hours used vs available
- Revenue per OT
- Surgeon-wise statistics
- Procedure type frequency

---

## Integration Points

### 1. IPD Admission Integration
- Surgeries are part of IPD admission
- Link `ipd_ot_schedules.admission_id` to `ipd_admissions.id`
- Surgery charges added to IPD bill
- Surgery status affects patient care plan

### 2. Doctor/User Management Integration
- Surgeons, assistants, anesthetists are users
- Link `surgeon_user_id`, `assistant_surgeon_user_id`, `anesthetist_user_id` to `users.id`
- Check user availability from user schedules
- Surgeon fee structure from user settings

### 3. Billing System Integration
- Surgery charges integrated into IPD billing
- Use `PaymentProcessor` library for payment collection
- Surgery charges in `ipd_billing.procedure_charges` JSON field
- Or separate `ipd_surgery_charges` table linked to billing

### 4. Inventory/Consumables Integration
- Track consumables used during surgery
- Link to inventory system (if exists)
- Stock deduction for consumables
- Implant tracking with serial numbers

### 5. Reporting Integration
- Surgery data included in IPD reports
- OT utilization reports
- Surgeon performance reports
- Revenue reports

---

## Reports & Analytics

### 1. OT Utilization Report
- OT usage hours per day/week/month
- Utilization percentage
- Idle time analysis
- Revenue per OT
- Peak hours identification

### 2. Surgeon Performance Report
- Surgeries performed by surgeon
- Average surgery duration
- Complication rate
- Revenue generated
- Patient outcomes

### 3. Surgery Type Frequency Report
- Most common surgeries
- Surgery type distribution
- Trends over time
- Seasonal patterns

### 4. Revenue from Surgeries Report
- Total surgery revenue
- Revenue by surgery type
- Revenue by surgeon
- Revenue by OT
- Revenue trends

### 5. Anesthesia Usage Report
- Anesthesia type distribution
- Anesthetist performance
- Anesthesia duration analysis
- Complications related to anesthesia

### 6. Surgery Schedule vs Performed Report
- Scheduled vs actual surgeries
- Cancellation rate
- Postponement rate
- Reasons for cancellation/postponement

---

## Implementation Phases

### Phase 1: Basic OT Scheduling
**Duration**: 2-3 weeks
**Components**:
- OT master table setup
- Basic OT schedule CRUD
- OT availability checking
- Simple calendar view
- Conflict detection

**Deliverables**:
- `operation_theatres` table
- Enhanced `ipd_ot_schedules` table
- Basic OT scheduling API
- Simple calendar UI

### Phase 2: Surgery Workflow
**Duration**: 2-3 weeks
**Components**:
- Pre-op checklist
- Surgery start/complete workflow
- Status tracking
- Team assignment
- Surgery details view

**Deliverables**:
- `ipd_pre_op_checklist` table
- Workflow API endpoints
- Pre-op checklist UI
- Surgery workflow dashboard

### Phase 3: Surgery Billing
**Duration**: 2-3 weeks
**Components**:
- Surgery charges calculation
- Surgeon fee management
- OT time-based charges
- Anesthesia charges
- Consumables tracking
- Integration with IPD billing

**Deliverables**:
- `ipd_surgery_charges` table
- `ipd_surgery_consumables` table
- Surgery billing API
- Surgery billing UI
- IPD billing integration

### Phase 4: Advanced Features and Reports
**Duration**: 2-3 weeks
**Components**:
- Advanced scheduling (recurring, block booking)
- Team management enhancements
- Comprehensive reports
- Analytics dashboard
- Notifications and alerts

**Deliverables**:
- Advanced scheduling features
- Complete reporting system
- Analytics dashboard
- Notification system

---

## Summary

The Surgery Management System is a specialized module that extends IPD functionality to handle surgical procedures. Key differentiators include:

1. **Resource Scheduling**: Time-based OT booking vs daily bed assignment
2. **Team Coordination**: Multiple specialists vs single doctor
3. **Billing Structure**: Complex surgery charges vs simple room/consultation charges
4. **Workflow**: Pre-op → Intra-op → Post-op vs simple admission → discharge
5. **Status Tracking**: Independent surgery status vs admission status
6. **Time Management**: Duration-based charges vs daily charges

The system integrates seamlessly with existing IPD infrastructure while adding specialized components for surgery management, ensuring comprehensive patient care and accurate billing.

