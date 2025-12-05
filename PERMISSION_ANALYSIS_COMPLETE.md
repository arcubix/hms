# Complete Permission System Analysis

## Overview

This document provides a comprehensive analysis comparing all permissions used in the HMS system (frontend and backend) with permissions stored in the database. This analysis helps identify missing permissions, unused permissions, and inconsistencies.

**Analysis Date:** Generated automatically  
**System:** HMS (Hospital Management System)

---

## 1. Permissions Used in Frontend

### 1.1 Frontend Components Using Permissions

#### User Management Module
- **`admin.create_users`** - Used in `UserList.tsx` (Add New User button)
- **`admin.view_users`** - Used in `UserList.tsx` (PermissionGuard for user list)
- **`admin.edit_users`** - Used in:
  - `UserList.tsx` (Edit button)
  - `UserSettings.tsx` (Save Changes button)
  - `AddUser.tsx` (Update button when editing)
  - `Contacts.tsx` (Edit/Delete buttons)
- **`admin.delete_users`** - Used in:
  - `UserList.tsx` (Delete button)
  - `Contacts.tsx` (Delete button)

#### Doctor Management Module
- **`create_doctors`** - Used in `DoctorList.tsx` (Add Doctor button)
- **`edit_doctors`** - Used in `DoctorList.tsx` (Edit button)

#### Patient Management Module
- **`create_patients`** - Used in `PatientList.tsx` (Add Patient button)
- **`edit_patients`** - Used in `PatientList.tsx` (Edit button)
- **`delete_patients`** - Used in `PatientList.tsx` (Delete button)

#### Support Tickets Module
- **`manage_support_tickets`** - Used in `SupportTickets.tsx` (Actions card, status change buttons)

### 1.2 Summary: Frontend Permissions (11 unique)

1. `admin.create_users`
2. `admin.view_users`
3. `admin.edit_users`
4. `admin.delete_users`
5. `create_doctors`
6. `edit_doctors`
7. `create_patients`
8. `edit_patients`
9. `delete_patients`
10. `manage_support_tickets`

---

## 2. Permissions Used in Backend

### 2.1 Permissions from Config File (`application/config/permissions.php`)

#### Admin Permissions
- `admin.view_users` - Used extensively (Users, Audit_logs, System_settings, Doctors, Departments, Rooms, etc.)
- `admin.edit_users` - Used extensively (Users, Departments, Rooms, Medicines, etc.)
- `admin.create_users` - Used in Users, Doctors controllers
- `admin.delete_users` - Used in Users, Doctors controllers
- `admin.view_financial_reports` - Used in Dashboard, Pharmacy_reports, Ipd_reports
- `admin.view_other_reports` - Used in Dashboard, Pharmacy_reports, Ipd_reports, Message_statistics
- `admin.view_billing` - Used in Pharmacy_sales controller

#### Doctor Permissions
- `doctor.view_patient_profiles` - Used in Prescriptions, Patients controllers
- `doctor.view_all_patients` - Used in Patients, Ipd controllers
- `doctor.search_view_patients` - Used in Patients controller
- `doctor.add_appointment` - Used in Appointments, Tokens controllers
- `doctor.delete_token_appointment` - Used in Appointments, Tokens controllers
- `doctor.delete_patient` - Used in Patients controller
- `doctor.emergency_consultant` - Used in Emergency controller
- `doctor.view_patients_report` - Used in Ipd_reports controller

#### Laboratory Permissions
- `lab_manager.view_lab_reports` - Used in Lab_tests controller
- `lab_manager.edit_lab_reports` - Used in Lab_tests controller
- `lab_manager.delete_lab_reports` - Used in Lab_tests controller
- `lab_manager.create_lab_invoice` - Used in Lab_tests controller
- `lab_manager.revert_completed_reports` - Used in Lab_tests controller
- `lab_technician.view_lab_reports` - Used in Lab_tests controller
- `lab_technician.create_lab_reports` - Used in Lab_tests controller
- `lab_technician.edit_lab_reports` - Used in Lab_tests controller
- `lab_technician.delete_lab_reports` - Used in Lab_tests controller
- `lab_technician.validate_tests` - Used in Lab_tests controller

#### Radiology Permissions
- `radiology_manager.view_radiology_reports` - Used in Radiology_tests controller
- `radiology_manager.edit_radiology_report` - Used in Radiology_tests controller
- `radiology_manager.delete_radiology_report` - Used in Radiology_tests controller
- `radiology_manager.revert_completed_tests` - Used in Radiology_tests controller
- `radiology_technician.view_radiology_reports` - Used in Radiology_tests controller
- `radiology_technician.add_radiology_reports` - Used in Radiology_tests controller
- `radiology_technician.edit_radiology_procedures` - Used in Radiology_tests controller
- `radiology_technician.validate_tests` - Used in Radiology_tests controller

### 2.2 Permissions from Controllers (Direct Usage)

#### Additional Permissions Found in Controllers
- `view_doctors` - Used in Doctors.php (as alternative to admin.view_users)
- `create_doctors` - Used in Doctors.php (as alternative to admin.create_users)
- `edit_doctors` - Used in Doctors.php (as alternative to admin.edit_users)
- `delete_doctors` - Used in Doctors.php (as alternative to admin.delete_users)

### 2.3 Summary: Backend Permissions (40+ unique)

**Admin (7):**
1. `admin.view_users`
2. `admin.edit_users`
3. `admin.create_users`
4. `admin.delete_users`
5. `admin.view_financial_reports`
6. `admin.view_other_reports`
7. `admin.view_billing`

**Doctor (8):**
1. `doctor.view_patient_profiles`
2. `doctor.view_all_patients`
3. `doctor.search_view_patients`
4. `doctor.add_appointment`
5. `doctor.delete_token_appointment`
6. `doctor.delete_patient`
7. `doctor.emergency_consultant`
8. `doctor.view_patients_report`

**Laboratory (10):**
1. `lab_manager.view_lab_reports`
2. `lab_manager.edit_lab_reports`
3. `lab_manager.delete_lab_reports`
4. `lab_manager.create_lab_invoice`
5. `lab_manager.revert_completed_reports`
6. `lab_technician.view_lab_reports`
7. `lab_technician.create_lab_reports`
8. `lab_technician.edit_lab_reports`
9. `lab_technician.delete_lab_reports`
10. `lab_technician.validate_tests`

**Radiology (8):**
1. `radiology_manager.view_radiology_reports`
2. `radiology_manager.edit_radiology_report`
3. `radiology_manager.delete_radiology_report`
4. `radiology_manager.revert_completed_tests`
5. `radiology_technician.view_radiology_reports`
6. `radiology_technician.add_radiology_reports`
7. `radiology_technician.edit_radiology_procedures`
8. `radiology_technician.validate_tests`

**Doctor Management (4):**
1. `view_doctors`
2. `create_doctors`
3. `edit_doctors`
4. `delete_doctors`

**Support Tickets (1):**
1. `manage_support_tickets` (not found in config, but used in frontend)

---

## 3. Permissions Stored in Database

### 3.1 Permissions from `database/permissions_master_data.sql`

#### Doctor Role Permissions (12)
1. `doctor.emergency_consultant`
2. `doctor.view_patient_profiles`
3. `doctor.edit_invoices`
4. `doctor.view_all_patients`
5. `doctor.view_patients_report`
6. `doctor.search_view_patients`
7. `doctor.create_health_records`
8. `doctor.add_appointment`
9. `doctor.create_invoice`
10. `doctor.edit_health_records`
11. `doctor.delete_token_appointment`
12. `doctor.edit_payment_invoice_date`
13. `doctor.delete_patient`

#### Admin Role Permissions (9)
1. `admin.create_users`
2. `admin.view_financial_reports`
3. `admin.edit_leads`
4. `admin.edit_users`
5. `admin.view_other_reports`
6. `admin.delete_users`
7. `admin.delete_patient`
8. `admin.edit_payment_invoice_date`
9. `admin.edit_expenses`

#### Laboratory Manager Permissions (11)
1. `lab_manager.create_lab_invoice`
2. `lab_manager.view_lab_reports`
3. `lab_manager.create_users`
4. `lab_manager.edit_lab_reports`
5. `lab_manager.delete_lab_reports`
6. `lab_manager.edit_users`
7. `lab_manager.edit_lab_templates`
8. `lab_manager.edit_outsourced_labs`
9. `lab_manager.view_inventory_requisition`
10. `lab_manager.delete_lab_templates`
11. `lab_manager.revert_completed_reports`

#### Laboratory Technician Permissions (16)
1. `lab_technician.create_lab_invoice`
2. `lab_technician.edit_lab_templates`
3. `lab_technician.edit_lab_number`
4. `lab_technician.validate_tests`
5. `lab_technician.edit_procedure_rates`
6. `lab_technician.delete_lab_templates`
7. `lab_technician.collect_sample`
8. `lab_technician.lab_tracking`
9. `lab_technician.create_lab_reports`
10. `lab_technician.view_lab_reports`
11. `lab_technician.enter_results`
12. `lab_technician.lab_templates`
13. `lab_technician.edit_lab_reports`
14. `lab_technician.delete_lab_reports`
15. `lab_technician.view_completed_reports`
16. `lab_technician.view_inventory_requisition`

#### Radiology Technician Permissions (12)
1. `radiology_technician.radiology_procedures`
2. `radiology_technician.add_radiology_reports`
3. `radiology_technician.view_completed_reports`
4. `radiology_technician.create_radiology_procedures`
5. `radiology_technician.view_radiology_reports`
6. `radiology_technician.radiology_referrals`
7. `radiology_technician.edit_radiology_procedures`
8. `radiology_technician.enter_results`
9. `radiology_technician.radiology_invoice`
10. `radiology_technician.delete_radiology_procedures`
11. `radiology_technician.validate_tests`
12. `radiology_technician.view_inventory_requisition`

#### Radiology Manager Permissions (10)
1. `radiology_manager.create_radiology_invoice`
2. `radiology_manager.edit_radiology_procedure`
3. `radiology_manager.delete_radiology_procedure`
4. `radiology_manager.edit_users`
5. `radiology_manager.edit_radiology_report`
6. `radiology_manager.view_radiology_reports`
7. `radiology_manager.view_inventory_requisition`
8. `radiology_manager.delete_radiology_report`
9. `radiology_manager.revert_completed_tests`
10. `radiology_manager.create_users`

### 3.2 Permissions from `database/add_missing_permissions.sql`

#### Additional Permissions Added
1. `admin.view_users` - View Users
2. `admin.view_billing` - View Billing
3. `view_doctors` - View Doctors
4. `create_doctors` - Create Doctors
5. `edit_doctors` - Edit Doctors
6. `delete_doctors` - Delete Doctors

### 3.3 Summary: Database Permissions (70+ unique)

**Total unique permissions in database:** ~70+ permissions across all roles

---

## 4. Missing Permissions Analysis

### 4.1 Permissions Used in Code But NOT in Database

#### Critical Missing Permissions
1. **`admin.view_users`** ✅ (Added in `add_missing_permissions.sql`)
   - Used in: Frontend (UserList), Backend (Users, Audit_logs, System_settings, Doctors, Departments, Rooms, etc.)
   - Status: **FIXED** - Added to database

2. **`admin.view_billing`** ✅ (Added in `add_missing_permissions.sql`)
   - Used in: Backend (Pharmacy_sales controller)
   - Status: **FIXED** - Added to database

3. **`view_doctors`** ✅ (Added in `add_missing_permissions.sql`)
   - Used in: Backend (Doctors controller)
   - Status: **FIXED** - Added to database

4. **`create_doctors`** ✅ (Added in `add_missing_permissions.sql`)
   - Used in: Frontend (DoctorList), Backend (Doctors controller)
   - Status: **FIXED** - Added to database

5. **`edit_doctors`** ✅ (Added in `add_missing_permissions.sql`)
   - Used in: Frontend (DoctorList), Backend (Doctors controller)
   - Status: **FIXED** - Added to database

6. **`delete_doctors`** ✅ (Added in `add_missing_permissions.sql`)
   - Used in: Backend (Doctors controller)
   - Status: **FIXED** - Added to database

7. **`manage_support_tickets`** ❌ **STILL MISSING**
   - Used in: Frontend (SupportTickets.tsx)
   - Status: **NOT IN DATABASE** - Needs to be added

8. **`create_patients`** ❌ **STILL MISSING**
   - Used in: Frontend (PatientList.tsx)
   - Status: **NOT IN DATABASE** - Needs to be added

9. **`edit_patients`** ❌ **STILL MISSING**
   - Used in: Frontend (PatientList.tsx)
   - Status: **NOT IN DATABASE** - Needs to be added

10. **`delete_patients`** ❌ **STILL MISSING**
    - Used in: Frontend (PatientList.tsx)
    - Status: **NOT IN DATABASE** - Needs to be added

### 4.2 Summary: Missing Permissions

**Fixed (6):**
- ✅ `admin.view_users`
- ✅ `admin.view_billing`
- ✅ `view_doctors`
- ✅ `create_doctors`
- ✅ `edit_doctors`
- ✅ `delete_doctors`

**Still Missing (4):**
- ❌ `manage_support_tickets`
- ❌ `create_patients`
- ❌ `edit_patients`
- ❌ `delete_patients`

---

## 5. Unused Permissions Analysis

### 5.1 Permissions in Database But NOT Used in Code

#### Doctor Permissions Not Used
1. `doctor.edit_invoices` - In DB but not in config/controllers
2. `doctor.create_invoice` - In DB but not in config/controllers
3. `doctor.create_health_records` - In DB but not in config/controllers
4. `doctor.edit_health_records` - In DB but not in config/controllers
5. `doctor.edit_payment_invoice_date` - In DB but not in config/controllers

#### Admin Permissions Not Used
1. `admin.edit_leads` - In DB but not in config/controllers
2. `admin.edit_expenses` - In DB but not in config/controllers

#### Laboratory Permissions Not Used
1. `lab_manager.create_users` - In DB but not in config/controllers
2. `lab_manager.edit_users` - In DB but not in config/controllers
3. `lab_manager.edit_lab_templates` - In DB but not in config/controllers
4. `lab_manager.edit_outsourced_labs` - In DB but not in config/controllers
5. `lab_manager.view_inventory_requisition` - In DB but not in config/controllers
6. `lab_manager.delete_lab_templates` - In DB but not in config/controllers
7. `lab_technician.create_lab_invoice` - In DB but not in config/controllers
8. `lab_technician.edit_lab_templates` - In DB but not in config/controllers
9. `lab_technician.edit_lab_number` - In DB but not in config/controllers
10. `lab_technician.edit_procedure_rates` - In DB but not in config/controllers
11. `lab_technician.delete_lab_templates` - In DB but not in config/controllers
12. `lab_technician.collect_sample` - In DB but not in config/controllers
13. `lab_technician.lab_tracking` - In DB but not in config/controllers
14. `lab_technician.enter_results` - In DB but not in config/controllers
15. `lab_technician.lab_templates` - In DB but not in config/controllers
16. `lab_technician.view_completed_reports` - In DB but not in config/controllers
17. `lab_technician.view_inventory_requisition` - In DB but not in config/controllers

#### Radiology Permissions Not Used
1. `radiology_technician.radiology_procedures` - In DB but not in config/controllers
2. `radiology_technician.view_completed_reports` - In DB but not in config/controllers
3. `radiology_technician.create_radiology_procedures` - In DB but not in config/controllers
4. `radiology_technician.radiology_referrals` - In DB but not in config/controllers
5. `radiology_technician.radiology_invoice` - In DB but not in config/controllers
6. `radiology_technician.delete_radiology_procedures` - In DB but not in config/controllers
7. `radiology_technician.view_inventory_requisition` - In DB but not in config/controllers
8. `radiology_manager.create_radiology_invoice` - In DB but not in config/controllers
9. `radiology_manager.edit_radiology_procedure` - In DB but not in config/controllers
10. `radiology_manager.delete_radiology_procedure` - In DB but not in config/controllers
11. `radiology_manager.edit_users` - In DB but not in config/controllers
12. `radiology_manager.view_inventory_requisition` - In DB but not in config/controllers
13. `radiology_manager.create_users` - In DB but not in config/controllers

**Note:** These permissions may be used in other parts of the system not covered in this analysis, or may be reserved for future features.

---

## 6. Recommendations

### 6.1 Immediate Actions Required

1. **Add Missing Permissions to Database:**
   - `manage_support_tickets` - For support ticket management
   - `create_patients` - For patient creation
   - `edit_patients` - For patient editing
   - `delete_patients` - For patient deletion

2. **Update Permission Config:**
   - Add `manage_support_tickets` to Support_tickets controller config
   - Add patient permissions to Patients controller config

3. **Review Unused Permissions:**
   - Determine if unused permissions are needed for future features
   - Consider removing truly unused permissions to reduce complexity

### 6.2 Best Practices

1. **Permission Naming Convention:**
   - Use consistent naming: `{module}.{action}_{resource}` (e.g., `admin.view_users`)
   - Avoid role prefixes in permission keys when possible (use categories instead)

2. **Permission Documentation:**
   - Document all permissions in a central location
   - Map permissions to features/modules clearly

3. **Permission Testing:**
   - Test all permission checks in both frontend and backend
   - Ensure admin users have default access where appropriate

---

## 7. Summary Tables

### 7.1 Frontend vs Database Comparison

| Permission | Frontend | Backend | Database | Status |
|------------|----------|---------|----------|--------|
| `admin.create_users` | ✅ | ✅ | ✅ | OK |
| `admin.view_users` | ✅ | ✅ | ✅ | OK (Added) |
| `admin.edit_users` | ✅ | ✅ | ✅ | OK |
| `admin.delete_users` | ✅ | ✅ | ✅ | OK |
| `create_doctors` | ✅ | ✅ | ✅ | OK (Added) |
| `edit_doctors` | ✅ | ✅ | ✅ | OK (Added) |
| `create_patients` | ✅ | ❌ | ❌ | **MISSING** |
| `edit_patients` | ✅ | ❌ | ❌ | **MISSING** |
| `delete_patients` | ✅ | ❌ | ❌ | **MISSING** |
| `manage_support_tickets` | ✅ | ❌ | ❌ | **MISSING** |

### 7.2 Backend vs Database Comparison

| Permission | Backend Config | Backend Controllers | Database | Status |
|------------|----------------|---------------------|----------|--------|
| `admin.view_users` | ✅ | ✅ | ✅ | OK (Added) |
| `admin.view_billing` | ✅ | ✅ | ✅ | OK (Added) |
| `admin.view_financial_reports` | ✅ | ✅ | ✅ | OK |
| `admin.view_other_reports` | ✅ | ✅ | ✅ | OK |
| `view_doctors` | ❌ | ✅ | ✅ | OK (Added) |
| `create_doctors` | ❌ | ✅ | ✅ | OK (Added) |
| `edit_doctors` | ❌ | ✅ | ✅ | OK (Added) |
| `delete_doctors` | ❌ | ✅ | ✅ | OK (Added) |

---

## 8. Conclusion

### Current Status
- **Total Permissions in Database:** ~70+
- **Permissions Used in Frontend:** 11
- **Permissions Used in Backend:** 40+
- **Missing Permissions:** 4 (needs immediate attention)
- **Unused Permissions:** ~30+ (may be reserved for future use)

### Next Steps
1. Add the 4 missing permissions to the database
2. Update the permission config file to include patient and support ticket permissions
3. Test all permission checks to ensure they work correctly
4. Consider documenting unused permissions for future reference

---

**End of Analysis Document**

