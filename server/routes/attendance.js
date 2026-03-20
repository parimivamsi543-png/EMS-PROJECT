const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const { body, validationResult } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');

// Helper function to calculate hours between two times
const calculateHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  
  const [inHours, inMinutes] = checkIn.split(':').map(Number);
  const [outHours, outMinutes] = checkOut.split(':').map(Number);
  
  const inTime = inHours * 60 + inMinutes;
  const outTime = outHours * 60 + outMinutes;
  
  const diffMinutes = outTime - inTime;
  return Math.max(0, diffMinutes / 60);
};

// Get all attendance records with pagination and search
// Employees can only view their own attendance, admins can view all
router.get('/', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const date = req.query.date || '';

    const query = {};
    
    // If employee, only show their own attendance
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
    
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.date = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const attendance = await Attendance.find(query)
      .populate('employeeId', 'firstName lastName email department')
      .sort({ date: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Attendance.countDocuments(query);

    res.json({
      attendance,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance record by ID
// Employees can only view their own attendance
router.get('/:id', authenticate, async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate('employeeId', 'firstName lastName email department');
    
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    // If employee, check if it's their own attendance
    if (req.user.role === 'employee') {
      const employeeId = req.user.employeeId._id || req.user.employeeId;
      if (attendance.employeeId._id.toString() !== employeeId.toString()) {
        return res.status(403).json({ message: 'Access denied. You can only view your own attendance.' });
      }
    }
    
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new attendance record
// Only admins can create attendance records for any employee
router.post('/', authenticate, authorize('admin'), [
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
  body('date').notEmpty().withMessage('Date is required'),
  body('status').optional().isIn(['present', 'absent', 'late', 'halfDay']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { employeeId, date, checkIn, checkOut, status = 'present', notes } = req.body;

    // Check if attendance record already exists for this employee and date
    const existingAttendance = await Attendance.findOne({ employeeId, date });
    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance record already exists for this employee and date' });
    }

    // Fetch employee to get name and department
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Calculate hours
    const hours = calculateHours(checkIn, checkOut);

    const attendance = new Attendance({
      employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      date,
      checkIn: checkIn || null,
      checkOut: checkOut || null,
      hours,
      status,
      notes: notes || '',
      department: employee.department
    });

    const savedAttendance = await attendance.save();
    const populatedAttendance = await Attendance.findById(savedAttendance._id)
      .populate('employeeId', 'firstName lastName email department');

    res.status(201).json(populatedAttendance);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Attendance record already exists for this employee and date' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Update attendance record
// Only admins can update attendance records
router.put('/:id', authenticate, authorize('admin'), [
  body('status').optional().isIn(['present', 'absent', 'late', 'halfDay']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date, checkIn, checkOut, status, notes } = req.body;
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    // Update fields
    if (date !== undefined) attendance.date = date;
    if (checkIn !== undefined) attendance.checkIn = checkIn || null;
    if (checkOut !== undefined) attendance.checkOut = checkOut || null;
    if (status !== undefined) attendance.status = status;
    if (notes !== undefined) attendance.notes = notes;

    // Recalculate hours if check-in/out changed
    if (checkIn !== undefined || checkOut !== undefined) {
      attendance.hours = calculateHours(attendance.checkIn, attendance.checkOut);
    }

    const updatedAttendance = await attendance.save();
    const populatedAttendance = await Attendance.findById(updatedAttendance._id)
      .populate('employeeId', 'firstName lastName email department');

    res.json(populatedAttendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete attendance record
// Only admins can delete attendance records
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;


