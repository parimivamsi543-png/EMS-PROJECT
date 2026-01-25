const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
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
  leaveType: {
    type: String,
    required: true,
    enum: ['Annual Leave', 'Sick Leave', 'Personal Leave', 'Maternity Leave', 'Paternity Leave', 'Emergency Leave'],
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  days: {
    type: Number,
    required: true,
    min: 1
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'approved', 'rejected'],
    default: 'pending'
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  department: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for search functionality
leaveSchema.index({ employeeName: 'text' });
leaveSchema.index({ employeeId: 1, startDate: -1 });
leaveSchema.index({ status: 1 });

module.exports = mongoose.model('Leave', leaveSchema);

