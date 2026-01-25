import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ArrowLeft, User, Mail, Phone, Building2, Briefcase, DollarSign, Calendar } from 'lucide-react';
import { getDepartment, getDepartmentEmployees } from '../services/api';

const DepartmentEmployees = () => {
  const { id } = useParams();

  // Fetch department details
  const { data: department, isLoading: deptLoading } = useQuery(
    ['department', id],
    () => getDepartment(id)
  );

  // Fetch employees for this department
  const { data: employees, isLoading: employeesLoading, error } = useQuery(
    ['departmentEmployees', id],
    () => getDepartmentEmployees(id)
  );

  if (deptLoading || employeesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">Department not found</p>
          <Link
            to="/departments"
            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Departments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/departments"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Departments
          </Link>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {department.name} Department
                </h1>
                <p className="mt-2 text-gray-600">
                  {employees?.length || 0} {employees?.length === 1 ? 'Employee' : 'Employees'}
                </p>
              </div>
              <div className="flex items-center">
                <Building2 className="h-12 w-12 text-blue-600" />
              </div>
            </div>
            {department.description && (
              <p className="mt-4 text-gray-700">{department.description}</p>
            )}
          </div>
        </div>

        {/* Employees List */}
        {!employees || employees.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12 text-center">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Employees Found</h3>
            <p className="text-gray-600">This department doesn't have any employees yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map((employee) => (
              <Link
                key={employee._id}
                to={`/employees/${employee._id}`}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                      {employee.firstName?.[0]}{employee.lastName?.[0]}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {employee.firstName} {employee.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{employee.email}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{employee.position || 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{employee.department || 'N/A'}</span>
                  </div>
                  {employee.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{employee.phone}</span>
                    </div>
                  )}
                  {employee.salary && (
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                      <span>${employee.salary.toLocaleString()}</span>
                    </div>
                  )}
                  {employee.hireDate && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span>Hired: {new Date(employee.hireDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="pt-2">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      employee.status === 'active'
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : employee.status === 'inactive'
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {employee.status ? employee.status.charAt(0).toUpperCase() + employee.status.slice(1) : 'N/A'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentEmployees;



