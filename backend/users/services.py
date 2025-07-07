import requests
from django.conf import settings
from .models import PincodeData


class PincodeService:
    """
    Service to handle pincode lookup and auto-fill city/country
    """
    
    def __init__(self):
        # You can add external API URLs here
        self.external_apis = [
            'https://api.postalpincode.in/pincode/',
            # Add more APIs as needed
        ]
    
    def lookup_pincode(self, pincode):
        """
        Lookup pincode from local database first, then external APIs
        """
        try:
            # First try local database
            pincode_data = PincodeData.objects.get(pincode=pincode)
            return {
                'success': True,
                'data': {
                    'pincode': pincode_data.pincode,
                    'city': pincode_data.city,
                    'state': pincode_data.state,
                    'country': pincode_data.country
                }
            }
        except PincodeData.DoesNotExist:
            # Try external APIs
            return self._fetch_from_external_apis(pincode)
    
    def _fetch_from_external_apis(self, pincode):
        """
        Fetch pincode data from external APIs
        """
        for api_url in self.external_apis:
            try:
                response = requests.get(f"{api_url}{pincode}", timeout=5)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Process API response (this depends on the API structure)
                    if self._is_valid_response(data):
                        processed_data = self._process_api_response(data, pincode)
                        
                        # Save to local database for future use
                        self._save_to_local_db(processed_data)
                        
                        return {
                            'success': True,
                            'data': processed_data
                        }
                        
            except Exception as e:
                continue
        
        return {
            'success': False,
            'error': 'Pincode not found'
        }
    
    def _is_valid_response(self, data):
        """
        Check if API response is valid
        """
        # This depends on the API structure
        # For postalpincode.in API
        if isinstance(data, list) and len(data) > 0:
            return data[0].get('Status') == 'Success'
        return False
    
    def _process_api_response(self, data, pincode):
        """
        Process API response to extract required fields
        """
        # For postalpincode.in API structure
        if isinstance(data, list) and len(data) > 0:
            post_office = data[0].get('PostOffice', [])
            if post_office:
                office_data = post_office[0]
                return {
                    'pincode': pincode,
                    'city': office_data.get('District', ''),
                    'state': office_data.get('State', ''),
                    'country': office_data.get('Country', 'India')
                }
        
        return None
    
    def _save_to_local_db(self, data):
        """
        Save fetched data to local database
        """
        if data:
            try:
                PincodeData.objects.get_or_create(
                    pincode=data['pincode'],
                    defaults={
                        'city': data['city'],
                        'state': data['state'],
                        'country': data['country']
                    }
                )
            except Exception as e:
                # Log error but don't fail the request
                pass
    
    def get_all_cities(self):
        """
        Get all unique cities from database
        """
        return PincodeData.objects.values_list('city', flat=True).distinct()
    
    def get_all_states(self):
        """
        Get all unique states from database
        """
        return PincodeData.objects.values_list('state', flat=True).distinct()
    
    def get_cities_by_state(self, state):
        """
        Get cities for a specific state
        """
        return PincodeData.objects.filter(state=state).values_list('city', flat=True).distinct()