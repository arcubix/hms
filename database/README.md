# Database Schema - HMS

## Overview

This database schema is designed for the Hospital Management System with focus on **Admin Login** and **Patient Management**.

## Tables

### 1. `users`
Stores admin and staff user accounts.

**Key Fields:**
- `id` - Primary key
- `email` - Unique email (used for login)
- `password` - Hashed password
- `role` - User role (admin, doctor, nurse, etc.)
- `status` - Active/Inactive status

### 2. `patients`
Stores patient information.

**Key Fields:**
- `id` - Primary key
- `patient_id` - Unique patient identifier (P001, P002, etc.)
- `name`, `email`, `phone` - Contact information
- `age`, `gender`, `date_of_birth` - Personal details
- `address`, `city`, `state` - Location
- `blood_group` - Medical information
- `status` - Active/Inactive/Critical

### 3. `patient_medical_records`
Stores medical records for patients.

**Key Fields:**
- `patient_id` - Foreign key to patients
- `record_type` - Visit, Diagnosis, Treatment, etc.
- `diagnosis`, `treatment`, `medications`
- `visit_date`, `next_followup_date`

### 4. `appointments`
Stores appointment information.

**Key Fields:**
- `patient_id` - Foreign key to patients
- `doctor_id` - Foreign key to users
- `appointment_date` - Date and time
- `status` - Scheduled, Completed, Cancelled, etc.

### 5. `sessions`
Stores JWT tokens for authentication.

## Installation

### Using MySQL/MariaDB

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE hms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Use database
USE hms_db;

# Import schema
SOURCE database/schema.sql;
```

### Using phpMyAdmin

1. Create a new database named `hms_db`
2. Select the database
3. Go to Import tab
4. Choose `schema.sql` file
5. Click Go

## Default Admin Credentials

After importing schema:

- **Email**: `admin@hospital.com`
- **Password**: `admin123`

⚠️ **Important**: Change the default password after first login!

## Password Hash

The default admin password is hashed using PHP's `password_hash()` function with BCRYPT.

To create a new password hash in PHP:
```php
echo password_hash('your_password', PASSWORD_BCRYPT);
```

## API Endpoints Expected

Based on this schema, your backend API should implement:

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout (invalidate token)

### Patients
- `GET /api/patients` - List all patients
- `GET /api/patients/:id` - Get patient details
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

## Sample Queries

### Get all active patients
```sql
SELECT * FROM patients WHERE status = 'Active' ORDER BY created_at DESC;
```

### Get patient with latest appointment
```sql
SELECT p.*, MAX(a.appointment_date) as last_appointment
FROM patients p
LEFT JOIN appointments a ON p.id = a.patient_id
GROUP BY p.id;
```

### Get patient medical records
```sql
SELECT pmr.*, u.name as doctor_name
FROM patient_medical_records pmr
LEFT JOIN users u ON pmr.doctor_id = u.id
WHERE pmr.patient_id = ?
ORDER BY pmr.visit_date DESC;
```

## Notes

- All timestamps are automatically managed
- Foreign keys ensure data integrity
- Indexes are created for performance
- Patient ID is auto-generated (you may need a trigger or application logic)

## Next Steps

1. Update database connection in `application/config/database.php`
2. Create API endpoints in CodeIgniter
3. Test API with frontend
4. Add more tables as needed (prescriptions, lab results, etc.)

