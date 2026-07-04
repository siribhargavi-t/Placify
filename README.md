# 🚀 Placify

> **Full-Stack Campus Recruitment & Placement Management Platform**

Placify is a full-stack MERN application designed to streamline campus recruitment by connecting students, Training & Placement Officers (TPOs), and administrators on a single platform. It automates the placement workflow, manages recruitment drives, tracks student applications, and provides real-time notifications throughout the hiring process.

🌐 **Live Demo:** https://placify-f81j.onrender.com

---

# 📌 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Folder Structure](#-folder-structure)
- [User Roles](#-user-roles)
- [Application Workflow](#-application-workflow)
- [Database Models](#-database-models)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Demo Credentials](#-demo-credentials)
- [Future Enhancements](#-future-enhancements)

---

# ✨ Features

## 🔐 Authentication & Security

- JWT Authentication
- Secure Password Storage (bcrypt)
- Role-Based Access Control (RBAC)
- Protected Routing on Frontend and API layers
- Session Restoration via LocalStorage JWTs
- Account Suspension / Activation controls
- Student Verification workflows

---

## 👨‍🎓 Student Features

- **Student Dashboard**: Overview of profile status and eligible job stats.
- **Placement Readiness Indicator**: Shows completeness of profile and links.
- **Academic Eligibility Calculator**: Check drive eligibility in real-time.
- **Browse & Filter Placement Drives**: Find open drives instantly.
- **Apply to Eligible Drives**: One-click application with eligibility guardrails.
- **Resume Upload**: Add a PDF resume profile link.
- **Social Portfolios**: Connect GitHub & LinkedIn links.
- **Application History**: Complete list of past applications.
- **Activity Timeline**: Visual step-by-step progress tracking for each application.
- **Real-Time Notification Banner**: For general updates and application round changes.

### Placement Rules

- Profile verification from TPO is required before applying.
- Resume link must be present.
- Maximum 3 active applications allowed at a time.
- Eligibility checks automatically run based on Department, CGPA, and status.

---

## 👨‍💼 Training & Placement Officer (TPO)

- **Dashboard Analytics**: Track selection rates, active drives, and pending verifications.
- **Placement Drive CRUD**: Full control to create, read, update, and end recruitment drives.
- **Applicant Management**: View students who applied to specific drives.
- **Student Verification Dashboard**: Verify student credentials, CGPA transcripts, and profile links.
- **Hiring Stage Advancement**: Move students through recruitment stages (e.g. Aptitude Test, Tech Round, HR Round, Selected, Rejected).
- **Feedback Management**: Provide clear notes/instructions during round transitions.
- **Bulk Selection / Export**: CSV and PDF export options for recruiters.

---

## 👨‍💼 Admin Features

- **Overall Placement Statistics**: High-level university placement stats.
- **Department-wise Analytics**: Selection ratios by CS, IT, ECE, etc.
- **User Management**: Direct control to activate/suspend student or TPO accounts.
- **Reports Dashboard**: Generate detailed recruitment history reports.

---

## 📧 Email Notifications

Automatic emails are sent to students when their application status is updated by a TPO.

Supported transition templates include:

- 📝 Aptitude Test scheduled
- 💻 Technical Interview scheduled
- 👤 HR Interview scheduled
- 🎉 Selected (Offer Extended)
- ⏳ Rejected

Emails are generated using **Nodemailer** with premium, fully-responsive CSS templates.

---

## 🔔 Notifications

- In-app notification center for Students, TPOs, and Admins.
- Broadcast notifications sent by TPO to all registered users.

---

# 🛠 Tech Stack

## Frontend

- **React.js**
- **Vite** (Next-gen bundling tool)
- **Context API** (State Management)
- **React Router Dom v6** (Client routing)
- **Vanilla CSS / TailwindCSS**

---

## Backend

- **Node.js**
- **Express.js** (REST API)
- **JWT (JsonWebToken)**
- **Mongoose** (ODM)
- **Nodemailer** (Transactional SMTP Emails)

---

## Database

- **MongoDB Atlas** (Cloud Database)

---

## Development & Hosting

- **Git & GitHub**
- **Render** (Production Deployment)

---

# 🏗 System Architecture

```
             React Frontend (Vite)
                       │
                       │ REST API Requests
                       ▼
          Express.js + Node.js Server
                       │
                       ▼
                 MongoDB Atlas
```

---

# 📂 Project Structure

```
Placify
│
├── backend
│   ├── middleware/        # Authentication & Role verification middlewares
│   ├── models/            # Mongoose Schemas (User, Drive, Application, Notification)
│   ├── routes/            # Express Router Endpoint logic
│   ├── utils/             # Mailer utility (Nodemailer setup)
│   ├── server.js          # Entrypoint script
│   └── package.json
│
├── frontend
│   ├── src/
│   │   ├── components/    # Reusable components (Navbar, Sidebar, ProtectedRoute)
│   │   ├── layouts/       # Main Dashboard Layout wrappers
│   │   ├── pages/         # Page Views (student, tpo, admin, public)
│   │   ├── services/      # Context providers (AuthContext, PlacementContext)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
│
├── README.md
└── .gitignore
```

---

# 👥 User Roles

### Student
- Register / Login
- Manage profile, resume, and skills
- Apply for eligible drives
- View round stage progress and receive email alerts

### TPO
- Create and edit recruitment drives
- Verify registered students
- Advance or reject students in recruitment stages
- Provide feedback to applicants

### Admin
- Monitor campus statistics
- Manage all registered users
- Suspend accounts to restrict portal access

---

# 🔄 Application Workflow

```
Student Registration
        │
        ▼
Profile Verification by TPO
        │
        ▼
Placement Drive Published
        │
        ▼
Eligibility Verification (Auto-check)
        │
        ▼
Student Applies
        │
        ▼
Recruitment Rounds (Aptitude -> Technical -> HR)
        │
        ▼
Selected / Rejected (Trigger status & email dispatch)
```

---

# 🚀 Installation

Clone the repository:
```bash
git clone https://github.com/siribhargavi-t/Placify.git
```

Install all dependencies (root, frontend, and backend):
```bash
npm run install:all
```

Start the local development servers:
```bash
npm run dev
```

Build the frontend for production:
```bash
npm run build
```

Start the production backend server:
```bash
npm start
```

---

# 🔑 Environment Variables

Create a `.env` file inside the `backend/` directory:
```env
PORT=5000
NODE_ENV=production
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_jwt_secret_token
EMAIL_SERVICE=gmail
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_gmail_app_password
```

---

# 👨‍💻 Demo Credentials

The application automatically seeds initial data if the database is empty when the backend starts.

You can use the following credentials (or autofill them directly in the login page):

### Student
* **Email:** `student@placify.com`
* **Password:** `password123`

### TPO
* **Email:** `tpo@placify.com`
* **Password:** `password123`

### Admin
* **Email:** `admin@placify.com`
* **Password:** `password123`

---

# 📈 Future Enhancements

- **AI Resume Screening**: Score matching score relative to job descriptions.
- **Direct Interview Scheduler**: Calendar integrations for recruiters.
- **Placement Prediction Model**: ML predictive index based on academic historical stats.
- **Real-Time Direct Chat**: Messaging channels between Students and the Placement cell.
- **Placement Performance Charts**: Visual analytics using ChartJS/Recharts.

---

## 👩‍💻 Author

**Siri Bhargavi**

* **GitHub:** https://github.com/siribhargavi-t
* **Live Demo:** https://placify-f81j.onrender.com
* **Project Repository:** https://github.com/siribhargavi-t/Placify