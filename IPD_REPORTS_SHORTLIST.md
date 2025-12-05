# IPD Reports - Shortlist (Based on Available APIs & Database Tables)

## Reports That CAN Be Implemented Now

Based on available controllers, APIs, and database tables, here are the reports that can be made dynamic:

---

## ✅ ADMISSION & DISCHARGE REPORTS (7 reports)

### 1. ✅ Daily Admissions Report
**Status:** CAN IMPLEMENT  
**Data Source:** `ipd_admissions` table  
**API Available:** `GET /api/ipd/admissions` (supports date_from, date_to, ward_id, department, admission_type filters)  
**Model Methods:** `Ipd_admission_model->get_all()`, `get_admission_trend()`  
**Fields Available:** admission_date, admission_type, department, ward_id, consulting_doctor_id

### 2. ✅ Daily Discharges Report  
**Status:** CAN IMPLEMENT  
**Data Source:** `ipd_admissions` + `ipd_discharge_summaries` tables  
**API Available:** `GET /api/ipd/admissions` (filter by status='discharged', date_from, date_to)  
**Model Methods:** `Ipd_admission_model->get_all()`, `get_discharge_trend()`  
**Fields Available:** discharge_date, condition_at_discharge, final_diagnosis

### 3. ✅ ALOS (Average Length of Stay)
**Status:** CAN IMPLEMENT  
**Data Source:** `ipd_admissions` table  
**API Available:** `GET /api/ipd/admissions`  
**Model Methods:** `Ipd_admission_model->get_all()`  
**Fields Available:** admission_date, discharge_date, actual_duration, department  
**Calculation:** Can calculate from admission_date and discharge_date

### 4. ✅ Transfers In/Out
**Status:** CAN IMPLEMENT  
**Data Source:** `ipd_transfers` table  
**API Available:** `GET /api/ipd/admissions/{id}/transfers`  
**Model Methods:** `Ipd_transfer_model->get_by_admission()`  
**Fields Available:** transfer_date, from_ward_id, to_ward_id, transfer_reason  
**Note:** Need to query all transfers (not just by admission)

### 5. ✅ Bed Occupancy Report
**Status:** CAN IMPLEMENT  
**Data Source:** `ipd_beds` + `ipd_wards` + `ipd_admissions` tables  
**API Available:** `GET /api/ipd/beds`, `GET /api/ipd/wards/{id}` (includes stats)  
**Model Methods:** `Ipd_ward_model->get_statistics()`, `Ipd_bed_model->get_all()`  
**Fields Available:** bed status, ward_id, total_beds, occupied_beds, available_beds

### 6. ⚠️ Bed Turnover Rate
**Status:** PARTIALLY CAN IMPLEMENT  
**Data Source:** `ipd_admissions` + `ipd_beds` tables  
**API Available:** `GET /api/ipd/admissions`  
**Model Methods:** `Ipd_admission_model->get_all()`  
**Fields Available:** admission_date, discharge_date, bed_id  
**Note:** Can calculate from admission/discharge dates per bed

### 7. ✅ Patient Census (Ward-Wise / Consultant-Wise)
**Status:** CAN IMPLEMENT  
**Data Source:** `ipd_admissions` + `ipd_wards` tables  
**API Available:** `GET /api/ipd/admissions` (filter by ward_id, consulting_doctor_id)  
**Model Methods:** `Ipd_admission_model->get_all()`, `get_department_distribution()`  
**Fields Available:** ward_id, consulting_doctor_id, department, status

---

## ✅ BILLING & FINANCE REPORTS (7 reports)

### 8. ✅ IPD Revenue Summary
**Status:** CAN IMPLEMENT  
**Data Source:** `ipd_billing` + `ipd_admissions` tables  
**API Available:** `GET /api/ipd/admissions/{id}/billing`  
**Model Methods:** `Ipd_billing_model->get_by_admission()`  
**Fields Available:** total_amount, billing_date, department (via admission), medication_charges, lab_charges, imaging_charges  
**Note:** Need to query all billing records (not just by admission)

### 9. ✅ Consultant Wise Revenue
**Status:** CAN IMPLEMENT  
**Data Source:** `ipd_billing` + `ipd_admissions` tables  
**API Available:** `GET /api/ipd/admissions/{id}/billing`  
**Model Methods:** `Ipd_billing_model->get_by_admission()`  
**Fields Available:** consulting_doctor_id (via admission), total_amount

### 10. ✅ Department Wise Billing Summary
**Status:** CAN IMPLEMENT  
**Data Source:** `ipd_billing` + `ipd_admissions` tables  
**API Available:** `GET /api/ipd/admissions/{id}/billing`  
**Model Methods:** `Ipd_billing_model->get_by_admission()`  
**Fields Available:** department (via admission), total_amount, medication_charges, lab_charges, imaging_charges

### 11. ✅ Advance Received Report
**Status:** CAN IMPLEMENT  
**Data Source:** `ipd_billing` table  
**API Available:** `GET /api/ipd/admissions/{id}/billing`  
**Model Methods:** `Ipd_billing_model->get_by_admission()`  
**Fields Available:** advance_paid, billing_date, payment_status

### 12. ✅ Pending Bills / Outstanding Dues
**Status:** CAN IMPLEMENT  
**Data Source:** `ipd_billing` table  
**API Available:** `GET /api/ipd/admissions/{id}/billing`  
**Model Methods:** `Ipd_billing_model->get_by_admission()`  
**Fields Available:** due_amount, payment_status, billing_date  
**Filter:** payment_status = 'pending' or 'partial'

### 13. ⚠️ Final Bill vs Estimate Comparison
**Status:** PARTIALLY CAN IMPLEMENT  
**Data Source:** `ipd_billing` + `ipd_admissions` tables  
**API Available:** `GET /api/ipd/admissions/{id}/billing`  
**Model Methods:** `Ipd_billing_model->get_by_admission()`  
**Fields Available:** total_amount (final), estimated_duration (from admission)  
**Note:** Estimated amount calculation may need business logic

### 14. ✅ Panel / Insurance Billing Summary
**Status:** CAN IMPLEMENT  
**Data Source:** `ipd_billing` + `ipd_admissions` tables  
**API Available:** `GET /api/ipd/admissions` (filter by insurance_provider)  
**Model Methods:** `Ipd_admission_model->get_all()`, `Ipd_billing_model->get_by_admission()`  
**Fields Available:** insurance_provider, insurance_covered, total_amount

---

## ⚠️ CLINICAL & MEDICAL REPORTS (7 reports)

### 15. ⚠️ Diagnosis Wise Report
**Status:** PARTIALLY CAN IMPLEMENT  
**Data Source:** `ipd_admissions` + `ipd_discharge_summaries` tables  
**API Available:** `GET /api/ipd/admissions`  
**Model Methods:** `Ipd_admission_model->get_all()`  
**Fields Available:** diagnosis (from admission), final_diagnosis (from discharge)  
**Note:** Diagnosis data exists but may need standardization

### 16. ⚠️ Procedure Wise Report
**Status:** PARTIALLY CAN IMPLEMENT  
**Data Source:** `ipd_discharge_summaries` table (procedures_performed JSON field)  
**API Available:** `GET /api/ipd/admissions/{id}/discharge`  
**Model Methods:** `Ipd_discharge_model->get_by_admission()`  
**Fields Available:** procedures_performed (JSON field)  
**Note:** Procedures stored as JSON, may need parsing

### 17. ✅ Doctor Wise Patient Load
**Status:** CAN IMPLEMENT  
**Data Source:** `ipd_admissions` table  
**API Available:** `GET /api/ipd/admissions` (filter by consulting_doctor_id)  
**Model Methods:** `Ipd_admission_model->get_all()`  
**Fields Available:** consulting_doctor_id, admission_date, status

### 18. ❌ Surgery Summary
**Status:** CANNOT IMPLEMENT (No surgery/OT tables found)  
**Data Source:** Not available  
**Note:** Would need OT/surgery tables

### 19. ⚠️ Medication Chart Report
**Status:** PARTIALLY CAN IMPLEMENT  
**Data Source:** `ipd_medications` table (if exists)  
**API Available:** `GET /api/ipd/admissions/{id}/medications`  
**Model Methods:** Available via API  
**Fields Available:** Medication data per admission  
**Note:** Need to verify table structure

### 20. ✅ Vital Monitoring Summary
**Status:** CAN IMPLEMENT  
**Data Source:** `ipd_vital_signs` table  
**API Available:** `GET /api/ipd/admissions/{id}/vitals`  
**Model Methods:** `Ipd_vital_sign_model->get_by_admission()`  
**Fields Available:** recorded_date, temperature, blood_pressure, heart_rate, respiratory_rate, oxygen_saturation

### 21. ⚠️ Nursing Care Summary
**Status:** PARTIALLY CAN IMPLEMENT  
**Data Source:** `ipd_nursing_notes` table  
**API Available:** `GET /api/ipd/admissions/{id}/nursing-notes`  
**Model Methods:** Available via API  
**Fields Available:** Nursing notes per admission  
**Note:** Need to verify table structure for aggregation

---

## ✅ BED & ROOM MANAGEMENT REPORTS (5 reports)

### 22. ✅ Real-Time Bed Occupancy
**Status:** CAN IMPLEMENT  
**Data Source:** `ipd_beds` + `ipd_wards` tables  
**API Available:** `GET /api/ipd/beds`, `GET /api/ipd/wards/{id}` (includes stats)  
**Model Methods:** `Ipd_ward_model->get_statistics()`, `Ipd_bed_model->get_all()`  
**Fields Available:** bed status, ward_id, total_beds, occupied_beds, available_beds

### 23. ✅ Ward Saturation Report
**Status:** CAN IMPLEMENT  
**Data Source:** `ipd_wards` + `ipd_beds` + `ipd_admissions` tables  
**API Available:** `GET /api/ipd/wards`, `GET /api/ipd/wards/{id}` (includes stats)  
**Model Methods:** `Ipd_ward_model->get_all()`, `get_statistics()`  
**Fields Available:** total_beds, occupied_beds, current_patients

### 24. ✅ Room Type Usage Report
**Status:** CAN IMPLEMENT  
**Data Source:** `ipd_rooms` + `ipd_admissions` tables  
**API Available:** `GET /api/ipd/rooms`, `GET /api/ipd/admissions`  
**Model Methods:** `Ipd_room_model->get_all()`, `Ipd_admission_model->get_all()`  
**Fields Available:** room_type, status, daily_rate, room_id (from admission)

### 25. ✅ Bed Allocation History
**Status:** CAN IMPLEMENT  
**Data Source:** `ipd_admissions` + `ipd_beds` tables  
**API Available:** `GET /api/ipd/admissions`  
**Model Methods:** `Ipd_admission_model->get_all()`  
**Fields Available:** admission_date, bed_id, ward_id, patient_id

### 26. ⚠️ Bed Blocking Report
**Status:** PARTIALLY CAN IMPLEMENT  
**Data Source:** `ipd_admissions` table  
**API Available:** `GET /api/ipd/admissions`  
**Model Methods:** `Ipd_admission_model->get_all()`  
**Fields Available:** admission_date, discharge_date, estimated_duration, actual_duration  
**Note:** Need business logic to identify "blocking" (delayed discharges)

---

## ❌ PHARMACY & CONSUMABLE REPORTS (4 reports)

### 27. ⚠️ Medication Consumption Report
**Status:** PARTIALLY CAN IMPLEMENT  
**Data Source:** `ipd_medications` table (if exists)  
**API Available:** `GET /api/ipd/admissions/{id}/medications`  
**Note:** Need to verify table structure and aggregation capabilities

### 28. ❌ High-Cost Drug Usage
**Status:** CANNOT IMPLEMENT (No drug pricing/cost data in IPD tables)  
**Data Source:** Would need pharmacy module integration

### 29. ❌ Ward Inventory Usage
**Status:** CANNOT IMPLEMENT (No ward inventory table)

### 30. ❌ Consumables & Implants Usage
**Status:** CANNOT IMPLEMENT (No consumables table)

---

## ⚠️ LABORATORY & RADIOLOGY REPORTS (4 reports)

### 31. ⚠️ Lab Test Utilization Summary
**Status:** PARTIALLY CAN IMPLEMENT  
**Data Source:** `ipd_lab_orders` table (if exists)  
**API Available:** `GET /api/ipd/admissions/{id}/lab-orders`  
**Note:** Need to verify table structure

### 32. ⚠️ Delayed Lab Reports
**Status:** PARTIALLY CAN IMPLEMENT  
**Data Source:** `ipd_lab_orders` table (if exists)  
**API Available:** `GET /api/ipd/admissions/{id}/lab-orders`  
**Note:** Need order_date and result_date fields for TAT calculation

### 33. ⚠️ Critical Lab Results Summary
**Status:** PARTIALLY CAN IMPLEMENT  
**Data Source:** `ipd_lab_orders` table (if exists)  
**API Available:** `GET /api/ipd/admissions/{id}/lab-orders`  
**Note:** Need critical flag or result values

### 34. ⚠️ Radiology Usage Report
**Status:** PARTIALLY CAN IMPLEMENT  
**Data Source:** `ipd_radiology_orders` table (if exists)  
**API Available:** `GET /api/ipd/admissions/{id}/radiology-orders`  
**Note:** Need to verify table structure

---

## ❌ OT (OPERATION THEATRE) REPORTS (5 reports)

### 35-39. ❌ All OT Reports
**Status:** CANNOT IMPLEMENT  
**Reason:** No OT/surgery tables found in IPD module  
**Would Need:** ot_schedules, surgeries, procedures tables

---

## ⚠️ PANEL / INSURANCE REPORTS (4 reports)

### 40. ✅ Panel Wise Admissions
**Status:** CAN IMPLEMENT  
**Data Source:** `ipd_admissions` table  
**API Available:** `GET /api/ipd/admissions` (filter by insurance_provider)  
**Model Methods:** `Ipd_admission_model->get_all()`  
**Fields Available:** insurance_provider, admission_date, admission_type

### 41. ✅ Panel Wise Billing Summary
**Status:** CAN IMPLEMENT  
**Data Source:** `ipd_billing` + `ipd_admissions` tables  
**API Available:** `GET /api/ipd/admissions/{id}/billing`  
**Model Methods:** `Ipd_billing_model->get_by_admission()`  
**Fields Available:** insurance_provider (via admission), insurance_covered, total_amount

### 42. ⚠️ Claim Status Report
**Status:** PARTIALLY CAN IMPLEMENT  
**Data Source:** `ipd_admissions` table  
**API Available:** `GET /api/ipd/admissions`  
**Fields Available:** insurance_approval_number, insurance_provider  
**Note:** Limited claim status tracking (only approval number exists)

### 43. ⚠️ Pre-Authorization vs Final Bill
**Status:** PARTIALLY CAN IMPLEMENT  
**Data Source:** `ipd_admissions` + `ipd_billing` tables  
**API Available:** `GET /api/ipd/admissions/{id}/billing`  
**Fields Available:** insurance_coverage_amount (pre-auth), total_amount (final bill)  
**Note:** Can compare but may need additional fields

---

## ❌ COMPLIANCE & AUDIT REPORTS (6 reports)

### 44-49. ❌ Most Compliance Reports
**Status:** CANNOT IMPLEMENT  
**Reason:** No dedicated tables for:
- Patient complaints/feedback
- Audit trails (may exist in audit_log but not IPD-specific)
- NABH compliance tracking
- Code blue/incidents
- Medication errors
- Consent forms

**Exception:**
- **Audit Trail:** May use `audit_log` table if it tracks IPD activities

---

## Summary

### ✅ CAN IMPLEMENT NOW (20 reports)
1. Daily Admissions Report
2. Daily Discharges Report
3. ALOS Report
4. Transfers In/Out
5. Bed Occupancy Report
6. Bed Turnover Rate (partial)
7. Patient Census
8. IPD Revenue Summary
9. Consultant Wise Revenue
10. Department Wise Billing Summary
11. Advance Received Report
12. Pending Bills / Outstanding Dues
13. Panel / Insurance Billing Summary
14. Doctor Wise Patient Load
15. Vital Monitoring Summary
16. Real-Time Bed Occupancy
17. Ward Saturation Report
18. Room Type Usage Report
19. Bed Allocation History
20. Panel Wise Admissions
21. Panel Wise Billing Summary

### ⚠️ PARTIALLY CAN IMPLEMENT (12 reports)
- Bed Turnover Rate (needs calculation logic)
- Final Bill vs Estimate Comparison (needs estimation logic)
- Diagnosis Wise Report (data exists but may need standardization)
- Procedure Wise Report (JSON field needs parsing)
- Medication Chart Report (need to verify table structure)
- Nursing Care Summary (need to verify aggregation)
- Bed Blocking Report (needs business logic)
- Medication Consumption Report (need to verify table)
- Lab/Radiology Reports (4 reports - need to verify tables)
- Claim Status Report (limited fields)
- Pre-Authorization vs Final Bill (can compare but limited)

### ❌ CANNOT IMPLEMENT (22+ reports)
- All OT/Surgery reports (no OT tables)
- Pharmacy inventory reports (no inventory tables)
- Most compliance/audit reports (no dedicated tables)
- High-cost drugs (no pricing data)
- Consumables (no table)

---

## Recommended Implementation Order

### Phase 1: Core Reports (Week 1)
1. Daily Admissions Report
2. Daily Discharges Report
3. Bed Occupancy Report
4. Patient Census

### Phase 2: Financial Reports (Week 2)
5. IPD Revenue Summary
6. Consultant Wise Revenue
7. Department Wise Billing Summary
8. Pending Bills Report

### Phase 3: Operational Reports (Week 3)
9. ALOS Report
10. Transfers Report
11. Ward Saturation Report
12. Bed Allocation History

### Phase 4: Clinical Reports (Week 4)
13. Vital Monitoring Summary
14. Doctor Wise Patient Load
15. Panel Wise Reports (2 reports)

---

## Notes

- All reports marked "CAN IMPLEMENT" have sufficient data in existing tables
- Reports marked "PARTIALLY CAN IMPLEMENT" may need additional fields or business logic
- Reports marked "CANNOT IMPLEMENT" require new tables/modules
- Some reports may need aggregation queries written in models
- Frontend is ready - just needs API endpoints created

