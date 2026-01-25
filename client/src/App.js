import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import EmployeeForm from './pages/EmployeeForm';
import EmployeeDetails from './pages/EmployeeDetails';
import Departments from './pages/Departments';
import DepartmentForm from './pages/DepartmentForm';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Landing from './pages/Landing';
import Attendance from './pages/Attendance';
import AttendanceForm from './pages/AttendanceForm';
import Leaves from './pages/Leaves';
import LeaveForm from './pages/LeaveForm';
import Payroll from './pages/Payroll';
import PayrollForm from './pages/PayrollForm';
import Profile from './pages/Profile';
import DepartmentEmployees from './pages/DepartmentEmployees';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<Landing />} />
            
            {/* Authentication Routes */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/employees" element={
              <ProtectedRoute>
                <Layout><Employees /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/employees/new" element={
              <ProtectedRoute>
                <Layout><EmployeeForm /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/employees/:id" element={
              <ProtectedRoute>
                <Layout><EmployeeDetails /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/employees/:id/edit" element={
              <ProtectedRoute>
                <Layout><EmployeeForm /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/departments" element={
              <ProtectedRoute>
                <Layout><Departments /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/departments/new" element={
              <ProtectedRoute>
                <Layout><DepartmentForm /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/departments/:id/edit" element={
              <ProtectedRoute>
                <Layout><DepartmentForm /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/departments/:id/employees" element={
              <ProtectedRoute>
                <Layout><DepartmentEmployees /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/attendance" element={
              <ProtectedRoute>
                <Layout><Attendance /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/attendance/new" element={
              <ProtectedRoute>
                <Layout><AttendanceForm /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/attendance/:id/edit" element={
              <ProtectedRoute>
                <Layout><AttendanceForm /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/leaves" element={
              <ProtectedRoute>
                <Layout><Leaves /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/leaves/new" element={
              <ProtectedRoute>
                <Layout><LeaveForm /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/leaves/:id/edit" element={
              <ProtectedRoute>
                <Layout><LeaveForm /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/payroll" element={
              <ProtectedRoute>
                <Layout><Payroll /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/payroll/new" element={
              <ProtectedRoute>
                <Layout><PayrollForm /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/payroll/:id/edit" element={
              <ProtectedRoute>
                <Layout><PayrollForm /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout><Profile /></Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
