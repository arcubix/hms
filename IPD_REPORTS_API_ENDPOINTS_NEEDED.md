# IPD Reports - Required API Endpoints

This document lists all API endpoints that need to be created for IPD reports to fetch real data from the database.

## Implementation Pattern

Based on `Pharmacy_reports.php`, create a new controller: `application/controllers/Ipd_reports.php`

**Example Structure:**
```php
class Ipd_reports extends Api {
    public function daily_admissions() {
        $date_from = $this->input->get('date_from');
        $date_to = $this->input->get('date_to');
        $ward_id = $this->input->get('ward_id');
        // Query database and return data
        $this->success($data);
    }
}
```

---

## Required Routes (Add to `application/config/routes.php`)

```php
// IPD Reports Routes
$route['api/ipd/reports/daily-admissions'] = 'ipd_reports/daily_admissions';
$route['api/ipd/reports/discharge-summary'] = 'ipd_reports/discharge_summary';
$route['api/ipd/reports/alos'] = 'ipd_reports/alos';
$route['api/ipd/reports/transfers'] = 'ipd_reports/transfers';
$route['api/ipd/reports/bed-occupancy'] = 'ipd_reports/bed_occupancy';
$route['api/ipd/reports/bed-turnover'] = 'ipd_reports/bed_turnover';
$route['api/ipd/reports/census'] = 'ipd_reports/census';
$route['api/ipd/reports/revenue'] = 'ipd_reports/revenue';
$route['api/ipd/reports/consultant-revenue'] = 'ipd_reports/consultant_revenue';
$route['api/ipd/reports/billing-summary'] = 'ipd_reports/billing_summary';
$route['api/ipd/reports/advance-received'] = 'ipd_reports/advance_received';
$route['api/ipd/reports/pending-bills'] = 'ipd_reports/pending_bills';
$route['api/ipd/reports/bill-comparison'] = 'ipd_reports/bill_comparison';
$route['api/ipd/reports/panel-billing'] = 'ipd_reports/panel_billing';
$route['api/ipd/reports/mortality'] = 'ipd_reports/mortality';
$route['api/ipd/reports/complications'] = 'ipd_reports/complications';
$route['api/ipd/reports/infection-rate'] = 'ipd_reports/infection_rate';
$route['api/ipd/reports/treatment-outcome'] = 'ipd_reports/treatment_outcome';
$route['api/ipd/reports/adverse-events'] = 'ipd_reports/adverse_events';
$route['api/ipd/reports/critical-care'] = 'ipd_reports/critical_care';
$route['api/ipd/reports/readmission-rate'] = 'ipd_reports/readmission_rate';
$route['api/ipd/reports/realtime-occupancy'] = 'ipd_reports/realtime_occupancy';
$route['api/ipd/reports/ward-saturation'] = 'ipd_reports/ward_saturation';
$route['api/ipd/reports/room-type-usage'] = 'ipd_reports/room_type_usage';
$route['api/ipd/reports/bed-allocation'] = 'ipd_reports/bed_allocation';
$route['api/ipd/reports/bed-blocking'] = 'ipd_reports/bed_blocking';
$route['api/ipd/reports/medication-consumption'] = 'ipd_reports/medication_consumption';
$route['api/ipd/reports/high-cost-drugs'] = 'ipd_reports/high_cost_drugs';
$route['api/ipd/reports/ward-inventory'] = 'ipd_reports/ward_inventory';
$route['api/ipd/reports/consumables'] = 'ipd_reports/consumables';
$route['api/ipd/reports/lab-utilization'] = 'ipd_reports/lab_utilization';
$route['api/ipd/reports/delayed-lab-reports'] = 'ipd_reports/delayed_lab_reports';
$route['api/ipd/reports/critical-lab-results'] = 'ipd_reports/critical_lab_results';
$route['api/ipd/reports/radiology-usage'] = 'ipd_reports/radiology_usage';
$route['api/ipd/reports/surgery-roster'] = 'ipd_reports/surgery_roster';
$route['api/ipd/reports/surgeon-summary'] = 'ipd_reports/surgeon_summary';
$route['api/ipd/reports/surgery-frequency'] = 'ipd_reports/surgery_frequency';
$route['api/ipd/reports/ot-utilization'] = 'ipd_reports/ot_utilization';
$route['api/ipd/reports/anesthesia'] = 'ipd_reports/anesthesia';
$route['api/ipd/reports/panel-admissions'] = 'ipd_reports/panel_admissions';
$route['api/ipd/reports/panel-billing-summary'] = 'ipd_reports/panel_billing_summary';
$route['api/ipd/reports/claim-status'] = 'ipd_reports/claim_status';
$route['api/ipd/reports/pre-auth-comparison'] = 'ipd_reports/pre_auth_comparison';
$route['api/ipd/reports/patient-complaints'] = 'ipd_reports/patient_complaints';
$route['api/ipd/reports/audit-trail'] = 'ipd_reports/audit_trail';
$route['api/ipd/reports/nabh-compliance'] = 'ipd_reports/nabh_compliance';
$route['api/ipd/reports/code-blue'] = 'ipd_reports/code_blue';
$route['api/ipd/reports/medication-errors'] = 'ipd_reports/medication_errors';
$route['api/ipd/reports/consent-tracking'] = 'ipd_reports/consent_tracking';
$route['api/ipd/reports/nursing-workload'] = 'ipd_reports/nursing_workload';
$route['api/ipd/reports/staff-efficiency'] = 'ipd_reports/staff_efficiency';
$route['api/ipd/reports/handover'] = 'ipd_reports/handover';
$route['api/ipd/reports/discharge-summary-status'] = 'ipd_reports/discharge_summary_status';
$route['api/ipd/reports/documentation-quality'] = 'ipd_reports/documentation_quality';
$route['api/ipd/reports/tat-monitoring'] = 'ipd_reports/tat_monitoring';
$route['api/ipd/reports/dnr-status'] = 'ipd_reports/dnr_status';
```

---

## Common Query Parameters

Most endpoints should support:
- `date_from` - Start date (YYYY-MM-DD)
- `date_to` - End date (YYYY-MM-DD)
- `ward_id` - Filter by ward
- `department` - Filter by department
- `consultant_id` - Filter by consultant/doctor
- `panel_id` - Filter by insurance panel
- `status` - Filter by status

---

## Database Tables Reference

### Core Tables (Confirmed)
- `ipd_admissions` - Patient admissions
- `ipd_beds` - Bed information
- `ipd_rooms` - Room information
- `ipd_wards` - Ward information
- `ipd_billing` - Billing records
- `ipd_discharges` - Discharge records
- `ipd_transfers` - Transfer records
- `ipd_vital_signs` - Vital signs data
- `ipd_medications` - Medication records
- `ipd_lab_orders` - Lab test orders
- `ipd_radiology_orders` - Radiology orders
- `ipd_procedures` - Procedure records
- `ipd_nursing_notes` - Nursing notes
- `ipd_treatment_orders` - Treatment orders

### Related Tables (May Exist)
- `patients` - Patient master data
- `users` - Doctor/staff information
- `departments` - Department information
- `insurance_panels` - Insurance provider data
- `insurance_claims` - Insurance claim records
- `payments` - Payment transactions
- `ot_schedules` - OT scheduling
- `surgeries` - Surgery records
- `complications` - Complication tracking
- `incidents` - Incident reports
- `consent_forms` - Consent documentation
- `audit_logs` - System audit logs

---

## Example Implementation

### 1. Daily Admissions Report

**Endpoint:** `GET /api/ipd/reports/daily-admissions`

**Query Parameters:**
- `date_from` (required)
- `date_to` (required)
- `ward_id` (optional)
- `department` (optional)

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-11-01",
      "total_admissions": 12,
      "emergency": 5,
      "planned": 6,
      "transfers": 1,
      "bed_occupancy": 78.5
    },
    ...
  ],
  "summary": {
    "total_admissions": 378,
    "emergency_admissions": 151,
    "planned_admissions": 170,
    "transfers": 57,
    "avg_occupancy": 83.2
  }
}
```

**SQL Query Example:**
```sql
SELECT 
    DATE(admission_date) as date,
    COUNT(*) as total_admissions,
    SUM(CASE WHEN admission_type = 'emergency' THEN 1 ELSE 0 END) as emergency,
    SUM(CASE WHEN admission_type = 'planned' THEN 1 ELSE 0 END) as planned,
    SUM(CASE WHEN admission_type = 'transfer' THEN 1 ELSE 0 END) as transfers
FROM ipd_admissions
WHERE admission_date BETWEEN ? AND ?
GROUP BY DATE(admission_date)
ORDER BY date ASC
```

---

### 2. Bed Occupancy Report

**Endpoint:** `GET /api/ipd/reports/bed-occupancy`

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "ward_name": "ICU",
      "total_beds": 20,
      "occupied": 18,
      "available": 2,
      "under_maintenance": 0,
      "occupancy_percent": 90.0
    },
    ...
  ],
  "summary": {
    "total_beds": 121,
    "occupied_beds": 96,
    "available_beds": 23,
    "maintenance": 2,
    "occupancy_rate": 79.3
  }
}
```

**SQL Query Example:**
```sql
SELECT 
    w.name as ward_name,
    COUNT(b.id) as total_beds,
    SUM(CASE WHEN b.status = 'occupied' THEN 1 ELSE 0 END) as occupied,
    SUM(CASE WHEN b.status = 'available' THEN 1 ELSE 0 END) as available,
    SUM(CASE WHEN b.status = 'maintenance' THEN 1 ELSE 0 END) as under_maintenance,
    ROUND((SUM(CASE WHEN b.status = 'occupied' THEN 1 ELSE 0 END) * 100.0 / COUNT(b.id)), 2) as occupancy_percent
FROM ipd_wards w
LEFT JOIN ipd_beds b ON b.ward_id = w.id
GROUP BY w.id, w.name
ORDER BY w.name
```

---

### 3. Revenue Report

**Endpoint:** `GET /api/ipd/reports/revenue`

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "department": "Cardiology",
      "total_revenue": 1250000,
      "bed_charges": 450000,
      "services": 600000,
      "pharmacy": 150000,
      "lab_radiology": 50000,
      "growth_percent": 12.5
    },
    ...
  ],
  "summary": {
    "total_revenue": 8665000,
    "avg_per_patient": 21036,
    "monthly_growth": 14.3,
    "departments": 8
  }
}
```

**SQL Query Example:**
```sql
SELECT 
    d.name as department,
    SUM(b.total_amount) as total_revenue,
    SUM(CASE WHEN bi.item_type = 'bed_charge' THEN bi.amount ELSE 0 END) as bed_charges,
    SUM(CASE WHEN bi.item_type = 'service' THEN bi.amount ELSE 0 END) as services,
    SUM(CASE WHEN bi.item_type = 'pharmacy' THEN bi.amount ELSE 0 END) as pharmacy,
    SUM(CASE WHEN bi.item_type IN ('lab', 'radiology') THEN bi.amount ELSE 0 END) as lab_radiology
FROM ipd_billing b
JOIN ipd_admissions a ON a.id = b.admission_id
JOIN departments d ON d.id = a.department_id
LEFT JOIN ipd_billing_items bi ON bi.billing_id = b.id
WHERE b.billing_date BETWEEN ? AND ?
GROUP BY d.id, d.name
ORDER BY total_revenue DESC
```

---

## Priority Implementation Order

### Phase 1: Core Operational Reports (Week 1)
1. Daily Admissions Report
2. Daily Discharges Report
3. Bed Occupancy Report
4. Census Report

### Phase 2: Financial Reports (Week 2)
5. Revenue Report
6. Billing Summary
7. Pending Bills Report
8. Consultant Revenue Report

### Phase 3: Clinical Reports (Week 3)
9. ALOS Report
10. Mortality Report
11. Readmission Rate
12. Treatment Outcome

### Phase 4: Operational Reports (Week 4)
13. Transfer Report
14. Bed Allocation History
15. Bed Blocking Report
16. Ward Saturation Report

### Phase 5: Specialized Reports (Week 5+)
17-54. Remaining reports based on business priority

---

## Notes

1. **Reuse Existing Models:** Extend methods in existing models (e.g., `Ipd_admission_model`, `Ipd_billing_model`) rather than creating new models.

2. **Performance:** For large datasets, consider:
   - Pagination
   - Date range limits
   - Caching for frequently accessed reports
   - Database indexing on date columns

3. **Error Handling:** All endpoints should:
   - Validate input parameters
   - Handle database errors gracefully
   - Return consistent error format

4. **Frontend Integration:** Update `IpdReportDetail.tsx` to:
   - Call API endpoints instead of using dummy data functions
   - Handle loading states
   - Display error messages
   - Support filters and date ranges

