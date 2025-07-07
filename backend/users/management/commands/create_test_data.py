from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from incidents.models import Incident
from users.models import PincodeData
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Create test users and incidents for development'

    def handle(self, *args, **options):
        self.stdout.write('Creating test data...')
        
        # Create test users
        test_users = [
            {
                'username': 'john_doe',
                'email': 'john@example.com',
                'first_name': 'John',
                'last_name': 'Doe',
                'phone_number': '+91-9876543210',
                'address': '123 Main Street, Sector 1',
                'pincode': '110001',
                'city': 'New Delhi',
                'country': 'India'
            },
            {
                'username': 'jane_smith',
                'email': 'jane@example.com',
                'first_name': 'Jane',
                'last_name': 'Smith',
                'phone_number': '+91-9876543211',
                'address': '456 Oak Avenue, Bandra',
                'pincode': '400001',
                'city': 'Mumbai',
                'country': 'India'
            },
            {
                'username': 'admin_user',
                'email': 'admin@example.com',
                'first_name': 'Admin',
                'last_name': 'User',
                'phone_number': '+91-9876543212',
                'address': '789 Admin Street, Koramangala',
                'pincode': '560001',
                'city': 'Bangalore',
                'country': 'India'
            }
        ]
        
        created_users = []
        for user_data in test_users:
            user, created = User.objects.get_or_create(
                email=user_data['email'],
                defaults=user_data
            )
            if created:
                user.set_password('testpass123')
                user.save()
                created_users.append(user)
                self.stdout.write(f'Created user: {user.email}')
            else:
                created_users.append(user)
                self.stdout.write(f'User already exists: {user.email}')
        
        # Create test incidents
        sample_incidents = [
            {
                'reporter_type': 'ENTERPRISE',
                'incident_details': 'Server downtime reported in production environment. Users unable to access main application.',
                'priority': 'HIGH'
            },
            {
                'reporter_type': 'GOVERNMENT',
                'incident_details': 'Database connectivity issues causing delays in government portal access.',
                'priority': 'MEDIUM'
            },
            {
                'reporter_type': 'ENTERPRISE',
                'incident_details': 'Email system experiencing intermittent failures. Some emails not being delivered.',
                'priority': 'LOW'
            },
            {
                'reporter_type': 'GOVERNMENT',
                'incident_details': 'Security breach detected in the authentication system. Immediate action required.',
                'priority': 'HIGH'
            },
            {
                'reporter_type': 'ENTERPRISE',
                'incident_details': 'Network latency issues reported by multiple users across different locations.',
                'priority': 'MEDIUM'
            }
        ]
        
        incident_count = 0
        for user in created_users:
            # Create 2-3 incidents per user
            num_incidents = random.randint(2, 3)
            for i in range(num_incidents):
                incident_data = random.choice(sample_incidents)
                incident = Incident.objects.create(
                    reporter=user,
                    **incident_data
                )
                incident_count += 1
                self.stdout.write(f'Created incident: {incident.incident_id} for {user.email}')
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {len(created_users)} users and {incident_count} incidents'
            )
        )
        
        # Display login credentials
        self.stdout.write('\n' + '='*50)
        self.stdout.write('TEST LOGIN CREDENTIALS:')
        self.stdout.write('='*50)
        for user_data in test_users:
            self.stdout.write(f'Email: {user_data["email"]}')
            self.stdout.write(f'Password: testpass123')
            self.stdout.write('-'*30)