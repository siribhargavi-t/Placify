const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors());
// Set JSON limit higher to accommodate base64 encoded PDF resumes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Import Models
const User = require('./models/User');
const Drive = require('./models/Drive');
const Notification = require('./models/Notification');

// Import Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const driveRoutes = require('./routes/drives');
const applicationRoutes = require('./routes/applications');
const notificationRoutes = require('./routes/notifications');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/drives', driveRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Placify API Server is running' });
});

// Database Auto-Seeding function
async function seedDatabase() {
  try {
    // 1. Seed Users if empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Database empty. Seeding initial accounts...');
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);

      const initialUsers = [
        {
          name: 'Placement Officer',
          email: 'tpo@placify.com',
          password: hashedPassword,
          role: 'tpo',
          status: 'Active'
        },
        {
          name: 'Principal User',
          email: 'admin@placify.com',
          password: hashedPassword,
          role: 'admin',
          status: 'Active'
        },
        {
          name: 'Assistant TPO',
          email: 'tpo2@placify.com',
          password: hashedPassword,
          role: 'tpo',
          status: 'Active'
        },
        {
          name: 'Rohan Sharma',
          email: 'student@placify.com',
          password: hashedPassword,
          role: 'student',
          status: 'Active',
          verificationStatus: 'Verified',
          verificationRemarks: 'All academic transcripts checked and verified.',
          cgpa: 8.2,
          department: 'CSE',
          phone: '9876543210',
          skills: 'JavaScript, React, Node.js, Express, MongoDB',
          graduationYear: '2025',
          resumeUrl: 'https://drive.google.com/file/d/student-resume/view',
          resumeName: 'rohan_resume.pdf',
          githubUrl: 'https://github.com/rohan',
          linkedinUrl: 'https://linkedin.com/in/rohan'
        },
        {
          name: 'Priya Patel',
          email: 'priya@gmail.com',
          password: hashedPassword,
          role: 'student',
          status: 'Active',
          verificationStatus: 'Verified',
          verificationRemarks: '',
          cgpa: 8.9,
          department: 'IT',
          phone: '9876543211',
          skills: 'Java, Spring Boot, SQL, AWS',
          graduationYear: '2025',
          resumeUrl: '',
          githubUrl: 'https://github.com/priya',
          linkedinUrl: 'https://linkedin.com/in/priya'
        },
        {
          name: 'Aditya Sen',
          email: 'aditya@gmail.com',
          password: hashedPassword,
          role: 'student',
          status: 'Active',
          verificationStatus: 'Unverified',
          verificationRemarks: '',
          cgpa: 6.8,
          department: 'ECE',
          phone: '9876543212',
          skills: 'Python, C++, Embedded Systems',
          graduationYear: '2025',
          resumeUrl: '',
          githubUrl: '',
          linkedinUrl: ''
        }
      ];

      await User.insertMany(initialUsers);
      console.log('Successfully seeded user accounts!');
    }

    // 2. Seed Drives if empty
    const driveCount = await Drive.countDocuments();
    if (driveCount === 0) {
      console.log('Seeding initial recruitment drives...');
      
      const today = new Date();
      const formatOffsetDate = (days) => {
        const d = new Date();
        d.setDate(today.getDate() + days);
        return d.toISOString().split('T')[0];
      };

      const initialDrives = [
        {
          company: 'TechCorp',
          role: 'Software Engineer',
          package: '₹9 LPA',
          cgpa: '7.0+',
          departments: 'CSE, IT',
          deadline: formatOffsetDate(5), // 5 days from now
          location: 'On Campus',
          status: 'Open'
        },
        {
          company: 'DataSoft',
          role: 'Data Analyst',
          package: '₹8 LPA',
          cgpa: '6.5+',
          departments: 'CSE, ECE, EEE',
          deadline: formatOffsetDate(8), // 8 days from now
          location: 'Virtual',
          status: 'Open'
        },
        {
          company: 'Designify',
          role: 'UI/UX Designer',
          package: '₹7.5 LPA',
          cgpa: '6.0+',
          departments: 'All',
          deadline: formatOffsetDate(12), // 12 days from now
          location: 'On Campus',
          status: 'Upcoming'
        },
        {
          company: 'CloudNet',
          role: 'DevOps Engineer',
          package: '₹12 LPA',
          cgpa: '7.5+',
          departments: 'CSE, IT, ECE',
          deadline: formatOffsetDate(-2), // 2 days ago (should show as Closed)
          location: 'On Campus',
          status: 'Closed'
        }
      ];

      await Drive.insertMany(initialDrives);
      console.log('Successfully seeded recruitment drives!');
    }

    // 3. Seed Notifications if empty
    const notifCount = await Notification.countDocuments();
    if (notifCount === 0) {
      console.log('Seeding initial notifications...');
      const initialNotifs = [
        {
          message: 'Welcome to Placify! Keep your profile details, resume URL, and skills updated.',
          type: 'info',
          date: '10:00 AM',
          forEmail: 'all',
          read: false,
          path: '/:role/profile'
        },
        {
          message: 'TechCorp is conducting on-campus recruitment for Software Engineers.',
          type: 'success',
          date: '10:15 AM',
          forEmail: 'all',
          read: false,
          path: '/:role/jobs'
        }
      ];

      await Notification.insertMany(initialNotifs);
      console.log('Successfully seeded notifications!');
    }

  } catch (err) {
    console.error('Error seeding database:', err.message);
  }
}

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
  });
}

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/placify';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected successfully.');
    // Seed initial data
    await seedDatabase();
    // Start listening
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  })
  .catch(err => {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  });
