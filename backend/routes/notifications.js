const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// @route   GET api/notifications
// @desc    Get notifications for logged-in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const userEmail = req.user.email.toLowerCase();
    const userRole = req.user.role;

    // Fetch notifications matching email, 'all', or matching role
    const notifications = await Notification.find({
      $or: [
        { forEmail: 'all' },
        { forEmail: userEmail },
        { forEmail: userRole } // 'tpo' or 'admin'
      ]
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    console.error('Fetch notifications error:', err.message);
    res.status(500).json({ success: false, message: 'Server error retrieving notifications.' });
  }
});

// @route   PUT api/notifications/read
// @desc    Mark visible notifications as read
// @access  Private
router.put('/read', auth, async (req, res) => {
  try {
    const userEmail = req.user.email.toLowerCase();
    const userRole = req.user.role;

    await Notification.updateMany(
      {
        $or: [
          { forEmail: 'all' },
          { forEmail: userEmail },
          { forEmail: userRole }
        ],
        read: false
      },
      { $set: { read: true } }
    );

    res.json({ success: true, message: 'Notifications marked as read' });
  } catch (err) {
    console.error('Mark read notifications error:', err.message);
    res.status(500).json({ success: false, message: 'Server error updating notifications status.' });
  }
});

// @route   DELETE api/notifications
// @desc    Clear notifications (delete user's personal notifications and mark global ones read/deleted)
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    const userEmail = req.user.email.toLowerCase();
    const userRole = req.user.role;

    // Delete personal notifications
    await Notification.deleteMany({ forEmail: userEmail });

    // Mark shared notifications read (we don't want to delete global notifications for other users)
    await Notification.updateMany(
      {
        $or: [
          { forEmail: 'all' },
          { forEmail: userRole }
        ]
      },
      { $set: { read: true } }
    );

    res.json({ success: true, message: 'Personal notifications cleared' });
  } catch (err) {
    console.error('Clear notifications error:', err.message);
    res.status(500).json({ success: false, message: 'Server error clearing notifications.' });
  }
});

module.exports = router;
