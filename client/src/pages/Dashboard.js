import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  Users, 
  Building2, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Calendar, 
  CreditCard,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { getEmployeeStats } from '../services/api';

const StatCard = ({ title, value, icon: Icon, color, change, gradient }) => (
  <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 ${gradient}`}>
    <div className="flex items-center">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change && (
          <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change > 0 ? '+' : ''}{change}% from last month
          </p>
        )}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { data: stats, isLoading, error } = useQuery('employeeStats', getEmployeeStats);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error loading dashboard data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="mt-2 text-lg text-gray-600">Welcome to your Employee Management System</p>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Employees"
              value={stats?.totalEmployees || 0}
              icon={Users}
              color="bg-gradient-to-r from-blue-500 to-blue-600"
              change={5.2}
              gradient="bg-gradient-to-r from-blue-50 to-blue-100"
            />
            <StatCard
              title="Active Employees"
              value={stats?.activeEmployees || 0}
              icon={TrendingUp}
              color="bg-gradient-to-r from-green-500 to-green-600"
              change={2.1}
              gradient="bg-gradient-to-r from-green-50 to-green-100"
            />
            <StatCard
              title="Departments"
              value={stats?.departmentStats?.length || 0}
              icon={Building2}
              color="bg-gradient-to-r from-purple-500 to-purple-600"
              gradient="bg-gradient-to-r from-purple-50 to-purple-100"
            />
            <StatCard
              title="Average Salary"
              value={`$${Math.round(stats?.avgSalary || 0).toLocaleString()}`}
              icon={DollarSign}
              color="bg-gradient-to-r from-yellow-500 to-yellow-600"
              change={1.8}
              gradient="bg-gradient-to-r from-yellow-50 to-yellow-100"
            />
          </div>

          {/* New Features Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Attendance Today"
              value="24/27"
              icon={Clock}
              color="bg-gradient-to-r from-indigo-500 to-indigo-600"
              change={3.2}
              gradient="bg-gradient-to-r from-indigo-50 to-indigo-100"
            />
            <StatCard
              title="Pending Leaves"
              value="8"
              icon={Calendar}
              color="bg-gradient-to-r from-emerald-500 to-emerald-600"
              change={-1.5}
              gradient="bg-gradient-to-r from-emerald-50 to-emerald-100"
            />
            <StatCard
              title="Salary This Month"
              value="$45,600"
              icon={CreditCard}
              color="bg-gradient-to-r from-amber-500 to-amber-600"
              change={2.8}
              gradient="bg-gradient-to-r from-amber-50 to-amber-100"
            />
          </div>

          {/* Department Stats */}
          {stats?.departmentStats && stats.departmentStats.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Department Overview</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {stats.departmentStats.map((dept, index) => (
                    <div key={dept._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mr-3"></div>
                        <span className="text-sm font-medium text-gray-900">{dept._id}</span>
                      </div>
                      <span className="text-sm text-gray-600">{dept.count} employees</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link
                  to="/employees/new"
                  className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-blue-50 transition-all duration-200 transform hover:scale-105 hover:shadow-md"
                >
                  <Users className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Add Employee</p>
                    <p className="text-sm text-gray-600">Create a new employee record</p>
                  </div>
                </Link>
                <Link
                  to="/departments/new"
                  className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-purple-50 transition-all duration-200 transform hover:scale-105 hover:shadow-md"
                >
                  <Building2 className="h-8 w-8 text-purple-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Add Department</p>
                    <p className="text-sm text-gray-600">Create a new department</p>
                  </div>
                </Link>
                <Link
                  to="/attendance"
                  className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-indigo-50 transition-all duration-200 transform hover:scale-105 hover:shadow-md"
                >
                  <Clock className="h-8 w-8 text-indigo-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Attendance</p>
                    <p className="text-sm text-gray-600">Track employee attendance</p>
                  </div>
                </Link>
                <Link
                  to="/leaves"
                  className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-emerald-50 transition-all duration-200 transform hover:scale-105 hover:shadow-md"
                >
                  <Calendar className="h-8 w-8 text-emerald-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Leave Management</p>
                    <p className="text-sm text-gray-600">Manage leave requests</p>
                  </div>
                </Link>
                <Link
                  to="/payroll"
                  className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-amber-50 transition-all duration-200 transform hover:scale-105 hover:shadow-md"
                >
                  <CreditCard className="h-8 w-8 text-amber-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Salary</p>
                    <p className="text-sm text-gray-600">Process employee payments</p>
                  </div>
                </Link>
                <Link
                  to="/employees"
                  className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-green-50 transition-all duration-200 transform hover:scale-105 hover:shadow-md"
                >
                  <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">View Reports</p>
                    <p className="text-sm text-gray-600">Analyze employee data</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
