import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { ArrowLeft, Save, Building2, DollarSign, MapPin } from 'lucide-react';
import { getDepartment, createDepartment, updateDepartment, getEmployees } from '../services/api';

const DepartmentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    defaultValues: {
      name: '',
      description: '',
      manager: '',
      budget: '',
      location: '',
      status: 'active'
    }
  });

  const { data: department, isLoading } = useQuery(
    ['department', id],
    () => getDepartment(id),
    { enabled: isEdit }
  );

  const { data: employees } = useQuery('employees', () => getEmployees(1, '', '', ''));

  const createMutation = useMutation(createDepartment, {
    onSuccess: () => {
      queryClient.invalidateQueries('departments');
      navigate('/departments');
    }
  });

  const updateMutation = useMutation(updateDepartment, {
    onSuccess: () => {
      queryClient.invalidateQueries('departments');
      queryClient.invalidateQueries(['department', id]);
      navigate('/departments');
    }
  });

  useEffect(() => {
    if (department && isEdit) {
      Object.keys(department).forEach(key => {
        if (department[key] !== null && department[key] !== undefined) {
          setValue(key, department[key]);
        }
      });
    }
  }, [department, isEdit, setValue]);

  const onSubmit = (data) => {
    if (isEdit) {
      updateMutation.mutate({ id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/departments')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Department' : 'Add New Department'}
          </h1>
          <p className="text-gray-600">
            {isEdit ? 'Update department information' : 'Create a new department'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <Building2 className="h-5 w-5 text-primary-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department Name *
              </label>
              <select
                {...register('name', { required: 'Department name is required' })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select department</option>
                <option value="CSE">CSE</option>
                <option value="CSM">CSM</option>
                <option value="CIC">CIC</option>
                <option value="AIML">AIML</option>
                <option value="AIDS">AIDS</option>
                <option value="CIVIL">CIVIL</option>
                <option value="MEC">MEC</option>
                <option value="ECE">ECE</option>
              </select>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter department description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manager
              </label>
              <select
                {...register('manager')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select a manager</option>
                {employees?.employees?.map(employee => (
                  <option key={employee._id} value={employee._id}>
                    {employee.firstName} {employee.lastName} - {employee.position}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <DollarSign className="h-5 w-5 text-primary-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Financial Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  {...register('budget', { 
                    valueAsNumber: true,
                    min: { value: 0, message: 'Budget must be positive' }
                  })}
                  type="number"
                  className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter budget amount"
                />
              </div>
              {errors.budget && (
                <p className="mt-1 text-sm text-red-600">{errors.budget.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  {...register('location')}
                  className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter location"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/departments')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isLoading || updateMutation.isLoading}
            className="inline-flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            {createMutation.isLoading || updateMutation.isLoading ? 'Saving...' : 'Save Department'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DepartmentForm;
