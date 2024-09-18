from django.urls import path
from .views import  RegisterAPIView, LoginAPIView, DonationAPI, CrisisAPI, InventoryAPI, VolunteerManagementAPI, AssignTaskAPI, ReportAPI,VolunteerTaskAPI,AdminTaskAPI

urlpatterns = [
    #register urls
    path('register/', RegisterAPIView.as_view(), name='register'),
    path('login/', LoginAPIView.as_view(), name='login'),

    path('donations/', DonationAPI.as_view(), name='donation-api'),
    path('crises/', CrisisAPI.as_view(), name='crisis-api'),
    path('inventory/', InventoryAPI.as_view(), name='inventory-api'),
    # path('volunteers/', AnonymousVolunteerAPI.as_view(), name='anonymous-volunteer-api'),
    
    # Admin-specific routes
    path('volunteers/', VolunteerManagementAPI.as_view(), name='volunteer-management-api'),
    path('assign-task/<int:volunteer_id>/<int:task_id>/', AssignTaskAPI.as_view(), name='assign-task-api'),
    path('admin/report/<str:report_type>/', ReportAPI.as_view(), name='report-api'),
    
   

    # path('volunteers/', VolunteerAPI.as_view(), name='volunteer-list'),
    path('tasks/volunteer/', VolunteerTaskAPI.as_view(), name='task-list'),
    path('tasks/', AdminTaskAPI.as_view(), name='task-list'),
    path('tasks/volunteer/<int:task_id>/', VolunteerTaskAPI.as_view(), name='task-update'),
]
