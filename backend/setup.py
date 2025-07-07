#!/usr/bin/env python
"""
Setup script for Incident Management System
"""

import os
import sys
import django
from django.core.management import execute_from_command_line

def setup_database():
    """
    Setup database with migrations and sample data
    """
    print("Setting up Incident Management System Database...")
    print("=" * 60)
    
    # Set up Django environment
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'incident_management.settings')
    django.setup()
    
    print("1. Creating migrations...")
    execute_from_command_line(['manage.py', 'makemigrations'])
    
    print("\n2. Applying migrations...")
    execute_from_command_line(['manage.py', 'migrate'])
    
    print("\n3. Loading pincode data...")
    execute_from_command_line(['manage.py', 'load_pincode_data'])
    
    print("\n4. Creating test users and incidents...")
    execute_from_command_line(['manage.py', 'create_test_data'])
    
    print("\n5. Creating superuser (optional)...")
    try:
        execute_from_command_line(['manage.py', 'createsuperuser'])
    except KeyboardInterrupt:
        print("Skipping superuser creation...")
    
    print("\n" + "=" * 60)
    print("Setup completed successfully!")
    print("=" * 60)
    print("\nTo start the development server, run:")
    print("python manage.py runserver")
    print("\nAPI will be available at: http://localhost:8000/api/")
    print("Admin panel: http://localhost:8000/admin/")

if __name__ == '__main__':
    setup_database()