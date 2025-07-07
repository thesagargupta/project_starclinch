// Test script to check incident creation API
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Test with minimal data to see what the backend expects
async function testIncidentCreation() {
  try {
    // First, let's get the auth token (you'll need to replace with actual token)
    const token = localStorage.getItem('token');
    
    const testData = {
      title: 'Test Incident',
      description: 'Test description',
      priority: 'MEDIUM',
      category: 'GENERAL',
      incident_id: 'RMG123452024',
      reporter_name: 'Test User',
      reporter_email: 'test@example.com',
      reporter_type: 'individual',
      status: 'OPEN',
      reported_date: new Date().toISOString(),
    };

    console.log('Testing with data:', testData);

    const response = await fetch(`${API_BASE_URL}/incidents/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', result);

    if (!response.ok) {
      console.error('Error details:', result);
    }
  } catch (error) {
    console.error('Test error:', error);
  }
}

// You can run this in the browser console to test
console.log('To test incident creation, call: testIncidentCreation()');