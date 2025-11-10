# API Endpoints Reference

## Base URL
```
http://localhost/hms
```

**Note:** All endpoints below are relative to the base URL. For example:
- Base URL: `http://localhost/hms`
- Endpoint: `/api/auth/login`
- Full URL: `http://localhost/hms/api/auth/login`

## Authentication

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@hospital.com",
  "password": "admin123"
}
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "System Administrator",
    "email": "admin@hospital.com",
    "role": "admin"
  }
}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Patients

### Get All Patients
```http
GET /api/patients
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "patient_id": "P001",
      "name": "John Smith",
      "email": "john.smith@email.com",
      "phone": "+1 234-567-8901",
      "age": 45,
      "gender": "Male",
      "status": "Active",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Get Single Patient
```http
GET /api/patients/1
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "patient_id": "P001",
    "name": "John Smith",
    "email": "john.smith@email.com",
    "phone": "+1 234-567-8901",
    "age": 45,
    "gender": "Male",
    "date_of_birth": "1979-05-15",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip_code": "10001",
    "blood_group": "O+",
    "status": "Active",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### Create Patient
```http
POST /api/patients
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane.doe@email.com",
  "phone": "+1 234-567-8904",
  "age": 28,
  "gender": "Female",
  "address": "789 Elm St",
  "city": "Boston",
  "state": "MA"
}

Response:
{
  "success": true,
  "message": "Patient created successfully",
  "data": {
    "id": 4,
    "patient_id": "P004",
    "name": "Jane Doe",
    ...
  }
}
```

### Update Patient
```http
PUT /api/patients/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Smith Updated",
  "phone": "+1 234-567-9999",
  "age": 46
}

Response:
{
  "success": true,
  "message": "Patient updated successfully",
  "data": {
    "id": 1,
    "name": "John Smith Updated",
    ...
  }
}
```

### Delete Patient
```http
DELETE /api/patients/1
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Patient deleted successfully"
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized. Please login."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Patient not found"
}
```

### 422 Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["The email field is required."],
    "phone": ["The phone field must be at least 10 characters."]
  }
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

