import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient, useQuery } from 'react-query';
import { ArrowLeft, Save, Calendar, User, FileText, Clock } from 'lucide-react';
import { getEmployees, getLeave, createLeave, updateLeave } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const LeaveForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const queryClient = useQueryClient();
  const { user, isAdmin, isEmployee } = useAuth();

  // Fetch employees for dropdown (only for admins)
  const { data: employeesData, isLoading: employeesLoading } = useQuery(
    'employees',
    () => getEmployees(1, '', '', 'active'),
    {
      enabled: isAdmin, // Only fetch if admin
      select: (data) => data.employees || []
    }
  );

  // Fetch leave record if editing
  const { data: leaveData, isLoading: leaveLoading } = useQuery(
    ['leave', id],
    () => getLeave(id),
    {
      enabled: isEdit,
      onSuccess: (data) => {
        if (data) {
          // Handle employeeId - could be ObjectId string or populated object
          let employeeIdValue = '';
          if (data.employeeId) {
            employeeIdValue = typeof data.employeeId === 'object' && data.employeeId._id 
              ? data.employeeId._id 
              : data.employeeId.toString();
          }
          
          reset({
            employeeId: employeeIdValue,
            leaveType: data.leaveType || 'Annual Leave',
            startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '',
            endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : '',
            reason: data.reason || '',
            status: data.status || 'pending'
          });
        }
      }
    }
  );

  const { register, handleSubmit, formState: { errors }, watch, reset, setValue } = useForm({
    defaultValues: {
      employeeId: '',
      leaveType: 'Annual Leave',
      startDate: '',
      endDate: '',
      reason: '',
      status: 'pending'
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  // Auto-set employeeId for employees
  useEffect(() => {
    if (isEmployee && user?.employeeId && !isEdit) {
      setValue('employeeId', user.employeeId);
    }
  }, [user, isEmployee, isEdit, setValue]);

  const calculateDays = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // For employees, don't send employeeId (backend will use their own)
      // For admins, send employeeId as selected
      const submitData = isEmployee && !isEdit 
        ? { ...data, employeeId: undefined } 
        : data;
      
      if (isEdit) {
        // Employees cannot change status
        if (isEmployee) {
          delete submitData.status;
        }
        await updateLeave({ id, ...submitData });
      } else {
        await createLeave(submitData);
      }
      queryClient.invalidateQueries('leaves');
      navigate('/leaves');
    } catch (error) {
      console.error('Error saving leave:', error);
      alert(error.response?.data?.message || 'Error saving leave. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isEdit && leaveLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/leaves')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {isEdit ? 'Edit Leave Request' : 'New Leave Request'}
                </h1>
                <p className="mt-2 text-lg text-gray-600">
                  {isEdit ? 'Update leave request information' : 'Submit a new leave request'}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Employee Selection - Only for admins */}
                {isAdmin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        {...register('employeeId', { required: isAdmin ? 'Employee is required' : false })}
                        disabled={isEdit || employeesLoading}
                        className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">Select Employee</option>
                        {employeesData?.map((employee) => (
                          <option key={employee._id} value={employee._id}>
                            {employee.firstName} {employee.lastName} - {employee.position} ({employee.department})
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.employeeId && (
                      <p className="mt-2 text-sm text-red-600">{errors.employeeId.message}</p>
                    )}
                  </div>
                )}

                {/* Leave Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Leave Type
                  </label>
                  <select
                    {...register('leaveType', { required: 'Leave type is required' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="Annual Leave">Annual Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Personal Leave">Personal Leave</option>
                    <option value="Maternity Leave">Maternity Leave</option>
                    <option value="Paternity Leave">Paternity Leave</option>
                    <option value="Emergency Leave">Emergency Leave</option>
                  </select>
                  {errors.leaveType && (
                    <p className="mt-2 text-sm text-red-600">{errors.leaveType.message}</p>
                  )}
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      {...register('startDate', { required: 'Start date is required' })}
                      className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  {errors.startDate && (
                    <p className="mt-2 text-sm text-red-600">{errors.startDate.message}</p>
                  )}
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      {...register('endDate', { required: 'End date is required' })}
                      className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  {errors.endDate && (
                    <p className="mt-2 text-sm text-red-600">{errors.endDate.message}</p>
                  )}
                </div>

                {/* Days Calculation */}
                <div className="md:col-span-2">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-emerald-600 mr-2" />
                      <span className="text-sm font-medium text-emerald-800">
                        Total Days: {calculateDays()} days
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reason */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <textarea
                      {...register('reason', { required: 'Reason is required' })}
                      rows={4}
                      className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      placeholder="Please provide a reason for your leave request..."
                    />
                  </div>
                  {errors.reason && (
                    <p className="mt-2 text-sm text-red-600">{errors.reason.message}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/leaves')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isEdit ? 'Update Request' : 'Submit Request'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveForm;
