import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Download,
  Eye,
  User,
  FileText
} from 'lucide-react';
import { getLeaves, deleteLeave, updateLeave } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Leaves = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();
  const { isAdmin, isEmployee } = useAuth();

  // Fetch leaves data
  const { data: leavesData, isLoading } = useQuery(
    ['leaves', currentPage, searchTerm, statusFilter, typeFilter],
    () => getLeaves(currentPage, searchTerm, statusFilter, typeFilter),
    {
      select: (data) => data || { leaves: [], total: 0, totalPages: 0, currentPage: 1 }
    }
  );

  // Delete mutation
  const deleteMutation = useMutation(deleteLeave, {
    onSuccess: () => {
      queryClient.invalidateQueries('leaves');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Error deleting leave record');
    }
  });

  // Update status mutation
  const updateStatusMutation = useMutation(
    ({ id, status }) => updateLeave({ id, status }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('leaves');
      },
      onError: (error) => {
        alert(error.response?.data?.message || 'Error updating leave status');
      }
    }
  );

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this leave record?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleApprove = async (id) => {
    if (window.confirm('Are you sure you want to approve this leave request?')) {
      updateStatusMutation.mutate({ id, status: 'approved' });
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Are you sure you want to reject this leave request?')) {
      updateStatusMutation.mutate({ id, status: 'rejected' });
    }
  };

  const handleProcessing = async (id) => {
    if (window.confirm('Mark this leave request as processing?')) {
      updateStatusMutation.mutate({ id, status: 'processing' });
    }
  };

  const leaves = leavesData?.leaves || [];

  const getStatusBadge = (status) => {
    const statusStyles = {
      approved: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };
    return (
      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${statusStyles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getLeaveTypeColor = (type) => {
    const colors = {
      'Annual Leave': 'bg-blue-100 text-blue-800',
      'Sick Leave': 'bg-red-100 text-red-800',
      'Personal Leave': 'bg-purple-100 text-purple-800',
      'Maternity Leave': 'bg-pink-100 text-pink-800',
      'Paternity Leave': 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  // Calculate stats from real data
  const pendingCount = leaves.filter(l => l.status === 'pending').length;
  const approvedCount = leaves.filter(l => l.status === 'approved').length;
  const rejectedCount = leaves.filter(l => l.status === 'rejected').length;
  const totalDays = leaves.reduce((sum, l) => sum + (l.days || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Leave Management
              </h1>
              <p className="mt-2 text-gray-600">Manage employee leave requests and approvals</p>
            </div>
            <div className="flex space-x-3">
              <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              <Link
                to="/leaves/new"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-xl">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{rejectedCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Days Off</p>
                <p className="text-2xl font-bold text-gray-900">{totalDays}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Types</option>
                <option value="Annual Leave">Annual Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Personal Leave">Personal Leave</option>
                <option value="Maternity Leave">Maternity Leave</option>
                <option value="Paternity Leave">Paternity Leave</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setTypeFilter('');
                }}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Leaves Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Leave Requests</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Leave Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : leaves.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No leave records found
                    </td>
                  </tr>
                ) : (
                  leaves.map((record) => {
                    const employeeName = record.employeeName || 
                      (record.employeeId?.firstName && record.employeeId?.lastName 
                        ? `${record.employeeId.firstName} ${record.employeeId.lastName}` 
                        : 'N/A');
                    const employeeId = record.employeeId?._id || record.employeeId || record._id;
                    const department = record.department || record.employeeId?.department || 'N/A';
                    
                    return (
                      <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                  {employeeName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {employeeName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {employeeId.toString().substring(0, 8)}... • {department}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLeaveTypeColor(record.leaveType)}`}>
                            {record.leaveType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                              {record.startDate ? new Date(record.startDate).toLocaleDateString() : 'N/A'}
                            </div>
                            <div className="text-gray-500 text-xs">
                              to {record.endDate ? new Date(record.endDate).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {record.days || 0} days
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(record.status)}
                            <span className="ml-2">
                              {getStatusBadge(record.status)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {record.appliedDate ? new Date(record.appliedDate).toLocaleDateString() : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            {/* Only admins can approve/reject leaves */}
                            {isAdmin && (record.status === 'pending' || record.status === 'processing') && (
                              <>
                                <button
                                  onClick={() => handleApprove(record._id)}
                                  className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                                  title="Approve"
                                  disabled={updateStatusMutation.isLoading}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleReject(record._id)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                                  title="Reject"
                                  disabled={updateStatusMutation.isLoading}
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                                {record.status === 'pending' && (
                                  <button
                                    onClick={() => handleProcessing(record._id)}
                                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                                    title="Mark as Processing"
                                    disabled={updateStatusMutation.isLoading}
                                  >
                                    <Clock className="h-4 w-4" />
                                  </button>
                                )}
                              </>
                            )}
                            {/* Employees can only edit/delete their own pending leaves */}
                            {(isAdmin || (isEmployee && record.status === 'pending')) && (
                              <Link
                                to={`/leaves/${record._id}/edit`}
                                className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Link>
                            )}
                            {/* Employees can only delete their own pending leaves, admins can delete any */}
                            {(isAdmin || (isEmployee && record.status === 'pending')) && (
                              <button
                                onClick={() => handleDelete(record._id)}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                                title="Delete"
                                disabled={deleteMutation.isLoading}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaves;
