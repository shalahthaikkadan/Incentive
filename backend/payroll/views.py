# payroll/views.py
from rest_framework import generics, status, views
from rest_framework.response import Response
import pandas as pd
import uuid
from django.db import transaction
from .models import Employee, Component, PayrollResult
from .serializers import PayrollResultSerializer, RejectPayrollSerializer
import re
from decimal import Decimal, InvalidOperation
# Import Django's file system storage to save files
from django.core.files.storage import FileSystemStorage

def clean_and_convert_to_decimal(value):
    """
    Cleans a string by removing non-numeric characters (except decimal point)
    and then converts it to a standard Python Decimal type.
    """
    if value is None:
        return None
    
    cleaned_value = re.sub(r'[^\d.-]', '', str(value))
    if not cleaned_value:
        return None
        
    try:
        return Decimal(cleaned_value)
    except InvalidOperation:
        return None

def read_spreadsheet(file_path):
    """Helper function to read both Excel and CSV files from a given path."""
    try:
        if file_path.endswith('.csv'):
            return pd.read_csv(file_path, dtype=str)
        else:
            return pd.read_excel(file_path, dtype=str)
    except Exception as e:
        raise ValueError(f"Could not read file: {e}")

class UploadEmployeeSheetView(views.APIView):
    """Handles the upload of the single Employee Master file."""
    def post(self, request, *args, **kwargs):
        file = request.FILES.get('file') or (request.FILES.getlist('files') or [None])[0]
        if not file:
            return Response({'error': 'No employee master file provided.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Save the uploaded file to the media directory
        fs = FileSystemStorage()
        filename = fs.save(file.name, file)
        
        try:
            df = read_spreadsheet(fs.path(filename)) # Read from the saved location
            if 'employee_id' not in df.columns:
                return Response({'error': "The master file must have an 'employee_id' column."}, status=status.HTTP_400_BAD_REQUEST)

            with transaction.atomic():
                for _, row in df.iterrows():
                    if pd.isna(row.get('employee_id')): continue
                    base_salary = clean_and_convert_to_decimal(row.get('base_salary')) or Decimal('0.00')
                    Employee.objects.update_or_create(
                        employee_id=str(row['employee_id']).strip(),
                        defaults={'name': str(row.get('name', '')).strip(), 'base_salary': base_salary}
                    )
            return Response({'message': 'Employee master sheet processed successfully.'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': f'An error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UploadComponentSheetView(views.APIView):
    """Handles the upload of multiple incentive or deduction files."""
    def post(self, request, *args, **kwargs):
        files, component_type = request.FILES.getlist('files'), request.data.get('type')
        if not files or component_type not in ['incentive', 'deduction']:
            return Response({'error': 'Files and a valid type are required.'}, status=status.HTTP_400_BAD_REQUEST)

        valid_employee_ids = set(Employee.objects.values_list('employee_id', flat=True))
        components_to_create = []
        
        for file in files:
            try:
                # FIXED: Added the logic to save each component file to the media directory
                fs = FileSystemStorage()
                filename = fs.save(file.name, file)
                
                df = read_spreadsheet(fs.path(filename))
                if not {'employee_id', 'amount'}.issubset(df.columns): continue

                for _, row in df.iterrows():
                    emp_id = str(row.get('employee_id')).strip() if pd.notna(row.get('employee_id')) else None
                    amount = clean_and_convert_to_decimal(row.get('amount'))

                    if emp_id in valid_employee_ids and amount is not None:
                        components_to_create.append(
                            Component(employee_id=emp_id, type=component_type, amount=amount, reason=row.get('reason'), source_file=filename)
                        )
            except Exception:
                continue
        
        if components_to_create:
            with transaction.atomic():
                Component.objects.bulk_create(components_to_create)
        
        return Response({'message': f'{len(components_to_create)} {component_type} records processed.'}, status=status.HTTP_201_CREATED)

class GeneratePayrollView(views.APIView):
    """Calculates payroll, saves results, and clears temporary data."""
    def post(self, request, *args, **kwargs):
        with transaction.atomic():
            PayrollResult.objects.all().delete()
            employees = Employee.objects.prefetch_related('components').all()
            new_payroll_results = []
            for emp in employees:
                incentives = list(emp.components.filter(type='incentive').values('amount', 'reason', 'source_file'))
                deductions = list(emp.components.filter(type='deduction').values('amount', 'reason', 'source_file'))
                
                total_incentives = sum(i['amount'] for i in incentives)
                total_deductions = sum(d['amount'] for d in deductions)
                
                final_salary = (emp.base_salary or 0) + total_incentives - total_deductions

                snapshot = {
                    'incentives': [{'amount': str(i['amount']), 'reason': i['reason'], 'source_file': i['source_file']} for i in incentives],
                    'deductions': [{'amount': str(d['amount']), 'reason': d['reason'], 'source_file': d['source_file']} for d in deductions]
                }
                
                new_payroll_results.append(
                    PayrollResult(
                        employee=emp, total_incentives=total_incentives, total_deductions=total_deductions,
                        final_salary=final_salary, status='pending', components_snapshot=snapshot
                    )
                )
            
            if new_payroll_results: PayrollResult.objects.bulk_create(new_payroll_results)
            Component.objects.all().delete()
            
        return Response({'message': 'New payroll generated successfully.'}, status=status.HTTP_201_CREATED)

class PayrollResultListView(generics.ListAPIView):
    queryset = PayrollResult.objects.select_related('employee').all()
    serializer_class = PayrollResultSerializer

class ApprovePayrollView(views.APIView):
    def post(self, request, id, *args, **kwargs):
        result = generics.get_object_or_404(PayrollResult, id=id, status='pending')
        result.status = 'approved'
        result.save()
        return Response({'message': 'Payroll approved.'}, status=status.HTTP_200_OK)

class RejectPayrollView(views.APIView):
    def post(self, request, id, *args, **kwargs):
        result = generics.get_object_or_404(PayrollResult, id=id, status='pending')
        serializer = RejectPayrollSerializer(data=request.data)
        if serializer.is_valid():
            result.status = 'rejected'
            result.rejection_reason = serializer.validated_data['reason']
            result.save()
            return Response({'message': 'Payroll rejected.'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
