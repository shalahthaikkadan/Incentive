# payroll/models.py
from django.db import models

class Employee(models.Model):
    """Stores master information for each employee."""
    employee_id = models.CharField(max_length=50, unique=True, primary_key=True)
    name = models.CharField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    age = models.CharField(max_length=10, blank=True, null=True)
    base_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.name or 'No Name'} ({self.employee_id})"

class Component(models.Model):
    """Stores temporary incentive or deduction records."""
    COMPONENT_TYPE_CHOICES = [('incentive', 'Incentive'), ('deduction', 'Deduction')]
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='components')
    type = models.CharField(max_length=10, choices=COMPONENT_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.CharField(max_length=255, blank=True, null=True)
    
    # NEW: This field will store the name of the file each record came from.
    source_file = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.type.capitalize()} for {self.employee.employee_id} from {self.source_file}"

class PayrollResult(models.Model):
    """Stores the final, calculated payroll for each employee."""
    STATUS_CHOICES = [('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')]
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='payroll_results')
    total_incentives = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    final_salary = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    rejection_reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    components_snapshot = models.JSONField(default=dict)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Payroll for {self.employee.employee_id} - {self.status}"
