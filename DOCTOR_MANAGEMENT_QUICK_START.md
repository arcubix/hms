# Doctor Management - Quick Start Guide

## Overview
The Doctor Management system has been fully implemented with dynamic database integration, CRUD operations, and schedule management.

## Setup Steps

### 1. Database Setup
Run the SQL migration file to create the necessary tables:

```bash
# Using MySQL command line
mysql -u root -p hms_db < database/doctors_schema.sql

# Or using phpMyAdmin
# 1. Select hms_db database
# 2. Go to Import tab
# 3. Choose database/doctors_schema.sql
# 4. Click Go
```

This will create:
- `doctors` table
- `doctor_schedules` table
- `doctor_ratings` table (optional)
- Sample data for testing

### 2. Backend Verification
The following files have been created/updated:
- ✅ `application/models/Doctor_model.php` - Database operations
- ✅ `application/controllers/Doctors.php` - API endpoints
- ✅ `application/config/routes.php` - Routes added

**API Endpoints Available:**
- `GET /api/doctors` - List all doctors (with search/filter)
- `GET /api/doctors/:id` - Get single doctor
- `POST /api/doctors` - Create doctor
- `PUT /api/doctors/:id` - Update doctor
- `DELETE /api/doctors/:id` - Delete doctor
- `GET /api/doctors/:id/schedule` - Get schedule
- `PUT /api/doctors/:id/schedule` - Update schedule

### 3. Frontend Components
The following components have been created/updated:
- ✅ `frontend/src/components/modules/DoctorList.tsx` - Main list (now dynamic)
- ✅ `frontend/src/components/modules/DoctorForm.tsx` - Add/Edit form
- ✅ `frontend/src/components/modules/DoctorView.tsx` - View details
- ✅ `frontend/src/components/modules/DoctorSchedule.tsx` - Schedule management
- ✅ `frontend/src/services/api.ts` - API service updated with doctor methods

### 4. CORS Configuration
CORS is already configured via hooks. Verify in:
- `application/hooks/Cors_hook.php`
- `application/config/cors.php`

Make sure your frontend URL is in the allowed origins list.

## Testing

### 1. Test Backend API
```bash
# Get all doctors (requires authentication token)
curl -X GET "http://localhost/hms/api/doctors" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create a doctor
curl -X POST "http://localhost/hms/api/doctors" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Test User",
    "specialty": "Cardiology",
    "phone": "+1 234-567-8901",
    "email": "test@hospital.com",
    "experience": 10
  }'
```

### 2. Test Frontend
1. Start the frontend dev server:
   ```bash
   cd frontend
   npm run dev
   ```

2. Navigate to the Doctor Management page
3. Test the following:
   - ✅ View doctor list
   - ✅ Search doctors
   - ✅ Filter by status
   - ✅ Add new doctor
   - ✅ Edit doctor
   - ✅ View doctor details
   - ✅ Manage schedule

## Features Implemented

### ✅ Add Doctor
- Form with validation
- Required fields: name, specialty, phone, email
- Optional: experience, qualification, status, schedule
- Auto-generates doctor ID (D001, D002, etc.)

### ✅ View Doctor
- Complete doctor profile
- Statistics (patients, appointments, rating)
- Contact information
- Schedule information
- Qualification details

### ✅ Edit Doctor
- Update all doctor information
- Email uniqueness validation
- Preserves doctor ID

### ✅ Schedule Management
- Weekly schedule view (Monday-Sunday)
- Set availability per day
- Custom start/end times per day
- Bulk operations (set all available/unavailable)

### ✅ Search & Filter
- Search by name, specialty, or doctor ID
- Filter by status (All, Available, Busy, Off Duty)
- Real-time filtering

## Data Flow

1. **Frontend** → API Service → **Backend API**
2. **Backend** → Doctor Model → **Database**
3. **Database** → Doctor Model → **Backend API**
4. **Backend API** → API Service → **Frontend**

## Troubleshooting

### Issue: CORS Errors
**Solution:** 
- Check `application/config/cors.php` has your frontend URL
- Verify `application/hooks/Cors_hook.php` is enabled
- Check browser console for specific CORS error

### Issue: 404 on API endpoints
**Solution:**
- Verify routes in `application/config/routes.php`
- Check `.htaccess` file for URL rewriting
- Try accessing with `/index.php/api/doctors`

### Issue: Database connection errors
**Solution:**
- Verify database credentials in `application/config/database.php`
- Ensure `hms_db` database exists
- Run the schema migration

### Issue: Token authentication fails
**Solution:**
- Ensure you're logged in
- Check token in localStorage (`hms-token`)
- Verify token format in Authorization header

## Next Steps

1. **Add Doctor Ratings**: Implement rating system using `doctor_ratings` table
2. **Appointment Integration**: Link doctors with appointments
3. **Availability Calendar**: Visual calendar view of doctor availability
4. **Notifications**: Notify doctors of schedule changes
5. **Export/Import**: Export doctor data to CSV/Excel
6. **Advanced Search**: Add more filter options (specialty, experience range)

## File Structure

```
hms/
├── application/
│   ├── controllers/
│   │   └── Doctors.php          # API controller
│   ├── models/
│   │   └── Doctor_model.php     # Database model
│   └── config/
│       └── routes.php           # Routes (updated)
├── database/
│   └── doctors_schema.sql       # Database schema
├── frontend/
│   └── src/
│       ├── components/modules/
│       │   ├── DoctorList.tsx      # Main list
│       │   ├── DoctorForm.tsx     # Add/Edit
│       │   ├── DoctorView.tsx      # View details
│       │   └── DoctorSchedule.tsx  # Schedule
│       └── services/
│           └── api.ts              # API service (updated)
└── DOCTOR_MANAGEMENT_IMPLEMENTATION_GUIDE.md
```

## Support

For detailed implementation information, see:
- `DOCTOR_MANAGEMENT_IMPLEMENTATION_GUIDE.md` - Complete implementation guide
- `database/doctors_schema.sql` - Database schema with comments

