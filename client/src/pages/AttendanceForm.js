import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient, useQuery } from 'react-query';
import { ArrowLeft, Save, Clock, Calendar, User } from 'lucide-react';
import { getEmployees, getAttendanceRecord, createAttendance, updateAttendance } from '../services/api';

const AttendanceForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const queryClient = useQueryClient();

  // Fetch employees for dropdown
  const { data: employeesData, isLoading: employeesLoading } = useQuery(
    'employees',
    () => getEmployees(1, '', '', 'active'),
    {
      select: (data) => data.employees || []
    }
  );

  // Fetch attendance record if editing
  const { data: attendanceData, isLoading: attendanceLoading } = useQuery(
    ['attendance', id],
    () => getAttendanceRecord(id),
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
            date: data.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            checkIn: data.checkIn || '',
            checkOut: data.checkOut || '',
            status: data.status || 'present',
            notes: data.notes || ''
          });
        }
      }
    }
  );

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      employeeId: '',
      date: new Date().toISOString().split('T')[0],
      checkIn: '',
      checkOut: '',
      status: 'present',
      notes: ''
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      if (isEdit) {
        await updateAttendance({ id, ...data });
      } else {
        await createAttendance(data);
      }
      queryClient.invalidateQueries('attendance');
      navigate('/attendance');
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert(error.response?.data?.message || 'Error saving attendance. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isEdit && attendanceLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/attendance')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {isEdit ? 'Edit Attendance' : 'Add Attendance Record'}
                </h1>
                <p className="mt-2 text-lg text-gray-600">
                  {isEdit ? 'Update attendance information' : 'Record new attendance entry'}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Employee Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      {...register('employeeId', { required: 'Employee is required' })}
                      disabled={isEdit || employeesLoading}
                      className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
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

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      {...register('date', { required: 'Date is required' })}
                      className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  {errors.date && (
                    <p className="mt-2 text-sm text-red-600">{errors.date.message}</p>
                  )}
                </div>

                {/* Check In Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check In Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="time"
                      {...register('checkIn')}
                      className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Check Out Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check Out Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="time"
                      {...register('checkOut')}
                      className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    {...register('status')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="halfDay">Half Day</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    {...register('notes')}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Additional notes..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/attendance')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isEdit ? 'Update Record' : 'Save Record'}
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

export default AttendanceForm;
