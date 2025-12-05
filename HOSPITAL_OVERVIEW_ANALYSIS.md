# Hospital Overview Dashboard Analysis

## Executive Summary

This document analyzes the Hospital Overview dashboards to identify which components use dummy data vs dynamic data, and provides an implementation roadmap to make all components fetch real data from the database.

**Status:** Currently, **ALL** data in both dashboards is **DUMMY/HARDCODED**. No API calls are being made.

---

## Component 1: EnhancedAdminDashboard.tsx

**Location:** `frontend/src/components/modules/EnhancedAdminDashboard.tsx`  
**Title:** "Hospital Overview"  
**Status:** 100% DUMMY DATA

### Data Points Inventory

#### 1. AI Predictions Cards (3 cards) - DUMMY
- **Today's Patient Flow:** 168 expected (hardcoded)
- **Revenue Forecast:** PKR 1.42M (hardcoded)
- **Bed Occupancy:** 85% tomorrow (hardcoded)
- **Data Source:** None - all hardcoded values

#### 2. Main KPIs (4 cards) - DUMMY
- **Total Patients:** 2,847 (hardcoded)
  - **Data Source Needed:** `patients` table - COUNT query
- **Active Doctors:** 48 (hardcoded)
  - **Data Source Needed:** `doctors` table - COUNT where status='active'
- **Today's Appointments:** 127 (hardcoded)
  - **Data Source Needed:** `appointments` table - COUNT where date=today
- **Monthly Revenue:** PKR 12.5M (hardcoded)
  - **Data Source Needed:** `ipd_billing`, `opd_billing`, `emergency_billing` tables - SUM queries

#### 3. Secondary Metrics (4 cards) - DUMMY
- **Bed Occupancy:** 78% (hardcoded)
  - **Data Source Needed:** `ipd_beds` table - COUNT occupied/total
- **Pending Labs:** 23 (hardcoded)
  - **Data Source Needed:** `lab_tests` table - COUNT where status='pending'
- **Medicine Stock:** 98% (hardcoded)
  - **Data Source Needed:** `medicines` or `medicine_stock` table - Calculate stock percentage
- **Satisfaction:** 4.7/5 (hardcoded)
  - **Data Source Needed:** Patient feedback/satisfaction table (may not exist)

#### 4. Charts - DUMMY

**Patient Visits Trend (Area Chart)**
- **Data:** `patientVisitsData` array (hardcoded)
- **Fields:** month, visits, opd, ipd
- **Data Source Needed:** 
  - OPD: `appointments` table - GROUP BY month
  - IPD: `ipd_admissions` table - GROUP BY month
  - Emergency: `emergency_visits` table - GROUP BY month

**Department Distribution (Pie Chart)**
- **Data:** `departmentStats` array (hardcoded)
- **Fields:** name, value (percentage), color
- **Data Source Needed:** 
  - Count patients by department from `ipd_admissions`, `appointments`, `emergency_visits`
  - Calculate percentages

**Revenue vs Expenses (Bar Chart)**
- **Data:** `revenueData` array (hardcoded)
- **Fields:** month, revenue, expenses
- **Data Source Needed:**
  - Revenue: `ipd_billing`, `opd_billing`, `emergency_billing` - GROUP BY month
  - Expenses: Expenses table (may need to be created or use existing financial tables)

#### 5. Activity Feeds - DUMMY

**Recent Activities (4 items)**
- **Data:** `recentActivities` array (hardcoded)
- **Types:** appointment, admission, lab, discharge
- **Data Source Needed:**
  - Appointments: `appointments` table - ORDER BY created_at DESC LIMIT 10
  - Admissions: `ipd_admissions` table - ORDER BY admission_date DESC LIMIT 10
  - Lab tests: `lab_tests` table - ORDER BY created_at DESC LIMIT 10
  - Discharges: `ipd_discharges` table - ORDER BY discharge_date DESC LIMIT 10

**Upcoming Appointments (3 items)**
- **Data:** `upcomingAppointments` array (hardcoded)
- **Data Source Needed:** `appointments` table - WHERE date >= today ORDER BY date, time ASC LIMIT 10

**Critical Alerts (3 items)**
- **Data:** `criticalAlerts` array (hardcoded)
- **Types:** bed capacity, low stock, pending lab results
- **Data Source Needed:**
  - Bed alerts: `ipd_beds` - Check occupancy > 90%
  - Stock alerts: `medicines` or `medicine_stock` - WHERE stock < minimum_stock
  - Lab alerts: `lab_tests` - WHERE status='pending' AND priority='urgent'

---

## Component 2: EvaluationDashboard.tsx

**Location:** `frontend/src/components/modules/EvaluationDashboard.tsx`  
**Title:** "AI-Powered Evaluation Dashboard"  
**Status:** 100% DUMMY DATA

### Data Points Inventory

#### 1. AI Predictions (4 cards) - DUMMY
- **Patient Flow Today:** 168 predicted (hardcoded)
- **Bed Occupancy:** 85% predicted (hardcoded)
- **Revenue Forecast:** PKR 1.42M predicted (hardcoded)
- **Emergency Cases:** 18 predicted (hardcoded)
- **Note:** AI predictions would require ML models or statistical forecasting - can use simple trend analysis for now

#### 2. Hospital KPIs (4 cards) - DUMMY
- **Total Patients:** 2,847 (hardcoded) - Same as EnhancedAdminDashboard
- **Revenue (Monthly):** PKR 12.5M (hardcoded) - Same as EnhancedAdminDashboard
- **Bed Occupancy:** 78% (hardcoded) - Same as EnhancedAdminDashboard
- **Patient Satisfaction:** 4.7/5 (hardcoded) - Same as EnhancedAdminDashboard

#### 3. Department Performance Table - DUMMY
- **Data:** `departmentPerformance` array (hardcoded)
- **Fields:** department, patients, revenue, satisfaction, efficiency, staff, status, trend, ai_score
- **Data Source Needed:**
  - Patients: COUNT from `ipd_admissions`, `appointments`, `emergency_visits` GROUP BY department
  - Revenue: SUM from billing tables GROUP BY department
  - Satisfaction: Average from feedback table (may not exist)
  - Efficiency: Calculate from various metrics (wait times, throughput, etc.)
  - Staff: COUNT from `doctors` or staff table GROUP BY department

#### 4. Doctor Performance Metrics - DUMMY
- **Data:** `doctorMetrics` array (hardcoded)
- **Fields:** id, name, specialty, patients, satisfaction, consultations, revenue, availability, response_time, success_rate, rating
- **Data Source Needed:**
  - Patients: COUNT from `appointments`, `ipd_admissions` GROUP BY doctor_id
  - Consultations: COUNT from `appointments` GROUP BY doctor_id
  - Revenue: SUM from billing tables GROUP BY doctor_id
  - Availability: Calculate from schedule/roster tables
  - Response time: Calculate from appointment/consultation timestamps

#### 5. Charts - DUMMY

**Patient Trends (Line Chart)**
- **Data:** `patientTrends` array (hardcoded)
- **Fields:** month, opd, ipd, emergency, total
- **Data Source Needed:** Same as Patient Visits Trend in EnhancedAdminDashboard

**Revenue Breakdown (Pie Chart)**
- **Data:** `revenueData` array (hardcoded)
- **Fields:** category, value, percentage
- **Data Source Needed:** SUM revenue from different sources (OPD, IPD, Emergency, Pharmacy, Lab, Radiology)

**Disease Patterns**
- **Data:** `diseasePatterns` array (hardcoded)
- **Fields:** disease, cases, trend, severity
- **Data Source Needed:** 
  - Diagnosis codes from `ipd_admissions`, `appointments`, `emergency_visits`
  - GROUP BY diagnosis/disease
  - Calculate trends (compare current period vs previous)

**Financial Trends**
- **Data:** `financialTrends` array (hardcoded)
- **Fields:** month, revenue, expenses, profit
- **Data Source Needed:** Same as Revenue vs Expenses chart

**Operational Efficiency Metrics**
- **Data:** `efficiencyMetrics` array (hardcoded)
- **Fields:** metric, value, target, score, status
- **Data Source Needed:**
  - Avg Wait Time: Calculate from appointment timestamps
  - Bed Turnover: Calculate from `ipd_admissions` (discharge_date - admission_date)
  - ER Response: Calculate from `emergency_visits` timestamps
  - Appointment Show Rate: COUNT completed / COUNT total appointments
  - Surgery Success: From surgery/procedure outcomes (may need new table)
  - Readmission Rate: COUNT readmissions / COUNT total discharges

---

## Available APIs

### Existing Endpoints:
1. `/api/ipd/dashboard` - Returns IPD stats (exists, not used in dashboards)
2. `/api/emergency/stats` - Emergency statistics (exists)
3. `/api/ipd/reports/*` - Various IPD report endpoints (recently created)

### Frontend API Methods:
- `api.getIPDDashboardStats()` - Available but not used
- `api.getIPDStats()` - Available but not used

---

## Required API Endpoints

### 1. GET /api/dashboard/overview
**Purpose:** Main hospital overview statistics  
**Returns:**
```json
{
  "success": true,
  "data": {
    "totalPatients": 2847,
    "activeDoctors": 48,
    "onDutyDoctors": 35,
    "todayAppointments": 127,
    "completedAppointments": 89,
    "pendingAppointments": 38,
    "monthlyRevenue": 12500000,
    "bedOccupancy": 78,
    "pendingLabs": 23,
    "urgentLabs": 12,
    "medicineStock": 98,
    "satisfaction": 4.7,
    "aiPredictions": {
      "patientFlow": 168,
      "revenueForecast": 1420000,
      "bedOccupancy": 85
    }
  }
}
```

### 2. GET /api/dashboard/patient-trends
**Purpose:** Patient visits trend over time  
**Query Params:** `date_from`, `date_to`, `group_by` (month/week/day)  
**Returns:**
```json
{
  "success": true,
  "data": [
    { "month": "Jan", "opd": 580, "ipd": 240, "emergency": 120, "total": 940 },
    ...
  ]
}
```

### 3. GET /api/dashboard/revenue-trends
**Purpose:** Revenue vs expenses over time  
**Query Params:** `date_from`, `date_to`  
**Returns:**
```json
{
  "success": true,
  "data": [
    { "month": "Jan", "revenue": 9800000, "expenses": 7200000, "profit": 2600000 },
    ...
  ]
}
```

### 4. GET /api/dashboard/department-stats
**Purpose:** Department distribution and load  
**Returns:**
```json
{
  "success": true,
  "data": [
    { "name": "Emergency", "value": 23, "color": "#EB5757", "patients": 1247 },
    { "name": "OPD", "value": 35, "color": "#2F80ED", "patients": 3521 },
    ...
  ]
}
```

### 5. GET /api/dashboard/recent-activities
**Purpose:** Recent activities feed  
**Query Params:** `limit` (default: 10)  
**Returns:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "appointment",
      "patient": "Ahmed Khan",
      "doctor": "Dr. Sarah Williams",
      "time": "10 minutes ago",
      "status": "completed"
    },
    ...
  ]
}
```

### 6. GET /api/dashboard/upcoming-appointments
**Purpose:** Upcoming appointments list  
**Query Params:** `limit` (default: 10)  
**Returns:**
```json
{
  "success": true,
  "data": [
    {
      "time": "10:00 AM",
      "patient": "John Smith",
      "doctor": "Dr. Ahmed Khan",
      "type": "Follow-up",
      "department": "Cardiology"
    },
    ...
  ]
}
```

### 7. GET /api/dashboard/alerts
**Purpose:** Critical alerts and notifications  
**Returns:**
```json
{
  "success": true,
  "data": [
    {
      "type": "bed",
      "message": "ICU beds at 95% capacity",
      "severity": "high",
      "time": "5 min ago"
    },
    ...
  ]
}
```

### 8. GET /api/dashboard/evaluation
**Purpose:** Comprehensive evaluation dashboard data  
**Query Params:** `time_range` (7days/30days/90days/1year), `department`  
**Returns:**
```json
{
  "success": true,
  "data": {
    "departmentPerformance": [...],
    "doctorMetrics": [...],
    "patientTrends": [...],
    "revenueBreakdown": [...],
    "diseasePatterns": [...],
    "financialTrends": [...],
    "efficiencyMetrics": [...]
  }
}
```

---

## Database Tables Required

### Primary Tables:
- `patients` - Patient counts
- `doctors` - Doctor counts and availability
- `appointments` - Appointment statistics
- `ipd_admissions` - IPD patient data
- `ipd_beds` - Bed occupancy
- `ipd_billing` - IPD revenue
- `emergency_visits` - Emergency patient data
- `lab_tests` - Lab pending count
- `medicines` / `medicine_stock` - Stock levels
- Billing tables (OPD, Emergency, Pharmacy, Lab, Radiology)

### May Need to Create:
- Patient satisfaction/feedback table
- Expenses table (if not exists)
- Department efficiency metrics table
- Doctor availability/schedule table

---

## Implementation Priority

### Phase 1: Core KPIs (High Priority)
1. Total Patients count
2. Active Doctors count
3. Today's Appointments
4. Monthly Revenue
5. Bed Occupancy

### Phase 2: Charts (Medium Priority)
1. Patient Visits Trend
2. Revenue Trends
3. Department Stats

### Phase 3: Activity Feeds (Medium Priority)
1. Recent Activities
2. Upcoming Appointments
3. Critical Alerts

### Phase 4: Evaluation Dashboard (Lower Priority)
1. Department Performance
2. Doctor Metrics
3. Disease Patterns
4. Efficiency Metrics

---

## Implementation Notes

1. **AI Predictions:** For now, use simple trend analysis (e.g., average of last 7 days + 15% growth). Real AI predictions would require ML models.

2. **Satisfaction Scores:** If no feedback table exists, can skip or use placeholder until implemented.

3. **Expenses:** If no expenses table exists, can calculate from operational costs or use placeholder.

4. **Efficiency Metrics:** Some metrics may require new tables or complex calculations. Start with basic ones.

5. **Error Handling:** Always provide fallback to dummy data if API fails to ensure UI doesn't break.

6. **Loading States:** Add loading indicators while fetching data.

7. **Caching:** Consider caching dashboard data for 5-10 minutes to reduce database load.

---

## Summary

- **Total Components:** 2 dashboards
- **Total Data Points:** ~50+ individual data points
- **Current Status:** 100% DUMMY
- **Target Status:** 100% DYNAMIC
- **Estimated API Endpoints:** 8 endpoints
- **Estimated Implementation Time:** 2-3 days

