import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  DollarSign,
  User,
  Building2,
  AlertTriangle
} from 'lucide-react';
import { getEmployee } from '../services/api';

const EmployeeDetails = () => {
  const { id } = useParams();
  const { data: employee, isLoading, error } = useQuery(['employee', id], () => getEmployee(id));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Employee not found</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const statusStyles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-yellow-100 text-yellow-800',
      terminated: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusStyles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/employees"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {employee.firstName} {employee.lastName}
            </h1>
            <p className="text-gray-600">{employee.position}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {getStatusBadge(employee.status)}
          <Link
            to={`/employees/${employee._id}/edit`}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Employee
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <User className="h-5 w-5 text-primary-600 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">First Name</label>
                <p className="text-sm text-gray-900">{employee.firstName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Last Name</label>
                <p className="text-sm text-gray-900">{employee.lastName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-sm text-gray-900">{employee.email}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-sm text-gray-900">{employee.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Job Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <Building2 className="h-5 w-5 text-primary-600 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Job Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Department</label>
                <p className="text-sm text-gray-900">{employee.department}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Salary</label>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-sm text-gray-900">${employee.salary?.toLocaleString()}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Hire Date</label>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-sm text-gray-900">{formatDate(employee.hireDate)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Address Information */}
          {employee.address && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <MapPin className="h-5 w-5 text-primary-600 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Address Information</h2>
              </div>
              
              <div className="space-y-3">
                {employee.address.street && (
                  <p className="text-sm text-gray-900">{employee.address.street}</p>
                )}
                <div className="flex space-x-4">
                  {employee.address.city && (
                    <span className="text-sm text-gray-900">{employee.address.city}</span>
                  )}
                  {employee.address.state && (
                    <span className="text-sm text-gray-900">{employee.address.state}</span>
                  )}
                  {employee.address.zipCode && (
                    <span className="text-sm text-gray-900">{employee.address.zipCode}</span>
                  )}
                </div>
                {employee.address.country && (
                  <p className="text-sm text-gray-900">{employee.address.country}</p>
                )}
              </div>
            </div>
          )}

          {/* Emergency Contact */}
          {employee.emergencyContact && (employee.emergencyContact.name || employee.emergencyContact.phone) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <AlertTriangle className="h-5 w-5 text-primary-600 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Emergency Contact</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {employee.emergencyContact.name && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Contact Name</label>
                    <p className="text-sm text-gray-900">{employee.emergencyContact.name}</p>
                  </div>
                )}
                {employee.emergencyContact.relationship && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Relationship</label>
                    <p className="text-sm text-gray-900">{employee.emergencyContact.relationship}</p>
                  </div>
                )}
                {employee.emergencyContact.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Contact Phone</label>
                    <p className="text-sm text-gray-900">{employee.emergencyContact.phone}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Skills and Notes */}
          {(employee.skills?.length > 0 || employee.notes) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Additional Information</h2>
              
              <div className="space-y-6">
                {employee.skills?.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Skills</label>
                    <div className="flex flex-wrap gap-2">
                      {employee.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex px-3 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {employee.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Notes</label>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{employee.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="mx-auto h-24 w-24 rounded-full bg-primary-500 flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-white">
                {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
              </span>
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              {employee.firstName} {employee.lastName}
            </h3>
            <p className="text-sm text-gray-600">{employee.position}</p>
            <p className="text-sm text-gray-500">{employee.department}</p>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status</span>
                {getStatusBadge(employee.status)}
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Salary</span>
                <span className="text-sm font-medium text-gray-900">
                  ${employee.salary?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Hire Date</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(employee.hireDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contact</h3>
            <div className="space-y-3">
              <a
                href={`mailto:${employee.email}`}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Mail className="h-4 w-4 mr-3" />
                Send Email
              </a>
              <a
                href={`tel:${employee.phone}`}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Phone className="h-4 w-4 mr-3" />
                Call
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;
