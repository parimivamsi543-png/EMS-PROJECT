import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access - clear token and redirect to signin
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/signin' && window.location.pathname !== '/signup') {
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

// Employee API
export const getEmployees = async (page = 1, search = '', department = '', status = '') => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: '10',
  });
  
  if (search) params.append('search', search);
  if (department) params.append('department', department);
  if (status) params.append('status', status);

  const response = await api.get(`/employees?${params.toString()}`);
  return response.data;
};

export const getEmployee = async (id) => {
  const response = await api.get(`/employees/${id}`);
  return response.data;
};

export const createEmployee = async (employeeData) => {
  const response = await api.post('/employees', employeeData);
  return response.data;
};

export const updateEmployee = async ({ id, ...employeeData }) => {
  const response = await api.put(`/employees/${id}`, employeeData);
  return response.data;
};

export const deleteEmployee = async (id) => {
  const response = await api.delete(`/employees/${id}`);
  return response.data;
};

export const getEmployeeStats = async () => {
  const response = await api.get('/employees/stats/overview');
  return response.data;
};

// Department API
export const getDepartments = async () => {
  const response = await api.get('/departments');
  return response.data;
};

export const getDepartment = async (id) => {
  const response = await api.get(`/departments/${id}`);
  return response.data;
};

export const createDepartment = async (departmentData) => {
  const response = await api.post('/departments', departmentData);
  return response.data;
};

export const updateDepartment = async ({ id, ...departmentData }) => {
  const response = await api.put(`/departments/${id}`, departmentData);
  return response.data;
};

export const deleteDepartment = async (id) => {
  const response = await api.delete(`/departments/${id}`);
  return response.data;
};

export const getDepartmentEmployees = async (id) => {
  const response = await api.get(`/departments/${id}/employees`);
  return response.data;
};

// Payroll API
export const getPayroll = async (page = 1, search = '', status = '', month = '') => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: '10',
  });
  
  if (search) params.append('search', search);
  if (status) params.append('status', status);
  if (month) params.append('month', month);

  const response = await api.get(`/payroll?${params.toString()}`);
  return response.data;
};

export const getPayrollRecord = async (id) => {
  const response = await api.get(`/payroll/${id}`);
  return response.data;
};

export const createPayroll = async (payrollData) => {
  const response = await api.post('/payroll', payrollData);
  return response.data;
};

export const updatePayroll = async ({ id, ...payrollData }) => {
  const response = await api.put(`/payroll/${id}`, payrollData);
  return response.data;
};

export const deletePayroll = async (id) => {
  const response = await api.delete(`/payroll/${id}`);
  return response.data;
};

// Leave API
export const getLeaves = async (page = 1, search = '', status = '', type = '') => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: '10',
  });
  
  if (search) params.append('search', search);
  if (status) params.append('status', status);
  if (type) params.append('type', type);

  const response = await api.get(`/leaves?${params.toString()}`);
  return response.data;
};

export const getLeave = async (id) => {
  const response = await api.get(`/leaves/${id}`);
  return response.data;
};

export const createLeave = async (leaveData) => {
  const response = await api.post('/leaves', leaveData);
  return response.data;
};

export const updateLeave = async ({ id, ...leaveData }) => {
  const response = await api.put(`/leaves/${id}`, leaveData);
  return response.data;
};

export const deleteLeave = async (id) => {
  const response = await api.delete(`/leaves/${id}`);
  return response.data;
};

// Attendance API
export const getAttendance = async (page = 1, search = '', status = '', date = '') => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: '10',
  });
  
  if (search) params.append('search', search);
  if (status) params.append('status', status);
  if (date) params.append('date', date);

  const response = await api.get(`/attendance?${params.toString()}`);
  return response.data;
};

export const getAttendanceRecord = async (id) => {
  const response = await api.get(`/attendance/${id}`);
  return response.data;
};

export const createAttendance = async (attendanceData) => {
  const response = await api.post('/attendance', attendanceData);
  return response.data;
};

export const updateAttendance = async ({ id, ...attendanceData }) => {
  const response = await api.put(`/attendance/${id}`, attendanceData);
  return response.data;
};

export const deleteAttendance = async (id) => {
  const response = await api.delete(`/attendance/${id}`);
  return response.data;
};

// Auth API
export const signIn = async (email, password) => {
  const response = await api.post('/auth/signin', { email, password });
  return response.data;
};

export const signUp = async (userData) => {
  const response = await api.post('/auth/signup', userData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export default api;
