import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { utilsAPI } from '../utils/api';
import './Login.css';

// Main App Component
function App() {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'signup', or 'forgot-password'

  return (
    <div className="auth-container">
      {currentView === 'login' ? (
        <LoginPage setCurrentView={setCurrentView} />
      ) : currentView === 'signup' ? (
        <SignupPage setCurrentView={setCurrentView} />
      ) : (
        <ForgotPasswordPage setCurrentView={setCurrentView} />
      )}
    </div>
  );
}

// Login Page Component
function LoginPage({ setCurrentView }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    let valid = true;

    setEmailError('');
    setPasswordError('');
    setLoginError('');

    if (!email) {
      setEmailError('Please enter your email.');
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    }

    if (!password) {
      setPasswordError('Please enter your password.');
      valid = false;
    }

    if (valid) {
      setIsSubmitting(true);
      try {
        const result = await login({ email, password });
        
        if (result.success) {
          // Redirect to dashboard or main app
          navigate('/dashboard');
        } else {
          // Handle login error
          if (result.error.email) {
            setEmailError(Array.isArray(result.error.email) ? result.error.email[0] : result.error.email);
          }
          if (result.error.password) {
            setPasswordError(Array.isArray(result.error.password) ? result.error.password[0] : result.error.password);
          }
          if (result.error.non_field_errors) {
            setLoginError(Array.isArray(result.error.non_field_errors) ? result.error.non_field_errors[0] : result.error.non_field_errors);
          }
          if (result.error.message) {
            setLoginError(result.error.message);
          }
          if (!result.error.email && !result.error.password && !result.error.non_field_errors && !result.error.message) {
            setLoginError('Login failed. Please check your credentials and try again.');
          }
        }
      } catch (error) {
        console.error('Login error:', error);
        setLoginError('An unexpected error occurred. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="login-card">
      <div className="auth-header">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your account</p>
      </div>
      <form onSubmit={handleLogin} className="auth-form">
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            className={`form-input ${emailError ? 'error' : ''}`}
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {emailError && <p className="error-message">{emailError}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            id="password"
            className={`form-input ${passwordError ? 'error' : ''}`}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {passwordError && <p className="error-message">{passwordError}</p>}
        </div>
        {loginError && <p className="error-message">{loginError}</p>}
        <button
          type="submit"
          className={`btn btn-primary btn-full ${isSubmitting ? 'btn-loading' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
      
      <div className="auth-links">
        <p className="auth-link">
          <button
            onClick={() => setCurrentView('forgot-password')}
            className="auth-link-button"
          >
            Forgot Password?
          </button>
        </p>
        <p className="auth-link">
          Don't have an account?{' '}
          <button
            onClick={() => setCurrentView('signup')}
            className="auth-link-button"
          >
            Create Account
          </button>
        </p>
      </div>
      
    </div>
  );
}

// Forgot Password Page Component
function ForgotPasswordPage({ setCurrentView }) {
  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    mobileCountryCode: '+1',
    mobileNumber: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const { requestPasswordReset } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle phone number formatting
    if (name === 'mobileNumber') {
      const cleanValue = value.replace(/\D/g, '');
      setForm((prevForm) => ({
        ...prevForm,
        [name]: cleanValue,
      }));
    } else {
      setForm((prevForm) => ({
        ...prevForm,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.email.trim()) {
      newErrors.email = 'Please enter your email.';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    
    if (!form.firstName.trim()) {
      newErrors.firstName = 'Please enter your first name.';
    }
    
    if (!form.lastName.trim()) {
      newErrors.lastName = 'Please enter your last name.';
    }
    
    if (!form.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Please enter your mobile number.';
    } else if (!/^\d{7,15}$/.test(form.mobileNumber)) {
      newErrors.mobileNumber = 'Mobile number must be 7-15 digits.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const resetData = {
        email: form.email,
        first_name: form.firstName,
        last_name: form.lastName,
        mobile_country_code: form.mobileCountryCode,
        mobile_number: form.mobileNumber,
      };
      
      const result = await requestPasswordReset(resetData);
      
      if (result.success) {
        setShowSuccess(true);
        
        // Auto redirect to login after 3 seconds
        setTimeout(() => {
          setCurrentView('login');
        }, 3000);
      } else {
        // Handle errors
        const newErrors = {};
        if (result.error.email) {
          newErrors.email = Array.isArray(result.error.email) ? result.error.email[0] : result.error.email;
        }
        if (result.error.first_name) {
          newErrors.firstName = Array.isArray(result.error.first_name) ? result.error.first_name[0] : result.error.first_name;
        }
        if (result.error.last_name) {
          newErrors.lastName = Array.isArray(result.error.last_name) ? result.error.last_name[0] : result.error.last_name;
        }
        if (result.error.mobile_number) {
          newErrors.mobileNumber = Array.isArray(result.error.mobile_number) ? result.error.mobile_number[0] : result.error.mobile_number;
        }
        if (result.error.non_field_errors) {
          newErrors.submit = Array.isArray(result.error.non_field_errors) ? result.error.non_field_errors[0] : result.error.non_field_errors;
        }
        if (result.error.message) {
          newErrors.submit = result.error.message;
        }
        
        setErrors(newErrors);
      }
      
    } catch (error) {
      console.error('Forgot password error:', error);
      setErrors({ submit: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Country codes data (reusing from signup)
  const countryCodes = [
    { code: '+1', country: 'United States', flag: '🇺🇸' },
    { code: '+1', country: 'Canada', flag: '🇨🇦' },
    { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+55', country: 'Brazil', flag: '🇧🇷' },
    { code: '+7', country: 'Russia', flag: '🇷🇺' },
    { code: '+82', country: 'South Korea', flag: '🇰🇷' },
    { code: '+39', country: 'Italy', flag: '🇮🇹' },
    { code: '+34', country: 'Spain', flag: '🇪🇸' },
    { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
    { code: '+46', country: 'Sweden', flag: '🇸🇪' },
    { code: '+47', country: 'Norway', flag: '🇳🇴' },
    { code: '+45', country: 'Denmark', flag: '🇩🇰' },
    { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
    { code: '+43', country: 'Austria', flag: '🇦🇹' },
    { code: '+32', country: 'Belgium', flag: '🇧🇪' },
    { code: '+48', country: 'Poland', flag: '🇵🇱' },
    { code: '+420', country: 'Czech Republic', flag: '🇨🇿' },
    { code: '+36', country: 'Hungary', flag: '🇭🇺' },
    { code: '+351', country: 'Portugal', flag: '🇵🇹' },
    { code: '+30', country: 'Greece', flag: '🇬🇷' },
    { code: '+90', country: 'Turkey', flag: '🇹🇷' },
    { code: '+20', country: 'Egypt', flag: '🇪🇬' },
    { code: '+27', country: 'South Africa', flag: '🇿🇦' },
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+65', country: 'Singapore', flag: '🇸🇬' },
    { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
    { code: '+66', country: 'Thailand', flag: '🇹🇭' },
    { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
    { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
    { code: '+63', country: 'Philippines', flag: '🇵🇭' },
    { code: '+52', country: 'Mexico', flag: '🇲🇽' },
    { code: '+54', country: 'Argentina', flag: '🇦🇷' },
    { code: '+56', country: 'Chile', flag: '🇨🇱' },
    { code: '+57', country: 'Colombia', flag: '🇨🇴' },
    { code: '+51', country: 'Peru', flag: '🇵🇪' },
    { code: '+58', country: 'Venezuela', flag: '🇻🇪' },
  ];

  if (showSuccess) {
    return (
      <div className="login-card">
        <div className="auth-header">
          <h2 className="auth-title">Reset Link Sent!</h2>
          <p className="auth-subtitle">Check your email for password reset instructions</p>
        </div>
        
        <div className="success-message">
          <div className="success-icon">✅</div>
          <p><strong>Reset link sent successfully!</strong></p>
          <p>We've sent a password reset link to <strong>{form.email}</strong></p>
          <p>Please check your inbox and follow the instructions to reset your password.</p>
          <p>If you don't see the email, please check your spam folder.</p>
          <p className="redirect-message">Redirecting to login page in 3 seconds...</p>
        </div>
        
        <div className="auth-links">
          <p className="auth-link">
            <button
              onClick={() => setCurrentView('login')}
              className="auth-link-button"
            >
              Back to Login
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-card">
      <div className="auth-header">
        <h2 className="auth-title">Forgot Password</h2>
        <p className="auth-subtitle">Enter your details to reset your password</p>
      </div>
      
      <div className="info-message">
        <p><strong>Password Reset Process:</strong></p>
        <p>• Enter your email, name, and mobile number</p>
        <p>• We'll verify your identity with these details</p>
        <p>• A reset link will be sent to your email</p>
        <p>• Your username will be auto-generated if needed</p>
      </div>
      
      <form onSubmit={handleSubmit} className="auth-form">
        {/* Email */}
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email Address<span className="required">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className={`form-input ${errors.email ? 'error' : ''}`}
            placeholder="Enter your email address"
            value={form.email}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          {errors.email && <p className="error-message">{errors.email}</p>}
        </div>

        {/* First Name */}
        <div className="form-group">
          <label htmlFor="firstName" className="form-label">
            First Name<span className="required">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            className={`form-input ${errors.firstName ? 'error' : ''}`}
            placeholder="Enter your first name"
            value={form.firstName}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          {errors.firstName && <p className="error-message">{errors.firstName}</p>}
        </div>

        {/* Last Name */}
        <div className="form-group">
          <label htmlFor="lastName" className="form-label">
            Last Name<span className="required">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            className={`form-input ${errors.lastName ? 'error' : ''}`}
            placeholder="Enter your last name"
            value={form.lastName}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          {errors.lastName && <p className="error-message">{errors.lastName}</p>}
        </div>

        {/* Mobile Number */}
        <div className="form-group">
          <label htmlFor="mobileNumber" className="form-label">
            Mobile Number<span className="required">*</span>
          </label>
          <div className="country-code-group">
            <select
              id="mobileCountryCode"
              name="mobileCountryCode"
              className="country-code-select"
              value={form.mobileCountryCode}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              {countryCodes.map((country, index) => (
                <option key={`forgot-mobile-${index}`} value={country.code}>
                  {country.flag} {country.code} {country.country}
                </option>
              ))}
            </select>
            <input
              type="tel"
              id="mobileNumber"
              name="mobileNumber"
              className={`phone-number-input ${errors.mobileNumber ? 'error' : ''}`}
              placeholder="Enter mobile number"
              value={form.mobileNumber}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>
          {errors.mobileNumber && <p className="error-message">{errors.mobileNumber}</p>}
        </div>

        {/* Submit Error */}
        {errors.submit && <p className="error-message">{errors.submit}</p>}

        {/* Submit Button */}
        <button
          type="submit"
          className={`btn btn-primary btn-full ${isSubmitting ? 'btn-loading' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending Reset Link...' : 'Send Reset Link'}
        </button>
      </form>
      
      <div className="security-notice">
        <p><strong>Security Notice:</strong></p>
        <p>• For your security, all details must match our records</p>
        <p>• Password reset links expire in 24 hours</p>
        <p>• If you don't receive an email, check your spam folder</p>
      </div>
      
      <div className="auth-links">
        <p className="auth-link">
          Remember your password?{' '}
          <button
            onClick={() => setCurrentView('login')}
            className="auth-link-button"
          >
            Back to Login
          </button>
        </p>
        <p className="auth-link">
          Don't have an account?{' '}
          <button
            onClick={() => setCurrentView('signup')}
            className="auth-link-button"
          >
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
}

// Signup Page Component
function SignupPage({ setCurrentView }) {
  const [form, setForm] = useState({
    type: 'individual',
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    address: '',
    country: '',
    state: '',
    city: '',
    pincode: '',
    mobileCountryCode: '+1',
    mobileNumber: '',
    phone: '',
    faxCountryCode: '+1',
    faxNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle phone number formatting
    if (name === 'mobileNumber' || name === 'faxNumber') {
      // Remove all non-digit characters
      const cleanValue = value.replace(/\D/g, '');
      setForm((prevForm) => ({
        ...prevForm,
        [name]: cleanValue,
      }));
    } else if (name === 'pincode') {
      // Handle pincode lookup
      const cleanValue = value.replace(/\D/g, '');
      setForm((prevForm) => ({
        ...prevForm,
        [name]: cleanValue,
      }));
      
      // Auto-lookup city and state when pincode is 6 digits
      if (cleanValue.length === 6) {
        setPincodeLoading(true);
        try {
          const result = await utilsAPI.lookupPincode(cleanValue);
          if (result.success) {
            setForm((prevForm) => ({
              ...prevForm,
              city: result.data.city || '',
              state: result.data.state || '',
            }));
          }
        } catch (error) {
          console.error('Pincode lookup error:', error);
        } finally {
          setPincodeLoading(false);
        }
      }
    } else if (name === 'email') {
      // Auto-generate username from email
      const emailUsername = value.split('@')[0];
      setForm((prevForm) => ({
        ...prevForm,
        [name]: value,
        username: emailUsername, // Auto-generate username
      }));
    } else {
      setForm((prevForm) => ({
        ...prevForm,
        [name]: type === 'radio' ? (checked ? value : prevForm[name]) : value,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = 'Please enter valid first name.';
    if (!form.lastName.trim()) newErrors.lastName = 'Please enter valid last name.';
    if (!form.email.trim()) {
      newErrors.email = 'Please enter valid email.';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!form.username.trim()) {
      newErrors.username = 'Please enter a username.';
    } else if (form.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long.';
    } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores.';
    }
    if (!form.address.trim()) newErrors.address = 'Please enter valid address.';
    if (!form.country) newErrors.country = 'Please select your country.';
    if (!form.state) newErrors.state = 'Please select your state.';
    if (!form.city) newErrors.city = 'Please select your city.';
    if (!form.pincode.trim()) {
      newErrors.pincode = 'Please enter valid pincode.';
    } else if (!/^\d{6}$/.test(form.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits.';
    }
    if (!form.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Please enter valid mobile number.';
    } else if (!/^\d{7,15}$/.test(form.mobileNumber)) {
      newErrors.mobileNumber = 'Mobile number must be 7-15 digits.';
    }
    if (form.faxNumber && !/^\d{7,15}$/.test(form.faxNumber)) {
      newErrors.faxNumber = 'Fax number must be 7-15 digits.';
    }
    if (!form.password) {
      newErrors.password = 'Password is required.';
    } else if (form.password.length < 8 || !/[0-9]/.test(form.password) || !/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password)) {
      newErrors.password = 'Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters.';
    }
    if (form.confirmPassword !== form.password) {
      newErrors.confirmPassword = 'Confirm password should be same as password.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // Prepare data for API - match Django backend field names
        const signupData = {
          user_type: form.type,
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          username: form.username, // Use form username
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
          password_confirm: form.confirmPassword, // Match backend field name
        };

        const result = await register(signupData);
        
        if (result.success) {
          // Redirect to login page after successful registration
          alert('Registration successful! Please login with your credentials.');
          setCurrentView('login');
        } else {
          // Handle registration errors - map backend errors to frontend field names
          const newErrors = {};
          if (result.error.email) {
            newErrors.email = Array.isArray(result.error.email) ? result.error.email[0] : result.error.email;
          }
          if (result.error.username) {
            newErrors.username = Array.isArray(result.error.username) ? result.error.username[0] : result.error.username;
          }
          if (result.error.first_name) {
            newErrors.firstName = Array.isArray(result.error.first_name) ? result.error.first_name[0] : result.error.first_name;
          }
          if (result.error.last_name) {
            newErrors.lastName = Array.isArray(result.error.last_name) ? result.error.last_name[0] : result.error.last_name;
          }
          if (result.error.mobile_number) {
            newErrors.mobileNumber = Array.isArray(result.error.mobile_number) ? result.error.mobile_number[0] : result.error.mobile_number;
          }
          if (result.error.password) {
            newErrors.password = Array.isArray(result.error.password) ? result.error.password[0] : result.error.password;
          }
          if (result.error.password_confirm) {
            newErrors.confirmPassword = Array.isArray(result.error.password_confirm) ? result.error.password_confirm[0] : result.error.password_confirm;
          }
          if (result.error.address) {
            newErrors.address = Array.isArray(result.error.address) ? result.error.address[0] : result.error.address;
          }
          if (result.error.pincode) {
            newErrors.pincode = Array.isArray(result.error.pincode) ? result.error.pincode[0] : result.error.pincode;
          }
          if (result.error.non_field_errors) {
            newErrors.submit = Array.isArray(result.error.non_field_errors) ? result.error.non_field_errors[0] : result.error.non_field_errors;
          }
          if (result.error.message) {
            newErrors.submit = result.error.message;
          }
          
          setErrors(newErrors);
        }
      } catch (error) {
        console.error('Registration error:', error);
        setErrors({ submit: 'An unexpected error occurred. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Country codes data
  const countryCodes = [
    { code: '+1', country: 'United States', flag: '🇺🇸' },
    { code: '+1', country: 'Canada', flag: '🇨🇦' },
    { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+55', country: 'Brazil', flag: '🇧🇷' },
    { code: '+7', country: 'Russia', flag: '🇷🇺' },
    { code: '+82', country: 'South Korea', flag: '🇰🇷' },
    { code: '+39', country: 'Italy', flag: '🇮🇹' },
    { code: '+34', country: 'Spain', flag: '🇪🇸' },
    { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
    { code: '+46', country: 'Sweden', flag: '🇸🇪' },
    { code: '+47', country: 'Norway', flag: '🇳🇴' },
    { code: '+45', country: 'Denmark', flag: '🇩🇰' },
    { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
    { code: '+43', country: 'Austria', flag: '🇦🇹' },
    { code: '+32', country: 'Belgium', flag: '🇧🇪' },
    { code: '+48', country: 'Poland', flag: '🇵🇱' },
    { code: '+420', country: 'Czech Republic', flag: '🇨🇿' },
    { code: '+36', country: 'Hungary', flag: '🇭🇺' },
    { code: '+351', country: 'Portugal', flag: '🇵🇹' },
    { code: '+30', country: 'Greece', flag: '🇬🇷' },
    { code: '+90', country: 'Turkey', flag: '🇹🇷' },
    { code: '+20', country: 'Egypt', flag: '🇪🇬' },
    { code: '+27', country: 'South Africa', flag: '🇿🇦' },
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+65', country: 'Singapore', flag: '🇸🇬' },
    { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
    { code: '+66', country: 'Thailand', flag: '🇹🇭' },
    { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
    { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
    { code: '+63', country: 'Philippines', flag: '🇵🇭' },
    { code: '+52', country: 'Mexico', flag: '🇲🇽' },
    { code: '+54', country: 'Argentina', flag: '🇦🇷' },
    { code: '+56', country: 'Chile', flag: '🇨🇱' },
    { code: '+57', country: 'Colombia', flag: '🇨🇴' },
    { code: '+51', country: 'Peru', flag: '🇵🇪' },
    { code: '+58', country: 'Venezuela', flag: '🇻🇪' },
  ];

  // Dummy data for dropdowns
  const countries = ['USA', 'Canada', 'UK', 'India'];
  const states = {
    USA: ['California', 'Texas', 'New York'],
    Canada: ['Ontario', 'Quebec', 'British Columbia'],
    UK: ['England', 'Scotland', 'Wales'],
    India: ['Maharashtra', 'Punjab', 'DelhiNCR'],
  };
  const cities = {
    California: ['Los Angeles', 'San Francisco'],
    Texas: ['Houston', 'Dallas'],
    Maharashtra: ['Mumbai', 'Pune'],
    Punjab:['Chandigarh','Amritsar','Ludhiana'],
    DelhiNCR:['New Delhi','Faridabad','Gurugram']
    // Add more cities as needed
  };

  return (
    <div className="signup-card">
      {/* Header with Login/Signup buttons */}
      <div className="tab-buttons">
        <button
          onClick={() => setCurrentView('login')}
          className="tab-button"
        >
          LOGIN
        </button>
        <button
          onClick={() => setCurrentView('signup')}
          className="tab-button active"
        >
          SIGNUP
        </button>
      </div>

      <div className="auth-header">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join us today and get started</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {/* Account Type Radio Buttons */}
        <div className="form-group form-group-full">
          <label className="form-label">
            Account Type
          </label>
          <div className="radio-group">
            <label className="radio-item">
              <input
                type="radio"
                name="type"
                value="individual"
                checked={form.type === 'individual'}
                onChange={handleChange}
                className="radio-input"
              />
              <span className="radio-label">Individual</span>
            </label>
            <label className="radio-item">
              <input
                type="radio"
                name="type"
                value="enterprise"
                checked={form.type === 'enterprise'}
                onChange={handleChange}
                className="radio-input"
              />
              <span className="radio-label">Enterprise</span>
            </label>
            <label className="radio-item">
              <input
                type="radio"
                name="type"
                value="government"
                checked={form.type === 'government'}
                onChange={handleChange}
                className="radio-input"
              />
              <span className="radio-label">Government</span>
            </label>
          </div>
        </div>

        <div className="form-grid form-grid-2">

          {/* First Name */}
          <div className="form-group">
            <label htmlFor="firstName" className="form-label">
              First Name<span className="required">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              className={`form-input ${errors.firstName ? 'error' : ''}`}
              placeholder="Enter your first name"
              value={form.firstName}
              onChange={handleChange}
            />
            {errors.firstName && <p className="error-message">{errors.firstName}</p>}
          </div>

          {/* Last Name */}
          <div className="form-group">
            <label htmlFor="lastName" className="form-label">
              Last Name<span className="required">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              className={`form-input ${errors.lastName ? 'error' : ''}`}
              placeholder="Enter your last name"
              value={form.lastName}
              onChange={handleChange}
            />
            {errors.lastName && <p className="error-message">{errors.lastName}</p>}
          </div>

          {/* Email */}
          <div className="form-group form-group-full">
            <label htmlFor="email" className="form-label">
              Email Address<span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="Enter your email address"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>

          {/* Username */}
          <div className="form-group form-group-full">
            <label htmlFor="username" className="form-label">
              Username<span className="required">*</span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className={`form-input ${errors.username ? 'error' : ''}`}
              placeholder="Enter your username"
              value={form.username}
              onChange={handleChange}
            />
            {errors.username && <p className="error-message">{errors.username}</p>}
          </div>

          {/* Address */}
          <div className="form-group form-group-full">
            <label htmlFor="address" className="form-label">
              Address<span className="required">*</span>
            </label>
            <input
              type="text"
              id="address"
              name="address"
              className={`form-input ${errors.address ? 'error' : ''}`}
              placeholder="Enter your complete address"
              value={form.address}
              onChange={handleChange}
            />
            {errors.address && <p className="error-message">{errors.address}</p>}
          </div>

          {/* Country */}
          <div className="form-group">
            <label htmlFor="country" className="form-label">
              Country<span className="required">*</span>
            </label>
            <select
              id="country"
              name="country"
              className={`form-select ${errors.country ? 'error' : ''}`}
              value={form.country}
              onChange={handleChange}
            >
              <option value="">Select your country</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            {errors.country && <p className="error-message">{errors.country}</p>}
          </div>

          {/* State */}
          <div className="form-group">
            <label htmlFor="state" className="form-label">
              State<span className="required">*</span>
            </label>
            <select
              id="state"
              name="state"
              className={`form-select ${errors.state ? 'error' : ''}`}
              value={form.state}
              onChange={handleChange}
              disabled={!form.country}
            >
              <option value="">Select your state</option>
              {form.country &&
                states[form.country]?.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
            </select>
            {errors.state && <p className="error-message">{errors.state}</p>}
          </div>

          {/* City */}
          <div className="form-group">
            <label htmlFor="city" className="form-label">
              City<span className="required">*</span>
            </label>
            <select
              id="city"
              name="city"
              className={`form-select ${errors.city ? 'error' : ''}`}
              value={form.city}
              onChange={handleChange}
              disabled={!form.state}
            >
              <option value="">Select your city</option>
              {form.state &&
                cities[form.state]?.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
            </select>
            {errors.city && <p className="error-message">{errors.city}</p>}
          </div>

          {/* Pincode */}
          <div className="form-group">
            <label htmlFor="pincode" className="form-label">
              Pincode<span className="required">*</span>
            </label>
            <input
              type="text"
              id="pincode"
              name="pincode"
              className={`form-input ${errors.pincode ? 'error' : ''}`}
              placeholder="Enter 6-digit pincode"
              value={form.pincode}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {pincodeLoading && <p className="info-message">Looking up pincode...</p>}
            {errors.pincode && <p className="error-message">{errors.pincode}</p>}
          </div>

          {/* Mobile Number */}
          <div className="form-group">
            <label htmlFor="mobileNumber" className="form-label">
              Mobile Number<span className="required">*</span>
            </label>
            <div className="country-code-group">
              <select
                id="mobileCountryCode"
                name="mobileCountryCode"
                className="country-code-select"
                value={form.mobileCountryCode}
                onChange={handleChange}
              >
                {countryCodes.map((country, index) => (
                  <option key={`mobile-${index}`} value={country.code}>
                    {country.flag} {country.code} {country.country}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                id="mobileNumber"
                name="mobileNumber"
                className={`phone-number-input ${errors.mobileNumber ? 'error' : ''}`}
                placeholder="Enter mobile number"
                value={form.mobileNumber}
                onChange={handleChange}
              />
            </div>
            {errors.mobileNumber && <p className="error-message">{errors.mobileNumber}</p>}
          </div>

          {/* Phone */}
          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Phone (Optional)
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              className="form-input"
              placeholder="Enter landline number"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          {/* Fax */}
          <div className="form-group">
            <label htmlFor="faxNumber" className="form-label">
              Fax Number (Optional)
            </label>
            <div className="country-code-group">
              <select
                id="faxCountryCode"
                name="faxCountryCode"
                className="country-code-select"
                value={form.faxCountryCode}
                onChange={handleChange}
              >
                {countryCodes.map((country, index) => (
                  <option key={`fax-${index}`} value={country.code}>
                    {country.flag} {country.code} {country.country}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                id="faxNumber"
                name="faxNumber"
                className={`phone-number-input ${errors.faxNumber ? 'error' : ''}`}
                placeholder="Enter fax number"
                value={form.faxNumber}
                onChange={handleChange}
              />
            </div>
            {errors.faxNumber && <p className="error-message">{errors.faxNumber}</p>}
          </div>

          {/* Password */}
          <div className="form-group form-group-full">
            <label htmlFor="password" className="form-label">
              Password<span className="required">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Create a strong password"
              value={form.password}
              onChange={handleChange}
            />
            {errors.password && <p className="error-message">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="form-group form-group-full">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password<span className="required">*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
          </div>

        </div>

        {/* Submit Error */}
        {errors.submit && <p className="error-message">{errors.submit}</p>}

        {/* Signup Button */}
        <div className="form-group">
          <button
            type="submit"
            className={`btn btn-primary btn-full ${isSubmitting ? 'btn-loading' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;
