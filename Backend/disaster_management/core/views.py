from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Donation, Crisis, InventoryItem
from .serializers import DonationSerializer, CrisisSerializer, InventorySerializer
from .permissions import IsAdmin, IsVolunteer
from rest_framework.permissions import AllowAny, IsAuthenticated
import csv
from django.http import HttpResponse
from .models import Donation, InventoryItem
import csv
import datetime
from .serializers import UserSerializer
from .models import Task,Respond
from .serializers import TaskSerializer

from django.utils.timezone import now
from datetime import timedelta
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
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response



class CustomPagination(PageNumberPagination):
    page_size_query_param = 'itemsPerPage'  # This allows dynamic control over the number of items per page.


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

        # Filter for the last 15 days
        fifteen_days_ago = now() - timedelta(days=15)
        combined_chart_data = [data for data in combined_chart_data if data['day'] >= fifteen_days_ago.date()]

        available_donations = total_donations - total_expense
        serializer = DonationSerializer(donations, many=True)
        
        response_data = {
            "total_donated": total_donations,
            "available_donations": available_donations,
            "chart_data": combined_chart_data,  # Only the last 15 days' data
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


# class CrisisAPI(APIView):
#     permission_classes = [AllowAny]

#     def get(self, request):
#         paginator = CustomPagination()
#         paginator.page_size = request.query_params.get('itemsPerPage', 10)  # Default page size if not provided
#         page = request.query_params.get('page', 1)  # Default page 1 if not provided
        
#         try:
#             if request.user.role == 'admin':
#                 crises = Crisis.objects.all()
#             else:
#                 crises = Crisis.objects.filter(status="active")

#             # Apply pagination
#             paginated_crises = paginator.paginate_queryset(crises, request)
#             serializer = CrisisSerializer(paginated_crises, many=True)
            
#             # Return the paginated response
#             return paginator.get_paginated_response(serializer.data)
        
#         except Exception as e:
#             crises = Crisis.objects.filter(status="active")
#             paginated_crises = paginator.paginate_queryset(crises, request)
#             serializer = CrisisSerializer(paginated_crises, many=True)
#             return paginator.get_paginated_response(serializer.data)


# Crisis API: Only authenticated users can add crises, but anyone can view them.
class CrisisAPI(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        paginator = CustomPagination()
        paginator.page_size = request.query_params.get('itemsPerPage', 5)  
        page = request.query_params.get('page', 1)  
        
        try:
            if request.user.role == 'admin':
                crises = Crisis.objects.all()
            else:
                crises = Crisis.objects.filter(status="active")

            
            paginated_crises = paginator.paginate_queryset(crises, request)
            serializer = CrisisSerializer(paginated_crises, many=True)
   
           
            
            return paginator.get_paginated_response(serializer.data)
        
        except Exception as e:
           
            crises = Crisis.objects.filter(status="active")
            paginated_crises = paginator.paginate_queryset(crises, request)
            serializer = CrisisSerializer(paginated_crises, many=True)
            return paginator.get_paginated_response(serializer.data)

    
        
        

    def post(self, request):
        

        serializer = CrisisSerializer(data=request.data)
        if serializer.is_valid():
            try:
                if request.user.role == 'admin':
                    serializer.save(status="active")
                else:
                    serializer.save(status="pending")
            except:
                serializer.save(status="pending")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        # Extract crisis_id from the request body
        crisis_id = request.GET.get('id')
      
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
    
   
    def delete(self, request):
        crisis_id = request.GET.get('id')
       
        if not crisis_id:
            return Response({'detail': 'Crisis ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            crisis = Crisis.objects.get(id=crisis_id)
        except Crisis.DoesNotExist:
            return Response({'detail': 'Crisis not found.'}, status=status.HTTP_404_NOT_FOUND)

        if request.user.role == 'admin':
            
            crisis.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
                
        
        return Response({'detail': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    

class CrisistoResponseAPI(APIView):
    permission_classes = [IsAuthenticated]

    # Existing GET method for listing crises

    def post(self, request, crisis_id):
        try:
            crisis = Crisis.objects.get(pk=crisis_id, status="active")
            if request.user.role == 'volunteer':
                response_message = request.data.get('message')
                Respond.objects.create(volunteer=request.user, crisis=crisis, message=response_message)
                return Response({"detail": "Response submitted successfully"}, status=201)
            else:
                return Response({"error": "Only volunteers can respond to crises"}, status=403)
        except Crisis.DoesNotExist:
            return Response({"error": "Crisis not found or not active"}, status=404)

       


# Inventory API: Only volunteers and admins can add, update, or delete inventory items.
class InventoryAPI(APIView):
    


    def get(self, request):
        self.permission_classes = [IsAdmin or IsVolunteer]
        self.check_permissions(request)
        inventory = InventoryItem.objects.all()
        serializer = InventorySerializer(inventory, many=True)
        return Response(serializer.data)

    def post(self, request):
        self.permission_classes = [IsAdmin or IsVolunteer]
        self.check_permissions(request)
        serializer = InventorySerializer(data=request.data,partial=True)
        if serializer.is_valid():
            serializer.save(added_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        try:
            item = InventoryItem.objects.get(pk=request.GET.get('itemId'))
        except InventoryItem.DoesNotExist:
            return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = InventorySerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        try:
            item = InventoryItem.objects.get(pk=request.GET.get('itemId'))
        except InventoryItem.DoesNotExist:
            return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)

        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    




# Admin API to manage volunteers
class VolunteerManagementAPI(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        paginator = CustomPagination()
        paginator.page_size = request.query_params.get('itemsPerPage', 5)
        page = request.query_params.get('page', 1)
        
        try:
            volunteers = User.objects.filter(role="volunteer")
            paginated_volunteers = paginator.paginate_queryset(volunteers, request)
            serializer = UserSerializer(paginated_volunteers, many=True)
            return paginator.get_paginated_response(serializer.data)
        
        except Exception as e:
            volunteers = User.objects.filter(role="volunteer")
            paginated_volunteers = paginator.paginate_queryset(volunteers, request)
            serializer = UserSerializer(paginated_volunteers, many=True)
            return paginator.get_paginated_response(serializer.data)



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



# Admin API to generate and download reports
class ReportAPI(APIView):
    permission_classes = [IsAdmin]

    def get(self, request, report_type):
        
        today = datetime.date.today()
        start_of_day = datetime.datetime.combine(today, datetime.time.min)
        end_of_day = datetime.datetime.combine(today, datetime.time.max)

       
        report_format = request.GET.get('format', 'csv')

        if report_type == 'donation':
            return self.generate_donation_report(start_of_day, end_of_day, report_format)
        elif report_type == 'expense':
            return self.generate_expense_report(start_of_day, end_of_day, report_format)
        elif report_type == 'inventory':
            return self.generate_inventory_report(report_format)

        return HttpResponse(status=404)

    def generate_donation_report(self, start_of_day, end_of_day, report_format):
        donations = Donation.objects.filter(timestamp__range=(start_of_day, end_of_day))

        if report_format == 'csv':
            response = HttpResponse(content_type='text/csv')
            writer = csv.writer(response)
            writer.writerow(['Amount', 'Donor', 'Date'])
            for donation in donations:
                writer.writerow([donation.amount, donation.donor_name, donation.timestamp])
            response['Content-Disposition'] = 'attachment; filename="daily_donation_report.csv"'
        else:  
            response = self.generate_excel_report(donations, ['Amount', 'Donor', 'Date'], 'daily_donation_report.xlsx')

        return response

    def generate_expense_report(self, start_of_day, end_of_day, report_format):
        expenses = InventoryItem.objects.filter(timestamp__range=(start_of_day, end_of_day))  # Assuming Expense model exists

        if report_format == 'csv':
            response = HttpResponse(content_type='text/csv')
            writer = csv.writer(response)
            writer.writerow(['Amount', 'Category','Quantity','Date', 'Added By'])
            for expense in expenses:
                writer.writerow([expense.expense, expense.item_name,expense.quantity, expense.timestamp, expense.added_by.username])
            response['Content-Disposition'] = 'attachment; filename="daily_expense_report.csv"'
        else:  # Excel
            response = self.generate_excel_report(expenses, ['Amount', 'Category', 'Date', 'Added By'], 'daily_expense_report.xlsx')

        return response

    def generate_inventory_report(self, report_format):
        inventory = InventoryItem.objects.all()

        if report_format == 'csv':
            response = HttpResponse(content_type='text/csv')
            writer = csv.writer(response)
            writer.writerow(['Item', 'Type', 'Quantity', 'Added By', 'Date'])
            for item in inventory:
                writer.writerow([item.item_name, item.item_type, item.quantity, item.added_by.username, item.timestamp])
            response['Content-Disposition'] = 'attachment; filename="inventory_report.csv"'
        else:  # Excel
            response = self.generate_excel_report(inventory, ['Item', 'Type', 'Quantity', 'Added By', 'Date'], 'inventory_report.xlsx')

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
         
            return Response({
                'username': user.username,
                'role': user.role,
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
        







