from rest_framework import serializers
from .models import Incident
from users.serializers import UserSerializer


class IncidentSerializer(serializers.ModelSerializer):
    """
    Serializer for Incident model
    """
    reporter_name = serializers.CharField(source='reporter.get_full_name', read_only=True)
    reporter_email = serializers.CharField(source='reporter.email', read_only=True)
    is_editable = serializers.SerializerMethodField()
    
    class Meta:
        model = Incident
        fields = [
            'id', 'incident_id', 'reporter', 'reporter_name', 'reporter_email',
            'reporter_type', 'incident_details', 'priority', 'status',
            'reported_date', 'updated_date', 'is_editable'
        ]
        read_only_fields = ['id', 'incident_id', 'reporter', 'reported_date', 'updated_date']
    
    def get_is_editable(self, obj):
        """
        Check if incident is editable (not closed)
        """
        return obj.is_editable()
    
    def validate(self, attrs):
        """
        Validate incident data
        """
        # Check if trying to edit a closed incident
        if self.instance and self.instance.status == 'CLOSED':
            raise serializers.ValidationError("Cannot edit a closed incident")
        
        return attrs


class IncidentCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new incidents
    """
    class Meta:
        model = Incident
        fields = [
            'reporter_type', 'incident_details', 'priority'
        ]
    
    def create(self, validated_data):
        """
        Create incident with current user as reporter
        """
        request = self.context.get('request')
        validated_data['reporter'] = request.user
        return super().create(validated_data)


class IncidentUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating incidents
    """
    class Meta:
        model = Incident
        fields = [
            'incident_details', 'priority', 'status'
        ]
    
    def validate(self, attrs):
        """
        Validate incident update
        """
        if self.instance.status == 'CLOSED':
            raise serializers.ValidationError("Cannot edit a closed incident")
        
        return attrs


class IncidentDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for incident with reporter information
    """
    reporter_details = UserSerializer(source='reporter', read_only=True)
    is_editable = serializers.SerializerMethodField()
    
    class Meta:
        model = Incident
        fields = [
            'id', 'incident_id', 'reporter_details', 'reporter_type',
            'incident_details', 'priority', 'status',
            'reported_date', 'updated_date', 'is_editable'
        ]
    
    def get_is_editable(self, obj):
        """
        Check if incident is editable (not closed)
        """
        return obj.is_editable()