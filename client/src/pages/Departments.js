import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Building2,
  Users,
  DollarSign
} from 'lucide-react';
import { getDepartments, deleteDepartment } from '../services/api';

const Departments = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: departments, isLoading, error, refetch } = useQuery(
    'departments',
    getDepartments
  );

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await deleteDepartment(id);
        refetch();
      } catch (error) {
        console.error('Error deleting department:', error);
      }
    }
  };

  const filteredDepartments = departments?.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <p className="text-red-800">Error loading departments</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Departments</h1>
              <p className="mt-2 text-lg text-gray-600">Manage your organization's departments</p>
            </div>
            <Link
              to="/departments/new"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Department
            </Link>
          </div>

          {/* Search */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">Search Departments</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Departments Grid */}
      {filteredDepartments?.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No departments found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding a new department.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments?.map((department) => (
            <div key={department._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Building2 className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">{department.name}</h3>
                    <p className="text-sm text-gray-500">
                      {department.manager ? `${department.manager.firstName} ${department.manager.lastName}` : 'No manager assigned'}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/departments/${department._id}/edit`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(department._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {department.description && (
                <p className="text-sm text-gray-600 mb-4">{department.description}</p>
              )}

              <div className="space-y-2">
                {department.budget && (
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span>Budget: ${department.budget.toLocaleString()}</span>
                  </div>
                )}
                {department.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Building2 className="h-4 w-4 mr-2" />
                    <span>{department.location}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Established: {new Date(department.establishedDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    department.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {department.status.charAt(0).toUpperCase() + department.status.slice(1)}
                  </span>
                  <Link
                    to={`/departments/${department._id}/employees`}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    View Employees →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default Departments;
