from django.urls import path
from . import views

urlpatterns = [
    path('', views.IncidentListCreateView.as_view(), name='incident-list-create'),
    path('<int:pk>/', views.IncidentDetailView.as_view(), name='incident-detail'),
    path('search/', views.search_incident, name='incident-search'),
    path('stats/', views.incident_stats, name='incident-stats'),
    path('<int:pk>/close/', views.close_incident, name='incident-close'),
]