import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Download,
  Eye
} from 'lucide-react';
import { getAttendance, deleteAttendance } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Attendance = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  // Fetch attendance data
  const { data: attendanceData, isLoading } = useQuery(
    ['attendance', currentPage, searchTerm, statusFilter, dateFilter],
    () => getAttendance(currentPage, searchTerm, statusFilter, dateFilter),
    {
      select: (data) => data || { attendance: [], total: 0, totalPages: 0, currentPage: 1 }
    }
  );

  // Delete mutation
  const deleteMutation = useMutation(deleteAttendance, {
    onSuccess: () => {
      queryClient.invalidateQueries('attendance');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Error deleting attendance record');
    }
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      deleteMutation.mutate(id);
    }
  };

  const attendance = attendanceData?.attendance || [];

  const getStatusBadge = (status) => {
    const statusStyles = {
      present: 'bg-green-100 text-green-800 border-green-200',
      absent: 'bg-red-100 text-red-800 border-red-200',
      late: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      halfDay: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return (
      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${statusStyles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'late':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  // Calculate stats from real data
  const today = new Date().toISOString().split('T')[0];
  const todayRecords = attendance.filter(a => {
    const recordDate = a.date ? new Date(a.date).toISOString().split('T')[0] : '';
    return recordDate === today;
  });
  const presentCount = todayRecords.filter(a => a.status === 'present').length;
  const absentCount = todayRecords.filter(a => a.status === 'absent').length;
  const lateCount = todayRecords.filter(a => a.status === 'late').length;
  const avgHours = attendance.length > 0 
    ? (attendance.reduce((sum, a) => sum + (a.hours || 0), 0) / attendance.length).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Attendance Management
              </h1>
              <p className="mt-2 text-gray-600">Track and manage employee attendance records</p>
            </div>
            <div className="flex space-x-3">
              {isAdmin && (
                <>
                  <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </button>
                  <Link
                    to="/attendance/new"
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Record
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Present Today</p>
                <p className="text-2xl font-bold text-gray-900">{presentCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-xl">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Absent Today</p>
                <p className="text-2xl font-bold text-gray-900">{absentCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Late Today</p>
                <p className="text-2xl font-bold text-gray-900">{lateCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Hours</p>
                <p className="text-2xl font-bold text-gray-900">{avgHours}</p>
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
                  className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="halfDay">Half Day</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setDateFilter('');
                }}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Attendance Records</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
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
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : attendance.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No attendance records found
                    </td>
                  </tr>
                ) : (
                  attendance.map((record) => {
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
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
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
                          <div className="flex items-center text-sm text-gray-900">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            {record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Clock className="h-4 w-4 mr-2 text-gray-400" />
                            {record.checkIn || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Clock className="h-4 w-4 mr-2 text-gray-400" />
                            {record.checkOut || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {(record.hours || 0).toFixed(1)} hrs
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
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {/* Only admins can edit/delete attendance records */}
                          {isAdmin && (
                            <div className="flex justify-end space-x-2">
                              <Link
                                to={`/attendance/${record._id}/edit`}
                                className="text-indigo-600 hover:text-indigo-900"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Link>
                              <button
                                onClick={() => handleDelete(record._id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                                disabled={deleteMutation.isLoading}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
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

export default Attendance;
