from django.core.management.base import BaseCommand
from users.models import PincodeData


class Command(BaseCommand):
    help = 'Load sample pincode data for testing'

    def handle(self, *args, **options):
        # Sample Indian pincode data
        pincode_data = [
            # Delhi
            {"pincode": "110001", "city": "New Delhi", "state": "Delhi", "country": "India"},
            {"pincode": "110002", "city": "New Delhi", "state": "Delhi", "country": "India"},
            {"pincode": "110003", "city": "New Delhi", "state": "Delhi", "country": "India"},
            {"pincode": "110004", "city": "New Delhi", "state": "Delhi", "country": "India"},
            {"pincode": "110005", "city": "New Delhi", "state": "Delhi", "country": "India"},
            
            # Mumbai
            {"pincode": "400001", "city": "Mumbai", "state": "Maharashtra", "country": "India"},
            {"pincode": "400002", "city": "Mumbai", "state": "Maharashtra", "country": "India"},
            {"pincode": "400003", "city": "Mumbai", "state": "Maharashtra", "country": "India"},
            {"pincode": "400004", "city": "Mumbai", "state": "Maharashtra", "country": "India"},
            {"pincode": "400005", "city": "Mumbai", "state": "Maharashtra", "country": "India"},
            
            # Bangalore
            {"pincode": "560001", "city": "Bangalore", "state": "Karnataka", "country": "India"},
            {"pincode": "560002", "city": "Bangalore", "state": "Karnataka", "country": "India"},
            {"pincode": "560003", "city": "Bangalore", "state": "Karnataka", "country": "India"},
            {"pincode": "560004", "city": "Bangalore", "state": "Karnataka", "country": "India"},
            {"pincode": "560005", "city": "Bangalore", "state": "Karnataka", "country": "India"},
            
            # Chennai
            {"pincode": "600001", "city": "Chennai", "state": "Tamil Nadu", "country": "India"},
            {"pincode": "600002", "city": "Chennai", "state": "Tamil Nadu", "country": "India"},
            {"pincode": "600003", "city": "Chennai", "state": "Tamil Nadu", "country": "India"},
            {"pincode": "600004", "city": "Chennai", "state": "Tamil Nadu", "country": "India"},
            {"pincode": "600005", "city": "Chennai", "state": "Tamil Nadu", "country": "India"},
            
            # Hyderabad
            {"pincode": "500001", "city": "Hyderabad", "state": "Telangana", "country": "India"},
            {"pincode": "500002", "city": "Hyderabad", "state": "Telangana", "country": "India"},
            {"pincode": "500003", "city": "Hyderabad", "state": "Telangana", "country": "India"},
            {"pincode": "500004", "city": "Hyderabad", "state": "Telangana", "country": "India"},
            {"pincode": "500005", "city": "Hyderabad", "state": "Telangana", "country": "India"},
            
            # Pune
            {"pincode": "411001", "city": "Pune", "state": "Maharashtra", "country": "India"},
            {"pincode": "411002", "city": "Pune", "state": "Maharashtra", "country": "India"},
            {"pincode": "411003", "city": "Pune", "state": "Maharashtra", "country": "India"},
            {"pincode": "411004", "city": "Pune", "state": "Maharashtra", "country": "India"},
            {"pincode": "411005", "city": "Pune", "state": "Maharashtra", "country": "India"},
            
            # Kolkata
            {"pincode": "700001", "city": "Kolkata", "state": "West Bengal", "country": "India"},
            {"pincode": "700002", "city": "Kolkata", "state": "West Bengal", "country": "India"},
            {"pincode": "700003", "city": "Kolkata", "state": "West Bengal", "country": "India"},
            {"pincode": "700004", "city": "Kolkata", "state": "West Bengal", "country": "India"},
            {"pincode": "700005", "city": "Kolkata", "state": "West Bengal", "country": "India"},
            
            # Ahmedabad
            {"pincode": "380001", "city": "Ahmedabad", "state": "Gujarat", "country": "India"},
            {"pincode": "380002", "city": "Ahmedabad", "state": "Gujarat", "country": "India"},
            {"pincode": "380003", "city": "Ahmedabad", "state": "Gujarat", "country": "India"},
            {"pincode": "380004", "city": "Ahmedabad", "state": "Gujarat", "country": "India"},
            {"pincode": "380005", "city": "Ahmedabad", "state": "Gujarat", "country": "India"},
        ]
        
        created_count = 0
        for data in pincode_data:
            obj, created = PincodeData.objects.get_or_create(
                pincode=data['pincode'],
                defaults={
                    'city': data['city'],
                    'state': data['state'],
                    'country': data['country']
                }
            )
            if created:
                created_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully loaded {created_count} pincode records'
            )
        )