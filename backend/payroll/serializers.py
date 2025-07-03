# payroll/serializers.py
from rest_framework import serializers
from .models import Employee, Component, PayrollResult, PayrollRun, ArchivedPayrollResult

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ['employee_id', 'name', 'phone', 'age', 'base_salary']

class PayrollResultSerializer(serializers.ModelSerializer):
    employee = EmployeeSerializer(read_only=True)
    class Meta:
        model = PayrollResult
        fields = '__all__'

class RejectPayrollSerializer(serializers.Serializer):
    reason = serializers.CharField(required=True, allow_blank=False, max_length=500)

class ManualComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Component
        fields = ['employee', 'amount', 'reason', 'attachment']

# --- NEW SERIALIZERS FOR HISTORY ---

class ArchivedPayrollResultSerializer(serializers.ModelSerializer):
    """Serializer for the read-only archived results."""
    class Meta:
        model = ArchivedPayrollResult
        fields = '__all__'

class PayrollRunSerializer(serializers.ModelSerializer):
    """Serializer for listing the historical payroll runs."""
    # Optionally, you can nest the results here if you want all data at once,
    # but it's more efficient to fetch them on demand.
    class Meta:
        model = PayrollRun
        fields = ['id', 'run_timestamp']
