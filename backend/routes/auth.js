const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Helper: Validate Email Format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper: Validate URL Format
const isValidUrl = (url) => {
  if (!url) return true; // Optional URLs can be empty
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

// Helper: Validate Phone Format (Digits, space, dash, parenthesis, plus sign, min 7 digits)
const isValidPhone = (phone) => {
  if (!phone) return true; // Optional
  const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 7;
};

// @route   POST api/auth/register
// @desc    Register a new student
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  const userRole = role || 'student';

  // Request Validation
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Name is required.' });
  }
  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, message: 'Email address is required.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
  }
  if (!['student', 'tpo', 'admin'].includes(userRole)) {
    return res.status(400).json({ success: false, message: 'Invalid role selection.' });
  }

  try {
    const formattedEmail = email.toLowerCase().trim();
    
    // Check if user already exists
    let user = await User.findOne({ email: formattedEmail });
    if (user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is already registered.' 
      });
    }

    // Create user
    user = new User({
      name: name.trim(),
      email: formattedEmail,
      password,
      role: userRole,
      status: 'Active'
    });

    await user.save();

    res.json({ success: true, message: 'User registered successfully!' });
  } catch (err) {
    console.error('Registration error:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  // Request Validation
  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, message: 'Email is required.' });
  }
  if (!password) {
    return res.status(400).json({ success: false, message: 'Password is required.' });
  }
  if (!role) {
    return res.status(400).json({ success: false, message: 'Role selection is required.' });
  }

  try {
    const formattedEmail = email.toLowerCase().trim();
    
    // Find user
    const user = await User.findOne({ email: formattedEmail });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email, password, or role selection.' 
      });
    }

    // Compare role
    if (user.role !== role) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email, password, or role selection.' 
      });
    }

    // Check status
    if (user.status === 'Suspended') {
      return res.status(403).json({ 
        success: false, 
        message: 'Your account has been suspended. Please contact Admin.' 
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email, password, or role selection.' 
      });
    }

    // Create JWT
    const payload = {
      id: user.id,
      role: user.role
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'placifySecretTokenLongKey123!@#',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        
        // Return user data + token
        res.json({
          success: true,
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            company: user.company,
            cgpa: user.cgpa,
            department: user.department,
            phone: user.phone,
            skills: user.skills,
            graduationYear: user.graduationYear,
            resumeUrl: user.resumeUrl,
            resumeName: user.resumeName,
            githubUrl: user.githubUrl,
            linkedinUrl: user.linkedinUrl,
            status: user.status,
            verificationStatus: user.verificationStatus,
            verificationRemarks: user.verificationRemarks
          }
        });
      }
    );
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// @route   GET api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json(user);
  } catch (err) {
    console.error('Fetch me error:', err.message);
    res.status(500).json({ success: false, message: 'Server error fetching user session.' });
  }
});

// @route   PUT api/auth/profile
// @desc    Update user profile details (for logged in user)
// @access  Private
router.put('/profile', auth, async (req, res) => {
  const { phone, skills, resumeUrl, resumeName, githubUrl, linkedinUrl, cgpa } = req.body;

  // Request Validation
  if (phone !== undefined && phone !== '' && !isValidPhone(phone)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid phone number.' });
  }
  if (githubUrl !== undefined && githubUrl !== '' && !isValidUrl(githubUrl)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid GitHub profile URL.' });
  }
  if (linkedinUrl !== undefined && linkedinUrl !== '' && !isValidUrl(linkedinUrl)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid LinkedIn profile URL.' });
  }
  if (cgpa !== undefined && req.user.role === 'student') {
    const parsedCgpa = parseFloat(cgpa);
    if (isNaN(parsedCgpa) || parsedCgpa < 0 || parsedCgpa > 10) {
      return res.status(400).json({ success: false, message: 'CGPA must be a valid number between 0.0 and 10.0.' });
    }
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update fields
    if (phone !== undefined) user.phone = phone.trim();
    if (skills !== undefined) user.skills = skills.trim();
    if (resumeUrl !== undefined) user.resumeUrl = resumeUrl;
    if (resumeName !== undefined) user.resumeName = resumeName;
    if (githubUrl !== undefined) user.githubUrl = githubUrl.trim();
    if (linkedinUrl !== undefined) user.linkedinUrl = linkedinUrl.trim();
    if (cgpa !== undefined && user.role === 'student') user.cgpa = parseFloat(cgpa);

    await user.save();

    // Return updated user (excluding password)
    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error('Profile update error:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
});

module.exports = router;
