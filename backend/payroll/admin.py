from django.contrib import admin

# Register your models here.
# payroll/admin.py
from django.contrib import admin
from .models import Employee, Component, PayrollResult

# This tells Django to show the Employee model on the admin site.
@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('employee_id', 'name', 'base_salary')
    search_fields = ('employee_id', 'name')

# This tells Django to show the Component model on the admin site.
@admin.register(Component)
class ComponentAdmin(admin.ModelAdmin):
    list_display = ('employee', 'type', 'amount', 'reason')
    list_filter = ('type',)
    search_fields = ('employee__employee_id', 'employee__name')

# This tells Django to show the PayrollResult model on the admin site.
@admin.register(PayrollResult)
class PayrollResultAdmin(admin.ModelAdmin):
    list_display = ('employee', 'final_salary', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('employee__employee_id', 'employee__name')
    readonly_fields = ('created_at',)

