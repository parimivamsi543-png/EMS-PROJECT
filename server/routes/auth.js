const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Employee = require('../models/Employee');
const { authenticate, JWT_SECRET } = require('../middleware/auth');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Sign in
router.post('/signin', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).populate('employeeId');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is inactive' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id);

    // Return user data (without password) and token
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId?._id,
        employee: user.employeeId
      }
    });
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({ message: 'Server error during sign in' });
  }
});

// Sign up
router.post('/signup', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'employee']).withMessage('Role must be admin or employee'),
  body('employeeId').optional().notEmpty().withMessage('Employee ID cannot be empty if provided')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, employeeId, role = 'employee' } = req.body;

    // Validate role
    if (role !== 'admin' && role !== 'employee') {
      return res.status(400).json({ message: 'Invalid role. Must be admin or employee' });
    }

    // Check if employee exists (only required for employee role)
    if (role === 'employee') {
      if (!employeeId) {
        return res.status(400).json({ message: 'Employee ID is required for employee role' });
      }
      
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      // Check if employee already has a user account
      const existingEmployeeUser = await User.findOne({ employeeId });
      if (existingEmployeeUser) {
        return res.status(400).json({ message: 'Employee already has a user account' });
      }
    } else {
      // For admin role, employeeId is optional - can create admin without employee record
      if (employeeId) {
        const employee = await Employee.findById(employeeId);
        if (!employee) {
          return res.status(404).json({ message: 'Employee not found' });
        }
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const userRole = role;

    // Create new user
    const user = new User({
      email,
      password,
      role: userRole,
      employeeId: employeeId || null // Allow null for admin users
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Populate employee data
    await user.populate('employeeId');

    // Return user data (without password) and token
    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId?._id,
        employee: user.employeeId
      }
    });
  } catch (error) {
    console.error('Sign up error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    res.status(500).json({ message: 'Server error during sign up' });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('employeeId');
    res.json({
      id: user._id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId?._id,
      employee: user.employeeId
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

