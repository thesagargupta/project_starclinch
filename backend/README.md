# Incident Management System - Backend

A Django REST Framework backend for managing users and incidents with MySQL database support.

## Features

- **User Management**: Registration, login, profile management
- **Incident Management**: Create, view, update, delete incidents
- **Pincode Integration**: Auto-fill city and country based on pincode
- **Security**: Token-based authentication
- **Business Rules**: User isolation, closed incident protection
- **Admin Panel**: Django admin interface for management

## Technology Stack

- **Framework**: Django 5.2.4
- **API**: Django REST Framework 3.16.0
- **Database**: MySQL (with SQLite fallback)
- **Authentication**: Token-based authentication
- **External APIs**: Pincode lookup integration

## Prerequisites

- Python 3.8+
- MySQL Server (optional, SQLite used as fallback)
- pip (Python package manager)

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd incident-management-backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure database:**
   - Copy `.env.example` to `.env`
   - Update database credentials in `.env`:
     ```
     DB_NAME=incident_management
     DB_USER=your_mysql_user
     DB_PASSWORD=your_mysql_password
     DB_HOST=localhost
     DB_PORT=3306
     ```

5. **Run setup script:**
   ```bash
   python setup.py
   ```

6. **Start development server:**
   ```bash
   python manage.py runserver
   ```

## Quick Start

### Using Setup Script (Recommended)

```bash
python setup.py
```

This will:
- Create and apply database migrations
- Load sample pincode data
- Create test users and incidents
- Optionally create a superuser

### Manual Setup

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Load pincode data
python manage.py load_pincode_data

# Create test data
python manage.py create_test_data

# Create superuser
python manage.py createsuperuser

# Start server
python manage.py runserver
```

## API Endpoints

### Authentication
- `POST /api/users/register/` - User registration
- `POST /api/users/login/` - User login
- `POST /api/users/logout/` - User logout
- `GET/PUT /api/users/profile/` - User profile

### Incidents
- `GET/POST /api/incidents/` - List/Create incidents
- `GET/PUT/DELETE /api/incidents/<id>/` - Incident details
- `GET /api/incidents/search/?incident_id=<id>` - Search incident
- `GET /api/incidents/stats/` - User incident statistics
- `POST /api/incidents/<id>/close/` - Close incident

### Utilities
- `GET /api/users/pincode/<pincode>/` - Pincode lookup

## Test Credentials

After running the setup script, you can use these test accounts:

```
Email: john@example.com
Password: testpass123

Email: jane@example.com
Password: testpass123

Email: admin@example.com
Password: testpass123
```

## Database Schema

### User Model
- Username, Email, First Name, Last Name
- Phone Number, Address, Pincode, City, Country
- Timestamps (date_joined, last_login)

### Incident Model
- Incident ID (auto-generated: RMG + 5 digits + year)
- Reporter (foreign key to User)
- Reporter Type (Enterprise/Government)
- Incident Details, Priority, Status
- Timestamps (reported_date, updated_date)

### Pincode Model
- Pincode, City, State, Country

## Business Rules

1. **User Isolation**: Users can only access their own incidents
2. **Closed Incidents**: Cannot edit incidents with status 'CLOSED'
3. **Unique Incident IDs**: Auto-generated unique incident identifiers
4. **Auto-fill**: Pincode lookup auto-populates city and country
5. **Authentication**: All incident operations require valid token

## Admin Panel

Access the Django admin panel at `http://localhost:8000/admin/`

Features:
- User management
- Incident management
- Pincode data management
- System statistics

## Development

### Adding New Endpoints

1. Create view in `views.py`
2. Add URL pattern in `urls.py`
3. Create serializer if needed
4. Update API documentation

### Adding New Models

1. Define model in `models.py`
2. Create and apply migrations
3. Register in `admin.py`
4. Create serializers and views

### Testing

```bash
# Run tests
python manage.py test

# Run specific app tests
python manage.py test users
python manage.py test incidents
```

## Production Deployment

1. Set `DEBUG=False` in `.env`
2. Configure production database
3. Set up proper secret key
4. Configure CORS settings
5. Set up web server (nginx/Apache)
6. Use gunicorn/uwsgi for WSGI

## API Documentation

Detailed API documentation is available in `API_DOCUMENTATION.md`

## Support

For issues and support, please check:
1. API documentation
2. Django REST Framework documentation
3. Error logs in console

## License

This project is licensed under the MIT License.