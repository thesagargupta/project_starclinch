from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from .models import Incident
from .serializers import (
    IncidentSerializer, IncidentCreateSerializer, 
    IncidentUpdateSerializer, IncidentDetailSerializer
)


class IncidentListCreateView(generics.ListCreateAPIView):
    """
    View to list user's incidents and create new incidents
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Return incidents created by the current user only
        """
        return Incident.objects.filter(reporter=self.request.user)
    
    def get_serializer_class(self):
        """
        Return appropriate serializer based on request method
        """
        if self.request.method == 'POST':
            return IncidentCreateSerializer
        return IncidentSerializer
    
    def perform_create(self, serializer):
        """
        Set the reporter to the current user
        """
        serializer.save(reporter=self.request.user)


class IncidentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    View to retrieve, update, and delete specific incidents
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Return incidents created by the current user only
        """
        return Incident.objects.filter(reporter=self.request.user)
    
    def get_serializer_class(self):
        """
        Return appropriate serializer based on request method
        """
        if self.request.method in ['PUT', 'PATCH']:
            return IncidentUpdateSerializer
        return IncidentDetailSerializer
    
    def update(self, request, *args, **kwargs):
        """
        Override update to check if incident is editable
        """
        instance = self.get_object()
        
        if not instance.is_editable():
            return Response({
                'error': 'Cannot edit a closed incident'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return super().update(request, *args, **kwargs)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_incident(request):
    """
    View to search incidents by incident ID
    """
    incident_id = request.query_params.get('incident_id', '')
    
    if not incident_id:
        return Response({
            'error': 'Please provide incident_id parameter'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Search only in current user's incidents
        incident = Incident.objects.get(
            incident_id=incident_id,
            reporter=request.user
        )
        serializer = IncidentDetailSerializer(incident)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    except Incident.DoesNotExist:
        return Response({
            'error': 'Incident not found or you do not have permission to view it'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def incident_stats(request):
    """
    View to get incident statistics for the current user
    """
    user_incidents = Incident.objects.filter(reporter=request.user)
    
    stats = {
        'total_incidents': user_incidents.count(),
        'open_incidents': user_incidents.filter(status='OPEN').count(),
        'in_progress_incidents': user_incidents.filter(status='IN_PROGRESS').count(),
        'closed_incidents': user_incidents.filter(status='CLOSED').count(),
        'high_priority': user_incidents.filter(priority='HIGH').count(),
        'medium_priority': user_incidents.filter(priority='MEDIUM').count(),
        'low_priority': user_incidents.filter(priority='LOW').count(),
    }
    
    return Response(stats, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def close_incident(request, pk):
    """
    View to close an incident
    """
    try:
        incident = Incident.objects.get(
            pk=pk,
            reporter=request.user
        )
        
        if incident.status == 'CLOSED':
            return Response({
                'error': 'Incident is already closed'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        incident.status = 'CLOSED'
        incident.save()
        
        return Response({
            'message': 'Incident closed successfully',
            'incident': IncidentSerializer(incident).data
        }, status=status.HTTP_200_OK)
    
    except Incident.DoesNotExist:
        return Response({
            'error': 'Incident not found or you do not have permission to close it'
        }, status=status.HTTP_404_NOT_FOUND)
