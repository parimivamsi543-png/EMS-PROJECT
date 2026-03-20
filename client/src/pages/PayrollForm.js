import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient, useQuery } from 'react-query';
import { ArrowLeft, Save, DollarSign, User, CreditCard, Calculator } from 'lucide-react';
import { getEmployees, getPayrollRecord, createPayroll, updatePayroll } from '../services/api';

const PayrollForm = () => {
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

  // Fetch payroll record if editing
  const { data: payrollData, isLoading: payrollLoading } = useQuery(
    ['payroll', id],
    () => getPayrollRecord(id),
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
            basicSalary: data.basicSalary || '',
            allowances: data.allowances || '',
            deductions: data.deductions || '',
            payDate: data.payDate ? new Date(data.payDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            status: data.status || 'pending'
          });
        }
      }
    }
  );

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm({
    defaultValues: {
      employeeId: '',
      basicSalary: '',
      allowances: '',
      deductions: '',
      payDate: new Date().toISOString().split('T')[0],
      status: 'pending'
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const basicSalary = parseFloat(watch('basicSalary') || 0);
  const allowances = parseFloat(watch('allowances') || 0);
  const deductions = parseFloat(watch('deductions') || 0);
  const netSalary = basicSalary + allowances - deductions;

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      if (isEdit) {
        await updatePayroll({ id, ...data });
      } else {
        await createPayroll(data);
      }
      queryClient.invalidateQueries('payroll');
      navigate('/payroll');
    } catch (error) {
      console.error('Error saving payroll:', error);
      alert(error.response?.data?.message || 'Error saving payroll. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isEdit && payrollLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/payroll')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {isEdit ? 'Edit Salary Record' : 'Process Salary'}
                </h1>
                <p className="mt-2 text-lg text-gray-600">
                  {isEdit ? 'Update salary information' : 'Create new salary record'}
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
                      className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
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

                {/* Pay Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pay Date
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      {...register('payDate', { required: 'Pay date is required' })}
                      className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  {errors.payDate && (
                    <p className="mt-2 text-sm text-red-600">{errors.payDate.message}</p>
                  )}
                </div>

                {/* Basic Salary */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Basic Salary
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      {...register('basicSalary', { 
                        required: 'Basic salary is required',
                        min: { value: 0, message: 'Salary must be positive' }
                      })}
                      className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                      placeholder="5000.00"
                    />
                  </div>
                  {errors.basicSalary && (
                    <p className="mt-2 text-sm text-red-600">{errors.basicSalary.message}</p>
                  )}
                </div>

                {/* Allowances */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allowances
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      {...register('allowances', { 
                        min: { value: 0, message: 'Allowances must be positive' }
                      })}
                      className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                      placeholder="1000.00"
                    />
                  </div>
                  {errors.allowances && (
                    <p className="mt-2 text-sm text-red-600">{errors.allowances.message}</p>
                  )}
                </div>

                {/* Deductions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deductions
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      {...register('deductions', { 
                        min: { value: 0, message: 'Deductions must be positive' }
                      })}
                      className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                      placeholder="500.00"
                    />
                  </div>
                  {errors.deductions && (
                    <p className="mt-2 text-sm text-red-600">{errors.deductions.message}</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    {...register('status')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                {/* Net Salary Calculation */}
                <div className="md:col-span-2">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calculator className="h-5 w-5 text-amber-600 mr-2" />
                        <span className="text-sm font-medium text-amber-800">
                          Net Salary Calculation:
                        </span>
                      </div>
                      <span className="text-lg font-bold text-amber-900">
                        ${netSalary.toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-amber-700">
                      Basic Salary: ${basicSalary.toFixed(2)} + Allowances: ${allowances.toFixed(2)} - Deductions: ${deductions.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/payroll')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isEdit ? 'Update Record' : 'Process Payroll'}
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

export default PayrollForm;
