const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: true
  },
  checkIn: {
    type: String,
    trim: true
  },
  checkOut: {
    type: String,
    trim: true
  },
  hours: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'halfDay'],
    default: 'present'
  },
  notes: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for search functionality
attendanceSchema.index({ employeeName: 'text' });
attendanceSchema.index({ employeeId: 1, date: -1 });
attendanceSchema.index({ date: 1, status: 1 });

// Compound index to prevent duplicate attendance records for same employee and date
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);




