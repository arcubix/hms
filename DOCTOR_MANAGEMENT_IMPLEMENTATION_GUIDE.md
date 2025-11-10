# Doctor Management System - Implementation Guide

## Overview
This guide outlines the complete implementation of a dynamic Doctor Management System with full CRUD operations, scheduling, and CORS handling.

## Architecture

### Backend (CodeIgniter 3)
- **Database**: MySQL/MariaDB
- **API Pattern**: RESTful endpoints
- **Authentication**: JWT token-based
- **CORS**: Handled via hooks

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI

## Implementation Steps

### Step 1: Database Schema

#### 1.1 Doctors Table
Create a `doctors` table with the following structure:
- `id` - Primary key
- `doctor_id` - Unique identifier (D001, D002, etc.)
- `name` - Doctor's full name
- `specialty` - Medical specialty
- `phone` - Contact phone
- `email` - Contact email
- `experience` - Years of experience
- `qualification` - Medical qualifications
- `status` - Available/Busy/Off Duty
- `schedule_start` - Daily start time
- `schedule_end` - Daily end time
- `avatar` - Profile picture path
- `created_at` / `updated_at` - Timestamps

#### 1.2 Doctor Schedules Table
Create a `doctor_schedules` table for detailed scheduling:
- `id` - Primary key
- `doctor_id` - Foreign key to doctors
- `day_of_week` - Day (Monday-Sunday)
- `start_time` - Start time
- `end_time` - End time
- `is_available` - Boolean flag
- `created_at` / `updated_at` - Timestamps

#### 1.3 Doctor Ratings Table (Optional)
Create a `doctor_ratings` table:
- `id` - Primary key
- `doctor_id` - Foreign key to doctors
- `patient_id` - Foreign key to patients
- `rating` - Rating (1-5)
- `comment` - Review comment
- `created_at` - Timestamp

### Step 2: Backend Implementation

#### 2.1 Database Migration
- Create SQL migration file: `database/doctors_schema.sql`
- Run migration to create tables

#### 2.2 Model Creation
- **File**: `application/models/Doctor_model.php`
- **Methods**:
  - `get_all()` - Get all doctors with optional filters
  - `get_by_id($id)` - Get single doctor
  - `create($data)` - Create new doctor
  - `update($id, $data)` - Update doctor
  - `delete($id)` - Delete doctor
  - `generate_doctor_id()` - Generate unique doctor ID
  - `get_schedule($doctor_id)` - Get doctor schedule
  - `update_schedule($doctor_id, $schedule_data)` - Update schedule
  - `get_statistics($doctor_id)` - Get patient count, rating, etc.

#### 2.3 Controller Creation
- **File**: `application/controllers/Doctors.php`
- **Endpoints**:
  - `GET /api/doctors` - List all doctors (with search/filter)
  - `GET /api/doctors/:id` - Get single doctor
  - `POST /api/doctors` - Create doctor
  - `PUT /api/doctors/:id` - Update doctor
  - `DELETE /api/doctors/:id` - Delete doctor
  - `GET /api/doctors/:id/schedule` - Get doctor schedule
  - `PUT /api/doctors/:id/schedule` - Update doctor schedule

#### 2.4 Routes Configuration
- **File**: `application/config/routes.php`
- Add routes for doctor endpoints

### Step 3: Frontend Implementation

#### 3.1 API Service Updates
- **File**: `frontend/src/services/api.ts`
- **Add Methods**:
  - `getDoctors()` - Fetch all doctors
  - `getDoctor(id)` - Fetch single doctor
  - `createDoctor(data)` - Create doctor
  - `updateDoctor(id, data)` - Update doctor
  - `deleteDoctor(id)` - Delete doctor
  - `getDoctorSchedule(id)` - Get schedule
  - `updateDoctorSchedule(id, schedule)` - Update schedule

#### 3.2 Component Updates

##### 3.2.1 DoctorList Component
- **File**: `frontend/src/components/modules/DoctorList.tsx`
- **Changes**:
  - Replace mock data with API calls
  - Add loading states
  - Add error handling
  - Connect search/filter to API
  - Add pagination (optional)

##### 3.2.2 DoctorForm Component (New)
- **File**: `frontend/src/components/modules/DoctorForm.tsx`
- **Features**:
  - Add/Edit doctor form
  - Form validation
  - Specialty dropdown
  - Status selection
  - Schedule time pickers

##### 3.2.3 DoctorView Component (New)
- **File**: `frontend/src/components/modules/DoctorView.tsx`
- **Features**:
  - Display doctor details
  - Show schedule
  - Display statistics
  - Action buttons (Edit, Schedule, etc.)

##### 3.2.4 DoctorSchedule Component (New)
- **File**: `frontend/src/components/modules/DoctorSchedule.tsx`
- **Features**:
  - Weekly schedule view
  - Time slot management
  - Availability toggle
  - Save schedule

### Step 4: CORS Configuration

#### 4.1 Verify CORS Hook
- **File**: `application/hooks/Cors_hook.php`
- Ensure it handles all doctor endpoints

#### 4.2 CORS Config
- **File**: `application/config/cors.php`
- Verify frontend URLs are allowed

### Step 5: Testing

#### 5.1 Backend Testing
- Test all API endpoints using Postman/curl
- Verify CORS headers
- Test authentication
- Test validation

#### 5.2 Frontend Testing
- Test Add Doctor flow
- Test Edit Doctor flow
- Test View Doctor details
- Test Schedule management
- Test Search/Filter
- Test Error handling

## API Endpoints Reference

### Base URL
```
http://localhost/hms
```

### Endpoints

#### List Doctors
```http
GET /api/doctors
Authorization: Bearer {token}
Query Params: ?search=name&status=Available
```

#### Get Doctor
```http
GET /api/doctors/:id
Authorization: Bearer {token}
```

#### Create Doctor
```http
POST /api/doctors
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Dr. John Doe",
  "specialty": "Cardiology",
  "phone": "+1 234-567-8901",
  "email": "john.doe@hospital.com",
  "experience": 10,
  "qualification": "MD, PhD",
  "status": "Available",
  "schedule_start": "09:00",
  "schedule_end": "17:00"
}
```

#### Update Doctor
```http
PUT /api/doctors/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Dr. John Doe",
  "status": "Busy",
  ...
}
```

#### Delete Doctor
```http
DELETE /api/doctors/:id
Authorization: Bearer {token}
```

#### Get Schedule
```http
GET /api/doctors/:id/schedule
Authorization: Bearer {token}
```

#### Update Schedule
```http
PUT /api/doctors/:id/schedule
Authorization: Bearer {token}
Content-Type: application/json

{
  "schedule": [
    {
      "day_of_week": "Monday",
      "start_time": "09:00",
      "end_time": "17:00",
      "is_available": true
    },
    ...
  ]
}
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Doctor created successfully",
  "data": {
    "id": 1,
    "doctor_id": "D001",
    "name": "Dr. John Doe",
    ...
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "name": "The name field is required.",
    "email": "Invalid email format."
  }
}
```

## Database Schema Details

### doctors Table
```sql
CREATE TABLE `doctors` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `doctor_id` VARCHAR(20) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `specialty` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `experience` INT(3) NOT NULL DEFAULT 0,
  `qualification` TEXT DEFAULT NULL,
  `status` ENUM('Available', 'Busy', 'Off Duty') NOT NULL DEFAULT 'Available',
  `schedule_start` TIME DEFAULT '09:00:00',
  `schedule_end` TIME DEFAULT '17:00:00',
  `avatar` VARCHAR(255) DEFAULT NULL,
  `created_by` INT(11) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_doctor_id` (`doctor_id`),
  INDEX `idx_specialty` (`specialty`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### doctor_schedules Table
```sql
CREATE TABLE `doctor_schedules` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `doctor_id` INT(11) NOT NULL,
  `day_of_week` ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `is_available` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_doctor_day` (`doctor_id`, `day_of_week`),
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## Frontend Component Structure

```
frontend/src/components/modules/
├── DoctorList.tsx          # Main list component (update existing)
├── DoctorForm.tsx          # Add/Edit form (new)
├── DoctorView.tsx          # View details modal (new)
└── DoctorSchedule.tsx      # Schedule management (new)
```

## Security Considerations

1. **Authentication**: All endpoints require valid JWT token
2. **Authorization**: Verify user role (admin/doctor) for operations
3. **Input Validation**: Validate all inputs on backend
4. **SQL Injection**: Use CodeIgniter Query Builder
5. **XSS**: Sanitize outputs
6. **CORS**: Configure allowed origins properly

## Error Handling

### Backend
- Return appropriate HTTP status codes
- Provide clear error messages
- Log errors for debugging
- Don't expose sensitive information

### Frontend
- Display user-friendly error messages
- Handle network errors gracefully
- Show loading states
- Validate forms before submission

## Performance Optimization

1. **Database Indexing**: Index frequently queried fields
2. **Pagination**: Implement pagination for large lists
3. **Caching**: Cache doctor list (optional)
4. **Lazy Loading**: Load schedules on demand
5. **Debouncing**: Debounce search input

## Deployment Checklist

- [ ] Database migrations run
- [ ] CORS configured for production domain
- [ ] Environment variables set
- [ ] API endpoints tested
- [ ] Frontend build successful
- [ ] Error logging configured
- [ ] Backup strategy in place

## Next Steps After Implementation

1. Add doctor availability calendar
2. Integrate with appointment system
3. Add doctor ratings/reviews
4. Implement doctor notifications
5. Add doctor analytics dashboard
6. Export doctor data functionality

