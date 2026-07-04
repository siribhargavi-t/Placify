const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'danger'],
    default: 'info'
  },
  date: {
    type: String,
    required: true
  },
  forEmail: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  path: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

NotificationSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    return ret;
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);
