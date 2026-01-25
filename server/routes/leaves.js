const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const { body, validationResult } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');

// Get all leave records with pagination and search
// Employees can only view their own leaves, admins can view all
router.get('/', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const type = req.query.type || '';

    const query = {};
    
    // If employee, only show their own leaves
    if (req.user.role === 'employee' && req.user.employeeId) {
      query.employeeId = req.user.employeeId._id || req.user.employeeId;
    }
    
    if (search && req.user.role === 'admin') {
      query.$or = [
        { employeeName: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.leaveType = type;
    }

    const leaves = await Leave.find(query)
      .populate('employeeId', 'firstName lastName email department')
      .sort({ startDate: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Leave.countDocuments(query);

    res.json({
      leaves,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get leave record by ID
// Employees can only view their own leaves
router.get('/:id', authenticate, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('employeeId', 'firstName lastName email department');
    
    if (!leave) {
      return res.status(404).json({ message: 'Leave record not found' });
    }
    
    // If employee, check if it's their own leave
    if (req.user.role === 'employee') {
      const employeeId = req.user.employeeId._id || req.user.employeeId;
      if (leave.employeeId._id.toString() !== employeeId.toString()) {
        return res.status(403).json({ message: 'Access denied. You can only view your own leaves.' });
      }
    }
    
    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new leave record
// Employees can apply for their own leaves, admins can create for any employee
router.post('/', authenticate, [
  body('leaveType').isIn(['Annual Leave', 'Sick Leave', 'Personal Leave', 'Maternity Leave', 'Paternity Leave', 'Emergency Leave']).withMessage('Invalid leave type'),
  body('startDate').notEmpty().withMessage('Start date is required'),
  body('endDate').notEmpty().withMessage('End date is required'),
  body('reason').notEmpty().withMessage('Reason is required'),
  body('status').optional().isIn(['pending', 'processing', 'approved', 'rejected']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let employeeId = req.body.employeeId;
    
    // If employee, use their own employeeId
    if (req.user.role === 'employee') {
      employeeId = req.user.employeeId._id || req.user.employeeId;
    } else if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    const { leaveType, startDate, endDate, reason, status = 'pending' } = req.body;

    // Fetch employee to get name and department
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Employees can only create leaves with pending status
    const leaveStatus = req.user.role === 'employee' ? 'pending' : status;

    // Calculate days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const leave = new Leave({
      employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      leaveType,
      startDate,
      endDate,
      days: diffDays,
      reason,
      status: leaveStatus,
      department: employee.department
    });

    const savedLeave = await leave.save();
    const populatedLeave = await Leave.findById(savedLeave._id)
      .populate('employeeId', 'firstName lastName email department');

    res.status(201).json(populatedLeave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update leave record
// Employees can only update their own pending leaves (reason, dates), admins can update status
router.put('/:id', authenticate, [
  body('leaveType').optional().isIn(['Annual Leave', 'Sick Leave', 'Personal Leave', 'Maternity Leave', 'Paternity Leave', 'Emergency Leave']).withMessage('Invalid leave type'),
  body('status').optional().isIn(['pending', 'processing', 'approved', 'rejected']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { leaveType, startDate, endDate, reason, status } = req.body;
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave record not found' });
    }

    // If employee, check if it's their own leave
    if (req.user.role === 'employee') {
      const employeeId = req.user.employeeId._id || req.user.employeeId;
      if (leave.employeeId.toString() !== employeeId.toString()) {
        return res.status(403).json({ message: 'Access denied. You can only update your own leaves.' });
      }
      
      // Employees can only update pending leaves
      if (leave.status !== 'pending') {
        return res.status(403).json({ message: 'You can only update pending leave requests.' });
      }
      
      // Employees cannot change status (approval/rejection is admin only)
      if (status !== undefined && status !== 'pending') {
        return res.status(403).json({ message: 'You cannot change leave status. Only admins can approve or reject leaves.' });
      }
    }

    // Update fields
    if (leaveType !== undefined) leave.leaveType = leaveType;
    if (startDate !== undefined) leave.startDate = startDate;
    if (endDate !== undefined) leave.endDate = endDate;
    if (reason !== undefined) leave.reason = reason;
    // Only admins can update status
    if (status !== undefined && req.user.role === 'admin') {
      leave.status = status;
    }

    // Recalculate days if dates changed
    if (startDate !== undefined || endDate !== undefined) {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      const diffTime = Math.abs(end - start);
      leave.days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    const updatedLeave = await leave.save();
    const populatedLeave = await Leave.findById(updatedLeave._id)
      .populate('employeeId', 'firstName lastName email department');

    res.json(populatedLeave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete leave record
// Employees can only delete their own pending leaves, admins can delete any
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({ message: 'Leave record not found' });
    }
    
    // If employee, check if it's their own leave and it's pending
    if (req.user.role === 'employee') {
      const employeeId = req.user.employeeId._id || req.user.employeeId;
      if (leave.employeeId.toString() !== employeeId.toString()) {
        return res.status(403).json({ message: 'Access denied. You can only delete your own leaves.' });
      }
      
      if (leave.status !== 'pending') {
        return res.status(403).json({ message: 'You can only delete pending leave requests.' });
      }
    }
    
    await Leave.findByIdAndDelete(req.params.id);
    res.json({ message: 'Leave record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

