# payroll/serializers.py
from rest_framework import serializers
from .models import Employee, PayrollResult

class EmployeeSerializer(serializers.ModelSerializer):
    """Serializer for the Employee model, used for nested API responses."""
    class Meta:
        model = Employee
        fields = ['employee_id', 'name', 'phone', 'age', 'base_salary']

class PayrollResultSerializer(serializers.ModelSerializer):
    """
    Serializer for the PayrollResult model.
    Includes nested employee data and the component snapshot for rich API responses.
    """
    employee = EmployeeSerializer(read_only=True)

    class Meta:
        model = PayrollResult
        fields = [
            'id',
            'employee',
            'total_incentives',
            'total_deductions',
            'final_salary',
            'status',
            'rejection_reason',
            'created_at',
            'components_snapshot', # This field provides data for the pop-up modal
        ]

class RejectPayrollSerializer(serializers.Serializer):
    """A simple serializer to validate the 'reason' field for rejections."""
    reason = serializers.CharField(
        required=True,
        allow_blank=False,
        max_length=500,
        error_messages={
            'required': 'A reason for rejection is required.',
            'blank': 'Rejection reason cannot be empty.'
        }
    )
