from django.contrib import admin
from .models import User, Task, Donation, Crisis, InventoryItem, Report,Respond

# Register the custom user model
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'role')
    search_fields = ('username', 'email')

# Register the Volunteer model
# @admin.register(Volunteer)
# class VolunteerAdmin(admin.ModelAdmin):
#     list_display = ('user',)
#     search_fields = ('user__username',)
#     filter_horizontal = ('assigned_tasks',)

# Register the Task model
@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'created_at', 'updated_at')
    list_filter = ('status',)
    search_fields = ('title', 'description')

# Register the Donation model
@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ('amount', 'donor_name', 'timestamp')
    search_fields = ('donor_name',)
    list_filter = ('timestamp',)

# Register the Crisis model
@admin.register(Crisis)
class CrisisAdmin(admin.ModelAdmin):
    list_display = ('title', 'location', 'severity', 'status')
    list_filter = ('status', 'severity')
    search_fields = ('title', 'description', 'location')

# Register the InventoryItem model
@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ('item_name', 'quantity', 'item_type', 'added_by', 'timestamp')
    list_filter = ('item_type',)
    search_fields = ('item_name',)

# Register the Report model
@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('report_type', 'generated_on', 'file')
    list_filter = ('report_type',)
    search_fields = ('report_type',)

@admin.register(Respond)
class RespondAdmin(admin.ModelAdmin):
    list_display = ('crisis', 'volunteer', 'message')
    


