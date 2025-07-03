# Payroll Processing Web Application

This is a full-stack web application designed to streamline the payroll process by allowing an administrator to upload employee and financial data via spreadsheets, calculate salaries, and manage approvals through a clean, modern dashboard.

## ✨ Features

-   **Excel/CSV Upload:** Easily upload employee master data, incentives, and deductions using `.xlsx` or `.csv` files.
-   **Multi-File Upload:** Upload multiple incentive or deduction files at once.
-   **Automated Payroll Calculation:** Automatically calculates `Final Salary = Base Salary + Total Incentives - Total Deductions`.
-   **Admin Review Dashboard:** A central place to view all generated payroll results.
-   **Approve/Reject Workflow:** Admins can approve or reject each payroll entry. Rejected entries require a reason.
-   **Data Traceability:** Click on an incentive or deduction total to see a detailed breakdown in a pop-up, including the source file for each entry.
-   **File Viewer:** Click the source file link in the pop-up to open a copy of the original uploaded spreadsheet in a new tab.
-   **Clear Separation of Concerns:** A Django REST Framework backend handles all data logic, while a React frontend provides a responsive user interface.

## 🛠️ Tech Stack

-   **Backend:** Python, Django, Django REST Framework
-   **Frontend:** React.js, Tailwind CSS
-   **Data Processing:** `pandas` library for handling spreadsheet data.
-   **API Client:** `axios`

---

## 🚀 Setup and Installation

Follow these steps to get the project running on your local machine.

### Prerequisites

-   Python 3.8+ and `pip`
-   Node.js and `npm`

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd payroll-app
```

### 2. Backend Setup

Navigate to the backend directory and set up the Python environment.

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install required packages
pip install -r requirements.txt

# Apply database migrations
python manage.py makemigrations
python manage.py migrate

# Create a 'media' folder for file uploads
mkdir media

# Run the backend server
python manage.py runserver
```

The Django backend will now be running at `http://127.0.0.1:8000`.

### 3. Frontend Setup

Open a new terminal, navigate to the frontend directory, and set up the React environment.

```bash
cd frontend

# Install required packages
npm install

# Run the frontend development server
npm start
```

The React frontend will now be running at `http://localhost:3000` and will open automatically in your browser.

---

## 📋 How to Use

1.  **Welcome Page:** You will be greeted by a welcome page. Click "Get Started" to proceed to the dashboard.
2.  **Upload Employee Master:** On the dashboard, use the "Employee Master" card to upload your master list of employees. This step is mandatory before uploading other files.
3.  **Upload Components:** Use the "Incentives" and "Deductions" cards to upload one or more files containing financial data.
4.  **Generate Payroll:** Click the "Calculate All Payrolls" button. The system will process all uploaded data and clear any previous payroll runs.
5.  **Review Results:** The table will populate with the newly calculated payroll results, each with a "pending" status.
6.  **Drill Down:** Click on the green incentive total or the red deduction total for any employee to see a detailed pop-up, including the source file for each transaction.
7.  **View Source File:** In the pop-up, click the "Source" link to open the original uploaded spreadsheet in a new browser tab.
8.  **Approve or Reject:** Use the action buttons to approve or reject each pending entry. A reason is required for rejection.

## 📦 API Endpoints

The backend provides the following RESTful API endpoints:

-   `POST /api/upload/employee/`: Upload the employee master sheet.
-   `POST /api/upload/component/`: Upload one or more incentive/deduction sheets.
-   `POST /api/payroll/generate/`: Trigger payroll calculation.
-   `GET /api/payroll/results/`: Retrieve all payroll records for display.
-   `POST /api/payroll/approve/<id>/`: Approve a specific payroll entry.
-   `POST /api/payroll/reject/<id>/`: Reject a specific payroll entry with a reason.
