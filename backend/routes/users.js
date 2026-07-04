const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// Helper to format notification time
const getFormattedTime = () => {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Helper: Check if ID is a valid MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// @route   GET api/users
// @desc    Get all users (TPO & Admin access only)
// @access  Private
// @optimization Exclude password and large base64 resumeUrl payload to optimize database query performance
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'tpo') {
    return res.status(403).json({ message: 'Access denied. Administrator or TPO role required.' });
  }

  try {
    const users = await User.find().select('-password -resumeUrl').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('Fetch users list error:', err.message);
    res.status(500).json({ message: 'Server error fetching users list.' });
  }
});

// @route   GET api/users/email/:email
// @desc    Get single user profile by email (TPO & Admin access only for candidate reviews)
// @access  Private
// @optimization Lazy-load detailed profile (including base64 resume) on demand for modal details
router.get('/email/:email', auth, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'tpo') {
    return res.status(403).json({ message: 'Access denied. Administrator or TPO role required.' });
  }

  const emailLower = req.params.email.toLowerCase().trim();

  try {
    const user = await User.findOne({ email: emailLower }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User profile not found.' });
    }
    res.json(user);
  } catch (err) {
    console.error('Fetch user by email error:', err.message);
    res.status(500).json({ message: 'Server error fetching user profile.' });
  }
});

// @route   PUT api/users/:id/status
// @desc    Toggle user status (Admin access only)
// @access  Private
router.put('/:id/status', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Administrator role required.' });
  }

  const targetId = req.body.userId || req.params.id;

  if (!isValidObjectId(targetId)) {
    return res.status(400).json({ message: 'Invalid User ID format.' });
  }

  try {
    const userToToggle = await User.findById(targetId);
    if (!userToToggle) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Do not allow suspending admins
    if (userToToggle.role === 'admin') {
      return res.status(400).json({ message: 'Admin accounts cannot be suspended.' });
    }

    userToToggle.status = userToToggle.status === 'Active' ? 'Suspended' : 'Active';
    await userToToggle.save();

    res.json({ success: true, user: userToToggle });
  } catch (err) {
    console.error('Toggle status error:', err.message);
    res.status(500).json({ message: 'Server error toggling user status.' });
  }
});

// @route   PUT api/users/:id/cgpa
// @desc    Update student CGPA (TPO access only)
// @access  Private
router.put('/:id/cgpa', auth, async (req, res) => {
  if (req.user.role !== 'tpo' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. TPO or Admin role required.' });
  }

  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid Student ID format.' });
  }

  const { cgpa } = req.body;
  const parsedCgpa = parseFloat(cgpa);

  if (isNaN(parsedCgpa) || parsedCgpa < 0 || parsedCgpa > 10) {
    return res.status(400).json({ message: 'CGPA must be a valid number between 0.0 and 10.0.' });
  }

  try {
    const student = await User.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    if (student.role !== 'student') {
      return res.status(400).json({ message: 'Only student accounts can have their CGPA modified.' });
    }

    student.cgpa = parsedCgpa;
    await student.save();

    res.json({ success: true, user: student });
  } catch (err) {
    console.error('Update CGPA error:', err.message);
    res.status(500).json({ message: 'Server error modifying student CGPA.' });
  }
});

// @route   PUT api/users/:id/verification
// @desc    Verify student profile (TPO access only)
// @access  Private
router.put('/:id/verification', auth, async (req, res) => {
  if (req.user.role !== 'tpo' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. TPO or Admin role required.' });
  }

  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid Student ID format.' });
  }

  const { status, remarks } = req.body;

  if (!['Verified', 'Unverified', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid verification status value.' });
  }

  // Enforce remarks requirement for profile rejection
  if (status === 'Rejected' && (!remarks || !remarks.trim())) {
    return res.status(400).json({ message: 'Please provide a correction remark/reason for profile rejection.' });
  }

  try {
    const student = await User.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    if (student.role !== 'student') {
      return res.status(400).json({ message: 'Only student profiles require verification.' });
    }

    student.verificationStatus = status;
    student.verificationRemarks = remarks ? remarks.trim() : '';
    await student.save();

    // Create a notification for the student
    const notifMsg = status === 'Verified'
      ? 'Your academic profile details have been successfully verified by the TPO!'
      : `Your profile verification was rejected. Correction required: ${remarks.trim()}`;

    const newNotif = new Notification({
      message: notifMsg,
      type: status === 'Verified' ? 'success' : 'warning',
      date: getFormattedTime(),
      forEmail: student.email,
      read: false,
      path: '/student/profile'
    });
    await newNotif.save();

    res.json({ success: true, user: student });
  } catch (err) {
    console.error('Update verification error:', err.message);
    res.status(500).json({ message: 'Server error updating student verification.' });
  }
});

module.exports = router;
