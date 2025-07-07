#!/usr/bin/env python
"""
Comprehensive API test script for Incident Management System
"""

import requests
import json
import sys

class APITester:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        
    def print_response(self, response, title="Response"):
        """Pretty print API response"""
        print(f"\n{title}:")
        print(f"Status Code: {response.status_code}")
        try:
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        except:
            print(f"Response: {response.text}")
        print("-" * 60)
    
    def test_user_registration(self):
        """Test user registration"""
        print("Testing User Registration...")
        
        data = {
            "username": "test_user",
            "email": "test@example.com",
            "first_name": "Test",
            "last_name": "User",
            "phone_number": "+91-9876543213",
            "address": "123 Test Street",
            "pincode": "110001",
            "city": "New Delhi",
            "country": "India",
            "password": "testpass123",
            "password_confirm": "testpass123"
        }
        
        response = requests.post(f"{self.base_url}/api/users/register/", json=data)
        self.print_response(response, "User Registration")
        
        if response.status_code == 201:
            result = response.json()
            self.token = result['token']
            self.user_id = result['user']['id']
            print(f"✓ Registration successful. Token: {self.token}")
            return True
        else:
            print("✗ Registration failed")
            return False
    
    def test_user_login(self):
        """Test user login"""
        print("Testing User Login...")
        
        data = {
            "email": "test@example.com",
            "password": "testpass123"
        }
        
        response = requests.post(f"{self.base_url}/api/users/login/", json=data)
        self.print_response(response, "User Login")
        
        if response.status_code == 200:
            result = response.json()
            self.token = result['token']
            self.user_id = result['user']['id']
            print(f"✓ Login successful. Token: {self.token}")
            return True
        else:
            print("✗ Login failed")
            return False
    
    def test_pincode_lookup(self):
        """Test pincode lookup"""
        print("Testing Pincode Lookup...")
        
        response = requests.get(f"{self.base_url}/api/users/pincode/110001/")
        self.print_response(response, "Pincode Lookup")
        
        if response.status_code == 200:
            print("✓ Pincode lookup successful")
            return True
        else:
            print("✗ Pincode lookup failed")
            return False
    
    def test_create_incident(self):
        """Test incident creation"""
        print("Testing Incident Creation...")
        
        if not self.token:
            print("✗ No authentication token available")
            return False
        
        headers = {"Authorization": f"Token {self.token}"}
        data = {
            "reporter_type": "ENTERPRISE",
            "incident_details": "Test incident created via API",
            "priority": "HIGH"
        }
        
        response = requests.post(f"{self.base_url}/api/incidents/", json=data, headers=headers)
        self.print_response(response, "Incident Creation")
        
        if response.status_code == 201:
            result = response.json()
            self.incident_id = result['incident_id']
            print(f"✓ Incident created successfully. ID: {self.incident_id}")
            return True
        else:
            print("✗ Incident creation failed")
            return False
    
    def test_list_incidents(self):
        """Test listing incidents"""
        print("Testing Incident List...")
        
        if not self.token:
            print("✗ No authentication token available")
            return False
        
        headers = {"Authorization": f"Token {self.token}"}
        response = requests.get(f"{self.base_url}/api/incidents/", headers=headers)
        self.print_response(response, "Incident List")
        
        if response.status_code == 200:
            print("✓ Incident list retrieved successfully")
            return True
        else:
            print("✗ Incident list retrieval failed")
            return False
    
    def test_search_incident(self):
        """Test incident search"""
        print("Testing Incident Search...")
        
        if not self.token or not hasattr(self, 'incident_id'):
            print("✗ No authentication token or incident ID available")
            return False
        
        headers = {"Authorization": f"Token {self.token}"}
        response = requests.get(f"{self.base_url}/api/incidents/search/?incident_id={self.incident_id}", headers=headers)
        self.print_response(response, "Incident Search")
        
        if response.status_code == 200:
            print("✓ Incident search successful")
            return True
        else:
            print("✗ Incident search failed")
            return False
    
    def test_incident_stats(self):
        """Test incident statistics"""
        print("Testing Incident Statistics...")
        
        if not self.token:
            print("✗ No authentication token available")
            return False
        
        headers = {"Authorization": f"Token {self.token}"}
        response = requests.get(f"{self.base_url}/api/incidents/stats/", headers=headers)
        self.print_response(response, "Incident Statistics")
        
        if response.status_code == 200:
            print("✓ Incident statistics retrieved successfully")
            return True
        else:
            print("✗ Incident statistics retrieval failed")
            return False
    
    def test_user_profile(self):
        """Test user profile"""
        print("Testing User Profile...")
        
        if not self.token:
            print("✗ No authentication token available")
            return False
        
        headers = {"Authorization": f"Token {self.token}"}
        response = requests.get(f"{self.base_url}/api/users/profile/", headers=headers)
        self.print_response(response, "User Profile")
        
        if response.status_code == 200:
            print("✓ User profile retrieved successfully")
            return True
        else:
            print("✗ User profile retrieval failed")
            return False
    
    def run_all_tests(self):
        """Run all tests"""
        print("=" * 60)
        print("INCIDENT MANAGEMENT SYSTEM API TESTS")
        print("=" * 60)
        
        tests = [
            ("User Registration", self.test_user_registration),
            ("User Login", self.test_user_login),
            ("Pincode Lookup", self.test_pincode_lookup),
            ("User Profile", self.test_user_profile),
            ("Create Incident", self.test_create_incident),
            ("List Incidents", self.test_list_incidents),
            ("Search Incident", self.test_search_incident),
            ("Incident Statistics", self.test_incident_stats),
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            try:
                if test_func():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"✗ {test_name} failed with error: {e}")
                failed += 1
        
        print("\n" + "=" * 60)
        print("TEST RESULTS")
        print("=" * 60)
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Total: {passed + failed}")
        print("=" * 60)
        
        if failed == 0:
            print("🎉 All tests passed!")
        else:
            print("⚠️  Some tests failed. Check server logs for details.")


if __name__ == "__main__":
    # Check if server is running
    try:
        response = requests.get("http://localhost:8000/api/users/list/")
        if response.status_code == 401:  # Unauthorized is expected
            print("✓ Server is running")
        else:
            print("✓ Server is accessible")
    except requests.exceptions.ConnectionError:
        print("✗ Server is not running. Please start the Django server first:")
        print("  python manage.py runserver")
        sys.exit(1)
    
    # Run tests
    tester = APITester()
    tester.run_all_tests()