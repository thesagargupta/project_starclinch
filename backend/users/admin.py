from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, PincodeData


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Admin configuration for custom User model
    """
    list_display = ['username', 'email', 'first_name', 'last_name', 'phone_number', 'city', 'is_active']
    list_filter = ['is_active', 'is_staff', 'date_joined', 'city', 'country']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone_number']
    ordering = ['-date_joined']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('phone_number', 'address', 'pincode', 'city', 'country')
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Additional Info', {
            'fields': ('email', 'first_name', 'last_name', 'phone_number', 'address', 'pincode', 'city', 'country')
        }),
    )


@admin.register(PincodeData)
class PincodeDataAdmin(admin.ModelAdmin):
    """
    Admin configuration for PincodeData model
    """
    list_display = ['pincode', 'city', 'state', 'country']
    list_filter = ['state', 'country']
    search_fields = ['pincode', 'city', 'state']
    ordering = ['pincode']
