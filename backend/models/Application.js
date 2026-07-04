const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  studentEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  driveId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drive',
    required: true,
    index: true
  },
  role: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  package: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Aptitude Test', 'Technical Interview', 'HR Interview', 'Selected', 'Rejected'],
    default: 'Pending'
  },
  cgpa: {
    type: Number,
    required: true
  },
  feedback: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

ApplicationSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    return ret;
  }
});

module.exports = mongoose.model('Application', ApplicationSchema);
