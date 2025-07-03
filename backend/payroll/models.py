# payroll/models.py
from django.db import models

class Employee(models.Model):
    employee_id = models.CharField(max_length=50, unique=True, primary_key=True)
    name = models.CharField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    age = models.CharField(max_length=10, blank=True, null=True)
    base_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

class Component(models.Model):
    COMPONENT_TYPE_CHOICES = [('incentive', 'Incentive'), ('deduction', 'Deduction')]
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='components')
    type = models.CharField(max_length=10, choices=COMPONENT_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.CharField(max_length=255, blank=True, null=True)
    source_file = models.CharField(max_length=255, blank=True, null=True)
    attachment = models.FileField(upload_to='attachments/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class PayrollResult(models.Model):
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

class PayrollRun(models.Model):
    """Represents a single, timestamped instance of a payroll calculation."""
    run_timestamp = models.DateTimeField(auto_now_add=True)
    # NEW: A field to give a custom name to the payroll run.
    run_name = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        ordering = ['-run_timestamp']

    def __str__(self):
        return self.run_name or f"Payroll Run at {self.run_timestamp.strftime('%Y-%m-%d %H:%M')}"

class ArchivedPayrollResult(models.Model):
    """A read-only copy of a PayrollResult, linked to a specific PayrollRun."""
    run = models.ForeignKey(PayrollRun, on_delete=models.CASCADE, related_name='archived_results')
    employee_id = models.CharField(max_length=50)
    employee_name = models.CharField(max_length=100, blank=True, null=True)
    base_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_incentives = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    final_salary = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10)
    rejection_reason = models.TextField(blank=True, null=True)
    components_snapshot = models.JSONField(default=dict)
