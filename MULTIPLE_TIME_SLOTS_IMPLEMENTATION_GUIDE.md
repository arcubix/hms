# Multiple Time Slots Per Day - Implementation Guide

## Overview
This guide explains how to implement support for multiple time slots per day for doctors. A doctor can now have multiple working periods in a single day (e.g., Morning: 9:00-12:00, Afternoon: 14:00-17:00).

---

## 🗄️ Database Changes

### Schema Update
**File**: `database/multiple_time_slots_schema_update.sql`

**Key Changes:**
1. **Remove Unique Constraint**: Drop `unique_doctor_day` constraint to allow multiple rows per day
2. **Add New Fields**:
   - `slot_order` - Order of slot within the day (0, 1, 2, etc.)
   - `slot_name` - Optional name for the slot (e.g., "Morning", "Afternoon")
   - `max_appointments_per_slot` - Capacity per slot
   - `appointment_duration` - Duration for this slot
   - `break_start`, `break_end` - Break times within slot
   - `notes` - Additional notes

**To Apply:**
```sql
SOURCE database/multiple_time_slots_schema_update.sql;
```

---

## 🔧 Backend Changes

### 1. Doctor_model.php - Updated ✅

**Changes Made:**
- ✅ `get_schedule()` now orders by `slot_order` and `start_time` to handle multiple slots
- ✅ `update_schedule()` now saves all new fields including `slot_order`, `slot_name`, etc.

**Key Points:**
- Multiple schedule entries can exist for the same `(doctor_id, day_of_week)` combination
- Slots are ordered by `slot_order` then `start_time`
- All slot-specific settings (capacity, duration, breaks) are stored per slot

---

## 🎨 Frontend Changes Required

### 1. Update DoctorSchedule Interface ✅
**File**: `frontend/src/services/api.ts`

**Already Updated:**
- Added `slot_order`, `slot_name`, `max_appointments_per_slot`, `appointment_duration`, `break_start`, `break_end`, `notes`

### 2. Update DoctorSchedule Component
**File**: `frontend/src/components/modules/DoctorSchedule.tsx`

**Required Changes:**
- Change from single slot per day to multiple slots per day
- Add "Add Time Slot" button for each day
- Allow removing individual slots
- Display all slots for each day
- Handle slot ordering

### 3. Update AddDoctorPage & EditDoctorPage
**Files**: 
- `frontend/src/components/pages/AddDoctorPage.tsx`
- `frontend/src/components/pages/EditDoctorPage.tsx`

**Required Changes:**
- Update schedule management section to support multiple slots per day
- Allow adding/removing time slots for each day
- Display all slots with proper ordering

### 4. Update Slot Calculation Logic
**For Appointment System** (when implemented):
- When calculating available slots, consider ALL time slots for the selected day
- Merge slots from all periods (morning + afternoon, etc.)
- Handle breaks within each slot

---

## 📋 Implementation Steps

### Step 1: Database Migration
```sql
-- Run the schema update
SOURCE database/multiple_time_slots_schema_update.sql;
```

### Step 2: Update Frontend Components

#### 2.1 DoctorSchedule Component Structure

**Current Structure** (Single slot per day):
```
Monday: [09:00 - 17:00] [Available] [Edit]
Tuesday: [09:00 - 17:00] [Available] [Edit]
```

**New Structure** (Multiple slots per day):
```
Monday:
  Slot 1: [09:00 - 12:00] [Morning] [Available] [Edit] [Remove]
  Slot 2: [14:00 - 17:00] [Afternoon] [Available] [Edit] [Remove]
  [+ Add Time Slot]

Tuesday:
  Slot 1: [09:00 - 17:00] [Available] [Edit] [Remove]
  [+ Add Time Slot]
```

#### 2.2 Data Structure Change

**Current** (Array of days, one slot per day):
```typescript
schedule: [
  { day_of_week: 'Monday', start_time: '09:00', end_time: '17:00', ... },
  { day_of_week: 'Tuesday', start_time: '09:00', end_time: '17:00', ... }
]
```

**New** (Array of slots, multiple per day):
```typescript
schedule: [
  { day_of_week: 'Monday', start_time: '09:00', end_time: '12:00', slot_order: 0, slot_name: 'Morning', ... },
  { day_of_week: 'Monday', start_time: '14:00', end_time: '17:00', slot_order: 1, slot_name: 'Afternoon', ... },
  { day_of_week: 'Tuesday', start_time: '09:00', end_time: '17:00', slot_order: 0, ... }
]
```

#### 2.3 Component Logic

**Loading Schedule:**
```typescript
const loadSchedule = async () => {
  const data = await api.getDoctorSchedule(doctor.id.toString());
  // Data now contains ALL slots (multiple per day possible)
  // Group by day for display
  const scheduleByDay = groupByDay(data);
  setSchedule(scheduleByDay);
};
```

**Adding a Slot:**
```typescript
const addSlot = (day: string) => {
  const newSlot = {
    day_of_week: day,
    start_time: '09:00',
    end_time: '17:00',
    slot_order: getNextSlotOrder(day), // Get highest order + 1
    slot_name: '',
    is_available: true,
    max_appointments_per_slot: 1,
    appointment_duration: 30
  };
  setSchedule(prev => [...prev, newSlot]);
};
```

**Removing a Slot:**
```typescript
const removeSlot = (slotId: number) => {
  setSchedule(prev => prev.filter(s => s.id !== slotId));
};
```

**Grouping by Day:**
```typescript
const groupByDay = (slots: DoctorSchedule[]) => {
  const grouped: { [day: string]: DoctorSchedule[] } = {};
  DAYS_OF_WEEK.forEach(day => {
    grouped[day] = slots
      .filter(s => s.day_of_week === day)
      .sort((a, b) => (a.slot_order || 0) - (b.slot_order || 0));
  });
  return grouped;
};
```

---

## 🎯 Example Scenarios

### Scenario 1: Split Shift
**Doctor works morning and evening:**
- Monday:
  - Slot 1: 09:00 - 12:00 (Morning)
  - Slot 2: 18:00 - 21:00 (Evening)

### Scenario 2: Multiple Periods
**Doctor works in 3 periods:**
- Tuesday:
  - Slot 1: 08:00 - 10:00 (Early Morning)
  - Slot 2: 12:00 - 14:00 (Lunch Period)
  - Slot 3: 16:00 - 19:00 (Evening)

### Scenario 3: Different Capacities
**Different capacity per slot:**
- Wednesday:
  - Slot 1: 09:00 - 12:00, Capacity: 3 patients (Group consultations)
  - Slot 2: 14:00 - 17:00, Capacity: 1 patient (Detailed consultations)

### Scenario 4: Mixed Availability
**Some days have multiple slots, others don't:**
- Monday: 2 slots (Morning + Afternoon)
- Tuesday: 1 slot (Full day)
- Wednesday: 3 slots (Early + Mid + Late)

---

## 🔄 Slot Calculation Logic (For Appointments)

When calculating available slots for appointments, the system needs to:

1. **Get all slots for the selected day**
   ```php
   $day_slots = array_filter($schedule, function($s) use ($day_of_week) {
       return $s['day_of_week'] === $day_of_week && $s['is_available'] == 1;
   });
   ```

2. **For each slot, generate time slots**
   ```php
   foreach ($day_slots as $slot) {
       $start = strtotime($slot['start_time']);
       $end = strtotime($slot['end_time']);
       // Generate slots within this period
       // Exclude break times if any
       // Check capacity
   }
   ```

3. **Merge all slots from all periods**
   ```php
   $all_available_slots = array_merge($morning_slots, $afternoon_slots, ...);
   ```

4. **Sort by time**
   ```php
   usort($all_available_slots, function($a, $b) {
       return strtotime($a['datetime']) - strtotime($b['datetime']);
   });
   ```

---

## 📝 UI/UX Considerations

### DoctorSchedule Component Updates

1. **Day Header with Add Button**
   ```
   Monday
   [+ Add Time Slot]
   ```

2. **Slot Cards**
   ```
   ┌─────────────────────────────────────┐
   │ Morning Slot                        │
   │ 09:00 - 12:00                       │
   │ Capacity: 3/3 available             │
   │ [Edit] [Remove]                     │
   └─────────────────────────────────────┘
   ```

3. **Empty State**
   ```
   No time slots configured for this day
   [+ Add Time Slot]
   ```

4. **Validation**
   - Prevent overlapping slots (optional - could allow if needed)
   - Ensure end_time > start_time
   - Validate break times are within slot times

---

## 🧪 Testing Checklist

### Backend
- [ ] Can create multiple slots for same day
- [ ] Slots are ordered correctly (slot_order)
- [ ] Can retrieve all slots for a day
- [ ] Can update individual slots
- [ ] Can delete individual slots
- [ ] Slot calculation considers all slots for a day

### Frontend
- [ ] Can add multiple slots per day
- [ ] Can remove individual slots
- [ ] Slots display in correct order
- [ ] Can edit slot details (times, capacity, etc.)
- [ ] Schedule saves correctly with multiple slots
- [ ] Schedule loads correctly with multiple slots

---

## 🚀 Quick Implementation

### Minimal Changes (Quick Fix)

If you want a quick implementation without major UI changes:

1. **Database**: Run the schema update
2. **Backend**: Already updated ✅
3. **Frontend**: Update DoctorSchedule component to:
   - Group slots by day when displaying
   - Allow adding multiple slots (add button per day)
   - Show all slots for each day

### Full Implementation (Recommended)

1. Complete UI redesign for better UX
2. Drag-and-drop slot reordering
3. Visual timeline showing all slots
4. Conflict detection (overlapping slots)
5. Copy slots between days

---

## 📊 Data Flow Example

### Creating Schedule with Multiple Slots

**User Action:**
1. Select Monday
2. Add Slot 1: 09:00-12:00 (Morning)
3. Add Slot 2: 14:00-17:00 (Afternoon)
4. Save

**Data Sent:**
```json
[
  {
    "day_of_week": "Monday",
    "start_time": "09:00",
    "end_time": "12:00",
    "slot_order": 0,
    "slot_name": "Morning",
    "is_available": true,
    "max_appointments_per_slot": 1
  },
  {
    "day_of_week": "Monday",
    "start_time": "14:00",
    "end_time": "17:00",
    "slot_order": 1,
    "slot_name": "Afternoon",
    "is_available": true,
    "max_appointments_per_slot": 1
  }
]
```

**Database:**
```
id | doctor_id | day_of_week | start_time | end_time | slot_order | slot_name
1  | 1         | Monday      | 09:00:00   | 12:00:00 | 0          | Morning
2  | 1         | Monday      | 14:00:00   | 17:00:00 | 1          | Afternoon
```

---

## ✅ Success Criteria

1. ✅ Doctor can have multiple time slots per day
2. ✅ Slots are properly ordered and displayed
3. ✅ Can add/remove individual slots
4. ✅ Each slot can have different capacity/duration
5. ✅ Appointment slot calculation considers all slots
6. ✅ Schedule saves and loads correctly

---

**Status**: Backend ready ✅ | Frontend needs updates ⚠️  
**Priority**: High  
**Estimated Time**: 2-3 hours for frontend updates

