const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  employeeName: {
    type: String,
    required: true,
    trim: true
  },
  basicSalary: {
    type: Number,
    required: true,
    min: 0
  },
  allowances: {
    type: Number,
    default: 0,
    min: 0
  },
  deductions: {
    type: Number,
    default: 0,
    min: 0
  },
  netSalary: {
    type: Number,
    required: true,
    min: 0
  },
  payDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'failed'],
    default: 'pending'
  },
  department: {
    type: String,
    trim: true
  },
  bankAccount: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for search functionality
payrollSchema.index({ employeeName: 'text' });
payrollSchema.index({ employeeId: 1, payDate: -1 });

module.exports = mongoose.model('Payroll', payrollSchema);




