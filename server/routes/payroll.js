const express = require('express');
const router = express.Router();
const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const { body, validationResult } = require('express-validator');

// Get all payroll records with pagination and search
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const month = req.query.month || '';

    const query = {};
    
    if (search) {
      query.$or = [
        { employeeName: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (month) {
      const startDate = new Date(month + '-01');
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      query.payDate = {
        $gte: startDate,
        $lt: endDate
      };
    }

    const payroll = await Payroll.find(query)
      .populate('employeeId', 'firstName lastName email department')
      .sort({ payDate: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Payroll.countDocuments(query);

    res.json({
      payroll,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get payroll record by ID
router.get('/:id', async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id)
      .populate('employeeId', 'firstName lastName email department');
    
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }
    
    res.json(payroll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new payroll record
router.post('/', [
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
  body('basicSalary').isFloat({ min: 0 }).withMessage('Basic salary must be a positive number'),
  body('allowances').optional().isFloat({ min: 0 }).withMessage('Allowances must be a positive number'),
  body('deductions').optional().isFloat({ min: 0 }).withMessage('Deductions must be a positive number'),
  body('payDate').notEmpty().withMessage('Pay date is required'),
  body('status').optional().isIn(['pending', 'processing', 'paid', 'failed']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { employeeId, basicSalary, allowances = 0, deductions = 0, payDate, status = 'pending' } = req.body;

    // Fetch employee to get name and department
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const netSalary = parseFloat(basicSalary) + parseFloat(allowances) - parseFloat(deductions);

    const payroll = new Payroll({
      employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      basicSalary: parseFloat(basicSalary),
      allowances: parseFloat(allowances),
      deductions: parseFloat(deductions),
      netSalary,
      payDate,
      status,
      department: employee.department
    });

    const savedPayroll = await payroll.save();
    const populatedPayroll = await Payroll.findById(savedPayroll._id)
      .populate('employeeId', 'firstName lastName email department');

    res.status(201).json(populatedPayroll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update payroll record
router.put('/:id', [
  body('basicSalary').optional().isFloat({ min: 0 }).withMessage('Basic salary must be a positive number'),
  body('allowances').optional().isFloat({ min: 0 }).withMessage('Allowances must be a positive number'),
  body('deductions').optional().isFloat({ min: 0 }).withMessage('Deductions must be a positive number'),
  body('status').optional().isIn(['pending', 'processing', 'paid', 'failed']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { basicSalary, allowances, deductions, payDate, status } = req.body;
    const payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    // Update fields
    if (basicSalary !== undefined) payroll.basicSalary = parseFloat(basicSalary);
    if (allowances !== undefined) payroll.allowances = parseFloat(allowances);
    if (deductions !== undefined) payroll.deductions = parseFloat(deductions);
    if (payDate !== undefined) payroll.payDate = payDate;
    if (status !== undefined) payroll.status = status;

    // Recalculate net salary
    payroll.netSalary = payroll.basicSalary + payroll.allowances - payroll.deductions;

    const updatedPayroll = await payroll.save();
    const populatedPayroll = await Payroll.findById(updatedPayroll._id)
      .populate('employeeId', 'firstName lastName email department');

    res.json(populatedPayroll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete payroll record
router.delete('/:id', async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndDelete(req.params.id);
    
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }
    
    res.json({ message: 'Payroll record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;




