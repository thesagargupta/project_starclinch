from django.db import models
from django.contrib.auth import get_user_model
from datetime import datetime
import random

User = get_user_model()


class Incident(models.Model):
    """
    Model to represent incident reports
    """
    # Priority choices
    PRIORITY_CHOICES = [
        ('HIGH', 'High'),
        ('MEDIUM', 'Medium'),
        ('LOW', 'Low'),
    ]
    
    # Status choices
    STATUS_CHOICES = [
        ('OPEN', 'Open'),
        ('IN_PROGRESS', 'In Progress'),
        ('CLOSED', 'Closed'),
    ]
    
    # Reporter type choices
    REPORTER_TYPE_CHOICES = [
        ('ENTERPRISE', 'Enterprise'),
        ('GOVERNMENT', 'Government'),
    ]
    
    # Auto-generated incident ID format: RMG + 5 random digits + current year
    incident_id = models.CharField(max_length=12, unique=True, editable=False)
    
    # Reporter information
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reported_incidents')
    reporter_type = models.CharField(max_length=20, choices=REPORTER_TYPE_CHOICES)
    
    # Incident details
    incident_details = models.TextField(help_text="Detailed description of the incident")
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='MEDIUM')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='OPEN')
    
    # Timestamps
    reported_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        """
        Override save method to auto-generate incident ID
        """
        if not self.incident_id:
            self.incident_id = self.generate_incident_id()
        super().save(*args, **kwargs)
    
    def generate_incident_id(self):
        """
        Generate unique incident ID in format: RMG + 5 random digits + current year
        """
        current_year = datetime.now().year
        
        while True:
            # Generate 5 random digits
            random_digits = ''.join([str(random.randint(0, 9)) for _ in range(5)])
            incident_id = f"RMG{random_digits}{current_year}"
            
            # Check if this ID already exists
            if not Incident.objects.filter(incident_id=incident_id).exists():
                return incident_id
    
    def is_editable(self):
        """
        Check if incident can be edited (not closed)
        """
        return self.status != 'CLOSED'
    
    def __str__(self):
        return f"{self.incident_id} - {self.get_priority_display()}"
    
    class Meta:
        db_table = 'incidents'
        verbose_name = 'Incident'
        verbose_name_plural = 'Incidents'
        ordering = ['-reported_date']
