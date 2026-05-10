import React, { useState } from 'react';

// Dummy eligibility data
const eligibilityData = {
  cgpa: 8.2,
  cgpaRequired: 7.0,
  activeBacklogs: 0,
  maxBacklogsAllowed: 0,
  attendance: 92,
  attendanceRequired: 75,
  placementStatus: 'Eligible', // Eligible | Warning | Not Eligible
};

const initialProfile = {
  fullName: 'Student User',
  email: 'student@placify.com',
  phone: '9876543210',
  department: 'Computer Science',
  cgpa: eligibilityData.cgpa.toString(),
  skills: 'JavaScript, React, Python',
  graduationYear: '2025',
  eligibility: eligibilityData.placementStatus === 'Eligible',
  photo: null,
  resume: null,
};

const statusColors = {
  Eligible: 'bg-green-100 text-green-700 border-green-300',
  Warning: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  'Not Eligible': 'bg-red-100 text-red-700 border-red-300',
};

const statusDot = {
  Eligible: 'bg-green-500',
  Warning: 'bg-yellow-400',
  'Not Eligible': 'bg-red-500',
};

const StudentProfile = () => {
  const [profile, setProfile] = useState(initialProfile);

  // Eligibility logic (dummy, can be replaced with real logic)
  const cgpaStatus =
    eligibilityData.cgpa >= eligibilityData.cgpaRequired
      ? 'Eligible'
      : eligibilityData.cgpa >= eligibilityData.cgpaRequired - 0.5
      ? 'Warning'
      : 'Not Eligible';

  const backlogStatus =
    eligibilityData.activeBacklogs <= eligibilityData.maxBacklogsAllowed
      ? 'Eligible'
      : eligibilityData.activeBacklogs === eligibilityData.maxBacklogsAllowed + 1
      ? 'Warning'
      : 'Not Eligible';

  const attendanceStatus =
    eligibilityData.attendance >= eligibilityData.attendanceRequired
      ? 'Eligible'
      : eligibilityData.attendance >= eligibilityData.attendanceRequired - 10
      ? 'Warning'
      : 'Not Eligible';

  const overallStatus =
    cgpaStatus === 'Eligible' &&
    backlogStatus === 'Eligible' &&
    attendanceStatus === 'Eligible'
      ? 'Eligible'
      : [cgpaStatus, backlogStatus, attendanceStatus].includes('Not Eligible')
      ? 'Not Eligible'
      : 'Warning';

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row gap-8 bg-white rounded-lg shadow-lg p-6">
        {/* Profile Photo */}
        <div className="flex flex-col items-center md:w-1/3">
          <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden mb-4 border-4 border-blue-200">
            {profile.photo ? (
              <img
                src={URL.createObjectURL(profile.photo)}
                alt="Profile"
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-5xl text-blue-400 font-bold">
                {profile.fullName[0]}
              </span>
            )}
          </div>

          {/* Eligibility Summary Card */}
          <div className={`mt-6 w-full border ${statusColors[overallStatus]} rounded-lg p-4 text-center`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className={`inline-block w-3 h-3 rounded-full ${statusDot[overallStatus]}`}></span>
              <span className="font-semibold">Placement Eligibility Status</span>
            </div>
            <div className="text-lg font-bold mb-2">{overallStatus}</div>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span>CGPA</span>
                <span className="flex items-center gap-1">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${statusDot[cgpaStatus]}`}
                  ></span>
                  {eligibilityData.cgpa} / {eligibilityData.cgpaRequired}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Active Backlogs</span>
                <span className="flex items-center gap-1">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${statusDot[backlogStatus]}`}
                  ></span>
                  {eligibilityData.activeBacklogs} / {eligibilityData.maxBacklogsAllowed}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Attendance</span>
                <span className="flex items-center gap-1">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${statusDot[attendanceStatus]}`}
                  ></span>
                  {eligibilityData.attendance}% / {eligibilityData.attendanceRequired}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Placement Status</span>
                <span className="flex items-center gap-1">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${statusDot[overallStatus]}`}
                  ></span>
                  {overallStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Profile Details */}
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold text-blue-700">Student Profile</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-blue-600 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={profile.fullName}
                disabled
                className="w-full px-3 py-2 rounded border border-gray-200 bg-gray-100 focus:outline-none"
              />
            </div>
            {/* Email */}
            <div>
              <label className="block text-blue-600 font-semibold mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                disabled
                className="w-full px-3 py-2 rounded border border-gray-200 bg-gray-100 focus:outline-none"
              />
            </div>
            {/* Phone */}
            <div>
              <label className="block text-blue-600 font-semibold mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                disabled
                className="w-full px-3 py-2 rounded border border-gray-200 bg-gray-100 focus:outline-none"
              />
            </div>
            {/* Department */}
            <div>
              <label className="block text-blue-600 font-semibold mb-1">Department</label>
              <input
                type="text"
                name="department"
                value={profile.department}
                disabled
                className="w-full px-3 py-2 rounded border border-gray-200 bg-gray-100 focus:outline-none"
              />
            </div>
            {/* CGPA */}
            <div>
              <label className="block text-blue-600 font-semibold mb-1">CGPA</label>
              <input
                type="number"
                step="0.01"
                name="cgpa"
                value={profile.cgpa}
                disabled
                className="w-full px-3 py-2 rounded border border-gray-200 bg-gray-100 focus:outline-none"
              />
            </div>
            {/* Graduation Year */}
            <div>
              <label className="block text-blue-600 font-semibold mb-1">Graduation Year</label>
              <input
                type="text"
                name="graduationYear"
                value={profile.graduationYear}
                disabled
                className="w-full px-3 py-2 rounded border border-gray-200 bg-gray-100 focus:outline-none"
              />
            </div>
            {/* Skills */}
            <div className="md:col-span-2">
              <label className="block text-blue-600 font-semibold mb-1">Skills</label>
              <input
                type="text"
                name="skills"
                value={profile.skills}
                disabled
                className="w-full px-3 py-2 rounded border border-gray-200 bg-gray-100 focus:outline-none"
                placeholder="e.g. Java, Python, React"
              />
            </div>
          </div>
          {/* Resume Upload */}
          <div className="mt-4">
            <label className="block text-blue-600 font-semibold mb-1">Resume</label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                name="resume"
                accept=".pdf,.doc,.docx"
                disabled
                className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {profile.resume && (
                <span className="text-green-600 font-medium">
                  {profile.resume.name}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;