# Incident Management System - Frontend Setup Guide

## Prerequisites

- Node.js (v20.19.0 or >=22.12.0)
- npm or yarn package manager
- Django backend running (should be available at http://localhost:8000)

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   - The `.env` file is already created with default settings
   - Update `VITE_API_BASE_URL` if your Django backend is running on a different URL
   
   ```bash
   # .env file
   VITE_API_BASE_URL=http://localhost:8000/api/
   VITE_APP_NAME=Incident Management System
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Open your browser and navigate to `http://localhost:5173`
   - The app will redirect to `/login` if not authenticated

## Features Implemented

### Authentication
- **Login:** Email/password authentication with Django backend
- **Signup:** Complete user registration with validation
- **Forgot Password:** Password reset functionality
- **Protected Routes:** Routes protected by authentication

### Dashboard
- **Incident Management:** View, create, and close incidents
- **Search:** Search incidents by title/description
- **Statistics:** View incident statistics (total, open, closed, high priority)
- **Real-time Updates:** Data refreshes after actions

### API Integration
- **Axios Configuration:** Centralized API client with token management
- **Error Handling:** Comprehensive error handling with user feedback
- **Token Management:** Automatic token refresh and cleanup

## File Structure

```
src/
├── components/
│   └── ProtectedRoute.jsx      # Route protection component
├── contexts/
│   └── AuthContext.jsx         # Authentication context
├── pages/
│   ├── Login.jsx               # Login/Signup/Forgot Password
│   ├── Login.css               # Authentication styles
│   ├── Dashboard.jsx           # Main dashboard
│   └── Dashboard.css           # Dashboard styles
├── utils/
│   └── api.js                  # API client and utilities
└── App.jsx                     # Main app with routing
```

## Backend Requirements

Make sure your Django backend has these endpoints:

### Authentication Endpoints:
- `POST /api/users/login/` - User login
- `POST /api/users/register/` - User registration
- `POST /api/users/logout/` - User logout
- `GET /api/users/profile/` - Get user profile
- `PUT /api/users/profile/` - Update user profile

### Incident Endpoints:
- `GET /api/incidents/` - List incidents
- `POST /api/incidents/` - Create incident
- `GET /api/incidents/{id}/` - Get incident details
- `PUT /api/incidents/{id}/` - Update incident
- `DELETE /api/incidents/{id}/` - Delete incident
- `GET /api/incidents/search/` - Search incidents
- `GET /api/incidents/stats/` - Get incident statistics
- `POST /api/incidents/{id}/close/` - Close incident

### Utility Endpoints:
- `GET /api/users/pincode/{pincode}/` - Pincode lookup

## Development

### Running the Backend
1. Make sure your Django backend is running on `http://localhost:8000`
2. Ensure CORS is configured to allow frontend requests
3. Check that all required endpoints are available

### Frontend Development
1. Start the development server: `npm run dev`
2. The app will auto-reload when you make changes
3. Check the browser console for any errors

## Production Build

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Preview the production build:**
   ```bash
   npm run preview
   ```

## Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Ensure your Django backend has CORS configured
   - Add your frontend URL to CORS_ALLOWED_ORIGINS

2. **Authentication Issues:**
   - Check that token authentication is enabled in Django
   - Verify API endpoints are working with tools like Postman

3. **API Connection Issues:**
   - Verify the backend URL in `.env` file
   - Check that the Django server is running

4. **Build Issues:**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Technologies Used

- **React 19** - UI framework
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **Vite** - Build tool
- **CSS3** - Styling with modern features

## API Documentation

The frontend is designed to work with the Django backend's REST API. All API calls include:
- Automatic token management
- Error handling
- Request/response interceptors
- Loading states
- User feedback

## Next Steps

1. **Testing:** Add unit and integration tests
2. **Error Boundaries:** Add React error boundaries
3. **Performance:** Add lazy loading and code splitting
4. **Accessibility:** Improve ARIA labels and keyboard navigation
5. **PWA:** Add service worker for offline functionality