from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Donation, Crisis, InventoryItem
from .serializers import DonationSerializer, CrisisSerializer, InventorySerializer
from .permissions import IsAdmin, IsVolunteer
from rest_framework.permissions import AllowAny, IsAuthenticated

from .serializers import UserSerializer
from .models import Task
from .serializers import TaskSerializer


from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, DateField
from django.db.models.functions import TruncDate
from .models import Donation, InventoryItem
# Expense
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .serializers import RegisterSerializer, LoginSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly




# Donation API: Anyone can donate
from itertools import groupby
from operator import itemgetter

class DonationAPI(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        donations = Donation.objects.all().order_by('-timestamp')
        expense = InventoryItem.objects.all().order_by('-timestamp')

        # Calculate the total donated amount dynamically
        total_donations = donations.aggregate(Sum('amount'))['amount__sum'] or 0
        total_expense = expense.aggregate(Sum('expense'))['expense__sum'] or 0

        # Group donations and expenses by day for chart data
        donations_per_day = donations.annotate(day=TruncDate('timestamp')).values('day').annotate(total_donated=Sum('amount')).order_by('day')
        expenses_per_day = expense.annotate(day=TruncDate('timestamp')).values('day').annotate(total_expense=Sum('expense')).order_by('day')

        # Combine donations and expenses based on the day
        combined_data = {}

        # Add donations to combined_data
        for donation in donations_per_day:
            day = donation['day']
            combined_data[day] = {
                'day': day,
                'total_donated': donation['total_donated'],
                'total_expense': 0  # Default 0 for days without expenses
            }

        # Add expenses to combined_data (merge if the day exists)
        for expense in expenses_per_day:
            day = expense['day']
            if day in combined_data:
                combined_data[day]['total_expense'] = expense['total_expense']
            else:
                combined_data[day] = {
                    'day': day,
                    'total_donated': 0,  # Default 0 for days without donations
                    'total_expense': expense['total_expense']
                }

        # Sort combined data by day
        combined_chart_data = sorted(combined_data.values(), key=itemgetter('day'))

        available_donations = total_donations - total_expense
        serializer = DonationSerializer(donations, many=True)
        
        response_data = {
            "total_donated": total_donations,
            "available_donations": available_donations,
            "chart_data": combined_chart_data,  # Combined donations and expenses by day
            "donations": serializer.data
        }

        return Response(response_data)


    def post(self, request):
        serializer = DonationSerializer(data=request.data)
        if serializer.is_valid():
            # Save the new donation
            donation = serializer.save()

            # After saving, recalculate the total donated amount in real-time
            total_donations = Donation.objects.aggregate(Sum('amount'))['amount__sum'] or 0

            # Return the donation data and the updated total donated amount
            response_data = {
                "donation": serializer.data,
                "total_donated": total_donations  # Return updated total
            }

            return Response(response_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Crisis API: Only authenticated users can add crises, but anyone can view them.
class   CrisisAPI(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
            try: 
                if request.user.role == 'admin':
                    crises = Crisis.objects.all()
                    serializer = CrisisSerializer(crises, many=True)
                    return Response(serializer.data)
                else:
                    crises = Crisis.objects.filter(status="active")
                    serializer = CrisisSerializer(crises, many=True)
                    return Response(serializer.data)
            except:
                    
                crises = Crisis.objects.filter(status="active")
                serializer = CrisisSerializer(crises, many=True)
                return Response(serializer.data)
    
    
        
        

    def post(self, request):
        # Anyone can report a crisis, but it defaults to "pending"
        serializer = CrisisSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save( status="pending")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        # Extract crisis_id from the request body
        crisis_id = request.data.get('crisis_id')
        
        if not crisis_id:
            return Response({'detail': 'Crisis ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            crisis = Crisis.objects.get(id=crisis_id)
        except Crisis.DoesNotExist:
            return Response({'detail': 'Crisis not found.'}, status=status.HTTP_404_NOT_FOUND)

        if request.user.role == 'admin':
            serializer = CrisisSerializer(crisis, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'detail': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)


# Inventory API: Only volunteers and admins can add, update, or delete inventory items.
class InventoryAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.request.method in ['POST', 'PUT', 'DELETE']:
            return [IsAdmin() | IsVolunteer()]
        return [IsAuthenticated()]

    def get(self, request):
        inventory = InventoryItem.objects.all()
        serializer = InventorySerializer(inventory, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = InventorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(added_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        try:
            item = InventoryItem.objects.get(pk=pk)
        except InventoryItem.DoesNotExist:
            return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = InventorySerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            item = InventoryItem.objects.get(pk=pk)
        except InventoryItem.DoesNotExist:
            return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)

        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    




# Admin API to manage volunteers
class VolunteerManagementAPI(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        volunteers = User.objects.filter(role="volunteer")
        serializer = UserSerializer(volunteers, many=True)
        return Response(serializer.data)


class ProfileAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Retrieve the user's profile details
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        # Update the user's profile details
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Assign volunteers to tasks/crises
class AssignTaskAPI(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, volunteer_id, task_id):
        try:
           
            user = User.objects.get(pk=volunteer_id)
            
            # Ensure the user is a volunteer
            if user.role != 'volunteer':
                return Response({"error": "User is not a volunteer."}, status=status.HTTP_400_BAD_REQUEST)

            # Get or create the volunteer object
            volunteer, created = Volunteer.objects.get_or_create(user=user)  
            
            task = Task.objects.get(pk=task_id)
            
           
            volunteer.assigned_tasks.add(task)
            
            return Response({"status": "Task assigned to volunteer."}, status=status.HTTP_200_OK)
        
        except Volunteer.DoesNotExist:
            return Response({"error": "Volunteer not found."}, status=status.HTTP_404_NOT_FOUND)
        
     




# API for volunteers to view and update their tasks
class VolunteerTaskAPI(APIView):
    permission_classes = [IsVolunteer]

    def get(self, request):
        tasks = Task.objects.filter(volunteer=request.user)
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    def patch(self, request, task_id):
        try:
            task = Task.objects.get(pk=task_id, volunteer=request.user)
            serializer = TaskSerializer(task, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Task.DoesNotExist:
            return Response({"error": "Task not found"}, status=status.HTTP_404_NOT_FOUND)


import csv
from django.http import HttpResponse
from .models import Donation, InventoryItem

# Admin API to generate and download reports
class ReportAPI(APIView):
    permission_classes = [IsAdmin]

    def get(self, request, report_type):
        response = HttpResponse(content_type='text/csv')
        writer = csv.writer(response)
        
        if report_type == 'donation':
            donations = Donation.objects.all()
            writer.writerow(['Amount', 'Donor', 'Date'])
            for donation in donations:
                writer.writerow([donation.amount, donation.donor_name, donation.timestamp])
        
        elif report_type == 'inventory':
            inventory = InventoryItem.objects.all()
            writer.writerow(['Item', 'Type', 'Quantity', 'Added By', 'Date'])
            for item in inventory:
                writer.writerow([item.name, item.type, item.quantity, item.added_by.username, item.timestamp])

        response['Content-Disposition'] = f'attachment; filename="{report_type}_report.csv"'
        return response





# Anonymous API to view volunteers
# class AnonymousVolunteerAPI(APIView):
#     permission_classes = [AllowAny]

#     def get(self, request):
#         volunteers = Volunteer.objects.all()
#         serializer = UserSerializer(volunteers, many=True)
#         return Response(serializer.data)





# class ChartAPI(APIView):
#     def get(self, request):
#         donations = Donation.objects.annotate(date=TruncDate('timestamp')).values('date').annotate(total=Sum('amount'))
#         expenses = Expense.objects.annotate(date=TruncDate('timestamp')).values('date').annotate(total=Sum('amount'))
        
#         data = {
#             'donations': list(donations),
#             'expenses': list(expenses)
#         }
#         return Response(data)





class RegisterAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        print(request.data)
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "User created successfully",
                "user": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
      
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            print(str(refresh.access_token))
            return Response({
                'username': user.username,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




# class VolunteerAPI(APIView):
#     permission_classes = [IsAdmin]

#     def get(self, request):
#         # List all volunteers (admins can see this)
       
#         volunteers = Volunteer.objects.all()
        
#         return Response(serializer.data)
      
    


class AdminTaskAPI(APIView):
    def get(self, request):
       
        # Only admin can view their assigned tasks
        self.permission_classes = [IsAdmin]
        self.check_permissions(request)
        
       
        
        tasks = Task.objects.all()  # Assuming a reverse relation to tasks
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    def post(self, request):
        # Only admins can assign tasks
        self.permission_classes = [IsAdmin]
        self.check_permissions(request)
        
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

   
class VolunteerAssignTask(APIView):
    # permission_classes = [IsAdmin | IsVolunteer]
    def post(self, request,volunteer_id):
        self.permission_classes = [IsAdmin]
        self.check_permissions(request)
       
        volunteer = User.objects.get(pk=volunteer_id)
        
        print(request.data['task_id'])
        
        tasks = volunteer.assigned_tasks.add(request.data['task_id'])

        
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)
    
    def delete(self, request, volunteer_id):
        self.permission_classes = [IsAdmin]
        self.check_permissions(request)
        
        # Fetch the volunteer and task
        volunteer = User.objects.get(pk=volunteer_id)
        task_id = request.GET.get('task_id')

        # Check if task_id exists in query params
        if task_id:
            try:
                task = Task.objects.get(pk=task_id)
            except Task.DoesNotExist:
                return Response({"error": "Task not found."}, status=status.HTTP_404_NOT_FOUND)
            
            # Remove the task from the volunteer's assigned tasks
            volunteer.assigned_tasks.remove(task)

            # Serialize the remaining tasks
            remaining_tasks = volunteer.assigned_tasks.all()
            serializer = TaskSerializer(remaining_tasks, many=True)
            
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response({"error": "Task ID is required."}, status=status.HTTP_400_BAD_REQUEST)

       
       
        
class VolunteerTaskAPI(APIView):
    def get(self, request):
       
        # Only volunteers can view their assigned tasks
        self.permission_classes = [IsVolunteer]
        self.check_permissions(request)
        
       
        try:
             volunteer = Volunteer.objects.get(user=request.user)
        except Volunteer.DoesNotExist:
            return Response({'detail': 'No task assign for you'}, status=status.HTTP_404_NOT_FOUND)
        tasks = volunteer.assigned_tasks.all()  # Assuming a reverse relation to tasks
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    

    def patch(self, request, task_id):
        # Only volunteers can update the status of their own assigned tasks
        self.permission_classes = [IsVolunteer]
        self.check_permissions(request)
        
        try:
            task = Task.objects.get(id=task_id)
            if task in request.user.volunteer.assigned_tasks.all():
                serializer = TaskSerializer(task, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            return Response({'detail': 'Task not assigned to this volunteer'}, status=status.HTTP_403_FORBIDDEN)
        except Task.DoesNotExist:
            return Response({'detail': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)
        







