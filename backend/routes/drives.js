const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Drive = require('../models/Drive');
const Application = require('../models/Application');
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

// Helper: Validate YYYY-MM-DD Date format
const isValidDateFormat = (dateStr) => {
  const regEx = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateStr.match(regEx)) return false; // Invalid format
  const d = new Date(dateStr);
  const dNum = d.getTime();
  if (!dNum && dNum !== 0) return false; // NaN value, invalid date
  return d.toISOString().slice(0, 10) === dateStr;
};

// @route   GET api/drives
// @desc    Get all drives
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const drives = await Drive.find().sort({ createdAt: -1 });
    
    // Dynamically adjust drive statuses based on the current system date
    const todayStr = new Date().toISOString().split('T')[0];
    let changed = false;

    for (let drive of drives) {
      if (drive.deadline < todayStr && drive.status !== 'Closed') {
        drive.status = 'Closed';
        await drive.save();
        changed = true;
      } else if (drive.deadline >= todayStr && drive.status === 'Closed') {
        drive.status = 'Open';
        await drive.save();
        changed = true;
      }
    }

    const finalDrives = changed ? await Drive.find().sort({ createdAt: -1 }) : drives;
    res.json(finalDrives);
  } catch (err) {
    console.error('Fetch drives error:', err.message);
    res.status(500).json({ success: false, message: 'Server error fetching placement drives.' });
  }
});

// @route   POST api/drives
// @desc    Post a new recruitment drive (TPO & Admin only)
// @access  Private
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'tpo' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Only TPOs or Admin can post drives.' });
  }

  const { company, role, package, cgpa, departments, deadline, location, status } = req.body;

  // Request Validations
  if (!company || !company.trim()) {
    return res.status(400).json({ success: false, message: 'Company name is required.' });
  }
  if (!role || !role.trim()) {
    return res.status(400).json({ success: false, message: 'Job role is required.' });
  }
  if (!package || !package.trim()) {
    return res.status(400).json({ success: false, message: 'Compensation package details are required.' });
  }
  if (!cgpa || !cgpa.trim()) {
    return res.status(400).json({ success: false, message: 'Eligible CGPA threshold is required.' });
  }
  if (!departments || !departments.trim()) {
    return res.status(400).json({ success: false, message: 'Target branch / departments are required.' });
  }
  if (!deadline || !isValidDateFormat(deadline)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid deadline date in YYYY-MM-DD format.' });
  }
  if (!location || !location.trim()) {
    return res.status(400).json({ success: false, message: 'Job location is required.' });
  }

  try {
    const todayStr = new Date().toISOString().split('T')[0];
    let driveStatus = 'Open';
    
    // Check deadline compared to today
    if (deadline < todayStr) {
      driveStatus = 'Closed';
    } else if (status === 'Upcoming') {
      driveStatus = 'Upcoming';
    }

    const newDrive = new Drive({
      company: company.trim(),
      role: role.trim(),
      package: package.trim(),
      cgpa: cgpa.trim(),
      departments: departments.trim(),
      deadline,
      location: location.trim(),
      status: driveStatus
    });

    const drive = await newDrive.save();

    // Create system notification
    const newNotif = new Notification({
      message: `New placement drive posted: ${company.trim()} for ${role.trim()} position.`,
      type: 'success',
      date: getFormattedTime(),
      forEmail: 'all',
      read: false,
      path: '/:role/jobs'
    });
    await newNotif.save();

    res.json({ success: true, drive });
  } catch (err) {
    console.error('Create drive error:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Server error creating placement drive.' });
  }
});

// @route   PUT api/drives/:id
// @desc    Edit drive details (TPO & Admin only)
// @access  Private
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'tpo' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Only TPOs or Admin can edit drives.' });
  }

  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid Drive ID format.' });
  }

  const { company, role, package, cgpa, departments, deadline, location, status } = req.body;

  // Input Validation (if provided)
  if (company !== undefined && !company.trim()) {
    return res.status(400).json({ success: false, message: 'Company name cannot be blank.' });
  }
  if (role !== undefined && !role.trim()) {
    return res.status(400).json({ success: false, message: 'Job role cannot be blank.' });
  }
  if (package !== undefined && !package.trim()) {
    return res.status(400).json({ success: false, message: 'Package details cannot be blank.' });
  }
  if (cgpa !== undefined && !cgpa.trim()) {
    return res.status(400).json({ success: false, message: 'Eligible CGPA cannot be blank.' });
  }
  if (departments !== undefined && !departments.trim()) {
    return res.status(400).json({ success: false, message: 'Target departments cannot be blank.' });
  }
  if (deadline !== undefined && !isValidDateFormat(deadline)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid deadline date in YYYY-MM-DD format.' });
  }
  if (location !== undefined && !location.trim()) {
    return res.status(400).json({ success: false, message: 'Location details cannot be blank.' });
  }
  if (status !== undefined && !['Open', 'Closed', 'Upcoming'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value.' });
  }

  try {
    let drive = await Drive.findById(req.params.id);
    if (!drive) {
      return res.status(404).json({ message: 'Drive not found' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    let updatedFields = {};

    if (company !== undefined) updatedFields.company = company.trim();
    if (role !== undefined) updatedFields.role = role.trim();
    if (package !== undefined) updatedFields.package = package.trim();
    if (cgpa !== undefined) updatedFields.cgpa = cgpa.trim();
    if (departments !== undefined) updatedFields.departments = departments.trim();
    if (location !== undefined) updatedFields.location = location.trim();
    if (deadline !== undefined) updatedFields.deadline = deadline;

    // Resolve Status
    let finalStatus = status || drive.status;
    const finalDeadline = deadline || drive.deadline;
    if (finalDeadline < todayStr && finalStatus !== 'Closed') {
      finalStatus = 'Closed';
    } else if (finalDeadline >= todayStr && finalStatus === 'Closed') {
      finalStatus = 'Open';
    }
    updatedFields.status = finalStatus;

    drive = await Drive.findByIdAndUpdate(
      req.params.id,
      { $set: updatedFields },
      { new: true }
    );

    // Sync matching applications
    await Application.updateMany(
      { driveId: req.params.id },
      {
        $set: {
          company: drive.company,
          role: drive.role,
          package: drive.package
        }
      }
    );

    // Create system notification
    const newNotif = new Notification({
      message: `Placement drive details for ${drive.company} (${drive.role}) have been updated.`,
      type: 'info',
      date: getFormattedTime(),
      forEmail: 'all',
      read: false,
      path: '/:role/jobs'
    });
    await newNotif.save();

    res.json({ success: true, drive });
  } catch (err) {
    console.error('Update drive error:', err.message);
    res.status(500).json({ success: false, message: 'Server error updating placement drive.' });
  }
});

// @route   DELETE api/drives/:id
// @desc    Delete a drive (TPO & Admin only)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'tpo' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Only TPOs or Admin can delete drives.' });
  }

  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid Drive ID format.' });
  }

  try {
    const drive = await Drive.findById(req.params.id);
    if (!drive) {
      return res.status(404).json({ message: 'Drive not found' });
    }

    const { company, role } = drive;

    // Delete the drive
    await Drive.findByIdAndDelete(req.params.id);

    // Cascade delete matching applications
    await Application.deleteMany({ driveId: req.params.id });

    // Create warning notification
    const newNotif = new Notification({
      message: `Placement drive for ${company} (${role}) has been cancelled.`,
      type: 'warning',
      date: getFormattedTime(),
      forEmail: 'all',
      read: false,
      path: '/:role/jobs'
    });
    await newNotif.save();

    res.json({ success: true, message: 'Drive and its corresponding applications deleted successfully.' });
  } catch (err) {
    console.error('Delete drive error:', err.message);
    res.status(500).json({ success: false, message: 'Server error deleting placement drive.' });
  }
});

module.exports = router;
