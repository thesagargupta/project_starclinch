from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User model with additional fields for incident management system
    """
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    pincode = models.CharField(max_length=10, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    
    # Additional fields for user management
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'


class PincodeData(models.Model):
    """
    Model to store pincode data for auto-filling city and country
    """
    pincode = models.CharField(max_length=10, unique=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    
    def __str__(self):
        return f"{self.pincode} - {self.city}, {self.state}, {self.country}"
    
    class Meta:
        db_table = 'pincode_data'
        verbose_name = 'Pincode Data'
        verbose_name_plural = 'Pincode Data'
