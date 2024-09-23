from django.urls import path
from .views import  RegisterAPIView, LoginAPIView, DonationAPI, CrisisAPI, InventoryAPI, VolunteerManagementAPI, ReportAPI,VolunteerTaskAPI,AdminTaskAPI,ProfileAPI,VolunteerAssignTask,CrisistoResponseAPI

urlpatterns = [
    #register urls
    path('register/', RegisterAPIView.as_view(), name='register'),
    path('login/', LoginAPIView.as_view(), name='login'),

    path('donations/', DonationAPI.as_view(), name='donation-api'),
    path('crisis/', CrisisAPI.as_view(), name='crisis-api'),
    path('inventory/', InventoryAPI.as_view(), name='inventory-api'),
    # path('volunteers/', AnonymousVolunteerAPI.as_view(), name='anonymous-volunteer-api'),
    path('crisis/<int:crisis_id>/respond/', CrisistoResponseAPI.as_view(), name='crisis-respond'),

    # Admin-specific routes
    path('volunteers/<int:volunteer_id>/assign_task/', VolunteerAssignTask.as_view(), name='volunteer-management-api'),
    path('volunteers/', VolunteerManagementAPI.as_view(), name='volunteer-management'),
    path('reports/<str:report_type>/', ReportAPI.as_view(), name='generate_report'),
    
    # Profile
    path('account/', ProfileAPI.as_view(), name='profile-api'),


    # path('volunteers/', VolunteerAPI.as_view(), name='volunteer-list'),
    path('tasks/volunteer/', VolunteerTaskAPI.as_view(), name='task-list'),
    path('tasks/', AdminTaskAPI.as_view(), name='task-list'),
    path('tasks/volunteer/<int:task_id>/', VolunteerTaskAPI.as_view(), name='task-update'),
]
