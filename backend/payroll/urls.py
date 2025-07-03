# payroll/urls.py
from django.urls import path
from .views import (
    UploadEmployeeSheetView, UploadComponentSheetView, ManualComponentView,
    EmployeeListView, GeneratePayrollView, PayrollResultListView,
    ApprovePayrollView, RejectPayrollView, PayrollRunListView, 
    ArchivedResultListView, ArchivePayrollView,
    # NEW: Import the delete view
    DeletePayrollRunView,
)

urlpatterns = [
    path('upload/employee/', UploadEmployeeSheetView.as_view()),
    path('upload/component/', UploadComponentSheetView.as_view()),
    path('components/manual-add/', ManualComponentView.as_view()),
    path('employees/', EmployeeListView.as_view()),
    path('payroll/generate/', GeneratePayrollView.as_view()),
    path('payroll/results/', PayrollResultListView.as_view()),
    path('payroll/approve/<int:id>/', ApprovePayrollView.as_view()),
    path('payroll/reject/<int:id>/', RejectPayrollView.as_view()),
    path('payroll/archive/', ArchivePayrollView.as_view()),
    path('payroll/history/', PayrollRunListView.as_view()),
    path('payroll/history/<int:run_id>/', ArchivedResultListView.as_view()),
    
    # NEW: URL pattern for deleting a historical payroll run
    path('payroll/history/<int:pk>/delete/', DeletePayrollRunView.as_view(), name='delete-payroll-run'),
]
