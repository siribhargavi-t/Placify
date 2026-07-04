const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'tpo', 'admin'],
    default: 'student'
  },
  status: {
    type: String,
    enum: ['Active', 'Suspended'],
    default: 'Active'
  },
  // Student-specific verification fields
  verificationStatus: {
    type: String,
    enum: ['Verified', 'Unverified', 'Rejected'],
    default: function() {
      return this.role === 'student' ? 'Unverified' : undefined;
    }
  },
  verificationRemarks: {
    type: String,
    default: function() {
      return this.role === 'student' ? '' : undefined;
    }
  },
  // Recruiter/TPO-specific
  company: {
    type: String,
    default: null
  },
  // Student profile fields
  cgpa: {
    type: Number,
    default: function() {
      return this.role === 'student' ? 7.5 : undefined;
    }
  },
  department: {
    type: String,
    default: function() {
      return this.role === 'student' ? 'CSE' : undefined;
    }
  },
  phone: {
    type: String,
    default: ''
  },
  skills: {
    type: String,
    default: ''
  },
  graduationYear: {
    type: String,
    default: function() {
      return this.role === 'student' ? '2025' : undefined;
    }
  },
  resumeUrl: {
    type: String, // Store base64 encoded string or file path
    default: ''
  },
  resumeName: {
    type: String,
    default: ''
  },
  githubUrl: {
    type: String,
    default: ''
  },
  linkedinUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Hash password before saving if it has been modified
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

UserSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    return ret;
  }
});

module.exports = mongoose.model('User', UserSchema);
