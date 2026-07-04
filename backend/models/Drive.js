const mongoose = require('mongoose');

const DriveSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  package: {
    type: String,
    required: true,
    trim: true
  },
  cgpa: {
    type: String,
    required: true,
    trim: true
  },
  departments: {
    type: String,
    required: true,
    trim: true
  },
  deadline: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Open', 'Closed', 'Upcoming'],
    default: 'Open'
  }
}, {
  timestamps: true
});

DriveSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    return ret;
  }
});

module.exports = mongoose.model('Drive', DriveSchema);
