from django.contrib import admin
from .models import Incident


@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    """
    Admin configuration for Incident model
    """
    list_display = ['incident_id', 'reporter', 'reporter_type', 'priority', 'status', 'reported_date']
    list_filter = ['reporter_type', 'priority', 'status', 'reported_date']
    search_fields = ['incident_id', 'reporter__username', 'reporter__email', 'incident_details']
    ordering = ['-reported_date']
    readonly_fields = ['incident_id', 'reported_date', 'updated_date']
    
    fieldsets = (
        ('Incident Information', {
            'fields': ('incident_id', 'reporter', 'reporter_type')
        }),
        ('Incident Details', {
            'fields': ('incident_details', 'priority', 'status')
        }),
        ('Timestamps', {
            'fields': ('reported_date', 'updated_date')
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        """
        Make incident non-editable if it's closed
        """
        readonly_fields = list(self.readonly_fields)
        if obj and obj.status == 'CLOSED':
            readonly_fields.extend(['incident_details', 'priority', 'status'])
        return readonly_fields
