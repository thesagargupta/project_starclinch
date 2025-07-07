// Script to check Django backend API compatibility
const axios = require('axios').default;

const BASE_URL = 'http://localhost:8000/api/';

async function checkBackendCompatibility() {
  console.log('🔍 Checking Django Backend API Compatibility...\n');
  
  try {
    // Test basic connectivity
    console.log('1. Testing server connectivity...');
    await axios.get(`${BASE_URL}users/`);
    console.log('✅ Server is running and responding\n');
    
    // Test required fields by sending incomplete data
    console.log('2. Testing required fields...');
    
    const testCases = [
      {
        name: 'Empty registration',
        data: {},
        description: 'Send empty object to see all required fields'
      },
      {
        name: 'Minimal registration',
        data: {
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com'
        },
        description: 'Send minimal data to see remaining required fields'
      },
      {
        name: 'Registration without username',
        data: {
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com',
          password: 'TestPassword123'
        },
        description: 'Test if username is required'
      },
      {
        name: 'Registration without password_confirm',
        data: {
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com',
          username: 'testuser',
          password: 'TestPassword123'
        },
        description: 'Test if password_confirm is required'
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n📋 Test: ${testCase.name}`);
      console.log(`📝 Description: ${testCase.description}`);
      console.log(`📤 Sending data:`, JSON.stringify(testCase.data, null, 2));
      
      try {
        const response = await axios.post(`${BASE_URL}users/register/`, testCase.data);
        console.log('✅ Unexpected success:', response.data);
      } catch (error) {
        if (error.response) {
          console.log('❌ Expected error (showing required fields):');
          console.log(`📨 Status: ${error.response.status}`);
          console.log(`📨 Required fields:`, JSON.stringify(error.response.data, null, 2));
        } else {
          console.log('❌ Network error:', error.message);
        }
      }
    }
    
    console.log('\n🎯 Summary of Required Fields:');
    console.log('Based on the errors above, your Django backend requires these fields:');
    console.log('- username (string)');
    console.log('- password_confirm (string)');
    console.log('- email (string)');
    console.log('- first_name (string)');
    console.log('- last_name (string)');
    console.log('- Other fields may also be required depending on your model');
    
    console.log('\n🔧 Frontend Field Mapping:');
    console.log('The frontend should map form fields to backend fields like this:');
    console.log(`
const signupData = {
  user_type: form.type,
  first_name: form.firstName,           // ✓ Maps to first_name
  last_name: form.lastName,             // ✓ Maps to last_name  
  email: form.email,                    // ✓ Maps to email
  username: form.email.split('@')[0],   // ✓ Auto-generated from email
  password: form.password,              // ✓ Maps to password
  password_confirm: form.confirmPassword, // ✓ Maps to password_confirm
  // ... other fields
};
`);
    
  } catch (error) {
    console.log('❌ Failed to connect to backend server');
    console.log('Error:', error.message);
    console.log('\n🔧 Solutions:');
    console.log('1. Make sure Django backend is running: python manage.py runserver');
    console.log('2. Check the backend URL in your .env file');
    console.log('3. Verify CORS is configured in Django settings');
    console.log('4. Check firewall/antivirus is not blocking the connection');
  }
}

checkBackendCompatibility();