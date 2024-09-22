from django.db import models
from django.contrib.auth.models import AbstractUser

# User model
class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('volunteer', 'Volunteer'),
    )
    LOCATION_CHOUCES = (
        ('dhaka', 'Dhaka'),
        ('chittagong', 'Chittagong'),
        ('sylhet', 'Sylhet'),
        ('rajshahi', 'Rajshahi'),
        ('khulna', 'Khulna'),
        ('barisal', 'Barisal'),
        ('rangpur', 'Rangpur'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    location = models.CharField(max_length=20, choices=LOCATION_CHOUCES, default='dhaka')
    age = models.IntegerField()
    mobile_number = models.CharField(max_length=20)
    assigned_tasks = models.ManyToManyField('Task', related_name='assign_task', blank=True)

    def __str__(self):
        return self.username

    




# class Volunteer(models.Model):
#     user = models.OneToOneField(User, on_delete=models.CASCADE)
#     assigned_tasks = models.ManyToManyField('Task', related_name='volunteers')

#     def __str__(self):
#         return self.user.username

class Task(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed')
    ], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


# Donation model
class Donation(models.Model):
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    donor_name = models.CharField(max_length=100, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

# Crisis model
class Crisis(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('resolved', 'Resolved'),
    )
    SEVERITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    )
    title = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    description = models.TextField()
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    image = models.ImageField(upload_to='crisis_images/', blank=True, null=True)
    required_help = models.TextField()
    created_by = models.CharField(max_length=200,default="Anonymous user")
    timestamp = models.DateTimeField(auto_now_add=True)

# Inventory model for Relief and Expense items
class InventoryItem(models.Model):
    TYPE_CHOICES = (
        ('relief', 'Relief'),
        ('expense', 'Expense'),
    )
    item_name = models.CharField(max_length=200)
    quantity = models.CharField(max_length=200)
    item_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    expense = models.IntegerField(default=0, null=True, blank=True)  
    added_by = models.ForeignKey(User, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)

# Report model for storing generated reports
class Report(models.Model):
    report_type = models.CharField(max_length=50)
    generated_on = models.DateTimeField(auto_now_add=True)
    file = models.FileField(upload_to='reports/')


class Respond(models.Model):
    volunteer = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'volunteer'})
    crisis = models.ForeignKey(Crisis, on_delete=models.CASCADE)
    message = models.TextField()
    responded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.volunteer.username} - {self.crisis.title}"
