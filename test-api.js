// Simple test script to verify API endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:8000/api/';

async function testAPI() {
  try {
    console.log('Testing API endpoints...');
    
    // Test 1: Check if server is running
    console.log('\n1. Testing server connectivity...');
    const response = await axios.get(`${BASE_URL}users/`);
    console.log('✅ Server is running and responding');
    
    // Test 2: Test user registration
    console.log('\n2. Testing user registration...');
    const testUser = {
      user_type: 'individual',
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      username: 'testuser',
      address: '123 Test St',
      country: 'United States',
      state: 'California',
      city: 'Los Angeles',
      pincode: '90210',
      mobile_country_code: '+1',
      mobile_number: '1234567890',
      phone: '9876543210',
      fax_country_code: '+1',
      fax_number: '1111111111',
      password: 'TestPassword123',
      password_confirm: 'TestPassword123',
    };

    try {
      const registerResponse = await axios.post(`${BASE_URL}users/register/`, testUser);
      console.log('✅ User registration successful');
      console.log('Response:', registerResponse.data);
      
      // Test 3: Test user login
      console.log('\n3. Testing user login...');
      const loginResponse = await axios.post(`${BASE_URL}users/login/`, {
        email: testUser.email,
        password: testUser.password
      });
      console.log('✅ User login successful');
      console.log('Token:', loginResponse.data.token);
      
    } catch (error) {
      if (error.response) {
        console.log('❌ Registration failed with error:', error.response.data);
        console.log('Status:', error.response.status);
      } else {
        console.log('❌ Registration failed:', error.message);
      }
    }
    
  } catch (error) {
    if (error.response) {
      console.log('❌ API test failed with error:', error.response.data);
      console.log('Status:', error.response.status);
    } else {
      console.log('❌ API test failed:', error.message);
      console.log('Make sure Django backend is running on http://localhost:8000');
    }
  }
}

testAPI();