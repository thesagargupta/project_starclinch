# Incident Management System API Documentation

## Overview
This API provides endpoints for managing users and incidents in the incident management system.

## Base URL
```
http://localhost:8000/api/
```

## Authentication
The API uses Token Authentication. Include the token in the Authorization header:
```
Authorization: Token <your_token_here>
```

## API Endpoints

### User Management

#### 1. User Registration
- **URL:** `/api/users/register/`
- **Method:** `POST`
- **Authentication:** Not required
- **Description:** Register a new user

**Request Body:**
```json
{
    "username": "john_doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "+91-9876543210",
    "address": "123 Main Street",
    "pincode": "110001",
    "city": "New Delhi",
    "country": "India",
    "password": "securepassword123",
    "password_confirm": "securepassword123"
}
```

**Response:**
```json
{
    "user": {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "phone_number": "+91-9876543210",
        "address": "123 Main Street",
        "pincode": "110001",
        "city": "New Delhi",
        "country": "India",
        "date_joined": "2024-01-01T10:00:00Z",
        "last_login": "2024-01-01T10:00:00Z"
    },
    "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
    "message": "User registered successfully"
}
```

#### 2. User Login
- **URL:** `/api/users/login/`
- **Method:** `POST`
- **Authentication:** Not required
- **Description:** Login user and get authentication token

**Request Body:**
```json
{
    "email": "john@example.com",
    "password": "securepassword123"
}
```

**Response:**
```json
{
    "user": {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "phone_number": "+91-9876543210",
        "address": "123 Main Street",
        "pincode": "110001",
        "city": "New Delhi",
        "country": "India",
        "date_joined": "2024-01-01T10:00:00Z",
        "last_login": "2024-01-01T10:00:00Z"
    },
    "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
    "message": "Login successful"
}
```

#### 3. User Logout
- **URL:** `/api/users/logout/`
- **Method:** `POST`
- **Authentication:** Required
- **Description:** Logout user and invalidate token

**Response:**
```json
{
    "message": "Logout successful"
}
```

#### 4. User Profile
- **URL:** `/api/users/profile/`
- **Method:** `GET`, `PUT`, `PATCH`
- **Authentication:** Required
- **Description:** Get or update user profile

**GET Response:**
```json
{
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "+91-9876543210",
    "address": "123 Main Street",
    "pincode": "110001",
    "city": "New Delhi",
    "country": "India",
    "date_joined": "2024-01-01T10:00:00Z",
    "last_login": "2024-01-01T10:00:00Z"
}
```

#### 5. Pincode Lookup
- **URL:** `/api/users/pincode/<pincode>/`
- **Method:** `GET`
- **Authentication:** Not required
- **Description:** Lookup city and country by pincode

**Response:**
```json
{
    "pincode": "110001",
    "city": "New Delhi",
    "state": "Delhi",
    "country": "India"
}
```

### Incident Management

#### 1. List/Create Incidents
- **URL:** `/api/incidents/`
- **Method:** `GET`, `POST`
- **Authentication:** Required
- **Description:** List user's incidents or create new incident

**GET Response:**
```json
{
    "count": 5,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "incident_id": "RMG123452024",
            "reporter": 1,
            "reporter_name": "John Doe",
            "reporter_email": "john@example.com",
            "reporter_type": "ENTERPRISE",
            "incident_details": "Server downtime reported",
            "priority": "HIGH",
            "status": "OPEN",
            "reported_date": "2024-01-01T10:00:00Z",
            "updated_date": "2024-01-01T10:00:00Z",
            "is_editable": true
        }
    ]
}
```

**POST Request Body:**
```json
{
    "reporter_type": "ENTERPRISE",
    "incident_details": "Database connectivity issues",
    "priority": "HIGH"
}
```

**POST Response:**
```json
{
    "id": 2,
    "incident_id": "RMG678902024",
    "reporter": 1,
    "reporter_name": "John Doe",
    "reporter_email": "john@example.com",
    "reporter_type": "ENTERPRISE",
    "incident_details": "Database connectivity issues",
    "priority": "HIGH",
    "status": "OPEN",
    "reported_date": "2024-01-01T11:00:00Z",
    "updated_date": "2024-01-01T11:00:00Z",
    "is_editable": true
}
```

#### 2. Incident Details
- **URL:** `/api/incidents/<id>/`
- **Method:** `GET`, `PUT`, `PATCH`, `DELETE`
- **Authentication:** Required
- **Description:** Get, update, or delete specific incident

**GET Response:**
```json
{
    "id": 1,
    "incident_id": "RMG123452024",
    "reporter_details": {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "phone_number": "+91-9876543210",
        "address": "123 Main Street",
        "pincode": "110001",
        "city": "New Delhi",
        "country": "India",
        "date_joined": "2024-01-01T10:00:00Z",
        "last_login": "2024-01-01T10:00:00Z"
    },
    "reporter_type": "ENTERPRISE",
    "incident_details": "Server downtime reported",
    "priority": "HIGH",
    "status": "OPEN",
    "reported_date": "2024-01-01T10:00:00Z",
    "updated_date": "2024-01-01T10:00:00Z",
    "is_editable": true
}
```

**PUT/PATCH Request Body:**
```json
{
    "incident_details": "Updated incident description",
    "priority": "MEDIUM",
    "status": "IN_PROGRESS"
}
```

#### 3. Search Incident
- **URL:** `/api/incidents/search/?incident_id=<incident_id>`
- **Method:** `GET`
- **Authentication:** Required
- **Description:** Search incident by incident ID

**Response:**
```json
{
    "id": 1,
    "incident_id": "RMG123452024",
    "reporter_details": {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "phone_number": "+91-9876543210",
        "address": "123 Main Street",
        "pincode": "110001",
        "city": "New Delhi",
        "country": "India",
        "date_joined": "2024-01-01T10:00:00Z",
        "last_login": "2024-01-01T10:00:00Z"
    },
    "reporter_type": "ENTERPRISE",
    "incident_details": "Server downtime reported",
    "priority": "HIGH",
    "status": "OPEN",
    "reported_date": "2024-01-01T10:00:00Z",
    "updated_date": "2024-01-01T10:00:00Z",
    "is_editable": true
}
```

#### 4. Incident Statistics
- **URL:** `/api/incidents/stats/`
- **Method:** `GET`
- **Authentication:** Required
- **Description:** Get incident statistics for current user

**Response:**
```json
{
    "total_incidents": 10,
    "open_incidents": 3,
    "in_progress_incidents": 4,
    "closed_incidents": 3,
    "high_priority": 2,
    "medium_priority": 5,
    "low_priority": 3
}
```

#### 5. Close Incident
- **URL:** `/api/incidents/<id>/close/`
- **Method:** `POST`
- **Authentication:** Required
- **Description:** Close a specific incident

**Response:**
```json
{
    "message": "Incident closed successfully",
    "incident": {
        "id": 1,
        "incident_id": "RMG123452024",
        "reporter": 1,
        "reporter_name": "John Doe",
        "reporter_email": "john@example.com",
        "reporter_type": "ENTERPRISE",
        "incident_details": "Server downtime reported",
        "priority": "HIGH",
        "status": "CLOSED",
        "reported_date": "2024-01-01T10:00:00Z",
        "updated_date": "2024-01-01T12:00:00Z",
        "is_editable": false
    }
}
```

## Error Responses

All error responses follow this format:
```json
{
    "error": "Error message description"
}
```

## Status Codes

- `200 OK` - Success
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Permission denied
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Field Constraints

### User Fields
- `username`: Required, unique, max 150 characters
- `email`: Required, unique, valid email format
- `first_name`: Required, max 30 characters
- `last_name`: Required, max 30 characters
- `phone_number`: Optional, max 15 characters
- `address`: Optional, text field
- `pincode`: Optional, max 10 characters
- `city`: Optional, max 100 characters
- `country`: Optional, max 100 characters
- `password`: Required, min 6 characters

### Incident Fields
- `reporter_type`: Required, choices: ENTERPRISE, GOVERNMENT
- `incident_details`: Required, text field
- `priority`: Required, choices: HIGH, MEDIUM, LOW
- `status`: Auto-set, choices: OPEN, IN_PROGRESS, CLOSED
- `incident_id`: Auto-generated, format: RMG + 5 digits + year

## Business Rules

1. **User Isolation**: Users can only view and edit their own incidents
2. **Closed Incidents**: Incidents with status 'CLOSED' cannot be edited
3. **Unique Incident IDs**: Each incident gets a unique auto-generated ID
4. **Auto-fill**: Pincode lookup auto-fills city and country
5. **Authentication**: All incident operations require authentication
6. **Reporter Auto-fill**: Reporter information is auto-filled from logged-in user