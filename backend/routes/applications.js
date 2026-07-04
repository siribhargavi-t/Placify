const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Application = require('../models/Application');
const Drive = require('../models/Drive');
const User = require('../models/User');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const { sendApplicationStatusEmail } = require('../utils/mailer');

// Helper to format notification time
const getFormattedTime = () => {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Helper: Check if ID is a valid MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// @route   GET api/applications
// @desc    Get all applications (students see theirs, TPO/Admin see all)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let applications;
    if (req.user.role === 'student') {
      applications = await Application.find({ studentEmail: req.user.email.toLowerCase() }).sort({ createdAt: -1 });
    } else {
      applications = await Application.find().sort({ createdAt: -1 });
    }
    res.json(applications);
  } catch (err) {
    console.error('Fetch applications error:', err.message);
    res.status(500).json({ success: false, message: 'Server error retrieving applications.' });
  }
});

// @route   POST api/applications
// @desc    Apply for a recruitment drive (Student only)
// @access  Private
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ success: false, message: 'Only students can apply to placement drives.' });
  }

  const { driveId } = req.body;

  if (!driveId) {
    return res.status(400).json({ success: false, message: 'Placement Drive ID is required.' });
  }

  if (!isValidObjectId(driveId)) {
    return res.status(400).json({ success: false, message: 'Invalid Placement Drive ID format.' });
  }

  try {
    // 1. Fetch current student details
    const student = await User.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    // Check if student profile is verified
    if (student.verificationStatus !== 'Verified') {
      return res.status(400).json({ 
        success: false, 
        message: 'Your profile must be Verified by the TPO before you can apply to placement drives.' 
      });
    }

    // Check profile completeness
    if (!student.resumeUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'You must upload your resume before applying.' 
      });
    }
    if (!student.phone || !student.skills) {
      return res.status(400).json({ 
        success: false, 
        message: 'You must complete your profile details (phone and skills) before applying.' 
      });
    }

    // 2. Fetch recruitment drive details
    const drive = await Drive.findById(driveId);
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Placement drive not found.' });
    }

    if (drive.status === 'Closed') {
      return res.status(400).json({ success: false, message: 'This placement drive has passed its deadline and is closed.' });
    }

    // 3. Avoid duplicates
    const alreadyApplied = await Application.findOne({
      studentEmail: student.email,
      driveId: drive._id
    });
    if (alreadyApplied) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already applied to this drive.' 
      });
    }

    // 4. Create application
    const newApp = new Application({
      studentName: student.name,
      studentEmail: student.email,
      student: student._id,
      driveId: drive._id,
      role: drive.role,
      company: drive.company,
      package: drive.package,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      cgpa: student.cgpa
    });

    const application = await newApp.save();

    // 5. Build notifications
    const formattedTime = getFormattedTime();

    // Notification for student
    const studentNotif = new Notification({
      message: `You successfully applied to ${drive.company} for the ${drive.role} role.`,
      type: 'success',
      date: formattedTime,
      forEmail: student.email,
      read: false,
      path: '/student/appliedjobs'
    });
    await studentNotif.save();

    // Notification for TPO
    const tpoNotif = new Notification({
      message: `${student.name} applied for the ${drive.role} role at ${drive.company}.`,
      type: 'info',
      date: formattedTime,
      forEmail: 'tpo',
      read: false,
      path: '/tpo/applicants'
    });
    await tpoNotif.save();

    // Notification for Admin
    const adminNotif = new Notification({
      message: `${student.name} applied for the ${drive.role} role at ${drive.company}.`,
      type: 'info',
      date: formattedTime,
      forEmail: 'admin',
      read: false,
      path: '/admin/users'
    });
    await adminNotif.save();

    res.json({ success: true, application });
  } catch (err) {
    console.error('Apply drive error:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Server error processing application.' });
  }
});

// @route   PUT api/applications/:id
// @desc    Update application status with feedback (TPO & Admin access only)
// @access  Private
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'tpo' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Only TPOs or Admin can update status.' });
  }

  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid Application ID format.' });
  }

  const { status, feedback } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Application status is required.' });
  }

  if (!['Pending', 'Aptitude Test', 'Technical Interview', 'HR Interview', 'Selected', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid application status value.' });
  }

  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    if (feedback !== undefined) application.feedback = feedback.trim();

    await application.save();

    // Notify the student
    const feedbackRemarks = feedback ? ` (Remarks: ${feedback})` : '';
    const studentNotif = new Notification({
      message: `Your application status for the ${application.role} role at ${application.company} has been updated to "${status}"${feedbackRemarks}.`,
      type: 'info',
      date: getFormattedTime(),
      forEmail: application.studentEmail,
      read: false,
      path: '/student/appliedjobs'
    });
    await studentNotif.save();

    // Trigger Nodemailer background delivery
    sendApplicationStatusEmail(
      application.studentEmail,
      application.studentName,
      application.company,
      application.role,
      status,
      feedback,
      application.package,
      req.headers.origin
    ).catch(err => console.error("SMTP error ignored:", err));

    res.json({ success: true, application });
  } catch (err) {
    console.error('Update application status error:', err.message);
    res.status(500).json({ success: false, message: 'Server error updating application status.' });
  }
});

module.exports = router;
