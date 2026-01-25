import React from 'react';
import { useQuery } from 'react-query';
import { User, Mail, Phone, MapPin, Briefcase, Building2, Calendar, DollarSign, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getEmployee } from '../services/api';

const Profile = () => {
  const { user, isAdmin, isEmployee, isLoading: authLoading } = useAuth();

  // Fetch employee details if user is an employee and has employeeId
  // Hooks must be called unconditionally at the top level
  const { data: employeeData, isLoading: employeeLoading } = useQuery(
    ['employee', user?.employeeId],
    () => getEmployee(user?.employeeId),
    {
      enabled: !!user?.employeeId && isEmployee && !!user,
      retry: false,
    }
  );

  // Show loading if auth is still loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show error if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to view your profile</p>
        </div>
      </div>
    );
  }

  // Use employee data from query or from user object
  const employee = employeeData || user?.employee;
  const displayName = employee 
    ? `${employee.firstName || ''} ${employee.lastName || ''}`.trim() 
    : user?.email?.split('@')[0] || 'User';

  // Show loading only when actually fetching employee data
  if (employeeLoading && isEmployee && user?.employeeId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
            <div className="flex items-center">
              <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-3xl font-bold mr-6">
                {displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mr-3">
                    {isAdmin ? 'Welcome Admin' : 'Welcome Employee'}
                  </h1>
                  {isAdmin && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </span>
                  )}
                  {isEmployee && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                      <User className="h-3 w-3 mr-1" />
                      Employee
                    </span>
                  )}
                </div>
                <p className="text-lg text-gray-600">
                  {displayName}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Employee Details */}
        {employee && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Personal Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <User className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Full Name</p>
                    <p className="text-base text-gray-900">
                      {employee.firstName} {employee.lastName}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-base text-gray-900">{employee.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-base text-gray-900">{employee.phone || 'N/A'}</p>
                  </div>
                </div>

                {employee.address && (
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Address</p>
                      <p className="text-base text-gray-900">
                        {employee.address.street && `${employee.address.street}, `}
                        {employee.address.city && `${employee.address.city}, `}
                        {employee.address.state && `${employee.address.state} `}
                        {employee.address.zipCode && employee.address.zipCode}
                        {employee.address.country && `, ${employee.address.country}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Job Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-green-600" />
                Job Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Building2 className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Department</p>
                    <p className="text-base text-gray-900">{employee.department || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Salary</p>
                    <p className="text-base text-gray-900">
                      {employee.salary ? `$${employee.salary.toLocaleString()}` : 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Hire Date</p>
                    <p className="text-base text-gray-900">
                      {employee.hireDate 
                        ? new Date(employee.hireDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <User className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
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
              </div>
            </div>

            {/* Additional Information */}
            {(employee.skills?.length > 0 || employee.emergencyContact) && (
              <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 ${employee.skills?.length > 0 && employee.emergencyContact ? 'md:col-span-2' : ''}`}>
                {employee.skills?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {employee.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full border border-blue-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {employee.emergencyContact && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
                    <div className="space-y-2">
                      <p className="text-base text-gray-900">
                        <span className="font-medium">Name:</span> {employee.emergencyContact.name || 'N/A'}
                      </p>
                      <p className="text-base text-gray-900">
                        <span className="font-medium">Relationship:</span> {employee.emergencyContact.relationship || 'N/A'}
                      </p>
                      <p className="text-base text-gray-900">
                        <span className="font-medium">Phone:</span> {employee.emergencyContact.phone || 'N/A'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Admin Profile (no employee data) */}
        {isAdmin && !employee && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Account Information</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-base text-gray-900">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Role</p>
                  <p className="text-base text-gray-900">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

