# payroll/views.py
from rest_framework import generics, status, views, filters
from rest_framework.response import Response
import pandas as pd
from django.db import transaction
from .models import Employee, Component, PayrollResult, PayrollRun, ArchivedPayrollResult
from .serializers import (
    EmployeeSerializer, ManualComponentSerializer, PayrollResultSerializer, 
    RejectPayrollSerializer, PayrollRunSerializer, ArchivedPayrollResultSerializer
)
import re
from decimal import Decimal, InvalidOperation
from django.core.files.storage import FileSystemStorage
from django_filters.rest_framework import DjangoFilterBackend

def clean_and_convert_to_decimal(value):
    if value is None: return None
    cleaned_value = re.sub(r'[^\d.-]', '', str(value))
    if not cleaned_value: return None
    try: return Decimal(cleaned_value)
    except InvalidOperation: return None

def read_spreadsheet(file_path):
    try: return pd.read_csv(file_path, dtype=str) if file_path.endswith('.csv') else pd.read_excel(file_path, dtype=str)
    except Exception as e: raise ValueError(f"Could not read file: {e}")

class UploadEmployeeSheetView(views.APIView):
    def post(self, request, *args, **kwargs):
        file = request.FILES.get('file') or (request.FILES.getlist('files') or [None])[0]
        if not file: return Response({'error': 'No employee master file provided.'}, status=status.HTTP_400_BAD_REQUEST)
        fs = FileSystemStorage()
        filename = fs.save(file.name, file)
        try:
            df = read_spreadsheet(fs.path(filename))
            if 'employee_id' not in df.columns: return Response({'error': "Master file must have 'employee_id' column."}, status=status.HTTP_400_BAD_REQUEST)
            with transaction.atomic():
                for _, row in df.iterrows():
                    if pd.isna(row.get('employee_id')): continue
                    base_salary = clean_and_convert_to_decimal(row.get('base_salary')) or Decimal('0.00')
                    Employee.objects.update_or_create(
                        employee_id=str(row['employee_id']).strip(),
                        defaults={'name': str(row.get('name', '')).strip(), 'base_salary': base_salary}
                    )
            return Response({'message': 'Employee master sheet processed.'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': f'An error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UploadComponentSheetView(views.APIView):
    def post(self, request, *args, **kwargs):
        files, component_type = request.FILES.getlist('files'), request.data.get('type')
        if not files or component_type not in ['incentive', 'deduction']:
            return Response({'error': 'Files and a valid type are required.'}, status=status.HTTP_400_BAD_REQUEST)
        valid_employee_ids = set(Employee.objects.values_list('employee_id', flat=True))
        components_to_create = []
        for file in files:
            try:
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
            with transaction.atomic(): Component.objects.bulk_create(components_to_create)
        return Response({'message': f'{len(components_to_create)} {component_type} records processed.'}, status=status.HTTP_201_CREATED)

class ManualComponentView(generics.CreateAPIView):
    queryset = Component.objects.all()
    serializer_class = ManualComponentSerializer
    def perform_create(self, serializer):
        serializer.save(type='incentive', source_file='Manual Entry')

class EmployeeListView(generics.ListAPIView):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer

class GeneratePayrollView(views.APIView):
    def post(self, request, *args, **kwargs):
        with transaction.atomic():
            employees_with_new_components = Employee.objects.filter(components__isnull=False).distinct()
            for emp in employees_with_new_components:
                result, created = PayrollResult.objects.get_or_create(
                    employee=emp,
                    defaults={'final_salary': emp.base_salary or Decimal('0.00'), 'total_incentives': 0, 'total_deductions': 0, 'components_snapshot': {'incentives': [], 'deductions': []}}
                )
                
                # MODIFIED: Get full component objects to access attachment URLs
                new_incentives = emp.components.filter(type='incentive')
                new_deductions = emp.components.filter(type='deduction')
                
                new_total_incentives = sum(i.amount for i in new_incentives)
                new_total_deductions = sum(d.amount for d in new_deductions)
                
                result.total_incentives += new_total_incentives
                result.total_deductions += new_total_deductions
                result.final_salary = (emp.base_salary or 0) + result.total_incentives - result.total_deductions
                
                snapshot = result.components_snapshot
                # MODIFIED: Add attachment_url to the snapshot if an attachment exists
                snapshot['incentives'].extend([{'amount': str(i.amount), 'reason': i.reason, 'source_file': i.source_file, 'attachment_url': i.attachment.url if i.attachment else None} for i in new_incentives])
                snapshot['deductions'].extend([{'amount': str(d.amount), 'reason': d.reason, 'source_file': d.source_file, 'attachment_url': d.attachment.url if d.attachment else None} for d in new_deductions])
                result.components_snapshot = snapshot

                result.save()
            Component.objects.all().delete()
        return Response({'message': 'Payroll updated with new components.'}, status=status.HTTP_201_CREATED)

class ArchivePayrollView(views.APIView):
    def post(self, request, *args, **kwargs):
        with transaction.atomic():
            current_results = PayrollResult.objects.select_related('employee').all()
            if not current_results.exists():
                return Response({'message': 'No current payroll results to archive.'}, status=status.HTTP_400_BAD_REQUEST)
            run_name = request.data.get('run_name', None)
            new_run = PayrollRun.objects.create(run_name=run_name)
            archives_to_create = []
            for result in current_results:
                archives_to_create.append(
                    ArchivedPayrollResult(
                        run=new_run, employee_id=result.employee.employee_id, employee_name=result.employee.name,
                        base_salary=result.employee.base_salary, total_incentives=result.total_incentives,
                        total_deductions=result.total_deductions, final_salary=result.final_salary,
                        status=result.status, rejection_reason=result.rejection_reason,
                        components_snapshot=result.components_snapshot
                    )
                )
            ArchivedPayrollResult.objects.bulk_create(archives_to_create)
            current_results.delete()
        return Response({'message': f'Successfully archived payroll run. The dashboard is now clear.'}, status=status.HTTP_201_CREATED)

class PayrollResultListView(generics.ListAPIView):
    queryset = PayrollResult.objects.select_related('employee').all()
    serializer_class = PayrollResultSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status']
    search_fields = ['employee__name', 'employee__employee_id']

class PayrollRunListView(generics.ListAPIView):
    queryset = PayrollRun.objects.all()
    serializer_class = PayrollRunSerializer

class DeletePayrollRunView(generics.DestroyAPIView):
    queryset = PayrollRun.objects.all()

class ArchivedResultListView(generics.ListAPIView):
    serializer_class = ArchivedPayrollResultSerializer
    def get_queryset(self):
        run_id = self.kwargs['run_id']
        return ArchivedPayrollResult.objects.filter(run_id=run_id)

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
