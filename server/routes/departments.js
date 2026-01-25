const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const Employee = require('../models/Employee');
const { body, validationResult } = require('express-validator');

// Get all departments
router.get('/', async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('manager', 'firstName lastName email')
      .sort({ name: 1 });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get department by ID
router.get('/:id', async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('manager', 'firstName lastName email');
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new department
router.post('/', [
  body('name').notEmpty().withMessage('Department name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const department = new Department(req.body);
    await department.save();
    res.status(201).json(department);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Department name already exists' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// Update department
router.put('/:id', [
  body('name').optional().notEmpty().withMessage('Department name cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json(department);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Department name already exists' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// Delete department
router.delete('/:id', async (req, res) => {
  try {
    // Check if department has employees
    const employeeCount = await Employee.countDocuments({ department: req.params.id });
    if (employeeCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete department with employees. Please reassign employees first.' 
      });
    }

    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get department employees
router.get('/:id/employees', async (req, res) => {
  try {
    // First get the department to find its name
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Find employees by department name (since Employee.department is a string)
    const employees = await Employee.find({ department: department.name })
      .sort({ firstName: 1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
