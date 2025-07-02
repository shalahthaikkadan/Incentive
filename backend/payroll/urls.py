# payroll/urls.py
from django.urls import path
from .views import (
    UploadEmployeeSheetView,
    UploadComponentSheetView,
    GeneratePayrollView,
    PayrollResultListView,
    ApprovePayrollView,
    RejectPayrollView,
)

# Maps the views to specific API endpoints
urlpatterns = [
    # Endpoint for uploading the employee master sheet
    path('upload/employee/', UploadEmployeeSheetView.as_view(), name='upload-employee'),
    
    # Endpoint for uploading incentive or deduction sheets
    path('upload/component/', UploadComponentSheetView.as_view(), name='upload-component'),
    
    # Endpoint to trigger the payroll generation process
    path('payroll/generate/', GeneratePayrollView.as_view(), name='generate-payroll'),
    
    # Endpoint to retrieve all payroll results for the admin dashboard
    path('payroll/results/', PayrollResultListView.as_view(), name='list-payroll-results'),
    
    # Endpoint to approve a specific payroll result by its ID
    path('payroll/approve/<int:id>/', ApprovePayrollView.as_view(), name='approve-payroll'),
    
    # Endpoint to reject a specific payroll result by its ID
    path('payroll/reject/<int:id>/', RejectPayrollView.as_view(), name='reject-payroll'),
]
