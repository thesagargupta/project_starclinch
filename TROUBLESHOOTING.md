# Troubleshooting Guide - Frontend API Integration

## Common Issues and Solutions

### 1. Field Name Mismatch Error

**Error:** `{username: ["This field is required."], password_confirm: ["This field is required."]}`

**Cause:** The frontend is sending field names that don't match what the Django backend expects.

**Solution:** 
- The Django backend expects `username` and `password_confirm` fields
- The frontend was sending `email` only and `confirmPassword`
- **Fixed:** Added auto-generated username from email and mapped `confirmPassword` to `password_confirm`

### 2. Backend Field Requirements

Check your Django `UserRegistrationSerializer` for required fields:

```python
# In your Django backend, check users/serializers.py
class UserRegistrationSerializer(serializers.ModelSerializer):
    password_confirm = serializers.CharField(write_only=True)
    username = serializers.CharField(required=True)
    # ... other fields
```

### 3. Frontend Field Mapping

The frontend now correctly maps fields:

```javascript
const signupData = {
  user_type: form.type,
  first_name: form.firstName,
  last_name: form.lastName,
  email: form.email,
  username: form.email.split('@')[0], // Auto-generated from email
  address: form.address,
  country: form.country,
  state: form.state,
  city: form.city,
  pincode: form.pincode,
  mobile_country_code: form.mobileCountryCode,
  mobile_number: form.mobileNumber,
  phone: form.phone,
  fax_country_code: form.faxCountryCode,
  fax_number: form.faxNumber,
  password: form.password,
  password_confirm: form.confirmPassword, // Maps to backend field
};
```

### 4. Testing the API

Run the test script to verify your backend:

```bash
node test-api.js
```

### 5. Common CORS Issues

If you get CORS errors, make sure your Django `settings.py` has:

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:5174",  # Alternative port
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

# Or for development only:
CORS_ALLOW_ALL_ORIGINS = True
```

### 6. Check Django Backend URLs

Verify your Django `urls.py` includes the API routes:

```python
# main urls.py
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/incidents/', include('incidents.urls')),
]
```

### 7. Debug Network Requests

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to register/login
4. Check the request payload and response
5. Verify the URL and method are correct

### 8. Backend Error Handling

Make sure your Django views return proper error responses:

```python
# In your views.py
def create(self, request, *args, **kwargs):
    try:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # ... rest of the code
    except ValidationError as e:
        return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
```

### 9. Check Database Migrations

Make sure all migrations are applied:

```bash
python manage.py makemigrations
python manage.py migrate
```

### 10. Verify User Model Fields

Check your Django `User` model has all required fields:

```python
class User(AbstractUser):
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    address = models.TextField()
    country = models.CharField(max_length=50)
    state = models.CharField(max_length=50)
    city = models.CharField(max_length=50)
    pincode = models.CharField(max_length=10)
    mobile_country_code = models.CharField(max_length=5)
    mobile_number = models.CharField(max_length=15)
    phone = models.CharField(max_length=20, blank=True)
    fax_country_code = models.CharField(max_length=5, blank=True)
    fax_number = models.CharField(max_length=15, blank=True)
```

### 11. Environment Variables

Make sure your `.env` file has the correct backend URL:

```
VITE_API_BASE_URL=http://localhost:8000/api/
```

### 12. Token Authentication

Verify Django REST framework is configured for token authentication:

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}
```

### 13. Check Python Dependencies

Make sure Django backend has required packages:

```bash
pip install djangorestframework
pip install django-cors-headers
pip install djangorestframework-simplejwt  # if using JWT
```

### 14. Development vs Production

- **Development:** Backend runs on `localhost:8000`
- **Production:** Update `VITE_API_BASE_URL` to your production domain
- Make sure firewall allows the required ports

### 15. Browser Console Errors

Common errors and solutions:

1. **401 Unauthorized:** Check token is being sent correctly
2. **404 Not Found:** Verify API endpoint URLs
3. **500 Internal Server Error:** Check Django logs
4. **CORS Policy Error:** Configure CORS in Django
5. **Network Error:** Check if backend is running

### Quick Debugging Checklist

- [ ] Django backend is running on port 8000
- [ ] Frontend is running on port 5173/5174
- [ ] CORS is configured in Django
- [ ] All required fields are included in API requests
- [ ] Field names match between frontend and backend
- [ ] Database migrations are applied
- [ ] Token authentication is working
- [ ] Network requests show correct URLs in DevTools